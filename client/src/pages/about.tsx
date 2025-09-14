import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code, 
  Home, 
  BookOpen, 
  Zap, 
  Shield, 
  Globe,
  Copy,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Download,
  Search,
  Bot,
  Image,
  MessageSquare,
  TrendingUp,
  Play,
  Youtube,
  Instagram,
  Github
} from 'lucide-react';

export default function AboutPage() {
  const [copiedCode, setCopiedCode] = useState<string>('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const CodeBlock = ({ children, language = 'javascript', id }: { children: string; language?: string; id: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={() => copyToClipboard(children, id)}
      >
        {copiedCode === id ? (
          <CheckCircle className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  const apiCategories = [
    {
      title: "Social Media Downloaders",
      icon: <Download className="h-6 w-6" />,
      description: "Download content from major social platforms",
      color: "from-pink-500 to-red-500",
      endpoints: [
        "TikTok Video Download",
        "Instagram Post/Story/Reel Download", 
        "YouTube Video/Audio Download",
        "Pinterest Image Search",
        "Twitter/X Media Download"
      ]
    },
    {
      title: "All Downloader (yt-dlp)",
      icon: <Globe className="h-6 w-6" />,
      description: "Universal downloader supporting 1000+ platforms",
      color: "from-blue-500 to-purple-500",
      endpoints: [
        "Multi-platform Video Download",
        "Audio Extraction",
        "Media Information Retrieval",
        "Quality Selection",
        "Playlist Support"
      ]
    },
    {
      title: "Anime Enhanced",
      icon: <Play className="h-6 w-6" />,
      description: "Advanced anime discovery and torrents",
      color: "from-orange-500 to-red-500",
      endpoints: [
        "Nyaa Torrent Search",
        "Batch Season Downloads",
        "AniList Enhanced Metadata",
        "Anime Schedule & Trending",
        "Progress Tracking"
      ]
    },
    {
      title: "AI Services",
      icon: <Bot className="h-6 w-6" />,
      description: "Powerful AI tools and chat services",
      color: "from-green-500 to-teal-500",
      endpoints: [
        "Grok AI Chat",
        "Text Translation",
        "Sentiment Analysis",
        "Text Summarization",
        "Content Generation"
      ]
    },
    {
      title: "Media & Images",
      icon: <Image className="h-6 w-6" />,
      description: "High-quality images and media services",
      color: "from-purple-500 to-pink-500",
      endpoints: [
        "Unsplash Stock Photos",
        "Pexels Integration",
        "Random Images",
        "Waifu Pictures",
        "Image Search"
      ]
    },
    {
      title: "Utilities & Tools",
      icon: <Zap className="h-6 w-6" />,
      description: "Developer tools and utilities",
      color: "from-indigo-500 to-blue-500",
      endpoints: [
        "QR Code Generation",
        "URL Shortening",
        "Password Generation",
        "Text-to-Speech",
        "Weather & News"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              🚀 BrokenVZN API Documentation
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Our API Platform
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              A comprehensive REST API system with 80+ endpoints across 12 categories. 
              Built for developers who need reliable, fast, and feature-rich services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Try API Playground
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">API Categories</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Introduction</span>
                </CardTitle>
                <CardDescription>
                  Welcome to the BrokenVZN API - Your comprehensive REST API platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  The BrokenVZN API provides a comprehensive suite of services including social media content downloading, 
                  anime and manga search, YouTube scraping, AI services, and various utility tools. Our API is designed 
                  for developers who need reliable, fast, and feature-rich endpoints.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Base URL</h4>
                    <CodeBlock id="base-url">
                      {`https://your-domain.replit.app/api`}
                    </CodeBlock>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Response Format</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">JSON</Badge>
                      <Badge variant="outline">Always includes creator: "@BrokenVZN"</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>Secure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    API key authentication with tiered rate limiting for different user levels.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    <span>Fast</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Optimized endpoints with caching and efficient data processing for quick responses.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-purple-500" />
                    <span>Comprehensive</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    80+ endpoints across 12 categories covering all your development needs.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Creator Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Code className="h-16 w-16 text-white" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-2xl font-bold mb-2">Created by Akewushola Abdulbakri</h3>
                    <p className="text-lg text-purple-600 dark:text-purple-400 mb-3">@BrokenVZN</p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      A passionate developer focused on AI, chatbots, and coding. I love working on projects related to 
                      website creation, bots, AI-driven solutions, and open-source technologies.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      <a href="https://github.com/neaterry6" target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline" className="hover:bg-purple-100">
                          <Github className="w-3 h-3 mr-1" />
                          GitHub
                        </Badge>
                      </a>
                      <a href="https://www.youtube.com/@brokenvzn" target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline" className="hover:bg-red-100">
                          <Youtube className="w-3 h-3 mr-1" />
                          YouTube
                        </Badge>
                      </a>
                      <a href="https://www.instagram.com/brokenvzn" target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline" className="hover:bg-pink-100">
                          <Instagram className="w-3 h-3 mr-1" />
                          Instagram
                        </Badge>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apiCategories.map((category, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${category.color} text-white`}>
                    <CardTitle className="flex items-center space-x-2">
                      {category.icon}
                      <span>{category.title}</span>
                    </CardTitle>
                    <CardDescription className="text-white/90">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {category.endpoints.map((endpoint, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></span>
                          {endpoint}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-6 w-6" />
                  <span>Authentication</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Most endpoints require an API key for authentication. Include your API key in the request headers.
                </p>
                <CodeBlock id="auth-example">
{`curl -H "X-API-Key: your-api-key" \\
  https://your-domain.replit.app/api/endpoint`}
                </CodeBlock>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Rate Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Free Tier</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">1,000</div>
                        <div className="text-sm text-gray-500">requests/month</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Pro Tier</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">100,000</div>
                        <div className="text-sm text-gray-500">requests/month</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Enterprise</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">Unlimited</div>
                        <div className="text-sm text-gray-500">custom limits</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div className="space-y-6">
              {/* YouTube DLP Example */}
              <Card>
                <CardHeader>
                  <CardTitle>YouTube DLP API Examples</CardTitle>
                  <CardDescription>Enhanced YouTube downloading with yt-dlp</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Search Videos</h4>
                    <CodeBlock id="youtube-search">
{`GET /api/youtube-dlp/search?q=music&maxResults=10

Response:
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "dQw4w9WgXcQ",
        "title": "Rick Astley - Never Gonna Give You Up",
        "duration": "3:33",
        "thumbnail": "https://...",
        "uploader": "Rick Astley"
      }
    ]
  },
  "creator": "@BrokenVZN"
}`}
                    </CodeBlock>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Download Video</h4>
                    <CodeBlock id="youtube-video">
{`GET /api/youtube-dlp/video?id=dQw4w9WgXcQ&quality=720p

Response:
{
  "success": true,
  "data": {
    "title": "Rick Astley - Never Gonna Give You Up",
    "formats": [
      {
        "quality": "720p",
        "url": "https://download-url...",
        "filesize": "15.2MB"
      }
    ]
  },
  "creator": "@BrokenVZN"
}`}
                    </CodeBlock>
                  </div>
                </CardContent>
              </Card>

              {/* Anime Enhanced Example */}
              <Card>
                <CardHeader>
                  <CardTitle>Anime Enhanced API</CardTitle>
                  <CardDescription>Advanced anime discovery and torrents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Search Torrents</h4>
                    <CodeBlock id="anime-torrents">
{`GET /api/anime-enhanced/torrents?query=Attack on Titan&sort=seeders

Response:
{
  "success": true,
  "data": {
    "torrents": [
      {
        "title": "[SubsPlease] Attack on Titan - 01 [1080p]",
        "size": "1.2GB",
        "seeders": 150,
        "leechers": 5,
        "magnet": "magnet:?xt=urn:btih...",
        "trusted": true
      }
    ]
  },
  "creator": "@BrokenVZN"
}`}
                    </CodeBlock>
                  </div>
                </CardContent>
              </Card>

              {/* All Downloader Example */}
              <Card>
                <CardHeader>
                  <CardTitle>All Downloader API</CardTitle>
                  <CardDescription>Universal downloader for 1000+ platforms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Download from Any Platform</h4>
                    <CodeBlock id="alldownloader-example">
{`GET /api/alldownloader/video?url=https://www.tiktok.com/@user/video/123

Response:
{
  "success": true,
  "data": {
    "title": "Amazing TikTok Video",
    "platform": "TikTok",
    "formats": [
      {
        "quality": "720p",
        "url": "https://download-url...",
        "format": "mp4"
      }
    ],
    "thumbnail": "https://..."
  },
  "creator": "@BrokenVZN"
}`}
                    </CodeBlock>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to start building?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Try our interactive API playground to test endpoints and see responses in real-time. 
              All endpoints are documented with examples and ready to use.
            </p>
            <Link href="/docs">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ArrowRight className="mr-2 h-5 w-5" />
                Open API Playground
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}