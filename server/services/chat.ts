import { grokService } from './grok';

export interface ChatRequest {
  sessionId: string;
  query: string;
}

export interface ChatResult {
  success: boolean;
  response?: string;
  sessionId?: string;
  query?: string;
  error?: string;
}

export class ChatService {
  private chatHistory: Map<string, string[]> = new Map();

  async processChat(request: ChatRequest): Promise<ChatResult> {
    try {
      const { sessionId, query } = request;

      if (!sessionId || !query) {
        return {
          success: false,
          error: 'Both sessionId and query are required.'
        };
      }

      // Get or create chat history for this session
      let history = this.chatHistory.get(sessionId) || [];
      
      // Add user query to history
      history.push(`User: ${query}`);

      // Use Grok AI service for intelligent responses
      const grokResponse = await grokService.chat({
        message: query,
        model: 'grok-2-1212',
        max_tokens: 1000,
        temperature: 0.7
      });

      let response: string;
      
      if (grokResponse.success && grokResponse.response) {
        response = grokResponse.response;
      } else {
        // Fallback to rule-based response if Grok service fails
        response = await this.generateFallbackResponse(query, history);
      }
      
      // Add response to history
      history.push(`Assistant: ${response}`);
      
      // Store updated history
      this.chatHistory.set(sessionId, history);

      return {
        success: true,
        response: response,
        sessionId: sessionId,
        query: query
      };
    } catch (error) {
      console.error('Chat service error:', error);
      return {
        success: false,
        error: 'Failed to generate response from the AI.'
      };
    }
  }

  private async generateFallbackResponse(query: string, history: string[]): Promise<string> {
    // Enhanced rule-based responses for better user experience
    // In production, this would integrate with OpenAI, Claude, or another AI service
    
    const lowerQuery = query.toLowerCase();
    
    // Greetings
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return "Hello! I'm the BrokenVZN API assistant. I can help you with our social media downloading services, utility tools, and answer questions about our API endpoints. What would you like to know?";
    }
    
    // API and endpoint related queries
    if (lowerQuery.includes('api') || lowerQuery.includes('endpoint')) {
      return "Our API provides comprehensive services including:\n• TikTok & Instagram video downloading\n• YouTube video information\n• QR code generation\n• URL shortening\n• Text-to-speech conversion\n• Password generation\n• Image search\n• Random quotes and more!\n\nEach endpoint requires an API key. Would you like details about a specific service?";
    }
    
    // Social media specific queries
    if (lowerQuery.includes('tiktok') || lowerQuery.includes('instagram') || lowerQuery.includes('youtube')) {
      return "Yes! We support downloading content from major social platforms:\n• TikTok: /api/tiktok/download\n• Instagram: /api/instagram/download\n• YouTube: /api/youtube/info\n\nJust provide the URL and we'll handle the rest. All downloads respect platform terms of service.";
    }
    
    // QR code queries
    if (lowerQuery.includes('qr') || lowerQuery.includes('qr code')) {
      return "Our QR code service (/api/qr/generate) can create custom QR codes with options for:\n• Size adjustment\n• PNG or SVG format\n• Error correction levels\n• Custom colors\n• Custom margins\n\nPerfect for marketing campaigns, contact info, or any text/URL encoding!";
    }
    
    // TTS queries
    if (lowerQuery.includes('tts') || lowerQuery.includes('text to speech') || lowerQuery.includes('speech')) {
      return "Our text-to-speech service (/api/tts/generate) converts text to natural-sounding audio with:\n• Multiple voice options\n• Adjustable speed and pitch\n• MP3, WAV, or OGG formats\n• SSML support for advanced control\n• Up to 5000 characters per request";
    }
    
    // Rate limiting queries
    if (lowerQuery.includes('rate') || lowerQuery.includes('limit') || lowerQuery.includes('pricing')) {
      return "We offer three tiers:\n• Free: 1,000 requests/month\n• Pro: 100,000 requests/month\n• Enterprise: Unlimited requests\n\nAll plans include the same features with different usage limits. Rate limits reset monthly.";
    }
    
    // Authentication queries
    if (lowerQuery.includes('auth') || lowerQuery.includes('key') || lowerQuery.includes('token')) {
      return "Authentication is simple:\n1. Register for an account at /api/auth/register\n2. Include your API key in requests via:\n   • Header: x-api-key\n   • Query parameter: ?apiKey=your_key\n\nYour API key is provided upon registration and tied to your usage tier.";
    }
    
    // Help and support
    if (lowerQuery.includes('help') || lowerQuery.includes('support') || lowerQuery.includes('how')) {
      return "I'm here to help! You can ask me about:\n• Specific API endpoints and their usage\n• Authentication and API keys\n• Rate limits and pricing\n• Supported file formats\n• Error troubleshooting\n• Integration examples\n\nWhat specific topic would you like help with?";
    }
    
    // Thank you responses
    if (lowerQuery.includes('thank')) {
      return "You're very welcome! I'm glad I could help. Feel free to ask if you have more questions about the BrokenVZN API or need assistance with integration. Happy coding! 🚀";
    }
    
    // Goodbye responses
    if (lowerQuery.includes('bye') || lowerQuery.includes('goodbye') || lowerQuery.includes('see you')) {
      return "Goodbye! Thanks for using BrokenVZN API. Don't hesitate to reach out if you need any assistance with our services. Have a great day!";
    }
    
    // Context-aware responses based on history
    const recentHistory = history.slice(-4); // Last 2 exchanges
    if (recentHistory.some(h => h.includes('tiktok') || h.includes('instagram'))) {
      return `Regarding "${query}" - if you're working with social media content, remember that our API handles the heavy lifting for content extraction. You just need to provide valid URLs and we'll return structured data with download links, metadata, and thumbnails where available.`;
    }
    
    // Default intelligent response
    const responses = [
      `Great question about "${query}"! While I can provide detailed information about our API services, could you be more specific? For example, are you interested in social media downloading, utility tools, or something else?`,
      `I'd be happy to help with "${query}". Our API covers a wide range of services from content downloading to utility tools. Which specific area interests you most?`,
      `Thanks for asking about "${query}". To give you the most helpful response, could you clarify if you're looking for endpoint documentation, usage examples, or integration guidance?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Clear chat history for a session
  clearSession(sessionId: string): void {
    this.chatHistory.delete(sessionId);
  }

  // Get chat history for a session
  getHistory(sessionId: string): string[] {
    return this.chatHistory.get(sessionId) || [];
  }
}

export const chatService = new ChatService();