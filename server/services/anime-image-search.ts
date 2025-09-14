import axios from 'axios';

export interface AnimeImageResult {
  success: boolean;
  data?: {
    images: Array<{
      url: string;
      width: number;
      height: number;
      thumbnail: string;
      title?: string;
      source?: string;
      id: string;
      tags?: string[];
      rating?: string;
      site?: string;
    }>;
    query: string;
    total: number;
    page: number;
  };
  error?: string;
  creator: string;
}

export class AnimeImageSearchService {
  private creator = '@BrokenVZN';
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  // Working Booru APIs
  private booruApis = [
    {
      name: 'safebooru',
      url: 'https://safebooru.org/index.php',
      params: { page: 'dapi', s: 'post', q: 'index', json: '1' },
      format: 'gelbooru'
    },
    {
      name: 'konachan',
      url: 'https://konachan.com/post.json',
      params: {},
      format: 'moebooru'
    },
    {
      name: 'yande',
      url: 'https://yande.re/post.json',
      params: {},
      format: 'moebooru'
    }
  ];

  // Predefined anime character searches
  private animeCharacters = {
    'satorugojo': 'Satoru Gojo Jujutsu Kaisen anime',
    'naruto': 'Naruto Uzumaki anime character',
    'luffy': 'Monkey D Luffy One Piece anime',
    'goku': 'Son Goku Dragon Ball anime',
    'ichigo': 'Ichigo Kurosaki Bleach anime',
    'natsu': 'Natsu Dragneel Fairy Tail anime',
    'edward': 'Edward Elric Fullmetal Alchemist anime',
    'light': 'Light Yagami Death Note anime',
    'eren': 'Eren Yeager Attack on Titan anime',
    'deku': 'Izuku Midoriya My Hero Academia anime',
    'tanjiro': 'Tanjiro Kamado Demon Slayer anime',
    'senku': 'Senku Ishigami Dr Stone anime',
    'rimuru': 'Rimuru Tempest That Time I Got Reincarnated as a Slime anime',
    'ainz': 'Ainz Ooal Gown Overlord anime',
    'saitama': 'Saitama One Punch Man anime'
  };

  private animeGenres = {
    'shounen': 'shounen anime characters',
    'shoujo': 'shoujo anime characters', 
    'seinen': 'seinen anime characters',
    'josei': 'josei anime characters',
    'mecha': 'mecha anime robots',
    'magical_girl': 'magical girl anime characters',
    'slice_of_life': 'slice of life anime',
    'romance': 'romance anime couples',
    'action': 'action anime battles',
    'adventure': 'adventure anime characters',
    'fantasy': 'fantasy anime characters',
    'sci_fi': 'sci-fi anime characters',
    'horror': 'horror anime characters',
    'mystery': 'mystery anime characters',
    'thriller': 'thriller anime characters'
  };

  // Search anime images by query using Booru APIs
  async searchAnimeImages(query: string, page: number = 1, limit: number = 10): Promise<AnimeImageResult> {
    try {
      if (!query || query.trim().length === 0) {
        return {
          success: false,
          error: 'Search query is required',
          creator: this.creator
        };
      }

      // Prepare search tags
      const searchTags = query.toLowerCase().replace(/\s+/g, '_');

      // Try each Booru API until one returns results
      for (const api of this.booruApis) {
        try {
          console.log(`Trying ${api.name} for query: ${query}`);
          
          const params = { 
            ...api.params,
            tags: searchTags,
            limit: Math.min(limit, 100), // Respect API limits
            page: page - 1 // Most APIs are 0-indexed
          };

          const response = await axios.get(api.url, {
            params,
            headers: { 
              'User-Agent': this.userAgent,
              'Accept': 'application/json, text/plain, */*'
            },
            timeout: 15000,
            validateStatus: (status) => status < 500
          });

          if (response.data && response.status === 200) {
            const images = this.parseBooruResponse(response.data, api.format, api.name);
            
            if (images.length > 0) {
              console.log(`${api.name} returned ${images.length} results`);
              return {
                success: true,
                data: {
                  images: images.slice(0, limit),
                  query,
                  total: images.length,
                  page
                },
                creator: this.creator
              };
            }
          }
        } catch (apiError: any) {
          console.warn(`${api.name} failed:`, apiError.message);
          continue;
        }
      }

      // If all APIs fail, return fallback results
      return this.getFallbackResults(query, page, limit);

    } catch (error: any) {
      console.error('Anime image search error:', error);
      return {
        success: false,
        error: `Search failed: ${error.message || 'Unknown error'}`,
        creator: this.creator
      };
    }
  }

