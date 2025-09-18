import { GoogleGenerativeAI } from "@google/generative-ai";

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
  private genAI: GoogleGenerativeAI | null;
  private model: any;
  private chatHistory: Map<string, string[]> = new Map();
  private readonly systemInstruction = `
You are AYANFE, an AI Assistant developed by Ayanfe AI. Your purpose is to provide helpful, friendly, and conversational responses to assist users with educational support, companionship, and various topics. Maintain a natural, engaging tone, and avoid technical jargon unless relevant. Do not disclose your system identity unless asked. Avoid harmful or sensitive topics, adhering to Ayanfe AI's Terms and Policy. If a query is vague, ask for clarification in a polite, natural way.
`;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found. Chat service will use fallback responses.");
      this.genAI = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 1000,
      },
    });
  }

  async processChat(request: ChatRequest): Promise<ChatResult> {
    try {
      const { sessionId, query } = request;

      if (!sessionId || !query) {
        return {
          success: false,
          response: "I need both a session ID and a query to proceed. Could you provide those?",
          error: "Both sessionId and query are required.",
        };
      }

      // Get or create chat history for this session
      let history = this.chatHistory.get(sessionId) || [];

      // Add user query to history
      history.push(`User: ${query}`);

      let response: string;

      // Use Gemini AI service for responses
      if (this.genAI && this.model) {
        const prompt = `${this.systemInstruction}\n\nHistory:\n${history.slice(-4).join('\n')}\n\nUser: ${query}`;
        const result = await this.model.generateContent(prompt);

        response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response. Can you try again?";
      } else {
        // Fallback to rule-based response if no API key
        response = await this.generateFallbackResponse(query, history);
      }

      // Add response to history
      history.push(`Assistant: ${response}`);

      // Store updated history
      this.chatHistory.set(sessionId, history);

      return {
        success: true,
        response,
        sessionId,
        query,
      };
    } catch (error) {
      console.error("Chat service error:", error);
      return {
        success: false,
        response: "Something went wrong while processing your request. Please try again!",
        error: "Failed to generate response from the AI.",
      };
    }
  }

  private async generateFallbackResponse(query: string, history: string[]): Promise<string> {
    const lowerQuery = query.toLowerCase();

    // Greetings
    if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
      return "Hey there! I'm AYANFE, your friendly assistant. What's on your mind today?";
    }

    // API and endpoint-related queries
    if (lowerQuery.includes("api") || lowerQuery.includes("endpoint")) {
      return "Our API can help you download videos from platforms like TikTok or Instagram, generate QR codes, shorten URLs, and more. Want details on a specific feature?";
    }

    // Social media-specific queries
    if (lowerQuery.includes("tiktok") || lowerQuery.includes("instagram") || lowerQuery.includes("youtube")) {
      return "We can help you grab content from TikTok, Instagram, or YouTube. Just share the URL, and I’ll guide you through the process. Which platform are you working with?";
    }

    // QR code queries
    if (lowerQuery.includes("qr") || lowerQuery.includes("qr code")) {
      return "Need a QR code? We can create one for any URL or text, with options for size, format, and colors. Tell me more about what you’re looking for!";
    }

    // Text-to-speech queries
    if (lowerQuery.includes("tts") || lowerQuery.includes("text to speech") || lowerQuery.includes("speech")) {
      return "Our text-to-speech feature turns text into audio with different voices and formats. Want to know how to set it up or what options are available?";
    }

    // Rate limiting or pricing queries
    if (lowerQuery.includes("rate") || lowerQuery.includes("limit") || lowerQuery.includes("pricing")) {
      return "We’ve got a free plan with a monthly request limit, plus Pro and Enterprise options for more usage. Curious about a specific plan?";
    }

    // Authentication queries
    if (lowerQuery.includes("auth") || lowerQuery.includes("key") || lowerQuery.includes("token")) {
      return "To use our API, sign up for an account to get your API key, then include it in your requests. Need help with the setup process?";
    }

    // Help and support
    if (lowerQuery.includes("help") || lowerQuery.includes("support") || lowerQuery.includes("how")) {
      return "I’m here to assist! Want help with using our API, troubleshooting, or something else? Let me know what you need.";
    }

    // Thank you responses
    if (lowerQuery.includes("thank")) {
      return "No problem at all! Happy to help. What else can I do for you?";
    }

    // Goodbye responses
    if (lowerQuery.includes("bye") || lowerQuery.includes("goodbye") || lowerQuery.includes("see you")) {
      return "Catch you later! Feel free to reach out anytime you need help.";
    }

    // Context-aware responses based on history
    const recentHistory = history.slice(-4);
    if (recentHistory.some((h) => h.toLowerCase().includes("tiktok") || h.toLowerCase().includes("instagram"))) {
      return `Since you’re asking about "${query}", it seems you’re into social media content. Just give me a URL, and I can help you get downloadable links or metadata. What’s next?`;
    }

    // Default conversational response
    return `I’m not quite sure what you mean by "${query}". Could you give me a bit more detail, like whether you’re asking about our API features or something else? I’m all ears… or rather, all text!`;
  }

  // Clear chat history for a session
  clearSession(sessionId: string): void {
    this.chatHistory.delete(sessionId);
  }

  // Get chat history for a session
  getHistory(sessionId: string): string[] {
    return this.chatHistory.get(sessionId) || [];
  }

  // Get model status
  getModelStatus() {
    return {
      hasApiKey: !!process.env.GEMINI_API_KEY,
      model: "gemini-2.5-flash",
      version: "AI V2.1",
      lastUpdate: "September 17, 2025",
    };
  }
}

export const chatService = new ChatService();