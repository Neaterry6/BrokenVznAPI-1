import axios from 'axios';
import * as cheerio from 'cheerio';
export class AnimeScraperService {
    creator = '@BrokenVZN';
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    // GogoAnime scraper (similar to animeflix implementation)
    async scrapeGogoAnime(query) {
        try {
            const searchUrl = `https://gogoanime3.co/search.html?keyword=${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const results = [];
            $('.last_episodes ul.items li').each((i, elem) => {
                const $elem = $(elem);
                const title = $elem.find('.name a').attr('title') || $elem.find('.name a').text().trim();
                const url = $elem.find('.name a').attr('href');
                const image = $elem.find('.img img').attr('src');
                const status = $elem.find('.released').text().trim();
                if (title && url) {
                    results.push({
                        title,
                        url: url.startsWith('http') ? url : `https://gogoanime3.co${url}`,
                        image: image?.startsWith('http') ? image : image ? `https://gogoanime3.co${image}` : undefined,
                        status
                    });
                }
            });
            return {
                success: true,
                data: results,
                creator: this.creator
            };
        }
        catch (error) {
            console.error("GogoAnime scraping error:", error);
            return {
                success: false,
                error: "Failed to scrape GogoAnime",
                creator: this.creator
            };
        }
    }
    // AnimePahe scraper (inspired by zenshin implementation)
    async scrapeAnimePahe(query) {
        try {
            const searchUrl = `https://animepahe.ru/api?m=search&q=${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const results = [];
            if (response.data && response.data.data) {
                response.data.data.forEach((anime) => {
                    results.push({
                        title: anime.title,
                        url: `https://animepahe.ru/anime/${anime.session}`,
                        image: anime.poster,
                        episodes: anime.episodes?.toString(),
                        status: anime.status,
                        year: anime.year?.toString(),
                        synopsis: anime.synopsis
                    });
                });
            }
            return {
                success: true,
                data: results,
                creator: this.creator
            };
        }
        catch (error) {
            console.error("AnimePahe scraping error:", error);
            return {
                success: false,
                error: "Failed to scrape AnimePahe",
                creator: this.creator
            };
        }
    }
    // Nyaa torrent scraper (from zenshin/tosho implementations)
    async scrapeNyaaTorrents(query) {
        try {
            const searchUrl = `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(query)}&s=seeders&o=desc`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const torrents = [];
            $('tr').each((i, elem) => {
                if (i === 0)
                    return; // Skip header row
                const $elem = $(elem);
                const titleElem = $elem.find('td:nth-child(2) a:last-child');
                const magnetElem = $elem.find('td:nth-child(3) a[href^="magnet:"]');
                const sizeElem = $elem.find('td:nth-child(4)');
                const dateElem = $elem.find('td:nth-child(5)');
                const seedersElem = $elem.find('td:nth-child(6)');
                const leechersElem = $elem.find('td:nth-child(7)');
                const title = titleElem.text().trim();
                const magnet = magnetElem.attr('href');
                const size = sizeElem.text().trim();
                const date = dateElem.text().trim();
                const seeders = parseInt(seedersElem.text().trim()) || 0;
                const leechers = parseInt(leechersElem.text().trim()) || 0;
                if (title && magnet) {
                    // Extract quality from title
                    let quality = 'Unknown';
                    if (title.includes('1080p'))
                        quality = '1080p';
                    else if (title.includes('720p'))
                        quality = '720p';
                    else if (title.includes('480p'))
                        quality = '480p';
                    else if (title.includes('2160p') || title.includes('4K'))
                        quality = '4K';
                    torrents.push({
                        title,
                        magnet,
                        size,
                        seeders,
                        leechers,
                        date,
                        quality
                    });
                }
            });
            return {
                success: true,
                data: torrents.slice(0, 50), // Limit to 50 results
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Nyaa scraping error:", error);
            return {
                success: false,
                error: "Failed to scrape Nyaa torrents",
                creator: this.creator
            };
        }
    }
    // Zoro.to scraper (similar to ani-cli logic)
    async scrapeZoro(query) {
        try {
            const searchUrl = `https://aniwatch.to/search?keyword=${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const results = [];
            $('.flw-item').each((i, elem) => {
                const $elem = $(elem);
                const title = $elem.find('.film-name a').text().trim();
                const url = $elem.find('.film-poster a').attr('href');
                const image = $elem.find('.film-poster img').attr('data-src');
                const episodes = $elem.find('.fd-infor .tick-eps').text().trim();
                const year = $elem.find('.fd-infor .fdi-item:first-child').text().trim();
                if (title && url) {
                    results.push({
                        title,
                        url: url.startsWith('http') ? url : `https://aniwatch.to${url}`,
                        image,
                        episodes,
                        year
                    });
                }
            });
            return {
                success: true,
                data: results,
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Zoro scraping error:", error);
            return {
                success: false,
                error: "Failed to scrape Zoro",
                creator: this.creator
            };
        }
    }
    // 9anime scraper (from anime-downloader logic)
    async scrape9anime(query) {
        try {
            const searchUrl = `https://9animeaz.to/search?keyword=${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const results = [];
            $('.item').each((i, elem) => {
                const $elem = $(elem);
                const title = $elem.find('.info .name a').text().trim();
                const url = $elem.find('.info .name a').attr('href');
                const image = $elem.find('.poster img').attr('src');
                const episodes = $elem.find('.info .meta .item:contains("EP")').text().replace('EP ', '').trim();
                const year = $elem.find('.info .meta .item:last-child').text().trim();
                if (title && url) {
                    results.push({
                        title,
                        url: url.startsWith('http') ? url : `https://9animeaz.to${url}`,
                        image,
                        episodes,
                        year
                    });
                }
            });
            return {
                success: true,
                data: results,
                creator: this.creator
            };
        }
        catch (error) {
            console.error("9anime scraping error:", error);
            return {
                success: false,
                error: "Failed to scrape 9anime",
                creator: this.creator
            };
        }
    }
    // Aggregate search across multiple sources
    async aggregateSearch(query) {
        try {
            const sources = [
                { name: 'GogoAnime', scraper: () => this.scrapeGogoAnime(query) },
                { name: 'AnimePahe', scraper: () => this.scrapeAnimePahe(query) },
                { name: 'Zoro', scraper: () => this.scrapeZoro(query) },
                { name: '9anime', scraper: () => this.scrape9anime(query) }
            ];
            const results = await Promise.allSettled(sources.map(async (source) => {
                const result = await source.scraper();
                return {
                    source: source.name,
                    results: result.success ? result.data || [] : []
                };
            }));
            const aggregatedResults = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value)
                .filter(result => result.results.length > 0);
            return {
                success: true,
                data: aggregatedResults,
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Aggregate search error:", error);
            return {
                success: false,
                error: "Failed to perform aggregate search",
                creator: this.creator
            };
        }
    }
    // Get streaming links for a specific anime (simplified implementation)
    async getStreamingLinks(animeUrl) {
        try {
            // This is a simplified implementation for demo purposes
            // In a real implementation, you would need to handle different video extractors
            const demoLinks = [
                {
                    quality: '1080p',
                    url: 'https://demo-stream.example.com/1080p.m3u8',
                    server: 'Demo Server 1',
                    type: 'hls'
                },
                {
                    quality: '720p',
                    url: 'https://demo-stream.example.com/720p.mp4',
                    server: 'Demo Server 2',
                    type: 'mp4'
                }
            ];
            return {
                success: true,
                data: demoLinks,
                creator: this.creator
            };
        }
        catch (error) {
            console.error("Streaming links error:", error);
            return {
                success: false,
                error: "Failed to get streaming links",
                creator: this.creator
            };
        }
    }
    // Get service status
    getStatus() {
        return {
            service: 'Anime Scraper Service',
            sources: ['GogoAnime', 'AnimePahe', 'Zoro', '9anime', 'Nyaa'],
            features: ['Multi-source search', 'Torrent scraping', 'Streaming links', 'Aggregate results'],
            creator: this.creator
        };
    }
}
export const animeScraperService = new AnimeScraperService();
