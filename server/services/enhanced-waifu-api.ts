import axios from 'axios';

export interface EnhancedWaifuResult {
  success: boolean;
  data?: {
    url: string;
    category: string;
    type: 'sfw' | 'nsfw';
    tags?: string[];
    source?: string;
    artist?: string;
    character?: string;
    id: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  error?: string;
  creator: string;
}

export interface BatchWaifuResult {
  success: boolean;
  data?: {
    images: Array<{
      url: string;
      category: string;
      type: 'sfw' | 'nsfw';
      tags?: string[];
      id: string;
    }>;
    total: number;
  };
  error?: string;
  creator: string;
}

export class EnhancedWaifuService {
  private creator = '@BrokenVZN';
  
  // Multiple reliable waifu APIs for fallback
  private waifuApis = [
    {
      name: 'waifu.im',
      baseUrl: 'https://api.waifu.im',
      sfw: {
        endpoint: '/search',
        method: 'GET',
        categories: ['waifu', 'maid', 'marin-kitagawa', 'mori-calliope', 'raiden-shogun', 'oppai', 'selfies', 'uniform', 'kamisato-ayaka', 'dress', 'school', 'christmas', 'bunny', 'bikini', 'neko']
      },
      nsfw: {
        endpoint: '/search',
        method: 'GET', 
        categories: ['ass', 'hentai', 'milf', 'oral', 'paizuri', 'ecchi', 'ero', 'nude', 'pussy', 'cum', 'blowjob', 'masturbation', 'ahegao', 'bdsm', 'creampie']
      }
    },
    {
      name: 'nekos.pro',
      baseUrl: 'https://api.nekos.pro',
      sfw: {
        endpoint: '/sfw',
        method: 'GET',
        categories: ['neko', 'waifu', 'kitsune', 'hug', 'pat', 'cuddle', 'kiss', 'poke', 'smug', 'slap', 'tickle']
      },
      nsfw: {
        endpoint: '/nsfw',
        method: 'GET',
        categories: ['neko', 'waifu', 'trap', 'blowjob', 'cum', 'masturbation', 'hentai', 'ahegao', 'bdsm', 'creampie', 'pussy', 'ass']
      }
    },
    {
      name: 'nekos.best',
      baseUrl: 'https://nekos.best/api/v2',
      sfw: {
        endpoint: '',
        method: 'GET',
        categories: ['neko', 'waifu', 'husbando', 'kitsune', 'hug', 'pat', 'cuddle', 'kiss', 'poke', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'dance', 'cringe']
      },
      nsfw: {
        endpoint: '',
        method: 'GET',
        categories: [] // nekos.best is SFW only
      }
    },
    {
      name: 'nekosia',
      baseUrl: 'https://api.nekosia.cat',
      sfw: {
        endpoint: '/api/v1/images/catgirl',
        method: 'GET',
        categories: ['catgirl', 'neko']
      },
      nsfw: {
        endpoint: '/api/v1/images/catgirl',
        method: 'GET',
        categories: [] // nekosia is mainly SFW
      }
    }
  ];

  // Enhanced single image fetching with multiple API fallbacks
  async getWaifuImage(category: string = 'waifu', type: 'sfw' | 'nsfw' = 'sfw'): Promise<EnhancedWaifuResult> {
    for (const api of this.waifuApis) {
      try {
        const result = await this.fetchFromAPI(api, category, type);
        if (result.success && result.data) {
          return result;
        }
      } catch (error) {
        console.log(`${api.name} failed:`, error);
        continue;
      }
    }

    return {
      success: false,
      error: 'All waifu APIs failed to return content',
      creator: this.creator
    };
  }

  // Fetch from specific API with proper error handling
  private async fetchFromAPI(api: any, category: string, type: 'sfw' | 'nsfw'): Promise<EnhancedWaifuResult> {
    try {
      const apiConfig = type === 'sfw' ? api.sfw : api.nsfw;
      
      // Skip if API doesn't support NSFW and type is nsfw
      if (type === 'nsfw' && apiConfig.categories.length === 0) {
        throw new Error('API does not support NSFW content');
      }

      // Validate category
      if (!apiConfig.categories.includes(category)) {
        // Use first available category as fallback
        category = apiConfig.categories[0] || 'waifu';
      }

      let url = '';
      let requestConfig: any = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      };

      // Build API URL based on API structure
      switch (api.name) {
        case 'waifu.im':
          url = `${api.baseUrl}${apiConfig.endpoint}`;
          requestConfig.params = {
            included_tags: [category],
            is_nsfw: type === 'nsfw'
          };
          break;
          
        case 'nekos.pro':
          url = `${api.baseUrl}${apiConfig.endpoint}/${category}`;
          break;
          
        case 'nekos.best':
          url = `${api.baseUrl}/${category}`;
          break;
          
        case 'nekosia':
          url = api.baseUrl + apiConfig.endpoint;
          break;
      }

      const response = await axios.get(url, requestConfig);

      // Parse response based on API format
      return this.parseAPIResponse(response.data, api.name, category, type);

    } catch (error: any) {
      throw new Error(`${api.name} API failed: ${error?.message || 'Unknown error'}`);
    }
  }

