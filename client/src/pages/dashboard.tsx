import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Brain, Camera, Download, Globe, Image, MessageSquare, Mic, Music, QrCode, Shield, Translate, Wand2, Zap } from "lucide-react";

interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST';
  endpoint: string;
  category: string;
  icon: any;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    options?: string[];
  }>;
  example?: any;
}

const apiEndpoints: ApiEndpoint[] = [
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
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [testParams, setTestParams] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const filteredEndpoints = selectedCategory === 'All' 
    ? apiEndpoints 
    : apiEndpoints.filter(endpoint => endpoint.category === selectedCategory);

  const handleTest = async () => {
    if (!selectedEndpoint) return;

    setIsLoading(true);
    try {
      const apiKey = localStorage.getItem('apiKey') || 'demo-key';
      
      let url = selectedEndpoint.endpoint;
      let options: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
      };

      if (selectedEndpoint.method === 'GET') {
        const params = new URLSearchParams();
        Object.entries(testParams).forEach(([key, value]) => {
          if (value !== '' && value !== undefined) {
            params.append(key, value);
          }
        });
        if (params.toString()) {
          url += '?' + params.toString();
        }
      } else {
        options.method = 'POST';
        options.body = JSON.stringify(testParams);
      }

      const response = await fetch(url, options);
      const result = await response.json();
      
      setTestResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: result
      });

      if (response.ok) {
        toast({
          title: "API Test Successful",
          description: `${selectedEndpoint.name} executed successfully`,
        });
      } else {
        toast({
          title: "API Test Failed",
          description: result.error || "Request failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Error",
        description: "Failed to execute API test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code copied successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-dashboard">
            API Dashboard
          </h1>
          <p className="text-muted-foreground">
            Test and explore all available API endpoints with an interactive interface
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Categories and Endpoints */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Endpoints
                </CardTitle>
                <CardDescription>
                  Browse endpoints by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category Filter */}
                <div className="mb-4">
                  <Label htmlFor="category-select">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Endpoints List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredEndpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                        selectedEndpoint?.id === endpoint.id 
                          ? 'border-primary bg-accent' 
                          : 'border-border'
                      }`}
                      onClick={() => {
                        setSelectedEndpoint(endpoint);
                        setTestParams({});
                        setTestResult(null);
                      }}
                      data-testid={`endpoint-${endpoint.id}`}
                    >
                      <div className="flex items-start gap-2">
                        <endpoint.icon className="h-4 w-4 mt-1 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                              {endpoint.method}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-sm">{endpoint.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {endpoint.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Testing Interface */}
          <div className="lg:col-span-2">
            {selectedEndpoint ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <selectedEndpoint.icon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>{selectedEndpoint.name}</CardTitle>
                      <CardDescription>{selectedEndpoint.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant={selectedEndpoint.method === 'GET' ? 'secondary' : 'default'}>
                      {selectedEndpoint.method}
                    </Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {selectedEndpoint.endpoint}
                    </code>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="test" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="test" data-testid="tab-test">Test</TabsTrigger>
                      <TabsTrigger value="docs" data-testid="tab-docs">Documentation</TabsTrigger>
                      <TabsTrigger value="code" data-testid="tab-code">Code Examples</TabsTrigger>
                    </TabsList>

                    <TabsContent value="test" className="space-y-4">
                      {/* Parameters Form */}
                      {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                        <div>
                          <Label className="text-base font-medium">Parameters</Label>
                          <div className="grid gap-4 mt-2">
                            {selectedEndpoint.parameters.map((param) => (
                              <div key={param.name} className="grid gap-2">
                                <Label htmlFor={param.name} className="flex items-center gap-2">
                                  {param.name}
                                  {param.required && <span className="text-destructive">*</span>}
                                  <Badge variant="outline" className="text-xs">
                                    {param.type}
                                  </Badge>
                                </Label>
                                
                                {param.type === 'file' ? (
                                  <Input
                                    id={param.name}
                                    type="file"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      setTestParams(prev => ({ ...prev, [param.name]: file }));
                                    }}
                                    data-testid={`input-${param.name}`}
                                  />
                                ) : param.options ? (
                                  <Select
                                    value={testParams[param.name] || ''}
                                    onValueChange={(value) => 
                                      setTestParams(prev => ({ ...prev, [param.name]: value }))
                                    }
                                  >
                                    <SelectTrigger data-testid={`select-${param.name}`}>
                                      <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {param.options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : param.type === 'boolean' ? (
                                  <Select
                                    value={testParams[param.name]?.toString() || ''}
                                    onValueChange={(value) => 
                                      setTestParams(prev => ({ ...prev, [param.name]: value === 'true' }))
                                    }
                                  >
                                    <SelectTrigger data-testid={`select-${param.name}`}>
                                      <SelectValue placeholder="Select true/false" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="true">true</SelectItem>
                                      <SelectItem value="false">false</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    id={param.name}
                                    type={param.type === 'number' ? 'number' : 'text'}
                                    placeholder={param.description}
                                    value={testParams[param.name] || ''}
                                    onChange={(e) => 
                                      setTestParams(prev => ({ 
                                        ...prev, 
                                        [param.name]: param.type === 'number' 
                                          ? Number(e.target.value) 
                                          : e.target.value 
                                      }))
                                    }
                                    data-testid={`input-${param.name}`}
                                  />
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {param.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Test Button */}
                      <Button 
                        onClick={handleTest} 
                        disabled={isLoading}
                        className="w-full"
                        data-testid="button-test-api"
                      >
                        {isLoading ? 'Testing...' : `Test ${selectedEndpoint.name}`}
                      </Button>

                      {/* Test Results */}
                      {testResult && (
                        <div className="space-y-4">
                          <Separator />
                          <div>
                            <Label className="text-base font-medium">Response</Label>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={testResult.status < 400 ? 'default' : 'destructive'}>
                                  {testResult.status} {testResult.statusText}
                                </Badge>
                              </div>
                              <div className="bg-muted rounded-lg p-4">
                                <pre className="text-sm overflow-auto max-h-64" data-testid="test-result">
                                  {JSON.stringify(testResult.data, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="docs" className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Endpoint Information</h3>
                        <div className="space-y-2">
                          <p><strong>Method:</strong> {selectedEndpoint.method}</p>
                          <p><strong>Endpoint:</strong> <code>{selectedEndpoint.endpoint}</code></p>
                          <p><strong>Description:</strong> {selectedEndpoint.description}</p>
                        </div>
                      </div>

                      {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Parameters</h3>
                          <div className="space-y-2">
                            {selectedEndpoint.parameters.map((param) => (
                              <div key={param.name} className="border rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <code className="font-medium">{param.name}</code>
                                  <Badge variant="outline">{param.type}</Badge>
                                  {param.required && <Badge variant="destructive">required</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">{param.description}</p>
                                {param.options && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Options: {param.options.join(', ')}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="code" className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">JavaScript Example</h3>
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => copyToClipboard(generateJavaScriptExample(selectedEndpoint))}
                          >
                            Copy
                          </Button>
                          <pre className="bg-muted rounded-lg p-4 overflow-auto text-sm">
                            <code>{generateJavaScriptExample(selectedEndpoint)}</code>
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">cURL Example</h3>
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => copyToClipboard(generateCurlExample(selectedEndpoint))}
                          >
                            Copy
                          </Button>
                          <pre className="bg-muted rounded-lg p-4 overflow-auto text-sm">
                            <code>{generateCurlExample(selectedEndpoint)}</code>
                          </pre>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-96">
                  <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select an API Endpoint</h3>
                  <p className="text-muted-foreground text-center">
                    Choose an endpoint from the sidebar to test it with our interactive interface
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for code generation
function generateJavaScriptExample(endpoint: ApiEndpoint): string {
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
  } else {
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

function generateCurlExample(endpoint: ApiEndpoint): string {
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
  } else {
    return `# ${endpoint.name} - cURL Example
curl -X POST "https://api.brokenvzn.com${endpoint.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key-here"${hasParams ? ` \\
  -d '${JSON.stringify(exampleParams)}'` : ''}`;
  }
}