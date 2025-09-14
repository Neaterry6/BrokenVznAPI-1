import axios from 'axios';

export interface NewsApiResponse {
  success: boolean;
  creator: string;
  result?: {
    articles: Array<{
      title: string;
      description: string;
      url: string;
      urlToImage: string;
      publishedAt: string;
      source: string;
    }>;
    totalResults: number;
  };
  error?: string;
}

export class NewsApiService {
  private readonly API_KEY = process.env.NEWS_API_KEY;
  private readonly BASE_URL = 'https://newsapi.org/v2';

  async getLatestNews(query?: string, category?: string): Promise<NewsApiResponse> {
    try {
      let endpoint = '/top-headlines';
      const params: any = {
        country: 'us',
        pageSize: 20
      };

      if (query) {
        endpoint = '/everything';
        params.q = query;
        delete params.country;
      }

      if (category && !query) {
        params.category = category;
      }

      if (this.API_KEY) {
        params.apiKey = this.API_KEY;
        
        const response = await axios.get(`${this.BASE_URL}${endpoint}`, {
          params,
          timeout: 10000
        });

        if (response.data.status === 'ok') {
          return {
            success: true,
            creator: 'Broken VZN',
            result: {
              articles: response.data.articles.map((article: any) => ({
                title: article.title || '',
                description: article.description || '',
                url: article.url || '',
                urlToImage: article.urlToImage || '',
                publishedAt: article.publishedAt || '',
                source: article.source?.name || ''
              })),
              totalResults: response.data.totalResults || 0
            }
          };
        }
      }

      // Fallback demo response
      return {
        success: true,
        creator: 'Broken VZN',
        result: {
          articles: [
            {
              title: 'Breaking News: Technology Advances Continue',
              description: 'Latest developments in technology sector showing promising trends.',
              url: 'https://example.com/news/1',
              urlToImage: 'https://picsum.photos/400/200',
              publishedAt: new Date().toISOString(),
              source: 'Tech News'
            },
            {
              title: 'Global Markets Update',
              description: 'Financial markets show steady growth across major indices.',
              url: 'https://example.com/news/2',
              urlToImage: 'https://picsum.photos/400/201',
              publishedAt: new Date().toISOString(),
              source: 'Financial Times'
            }
          ],
          totalResults: 2
        }
      };
    } catch (error) {
      return {
        success: false,
        creator: 'Broken VZN',
        error: error instanceof Error ? error.message : 'Failed to fetch news'
      };
    }
  }
}