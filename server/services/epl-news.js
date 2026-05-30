import axios from 'axios';
import * as cheerio from 'cheerio';
export class EPLNewsService {
    async getEPLNews(request = {}) {
        try {
            const { limit = 5, includeLiveMatches = true } = request;
            const result = {
                success: true,
                timestamp: new Date().toISOString(),
                creator: 'Broken VZN'
            };
            // Fetch EPL news from Sky Sports
            try {
                const newsUrl = 'https://www.skysports.com/premier-league-news';
                const newsResponse = await axios.get(newsUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    timeout: 10000
                });
                const news$ = cheerio.load(newsResponse.data);
                const articles = [];
                // Try multiple selectors to find news articles
                const selectors = [
                    '.news-list__headline-link',
                    '.tile__headline-link',
                    '.news-list__item a',
                    'article h3 a',
                    '.sdc-site-tile__headline a'
                ];
                for (const selector of selectors) {
                    if (articles.length >= limit)
                        break;
                    news$(selector).each((index, element) => {
                        if (articles.length >= limit)
                            return false;
                        const title = news$(element).text().trim();
                        let link = news$(element).attr('href');
                        if (title && link) {
                            // Make link absolute if it's relative
                            if (link.startsWith('/')) {
                                link = `https://www.skysports.com${link}`;
                            }
                            articles.push({ title, link });
                        }
                    });
                }
                result.news = articles.slice(0, limit);
            }
            catch (newsError) {
                console.error('EPL news fetch error:', newsError);
                result.news = [];
            }
            // Fetch live matches if requested
            if (includeLiveMatches) {
                try {
                    const matchesUrl = 'https://www.skysports.com/live-scores/football';
                    const matchesResponse = await axios.get(matchesUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        },
                        timeout: 10000
                    });
                    const matches$ = cheerio.load(matchesResponse.data);
                    const liveMatches = [];
                    // Try multiple selectors for live matches
                    const matchSelectors = [
                        '.fixres__item',
                        '.live-scores__item',
                        '.matches__item'
                    ];
                    for (const selector of matchSelectors) {
                        if (liveMatches.length >= 5)
                            break;
                        matches$(selector).each((index, element) => {
                            if (liveMatches.length >= 5)
                                return false;
                            const teams = matches$(element).find('.matches__item-col--team-name, .fixres__team-name').text().trim();
                            const score = matches$(element).find('.matches__item-col--scores, .fixres__score').text().trim();
                            const status = matches$(element).find('.matches__status, .fixres__status').text().trim();
                            if (teams || score) {
                                liveMatches.push({
                                    teams: teams || 'Teams not available',
                                    score: score || 'Score not available',
                                    status: status || 'Status unknown'
                                });
                            }
                        });
                    }
                    result.liveMatches = liveMatches;
                }
                catch (matchError) {
                    console.error('Live matches fetch error:', matchError);
                    result.liveMatches = [];
                }
            }
            // If no news was found, provide fallback message
            if (!result.news || result.news.length === 0) {
                result.news = [{
                        title: 'Unable to fetch latest EPL news at the moment',
                        link: 'https://www.skysports.com/premier-league-news',
                        summary: 'Please try again later or visit Sky Sports directly for the latest Premier League updates'
                    }];
            }
            return result;
        }
        catch (error) {
            console.error('EPL news service error:', error);
            return {
                success: false,
                error: 'Failed to fetch EPL news',
                timestamp: new Date().toISOString(),
                creator: 'Broken VZN'
            };
        }
    }
}
export const eplNewsService = new EPLNewsService();
