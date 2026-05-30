import axios from 'axios';
import * as cheerio from 'cheerio';
export class AnimeEnhancedService {
    creator = '@BrokenVZN';
    nyaaBaseUrl = 'https://nyaa.si';
    anilistGraphQL = 'https://graphql.anilist.co';
    // Search for anime torrents on Nyaa
    async searchTorrents(query, category, sort) {
        try {
            const params = new URLSearchParams({
                q: query,
                c: category || '1_2', // Anime - English-translated
                s: sort || 'seeders',
                o: 'desc'
            });
            const response = await axios.get(`${this.nyaaBaseUrl}/?${params}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const torrents = [];
            $('tr').each((i, element) => {
                const $row = $(element);
                const titleElement = $row.find('td:nth-child(2) a:not([href*="magnet"])').last();
                const title = titleElement.text().trim();
                if (title && i > 0) { // Skip header row
                    const size = $row.find('td:nth-child(4)').text().trim();
                    const seeders = parseInt($row.find('td:nth-child(6)').text()) || 0;
                    const leechers = parseInt($row.find('td:nth-child(7)').text()) || 0;
                    const magnetLink = $row.find('a[href^="magnet:"]').attr('href') || '';
                    const uploadDate = $row.find('td:nth-child(5)').text().trim();
                    const trusted = $row.find('.text-success').length > 0;
                    const category = $row.find('td:nth-child(1) a').attr('title') || 'Unknown';
                    if (title && magnetLink) {
                        torrents.push({
                            title,
                            size,
                            seeders,
                            leechers,
                            magnet: magnetLink,
                            category,
                            uploadDate,
                            trusted
                        });
                    }
                }
            });
            return {
                success: true,
                data: {
                    torrents: torrents.slice(0, 50), // Limit to 50 results
                    totalFound: torrents.length,
                    searchQuery: query
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Torrent search error:', error);
            return {
                success: false,
                error: 'Failed to search torrents',
                creator: this.creator
            };
        }
    }
    // Get batch download options for anime seasons
    async getBatchDownloadOptions(request) {
        try {
            const { animeTitle, season, quality = '1080p', includeSpecials = false, downloadType } = request;
            let searchQuery = animeTitle;
            if (season) {
                searchQuery += ` season ${season}`;
            }
            searchQuery += ` ${quality} batch`;
            if (downloadType === 'torrent') {
                // Search for batch torrents
                const torrentResults = await this.searchTorrents(searchQuery, '1_2', 'seeders');
                if (torrentResults.success && torrentResults.data) {
                    // Filter for batch torrents (look for keywords like "batch", "complete", "season")
                    const batchTorrents = torrentResults.data.torrents.filter((torrent) => {
                        const title = torrent.title.toLowerCase();
                        return title.includes('batch') ||
                            title.includes('complete') ||
                            title.includes('season') ||
                            title.includes('全話') || // Japanese for "all episodes"
                            title.includes('collection');
                    });
                    return {
                        success: true,
                        data: {
                            downloadType: 'torrent',
                            batchOptions: batchTorrents,
                            animeTitle,
                            season,
                            quality,
                            includeSpecials
                        },
                        creator: this.creator
                    };
                }
            }
            // Fallback for direct download options (placeholder for now)
            return {
                success: true,
                data: {
                    downloadType: 'direct',
                    message: 'Direct batch download not implemented yet. Use torrent option.',
                    animeTitle,
                    season,
                    quality
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Batch download error:', error);
            return {
                success: false,
                error: 'Failed to get batch download options',
                creator: this.creator
            };
        }
    }
    // Enhanced anime metadata using AniList GraphQL
    async getEnhancedMetadata(animeTitle) {
        try {
            const query = `
        query ($search: String) {
          Media (search: $search, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            description
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            episodes
            duration
            status
            genres
            averageScore
            popularity
            favourites
            studios {
              nodes {
                name
              }
            }
            trailer {
              id
              site
            }
            coverImage {
              large
              medium
            }
            bannerImage
            tags {
              name
              description
              rank
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
                  type
                }
              }
            }
            recommendations {
              nodes {
                mediaRecommendation {
                  id
                  title {
                    romaji
                    english
                  }
                  coverImage {
                    medium
                  }
                  averageScore
                }
              }
            }
          }
        }
      `;
            const variables = {
                search: animeTitle
            };
            const response = await axios.post(this.anilistGraphQL, {
                query,
                variables
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });
            if (response.data.data && response.data.data.Media) {
                const anime = response.data.data.Media;
                return {
                    success: true,
                    data: {
                        id: anime.id,
                        title: anime.title,
                        description: anime.description,
                        startDate: anime.startDate,
                        endDate: anime.endDate,
                        season: anime.season,
                        seasonYear: anime.seasonYear,
                        episodes: anime.episodes,
                        duration: anime.duration,
                        status: anime.status,
                        genres: anime.genres,
                        averageScore: anime.averageScore,
                        popularity: anime.popularity,
                        favourites: anime.favourites,
                        studios: anime.studios?.nodes?.map((studio) => studio.name) || [],
                        trailer: anime.trailer,
                        coverImage: anime.coverImage,
                        bannerImage: anime.bannerImage,
                        tags: anime.tags?.slice(0, 10) || [], // Limit tags
                        relations: anime.relations?.edges?.slice(0, 5) || [], // Limit relations
                        recommendations: anime.recommendations?.nodes?.slice(0, 10)?.map((rec) => rec.mediaRecommendation) || []
                    },
                    creator: this.creator
                };
            }
            return {
                success: false,
                error: 'Anime not found in AniList database',
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Enhanced metadata error:', error);
            return {
                success: false,
                error: 'Failed to get enhanced metadata',
                creator: this.creator
            };
        }
    }
    // Get anime scheduling information
    async getAnimeSchedule(day) {
        try {
            const query = `
        query ($page: Int, $perPage: Int, $weekStart: Int, $weekEnd: Int) {
          Page (page: $page, perPage: $perPage) {
            media (status: RELEASING, sort: POPULARITY_DESC, airingAt_greater: $weekStart, airingAt_lesser: $weekEnd) {
              id
              title {
                romaji
                english
              }
              coverImage {
                medium
              }
              nextAiringEpisode {
                episode
                airingAt
                timeUntilAiring
              }
              status
              episodes
              genres
              averageScore
            }
          }
        }
      `;
            const now = Math.floor(Date.now() / 1000);
            const oneDay = 24 * 60 * 60;
            const weekStart = now;
            const weekEnd = now + (7 * oneDay);
            const variables = {
                page: 1,
                perPage: 50,
                weekStart,
                weekEnd
            };
            const response = await axios.post(this.anilistGraphQL, {
                query,
                variables
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });
            if (response.data.data) {
                return {
                    success: true,
                    data: {
                        schedule: response.data.data.Page.media,
                        generatedAt: new Date().toISOString()
                    },
                    creator: this.creator
                };
            }
            return {
                success: false,
                error: 'Failed to get anime schedule',
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Schedule error:', error);
            return {
                success: false,
                error: 'Failed to get anime schedule',
                creator: this.creator
            };
        }
    }
    // Placeholder for progress tracking (would need database integration)
    getWatchProgress(userId) {
        return {
            success: true,
            data: {
                message: 'Progress tracking requires user authentication and database integration',
                userId,
                note: 'This feature can be implemented with user accounts and database storage'
            },
            creator: this.creator
        };
    }
    // Get trending anime from multiple sources
    async getTrendingAnime() {
        try {
            const query = `
        query {
          trending: Page(page: 1, perPage: 20) {
            media(sort: TRENDING_DESC, type: ANIME) {
              id
              title {
                romaji
                english
              }
              coverImage {
                large
                medium
              }
              bannerImage
              averageScore
              popularity
              genres
              status
              episodes
              season
              seasonYear
              description
            }
          }
          popular: Page(page: 1, perPage: 20) {
            media(sort: POPULARITY_DESC, type: ANIME) {
              id
              title {
                romaji
                english
              }
              coverImage {
                medium
              }
              averageScore
              popularity
            }
          }
        }
      `;
            const response = await axios.post(this.anilistGraphQL, {
                query
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });
            if (response.data.data) {
                return {
                    success: true,
                    data: {
                        trending: response.data.data.trending.media,
                        popular: response.data.data.popular.media,
                        lastUpdated: new Date().toISOString()
                    },
                    creator: this.creator
                };
            }
            return {
                success: false,
                error: 'Failed to get trending anime',
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Trending anime error:', error);
            return {
                success: false,
                error: 'Failed to get trending anime',
                creator: this.creator
            };
        }
    }
}
export const animeEnhancedService = new AnimeEnhancedService();
