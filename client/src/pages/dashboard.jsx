import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Brain, Camera, Download, Globe, Image, MessageSquare, Mic, Music, QrCode, Shield, Translate, Wand2, Zap } from "lucide-react";
const apiEndpoints = [
    // Social Media Category
    {
        id: 'tiktok-download',
        name: 'TikTok Downloader',
        description: 'Download TikTok videos without watermark and extract metadata',
        method: 'GET',
        endpoint: '/api/tiktok/download',
        category: 'Social Media',
        icon: Download,
        parameters: [
            { name: 'url', type: 'string', required: true, description: 'TikTok video URL' }
        ],
        example: { url: 'https://www.tiktok.com/@username/video/1234567890' }
    },
    {
        id: 'instagram-download',
        name: 'Instagram Downloader',
        description: 'Download Instagram posts, stories, and reels with metadata',
        method: 'GET',
        endpoint: '/api/instagram/download',
        category: 'Social Media',
        icon: Download,
        parameters: [
            { name: 'url', type: 'string', required: true, description: 'Instagram post URL' }
        ]
    },
    {
        id: 'youtube-info',
        name: 'YouTube Info',
        description: 'Extract YouTube video information and metadata',
        method: 'GET',
        endpoint: '/api/youtube/info',
        category: 'Social Media',
        icon: Globe,
        parameters: [
            { name: 'url', type: 'string', required: true, description: 'YouTube video URL' }
        ]
    },
    // AI & ML Category
    {
        id: 'ai-chat',
        name: 'AI Assistant (AYANFE)',
        description: 'Chat with AI powered by Google Gemini with context memory',
        method: 'POST',
        endpoint: '/api/ai/chat',
        category: 'AI & ML',
        icon: Brain,
        parameters: [
            { name: 'query', type: 'string', required: true, description: 'Your question or message' },
            { name: 'sessionId', type: 'string', required: false, description: 'Session ID for context' }
        ],
        example: { query: 'What is machine learning?', sessionId: 'user123' }
    },
    {
        id: 'translate',
        name: 'Language Translation',
        description: 'Translate text between 60+ languages with confidence scores',
        method: 'POST',
        endpoint: '/api/translate',
        category: 'AI & ML',
        icon: Translate,
        parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to translate' },
            { name: 'sourceLang', type: 'string', required: true, description: 'Source language code' },
            { name: 'targetLang', type: 'string', required: true, description: 'Target language code' }
        ]
    },
    {
        id: 'transcribe',
        name: 'Audio Transcription',
        description: 'Convert audio files to text using AssemblyAI with speaker detection',
        method: 'POST',
        endpoint: '/api/transcribe',
        category: 'AI & ML',
        icon: Mic,
        parameters: [
            { name: 'audioFile', type: 'file', required: false, description: 'Audio file (mp3, wav, m4a, etc.)' },
            { name: 'audioUrl', type: 'string', required: false, description: 'Audio file URL' },
            { name: 'language', type: 'string', required: false, description: 'Language code (default: en)' }
        ]
    },
    // Media & Images Category
    {
        id: 'pexels-photos',
        name: 'Pexels Photos',
        description: 'Search high-quality stock photos with advanced filters',
        method: 'GET',
        endpoint: '/api/pexels/photos',
        category: 'Media & Images',
        icon: Image,
        parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query' },
            { name: 'orientation', type: 'string', required: false, description: 'Photo orientation', options: ['landscape', 'portrait', 'square'] },
            { name: 'size', type: 'string', required: false, description: 'Photo size', options: ['large', 'medium', 'small'] },
            { name: 'color', type: 'string', required: false, description: 'Color filter' },
            { name: 'per_page', type: 'number', required: false, description: 'Results per page (max 80)' }
        ]
    },
    {
        id: 'pexels-videos',
        name: 'Pexels Videos',
        description: 'Search high-quality stock videos with advanced filters',
        method: 'GET',
        endpoint: '/api/pexels/videos',
        category: 'Media & Images',
        icon: Camera,
        parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query' },
            { name: 'orientation', type: 'string', required: false, description: 'Video orientation', options: ['landscape', 'portrait', 'square'] },
            { name: 'per_page', type: 'number', required: false, description: 'Results per page (max 80)' }
        ]
    },
    {
        id: 'waifu-generator',
        name: 'Waifu/Anime Images',
        description: 'Generate anime-style character images with customizable tags',
        method: 'GET',
        endpoint: '/api/waifu',
        category: 'Media & Images',
        icon: Wand2,
        parameters: [
            { name: 'tags', type: 'string', required: false, description: 'Comma-separated tags (e.g., waifu,maid)' },
            { name: 'orientation', type: 'string', required: false, description: 'Image orientation', options: ['PORTRAIT', 'LANDSCAPE'] },
            { name: 'nsfw', type: 'boolean', required: false, description: 'Include NSFW content' }
        ]
    },
    // Utilities Category
    {
        id: 'qr-generate',
        name: 'QR Code Generator',
        description: 'Generate customizable QR codes with various options and formats',
        method: 'POST',
        endpoint: '/api/qr/generate',
        category: 'Utilities',
        icon: QrCode,
        parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text or URL to encode' },
            { name: 'size', type: 'number', required: false, description: 'QR code size in pixels' },
            { name: 'margin', type: 'number', required: false, description: 'Margin around QR code' },
            { name: 'errorCorrectionLevel', type: 'string', required: false, description: 'Error correction level', options: ['L', 'M', 'Q', 'H'] }
        ]
    },
    {
        id: 'url-shorten',
        name: 'URL Shortener',
        description: 'Create short, trackable URLs with click analytics',
        method: 'POST',
        endpoint: '/api/url/shorten',
        category: 'Utilities',
        icon: Globe,
        parameters: [
            { name: 'url', type: 'string', required: true, description: 'URL to shorten' },
            { name: 'customCode', type: 'string', required: false, description: 'Custom short code' }
        ]
    },
    {
        id: 'password-generate',
        name: 'Password Generator',
        description: 'Generate secure passwords with custom criteria',
        method: 'GET',
        endpoint: '/api/password/generate',
        category: 'Utilities',
        icon: Shield,
        parameters: [
            { name: 'length', type: 'number', required: false, description: 'Password length (8-128)' },
            { name: 'uppercase', type: 'boolean', required: false, description: 'Include uppercase letters' },
            { name: 'lowercase', type: 'boolean', required: false, description: 'Include lowercase letters' },
            { name: 'numbers', type: 'boolean', required: false, description: 'Include numbers' },
            { name: 'symbols', type: 'boolean', required: false, description: 'Include symbols' }
        ]
    },
    {
        id: 'tts-generate',
        name: 'Text to Speech',
        description: 'Convert text to natural speech audio files',
        method: 'POST',
        endpoint: '/api/tts/generate',
        category: 'Utilities',
        icon: Music,
        parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to convert to speech' },
            { name: 'voice', type: 'string', required: false, description: 'Voice type' },
            { name: 'speed', type: 'number', required: false, description: 'Speech speed (0.5-2.0)' }
        ]
    },
    // Fun & Entertainment
    {
        id: 'quotes-random',
        name: 'Random Quotes',
        description: 'Get inspirational quotes from various categories',
        method: 'GET',
        endpoint: '/api/quotes/random',
        category: 'Fun & Entertainment',
        icon: MessageSquare,
        parameters: []
    },
    {
        id: 'mood-suggestions',
        name: 'Mood Suggestions',
        description: 'Get activity suggestions based on your current mood',
        method: 'GET',
        endpoint: '/api/mood-suggestions',
        category: 'Fun & Entertainment',
        icon: Zap,
        parameters: [
            { name: 'mood', type: 'string', required: true, description: 'Your current mood' },
            { name: 'limit', type: 'number', required: false, description: 'Number of suggestions' }
        ]
    },
    // ─── AI (NEW) ───
    {
        id: 'nanobanana-chat',
        name: 'Nanobanana AI Chat',
        description: 'Chat with Nanobanana AI — fast, free AI assistant',
        method: 'GET',
        endpoint: '/api/nanobanana/chat',
        category: 'AI',
        icon: Brain,
        parameters: [
            { name: 'message', type: 'string', required: true, description: 'Your message' }
        ]
    },
    {
        id: 'nanobanana-generate',
        name: 'Nanobanana AI Generate',
        description: 'Generate text, code, or content with Nanobanana AI',
        method: 'GET',
        endpoint: '/api/nanobanana/generate',
        category: 'AI',
        icon: Wand2,
        parameters: [
            { name: 'prompt', type: 'string', required: true, description: 'Text prompt' }
        ]
    },
    {
        id: 'nanobanana-image',
        name: 'Nanobanana AI Image',
        description: 'Generate images from text prompts using Nanobanana',
        method: 'GET',
        endpoint: '/api/nanobanana/image',
        category: 'AI',
        icon: Image,
        parameters: [
            { name: 'prompt', type: 'string', required: true, description: 'Image description' }
        ]
    },
    {
        id: 'groq-chat',
        name: 'Groq AI Chat',
        description: 'Ultra-fast AI responses using Groq LPU inference',
        method: 'POST',
        endpoint: '/api/groq/chat',
        category: 'AI',
        icon: Zap,
        parameters: [
            { name: 'message', type: 'string', required: true, description: 'Your message' }
        ]
    },
    {
        id: 'perplexity-search',
        name: 'Perplexity AI Search',
        description: 'AI-powered web search with citations',
        method: 'GET',
        endpoint: '/api/perplexity/search',
        category: 'AI',
        icon: Globe,
        parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query' }
        ]
    },
    // ─── Games (NEW) ───
    {
        id: 'trivia',
        name: 'Trivia Quiz',
        description: 'Get random trivia questions from various categories',
        method: 'GET',
        endpoint: '/api/games/trivia',
        category: 'Games',
        icon: Brain,
        parameters: [
            { name: 'amount', type: 'number', required: false, description: 'Number of questions (default: 10)' },
            { name: 'category', type: 'number', required: false, description: 'Category ID' },
            { name: 'difficulty', type: 'string', required: false, description: 'easy, medium, or hard' }
        ]
    },
    {
        id: 'word-game',
        name: 'Word Game',
        description: 'Play word scramble, hangman, or wordle-style games',
        method: 'GET',
        endpoint: '/api/games/word',
        category: 'Games',
        icon: Wand2,
        parameters: [
            { name: 'type', type: 'string', required: false, description: 'scramble, hangman, or wordle' }
        ]
    },
    {
        id: 'number-fact',
        name: 'Number Facts',
        description: 'Get interesting trivia facts about any number',
        method: 'GET',
        endpoint: '/api/games/number-fact',
        category: 'Games',
        icon: Zap,
        parameters: [
            { name: 'number', type: 'number', required: false, description: 'Number (default: random)' }
        ]
    },
    {
        id: 'dice-roll',
        name: 'Dice Roll',
        description: 'Roll a virtual dice with custom sides',
        method: 'GET',
        endpoint: '/api/games/dice',
        category: 'Games',
        icon: Zap,
        parameters: [
            { name: 'sides', type: 'number', required: false, description: 'Number of sides (default: 6)' }
        ]
    },
    {
        id: 'coin-flip',
        name: 'Coin Flip',
        description: 'Flip a virtual coin — heads or tails',
        method: 'GET',
        endpoint: '/api/games/coinflip',
        category: 'Games',
        icon: Zap
    },
    {
        id: 'rps',
        name: 'Rock Paper Scissors',
        description: 'Play rock-paper-scissors against the computer',
        method: 'GET',
        endpoint: '/api/games/rps',
        category: 'Games',
        icon: Shield,
        parameters: [
            { name: 'choice', type: 'string', required: true, description: 'rock, paper, or scissors' }
        ]
    },
    // ─── Anime (NEW) ───
    {
        id: 'anime-search',
        name: 'Anime Search',
        description: 'Search for anime by title with full metadata',
        method: 'GET',
        endpoint: '/api/anime/search',
        category: 'Anime',
        icon: Wand2,
        parameters: [
            { name: 'query', type: 'string', required: true, description: 'Anime title' }
        ]
    },
    {
        id: 'anime-top',
        name: 'Top Anime',
        description: 'Get top-rated anime from MyAnimeList',
        method: 'GET',
        endpoint: '/api/anime/top',
        category: 'Anime',
        icon: Zap,
        parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number' },
            { name: 'type', type: 'string', required: false, description: 'Filter: airing, upcoming, bypopularity, favorite' }
        ]
    },
    {
        id: 'anime-random',
        name: 'Random Anime',
        description: 'Get a random anime recommendation',
        method: 'GET',
        endpoint: '/api/anime/random',
        category: 'Anime',
        icon: Brain
    },
    {
        id: 'anime-characters',
        name: 'Anime Characters',
        description: 'Get characters for a specific anime',
        method: 'GET',
        endpoint: '/api/anime/characters',
        category: 'Anime',
        icon: Image,
        parameters: [
            { name: 'id', type: 'number', required: true, description: 'MyAnimeList anime ID' }
        ]
    },
    {
        id: 'anime-episodes',
        name: 'Anime Episodes',
        description: 'Get episode list for an anime',
        method: 'GET',
        endpoint: '/api/anime/episodes',
        category: 'Anime',
        icon: Zap,
        parameters: [
            { name: 'id', type: 'number', required: true, description: 'MyAnimeList anime ID' }
        ]
    },
    {
        id: 'anime-recommendations',
        name: 'Anime Recommendations',
        description: 'Get anime recommendations based on your favorites',
        method: 'GET',
        endpoint: '/api/anime/recommendations',
        category: 'Anime',
        icon: Brain,
        parameters: [
            { name: 'id', type: 'number', required: true, description: 'MyAnimeList anime ID' }
        ]
    },
    {
        id: 'waifu-random',
        name: 'Random Waifu',
        description: 'Get random waifu images from various categories',
        method: 'GET',
        endpoint: '/api/waifu/random',
        category: 'Anime',
        icon: Image,
        parameters: [
            { name: 'category', type: 'string', required: false, description: 'waifu, neko, shinobu, megumin, bully, etc.' }
        ]
    },
    {
        id: 'anime-quotes',
        name: 'Anime Quotes',
        description: 'Get random quotes from popular anime',
        method: 'GET',
        endpoint: '/api/anime/quotes',
        category: 'Anime',
        icon: MessageSquare,
        parameters: [
            { name: 'anime', type: 'string', required: false, description: 'Filter by anime title' },
            { name: 'character', type: 'string', required: false, description: 'Filter by character name' }
        ]
    },
    // ─── Tools (NEW) ───
    {
        id: 'qr-generator',
        name: 'QR Code Generator',
        description: 'Generate QR codes from text or URLs',
        method: 'GET',
        endpoint: '/api/tools/qr',
        category: 'Tools',
        icon: QrCode,
        parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text or URL to encode' }
        ]
    },
    {
        id: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure random passwords',
        method: 'GET',
        endpoint: '/api/tools/password',
        category: 'Tools',
        icon: Shield,
        parameters: [
            { name: 'length', type: 'number', required: false, description: 'Password length (default: 16)' },
            { name: 'includeSymbols', type: 'boolean', required: false, description: 'Include special characters' }
        ]
    },
    {
        id: 'url-shortener',
        name: 'URL Shortener',
        description: 'Shorten long URLs',
        method: 'POST',
        endpoint: '/api/tools/shorten',
        category: 'Tools',
        icon: Zap,
        parameters: [
            { name: 'url', type: 'string', required: true, description: 'URL to shorten' }
        ]
    },
    {
        id: 'image-to-text',
        name: 'Image to Text (OCR)',
        description: 'Extract text from images using OCR',
        method: 'POST',
        endpoint: '/api/tools/ocr',
        category: 'Tools',
        icon: Camera,
        parameters: [
            { name: 'image', type: 'file', required: true, description: 'Image file' }
        ]
    },
    {
        id: 'code-runner',
        name: 'Code Runner',
        description: 'Execute code in JavaScript, Python, or other languages',
        method: 'POST',
        endpoint: '/api/tools/run-code',
        category: 'Tools',
        icon: Wand2,
        parameters: [
            { name: 'code', type: 'string', required: true, description: 'Source code' },
            { name: 'language', type: 'string', required: true, description: 'Programming language' }
        ]
    },
    {
        id: 'text-to-speech',
        name: 'Text to Speech',
        description: 'Convert text to spoken audio',
        method: 'GET',
        endpoint: '/api/tools/tts',
        category: 'Tools',
        icon: Mic,
        parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to speak' },
            { name: 'voice', type: 'string', required: false, description: 'Voice type' }
        ]
    },
    {
        id: 'translate',
        name: 'Translation',
        description: 'Translate text between languages',
        method: 'GET',
        endpoint: '/api/tools/translate',
        category: 'Tools',
        icon: Translate,
        parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to translate' },
            { name: 'target', type: 'string', required: true, description: 'Target language code (e.g., es)' }
        ]
    },
    {
        id: 'lyrics',
        name: 'Lyrics Finder',
        description: 'Find song lyrics by artist and title',
        method: 'GET',
        endpoint: '/api/tools/lyrics',
        category: 'Tools',
        icon: Music,
        parameters: [
            { name: 'artist', type: 'string', required: true, description: 'Artist name' },
            { name: 'title', type: 'string', required: true, description: 'Song title' }
        ]
    },
    {
        id: 'weather',
        name: 'Weather Forecast',
        description: 'Get current weather and forecast for any city',
        method: 'GET',
        endpoint: '/api/tools/weather',
        category: 'Tools',
        icon: Globe,
        parameters: [
            { name: 'city', type: 'string', required: true, description: 'City name' }
        ]
    },
    {
        id: 'news',
        name: 'News Headlines',
        description: 'Get latest news headlines by category or region',
        method: 'GET',
        endpoint: '/api/tools/news',
        category: 'Tools',
        icon: Globe,
        parameters: [
            { name: 'category', type: 'string', required: false, description: 'Category: technology, sports, business, etc.' }
        ]
    }
];
const categories = Array.from(new Set(apiEndpoints.map(endpoint => endpoint.category)));
export default function Dashboard() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [testParams, setTestParams] = useState({});
    const [testResult, setTestResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const filteredEndpoints = selectedCategory === 'All'
        ? apiEndpoints
        : apiEndpoints.filter(endpoint => endpoint.category === selectedCategory);
    const handleTest = async () => {
        if (!selectedEndpoint)
            return;
        setIsLoading(true);
        const baseUrl = window.location.origin;
        let url = baseUrl + selectedEndpoint.endpoint;
        let options = {
            headers: { 'Content-Type': 'application/json' },
        };
        const params = new URLSearchParams();
        if (selectedEndpoint.method === 'GET') {
            Object.entries(testParams).forEach(([key, value]) => {
                if (value !== '' && value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            const qs = params.toString();
            if (qs)
                url += '?' + qs;
        }
        else {
            options.method = 'POST';
            options.body = JSON.stringify(testParams);
        }
        try {
            const response = await fetch(url, options);
            const ct = response.headers.get('content-type') || '';
            const result = ct.includes('json') ? await response.json() : { raw: await response.text() };
            setTestResult({ status: response.status, statusText: response.statusText, url, data: result });
            toast({
                title: response.ok ? 'Success' : 'Failed',
                description: selectedEndpoint.name + ': ' + response.status,
                variant: response.ok ? 'default' : 'destructive',
            });
        }
        catch (error) {
            setTestResult({ status: 0, statusText: 'Error', url, data: { error: error.message } });
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
        finally {
            setIsLoading(false);
        }
    };
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard",
            description: "Code copied successfully",
        });
    };
    return (_jsx("div", { className: "min-h-screen bg-background p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-foreground mb-2", "data-testid": "heading-dashboard", children: "API Dashboard" }), _jsx("p", { className: "text-muted-foreground", children: "Test and explore all available API endpoints with an interactive interface" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "h-5 w-5" }), "API Endpoints"] }), _jsx(CardDescription, { children: "Browse endpoints by category" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "mb-4", children: [_jsx(Label, { htmlFor: "category-select", children: "Category" }), _jsxs(Select, { value: selectedCategory, onValueChange: setSelectedCategory, children: [_jsx(SelectTrigger, { "data-testid": "select-category", children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "All", children: "All Categories" }), categories.map((category) => (_jsx(SelectItem, { value: category, children: category }, category)))] })] })] }), _jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: filteredEndpoints.map((endpoint) => (_jsx("div", { className: `p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${selectedEndpoint?.id === endpoint.id
                                                        ? 'border-primary bg-accent'
                                                        : 'border-border'}`, onClick: () => {
                                                        setSelectedEndpoint(endpoint);
                                                        setTestParams({});
                                                        setTestResult(null);
                                                    }, "data-testid": `endpoint-${endpoint.id}`, children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(endpoint.icon, { className: "h-4 w-4 mt-1 text-primary" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "flex items-center gap-2 mb-1", children: _jsx(Badge, { variant: endpoint.method === 'GET' ? 'secondary' : 'default', children: endpoint.method }) }), _jsx("h3", { className: "font-medium text-sm", children: endpoint.name }), _jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: endpoint.description })] })] }) }, endpoint.id))) })] })] }) }), _jsx("div", { className: "lg:col-span-2", children: selectedEndpoint ? (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(selectedEndpoint.icon, { className: "h-5 w-5 text-primary" }), _jsxs("div", { children: [_jsx(CardTitle, { children: selectedEndpoint.name }), _jsx(CardDescription, { children: selectedEndpoint.description })] })] }), _jsxs("div", { className: "flex items-center gap-2 pt-2", children: [_jsx(Badge, { variant: selectedEndpoint.method === 'GET' ? 'secondary' : 'default', children: selectedEndpoint.method }), _jsx("code", { className: "text-sm bg-muted px-2 py-1 rounded", children: selectedEndpoint.endpoint })] })] }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "test", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "test", "data-testid": "tab-test", children: "Test" }), _jsx(TabsTrigger, { value: "docs", "data-testid": "tab-docs", children: "Documentation" }), _jsx(TabsTrigger, { value: "code", "data-testid": "tab-code", children: "Code Examples" })] }), _jsxs(TabsContent, { value: "test", className: "space-y-4", children: [selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (_jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Parameters" }), _jsx("div", { className: "grid gap-4 mt-2", children: selectedEndpoint.parameters.map((param) => (_jsxs("div", { className: "grid gap-2", children: [_jsxs(Label, { htmlFor: param.name, className: "flex items-center gap-2", children: [param.name, param.required && _jsx("span", { className: "text-destructive", children: "*" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: param.type })] }), param.type === 'file' ? (_jsx(Input, { id: param.name, type: "file", onChange: (e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    setTestParams(prev => ({ ...prev, [param.name]: file }));
                                                                                }, "data-testid": `input-${param.name}` })) : param.options ? (_jsxs(Select, { value: testParams[param.name] || '', onValueChange: (value) => setTestParams(prev => ({ ...prev, [param.name]: value })), children: [_jsx(SelectTrigger, { "data-testid": `select-${param.name}`, children: _jsx(SelectValue, { placeholder: "Select option" }) }), _jsx(SelectContent, { children: param.options.map((option) => (_jsx(SelectItem, { value: option, children: option }, option))) })] })) : param.type === 'boolean' ? (_jsxs(Select, { value: testParams[param.name]?.toString() || '', onValueChange: (value) => setTestParams(prev => ({ ...prev, [param.name]: value === 'true' })), children: [_jsx(SelectTrigger, { "data-testid": `select-${param.name}`, children: _jsx(SelectValue, { placeholder: "Select true/false" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "true", children: "true" }), _jsx(SelectItem, { value: "false", children: "false" })] })] })) : (_jsx(Input, { id: param.name, type: param.type === 'number' ? 'number' : 'text', placeholder: param.description, value: testParams[param.name] || '', onChange: (e) => setTestParams(prev => ({
                                                                                    ...prev,
                                                                                    [param.name]: param.type === 'number'
                                                                                        ? Number(e.target.value)
                                                                                        : e.target.value
                                                                                })), "data-testid": `input-${param.name}` })), _jsx("p", { className: "text-xs text-muted-foreground", children: param.description })] }, param.name))) })] })), _jsx(Separator, {}), _jsx(Button, { onClick: handleTest, disabled: isLoading, className: "w-full", "data-testid": "button-test-api", children: isLoading ? 'Testing...' : `Test ${selectedEndpoint.name}` }), testResult && (_jsxs("div", { className: "space-y-4", children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Response" }), _jsxs("div", { className: "mt-2 space-y-2", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsxs(Badge, { variant: testResult.status < 400 ? 'default' : 'destructive', children: [testResult.status, " ", testResult.statusText] }) }), _jsx("div", { className: "bg-muted rounded-lg p-4", children: _jsx("pre", { className: "text-sm overflow-auto max-h-64", "data-testid": "test-result", children: JSON.stringify(testResult.data, null, 2) }) })] })] })] }))] }), _jsxs(TabsContent, { value: "docs", className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Endpoint Information" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("p", { children: [_jsx("strong", { children: "Method:" }), " ", selectedEndpoint.method] }), _jsxs("p", { children: [_jsx("strong", { children: "Endpoint:" }), " ", _jsx("code", { children: selectedEndpoint.endpoint })] }), _jsxs("p", { children: [_jsx("strong", { children: "Description:" }), " ", selectedEndpoint.description] })] })] }), selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Parameters" }), _jsx("div", { className: "space-y-2", children: selectedEndpoint.parameters.map((param) => (_jsxs("div", { className: "border rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("code", { className: "font-medium", children: param.name }), _jsx(Badge, { variant: "outline", children: param.type }), param.required && _jsx(Badge, { variant: "destructive", children: "required" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: param.description }), param.options && (_jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Options: ", param.options.join(', ')] }))] }, param.name))) })] }))] }), _jsxs(TabsContent, { value: "code", className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "JavaScript Example" }), _jsxs("div", { className: "relative", children: [_jsx(Button, { variant: "outline", size: "sm", className: "absolute top-2 right-2 z-10", onClick: () => copyToClipboard(generateJavaScriptExample(selectedEndpoint)), children: "Copy" }), _jsx("pre", { className: "bg-muted rounded-lg p-4 overflow-auto text-sm", children: _jsx("code", { children: generateJavaScriptExample(selectedEndpoint) }) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "cURL Example" }), _jsxs("div", { className: "relative", children: [_jsx(Button, { variant: "outline", size: "sm", className: "absolute top-2 right-2 z-10", onClick: () => copyToClipboard(generateCurlExample(selectedEndpoint)), children: "Copy" }), _jsx("pre", { className: "bg-muted rounded-lg p-4 overflow-auto text-sm", children: _jsx("code", { children: generateCurlExample(selectedEndpoint) }) })] })] })] })] }) })] })) : (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center h-96", children: [_jsx(Globe, { className: "h-12 w-12 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "Select an API Endpoint" }), _jsx("p", { className: "text-muted-foreground text-center", children: "Choose an endpoint from the sidebar to test it with our interactive interface" })] }) })) })] })] }) }));
}
// Helper functions for code generation
function generateJavaScriptExample(endpoint) {
    const exampleParams = endpoint.example || {};
    const hasParams = endpoint.parameters && endpoint.parameters.length > 0;
    if (endpoint.method === 'GET') {
        return `// ${endpoint.name} - JavaScript Example
const apiKey = 'your-api-key-here';
${hasParams ? `const params = new URLSearchParams(${JSON.stringify(exampleParams, null, 2)});` : ''}

const response = await fetch(\`https://api.brokenvzn.com${endpoint.endpoint}${hasParams ? '?${params}' : ''}\`, {
  headers: {
    'X-API-Key': apiKey
  }
});

const data = await response.json();
console.log(data);`;
    }
    else {
        return `// ${endpoint.name} - JavaScript Example
const apiKey = 'your-api-key-here';
${hasParams ? `const requestBody = ${JSON.stringify(exampleParams, null, 2)};` : ''}

const response = await fetch('https://api.brokenvzn.com${endpoint.endpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey
  }${hasParams ? ',\n  body: JSON.stringify(requestBody)' : ''}
});

const data = await response.json();
console.log(data);`;
    }
}
function generateCurlExample(endpoint) {
    const exampleParams = endpoint.example || {};
    const hasParams = endpoint.parameters && endpoint.parameters.length > 0;
    if (endpoint.method === 'GET') {
        const queryString = hasParams
            ? '?' + new URLSearchParams(exampleParams).toString()
            : '';
        return `# ${endpoint.name} - cURL Example
curl -X GET "https://api.brokenvzn.com${endpoint.endpoint}${queryString}" \\
  -H "X-API-Key: your-api-key-here" \\
  -H "Accept: application/json"`;
    }
    else {
        return `# ${endpoint.name} - cURL Example
curl -X POST "https://api.brokenvzn.com${endpoint.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key-here"${hasParams ? ` \\
  -d '${JSON.stringify(exampleParams)}'` : ''}`;
    }
}
