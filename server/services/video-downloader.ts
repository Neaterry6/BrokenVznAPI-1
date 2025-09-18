import YTDlpWrap from 'yt-dlp-wrap';
import axios from 'axios';

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
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
  private ytDlpWrap: YTDlpWrap;

  constructor() {
    this.ytDlpWrap = new YTDlpWrap();
  }

  // Legal disclaimer
  private getLegalDisclaimer(): string {
    return `
    ⚠️ LEGAL DISCLAIMER ⚠️
    This service is intended for legitimate, copyright-free content only.
    Users are responsible for ensuring they have proper rights to download content.
    Downloading copyrighted material without permission may violate terms of service and copyright laws.
    `;
  }

  // Format duration from seconds to HH:MM:SS or MM:SS
  private formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Get video metadata using yt-dlp
  private async getVideoData(url: string): Promise<VideoInfo | null> {
    try {
      const args = [
        '--quiet',
        '--skip-download',
        '--dump-json',
        url
      ];

      const output = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });
      const data = JSON.parse(output);

      if (!data.id || !data.title) {
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        url: data.webpage_url || url,
        thumbnail: data.thumbnail || '',
        duration: this.formatDuration(data.duration || 0),
        views: data.view_count || 0,
        description: data.description || '',
        tags: data.tags || [],
        downloadUrl: await this.getDownloadUrl(url)
      };
    } catch (error: any) {
      console.error('[yt-dlp error]', error.message);
      return null;
    }
  }

  // Get download URL using yt-dlp
  private async getDownloadUrl(url: string): Promise<string | null> {
    try {
      const args = [
        '--quiet',
        '--get-url',
        '--format', 'best[ext=mp4]/best',
        url
      ];

      const downloadUrl = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });
      return downloadUrl.trim();
    } catch (error: any) {
      console.error('Failed to get download URL:', error.message);
      return null;
    }
  }

  // Extract video info from any supported website
  async extractVideoInfo(url: string): Promise<VideoDownloaderResult> {
    try {
      if (!url || typeof url !== 'string') {
        return {
          success: false,
          error: 'Valid URL is required',
          creator: this.creator
        };
      }

      // Validate URL
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

      // Fetch video metadata using yt-dlp
      const videoInfo = await this.getVideoData(url);
      if (!videoInfo) {
        return {
          success: false,
          error: 'Unable to extract video info. The URL may not be supported or the video is unavailable.',
          creator: this.creator
        };
      }

      return {
        success: true,
        data: {
          video: videoInfo,
          message: `Video info extracted. ${this.getLegalDisclaimer()}`
        },
        creator: this.creator
      };
    } catch (error: any) {
      console.error('Video extraction error:', error.message);
      return {
        success: false,
        error: `Failed to extract video info: ${error.message || 'Unknown error'}`,
        creator: this.creator
      };
    }
  }

  // Get video metadata for specific platforms (backward compatibility)
  async getVideoMetadata(platform: string, videoId: string): Promise<VideoDownloaderResult> {
    try {
      let url: string;
      switch (platform.toLowerCase()) {
        case 'youtube':
          url = `https://www.youtube.com/watch?v=${videoId}`;
          break;
        case 'vimeo':
          url = `https://vimeo.com/${videoId}`;
          break;
        case 'dailymotion':
          url = `https://www.dailymotion.com/video/${videoId}`;
          break;
        default:
          return {
            success: false,
            error: `Platform '${platform}' is not supported. Try using extractVideoInfo with a direct URL.`,
            creator: this.creator
          };
      }

      return await this.extractVideoInfo(url);
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get metadata: ${error.message || 'Unknown error'}`,
        creator: this.creator
      };
    }
  }

  // Get service status
  getStatus() {
    return {
      service: 'Video Downloader API',
      version: '1.1.0',
      status: 'operational',
      supportedPlatforms: 'YouTube, Vimeo, Dailymotion, and 1000+ others via yt-dlp',
      features: [
        'Video Metadata Extraction',
        'Download URL Generation',
        'Universal Platform Support',
        'Legal Content Only'
      ],
      disclaimer: this.getLegalDisclaimer(),
      creator: this.creator
    };
  }
}

export const videoDownloaderService = new VideoDownloaderService();