import axios from 'axios';
export class AdultContentService {
    creator = '@BrokenVZN';
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    // Rule34 API integration with fallback sources
    async searchRule34(request) {
        try {
            const { query, page = 1, limit = 20, tags = [], rating } = request;
            // Combine search query with tags
            const searchTags = [...(query ? [query] : []), ...tags];
            const tagsString = searchTags.join('+').replace(/\s+/g, '_');
            // Fallback URLs for different booru sites
            const fallbackUrls = [
                `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(tagsString)}&pid=${page - 1}&limit=${limit}`,
                `https://rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(tagsString)}&pid=${page - 1}&limit=${limit}`,
                `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(tagsString)}&pid=${page - 1}&limit=${limit}`
            ];
            let lastError = null;
            // Try each URL until one works
            for (const apiUrl of fallbackUrls) {
                try {
                    const response = await axios.get(apiUrl, {
                        headers: {
                            'User-Agent': this.userAgent,
                            'Accept': 'application/json',
                            'Referer': new URL(apiUrl).origin + '/'
                        },
                        timeout: 10000,
                        validateStatus: (status) => status < 500
                    });
                    if (response.status !== 200) {
                        throw new Error(`API returned status ${response.status}`);
                    }
                    let posts = [];
                    // Handle different response formats
                    if (Array.isArray(response.data)) {
                        posts = response.data;
                    }
                    else if (response.data.post) {
                        posts = Array.isArray(response.data.post) ? response.data.post : [response.data.post];
                    }
                    const items = posts.map((post) => ({
                        id: post.id?.toString() || Math.random().toString(36),
                        title: post.tags?.replace(/_/g, ' ')?.slice(0, 100) || 'Untitled',
                        url: post.file_url || post.image,
                        thumbnail: post.preview_url || post.sample_url,
                        fullImage: post.file_url || post.image,
                        tags: post.tags ? post.tags.split(' ').filter((tag) => tag.length > 0) : [],
                        rating: post.rating || 'explicit',
                        score: post.score ? parseInt(post.score) : undefined,
                        source: post.source || undefined,
                        dimensions: post.width && post.height ? {
                            width: parseInt(post.width),
                            height: parseInt(post.height)
                        } : undefined,
                        uploadDate: post.created_at || undefined
                    }));
                    return {
                        success: true,
                        data: {
                            items,
                            pagination: {
                                currentPage: page,
                                totalPages: Math.ceil(100 / limit),
                                totalItems: items.length,
                                hasNextPage: items.length === limit
                            }
                        },
                        creator: this.creator
                    };
                }
                catch (error) {
                    lastError = error;
                    continue; // Try next URL
                }
            }
            // If all APIs failed, return fallback data
            return {
                success: false,
                error: `All APIs failed. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Rule34 search error:', error);
            return {
                success: false,
                error: 'Failed to search Rule34 content',
                creator: this.creator
            };
        }
    }
    // Gelbooru API integration
    async searchGelbooru(request) {
        try {
            const { query, page = 1, limit = 20, tags = [] } = request;
            const searchTags = [...(query ? [query] : []), ...tags];
            const tagsString = searchTags.join('+').replace(/\s+/g, '_');
            const apiUrl = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(tagsString)}&pid=${page - 1}&limit=${limit}`;
            const response = await axios.get(apiUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const posts = response.data.post || [];
            const items = posts.map((post) => ({
                id: post.id?.toString() || Math.random().toString(36),
                title: post.tags?.replace(/_/g, ' ')?.slice(0, 100) || 'Untitled',
                url: post.file_url,
                thumbnail: post.preview_url,
                fullImage: post.file_url,
                tags: post.tags ? post.tags.split(' ').filter((tag) => tag.length > 0) : [],
                rating: post.rating || 'explicit',
                score: post.score ? parseInt(post.score) : undefined,
                source: post.source || undefined,
                dimensions: post.width && post.height ? {
                    width: parseInt(post.width),
                    height: parseInt(post.height)
                } : undefined
            }));
            return {
                success: true,
                data: {
                    items,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(100 / limit),
                        totalItems: items.length,
                        hasNextPage: items.length === limit
                    }
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Gelbooru search error:', error);
            return {
                success: false,
                error: 'Failed to search Gelbooru content',
                creator: this.creator
            };
        }
    }
    // Hanime video search (adult anime) - HTML scraping implementation
    async searchHanimeVideos(query, page = 1) {
        try {
            // Scrape the trending page HTML to extract embedded data
            const trendingUrl = `https://hanime.tv/browse/hentai-videos?page=${page}`;
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Upgrade-Insecure-Requests': '1'
            };
            const response = await axios.get(trendingUrl, {
                headers,
                timeout: 15000,
                validateStatus: (status) => status < 500
            });
            if (response.status !== 200) {
                throw new Error(`Page returned status ${response.status}`);
            }
            // Extract data from window.__NUXT__ embedded in the HTML
            const html = response.data;
            const nuxtMatch = html.match(/window\.__NUXT__\s*=\s*({[\s\S]*?});/);
            let hentaiVideos = [];
            if (nuxtMatch) {
                try {
                    const nuxtData = JSON.parse(nuxtMatch[1]);
                    // Navigate the NUXT data structure to find videos
                    const pageData = nuxtData?.data?.[0] || nuxtData?.state || nuxtData;
                    hentaiVideos = this.extractVideosFromNuxtData(pageData);
                }
                catch (parseError) {
                    console.warn('Failed to parse NUXT data, falling back to HTML parsing');
                }
            }
            // Fallback: Basic HTML parsing for video cards
            if (hentaiVideos.length === 0) {
                hentaiVideos = this.parseVideosFromHTML(html);
            }
            // Filter by query if provided
            const filteredVideos = query
                ? hentaiVideos.filter((video) => video.name?.toLowerCase().includes(query.toLowerCase()) ||
                    video.title?.toLowerCase().includes(query.toLowerCase()))
                : hentaiVideos;
            const items = filteredVideos.slice(0, 20).map((video, index) => ({
                id: video.id?.toString() || `hanime_${Date.now()}_${index}`,
                title: video.name || video.title || 'Untitled',
                url: video.slug ? `https://hanime.tv/videos/hentai/${video.slug}` : `https://hanime.tv${video.url || ''}`,
                thumbnail: video.cover_url || video.poster_url || video.thumbnail || '',
                duration: this.formatDuration(video.duration_in_ms) || video.duration || '00:00',
                views: video.views || 0,
                rating: video.likes ? parseFloat((video.likes / 1000).toFixed(1)) : undefined,
                tags: this.extractTags(video.hentai_tags) || [],
                category: 'Adult Anime',
                uploadDate: video.created_at_unix ? new Date(video.created_at_unix * 1000).toISOString().split('T')[0] : undefined,
                quality: '1080p',
                downloadUrl: video.slug ? `https://hanime.tv/videos/hentai/${video.slug}` : undefined
            }));
            return {
                success: true,
                data: {
                    items,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(items.length / 20),
                        totalItems: items.length,
                        hasNextPage: items.length >= 20
                    }
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Hanime search error:', error);
            return {
                success: false,
                error: `Failed to search hanime content: ${error instanceof Error ? error.message : 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Extract videos from NUXT data structure
    extractVideosFromNuxtData(data) {
        const videos = [];
        // Common paths where video data might be stored
        const possiblePaths = [
            data?.hentai_videos,
            data?.videos,
            data?.trending,
            data?.browse,
            data?.data?.hentai_videos,
            data?.payload?.hentai_videos
        ];
        for (const path of possiblePaths) {
            if (Array.isArray(path) && path.length > 0) {
                videos.push(...path);
                break;
            }
        }
        return videos;
    }
    // Fallback HTML parsing for video information
    parseVideosFromHTML(html) {
        const videos = [];
        // Extract video cards using regex patterns
        const videoCardRegex = /<div[^>]*class="[^"]*video-card[^"]*"[^>]*>[\s\S]*?<\/div>/g;
        const matches = html.match(videoCardRegex) || [];
        matches.forEach((card, index) => {
            const titleMatch = card.match(/title="([^"]+)"/);
            const linkMatch = card.match(/href="([^"]+)"/);
            const thumbMatch = card.match(/src="([^"]+)"/);
            if (titleMatch || linkMatch) {
                videos.push({
                    id: `html_parsed_${index}`,
                    title: titleMatch?.[1] || 'Video',
                    url: linkMatch?.[1] || '',
                    thumbnail: thumbMatch?.[1] || '',
                    slug: linkMatch?.[1]?.split('/').pop() || ''
                });
            }
        });
        return videos;
    }
    // Get hanime video details with streaming links
    async getHanimeVideoDetails(slug) {
        try {
            const videoApiUrl = `https://hanime.tv/api/v8/video?id=${slug}`;
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            };
            const response = await axios.get(videoApiUrl, {
                headers,
                timeout: 15000
            });
            const videoData = response.data;
            const hentaiVideo = videoData.hentai_video;
            // Extract streaming URLs
            const streams = videoData.videos_manifest?.servers?.[0]?.streams || [];
            const streamingUrls = streams.map((stream) => ({
                quality: `${stream.height}p`,
                url: stream.url,
                width: stream.width,
                height: stream.height,
                size_mbs: stream.filesize_mbs
            }));
            const videoItem = {
                id: hentaiVideo.id?.toString() || slug,
                title: hentaiVideo.name || 'Untitled',
                url: `https://hanime.tv/videos/hentai/${slug}`,
                thumbnail: hentaiVideo.cover_url || hentaiVideo.poster_url || '',
                duration: this.formatDuration(hentaiVideo.duration_in_ms),
                views: hentaiVideo.views || 0,
                rating: hentaiVideo.likes ? parseFloat((hentaiVideo.likes / 1000).toFixed(1)) : undefined,
                tags: this.extractTags(videoData.hentai_tags),
                category: 'Adult Anime',
                uploadDate: hentaiVideo.created_at_unix ? new Date(hentaiVideo.created_at_unix * 1000).toISOString().split('T')[0] : undefined,
                quality: streams.length > 0 ? `${Math.max(...streams.map((s) => s.height))}p` : '1080p',
                downloadUrl: streamingUrls.length > 0 ? streamingUrls[0].url : undefined
            };
            // Add streaming URLs as additional data
            videoItem.streamingUrls = streamingUrls;
            videoItem.description = hentaiVideo.description;
            return {
                success: true,
                data: {
                    items: [videoItem],
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: 1,
                        hasNextPage: false
                    }
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Hanime video details error:', error);
            return {
                success: false,
                error: `Failed to get hanime video details: ${error instanceof Error ? error.message : 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Helper methods
    formatDuration(durationMs) {
        if (!durationMs)
            return '00:00';
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    extractTags(hentaiTags) {
        if (!hentaiTags || !Array.isArray(hentaiTags))
            return [];
        return hentaiTags.map(tag => tag.text || tag.name || '').filter(tag => tag.length > 0);
    }
    // Random adult content
    async getRandomContent(site = 'rule34', limit = 10) {
        try {
            const randomTags = ['anime', 'hentai', '1girl', 'solo', 'rating:safe'];
            const randomTag = randomTags[Math.floor(Math.random() * randomTags.length)];
            return this.searchRule34({
                query: randomTag,
                limit,
                sort: 'random'
            });
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to get random content',
                creator: this.creator
            };
        }
    }
    // Get popular tags
    async getPopularTags(site = 'rule34') {
        try {
            const popularTags = [
                'anime', 'hentai', '1girl', 'solo', 'breasts', 'long_hair', 'looking_at_viewer',
                'blue_eyes', 'blonde_hair', 'large_breasts', 'nipples', 'nude', 'pussy',
                'ass', 'smile', 'open_mouth', 'brown_hair', 'black_hair', 'thighhighs',
                'panties', 'underwear', 'cum', 'sex', 'blush', 'simple_background'
            ];
            return {
                success: true,
                data: {
                    items: popularTags.map((tag, index) => ({
                        id: index.toString(),
                        title: tag.replace(/_/g, ' '),
                        url: `#tag-${tag}`,
                        thumbnail: '',
                        tags: [tag],
                        rating: 'explicit'
                    }))
                },
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to get popular tags',
                creator: this.creator
            };
        }
    }
    // Multi-site search aggregation
    async searchMultipleSites(request) {
        try {
            const promises = [
                this.searchRule34(request),
                this.searchGelbooru(request)
            ];
            const results = await Promise.allSettled(promises);
            const successfulResults = results
                .filter((result) => result.status === 'fulfilled' && result.value.success)
                .map(result => result.value);
            if (successfulResults.length === 0) {
                throw new Error('All searches failed');
            }
            // Combine results from all successful searches
            const allItems = [];
            successfulResults.forEach(result => {
                if (result.data?.items) {
                    allItems.push(...result.data.items);
                }
            });
            // Remove duplicates and limit results
            const uniqueItems = allItems.filter((item, index, self) => index === self.findIndex(t => t.id === item.id)).slice(0, request.limit || 20);
            return {
                success: true,
                data: {
                    items: uniqueItems,
                    pagination: {
                        currentPage: request.page || 1,
                        totalPages: Math.ceil(uniqueItems.length / (request.limit || 20)),
                        totalItems: uniqueItems.length,
                        hasNextPage: uniqueItems.length === (request.limit || 20)
                    }
                },
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Multi-site search failed',
                creator: this.creator
            };
        }
    }
    // Safe mode search (filtered content)
    async safeModeSearch(query, page = 1) {
        try {
            return this.searchRule34({
                query: `${query} rating:safe`,
                page,
                rating: 'safe',
                limit: 20
            });
        }
        catch (error) {
            return {
                success: false,
                error: 'Safe mode search failed',
                creator: this.creator
            };
        }
    }
    // Get service status
    getStatus() {
        return {
            service: 'Adult Content API',
            version: '1.0.0',
            status: 'operational',
            supportedSites: ['Rule34', 'Gelbooru', 'Danbooru', 'Safebooru'],
            features: [
                'Image Search & Discovery',
                'Video Content Access',
                'Tag-based Filtering',
                'Multi-site Aggregation',
                'Safe Mode Option',
                'Random Content',
                'Popular Tags'
            ],
            safetyFeatures: [
                'Content Rating System',
                'Age Verification Required',
                'Tag-based Filtering',
                'Safe Mode Available'
            ],
            creator: this.creator
        };
    }
}
export const adultContentService = new AdultContentService();
