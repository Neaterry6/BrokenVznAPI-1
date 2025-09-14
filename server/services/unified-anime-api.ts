import axios from 'axios';
import * as cheerio from 'cheerio';

interface AnimeSearchResult {
  id: string;
  title: string;
  url: string;
  image?: string;
  releaseDate?: string;
  status?: string;
  genres?: string[];
}

interface AnimeDetails {
  id: string;
  title: string;
  description: string;
  image: string;
  releaseDate: string;
  status: string;
  genres: string[];
  episodes: AnimeEpisode[];
  totalEpisodes: number;
}

interface AnimeEpisode {
  id: string;
  number: number;
  title: string;
  url: string;
  releaseDate?: string;
}

interface StreamingSource {
  quality: string;
  url: string;
  type: string;
}

export class UnifiedAnimeAPI {
  private baseUrls = {
    gogoanime: 'https://gogoanime.bid',
    animepahe: 'https://animepahe.com',
    aniwatch: 'https://aniwatch.to',
    nineanime: 'https://9anime.to',
  };

  // Multi-source search
  async search(query: string, page: number = 1): Promise<{ results: AnimeSearchResult[], hasNextPage: boolean }> {
    try {
      const results: AnimeSearchResult[] = [];
      
      // Search GogoAnime
      const gogoResults = await this.searchGogoAnime(query);
      results.push(...gogoResults);

      // Search AnimePahe
      const paheResults = await this.searchAnimePahe(query);
      results.push(...paheResults);

      // Remove duplicates and limit results
      const uniqueResults = this.removeDuplicates(results);
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      
      return {
        results: uniqueResults.slice(startIndex, endIndex),
        hasNextPage: uniqueResults.length > endIndex
      };
    } catch (error) {
      console.error('Search error:', error);
      return { results: [], hasNextPage: false };
    }
  }

  // Search GogoAnime
  private async searchGogoAnime(query: string): Promise<AnimeSearchResult[]> {
    try {
      const searchUrl = `${this.baseUrls.gogoanime}/search.html?keyword=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const results: AnimeSearchResult[] = [];
      
      $('.items li').each((_, element) => {
        const title = $(element).find('p.name a').attr('title') || '';
        const url = $(element).find('p.name a').attr('href') || '';
        const image = $(element).find('div.img img').attr('src') || '';
        const releaseDate = $(element).find('p.released').text().replace('Released: ', '');
        
        if (title && url) {
          results.push({
            id: this.extractAnimeId(url),
            title: title.trim(),
            url: `${this.baseUrls.gogoanime}${url}`,
            image: image.startsWith('http') ? image : `${this.baseUrls.gogoanime}${image}`,
            releaseDate,
            status: 'Unknown'
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('GogoAnime search error:', error);
      return [];
    }
  }

  // Search AnimePahe
  private async searchAnimePahe(query: string): Promise<AnimeSearchResult[]> {
    try {
      const searchUrl = `${this.baseUrls.animepahe}/api?m=search&q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const results: AnimeSearchResult[] = [];
      
      if (response.data && response.data.data) {
        response.data.data.forEach((anime: any) => {
          results.push({
            id: anime.id?.toString() || anime.title,
            title: anime.title,
            url: `${this.baseUrls.animepahe}/anime/${anime.id}`,
            image: anime.poster,
            releaseDate: anime.year?.toString(),
            status: anime.status,
            genres: anime.genre ? anime.genre.split(',').map((g: string) => g.trim()) : []
          });
        });
      }
      
      return results;
    } catch (error) {
      console.error('AnimePahe search error:', error);
      return [];
    }
  }

  // Get anime details
  async getAnimeDetails(animeId: string, source: string = 'gogoanime'): Promise<AnimeDetails | null> {
    try {
      switch (source.toLowerCase()) {
        case 'gogoanime':
          return await this.getGogoAnimeDetails(animeId);
        case 'animepahe':
          return await this.getAnimePaheDetails(animeId);
        default:
          return await this.getGogoAnimeDetails(animeId);
      }
    } catch (error) {
      console.error('Get details error:', error);
      return null;
    }
  }

