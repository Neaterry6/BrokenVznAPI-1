import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Copy, CheckCircle2 } from "lucide-react";
import { apiCategories } from "../data/api-categories";
import { useToast } from "@/hooks/use-toast";
export default function Home() {
    const [backgroundImage, setBackgroundImage] = useState('');
    const { toast } = useToast();
    const quickEndpoints = [
        "/api/status",
        "/api/youtube-dlp/search?q=lofi&maxResults=5",
        "/api/pollinations/image/generate?prompt=cyberpunk+city",
        "/api/waifu/enhanced/random?type=sfw",
    ];
    const copyEndpoint = async (endpoint) => {
        const absolute = `${window.location.origin}${endpoint}`;
        await navigator.clipboard.writeText(absolute);
        toast({ title: "Copied", description: "API URL copied to clipboard." });
    };
    // Fetch anime background images
    useEffect(() => {
        const fetchAnimeBackground = async () => {
            try {
                // Use enhanced waifu API for better reliability
                const response = await fetch('/api/waifu/enhanced/random?type=sfw');
                const data = await response.json();
                if (data.success && data.data?.url) {
                    setBackgroundImage(data.data.url);
                }
            }
            catch (error) {
                console.error('Failed to fetch anime background:', error);
                // Fallback to original API
                try {
                    const fallbackResponse = await fetch('/api/waifu/sfw/waifu');
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData.success && fallbackData.data?.url) {
                        setBackgroundImage(fallbackData.data.url);
                    }
                }
                catch (fallbackError) {
                    console.error('Fallback anime background also failed:', fallbackError);
                }
            }
        };
        // Fetch initial background
        fetchAnimeBackground();
        // Change background every 20 seconds
        const interval = setInterval(fetchAnimeBackground, 20000);
        return () => clearInterval(interval);
    }, []);
    const stats = {
        endpoints: "150+",
        uptime: "99.9%",
        requests: "Tiered",
        developers: "1000+"
    };
    return (_jsxs("div", { className: "min-h-screen bg-background relative overflow-hidden", style: backgroundImage ? {
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        } : {}, children: [backgroundImage && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/80 backdrop-blur-[0.5px]" })), _jsx("section", { className: "border-b border-purple-500/20 bg-transparent relative z-10 backdrop-blur-[1px]", children: _jsx("div", { className: "container mx-auto px-4 lg:px-8 py-20", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsxs("div", { className: "inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-md border border-emerald-500/30 shadow-lg", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" }), _jsx("span", { className: "font-semibold", children: "\uD83D\uDD25 150+ APIs Online" })] }), _jsx("h1", { className: "text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-6 animate-pulse", "data-testid": "text-hero-title", children: "BrokenVZN APIs" }), _jsxs("p", { className: "text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed", children: ["\uD83D\uDE80 Unified REST APIs with ", _jsx("span", { className: "text-purple-400 font-semibold", children: "real live responses" }), ". YouTube, downloader, apps, AI, and image tools in one modern playground."] }), _jsxs("p", { className: "text-lg text-gray-400 mb-12 max-w-2xl mx-auto", children: ["Created by ", _jsx("span", { className: "font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text", children: "@BrokenVZN" }), "\u2022 Powered by ImgBB, Booru APIs, Gemini AI & Real Services"] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center items-center mb-12", children: [_jsx(Button, { size: "lg", className: "w-full sm:w-auto px-10 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white shadow-2xl shadow-purple-500/25 border border-purple-400/20 backdrop-blur-sm", onClick: () => window.open('/docs', '_blank'), "data-testid": "button-documentation", children: "\u2728 Explore APIs" }), _jsx(Button, { variant: "outline", size: "lg", className: "w-full sm:w-auto px-8 py-3 text-lg font-semibold border-2 hover:bg-primary hover:text-primary-foreground transition-colors", onClick: () => document.getElementById('api-explorer')?.scrollIntoView({ behavior: 'smooth' }), "data-testid": "button-try-api", children: "\uD83D\uDE80 Try APIs Now" })] }), _jsxs("div", { className: "max-w-3xl mx-auto rounded-2xl border border-purple-400/30 bg-black/30 backdrop-blur-md p-4 text-left", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm text-purple-200", children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), _jsx("span", { children: "No API key required. Copy and call any endpoint directly." })] }), _jsx("div", { className: "space-y-2", children: quickEndpoints.map((endpoint) => (_jsxs("div", { className: "flex items-center justify-between gap-2 rounded-md bg-black/30 px-3 py-2", children: [_jsx("code", { className: "text-xs sm:text-sm text-emerald-300 break-all", children: endpoint }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => copyEndpoint(endpoint), children: [_jsx(Copy, { className: "h-3.5 w-3.5 mr-1" }), "Copy URL"] })] }, endpoint))) })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6 mb-12", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-foreground", children: stats.endpoints }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Endpoints" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-foreground", children: stats.uptime }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Uptime" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-foreground", children: stats.requests }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Usage" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-foreground", children: stats.developers }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Developers" })] })] })] }) }) }), _jsx("section", { id: "api-explorer", className: "py-16", children: _jsx("div", { className: "container mx-auto px-4 lg:px-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-foreground mb-4", children: "Complete API Collection" }), _jsx("p", { className: "text-lg sm:text-xl text-muted-foreground", children: "Explore all 150+ endpoints across 20+ categories - click any category to see APIs and test them live" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6", children: apiCategories.map((category) => (_jsx(Link, { href: `/category/${category.id}`, children: _jsxs(Card, { className: "h-full cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg backdrop-blur-md bg-card/80", children: [_jsxs(CardHeader, { className: "pb-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-3xl", children: category.icon }), _jsx(ArrowRight, { className: "h-5 w-5 text-muted-foreground" })] }), _jsx(CardTitle, { className: "text-lg", children: category.title }), _jsx("p", { className: "text-sm text-muted-foreground line-clamp-2", children: category.description })] }), _jsx(CardContent, { className: "pt-0", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Badge, { variant: "secondary", className: "text-xs", children: [category.endpoints.length, " APIs"] }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-xs", children: "Explore \u2192" })] }) })] }) }, category.id))) })] }) }) })] }));
}
