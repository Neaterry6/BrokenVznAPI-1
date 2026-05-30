import axios from 'axios';
export class WaifuService {
    apiUrl = "https://api.waifu.im/search";
    // Available categories
    categories = {
        versatile: [
            "maid",
            "waifu",
            "marin-kitagawa",
            "mori-calliope",
            "raiden-shogun",
            "oppai",
            "selfies",
            "uniform",
            "kamisato-ayaka",
            "uniform",
            "dress",
            "school",
            "christmas",
            "bunny",
            "bikini"
        ],
        nsfw: [
            "ass",
            "hentai",
            "milf",
            "oral",
            "paizuri",
            "ecchi",
            "ero",
            "nude",
            "pussy",
            "cum"
        ]
    };
    async getWaifu(request = {}) {
        try {
            const { tags = ["waifu"], height = ">=2000", width, orientation, nsfw = false } = request;
            // Validate tags
            const validTags = nsfw
                ? [...this.categories.versatile, ...this.categories.nsfw]
                : this.categories.versatile;
            const filteredTags = tags.filter(tag => validTags.includes(tag.toLowerCase()));
            if (filteredTags.length === 0) {
                return {
                    success: false,
                    error: `Invalid tags. Available ${nsfw ? 'NSFW' : 'SFW'} tags: ${validTags.join(', ')}`,
                    creator: "heisbroken"
                };
            }
            // Build request parameters
            const params = {
                included_tags: filteredTags
            };
            if (height)
                params.height = height;
            if (width)
                params.width = width;
            if (orientation)
                params.orientation = orientation;
            if (nsfw)
                params.is_nsfw = true;
            // Make API request
            const response = await axios.get(this.apiUrl, {
                params,
                timeout: 15000 // 15 second timeout
            });
            if (!response.data || !response.data.images || response.data.images.length === 0) {
                return {
                    success: false,
                    error: "No waifu image found for the specified criteria",
                    creator: "heisbroken"
                };
            }
            const image = response.data.images[0];
            return {
                success: true,
                image: image.url,
                tags: filteredTags,
                dimensions: {
                    width: image.width || 0,
                    height: image.height || 0
                },
                category: nsfw ? 'NSFW' : 'SFW',
                creator: "heisbroken"
            };
        }
        catch (error) {
            console.error('Waifu API error:', error);
            if (error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: 'Request timed out. Please try again.',
                    creator: "heisbroken"
                };
            }
            if (error.response?.status === 429) {
                return {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.',
                    creator: "heisbroken"
                };
            }
            if (error.response?.status === 404) {
                return {
                    success: false,
                    error: 'No images found matching your criteria',
                    creator: "heisbroken"
                };
            }
            return {
                success: false,
                error: 'Failed to fetch waifu image',
                creator: "heisbroken"
            };
        }
    }
    // Get random waifu with preset categories
    async getRandomWaifu(category = 'cute') {
        const tagMap = {
            cute: ['waifu', 'selfies'],
            anime: ['waifu', 'marin-kitagawa', 'raiden-shogun'],
            maid: ['maid', 'uniform'],
            uniform: ['uniform', 'school']
        };
        return this.getWaifu({
            tags: tagMap[category],
            height: ">=1920"
        });
    }
    // Get available categories
    getCategories() {
        return this.categories;
    }
    // Search by character
    async getCharacterWaifu(character) {
        const characterTags = {
            'marin': ['marin-kitagawa'],
            'calliope': ['mori-calliope'],
            'raiden': ['raiden-shogun'],
            'ayaka': ['kamisato-ayaka']
        };
        const tags = characterTags[character.toLowerCase()];
        if (!tags) {
            return {
                success: false,
                error: `Character not found. Available characters: ${Object.keys(characterTags).join(', ')}`,
                creator: "heisbroken"
            };
        }
        return this.getWaifu({ tags });
    }
    // Get bulk waifus
    async getBulkWaifus(count = 5, tags = ['waifu']) {
        try {
            if (count > 10) {
                return {
                    success: false,
                    error: 'Maximum 10 images per request'
                };
            }
            const promises = Array(count).fill(null).map(() => this.getWaifu({ tags }));
            const results = await Promise.allSettled(promises);
            const images = results
                .filter((result) => result.status === 'fulfilled' && result.value.success)
                .map(result => ({
                url: result.value.image,
                tags: result.value.tags,
                dimensions: result.value.dimensions
            }));
            if (images.length === 0) {
                return {
                    success: false,
                    error: 'Failed to fetch any waifu images'
                };
            }
            return {
                success: true,
                images
            };
        }
        catch (error) {
            console.error('Bulk waifu error:', error);
            return {
                success: false,
                error: 'Failed to fetch bulk waifu images'
            };
        }
    }
}
export const waifuService = new WaifuService();
