import axios from 'axios';

export interface NewsRequest {
  category?: string;
  country?: string;
}

export interface NewsResponse {
  success: boolean;
  category: string;
  country: string;
  articles: NewsArticle[];
  creator: string;
  error?: string;
}

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  rank: number;
}

export class EnhancedNewsService {
  private readonly creator = 'Broken VZN';
  private readonly apiKey = '2700cb22fb254ad9b409ff1ff6bc9278'; // From original code
  private readonly newsUrl = 'https://newsapi.org/v2/top-headlines';

  private readonly categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
  private readonly aliasMap: { [key: string]: string } = {
    'tech': 'technology',
    'sport': 'sports'
  };

  async getNews(request: NewsRequest): Promise<NewsResponse> {
    try {
      const { category: requestCategory, country = 'us' } = request;
      
      // Determine category
      let category = 'general';
      if (requestCategory) {
        const categoryLower = requestCategory.toLowerCase().trim();
        category = this.aliasMap[categoryLower] || categoryLower;
        if (!this.categories.includes(category)) {
          category = this.getRandomCategory();
        }
      } else {
        category = this.getRandomCategory();
      }

      // Make multiple attempts if no articles found
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const params = {
            country,
            category,
            pageSize: 10,
            apiKey: this.apiKey
          };

          const response = await axios.get(this.newsUrl, { params, timeout: 10000 });
          const data = response.data;

          if (data.status === 'ok' && data.articles && data.articles.length > 0) {
            const articles: NewsArticle[] = data.articles.map((article: any, index: number) => ({
              title: article.title || 'No Title',
              source: article.source?.name || 'Unknown Source',
              url: article.url || '',
              rank: index + 1
            }));

            return {
              success: true,
              category: category.charAt(0).toUpperCase() + category.slice(1),
              country: country.toUpperCase(),
              articles,
              creator: this.creator
            };
          }
        } catch (attemptError) {
          console.error(`News API attempt ${attempt + 1} failed:`, attemptError);
        }

        // Try different category on next attempt
        category = this.getRandomCategory();
      }

      return {
        success: false,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        country: country.toUpperCase(),
        articles: [],
        creator: this.creator,
        error: 'Could not find any fresh news after multiple attempts'
      };

    } catch (error) {
      console.error('Enhanced news service error:', error);
      return {
        success: false,
        category: request.category || 'General',
        country: request.country || 'US',
        articles: [],
        creator: this.creator,
        error: 'Failed to fetch news'
      };
    }
  }

  private getRandomCategory(): string {
    const randomIndex = Math.floor(Math.random() * this.categories.length);
    return this.categories[randomIndex];
  }

  getAvailableCategories(): string[] {
    return [...this.categories];
  }
}

export const enhancedNewsService = new EnhancedNewsService();