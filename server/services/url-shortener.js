import { storage } from "../storage";
export class UrlShortenerService {
    baseUrl = process.env.BASE_URL || 'https://api.brokenvzn.com';
    async shortenUrl(request) {
        try {
            const { url, customCode, userId } = request;
            if (!url || !this.isValidUrl(url)) {
                return {
                    success: false,
                    error: 'Invalid URL provided'
                };
            }
            // Check if custom code is already taken
            if (customCode) {
                const existing = await storage.getUrlByShortCode(customCode);
                if (existing) {
                    return {
                        success: false,
                        error: 'Custom short code is already taken'
                    };
                }
            }
            const shortUrlData = await storage.createShortUrl({
                originalUrl: url,
                shortCode: customCode,
                userId: userId || null
            });
            return {
                success: true,
                shortUrl: `${this.baseUrl}/s/${shortUrlData.shortCode}`,
                shortCode: shortUrlData.shortCode,
                originalUrl: url
            };
        }
        catch (error) {
            console.error('URL shortening error:', error);
            return {
                success: false,
                error: 'Failed to shorten URL'
            };
        }
    }
    async expandUrl(shortCode) {
        try {
            const urlData = await storage.getUrlByShortCode(shortCode);
            if (urlData) {
                await storage.incrementUrlClicks(shortCode);
                return urlData.originalUrl;
            }
            return null;
        }
        catch (error) {
            console.error('URL expansion error:', error);
            return null;
        }
    }
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        }
        catch (_) {
            return false;
        }
    }
}
export const urlShortenerService = new UrlShortenerService();
