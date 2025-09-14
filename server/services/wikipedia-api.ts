import axios from 'axios';

export interface WikipediaSearchRequest {
  query: string;
}

export interface WikipediaSearchResponse {
  success: boolean;
  title: string;
  extract: string;
  url: string;
  creator: string;
  error?: string;
}

export class WikipediaSearchService {
  private readonly creator = 'Broken VZN';

  async searchWikipedia(request: WikipediaSearchRequest): Promise<WikipediaSearchResponse> {
    try {
      const { query } = request;

      if (!query || query.trim().length === 0) {
        return {
          success: false,
          title: '',
          extract: '',
          url: '',
          creator: this.creator,
          error: 'Query parameter is required'
        };
      }

      // Format query for Wikipedia API
      const formattedQuery = encodeURIComponent(query.trim());
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${formattedQuery}`;

      const response = await axios.get(url, { timeout: 10000 });

      if (response.status === 200) {
        const data = response.data;
        const title = data.title || 'Unknown';
        const extract = data.extract || 'No summary found.';
        const pageUrl = data.content_urls?.desktop?.page || '';

        return {
          success: true,
          title,
          extract,
          url: pageUrl,
          creator: this.creator
        };
      } else if (response.status === 404) {
        return {
          success: false,
          title: '',
          extract: '',
          url: '',
          creator: this.creator,
          error: 'No relevant results found on Wikipedia'
        };
      } else {
        return {
          success: false,
          title: '',
          extract: '',
          url: '',
          creator: this.creator,
          error: `Wikipedia API error: ${response.status}`
        };
      }
    } catch (error) {
      console.error('Wikipedia search error:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: false,
          title: '',
          extract: '',
          url: '',
          creator: this.creator,
          error: 'No relevant results found on Wikipedia'
        };
      }

      return {
        success: false,
        title: '',
        extract: '',
        url: '',
        creator: this.creator,
        error: 'Failed to search Wikipedia'
      };
    }
  }
}

export const wikipediaSearchService = new WikipediaSearchService();