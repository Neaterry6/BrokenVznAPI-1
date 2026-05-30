import OpenAI from 'openai';
let openai = null;
try {
    const apiKey = process.env.XAI_API_KEY;
    if (apiKey) {
        // Check if API key has the correct format (should start with "xai-")
        if (!apiKey.startsWith('xai-')) {
            console.warn(`XAI_API_KEY appears to have incorrect format. Expected format: xai-... but got: ${apiKey.substring(0, 6)}...`);
            console.warn("Please ensure you're using a valid X.AI API key from https://console.x.ai");
        }
        openai = new OpenAI({
            baseURL: "https://api.x.ai/v1",
            apiKey: apiKey
        });
    }
    else {
        console.warn("XAI_API_KEY not found. Grok service will use demo responses.");
    }
}
catch (error) {
    console.warn("Failed to initialize Grok service. Using demo responses.");
}
export class GrokService {
    creator = '@BrokenVZN';
    async chat(request) {
        try {
            if (!openai) {
                return {
                    success: true,
                    creator: this.creator,
                    response: 'This is a demo response from Grok AI. To get real responses, please configure your XAI_API_KEY environment variable with a valid X.AI API key from https://console.x.ai (format: xai-...).'
                };
            }
            const response = await openai.chat.completions.create({
                model: request.model || "grok-2-1212",
                messages: [{ role: "user", content: request.message }],
                max_tokens: request.max_tokens || 1000,
                temperature: request.temperature || 0.7
            });
            return {
                success: true,
                creator: this.creator,
                response: response.choices[0].message.content || 'No response generated'
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to process chat request'
            };
        }
    }
    async chatWithImage(request) {
        try {
            if (!openai) {
                return {
                    success: true,
                    creator: this.creator,
                    response: 'This is a demo response from Grok AI. To get real responses, please configure your XAI_API_KEY environment variable with a valid X.AI API key from https://console.x.ai (format: xai-...).'
                };
            }
            const response = await openai.chat.completions.create({
                model: request.model || "grok-2-vision-1212",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: request.message
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${request.image}`
                                }
                            }
                        ],
                    },
                ],
                max_tokens: 500,
            });
            return {
                success: true,
                creator: this.creator,
                response: response.choices[0].message.content || 'No response generated'
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to process image chat request'
            };
        }
    }
    async summarizeText(text) {
        try {
            if (!openai) {
                return {
                    success: true,
                    creator: this.creator,
                    response: 'This is a demo response from Grok AI. To get real responses, please configure your XAI_API_KEY environment variable with a valid X.AI API key from https://console.x.ai (format: xai-...).'
                };
            }
            const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;
            const response = await openai.chat.completions.create({
                model: "grok-2-1212",
                messages: [{ role: "user", content: prompt }],
            });
            return {
                success: true,
                creator: this.creator,
                data: {
                    summary: response.choices[0].message.content,
                    original_length: text.length,
                    summary_length: response.choices[0].message.content?.length || 0
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to summarize text'
            };
        }
    }
    async analyzeSentiment(text) {
        try {
            if (!openai) {
                return {
                    success: true,
                    creator: this.creator,
                    response: 'This is a demo response from Grok AI. To get real responses, please configure your XAI_API_KEY environment variable with a valid X.AI API key from https://console.x.ai (format: xai-...).'
                };
            }
            const response = await openai.chat.completions.create({
                model: "grok-2-1212",
                messages: [
                    {
                        role: "system",
                        content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }"
                    },
                    {
                        role: "user",
                        content: text,
                    },
                ],
                response_format: { type: "json_object" },
            });
            const result = JSON.parse(response.choices[0].message.content || '{}');
            return {
                success: true,
                creator: this.creator,
                data: {
                    rating: Math.max(1, Math.min(5, Math.round(result.rating))),
                    confidence: Math.max(0, Math.min(1, result.confidence)),
                    text: text
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to analyze sentiment'
            };
        }
    }
    getAvailableModels() {
        return {
            success: true,
            creator: this.creator,
            data: {
                models: [
                    {
                        name: "grok-2-vision-1212",
                        inputs: ["text", "image"],
                        output: "text",
                        context_window: "8192 tokens",
                        capabilities: "Text and image input/output"
                    },
                    {
                        name: "grok-2-1212",
                        inputs: ["text"],
                        output: "text",
                        context_window: "131072 tokens",
                        capabilities: "Text-only processing"
                    },
                    {
                        name: "grok-vision-beta",
                        inputs: ["text", "image"],
                        output: "text",
                        context_window: "8192 tokens",
                        capabilities: "Text and image input/output"
                    },
                    {
                        name: "grok-beta",
                        inputs: ["text"],
                        output: "text",
                        context_window: "131072 tokens",
                        capabilities: "Text-only processing"
                    }
                ]
            }
        };
    }
}
export const grokService = new GrokService();
