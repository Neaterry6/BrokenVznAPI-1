import axios from 'axios';
import * as cheerio from 'cheerio';
export class LyricsService {
    async getLyrics(artist, title) {
        try {
            if (!artist || !title) {
                return {
                    success: false,
                    error: "Please provide artist and title parameters",
                    creator: "heisbroken"
                };
            }
            // Try multiple sources for lyrics
            let lyrics = await this.scrapeLyricsFromGenius(artist, title);
            if (!lyrics) {
                lyrics = await this.scrapeLyricsFromAZLyrics(artist, title);
            }
            if (!lyrics) {
                return {
                    success: false,
                    error: "Lyrics not found for this song",
                    creator: "heisbroken"
                };
            }
            return {
                success: true,
                lyrics: lyrics,
                artist: artist,
                title: title,
                creator: "heisbroken"
            };
        }
        catch (error) {
            console.error("Error fetching lyrics:", error);
            return {
                success: false,
                error: "Failed to fetch lyrics",
                creator: "heisbroken"
            };
        }
    }
    async scrapeLyricsFromGenius(artist, title) {
        try {
            const searchQuery = `${artist} ${title}`.replace(/\s+/g, '-').toLowerCase();
            const searchUrl = `https://genius.com/search?q=${encodeURIComponent(artist + ' ' + title)}`;
            const searchResponse = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            });
            const $ = cheerio.load(searchResponse.data);
            const firstResult = $('a[href*="/lyrics"]').first();
            if (firstResult.length === 0)
                return null;
            const lyricsUrl = `https://genius.com${firstResult.attr('href')}`;
            const lyricsResponse = await axios.get(lyricsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            });
            const lyricsPage = cheerio.load(lyricsResponse.data);
            const lyricsContainer = lyricsPage('[data-lyrics-container="true"]');
            if (lyricsContainer.length > 0) {
                let lyrics = '';
                lyricsContainer.each((i, elem) => {
                    lyrics += lyricsPage(elem).text() + '\n';
                });
                return lyrics.trim();
            }
            return null;
        }
        catch (error) {
            console.error('Error scraping from Genius:', error);
            return null;
        }
    }
    async scrapeLyricsFromAZLyrics(artist, title) {
        try {
            const cleanArtist = artist.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
            const azLyricsUrl = `https://www.azlyrics.com/lyrics/${cleanArtist}/${cleanTitle}.html`;
            const response = await axios.get(azLyricsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            });
            const $ = cheerio.load(response.data);
            const lyricsDiv = $('div').filter((i, el) => {
                return $(el).css('font-size') === undefined &&
                    $(el).text().length > 100 &&
                    !$(el).find('script').length;
            });
            if (lyricsDiv.length > 0) {
                return lyricsDiv.first().text().trim();
            }
            return null;
        }
        catch (error) {
            console.error('Error scraping from AZLyrics:', error);
            return null;
        }
    }
}
export const lyricsService = new LyricsService();
