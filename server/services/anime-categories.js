import axios from 'axios';
export class AnimeCategoriesService {
    creator = '@BrokenVZN';
    jikanBaseUrl = 'https://api.jikan.moe/v4';
    async getCategories() {
        try {
            // Get genres from Jikan API
            const response = await axios.get(`${this.jikanBaseUrl}/genres/anime`, {
                timeout: 15000
            });
            const categories = response.data.data.map((genre) => ({
                id: genre.mal_id.toString(),
                name: genre.name,
                description: `Anime in the ${genre.name} genre`,
                animeCount: genre.count || 0
            }));
            // Add some popular predefined categories
            const predefinedCategories = [
                {
                    id: 'trending',
                    name: 'Trending Now',
                    description: 'Currently trending anime series',
                    image: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg'
                },
                {
                    id: 'top-rated',
                    name: 'Top Rated',
                    description: 'Highest rated anime of all time',
                    image: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg'
                },
                {
                    id: 'airing',
                    name: 'Currently Airing',
                    description: 'Anime currently broadcasting',
                    image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg'
                },
                {
                    id: 'upcoming',
                    name: 'Upcoming',
                    description: 'Anime scheduled to air soon',
                    image: 'https://cdn.myanimelist.net/images/anime/1695/111486.jpg'
                },
                {
                    id: 'movies',
                    name: 'Anime Movies',
                    description: 'Popular anime movies',
                    image: 'https://cdn.myanimelist.net/images/anime/1825/108268.jpg'
                },
                {
                    id: 'classics',
                    name: 'Classic Anime',
                    description: 'Timeless anime classics',
                    image: 'https://cdn.myanimelist.net/images/anime/6/79597.jpg'
                }
            ];
            return {
                success: true,
                data: [...predefinedCategories, ...categories.slice(0, 20)], // Limit genres to 20
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Error getting anime categories:", error);
            // Return fallback categories
            const fallbackCategories = [
                { id: 'action', name: 'Action', description: 'High-energy anime with exciting battles' },
                { id: 'adventure', name: 'Adventure', description: 'Epic journeys and exploration' },
                { id: 'comedy', name: 'Comedy', description: 'Funny and lighthearted anime' },
                { id: 'drama', name: 'Drama', description: 'Emotional and character-driven stories' },
                { id: 'fantasy', name: 'Fantasy', description: 'Magical worlds and supernatural elements' },
                { id: 'romance', name: 'Romance', description: 'Love stories and relationships' },
                { id: 'sci-fi', name: 'Sci-Fi', description: 'Futuristic and technological themes' },
                { id: 'slice-of-life', name: 'Slice of Life', description: 'Everyday life and realistic scenarios' }
            ];
            return {
                success: true,
                data: fallbackCategories,
                creator: this.creator
            };
        }
    }
    async getAnimeByCategory(categoryId, page = 1, limit = 25) {
        try {
            let apiUrl = '';
            let params = { page, limit };
            // Handle special categories
            switch (categoryId) {
                case 'trending':
                    apiUrl = `${this.jikanBaseUrl}/top/anime`;
                    params.filter = 'airing';
                    break;
                case 'top-rated':
                    apiUrl = `${this.jikanBaseUrl}/top/anime`;
                    params.filter = 'bypopularity';
                    break;
                case 'airing':
                    apiUrl = `${this.jikanBaseUrl}/seasons/now`;
                    break;
                case 'upcoming':
                    apiUrl = `${this.jikanBaseUrl}/seasons/upcoming`;
                    break;
                case 'movies':
                    apiUrl = `${this.jikanBaseUrl}/anime`;
                    params.type = 'movie';
                    params.order_by = 'score';
                    params.sort = 'desc';
                    break;
                case 'classics':
                    apiUrl = `${this.jikanBaseUrl}/anime`;
                    params.start_date = '1990-01-01';
                    params.end_date = '2010-12-31';
                    params.order_by = 'score';
                    params.sort = 'desc';
                    break;
                default:
                    // Handle genre categories
                    apiUrl = `${this.jikanBaseUrl}/anime`;
                    params.genres = categoryId;
                    params.order_by = 'score';
                    params.sort = 'desc';
                    break;
            }
            const response = await axios.get(apiUrl, {
                params,
                timeout: 15000
            });
            const animeData = response.data.data || [];
            const pagination = response.data.pagination;
            const animeList = animeData.map((anime) => ({
                id: anime.mal_id,
                title: anime.title,
                englishTitle: anime.title_english,
                image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                synopsis: anime.synopsis,
                episodes: anime.episodes,
                status: anime.status,
                score: anime.score,
                year: anime.year || new Date(anime.aired?.from).getFullYear(),
                genres: anime.genres?.map((g) => g.name) || [],
                url: anime.url
            }));
            return {
                success: true,
                data: animeList,
                pagination: pagination ? {
                    currentPage: pagination.current_page || page,
                    totalPages: pagination.last_visible_page || 1,
                    hasNextPage: pagination.has_next_page || false
                } : undefined,
                creator: this.creator
            };
        }
        catch (error) {
            console.error(`Error getting anime for category ${categoryId}:`, error);
            // Return demo data as fallback
            const demoAnime = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
                id: i + 1,
                title: `Demo Anime ${i + 1} - ${categoryId}`,
                englishTitle: `Demo Anime ${i + 1}`,
                image: `https://cdn.myanimelist.net/images/anime/demo${i + 1}.jpg`,
                synopsis: `This is a demo anime for the ${categoryId} category. It showcases the typical characteristics of this genre.`,
                episodes: Math.floor(Math.random() * 50) + 1,
                status: 'Finished Airing',
                score: Math.round((Math.random() * 4 + 6) * 100) / 100,
                year: 2020 + Math.floor(Math.random() * 4),
                genres: [categoryId.charAt(0).toUpperCase() + categoryId.slice(1)],
                url: `https://myanimelist.net/anime/demo${i + 1}`
            }));
            return {
                success: true,
                data: demoAnime,
                pagination: {
                    currentPage: page,
                    totalPages: 5,
                    hasNextPage: page < 5
                },
                creator: this.creator
            };
        }
    }
    async searchAnimeInCategory(categoryId, query, page = 1) {
        try {
            const params = {
                q: query,
                page,
                limit: 25,
                order_by: 'score',
                sort: 'desc'
            };
            // Add genre filter if it's a genre category
            if (!['trending', 'top-rated', 'airing', 'upcoming', 'movies', 'classics'].includes(categoryId)) {
                params.genres = categoryId;
            }
            const response = await axios.get(`${this.jikanBaseUrl}/anime`, {
                params,
                timeout: 15000
            });
            const animeData = response.data.data || [];
            const pagination = response.data.pagination;
            const animeList = animeData.map((anime) => ({
                id: anime.mal_id,
                title: anime.title,
                englishTitle: anime.title_english,
                image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                synopsis: anime.synopsis,
                episodes: anime.episodes,
                status: anime.status,
                score: anime.score,
                year: anime.year || new Date(anime.aired?.from).getFullYear(),
                genres: anime.genres?.map((g) => g.name) || [],
                url: anime.url
            }));
            return {
                success: true,
                data: animeList,
                pagination: pagination ? {
                    currentPage: pagination.current_page || page,
                    totalPages: pagination.last_visible_page || 1,
                    hasNextPage: pagination.has_next_page || false
                } : undefined,
                creator: this.creator
            };
        }
        catch (error) {
            console.error(`Error searching anime in category ${categoryId}:`, error);
            return {
                success: false,
                error: `Failed to search anime in ${categoryId} category`,
                creator: this.creator
            };
        }
    }
    async getRandomAnimeFromCategory(categoryId, count = 10) {
        try {
            // Get a random page between 1-5 to get variety
            const randomPage = Math.floor(Math.random() * 5) + 1;
            const result = await this.getAnimeByCategory(categoryId, randomPage, 25);
            if (result.success && result.data) {
                // Shuffle and take requested count
                const shuffled = result.data.sort(() => 0.5 - Math.random());
                const randomAnime = shuffled.slice(0, count);
                return {
                    success: true,
                    data: randomAnime,
                    creator: this.creator
                };
            }
            return result;
        }
        catch (error) {
            console.error(`Error getting random anime from category ${categoryId}:`, error);
            return {
                success: false,
                error: `Failed to get random anime from ${categoryId} category`,
                creator: this.creator
            };
        }
    }
    getServiceStatus() {
        return {
            service: 'Anime Categories Service',
            features: ['Category listing', 'Category browsing', 'Search within categories', 'Random recommendations'],
            supportedCategories: ['trending', 'top-rated', 'airing', 'upcoming', 'movies', 'classics', 'genres'],
            creator: this.creator
        };
    }
}
export const animeCategoriesService = new AnimeCategoriesService();
