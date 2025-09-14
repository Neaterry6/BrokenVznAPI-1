import axios from 'axios';

export interface AnimeSearchResult {
  success: boolean;
  data?: any[];
  error?: string;
  creator: string;
}

export interface AnimeInfoResult {
  success: boolean;
  data?: any;
  error?: string;
  creator: string;
}

export class AnimeService {
  async searchAnime(query: string): Promise<AnimeSearchResult> {
    try {
      if (!query) {
        return {
          success: false,
          error: "Please provide a search query",
          creator: "heisbroken"
        };
      }

      // Use Jikan API (MyAnimeList API)
      const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`, {
        timeout: 10000
      });

      const animeList = response.data.data.map((anime: any) => ({
        id: anime.mal_id,
        title: anime.title,
        title_english: anime.title_english,
        title_japanese: anime.title_japanese,
        type: anime.type,
        episodes: anime.episodes,
        status: anime.status,
        score: anime.score,
        year: anime.year,
        season: anime.season,
        genres: anime.genres?.map((g: any) => g.name) || [],
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.image_url,
        trailer: anime.trailer?.url,
        url: anime.url
      }));

      return {
        success: true,
        data: animeList,
        creator: "heisbroken"
      };
    } catch (error) {
      console.error("Error searching anime:", error);
      return {
        success: false,
        error: "Failed to search anime",
        creator: "heisbroken"
      };
    }
  }

  async getAnimeInfo(id: string): Promise<AnimeInfoResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: "Please provide anime ID",
          creator: "heisbroken"
        };
      }

      const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`, {
        timeout: 10000
      });

      const anime = response.data.data;
      const animeInfo = {
        id: anime.mal_id,
        title: anime.title,
        title_english: anime.title_english,
        title_japanese: anime.title_japanese,
        type: anime.type,
        episodes: anime.episodes,
        status: anime.status,
        score: anime.score,
        scored_by: anime.scored_by,
        rank: anime.rank,
        popularity: anime.popularity,
        year: anime.year,
        season: anime.season,
        studios: anime.studios?.map((s: any) => s.name) || [],
        genres: anime.genres?.map((g: any) => g.name) || [],
        themes: anime.themes?.map((t: any) => t.name) || [],
        demographics: anime.demographics?.map((d: any) => d.name) || [],
        synopsis: anime.synopsis,
        background: anime.background,
        images: anime.images,
        trailer: anime.trailer?.url,
        url: anime.url,
        duration: anime.duration,
        rating: anime.rating,
        source: anime.source
      };

      return {
        success: true,
        data: animeInfo,
        creator: "heisbroken"
      };
    } catch (error) {
      console.error("Error getting anime info:", error);
      return {
        success: false,
        error: "Failed to get anime info",
        creator: "heisbroken"
      };
    }
  }

  async getTopAnime(type?: string): Promise<AnimeSearchResult> {
    try {
      let url = 'https://api.jikan.moe/v4/top/anime?limit=25';
      if (type) {
        url += `&type=${encodeURIComponent(type)}`;
      }

      const response = await axios.get(url, {
        timeout: 10000
      });

      const animeList = response.data.data.map((anime: any) => ({
        id: anime.mal_id,
        title: anime.title,
        title_english: anime.title_english,
        type: anime.type,
        episodes: anime.episodes,
        score: anime.score,
        rank: anime.rank,
        popularity: anime.popularity,
        year: anime.year,
        genres: anime.genres?.map((g: any) => g.name) || [],
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.image_url,
        url: anime.url
      }));

      return {
        success: true,
        data: animeList,
        creator: "heisbroken"
      };
    } catch (error) {
      console.error("Error getting top anime:", error);
      return {
        success: false,
        error: "Failed to get top anime",
        creator: "heisbroken"
      };
    }
  }

  async getAnimeBySeason(year: string, season: string): Promise<AnimeSearchResult> {
    try {
      if (!year || !season) {
        return {
          success: false,
          error: "Please provide year and season",
          creator: "heisbroken"
        };
      }

      const response = await axios.get(`https://api.jikan.moe/v4/seasons/${year}/${season}?limit=25`, {
        timeout: 10000
      });

      const animeList = response.data.data.map((anime: any) => ({
        id: anime.mal_id,
        title: anime.title,
        title_english: anime.title_english,
        type: anime.type,
        episodes: anime.episodes,
        score: anime.score,
        year: anime.year,
        season: anime.season,
        genres: anime.genres?.map((g: any) => g.name) || [],
        synopsis: anime.synopsis,
        image: anime.images?.jpg?.image_url,
        url: anime.url
      }));

      return {
        success: true,
        data: animeList,
        creator: "heisbroken"
      };
    } catch (error) {
      console.error("Error getting seasonal anime:", error);
      return {
        success: false,
        error: "Failed to get seasonal anime",
        creator: "heisbroken"
      };
    }
  }

  async getAnimeCharacters(id: string): Promise<AnimeSearchResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: "Please provide anime ID",
          creator: "heisbroken"
        };
      }

      const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}/characters`, {
        timeout: 10000
      });

      const characters = response.data.data.slice(0, 20).map((char: any) => ({
        id: char.character.mal_id,
        name: char.character.name,
        name_kanji: char.character.name_kanji,
        role: char.role,
        image: char.character.images?.jpg?.image_url,
        voice_actors: char.voice_actors?.slice(0, 3).map((va: any) => ({
          name: va.person.name,
          language: va.language,
          image: va.person.images?.jpg?.image_url
        })) || []
      }));

      return {
        success: true,
        data: characters,
        creator: "heisbroken"
      };
    } catch (error) {
      console.error("Error getting anime characters:", error);
      return {
        success: false,
        error: "Failed to get anime characters",
        creator: "heisbroken"
      };
    }
  }
}

export const animeService = new AnimeService();