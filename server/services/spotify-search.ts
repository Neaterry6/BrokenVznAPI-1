import axios from 'axios';

export interface SpotifySearchRequest {
  search: string;
  artist?: string;
}

export interface SpotifySearchResponse {
  success: boolean;
  query: string;
  track?: SpotifyTrack;
  download?: SpotifyDownload;
  creator: string;
  error?: string;
}

export interface SpotifyTrack {
  name: string;
  album: string;
  artists: string[];
  release_date: string;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  spotify_url: string;
  album_image: string | null;
}

export interface SpotifyDownload {
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  preview_url: string;
  download_url: string;
}

export class SpotifySearchService {
  private readonly creator = 'Broken VZN';
  private readonly clientId = '0be741ce2d1448b0b0ffcf8e626ff2d9';
  private readonly clientSecret = 'd5675a90b653419e8eb853a40d82a6fa';

  async searchSpotify(request: SpotifySearchRequest): Promise<SpotifySearchResponse> {
    try {
      const { search, artist } = request;

      if (!search || search.trim().length === 0) {
        return {
          success: false,
          query: search,
          creator: this.creator,
          error: 'Search parameter is required'
        };
      }

      // Get Spotify access token
      const token = await this.getSpotifyToken();
      if (!token) {
        return {
          success: false,
          query: search,
          creator: this.creator,
          error: 'Failed to authenticate with Spotify'
        };
      }

      // Build search query
      let query = `track:${search}`;
      if (artist) {
        query += ` artist:${artist}`;
      }

      const encodedQuery = encodeURIComponent(query);
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=1&offset=0`;

      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });

      const data = searchResponse.data.tracks;

      if (!data || !data.items || data.items.length === 0) {
        return {
          success: false,
          query: search,
          creator: this.creator,
          error: `No tracks found for '${search}'`
        };
      }

      const track = data.items[0];
      const trackInfo: SpotifyTrack = {
        name: track.name,
        album: track.album.name,
        artists: track.artists.map((artist: any) => artist.name),
        release_date: track.album.release_date,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        preview_url: track.preview_url,
        spotify_url: track.external_urls.spotify,
        album_image: track.album.images[0]?.url || null
      };

      // Try to get download information (this would typically require a separate service)
      let downloadInfo: SpotifyDownload | undefined;
      
      try {
        // Note: This is a placeholder. In a real implementation, you'd need a reliable 
        // service that can convert Spotify tracks to downloadable formats.
        const spotifyDlUrl = `https://api.betabotz.eu.org/api/download/spotify?url=${track.external_urls.spotify}&apikey=lgnMtggS`;
        const downloadResponse = await axios.get(spotifyDlUrl, { timeout: 15000 });

        if (downloadResponse.data.status && downloadResponse.data.result) {
          const downloadData = downloadResponse.data.result.data;
          downloadInfo = {
            title: downloadData.title,
            artist: downloadData.artist.name,
            thumbnail: downloadData.thumbnail,
            duration: downloadData.duration,
            preview_url: downloadData.preview,
            download_url: downloadData.url
          };
        }
      } catch (downloadError) {
        console.log('Download service unavailable, providing track info only');
      }

      return {
        success: true,
        query: search,
        track: trackInfo,
        download: downloadInfo,
        creator: this.creator
      };

    } catch (error) {
      console.error('Spotify search error:', error);
      return {
        success: false,
        query: request.search,
        creator: this.creator,
        error: 'Failed to search Spotify'
      };
    }
  }

  private async getSpotifyToken(): Promise<string | null> {
    try {
      const url = 'https://accounts.spotify.com/api/token';
      const data = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      });

      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting Spotify token:', error);
      return null;
    }
  }

  async searchRecommendations(seed: string): Promise<any> {
    try {
      const token = await this.getSpotifyToken();
      if (!token) {
        throw new Error('Failed to authenticate');
      }

      const url = `https://api.spotify.com/v1/recommendations?seed_genres=${encodeURIComponent(seed)}&limit=10`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        recommendations: response.data.tracks.map((track: any) => ({
          name: track.name,
          artist: track.artists[0].name,
          preview_url: track.preview_url,
          spotify_url: track.external_urls.spotify
        })),
        creator: this.creator
      };
    } catch (error) {
      return {
        success: false,
        creator: this.creator,
        error: 'Failed to get recommendations'
      };
    }
  }
}

export const spotifySearchService = new SpotifySearchService();