  // Parse different API response formats
  private parseAPIResponse(data: any, apiName: string, category: string, type: 'sfw' | 'nsfw'): EnhancedWaifuResult {
    let imageData: any = null;

    switch (apiName) {
      case 'waifu.im':
        if (data.images && data.images.length > 0) {
          imageData = data.images[0];
          return {
            success: true,
            data: {
              url: imageData.url,
              category: category,
              type: type,
              tags: imageData.tags || [],
              source: imageData.source || 'waifu.im',
              artist: imageData.artist || undefined,
              id: `waifu_im_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
              dimensions: {
                width: imageData.width || 0,
                height: imageData.height || 0
              }
            },
            creator: this.creator
          };
        }
        break;

      case 'nekos.pro':
        if (data.url) {
          return {
            success: true,
            data: {
              url: data.url,
              category: category,
              type: type,
              source: 'nekos.pro',
              id: `nekos_pro_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
            },
            creator: this.creator
          };
        }
        break;

      case 'nekos.best':
        if (data.results && data.results.length > 0) {
          imageData = data.results[0];
          return {
            success: true,
            data: {
              url: imageData.url,
              category: category,
              type: type,
              source: 'nekos.best',
              artist: imageData.artist_name || undefined,
              character: imageData.source_url || undefined,
              id: `nekos_best_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
            },
            creator: this.creator
          };
        }
        break;

      case 'nekosia':
        if (data.url) {
          return {
            success: true,
            data: {
              url: data.url,
              category: 'catgirl',
              type: type,
              source: 'nekosia',
              id: `nekosia_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
            },
            creator: this.creator
          };
        }
        break;
    }

    throw new Error('Invalid response format from API');
  }

  // Get multiple images (batch)
  async getBatchWaifus(count: number = 5, category: string = 'waifu', type: 'sfw' | 'nsfw' = 'sfw'): Promise<BatchWaifuResult> {
    try {
      if (count > 20) count = 20; // Limit to prevent abuse
      if (count < 1) count = 1;

      const promises = Array(count).fill(null).map(() => 
        this.getWaifuImage(category, type)
      );

      const results = await Promise.allSettled(promises);
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<EnhancedWaifuResult> => 
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
            category: img.category,
            type: img.type,
            tags: img.tags,
            id: `batch_${index}_${img.id}`
          })),
          total: successfulResults.length
        },
        creator: this.creator
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch batch waifu images: ${error instanceof Error ? error.message : 'Unknown error'}`,
        creator: this.creator
      };
    }
  }

  // Get random waifu from random API
  async getRandomWaifu(type: 'sfw' | 'nsfw' = 'sfw'): Promise<EnhancedWaifuResult> {
    try {
      // Get all available categories for the type
      const allCategories: string[] = [];
      
      this.waifuApis.forEach(api => {
        const apiConfig = type === 'sfw' ? api.sfw : api.nsfw;
        allCategories.push(...apiConfig.categories);
      });

      // Remove duplicates
      const uniqueCategories = allCategories.filter((value, index, self) => self.indexOf(value) === index);
      
      if (uniqueCategories.length === 0) {
        throw new Error('No categories available for this type');
      }

      const randomCategory = uniqueCategories[Math.floor(Math.random() * uniqueCategories.length)];
      
      return this.getWaifuImage(randomCategory, type);

    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch random waifu: ${error instanceof Error ? error.message : 'Unknown error'}`,
        creator: this.creator
      };
    }
  }

  // Get hentai-specific content with enhanced categories
  async getHentaiImage(category: string = 'hentai'): Promise<EnhancedWaifuResult> {
    const hentaiCategories = ['hentai', 'ahegao', 'bdsm', 'creampie', 'cum', 'masturbation', 'blowjob', 'pussy', 'ass', 'nude', 'ecchi'];
    
    // Validate category
    if (!hentaiCategories.includes(category)) {
      category = 'hentai'; // Default fallback
    }

    return this.getWaifuImage(category, 'nsfw');
  }

  // Get available categories
  getAvailableCategories(): { sfw: string[], nsfw: string[] } {
    const sfwCategories = new Set<string>();
    const nsfwCategories = new Set<string>();

    const allSfwCategories: string[] = [];
    const allNsfwCategories: string[] = [];

    this.waifuApis.forEach(api => {
      allSfwCategories.push(...api.sfw.categories);
      allNsfwCategories.push(...api.nsfw.categories);
    });

    return {
      sfw: allSfwCategories.filter((value, index, self) => self.indexOf(value) === index),
      nsfw: allNsfwCategories.filter((value, index, self) => self.indexOf(value) === index)
    };
  }

  // Get service status
  getStatus() {
    return {
      service: 'Enhanced Waifu API',
      version: '2.0.0',
      status: 'operational',
      supportedAPIs: this.waifuApis.map(api => api.name),
      features: [
        'Multi-API Fallback System',
        'SFW & NSFW Content',
        'Batch Image Fetching',
        'Random Image Generation',
        'Enhanced Hentai Categories',
        'Reliable Content Delivery'
      ],
      categories: this.getAvailableCategories(),
      creator: this.creator
    };
  }
}

export const enhancedWaifuService = new EnhancedWaifuService();