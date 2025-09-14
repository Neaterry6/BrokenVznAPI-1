import axios from 'axios';

export interface EnhancedAnimeSearchRequest {
  query?: string;
  page?: number;
  perPage?: number;
  genre?: string;
  year?: number;
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
  status?: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  format?: 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';
  sort?: 'ID' | 'TITLE_ROMAJI' | 'SCORE_DESC' | 'POPULARITY_DESC' | 'TRENDING_DESC' | 'UPDATED_AT_DESC' | 'START_DATE_DESC';
}

export interface EnhancedAnimeInfo {
  id: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
  };
  description?: string;
  episodes?: number;
  duration?: number;
  status?: string;
  season?: string;
  seasonYear?: number;
  averageScore?: number;
  meanScore?: number;
  popularity?: number;
  trending?: number;
  favourites?: number;
  genres?: string[];
  tags?: Array<{
    name: string;
    rank: number;
  }>;
  studios?: string[];
  source?: string;
  format?: string;
  countryOfOrigin?: string;
  isAdult?: boolean;
  coverImage?: {
    large?: string;
    medium?: string;
    color?: string;
  };
  bannerImage?: string;
  trailer?: {
    id: string;
    site: string;
    thumbnail: string;
  };
  nextAiringEpisode?: {
    episode: number;
    timeUntilAiring: number;
  };
  recommendations?: EnhancedAnimeInfo[];
  relations?: Array<{
    relationType: string;
    node: EnhancedAnimeInfo;
  }>;
  externalLinks?: Array<{
    site: string;
    url: string;
    type: string;
  }>;
  streamingEpisodes?: Array<{
    title: string;
    thumbnail: string;
    url: string;
  }>;
}

export interface EnhancedAnimeResult {
  success: boolean;
  data?: {
    anime?: EnhancedAnimeInfo[];
    pageInfo?: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
  };
  error?: string;
  creator: string;
}

export class AnimeEnhancedV2Service {
  private creator = '@BrokenVZN';
  private anilistEndpoint = 'https://graphql.anilist.co';
  private userAgent = 'Mozilla/5.0 (compatible; BrokenVZN-API/1.0)';

