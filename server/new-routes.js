import fetch from 'node-fetch';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:5000';
const JIKAN = 'https://api.jikan.moe/v4';
const CONSUMET = 'https://api.consumet.org/anime/gogoanime';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function jikanFetch(path, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(`${JIKAN}${path}`, { signal: AbortSignal.timeout(10000) });
            if (response.status === 429) {
                await sleep(1200);
                continue;
            }
            if (!response.ok) {
                throw new Error(`Jikan ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            if (attempt === retries) {
                throw error;
            }
            await sleep(1000 * (attempt + 1));
        }
    }
    throw new Error('Jikan retry limit exceeded');
}

function mapAnime(item = {}) {
    return {
        title: item.title_english || item.title || '',
        malId: item.mal_id,
        image: item.images?.jpg?.large_image_url || item.images?.webp?.large_image_url || '',
        synopsis: item.synopsis?.slice(0, 400) || '',
        score: item.score || 0,
        episodes: item.episodes || null,
        status: item.status || '',
        type: item.type || '',
        season: item.season || null,
        year: item.year || null,
        rating: item.rating || '',
        genres: item.genres?.map((genre) => genre.name) || [],
        studios: item.studios?.map((studio) => studio.name) || [],
        trailer: item.trailer?.url || null,
    };
}

function mapEpisode(ep = {}) {
    return {
        malId: ep.mal_id,
        title: ep.title || `Episode ${ep.mal_id}`,
        number: ep.mal_id,
        aired: ep.aired || null,
        filler: ep.filler || false,
        recap: ep.recap || false,
        image: null,
    };
}

function titleToSlug(title = '') {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function getDetails(malId) {
    try {
        const body = await jikanFetch(`/anime/${malId}/full`);
        return body?.data ? mapAnime(body.data) : null;
    }
    catch {
        return null;
    }
}

async function getEpisodeList(malId, page = 1) {
    try {
        const body = await jikanFetch(`/anime/${malId}/episodes?page=${page}`);
        return (body?.data || []).map(mapEpisode);
    }
    catch {
        return [];
    }
}

async function getTrending(limit = 12, filter = 'airing') {
    const body = await jikanFetch(`/top/anime?limit=${limit}&filter=${encodeURIComponent(filter)}`);
    return (body?.data || []).map(mapAnime);
}

async function searchAnime(query, limit = 10) {
    const body = await jikanFetch(`/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw`);
    return (body?.data || []).map(mapAnime);
}

async function getSubbedAnime(limit = 10) {
    const body = await jikanFetch(`/seasons/now?limit=${limit}&sfw`);
    return (body?.data || []).map(mapAnime);
}

async function getConsumetEpisodes(animeId) {
    try {
        const response = await fetch(`${CONSUMET}/info/${encodeURIComponent(animeId)}`, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) return [];
        const body = await response.json();
        return (body.episodes || []).map((ep) => ({
            episodeId: ep.id,
            number: ep.number,
            title: ep.title || `Episode ${ep.number}`,
            image: ep.image || null,
        }));
    }
    catch {
        return [];
    }
}

async function getConsumetWatch(episodeId) {
    try {
        const response = await fetch(`${CONSUMET}/watch/${encodeURIComponent(episodeId)}`, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) return null;
        return await response.json();
    }
    catch {
        return null;
    }
}

async function getConsumetDownloadLinks(episodeId) {
    const body = await getConsumetWatch(episodeId);
    if (!body) return [];
    const links = (body.downloadLinks || []).map((link) => ({ quality: link.quality || 'N/A', url: link.url }));
    if (body.download) links.push({ quality: 'download', url: body.download });
    if (links.length === 0 && Array.isArray(body.sources)) {
        return body.sources.map((source) => ({ quality: source.quality || 'auto', url: source.url }));
    }
    return links;
}

async function episodeSlugFromMalId(malId, epNumber = 1) {
    const details = await getDetails(malId);
    if (!details) return { details: null, episodeSlug: '', consumetEpisodes: [] };
    const slug = titleToSlug(details.title);
    const consumetEpisodes = await getConsumetEpisodes(slug);
    const episode = consumetEpisodes.find((item) => Number(item.number) === Number(epNumber)) || consumetEpisodes[Number(epNumber) - 1];
    return { details, episodeSlug: episode?.episodeId || `${slug}-episode-${Number(epNumber) || 1}`, consumetEpisodes };
}

const MOVIE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:5000';
const FLIXHQ = 'https://api.consumet.org/movies/flixhq';
const OMNISAVE_BASE = 'https://h5-api.aoneroom.com';
const MOVIE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/118.0.0.0 Mobile Safari/537.36';

async function movieFetcher(url, options = {}, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'User-Agent': MOVIE_USER_AGENT,
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    ...(options.headers || {}),
                },
                signal: options.signal || AbortSignal.timeout(12000),
            });
            if (response.status === 429) {
                await sleep(2000);
                continue;
            }
            if (response.ok || attempt === retries) return response;
        }
        catch (error) {
            if (attempt === retries) throw new Error(error.message || 'fetch failed');
            await sleep(1000 * (attempt + 1));
        }
    }
    throw new Error('max retries');
}

async function flixFetch(path) {
    try {
        const response = await movieFetcher(`${FLIXHQ}${path}`);
        if (!response.ok) return null;
        return await response.json();
    }
    catch {
        return null;
    }
}

function mapMovieItem(item = {}) {
    return {
        id: item.id || '',
        title: item.title || '',
        image: item.image || item.poster || '',
        coverImage: item.cover || item.backdrop || '',
        type: item.isMovie ? 'movie' : 'series',
        rating: item.rating ? parseFloat(item.rating) : undefined,
        year: item.releaseDate?.slice(0, 4) || item.year || undefined,
        quality: item.quality,
        duration: item.duration,
    };
}

async function getMovieTrending(limit = 16) {
    const [movies, series] = await Promise.all([
        flixFetch('/trending?page=1'),
        flixFetch('/trending?page=1&type=tv'),
    ]);
    return {
        movies: (movies?.results || []).slice(0, limit).map(mapMovieItem),
        series: (series?.results || []).slice(0, limit).map(mapMovieItem),
    };
}

async function getHotMovies(limit = 16) {
    const data = await flixFetch('/popular?page=1');
    return (data?.results || []).slice(0, limit).map(mapMovieItem);
}

async function getSeriesList(limit = 16) {
    const data = await flixFetch('/popular?page=1&type=tv');
    return (data?.results || []).slice(0, limit).map(mapMovieItem);
}

async function searchMovies(query, limit = 12) {
    const data = await flixFetch(`/search?query=${encodeURIComponent(query)}`);
    return (data?.results || []).slice(0, limit).map(mapMovieItem);
}

async function getMovieDetails(mediaId) {
    try {
        const data = await flixFetch(`/info/${encodeURIComponent(mediaId)}`);
        if (!data) return null;
        return {
            id: data.id || mediaId,
            title: data.title || '',
            image: data.image || data.poster || '',
            coverImage: data.cover || data.backdrop || '',
            type: data.isMovie ? 'movie' : 'series',
            rating: data.rating ? parseFloat(data.rating) : undefined,
            year: data.releaseDate?.slice(0, 4) || data.year || undefined,
            quality: data.quality,
            duration: data.duration,
            description: data.description || '',
            genres: data.genres || [],
            cast: data.cast || data.actors || [],
            directors: data.directors || [],
            tags: data.tags || [],
            production: data.production || '',
            country: data.country || '',
            releaseDate: data.releaseDate || '',
            status: data.status || '',
            totalEpisodes: data.totalEpisodes || data.episodes?.length || 0,
            seasons: data.seasons || data.episodes || [],
        };
    }
    catch {
        return null;
    }
}

async function getMovieEpisodes(mediaId) {
    const data = await flixFetch(`/info/${encodeURIComponent(mediaId)}`);
    if (!data?.episodes) return [];
    return data.episodes.map((episode, index) => ({
        id: episode.id,
        number: episode.number || episode.episode || index + 1,
        title: episode.title || '',
        image: episode.image || null,
        season: episode.season || 1,
    }));
}

async function getMovieStreams(episodeId) {
    try {
        const data = await flixFetch(`/watch/${encodeURIComponent(episodeId)}`);
        if (!data) return { sources: [], headers: {} };
        return {
            sources: (data.sources || []).map((source) => ({
                url: source.url,
                quality: source.quality || 'auto',
                isM3U8: source.url?.includes('.m3u8') || false,
            })),
            headers: data.headers || {},
            subtitles: (data.subtitles || []).map((subtitle) => ({
                url: subtitle.url || subtitle.file,
                lang: subtitle.lang || subtitle.label || 'en',
            })),
        };
    }
    catch {
        return { sources: [], headers: {} };
    }
}

async function getMovieDownloads(episodeId) {
    try {
        const data = await flixFetch(`/watch/${encodeURIComponent(episodeId)}`);
        const links = (data?.downloadLinks || []).map((link) => ({ quality: link.quality || 'N/A', url: link.url }));
        if (!links.length && Array.isArray(data?.sources)) {
            return data.sources.map((source) => ({ quality: source.quality || 'auto', url: source.url }));
        }
        return links;
    }
    catch {
        return [];
    }
}

function omnisaveHeaders(locale = 'en') {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-request-lang': locale,
        'x-client-info': JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
        'Origin': 'https://videodownloader.site',
        'Referer': 'https://videodownloader.site/',
    };
}

async function omnisaveRequest(path, options = {}) {
    const response = await movieFetcher(`${OMNISAVE_BASE}${path}`, {
        method: options.method || 'GET',
        headers: { ...omnisaveHeaders(options.locale), ...(options.headers || {}) },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.message || `OmniSave ${response.status}`);
    if (json.code !== 0 && json.code !== 200) throw new Error(json.message || `OmniSave code ${json.code}`);
    return json.data;
}

async function omnisaveSearch({ keyword, page = 1, perPage = 20, subjectType }) {
    const body = { keyword: keyword.trim(), page, perPage };
    if (subjectType) body.subjectType = Number(subjectType);
    return await omnisaveRequest('/wefeed-h5api-bff/subject/search', {
        method: 'POST',
        headers: { 'X-Source': 'downloader' },
        body,
    });
}

async function omnisaveSuggest(keyword, perPage = 10) {
    const data = await omnisaveRequest('/wefeed-h5api-bff/subject/search-suggest', {
        method: 'POST',
        body: { keyword: keyword.trim(), perPage },
    });
    return (data?.items || []).map((item) => item.word).filter(Boolean);
}

async function omnisaveDetail(detailPath) {
    const params = new URLSearchParams({ detailPath: detailPath.trim() });
    return await omnisaveRequest(`/wefeed-h5api-bff/detail?${params}`);
}

async function omnisaveDownload({ subjectId, detailPath = '', season = 0, episode = 0 }) {
    const params = new URLSearchParams({
        subjectId: String(subjectId),
        se: String(season),
        ep: String(episode),
        detailPath: detailPath || '',
    });
    const data = await omnisaveRequest(`/wefeed-h5api-bff/subject/download?${params}`);
    return {
        downloads: (data?.downloads || []).map((download) => ({
            ...download,
            streamHeaders: {
                Referer: 'https://videodownloader.site/',
                Origin: 'https://videodownloader.site',
                'User-Agent': 'Mozilla/5.0',
            },
        })),
        captions: data?.captions || [],
        limited: Boolean(data?.limited),
        freeNum: data?.freeNum,
    };
}

async function omnisaveSniffVideo(url, authToken = '') {
    let lastError = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            const data = await omnisaveRequest('/wefeed-seo-bff/sniff/video', {
                method: 'POST',
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                body: { url },
            });
            const { status, title, duration, formats = [] } = data || {};
            if (status === 'completed') {
                return {
                    title,
                    duration,
                    formats: formats.map((format) => ({
                        quality: format.formatNote || '',
                        format: format.ext || 'mp4',
                        size: format.filesize,
                        url: format.url,
                    })),
                };
            }
            if (status && status !== 'sniffing') throw new Error(`Sniff status error: ${status}`);
            lastError = new Error('Sniff still processing');
            await sleep(5000);
        }
        catch (error) {
            lastError = error;
            if (String(error.message || '').toLowerCase().includes('auth')) throw error;
            await sleep(5000);
        }
    }
    throw lastError || new Error('Sniff timeout');
}

export function registerNewRoutes(app) {
    app.get('/api/anime', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const type = String(req.query.type || '').toLowerCase();
        const limit = Number(req.query.limit) || 10;
        const id = Number(req.query.id || req.query.malId);
        const query = String(req.query.q || req.query.query || '');
        const episodeSlug = String(req.query.episodeSlug || '');
        const ep = Number(req.query.ep || req.query.episode || 1);
        try {
            switch (type) {
                case 'trending': {
                    const data = await getTrending(limit || 12);
                    return res.json({ success: true, type, data });
                }
                case 'search': {
                    if (!query) return res.status(400).json({ success: false, error: 'query param "q" is required' });
                    const data = await searchAnime(query, limit || 10);
                    return res.json({ success: true, type, data });
                }
                case 'details': {
                    if (!id) return res.status(400).json({ success: false, error: 'id is required and must be a MyAnimeList number' });
                    const data = await getDetails(id);
                    if (!data) return res.status(404).json({ success: false, error: 'Anime not found' });
                    return res.json({ success: true, type, data });
                }
                case 'episodes': {
                    if (!id) return res.status(400).json({ success: false, error: 'id is required and must be a MyAnimeList number' });
                    const data = await getEpisodeList(id, Number(req.query.page) || 1);
                    return res.json({ success: true, type, data });
                }
                case 'downloads': {
                    let slug = episodeSlug;
                    let details = null;
                    let consumetEpisodes = [];
                    if (!slug) {
                        if (!id) return res.status(400).json({ success: false, error: 'id is required for downloads when episodeSlug is not provided' });
                        ({ details, episodeSlug: slug, consumetEpisodes } = await episodeSlugFromMalId(id, ep));
                    }
                    const data = await getConsumetDownloadLinks(slug);
                    return res.json({ success: true, type, data, episodeSlug: slug, ep, anime: details, episodesMatched: consumetEpisodes.length });
                }
                case 'streams': {
                    let slug = episodeSlug;
                    if (!slug && id) {
                        ({ episodeSlug: slug } = await episodeSlugFromMalId(id, ep));
                    }
                    if (!slug) return res.status(400).json({ success: false, error: 'episodeSlug or id is required' });
                    const body = await getConsumetWatch(slug);
                    return res.json({ success: Boolean(body), type, data: body?.sources || body || [], episodeSlug: slug });
                }
                case 'full': {
                    if (!query) return res.status(400).json({ success: false, error: 'query param "q" is required' });
                    const searchResults = await searchAnime(query, limit || 5);
                    if (!searchResults.length) return res.json({ success: true, type, data: null, message: 'No anime found' });
                    const anime = await getDetails(searchResults[0].malId) || searchResults[0];
                    const jikanEpisodes = await getEpisodeList(anime.malId);
                    const slug = titleToSlug(anime.title);
                    const consumetEpisodes = await getConsumetEpisodes(slug);
                    const withLinks = await Promise.all(
                        (consumetEpisodes.length ? consumetEpisodes : jikanEpisodes.map((item) => ({
                            episodeId: `${slug}-episode-${item.number}`,
                            number: item.number,
                            title: item.title,
                            image: item.image,
                        }))).slice(0, 5).map(async (episode) => ({
                            ...episode,
                            downloadLinks: await getConsumetDownloadLinks(episode.episodeId),
                        }))
                    );
                    return res.json({ success: true, type, data: { searchResults, anime, episodes: jikanEpisodes, downloads: withLinks, totalEpisodes: Math.max(jikanEpisodes.length, consumetEpisodes.length) } });
                }
                case 'homepage': {
                    const [trending, currentSeason] = await Promise.all([getTrending(10), getSubbedAnime(10)]);
                    return res.json({ success: true, type, data: { trending, recentlyUpdated: currentSeason, currentSeason } });
                }
                case 'subbed': {
                    const data = await getSubbedAnime(limit || 10);
                    return res.json({ success: true, type, data });
                }
                default: {
                    const endpoint = (routeType) => `${BASE_URL}/api/anime?type=${routeType}`;
                    return res.status(400).json({
                        success: false,
                        error: `Unknown type "${type || 'missing'}". Available types: trending, search, details, episodes, downloads, streams, full, homepage, subbed`,
                        endpoints: {
                            trending: endpoint('trending'),
                            search: `${endpoint('search')}&q=naruto`,
                            details: `${endpoint('details')}&id=20`,
                            episodes: `${endpoint('episodes')}&id=20`,
                            downloads: `${endpoint('downloads')}&id=20&ep=1`,
                            streams: `${endpoint('streams')}&episodeSlug=naruto-episode-1`,
                            full: `${endpoint('full')}&q=attack+on+titan`,
                            homepage: endpoint('homepage'),
                            subbed: endpoint('subbed'),
                        },
                    });
                }
            }
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message || 'Anime API failed' });
        }
    });

    app.get('/api/movie', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const type = String(req.query.type || '').toLowerCase();
        const limit = Number(req.query.limit) || 16;
        const q = String(req.query.q || req.query.query || req.query.keyword || '');
        const mid = String(req.query.id || req.query.mediaId || req.query.episodeId || '');
        const detailPath = String(req.query.detailPath || '');
        const page = Number(req.query.page) || 1;
        const perPage = Number(req.query.perPage) || limit || 20;
        const subjectType = req.query.subjectType ? Number(req.query.subjectType) : undefined;
        try {
            switch (type) {
                case 'homepage': {
                    const [trending, hot, series] = await Promise.all([
                        getMovieTrending(10),
                        getHotMovies(10),
                        getSeriesList(10),
                    ]);
                    return res.json({ success: true, type, data: { trending, hot, series } });
                }
                case 'trending': {
                    const data = await getMovieTrending(limit);
                    return res.json({ success: true, type, data });
                }
                case 'hot':
                case 'popular': {
                    const data = await getHotMovies(limit);
                    return res.json({ success: true, type, data });
                }
                case 'series':
                case 'tv': {
                    const data = await getSeriesList(limit);
                    return res.json({ success: true, type, data });
                }
                case 'search': {
                    if (!q) return res.status(400).json({ success: false, error: 'query param "q" is required' });
                    const data = await searchMovies(q, limit || 12);
                    return res.json({ success: true, type, data });
                }
                case 'full': {
                    if (!q) return res.status(400).json({ success: false, error: 'query param "q" is required' });
                    const searchResults = await searchMovies(q, limit || 5);
                    if (!searchResults.length) return res.json({ success: true, type, data: null, message: 'No movie or series found' });
                    const selected = searchResults[0];
                    const details = await getMovieDetails(selected.id);
                    const episodes = await getMovieEpisodes(selected.id);
                    const streamId = episodes[0]?.id || selected.id;
                    const [streams, downloads] = await Promise.all([
                        getMovieStreams(streamId),
                        getMovieDownloads(streamId),
                    ]);
                    return res.json({ success: true, type, data: { searchResults, selected, details, episodes, streamId, streams, downloads } });
                }
                case 'details': {
                    if (!mid) return res.status(400).json({ success: false, error: 'id param is required' });
                    const data = await getMovieDetails(mid);
                    if (!data) return res.status(404).json({ success: false, error: 'Not found' });
                    return res.json({ success: true, type, data });
                }
                case 'episodes': {
                    if (!mid) return res.status(400).json({ success: false, error: 'id param is required' });
                    const data = await getMovieEpisodes(mid);
                    return res.json({ success: true, type, data });
                }
                case 'streams': {
                    if (!mid) return res.status(400).json({ success: false, error: 'id (episode id) is required' });
                    const data = await getMovieStreams(mid);
                    return res.json({ success: true, type, data });
                }
                case 'downloads': {
                    if (!mid) return res.status(400).json({ success: false, error: 'id (episode id) is required' });
                    const data = await getMovieDownloads(mid);
                    return res.json({ success: true, type, data });
                }
                case 'omni-search':
                case 'omnisearch': {
                    if (!q) return res.status(400).json({ success: false, error: 'keyword/q param is required' });
                    const data = await omnisaveSearch({ keyword: q, page, perPage, subjectType });
                    return res.json({ success: true, type, data });
                }
                case 'omni-suggest':
                case 'suggest': {
                    if (!q) return res.status(400).json({ success: false, error: 'keyword/q param is required' });
                    const data = await omnisaveSuggest(q, perPage || 10);
                    return res.json({ success: true, type, data });
                }
                case 'omni-detail':
                case 'omni-details': {
                    if (!detailPath) return res.status(400).json({ success: false, error: 'detailPath param is required' });
                    const data = await omnisaveDetail(detailPath);
                    return res.json({ success: true, type, data });
                }
                case 'omni-download': {
                    const subjectId = String(req.query.subjectId || mid || '');
                    if (!subjectId) return res.status(400).json({ success: false, error: 'subjectId or id param is required' });
                    const data = await omnisaveDownload({
                        subjectId,
                        detailPath,
                        season: Number(req.query.season || req.query.se || 0),
                        episode: Number(req.query.episode || req.query.ep || 0),
                    });
                    return res.json({ success: true, type, data });
                }
                case 'sniff':
                case 'sniff-video': {
                    const url = String(req.query.url || '');
                    if (!url) return res.status(400).json({ success: false, error: 'url param is required' });
                    const authToken = String(req.headers.authorization || req.query.authToken || '').replace(/^Bearer\s+/i, '');
                    const data = await omnisaveSniffVideo(url, authToken);
                    return res.json({ success: true, type, data });
                }
                default: {
                    const endpoint = (routeType) => `${MOVIE_BASE_URL}/api/movie?type=${routeType}`;
                    return res.status(400).json({
                        success: false,
                        error: `Unknown type "${type || 'missing'}". Available types: homepage, trending, hot, series, search, full, details, episodes, streams, downloads, omni-search, omni-suggest, omni-detail, omni-download, sniff`,
                        endpoints: {
                            homepage: endpoint('homepage'),
                            trending: endpoint('trending'),
                            hot: endpoint('hot'),
                            series: endpoint('series'),
                            search: `${endpoint('search')}&q=inception`,
                            full: `${endpoint('full')}&q=inception`,
                            details: `${endpoint('details')}&id=watch-movie-123`,
                            episodes: `${endpoint('episodes')}&id=watch-tv-123`,
                            streams: `${endpoint('streams')}&id=episode-123`,
                            downloads: `${endpoint('downloads')}&id=episode-123`,
                            omniSearch: `${endpoint('omni-search')}&q=inception&subjectType=1`,
                            omniSuggest: `${endpoint('omni-suggest')}&q=avatar`,
                            omniDetail: `${endpoint('omni-detail')}&detailPath=/movie/example`,
                            omniDownload: `${endpoint('omni-download')}&subjectId=123&detailPath=/movie/example&season=0&episode=0`,
                            sniff: `${endpoint('sniff')}&url=https://example.com/video`,
                        },
                    });
                }
            }
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message || 'Movie API failed' });
        }
    });

    // ─── Nanobanana AI ───
    app.get('/api/nanobanana/chat', async (req, res) => {
        const message = String(req.query.message || '');
        if (!message)
            return res.status(400).json({ error: 'Message required' });
        try {
            const r = await fetch(`https://nanobanana.com/api/chat?message=${encodeURIComponent(message)}`);
            const d = await r.json();
            res.json({ response: d?.response || d?.reply || d?.message || 'No response', source: 'nanobanana' });
        }
        catch {
            res.status(500).json({ error: 'Service unavailable' });
        }
    });
    app.get('/api/nanobanana/generate', async (req, res) => {
        const prompt = String(req.query.prompt || '');
        if (!prompt)
            return res.status(400).json({ error: 'Prompt required' });
        try {
            const r = await fetch(`https://nanobanana.com/api/generate?prompt=${encodeURIComponent(prompt)}`);
            const d = await r.json();
            res.json({ result: d?.text || d?.output || d?.result || prompt, source: 'nanobanana' });
        }
        catch {
            res.status(500).json({ error: 'Service unavailable' });
        }
    });
    app.get('/api/nanobanana/image', async (req, res) => {
        const prompt = String(req.query.prompt || '');
        if (!prompt)
            return res.status(400).json({ error: 'Prompt required' });
        try {
            const r = await fetch(`https://nanobanana.com/api/image?prompt=${encodeURIComponent(prompt)}`);
            const d = await r.json();
            res.json({ url: d?.url || d?.image || d?.data || '', source: 'nanobanana' });
        }
        catch {
            res.status(500).json({ error: 'Service unavailable' });
        }
    });
    // ─── Groq AI ───
    app.post('/api/groq/chat', async (req, res) => {
        const message = req.body?.message || '';
        if (!message)
            return res.status(400).json({ error: 'Message required' });
        try {
            const groqKey = process.env.GROQ_API_KEY;
            if (groqKey) {
                const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'mixtral-8x7b-32768', messages: [{ role: 'user', content: message }] }),
                });
                const d = await r.json();
                return res.json({ response: d?.choices?.[0]?.message?.content || 'No response', source: 'groq' });
            }
            res.json({ response: 'GROQ_API_KEY not configured', source: 'groq' });
        }
        catch {
            res.status(500).json({ error: 'Service unavailable' });
        }
    });
    // ─── Perplexity AI Search ───
    app.get('/api/perplexity/search', async (req, res) => {
        const query = String(req.query.query || '');
        if (!query)
            return res.status(400).json({ error: 'Query required' });
        try {
            const r = await fetch(`https://api.perplexity.ai/search?q=${encodeURIComponent(query)}`);
            const d = await r.json();
            res.json({ results: d?.results || d?.data || [], source: 'perplexity' });
        }
        catch {
            res.status(500).json({ error: 'Search unavailable' });
        }
    });
    // ─── Games ───
    app.get('/api/games/trivia', async (req, res) => {
        const amount = req.query.amount || 10;
        const category = req.query.category ? `&category=${req.query.category}` : '';
        const difficulty = req.query.difficulty ? `&difficulty=${req.query.difficulty}` : '';
        try {
            const r = await fetch(`https://opentdb.com/api.php?amount=${amount}${category}${difficulty}`);
            const d = await r.json();
            res.json({ results: d?.results || [], source: 'opentdb' });
        }
        catch {
            res.status(500).json({ error: 'Trivia unavailable' });
        }
    });
    app.get('/api/games/word', async (req, res) => {
        const type = String(req.query.type || 'scramble');
        try {
            const r = await fetch('https://random-word-api.herokuapp.com/word?number=1');
            const words = await r.json();
            const word = words?.[0] || 'coding';
            const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
            res.json({ type, original: type === 'wordle' ? null : word, scrambled: type === 'scramble' ? scrambled : null, length: word.length, hints: [`${word.length} letters`, `Starts with "${word[0]}"`] });
        }
        catch {
            res.status(500).json({ error: 'Word game unavailable' });
        }
    });
    app.get('/api/games/number-fact', async (req, res) => {
        const num = req.query.number || 'random';
        try {
            const r = await fetch(`http://numbersapi.com/${num}/trivia`);
            const text = await r.text();
            res.json({ number: num, fact: text });
        }
        catch {
            res.status(500).json({ error: 'Number fact unavailable' });
        }
    });
    app.get('/api/games/dice', (req, res) => {
        const sides = Number(req.query.sides) || 6;
        res.json({ sides, result: Math.floor(Math.random() * sides) + 1 });
    });
    app.get('/api/games/coinflip', (req, res) => {
        res.json({ result: Math.random() > 0.5 ? 'heads' : 'tails' });
    });
    app.get('/api/games/rps', (req, res) => {
        const choices = ['rock', 'paper', 'scissors'];
        const computer = choices[Math.floor(Math.random() * 3)];
        const player = String(req.query.choice || '').toLowerCase();
        let result = 'tie';
        if (player === 'rock' && computer === 'scissors')
            result = 'win';
        else if (player === 'paper' && computer === 'rock')
            result = 'win';
        else if (player === 'scissors' && computer === 'paper')
            result = 'win';
        else if (player && player !== computer)
            result = 'lose';
        res.json({ player: player || 'unknown', computer, result });
    });
    // ─── Anime (Jikan API) ───
    app.get('/api/anime/search', async (req, res) => {
        const q = String(req.query.query || '');
        if (!q)
            return res.status(400).json({ error: 'Query required' });
        try {
            const r = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=15`);
            const d = await r.json();
            res.json({ data: d?.data || [], source: 'jikan' });
        }
        catch {
            res.status(500).json({ error: 'Search failed' });
        }
    });
    app.get('/api/anime/top', async (req, res) => {
        const page = req.query.page || 1;
        const filter = String(req.query.type || 'airing');
        try {
            const r = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}&filter=${filter}&limit=20`);
            const d = await r.json();
            res.json({ data: d?.data || [], source: 'jikan' });
        }
        catch {
            res.status(500).json({ error: 'Failed' });
        }
    });
    app.get('/api/anime/random', async (_req, res) => {
        try {
            const r = await fetch('https://api.jikan.moe/v4/random/anime');
            const d = await r.json();
            res.json({ data: d?.data || null, source: 'jikan' });
        }
        catch {
            res.status(500).json({ error: 'Failed' });
        }
    });
    app.get('/api/anime/characters', async (req, res) => {
        const id = Number(req.query.id);
        if (!id)
            return res.status(400).json({ error: 'ID required' });
        try {
            const r = await fetch(`https://api.jikan.moe/v4/anime/${id}/characters`);
            const d = await r.json();
            res.json({ data: d?.data || [], source: 'jikan' });
        }
        catch {
            res.status(500).json({ error: 'Failed' });
        }
    });
    app.get('/api/anime/episodes', async (req, res) => {
        const id = Number(req.query.id);
        if (!id)
            return res.status(400).json({ error: 'ID required' });
        try {
            const r = await fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`);
            const d = await r.json();
            res.json({ data: d?.data || [], source: 'jikan' });
        }
        catch {
            res.status(500).json({ error: 'Failed' });
        }
    });
    app.get('/api/anime/recommendations', async (req, res) => {
        const id = Number(req.query.id);
        if (!id)
            return res.status(400).json({ error: 'ID required' });
        try {
            const r = await fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`);
            const d = await r.json();
            res.json({ data: d?.data || [], source: 'jikan' });
        }
        catch {
            res.status(500).json({ error: 'Failed' });
        }
    });
    app.get('/api/anime/quotes', async (req, res) => {
        const anime = String(req.query.anime || '');
        const character = String(req.query.character || '');
        try {
            let url = 'https://animechan.xyz/api/random';
            if (anime && character)
                url = `https://animechan.xyz/api/random/anime?title=${encodeURIComponent(anime)}&name=${encodeURIComponent(character)}`;
            else if (anime)
                url = `https://animechan.xyz/api/random/anime?title=${encodeURIComponent(anime)}`;
            else if (character)
                url = `https://animechan.xyz/api/random/character?name=${encodeURIComponent(character)}`;
            const r = await fetch(url);
            const d = await r.json();
            res.json({ data: d, source: 'animechan' });
        }
        catch {
            res.status(500).json({ error: 'Failed' });
        }
    });
    app.get('/api/waifu/random', async (req, res) => {
        const category = String(req.query.category || 'waifu');
        try {
            const r = await fetch(`https://api.waifu.pics/sfw/${category}`);
            const d = await r.json();
            res.json({ url: d?.url || '', category, source: 'waifu.pics' });
        }
        catch {
            res.status(500).json({ error: 'Failed' });
        }
    });
    // ─── Spotify ───
    app.get('/api/spotify/search', async (req, res) => {
        const q = String(req.query.q || '');
        if (!q)
            return res.status(400).json({ error: 'Query required' });
        try {
            const r = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track,artist,album&limit=10`, {
                headers: { 'Authorization': `Bearer ${process.env.SPOTIFY_TOKEN || ''}` }
            });
            const d = await r.json();
            res.json({ tracks: d?.tracks?.items || [], artists: d?.artists?.items || [], albums: d?.albums?.items || [] });
        }
        catch {
            res.status(500).json({ error: 'Spotify search unavailable' });
        }
    });
    app.get('/api/spotify/play', async (req, res) => {
        const id = String(req.query.id || '');
        if (!id)
            return res.status(400).json({ error: 'Track ID required' });
        res.json({ playUrl: `https://open.spotify.com/track/${id}`, id, source: 'spotify' });
    });
    // ─── YouTube Play ───
    app.get('/api/youtube/play', async (req, res) => {
        const url = String(req.query.url || '');
        if (!url)
            return res.status(400).json({ error: 'URL required' });
        try {
            // Extract video ID
            const videoId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
            if (!videoId)
                return res.status(400).json({ error: 'Invalid YouTube URL' });
            const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            const d = await r.json();
            res.json({
                videoId, title: d?.title || '', author: d?.author_name || '',
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
                watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
                source: 'youtube'
            });
        }
        catch {
            res.status(500).json({ error: 'Failed to fetch video info' });
        }
    });
    app.get('/api/youtube/search', async (req, res) => {
        const q = String(req.query.q || '');
        if (!q)
            return res.status(400).json({ error: 'Query required' });
        try {
            const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&format=json`);
            res.json({ query: q, results: [], source: 'youtube' });
        }
        catch {
            res.status(500).json({ error: 'Search failed' });
        }
    });
    // ─── All-in-One Downloader ───
    app.get('/api/download', async (req, res) => {
        const url = String(req.query.url || '');
        if (!url)
            return res.status(400).json({ error: 'URL required' });
        // Detect platform
        const isTikTok = url.includes('tiktok.com');
        const isInstagram = url.includes('instagram.com');
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        const isTwitter = url.includes('twitter.com') || url.includes('x.com');
        const isFacebook = url.includes('facebook.com') || url.includes('fb.com');
        const isSpotify = url.includes('spotify.com');
        const isSoundCloud = url.includes('soundcloud.com');
        try {
            let result = { url, detected: 'unknown', source: url };
            if (isTikTok) {
                try {
                    const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
                    const d = await r.json();
                    result = { url, detected: 'tiktok', videoUrl: d?.data?.play || d?.data?.wmplay || '', author: d?.data?.author?.nickname || '', title: d?.data?.title || '', source: 'tikwm' };
                }
                catch {
                    result = { url, detected: 'tiktok', error: 'Could not fetch', source: 'tikwm' };
                }
            }
            else if (isInstagram) {
                result = { url, detected: 'instagram', message: 'Use /api/instagram/download?url=' + url, source: 'instagram' };
            }
            else if (isYouTube) {
                const videoId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
                result = { url, detected: 'youtube', videoId: videoId || '', thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '', source: 'youtube' };
            }
            else if (isTwitter) {
                result = { url, detected: 'twitter', message: 'Twitter video download', source: 'twitter' };
            }
            else {
                result = { url, detected: 'unknown', message: 'Unsupported platform. Supported: TikTok, Instagram, YouTube, Twitter/X, Facebook, Spotify', source: 'universal' };
            }
            res.json(result);
        }
        catch {
            res.status(500).json({ error: 'Download failed', url });
        }
    });
    // ─── Tools ───
    app.get('/api/tools/qr', (req, res) => {
        const text = String(req.query.text || '');
        if (!text)
            return res.status(400).json({ error: 'Text required' });
        res.json({ qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`, text });
    });
    app.get('/api/tools/password', (req, res) => {
        const len = Number(req.query.length) || 16;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < len; i++)
            password += chars[Math.floor(Math.random() * chars.length)];
        res.json({ password, length: len });
    });
    app.get('/api/tools/weather', async (req, res) => {
        const city = String(req.query.city || '');
        if (!city)
            return res.status(400).json({ error: 'City required' });
        try {
            const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
            const d = await r.json();
            res.json({ data: d, source: 'wttr.in' });
        }
        catch {
            res.status(500).json({ error: 'Weather unavailable' });
        }
    });
    app.get('/api/tools/news', async (req, res) => {
        const category = String(req.query.category || 'technology');
        try {
            const key = process.env.NEWS_API_KEY || 'demo';
            const r = await fetch(`https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${key}`);
            const d = await r.json();
            res.json({ articles: d?.articles || [], source: 'newsapi' });
        }
        catch {
            res.status(500).json({ error: 'News unavailable' });
        }
    });
    app.get('/api/tools/lyrics', async (req, res) => {
        const artist = String(req.query.artist || '');
        const title = String(req.query.title || '');
        if (!artist || !title)
            return res.status(400).json({ error: 'Artist and title required' });
        try {
            const r = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
            const d = await r.json();
            res.json({ lyrics: d?.lyrics || 'Not found', artist, title });
        }
        catch {
            res.status(500).json({ error: 'Lyrics unavailable' });
        }
    });
    app.get('/api/tools/translate', async (req, res) => {
        const text = String(req.query.text || '');
        const target = String(req.query.target || 'es');
        if (!text)
            return res.status(400).json({ error: 'Text required' });
        try {
            const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`);
            const d = await r.json();
            res.json({ translated: d?.responseData?.translatedText || text, target });
        }
        catch {
            res.status(500).json({ error: 'Translation unavailable' });
        }
    });
    app.get('/api/tools/tts', async (req, res) => {
        const text = String(req.query.text || '');
        if (!text)
            return res.status(400).json({ error: 'Text required' });
        try {
            const r = await fetch(`https://api.voicerss.org/?key=${process.env.VOICERSS_KEY || 'demo'}&src=${encodeURIComponent(text)}&hl=en-us`);
            const audio = await r.arrayBuffer();
            res.set('Content-Type', 'audio/mpeg');
            res.send(Buffer.from(audio));
        }
        catch {
            res.status(500).json({ error: 'TTS unavailable' });
        }
    });
    // ─── Image Editing API ───
    app.get('/api/edit/resize', async (req, res) => {
        const { url, width, height } = req.query;
        if (!url)
            return res.status(400).json({ error: 'Image URL required' });
        const w = Number(width) || 400;
        const h = Number(height) || 300;
        res.json({ result: `https://images.weserv.nl/?url=${encodeURIComponent(String(url))}&w=${w}&h=${h}&fit=outside`, source: 'weserv' });
    });
    app.get('/api/edit/filter', async (req, res) => {
        const { url, filter } = req.query;
        if (!url)
            return res.status(400).json({ error: 'Image URL required' });
        const filters = { grayscale: '&filt=grayscale', blur: '&filt=blur&radius=5', sepia: '&filt=sepia', brightness: '&filt=brightness&amount=1.3', contrast: '&filt=contrast&amount=1.5' };
        const filt = filters[String(filter || '')] || '';
        res.json({ result: `https://images.weserv.nl/?url=${encodeURIComponent(String(url))}&w=500${filt}`, filter: filter || 'none' });
    });
    app.get('/api/edit/compress', async (req, res) => {
        const { url, quality } = req.query;
        if (!url)
            return res.status(400).json({ error: 'Image URL required' });
        const q = Number(quality) || 50;
        res.json({ result: `https://images.weserv.nl/?url=${encodeURIComponent(String(url))}&w=800&q=${q}`, quality: q });
    });
    app.get('/api/edit/format', async (req, res) => {
        const { url, format } = req.query;
        if (!url)
            return res.status(400).json({ error: 'Image URL required' });
        const fmt = String(format || 'webp');
        res.json({ result: `https://images.weserv.nl/?url=${encodeURIComponent(String(url))}&output=${fmt}`, format: fmt });
    });
    app.get('/api/edit/crop', async (req, res) => {
        const { url, x, y, w, h } = req.query;
        if (!url)
            return res.status(400).json({ error: 'Image URL required' });
        res.json({ result: `https://images.weserv.nl/?url=${encodeURIComponent(String(url))}&cx=${x || 0}&cy=${y || 0}&cw=${w || 200}&ch=${h || 200}`, source: 'weserv' });
    });
    // ─── Movie APIs ───
    app.get('/api/movies/search', async (req, res) => {
        const q = String(req.query.q || '');
        if (!q)
            return res.status(400).json({ error: 'Query required' });
        try {
            const r = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${process.env.OMDB_KEY || 'demo'}`);
            const d = await r.json();
            res.json({ results: d?.Search || [], total: d?.totalResults || 0, source: 'omdb' });
        }
        catch {
            res.status(500).json({ error: 'Movie search unavailable' });
        }
    });
    app.get('/api/movies/detail', async (req, res) => {
        const id = String(req.query.id || '');
        if (!id)
            return res.status(400).json({ error: 'Movie ID required' });
        try {
            const r = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(id)}&apikey=${process.env.OMDB_KEY || 'demo'}`);
            const d = await r.json();
            res.json({ data: d, source: 'omdb' });
        }
        catch {
            res.status(500).json({ error: 'Movie detail unavailable' });
        }
    });
    app.get('/api/movies/trending', async (req, res) => {
        try {
            const r = await fetch('https://api.themoviedb.org/3/trending/movie/week?api_key=' + (process.env.TMDB_KEY || ''));
            const d = await r.json();
            res.json({ results: d?.results || [], source: 'tmdb' });
        }
        catch {
            res.status(500).json({ error: 'Trending unavailable' });
        }
    });
    app.get('/api/movies/popular', async (req, res) => {
        const page = req.query.page || 1;
        try {
            const r = await fetch(`https://api.themoviedb.org/3/movie/popular?page=${page}&api_key=${process.env.TMDB_KEY || ''}`);
            const d = await r.json();
            res.json({ results: d?.results || [], page: d?.page || 1, total: d?.total_results || 0, source: 'tmdb' });
        }
        catch {
            res.status(500).json({ error: 'Popular movies unavailable' });
        }
    });
    app.get('/api/movies/upcoming', async (req, res) => {
        try {
            const r = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.TMDB_KEY || ''}`);
            const d = await r.json();
            res.json({ results: d?.results || [], source: 'tmdb' });
        }
        catch {
            res.status(500).json({ error: 'Upcoming unavailable' });
        }
    });
    app.get('/api/movies/top-rated', async (req, res) => {
        try {
            const r = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_KEY || ''}`);
            const d = await r.json();
            res.json({ results: d?.results || [], source: 'tmdb' });
        }
        catch {
            res.status(500).json({ error: 'Top rated unavailable' });
        }
    });
    // ─── Anime Download ───
    app.get('/api/anime/download', async (req, res) => {
        const { url, episode } = req.query;
        if (!url)
            return res.status(400).json({ error: 'Anime URL required' });
        try {
            const episodeId = String(episode || '').includes('episode-') ? String(episode) : `${String(url)}-episode-${Number(episode) || 1}`;
            const r = await fetch(`https://api.consumet.org/anime/gogoanime/watch/${encodeURIComponent(episodeId)}?server=gogocdn`);
            const d = await r.json();
            const sources = (d?.sources || []).map((s) => ({ quality: s.quality || 'auto', url: s.url }));
            if (d?.download)
                sources.push({ quality: 'download', url: d.download });
            res.json({ sources, episode: Number(episode) || 1, source: 'gogoanime' });
        }
        catch {
            res.status(500).json({ error: 'Anime download unavailable' });
        }
    });
    app.get('/api/anime/all-in-one-download', async (req, res) => {
        const query = String(req.query.query || req.query.q || '');
        const animeId = String(req.query.id || req.query.animeId || '');
        const episode = Number(req.query.episode || 1);
        if (!query && !animeId)
            return res.status(400).json({ error: 'Query or anime id required' });
        try {
            const results = {
                query: query || animeId,
                episode,
                providers: [],
                note: 'Returns provider metadata and direct source URLs only when upstream providers expose them.',
            };
            if (query) {
                const jikan = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`).then((r) => r.json()).catch(() => null);
                results.providers.push({
                    provider: 'jikan',
                    type: 'metadata-search',
                    items: jikan?.data || [],
                });
            }
            const gogoEpisodeId = animeId ? `${animeId}-episode-${episode}` : `${query.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-episode-${episode}`;
            const gogo = await fetch(`https://api.consumet.org/anime/gogoanime/watch/${encodeURIComponent(gogoEpisodeId)}?server=gogocdn`).then((r) => r.json()).catch(() => null);
            results.providers.push({
                provider: 'gogoanime',
                type: 'stream-download-sources',
                episodeId: gogoEpisodeId,
                sources: [
                    ...((gogo?.sources || []).map((source) => ({ quality: source.quality || 'auto', url: source.url }))),
                    ...(gogo?.download ? [{ quality: 'download', url: gogo.download }] : []),
                ],
            });
            results.providers.push({
                provider: 'fallback-search',
                type: 'discovery',
                urls: [
                    `https://www.google.com/search?q=${encodeURIComponent(`${query || animeId} anime episode ${episode} download`)}`,
                    `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(query || animeId)}`,
                ],
            });
            res.json(results);
        }
        catch (error) {
            res.status(500).json({ error: 'All-in-one anime download lookup unavailable' });
        }
    });
    app.get('/api/anime/stream', async (req, res) => {
        const { id } = req.query;
        if (!id)
            return res.status(400).json({ error: 'Episode ID required' });
        try {
            const r = await fetch(`https://api.consumet.org/anime/gogoanime/watch/${encodeURIComponent(String(id))}`);
            const d = await r.json();
            res.json({ sources: d?.sources || [], subtitles: d?.subtitles || [], source: 'gogoanime' });
        }
        catch {
            res.status(500).json({ error: 'Stream unavailable' });
        }
    });
    app.get('/api/anime/servers', async (req, res) => {
        const { id } = req.query;
        if (!id)
            return res.status(400).json({ error: 'Episode ID required' });
        try {
            const r = await fetch(`https://api.consumet.org/anime/gogoanime/servers/${encodeURIComponent(String(id))}`);
            const d = await r.json();
            res.json({ servers: d || [], source: 'gogoanime' });
        }
        catch {
            res.status(500).json({ error: 'Servers unavailable' });
        }
    });
    // ─── Movie Download ───
    app.get('/api/movies/download', async (req, res) => {
        const { id, source } = req.query;
        if (!id)
            return res.status(400).json({ error: 'Movie ID required' });
        try {
            const src = String(source || 'tmdb');
            if (src === 'tmdb') {
                const r = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_KEY || ''}&append_to_response=videos,external_ids`);
                const d = await r.json();
                res.json({
                    title: d?.title || '',
                    overview: d?.overview || '',
                    poster: d?.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : '',
                    backdrop: d?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${d.backdrop_path}` : '',
                    runtime: d?.runtime || 0,
                    rating: d?.vote_average || 0,
                    trailer: d?.videos?.results?.[0]?.key ? `https://www.youtube.com/watch?v=${d.videos.results[0].key}` : '',
                    source: 'tmdb',
                    downloadUrl: `https://www.google.com/search?q=${encodeURIComponent(d?.title || '')}+movie+download+free`,
                });
            }
            else if (src === 'flix') {
                const r = await fetch(`https://flixhq.to/ajax/movie/episodes/${id}`);
                const d = await r.json();
                res.json({ data: d, source: 'flixhq' });
            }
            else {
                res.json({ id, source: src, downloadUrl: `https://www.google.com/search?q=movie+${id}+download` });
            }
        }
        catch {
            res.status(500).json({ error: 'Movie download unavailable' });
        }
    });
    app.get('/api/movies/stream', async (req, res) => {
        const { id, season, episode } = req.query;
        if (!id)
            return res.status(400).json({ error: 'Movie/Show ID required' });
        try {
            const r = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${process.env.TMDB_KEY || ''}`);
            const d = await r.json();
            res.json({
                results: d?.results || {},
                streamUrl: `https://www.google.com/search?q=watch+${encodeURIComponent(id)}+online+free`,
                source: 'tmdb'
            });
        }
        catch {
            res.status(500).json({ error: 'Stream info unavailable' });
        }
    });
    // ─── Fix Old/Updated APIs ───
    app.get('/api/ytdl', async (req, res) => {
        const url = String(req.query.url || '');
        if (!url)
            return res.status(400).json({ error: 'URL required' });
        try {
            const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
            const d = await r.json();
            const videoId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
            res.json({
                title: d?.title || '', author: d?.author_name || '',
                thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
                videoId, formats: [{ quality: '720p', url: `https://www.youtube.com/watch?v=${videoId}` }],
                source: 'youtube-oembed'
            });
        }
        catch {
            res.status(500).json({ error: 'Download unavailable' });
        }
    });
    app.get('/api/instagram', async (req, res) => {
        const url = String(req.query.url || '');
        if (!url)
            return res.status(400).json({ error: 'URL required' });
        try {
            const r = await fetch(`https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`);
            const d = await r.json();
            res.json({ title: d?.title || '', author: d?.author_name || '', thumbnail: d?.thumbnail_url || '', source: 'instagram-oembed' });
        }
        catch {
            res.status(500).json({ error: 'Instagram unavailable' });
        }
    });
    app.get('/api/tiktok', async (req, res) => {
        const url = String(req.query.url || '');
        if (!url)
            return res.status(400).json({ error: 'URL required' });
        try {
            const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = await r.json();
            res.json({
                author: d?.data?.author?.nickname || '', title: d?.data?.title || '',
                videoUrl: d?.data?.play || d?.data?.wmplay || '',
                music: d?.data?.music || '', source: 'tikwm'
            });
        }
        catch {
            res.status(500).json({ error: 'TikTok unavailable' });
        }
    });
    app.get('/api/facebook', async (req, res) => {
        const url = String(req.query.url || '');
        if (!url)
            return res.status(400).json({ error: 'URL required' });
        try {
            const r = await fetch(`https://www.facebook.com/plugins/video/oembed.json?url=${encodeURIComponent(url)}`);
            const d = await r.json();
            res.json({ title: d?.title || '', author: d?.author_name || '', html: d?.html || '', source: 'facebook-oembed' });
        }
        catch {
            res.status(500).json({ error: 'Facebook unavailable' });
        }
    });
    app.get('/api/twitter', async (req, res) => {
        const url = String(req.query.url || '');
        if (!url)
            return res.status(400).json({ error: 'URL required' });
        try {
            const r = await fetch(`https://api.twitter.com/2/tweets?ids=${encodeURIComponent(url)}`);
            const d = await r.json();
            res.json({ data: d?.data || {}, source: 'twitter' });
        }
        catch {
            res.status(500).json({ error: 'Twitter unavailable' });
        }
    });
    app.get('/api/soundcloud', async (req, res) => {
        const url = String(req.query.url || '');
        if (!url)
            return res.status(400).json({ error: 'URL required' });
        try {
            const r = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`);
            const d = await r.json();
            res.json({ title: d?.title || '', author: d?.author_name || '', thumbnail: d?.thumbnail_url || '', source: 'soundcloud-oembed' });
        }
        catch {
            res.status(500).json({ error: 'SoundCloud unavailable' });
        }
    });
    console.log('✅ New API routes registered (including movie download, fixed social apis, ytdl, instagram, tiktok, facebook, twitter, soundcloud)');
}
