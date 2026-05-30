import axios from 'axios';
export class WikipediaSearchService {
    BASE_URL = 'https://en.wikipedia.org/api/rest_v1';
    API_URL = 'https://en.wikipedia.org/w/api.php';
    async searchWikipedia(query) {
        try {
            const response = await axios.get(this.API_URL, {
                params: {
                    action: 'query',
                    list: 'search',
                    srsearch: query,
                    format: 'json',
                    srlimit: 10,
                    origin: '*'
                },
                timeout: 10000
            });
            if (response.data?.query?.search) {
                return {
                    success: true,
                    creator: 'Broken VZN',
                    results: response.data.query.search.map((item) => ({
                        title: item.title,
                        snippet: item.snippet.replace(/<\/?[^>]+(>|$)/g, ''), // Remove HTML tags
                        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
                        pageId: item.pageid
                    }))
                };
            }
            return {
                success: false,
                creator: 'Broken VZN',
                error: 'No search results found'
            };
        }
        catch (error) {
            return {
                success: false,
                creator: 'Broken VZN',
                error: error instanceof Error ? error.message : 'Failed to search Wikipedia'
            };
        }
    }
    async getWikipediaPage(title) {
        try {
            // Get page summary
            const summaryResponse = await axios.get(`${this.BASE_URL}/page/summary/${encodeURIComponent(title)}`, {
                timeout: 10000
            });
            if (summaryResponse.data) {
                const data = summaryResponse.data;
                return {
                    success: true,
                    creator: 'Broken VZN',
                    result: {
                        title: data.title,
                        summary: data.extract,
                        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
                        thumbnail: data.thumbnail?.source,
                        extract: data.extract,
                        pageId: data.pageid
                    }
                };
            }
            return {
                success: false,
                creator: 'Broken VZN',
                error: 'Page not found'
            };
        }
        catch (error) {
            // Fallback to search if direct page access fails
            try {
                const searchResults = await this.searchWikipedia(title);
                if (searchResults.success && searchResults.results && searchResults.results.length > 0) {
                    const firstResult = searchResults.results[0];
                    return {
                        success: true,
                        creator: 'Broken VZN',
                        result: {
                            title: firstResult.title,
                            summary: firstResult.snippet,
                            url: firstResult.url,
                            extract: firstResult.snippet,
                            pageId: firstResult.pageId
                        }
                    };
                }
            }
            catch (fallbackError) {
                // Continue to error response
            }
            return {
                success: false,
                creator: 'Broken VZN',
                error: error instanceof Error ? error.message : 'Failed to get Wikipedia page'
            };
        }
    }
}
