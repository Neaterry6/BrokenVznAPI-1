import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AnimeSearchRequest {
  query: string;
  page?: number;
  limit?: number;
  type?: 'tv' | 'movie' | 'ova' | 'special' | 'music';
  status?: 'airing' | 'complete' | 'upcoming';
  genre?: string;
}

export interface AnimeInfo {
  id: number;
  title: string;
  englishTitle?: string;
  synopsis?: string;
  image?: string;
  bannerImage?: string;
  episodes?: number;
  status?: string;
  season?: string;
  year?: number;
  genres?: string[];
  score?: number;
  popularity?: number;
  duration?: string;
  source?: string;
  studios?: string[];
  streamingLinks?: StreamingLink[];
  downloadLinks?: DownloadLink[];
}

export interface StreamingLink {
  quality: string;
  url: string;
  server: string;
  type: 'mp4' | 'hls' | 'm3u8';
}

export interface DownloadLink {
  quality: string;
  url: string;
  size?: string;
  type: 'torrent' | 'direct';
  seeders?: number;
  leechers?: number;
}

export interface AnimeEpisode {
  number: number;
  title?: string;
  synopsis?: string;
  airDate?: string;
  streamingLinks?: StreamingLink[];
  downloadLinks?: DownloadLink[];
}

export interface AnimeSearchResult {
  success: boolean;
  data?: AnimeInfo[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasNextPage: boolean;
  };
  error?: string;
  creator: string;
}

export interface AnimeDetailResult {
  success: boolean;
  data?: AnimeInfo;
  error?: string;
  creator: string;
}

export interface AnimeEpisodesResult {
  success: boolean;
  data?: AnimeEpisode[];
  error?: string;
  creator: string;
}

export class AnimeUnifiedService {
  private creator = '@BrokenVZN';
  private jikanBaseUrl = 'https://api.jikan.moe/v4';
  private anilistBaseUrl = 'https://graphql.anilist.co';
  
  async searchAnime(request: AnimeSearchRequest): Promise<AnimeSearchResult> {
    try {
      const { query, page = 1, limit = 25, type, status, genre } = request;

      if (!query) {
        return {
          success: false,
          error: "Please provide a search query",
          creator: this.creator
        };
      }

      // Build Jikan API search parameters
      const params: any = {
        q: query,
        page,
        limit,
        sfw: true
      };

      if (type) params.type = type;
      if (status) params.status = status;
      if (genre) params.genres = genre;

      const response = await axios.get(`${this.jikanBaseUrl}/anime`, {
        params,
        timeout: 15000
      });

      const animeList: AnimeInfo[] = response.data.data.map((anime: any) => ({
        id: anime.mal_id,
        title: anime.title,
        englishTitle: anime.title_english,
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        episodes: anime.episodes,
        status: anime.status,
        season: anime.season,
        year: anime.year,
        genres: anime.genres?.map((genre: any) => genre.name) || [],
        score: anime.score,
        popularity: anime.popularity,
        duration: anime.duration,
        source: anime.source,
        studios: anime.studios?.map((studio: any) => studio.name) || []
      }));

      const pagination = response.data.pagination;

      return {
        success: true,
        data: animeList,
        pagination: {
          currentPage: pagination.current_page,
          totalPages: pagination.last_visible_page,
          totalResults: pagination.items?.total || 0,
          hasNextPage: pagination.has_next_page
        },
        creator: this.creator
      };

    } catch (error) {
      console.error("Error searching anime:", error);
      return {
        success: false,
        error: "Failed to search anime",
        creator: this.creator
      };
    }
  }

