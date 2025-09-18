import { GoogleGenAI, Modality } from "@google/genai";
import axios from "axios";

export interface GeminiChatRequest {
  message: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  history?: ChatMessage[];
}

export interface GeminiImageChatRequest {
  message: string;
  image: string; // base64 image data
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: "user" | "model";
  parts: Array<{ text?: string; inlineData?: any }>;
}

export interface GeminiResponse {
  success: boolean;
  response?: string;
  data?: {
    response: string;
    model: string;
    usage?: any;
  };
  error?: string;
  creator: string;
}

export interface GeminiImageResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    description: string;
    model: string;
  };
  error?: string;
  creator: string;
}

export interface ModelInfo {
  name: string;
  description: string;
  capabilities: string[];
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

export class GeminiService {
  private creator = "@BrokenVZN";
  private ai: GoogleGenAI | null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    if (!this.apiKey) {
      console.warn("GEMINI_API_KEY not found. AI service will use demo responses.");
      this.ai = null;
    } else {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  // Try multiple image hosting services
  private async uploadToImageHost(imageData: string): Promise<string> {
    // Try ImgBB first
    try {
      const imgbbApiKey = process.env.IMGBB_API_KEY;
      if (imgbbApiKey) {
        const formData = new URLSearchParams();
        formData.append("image", imageData);

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 30000,
        });

        if (response.data?.data?.url) {
          return response.data.data.url;
        }
      }
    } catch (error) {
      console.warn("ImgBB upload failed:", error);
    }

    // Fallback to a simple image hosting service
    try {
      const formData = new URLSearchParams();
      formData.append("image", imageData);

      const response = await axios.post("https://api.imageupload.net/upload.php", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 30000,
      });

      if (response.data?.url) {
        return response.data.url;
      }
    } catch (error) {
      console.warn("ImageUpload.net upload failed:", error);
    }

