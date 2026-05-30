import axios from 'axios';
export class QuotesApiService {
    async getRandomQuote() {
        try {
            // Try multiple quote sources
            const sources = [
                this.getQuoteFromQuotable,
                this.getQuoteFromZenQuotes,
                this.getFallbackQuote
            ];
            for (const source of sources) {
                try {
                    const result = await source.call(this);
                    if (result.success) {
                        return result;
                    }
                }
                catch (error) {
                    continue;
                }
            }
            return this.getFallbackQuote();
        }
        catch (error) {
            return {
                success: false,
                creator: 'Broken VZN',
                error: error instanceof Error ? error.message : 'Failed to fetch quote'
            };
        }
    }
    async getQuoteFromQuotable() {
        const response = await axios.get('https://api.quotable.io/random', {
            timeout: 5000
        });
        return {
            success: true,
            creator: 'Broken VZN',
            result: {
                quote: response.data.content,
                author: response.data.author,
                category: response.data.tags?.[0] || 'inspirational'
            }
        };
    }
    async getQuoteFromZenQuotes() {
        const response = await axios.get('https://zenquotes.io/api/random', {
            timeout: 5000
        });
        const data = response.data[0];
        return {
            success: true,
            creator: 'Broken VZN',
            result: {
                quote: data.q,
                author: data.a,
                category: 'inspirational'
            }
        };
    }
    getFallbackQuote() {
        const quotes = [
            {
                quote: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                category: "motivation"
            },
            {
                quote: "Innovation distinguishes between a leader and a follower.",
                author: "Steve Jobs",
                category: "innovation"
            },
            {
                quote: "Life is what happens to you while you're busy making other plans.",
                author: "John Lennon",
                category: "life"
            },
            {
                quote: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt",
                category: "dreams"
            },
            {
                quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill",
                category: "success"
            }
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        return {
            success: true,
            creator: 'Broken VZN',
            result: randomQuote
        };
    }
    async getQuoteByCategory(category) {
        try {
            // Try to get quote by category from Quotable
            const response = await axios.get('https://api.quotable.io/random', {
                params: {
                    tags: category
                },
                timeout: 5000
            });
            return {
                success: true,
                creator: 'Broken VZN',
                result: {
                    quote: response.data.content,
                    author: response.data.author,
                    category: response.data.tags?.[0] || category
                }
            };
        }
        catch (error) {
            // Fallback to random quote
            return this.getRandomQuote();
        }
    }
}