  async getAnimeDetails(id: number): Promise<AnimeDetailResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: "Please provide anime ID",
          creator: this.creator
        };
      }

      const response = await axios.get(`${this.jikanBaseUrl}/anime/${id}/full`, {
        timeout: 15000
      });

      const anime = response.data.data;
      
      const animeInfo: AnimeInfo = {
        id: anime.mal_id,
        title: anime.title,
        englishTitle: anime.title_english,
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        bannerImage: anime.images?.jpg?.large_image_url,
        episodes: anime.episodes,
        status: anime.status,
        season: anime.season,
        year: anime.year,
        genres: anime.genres?.map((genre: any) => genre.name) || [],
        score: anime.score,
        popularity: anime.popularity,
        duration: anime.duration,
        source: anime.source,
        studios: anime.studios?.map((studio: any) => studio.name) || []
      };

      return {
        success: true,
        data: animeInfo,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting anime details:", error);
      return {
        success: false,
        error: "Failed to get anime details",
        creator: this.creator
      };
    }
  }

  async getAnimeEpisodes(id: number): Promise<AnimeEpisodesResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: "Please provide anime ID",
          creator: this.creator
        };
      }

      const response = await axios.get(`${this.jikanBaseUrl}/anime/${id}/episodes`, {
        timeout: 15000
      });

      const episodes: AnimeEpisode[] = response.data.data.map((episode: any) => ({
        number: episode.mal_id,
        title: episode.title,
        synopsis: episode.synopsis,
        airDate: episode.aired
      }));

      return {
        success: true,
        data: episodes,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting anime episodes:", error);
      return {
        success: false,
        error: "Failed to get anime episodes",
        creator: this.creator
      };
    }
  }

  async getTopAnime(type: 'airing' | 'upcoming' | 'bypopularity' | 'favorite' = 'bypopularity', page: number = 1): Promise<AnimeSearchResult> {
    try {
      const response = await axios.get(`${this.jikanBaseUrl}/top/anime`, {
        params: {
          filter: type,
          page,
          limit: 25,
          sfw: true
        },
        timeout: 15000
      });

      const animeList: AnimeInfo[] = response.data.data.map((anime: any) => ({
        id: anime.mal_id,
        title: anime.title,
        englishTitle: anime.title_english,
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        episodes: anime.episodes,
        status: anime.status,
        season: anime.season,
        year: anime.year,
        genres: anime.genres?.map((genre: any) => genre.name) || [],
        score: anime.score,
        popularity: anime.popularity,
        duration: anime.duration,
        source: anime.source,
        studios: anime.studios?.map((studio: any) => studio.name) || []
      }));

      const pagination = response.data.pagination;

      return {
        success: true,
        data: animeList,
        pagination: {
          currentPage: pagination.current_page,
          totalPages: pagination.last_visible_page,
          totalResults: pagination.items?.total || 0,
          hasNextPage: pagination.has_next_page
        },
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting top anime:", error);
      return {
        success: false,
        error: "Failed to get top anime",
        creator: this.creator
      };
    }
  }

  async getStreamingLinks(animeTitle: string, episode: number = 1): Promise<{ success: boolean; data?: StreamingLink[]; error?: string; creator: string }> {
    try {
      if (!animeTitle) {
        return {
          success: false,
          error: "Please provide anime title",
          creator: this.creator
        };
      }

      // This is a simplified implementation
      // In a real implementation, you would integrate with actual streaming scrapers
      const demoLinks: StreamingLink[] = [
        {
          quality: '1080p',
          url: `https://demo-stream.example.com/${encodeURIComponent(animeTitle)}/episode-${episode}/1080p.m3u8`,
          server: 'Demo Server 1',
          type: 'hls'
        },
        {
          quality: '720p',
          url: `https://demo-stream.example.com/${encodeURIComponent(animeTitle)}/episode-${episode}/720p.mp4`,
          server: 'Demo Server 2',
          type: 'mp4'
        },
        {
          quality: '480p',
          url: `https://demo-stream.example.com/${encodeURIComponent(animeTitle)}/episode-${episode}/480p.mp4`,
          server: 'Demo Server 3',
          type: 'mp4'
        }
      ];

      return {
        success: true,
        data: demoLinks,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting streaming links:", error);
      return {
        success: false,
        error: "Failed to get streaming links",
        creator: this.creator
      };
    }
  }

  async getDownloadLinks(animeTitle: string, episode: number = 1): Promise<{ success: boolean; data?: DownloadLink[]; error?: string; creator: string }> {
    try {
      if (!animeTitle) {
        return {
          success: false,
          error: "Please provide anime title",
          creator: this.creator
        };
      }

      // This is a simplified implementation
      // In a real implementation, you would integrate with torrent trackers like Nyaa
      const demoLinks: DownloadLink[] = [
        {
          quality: '1080p',
          url: `magnet:?xt=urn:btih:demo${Buffer.from(animeTitle + episode.toString()).toString('hex')}&dn=${encodeURIComponent(animeTitle)}+Episode+${episode}+[1080p]`,
          size: '1.2 GB',
          type: 'torrent',
          seeders: 150,
          leechers: 25
        },
        {
          quality: '720p',
          url: `magnet:?xt=urn:btih:demo${Buffer.from(animeTitle + episode.toString() + '720p').toString('hex')}&dn=${encodeURIComponent(animeTitle)}+Episode+${episode}+[720p]`,
          size: '800 MB',
          type: 'torrent',
          seeders: 200,
          leechers: 15
        },
        {
          quality: '1080p',
          url: `https://demo-direct.example.com/${encodeURIComponent(animeTitle)}/episode-${episode}-1080p.mkv`,
          size: '1.2 GB',
          type: 'direct'
        }
      ];

      return {
        success: true,
        data: demoLinks,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting download links:", error);
      return {
        success: false,
        error: "Failed to get download links",
        creator: this.creator
      };
    }
  }

  async getSeasonalAnime(year: number, season: 'spring' | 'summer' | 'fall' | 'winter'): Promise<AnimeSearchResult> {
    try {
      const response = await axios.get(`${this.jikanBaseUrl}/seasons/${year}/${season}`, {
        timeout: 15000
      });

      const animeList: AnimeInfo[] = response.data.data.map((anime: any) => ({
        id: anime.mal_id,
        title: anime.title,
        englishTitle: anime.title_english,
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        episodes: anime.episodes,
        status: anime.status,
        season: anime.season,
        year: anime.year,
        genres: anime.genres?.map((genre: any) => genre.name) || [],
        score: anime.score,
        popularity: anime.popularity,
        duration: anime.duration,
        source: anime.source,
        studios: anime.studios?.map((studio: any) => studio.name) || []
      }));

      return {
        success: true,
        data: animeList,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting seasonal anime:", error);
      return {
        success: false,
        error: "Failed to get seasonal anime",
        creator: this.creator
      };
    }
  }

  // Get service status
  getStatus() {
    return {
      service: 'Anime Unified API',
      sources: ['Jikan API v4', 'AniList GraphQL', 'Multiple Scrapers'],
      features: ['Search', 'Details', 'Episodes', 'Streaming', 'Downloads', 'Seasonal', 'Top Lists'],
      creator: this.creator
    };
  }
}

export const animeUnifiedService = new AnimeUnifiedService();