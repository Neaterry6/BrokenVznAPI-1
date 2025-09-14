import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export interface ImageCollectionRequest {
  type: string;
}

export interface ImageCollectionResponse {
  success: boolean;
  type: string;
  image_url: string;
  creator: string;
  error?: string;
}

export interface QuoteResponse {
  success: boolean;
  quote: string;
  character: string;
  creator: string;
  error?: string;
}

export interface StoryResponse {
  success: boolean;
  story: string;
  creator: string;
  error?: string;
}

export class ImageCollectionsService {
  private readonly creator = 'Broken VZN';
  private readonly dataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data');
  private imageCollections: { [key: string]: string[] } = {};
  private quotes: any[] = [];
  private stories: any[] = [];

  constructor() {
    this.loadCollections();
  }

  private loadCollections() {
    const collections = [
      'aesthetic', 'cosplay', 'husbu', 'loli', 'milf', 
      'nekonime', 'shota', 'waifu', 'wallml', 'tebakgambar'
    ];

    for (const collection of collections) {
      try {
        const filePath = path.join(this.dataPath, `${collection}.json`);
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          this.imageCollections[collection] = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        console.error(`Error loading ${collection}:`, error);
        this.imageCollections[collection] = [];
      }
    }

    // Load quotes
    try {
      const quotesPath = path.join(this.dataPath, 'quotenime.json');
      if (fs.existsSync(quotesPath)) {
        this.quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      this.quotes = [];
    }

    // Load stories
    try {
      const storiesPath = path.join(this.dataPath, 'storyanime.json');
      if (fs.existsSync(storiesPath)) {
        this.stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      this.stories = [];
    }
  }

  async getRandomImage(request: ImageCollectionRequest): Promise<ImageCollectionResponse> {
    try {
      const { type } = request;

      if (!type || !this.imageCollections[type]) {
        return {
          success: false,
          type,
          image_url: '',
          creator: this.creator,
          error: `Image type '${type}' not found. Available types: ${Object.keys(this.imageCollections).join(', ')}`
        };
      }

      const images = this.imageCollections[type];
      if (images.length === 0) {
        return {
          success: false,
          type,
          image_url: '',
          creator: this.creator,
          error: `No images available for type '${type}'`
        };
      }

      const randomIndex = Math.floor(Math.random() * images.length);
      const selectedImage = images[randomIndex];

      return {
        success: true,
        type,
        image_url: selectedImage,
        creator: this.creator
      };

    } catch (error) {
      console.error('Image collection error:', error);
      return {
        success: false,
        type: request.type,
        image_url: '',
        creator: this.creator,
        error: 'Failed to get random image'
      };
    }
  }

  async getRandomQuote(): Promise<QuoteResponse> {
    try {
      if (this.quotes.length === 0) {
        return {
          success: false,
          quote: '',
          character: '',
          creator: this.creator,
          error: 'No quotes available'
        };
      }

      const randomIndex = Math.floor(Math.random() * this.quotes.length);
      const selectedQuote = this.quotes[randomIndex];

      return {
        success: true,
        quote: selectedQuote.quote || 'No quote available',
        character: selectedQuote.char || 'Unknown Character',
        creator: this.creator
      };

    } catch (error) {
      console.error('Quote error:', error);
      return {
        success: false,
        quote: '',
        character: '',
        creator: this.creator,
        error: 'Failed to get random quote'
      };
    }
  }

  async getRandomStory(): Promise<StoryResponse> {
    try {
      if (this.stories.length === 0) {
        return {
          success: false,
          story: '',
          creator: this.creator,
          error: 'No stories available'
        };
      }

      const randomIndex = Math.floor(Math.random() * this.stories.length);
      const selectedStory = this.stories[randomIndex];

      return {
        success: true,
        story: typeof selectedStory === 'string' ? selectedStory : selectedStory.story || 'No story available',
        creator: this.creator
      };

    } catch (error) {
      console.error('Story error:', error);
      return {
        success: false,
        story: '',
        creator: this.creator,
        error: 'Failed to get random story'
      };
    }
  }

  async getTebakGambar(): Promise<ImageCollectionResponse> {
    return this.getRandomImage({ type: 'tebakgambar' });
  }

  getAvailableTypes(): string[] {
    return Object.keys(this.imageCollections);
  }

  getCollectionStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    for (const [type, images] of Object.entries(this.imageCollections)) {
      stats[type] = images.length;
    }
    stats['quotes'] = this.quotes.length;
    stats['stories'] = this.stories.length;
    return stats;
  }
}

export const imageCollectionsService = new ImageCollectionsService();