  // GogoAnime details
  private async getGogoAnimeDetails(animeId: string): Promise<AnimeDetails | null> {
    try {
      const animeUrl = animeId.startsWith('http') ? animeId : `${this.baseUrls.gogoanime}/category/${animeId}`;
      const response = await axios.get(animeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      const title = $('.anime_info_body_bg h1').text().trim();
      const image = $('.anime_info_body_bg img').attr('src') || '';
      const description = $('.anime_info_body_bg .type:contains("Plot Summary")').next().text().trim();
      
      // Extract other details
      const releaseDate = $('.anime_info_body_bg .type:contains("Released")').next().text().trim();
      const status = $('.anime_info_body_bg .type:contains("Status")').next().text().trim();
      const genres: string[] = [];
      
      $('.anime_info_body_bg .type:contains("Genre")').next().find('a').each((_, el) => {
        genres.push($(el).text().trim());
      });
      
      // Get episodes list
      const movieId = $('#movie_id').attr('value') || '';
      const episodes = await this.getGogoAnimeEpisodes(movieId, animeId);
      
      return {
        id: animeId,
        title,
        description,
        image: image.startsWith('http') ? image : `${this.baseUrls.gogoanime}${image}`,
        releaseDate,
        status,
        genres,
        episodes,
        totalEpisodes: episodes.length
      };
    } catch (error) {
      console.error('GogoAnime details error:', error);
      return null;
    }
  }

  // Get episodes list
  private async getGogoAnimeEpisodes(movieId: string, animeId: string): Promise<AnimeEpisode[]> {
    try {
      if (!movieId) return [];
      
      const episodesUrl = `${this.baseUrls.gogoanime}/load-list-episode?ep_start=0&ep_end=9999&id=${movieId}`;
      const response = await axios.get(episodesUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const episodes: AnimeEpisode[] = [];
      
      $('a').each((_, element) => {
        const href = $(element).attr('href') || '';
        const episodeText = $(element).find('.name').text().trim();
        const episodeMatch = episodeText.match(/EP (\d+)/);
        
        if (href && episodeMatch) {
          const episodeNumber = parseInt(episodeMatch[1]);
          episodes.push({
            id: href.replace('/', ''),
            number: episodeNumber,
            title: `Episode ${episodeNumber}`,
            url: `${this.baseUrls.gogoanime}${href}`
          });
        }
      });
      
      return episodes.sort((a, b) => a.number - b.number);
    } catch (error) {
      console.error('Episodes fetch error:', error);
      return [];
    }
  }

  // AnimePahe details
  private async getAnimePaheDetails(animeId: string): Promise<AnimeDetails | null> {
    try {
      const detailsUrl = `${this.baseUrls.animepahe}/api?m=anime&id=${animeId}`;
      const response = await axios.get(detailsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.data || !response.data.data) return null;
      
      const anime = response.data.data;
      const episodes = await this.getAnimePaheEpisodes(animeId);
      
      return {
        id: animeId,
        title: anime.title,
        description: anime.synopsis || 'No description available',
        image: anime.poster,
        releaseDate: anime.year?.toString() || '',
        status: anime.status || 'Unknown',
        genres: anime.genre ? anime.genre.split(',').map((g: string) => g.trim()) : [],
        episodes,
        totalEpisodes: episodes.length
      };
    } catch (error) {
      console.error('AnimePahe details error:', error);
      return null;
    }
  }

  // Get AnimePahe episodes
  private async getAnimePaheEpisodes(animeId: string): Promise<AnimeEpisode[]> {
    try {
      const episodesUrl = `${this.baseUrls.animepahe}/api?m=release&id=${animeId}&sort=episode_asc`;
      const response = await axios.get(episodesUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const episodes: AnimeEpisode[] = [];
      
      if (response.data && response.data.data) {
        response.data.data.forEach((ep: any) => {
          episodes.push({
            id: ep.id?.toString() || ep.episode?.toString(),
            number: ep.episode,
            title: `Episode ${ep.episode}`,
            url: `${this.baseUrls.animepahe}/play/${animeId}/${ep.id}`,
            releaseDate: ep.created_at
          });
        });
      }
      
      return episodes;
    } catch (error) {
      console.error('AnimePahe episodes error:', error);
      return [];
    }
  }

  // Get streaming links
  async getStreamingLinks(episodeId: string, source: string = 'gogoanime'): Promise<StreamingSource[]> {
    try {
      switch (source.toLowerCase()) {
        case 'gogoanime':
          return await this.getGogoAnimeStreaming(episodeId);
        case 'animepahe':
          return await this.getAnimePaheStreaming(episodeId);
        default:
          return await this.getGogoAnimeStreaming(episodeId);
      }
    } catch (error) {
      console.error('Streaming links error:', error);
      return [];
    }
  }

  // GogoAnime streaming
  private async getGogoAnimeStreaming(episodeId: string): Promise<StreamingSource[]> {
    try {
      const episodeUrl = episodeId.startsWith('http') ? episodeId : `${this.baseUrls.gogoanime}/${episodeId}`;
      const response = await axios.get(episodeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const sources: StreamingSource[] = [];
      
      // Extract vidstream links
      $('.anime_muti_link ul li').each((_, element) => {
        const className = $(element).attr('class') || '';
        const dataVideo = $(element).find('a').attr('data-video') || '';
        
        if (dataVideo) {
          sources.push({
            quality: className.includes('hd') ? 'HD' : 'SD',
            url: dataVideo,
            type: className || 'unknown'
          });
        }
      });
      
      return sources;
    } catch (error) {
      console.error('GogoAnime streaming error:', error);
      return [];
    }
  }

  // AnimePahe streaming
  private async getAnimePaheStreaming(episodeId: string): Promise<StreamingSource[]> {
    try {
      // This would require more complex extraction due to AnimePahe's protection
      // For demo purposes, returning placeholder
      return [
        {
          quality: '720p',
          url: 'https://example.com/stream.m3u8',
          type: 'hls'
        }
      ];
    } catch (error) {
      console.error('AnimePahe streaming error:', error);
      return [];
    }
  }

  // Utility functions
  private extractAnimeId(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }

  private removeDuplicates(results: AnimeSearchResult[]): AnimeSearchResult[] {
    const seen = new Set();
    return results.filter(result => {
      const key = result.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Popular anime from multiple sources
  async getPopularAnime(page: number = 1): Promise<{ results: AnimeSearchResult[], hasNextPage: boolean }> {
    try {
      const results: AnimeSearchResult[] = [];
      
      // Get popular from GogoAnime
      const gogoPopular = await this.getGogoAnimePopular();
      results.push(...gogoPopular);
      
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      
      return {
        results: results.slice(startIndex, endIndex),
        hasNextPage: results.length > endIndex
      };
    } catch (error) {
      console.error('Popular anime error:', error);
      return { results: [], hasNextPage: false };
    }
  }

  private async getGogoAnimePopular(): Promise<AnimeSearchResult[]> {
    try {
      const popularUrl = `${this.baseUrls.gogoanime}/popular.html`;
      const response = await axios.get(popularUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const results: AnimeSearchResult[] = [];
      
      $('.items li').each((_, element) => {
        const title = $(element).find('p.name a').attr('title') || '';
        const url = $(element).find('p.name a').attr('href') || '';
        const image = $(element).find('div.img img').attr('src') || '';
        const releaseDate = $(element).find('p.released').text().replace('Released: ', '');
        
        if (title && url) {
          results.push({
            id: this.extractAnimeId(url),
            title: title.trim(),
            url: `${this.baseUrls.gogoanime}${url}`,
            image: image.startsWith('http') ? image : `${this.baseUrls.gogoanime}${image}`,
            releaseDate,
            status: 'Popular'
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('GogoAnime popular error:', error);
      return [];
    }
  }

  // Recent releases
  async getRecentReleases(page: number = 1): Promise<{ results: AnimeSearchResult[], hasNextPage: boolean }> {
    try {
      const recentUrl = `${this.baseUrls.gogoanime}/`;
      const response = await axios.get(recentUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const results: AnimeSearchResult[] = [];
      
      $('.items li').each((_, element) => {
        const title = $(element).find('p.name a').attr('title') || '';
        const url = $(element).find('p.name a').attr('href') || '';
        const image = $(element).find('div.img img').attr('src') || '';
        const episode = $(element).find('p.episode').text();
        
        if (title && url) {
          results.push({
            id: this.extractAnimeId(url),
            title: title.trim(),
            url: `${this.baseUrls.gogoanime}${url}`,
            image: image.startsWith('http') ? image : `${this.baseUrls.gogoanime}${image}`,
            status: `Recent - ${episode}`
          });
        }
      });
      
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      
      return {
        results: results.slice(startIndex, endIndex),
        hasNextPage: results.length > endIndex
      };
    } catch (error) {
      console.error('Recent releases error:', error);
      return { results: [], hasNextPage: false };
    }
  }
}