import axios from 'axios';
import * as cheerio from 'cheerio';
import YTDlpWrap from 'yt-dlp-wrap';
export class AnimeUnifiedService {
    creator = '@BrokenVZN';
    jikanBaseUrl = 'https://api.jikan.moe/v4';
    anilistBaseUrl = 'https://graphql.anilist.co';
    nyaaBaseUrl = 'https://nyaa.si';
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
    ytDlpWrap; // Allow null to handle initialization failure
    constructor() {
        try {
            this.ytDlpWrap = new YTDlpWrap();
            console.log('YTDlpWrap initialized successfully in AnimeUnifiedService');
        }
        catch (error) {
            console.error('Failed to initialize YTDlpWrap in AnimeUnifiedService:', error.message);
            this.ytDlpWrap = null;
        }
    }
    // Legal disclaimer
    getLegalDisclaimer() {
        return `
    ⚠️ LEGAL DISCLAIMER ⚠️
    This service is intended for legitimate, copyright-free content only.
    Users are responsible for ensuring they have proper rights to access or download content.
    Accessing copyrighted material without permission may violate terms of service and copyright laws.
    `;
    }
    // Format duration
    formatDuration(duration) {
        if (typeof duration === 'string')
            return duration;
        if (!duration || isNaN(duration))
            return 'Unknown';
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    // Format published date
    formatPublishedDate(date) {
        if (!date)
            return 'Unknown';
        const parsed = new Date(date);
        const now = new Date();
        const diffYears = now.getFullYear() - parsed.getFullYear();
        if (diffYears >= 1)
            return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
        const diffMonths = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24 * 30));
        if (diffMonths >= 1)
            return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        const diffDays = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    // AniList GraphQL query
    async queryAniList(query, variables) {
        try {
            const response = await axios.post(this.anilistBaseUrl, { query, variables }, {
                headers: { 'Content-Type': 'application/json', 'User-Agent': this.userAgent },
                timeout: 15000
            });
            return response.data.data;
        }
        catch (error) {
            console.error('AniList error:', error.message);
            return null;
        }
    }
    // Validate URL
    validateUrl(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();
            const ip = urlObj.hostname;
            const privateIPPatterns = [
                /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./,
                /^169\.254\./, /^::1$/, /^fc00:/, /^fe80:/
            ];
            if (privateIPPatterns.some(pattern => pattern.test(ip)) || ['localhost', '0.0.0.0'].includes(hostname)) {
                return { valid: false, error: 'Access to private/internal networks is not allowed.' };
            }
            return { valid: true };
        }
        catch {
            return { valid: false, error: 'Invalid URL' };
        }
    }
    // Fetch streaming links using yt-dlp
    async getStreamingLinksInternal(title, episode) {
        try {
            if (!this.ytDlpWrap) {
                console.error('yt-dlp-wrap not initialized for getStreamingLinksInternal');
                return [];
            }
            const searchQuery = `${title} episode ${episode} english sub`;
            const searchUrl = `https://9anime.to/search?keyword=${encodeURIComponent(searchQuery)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const firstResult = $('.film-list .item a').first().attr('href');
            if (!firstResult)
                return [];
            const episodeUrl = `https://9anime.to${firstResult}`;
            const validation = this.validateUrl(episodeUrl);
            if (!validation.valid)
                return [];
            const args = ['--get-url', '--format', 'best[ext=mp4]/best[ext=m3u8]/best', episodeUrl];
            const streamUrl = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });
            return [
                {
                    quality: '720p', // Default, as yt-dlp doesn't always provide quality
                    url: streamUrl.trim(),
                    server: '9anime',
                    type: streamUrl.includes('.m3u8') ? 'm3u8' : 'mp4'
                }
            ];
        }
        catch (error) {
            console.error('Streaming links error:', error.message);
            return [];
        }
    }
    // Fetch download links from Nyaa.si
    async getDownloadLinksInternal(title, episode) {
        try {
            const searchQuery = `${title} episode ${episode} 1080p english sub`;
            const searchUrl = `${this.nyaaBaseUrl}/?f=0&c=1_2&q=${encodeURIComponent(searchQuery)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const links = [];
            $('.torrent-list tbody tr').slice(0, 3).each((_, el) => {
                const magnet = $(el).find('a[href^="magnet:"]').attr('href');
                const size = $(el).find('td').eq(3).text().trim();
                const seeders = parseInt($(el).find('td').eq(5).text().trim()) || 0;
                const leechers = parseInt($(el).find('td').eq(6).text().trim()) || 0;
                if (magnet) {
                    links.push({
                        quality: '1080p',
                        url: magnet,
                        size,
                        type: 'torrent',
                        seeders,
                        leechers
                    });
                }
            });
            return links;
        }
        catch (error) {
            console.error('Download links error:', error.message);
            return [];
        }
    }
    async searchAnime(request) {
        try {
            const { query, page = 1, limit = 25, type, status, genre } = request;
            if (!query) {
                return { success: false, error: 'Please provide a search query', creator: this.creator };
            }
            // Try AniList first
            const anilistQuery = `
        query ($search: String, $page: Int, $perPage: Int, $type: MediaType, $status: MediaStatus, $genre: String) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              currentPage
              lastPage
              total
              hasNextPage
            }
            media(search: $search, type: $type, status: $status, genre: $genre, isAdult: false) {
              id
              title { romaji english }
              description
              coverImage { large }
              bannerImage
              episodes
              status
              season
              seasonYear
              genres
              averageScore
              popularity
              duration
              source
              studios { nodes { name } }
            }
          }
        }
      `;
            const anilistVariables = { search: query, page, perPage: limit, type: type?.toUpperCase(), status: status?.toUpperCase(), genre };
            const anilistData = await this.queryAniList(anilistQuery, anilistVariables);
            let animeList = [];
            let pagination = { currentPage: page, totalPages: 1, totalResults: 0, hasNextPage: false };
            if (anilistData?.Page?.media) {
                animeList = anilistData.Page.media.map((anime) => ({
                    id: anime.id,
                    title: anime.title.romaji,
                    englishTitle: anime.title.english,
                    synopsis: anime.description?.replace(/<[^>]+>/g, ''),
                    image: anime.coverImage?.large,
                    bannerImage: anime.bannerImage,
                    episodes: anime.episodes,
                    status: anime.status?.replace('_', ' '),
                    season: anime.season,
                    year: anime.seasonYear,
                    genres: anime.genres || [],
                    score: anime.averageScore ? anime.averageScore / 10 : 0,
                    popularity: anime.popularity,
                    duration: this.formatDuration(anime.duration || 0),
                    source: anime.source,
                    studios: anime.studios?.nodes?.map((s) => s.name) || [],
                    views: anime.popularity || 0,
                    published: this.formatPublishedDate(anime.startDate ? `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}` : '')
                }));
                pagination = {
                    currentPage: anilistData.Page.pageInfo.currentPage,
                    totalPages: anilistData.Page.pageInfo.lastPage,
                    totalResults: anilistData.Page.pageInfo.total,
                    hasNextPage: anilistData.Page.pageInfo.hasNextPage
                };
            }
            else {
                // Fallback to Jikan
                const params = { q: query, page, limit, sfw: true };
                if (type)
                    params.type = type;
                if (status)
                    params.status = status;
                if (genre)
                    params.genres = genre;
                const response = await axios.get(`${this.jikanBaseUrl}/anime`, { params, timeout: 15000 });
                animeList = response.data.data.map((anime) => ({
                    id: anime.mal_id,
                    title: anime.title,
                    englishTitle: anime.title_english,
                    synopsis: anime.synopsis,
                    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                    bannerImage: anime.images?.jpg?.large_image_url,
                    episodes: anime.episodes,
                    status: anime.status,
                    season: anime.season,
                    year: anime.year,
                    genres: anime.genres?.map((genre) => genre.name) || [],
                    score: anime.score,
                    popularity: anime.popularity,
                    duration: anime.duration,
                    source: anime.source,
                    studios: anime.studios?.map((studio) => studio.name) || [],
                    views: anime.members || 0,
                    published: this.formatPublishedDate(anime.aired?.from || '')
                }));
                pagination = {
                    currentPage: response.data.pagination.current_page,
                    totalPages: response.data.pagination.last_visible_page,
                    totalResults: response.data.pagination.items?.total || 0,
                    hasNextPage: response.data.pagination.has_next_page
                };
            }
            return {
                success: true,
                data: animeList,
                pagination,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Search anime error:', error.message);
            return {
                success: false,
                error: `Failed to search anime: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    async getAnimeDetails(id) {
        try {
            if (!id) {
                return { success: false, error: 'Please provide anime ID', creator: this.creator };
            }
            const anilistQuery = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title { romaji english }
            description
            coverImage { large }
            bannerImage
            episodes
            status
            season
            seasonYear
            genres
            averageScore
            popularity
            duration
            source
            studios { nodes { name } }
            startDate { year month day }
          }
        }
      `;
            const anilistData = await this.queryAniList(anilistQuery, { id });
            let animeInfo;
            if (anilistData?.Media) {
                const anime = anilistData.Media;
                animeInfo = {
                    id: anime.id,
                    title: anime.title.romaji,
                    englishTitle: anime.title.english,
                    synopsis: anime.description?.replace(/<[^>]+>/g, ''),
                    image: anime.coverImage?.large,
                    bannerImage: anime.bannerImage,
                    episodes: anime.episodes,
                    status: anime.status?.replace('_', ' '),
                    season: anime.season,
                    year: anime.seasonYear,
                    genres: anime.genres || [],
                    score: anime.averageScore ? anime.averageScore / 10 : 0,
                    popularity: anime.popularity,
                    duration: this.formatDuration(anime.duration || 0),
                    source: anime.source,
                    studios: anime.studios?.nodes?.map((s) => s.name) || [],
                    views: anime.popularity || 0,
                    published: this.formatPublishedDate(anime.startDate ? `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}` : '')
                };
                // Add streaming/download links
                animeInfo.streamingLinks = this.ytDlpWrap ? await this.getStreamingLinksInternal(anime.title.romaji, 1) : [];
                animeInfo.downloadLinks = await this.getDownloadLinksInternal(anime.title.romaji, 1);
            }
            else {
                const response = await axios.get(`${this.jikanBaseUrl}/anime/${id}/full`, { timeout: 15000 });
                const anime = response.data.data;
                animeInfo = {
                    id: anime.mal_id,
                    title: anime.title,
                    englishTitle: anime.title_english,
                    synopsis: anime.synopsis,
                    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                    bannerImage: anime.images?.jpg?.large_image_url,
                    episodes: anime.episodes,
                    status: anime.status,
                    season: anime.season,
                    year: anime.year,
                    genres: anime.genres?.map((genre) => genre.name) || [],
                    score: anime.score,
                    popularity: anime.popularity,
                    duration: anime.duration,
                    source: anime.source,
                    studios: anime.studios?.map((studio) => studio.name) || [],
                    views: anime.members || 0,
                    published: this.formatPublishedDate(anime.aired?.from || ''),
                    streamingLinks: this.ytDlpWrap ? await this.getStreamingLinksInternal(anime.title, 1) : [],
                    downloadLinks: await this.getDownloadLinksInternal(anime.title, 1)
                };
            }
            return {
                success: true,
                data: animeInfo,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Anime details error:', error.message);
            return {
                success: false,
                error: `Failed to get anime details: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    async getAnimeEpisodes(id) {
        try {
            if (!id) {
                return { success: false, error: 'Please provide anime ID', creator: this.creator };
            }
            const anilistQuery = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            title { romaji }
            streamingEpisodes {
              title
              url
              site
            }
          }
        }
      `;
            const anilistData = await this.queryAniList(anilistQuery, { id });
            let episodes = [];
            let title = '';
            if (anilistData?.Media) {
                title = anilistData.Media.title.romaji;
                episodes = anilistData.Media.streamingEpisodes?.map((ep, index) => ({
                    number: index + 1,
                    title: ep.title || `Episode ${index + 1}`,
                    synopsis: '',
                    airDate: '',
                    streamingLinks: ep.url ? [{
                            quality: '720p',
                            url: ep.url,
                            server: ep.site || 'Unknown',
                            type: ep.url.includes('.m3u8') ? 'm3u8' : 'mp4'
                        }] : []
                })) || [];
            }
            else {
                const response = await axios.get(`${this.jikanBaseUrl}/anime/${id}/episodes`, { timeout: 15000 });
                title = response.data.data[0]?.title || `Anime ${id}`;
                episodes = response.data.data.map((episode) => ({
                    number: episode.mal_id,
                    title: episode.title,
                    synopsis: episode.synopsis,
                    airDate: episode.aired
                }));
            }
            // Add streaming/download links
            for (const episode of episodes) {
                episode.streamingLinks = this.ytDlpWrap ? await this.getStreamingLinksInternal(title, episode.number) : [];
                episode.downloadLinks = await this.getDownloadLinksInternal(title, episode.number);
            }
            return {
                success: true,
                data: episodes,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Anime episodes error:', error.message);
            return {
                success: false,
                error: `Failed to get anime episodes: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    async getStreamingLinks(animeTitle, episode = 1) {
        try {
            if (!animeTitle) {
                return { success: false, error: 'Please provide anime title', creator: this.creator };
            }
            if (!this.ytDlpWrap) {
                return { success: false, error: 'yt-dlp-wrap not initialized', creator: this.creator };
            }
            const streamingLinks = await this.getStreamingLinksInternal(animeTitle, episode);
            if (!streamingLinks.length) {
                return { success: false, error: 'No streaming links found', creator: this.creator };
            }
            return {
                success: true,
                data: streamingLinks,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Streaming links error:', error.message);
            return {
                success: false,
                error: `Failed to get streaming links: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    async getDownloadLinks(animeTitle, episode = 1) {
        try {
            if (!animeTitle) {
                return { success: false, error: 'Please provide anime title', creator: this.creator };
            }
            const downloadLinks = await this.getDownloadLinksInternal(animeTitle, episode);
            if (!downloadLinks.length) {
                return { success: false, error: 'No download links found', creator: this.creator };
            }
            return {
                success: true,
                data: downloadLinks,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Download links error:', error.message);
            return {
                success: false,
                error: `Failed to get download links: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    async getTopAnime(type = 'bypopularity', page = 1) {
        try {
            const anilistQuery = `
        query ($page: Int, $perPage: Int, $sort: [MediaSort]) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              currentPage
              lastPage
              total
              hasNextPage
            }
            media(type: ANIME, sort: $sort, isAdult: false) {
              id
              title { romaji english }
              description
              coverImage { large }
              bannerImage
              episodes
              status
              season
              seasonYear
              genres
              averageScore
              popularity
              duration
              source
              studios { nodes { name } }
              startDate { year month day }
            }
          }
        }
      `;
            const sort = type === 'bypopularity' ? ['POPULARITY_DESC'] : type === 'favorite' ? ['FAVOURITES_DESC'] : ['TRENDING_DESC'];
            const anilistData = await this.queryAniList(anilistQuery, { page, perPage: 25, sort });
            let animeList = [];
            let pagination = { currentPage: page, totalPages: 1, totalResults: 0, hasNextPage: false };
            if (anilistData?.Page?.media) {
                animeList = anilistData.Page.media.map((anime) => ({
                    id: anime.id,
                    title: anime.title.romaji,
                    englishTitle: anime.title.english,
                    synopsis: anime.description?.replace(/<[^>]+>/g, ''),
                    image: anime.coverImage?.large,
                    bannerImage: anime.bannerImage,
                    episodes: anime.episodes,
                    status: anime.status?.replace('_', ' '),
                    season: anime.season,
                    year: anime.seasonYear,
                    genres: anime.genres || [],
                    score: anime.averageScore ? anime.averageScore / 10 : 0,
                    popularity: anime.popularity,
                    duration: this.formatDuration(anime.duration || 0),
                    source: anime.source,
                    studios: anime.studios?.nodes?.map((s) => s.name) || [],
                    views: anime.popularity || 0,
                    published: this.formatPublishedDate(anime.startDate ? `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}` : '')
                }));
                pagination = {
                    currentPage: anilistData.Page.pageInfo.currentPage,
                    totalPages: anilistData.Page.pageInfo.lastPage,
                    totalResults: anilistData.Page.pageInfo.total,
                    hasNextPage: anilistData.Page.pageInfo.hasNextPage
                };
            }
            else {
                const response = await axios.get(`${this.jikanBaseUrl}/top/anime`, {
                    params: { filter: type, page, limit: 25, sfw: true },
                    timeout: 15000
                });
                animeList = response.data.data.map((anime) => ({
                    id: anime.mal_id,
                    title: anime.title,
                    englishTitle: anime.title_english,
                    synopsis: anime.synopsis,
                    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                    bannerImage: anime.images?.jpg?.large_image_url,
                    episodes: anime.episodes,
                    status: anime.status,
                    season: anime.season,
                    year: anime.year,
                    genres: anime.genres?.map((genre) => genre.name) || [],
                    score: anime.score,
                    popularity: anime.popularity,
                    duration: anime.duration,
                    source: anime.source,
                    studios: anime.studios?.map((studio) => studio.name) || [],
                    views: anime.members || 0,
                    published: this.formatPublishedDate(anime.aired?.from || '')
                }));
                pagination = {
                    currentPage: response.data.pagination.current_page,
                    totalPages: response.data.pagination.last_visible_page,
                    totalResults: response.data.pagination.items?.total || 0,
                    hasNextPage: response.data.pagination.has_next_page
                };
            }
            return {
                success: true,
                data: animeList,
                pagination,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Top anime error:', error.message);
            return {
                success: false,
                error: `Failed to get top anime: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    async getSeasonalAnime(year, season) {
        try {
            const anilistQuery = `
        query ($season: MediaSeason, $year: Int, $page: Int) {
          Page(page: $page, perPage: 25) {
            pageInfo {
              currentPage
              lastPage
              total
              hasNextPage
            }
            media(season: $season, seasonYear: $year, type: ANIME, isAdult: false) {
              id
              title { romaji english }
              description
              coverImage { large }
              bannerImage
              episodes
              status
              season
              seasonYear
              genres
              averageScore
              popularity
              duration
              source
              studios { nodes { name } }
              startDate { year month day }
            }
          }
        }
      `;
            const anilistData = await this.queryAniList(anilistQuery, { season: season.toUpperCase(), year, page: 1 });
            let animeList = [];
            let pagination = { currentPage: 1, totalPages: 1, totalResults: 0, hasNextPage: false };
            if (anilistData?.Page?.media) {
                animeList = anilistData.Page.media.map((anime) => ({
                    id: anime.id,
                    title: anime.title.romaji,
                    englishTitle: anime.title.english,
                    synopsis: anime.description?.replace(/<[^>]+>/g, ''),
                    image: anime.coverImage?.large,
                    bannerImage: anime.bannerImage,
                    episodes: anime.episodes,
                    status: anime.status?.replace('_', ' '),
                    season: anime.season,
                    year: anime.seasonYear,
                    genres: anime.genres || [],
                    score: anime.averageScore ? anime.averageScore / 10 : 0,
                    popularity: anime.popularity,
                    duration: this.formatDuration(anime.duration || 0),
                    source: anime.source,
                    studios: anime.studios?.nodes?.map((s) => s.name) || [],
                    views: anime.popularity || 0,
                    published: this.formatPublishedDate(anime.startDate ? `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}` : '')
                }));
                pagination = {
                    currentPage: anilistData.Page.pageInfo.currentPage,
                    totalPages: anilistData.Page.pageInfo.lastPage,
                    totalResults: anilistData.Page.pageInfo.total,
                    hasNextPage: anilistData.Page.pageInfo.hasNextPage
                };
            }
            else {
                const response = await axios.get(`${this.jikanBaseUrl}/seasons/${year}/${season}`, { timeout: 15000 });
                animeList = response.data.data.map((anime) => ({
                    id: anime.mal_id,
                    title: anime.title,
                    englishTitle: anime.title_english,
                    synopsis: anime.synopsis,
                    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                    bannerImage: anime.images?.jpg?.large_image_url,
                    episodes: anime.episodes,
                    status: anime.status,
                    season: anime.season,
                    year: anime.year,
                    genres: anime.genres?.map((genre) => genre.name) || [],
                    score: anime.score,
                    popularity: anime.popularity,
                    duration: anime.duration,
                    source: anime.source,
                    studios: anime.studios?.map((studio) => studio.name) || [],
                    views: anime.members || 0,
                    published: this.formatPublishedDate(anime.aired?.from || '')
                }));
                pagination = {
                    currentPage: response.data.pagination?.current_page || 1,
                    totalPages: response.data.pagination?.last_visible_page || 1,
                    totalResults: response.data.pagination?.items?.total || 0,
                    hasNextPage: response.data.pagination?.has_next_page || false
                };
            }
            return {
                success: true,
                data: animeList,
                pagination,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Seasonal anime error:', error.message);
            return {
                success: false,
                error: `Failed to get seasonal anime: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    getStatus() {
        return {
            service: 'Anime Unified API',
            version: '1.1.0',
            status: this.ytDlpWrap ? 'operational' : 'limited (yt-dlp not initialized)',
            sources: ['Jikan API v4', 'AniList GraphQL', '9anime (streaming)', 'Nyaa.si (downloads)'],
            features: ['Search', 'Details', 'Episodes', 'Streaming', 'Downloads', 'Seasonal', 'Top Lists'],
            disclaimer: this.getLegalDisclaimer(),
            creator: this.creator
        };
    }
}
export const animeUnifiedService = new AnimeUnifiedService();
