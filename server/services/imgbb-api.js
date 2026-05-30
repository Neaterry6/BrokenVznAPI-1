import axios from 'axios';
import FormData from 'form-data';
export class ImgBBService {
    creator = '@BrokenVZN';
    apiKey;
    baseUrl = 'https://api.imgbb.com/1';
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    constructor() {
        this.apiKey = process.env.IMGBB_API_KEY || '';
        if (!this.apiKey) {
            console.warn('IMGBB_API_KEY not found in environment variables');
        }
    }
    async uploadImage(request) {
        try {
            if (!this.apiKey) {
                return {
                    success: false,
                    error: 'ImgBB API key not configured',
                    creator: this.creator
                };
            }
            const { image, name, title, description, type = 'file' } = request;
            if (!image) {
                return {
                    success: false,
                    error: 'Image is required',
                    creator: this.creator
                };
            }
            const formData = new FormData();
            formData.append('key', this.apiKey);
            if (type === 'base64' && typeof image === 'string') {
                // Remove data:image/... prefix if present
                const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
                formData.append('image', base64Data);
            }
            else if (type === 'url' && typeof image === 'string') {
                formData.append('image', image);
            }
            else {
                formData.append('image', image);
            }
            if (name)
                formData.append('name', name);
            if (title)
                formData.append('title', title);
            if (description)
                formData.append('description', description);
            const response = await axios.post(`${this.baseUrl}/upload`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'User-Agent': this.userAgent
                },
                timeout: 30000,
                maxContentLength: 32 * 1024 * 1024, // 32MB limit
            });
            if (response.data && response.data.success && response.data.data) {
                const imgData = response.data.data;
                return {
                    success: true,
                    data: {
                        id: imgData.id,
                        title: imgData.title || title,
                        url_viewer: imgData.url_viewer,
                        url: imgData.url,
                        display_url: imgData.display_url,
                        width: imgData.width,
                        height: imgData.height,
                        size: imgData.size,
                        time: imgData.time,
                        expiration: imgData.expiration,
                        image: imgData.image,
                        thumb: imgData.thumb,
                        medium: imgData.medium,
                        delete_url: imgData.delete_url
                    },
                    creator: this.creator
                };
            }
            return {
                success: false,
                error: 'Upload failed - invalid response from ImgBB',
                creator: this.creator
            };
        }
        catch (error) {
            console.error('ImgBB upload error:', error);
            let errorMessage = 'Upload failed';
            if (error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            }
            else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            else if (error.message) {
                errorMessage = error.message;
            }
            return {
                success: false,
                error: errorMessage,
                creator: this.creator
            };
        }
    }
    async getAccountInfo() {
        try {
            if (!this.apiKey) {
                return {
                    success: false,
                    error: 'ImgBB API key not configured',
                    creator: this.creator
                };
            }
            // ImgBB doesn't have a dedicated account info endpoint in free plan
            // So we'll return service information instead
            return {
                success: true,
                data: {
                    title: 'ImgBB Service Status',
                    display_url: 'https://api.imgbb.com',
                    id: 'service_info'
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('ImgBB account info error:', error);
            return {
                success: false,
                error: `Account info failed: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    getStatus() {
        return {
            service: 'ImgBB API',
            version: '1.0.0',
            status: this.apiKey ? 'operational' : 'api_key_missing',
            provider: 'ImgBB',
            features: [
                'Image upload (file, base64, URL)',
                'Auto thumbnails and different sizes',
                'Direct image URLs',
                'Image management',
                'Delete URLs'
            ],
            limits: {
                fileSize: '32MB',
                dailyUploads: 'Depends on plan',
                apiCalls: 'Rate limited'
            },
            authenticated: !!this.apiKey,
            creator: this.creator
        };
    }
}
export const imgbbService = new ImgBBService();
