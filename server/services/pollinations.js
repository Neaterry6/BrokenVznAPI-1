import axios from 'axios';
export class PollinationsService {
    creator = '@BrokenVZN';
    imageBaseUrl = 'https://image.pollinations.ai';
    textBaseUrl = 'https://text.pollinations.ai';
    // Available model configurations
    imageModels = ['flux', 'kontext', 'turbo', 'playground', 'midjourney'];
    textModels = ['openai', 'elixposearch', 'claude', 'mistral'];
    audioVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    async generateImage(request) {
        try {
            const { prompt, model = 'flux', width = 1024, height = 1024, seed, enhance = false } = request;
            if (!prompt) {
                return {
                    success: false,
                    error: "Please provide an image prompt",
                    creator: this.creator
                };
            }
            // Construct the Pollinations image URL
            let imageUrl = `${this.imageBaseUrl}/prompt/${encodeURIComponent(prompt)}`;
            // Add parameters
            const params = new URLSearchParams();
            if (model && this.imageModels.includes(model)) {
                params.append('model', model);
            }
            params.append('width', width.toString());
            params.append('height', height.toString());
            if (seed) {
                params.append('seed', seed.toString());
            }
            if (enhance) {
                params.append('enhance', 'true');
            }
            if (params.toString()) {
                imageUrl += `?${params.toString()}`;
            }
            // Test the image URL by making a HEAD request
            try {
                await axios.head(imageUrl, { timeout: 10000 });
            }
            catch (error) {
                console.log("Image generation may take a moment:", error);
            }
            return {
                success: true,
                data: {
                    url: imageUrl,
                    prompt,
                    model: model,
                    width,
                    height,
                    seed
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Error generating image:", error);
            return {
                success: false,
                error: "Failed to generate image",
                creator: this.creator
            };
        }
    }
    async generateText(request) {
        try {
            const { prompt, model = 'openai', temperature = 0.7, max_tokens = 150, system_prompt } = request;
            if (!prompt) {
                return {
                    success: false,
                    error: "Please provide a text prompt",
                    creator: this.creator
                };
            }
            let textUrl = `${this.textBaseUrl}/${encodeURIComponent(prompt)}`;
            // Add parameters
            const params = new URLSearchParams();
            if (model && this.textModels.includes(model)) {
                params.append('model', model);
            }
            params.append('temperature', temperature.toString());
            params.append('max_tokens', max_tokens.toString());
            if (system_prompt) {
                params.append('system', encodeURIComponent(system_prompt));
            }
            if (params.toString()) {
                textUrl += `?${params.toString()}`;
            }
            const response = await axios.get(textUrl, {
                timeout: 30000,
                headers: {
                    'Accept': 'text/plain',
                }
            });
            const generatedText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            return {
                success: true,
                data: {
                    text: generatedText,
                    model: model,
                    prompt,
                    usage: {
                        prompt_tokens: prompt.split(' ').length,
                        completion_tokens: generatedText.split(' ').length,
                        total_tokens: prompt.split(' ').length + generatedText.split(' ').length
                    }
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Error generating text:", error);
            return {
                success: false,
                error: "Failed to generate text",
                creator: this.creator
            };
        }
    }
    async generateAudio(request) {
        try {
            const { text, voice = 'nova', model = 'openai-audio', speed = 1.0 } = request;
            if (!text) {
                return {
                    success: false,
                    error: "Please provide text for audio generation",
                    creator: this.creator
                };
            }
            let audioUrl = `${this.textBaseUrl}/${encodeURIComponent(text)}`;
            // Add parameters for audio
            const params = new URLSearchParams();
            params.append('model', model);
            if (this.audioVoices.includes(voice)) {
                params.append('voice', voice);
            }
            params.append('speed', speed.toString());
            audioUrl += `?${params.toString()}`;
            // Test the audio URL
            try {
                const response = await axios.head(audioUrl, { timeout: 10000 });
            }
            catch (error) {
                console.log("Audio generation may take a moment:", error);
            }
            return {
                success: true,
                data: {
                    url: audioUrl,
                    text,
                    voice,
                    model,
                    duration: Math.ceil(text.length / 10) // Rough estimate: 10 chars per second
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Error generating audio:", error);
            return {
                success: false,
                error: "Failed to generate audio",
                creator: this.creator
            };
        }
    }
    async getAvailableModels() {
        try {
            return {
                success: true,
                data: {
                    image_models: this.imageModels,
                    text_models: this.textModels,
                    audio_models: ['openai-audio']
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Error getting available models:", error);
            return {
                success: false,
                error: "Failed to get available models",
                creator: this.creator
            };
        }
    }
    async imageToImage(prompt, imageUrl, model = 'kontext') {
        try {
            if (!prompt || !imageUrl) {
                return {
                    success: false,
                    error: "Please provide both prompt and image URL",
                    creator: this.creator
                };
            }
            // Construct image-to-image URL with kontext model
            let transformUrl = `${this.imageBaseUrl}/prompt/${encodeURIComponent(prompt)}`;
            const params = new URLSearchParams();
            params.append('model', model);
            params.append('image', imageUrl);
            transformUrl += `?${params.toString()}`;
            // Test the transform URL
            try {
                await axios.head(transformUrl, { timeout: 10000 });
            }
            catch (error) {
                console.log("Image transformation may take a moment:", error);
            }
            return {
                success: true,
                data: {
                    url: transformUrl,
                    prompt,
                    model,
                    width: 1024,
                    height: 1024
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Error in image-to-image transformation:", error);
            return {
                success: false,
                error: "Failed to transform image",
                creator: this.creator
            };
        }
    }
    async searchWithPollinationsAI(query, model = 'elixposearch') {
        try {
            if (!query) {
                return {
                    success: false,
                    error: "Please provide a search query",
                    creator: this.creator
                };
            }
            const searchUrl = `${this.textBaseUrl}/${encodeURIComponent(query)}?model=${model}`;
            const response = await axios.get(searchUrl, {
                timeout: 30000,
                headers: {
                    'Accept': 'text/plain',
                }
            });
            const searchResults = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            return {
                success: true,
                data: {
                    text: searchResults,
                    model: model,
                    prompt: query,
                    usage: {
                        prompt_tokens: query.split(' ').length,
                        completion_tokens: searchResults.split(' ').length,
                        total_tokens: query.split(' ').length + searchResults.split(' ').length
                    }
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Error in Pollinations search:", error);
            return {
                success: false,
                error: "Failed to perform search",
                creator: this.creator
            };
        }
    }
}
export const pollinationsService = new PollinationsService();
