import YTDlpWrap from 'yt-dlp-wrap';
import fs from 'fs';
import path from 'path';

interface VideoData {
  title: string;
  video_id: string;
  duration: string;
  views: number;
  published: string;
  thumbnail: string;
}

interface KaizYouTubeResponse {
  creator: string;
  status: boolean;
  result?: {
    title: string;
    video_url: string;
    thumbnail: string;
    duration: string;
    views: number;
    published: string;
    download_url: string;
  };
  error?: string;
}

export class KaizYouTubeService {
  private creator = 'broken Vzn';
  private cookiesPath: string | null;
  private ytDlpWrap: YTDlpWrap;

  constructor() {
    this.cookiesPath = this.getCookiesPath();
    this.ytDlpWrap = new YTDlpWrap();
  }

  // Secure cookie management
  private getCookiesPath(): string | null {
    const cookiesEnv = process.env.YOUTUBE_COOKIES_PATH;
    if (cookiesEnv && fs.existsSync(cookiesEnv)) {
      return cookiesEnv;
    }
    const userCookiesPath = path.join(process.cwd(), 'youtube-cookies.txt');
    if (fs.existsSync(userCookiesPath)) {
      return userCookiesPath;
    }
    return null;
  }

  // Format duration from seconds to MM:SS
  private formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Format published date to relative time
  private formatPublishedDate(uploadDate: string): string {
    if (!uploadDate) return 'Unknown';
    const date = new Date(uploadDate);
    const now = new Date();
    const diffYears = now.getFullYear() - date.getFullYear();
    if (diffYears >= 1) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    }
    const diffMonths = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (diffMonths >= 1) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  // Get video metadata using yt-dlp
  private async getVideoData(query: string, cookies?: string): Promise<VideoData | null> {
    try {
      const args = [
        '--quiet',
        '--skip-download',
        '--dump-json',
        '--default-search', 'ytsearch1:',
        query
      ];

      if (this.cookiesPath) {
        args.push('--cookies', this.cookiesPath);
      } else if (cookies) {
        args.push('--cookies-from-browser', `youtube:${cookies}`);
      }

      const output = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });
      const data = JSON.parse(output);

      if (!data.id || !data.title) {
        return null;
      }

      return {
        title: data.title,
        video_id: data.id,
        duration: this.formatDuration(data.duration || 0),
        views: data.view_count || 0,
        published: this.formatPublishedDate(data.upload_date || ''),
        thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${data.id}/hq720.jpg`
      };
    } catch (error: any) {
      console.error('[yt-dlp error]', error.message);
      return null;
    }
  }

  // Get download/stream URL using yt-dlp
  private async getDownloadUrl(videoId: string, format: 'video' | 'audio', cookies?: string): Promise<string | null> {
    try {
      const args = [
        '--quiet',
        '--get-url',
        format === 'video' ? '--format' : '--format',
        format === 'video' ? 'best[ext=mp4]/best' : 'bestaudio[ext=m4a]/bestaudio',
        `https://youtube.com/watch?v=${videoId}`
      ];

      if (this.cookiesPath) {
        args.push('--cookies', this.cookiesPath);
      } else if (cookies) {
        args.push('--cookies-from-browser', `youtube:${cookies}`);
      }

      const downloadUrl = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });
      return downloadUrl.trim();
    } catch (error: any) {
      console.error('Failed to get download URL:', error.message);
      return null;
    }
  }

  // 🎬 /video?query=... — full video metadata
  async getVideo(query: string, cookies?: string): Promise<KaizYouTubeResponse> {
    if (!query || !query.trim()) {
      return {
        creator: this.creator,
        status: false,
        error: "Missing query parameter"
      };
    }

    const videoData = await this.getVideoData(query, cookies);
    if (!videoData) {
      return {
        creator: this.creator,
        status: false,
        error: "Video not found"
      };
    }

    const videoUrl = `https://youtube.com/watch?v=${videoData.video_id}`;
    const downloadUrl = await this.getDownloadUrl(videoData.video_id, 'video', cookies) || 'Download not available';

    return {
      creator: this.creator,
      status: true,
      result: {
        title: videoData.title,
        video_url: videoUrl,
        thumbnail: videoData.thumbnail,
        duration: videoData.duration,
        views: videoData.views,
        published: videoData.published,
        download_url: downloadUrl
      }
    };
  }

  // 🎧 /play?query=... — audio-optimized metadata
  async getPlay(query: string, cookies?: string): Promise<KaizYouTubeResponse> {
    if (!query || !query.trim()) {
      return {
        creator: this.creator,
        status: false,
        error: "Missing query parameter"
      };
    }

    const videoData = await this.getVideoData(query, cookies);
    if (!videoData) {
      return {
        creator: this.creator,
        status: false,
        error: "Audio not found"
      };
    }

    const videoUrl = `https://youtube.com/watch?v=${videoData.video_id}`;
    const downloadUrl = await this.getDownloadUrl(videoData.video_id, 'audio', cookies) || 'Stream not available';

    return {
      creator: this.creator,
      status: true,
      result: {
        title: videoData.title,
        video_url: videoUrl,
        thumbnail: videoData.thumbnail,
        duration: videoData.duration,
        views: videoData.views,
        published: videoData.published,
        download_url: downloadUrl
      }
    };
  }

  // 🏠 Status endpoint
  getStatus() {
    return {
      message: "broken Vzn's YouTube Metadata API is running",
      routes: ["/api/youtube-kaiz/video?query=...", "/api/youtube-kaiz/play?query=..."],
      creator: this.creator,
      security: {
        cookiesConfigured: this.cookiesPath !== null,
        safeExecution: true
      }
    };
  }
}

export const kaizYouTubeService = new KaizYouTubeService();