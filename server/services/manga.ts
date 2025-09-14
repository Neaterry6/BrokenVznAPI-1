import axios from 'axios';

export interface MangaSearchRequest {
  query: string;
  page?: number;
}

export interface MangaInfo {
  id?: string;
  title: string;
  author?: string;
  status?: string;
  lastChapter?: string;
  rating?: string;
  thumbnail?: string;
  url?: string;
  description?: string;
  genres?: string[];
  chapters?: ChapterInfo[];
}

export interface ChapterInfo {
  id: string;
  title: string;
  chapter: string;
  url: string;
  releaseDate?: string;
}

export interface MangaSearchResult {
  success: boolean;
  data?: MangaInfo[];
  error?: string;
  creator: string;
}

export interface MangaDetailResult {
  success: boolean;
  data?: MangaInfo;
  error?: string;
  creator: string;
}

export class MangaService {
  private creator = '@BrokenVZN';
  private jikanBaseUrl = 'https://api.jikan.moe/v4';
  private rateLimit = 3; // Jikan API rate limit: 3 requests per second

  private async delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async searchManga(request: MangaSearchRequest): Promise<MangaSearchResult> {
    try {
      const { query, page = 1 } = request;

      if (!query) {
        return {
          success: false,
          error: "Please provide a search query",
          creator: this.creator
        };
      }

      // Use Jikan API to search manga from MyAnimeList
      const searchUrl = `${this.jikanBaseUrl}/manga`;
      
      const response = await axios.get(searchUrl, {
        params: {
          q: query,
          page: page,
          limit: 25
        },
        timeout: 15000
      });

      await this.delay(350); // Rate limiting for Jikan API

      if (!response.data || !response.data.data) {
        return {
          success: false,
          error: "No manga found",
          creator: this.creator
        };
      }

      const mangaList: MangaInfo[] = response.data.data.map((manga: any) => {
        const authors = manga.authors?.map((author: any) => author.name).join(', ') || 'Unknown';
        const genres = manga.genres?.map((genre: any) => genre.name) || [];
        const status = manga.status || 'Unknown';
        
        return {
          id: manga.mal_id?.toString(),
          title: manga.title || manga.title_english || 'Unknown Title',
          author: authors,
          status: status,
          rating: manga.score ? `${manga.score}/10` : 'Not Rated',
          thumbnail: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url,
          url: manga.url,
          description: manga.synopsis || 'No description available',
          genres: genres,
          lastChapter: manga.chapters ? `Chapter ${manga.chapters}` : 'Ongoing'
        };
      });

      return {
        success: true,
        data: mangaList,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error searching manga:", error);
      return {
        success: false,
        error: "Failed to search manga",
        creator: this.creator
      };
    }
  }

  async getMangaInfo(mangaId: string): Promise<MangaDetailResult> {
    try {
      if (!mangaId) {
        return {
          success: false,
          error: "Please provide manga ID",
          creator: this.creator
        };
      }

      // Extract MAL ID from URL if it's a MyAnimeList URL
      let malId = mangaId;
      if (mangaId.includes('myanimelist.net/manga/')) {
        const match = mangaId.match(/\/manga\/(\d+)/);
        malId = match ? match[1] : mangaId;
      }

      const response = await axios.get(`${this.jikanBaseUrl}/manga/${malId}/full`, {
        timeout: 15000
      });

      await this.delay(350); // Rate limiting

      if (!response.data || !response.data.data) {
        return {
          success: false,
          error: "Manga not found",
          creator: this.creator
        };
      }

      const manga = response.data.data;
      const authors = manga.authors?.map((author: any) => author.name).join(', ') || 'Unknown';
      const genres = manga.genres?.map((genre: any) => genre.name) || [];

      // Get characters info
      let characters: any[] = [];
      try {
        const charactersResponse = await axios.get(`${this.jikanBaseUrl}/manga/${malId}/characters`, {
          timeout: 10000
        });
        await this.delay(350);
        characters = charactersResponse.data?.data?.slice(0, 10) || []; // Top 10 characters
      } catch (error) {
        console.log("Could not fetch characters:", error);
      }

      const mangaInfo: MangaInfo = {
        id: manga.mal_id?.toString(),
        title: manga.title || manga.title_english || 'Unknown Title',
        author: authors,
        status: manga.status || 'Unknown',
        description: manga.synopsis || 'No description available',
        rating: manga.score ? `${manga.score}/10 (${manga.scored_by || 0} votes)` : 'Not Rated',
        thumbnail: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url,
        url: manga.url,
        genres: genres,
        lastChapter: manga.chapters ? `${manga.chapters} chapters` : 'Ongoing',
        chapters: characters.map((char: any, index: number) => ({
          id: char.character?.mal_id?.toString() || index.toString(),
          title: char.character?.name || `Character ${index + 1}`,
          chapter: `Character`,
          url: char.character?.url || '',
          releaseDate: char.role || 'Main Character'
        }))
      };

      return {
        success: true,
        data: mangaInfo,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting manga info:", error);
      return {
        success: false,
        error: "Failed to get manga information",
        creator: this.creator
      };
    }
  }

  async getPopularManga(page: number = 1): Promise<MangaSearchResult> {
    try {
      // Get top manga from MyAnimeList
      const response = await axios.get(`${this.jikanBaseUrl}/top/manga`, {
        params: {
          page: page,
          limit: 25
        },
        timeout: 15000
      });

      await this.delay(350); // Rate limiting

      if (!response.data || !response.data.data) {
        return {
          success: false,
          error: "No popular manga found",
          creator: this.creator
        };
      }

      const mangaList: MangaInfo[] = response.data.data.map((manga: any) => {
        const authors = manga.authors?.map((author: any) => author.name).join(', ') || 'Unknown';
        const genres = manga.genres?.map((genre: any) => genre.name) || [];
        
        return {
          id: manga.mal_id?.toString(),
          title: manga.title || manga.title_english || 'Unknown Title',
          author: authors,
          status: manga.status || 'Unknown',
          rating: manga.score ? `${manga.score}/10` : 'Not Rated',
          thumbnail: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url,
          url: manga.url,
          description: manga.synopsis || 'No description available',
          genres: genres,
          lastChapter: manga.chapters ? `Chapter ${manga.chapters}` : 'Ongoing'
        };
      });

      return {
        success: true,
        data: mangaList,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting popular manga:", error);
      return {
        success: false,
        error: "Failed to get popular manga",
        creator: this.creator
      };
    }
  }

  async getLatestManga(page: number = 1): Promise<MangaSearchResult> {
    try {
      // Get recently updated manga from MyAnimeList
      const response = await axios.get(`${this.jikanBaseUrl}/manga`, {
        params: {
          page: page,
          limit: 25,
          order_by: 'start_date',
          sort: 'desc'
        },
        timeout: 15000
      });

      await this.delay(350); // Rate limiting

      if (!response.data || !response.data.data) {
        return {
          success: false,
          error: "No latest manga found",
          creator: this.creator
        };
      }

      const mangaList: MangaInfo[] = response.data.data.map((manga: any) => {
        const authors = manga.authors?.map((author: any) => author.name).join(', ') || 'Unknown';
        const genres = manga.genres?.map((genre: any) => genre.name) || [];
        
        return {
          id: manga.mal_id?.toString(),
          title: manga.title || manga.title_english || 'Unknown Title',
          author: authors,
          status: manga.status || 'Unknown',
          rating: manga.score ? `${manga.score}/10` : 'Not Rated',
          thumbnail: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url,
          url: manga.url,
          description: manga.synopsis || 'No description available',
          genres: genres,
          lastChapter: manga.chapters ? `Chapter ${manga.chapters}` : 'Ongoing'
        };
      });

      return {
        success: true,
        data: mangaList,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting latest manga:", error);
      return {
        success: false,
        error: "Failed to get latest manga",
        creator: this.creator
      };
    }
  }
}

export const mangaService = new MangaService();