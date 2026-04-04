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
  ArrowRight
} from 'lucide-react';

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string>('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const CodeBlock = ({ children, language = 'javascript', id }: { children: string; language?: string; id: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/landing">
                <div className="flex items-center space-x-2">
                  <Code className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-bold">BrokenVZN API</span>
                </div>
              </Link>
              <div className="text-gray-400">|</div>
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Documentation</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/landing">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/">
                <Button size="sm">
                  <Code className="mr-2 h-4 w-4" />
                  API Playground
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documentation</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[70vh]">
                    <nav className="space-y-2 p-4">
                      {[
                        { id: 'introduction', label: 'Introduction', icon: <BookOpen className="h-4 w-4" /> },
                        { id: 'authentication', label: 'Authentication', icon: <Shield className="h-4 w-4" /> },
                        { id: 'rate-limits', label: 'Rate Limits', icon: <Zap className="h-4 w-4" /> },
                        { id: 'endpoints', label: 'API Endpoints', icon: <Globe className="h-4 w-4" /> },
                        { id: 'social-media', label: 'Social Media APIs', icon: <Globe className="h-4 w-4" /> },
                        { id: 'anime-manga', label: 'Anime & Manga', icon: <Globe className="h-4 w-4" /> },
                        { id: 'youtube-scraper', label: 'YouTube Scraper', icon: <Globe className="h-4 w-4" /> },
                        { id: 'ai-services', label: 'AI Services', icon: <Globe className="h-4 w-4" /> },
                        { id: 'utilities', label: 'Utilities', icon: <Globe className="h-4 w-4" /> },
                        { id: 'examples', label: 'Code Examples', icon: <Code className="h-4 w-4" /> },
                        { id: 'errors', label: 'Error Handling', icon: <Shield className="h-4 w-4" /> }
                      ].map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </a>
                      ))}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Introduction */}
              <section id="introduction">
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
                          {`https://your-domain.com/api`}
                        </CodeBlock>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Response Format</h4>
                        <Badge variant="outline">JSON</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Rest of documentation content */}
              <section id="authentication">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-6 w-6" />
                      <span>Authentication</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                      All public endpoints can be called directly now — no API key header is required.
                    </p>
                    <CodeBlock id="auth-example">
{`curl https://your-domain.com/api/endpoint`}
                    </CodeBlock>
                  </CardContent>
                </Card>
              </section>

              {/* YouTube Scraper */}
              <section id="youtube-scraper">
                <Card>
                  <CardHeader>
                    <CardTitle>YouTube Scraper API</CardTitle>
                    <CardDescription>Advanced YouTube scraping with download capabilities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Search Videos</h4>
                      <CodeBlock id="youtube-search">
{`GET /api/youtube-scraper/search?query=music&maxResults=10

Response:
{
  "success": true,
  "data": [
    {
      "title": "Music Video Title",
      "author": "Channel Name",
      "duration": "3:45",
      "views": "1,234,567",
      "thumbnail": "https://...",
      "url": "https://youtube.com/watch?v=..."
    }
  ],
  "creator": "@BrokenVZN"
}`}
                      </CodeBlock>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Anime & Manga */}
              <section id="anime-manga">
                <Card>
                  <CardHeader>
                    <CardTitle>Anime & Manga APIs</CardTitle>
                    <CardDescription>Comprehensive anime and manga database</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Search Manga</h4>
                      <CodeBlock id="manga-search">
{`GET /api/manga/search?query=One Piece&page=1

Response:
{
  "success": true,
  "data": [
    {
      "title": "One Piece",
      "url": "https://mangafire.to/manga/one-piece",
      "thumbnail": "https://...",
      "status": "Ongoing"
    }
  ]
}`}
                      </CodeBlock>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">Ready to start building?</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Try our interactive API playground to test endpoints and see responses in real-time.
                  </p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Open API Playground
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
