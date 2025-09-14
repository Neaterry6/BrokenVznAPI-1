import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Secure cookie management - cookies should be provided via environment variables or secure storage
const getCookiesPath = (): string | null => {
  const cookiesEnv = process.env.YOUTUBE_COOKIES_PATH;
  if (cookiesEnv && fs.existsSync(cookiesEnv)) {
    return cookiesEnv;
  }
  
  // Fallback to user-provided cookies file if it exists
  const userCookiesPath = path.join(process.cwd(), 'youtube-cookies.txt');
  if (fs.existsSync(userCookiesPath)) {
    return userCookiesPath;
  }
  
  return null;
};

interface VideoData {
  title: string;
  video_id: string;
  duration: string;
  views: number;
  published: string;
}

interface KaizYouTubeResponse {
  creator: string;
  status: boolean;
  result?: {
    title: string;
    video_url: string;
    thumbnail: string;
    duration: string;
    views: string;
    published: string;
    download_url: string;
  };
  error?: string;
}

export class KaizYouTubeService {
  private creator = 'broken Vzn';
  private cookiesPath: string | null;

  constructor() {
    this.cookiesPath = getCookiesPath();
  }

  // Secure argument escaping to prevent command injection
  private escapeShellArg(arg: string): string {
    // Remove any potentially dangerous characters and escape properly
    return arg.replace(/[^\\w\\s\\-\\.\\_\\:]/g, '').trim();
  }

  // Secure yt-dlp execution using spawn to prevent command injection
  private executeYtDlp(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('yt-dlp', args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
      });
    });
  }

  // 🔧 Generate actual download URL using yt-dlp
  private async getDownloadUrl(videoId: string): Promise<string | null> {
    try {
      const args = [
        '--quiet',
        '--get-url',
        '--format', 'best[ext=mp4]/best',
        `https://youtube.com/watch?v=${this.escapeShellArg(videoId)}`
      ];

      if (this.cookiesPath) {
        args.push('--cookies', this.cookiesPath);
      }

      return await this.executeYtDlp(args);
    } catch (error) {
      console.error('Failed to get download URL:', error);
      return null;
    }
  }

  // 🔍 Search YouTube and extract metadata using yt-dlp with secure execution
  private async getVideoData(query: string): Promise<VideoData | null> {
    try {
      const escapedQuery = this.escapeShellArg(query);
      
      const args = [
        '--quiet',
        '--skip-download',
        '--dump-json',
        '--default-search', 'ytsearch1:',
        '--format', 'best[ext=mp4]/best',
        escapedQuery
      ];

      if (this.cookiesPath) {
        args.push('--cookies', this.cookiesPath);
      }

      const output = await this.executeYtDlp(args);
      const lines = output.split('\\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const data = JSON.parse(line);
          if (data.id && data.title) {
            const duration = data.duration || 0;
            const durationFormatted = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
            
            // Format the upload date more accurately
            let published = "Unknown";
            if (data.upload_date) {
              const date = new Date(
                parseInt(data.upload_date.substring(0, 4)),
                parseInt(data.upload_date.substring(4, 6)) - 1,
                parseInt(data.upload_date.substring(6, 8))
              );
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - date.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays < 365) {
                published = `${Math.floor(diffDays / 30)} months ago`;
              } else {
                published = `${Math.floor(diffDays / 365)} years ago`;
              }
            }
            
            return {
              title: data.title,
              video_id: data.id,
              duration: durationFormatted,
              views: data.view_count || 0,
              published
            };
          }
        } catch (parseError) {
          continue; // Skip invalid JSON lines
        }
      }
      
      return null;
    } catch (error) {
      console.error('[yt-dlp error]', error);
      return null;
    }
  }

  // 🎬 /video?query=... — full video metadata
  async getVideo(query: string): Promise<KaizYouTubeResponse> {
    if (!query || !query.trim()) {
      return {
        creator: this.creator,
        status: false,
        error: "Missing query parameter"
      };
    }

    const videoData = await this.getVideoData(query);
    if (!videoData) {
      return {
        creator: this.creator,
        status: false,
        error: "Video not found"
      };
    }

    const videoUrl = `https://youtube.com/watch?v=${videoData.video_id}`;
    const thumbnail = `https://i.ytimg.com/vi/${videoData.video_id}/hq720.jpg`;
    const downloadUrl = await this.getDownloadUrl(videoData.video_id) || 'Download not available';

    return {
      creator: this.creator,
      status: true,
      result: {
        title: videoData.title,
        video_url: videoUrl,
        thumbnail: thumbnail,
        duration: videoData.duration,
        views: videoData.views.toString(),
        published: videoData.published,
        download_url: downloadUrl
      }
    };
  }

  // 🎧 /play?query=... — same format as /video
  async getPlay(query: string): Promise<KaizYouTubeResponse> {
    if (!query || !query.trim()) {
      return {
        creator: this.creator,
        status: false,
        error: "Missing query parameter"
      };
    }

    const videoData = await this.getVideoData(query);
    if (!videoData) {
      return {
        creator: this.creator,
        status: false,
        error: "Audio not found"
      };
    }

    const videoUrl = `https://youtube.com/watch?v=${videoData.video_id}`;
    const thumbnail = `https://i.ytimg.com/vi/${videoData.video_id}/hq720.jpg`;
    const downloadUrl = await this.getDownloadUrl(videoData.video_id) || 'Download not available';

    return {
      creator: this.creator,
      status: true,
      result: {
        title: videoData.title,
        video_url: videoUrl,
        thumbnail: thumbnail,
        duration: videoData.duration,
        views: videoData.views.toString(),
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