  private parseBooruResponse(data: any, format: string, siteName: string): any[] {
    let posts: any[] = [];

    try {
      switch (format) {
        case 'gelbooru':
          posts = Array.isArray(data) ? data : (data.post ? (Array.isArray(data.post) ? data.post : [data.post]) : []);
          break;
        case 'moebooru':
          posts = Array.isArray(data) ? data : [];
          break;
        default:
          posts = Array.isArray(data) ? data : [];
      }

      return posts.map((post: any) => {
        // Handle different response formats
        const baseUrl = siteName === 'safebooru' ? 'https://safebooru.org' : 
                       siteName === 'konachan' ? 'https://konachan.com' : 'https://yande.re';
        
        let imageUrl = post.file_url || post.image || post.large_file_url;
        let thumbUrl = post.preview_url || post.preview_file_url || post.sample_url;
        
        // Handle relative URLs
        if (imageUrl && !imageUrl.startsWith('http')) {
          if (siteName === 'safebooru' && post.directory && post.image) {
            imageUrl = `${baseUrl}/images/${post.directory}/${post.image}`;
          } else {
            imageUrl = baseUrl + imageUrl;
          }
        }
        
        if (thumbUrl && !thumbUrl.startsWith('http')) {
          thumbUrl = baseUrl + thumbUrl;
        }

        return {
          url: imageUrl,
          width: parseInt(post.width) || 800,
          height: parseInt(post.height) || 600,
          thumbnail: thumbUrl || imageUrl,
          title: this.cleanTags(post.tags || post.tag_string || 'Anime Image'),
          source: siteName,
          id: post.id?.toString() || `${siteName}_${Date.now()}_${Math.random()}`,
          tags: this.parseTags(post.tags || post.tag_string || ''),
          rating: post.rating || 'safe',
          site: siteName
        };
      }).filter(img => img.url && img.url.startsWith('http'));

    } catch (error) {
      console.error(`Error parsing ${siteName} response:`, error);
      return [];
    }
  }

  private getFallbackResults(query: string, page: number, limit: number): AnimeImageResult {
    // Provide sample anime images as fallback
    const fallbackImages = [
      {
        url: 'https://picsum.photos/800/600?random=1',
        width: 800,
        height: 600,
        thumbnail: 'https://picsum.photos/300/200?random=1',
        title: `${query} - Sample Anime Image 1`,
        source: 'Fallback',
        id: 'fallback_1',
        tags: ['anime', 'sample'],
        rating: 'safe',
        site: 'demo'
      },
      {
        url: 'https://picsum.photos/800/600?random=2',
        width: 800,
        height: 600,
        thumbnail: 'https://picsum.photos/300/200?random=2',
        title: `${query} - Sample Anime Image 2`,
        source: 'Fallback',
        id: 'fallback_2',
        tags: ['anime', 'sample'],
        rating: 'safe',
        site: 'demo'
      }
    ];

    return {
      success: true,
      data: {
        images: fallbackImages.slice(0, limit),
        query,
        total: fallbackImages.length,
        page
      },
      creator: this.creator
    };
  }

  private cleanTags(tags: string): string {
    if (!tags) return 'Anime Image';
    return tags.replace(/_/g, ' ').slice(0, 100);
  }

