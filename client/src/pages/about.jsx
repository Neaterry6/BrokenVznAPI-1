import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, BookOpen, Zap, Shield, Globe, Copy, CheckCircle, ArrowRight, Download, Bot, Image, Play, Youtube, Instagram, Github } from 'lucide-react';
export default function AboutPage() {
    const [copiedCode, setCopiedCode] = useState('');
    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(''), 2000);
    };
    const CodeBlock = ({ children, language = 'javascript', id }) => (_jsxs("div", { className: "relative", children: [_jsx("pre", { className: "bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm", children: _jsx("code", { children: children }) }), _jsx(Button, { size: "sm", variant: "ghost", className: "absolute top-2 right-2 h-8 w-8 p-0", onClick: () => copyToClipboard(children, id), children: copiedCode === id ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-400" })) : (_jsx(Copy, { className: "h-4 w-4" })) })] }));
    const apiCategories = [
        {
            title: "Social Media Downloaders",
            icon: _jsx(Download, { className: "h-6 w-6" }),
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
            icon: _jsx(Globe, { className: "h-6 w-6" }),
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
            icon: _jsx(Play, { className: "h-6 w-6" }),
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
            icon: _jsx(Bot, { className: "h-6 w-6" }),
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
            icon: _jsx(Image, { className: "h-6 w-6" }),
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
            icon: _jsx(Zap, { className: "h-6 w-6" }),
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900", children: [_jsx("div", { className: "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: _jsxs("div", { className: "text-center", children: [_jsx(Badge, { className: "mb-4 bg-white/20 text-white border-white/30", children: "\uD83D\uDE80 BrokenVZN API Documentation" }), _jsx("h1", { className: "text-4xl md:text-6xl font-bold mb-6", children: "About Our API Platform" }), _jsx("p", { className: "text-xl text-white/90 mb-8 max-w-3xl mx-auto", children: "A comprehensive REST API system with 80+ endpoints across 12 categories. Built for developers who need reliable, fast, and feature-rich services." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Link, { href: "/docs", children: _jsxs(Button, { size: "lg", className: "bg-white text-purple-600 hover:bg-gray-100", children: [_jsx(ArrowRight, { className: "mr-2 h-5 w-5" }), "Try API Playground"] }) }), _jsxs(Button, { size: "lg", variant: "outline", className: "text-white border-white hover:bg-white hover:text-purple-600", children: [_jsx(Github, { className: "mr-2 h-5 w-5" }), "View on GitHub"] })] })] }) }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs(Tabs, { defaultValue: "overview", className: "space-y-8", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "categories", children: "API Categories" }), _jsx(TabsTrigger, { value: "authentication", children: "Authentication" }), _jsx(TabsTrigger, { value: "examples", children: "Examples" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-8", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(BookOpen, { className: "h-6 w-6" }), _jsx("span", { children: "Introduction" })] }), _jsx(CardDescription, { children: "Welcome to the BrokenVZN API - Your comprehensive REST API platform" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "The BrokenVZN API provides a comprehensive suite of services including social media content downloading, anime and manga search, YouTube scraping, AI services, and various utility tools. Our API is designed for developers who need reliable, fast, and feature-rich endpoints." }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-semibold", children: "Base URL" }), _jsx(CodeBlock, { id: "base-url", children: `https://your-domain.replit.app/api` })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-semibold", children: "Response Format" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { variant: "outline", children: "JSON" }), _jsx(Badge, { variant: "outline", children: "Always includes creator: \"@BrokenVZN\"" })] })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "border-l-4 border-l-blue-500", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5 text-blue-500" }), _jsx("span", { children: "Secure" })] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "API key authentication with tiered rate limiting for different user levels." }) })] }), _jsxs(Card, { className: "border-l-4 border-l-green-500", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Zap, { className: "h-5 w-5 text-green-500" }), _jsx("span", { children: "Fast" })] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "Optimized endpoints with caching and efficient data processing for quick responses." }) })] }), _jsxs(Card, { className: "border-l-4 border-l-purple-500", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Globe, { className: "h-5 w-5 text-purple-500" }), _jsx("span", { children: "Comprehensive" })] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: "80+ endpoints across 12 categories covering all your development needs." }) })] })] }), _jsx(Card, { className: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20", children: _jsx(CardContent, { className: "p-8", children: _jsxs("div", { className: "flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6", children: [_jsx("div", { className: "w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center", children: _jsx(Code, { className: "h-16 w-16 text-white" }) }), _jsxs("div", { className: "text-center md:text-left flex-1", children: [_jsx("h3", { className: "text-2xl font-bold mb-2", children: "Created by Akewushola Abdulbakri" }), _jsx("p", { className: "text-lg text-purple-600 dark:text-purple-400 mb-3", children: "@BrokenVZN" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 mb-4", children: "A passionate developer focused on AI, chatbots, and coding. I love working on projects related to website creation, bots, AI-driven solutions, and open-source technologies." }), _jsxs("div", { className: "flex flex-wrap justify-center md:justify-start gap-2", children: [_jsx("a", { href: "https://github.com/neaterry6", target: "_blank", rel: "noopener noreferrer", children: _jsxs(Badge, { variant: "outline", className: "hover:bg-purple-100", children: [_jsx(Github, { className: "w-3 h-3 mr-1" }), "GitHub"] }) }), _jsx("a", { href: "https://www.youtube.com/@brokenvzn", target: "_blank", rel: "noopener noreferrer", children: _jsxs(Badge, { variant: "outline", className: "hover:bg-red-100", children: [_jsx(Youtube, { className: "w-3 h-3 mr-1" }), "YouTube"] }) }), _jsx("a", { href: "https://www.instagram.com/brokenvzn", target: "_blank", rel: "noopener noreferrer", children: _jsxs(Badge, { variant: "outline", className: "hover:bg-pink-100", children: [_jsx(Instagram, { className: "w-3 h-3 mr-1" }), "Instagram"] }) })] })] })] }) }) })] }), _jsx(TabsContent, { value: "categories", className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: apiCategories.map((category, index) => (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs(CardHeader, { className: `bg-gradient-to-r ${category.color} text-white`, children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [category.icon, _jsx("span", { children: category.title })] }), _jsx(CardDescription, { className: "text-white/90", children: category.description })] }), _jsx(CardContent, { className: "p-4", children: _jsx("ul", { className: "space-y-2", children: category.endpoints.map((endpoint, i) => (_jsxs("li", { className: "flex items-center text-sm", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3" }), endpoint] }, i))) }) })] }, index))) }) }), _jsx(TabsContent, { value: "authentication", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-6 w-6" }), _jsx("span", { children: "Authentication" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "Endpoints are now public for easier integration. You can call APIs directly without an API key." }), _jsx(CodeBlock, { id: "auth-example", children: `curl https://your-domain.replit.app/api/endpoint` }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold text-lg", children: "Rate Limits" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg", children: "Free Tier" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: "1,000" }), _jsx("div", { className: "text-sm text-gray-500", children: "requests/month" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg", children: "Pro Tier" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: "100,000" }), _jsx("div", { className: "text-sm text-gray-500", children: "requests/month" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-lg", children: "Enterprise" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: "Unlimited" }), _jsx("div", { className: "text-sm text-gray-500", children: "custom limits" })] })] })] })] })] })] }) }), _jsx(TabsContent, { value: "examples", className: "space-y-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "YouTube DLP API Examples" }), _jsx(CardDescription, { children: "Enhanced YouTube downloading with yt-dlp" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Search Videos" }), _jsx(CodeBlock, { id: "youtube-search", children: `GET /api/youtube-dlp/search?q=music&maxResults=10

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
}` })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Download Video" }), _jsx(CodeBlock, { id: "youtube-video", children: `GET /api/youtube-dlp/video?id=dQw4w9WgXcQ&quality=720p

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
}` })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Anime Enhanced API" }), _jsx(CardDescription, { children: "Advanced anime discovery and torrents" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Search Torrents" }), _jsx(CodeBlock, { id: "anime-torrents", children: `GET /api/anime-enhanced/torrents?query=Attack on Titan&sort=seeders

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
}` })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "All Downloader API" }), _jsx(CardDescription, { children: "Universal downloader for 1000+ platforms" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Download from Any Platform" }), _jsx(CodeBlock, { id: "alldownloader-example", children: `GET /api/alldownloader/video?url=https://www.tiktok.com/@user/video/123

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
}` })] }) })] })] }) })] }), _jsx(Card, { className: "mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800", children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx("h3", { className: "text-2xl font-bold mb-4", children: "Ready to start building?" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto", children: "Try our interactive API playground to test endpoints and see responses in real-time. All endpoints are documented with examples and ready to use." }), _jsx(Link, { href: "/docs", children: _jsxs(Button, { size: "lg", className: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700", children: [_jsx(ArrowRight, { className: "mr-2 h-5 w-5" }), "Open API Playground"] }) })] }) })] })] }));
}
