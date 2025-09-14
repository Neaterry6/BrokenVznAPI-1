export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  title: string;
  description: string;
  endpoint: string;
  testFields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'file';
    placeholder: string;
    required?: boolean;
  }>;
}

export interface ApiParameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'file';
  description?: string;
  required?: boolean;
}

export interface ApiCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  endpoints: ApiEndpoint[];
}

export const apiCategories: ApiCategory[] = [
  {
    id: "system-status",
    title: "🔧 System & Status",
    description: "API status, health checks, and system information endpoints",
    icon: "🔧",
    endpoints: [
      {
        id: "api-status",
        method: "GET",
        title: "API Status",
        description: "Check the current status of the API service",
        endpoint: "/api/status",
        testFields: []
      },
      {
        id: "api-health",
        method: "GET", 
        title: "Health Check",
        description: "Get detailed health information including uptime and memory usage",
        endpoint: "/api/health",
        testFields: []
      },
      {
        id: "api-info",
        method: "GET",
        title: "API Information",
        description: "Get comprehensive API information and statistics",
        endpoint: "/api/info", 
        testFields: []
      },
      {
        id: "server-stats",
        method: "GET",
        title: "Server Statistics",
        description: "Get server performance statistics",
        endpoint: "/api/stats/server",
        testFields: []
      }
    ]
  },
  {
    id: "ytplay-apis",
    title: "🎵 YTPlay APIs",
    description: "YouTube video search, streaming, and download services",
    icon: "🎵",
    endpoints: [
      {
        id: "ytplay-search",
        method: "GET",
        title: "YTPlay Search",
        description: "Search for YouTube videos with enhanced results",
        endpoint: "/api/ytplay/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "music video", required: true },
          { name: "maxResults", label: "Max Results", type: "number", placeholder: "10" }
        ]
      },
      {
        id: "ytplay-video",
        method: "GET",
        title: "YTPlay Video Info",
        description: "Get detailed YouTube video information",
        endpoint: "/api/ytplay/video",
        testFields: [
          { name: "query", label: "Video Query", type: "text", placeholder: "music video", required: true }
        ]
      },
      {
        id: "ytplay-play",
        method: "GET",
        title: "YTPlay Audio Stream",
        description: "Get audio stream URL from YouTube videos",
        endpoint: "/api/ytplay/play",
        testFields: [
          { name: "query", label: "Video Query", type: "text", placeholder: "music video", required: true }
        ]
      },
      {
        id: "ytplay-download",
        method: "GET",
        title: "YTPlay Download",
        description: "Download YouTube videos with quality options",
        endpoint: "/api/ytplay/download",
        testFields: [
          { name: "query", label: "Video Query", type: "text", placeholder: "music video", required: true },
          { name: "quality", label: "Quality", type: "text", placeholder: "highest" }
        ]
      }
    ]
  },
  {
    id: "social-downloader",
    title: "📱 Social Media Downloader", 
    description: "Download content from TikTok, Instagram, Pinterest with working APIs",
    icon: "📱",
    endpoints: [
      {
        id: "tiktok-download",
        method: "GET",
        title: "TikTok Video Downloader",
        description: "Download TikTok videos with metadata",
        endpoint: "/api/tiktok/download",
        testFields: [
          { name: "url", label: "TikTok URL", type: "text", placeholder: "https://vm.tiktok.com/example", required: true }
        ]
      },
      {
        id: "tiktod-download",
        method: "GET",
        title: "TikTod Enhanced Downloader",
        description: "Enhanced TikTok downloader with more features",
        endpoint: "/api/tiktod",
        testFields: [
          { name: "url", label: "TikTok URL", type: "text", placeholder: "https://vm.tiktok.com/example", required: true }
        ]
      },
      {
        id: "instagram-download",
        method: "GET",
        title: "Instagram Content Downloader",
        description: "Download Instagram posts, reels, and stories",
        endpoint: "/api/instagram/download",
        testFields: [
          { name: "url", label: "Instagram URL", type: "text", placeholder: "https://instagram.com/p/example", required: true }
        ]
      },
      {
        id: "social-downloader-enhanced",
        method: "GET",
        title: "Enhanced Social Media Downloader",
        description: "Universal downloader for multiple social platforms",
        endpoint: "/api/downloader/social",
        testFields: [
          { name: "url", label: "Social Media URL", type: "text", placeholder: "https://...", required: true }
        ]
      }
    ]
  },
  {
    id: "youtube-services", 
    title: "🎬 YouTube Services",
    description: "YouTube video information, streaming, and download services",
    icon: "🎬",
    endpoints: [
      {
        id: "youtube-info",
        method: "GET",
        title: "YouTube Video Info",
        description: "Get detailed information about YouTube videos",
        endpoint: "/api/youtube/info",
        testFields: [
          { name: "url", label: "YouTube URL", type: "text", placeholder: "https://youtube.com/watch?v=dQw4w9WgXcQ", required: true }
        ]
      },
      {
        id: "youtube-brokenvzn-video",
        method: "GET",
        title: "YouTube broken Vzn Video",
        description: "Enhanced YouTube video processing with broken Vzn API",
        endpoint: "/api/youtube-kaiz/video",
        testFields: [
          { name: "query", label: "Video Query", type: "text", placeholder: "music video", required: true }
        ]
      },
      {
        id: "youtube-brokenvzn-play",
        method: "GET", 
        title: "YouTube broken Vzn Audio Play",
        description: "Get audio stream from YouTube videos using broken Vzn API",
        endpoint: "/api/youtube-kaiz/play",
        testFields: [
          { name: "query", label: "Video Query", type: "text", placeholder: "music video", required: true }
        ]
      },
      {
        id: "youtube-brokenvzn-status",
        method: "GET",
        title: "YouTube broken Vzn Status",
        description: "Check status of YouTube broken Vzn service",
        endpoint: "/api/youtube-kaiz/status",
        testFields: []
      },
      {
        id: "yt-search",
        method: "GET",
        title: "YT Search",
        description: "Search YouTube videos with metadata",
        endpoint: "/api/yt/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "music video", required: true }
        ]
      },
      {
        id: "yt-play",
        method: "GET",
        title: "YT Play",
        description: "Get YouTube video play information",
        endpoint: "/api/yt/play",
        testFields: [
          { name: "url", label: "YouTube URL", type: "text", placeholder: "https://youtube.com/watch?v=...", required: true }
        ]
      },
      {
        id: "yt-download",
        method: "GET",
        title: "YT Download",
        description: "Download YouTube videos with format options",
        endpoint: "/api/yt/download",
        testFields: [
          { name: "url", label: "YouTube URL", type: "text", placeholder: "https://youtube.com/watch?v=...", required: true },
          { name: "quality", label: "Quality", type: "text", placeholder: "highest" }
        ]
      },
      {
        id: "youtube-dlp-search",
        method: "GET",
        title: "YouTube DLP Search",
        description: "Advanced YouTube search with DLP",
        endpoint: "/api/youtube-dlp/search",
        testFields: [
          { name: "q", label: "Search Query", type: "text", placeholder: "music video", required: true },
          { name: "maxResults", label: "Max Results", type: "number", placeholder: "10" }
        ]
      },
      {
        id: "youtube-dlp-play",
        method: "GET",
        title: "YouTube DLP Play",
        description: "Get playable stream with DLP",
        endpoint: "/api/youtube-dlp/play",
        testFields: [
          { name: "id", label: "Video ID", type: "text", placeholder: "dQw4w9WgXcQ", required: true }
        ]
      },
      {
        id: "youtube-dlp-video",
        method: "GET",
        title: "YouTube DLP Video Download",
        description: "Download video with DLP",
        endpoint: "/api/youtube-dlp/video", 
        testFields: [
          { name: "id", label: "Video ID", type: "text", placeholder: "dQw4w9WgXcQ", required: true },
          { name: "quality", label: "Quality", type: "text", placeholder: "720p" }
        ]
      },
      {
        id: "youtube-dlp-audio",
        method: "GET",
        title: "YouTube DLP Audio Download", 
        description: "Download audio with DLP",
        endpoint: "/api/youtube-dlp/audio",
        testFields: [
          { name: "id", label: "Video ID", type: "text", placeholder: "dQw4w9WgXcQ", required: true }
        ]
      }
    ]
  },
  {
    id: "personal-play",
    title: "🎧 Personal Play APIs",
    description: "Personal YouTube player with ytdl-core integration",
    icon: "🎧", 
    endpoints: [
      {
        id: "play-search",
        method: "GET",
        title: "Personal Play Search",
        description: "Search YouTube videos for personal play",
        endpoint: "/api/play/search",
        testFields: [
          { name: "q", label: "Search Query", type: "text", placeholder: "music video", required: true }
        ]
      },
      {
        id: "play-info",
        method: "GET",
        title: "Personal Play Info",
        description: "Get video information for personal play",
        endpoint: "/api/play/info",
        testFields: [
          { name: "url", label: "YouTube URL", type: "text", placeholder: "https://youtube.com/watch?v=...", required: true }
        ]
      },
      {
        id: "play-download",
        method: "GET",
        title: "Personal Play Download",
        description: "Get download URL for personal use",
        endpoint: "/api/play/download",
        testFields: [
          { name: "url", label: "YouTube URL", type: "text", placeholder: "https://youtube.com/watch?v=...", required: true },
          { name: "quality", label: "Quality", type: "text", placeholder: "highest" },
          { name: "format", label: "Format", type: "text", placeholder: "mp4" }
        ]
      }
    ]
  },
  {
    id: "utilities-tools", 
    title: "🔧 Utilities & Tools",
    description: "QR codes, URL shortener, password generator, and other utility services",
    icon: "🔧",
    endpoints: [
      {
        id: "qr-generate",
        method: "POST",
        title: "QR Code Generator",
        description: "Generate QR codes with custom options",
        endpoint: "/api/qr/generate",
        testFields: [
          { name: "text", label: "Text/URL to encode", type: "text", placeholder: "https://example.com", required: true },
          { name: "size", label: "Size", type: "number", placeholder: "200" },
          { name: "format", label: "Format", type: "text", placeholder: "png" }
        ]
      },
      {
        id: "qr-enhanced", 
        method: "GET",
        title: "Enhanced QR Generator",
        description: "Generate enhanced QR codes with more options",
        endpoint: "/api/qr/enhanced",
        testFields: [
          { name: "text", label: "Text to encode", type: "text", placeholder: "https://example.com", required: true },
          { name: "size", label: "Size", type: "number", placeholder: "300" }
        ]
      },
      {
        id: "url-shorten",
        method: "POST",
        title: "URL Shortener",
        description: "Create short URLs with analytics",
        endpoint: "/api/url/shorten",
        testFields: [
          { name: "url", label: "URL to shorten", type: "text", placeholder: "https://example.com/very/long/url", required: true },
          { name: "customCode", label: "Custom Code (optional)", type: "text", placeholder: "mylink" }
        ]
      },
      {
        id: "password-generate",
        method: "GET",
        title: "Password Generator",
        description: "Generate secure random passwords",
        endpoint: "/api/password/generate",
        testFields: [
          { name: "length", label: "Length", type: "number", placeholder: "16" },
          { name: "includeSymbols", label: "Include Symbols", type: "text", placeholder: "true" },
          { name: "includeNumbers", label: "Include Numbers", type: "text", placeholder: "true" }
        ]
      },
      {
        id: "url-tester",
        method: "GET",
        title: "URL Tester",
        description: "Test URL availability and response",
        endpoint: "/api/test",
        testFields: [
          { name: "url", label: "URL to test", type: "text", placeholder: "https://example.com", required: true }
        ]
      },
      {
        id: "math-calculate",
        method: "GET",
        title: "Math Calculator",
        description: "Calculate mathematical expressions",
        endpoint: "/api/math/calculate",
        testFields: [
          { name: "expression", label: "Math Expression", type: "text", placeholder: "2 + 2 * 3", required: true }
        ]
      },
      {
        id: "color-random",
        method: "GET",
        title: "Random Color Generator",
        description: "Generate random colors in multiple formats",
        endpoint: "/api/color/random",
        testFields: []
      }
    ]
  },
  {
    id: "text-audio",
    title: "🎤 Text & Audio",
    description: "Text-to-speech, audio transcription, and voice processing services",
    icon: "🎤", 
    endpoints: [
      {
        id: "tts-generate",
        method: "POST",
        title: "Text-to-Speech",
        description: "Convert text to natural-sounding speech",
        endpoint: "/api/tts/generate",
        testFields: [
          { name: "text", label: "Text to convert", type: "text", placeholder: "Hello, this is a test message.", required: true },
          { name: "voice", label: "Voice", type: "text", placeholder: "en-US-Wavenet-D" },
          { name: "speed", label: "Speed", type: "number", placeholder: "1.0" }
        ]
      },
      {
        id: "transcribe",
        method: "POST",
        title: "Audio Transcription",
        description: "Convert audio files to text transcription",
        endpoint: "/api/transcribe",
        testFields: [
          { name: "audio", label: "Audio File", type: "file", placeholder: "Upload audio file", required: true },
          { name: "language", label: "Language", type: "text", placeholder: "en" }
        ]
      },
      {
        id: "transcribe-url",
        method: "POST",
        title: "Transcribe from URL",
        description: "Transcribe audio from URL",
        endpoint: "/api/transcribe/url",
        testFields: [
          { name: "url", label: "Audio URL", type: "text", placeholder: "https://example.com/audio.mp3", required: true },
          { name: "language", label: "Language", type: "text", placeholder: "en" }
        ]
      },
      {
        id: "transcribe-languages",
        method: "GET",
        title: "Transcription Languages",
        description: "Get supported languages for transcription",
        endpoint: "/api/transcribe/languages",
        testFields: []
      },
      {
        id: "transcribe-status",
        method: "GET",
        title: "Transcription Status",
        description: "Get transcription service status",
        endpoint: "/api/transcribe/status",
        testFields: []
      }
    ]
  },
  {
    id: "content-discovery",
    title: "📚 Content Discovery", 
    description: "Quotes, lyrics, mood suggestions, and content discovery tools",
    icon: "📚",
    endpoints: [
      {
        id: "quotes-random",
        method: "GET",
        title: "Random Quotes",
        description: "Get inspiring random quotes",
        endpoint: "/api/quotes/random",
        testFields: [
          { name: "category", label: "Category (optional)", type: "text", placeholder: "motivation" }
        ]
      },
      {
        id: "quotes-category",
        method: "GET",
        title: "Quotes by Category",
        description: "Get quotes from specific categories",
        endpoint: "/api/quotes/category/:category",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "love", required: true }
        ]
      },
      {
        id: "quotes-search",
        method: "GET",
        title: "Quote Search",
        description: "Search quotes by keywords",
        endpoint: "/api/quotes/search",
        testFields: [
          { name: "keyword", label: "Search Keyword", type: "text", placeholder: "happiness", required: true }
        ]
      },
      {
        id: "mood-suggestions",
        method: "GET",
        title: "Mood Suggestions",
        description: "Get content suggestions based on mood",
        endpoint: "/api/mood-suggestions",
        testFields: [
          { name: "mood", label: "Current Mood", type: "text", placeholder: "happy", required: true },
          { name: "limit", label: "Limit", type: "number", placeholder: "10" }
        ]
      },
      {
        id: "lyrics",
        method: "GET",
        title: "Song Lyrics",
        description: "Get lyrics for songs by artist and title",
        endpoint: "/api/lyrics",
        testFields: [
          { name: "artist", label: "Artist", type: "text", placeholder: "The Beatles", required: true },
          { name: "title", label: "Song Title", type: "text", placeholder: "Hey Jude", required: true }
        ]
      },
      {
        id: "datetime",
        method: "GET",
        title: "Current Date & Time",
        description: "Get current date and time information",
        endpoint: "/api/datetime",
        testFields: []
      },
      {
        id: "facts-random",
        method: "GET",
        title: "Random Facts",
        description: "Get interesting random facts",
        endpoint: "/api/facts/random",
        testFields: []
      },
      {
        id: "riddles-random",
        method: "GET",
        title: "Random Riddles",
        description: "Get fun random riddles with answers",
        endpoint: "/api/riddles/random",
        testFields: []
      }
    ]
  },
  {
    id: "media-search",
    title: "🖼️ Media Search",
    description: "Search and discover photos, videos, and other media content",
    icon: "🖼️",
    endpoints: [
      {
        id: "images-search",
        method: "GET",
        title: "Image Search",
        description: "Search for images from various sources",
        endpoint: "/api/images",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "nature landscape", required: true }
        ]
      },
      {
        id: "bing-image-search",
        method: "GET",
        title: "Bing Image Search",
        description: "Search images using Bing API",
        endpoint: "/api/bing/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "beautiful nature", required: true },
          { name: "amount", label: "Amount", type: "number", placeholder: "10" }
        ]
      },
      {
        id: "pexels-photos",
        method: "GET",
        title: "Pexels Photo Search",
        description: "Search high-quality photos from Pexels",
        endpoint: "/api/pexels/photos",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "technology", required: true },
          { name: "per_page", label: "Results per page", type: "number", placeholder: "15" }
        ]
      },
      {
        id: "pexels-videos",
        method: "GET",
        title: "Pexels Video Search",
        description: "Search high-quality videos from Pexels",
        endpoint: "/api/pexels/videos",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "ocean waves", required: true },
          { name: "per_page", label: "Results per page", type: "number", placeholder: "15" }
        ]
      },
      {
        id: "pexels-curated",
        method: "GET",
        title: "Pexels Curated Photos",
        description: "Get curated photos from Pexels",
        endpoint: "/api/pexels/curated",
        testFields: [
          { name: "per_page", label: "Results per page", type: "number", placeholder: "15" }
        ]
      },
      {
        id: "pexels-popular",
        method: "GET",
        title: "Pexels Popular Videos",
        description: "Get popular videos from Pexels",
        endpoint: "/api/pexels/videos/popular",
        testFields: [
          { name: "per_page", label: "Results per page", type: "number", placeholder: "15" }
        ]
      },
      {
        id: "pexels-photo-by-id",
        method: "GET",
        title: "Pexels Photo by ID",
        description: "Get specific photo from Pexels by ID",
        endpoint: "/api/pexels/photo/:id",
        testFields: [
          { name: "id", label: "Photo ID", type: "text", placeholder: "3573351", required: true }
        ]
      },
      {
        id: "pexels-video-by-id",
        method: "GET",
        title: "Pexels Video by ID",
        description: "Get specific video from Pexels by ID",
        endpoint: "/api/pexels/video/:id", 
        testFields: [
          { name: "id", label: "Video ID", type: "text", placeholder: "1234567", required: true }
        ]
      },
      {
        id: "pexels-random",
        method: "GET",
        title: "Pexels Random Media",
        description: "Get random photos/videos from Pexels",
        endpoint: "/api/pexels/random",
        testFields: [
          { name: "type", label: "Media Type", type: "text", placeholder: "photo" }
        ]
      },
      {
        id: "pexels-info",
        method: "GET",
        title: "Pexels Service Info",
        description: "Get Pexels service information",
        endpoint: "/api/pexels/info",
        testFields: []
      }
    ]
  },
  {
    id: "translation",
    title: "🌐 Translation Services",
    description: "Text translation and language detection services",
    icon: "🌐",
    endpoints: [
      {
        id: "translate-text",
        method: "POST",
        title: "Text Translation",
        description: "Translate text between languages",
        endpoint: "/api/translate",
        testFields: [
          { name: "text", label: "Text to translate", type: "text", placeholder: "Hello world", required: true },
          { name: "from", label: "From Language", type: "text", placeholder: "en", required: true },
          { name: "to", label: "To Language", type: "text", placeholder: "es", required: true }
        ]
      },
      {
        id: "translate-languages",
        method: "GET",
        title: "Supported Languages",
        description: "Get list of supported translation languages",
        endpoint: "/api/translate/languages",
        testFields: []
      },
      {
        id: "translate-detect",
        method: "POST",
        title: "Language Detection",
        description: "Automatically detect language of text",
        endpoint: "/api/translate/detect",
        testFields: [
          { name: "text", label: "Text to analyze", type: "text", placeholder: "Bonjour le monde", required: true }
        ]
      }
    ]
  },
  {
    id: "ai-services",
    title: "🤖 AI Services",
    description: "Grok AI, Gemini AI, and chat services with real API integration",
    icon: "🤖",
    endpoints: [
      {
        id: "chat-basic",
        method: "POST",
        title: "Basic Chat",
        description: "Chat with AI assistant using enhanced responses",
        endpoint: "/api/chat",
        testFields: [
          { name: "sessionId", label: "Session ID", type: "text", placeholder: "user-123", required: true },
          { name: "query", label: "Your Message", type: "text", placeholder: "Hello, how are you today?", required: true }
        ]
      },
      {
        id: "ai-chat",
        method: "POST",
        title: "AI Chat Service",
        description: "Advanced AI chat with context awareness",
        endpoint: "/api/ai/chat",
        testFields: [
          { name: "message", label: "Your Message", type: "text", placeholder: "Tell me about artificial intelligence", required: true }
        ]
      },
      {
        id: "ai-status",
        method: "GET",
        title: "AI Service Status",
        description: "Get AI service status and model information",
        endpoint: "/api/ai/status",
        testFields: []
      },
      {
        id: "grok-chat",
        method: "POST",
        title: "Grok AI Chat", 
        description: "Chat with Grok AI using real x.ai API",
        endpoint: "/api/grok/chat",
        testFields: [
          { name: "message", label: "Your Message", type: "text", placeholder: "Hello, how are you today?", required: true },
          { name: "model", label: "Model (optional)", type: "text", placeholder: "grok-2-1212" }
        ]
      },
      {
        id: "grok-chat-image",
        method: "POST",
        title: "Grok AI Chat with Image",
        description: "Chat with Grok AI including image analysis",
        endpoint: "/api/grok/chat-image",
        testFields: [
          { name: "message", label: "Your Message", type: "text", placeholder: "What do you see in this image?", required: true },
          { name: "imageUrl", label: "Image URL", type: "text", placeholder: "https://example.com/image.jpg" }
        ]
      },
      {
        id: "grok-summarize",
        method: "POST",
        title: "Grok AI Summarize",
        description: "Summarize text content using Grok AI",
        endpoint: "/api/grok/summarize",
        testFields: [
          { name: "text", label: "Text to summarize", type: "text", placeholder: "Long text content here...", required: true }
        ]
      },
      {
        id: "grok-sentiment",
        method: "POST",
        title: "Grok AI Sentiment Analysis",
        description: "Analyze sentiment of text using Grok AI",
        endpoint: "/api/grok/sentiment",
        testFields: [
          { name: "text", label: "Text to analyze", type: "text", placeholder: "I love this product!", required: true }
        ]
      },
      {
        id: "grok-models",
        method: "GET",
        title: "Grok AI Models",
        description: "Get available Grok AI models",
        endpoint: "/api/grok/models",
        testFields: []
      },
      {
        id: "gemini-chat",
        method: "POST",
        title: "Gemini AI Chat",
        description: "Chat with Google Gemini AI",
        endpoint: "/api/gemini/chat",
        testFields: [
          { name: "message", label: "Your Message", type: "text", placeholder: "Explain quantum computing", required: true },
          { name: "model", label: "Model (optional)", type: "text", placeholder: "gemini-2.5-flash" }
        ]
      },
      {
        id: "gemini-chat-image",
        method: "POST",
        title: "Gemini AI Chat with Image",
        description: "Chat with Gemini AI including image analysis",
        endpoint: "/api/gemini/chat-image",
        testFields: [
          { name: "message", label: "Your Message", type: "text", placeholder: "What do you see in this image?", required: true },
          { name: "imageUrl", label: "Image URL", type: "text", placeholder: "https://example.com/image.jpg" }
        ]
      },
      {
        id: "gemini-summarize",
        method: "POST",
        title: "Gemini AI Summarize",
        description: "Summarize text content using Gemini AI",
        endpoint: "/api/gemini/summarize",
        testFields: [
          { name: "text", label: "Text to summarize", type: "text", placeholder: "Long text content here...", required: true }
        ]
      },
      {
        id: "gemini-sentiment",
        method: "POST",
        title: "Gemini AI Sentiment Analysis",
        description: "Analyze sentiment of text using Gemini AI",
        endpoint: "/api/gemini/sentiment",
        testFields: [
          { name: "text", label: "Text to analyze", type: "text", placeholder: "I love this product!", required: true }
        ]
      },
      {
        id: "gemini-generate-image",
        method: "POST",
        title: "Gemini AI Image Generation",
        description: "Generate images using Gemini AI",
        endpoint: "/api/gemini/generate-image",
        testFields: [
          { name: "prompt", label: "Image Prompt", type: "text", placeholder: "A beautiful landscape with mountains", required: true },
          { name: "model", label: "Model (optional)", type: "text", placeholder: "imagen-3.0-generate-001" }
        ]
      },
      {
        id: "gemini-models",
        method: "GET",
        title: "Gemini AI Models",
        description: "Get available Gemini AI models",
        endpoint: "/api/gemini/models",
        testFields: []
      },
      {
        id: "gemini-status",
        method: "GET",
        title: "Gemini AI Status",
        description: "Get Gemini AI service status",
        endpoint: "/api/gemini/status",
        testFields: []
      },
      {
        id: "vanea-ai",
        method: "GET",
        title: "VANEA AI Chat",
        description: "Chat with VANEA AI assistant using Gemini",
        endpoint: "/api/ai/vanea",
        testFields: [
          { name: "text", label: "Your Message", type: "text", placeholder: "Tell me about artificial intelligence", required: true }
        ]
      },
      {
        id: "pollinations-ai",
        method: "GET",
        title: "Pollinations AI Image Generator",
        description: "Generate images using Pollinations AI",
        endpoint: "/api/ai/pollinations",
        testFields: [
          { name: "prompt", label: "Image Prompt", type: "text", placeholder: "A beautiful sunset over the ocean", required: true },
          { name: "width", label: "Width", type: "number", placeholder: "512" },
          { name: "height", label: "Height", type: "number", placeholder: "512" },
          { name: "seed", label: "Seed", type: "number", placeholder: "42" },
          { name: "model", label: "Model", type: "text", placeholder: "turbo" },
          { name: "format", label: "Response Format", type: "text", placeholder: "json" }
        ]
      }
    ]
  },
  {
    id: "waifu-anime",
    title: "🌟 Waifu & Anime APIs",
    description: "Anime/waifu image APIs with multiple providers for better reliability",
    icon: "🌟",
    endpoints: [
      {
        id: "enhanced-waifu-category",
        method: "GET",
        title: "Enhanced Waifu by Category",
        description: "Get waifu images by category with multiple API fallbacks",
        endpoint: "/api/waifu/enhanced/:category",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "waifu", required: true },
          { name: "type", label: "Type", type: "text", placeholder: "sfw" }
        ]
      },
      {
        id: "enhanced-waifu-nsfw",
        method: "GET", 
        title: "Enhanced NSFW Hentai",
        description: "Get NSFW hentai images with multiple API fallbacks",
        endpoint: "/api/waifu/enhanced/hentai/:category",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "hentai" }
        ]
      },
      {
        id: "enhanced-waifu-batch",
        method: "GET",
        title: "Enhanced Batch Waifu",
        description: "Get multiple waifu images in batch with enhanced reliability",
        endpoint: "/api/waifu/enhanced/batch/:category",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "waifu" },
          { name: "type", label: "Type", type: "text", placeholder: "sfw" },
          { name: "count", label: "Count", type: "number", placeholder: "5" }
        ]
      },
      {
        id: "enhanced-waifu-random",
        method: "GET",
        title: "Enhanced Random Waifu",
        description: "Get random waifu image with enhanced API selection",
        endpoint: "/api/waifu/enhanced/random",
        testFields: [
          { name: "type", label: "Type", type: "text", placeholder: "sfw" }
        ]
      },
      {
        id: "enhanced-waifu-categories",
        method: "GET",
        title: "Enhanced Waifu Categories",
        description: "Get available categories for enhanced waifu API",
        endpoint: "/api/waifu/enhanced/categories",
        testFields: []
      },
      {
        id: "enhanced-waifu-status",
        method: "GET",
        title: "Enhanced Waifu Status",
        description: "Get status of enhanced waifu service",
        endpoint: "/api/waifu/enhanced/status",
        testFields: []
      },
      {
        id: "waifu-sfw",
        method: "GET",
        title: "Waifu SFW Images",
        description: "Get safe-for-work waifu images",
        endpoint: "/api/waifu/sfw/:category",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "waifu" }
        ]
      },
      {
        id: "waifu-nsfw",
        method: "GET",
        title: "Waifu NSFW Images",
        description: "Get not-safe-for-work waifu images",
        endpoint: "/api/waifu/nsfw/:category",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "waifu" }
        ]
      },
      {
        id: "waifu-batch",
        method: "GET",
        title: "Waifu Batch Images",
        description: "Get multiple waifu images in batch",
        endpoint: "/api/waifu/batch",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "waifu" },
          { name: "type", label: "Type", type: "text", placeholder: "sfw" },
          { name: "count", label: "Count", type: "number", placeholder: "5" }
        ]
      },
      {
        id: "waifu-random",
        method: "GET",
        title: "Random Waifu",
        description: "Get random waifu image",
        endpoint: "/api/waifu/random",
        testFields: [
          { name: "type", label: "Type", type: "text", placeholder: "sfw" }
        ]
      },
      {
        id: "waifu-categories",
        method: "GET",
        title: "Waifu Categories",
        description: "Get available waifu categories",
        endpoint: "/api/waifu/categories",
        testFields: []
      },
      {
        id: "waifu-basic",
        method: "GET",
        title: "Basic Waifu Generator",
        description: "Generate waifu images with custom parameters",
        endpoint: "/api/waifu",
        testFields: [
          { name: "tags", label: "Tags (comma-separated)", type: "text", placeholder: "cute,anime" },
          { name: "height", label: "Height", type: "text", placeholder: "512" },
          { name: "width", label: "Width", type: "text", placeholder: "512" },
          { name: "orientation", label: "Orientation", type: "text", placeholder: "PORTRAIT" },
          { name: "nsfw", label: "NSFW", type: "text", placeholder: "false" }
        ]
      },
      {
        id: "waifu-random-category",
        method: "GET",
        title: "Waifu by Random Category",
        description: "Get random waifu by specific category",
        endpoint: "/api/waifu/random/:category",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "neko", required: true }
        ]
      },
      {
        id: "waifu-character",
        method: "GET",
        title: "Waifu by Character",
        description: "Get waifu images of specific character",
        endpoint: "/api/waifu/character/:character",
        testFields: [
          { name: "character", label: "Character Name", type: "text", placeholder: "miku", required: true }
        ]
      },
      {
        id: "waifu-bulk",
        method: "GET",
        title: "Bulk Waifu Images",
        description: "Get multiple waifu images with tags",
        endpoint: "/api/waifu/bulk",
        testFields: [
          { name: "count", label: "Count", type: "number", placeholder: "5" },
          { name: "tags", label: "Tags (comma-separated)", type: "text", placeholder: "cute,anime" }
        ]
      }
    ]
  },
  {
    id: "anime-content",
    title: "📺 Anime Content APIs",
    description: "Comprehensive anime search, streaming, and information services",
    icon: "📺",
    endpoints: [
      {
        id: "anime-unified-search",
        method: "GET",
        title: "Unified Anime Search",
        description: "Search anime from multiple sources with unified results",
        endpoint: "/api/unified-anime/search",
        testFields: [
          { name: "query", label: "Anime Search", type: "text", placeholder: "attack on titan", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "anime-unified-details",
        method: "GET",
        title: "Unified Anime Details",
        description: "Get detailed anime information from unified sources",
        endpoint: "/api/unified-anime/details/:animeId",
        testFields: [
          { name: "animeId", label: "Anime ID", type: "text", placeholder: "123456", required: true },
          { name: "source", label: "Source", type: "text", placeholder: "anilist" }
        ]
      },
      {
        id: "anime-unified-stream",
        method: "GET",
        title: "Unified Anime Streaming",
        description: "Get streaming links for anime episodes",
        endpoint: "/api/unified-anime/stream/:episodeId",
        testFields: [
          { name: "episodeId", label: "Episode ID", type: "text", placeholder: "episode123", required: true },
          { name: "source", label: "Source", type: "text", placeholder: "gogoanime" }
        ]
      },
      {
        id: "anime-unified-popular",
        method: "GET",
        title: "Popular Anime",
        description: "Get popular anime from unified sources",
        endpoint: "/api/unified-anime/popular",
        testFields: [
          { name: "page", label: "Page", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "anime-unified-recent",
        method: "GET",
        title: "Recent Anime Releases",
        description: "Get recent anime releases",
        endpoint: "/api/unified-anime/recent",
        testFields: [
          { name: "page", label: "Page", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "anime-scraper-search",
        method: "GET",
        title: "Anime Scraper Search",
        description: "Search across multiple anime scraping sources",
        endpoint: "/api/anime-scraper/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "naruto", required: true }
        ]
      },
      {
        id: "anime-scraper-gogoanime",
        method: "GET",
        title: "GogoAnime Search",
        description: "Search specifically on GogoAnime",
        endpoint: "/api/anime-scraper/gogoanime",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "one piece", required: true }
        ]
      },
      {
        id: "anime-scraper-animepahe",
        method: "GET",
        title: "AnimePahe Search",
        description: "Search specifically on AnimePahe",
        endpoint: "/api/anime-scraper/animepahe",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "demon slayer", required: true }
        ]
      },
      {
        id: "anime-scraper-zoro",
        method: "GET",
        title: "Zoro Search",
        description: "Search specifically on Zoro anime site",
        endpoint: "/api/anime-scraper/zoro",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "jujutsu kaisen", required: true }
        ]
      },
      {
        id: "anime-scraper-9anime",
        method: "GET",
        title: "9anime Search",
        description: "Search specifically on 9anime",
        endpoint: "/api/anime-scraper/9anime",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "death note", required: true }
        ]
      },
      {
        id: "anime-scraper-torrents",
        method: "GET",
        title: "Anime Torrent Search",
        description: "Search anime torrents on Nyaa",
        endpoint: "/api/anime-scraper/torrents",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "attack on titan", required: true }
        ]
      },
      {
        id: "anime-scraper-stream",
        method: "GET",
        title: "Anime Stream Links",
        description: "Get streaming links for anime",
        endpoint: "/api/anime-scraper/stream",
        testFields: [
          { name: "url", label: "Anime URL", type: "text", placeholder: "https://anime-site.com/anime/123", required: true }
        ]
      },
      {
        id: "anime-scraper-status",
        method: "GET",
        title: "Anime Scraper Status",
        description: "Get anime scraper service status",
        endpoint: "/api/anime-scraper/status",
        testFields: []
      },
      {
        id: "anime-categories",
        method: "GET",
        title: "Anime Categories",
        description: "Get all available anime categories",
        endpoint: "/api/anime-categories",
        testFields: []
      },
      {
        id: "anime-by-category",
        method: "GET",
        title: "Anime by Category",
        description: "Get anime by specific category",
        endpoint: "/api/anime-categories/:categoryId",
        testFields: [
          { name: "categoryId", label: "Category ID", type: "text", placeholder: "action", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" },
          { name: "limit", label: "Limit", type: "number", placeholder: "20" }
        ]
      },
      {
        id: "anime-category-search",
        method: "GET",
        title: "Search in Category",
        description: "Search anime within specific category",
        endpoint: "/api/anime-categories/:categoryId/search",
        testFields: [
          { name: "categoryId", label: "Category ID", type: "text", placeholder: "action", required: true },
          { name: "query", label: "Search Query", type: "text", placeholder: "ninja", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "anime-category-random",
        method: "GET",
        title: "Random Anime from Category",
        description: "Get random anime from specific category",
        endpoint: "/api/anime-categories/:categoryId/random",
        testFields: [
          { name: "categoryId", label: "Category ID", type: "text", placeholder: "comedy", required: true },
          { name: "count", label: "Count", type: "number", placeholder: "5" }
        ]
      },
      {
        id: "anime-images-search",
        method: "GET",
        title: "Anime Image Search",
        description: "Search for anime images",
        endpoint: "/api/anime/images/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "naruto", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" },
          { name: "limit", label: "Limit", type: "number", placeholder: "10" }
        ]
      },
      {
        id: "anime-images-character",
        method: "GET",
        title: "Anime Character Images",
        description: "Search anime images by character",
        endpoint: "/api/anime/images/character/:character",
        testFields: [
          { name: "character", label: "Character Name", type: "text", placeholder: "luffy", required: true }
        ]
      },
      {
        id: "anime-images-genre",
        method: "GET",
        title: "Anime Images by Genre",
        description: "Search anime images by genre",
        endpoint: "/api/anime/images/genre/:genre",
        testFields: [
          { name: "genre", label: "Genre", type: "text", placeholder: "shounen", required: true },
          { name: "limit", label: "Limit", type: "number", placeholder: "10" }
        ]
      },
      {
        id: "anime-images-random",
        method: "GET",
        title: "Random Anime Images",
        description: "Get random anime images",
        endpoint: "/api/anime/images/random",
        testFields: [
          { name: "count", label: "Count", type: "number", placeholder: "5" }
        ]
      },
      {
        id: "anime-images-trending",
        method: "GET",
        title: "Trending Anime",
        description: "Get trending anime images",
        endpoint: "/api/anime/images/trending",
        testFields: []
      },
      {
        id: "anime-images-wallpapers",
        method: "GET",
        title: "Anime Wallpapers",
        description: "Search anime wallpapers",
        endpoint: "/api/anime/images/wallpapers",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "anime" },
          { name: "resolution", label: "Resolution", type: "text", placeholder: "1920x1080" }
        ]
      }
    ]
  },
  {
    id: "adult-content",
    title: "🔞 Adult Content APIs (18+)",
    description: "Adult content search and download services - NSFW content warning",
    icon: "🔞",
    endpoints: [
      {
        id: "adult-rule34-search",
        method: "GET",
        title: "Rule34 Content Search",
        description: "Search Rule34 adult content",
        endpoint: "/api/adult/rule34/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "anime", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" },
          { name: "limit", label: "Limit", type: "number", placeholder: "20" },
          { name: "tags", label: "Tags (comma-separated)", type: "text", placeholder: "tag1,tag2" },
          { name: "rating", label: "Rating", type: "text", placeholder: "explicit" },
          { name: "sort", label: "Sort", type: "text", placeholder: "date" }
        ]
      },
      {
        id: "adult-gelbooru-search",
        method: "GET",
        title: "Gelbooru Content Search",
        description: "Search Gelbooru adult content",
        endpoint: "/api/adult/gelbooru/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "anime", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" },
          { name: "limit", label: "Limit", type: "number", placeholder: "20" },
          { name: "tags", label: "Tags (comma-separated)", type: "text", placeholder: "tag1,tag2" },
          { name: "rating", label: "Rating", type: "text", placeholder: "explicit" }
        ]
      },
      {
        id: "adult-hanime-search",
        method: "GET",
        title: "Hanime Video Search",
        description: "Search adult anime videos on Hanime",
        endpoint: "/api/adult/hanime/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "anime", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "adult-hanime-video",
        method: "GET",
        title: "Hanime Video Details",
        description: "Get Hanime video details with streaming links",
        endpoint: "/api/adult/hanime/video/:slug",
        testFields: [
          { name: "slug", label: "Video Slug", type: "text", placeholder: "video-slug-here", required: true }
        ]
      },
      {
        id: "adult-search-aggregate",
        method: "GET",
        title: "Multi-Site Adult Search",
        description: "Search across multiple adult content sites",
        endpoint: "/api/adult/search/aggregate",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "anime", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" },
          { name: "limit", label: "Limit", type: "number", placeholder: "20" },
          { name: "tags", label: "Tags (comma-separated)", type: "text", placeholder: "tag1,tag2" },
          { name: "rating", label: "Rating", type: "text", placeholder: "explicit" }
        ]
      },
      {
        id: "adult-random",
        method: "GET",
        title: "Random Adult Content",
        description: "Get random adult content",
        endpoint: "/api/adult/random",
        testFields: [
          { name: "site", label: "Site", type: "text", placeholder: "rule34" },
          { name: "limit", label: "Limit", type: "number", placeholder: "10" }
        ]
      },
      {
        id: "adult-tags-popular",
        method: "GET",
        title: "Popular Adult Tags",
        description: "Get popular tags for adult content",
        endpoint: "/api/adult/tags/popular",
        testFields: [
          { name: "site", label: "Site", type: "text", placeholder: "rule34" }
        ]
      },
      {
        id: "adult-safe-search",
        method: "GET",
        title: "Safe Mode Adult Search",
        description: "Search adult content with safe mode filtering",
        endpoint: "/api/adult/safe/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "anime", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "adult-status",
        method: "GET",
        title: "Adult Content Service Status",
        description: "Get adult content service status",
        endpoint: "/api/adult/status",
        testFields: []
      },
      {
        id: "adult-enhanced-search",
        method: "GET",
        title: "Enhanced Adult Search",
        description: "Enhanced booru content search",
        endpoint: "/api/adult/enhanced/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "anime", required: true },
          { name: "site", label: "Site", type: "text", placeholder: "auto" },
          { name: "page", label: "Page", type: "number", placeholder: "1" },
          { name: "limit", label: "Limit", type: "number", placeholder: "20" }
        ]
      },
      {
        id: "adult-enhanced-videos",
        method: "GET",
        title: "Enhanced Adult Videos",
        description: "Enhanced adult video search",
        endpoint: "/api/adult/enhanced/videos",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "anime", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" },
          { name: "limit", label: "Limit", type: "number", placeholder: "20" }
        ]
      },
      {
        id: "adult-xnxx-search",
        method: "GET",
        title: "XNXX Content Search",
        description: "Search XNXX-style adult content",
        endpoint: "/api/adult/xnxx/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "video", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "adult-xnxx-download",
        method: "GET",
        title: "XNXX Video Download",
        description: "Download XNXX videos",
        endpoint: "/api/adult/xnxx/download/:videoId",
        testFields: [
          { name: "videoId", label: "Video ID", type: "text", placeholder: "video123", required: true }
        ]
      },
      {
        id: "adult-enhanced-trending",
        method: "GET",
        title: "Trending Adult Content",
        description: "Get trending adult content",
        endpoint: "/api/adult/enhanced/trending",
        testFields: [
          { name: "type", label: "Content Type", type: "text", placeholder: "all" }
        ]
      }
    ]
  },
  {
    id: "entertainment-games",
    title: "🎮 Entertainment & Games",
    description: "Jokes, memes, games, quizzes, and entertainment content",
    icon: "🎮",
    endpoints: [
      {
        id: "jokes-basic",
        method: "GET",
        title: "Jokes",
        description: "Get jokes by category",
        endpoint: "/api/jokes",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "tech" },
          { name: "count", label: "Count", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "jokes-categories",
        method: "GET",
        title: "Joke Categories",
        description: "Get available joke categories",
        endpoint: "/api/jokes/categories",
        testFields: []
      },
      {
        id: "jokes-random",
        method: "GET",
        title: "Random Jokes",
        description: "Get random jokes",
        endpoint: "/api/jokes/random",
        testFields: []
      },
      {
        id: "jokes-enhanced",
        method: "GET",
        title: "Enhanced Random Jokes",
        description: "Get enhanced random jokes",
        endpoint: "/api/jokes/enhanced",
        testFields: []
      },
      {
        id: "jokes-by-category",
        method: "GET",
        title: "Jokes by Category",
        description: "Get jokes from specific category",
        endpoint: "/api/jokes/category/:category",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "programming", required: true }
        ]
      },
      {
        id: "memes-random",
        method: "GET",
        title: "Random Memes",
        description: "Get random popular memes",
        endpoint: "/api/memes/random",
        testFields: []
      },
      {
        id: "games-words",
        method: "GET",
        title: "Word Games",
        description: "Play various word games",
        endpoint: "/api/games/words",
        testFields: [
          { name: "game_type", label: "Game Type", type: "text", placeholder: "crossword" },
          { name: "difficulty", label: "Difficulty", type: "text", placeholder: "easy" },
          { name: "category", label: "Category", type: "text", placeholder: "general" }
        ]
      },
      {
        id: "games-tebakgambar",
        method: "GET",
        title: "Tebak Gambar",
        description: "Indonesian guess-the-image game",
        endpoint: "/api/games/tebakgambar",
        testFields: []
      },
      {
        id: "quiz-coding",
        method: "GET",
        title: "Coding Quiz",
        description: "Generate coding quizzes",
        endpoint: "/api/quiz/coding",
        testFields: [
          { name: "language", label: "Programming Language", type: "text", placeholder: "javascript" },
          { name: "difficulty", label: "Difficulty", type: "text", placeholder: "medium" },
          { name: "amount", label: "Number of Questions", type: "number", placeholder: "5" }
        ]
      },
      {
        id: "quiz-trivia",
        method: "GET",
        title: "Trivia Quiz",
        description: "Generate trivia quizzes",
        endpoint: "/api/quiz/trivia",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "science" },
          { name: "difficulty", label: "Difficulty", type: "text", placeholder: "medium" },
          { name: "amount", label: "Number of Questions", type: "number", placeholder: "5" },
          { name: "type", label: "Question Type", type: "text", placeholder: "multiple" }
        ]
      }
    ]
  },
  {
    id: "developer-tools",
    title: "⚙️ Developer Tools",
    description: "Base64, binary encoding/decoding, hashing, and JavaScript utilities",
    icon: "⚙️",
    endpoints: [
      {
        id: "tools-base64-encode",
        method: "GET",
        title: "Base64 Encode",
        description: "Encode text to Base64",
        endpoint: "/api/tools/base64/encode",
        testFields: [
          { name: "query", label: "Text to encode", type: "text", placeholder: "Hello World!", required: true }
        ]
      },
      {
        id: "tools-base64-decode",
        method: "GET",
        title: "Base64 Decode",
        description: "Decode Base64 to text",
        endpoint: "/api/tools/base64/decode",
        testFields: [
          { name: "query", label: "Base64 to decode", type: "text", placeholder: "SGVsbG8gV29ybGQh", required: true }
        ]
      },
      {
        id: "tools-binary-encode",
        method: "GET",
        title: "Binary Encode",
        description: "Encode text to binary",
        endpoint: "/api/tools/binary/encode",
        testFields: [
          { name: "query", label: "Text to encode", type: "text", placeholder: "Hello", required: true }
        ]
      },
      {
        id: "tools-binary-decode",
        method: "GET",
        title: "Binary Decode",
        description: "Decode binary to text",
        endpoint: "/api/tools/binary/decode",
        testFields: [
          { name: "query", label: "Binary to decode", type: "text", placeholder: "01001000 01100101 01101100 01101100 01101111", required: true }
        ]
      },
      {
        id: "tools-js-obfuscate",
        method: "POST",
        title: "JavaScript Obfuscator",
        description: "Obfuscate JavaScript code",
        endpoint: "/api/tools/js/obfuscate",
        testFields: [
          { name: "query", label: "JavaScript code", type: "text", placeholder: "console.log('Hello World!');", required: true }
        ]
      },
      {
        id: "tools-hash-md5",
        method: "GET",
        title: "MD5 Hash Generator",
        description: "Generate MD5 hash",
        endpoint: "/api/tools/hash/md5",
        testFields: [
          { name: "query", label: "Text to hash", type: "text", placeholder: "Hello World!", required: true }
        ]
      },
      {
        id: "tools-hash-sha256",
        method: "GET",
        title: "SHA256 Hash Generator",
        description: "Generate SHA256 hash",
        endpoint: "/api/tools/hash/sha256",
        testFields: [
          { name: "query", label: "Text to hash", type: "text", placeholder: "Hello World!", required: true }
        ]
      }
    ]
  },
  {
    id: "scraper-utilities",
    title: "🕷️ Web Scraper Tools",
    description: "Website scraping utilities for extracting content, images, and links",
    icon: "🕷️",
    endpoints: [
      {
        id: "scraper-webpage",
        method: "POST",
        title: "Scrape Webpage",
        description: "Extract content from web pages",
        endpoint: "/api/scraper/webpage",
        testFields: [
          { name: "url", label: "Website URL", type: "text", placeholder: "https://example.com", required: true },
          { name: "selector", label: "CSS Selector (optional)", type: "text", placeholder: ".content" }
        ]
      },
      {
        id: "scraper-images",
        method: "POST",
        title: "Extract Images",
        description: "Extract all images from a webpage",
        endpoint: "/api/scraper/images",
        testFields: [
          { name: "url", label: "Website URL", type: "text", placeholder: "https://example.com", required: true }
        ]
      },
      {
        id: "scraper-links",
        method: "POST",
        title: "Extract Links",
        description: "Extract all links from a webpage",
        endpoint: "/api/scraper/links",
        testFields: [
          { name: "url", label: "Website URL", type: "text", placeholder: "https://example.com", required: true }
        ]
      },
      {
        id: "scraper-page-info",
        method: "POST",
        title: "Get Page Information",
        description: "Get metadata and information about a webpage",
        endpoint: "/api/scraper/page-info",
        testFields: [
          { name: "url", label: "Website URL", type: "text", placeholder: "https://example.com", required: true }
        ]
      }
    ]
  },
  {
    id: "news-information",
    title: "📰 News & Information",
    description: "News, Wikipedia, and information services",
    icon: "📰",
    endpoints: [
      {
        id: "epl-news",
        method: "GET",
        title: "EPL Football News",
        description: "Get English Premier League news and updates",
        endpoint: "/api/epl/news",
        testFields: [
          { name: "limit", label: "News Limit", type: "number", placeholder: "10" },
          { name: "includeLiveMatches", label: "Include Live Matches", type: "text", placeholder: "true" }
        ]
      },
      {
        id: "news-enhanced",
        method: "GET",
        title: "Enhanced News",
        description: "Get enhanced news by category and country",
        endpoint: "/api/news/enhanced",
        testFields: [
          { name: "category", label: "News Category", type: "text", placeholder: "technology" },
          { name: "country", label: "Country", type: "text", placeholder: "us" }
        ]
      },
      {
        id: "wikipedia-search",
        method: "GET",
        title: "Wikipedia Search",
        description: "Search Wikipedia articles",
        endpoint: "/api/wikipedia/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "artificial intelligence", required: true }
        ]
      },
      {
        id: "hackernews",
        method: "GET",
        title: "Hacker News",
        description: "Get Hacker News stories",
        endpoint: "/api/hackernews/:type",
        testFields: [
          { name: "type", label: "Story Type", type: "text", placeholder: "top" }
        ]
      }
    ]
  },
  {
    id: "books-media",
    title: "📚 Books & Media Search",
    description: "Book search, Spotify music, and media discovery services",
    icon: "📚",
    endpoints: [
      {
        id: "books-search",
        method: "GET",
        title: "Book Search",
        description: "Search for books",
        endpoint: "/api/books/search",
        testFields: [
          { name: "search", label: "Book Search", type: "text", placeholder: "harry potter", required: true }
        ]
      },
      {
        id: "spotify-search",
        method: "GET",
        title: "Spotify Search",
        description: "Search music on Spotify",
        endpoint: "/api/spotify/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "rock music", required: true }
        ]
      },
      {
        id: "spotify-recommendations",
        method: "GET",
        title: "Spotify Recommendations",
        description: "Get Spotify music recommendations",
        endpoint: "/api/spotify/recommendations",
        testFields: [
          { name: "seed_genres", label: "Seed Genres", type: "text", placeholder: "rock,pop" }
        ]
      },
      {
        id: "dictionary",
        method: "GET",
        title: "Dictionary Lookup",
        description: "Look up word definitions",
        endpoint: "/api/dictionary/:word",
        testFields: [
          { name: "word", label: "Word to look up", type: "text", placeholder: "awesome", required: true }
        ]
      }
    ]
  },
  {
    id: "file-storage",
    title: "💾 File Storage & Images",
    description: "Image hosting, file storage, and media management services",
    icon: "💾",
    endpoints: [
      {
        id: "imgur-upload",
        method: "POST",
        title: "Image Upload",
        description: "Upload images to free hosting service",
        endpoint: "/api/imgur/upload",
        testFields: [
          { name: "image", label: "Image File", type: "file", placeholder: "Upload image file", required: true },
          { name: "title", label: "Image Title", type: "text", placeholder: "My Image" },
          { name: "description", label: "Description", type: "text", placeholder: "Image description" }
        ]
      },
      {
        id: "imgur-search",
        method: "GET",
        title: "Image Search",
        description: "Search uploaded images",
        endpoint: "/api/imgur/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "nature", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" },
          { name: "limit", label: "Limit", type: "number", placeholder: "20" }
        ]
      },
      {
        id: "imgur-gallery",
        method: "GET",
        title: "Image Gallery",
        description: "Get image gallery",
        endpoint: "/api/imgur/gallery",
        testFields: [
          { name: "page", label: "Page", type: "number", placeholder: "1" },
          { name: "limit", label: "Limit", type: "number", placeholder: "20" }
        ]
      },
      {
        id: "image-collections",
        method: "GET",
        title: "Image Collections",
        description: "Get curated image collections",
        endpoint: "/api/collections/images",
        testFields: [
          { name: "category", label: "Category", type: "text", placeholder: "wallpapers" }
        ]
      },
      {
        id: "stories-anime",
        method: "GET",
        title: "Anime Stories",
        description: "Get random anime stories",
        endpoint: "/api/stories/anime",
        testFields: []
      }
    ]
  },
  {
    id: "app-downloads",
    title: "📱 App Downloads",
    description: "Mobile app downloads and information services",
    icon: "📱",
    endpoints: [
      {
        id: "app-android",
        method: "GET",
        title: "Android App Download",
        description: "Get Android app download information",
        endpoint: "/api/app/android",
        testFields: [
          { name: "appName", label: "App Name", type: "text", placeholder: "whatsapp", required: true }
        ]
      },
      {
        id: "app-ios",
        method: "GET",
        title: "iOS App Information",
        description: "Get iOS app information",
        endpoint: "/api/app/ios",
        testFields: [
          { name: "appName", label: "App Name", type: "text", placeholder: "whatsapp", required: true }
        ]
      },
      {
        id: "app-github",
        method: "GET",
        title: "GitHub App Download",
        description: "Download apps from GitHub repositories",
        endpoint: "/api/app/github",
        testFields: [
          { name: "repoUrl", label: "Repository URL", type: "text", placeholder: "https://github.com/user/repo", required: true },
          { name: "assetName", label: "Asset Name", type: "text", placeholder: "app.apk" }
        ]
      },
      {
        id: "app-windows",
        method: "GET",
        title: "Windows App Download",
        description: "Get Windows app download information",
        endpoint: "/api/app/windows",
        testFields: [
          { name: "appName", label: "App Name", type: "text", placeholder: "discord", required: true }
        ]
      },
      {
        id: "app-mac",
        method: "GET",
        title: "Mac App Download",
        description: "Get Mac app download information",
        endpoint: "/api/app/mac",
        testFields: [
          { name: "appName", label: "App Name", type: "text", placeholder: "discord", required: true }
        ]
      },
      {
        id: "app-popular",
        method: "GET",
        title: "Popular Apps",
        description: "Get popular apps by platform and category",
        endpoint: "/api/app/popular",
        testFields: [
          { name: "platform", label: "Platform", type: "text", placeholder: "android" },
          { name: "category", label: "Category", type: "text", placeholder: "social" }
        ]
      },
      {
        id: "app-status",
        method: "GET",
        title: "App Download Service Status",
        description: "Get app download service status",
        endpoint: "/api/app/status",
        testFields: []
      }
    ]
  },
  {
    id: "all-downloader",
    title: "⬇️ Universal Downloader",
    description: "Universal media downloader for multiple platforms",
    icon: "⬇️",
    endpoints: [
      {
        id: "alldownloader-info",
        method: "GET",
        title: "Media Info",
        description: "Get media information from any supported platform",
        endpoint: "/api/alldownloader/info",
        testFields: [
          { name: "url", label: "Media URL", type: "text", placeholder: "https://youtube.com/watch?v=...", required: true }
        ]
      },
      {
        id: "alldownloader-video",
        method: "GET",
        title: "Video Download",
        description: "Download video from any supported platform",
        endpoint: "/api/alldownloader/video",
        testFields: [
          { name: "url", label: "Video URL", type: "text", placeholder: "https://youtube.com/watch?v=...", required: true },
          { name: "quality", label: "Quality", type: "text", placeholder: "720p" }
        ]
      },
      {
        id: "alldownloader-audio",
        method: "GET",
        title: "Audio Download",
        description: "Download audio from any supported platform",
        endpoint: "/api/alldownloader/audio",
        testFields: [
          { name: "url", label: "Video URL", type: "text", placeholder: "https://youtube.com/watch?v=...", required: true }
        ]
      },
      {
        id: "alldownloader-platforms",
        method: "GET",
        title: "Supported Platforms",
        description: "Get list of supported platforms",
        endpoint: "/api/alldownloader/platforms",
        testFields: []
      }
    ]
  },
  {
    id: "video-processing",
    title: "🎥 Video Processing",
    description: "Video extraction, metadata, and processing services",
    icon: "🎥",
    endpoints: [
      {
        id: "video-extract",
        method: "POST",
        title: "Video Info Extraction",
        description: "Extract video information from URLs",
        endpoint: "/api/video/extract",
        testFields: [
          { name: "url", label: "Video URL", type: "text", placeholder: "https://youtube.com/watch?v=...", required: true }
        ]
      },
      {
        id: "video-metadata",
        method: "GET",
        title: "Video Metadata",
        description: "Get video metadata by platform and ID",
        endpoint: "/api/video/metadata/:platform/:videoId",
        testFields: [
          { name: "platform", label: "Platform", type: "text", placeholder: "youtube", required: true },
          { name: "videoId", label: "Video ID", type: "text", placeholder: "dQw4w9WgXcQ", required: true }
        ]
      },
      {
        id: "video-status",
        method: "GET",
        title: "Video Service Status",
        description: "Get video processing service status",
        endpoint: "/api/video/status",
        testFields: []
      }
    ]
  },
  {
    id: "manga-apis",
    title: "📚 Manga APIs",
    description: "Comprehensive manga search, popular titles, latest releases, and detailed manga information",
    icon: "📚",
    endpoints: [
      {
        id: "manga-search",
        method: "GET",
        title: "Manga Search",
        description: "Search manga from MyAnimeList with detailed information",
        endpoint: "/api/manga/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "attack on titan", required: true },
          { name: "page", label: "Page", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "manga-popular",
        method: "GET",
        title: "Popular Manga",
        description: "Get top-rated popular manga from MyAnimeList",
        endpoint: "/api/manga/popular",
        testFields: [
          { name: "page", label: "Page", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "manga-latest",
        method: "GET",
        title: "Latest Manga",
        description: "Get recently updated manga releases",
        endpoint: "/api/manga/latest",
        testFields: [
          { name: "page", label: "Page", type: "number", placeholder: "1" }
        ]
      },
      {
        id: "manga-info",
        method: "GET",
        title: "Manga Information",
        description: "Get detailed information about specific manga",
        endpoint: "/api/manga/info",
        testFields: [
          { name: "url", label: "MyAnimeList URL or ID", type: "text", placeholder: "https://myanimelist.net/manga/23390/Shingeki_no_Kyojin", required: true }
        ]
      }
    ]
  },
  {
    id: "pinterest-apis",
    title: "📌 Pinterest APIs",
    description: "Pinterest content search, pins, boards, and user profile services",
    icon: "📌",
    endpoints: [
      {
        id: "pinterest-search",
        method: "GET",
        title: "Pinterest Image Search",
        description: "Search Pinterest images by query",
        endpoint: "/api/pinterest",
        testFields: [
          { name: "text", label: "Search Query", type: "text", placeholder: "nature photography", required: true }
        ]
      },
      {
        id: "pinterest-search-enhanced",
        method: "GET",
        title: "Enhanced Pinterest Search",
        description: "Advanced Pinterest pin search with metadata",
        endpoint: "/api/pinterest/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "home decor ideas", required: true },
          { name: "limit", label: "Limit", type: "number", placeholder: "25" }
        ]
      },
      {
        id: "pinterest-user-boards",
        method: "GET",
        title: "User Boards",
        description: "Get user's Pinterest boards",
        endpoint: "/api/pinterest/user/:username/boards",
        testFields: [
          { name: "username", label: "Pinterest Username", type: "text", placeholder: "pinterest", required: true }
        ]
      },
      {
        id: "pinterest-user-profile",
        method: "GET",
        title: "User Profile",
        description: "Get Pinterest user profile information",
        endpoint: "/api/pinterest/user/:username",
        testFields: [
          { name: "username", label: "Pinterest Username", type: "text", placeholder: "pinterest", required: true }
        ]
      },
      {
        id: "pinterest-board-pins",
        method: "GET",
        title: "Board Pins",
        description: "Get pins from specific Pinterest board",
        endpoint: "/api/pinterest/board/:boardId/pins",
        testFields: [
          { name: "boardId", label: "Board ID", type: "text", placeholder: "board123", required: true },
          { name: "limit", label: "Limit", type: "number", placeholder: "25" }
        ]
      },
      {
        id: "pinterest-trending",
        method: "GET",
        title: "Trending Pins",
        description: "Get trending Pinterest pins by category",
        endpoint: "/api/pinterest/trending",
        testFields: [
          { name: "category", label: "Category (optional)", type: "text", placeholder: "design" },
          { name: "limit", label: "Limit", type: "number", placeholder: "25" }
        ]
      }
    ]
  },
  {
    id: "pollination-ai",
    title: "🤖 Pollination AI",
    description: "Free generative AI services - text, image, and audio generation with multiple models",
    icon: "🤖",
    endpoints: [
      {
        id: "pollination-image-generate",
        method: "GET",
        title: "AI Image Generation",
        description: "Generate images using Pollination AI with various models (flux, kontext, turbo)",
        endpoint: "/api/pollinations/image/generate",
        testFields: [
          { name: "prompt", label: "Image Prompt", type: "text", placeholder: "a beautiful sunset over mountains", required: true },
          { name: "model", label: "Model", type: "text", placeholder: "flux" },
          { name: "width", label: "Width", type: "number", placeholder: "1024" },
          { name: "height", label: "Height", type: "number", placeholder: "1024" },
          { name: "seed", label: "Seed (optional)", type: "number", placeholder: "42" }
        ]
      },
      {
        id: "pollination-text-generate",
        method: "GET",
        title: "AI Text Generation",
        description: "Generate text using Pollination AI with models like OpenAI, Claude, Mistral",
        endpoint: "/api/pollinations/text/generate",
        testFields: [
          { name: "prompt", label: "Text Prompt", type: "text", placeholder: "Write a short story about space exploration", required: true },
          { name: "model", label: "Model", type: "text", placeholder: "openai" },
          { name: "temperature", label: "Temperature", type: "number", placeholder: "0.7" },
          { name: "max_tokens", label: "Max Tokens", type: "number", placeholder: "150" }
        ]
      },
      {
        id: "pollination-audio-generate",
        method: "GET",
        title: "AI Audio/TTS Generation",
        description: "Generate speech from text with different voices (alloy, echo, fable, onyx, nova, shimmer)",
        endpoint: "/api/pollinations/audio/generate",
        testFields: [
          { name: "text", label: "Text to Speech", type: "text", placeholder: "Hello, this is AI-generated speech!", required: true },
          { name: "voice", label: "Voice", type: "text", placeholder: "nova" },
          { name: "speed", label: "Speed", type: "number", placeholder: "1.0" }
        ]
      },
      {
        id: "pollination-image-to-image",
        method: "GET",
        title: "AI Image-to-Image",
        description: "Transform images with AI using kontext model",
        endpoint: "/api/pollinations/image/transform",
        testFields: [
          { name: "prompt", label: "Transformation Prompt", type: "text", placeholder: "turn this into a painting", required: true },
          { name: "imageUrl", label: "Input Image URL", type: "text", placeholder: "https://example.com/image.jpg", required: true },
          { name: "model", label: "Model", type: "text", placeholder: "kontext" }
        ]
      },
      {
        id: "pollination-search-ai",
        method: "GET",
        title: "AI Web Search",
        description: "Search the web using Pollination AI with elixposearch model",
        endpoint: "/api/pollinations/search",
        testFields: [
          { name: "query", label: "Search Query", type: "text", placeholder: "latest AI developments 2025", required: true },
          { name: "model", label: "Model", type: "text", placeholder: "elixposearch" }
        ]
      },
      {
        id: "pollination-models",
        method: "GET",
        title: "Available AI Models",
        description: "Get list of available Pollination AI models for different tasks",
        endpoint: "/api/pollinations/models",
        testFields: []
      }
    ]
  }
];