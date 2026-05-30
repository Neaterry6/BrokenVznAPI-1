import axios from 'axios';
export class UnsplashService {
    apiKey;
    baseUrl = 'https://api.unsplash.com';
    creator = '@BrokenVZN';
    constructor() {
        this.apiKey = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_API_KEY;
        if (!this.apiKey) {
            console.warn("UNSPLASH_ACCESS_KEY not found. Unsplash service will use demo responses.");
        }
    }
    async searchPhotos(request) {
        try {
            const { query = 'nature', orientation, size, color, page = 1, per_page = 15 } = request;
            if (per_page > 30) {
                return {
                    success: false,
                    error: 'Maximum 30 photos per page allowed',
                    creator: this.creator
                };
            }
            // Demo response if no API key
            if (!this.apiKey) {
                const demoPhotos = Array.from({ length: per_page }, (_, i) => ({
                    id: `demo-photo-${i + 1}`,
                    urls: {
                        raw: `https://picsum.photos/seed/${query}${i}/1920/1080`,
                        full: `https://picsum.photos/seed/${query}${i}/1920/1080`,
                        regular: `https://picsum.photos/seed/${query}${i}/1080/720`,
                        small: `https://picsum.photos/seed/${query}${i}/400/300`,
                        thumb: `https://picsum.photos/seed/${query}${i}/200/150`
                    },
                    user: {
                        name: 'Demo User',
                        username: 'demouser'
                    },
                    description: `Demo ${query} photo ${i + 1}`,
                    alt_description: `Beautiful ${query} image`,
                    width: 1920,
                    height: 1080,
                    color: '#ffffff',
                    likes: Math.floor(Math.random() * 1000)
                }));
                return {
                    success: true,
                    data: demoPhotos,
                    total: 1000,
                    total_pages: Math.ceil(1000 / per_page),
                    creator: this.creator
                };
            }
            // Build request parameters
            const params = {
                query,
                page,
                per_page
            };
            if (orientation)
                params.orientation = orientation;
            if (color)
                params.color = color;
            // Make API request
            const response = await axios.get(`${this.baseUrl}/search/photos`, {
                params,
                headers: {
                    'Authorization': `Client-ID ${this.apiKey}`
                },
                timeout: 10000
            });
            const photos = response.data.results.map((photo) => ({
                id: photo.id,
                urls: photo.urls,
                user: {
                    name: photo.user.name,
                    username: photo.user.username
                },
                description: photo.description,
                alt_description: photo.alt_description,
                width: photo.width,
                height: photo.height,
                color: photo.color,
                likes: photo.likes
            }));
            return {
                success: true,
                data: photos,
                total: response.data.total,
                total_pages: response.data.total_pages,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Unsplash search error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to search Unsplash photos',
                creator: this.creator
            };
        }
    }
    async getRandomPhoto(query) {
        try {
            // Demo response if no API key
            if (!this.apiKey) {
                const demoPhoto = {
                    id: 'demo-random-photo',
                    urls: {
                        raw: `https://picsum.photos/seed/${query || 'random'}/1920/1080`,
                        full: `https://picsum.photos/seed/${query || 'random'}/1920/1080`,
                        regular: `https://picsum.photos/seed/${query || 'random'}/1080/720`,
                        small: `https://picsum.photos/seed/${query || 'random'}/400/300`,
                        thumb: `https://picsum.photos/seed/${query || 'random'}/200/150`
                    },
                    user: {
                        name: 'Demo User',
                        username: 'demouser'
                    },
                    description: `Random ${query || 'photo'}`,
                    alt_description: `Beautiful random ${query || 'image'}`,
                    width: 1920,
                    height: 1080,
                    color: '#ffffff',
                    likes: Math.floor(Math.random() * 1000)
                };
                return {
                    success: true,
                    data: [demoPhoto],
                    creator: this.creator
                };
            }
            // Build request parameters
            const params = {};
            if (query)
                params.query = query;
            // Make API request
            const response = await axios.get(`${this.baseUrl}/photos/random`, {
                params,
                headers: {
                    'Authorization': `Client-ID ${this.apiKey}`
                },
                timeout: 10000
            });
            const photo = {
                id: response.data.id,
                urls: response.data.urls,
                user: {
                    name: response.data.user.name,
                    username: response.data.user.username
                },
                description: response.data.description,
                alt_description: response.data.alt_description,
                width: response.data.width,
                height: response.data.height,
                color: response.data.color,
                likes: response.data.likes
            };
            return {
                success: true,
                data: [photo],
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Unsplash random photo error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get random Unsplash photo',
                creator: this.creator
            };
        }
    }
    // Get service status
    getStatus() {
        return {
            hasApiKey: !!this.apiKey,
            service: 'Unsplash',
            baseUrl: this.baseUrl
        };
    }
}
export const unsplashService = new UnsplashService();