  // Enhanced search using AniList GraphQL
  async searchAnime(request: EnhancedAnimeSearchRequest): Promise<EnhancedAnimeResult> {
    try {
      const query = `
        query ($page: Int, $perPage: Int, $search: String, $genre: String, $year: Int, $season: MediaSeason, $status: MediaStatus, $format: MediaFormat, $sort: [MediaSort]) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
            }
            media(search: $search, genre: $genre, seasonYear: $year, season: $season, status: $status, format: $format, sort: $sort, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              description(asHtml: false)
              episodes
              duration
              status
              season
              seasonYear
              averageScore
              meanScore
              popularity
              trending
              favourites
              genres
              tags(sort: RANK) {
                name
                rank
              }
              studios {
                nodes {
                  name
                }
              }
              source
              format
              countryOfOrigin
              isAdult
              coverImage {
                large
                medium
                color
              }
              bannerImage
              trailer {
                id
                site
                thumbnail
              }
              nextAiringEpisode {
                episode
                timeUntilAiring
              }
              externalLinks {
                site
                url
                type
              }
              streamingEpisodes {
                title
                thumbnail
                url
              }
            }
          }
        }
      `;

      // Clean up variables to avoid null values that cause GraphQL errors
      const variables: any = {
        page: request.page || 1,
        perPage: Math.min(request.perPage || 20, 25)
      };
      
      if (request.query) variables.search = request.query;
      if (request.genre) variables.genre = request.genre;
      if (request.year) variables.year = request.year;
      if (request.season) variables.season = request.season;
      if (request.status) variables.status = request.status;
      if (request.format) variables.format = request.format;
      if (request.sort) {
        variables.sort = [request.sort];
      } else {
        variables.sort = ['POPULARITY_DESC'];
      }

      const response = await axios.post(this.anilistEndpoint, {
        query,
        variables
      }, {
        headers: {
          'User-Agent': this.userAgent,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const pageData = response.data.data.Page;
      const animeList = pageData.media.map((anime: any) => ({
        ...anime,
        studios: anime.studios?.nodes?.map((studio: any) => studio.name) || []
      }));

      return {
        success: true,
        data: {
          anime: animeList,
          pageInfo: pageData.pageInfo
        },
        creator: this.creator
      };

    } catch (error) {
      console.error('Enhanced anime search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search anime',
        creator: this.creator
      };
    }
  }

  // Get anime by ID with recommendations
  async getAnimeById(id: number): Promise<EnhancedAnimeResult> {
    try {
      const query = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            description(asHtml: false)
            episodes
            duration
            status
            season
            seasonYear
            averageScore
            meanScore
            popularity
            trending
            favourites
            genres
            tags(sort: RANK) {
              name
              rank
            }
            studios {
              nodes {
                name
              }
            }
            source
            format
            countryOfOrigin
            isAdult
            coverImage {
              large
              medium
              color
            }
            bannerImage
            trailer {
              id
              site
              thumbnail
            }
            nextAiringEpisode {
              episode
              timeUntilAiring
            }
            relations {
              edges {
                relationType
                node {
                  id
                  title {
                    romaji
                    english
                  }
                  format
                  status
                  coverImage {
                    medium
                  }
                }
              }
            }
            recommendations(page: 1, perPage: 10, sort: RATING_DESC) {
              nodes {
                mediaRecommendation {
                  id
                  title {
                    romaji
                    english
                  }
                  averageScore
                  coverImage {
                    medium
                  }
                  genres
                  status
                }
              }
            }
            externalLinks {
              site
              url
              type
            }
            streamingEpisodes {
              title
              thumbnail
              url
            }
          }
        }
      `;

      const response = await axios.post(this.anilistEndpoint, {
        query,
        variables: { id }
      }, {
        headers: {
          'User-Agent': this.userAgent,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const anime = response.data.data.Media;
      
      // Process recommendations
      const recommendations = anime.recommendations?.nodes?.map((rec: any) => rec.mediaRecommendation) || [];
      
      // Process relations
      const relations = anime.relations?.edges?.map((edge: any) => ({
        relationType: edge.relationType,
        node: edge.node
      })) || [];

      const enhancedAnime = {
        ...anime,
        studios: anime.studios?.nodes?.map((studio: any) => studio.name) || [],
        recommendations,
        relations
      };

      return {
        success: true,
        data: {
          anime: [enhancedAnime]
        },
        creator: this.creator
      };

    } catch (error) {
      console.error('Get anime by ID error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get anime details',
        creator: this.creator
      };
    }
  }

  // Get trending anime
  async getTrendingAnime(page: number = 1, perPage: number = 20): Promise<EnhancedAnimeResult> {
    return this.searchAnime({
      page,
      perPage,
      sort: 'TRENDING_DESC'
    });
  }

  // Get popular anime
  async getPopularAnime(page: number = 1, perPage: number = 20): Promise<EnhancedAnimeResult> {
    return this.searchAnime({
      page,
      perPage,
      sort: 'POPULARITY_DESC'
    });
  }

  // Get top rated anime
  async getTopRatedAnime(page: number = 1, perPage: number = 20): Promise<EnhancedAnimeResult> {
    return this.searchAnime({
      page,
      perPage,
      sort: 'SCORE_DESC'
    });
  }

  // Get seasonal anime
  async getSeasonalAnime(year: number, season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL', page: number = 1): Promise<EnhancedAnimeResult> {
    return this.searchAnime({
      year,
      season,
      page,
      perPage: 20,
      sort: 'POPULARITY_DESC'
    });
  }

  // Get anime by genre
  async getAnimeByGenre(genre: string, page: number = 1, perPage: number = 20): Promise<EnhancedAnimeResult> {
    return this.searchAnime({
      genre,
      page,
      perPage,
      sort: 'SCORE_DESC'
    });
  }

  // Get upcoming anime
  async getUpcomingAnime(page: number = 1, perPage: number = 20): Promise<EnhancedAnimeResult> {
    return this.searchAnime({
      status: 'NOT_YET_RELEASED',
      page,
      perPage,
      sort: 'POPULARITY_DESC'
    });
  }

  // Get currently airing anime
  async getAiringAnime(page: number = 1, perPage: number = 20): Promise<EnhancedAnimeResult> {
    return this.searchAnime({
      status: 'RELEASING',
      page,
      perPage,
      sort: 'POPULARITY_DESC'
    });
  }

  // Advanced search with multiple filters
  async advancedSearch(filters: {
    query?: string;
    genres?: string[];
    year?: number;
    season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
    format?: 'TV' | 'MOVIE' | 'OVA' | 'SPECIAL';
    status?: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED';
    minScore?: number;
    page?: number;
  }): Promise<EnhancedAnimeResult> {
    try {
      const query = `
        query ($page: Int, $search: String, $genreIn: [String], $year: Int, $season: MediaSeason, $format: MediaFormat, $status: MediaStatus, $averageScoreGreater: Int) {
          Page(page: $page, perPage: 20) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
            }
            media(
              search: $search, 
              genre_in: $genreIn, 
              seasonYear: $year, 
              season: $season, 
              format: $format, 
              status: $status, 
              averageScore_greater: $averageScoreGreater,
              type: ANIME,
              sort: SCORE_DESC
            ) {
              id
              title {
                romaji
                english
                native
              }
              description(asHtml: false)
              episodes
              averageScore
              genres
              coverImage {
                large
                medium
              }
              status
              season
              seasonYear
            }
          }
        }
      `;

      // Clean variables to avoid null values
      const variables: any = {
        page: filters.page || 1
      };
      
      if (filters.query) variables.search = filters.query;
      if (filters.genres && filters.genres.length > 0) variables.genreIn = filters.genres;
      if (filters.year) variables.year = filters.year;
      if (filters.season) variables.season = filters.season;
      if (filters.format) variables.format = filters.format;
      if (filters.status) variables.status = filters.status;
      if (filters.minScore) variables.averageScoreGreater = filters.minScore;

      const response = await axios.post(this.anilistEndpoint, {
        query,
        variables
      }, {
        headers: {
          'User-Agent': this.userAgent,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const pageData = response.data.data.Page;

      return {
        success: true,
        data: {
          anime: pageData.media,
          pageInfo: pageData.pageInfo
        },
        creator: this.creator
      };

    } catch (error) {
      return {
        success: false,
        error: 'Advanced search failed',
        creator: this.creator
      };
    }
  }

  // Get service status
  getStatus() {
    return {
      service: 'Enhanced Anime V2 API',
      version: '2.0.0',
      status: 'operational',
      features: [
        'AniList GraphQL Integration',
        'Advanced Search & Filtering',
        'Recommendations Engine',
        'Seasonal Anime',
        'Trending & Popular Lists',
        'Detailed Metadata',
        'External Links & Streaming'
      ],
      dataSources: ['AniList', 'MyAnimeList', 'TMDB'],
      creator: this.creator
    };
  }
}

export const animeEnhancedV2Service = new AnimeEnhancedV2Service();