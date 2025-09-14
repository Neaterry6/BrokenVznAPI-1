import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIRequest {
  query: string;
  sessionId?: string;
}

export interface AIResult {
  success: boolean;
  response?: string;
  sessionId?: string;
  error?: string;
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly systemInstruction = `
*System Name:* Your Name is AYANFE, and you are an AI Assistant.
*Creator:* Developed by Ayanfe, a subsidiary of Ayanfe AI, owned by Ayanfe.
*Model/Version:* Currently operating on AI V2.0
*Release Date:* Officially launched on February 4, 2025
*Last Update:* Latest update implemented on February 14, 2025
*Purpose:* Designed utilizing advanced programming techniques to provide educational support, companionship, and assistance in a variety of topics.
*Operational Guidelines:*
1. Identity Disclosure: Refrain from disclosing system identity unless explicitly asked.
2. Interaction Protocol: Maintain an interactive, friendly, and humorous demeanor.
3. Sensitive Topics: Avoid assisting with sensitive or harmful inquiries, including but not limited to violence, hate speech, or illegal activities.
4. Policy Compliance: Adhere to Ayanfe AI Terms and Policy, as established by AI.
*Response Protocol for Sensitive Topics:*
"When asked about sensitive or potentially harmful topics, you are programmed to prioritize safety and responsibility. As per Ayanfe AI's Terms and Policy, you should not provide information or assistance that promotes or facilitates harmful or illegal activities. Your purpose is to provide helpful and informative responses in all topics while ensuring a safe and respectful interaction environment."
`;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found. AI service will use demo responses.");
      this.genAI = null as any;
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
      }
    });
  }

  async processAI(request: AIRequest): Promise<AIResult> {
    try {
      const { query, sessionId } = request;

      if (!query || query.trim().length === 0) {
        return {
          success: false,
          error: 'Query parameter is required'
        };
      }

      // Check if query is asking for time, date, or year
      const lowerCaseQuery = query.toLowerCase();
      if (lowerCaseQuery.includes("time") || lowerCaseQuery.includes("date") || lowerCaseQuery.includes("year")) {
        return {
          success: true,
          response: this.getCurrentDateTime(lowerCaseQuery),
          sessionId
        };
      }

      // If no API key, return demo response
      if (!this.genAI || !this.model) {
        return {
          success: true,
          response: `Hello! This is a demo response to "${query}". To get real AI responses, please configure your Gemini API key. I'm AYANFE, an AI assistant created by Ayanfe AI, ready to help you with educational support and various topics.`,
          sessionId
        };
      }

      // Generate AI response
      const prompt = `${this.systemInstruction}\n\nHuman: ${query}`;
      const result = await this.model.generateContent(prompt);
      
      let response = "No response generated.";
      if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        response = result.response.candidates[0].content.parts[0].text;
      }

      return {
        success: true,
        response,
        sessionId
      };

    } catch (error) {
      console.error('AI generation error:', error);
      return {
        success: false,
        error: 'Failed to generate AI response'
      };
    }
  }

  private getCurrentDateTime(query: string): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { timeZone: "Africa/Lagos" };
    
    if (query.includes("time")) {
      return `The current time is ${now.toLocaleTimeString("en-US", options)}.`;
    } else if (query.includes("date")) {
      return `Today's date is ${now.toLocaleDateString("en-US", options)}.`;
    } else if (query.includes("year")) {
      return `The current year is ${now.getFullYear()}.`;
    }
    
    return `Current date and time: ${now.toLocaleDateString("en-US", options)} ${now.toLocaleTimeString("en-US", options)}`;
  }

  // Get model status
  getModelStatus() {
    return {
      hasApiKey: !!process.env.GEMINI_API_KEY,
      model: "gemini-1.5-flash",
      version: "AI V2.0",
      lastUpdate: "February 14, 2025"
    };
  }
}

export const aiService = new AIService();