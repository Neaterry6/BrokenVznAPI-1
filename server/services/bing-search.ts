import axios from 'axios';
import * as cheerio from 'cheerio';

export interface BingImageSearchRequest {
  query: string;
  amount?: number;
}

export interface BingImageSearchResponse {
  success: boolean;
  query: string;
  amount: number;
  results: string[];
  creator: string;
  error?: string;
}

export class BingImageSearchService {
  private readonly creator = 'Broken VZN';

  async searchImages(request: BingImageSearchRequest): Promise<BingImageSearchResponse> {
    try {
      const { query, amount = 5 } = request;

      if (!query || query.trim().length === 0) {
        return {
          success: false,
          query,
          amount,
          results: [],
          creator: this.creator,
          error: 'Query parameter is required'
        };
      }

      const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query.trim())}`;
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };

      const response = await axios.get(url, { headers, timeout: 10000 });
      const $ = cheerio.load(response.data);
      
      const images: string[] = [];
      $('img.mimg, img.rms_img, img.vimgld').each((_, element) => {
        const src = $(element).attr('src') || $(element).attr('data-src');
        if (src && !src.startsWith('data:')) {
          let imageUrl = src;
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          } else if (imageUrl.startsWith('/')) {
            imageUrl = 'https://www.bing.com' + imageUrl;
          }
          images.push(imageUrl);
        }
      });

      // Filter unique images and limit by amount
      const uniqueImages = Array.from(new Set(images)).slice(0, amount);

      return {
        success: true,
        query,
        amount: uniqueImages.length,
        results: uniqueImages,
        creator: this.creator
      };

    } catch (error) {
      console.error('Bing image search error:', error);
      return {
        success: false,
        query: request.query,
        amount: request.amount || 5,
        results: [],
        creator: this.creator,
        error: 'Failed to search images'
      };
    }
  }
}

export const bingImageSearchService = new BingImageSearchService();