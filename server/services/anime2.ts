import axios from 'axios';

// Types for AniList API
export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  episodes: number;
  status: string;
  seasonYear: number;
  format: string;
  genres: string[];
  coverImage: {
    large: string;
  };
  description: string;
}

export interface GogoAnimeData {
  id?: string;
  title?: string;
  url?: string;
  image?: string;
  episodes?: any[];
  totalEpisodes?: number;
  error?: string;
}

export interface AnimeSearchResult {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  episodes: number;
  status: string;
  seasonYear: number;
  format: string;
  genres: string[];
  coverImage: {
    large: string;
  };
  description: string;
  gogoanime: GogoAnimeData;
}

export interface Anime2SearchResult {
  success: boolean;
  status: string;
  results?: AnimeSearchResult[];
  totalResults?: number;
  error?: string;
  creator: string;
}

export interface WatchLinksResult {
  success: boolean;
  status: string;
  data?: any;
  error?: string;
  creator: string;
}

export class Anime2Service {
  private clientId: string;
  private clientSecret: string;
  private aniListUrl = 'https://graphql.anilist.co';
  private aniListToken: string | null = null;
  private creator = 'heisbroken';

  // AniList GraphQL query for search with filters
  private readonly aniListQuery = `
    query ($search: String, $seasonYear: Int, $format: MediaFormat, $genre_in: [String], $perPage: Int) {
      Page(perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(search: $search, seasonYear: $seasonYear, format: $format, genre_in: $genre_in, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          episodes
          status
          seasonYear
          format
          genres
          coverImage {
            large
          }
          description
        }
      }
    }
  `;

  constructor() {
    // Use environment variables for secure credential handling
    this.clientId = process.env.ANILIST_CLIENT_ID || '29927';
    this.clientSecret = process.env.ANILIST_CLIENT_SECRET || 'BZ8VvmydJbCfeU3uwFd4dRuj4BDlt7xDHfSI0sbJ';
    
    // Initialize token fetch
    this.initializeToken();
    
    // Refresh token every 50 minutes (AniList tokens last 1 hour)
    setInterval(() => {
      this.getAniListToken();
    }, 50 * 60 * 1000);
  }

  private async initializeToken(): Promise<void> {
    await this.getAniListToken();
  }

  // Fetch AniList OAuth token
  private async getAniListToken(): Promise<void> {
    try {
      const response = await axios.post('https://anilist.co/api/v2/oauth/token', {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });

      if (!response.data.access_token) {
        throw new Error('Failed to fetch AniList token');
      }

      this.aniListToken = response.data.access_token;
      console.log('AniList token fetched successfully for anime2 service');
    } catch (error) {
      console.error('AniList token fetch error:', error);
      this.aniListToken = null;
    }
  }

