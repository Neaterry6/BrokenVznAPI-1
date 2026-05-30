export class QuotesService {
    quotes = {
        flowers: [
            "Happiness blooms from within.",
            "A flower does not think of competing with the flower next to it. It just blooms. - Zen Shin",
            "Where flowers bloom, so does hope. - Lady Bird Johnson",
            "Every flower is a soul blossoming in nature. - Gerard De Nerval",
            "Flowers are the music of the ground. From earth's lips spoken without sound. - Edwin Curran",
            "Like wildflowers, you must allow yourself to grow in all the places people thought you never would.",
            "The earth laughs in flowers. - Ralph Waldo Emerson",
            "Flowers don't worry about how they're going to bloom. They just open up and turn toward the light. - Jim Carrey",
            "Bloom where you are planted.",
            "Flowers whisper what words cannot say.",
            "Even the tiniest flower can have the toughest roots.",
            "Flowers are the poetry of the earth.",
            "A single rose can be my garden...a single friend, my world. - Leo Buscaglia",
            "Take time to stop and smell the roses.",
            "Roses do not bloom hurriedly; for beauty, like any masterpiece, takes time to blossom.",
            "A sunflower teaches us to always turn toward the light.",
            "Each flower is a miracle waiting to be appreciated.",
            "May your life be like a wildflower, growing freely in the beauty and joy of each day.",
            "Blossoms are nature's confetti.",
            "The simplest flower can brighten the darkest day.",
            "Spread kindness like petals in the wind.",
            "Be a flower in someone's darkest day.",
            "Wildflowers can't be controlled; they just grow freely and fearlessly.",
            "Petals fall, but the love they symbolize remains forever.",
            "Even amid storms, flowers continue to grow.",
            "Grow where you are planted, and spread beauty everywhere.",
            "The beauty of flowers is a glimpse of the divine.",
            "A flower thrives by staying rooted.",
            "Life may uproot you, but like a flower, you can be replanted.",
            "Rain nourishes the flower, reminding us that challenges lead to growth.",
            "Flowers radiate beauty, even when no one is watching.",
            "The garden is a mirror of the heart.",
            "Flowers fade, but their memory and beauty linger on.",
            "Like flowers, we are all unique masterpieces of nature.",
            "A field of wildflowers teaches us the joy of diversity.",
            "Let your dreams bloom like spring flowers after a harsh winter."
        ],
        motivational: [
            "The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt",
            "In the middle of every difficulty lies opportunity. - Albert Einstein",
            "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
            "Dreams are the seeds, and actions are the flowers that grow from them.",
            "Roses do not bloom hurriedly; for beauty, like any masterpiece, takes time to blossom.",
            "Grow through what you go through.",
            "Spread kindness like petals in the wind.",
            "Be patient with yourself, nothing in nature blooms all year.",
            "Adopt the pace of nature: her secret is patience. - Ralph Waldo Emerson",
            "If we could see the miracle of a single flower clearly, our whole life would change. - Buddha",
            "Dare to be a wildflower in a field of roses.",
            "The flower that follows the sun does so even on cloudy days.",
            "Dreams are like seeds that only grow with nurturing.",
            "No matter the season, a flower blooms when it's ready.",
            "Each flower is a miracle waiting to be appreciated.",
            "Sometimes you need to grow through dirt to fully bloom.",
            "Be like a daisy; stay grounded but reach for the sky.",
            "You are a wildflower in a meadow of possibilities.",
            "Even a thorn can protect the beauty of a flower.",
            "Let your inner beauty bloom for the world to see."
        ],
        wisdom: [
            "A garden's growth reflects the care it receives—just like people.",
            "Not all flowers bloom at the same time, but each has its moment.",
            "The beauty of flowers is a glimpse of the divine.",
            "Happiness blooms when you tend to your own garden.",
            "In every seed, there's the potential for greatness.",
            "Like wildflowers, we thrive when we embrace our uniqueness.",
            "Life may uproot you, but like a flower, you can be replanted.",
            "Even amid storms, flowers continue to grow.",
            "Each new day is a chance to bloom anew.",
            "A single act of kindness is like a seed that blossoms endlessly.",
            "Nature teaches us patience; nothing blooms all at once.",
            "Be the sunshine in someone's cloudy day.",
            "Growth comes through nurturing yourself and others.",
            "Even the smallest flower has the courage to bloom.",
            "Let your wisdom spread like petals in the wind.",
            "The most precious gift of the garden is the restoration of peace.",
            "Through growth, we learn life's deepest truths.",
            "The roots of wisdom grow through reflection and experience.",
            "When you bloom, the world blooms with you.",
            "Like flowers, our differences make the world beautiful."
        ]
    };
    async getRandomQuote() {
        try {
            const categories = Object.keys(this.quotes);
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const randomQuote = this.quotes[randomCategory][Math.floor(Math.random() * this.quotes[randomCategory].length)];
            return {
                success: true,
                quote: randomQuote,
                category: randomCategory
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to get random quote'
            };
        }
    }
    async getQuoteByCategory(category) {
        try {
            const validCategories = Object.keys(this.quotes);
            if (!validCategories.includes(category)) {
                return {
                    success: false,
                    error: `Valid category is required. Available categories are: ${validCategories.join(', ')}.`
                };
            }
            const categoryQuotes = this.quotes[category];
            const randomQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
            return {
                success: true,
                quote: randomQuote,
                category: category
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to get quote by category'
            };
        }
    }
    async searchQuotes(keyword) {
        try {
            if (!keyword) {
                return {
                    success: false,
                    error: 'Keyword is required for searching.'
                };
            }
            const results = [];
            Object.keys(this.quotes).forEach(category => {
                this.quotes[category].forEach(quote => {
                    if (quote.toLowerCase().includes(keyword.toLowerCase())) {
                        results.push({ quote, category });
                    }
                });
            });
            if (results.length === 0) {
                return {
                    success: true,
                    message: "No quotes found matching your search keyword.",
                    results: []
                };
            }
            return {
                success: true,
                results: results
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to search quotes'
            };
        }
    }
}
export const quotesService = new QuotesService();
