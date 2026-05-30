import express from "express";
import * as path from "path";
import { createServer } from "http";
import { storage } from "./storage";
import { verifyFirebaseIdToken } from "./db";
import { tikTokService } from "./services/tiktok";
import { instagramService } from "./services/instagram";
import { youTubeService } from "./services/youtube";
import { qrCodeService } from "./services/qr";
import { urlShortenerService } from "./services/url-shortener";
import { ttsService } from "./services/tts";
import { passwordService } from "./services/password";
import { quotesService } from './services/quotes';
import { moodService } from './services/mood';
import { lyricsService } from './services/lyrics';
import { dateTimeService } from './services/datetime';
import { imagesService } from './services/images';
import { chatService } from './services/chat';
import { aiService } from './services/ai';
import { translationService } from './services/translation';
import { waifuService } from './services/waifu';
import { transcriptionService } from './services/transcription';
import { pexelsService } from './services/pexels';
import { tikTokAdvancedService } from './services/tiktok-advanced';
import { youTubeAdvancedService } from './services/youtube-advanced';
import { pinterestService } from './services/pinterest';
import { pollinationsService } from './services/pollinations';
import { grokService } from './services/grok';
import { registerNewRoutes } from './new-routes';
import { weatherService } from './services/weather';
import { newsService } from './services/news';
import { instagramAdvancedService } from './services/instagram-advanced';
import { utilitiesService } from './services/utilities';
import { animeService } from './services/anime';
import { unsplashService } from './services/unsplash';
import { mangaService } from './services/manga';
import { youtubeAPIService } from './services/youtube-api';
import { animeUnifiedService } from './services/anime-unified';
import { animeScraperService } from './services/anime-scraper';
import { allDownloaderService } from './services/alldownloader';
import { animeCategoriesService } from './services/anime-categories';
import { UnifiedAnimeAPI } from './services/unified-anime-api';
import { YouTubeDlpAPI } from './services/youtube-dlp-api';
import { geminiService } from './services/gemini';
import { bingImagesService } from './services/bing-images';
import { enhancedQRService } from './services/enhanced-qr';
import { eplNewsService } from './services/epl-news';
import { jokesService } from './services/jokes';
import { personalPlayService } from './services/personal-play';
import { scraperFunctions } from './services/scraper-functions';
import { bingImageSearchService } from './services/bing-search';
import { enhancedJokesService } from './services/enhanced-jokes';
import { wikipediaSearchService } from './services/wikipedia-api';
import { urlTesterService } from './services/url-tester';
import { enhancedNewsService } from './services/enhanced-news';
import { codingQuizService } from './services/coding-quiz';
import { toolsUtilityService } from './services/utilities';
import { pollinationsAIService } from './services/pollinations-ai';
import { wordGamesService } from './services/word-games';
import { triviaQuizService } from './services/trivia-quiz';
import { booksSearchService } from './services/books-search';
import { spotifySearchService } from './services/spotify-search';
import { vaneaAIService } from './services/vanea-ai';
import { socialDownloaderService } from './services/social-downloader';
import { qrGeneratorService } from './services/qr-generator';
import { dictionaryAPIService } from './services/dictionary-api';
import { hackerNewsAPIService } from './services/hackernews-api';
import { imageCollectionsService } from './services/image-collections';
import { ytPlayService } from './services/ytplay';
import { adultContentService } from './services/adult-content';
import { videoDownloaderService } from './services/video-downloader';
import { waifuPicsService } from './services/waifu-pics-api';
import { animeImageSearchService } from './services/anime-image-search';
import { enhancedAdultContentService } from './services/enhanced-adult-api';
import { enhancedAPKSearchService } from './services/enhanced-apk-search';
import { adminEnhancedService } from './services/admin-enhanced';
import { appDownloadService } from './services/app-download';
import { kaizYouTubeService } from './services/youtube-kaiz';
import { imgurFreeService } from './services/imgur-free';
import { imgbbService } from './services/imgbb-api';
import { enhancedWaifuService } from './services/enhanced-waifu-api';
import multer from 'multer';
import session from 'express-session';
export async function registerRoutes(app) {
    // Session configuration for admin panel
    app.use(session({
        secret: process.env.SESSION_SECRET || 'admin-session-secret-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
    }));
    const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
    const ADMIN_EMAIL = normalizeEmail(process.env.ADMIN_EMAIL || 'akewusholaabdulbakri101@gmail.com');
    const publicApiPrefixes = ['/api/auth', '/api/admin', '/api/status', '/api/health'];
    const sendApiKeyRequired = (res) => res.status(401).json({
        success: false,
        error: 'API key required. Sign in with Google to create an account, then send your key using the X-API-Key header.',
        auth: {
            login: '/login',
            firebaseLogin: 'POST /api/auth/firebase-login',
            header: 'X-API-Key: bvzn_your_key_here'
        }
    });
    const requireAdmin = (req, res, next) => {
        if (req.session?.isAdminLoggedIn && normalizeEmail(req.session?.adminEmail) === ADMIN_EMAIL) {
            next();
        }
        else {
            res.status(401).json({ success: false, error: 'Admin Google authentication required' });
        }
    };
    const toUserPayload = (user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username,
        photoURL: user.photoURL || null,
        apiKey: user.apiKey,
        tier: user.tier || 'free',
        role: user.role || 'user',
        requestCount: user.requestCount || 0,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
    });
    const upsertFirebaseUser = async (firebaseUser) => {
        const email = normalizeEmail(firebaseUser.email);
        if (!email) {
            throw new Error('Firebase account must include an email address');
        }
        const role = email === ADMIN_EMAIL ? 'admin' : 'user';
        const displayName = firebaseUser.displayName || email.split('@')[0];
        let user = null;
        if (firebaseUser.uid) {
            user = await storage.getUserByFirebaseUid(firebaseUser.uid);
        }
        if (!user) {
            user = await storage.getUserByEmail(email);
        }
        const sharedFields = {
            email,
            firebaseUid: firebaseUser.uid,
            displayName,
            photoURL: firebaseUser.photoURL || null,
            authProvider: 'google.com',
            role,
            lastLogin: new Date()
        };
        if (user) {
            return storage.updateUser(user._id, sharedFields);
        }
        return storage.createUser({
            username: displayName,
            password: null,
            ...sharedFields
        });
    };
    const validateApiKey = async (req, res, next) => {
        try {
            const apiKey = String(req.headers['x-api-key'] || req.query.apiKey || '').trim();
            if (!apiKey) return sendApiKeyRequired(res);
            const user = await storage.getUserByApiKey(apiKey);
            if (!user || user.isActive === false) {
                return res.status(401).json({ success: false, error: 'Invalid or inactive API key' });
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'API key validation failed' });
        }
    };
    app.use('/api', (req, res, next) => {
        if (req.method === 'OPTIONS') return next();
        if (publicApiPrefixes.some((prefix) => req.path === prefix.replace('/api', '') || req.path.startsWith(prefix.replace('/api', '') + '/'))) {
            return next();
        }
        return validateApiKey(req, res, next);
    });
    registerNewRoutes(app);
    // Log API usage
    const logApiUsage = async (req, res, next) => {
        const startTime = Date.now();
        res.on('finish', async () => {
            const responseTime = Date.now() - startTime;
            if (req.user) {
                await storage.createApiLog({
                    userId: req.user._id,
                    endpoint: req.path,
                    method: req.method,
                    statusCode: res.statusCode,
                    responseTime
                });
                // Update user request count
                await storage.updateUserRequestCount(req.user._id, (req.user.requestCount || 0) + 1);
            }
        });
        next();
    };
    // API Status endpoint
    app.get('/api/status', (req, res) => {
        res.json({
            success: true,
            status: 'online',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            creator: 'heisbroken'
        });
    });
    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({
            success: true,
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
            creator: 'heisbroken'
        });
    });
    // Social Media APIs
    app.get('/api/tiktok/download', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter is required'
                });
            }
            const result = await tikTokService.downloadVideo(url);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/instagram/download', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter is required'
                });
            }
            const result = await instagramService.downloadPost(url);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/youtube/info', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter is required'
                });
            }
            const result = await youTubeService.getVideoInfo(url);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Kaiz YouTube API endpoints (converted from Flask) - moved to /api namespace for security
    app.get('/api/youtube-kaiz/video', async (req, res) => {
        try {
            const { query } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    creator: 'broken Vzn',
                    status: false,
                    error: 'Missing query parameter'
                });
            }
            const result = await kaizYouTubeService.getVideo(query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                creator: 'broken Vzn',
                status: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/youtube-kaiz/play', async (req, res) => {
        try {
            const { query } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    creator: 'broken Vzn',
                    status: false,
                    error: 'Missing query parameter'
                });
            }
            const result = await kaizYouTubeService.getPlay(query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                creator: 'broken Vzn',
                status: false,
                error: 'Internal server error'
            });
        }
    });
    // YouTube Kaiz status endpoint
    app.get('/api/youtube-kaiz/status', async (req, res) => {
        try {
            const result = kaizYouTubeService.getStatus();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                creator: 'broken Vzn',
                status: false,
                error: 'Internal server error'
            });
        }
    });
    // Utility APIs
    app.post('/api/qr/generate', async (req, res) => {
        try {
            const result = await qrCodeService.generateQRCode(req.body);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.post('/api/url/shorten', async (req, res) => {
        try {
            const { url, customCode } = req.body;
            const result = await urlShortenerService.shortenUrl({
                url,
                customCode,
                userId: undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.post('/api/tts/generate', async (req, res) => {
        try {
            const result = await ttsService.generateSpeech(req.body);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/password/generate', async (req, res) => {
        try {
            const options = {
                length: parseInt(req.query.length) || undefined,
                includeUppercase: req.query.uppercase === 'true',
                includeLowercase: req.query.lowercase === 'true',
                includeNumbers: req.query.numbers === 'true',
                includeSymbols: req.query.symbols === 'true',
                excludeSimilar: req.query.excludeSimilar === 'true',
                excludeAmbiguous: req.query.excludeAmbiguous === 'true'
            };
            const result = await passwordService.generatePassword(options);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // URL shortener redirect
    app.get('/s/:shortCode', async (req, res) => {
        try {
            const { shortCode } = req.params;
            const originalUrl = await urlShortenerService.expandUrl(shortCode);
            if (originalUrl) {
                res.redirect(302, originalUrl);
            }
            else {
                res.status(404).json({
                    success: false,
                    error: 'Short URL not found'
                });
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // User management
    app.post('/api/auth/firebase-login', async (req, res) => {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(400).json({ success: false, error: 'Firebase idToken is required' });
            }
            const firebaseUser = await verifyFirebaseIdToken(idToken);
            const user = await upsertFirebaseUser(firebaseUser);
            req.session.userId = user._id;
            req.session.userEmail = user.email;
            req.session.apiKey = user.apiKey;
            if (normalizeEmail(user.email) === ADMIN_EMAIL) {
                req.session.isAdminLoggedIn = true;
                req.session.adminId = user._id;
                req.session.adminEmail = ADMIN_EMAIL;
            }
            res.json({
                success: true,
                message: 'Signed in with Firebase Google Auth',
                user: toUserPayload(user),
                admin: normalizeEmail(user.email) === ADMIN_EMAIL
            });
        }
        catch (error) {
            res.status(401).json({ success: false, error: error.message || 'Firebase login failed' });
        }
    });
    app.get('/api/auth/me', async (req, res) => {
        try {
            let user = req.session?.userId ? await storage.getUser(req.session.userId) : null;
            const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
            if (!user && bearer) {
                const firebaseUser = await verifyFirebaseIdToken(bearer);
                user = await upsertFirebaseUser(firebaseUser);
                req.session.userId = user._id;
                req.session.userEmail = user.email;
                req.session.apiKey = user.apiKey;
            }
            if (!user) {
                return res.status(401).json({ success: false, error: 'Not signed in' });
            }
            res.json({ success: true, user: toUserPayload(user), admin: normalizeEmail(user.email) === ADMIN_EMAIL });
        }
        catch (error) {
            res.status(401).json({ success: false, error: error.message || 'Unable to read current user' });
        }
    });
    app.post('/api/auth/logout', (req, res) => {
        req.session.userId = null;
        req.session.userEmail = null;
        req.session.apiKey = null;
        req.session.isAdminLoggedIn = false;
        req.session.adminId = null;
        req.session.adminEmail = null;
        res.json({ success: true, message: 'Logged out successfully' });
    });
    app.post('/api/auth/register', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'Password registration has been disabled. Use Firebase Google Auth at POST /api/auth/firebase-login to create an account and API key.'
        });
    });
    // Quotes endpoints
    app.get('/api/quotes/random', async (req, res) => {
        const result = await quotesService.getRandomQuote();
        res.json(result);
    });
    app.get('/api/quotes/category/:category', async (req, res) => {
        const result = await quotesService.getQuoteByCategory(req.params.category);
        res.json(result);
    });
    app.get('/api/quotes/search', async (req, res) => {
        const result = await quotesService.searchQuotes(req.query.keyword);
        res.json(result);
    });
    // Mood suggestions endpoint
    app.get('/api/mood-suggestions', async (req, res) => {
        const result = await moodService.suggestByMood(req.query.mood, parseInt(req.query.limit));
        res.json(result);
    });
    // Lyrics endpoint
    app.get('/api/lyrics', async (req, res) => {
        const result = await lyricsService.getLyrics(req.query.artist, req.query.title);
        res.json(result);
    });
    // DateTime endpoint
    app.get('/api/datetime', async (req, res) => {
        const result = await dateTimeService.getCurrentDateTime();
        res.json(result);
    });
    // Images search endpoint
    app.get('/api/images', async (req, res) => {
        const result = await imagesService.searchImages(req.query.query);
        res.json(result);
    });
    // Chat endpoint
    app.post('/api/chat', async (req, res) => {
        const result = await chatService.processChat(req.body);
        res.json(result);
    });
    // Configure multer for file uploads
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
    });
    // AI/Gemini API endpoints
    app.post('/api/ai/chat', async (req, res) => {
        try {
            const result = await aiService.processAI(req.body);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/ai/status', (req, res) => {
        const status = aiService.getModelStatus();
        res.json({ success: true, ...status });
    });
    // Translation API endpoints
    app.post('/api/translate', async (req, res) => {
        try {
            const result = await translationService.translateText(req.body);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/translate/languages', (req, res) => {
        const languages = translationService.getSupportedLanguages();
        res.json({ success: true, languages });
    });
    app.post('/api/translate/detect', async (req, res) => {
        try {
            const { text } = req.body;
            const result = await translationService.detectLanguage(text);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Waifu Generator API endpoints
    app.get('/api/waifu', async (req, res) => {
        try {
            const request = {
                tags: req.query.tags ? req.query.tags.split(',') : undefined,
                height: req.query.height,
                width: req.query.width,
                orientation: req.query.orientation,
                nsfw: req.query.nsfw === 'true'
            };
            const result = await waifuService.getWaifu(request);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/waifu/random/:category', async (req, res) => {
        try {
            const { category } = req.params;
            const result = await waifuService.getRandomWaifu(category);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/waifu/character/:character', async (req, res) => {
        try {
            const { character } = req.params;
            const result = await waifuService.getCharacterWaifu(character);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/waifu/bulk', async (req, res) => {
        try {
            const count = parseInt(req.query.count) || 5;
            const tags = req.query.tags ? req.query.tags.split(',') : ['waifu'];
            const result = await waifuService.getBulkWaifus(count, tags);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/waifu/categories', (req, res) => {
        const categories = waifuService.getCategories();
        res.json({ success: true, categories });
    });
    // Enhanced Waifu API endpoints (improved reliability)
    app.get('/api/waifu/enhanced/:category?', async (req, res) => {
        try {
            const { category = 'waifu' } = req.params;
            const { type = 'sfw' } = req.query;
            const result = await enhancedWaifuService.getWaifuImage(category, type);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/waifu/enhanced/batch/:category?', async (req, res) => {
        try {
            const { category = 'waifu' } = req.params;
            const { type = 'sfw', count = '5' } = req.query;
            const result = await enhancedWaifuService.getBatchWaifus(parseInt(count), category, type);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/waifu/enhanced/random', async (req, res) => {
        try {
            const { type = 'sfw' } = req.query;
            const result = await enhancedWaifuService.getRandomWaifu(type);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/waifu/enhanced/hentai/:category?', async (req, res) => {
        try {
            const { category = 'hentai' } = req.params;
            const result = await enhancedWaifuService.getHentaiImage(category);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/waifu/enhanced/categories', (req, res) => {
        const categories = enhancedWaifuService.getAvailableCategories();
        res.json({ success: true, categories });
    });
    app.get('/api/waifu/enhanced/status', (req, res) => {
        const status = enhancedWaifuService.getStatus();
        res.json({ success: true, ...status });
    });
    // Transcription API endpoints
    app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
        try {
            const request = {
                audioFile: req.file,
                audioUrl: req.body.audioUrl,
                language: req.body.language || 'en'
            };
            const result = await transcriptionService.transcribeAudio(request);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.post('/api/transcribe/url', async (req, res) => {
        try {
            const { url, language } = req.body;
            const result = await transcriptionService.transcribeFromUrl(url, language);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/transcribe/languages', (req, res) => {
        const languages = transcriptionService.getSupportedLanguages();
        res.json({ success: true, languages });
    });
    app.get('/api/transcribe/status', (req, res) => {
        const status = transcriptionService.getServiceStatus();
        res.json({ success: true, ...status });
    });
    // Enhanced Pexels API endpoints
    app.get('/api/pexels/photos', async (req, res) => {
        try {
            const request = {
                query: req.query.query,
                category: req.query.category,
                orientation: req.query.orientation,
                size: req.query.size,
                color: req.query.color,
                locale: req.query.locale,
                page: parseInt(req.query.page) || 1,
                per_page: parseInt(req.query.per_page) || 15
            };
            const result = await pexelsService.searchPhotos(request);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pexels/videos', async (req, res) => {
        try {
            const request = {
                query: req.query.query,
                orientation: req.query.orientation,
                size: req.query.size,
                locale: req.query.locale,
                page: parseInt(req.query.page) || 1,
                per_page: parseInt(req.query.per_page) || 15
            };
            const result = await pexelsService.searchVideos(request);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pexels/curated', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;
            const result = await pexelsService.getCuratedPhotos(page, per_page);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pexels/videos/popular', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;
            const result = await pexelsService.getPopularVideos(page, per_page);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pexels/photo/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const result = await pexelsService.getPhotoById(id);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pexels/video/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const result = await pexelsService.getVideoById(id);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pexels/random', async (req, res) => {
        try {
            const category = req.query.category;
            const count = parseInt(req.query.count) || 10;
            const result = await pexelsService.getRandomPhotos(category, count);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pexels/info', (req, res) => {
        const info = pexelsService.getServiceInfo();
        res.json({ success: true, ...info });
    });
    // Advanced TikTok API endpoints
    app.get('/api/tiktod', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter is required'
                });
            }
            const result = await tikTokAdvancedService.downloadVideo(url);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Advanced YouTube API endpoints
    app.get('/api/yt/play', async (req, res) => {
        try {
            const { search } = req.query;
            if (!search || typeof search !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Search parameter is required'
                });
            }
            const result = await youTubeAdvancedService.playVideo(search);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/yt/search', async (req, res) => {
        try {
            const { search } = req.query;
            if (!search || typeof search !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Search parameter is required'
                });
            }
            const result = await youTubeAdvancedService.searchVideos(search);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/yt/download', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter is required'
                });
            }
            const result = await youTubeAdvancedService.downloadVideo(url);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Pinterest API endpoints
    app.get('/api/pinterest', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text || typeof text !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Text parameter is required'
                });
            }
            const result = await pinterestService.searchImages(text);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pinterest/search', async (req, res) => {
        try {
            const { query, limit } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter is required'
                });
            }
            const result = await pinterestService.searchPins(query, limit ? parseInt(limit) : 25);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pinterest/user/:username/boards', async (req, res) => {
        try {
            const { username } = req.params;
            if (!username) {
                return res.status(400).json({
                    success: false,
                    error: 'Username is required'
                });
            }
            const result = await pinterestService.getUserBoards(username);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pinterest/user/:username', async (req, res) => {
        try {
            const { username } = req.params;
            if (!username) {
                return res.status(400).json({
                    success: false,
                    error: 'Username is required'
                });
            }
            const result = await pinterestService.getUserProfile(username);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pinterest/board/:boardId/pins', async (req, res) => {
        try {
            const { boardId } = req.params;
            const { limit } = req.query;
            if (!boardId) {
                return res.status(400).json({
                    success: false,
                    error: 'Board ID is required'
                });
            }
            const result = await pinterestService.getBoardPins(boardId, limit ? parseInt(limit) : 25);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pinterest/trending', async (req, res) => {
        try {
            const { category, limit } = req.query;
            const result = await pinterestService.getTrendingPins(category, limit ? parseInt(limit) : 25);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Pollination AI API endpoints
    app.get('/api/pollinations/image/generate', async (req, res) => {
        try {
            const { prompt, model, width, height, seed, enhance } = req.query;
            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Prompt parameter is required'
                });
            }
            const result = await pollinationsService.generateImage({
                prompt,
                model: model,
                width: width ? parseInt(width) : undefined,
                height: height ? parseInt(height) : undefined,
                seed: seed ? parseInt(seed) : undefined,
                enhance: enhance === 'true'
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pollinations/text/generate', async (req, res) => {
        try {
            const { prompt, model, temperature, max_tokens, system_prompt } = req.query;
            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Prompt parameter is required'
                });
            }
            const result = await pollinationsService.generateText({
                prompt,
                model: model,
                temperature: temperature ? parseFloat(temperature) : undefined,
                max_tokens: max_tokens ? parseInt(max_tokens) : undefined,
                system_prompt: system_prompt
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pollinations/audio/generate', async (req, res) => {
        try {
            const { text, voice, model, speed } = req.query;
            if (!text || typeof text !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Text parameter is required'
                });
            }
            const result = await pollinationsService.generateAudio({
                text,
                voice: voice,
                model: model,
                speed: speed ? parseFloat(speed) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pollinations/image/transform', async (req, res) => {
        try {
            const { prompt, imageUrl, model } = req.query;
            if (!prompt || typeof prompt !== 'string' || !imageUrl || typeof imageUrl !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Prompt and imageUrl parameters are required'
                });
            }
            const result = await pollinationsService.imageToImage(prompt, imageUrl, model);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pollinations/search', async (req, res) => {
        try {
            const { query, model } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter is required'
                });
            }
            const result = await pollinationsService.searchWithPollinationsAI(query, model);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/pollinations/models', async (req, res) => {
        try {
            const result = await pollinationsService.getAvailableModels();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Grok AI API endpoints
    app.post('/api/grok/chat', async (req, res) => {
        try {
            const { message, model, max_tokens, temperature } = req.body;
            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'Message is required'
                });
            }
            const result = await grokService.chat({
                message,
                model,
                max_tokens,
                temperature
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.post('/api/grok/chat-image', async (req, res) => {
        try {
            const { message, image, model } = req.body;
            if (!message || !image) {
                return res.status(400).json({
                    success: false,
                    error: 'Message and image are required'
                });
            }
            const result = await grokService.chatWithImage({
                message,
                image,
                model
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.post('/api/grok/summarize', async (req, res) => {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Text is required'
                });
            }
            const result = await grokService.summarizeText(text);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.post('/api/grok/sentiment', async (req, res) => {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Text is required'
                });
            }
            const result = await grokService.analyzeSentiment(text);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/grok/models', (req, res) => {
        const result = grokService.getAvailableModels();
        res.json(result);
    });
    // ==================== GEMINI AI API ROUTES ====================
    // Gemini Chat
    app.post('/api/gemini/chat', async (req, res) => {
        try {
            const { message, model, max_tokens, temperature, history } = req.body;
            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'Message is required'
                });
            }
            const result = await geminiService.chat({
                message,
                model,
                max_tokens,
                temperature,
                history
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Gemini Image Chat
    app.post('/api/gemini/chat-image', async (req, res) => {
        try {
            const { message, image, model, max_tokens, temperature } = req.body;
            if (!message || !image) {
                return res.status(400).json({
                    success: false,
                    error: 'Message and image are required'
                });
            }
            const result = await geminiService.chatWithImage({
                message,
                image,
                model,
                max_tokens,
                temperature
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Gemini Text Summarization
    app.post('/api/gemini/summarize', async (req, res) => {
        try {
            const { text, model } = req.body;
            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Text is required'
                });
            }
            const result = await geminiService.summarizeText(text, model);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Gemini Sentiment Analysis
    app.post('/api/gemini/sentiment', async (req, res) => {
        try {
            const { text, model } = req.body;
            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Text is required'
                });
            }
            const result = await geminiService.analyzeSentiment(text, model);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Gemini Image Generation
    app.post('/api/gemini/generate-image', async (req, res) => {
        try {
            const { prompt, imagePath } = req.body;
            if (!prompt) {
                return res.status(400).json({
                    success: false,
                    error: 'Image prompt is required'
                });
            }
            const result = await geminiService.generateImage(prompt, imagePath);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Get Available Gemini Models
    app.get('/api/gemini/models', async (req, res) => {
        try {
            const result = await geminiService.getAvailableModels();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Get Gemini Service Status
    app.get('/api/gemini/status', (req, res) => {
        const result = geminiService.getStatus();
        res.json({ success: true, ...result });
    });
    // Weather API endpoints
    app.get('/api/weather/current', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { city, lat, lon } = req.query;
            const result = await weatherService.getCurrentWeather({
                city: city,
                lat: lat ? parseFloat(lat) : undefined,
                lon: lon ? parseFloat(lon) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/weather/forecast', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { city, lat, lon } = req.query;
            const result = await weatherService.getForecast({
                city: city,
                lat: lat ? parseFloat(lat) : undefined,
                lon: lon ? parseFloat(lon) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // News API endpoints
    app.get('/api/news/headlines', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { category, country, limit } = req.query;
            const result = await newsService.getTopHeadlines({
                category: category,
                country: country,
                limit: limit ? parseInt(limit) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/news/search', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { q, limit } = req.query;
            if (!q) {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter "q" is required'
                });
            }
            const result = await newsService.searchNews(q, limit ? parseInt(limit) : 10);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/news/categories', validateApiKey, logApiUsage, (req, res) => {
        const result = newsService.getCategories();
        res.json(result);
    });
    // Advanced Instagram API endpoints
    app.get('/api/instagram/download', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter is required'
                });
            }
            const result = await instagramAdvancedService.downloadPost(url);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/instagram/profile', async (req, res) => {
        try {
            const { username } = req.query;
            if (!username || typeof username !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Username parameter is required'
                });
            }
            const result = await instagramAdvancedService.getProfile(username);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/instagram/story', async (req, res) => {
        try {
            const { username } = req.query;
            if (!username || typeof username !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Username parameter is required'
                });
            }
            const result = await instagramAdvancedService.getStory(username);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Utilities API endpoints
    app.post('/api/utils/base64', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { text, encode } = req.body;
            const result = await utilitiesService.base64Operation({ text, encode });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.post('/api/utils/hash', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { text, algorithm } = req.body;
            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Text parameter is required'
                });
            }
            const result = await utilitiesService.generateHash({ text, algorithm });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/utils/uuid', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const result = await utilitiesService.generateUUID();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.post('/api/utils/shorten', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { url, alias } = req.body;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter is required'
                });
            }
            const result = await utilitiesService.urlShorten(url, alias);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.post('/api/utils/text-stats', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Text parameter is required'
                });
            }
            const result = await utilitiesService.textStatistics(text);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Unsplash API endpoints
    app.get('/api/unsplash/search', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { query, orientation, size, color, page, per_page } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter is required'
                });
            }
            const result = await unsplashService.searchPhotos({
                query,
                orientation: orientation,
                size: size,
                color: color,
                page: page ? parseInt(page) : undefined,
                per_page: per_page ? parseInt(per_page) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/unsplash/random', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { query } = req.query;
            const result = await unsplashService.getRandomPhoto(query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Manga API endpoints
    app.get('/api/manga/search', async (req, res) => {
        try {
            const { query, page } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter is required'
                });
            }
            const result = await mangaService.searchManga({
                query,
                page: page ? parseInt(page) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/manga/info', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter is required'
                });
            }
            const result = await mangaService.getMangaInfo(url);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/manga/popular', async (req, res) => {
        try {
            const { page } = req.query;
            const result = await mangaService.getPopularManga(page ? parseInt(page) : 1);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/manga/latest', async (req, res) => {
        try {
            const { page } = req.query;
            const result = await mangaService.getLatestManga(page ? parseInt(page) : 1);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // YouTube API endpoints
    app.get('/api/youtube-api/search', async (req, res) => {
        try {
            const { query, maxResults, order, type, videoDuration, videoDefinition } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter is required'
                });
            }
            const result = await youtubeAPIService.searchVideos({
                query,
                maxResults: maxResults ? parseInt(maxResults) : undefined,
                order: order,
                type: type,
                videoDuration: videoDuration,
                videoDefinition: videoDefinition
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/youtube-api/video/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await youtubeAPIService.getVideoInfo(id);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/youtube-api/channel/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await youtubeAPIService.getChannelInfo(id);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // YTPlay API Endpoints
    app.get('/api/ytplay/search', async (req, res) => {
        try {
            const { query, maxResults } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter is required'
                });
            }
            const result = await ytPlayService.searchVideos({
                query,
                maxResults: maxResults ? parseInt(maxResults) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    app.get('/api/ytplay/stream', async (req, res) => {
        try {
            const { url, videoId, quality, cookies } = req.query;
            if (!url && !videoId) {
                return res.status(400).json({
                    success: false,
                    error: 'Either url or videoId parameter is required'
                });
            }
            const result = await ytPlayService.getStreamUrl({
                url: url,
                videoId: videoId,
                quality: quality,
                cookies: cookies
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // YTPlay Video endpoint (returns video metadata)
    app.get('/api/ytplay/video', async (req, res) => {
        try {
            const { query, maxResults } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter is required'
                });
            }
            const result = await ytPlayService.searchVideo({
                query,
                maxResults: maxResults ? parseInt(maxResults) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // YTPlay Play endpoint (returns audio stream)
    app.get('/api/ytplay/play', async (req, res) => {
        try {
            const { url, videoId, cookies } = req.query;
            if (!url && !videoId) {
                return res.status(400).json({
                    success: false,
                    error: 'Either url or videoId parameter is required'
                });
            }
            const result = await ytPlayService.getPlayUrl({
                url: url,
                videoId: videoId,
                quality: 'highestaudio',
                cookies: cookies
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });
    // Anime API endpoints
    app.get('/api/anime/search', async (req, res) => {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Search query parameter is required',
                    creator: 'heisbroken'
                });
            }
            const result = await animeService.searchAnime(q);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    app.get('/api/anime/info/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await animeService.getAnimeInfo(id);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    app.get('/api/anime/top', async (req, res) => {
        try {
            const { type } = req.query;
            const result = await animeService.getTopAnime(type);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    app.get('/api/anime/season/:year/:season', async (req, res) => {
        try {
            const { year, season } = req.params;
            const result = await animeService.getAnimeBySeason(year, season);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    app.get('/api/anime/characters/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await animeService.getAnimeCharacters(id);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    // Admin routes
    app.post('/api/admin/login', async (req, res) => {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(400).json({ success: false, error: 'Firebase Google idToken is required' });
            }
            const firebaseUser = await verifyFirebaseIdToken(idToken);
            const email = normalizeEmail(firebaseUser.email);
            if (email !== ADMIN_EMAIL) {
                return res.status(403).json({ success: false, error: `Only ${ADMIN_EMAIL} can access the admin portal` });
            }
            const user = await upsertFirebaseUser(firebaseUser);
            let admin = await storage.getAdminByEmail(email);
            if (!admin) {
                admin = await storage.createAdmin({
                    username: firebaseUser.displayName || email.split('@')[0],
                    email,
                    password: null,
                    authProvider: 'google.com',
                    role: 'admin'
                });
            }
            req.session.isAdminLoggedIn = true;
            req.session.adminId = admin._id || user._id;
            req.session.adminEmail = email;
            req.session.userId = user._id;
            req.session.userEmail = email;
            req.session.apiKey = user.apiKey;
            res.json({
                success: true,
                message: 'Admin logged in with Firebase Google Auth',
                admin: { id: req.session.adminId, email, role: 'admin' },
                user: toUserPayload(user)
            });
        }
        catch (error) {
            res.status(401).json({ success: false, error: error.message || 'Admin login failed' });
        }
    });
    app.post('/api/admin/logout', (req, res) => {
        req.session.isAdminLoggedIn = false;
        req.session.adminId = null;
        req.session.adminEmail = null;
        res.json({ success: true, message: 'Logged out successfully' });
    });
    app.get('/api/admin/users', requireAdmin, async (req, res) => {
        try {
            const users = await storage.getAllUsers();
            res.json({ success: true, users });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch users' });
        }
    });
    app.get('/api/admin/logs', requireAdmin, async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 1000;
            const logs = await storage.getAllApiLogs(limit);
            res.json({ success: true, logs });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch logs' });
        }
    });
    app.get('/api/admin/status', (req, res) => {
        const authenticated = !!req.session?.isAdminLoggedIn && normalizeEmail(req.session?.adminEmail) === ADMIN_EMAIL;
        res.json({
            success: true,
            authenticated,
            adminId: authenticated ? req.session?.adminId : null,
            adminEmail: authenticated ? req.session?.adminEmail : null,
            provider: authenticated ? 'google.com' : null
        });
    });
    // Enhanced admin dashboard endpoints
    app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
        try {
            const result = await adminEnhancedService.getDashboardData();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to load dashboard data' });
        }
    });
    app.post('/api/admin/endpoint/:endpointId/toggle', requireAdmin, async (req, res) => {
        try {
            const { endpointId } = req.params;
            const result = await adminEnhancedService.toggleEndpoint(endpointId);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to toggle endpoint' });
        }
    });
    app.post('/api/admin/user/:userId/tier', requireAdmin, async (req, res) => {
        try {
            const { userId } = req.params;
            const { tier } = req.body;
            const result = await adminEnhancedService.updateUserTier(userId, tier);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to update user tier' });
        }
    });
    app.post('/api/admin/notification/:notificationId/read', requireAdmin, async (req, res) => {
        try {
            const { notificationId } = req.params;
            const result = await adminEnhancedService.markNotificationRead(notificationId);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
        }
    });
    app.delete('/api/admin/notifications', requireAdmin, async (req, res) => {
        try {
            const result = await adminEnhancedService.clearAllNotifications();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to clear notifications' });
        }
    });
    app.get('/api/admin/service/status', requireAdmin, (req, res) => {
        const status = adminEnhancedService.getStatus();
        res.json({ success: true, ...status });
    });
    // ==================== APP DOWNLOAD API ROUTES ====================
    // Download APK from APKPure
    app.get('/api/app/download/apkpure', async (req, res) => {
        try {
            const { packageName } = req.query;
            if (!packageName) {
                return res.status(400).json({
                    success: false,
                    error: 'Package name is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await appDownloadService.getAPKFromAPKPure(packageName);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'APKPure download failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Download APK from APKMirror
    app.get('/api/app/download/apkmirror', async (req, res) => {
        try {
            const { packageName } = req.query;
            if (!packageName) {
                return res.status(400).json({
                    success: false,
                    error: 'Package name is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await appDownloadService.getAPKFromAPKMirror(packageName);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'APKMirror download failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Search apps
    app.get('/api/app/search', async (req, res) => {
        try {
            const { query, platform = 'android' } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await appDownloadService.searchApps(query, platform);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'App search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Download from GitHub releases
    app.get('/api/app/download/github', async (req, res) => {
        try {
            const { repoUrl, assetName } = req.query;
            if (!repoUrl) {
                return res.status(400).json({
                    success: false,
                    error: 'GitHub repository URL is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await appDownloadService.downloadFromGitHub(repoUrl, assetName);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'GitHub download failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get Windows app
    app.get('/api/app/windows', async (req, res) => {
        try {
            const { appName } = req.query;
            if (!appName) {
                return res.status(400).json({
                    success: false,
                    error: 'App name is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await appDownloadService.getWindowsApp(appName);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Windows app fetch failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get Mac app
    app.get('/api/app/mac', async (req, res) => {
        try {
            const { appName } = req.query;
            if (!appName) {
                return res.status(400).json({
                    success: false,
                    error: 'App name is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await appDownloadService.getMacApp(appName);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Mac app fetch failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get popular apps
    app.get('/api/app/popular', async (req, res) => {
        try {
            const { platform = 'android', category } = req.query;
            const result = await appDownloadService.getPopularApps(platform, category);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch popular apps',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get app download service status
    app.get('/api/app/status', (req, res) => {
        const status = appDownloadService.getStatus();
        res.json({ success: true, ...status });
    });
    // ==================== ANIME UNIFIED API ROUTES ====================
    // Search anime
    app.get('/api/anime-unified/search', async (req, res) => {
        try {
            const { query, page, limit, type, status, genre } = req.query;
            const result = await animeUnifiedService.searchAnime({
                query: query,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                type: type,
                status: status,
                genre: genre
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Search failed', creator: '@BrokenVZN' });
        }
    });
    // Get anime details
    app.get('/api/anime-unified/details/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await animeUnifiedService.getAnimeDetails(parseInt(id));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get anime details', creator: '@BrokenVZN' });
        }
    });
    // Get anime episodes
    app.get('/api/anime-unified/episodes/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await animeUnifiedService.getAnimeEpisodes(parseInt(id));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get anime episodes', creator: '@BrokenVZN' });
        }
    });
    // Get streaming links
    app.get('/api/anime-unified/stream', async (req, res) => {
        try {
            const { title, episode } = req.query;
            if (!title) {
                return res.status(400).json({
                    success: false,
                    error: 'Anime title is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeUnifiedService.getStreamingLinks(title, episode ? parseInt(episode) : 1);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get streaming links', creator: '@BrokenVZN' });
        }
    });
    // Get download links
    app.get('/api/anime-unified/download', async (req, res) => {
        try {
            const { title, episode } = req.query;
            if (!title) {
                return res.status(400).json({
                    success: false,
                    error: 'Anime title is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeUnifiedService.getDownloadLinks(title, episode ? parseInt(episode) : 1);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get download links', creator: '@BrokenVZN' });
        }
    });
    // Get top anime
    app.get('/api/anime-unified/top', async (req, res) => {
        try {
            const { type, page } = req.query;
            const result = await animeUnifiedService.getTopAnime(type || 'bypopularity', page ? parseInt(page) : 1);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get top anime', creator: '@BrokenVZN' });
        }
    });
    // Get seasonal anime
    app.get('/api/anime-unified/seasonal/:year/:season', async (req, res) => {
        try {
            const { year, season } = req.params;
            const result = await animeUnifiedService.getSeasonalAnime(parseInt(year), season);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get seasonal anime', creator: '@BrokenVZN' });
        }
    });
    // Get service status
    app.get('/api/anime-unified/status', (req, res) => {
        const status = animeUnifiedService.getStatus();
        res.json({ success: true, ...status });
    });
    // ==================== ANIME SCRAPER API ROUTES ====================
    // Aggregate search across multiple anime sources
    app.get('/api/anime-scraper/search', async (req, res) => {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeScraperService.aggregateSearch(query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Aggregate search failed', creator: '@BrokenVZN' });
        }
    });
    // Search GogoAnime specifically
    app.get('/api/anime-scraper/gogoanime', async (req, res) => {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeScraperService.scrapeGogoAnime(query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'GogoAnime search failed', creator: '@BrokenVZN' });
        }
    });
    // Search AnimePahe specifically
    app.get('/api/anime-scraper/animepahe', async (req, res) => {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeScraperService.scrapeAnimePahe(query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'AnimePahe search failed', creator: '@BrokenVZN' });
        }
    });
    // Search Zoro specifically
    app.get('/api/anime-scraper/zoro', async (req, res) => {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeScraperService.scrapeZoro(query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Zoro search failed', creator: '@BrokenVZN' });
        }
    });
    // Search 9anime specifically
    app.get('/api/anime-scraper/9anime', async (req, res) => {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeScraperService.scrape9anime(query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: '9anime search failed', creator: '@BrokenVZN' });
        }
    });
    // Search Nyaa torrents
    app.get('/api/anime-scraper/torrents', async (req, res) => {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeScraperService.scrapeNyaaTorrents(query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Torrent search failed', creator: '@BrokenVZN' });
        }
    });
    // Get streaming links
    app.get('/api/anime-scraper/stream', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'Anime URL is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeScraperService.getStreamingLinks(url);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get streaming links', creator: '@BrokenVZN' });
        }
    });
    // Get scraper service status
    app.get('/api/anime-scraper/status', (req, res) => {
        const status = animeScraperService.getStatus();
        res.json({ success: true, ...status });
    });
    // ==================== ALL DOWNLOADER API ROUTES ====================
    // Get media info from any supported platform
    app.get('/api/alldownloader/info', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { url } = req.query;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await allDownloaderService.getMediaInfo(url);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get media info', creator: '@BrokenVZN' });
        }
    });
    // Download video from any supported platform
    app.get('/api/alldownloader/video', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { url, quality } = req.query;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await allDownloaderService.downloadVideo({
                url: url,
                format: 'video',
                quality: quality
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Video download failed', creator: '@BrokenVZN' });
        }
    });
    // Download audio from any supported platform
    app.get('/api/alldownloader/audio', validateApiKey, logApiUsage, async (req, res) => {
        try {
            const { url } = req.query;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await allDownloaderService.downloadVideo({
                url: url,
                format: 'audio'
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Audio download failed', creator: '@BrokenVZN' });
        }
    });
    // Get list of supported platforms
    app.get('/api/alldownloader/platforms', (req, res) => {
        const result = allDownloaderService.getSupportedPlatforms();
        res.json(result);
    });
    // ==================== ANIME CATEGORIES API ROUTES ====================
    // Get all anime categories
    app.get('/api/anime-categories', async (req, res) => {
        try {
            const result = await animeCategoriesService.getCategories();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get categories', creator: '@BrokenVZN' });
        }
    });
    // Get anime by category
    app.get('/api/anime-categories/:categoryId', async (req, res) => {
        try {
            const { categoryId } = req.params;
            const { page, limit } = req.query;
            const result = await animeCategoriesService.getAnimeByCategory(categoryId, page ? parseInt(page) : undefined, limit ? parseInt(limit) : undefined);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get anime by category', creator: '@BrokenVZN' });
        }
    });
    // Search anime in category
    app.get('/api/anime-categories/:categoryId/search', async (req, res) => {
        try {
            const { categoryId } = req.params;
            const { query, page } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeCategoriesService.searchAnimeInCategory(categoryId, query, page ? parseInt(page) : undefined);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Category search failed', creator: '@BrokenVZN' });
        }
    });
    // Get random anime from category
    app.get('/api/anime-categories/:categoryId/random', async (req, res) => {
        try {
            const { categoryId } = req.params;
            const { count } = req.query;
            const result = await animeCategoriesService.getRandomAnimeFromCategory(categoryId, count ? parseInt(count) : undefined);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to get random anime', creator: '@BrokenVZN' });
        }
    });
    // Get anime categories service status
    app.get('/api/anime-categories/status', (req, res) => {
        const status = animeCategoriesService.getServiceStatus();
        res.json({ success: true, ...status });
    });
    // Create unified anime API instance
    const unifiedAnimeAPI = new UnifiedAnimeAPI();
    // Unified Anime API Routes
    // Search anime from multiple sources
    app.get('/api/unified-anime/search', async (req, res) => {
        try {
            const { query, page } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await unifiedAnimeAPI.search(query, page ? parseInt(page) : undefined);
            res.json({
                success: true,
                data: result.results,
                hasNextPage: result.hasNextPage,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Unified anime search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get anime details
    app.get('/api/unified-anime/details/:animeId', async (req, res) => {
        try {
            const { animeId } = req.params;
            const { source } = req.query;
            const result = await unifiedAnimeAPI.getAnimeDetails(animeId, source);
            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: 'Anime not found',
                    creator: '@BrokenVZN'
                });
            }
            res.json({
                success: true,
                data: result,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get anime details',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get streaming links
    app.get('/api/unified-anime/stream/:episodeId', async (req, res) => {
        try {
            const { episodeId } = req.params;
            const { source } = req.query;
            const result = await unifiedAnimeAPI.getStreamingLinks(episodeId, source);
            res.json({
                success: true,
                data: result,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get streaming links',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get popular anime
    app.get('/api/unified-anime/popular', async (req, res) => {
        try {
            const { page } = req.query;
            const result = await unifiedAnimeAPI.getPopularAnime(page ? parseInt(page) : undefined);
            res.json({
                success: true,
                data: result.results,
                hasNextPage: result.hasNextPage,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get popular anime',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get recent releases
    app.get('/api/unified-anime/recent', async (req, res) => {
        try {
            const { page } = req.query;
            const result = await unifiedAnimeAPI.getRecentReleases(page ? parseInt(page) : undefined);
            res.json({
                success: true,
                data: result.results,
                hasNextPage: result.hasNextPage,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get recent releases',
                creator: '@BrokenVZN'
            });
        }
    });
    // Create YouTube DLP API instance
    const youtubeDlpAPI = new YouTubeDlpAPI();
    const youtubeInput = (value) => (typeof value === 'string' ? value.trim() : '');
    // YouTube DLP API Routes
    // Search videos
    app.get('/api/youtube-dlp/search', async (req, res) => {
        try {
            const { q, maxResults } = req.query;
            if (!q) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const results = await youtubeDlpAPI.search(q, maxResults ? parseInt(maxResults) : undefined);
            res.json({
                search: results,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                error: 'YouTube search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get playable stream
    app.get('/api/youtube-dlp/play', async (req, res) => {
        try {
            const id = youtubeInput(req.query.id) || youtubeInput(req.query.url);
            if (!id) {
                return res.status(400).json({
                    error: 'Video ID is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await youtubeDlpAPI.getPlayInfo(id);
            res.json({
                play: result,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                error: 'Failed to get play information',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get video download
    app.get('/api/youtube-dlp/video', async (req, res) => {
        try {
            const id = youtubeInput(req.query.id) || youtubeInput(req.query.url);
            const quality = youtubeInput(req.query.quality);
            if (!id) {
                return res.status(400).json({
                    error: 'Video ID is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await youtubeDlpAPI.getVideoDownload(id, quality);
            res.json({
                video: result,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                error: 'Failed to get video download',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get audio download
    app.get('/api/youtube-dlp/audio', async (req, res) => {
        try {
            const id = youtubeInput(req.query.id) || youtubeInput(req.query.url);
            if (!id) {
                return res.status(400).json({
                    error: 'Video ID is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await youtubeDlpAPI.getAudioDownload(id);
            res.json({
                audio: result,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                error: 'Failed to get audio download',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get video info only
    app.get('/api/youtube-dlp/info', async (req, res) => {
        try {
            const id = youtubeInput(req.query.id) || youtubeInput(req.query.url);
            if (!id) {
                return res.status(400).json({
                    error: 'Video ID is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await youtubeDlpAPI.getVideoInfo(id);
            res.json({
                info: result,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                error: 'Failed to get video information',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get playlist info
    app.get('/api/youtube-dlp/playlist', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url) {
                return res.status(400).json({
                    error: 'Playlist URL is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await youtubeDlpAPI.getPlaylistInfo(url);
            res.json({
                playlist: result,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                error: 'Failed to get playlist information',
                creator: '@BrokenVZN'
            });
        }
    });
    // ==================== ANIME ENHANCED API ROUTES ====================
    // Search anime torrents - DEPRECATED
    app.get('/api/anime-enhanced/torrents', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get batch download options - DEPRECATED
    app.get('/api/anime-enhanced/batch', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get enhanced metadata from AniList - DEPRECATED
    app.get('/api/anime-enhanced/metadata', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get anime schedule - DEPRECATED
    app.get('/api/anime-enhanced/schedule', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get trending anime - DEPRECATED
    app.get('/api/anime-enhanced/trending', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Watch progress tracking - DEPRECATED
    app.get('/api/anime-enhanced/progress/:userId', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // ==================== ANIME2 API ROUTES (AniList + Gogoanime Integration) ====================
    // Search anime with filters (supports title, year, format, genre)
    app.get('/api/anime2/search', async (req, res) => {
        try {
            const { title } = req.query;
            const result = await animeService.searchAnime(title || 'anime');
            res.json(result);
        }
        catch (error) {
            console.error('Anime2 search error:', error);
            res.status(500).json({
                success: false,
                status: 'error',
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    // Get episode streaming/download links
    app.get('/api/anime2/watch/:episodeId', async (req, res) => {
        try {
            const { episodeId } = req.params;
            if (!episodeId) {
                return res.status(400).json({
                    success: false,
                    status: 'error',
                    error: 'Episode ID is required',
                    creator: 'heisbroken'
                });
            }
            const result = { success: false, error: 'Method not implemented yet', creator: '@BrokenVZN' };
            res.json(result);
        }
        catch (error) {
            console.error('Anime2 watch links error:', error);
            res.status(500).json({
                success: false,
                status: 'error',
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    // Get detailed anime information by AniList ID
    app.get('/api/anime2/details/:anilistId', async (req, res) => {
        try {
            const { anilistId } = req.params;
            if (!anilistId) {
                return res.status(400).json({
                    success: false,
                    status: 'error',
                    error: 'AniList ID is required',
                    creator: 'heisbroken'
                });
            }
            const result = { success: false, error: 'Method not implemented yet', creator: '@BrokenVZN' };
            res.json(result);
        }
        catch (error) {
            console.error('Anime2 details error:', error);
            res.status(500).json({
                success: false,
                status: 'error',
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    // Get service status
    app.get('/api/anime2/status', async (req, res) => {
        try {
            const result = { success: true, service: 'Anime API', status: 'operational', creator: '@BrokenVZN' };
            res.json(result);
        }
        catch (error) {
            console.error('Anime2 status error:', error);
            res.status(500).json({
                success: false,
                status: 'error',
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    // Get available formats for filtering
    app.get('/api/anime2/formats', async (req, res) => {
        try {
            const result = { success: true, data: ['TV', 'Movie', 'OVA', 'ONA', 'Special'], creator: '@BrokenVZN' };
            res.json(result);
        }
        catch (error) {
            console.error('Anime2 formats error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    // Get available genres for filtering
    app.get('/api/anime2/genres', async (req, res) => {
        try {
            const result = { success: true, data: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi'], creator: '@BrokenVZN' };
            res.json(result);
        }
        catch (error) {
            console.error('Anime2 genres error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'heisbroken'
            });
        }
    });
    // ==================== ANIME ENHANCED V2 API ROUTES ====================
    // Enhanced anime search with AniList integration - DEPRECATED
    app.get('/api/anime-v2/search', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get anime by ID with recommendations - DEPRECATED
    app.get('/api/anime-v2/details/:id', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get trending anime - DEPRECATED
    app.get('/api/anime-v2/trending', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get popular anime - DEPRECATED
    app.get('/api/anime-v2/popular', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get top rated anime - DEPRECATED
    app.get('/api/anime-v2/top-rated', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get seasonal anime - DEPRECATED
    app.get('/api/anime-v2/seasonal', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get anime by genre - DEPRECATED
    app.get('/api/anime-v2/genre/:genre', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get upcoming anime - DEPRECATED
    app.get('/api/anime-v2/upcoming', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get currently airing anime - DEPRECATED
    app.get('/api/anime-v2/airing', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Advanced search with multiple filters - DEPRECATED
    app.get('/api/anime-v2/advanced-search', async (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // Get enhanced anime service status - DEPRECATED
    app.get('/api/anime-v2/status', (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    // ==================== ADULT CONTENT API ROUTES ====================
    // Search Rule34 content
    app.get('/api/adult/rule34/search', async (req, res) => {
        try {
            const result = await adultContentService.searchRule34({
                query: req.query.query,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                tags: req.query.tags ? req.query.tags.split(',') : undefined,
                rating: req.query.rating,
                sort: req.query.sort,
                site: 'rule34'
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Rule34 search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Search Gelbooru content
    app.get('/api/adult/gelbooru/search', async (req, res) => {
        try {
            const result = await adultContentService.searchGelbooru({
                query: req.query.query,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                tags: req.query.tags ? req.query.tags.split(',') : undefined,
                rating: req.query.rating,
                site: 'gelbooru'
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Gelbooru search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Search Hanime videos (adult anime)
    app.get('/api/adult/hanime/search', async (req, res) => {
        try {
            const { query, page } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await adultContentService.searchHanimeVideos(query, page ? parseInt(page) : 1);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Hanime search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get Hanime video details with streaming links
    app.get('/api/adult/hanime/video/:slug', async (req, res) => {
        try {
            const { slug } = req.params;
            if (!slug) {
                return res.status(400).json({
                    success: false,
                    error: 'Video slug is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await adultContentService.getHanimeVideoDetails(slug);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get hanime video details',
                creator: '@BrokenVZN'
            });
        }
    });
    // Multi-site adult content search
    app.get('/api/adult/search/aggregate', async (req, res) => {
        try {
            const result = await adultContentService.searchMultipleSites({
                query: req.query.query,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                tags: req.query.tags ? req.query.tags.split(',') : undefined,
                rating: req.query.rating
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Multi-site search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get random adult content
    app.get('/api/adult/random', async (req, res) => {
        try {
            const { site, limit } = req.query;
            const result = await adultContentService.getRandomContent(site || 'rule34', limit ? parseInt(limit) : 10);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get random content',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get popular tags
    app.get('/api/adult/tags/popular', async (req, res) => {
        try {
            const { site } = req.query;
            const result = await adultContentService.getPopularTags(site);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get popular tags',
                creator: '@BrokenVZN'
            });
        }
    });
    // Safe mode search (filtered content)
    app.get('/api/adult/safe/search', async (req, res) => {
        try {
            const { query, page } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await adultContentService.safeModeSearch(query, page ? parseInt(page) : 1);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Safe mode search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get adult content service status
    app.get('/api/adult/status', (req, res) => {
        const status = adultContentService.getStatus();
        res.json({ success: true, ...status });
    });
    // ==================== VIDEO DOWNLOADER API ROUTES ====================
    // Video downloader routes for legitimate content only
    app.post('/api/video/extract', async (req, res) => {
        try {
            const { url } = req.body;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await videoDownloaderService.extractVideoInfo(url);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Video extraction failed',
                creator: '@BrokenVZN'
            });
        }
    });
    app.get('/api/video/metadata/:platform/:videoId', async (req, res) => {
        try {
            const { platform, videoId } = req.params;
            if (!platform || !videoId) {
                return res.status(400).json({
                    success: false,
                    error: 'Platform and videoId are required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await videoDownloaderService.getVideoMetadata(platform, videoId);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get video metadata',
                creator: '@BrokenVZN'
            });
        }
    });
    app.get('/api/video/status', (req, res) => {
        const status = videoDownloaderService.getStatus();
        res.json({ success: true, ...status });
    });
    // ==================== WAIFU.PICS API ROUTES ====================
    // Get SFW waifu image
    app.get('/api/waifu/sfw/:category?', async (req, res) => {
        try {
            const { category = 'waifu' } = req.params;
            const result = await waifuPicsService.getSfwImage(category);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get SFW waifu image',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get NSFW waifu image
    app.get('/api/waifu/nsfw/:category?', async (req, res) => {
        try {
            const { category = 'waifu' } = req.params;
            const result = await waifuPicsService.getNsfwImage(category);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get NSFW waifu image',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get batch waifu images
    app.get('/api/waifu/batch', async (req, res) => {
        try {
            const { category = 'waifu', type = 'sfw', count = '5' } = req.query;
            const result = await waifuPicsService.getBatchImages(category, type, parseInt(count));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get batch waifu images',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get random waifu image
    app.get('/api/waifu/random', async (req, res) => {
        try {
            const { type = 'sfw' } = req.query;
            const result = await waifuPicsService.getRandomImage(type);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get random waifu image',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get waifu categories
    app.get('/api/waifu/categories', (req, res) => {
        const categories = waifuPicsService.getAvailableCategories();
        res.json({ success: true, data: categories, creator: '@BrokenVZN' });
    });
    // ==================== ANIME IMAGE SEARCH API ROUTES ====================
    // Search anime images
    app.get('/api/anime/images/search', async (req, res) => {
        try {
            const { query, page = '1', limit = '10' } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await animeImageSearchService.searchAnimeImages(query, parseInt(page), parseInt(limit));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Anime image search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Search anime character
    app.get('/api/anime/images/character/:character', async (req, res) => {
        try {
            const { character } = req.params;
            const result = await animeImageSearchService.searchCharacter(character);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Character search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Search anime by genre
    app.get('/api/anime/images/genre/:genre', async (req, res) => {
        try {
            const { genre } = req.params;
            const { limit = '10' } = req.query;
            const result = await animeImageSearchService.searchGenre(genre, parseInt(limit));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Genre search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get random anime images
    app.get('/api/anime/images/random', async (req, res) => {
        try {
            const { count = '5' } = req.query;
            const result = await animeImageSearchService.getRandomAnimeImages(parseInt(count));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get random anime images',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get trending anime
    app.get('/api/anime/images/trending', async (req, res) => {
        try {
            const result = await animeImageSearchService.getTrendingAnime();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get trending anime',
                creator: '@BrokenVZN'
            });
        }
    });
    // Search anime wallpapers
    app.get('/api/anime/images/wallpapers', async (req, res) => {
        try {
            const { query = 'anime', resolution = '1920x1080' } = req.query;
            const result = await animeImageSearchService.searchAnimeWallpapers(query, resolution);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Wallpaper search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get available anime searches
    app.get('/api/anime/images/available', (req, res) => {
        const searches = animeImageSearchService.getAvailableSearches();
        res.json({ success: true, data: searches, creator: '@BrokenVZN' });
    });
    // ==================== ENHANCED ADULT CONTENT API ROUTES ====================
    // Enhanced booru search
    app.get('/api/adult/enhanced/search', async (req, res) => {
        try {
            const { query, site = 'auto', page = '1', limit = '20' } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await enhancedAdultContentService.searchBooruContent(query, site, parseInt(page), parseInt(limit));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Enhanced adult search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Enhanced adult video search
    app.get('/api/adult/enhanced/videos', async (req, res) => {
        try {
            const { query, page = '1', limit = '20' } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await enhancedAdultContentService.searchAdultVideos(query, parseInt(page), parseInt(limit));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Adult video search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // XNXX-style content search
    app.get('/api/adult/xnxx/search', async (req, res) => {
        try {
            const { query, page = '1' } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await enhancedAdultContentService.searchXNXXContent(query, parseInt(page));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'XNXX search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // XNXX video downloader
    app.get('/api/adult/xnxx/download/:videoId', async (req, res) => {
        try {
            const { videoId } = req.params;
            if (!videoId) {
                return res.status(400).json({
                    success: false,
                    error: 'Video ID is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await enhancedAdultContentService.downloadXNXXVideo(videoId);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'XNXX download failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get trending adult content
    app.get('/api/adult/enhanced/trending', async (req, res) => {
        try {
            const { type = 'all' } = req.query;
            const result = await enhancedAdultContentService.getTrendingContent(type);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get trending content',
                creator: '@BrokenVZN'
            });
        }
    });
    // ==================== FREE IMGUR ALTERNATIVE API ROUTES ====================
    // Upload image (free alternative)
    app.post('/api/imgur/upload', validateApiKey, multer().single('image'), async (req, res) => {
        try {
            const { title, description, type = 'file' } = req.body;
            let imageData;
            let uploadType = type;
            if (req.file) {
                // File upload
                imageData = req.file.buffer;
                uploadType = 'file';
            }
            else if (req.body.image) {
                // Base64 or URL
                imageData = req.body.image;
                uploadType = req.body.type || 'base64';
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: 'No image provided. Use file upload or provide image in request body',
                    creator: '@BrokenVZN'
                });
            }
            const result = await imgurFreeService.uploadImage({
                image: imageData,
                title,
                description,
                type: uploadType
            });
            res.json(result);
        }
        catch (error) {
            console.error('Imgur upload error:', error);
            res.status(500).json({
                success: false,
                error: 'Image upload failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Search images
    app.get('/api/imgur/search', validateApiKey, async (req, res) => {
        try {
            const { query, page = '1', limit = '20' } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await imgurFreeService.searchImages({
                query: query,
                page: parseInt(page),
                limit: parseInt(limit)
            });
            res.json(result);
        }
        catch (error) {
            console.error('Imgur search error:', error);
            res.status(500).json({
                success: false,
                error: 'Image search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get Imgur service status
    app.get('/api/imgur/status', async (req, res) => {
        try {
            const status = imgurFreeService.getStatus();
            res.json({
                success: true,
                data: status,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get service status',
                creator: '@BrokenVZN'
            });
        }
    });
    // ==================== IMGBB API ROUTES ====================
    // Upload image to ImgBB
    app.post('/api/imgbb/upload', validateApiKey, multer().single('image'), async (req, res) => {
        try {
            const { name, title, description, type = 'file' } = req.body;
            let imageData;
            let uploadType = type;
            if (req.file) {
                // File upload
                imageData = req.file.buffer;
                uploadType = 'file';
            }
            else if (req.body.image) {
                // Base64 or URL
                imageData = req.body.image;
                uploadType = req.body.type || 'base64';
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: 'No image provided. Use file upload or provide image in request body',
                    creator: '@BrokenVZN'
                });
            }
            const result = await imgbbService.uploadImage({
                image: imageData,
                name,
                title,
                description,
                type: uploadType
            });
            res.json(result);
        }
        catch (error) {
            console.error('ImgBB upload error:', error);
            res.status(500).json({
                success: false,
                error: 'Image upload failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get ImgBB account info
    app.get('/api/imgbb/account', validateApiKey, async (req, res) => {
        try {
            const result = await imgbbService.getAccountInfo();
            res.json(result);
        }
        catch (error) {
            console.error('ImgBB account info error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get account info',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get ImgBB service status
    app.get('/api/imgbb/status', async (req, res) => {
        try {
            const status = imgbbService.getStatus();
            res.json({
                success: true,
                data: status,
                creator: '@BrokenVZN'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get service status',
                creator: '@BrokenVZN'
            });
        }
    });
    // ==================== ENHANCED APK SEARCH API ROUTES ====================
    // Enhanced app search
    app.get('/api/apk/enhanced/search', async (req, res) => {
        try {
            const { query, page = '1', limit = '10' } = req.query;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await enhancedAPKSearchService.searchApps(query, parseInt(page), parseInt(limit));
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Enhanced APK search failed',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get popular apps
    app.get('/api/apk/enhanced/popular', async (req, res) => {
        try {
            const { category } = req.query;
            const result = await enhancedAPKSearchService.getPopularApps(category);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get popular apps',
                creator: '@BrokenVZN'
            });
        }
    });
    // Get app details
    app.get('/api/apk/enhanced/details/:packageName', async (req, res) => {
        try {
            const { packageName } = req.params;
            const { source } = req.query;
            const result = await enhancedAPKSearchService.getAppDetails(packageName, source);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get app details',
                creator: '@BrokenVZN'
            });
        }
    });
    // ==================== STATIC FILE SERVING ====================
    // Serve generated images from attached_assets
    app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
    // ==================== NEW BROKEN VZN API ROUTES ====================
    // Bing Images Search API
    app.get('/api/images/search', async (req, res) => {
        try {
            const { q, amount, safeSearch } = req.query;
            if (!q || typeof q !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter (q) is required',
                    creator: 'Broken VZN'
                });
            }
            const result = await bingImagesService.searchImages({
                query: q,
                amount: amount ? parseInt(amount) : undefined,
                safeSearch: safeSearch
            });
            res.json(result);
        }
        catch (error) {
            console.error('Bing images search error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Enhanced QR Code Generator API
    app.post('/api/qr/enhanced', async (req, res) => {
        try {
            const result = await enhancedQRService.generateQR(req.body);
            res.json(result);
        }
        catch (error) {
            console.error('Enhanced QR generation error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/qr/enhanced', async (req, res) => {
        try {
            const { text, size, format, errorCorrection, margin, dark, light, generateFile } = req.query;
            if (!text || typeof text !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Text parameter is required',
                    creator: 'Broken VZN'
                });
            }
            const result = await enhancedQRService.generateQR({
                text,
                size: size ? parseInt(size) : undefined,
                format: format,
                errorCorrection: errorCorrection,
                margin: margin ? parseInt(margin) : undefined,
                color: (dark || light) ? {
                    dark: dark,
                    light: light
                } : undefined,
                generateFile: generateFile === 'true'
            });
            res.json(result);
        }
        catch (error) {
            console.error('Enhanced QR generation error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // EPL News API
    app.get('/api/epl/news', async (req, res) => {
        try {
            const { limit, includeLiveMatches } = req.query;
            const result = await eplNewsService.getEPLNews({
                limit: limit ? parseInt(limit) : undefined,
                includeLiveMatches: includeLiveMatches !== 'false'
            });
            res.json(result);
        }
        catch (error) {
            console.error('EPL news error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Jokes API
    app.get('/api/jokes', async (req, res) => {
        try {
            const { category, count } = req.query;
            const result = await jokesService.getJokes({
                category: category,
                count: count ? parseInt(count) : undefined
            });
            res.json(result);
        }
        catch (error) {
            console.error('Jokes error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/jokes/categories', (req, res) => {
        try {
            const categories = jokesService.getAvailableCategories();
            res.json({
                success: true,
                categories,
                creator: 'Broken VZN'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Random jokes alias
    app.get('/api/jokes/random', async (req, res) => {
        try {
            const result = await jokesService.getJokes({ category: 'random', count: 1 });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Memes API
    app.get('/api/memes/random', (req, res) => {
        const memes = [
            { url: 'https://i.imgflip.com/1bgw.jpg', title: 'Distracted Boyfriend', category: 'popular' },
            { url: 'https://i.imgflip.com/26am.jpg', title: 'Drake Pointing', category: 'popular' },
            { url: 'https://i.imgflip.com/1bij.jpg', title: 'One Does Not Simply', category: 'classic' },
            { url: 'https://i.imgflip.com/5c7lwi.jpg', title: 'Woman Yelling at Cat', category: 'popular' },
            { url: 'https://i.imgflip.com/1otk96.jpg', title: 'This is Fine', category: 'reaction' }
        ];
        const randomMeme = memes[Math.floor(Math.random() * memes.length)];
        res.json({
            success: true,
            meme: randomMeme,
            creator: 'Broken VZN'
        });
    });
    // Random facts API
    app.get('/api/facts/random', (req, res) => {
        const facts = [
            'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3000 years old and still perfectly edible.',
            'Octopuses have three hearts and blue blood.',
            'Bananas are berries, but strawberries are not.',
            'A group of flamingos is called a flamboyance.',
            'The human brain uses about 20% of the body\'s total energy.',
            'There are more possible games of chess than there are atoms in the observable universe.',
            'Sharks have been around longer than trees.',
            'A day on Venus is longer than its year.',
            'Wombat droppings are cube-shaped.',
            'The Great Wall of China is not visible from space without aid.'
        ];
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        res.json({
            success: true,
            fact: randomFact,
            category: 'general',
            creator: 'Broken VZN'
        });
    });
    // Math calculator API
    app.get('/api/math/calculate', (req, res) => {
        try {
            const { expression } = req.query;
            if (!expression) {
                return res.status(400).json({
                    success: false,
                    error: 'Expression parameter is required',
                    creator: 'Broken VZN'
                });
            }
            // Simple math evaluation (secure - only basic operations)
            const sanitizedExpression = expression.replace(/[^0-9+\-*/.() ]/g, '');
            if (sanitizedExpression !== expression) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid characters in expression. Only numbers and +, -, *, /, (, ) are allowed.',
                    creator: 'Broken VZN'
                });
            }
            try {
                const result = Function('"use strict"; return (' + sanitizedExpression + ')')();
                res.json({
                    success: true,
                    expression: expression,
                    result: result,
                    creator: 'Broken VZN'
                });
            }
            catch (evalError) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid mathematical expression',
                    creator: 'Broken VZN'
                });
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Color generator API
    app.get('/api/color/random', (req, res) => {
        const generateRandomColor = () => {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            return { r, g, b, hex };
        };
        const color = generateRandomColor();
        res.json({
            success: true,
            color: {
                ...color,
                rgb: `rgb(${color.r}, ${color.g}, ${color.b})`,
                hsl: `hsl(${Math.round(Math.atan2(Math.sqrt(3) * (color.g - color.b), 2 * color.r - color.g - color.b) * 180 / Math.PI)}, ${Math.round(Math.max(color.r, color.g, color.b) === 0 ? 0 : (Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b)) / Math.max(color.r, color.g, color.b) * 100)}%, ${Math.round((Math.max(color.r, color.g, color.b) + Math.min(color.r, color.g, color.b)) / 2 / 255 * 100)}%)`
            },
            creator: 'Broken VZN'
        });
    });
    // Server stats API
    app.get('/api/stats/server', (req, res) => {
        res.json({
            success: true,
            stats: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform,
                pid: process.pid,
                timestamp: new Date().toISOString()
            },
            creator: 'Broken VZN'
        });
    });
    // Riddles API
    app.get('/api/riddles/random', (req, res) => {
        const riddles = [
            {
                question: 'What has keys but no locks, space but no room, and you can enter but not go inside?',
                answer: 'A keyboard',
                difficulty: 'easy'
            },
            {
                question: 'I am taken from a mine, and shut up in a wooden case, from which I am never released, and yet I am used by almost every person. What am I?',
                answer: 'A pencil lead',
                difficulty: 'medium'
            },
            {
                question: 'The more you take, the more you leave behind. What am I?',
                answer: 'Footsteps',
                difficulty: 'easy'
            },
            {
                question: 'What comes once in a minute, twice in a moment, but never in a thousand years?',
                answer: 'The letter M',
                difficulty: 'hard'
            },
            {
                question: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?',
                answer: 'A map',
                difficulty: 'medium'
            }
        ];
        const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
        res.json({
            success: true,
            riddle: randomRiddle,
            creator: 'Broken VZN'
        });
    });
    // Personal Play API (YouTube with ytdl-core)
    app.get('/api/play/search', async (req, res) => {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Query parameter (q) is required',
                    creator: 'Broken VZN'
                });
            }
            const result = await personalPlayService.searchVideos(q);
            res.json(result);
        }
        catch (error) {
            console.error('Personal play search error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/play/info', async (req, res) => {
        try {
            const { url } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter is required',
                    creator: 'Broken VZN'
                });
            }
            const result = await personalPlayService.getVideoInfo(url);
            res.json(result);
        }
        catch (error) {
            console.error('Personal play info error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/play/download', async (req, res) => {
        try {
            const { url, quality, format } = req.query;
            if (!url || typeof url !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter is required',
                    creator: 'Broken VZN'
                });
            }
            const result = await personalPlayService.getDownloadUrl({
                url,
                quality: quality,
                format: format
            });
            res.json(result);
        }
        catch (error) {
            console.error('Personal play download error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Scraper Functions Utility API
    app.post('/api/scraper/webpage', async (req, res) => {
        try {
            const { url, selector, options } = req.body;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL is required',
                    creator: 'Broken VZN'
                });
            }
            const result = await scraperFunctions.scrapeWebpage(url, selector, options);
            res.json({
                success: true,
                result,
                creator: 'Broken VZN'
            });
        }
        catch (error) {
            console.error('Scraper error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.post('/api/scraper/images', async (req, res) => {
        try {
            const { url, options } = req.body;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL is required',
                    creator: 'Broken VZN'
                });
            }
            const images = await scraperFunctions.extractImages(url, options);
            res.json({
                success: true,
                images,
                count: images.length,
                creator: 'Broken VZN'
            });
        }
        catch (error) {
            console.error('Scraper images error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.post('/api/scraper/links', async (req, res) => {
        try {
            const { url, options } = req.body;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL is required',
                    creator: 'Broken VZN'
                });
            }
            const links = await scraperFunctions.extractLinks(url, options);
            res.json({
                success: true,
                links,
                count: links.length,
                creator: 'Broken VZN'
            });
        }
        catch (error) {
            console.error('Scraper links error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.post('/api/scraper/page-info', async (req, res) => {
        try {
            const { url, options } = req.body;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL is required',
                    creator: 'Broken VZN'
                });
            }
            const pageInfo = await scraperFunctions.getPageInfo(url, options);
            res.json({
                success: true,
                ...pageInfo,
                creator: 'Broken VZN'
            });
        }
        catch (error) {
            console.error('Scraper page info error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // === NEW CONVERTED API ENDPOINTS ===
    // Bing Image Search API
    app.get('/api/bing/search', validateApiKey, async (req, res) => {
        try {
            const { query, amount } = req.query;
            const result = await bingImageSearchService.searchImages({
                query: query,
                amount: amount ? parseInt(amount) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Enhanced Jokes API
    app.get('/api/jokes/enhanced', validateApiKey, async (req, res) => {
        try {
            const result = await enhancedJokesService.getRandomJoke();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/jokes/category/:category', validateApiKey, async (req, res) => {
        try {
            const { category } = req.params;
            const result = await enhancedJokesService.getJokeByCategory(category);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Wikipedia Search API
    app.get('/api/wikipedia/search', validateApiKey, async (req, res) => {
        try {
            const { query } = req.query;
            const result = await wikipediaSearchService.searchWikipedia({
                query: query
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // URL Tester API
    app.get('/api/test', validateApiKey, async (req, res) => {
        try {
            const { url } = req.query;
            const result = await urlTesterService.testURL({
                url: url
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Enhanced News API
    app.get('/api/news/enhanced', validateApiKey, async (req, res) => {
        try {
            const { category, country } = req.query;
            const result = await enhancedNewsService.getNews({
                category: category,
                country: country
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Coding Quiz API
    app.get('/api/quiz/coding', validateApiKey, async (req, res) => {
        try {
            const { language, difficulty, amount } = req.query;
            const result = await codingQuizService.generateQuiz({
                language: language,
                difficulty: difficulty,
                amount: amount ? parseInt(amount) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Tools/Utility APIs
    app.get('/api/tools/base64/encode', validateApiKey, async (req, res) => {
        try {
            const { query } = req.query;
            const result = await toolsUtilityService.encodeBase64({
                query: query
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/tools/base64/decode', validateApiKey, async (req, res) => {
        try {
            const { query } = req.query;
            const result = await toolsUtilityService.decodeBase64({
                query: query
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/tools/binary/encode', validateApiKey, async (req, res) => {
        try {
            const { query } = req.query;
            const result = await toolsUtilityService.encodeBinary({
                query: query
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/tools/binary/decode', validateApiKey, async (req, res) => {
        try {
            const { query } = req.query;
            const result = await toolsUtilityService.decodeBinary({
                query: query
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.post('/api/tools/js/obfuscate', validateApiKey, async (req, res) => {
        try {
            const { query } = req.body;
            const result = await toolsUtilityService.obfuscateJS({
                query: query
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/tools/hash/md5', validateApiKey, async (req, res) => {
        try {
            const { query } = req.query;
            const result = await toolsUtilityService.generateMD5({
                query: query
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/tools/hash/sha256', validateApiKey, async (req, res) => {
        try {
            const { query } = req.query;
            const result = await toolsUtilityService.generateSHA256({
                query: query
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Pollinations AI API - Returns image directly
    app.get('/api/ai/pollinations', validateApiKey, async (req, res) => {
        try {
            const { prompt, width, height, seed, model, format = 'json' } = req.query;
            if (!prompt) {
                return res.status(400).json({
                    success: false,
                    error: 'Prompt parameter is required',
                    creator: '@BrokenVZN'
                });
            }
            const result = await pollinationsAIService.generateImage({
                prompt: prompt,
                width: width ? parseInt(width) : undefined,
                height: height ? parseInt(height) : undefined,
                seed: seed ? parseInt(seed) : undefined,
                model: model
            });
            // If format=image requested, redirect to the image URL
            if (format === 'image' && result.success && result.image_url) {
                return res.redirect(result.image_url);
            }
            // Otherwise return JSON metadata
            res.json(result);
        }
        catch (error) {
            console.error('Pollinations AI route error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate image',
                creator: '@BrokenVZN'
            });
        }
    });
    // Word Games API
    app.get('/api/games/words', validateApiKey, async (req, res) => {
        try {
            const { game_type, difficulty, category } = req.query;
            const result = await wordGamesService.playWordGame({
                game_type: game_type,
                difficulty: difficulty,
                category: category
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Trivia Quiz API
    app.get('/api/quiz/trivia', validateApiKey, async (req, res) => {
        try {
            const { category, difficulty, amount, type } = req.query;
            const result = await triviaQuizService.generateQuiz({
                category: category,
                difficulty: difficulty,
                amount: amount ? parseInt(amount) : undefined,
                type: type
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Books Search API
    app.get('/api/books/search', validateApiKey, async (req, res) => {
        try {
            const { search } = req.query;
            const result = await booksSearchService.searchBooks({
                search: search
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Spotify Search API
    app.get('/api/spotify/search', validateApiKey, async (req, res) => {
        try {
            const { search, artist } = req.query;
            const result = await spotifySearchService.searchSpotify({
                search: search,
                artist: artist
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/spotify/recommendations', validateApiKey, async (req, res) => {
        try {
            const { seed } = req.query;
            const result = await spotifySearchService.searchRecommendations(seed);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // VANEA AI Chat API
    app.get('/api/ai/vanea', validateApiKey, async (req, res) => {
        try {
            const { text } = req.query;
            const result = await vaneaAIService.chat({
                text: text
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Social Media Downloader API
    app.get('/api/downloader/social', validateApiKey, async (req, res) => {
        try {
            const { url, platform } = req.query;
            const result = await socialDownloaderService.downloadContent({
                url: url,
                platform: platform
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Enhanced QR Code Generator API
    app.get('/api/qr/generate', validateApiKey, async (req, res) => {
        try {
            const { text, size, format, errorCorrectionLevel, margin } = req.query;
            const result = await qrGeneratorService.generateQR({
                text: text,
                size: size ? parseInt(size) : undefined,
                format: format,
                errorCorrectionLevel: errorCorrectionLevel,
                margin: margin ? parseInt(margin) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // API Information endpoint
    app.get('/api/info', (req, res) => {
        res.json({
            success: true,
            name: 'Broken VZN API',
            version: '2.0.0',
            description: 'Comprehensive API collection with social media tools, AI services, utilities, and more',
            creator: 'Broken VZN',
            endpoints: {
                core: [
                    '/api/bing/search - Bing image search',
                    '/api/jokes/enhanced - Enhanced jokes',
                    '/api/wikipedia/search - Wikipedia search',
                    '/api/test - URL tester',
                    '/api/news/enhanced - Enhanced news',
                    '/api/dictionary/:word - Dictionary definitions',
                    '/api/hackernews/:type - Hacker News stories'
                ],
                ai: [
                    '/api/ai/vanea - VANEA AI chat',
                    '/api/ai/pollinations - AI image generation'
                ],
                tools: [
                    '/api/tools/base64/encode - Base64 encoding',
                    '/api/tools/base64/decode - Base64 decoding',
                    '/api/tools/binary/encode - Binary encoding',
                    '/api/tools/binary/decode - Binary decoding',
                    '/api/tools/js/obfuscate - JavaScript obfuscation',
                    '/api/tools/hash/md5 - MD5 hash',
                    '/api/tools/hash/sha256 - SHA256 hash'
                ],
                games: [
                    '/api/games/words - Word games',
                    '/api/quiz/coding - Coding quiz',
                    '/api/quiz/trivia - Trivia quiz',
                    '/api/games/tebakgambar - Indonesian guessing game'
                ],
                media: [
                    '/api/spotify/search - Spotify search',
                    '/api/books/search - Books search',
                    '/api/downloader/social - Social media downloader'
                ],
                images: [
                    '/api/images/:type - Random images (waifu, aesthetic, cosplay, etc)',
                    '/api/images/types/available - Available image types'
                ],
                anime: [
                    '/api/quotes/anime - Random anime quotes',
                    '/api/stories/anime - Random anime stories'
                ],
                utilities: [
                    '/api/qr/generate - QR code generator'
                ]
            }
        });
    });
    // Dictionary API
    app.get('/api/dictionary/:word', validateApiKey, async (req, res) => {
        try {
            const { word } = req.params;
            const result = await dictionaryAPIService.getDefinition({ word });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Hacker News API
    app.get('/api/hackernews/:type?', validateApiKey, async (req, res) => {
        try {
            const { type } = req.params;
            const { limit } = req.query;
            const result = await hackerNewsAPIService.getStories({
                type: type || 'top',
                limit: limit ? parseInt(limit) : undefined
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/hackernews/item/:id', validateApiKey, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await hackerNewsAPIService.getItem({
                id: parseInt(id)
            });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Image Collections API
    app.get('/api/images/:type', validateApiKey, async (req, res) => {
        try {
            const { type } = req.params;
            const result = await imageCollectionsService.getRandomImage({ type });
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    app.get('/api/images/types/available', validateApiKey, async (req, res) => {
        try {
            const types = imageCollectionsService.getAvailableTypes();
            const stats = imageCollectionsService.getCollectionStats();
            res.json({
                success: true,
                available_types: types,
                collection_stats: stats,
                creator: 'Broken VZN'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Anime Quotes API
    app.get('/api/quotes/anime', validateApiKey, async (req, res) => {
        try {
            const result = await imageCollectionsService.getRandomQuote();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Anime Stories API
    app.get('/api/stories/anime', validateApiKey, async (req, res) => {
        try {
            const result = await imageCollectionsService.getRandomStory();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // Tebak Gambar API
    app.get('/api/games/tebakgambar', validateApiKey, async (req, res) => {
        try {
            const result = await imageCollectionsService.getTebakGambar();
            res.json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                creator: 'Broken VZN'
            });
        }
    });
    // ==================== CATCH-ALL DEPRECATION ROUTES ====================
    // These must be at the end to catch any remaining anime-enhanced/anime-v2 requests
    app.all('/api/anime-enhanced', (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    app.all('/api/anime-enhanced/*', (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    app.all('/api/anime-v2', (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    app.all('/api/anime-v2/*', (req, res) => {
        res.status(410).json({
            success: false,
            error: 'This Enhanced Anime V2 endpoint has been deprecated and is no longer available',
            deprecated: true,
            message: 'Please use the regular anime search endpoints instead',
            creator: '@BrokenVZN'
        });
    });
    const httpServer = createServer(app);
    return httpServer;
}