  // Fetch Gogoanime data for a single anime
  private async fetchGogoAnimeData(title: string): Promise<GogoAnimeData> {
    try {
      // Clean title for better matching
      const cleanTitle = title.replace(/[^\w\s]/gi, '').trim();
      
      const response = await axios.get(
        `https://api.consumet.org/anime/gogoanime/${encodeURIComponent(cleanTitle)}`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      return response.data || { error: 'No matching Gogoanime data' };
    } catch (error) {
      console.error(`Gogoanime fetch error for ${title}:`, error);
      return { error: 'Failed to fetch Gogoanime data' };
    }
  }

  // Search anime with filters and attach Gogoanime data to all results
  async searchAnime(params: {
    title?: string;
    year?: string;
    format?: string;
    genre?: string;
    limit?: string;
  }): Promise<Anime2SearchResult> {
    try {
      if (!this.aniListToken) {
        await this.getAniListToken();
        if (!this.aniListToken) {
          return {
            success: false,
            status: 'error',
            error: 'Failed to authenticate with AniList',
            creator: this.creator
          };
        }
      }

      const variables = {
        search: params.title || null,
        seasonYear: params.year ? parseInt(params.year) : null,
        format: params.format || null,
        genre_in: params.genre ? [params.genre] : null,
        perPage: params.limit ? parseInt(params.limit) : 10,
      };

      // Fetch from AniList
      const anilistResponse = await axios.post(
        this.aniListUrl,
        {
          query: this.aniListQuery,
          variables: variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.aniListToken}`,
          },
          timeout: 15000
        }
      );

      const animeList: AniListMedia[] = anilistResponse.data?.data?.Page?.media || [];
      const totalResults = anilistResponse.data?.data?.Page?.pageInfo?.total || 0;

      if (animeList.length === 0) {
        return {
          success: true,
          status: 'success',
          results: [],
          totalResults: 0,
          creator: this.creator
        };
      }

      // Fetch Gogoanime data for ALL results (not just the first one)
      const resultsWithGogo = await Promise.all(
        animeList.map(async (anime): Promise<AnimeSearchResult> => {
          const searchTitle = anime.title.romaji || anime.title.english || anime.title.native;
          const gogoData = await this.fetchGogoAnimeData(searchTitle);
          
          return {
            ...anime,
            gogoanime: gogoData,
          };
        })
      );

      return {
        success: true,
        status: 'success',
        results: resultsWithGogo,
        totalResults,
        creator: this.creator
      };

    } catch (error) {
      console.error('Anime2 search error:', error);
      return {
        success: false,
        status: 'error',
        error: 'Failed to search anime',
        creator: this.creator
      };
    }
  }

  // Get episode streaming/download links
  async getWatchLinks(episodeId: string): Promise<WatchLinksResult> {
    try {
      if (!episodeId) {
        return {
          success: false,
          status: 'error',
          error: 'Episode ID is required',
          creator: this.creator
        };
      }

      const response = await axios.get(
        `https://api.consumet.org/anime/gogoanime/watch/${episodeId}`,
        {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      return {
        success: true,
        status: 'success',
        data: response.data,
        creator: this.creator
      };

    } catch (error) {
      console.error('Watch links fetch error:', error);
      return {
        success: false,
        status: 'error',
        error: 'Could not fetch episode links',
        creator: this.creator
      };
    }
  }

  // Get detailed anime information
  async getAnimeDetails(anilistId: string): Promise<Anime2SearchResult> {
    try {
      if (!this.aniListToken) {
        await this.getAniListToken();
        if (!this.aniListToken) {
          return {
            success: false,
            status: 'error',
            error: 'Failed to authenticate with AniList',
            creator: this.creator
          };
        }
      }

      const detailQuery = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            episodes
            status
            seasonYear
            format
            genres
            coverImage {
              large
            }
            description
            duration
            studios {
              nodes {
                name
              }
            }
            relations {
              edges {
                node {
                  title {
                    romaji
                  }
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(
        this.aniListUrl,
        {
          query: detailQuery,
          variables: { id: parseInt(anilistId) },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.aniListToken}`,
          },
          timeout: 15000
        }
      );

      const anime = response.data?.data?.Media;
      if (!anime) {
        return {
          success: false,
          status: 'error',
          error: 'Anime not found',
          creator: this.creator
        };
      }

      // Fetch Gogoanime data for the anime
      const searchTitle = anime.title.romaji || anime.title.english || anime.title.native;
      const gogoData = await this.fetchGogoAnimeData(searchTitle);

      return {
        success: true,
        status: 'success',
        results: [{
          ...anime,
          gogoanime: gogoData,
        }],
        creator: this.creator
      };

    } catch (error) {
      console.error('Anime details fetch error:', error);
      return {
        success: false,
        status: 'error',
        error: 'Failed to fetch anime details',
        creator: this.creator
      };
    }
  }

  // Get service status
  getStatus(): { success: boolean; status: string; tokenStatus: string; creator: string } {
    return {
      success: true,
      status: 'online',
      tokenStatus: this.aniListToken ? 'authenticated' : 'not authenticated',
      creator: this.creator
    };
  }

  // Get available formats for filtering
  getFormats(): { success: boolean; formats: string[]; creator: string } {
    return {
      success: true,
      formats: ['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC'],
      creator: this.creator
    };
  }

  // Get popular genres for filtering
  getGenres(): { success: boolean; genres: string[]; creator: string } {
    return {
      success: true,
      genres: [
        'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 
        'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological',
        'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 
        'Thriller', 'Military', 'Historical'
      ],
      creator: this.creator
    };
  }
}

export const anime2Service = new Anime2Service();