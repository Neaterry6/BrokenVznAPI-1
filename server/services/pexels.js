import axios from 'axios';
export class PexelsService {
    apiKey;
    baseUrl = 'https://api.pexels.com/v1';
    videoBaseUrl = 'https://api.pexels.com/videos';
    // Enhanced color palette
    supportedColors = [
        'red', 'orange', 'yellow', 'green', 'turquoise', 'blue', 'violet', 'pink',
        'brown', 'black', 'gray', 'white'
    ];
    // Popular categories for curated content
    categories = [
        'nature', 'people', 'technology', 'animals', 'food', 'travel', 'business',
        'fashion', 'health', 'sports', 'architecture', 'abstract', 'cars', 'city',
        'flowers', 'love', 'music', 'space', 'art', 'education', 'family', 'fitness',
        'happiness', 'landscape', 'lifestyle', 'ocean', 'portrait', 'sunset', 'winter'
    ];
    constructor() {
        this.apiKey = process.env.PEXELS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('PEXELS_API_KEY not found. Pexels service will use demo responses.');
        }
    }
    async searchPhotos(request) {
        try {
            const { query = 'nature', orientation, size = 'medium', color, locale = 'en-US', page = 1, per_page = 15 } = request;
            if (per_page > 80) {
                return {
                    success: false,
                    error: 'Maximum 80 photos per page allowed'
                };
            }
            if (color && !this.supportedColors.includes(color.toLowerCase())) {
                return {
                    success: false,
                    error: `Unsupported color. Supported colors: ${this.supportedColors.join(', ')}`
                };
            }
            // Demo response if no API key
            if (!this.apiKey) {
                return this.getDemoPhotosResponse(query, per_page);
            }
            const params = {
                query,
                page,
                per_page,
                locale
            };
            if (orientation)
                params.orientation = orientation;
            if (size)
                params.size = size;
            if (color)
                params.color = color;
            const response = await axios.get(`${this.baseUrl}/search`, {
                params,
                headers: {
                    'Authorization': this.apiKey
                },
                timeout: 10000
            });
            return {
                success: true,
                photos: response.data.photos,
                total_results: response.data.total_results,
                page: response.data.page,
                per_page: response.data.per_page,
                next_page: response.data.next_page,
                prev_page: response.data.prev_page
            };
        }
        catch (error) {
            console.error('Pexels photos error:', error);
            return this.handleError(error);
        }
    }
    async searchVideos(request) {
        try {
            const { query = 'nature', orientation, size = 'medium', locale = 'en-US', page = 1, per_page = 15 } = request;
            if (per_page > 80) {
                return {
                    success: false,
                    error: 'Maximum 80 videos per page allowed'
                };
            }
            // Demo response if no API key
            if (!this.apiKey) {
                return this.getDemoVideosResponse(query, per_page);
            }
            const params = {
                query,
                page,
                per_page,
                locale
            };
            if (orientation)
                params.orientation = orientation;
            if (size)
                params.size = size;
            const response = await axios.get(`${this.videoBaseUrl}/search`, {
                params,
                headers: {
                    'Authorization': this.apiKey
                },
                timeout: 10000
            });
            return {
                success: true,
                videos: response.data.videos,
                total_results: response.data.total_results,
                page: response.data.page,
                per_page: response.data.per_page,
                next_page: response.data.next_page,
                prev_page: response.data.prev_page
            };
        }
        catch (error) {
            console.error('Pexels videos error:', error);
            return this.handleError(error);
        }
    }
    async getCuratedPhotos(page = 1, per_page = 15) {
        try {
            if (per_page > 80) {
                return {
                    success: false,
                    error: 'Maximum 80 photos per page allowed'
                };
            }
            // Demo response if no API key
            if (!this.apiKey) {
                return this.getDemoPhotosResponse('curated', per_page);
            }
            const response = await axios.get(`${this.baseUrl}/curated`, {
                params: { page, per_page },
                headers: {
                    'Authorization': this.apiKey
                },
                timeout: 10000
            });
            return {
                success: true,
                photos: response.data.photos,
                total_results: response.data.total_results || 1000000, // Curated photos don't return total
                page: response.data.page,
                per_page: response.data.per_page,
                next_page: response.data.next_page,
                prev_page: response.data.prev_page
            };
        }
        catch (error) {
            console.error('Pexels curated error:', error);
            return this.handleError(error);
        }
    }
    async getPopularVideos(page = 1, per_page = 15) {
        try {
            if (per_page > 80) {
                return {
                    success: false,
                    error: 'Maximum 80 videos per page allowed'
                };
            }
            // Demo response if no API key
            if (!this.apiKey) {
                return this.getDemoVideosResponse('popular', per_page);
            }
            const response = await axios.get(`${this.videoBaseUrl}/popular`, {
                params: { page, per_page },
                headers: {
                    'Authorization': this.apiKey
                },
                timeout: 10000
            });
            return {
                success: true,
                videos: response.data.videos,
                total_results: response.data.total_results || 1000000,
                page: response.data.page,
                per_page: response.data.per_page,
                next_page: response.data.next_page,
                prev_page: response.data.prev_page
            };
        }
        catch (error) {
            console.error('Pexels popular videos error:', error);
            return this.handleError(error);
        }
    }
    async getPhotoById(id) {
        try {
            if (!this.apiKey) {
                return {
                    success: false,
                    error: 'API key required for photo details'
                };
            }
            const response = await axios.get(`${this.baseUrl}/photos/${id}`, {
                headers: {
                    'Authorization': this.apiKey
                },
                timeout: 10000
            });
            return {
                success: true,
                photos: [response.data]
            };
        }
        catch (error) {
            console.error('Pexels photo by ID error:', error);
            return this.handleError(error);
        }
    }
    async getVideoById(id) {
        try {
            if (!this.apiKey) {
                return {
                    success: false,
                    error: 'API key required for video details'
                };
            }
            const response = await axios.get(`${this.videoBaseUrl}/videos/${id}`, {
                headers: {
                    'Authorization': this.apiKey
                },
                timeout: 10000
            });
            return {
                success: true,
                videos: [response.data]
            };
        }
        catch (error) {
            console.error('Pexels video by ID error:', error);
            return this.handleError(error);
        }
    }
    // Get random photos from categories
    async getRandomPhotos(category, count = 10) {
        const randomCategory = category || this.categories[Math.floor(Math.random() * this.categories.length)];
        const randomPage = Math.floor(Math.random() * 10) + 1;
        return this.searchPhotos({
            query: randomCategory,
            page: randomPage,
            per_page: count
        });
    }
    getDemoPhotosResponse(query, per_page) {
        const demoPhotos = Array.from({ length: Math.min(per_page, 5) }, (_, i) => ({
            id: 1000 + i,
            width: 1920,
            height: 1280,
            url: `https://via.placeholder.com/1920x1280/4A90E2/FFFFFF?text=Demo+Photo+${i + 1}`,
            photographer: 'Demo Photographer',
            photographer_url: 'https://example.com',
            photographer_id: 1000,
            avg_color: '#4A90E2',
            src: {
                original: `https://via.placeholder.com/1920x1280/4A90E2/FFFFFF?text=Demo+Photo+${i + 1}`,
                large2x: `https://via.placeholder.com/1920x1280/4A90E2/FFFFFF?text=Demo+Photo+${i + 1}`,
                large: `https://via.placeholder.com/1200x800/4A90E2/FFFFFF?text=Demo+Photo+${i + 1}`,
                medium: `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Demo+Photo+${i + 1}`,
                small: `https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Demo+Photo+${i + 1}`,
                portrait: `https://via.placeholder.com/600x800/4A90E2/FFFFFF?text=Demo+Photo+${i + 1}`,
                landscape: `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Demo+Photo+${i + 1}`,
                tiny: `https://via.placeholder.com/200x150/4A90E2/FFFFFF?text=Demo+Photo+${i + 1}`
            },
            liked: false,
            alt: `Demo photo ${i + 1} for "${query}"`
        }));
        return {
            success: true,
            photos: demoPhotos,
            total_results: 1000,
            page: 1,
            per_page: per_page
        };
    }
    getDemoVideosResponse(query, per_page) {
        const demoVideos = Array.from({ length: Math.min(per_page, 3) }, (_, i) => ({
            id: 2000 + i,
            width: 1920,
            height: 1080,
            duration: 30 + i * 10,
            full_res: undefined,
            tags: [query, 'demo', 'video'],
            url: `https://example.com/video/${2000 + i}`,
            image: `https://via.placeholder.com/1920x1080/E74C3C/FFFFFF?text=Demo+Video+${i + 1}`,
            avg_color: '#E74C3C',
            user: {
                id: 2000,
                name: 'Demo Creator',
                url: 'https://example.com'
            },
            video_files: [{
                    id: 3000 + i,
                    quality: 'hd',
                    file_type: 'video/mp4',
                    width: 1920,
                    height: 1080,
                    link: `https://example.com/demo-video-${i + 1}.mp4`
                }],
            video_pictures: [{
                    id: 4000 + i,
                    picture: `https://via.placeholder.com/1920x1080/E74C3C/FFFFFF?text=Demo+Video+${i + 1}`,
                    nr: 0
                }]
        }));
        return {
            success: true,
            videos: demoVideos,
            total_results: 500,
            page: 1,
            per_page: per_page
        };
    }
    handleError(error) {
        if (error.code === 'ECONNABORTED') {
            return {
                success: false,
                error: 'Request timed out. Please try again.'
            };
        }
        if (error.response?.status === 401) {
            return {
                success: false,
                error: 'Invalid Pexels API key'
            };
        }
        if (error.response?.status === 429) {
            return {
                success: false,
                error: 'Rate limit exceeded. Please try again later.'
            };
        }
        if (error.response?.status === 400) {
            return {
                success: false,
                error: 'Invalid search parameters'
            };
        }
        return {
            success: false,
            error: 'Failed to fetch images/videos from Pexels'
        };
    }
    // Get service capabilities
    getServiceInfo() {
        return {
            hasApiKey: !!this.apiKey,
            supportedColors: this.supportedColors,
            categories: this.categories,
            orientations: ['landscape', 'portrait', 'square'],
            sizes: ['large', 'medium', 'small'],
            maxPerPage: 80,
            rateLimit: this.apiKey ? '200 requests/hour' : 'Demo mode'
        };
    }
}
export const pexelsService = new PexelsService();