    // Fallback URL if all uploads fail
    return "https://placehold.co/600x400?text=Image+Upload+Failed";
  }

  async chat(request: GeminiChatRequest): Promise<GeminiResponse> {
    try {
      const { message, model = "gemini-2.5-flash", max_tokens = 1000, temperature = 0.7, history } = request;

      if (!message?.trim()) {
        return {
          success: false,
          error: "I need a message to work with. What do you want to talk about?",
          creator: this.creator,
        };
      }

      // Return demo response if API key is not available
      if (!this.ai) {
        return {
          success: true,
          response: "Hey! This is a demo response from AYANFE. Set up your GEMINI_API_KEY to get real answers. What can I help you with?",
          creator: this.creator,
        };
      }

      const result = await this.ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
        config: {
          maxOutputTokens: max_tokens,
          temperature: temperature,
        },
      });

      let responseText = "Sorry, I couldn’t generate a response. Can you try again?";
      if (result.candidates && result.candidates.length > 0) {
        const candidate = result.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          responseText = candidate.content.parts[0].text || responseText;
        }
      }

      return {
        success: true,
        response: responseText,
        creator: this.creator,
      };
    } catch (error) {
      console.error("Gemini chat error:", error);
      return {
        success: false,
        error: "Something went wrong while chatting. Want to try again?",
        creator: this.creator,
      };
    }
  }

  async chatWithImage(request: GeminiImageChatRequest): Promise<GeminiResponse> {
    try {
      const { message, image, model = "gemini-2.5-pro", max_tokens = 1000, temperature = 0.7 } = request;

      if (!message?.trim()) {
        return {
          success: false,
          error: "Please include a message with your image.",
          creator: this.creator,
        };
      }

      if (!image) {
        return {
          success: false,
          error: "An image is required for this request.",
          creator: this.creator,
        };
      }

      // Parse base64 image data
      let imageData: string;
      let mimeType: string;

      if (image.startsWith("data:")) {
        const [header, data] = image.split(",");
        mimeType = header.split(";")[0].split(":")[1];
        imageData = data;
      } else {
        imageData = image;
        mimeType = "image/jpeg"; // default
      }

      const contents = [
        {
          inlineData: {
            data: imageData,
            mimeType: mimeType,
          },
        },
        message,
      ];

      // Return demo response if API key is not available
      if (!this.ai) {
        return {
          success: true,
          response: "This is a demo response for image chat from AYANFE. Your image was processed, but please set up your GEMINI_API_KEY for real responses.",
          creator: this.creator,
        };
      }

      const result = await this.ai.models.generateContent({
        model,
        contents: contents,
        config: {
          maxOutputTokens: max_tokens,
          temperature: temperature,
        },
      });

      return {
        success: true,
        response: result.text || "No response generated. Try again?",
        creator: this.creator,
      };
    } catch (error) {
      console.error("Gemini image chat error:", error);
      return {
        success: false,
        error: "Couldn’t process the image chat. Please try again!",
        creator: this.creator,
      };
    }
  }

  async summarizeText(text: string, model: string = "gemini-2.5-flash"): Promise<GeminiResponse> {
    const prompt = `Summarize this text in a clear and concise way, focusing on the main points:\n\n${text}`;

    return this.chat({
      message: prompt,
      model,
      max_tokens: 500,
      temperature: 0.3,
    });
  }

  async analyzeSentiment(text: string, model: string = "gemini-2.5-pro"): Promise<GeminiResponse & { sentiment?: any }> {
    try {
      const systemPrompt = `You are a sentiment analysis expert. Analyze the sentiment of the following text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: {"rating": number, "confidence": number, "sentiment": "positive/negative/neutral", "explanation": "brief explanation"}`;

      if (!this.ai) {
        return {
          success: true,
          data: {
            response: JSON.stringify({
              rating: 3,
              confidence: 0.8,
              sentiment: "neutral",
              explanation: "This is a demo sentiment analysis. Set up your GEMINI_API_KEY for real results.",
            }),
            model,
            usage: { promptTokenCount: 12, candidatesTokenCount: 18, totalTokenCount: 30 },
          },
          sentiment: {
            rating: 3,
            confidence: 0.8,
            sentiment: "neutral",
            explanation: "This is a demo sentiment analysis. Set up your GEMINI_API_KEY for real results.",
          },
          creator: this.creator,
        };
      }

      const result = await this.ai.models.generateContent({
        model,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              rating: { type: "number" },
              confidence: { type: "number" },
              sentiment: { type: "string" },
              explanation: { type: "string" },
            },
            required: ["rating", "confidence", "sentiment", "explanation"],
          },
        },
        contents: text,
      });

      const rawJson = result.text;

      if (rawJson) {
        const sentiment = JSON.parse(rawJson);

        return {
          success: true,
          data: {
            response: `Sentiment: ${sentiment.sentiment} (${sentiment.rating}/5 stars, ${Math.round(sentiment.confidence * 100)}% confidence)\nExplanation: ${sentiment.explanation}`,
            model,
            usage: result.usageMetadata,
          },
          sentiment,
          creator: this.creator,
        };
      } else {
        throw new Error("Empty response from model");
      }
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      return {
        success: false,
        error: "Couldn’t analyze the sentiment. Want to try again?",
        creator: this.creator,
      };
    }
  }

  async generateImage(prompt: string): Promise<GeminiImageResponse> {
    try {
      if (!prompt?.trim()) {
        return {
          success: false,
          error: "I need a prompt to generate an image. What do you want me to create?",
          creator: this.creator,
        };
      }

      // Use the image generation model
      const model = "gemini-2.5-flash-preview-image-generation";

      // Return demo response if API key is not available
      if (!this.ai) {
        return {
          success: true,
          data: {
            imageUrl: "https://placehold.co/600x400?text=Demo+Image",
            description: "This is a demo image. Please set up your GEMINI_API_KEY to generate real images.",
            model,
          },
          creator: this.creator,
        };
      }

      const result = await this.ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const candidates = result.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No image generated");
      }

      const content = candidates[0].content;
      if (!content || !content.parts) {
        throw new Error("No content parts in response");
      }

      let imageUrl: string = "https://placehold.co/600x400?text=Image+Generation+Failed";
      let description = "";

      for (const part of content.parts) {
        if (part.text) {
          description += part.text + " ";
        } else if (part.inlineData && part.inlineData.data) {
          const imageData = part.inlineData.data;
          // Upload image to hosting service
          imageUrl = await this.uploadToImageHost(imageData);
        }
      }

      return {
        success: true,
        data: {
          imageUrl,
          description: description.trim() || "Generated image based on your prompt",
          model,
        },
        creator: this.creator,
      };
    } catch (error) {
      console.error("Image generation error:", error);
      return {
        success: false,
        error: "Couldn’t generate the image. Try a different prompt?",
        creator: this.creator,
      };
    }
  }

  async getAvailableModels(): Promise<{ success: boolean; data?: ModelInfo[]; error?: string; creator: string }> {
    try {
      const modelsList: ModelInfo[] = [
        {
          name: "gemini-2.5-flash",
          description: "Great for quick and versatile tasks like answering questions or generating text",
          capabilities: ["Text Generation", "Code Generation", "Question Answering", "Summarization"],
          inputTokenLimit: 1048576,
          outputTokenLimit: 8192,
        },
        {
          name: "gemini-2.5-pro",
          description: "Perfect for complex tasks requiring deeper reasoning",
          capabilities: ["Complex Analysis", "Code Generation", "Math Problem Solving", "Creative Writing"],
          inputTokenLimit: 2097152,
          outputTokenLimit: 8192,
        },
        {
          name: "gemini-2.5-flash-preview",
          description: "Preview model with enhanced multimodal capabilities",
          capabilities: ["Text Generation", "Multimodal Understanding", "Advanced Reasoning"],
          inputTokenLimit: 1048576,
          outputTokenLimit: 8192,
        },
        {
          name: "gemini-2.5-flash-preview-image-generation",
          description: "Preview model for generating images from text prompts",
          capabilities: ["Image Generation", "Text Generation", "Multimodal Output"],
          inputTokenLimit: 1048576,
          outputTokenLimit: 8192,
        },
      ];

      return {
        success: true,
        data: modelsList,
        creator: this.creator,
      };
    } catch (error) {
      return {
        success: false,
        error: "Couldn’t fetch the list of models. Try again later?",
        creator: this.creator,
      };
    }
  }

  getStatus() {
    return {
      service: "Gemini AI Service",
      models: [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.5-flash-preview",
        "gemini-2.5-flash-preview-image-generation",
      ],
      features: ["Chat", "Image Chat", "Text Summarization", "Sentiment Analysis", "Image Generation"],
      ready: !!this.apiKey,
      demoMode: !this.apiKey,
      creator: this.creator,
    };
  }
}

export const geminiService = new GeminiService();