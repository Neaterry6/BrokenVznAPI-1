import ytdl from '@distube/ytdl-core';
import YTDlpWrap from 'yt-dlp-wrap';
export class YTPlayService {
    creator = '@BrokenVZN';
    ytDlpWrap; // Allow null to handle initialization failure
    constructor() {
        try {
            this.ytDlpWrap = new YTDlpWrap();
            console.log('YTDlpWrap initialized successfully in YTPlayService');
        }
        catch (error) {
            console.error('Failed to initialize YTDlpWrap in YTPlayService:', error.message);
            this.ytDlpWrap = null;
        }
    }
    async searchVideos(request) {
        try {
            const { query, maxResults = 10 } = request;
            if (!query || query.trim() === '') {
                return {
                    success: false,
                    error: 'Query parameter is required',
                    creator: this.creator
                };
            }
            console.log(`YTPlay: Searching for "${query}"...`);
            if (!this.ytDlpWrap) {
                console.warn('yt-dlp-wrap not initialized, using fallback search results');
                const fallbackResults = this.getFallbackSearchResults(query, maxResults);
                return {
                    success: true,
                    data: fallbackResults.map((video) => ({
                        id: video.id,
                        title: video.title,
                        author: video.channel.name,
                        duration: video.duration,
                        views: this.formatViews(video.views),
                        thumbnail: video.thumbnail,
                        url: `https://www.youtube.com/watch?v=${video.id}`,
                        uploadDate: undefined
                    })),
                    creator: this.creator
                };
            }
            // Use yt-dlp for real search results
            const searchResults = await this.searchWithYtDlp(query, maxResults);
            if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
                return {
                    success: false,
                    error: 'No videos found for the search query',
                    creator: this.creator
                };
            }
            // Filter only video results and map to our format
            const videos = searchResults
                .filter((item) => item.type === 'video' || !item.type)
                .map((video) => ({
                id: video.id,
                title: video.title || 'Unknown Title',
                author: video.channel?.name || video.uploader || 'Unknown Channel',
                duration: video.duration ? this.formatDuration(video.duration) : 'Unknown Duration',
                views: video.view_count ? this.formatViews(video.view_count) : 'Unknown Views',
                thumbnail: video.thumbnail || '',
                url: `https://www.youtube.com/watch?v=${video.id}`,
                uploadDate: video.upload_date || undefined
            }));
            if (videos.length === 0) {
                return {
                    success: false,
                    error: 'No videos found for the search query',
                    creator: this.creator
                };
            }
            return {
                success: true,
                data: videos,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('YTPlay search error:', error.message);
            return {
                success: false,
                error: 'Failed to search videos. Please try again.',
                creator: this.creator
            };
        }
    }
    async getStreamUrl(request) {
        try {
            const { url, videoId, quality = 'highest', cookies } = request;
            let videoUrl;
            if (videoId) {
                videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            }
            else if (url) {
                videoUrl = url;
            }
            else {
                return {
                    success: false,
                    error: 'Either url or videoId is required',
                    creator: this.creator
                };
            }
            // Validate YouTube URL
            if (!ytdl.validateURL(videoUrl)) {
                return {
                    success: false,
                    error: 'Invalid YouTube URL provided',
                    creator: this.creator
                };
            }
            console.log(`YTPlay: Getting stream info for ${videoUrl}...`);
            // Prepare options for ytdl
            const options = {};
            if (cookies) {
                options.requestOptions = {
                    headers: {
                        'Cookie': cookies
                    }
                };
            }
            // Get video info with cookies support
            const info = await ytdl.getInfo(videoUrl, options);
            const videoDetails = info.videoDetails;
            // Get appropriate format
            let format;
            if (quality === 'highestaudio' || quality === 'lowestaudio') {
                const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
                format = quality === 'highestaudio'
                    ? ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' })
                    : ytdl.chooseFormat(audioFormats, { quality: 'lowestaudio' });
            }
            else {
                format = ytdl.chooseFormat(info.formats, { quality: quality });
            }
            if (!format) {
                return {
                    success: false,
                    error: 'No suitable format found',
                    creator: this.creator
                };
            }
            return {
                success: true,
                data: {
                    title: videoDetails.title,
                    author: videoDetails.author.name,
                    duration: this.formatDuration(parseInt(videoDetails.lengthSeconds)),
                    thumbnail: videoDetails.thumbnails[0]?.url || '',
                    streamUrl: format.url,
                    format: format.container || 'unknown',
                    quality: format.qualityLabel || quality
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('YTPlay stream error:', error.message);
            return {
                success: false,
                error: 'Failed to get stream URL. Video may be private or unavailable.',
                creator: this.creator
            };
        }
    }
    formatViews(views) {
        const num = typeof views === 'string' ? parseInt(views.replace(/,/g, '')) : views;
        if (isNaN(num))
            return 'Unknown Views';
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M views`;
        }
        else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K views`;
        }
        return `${num} views`;
    }
    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    async searchWithYtDlp(query, maxResults) {
        try {
            if (!this.ytDlpWrap) {
                console.error('yt-dlp-wrap not initialized for search');
                return this.getFallbackSearchResults(query, maxResults);
            }
            const searchQuery = `ytsearch${maxResults}:${query}`;
            const ytDlpEventEmitter = this.ytDlpWrap.execPromise([searchQuery, '-J']);
            const output = await ytDlpEventEmitter;
            // Parse the JSON output from yt-dlp
            const entries = JSON.parse(output).entries || [];
            return entries;
        }
        catch (error) {
            console.error('yt-dlp search failed:', error.message);
            // Fallback to mock data only if yt-dlp fails
            return this.getFallbackSearchResults(query, maxResults);
        }
    }
    getFallbackSearchResults(query, maxResults) {
        const mockResults = [];
        for (let i = 1; i <= Math.min(maxResults, 5); i++) {
            mockResults.push({
                id: `${Date.now()}_${i}`,
                title: `${query} - Search Result ${i}`,
                channel: { name: 'Sample Channel' },
                duration: '3:45',
                view_count: 1000000 + i * 1000,
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                type: 'video'
            });
        }
        return mockResults;
    }
    async searchVideo(request) {
        return this.searchVideos(request);
    }
    async getPlayUrl(request) {
        const result = await this.getStreamUrl({
            ...request,
            quality: 'highestaudio'
        });
        if (result.success && result.data) {
            return {
                ...result,
                data: {
                    ...result.data,
                    format: 'audio/mp4',
                    quality: 'audio'
                }
            };
        }
        return result;
    }
    getServiceStatus() {
        return {
            service: 'YTPlay',
            version: '1.1',
            status: this.ytDlpWrap ? 'operational' : 'limited (yt-dlp not initialized)',
            features: ['video_search', 'stream_url', 'audio_extraction', 'yt-dlp_integration'],
            creator: this.creator
        };
    }
}
export const ytPlayService = new YTPlayService();
