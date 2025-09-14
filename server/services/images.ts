import axios from 'axios';

export interface ImageSearchResult {
  success: boolean;
  query?: string;
  images?: Array<{
    id: string;
    description: string;
    url: string;
    thumbnail: string;
  }>;
  error?: string;
  creator: string;
}

export class ImagesService {
  private readonly imageProviders = {
    unsplash: 'https://api.unsplash.com/search/photos',
    pixabay: 'https://pixabay.com/api/',
    pexels: 'https://api.pexels.com/v1/search'
  };

  async searchImages(query: string, limit: number = 10): Promise<ImageSearchResult> {
    try {
      if (!query) {
        return {
          success: false,
          error: "Search query parameter is required.",
          creator: "heisbroken"
        };
      }

      if (query.length > 100) {
        return {
          success: false,
          error: "Search query is too long (maximum 100 characters)",
          creator: "heisbroken"
        };
      }

      // Check if we have API keys for real image services
      const hasUnsplashKey = !!process.env.UNSPLASH_API_KEY;
      const hasPixabayKey = !!process.env.PIXABAY_API_KEY;
      const hasPexelsKey = !!process.env.PEXELS_API_KEY;

      if (hasUnsplashKey) {
        return await this.searchUnsplash(query, limit);
      } else if (hasPixabayKey) {
        return await this.searchPixabay(query, limit);
      } else if (hasPexelsKey) {
        return await this.searchPexels(query, limit);
      }

      // Fallback to enhanced placeholder with more realistic data
      return this.generatePlaceholderImages(query, limit);

    } catch (error) {
      console.error("Error fetching images:", error);
      return {
        success: false,
        error: "An error occurred while fetching images. Please try again.",
        creator: "heisbroken"
      };
    }
  }

  private async searchUnsplash(query: string, limit: number): Promise<ImageSearchResult> {
    try {
      const response = await axios.get(this.imageProviders.unsplash, {
        params: {
          query,
          per_page: Math.min(limit, 30),
          client_id: process.env.UNSPLASH_API_KEY
        }
      });

      if (response.data && response.data.results.length > 0) {
        return {
          success: true,
          query,
          images: response.data.results.map((image: any) => ({
            id: image.id,
            description: image.description || image.alt_description || "Beautiful image",
            url: image.urls.full,
            thumbnail: image.urls.thumb
          }))
        };
      } else {
        return {
          success: false,
          error: `No images found for query: ${query}`
        };
      }
    } catch (error) {
      console.error("Unsplash API error:", error);
      return this.generatePlaceholderImages(query, limit);
    }
  }

  private async searchPixabay(query: string, limit: number): Promise<ImageSearchResult> {
    try {
      const response = await axios.get(this.imageProviders.pixabay, {
        params: {
          q: query,
          per_page: Math.min(limit, 20),
          key: process.env.PIXABAY_API_KEY,
          image_type: 'photo',
          safesearch: 'true'
        }
      });

      if (response.data && response.data.hits.length > 0) {
        return {
          success: true,
          query,
          images: response.data.hits.map((image: any) => ({
            id: image.id.toString(),
            description: image.tags || "High-quality image",
            url: image.largeImageURL,
            thumbnail: image.previewURL
          }))
        };
      } else {
        return {
          success: false,
          error: `No images found for query: ${query}`
        };
      }
    } catch (error) {
      console.error("Pixabay API error:", error);
      return this.generatePlaceholderImages(query, limit);
    }
  }

  private async searchPexels(query: string, limit: number): Promise<ImageSearchResult> {
    try {
      const response = await axios.get(this.imageProviders.pexels, {
        params: {
          query,
          per_page: Math.min(limit, 15)
        },
        headers: {
          'Authorization': process.env.PEXELS_API_KEY
        }
      });

      if (response.data && response.data.photos.length > 0) {
        return {
          success: true,
          query,
          images: response.data.photos.map((image: any) => ({
            id: image.id.toString(),
            description: image.alt || "Professional photo",
            url: image.src.large,
            thumbnail: image.src.small
          }))
        };
      } else {
        return {
          success: false,
          error: `No images found for query: ${query}`
        };
      }
    } catch (error) {
      console.error("Pexels API error:", error);
      return this.generatePlaceholderImages(query, limit);
    }
  }

  private generatePlaceholderImages(query: string, limit: number): ImageSearchResult {
    const images = [];
    const queryWords = query.split(' ');
    const seed = query.toLowerCase().charCodeAt(0) * 1000;

    for (let i = 0; i < Math.min(limit, 12); i++) {
      const uniqueSeed = seed + i;
      images.push({
        id: `demo-${uniqueSeed}`,
        description: `${queryWords.join(' ')} - Professional stock photo #${i + 1}`,
        url: `https://picsum.photos/seed/${uniqueSeed}/800/600`,
        thumbnail: `https://picsum.photos/seed/${uniqueSeed}/200/200`
      });
    }

    return {
      success: true,
      query,
      images
    };
  }

  // Method to get supported providers and their status
  getProviderStatus() {
    return {
      unsplash: !!process.env.UNSPLASH_API_KEY,
      pixabay: !!process.env.PIXABAY_API_KEY,
      pexels: !!process.env.PEXELS_API_KEY
    };
  }
}

export const imagesService = new ImagesService();