import YTDlpWrap from 'yt-dlp-wrap';
export class VideoDownloaderService {
    creator = '@BrokenVZN';
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
    ytDlpWrap; // Allow null to handle initialization failure
    constructor() {
        try {
            this.ytDlpWrap = new YTDlpWrap();
            console.log('YTDlpWrap initialized successfully in VideoDownloaderService');
        }
        catch (error) {
            console.error('Failed to initialize YTDlpWrap in VideoDownloaderService:', error.message);
            this.ytDlpWrap = null;
        }
    }
    // Legal disclaimer
    getLegalDisclaimer() {
        return `
    ⚠️ LEGAL DISCLAIMER ⚠️
    This service is intended for legitimate, copyright-free content only.
    Users are responsible for ensuring they have proper rights to download content.
    Downloading copyrighted material without permission may violate terms of service and copyright laws.
    `;
    }
    // Format duration from seconds to HH:MM:SS or MM:SS
    formatDuration(seconds) {
        if (!seconds || isNaN(seconds))
            return '0:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    // Get video metadata using yt-dlp
    async getVideoData(url) {
        try {
            if (!this.ytDlpWrap) {
                console.error('yt-dlp-wrap not initialized for getVideoData');
                return null;
            }
            const args = [
                '--quiet',
                '--skip-download',
                '--dump-json',
                url
            ];
            const output = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });
            const data = JSON.parse(output);
            if (!data.id || !data.title) {
                return null;
            }
            return {
                id: data.id,
                title: data.title,
                url: data.webpage_url || url,
                thumbnail: data.thumbnail || '',
                duration: this.formatDuration(data.duration || 0),
                views: data.view_count || 0,
                description: data.description || '',
                tags: data.tags || [],
                downloadUrl: await this.getDownloadUrl(url)
            };
        }
        catch (error) {
            console.error('[yt-dlp error]', error.message);
            return null;
        }
    }
    // Get download URL using yt-dlp
    async getDownloadUrl(url) {
        try {
            if (!this.ytDlpWrap) {
                console.error('yt-dlp-wrap not initialized for getDownloadUrl');
                return null;
            }
            const args = [
                '--quiet',
                '--get-url',
                '--format', 'best[ext=mp4]/best',
                url
            ];
            const downloadUrl = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });
            return downloadUrl.trim();
        }
        catch (error) {
            console.error('Failed to get download URL:', error.message);
            return null;
        }
    }
    // Extract video info from any supported website
    async extractVideoInfo(url) {
        try {
            if (!url || typeof url !== 'string') {
                return {
                    success: false,
                    error: 'Valid URL is required',
                    creator: this.creator
                };
            }
            if (!this.ytDlpWrap) {
                return {
                    success: false,
                    error: 'yt-dlp-wrap not initialized',
                    creator: this.creator
                };
            }
            // Validate URL
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();
            const ip = urlObj.hostname;
            // Block private/internal networks to prevent SSRF
            const privateIPPatterns = [
                /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./,
                /^169\.254\./, /^::1$/, /^fc00:/, /^fe80:/
            ];
            if (privateIPPatterns.some(pattern => pattern.test(ip)) ||
                ['localhost', '0.0.0.0'].includes(hostname)) {
                return {
                    success: false,
                    error: 'Access to private/internal networks is not allowed for security reasons.',
                    creator: this.creator
                };
            }
            // Fetch video metadata using yt-dlp
            const videoInfo = await this.getVideoData(url);
            if (!videoInfo) {
                return {
                    success: false,
                    error: 'Unable to extract video info. The URL may not be supported or the video is unavailable.',
                    creator: this.creator
                };
            }
            return {
                success: true,
                data: {
                    video: videoInfo,
                    message: `Video info extracted. ${this.getLegalDisclaimer()}`
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Video extraction error:', error.message);
            return {
                success: false,
                error: `Failed to extract video info: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Get video metadata for specific platforms (backward compatibility)
    async getVideoMetadata(platform, videoId) {
        try {
            if (!this.ytDlpWrap) {
                return {
                    success: false,
                    error: 'yt-dlp-wrap not initialized',
                    creator: this.creator
                };
            }
            let url;
            switch (platform.toLowerCase()) {
                case 'youtube':
                    url = `https://www.youtube.com/watch?v=${videoId}`;
                    break;
                case 'vimeo':
                    url = `https://vimeo.com/${videoId}`;
                    break;
                case 'dailymotion':
                    url = `https://www.dailymotion.com/video/${videoId}`;
                    break;
                default:
                    return {
                        success: false,
                        error: `Platform '${platform}' is not supported. Try using extractVideoInfo with a direct URL.`,
                        creator: this.creator
                    };
            }
            return await this.extractVideoInfo(url);
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get metadata: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Get service status
    getStatus() {
        return {
            service: 'Video Downloader API',
            version: '1.1.0',
            status: this.ytDlpWrap ? 'operational' : 'limited (yt-dlp not initialized)',
            supportedPlatforms: 'YouTube, Vimeo, Dailymotion, and 1000+ others via yt-dlp',
            features: [
                'Video Metadata Extraction',
                'Download URL Generation',
                'Universal Platform Support',
                'Legal Content Only'
            ],
            disclaimer: this.getLegalDisclaimer(),
            creator: this.creator
        };
    }
}
export const videoDownloaderService = new VideoDownloaderService();
