import axios from 'axios';
export class MangaService {
    creator = '@BrokenVZN';
    jikanBaseUrl = 'https://api.jikan.moe/v4';
    rateLimit = 3; // Jikan API rate limit: 3 requests per second
    async delay(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async searchManga(request) {
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
            const mangaList = response.data.data.map((manga) => {
                const authors = manga.authors?.map((author) => author.name).join(', ') || 'Unknown';
                const genres = manga.genres?.map((genre) => genre.name) || [];
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
        }
        catch (error) {
            console.error("Error searching manga:", error);
            return {
                success: false,
                error: "Failed to search manga",
                creator: this.creator
            };
        }
    }
    async getMangaInfo(mangaId) {
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
            const authors = manga.authors?.map((author) => author.name).join(', ') || 'Unknown';
            const genres = manga.genres?.map((genre) => genre.name) || [];
            // Get characters info
            let characters = [];
            try {
                const charactersResponse = await axios.get(`${this.jikanBaseUrl}/manga/${malId}/characters`, {
                    timeout: 10000
                });
                await this.delay(350);
                characters = charactersResponse.data?.data?.slice(0, 10) || []; // Top 10 characters
            }
            catch (error) {
                console.log("Could not fetch characters:", error);
            }
            const mangaInfo = {
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
                chapters: characters.map((char, index) => ({
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
        }
        catch (error) {
            console.error("Error getting manga info:", error);
            return {
                success: false,
                error: "Failed to get manga information",
                creator: this.creator
            };
        }
    }
    async getPopularManga(page = 1) {
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
            const mangaList = response.data.data.map((manga) => {
                const authors = manga.authors?.map((author) => author.name).join(', ') || 'Unknown';
                const genres = manga.genres?.map((genre) => genre.name) || [];
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
        }
        catch (error) {
            console.error("Error getting popular manga:", error);
            return {
                success: false,
                error: "Failed to get popular manga",
                creator: this.creator
            };
        }
    }
    async getLatestManga(page = 1) {
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
            const mangaList = response.data.data.map((manga) => {
                const authors = manga.authors?.map((author) => author.name).join(', ') || 'Unknown';
                const genres = manga.genres?.map((genre) => genre.name) || [];
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
        }
        catch (error) {
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
