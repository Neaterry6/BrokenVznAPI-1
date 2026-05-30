import axios from 'axios';
import * as cheerio from 'cheerio';
export class ScraperFunctions {
    author = 'Broken VZN';
    defaultOptions = {
        timeout: 10000,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        headers: {}
    };
    constructor() {
        // Initialize scraper with default settings
    }
    /**
     * Random item selector from array
     */
    randomobj(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    /**
     * Decode binary string to text
     */
    decodeBinary(binaryString) {
        return binaryString
            .split(' ')
            .map(str => String.fromCharCode(parseInt(str, 2)))
            .join('');
    }
    /**
     * Encode text to binary string
     */
    encodeBinary(text) {
        return text
            .split('')
            .map(char => {
            const binary = char.charCodeAt(0).toString(2);
            return binary.padStart(8, '0');
        })
            .join(' ');
    }
    /**
     * Get LINE sticker metadata
     */
    async slineMetadata(id) {
        try {
            const url = `http://dl.stickershop.line.naver.jp/products/0/0/1/${id}/android/productInfo.meta`;
            const response = await axios.get(url, {
                timeout: this.defaultOptions.timeout,
                headers: {
                    'User-Agent': this.defaultOptions.userAgent,
                    ...this.defaultOptions.headers
                }
            });
            const data = response.data;
            return {
                id: data.packageId,
                title: data.title.en,
                author: data.author.en,
                animate: data.hasAnimation,
                stickers: data.stickers || []
            };
        }
        catch (error) {
            console.error('LINE sticker metadata error:', error);
            throw new Error('Failed to fetch LINE sticker metadata');
        }
    }
    /**
     * Generic web scraper
     */
    async scrapeWebpage(url, selector, options) {
        try {
            const config = { ...this.defaultOptions, ...options };
            const response = await axios.get(url, {
                timeout: config.timeout,
                headers: {
                    'User-Agent': config.userAgent,
                    ...config.headers
                }
            });
            const $ = cheerio.load(response.data);
            if (selector) {
                const elements = [];
                $(selector).each((index, element) => {
                    const $el = $(element);
                    elements.push({
                        text: $el.text().trim(),
                        html: $el.html(),
                        attributes: $el.attr() || {}
                    });
                });
                return elements;
            }
            return {
                title: $('title').text().trim(),
                body: $('body').html(),
                meta: this.extractMetaTags($)
            };
        }
        catch (error) {
            console.error('Web scraping error:', error);
            throw new Error('Failed to scrape webpage');
        }
    }
    /**
     * Extract meta tags from page
     */
    extractMetaTags($) {
        const metaTags = {};
        $('meta').each((index, element) => {
            const name = $(element).attr('name') || $(element).attr('property');
            const content = $(element).attr('content');
            if (name && content) {
                metaTags[name] = content;
            }
        });
        return metaTags;
    }
    /**
     * Extract images from webpage
     */
    async extractImages(url, options) {
        try {
            const config = { ...this.defaultOptions, ...options };
            const response = await axios.get(url, {
                timeout: config.timeout,
                headers: {
                    'User-Agent': config.userAgent,
                    ...config.headers
                }
            });
            const $ = cheerio.load(response.data);
            const images = [];
            $('img').each((index, element) => {
                const src = $(element).attr('src');
                if (src) {
                    // Convert relative URLs to absolute
                    const absoluteUrl = src.startsWith('http') ? src : new URL(src, url).href;
                    images.push(absoluteUrl);
                }
            });
            return images;
        }
        catch (error) {
            console.error('Image extraction error:', error);
            throw new Error('Failed to extract images');
        }
    }
    /**
     * Extract links from webpage
     */
    async extractLinks(url, options) {
        try {
            const config = { ...this.defaultOptions, ...options };
            const response = await axios.get(url, {
                timeout: config.timeout,
                headers: {
                    'User-Agent': config.userAgent,
                    ...config.headers
                }
            });
            const $ = cheerio.load(response.data);
            const links = [];
            $('a[href]').each((index, element) => {
                const href = $(element).attr('href');
                const text = $(element).text().trim();
                if (href && text) {
                    // Convert relative URLs to absolute
                    const absoluteUrl = href.startsWith('http') ? href : new URL(href, url).href;
                    links.push({ text, url: absoluteUrl });
                }
            });
            return links;
        }
        catch (error) {
            console.error('Link extraction error:', error);
            throw new Error('Failed to extract links');
        }
    }
    /**
     * Get page title and description
     */
    async getPageInfo(url, options) {
        try {
            const config = { ...this.defaultOptions, ...options };
            const response = await axios.get(url, {
                timeout: config.timeout,
                headers: {
                    'User-Agent': config.userAgent,
                    ...config.headers
                }
            });
            const $ = cheerio.load(response.data);
            const title = $('title').text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                'No title found';
            const description = $('meta[name="description"]').attr('content') ||
                $('meta[property="og:description"]').attr('content') ||
                'No description found';
            const keywordsContent = $('meta[name="keywords"]').attr('content') || '';
            const keywords = keywordsContent ? keywordsContent.split(',').map(k => k.trim()) : [];
            return { title, description, keywords };
        }
        catch (error) {
            console.error('Page info extraction error:', error);
            throw new Error('Failed to extract page information');
        }
    }
}
export const scraperFunctions = new ScraperFunctions();
