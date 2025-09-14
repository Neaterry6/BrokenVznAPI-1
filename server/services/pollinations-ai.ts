import axios from 'axios';

export interface PollinationsRequest {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  model?: string;
}

export interface PollinationsResponse {
  success: boolean;
  image_url: string;
  prompt: string;
  parameters: {
    width: number;
    height: number;
    seed: number;
    model: string;
  };
  creator: string;
  note?: string;
  error?: string;
}

export class PollinationsAIService {
  private readonly creator = 'Broken VZN';

  async generateImage(request: PollinationsRequest): Promise<PollinationsResponse> {
    try {
      const { 
        prompt, 
        width = 512, 
        height = 512, 
        seed = -1, 
        model = 'flux' 
      } = request;

      if (!prompt || prompt.trim().length === 0) {
        return {
          success: false,
          image_url: '',
          prompt,
          parameters: { width, height, seed, model },
          creator: this.creator,
          error: 'Prompt is required'
        };
      }

      // Validate dimensions
      if (width <= 0 || height <= 0 || width > 2048 || height > 2048) {
        return {
          success: false,
          image_url: '',
          prompt,
          parameters: { width, height, seed, model },
          creator: this.creator,
          error: 'Width and height must be between 1 and 2048'
        };
      }

      // Encode prompt for URL
      const encodedPrompt = encodeURIComponent(prompt.trim());
      
      // Build Pollinations URL
      const baseUrl = 'https://image.pollinations.ai/prompt';
      
      // Add parameters to URL
      const params: string[] = [];
      if (width !== 512) params.push(`width=${width}`);
      if (height !== 512) params.push(`height=${height}`);
      if (seed !== -1) params.push(`seed=${seed}`);
      if (model !== 'flux') params.push(`model=${model}`);
      
      // Construct final URL
      let imageUrl = `${baseUrl}/${encodedPrompt}`;
      if (params.length > 0) {
        imageUrl += '?' + params.join('&');
      }

      // Test if the image is accessible with a head request
      try {
        const response = await axios.head(imageUrl, { timeout: 30000 });
        
        if (response.status === 200) {
          return {
            success: true,
            image_url: imageUrl,
            prompt,
            parameters: { width, height, seed, model },
            creator: this.creator
          };
        } else {
          return {
            success: false,
            image_url: '',
            prompt,
            parameters: { width, height, seed, model },
            creator: this.creator,
            error: `Image generation failed with status: ${response.status}`
          };
        }
      } catch (timeoutError) {
        // Return URL anyway as Pollinations might be slow but working
        return {
          success: true,
          image_url: imageUrl,
          prompt,
          parameters: { width, height, seed, model },
          creator: this.creator,
          note: 'Image generation may take some time to complete'
        };
      }

    } catch (error) {
      console.error('Pollinations AI error:', error);
      return {
        success: false,
        image_url: '',
        prompt: request.prompt,
        parameters: {
          width: request.width || 512,
          height: request.height || 512,
          seed: request.seed || -1,
          model: request.model || 'flux'
        },
        creator: this.creator,
        error: 'Failed to generate image'
      };
    }
  }

  getSupportedModels(): string[] {
    return ['flux', 'turbo', 'playground'];
  }

  getRecommendedSizes(): Array<{name: string, width: number, height: number}> {
    return [
      { name: 'Square', width: 512, height: 512 },
      { name: 'Portrait', width: 512, height: 768 },
      { name: 'Landscape', width: 768, height: 512 },
      { name: 'Wide', width: 1024, height: 512 },
      { name: 'Tall', width: 512, height: 1024 }
    ];
  }
}

export const pollinationsAIService = new PollinationsAIService();