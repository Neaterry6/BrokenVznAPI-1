import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Copy, CheckCircle2 } from "lucide-react";
import { apiCategories } from "../data/api-categories";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const { toast } = useToast();
  const quickEndpoints = [
    "/api/status",
    "/api/youtube-dlp/search?q=lofi&maxResults=5",
    "/api/pollinations/image/generate?prompt=cyberpunk+city",
    "/api/waifu/enhanced/random?type=sfw",
  ];

  const copyEndpoint = async (endpoint: string) => {
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
      } catch (error) {
        console.error('Failed to fetch anime background:', error);
        // Fallback to original API
        try {
          const fallbackResponse = await fetch('/api/waifu/sfw/waifu');
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success && fallbackData.data?.url) {
            setBackgroundImage(fallbackData.data.url);
          }
        } catch (fallbackError) {
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

  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden"
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {/* Anime background overlay */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/80 backdrop-blur-[0.5px]" />
      )}
      
      {/* Hero Section */}
      <section className="border-b border-purple-500/20 bg-transparent relative z-10 backdrop-blur-[1px]">
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-md border border-emerald-500/30 shadow-lg">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></div>
              <span className="font-semibold">🔥 150+ APIs Online</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-6 animate-pulse" data-testid="text-hero-title">
              BrokenVZN APIs
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              🚀 Unified REST APIs with <span className="text-purple-400 font-semibold">real live responses</span>. 
              YouTube, downloader, apps, AI, and image tools in one modern playground.
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Created by <span className="font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">@BrokenVZN</span> 
              • Powered by ImgBB, Booru APIs, Gemini AI & Real Services
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-10 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white shadow-2xl shadow-purple-500/25 border border-purple-400/20 backdrop-blur-sm"
                onClick={() => window.open('/docs', '_blank')}
                data-testid="button-documentation"
              >
                ✨ Explore APIs
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto px-8 py-3 text-lg font-semibold border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => document.getElementById('api-explorer')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-try-api"
              >
                🚀 Try APIs Now
              </Button>
            </div>

            <div className="max-w-3xl mx-auto rounded-2xl border border-purple-400/30 bg-black/30 backdrop-blur-md p-4 text-left">
              <div className="mb-3 flex items-center gap-2 text-sm text-purple-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>No API key required. Copy and call any endpoint directly.</span>
              </div>
              <div className="space-y-2">
                {quickEndpoints.map((endpoint) => (
                  <div key={endpoint} className="flex items-center justify-between gap-2 rounded-md bg-black/30 px-3 py-2">
                    <code className="text-xs sm:text-sm text-emerald-300 break-all">{endpoint}</code>
                    <Button size="sm" variant="outline" onClick={() => copyEndpoint(endpoint)}>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy URL
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.endpoints}</div>
                <div className="text-sm text-muted-foreground">Endpoints</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.uptime}</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.requests}</div>
                <div className="text-sm text-muted-foreground">Usage</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.developers}</div>
                <div className="text-sm text-muted-foreground">Developers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Categories */}
      <section id="api-explorer" className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Complete API Collection</h2>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Explore all 150+ endpoints across 20+ categories - click any category to see APIs and test them live
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {apiCategories.map((category) => (
                <Link key={category.id} href={`/category/${category.id}`}>
                  <Card className="h-full cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg backdrop-blur-md bg-card/80">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{category.icon}</span>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {category.endpoints.length} APIs
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Explore →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
