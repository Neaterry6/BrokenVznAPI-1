import axios from 'axios';
import * as crypto from 'crypto';

export interface VideoInfo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration?: string;
  views?: number;
  description?: string;
  streamingUrls?: StreamingUrl[];
  downloadUrl?: string;
  quality?: string;
  tags?: string[];
}

export interface StreamingUrl {
  quality: string;
  url: string;
  width?: number;
  height?: number;
  size_mbs?: number;
}

export interface VideoDownloaderResult {
  success: boolean;
  data?: {
    video?: VideoInfo;
    videos?: VideoInfo[];
    downloadUrl?: string;
    message?: string;
  };
  error?: string;
  creator: string;
}

export class VideoDownloaderService {
  private creator = '@BrokenVZN';
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  // IMPORTANT LEGAL DISCLAIMER
  private getLegalDisclaimer(): string {
    return `
    ⚠️ LEGAL DISCLAIMER ⚠️
    This service is intended for legitimate, copyright-free content only.
    Users are responsible for ensuring they have proper rights to download content.
    Downloading copyrighted material without permission may violate terms of service and copyright laws.
    `;
  }

  // Generic video URL extractor (for legitimate platforms)
  async extractVideoInfo(url: string): Promise<VideoDownloaderResult> {
    try {
      if (!url || typeof url !== 'string') {
        return {
          success: false,
          error: 'Valid URL is required',
          creator: this.creator
        };
      }

      // Sanitize and validate URL
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const ip = urlObj.hostname;

      // Block private/internal networks to prevent SSRF
      const privateIPPatterns = [
        /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./,
        /^169\.254\./, /^::1$/, /^fc00:/, /^fe80:/
      ];

      if (privateIPPatterns.some(pattern => pattern.test(ip)) || 
          ['localhost', '0.0.0.0'].includes(hostname)) {
        return {
          success: false,
          error: 'Access to private/internal networks is not allowed for security reasons.',
          creator: this.creator
        };
      }

      // Strict allowlist of legitimate platforms only
      const allowedDomains = [
        'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com',
        'archive.org', 'ted.com', 'coursera.org', 'edx.org', 'khanacademy.org',
        'bbc.com', 'cnn.com', 'reuters.com', 'npr.org'
      ];

      const isAllowed = allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );

      if (!isAllowed) {
        return {
          success: false,
          error: `Domain '${hostname}' is not supported. Only legitimate platforms are allowed: ${allowedDomains.join(', ')}`,
          creator: this.creator
        };
      }

      // For legitimate platforms, try to extract basic metadata
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 10000,
        maxRedirects: 5
      });

      const html = response.data;
      
      // Basic metadata extraction
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Unknown Title';

      const videoInfo: VideoInfo = {
        id: crypto.randomBytes(8).toString('hex'),
        title: title,
        url: url,
        thumbnail: this.extractThumbnail(html),
        description: this.extractDescription(html),
        tags: this.extractTags(html)
      };

      return {
        success: true,
        data: {
          video: videoInfo,
          message: `Video info extracted. ${this.getLegalDisclaimer()}`
        },
        creator: this.creator
      };

    } catch (error) {
      console.error('Video extraction error:', error);
      return {
        success: false,
        error: `Failed to extract video info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        creator: this.creator
      };
    }
  }

  // Extract video metadata for supported platforms
  async getVideoMetadata(platform: string, videoId: string): Promise<VideoDownloaderResult> {
    try {
      switch (platform.toLowerCase()) {
        case 'youtube':
          return this.getYouTubeMetadata(videoId);
        case 'vimeo':
          return this.getVimeoMetadata(videoId);
        default:
          return {
            success: false,
            error: `Platform '${platform}' is not supported. Supported platforms: YouTube, Vimeo`,
            creator: this.creator
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        creator: this.creator
      };
    }
  }

  // YouTube metadata extraction (public content only)
  private async getYouTubeMetadata(videoId: string): Promise<VideoDownloaderResult> {
    try {
      // Note: This is a simplified implementation
      // In production, you'd use YouTube Data API v3 with proper API key
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      return {
        success: true,
        data: {
          video: {
            id: videoId,
            title: 'YouTube Video (API Key Required for Full Details)',
            url: videoUrl,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            description: 'To get full video metadata, configure YouTube Data API v3 key'
          },
          message: this.getLegalDisclaimer()
        },
        creator: this.creator
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get YouTube metadata',
        creator: this.creator
      };
    }
  }

  // Vimeo metadata extraction
  private async getVimeoMetadata(videoId: string): Promise<VideoDownloaderResult> {
    try {
      const response = await axios.get(`https://vimeo.com/api/v2/video/${videoId}.json`, {
        timeout: 10000
      });

      const videoData = response.data[0];
      
      const videoInfo: VideoInfo = {
        id: videoData.id.toString(),
        title: videoData.title,
        url: videoData.url,
        thumbnail: videoData.thumbnail_large,
        duration: this.formatDuration(videoData.duration),
        views: videoData.stats_number_of_plays,
        description: videoData.description,
        tags: videoData.tags ? videoData.tags.split(', ') : []
      };

      return {
        success: true,
        data: {
          video: videoInfo,
          message: this.getLegalDisclaimer()
        },
        creator: this.creator
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get Vimeo metadata',
        creator: this.creator
      };
    }
  }

  // Helper methods
  private extractThumbnail(html: string): string {
    const patterns = [
      /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i,
      /<link[^>]*rel="image_src"[^>]*href="([^"]+)"/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return '';
  }

  private extractDescription(html: string): string {
    const patterns = [
      /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="twitter:description"[^>]*content="([^"]+)"/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return '';
  }

  private extractTags(html: string): string[] {
    const keywordsMatch = html.match(/<meta[^>]*name="keywords"[^>]*content="([^"]+)"/i);
    if (keywordsMatch && keywordsMatch[1]) {
      return keywordsMatch[1].split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return [];
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  // Get service status
  getStatus() {
    return {
      service: 'Video Downloader API',
      version: '1.0.0',
      status: 'operational',
      supportedPlatforms: ['YouTube (with API key)', 'Vimeo', 'Generic URL extraction'],
      features: [
        'Video Metadata Extraction',
        'Thumbnail Extraction',
        'Basic Video Info',
        'Legal Content Only'
      ],
      disclaimer: this.getLegalDisclaimer(),
      creator: this.creator
    };
  }
}

export const videoDownloaderService = new VideoDownloaderService();