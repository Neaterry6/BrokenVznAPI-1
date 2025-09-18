import axios from 'axios';
import * as cheerio from 'cheerio';
import YTDlpWrap from 'yt-dlp-wrap';

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
  popularity?: number;
  startDate?: { year: number; month: number; day: number };
}

export interface GogoAnimeData {
  id?: string;
  title?: string;
  url?: string;
  image?: string;
  episodes?: Array<{ id: string; number: number; url: string }>;
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
  views?: number;
  published?: string;
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
  data?: Array<{ quality: string; url: string; server: string; type: 'mp4' | 'hls' | 'm3u8' }>;
  error?: string;
  creator: string;
}

export class Anime2Service {
  private clientId: string;
  private clientSecret: string;
  private aniListUrl = 'https://graphql.anilist.co';
  private aniListToken: string | null = null;
  private creator = 'heisbroken';
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
  private ytDlpWrap: YTDlpWrap;

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
        media(search: $search, seasonYear: $seasonYear, format: $format, genre_in: $genre_in, type: ANIME, isAdult: false) {
          id
          title { romaji english native }
          episodes
          status
          seasonYear
          format
          genres
          coverImage { large }
          description
          popularity
          startDate { year month day }
        }
      }
    }
  `;

  constructor() {
    this.clientId = process.env.ANILIST_CLIENT_ID || '';
    this.clientSecret = process.env.ANILIST_CLIENT_SECRET || '';
    this.ytDlpWrap = new YTDlpWrap();

    if (!this.clientId || !this.clientSecret) {
      console.warn('AniList credentials missing; using public queries');
    } else {
      this.initializeToken();
      setInterval(() => this.getAniListToken(), 50 * 60 * 1000);
    }
  }

  // Legal disclaimer
  private getLegalDisclaimer(): string {
    return `
    ⚠️ LEGAL DISCLAIMER ⚠️
    This service is intended for legitimate, copyright-free content only.
    Users are responsible for ensuring they have proper rights to access or download content.
    Accessing copyrighted material without permission may violate terms of service and copyright laws.
    `;
  }

  // Format published date
  private formatPublishedDate(date: { year: number; month: number; day: number } | string): string {
    if (!date) return 'Unknown';
    const parsed = typeof date === 'string' ? new Date(date) : new Date(date.year, date.month - 1, date.day);
    const now = new Date();
    const diffYears = now.getFullYear() - parsed.getFullYear();
    if (diffYears >= 1) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    const diffMonths = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (diffMonths >= 1) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  // Validate URL
  private validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const ip = urlObj.hostname;

      const privateIPPatterns = [
        /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./,
        /^169\.254\./, /^::1$/, /^fc00:/, /^fe80:/
      ];

      if (privateIPPatterns.some(pattern => pattern.test(ip)) || ['localhost', '0.0.0.0'].includes(hostname)) {
        return { valid: false, error: 'Access to private/internal networks is not allowed.' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL' };
    }
  }

  private async getAniListToken(maxRetries = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post('https://anilist.co/api/v2/oauth/token', {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        });

        if (response.data.access_token) {
          this.aniListToken = response.data.access_token;
          console.log('AniList token fetched successfully');
          return;
        }
      } catch (error: any) {
        console.error(`AniList token fetch attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) {
          console.warn('Max retries reached; using public AniList queries');
          this.aniListToken = null;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  private async initializeToken(): Promise<void> {
    await this.getAniListToken();
  }

  private async fetchGogoAnimeData(title: string): Promise<GogoAnimeData> {
    try {
      const cleanTitle = title.replace(/[^\w\s]/gi, '').trim();
      const searchUrl = `https://9anime.to/search?keyword=${encodeURIComponent(cleanTitle)}`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const firstResult = $('.film-list .item a').first();
      const url = firstResult.attr('href');
      if (!url) return { error: 'No matching Gogoanime data' };

      const animeUrl = `https://9anime.to${url}`;
      const animePage = await axios.get(animeUrl, { headers: { 'User-Agent': this.userAgent }, timeout: 15000 });
      const $anime = cheerio.load(animePage.data);

      const id = url.split('/').pop();
      const image = $anime('.film-poster img').attr('src');
      const episodes: Array<{ id: string; number: number; url: string }> = [];
      $anime('.episodes-ul a').each((_, el) => {
        const epUrl = $anime(el).attr('href');
        const epNumber = parseInt($anime(el).attr('data-number') || '0');
        if (epUrl && epNumber) {
          episodes.push({ id: `${id}-ep${epNumber}`, number: epNumber, url: `https://9anime.to${epUrl}` });
        }
      });

      return {
        id,
        title: $anime('.film-title').text().trim() || cleanTitle,
        url: animeUrl,
        image,
        episodes,
        totalEpisodes: episodes.length
      };
    } catch (error: any) {
      console.error(`Gogoanime fetch error for ${title}:`, error.message);
      return { error: 'Failed to fetch Gogoanime data' };
    }
  }

  async searchAnime(params: {
    title?: string;
    year?: string;
    format?: string;
    genre?: string;
    limit?: string;
  }): Promise<Anime2SearchResult> {
    try {
      const variables = {
        search: params.title || null,
        seasonYear: params.year ? parseInt(params.year) : null,
        format: params.format?.toUpperCase() || null,
        genre_in: params.genre ? [params.genre] : null,
        perPage: params.limit ? parseInt(params.limit) : 10,
      };

      const headers: any = { 'Content-Type': 'application/json' };
      if (this.aniListToken) headers['Authorization'] = `Bearer ${this.aniListToken}`;

      const anilistResponse = await axios.post(this.aniListUrl, {
        query: this.aniListQuery,
        variables
      }, { headers, timeout: 15000 });

      const pageData = anilistResponse.data?.data?.Page;
      if (!pageData) {
        return {
          success: false,
          status: 'error',
          error: 'No data returned from AniList',
          creator: this.creator
        };
      }

      const animeList: AniListMedia[] = pageData.media || [];
      const totalResults = pageData.pageInfo?.total || 0;

      if (!animeList.length) {
        return {
          success: true,
          status: 'success',
          results: [],
          totalResults: 0,
          creator: this.creator
        };
      }

      const resultsWithGogo = await Promise.all(
        animeList.map(async (anime): Promise<AnimeSearchResult> => {
          const searchTitle = anime.title.romaji || anime.title.english || anime.title.native;
          const gogoData = await this.fetchGogoAnimeData(searchTitle);
          return {
            ...anime,
            gogoanime: gogoData,
            views: anime.popularity || 0,
            published: this.formatPublishedDate(anime.startDate || '')
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
    } catch (error: any) {
      console.error('Anime2 search error:', error.message);
      return {
        success: false,
        status: 'error',
        error: `Failed to search anime: ${error.message || 'Unknown error'}`,
        creator: this.creator
      };
    }
  }

  async getWatchLinks(episodeId: string): Promise<WatchLinksResult> {
    try {
      if (!episodeId) {
        return { success: false, status: 'error', error: 'Episode ID is required', creator: this.creator };
      }

      const validation = this.validateUrl(`https://9anime.to/watch/${episodeId}`);
      if (!validation.valid) {
        return { success: false, status: 'error', error: validation.error, creator: this.creator };
      }

      const args = ['--get-url', '--format', 'best[ext=mp4]/best[ext=m3u8]/best', `https://9anime.to/watch/${episodeId}`];
      const streamUrl = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });

      return {
        success: true,
        status: 'success',
        data: [{
          quality: '720p', // Default, as yt-dlp doesn't always provide quality
          url: streamUrl.trim(),
          server: '9anime',
          type: streamUrl.includes('.m3u8') ? 'm3u8' : 'mp4'
        }],
        creator: this.creator
      };
    } catch (error: any) {
      console.error('Watch links fetch error:', error.message);
      return {
        success: false,
        status: 'error',
        error: `Could not fetch episode links: ${error.message || 'Unknown error'}`,
        creator: this.creator
      };
    }
  }

  async getAnimeDetails(anilistId: string): Promise<Anime2SearchResult> {
    try {
      if (!anilistId || isNaN(parseInt(anilistId))) {
        return { success: false, status: 'error', error: 'Valid AniList ID is required', creator: this.creator };
      }

      const detailQuery = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title { romaji english native }
            episodes
            status
            seasonYear
            format
            genres
            coverImage { large }
            description
            duration
            popularity
            startDate { year month day }
            studios { nodes { name } }
            relations { edges { node { title { romaji } } } }
          }
        }
      `;

      const headers: any = { 'Content-Type': 'application/json' };
      if (this.aniListToken) headers['Authorization'] = `Bearer ${this.aniListToken}`;

      const response = await axios.post(this.aniListUrl, {
        query: detailQuery,
        variables: { id: parseInt(anilistId) }
      }, { headers, timeout: 15000 });

      const anime = response.data?.data?.Media;
      if (!anime) {
        return { success: false, status: 'error', error: 'Anime not found', creator: this.creator };
      }

      const searchTitle = anime.title.romaji || anime.title.english || anime.title.native;
      const gogoData = await this.fetchGogoAnimeData(searchTitle);

      return {
        success: true,
        status: 'success',
        results: [{
          ...anime,
          gogoanime: gogoData,
          views: anime.popularity || 0,
          published: this.formatPublishedDate(anime.startDate || '')
        }],
        creator: this.creator
      };
    } catch (error: any) {
      console.error('Anime details fetch error:', error.message);
      return {
        success: false,
        status: 'error',
        error: `Failed to fetch anime details: ${error.message || 'Unknown error'}`,
        creator: this.creator
      };
    }
  }

  getStatus(): { success: boolean; status: string; tokenStatus: string; creator: string; disclaimer: string } {
    return {
      success: true,
      status: 'online',
      tokenStatus: this.aniListToken ? 'authenticated' : 'using public queries',
      creator: this.creator,
      disclaimer: this.getLegalDisclaimer()
    };
  }

  getFormats(): { success: boolean; formats: string[]; creator: string } {
    return {
      success: true,
      formats: ['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC'],
      creator: this.creator
    };
  }

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