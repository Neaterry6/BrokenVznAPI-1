import axios from 'axios';
export class HackerNewsAPIService {
    creator = 'Broken VZN';
    baseUrl = 'https://hacker-news.firebaseio.com/v0';
    async getStories(request) {
        try {
            const { type = 'top', limit = 10 } = request;
            const limitedLimit = Math.min(Math.max(limit, 1), 50); // Limit between 1-50
            // Get story IDs
            const storiesResponse = await axios.get(`${this.baseUrl}/${type}stories.json`, {
                timeout: 10000
            });
            const storyIds = storiesResponse.data.slice(0, limitedLimit);
            const items = [];
            // Get details for each story
            for (const id of storyIds) {
                try {
                    const itemResponse = await axios.get(`${this.baseUrl}/item/${id}.json`, {
                        timeout: 5000
                    });
                    const item = itemResponse.data;
                    if (item) {
                        items.push({
                            id: item.id,
                            title: item.title || 'No title',
                            url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
                            author: item.by || 'Unknown',
                            score: item.score || 0,
                            comments: item.descendants || 0,
                            time: item.time || 0,
                            text: item.text ? item.text.substring(0, 500) : undefined,
                            type: item.type || 'story'
                        });
                    }
                }
                catch (itemError) {
                    console.error(`Error fetching item ${id}:`, itemError);
                }
            }
            return {
                success: true,
                type: type.charAt(0).toUpperCase() + type.slice(1),
                items,
                total_items: items.length,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Hacker News API error:', error);
            return {
                success: false,
                type: request.type || 'top',
                items: [],
                total_items: 0,
                creator: this.creator,
                error: 'Failed to fetch Hacker News stories'
            };
        }
    }
    async getItem(request) {
        try {
            const { id } = request;
            if (!id) {
                return {
                    success: false,
                    creator: this.creator,
                    error: 'Item ID is required'
                };
            }
            const response = await axios.get(`${this.baseUrl}/item/${id}.json`, {
                timeout: 10000
            });
            const item = response.data;
            if (!item) {
                return {
                    success: false,
                    creator: this.creator,
                    error: 'Item not found'
                };
            }
            return {
                success: true,
                item: {
                    id: item.id,
                    title: item.title,
                    url: item.url,
                    author: item.by,
                    score: item.score,
                    comments: item.descendants,
                    time: item.time,
                    text: item.text,
                    type: item.type,
                    parent: item.parent,
                    kids: item.kids
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Hacker News item error:', error);
            return {
                success: false,
                creator: this.creator,
                error: 'Failed to fetch item'
            };
        }
    }
    getSupportedTypes() {
        return ['top', 'new', 'best', 'ask', 'show', 'jobs'];
    }
}
export const hackerNewsAPIService = new HackerNewsAPIService();
