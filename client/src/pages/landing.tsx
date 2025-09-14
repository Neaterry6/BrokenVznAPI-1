import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  Youtube, 
  Instagram, 
  MessageCircle,
  Phone,
  Play,
  Code,
  Zap,
  Shield,
  Globe,
  Star,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BrokenVZN API
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/about">
                <Button variant="ghost">About</Button>
              </Link>
              <Link href="/docs">
                <Button>API Playground</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              🚀 Latest Version 2.0.0
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Comprehensive REST API Platform
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Access 100+ powerful APIs including social media tools, AI services, image collections, games, 
              utilities, and more. Fast, reliable, and easy to use!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Play className="mr-2 h-5 w-5" />
                  Try API Playground
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  <Code className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">API Categories</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover amazing tools and services for social media, games, images, and more
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Play className="h-8 w-8" />,
                title: "Social Media APIs",
                description: "TikTok, Instagram, Twitter, YouTube download and extraction services",
                features: ["Video Downloads", "Profile Data", "Story Access", "Content Extraction"]
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: "AI Services",
                description: "VANEA AI chat, Pollinations image generation, and more",
                features: ["VANEA AI Chat", "Image Generation", "ChatGPT Integration", "Translation"]
              },
              {
                icon: <Code className="h-8 w-8" />,
                title: "Useful Tools", 
                description: "Text encoding, file conversion, and security tools",
                features: ["Base64 Encode/Decode", "Binary Conversion", "JS Obfuscation", "MD5/SHA256"]
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Image Collections",
                description: "Curated anime images, aesthetic photos, and random wallpapers",
                features: ["Waifu Images", "Aesthetic Photos", "Cosplay Collection", "Random Wallpapers"]
              },
              {
                icon: <MessageCircle className="h-8 w-8" />,
                title: "Games & Trivia",
                description: "Coding quizzes, trivia questions, word games, and puzzles",
                features: ["Coding Quiz", "Trivia Questions", "Word Games", "Tebak Gambar"]
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Information APIs",
                description: "Dictionary, Hacker News, Wikipedia, books search, and more",
                features: ["Dictionary API", "Hacker News", "Wikipedia Search", "Book Search"]
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "80+", label: "API Endpoints" },
              { number: "99.9%", label: "Uptime" },
              { number: "10+", label: "Service Categories" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur mx-auto mb-6 flex items-center justify-center">
              <Code className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Meet the Creator</h2>
            <div className="text-xl mb-2">Akewushola Abdulbakri</div>
            <div className="text-lg opacity-90 mb-6">@BrokenVZN</div>
            <p className="text-white/90 max-w-2xl mx-auto mb-8">
              A passionate developer focused on AI, chatbots, and coding. I love working on projects related to 
              website creation, bots, AI-driven solutions, and open-source technologies. Currently enhancing 
              my cognitivePath CBT webapp project.
            </p>
          </div>
          
          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { icon: <Youtube className="h-5 w-5" />, label: "YouTube", href: "https://www.youtube.com/@brokenvzn" },
              { icon: <Instagram className="h-5 w-5" />, label: "Instagram", href: "https://www.instagram.com/brokenvzn" },
              { icon: <MessageCircle className="h-5 w-5" />, label: "Telegram", href: "https://t.me/Heartbreak798453" },
              { icon: <Github className="h-5 w-5" />, label: "GitHub", href: "https://github.com/neaterry6" },
              { icon: <Play className="h-5 w-5" />, label: "TikTok", href: "https://www.tiktok.com/@heisbroken05" },
              { icon: <Phone className="h-5 w-5" />, label: "WhatsApp", href: "https://wa.me/2348148804813" }
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                {social.icon}
                <span>{social.label}</span>
              </a>
            ))}
          </div>

          {/* GitHub Stats */}
          <div className="space-y-4">
            <img 
              src="https://github-readme-stats.vercel.app/api?username=neaterry6&show_icons=true&theme=radical&bg_color=00000000&hide_border=true&text_color=ffffff"
              alt="GitHub Stats"
              className="mx-auto rounded-lg"
            />
            <img 
              src="https://github-readme-streak-stats-salesp07.vercel.app/?user=neaterry6&count_private=true&theme=radical&background=00000000&hide_border=true"
              alt="GitHub Streak"
              className="mx-auto rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers using our APIs to build amazing applications. 
            Start exploring our comprehensive suite of services today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Building Now
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Code className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold">BrokenVZN API</span>
              </div>
              <p className="text-gray-400">
                Comprehensive REST API platform for modern developers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs">API Playground</Link></li>
                <li><Link href="/about">About & Documentation</Link></li>
                <li><a href="/api/status" target="_blank">API Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://github.com/neaterry6" target="_blank">GitHub</a></li>
                <li><a href="https://www.youtube.com/@brokenvzn" target="_blank">YouTube</a></li>
                <li><a href="https://t.me/Heartbreak798453" target="_blank">Telegram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BrokenVZN API. Built with ❤️ by Akewushola Abdulbakri</p>
          </div>
        </div>
      </footer>
    </div>
  );
}