import axios from 'axios';

export interface URLTestRequest {
  url: string;
}

export interface URLTestResponse {
  success: boolean;
  url: string;
  status: number;
  message: string;
  preview?: string;
  creator: string;
  error?: string;
}

export class URLTesterService {
  private readonly creator = 'Broken VZN';

  async testURL(request: URLTestRequest): Promise<URLTestResponse> {
    try {
      const { url } = request;

      if (!url || !url.startsWith('http')) {
        return {
          success: false,
          url,
          status: 0,
          message: 'Invalid or missing URL. URL must start with http:// or https://',
          creator: this.creator,
          error: 'Invalid URL format'
        };
      }

      const response = await axios.get(url, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // Try to parse as JSON for API responses
      let preview = '';
      try {
        const jsonData = response.data;
        if (typeof jsonData === 'object') {
          preview = JSON.stringify(jsonData).substring(0, 300);
        } else {
          preview = String(response.data).substring(0, 300);
        }
      } catch {
        preview = String(response.data).substring(0, 300);
      }

      return {
        success: true,
        url,
        status: response.status,
        message: `URL responded with ${response.status} OK`,
        preview: preview + (preview.length >= 300 ? '...' : ''),
        creator: this.creator
      };

    } catch (error) {
      console.error('URL test error:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 0;
        const message = error.response ? 
          `URL responded with ${status} - ${error.message}` : 
          `Could not connect to ${request.url} - ${error.message}`;
        
        return {
          success: false,
          url: request.url,
          status,
          message,
          creator: this.creator,
          error: error.message
        };
      }

      return {
        success: false,
        url: request.url,
        status: 0,
        message: `Could not connect to ${request.url} - Unknown error`,
        creator: this.creator,
        error: 'Network error'
      };
    }
  }
}

export const urlTesterService = new URLTesterService();