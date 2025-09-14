import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VaneaAIRequest {
  text: string;
}

export interface VaneaAIResponse {
  success: boolean;
  response: string;
  query: string;
  creator: string;
  error?: string;
}

export class VaneaAIService {
  private readonly creator = 'Broken VZN';
  private genAI: GoogleGenerativeAI | null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GOOGLE_API_KEY/GEMINI_API_KEY not found. VANEA AI service will use demo responses.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  async chat(request: VaneaAIRequest): Promise<VaneaAIResponse> {
    try {
      const { text } = request;

      if (!text || text.trim().length === 0) {
        return {
          success: false,
          response: '',
          query: text,
          creator: this.creator,
          error: 'Text parameter is required'
        };
      }

      // Return error if API key is not available
      if (!this.genAI) {
        return {
          success: false,
          response: '',
          query: text,
          creator: this.creator,
          error: 'GEMINI_API_KEY not configured. Please set your Google Gemini API key in environment variables to use VANEA AI.'
        };
      }

      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      // Add context to make responses more helpful
      const prompt = `You are VANEA, an AI assistant created by Broken VZN. You are helpful, informative, and friendly. Please respond to this question or request: ${text}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      
      // Handle potential safety blocks
      if (response.promptFeedback?.blockReason) {
        return {
          success: false,
          response: '',
          query: text,
          creator: this.creator,
          error: `Content blocked: ${response.promptFeedback.blockReason}`
        };
      }

      const responseText = response.text();

      if (!responseText) {
        return {
          success: false,
          response: '',
          query: text,
          creator: this.creator,
          error: 'No response generated'
        };
      }

      return {
        success: true,
        response: responseText,
        query: text,
        creator: this.creator
      };

    } catch (error) {
      console.error('VANEA AI error:', error);
      return {
        success: false,
        response: '',
        query: request.text,
        creator: this.creator,
        error: 'Failed to generate response'
      };
    }
  }
}

export const vaneaAIService = new VaneaAIService();