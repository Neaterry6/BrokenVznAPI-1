import axios from 'axios';
export class EnhancedAdultContentService {
    creator = '@BrokenVZN';
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    // Enhanced Booru API with better error handling
    async searchBooruContent(query, site = 'auto', page = 1, limit = 20) {
        try {
            const searchTags = query.replace(/\s+/g, '+');
            // Multiple working booru APIs with better reliability
            const booruApis = [
                {
                    name: 'safebooru',
                    url: `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(searchTags)}&pid=${page - 1}&limit=${limit}`,
                    format: 'gelbooru'
                },
                {
                    name: 'rule34',
                    url: `https://rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(searchTags)}&pid=${page - 1}&limit=${limit}`,
                    format: 'gelbooru'
                },
                {
                    name: 'danbooru',
                    url: `https://danbooru.donmai.us/posts.json?tags=${encodeURIComponent(searchTags)}&page=${page}&limit=${limit}`,
                    format: 'danbooru'
                },
                {
                    name: 'konachan',
                    url: `https://konachan.com/post.json?tags=${encodeURIComponent(searchTags)}&page=${page}&limit=${limit}`,
                    format: 'moebooru'
                },
                {
                    name: 'yande',
                    url: `https://yande.re/post.json?tags=${encodeURIComponent(searchTags)}&page=${page}&limit=${limit}`,
                    format: 'moebooru'
                },
                {
                    name: 'gelbooru',
                    url: `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(searchTags)}&pid=${page - 1}&limit=${limit}`,
                    format: 'gelbooru'
                }
            ];
            // Try APIs in order until one works
            for (const api of booruApis) {
                if (site !== 'auto' && api.name !== site)
                    continue;
                try {
                    const response = await axios.get(api.url, {
                        headers: {
                            'User-Agent': this.userAgent,
                            'Accept': 'application/json, text/plain, */*'
                        },
                        timeout: 15000,
                        validateStatus: (status) => status < 500,
                        responseType: 'json'
                    });
                    // Validate content type
                    const contentType = response.headers['content-type'] || '';
                    if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
                        console.warn(`${api.name} returned non-JSON content: ${contentType}`);
                        continue;
                    }
                    if (response.status !== 200 || !response.data)
                        continue;
                    const items = this.parseBooruResponse(response.data, api.format, api.name);
                    if (items.length === 0)
                        continue;
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
                catch (apiError) {
                    console.warn(`${api.name} API failed:`, apiError);
                    continue;
                }
            }
            throw new Error('All booru APIs failed');
        }
        catch (error) {
            console.error('Enhanced booru search error:', error);
            return {
                success: false,
                error: `Failed to search booru content: ${error instanceof Error ? error.message : 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Parse different booru response formats
    parseBooruResponse(data, format, site) {
        let posts = [];
        switch (format) {
            case 'danbooru':
            case 'moebooru':
                posts = Array.isArray(data) ? data : [];
                break;
            case 'gelbooru':
                posts = data.post ? (Array.isArray(data.post) ? data.post : [data.post]) : [];
                break;
            default:
                posts = Array.isArray(data) ? data : (data.posts || data.post || []);
        }
        return posts.map((post, index) => ({
            id: post.id?.toString() || `${site}_${Date.now()}_${index}`,
            title: this.cleanTitle(post.tags || post.tag_string || ''),
            url: post.file_url || post.image || post.large_file_url || post.source,
            thumbnail: post.preview_url || post.preview_file_url || post.sample_url || post.file_url,
            fullImage: post.file_url || post.large_file_url || post.image,
            tags: this.parseTags(post.tags || post.tag_string || ''),
            rating: post.rating || 'explicit',
            score: post.score ? parseInt(post.score) : undefined,
            views: post.views || undefined,
            category: 'Image',
            site: site
        })).filter(item => item.url); // Filter out items without URLs
    }
    // Enhanced adult video search with multiple sources
    async searchAdultVideos(query, page = 1, limit = 20) {
        try {
            // Use Eporner API as it's more reliable
            const epornerUrl = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(query)}&per_page=${limit}&page=${page}&thumbsize=big&order=latest&gay=0&lq=1&format=json`;
            const response = await axios.get(epornerUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            if (!response.data || !response.data.videos) {
                throw new Error('No video data received');
            }
            const videos = response.data.videos.map((video) => ({
                id: video.id || Math.random().toString(36),
                title: video.title || 'Untitled Video',
                url: video.url || video.embed,
                thumbnail: video.thumb || video.default_thumb?.src,
                fullImage: video.thumb || video.default_thumb?.src,
                tags: video.keywords ? video.keywords.split(',').map((tag) => tag.trim()) : [],
                rating: 'explicit',
                views: video.views || 0,
                duration: this.formatDuration(video.length_sec || 0),
                category: 'Adult Video',
                site: 'eporner'
            }));
            return {
                success: true,
                data: {
                    items: videos,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil((response.data.total_count || 0) / limit),
                        totalItems: response.data.total_count || 0,
                        hasNextPage: videos.length === limit
                    }
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Adult video search error:', error);
            return {
                success: false,
                error: `Failed to search adult videos: ${error instanceof Error ? error.message : 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // XNXX-like search implementation
    async searchXNXXContent(query, page = 1) {
        try {
            // Use a general adult content aggregator approach
            const searchResults = await Promise.allSettled([
                this.searchAdultVideos(query, page, 10),
                this.searchBooruContent(query, 'auto', page, 10)
            ]);
            const allItems = [];
            searchResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value.success && result.value.data?.items) {
                    allItems.push(...result.value.data.items);
                }
            });
            if (allItems.length === 0) {
                return {
                    success: false,
                    error: `No content found for "${query}"`,
                    creator: this.creator
                };
            }
            // Mix and shuffle results
            const shuffledItems = this.shuffleArray(allItems).slice(0, 20);
            return {
                success: true,
                data: {
                    items: shuffledItems,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(allItems.length / 20),
                        totalItems: allItems.length,
                        hasNextPage: allItems.length >= 20
                    }
                },
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                error: `XNXX search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Get trending adult content
    async getTrendingContent(type = 'all') {
        try {
            const trendingQueries = [
                'anime', 'hentai', 'cosplay', 'japanese', 'asian', 'blonde', 'brunette',
                'milf', 'teen', 'amateur', 'big_ass', 'big_tits', 'latina', 'ebony'
            ];
            const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
            if (type === 'images') {
                return this.searchBooruContent(randomQuery, 'auto', 1, 20);
            }
            else if (type === 'videos') {
                return this.searchAdultVideos(randomQuery, 1, 20);
            }
            else {
                return this.searchXNXXContent(randomQuery, 1);
            }
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to get trending content',
                creator: this.creator
            };
        }
    }
    // Helper methods
    cleanTitle(tags) {
        if (!tags)
            return 'Untitled';
        return tags.replace(/_/g, ' ').slice(0, 100);
    }
    parseTags(tagString) {
        if (!tagString)
            return [];
        return tagString.split(/[\s,]+/).filter(tag => tag.length > 0).slice(0, 20);
    }
    formatDuration(seconds) {
        if (!seconds)
            return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    // XNXX downloader implementation
    async downloadXNXXVideo(videoId) {
        try {
            // Use multiple adult video platforms for downloading
            const downloadSources = [
                {
                    name: 'eporner',
                    baseUrl: 'https://www.eporner.com/api/v2/video/id/',
                    format: 'eporner'
                }
            ];
            for (const source of downloadSources) {
                try {
                    const response = await axios.get(`${source.baseUrl}${videoId}?format=json`, {
                        headers: { 'User-Agent': this.userAgent },
                        timeout: 15000
                    });
                    if (response.data && response.data.id) {
                        const video = response.data;
                        return {
                            success: true,
                            data: {
                                items: [{
                                        id: video.id,
                                        title: video.title || 'Video',
                                        url: video.url || video.embed,
                                        thumbnail: video.thumb || video.default_thumb?.src,
                                        fullImage: video.thumb,
                                        tags: video.keywords ? video.keywords.split(',').map((tag) => tag.trim()) : [],
                                        rating: 'explicit',
                                        views: video.views || 0,
                                        duration: this.formatDuration(video.length_sec || 0),
                                        category: 'Adult Video Download',
                                        site: source.name
                                    }],
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
                }
                catch (apiError) {
                    console.warn(`${source.name} download failed:`, apiError);
                    continue;
                }
            }
            return {
                success: false,
                error: 'Failed to download video from all sources',
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                error: `XNXX download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Get service status
    getStatus() {
        return {
            service: 'Enhanced Adult Content API',
            version: '2.0.0',
            status: 'operational',
            supportedSites: ['Danbooru', 'Konachan', 'Yande.re', 'Gelbooru', 'Eporner'],
            features: [
                'Multi-site Content Search',
                'Enhanced Error Handling',
                'Video & Image Support',
                'XNXX-style Aggregation',
                'Trending Content',
                'Robust Fallbacks'
            ],
            creator: this.creator
        };
    }
}
export const enhancedAdultContentService = new EnhancedAdultContentService();
