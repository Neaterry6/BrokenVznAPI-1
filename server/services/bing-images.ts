import axios from 'axios';
import * as cheerio from 'cheerio';

export interface BingImageSearchRequest {
  query: string;
  amount?: number;
  safeSearch?: 'strict' | 'moderate' | 'off';
}

export interface BingImageSearchResult {
  success: boolean;
  query?: string;
  amount?: number;
  results?: string[];
  creator: string;
  error?: string;
}

export class BingImagesService {
  async searchImages(request: BingImageSearchRequest): Promise<BingImageSearchResult> {
    try {
      const { query, amount = 5, safeSearch = 'moderate' } = request;

      if (!query || query.trim() === '') {
        return {
          success: false,
          error: 'Query parameter is required',
          creator: 'Broken VZN'
        };
      }

      const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query.trim())}`;
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };

      const response = await axios.get(url, { headers, timeout: 10000 });
      const $ = cheerio.load(response.data);
      
      const images: string[] = [];
      
      // Look for image elements with various class names used by Bing
      $('img.mimg, img.rms_img, img.vimgld').each((index, element) => {
        if (images.length >= amount) return false;
        
        const src = $(element).attr('src') || $(element).attr('data-src');
        if (src && src.startsWith('http')) {
          // Ensure the URL is absolute
          const absoluteUrl = src.startsWith('//') ? `https:${src}` : src;
          images.push(absoluteUrl);
        }
      });

      // If we didn't get enough images, try alternative selectors
      if (images.length < amount) {
        $('img[src*="bing"]').each((index, element) => {
          if (images.length >= amount) return false;
          
          const src = $(element).attr('src');
          if (src && src.startsWith('http') && !images.includes(src)) {
            images.push(src);
          }
        });
      }

      return {
        success: true,
        query: query.trim(),
        amount: images.length,
        results: images.slice(0, amount),
        creator: 'Broken VZN'
      };

    } catch (error) {
      console.error('Bing image search error:', error);
      return {
        success: false,
        error: 'Failed to search images',
        creator: 'Broken VZN'
      };
    }
  }
}

export const bingImagesService = new BingImagesService();