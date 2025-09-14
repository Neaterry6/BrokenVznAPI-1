import axios from 'axios';

export interface WaifuPicsResult {
  success: boolean;
  data?: {
    url: string;
    category?: string;
    type?: string;
    id?: string;
  };
  error?: string;
  creator: string;
}

export interface WaifuBatchResult {
  success: boolean;
  data?: {
    images: Array<{
      url: string;
      category: string;
      type: string;
      id: string;
    }>;
    total: number;
  };
  error?: string;
  creator: string;
}

export class WaifuPicsService {
  private creator = '@BrokenVZN';
  private baseUrl = 'https://api.waifu.pics';
  
  // SFW Categories
  private sfwCategories = [
    'waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle',
    'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk',
    'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold',
    'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy',
    'wink', 'poke', 'dance', 'cringe'
  ];

  // NSFW Categories  
  private nsfwCategories = [
    'waifu', 'neko', 'trap', 'blowjob'
  ];

  // Get random SFW waifu image
  async getSfwImage(category: string = 'waifu'): Promise<WaifuPicsResult> {
    try {
      if (!this.sfwCategories.includes(category)) {
        return {
          success: false,
          error: `Invalid SFW category. Available: ${this.sfwCategories.join(', ')}`,
          creator: this.creator
        };
      }

      const response = await axios.get(`${this.baseUrl}/sfw/${category}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      return {
        success: true,
        data: {
          url: response.data.url,
          category: category,
          type: 'sfw',
          id: `waifu_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        },
        creator: this.creator
      };

    } catch (error) {
      console.error('Waifu.pics SFW error:', error);
      return {
        success: false,
        error: `Failed to fetch SFW ${category} image`,
        creator: this.creator
      };
    }
  }

  // Get random NSFW waifu image
  async getNsfwImage(category: string = 'waifu'): Promise<WaifuPicsResult> {
    try {
      if (!this.nsfwCategories.includes(category)) {
        return {
          success: false,
          error: `Invalid NSFW category. Available: ${this.nsfwCategories.join(', ')}`,
          creator: this.creator
        };
      }

      const response = await axios.get(`${this.baseUrl}/nsfw/${category}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      return {
        success: true,
        data: {
          url: response.data.url,
          category: category,
          type: 'nsfw',
          id: `waifu_nsfw_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        },
        creator: this.creator
      };

    } catch (error) {
      console.error('Waifu.pics NSFW error:', error);
      return {
        success: false,
        error: `Failed to fetch NSFW ${category} image`,
        creator: this.creator
      };
    }
  }

  // Get multiple images (batch)
  async getBatchImages(category: string, type: 'sfw' | 'nsfw' = 'sfw', count: number = 5): Promise<WaifuBatchResult> {
    try {
      if (count > 20) count = 20; // Limit to prevent abuse
      if (count < 1) count = 1;

      const availableCategories = type === 'sfw' ? this.sfwCategories : this.nsfwCategories;
      if (!availableCategories.includes(category)) {
        return {
          success: false,
          error: `Invalid ${type.toUpperCase()} category. Available: ${availableCategories.join(', ')}`,
          creator: this.creator
        };
      }

      const promises = Array(count).fill(null).map(() => 
        type === 'sfw' ? this.getSfwImage(category) : this.getNsfwImage(category)
      );

      const results = await Promise.allSettled(promises);
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<WaifuPicsResult> => 
          result.status === 'fulfilled' && result.value.success === true && result.value.data !== undefined
        )
        .map(result => result.value.data!);

      if (successfulResults.length === 0) {
        throw new Error('All requests failed');
      }

      return {
        success: true,
        data: {
          images: successfulResults.map((img, index) => ({
            url: img.url,
            category: img.category || category,
            type: img.type || type,
            id: `batch_${index}_${img.id}`
          })),
          total: successfulResults.length
        },
        creator: this.creator
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch batch ${category} images`,
        creator: this.creator
      };
    }
  }

  // Get random category image
  async getRandomImage(type: 'sfw' | 'nsfw' = 'sfw'): Promise<WaifuPicsResult> {
    try {
      const categories = type === 'sfw' ? this.sfwCategories : this.nsfwCategories;
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      return type === 'sfw' 
        ? this.getSfwImage(randomCategory)
        : this.getNsfwImage(randomCategory);

    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch random ${type} image`,
        creator: this.creator
      };
    }
  }

  // Get available categories
  getAvailableCategories(): { sfw: string[], nsfw: string[] } {
    return {
      sfw: [...this.sfwCategories],
      nsfw: [...this.nsfwCategories]
    };
  }

  // Get service status
  getStatus() {
    return {
      service: 'Waifu.pics API',
      version: '1.0.0',
      status: 'operational',
      baseUrl: this.baseUrl,
      categories: {
        sfw: this.sfwCategories.length,
        nsfw: this.nsfwCategories.length
      },
      features: [
        'SFW Anime Images',
        'NSFW Anime Images', 
        'Multiple Categories',
        'Batch Downloads',
        'Random Images'
      ],
      creator: this.creator
    };
  }
}

export const waifuPicsService = new WaifuPicsService();