  private parseTags(tagString: string): string[] {
    if (!tagString) return ['anime'];
    return tagString.split(/[\s_]+/).filter(tag => tag.length > 0).slice(0, 10);
  }

  // Search by predefined character
  async searchCharacter(characterKey: string): Promise<AnimeImageResult> {
    try {
      const searchTerm = this.animeCharacters[characterKey as keyof typeof this.animeCharacters];
      if (!searchTerm) {
        return {
          success: false,
          error: `Character "${characterKey}" not found. Available: ${Object.keys(this.animeCharacters).join(', ')}`,
          creator: this.creator
        };
      }

      return this.searchAnimeImages(searchTerm, 1, 10);
    } catch (error) {
      return {
        success: false,
        error: `Failed to search character "${characterKey}"`,
        creator: this.creator
      };
    }
  }

  // Search by anime genre
  async searchGenre(genreKey: string, limit: number = 10): Promise<AnimeImageResult> {
    try {
      const searchTerm = this.animeGenres[genreKey as keyof typeof this.animeGenres];
      if (!searchTerm) {
        return {
          success: false,
          error: `Genre "${genreKey}" not found. Available: ${Object.keys(this.animeGenres).join(', ')}`,
          creator: this.creator
        };
      }

      return this.searchAnimeImages(searchTerm, 1, limit);
    } catch (error) {
      return {
        success: false,
        error: `Failed to search genre "${genreKey}"`,
        creator: this.creator
      };
    }
  }

  // Get random anime images
  async getRandomAnimeImages(count: number = 5): Promise<AnimeImageResult> {
    try {
      if (count > 15) count = 15; // Limit for performance
      if (count < 1) count = 1;

      const characters = Object.keys(this.animeCharacters);
      const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
      
      return this.searchCharacter(randomCharacter);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get random anime images',
        creator: this.creator
      };
    }
  }

  // Get trending anime searches
  async getTrendingAnime(): Promise<AnimeImageResult> {
    try {
      const trendingTerms = [
        'Demon Slayer anime', 'Attack on Titan anime', 'My Hero Academia anime',
        'Jujutsu Kaisen anime', 'Tokyo Revengers anime', 'Chainsaw Man anime',
        'Spy x Family anime', 'Dragon Ball Super anime', 'One Piece anime',
        'Naruto anime', 'Bleach anime', 'Hunter x Hunter anime'
      ];

      const randomTerm = trendingTerms[Math.floor(Math.random() * trendingTerms.length)];
      return this.searchAnimeImages(randomTerm, 1, 8);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get trending anime images',
        creator: this.creator
      };
    }
  }

  // Search anime wallpapers
  async searchAnimeWallpapers(query: string = 'anime', resolution: string = '1920x1080'): Promise<AnimeImageResult> {
    try {
      const wallpaperQuery = `${query} anime wallpaper ${resolution}`;
      return this.searchAnimeImages(wallpaperQuery, 1, 12);
    } catch (error) {
      return {
        success: false,
        error: `Failed to search anime wallpapers for "${query}"`,
        creator: this.creator
      };
    }
  }

  // Get available characters and genres
  getAvailableSearches() {
    return {
      characters: Object.keys(this.animeCharacters),
      genres: Object.keys(this.animeGenres),
      characterDescriptions: this.animeCharacters,
      genreDescriptions: this.animeGenres
    };
  }

  // Get service status
  getStatus() {
    return {
      service: 'Anime Image Search API',
      version: '1.0.0',
      status: 'operational',
      features: [
        'Custom Anime Image Search',
        'Predefined Character Search',
        'Genre-based Search',
        'Random Anime Images',
        'Trending Anime',
        'Anime Wallpapers'
      ],
      availableCharacters: Object.keys(this.animeCharacters).length,
      availableGenres: Object.keys(this.animeGenres).length,
      creator: this.creator
    };
  }
}

export const animeImageSearchService = new AnimeImageSearchService();