import { spawn } from 'child_process';

export interface AllDownloaderRequest {
  url: string;
  format?: 'video' | 'audio' | 'best';
  quality?: string;
}

export interface AllDownloaderResult {
  success: boolean;
  data?: {
    title: string;
    thumbnail: string;
    duration: string;
    uploader: string;
    platform: string;
    downloadUrl: string;
    filesize?: string;
    format: string;
    resolution?: string;
    bitrate?: string;
    description?: string;
  };
  error?: string;
  creator: string;
}

export interface AllDownloaderInfoResult {
  success: boolean;
  data?: {
    title: string;
    thumbnail: string;
    duration: string;
    uploader: string;
    platform: string;
    description?: string;
    viewCount?: string;
    uploadDate?: string;
    formats?: Array<{
      format_id: string;
      ext: string;
      resolution?: string;
      filesize?: number;
      url: string;
    }>;
  };
  error?: string;
  creator: string;
}

export class AllDownloaderService {
  private creator = '@BrokenVZN';

  private async executeYtDlp(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('yt-dlp', args);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  private detectPlatform(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'YouTube';
    if (hostname.includes('tiktok.com')) return 'TikTok';
    if (hostname.includes('instagram.com')) return 'Instagram';
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'Twitter/X';
    if (hostname.includes('facebook.com') || hostname.includes('fb.watch')) return 'Facebook';
    if (hostname.includes('vimeo.com')) return 'Vimeo';
    if (hostname.includes('dailymotion.com')) return 'Dailymotion';
    if (hostname.includes('twitch.tv')) return 'Twitch';
    if (hostname.includes('reddit.com')) return 'Reddit';
    if (hostname.includes('pinterest.com')) return 'Pinterest';
    
    return 'Unknown Platform';
  }

  private formatDuration(seconds: number): string {
    if (!seconds || seconds === 0) return 'Unknown';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private formatViewCount(views: number): string {
    if (!views || views === 0) return 'Unknown';
    
    if (views >= 1000000000) {
      return `${(views / 1000000000).toFixed(1)}B views`;
    } else if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  }

  private formatFilesize(bytes: number | null | undefined): string {
    if (!bytes) return 'Unknown';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  // Get media information from any supported platform
  async getMediaInfo(url: string): Promise<AllDownloaderInfoResult> {
    try {
      const args = [
        '--dump-json',
        '--no-download',
        '--no-playlist',
        url
      ];

      const output = await this.executeYtDlp(args);
      const data = JSON.parse(output.trim());

      return {
        success: true,
        creator: this.creator,
        data: {
          title: data.title || 'Unknown Title',
          thumbnail: data.thumbnail || '',
          duration: this.formatDuration(data.duration || 0),
          uploader: data.uploader || data.channel || 'Unknown',
          platform: this.detectPlatform(url),
          description: data.description,
          viewCount: this.formatViewCount(data.view_count || 0),
          uploadDate: data.upload_date,
          formats: data.formats ? data.formats.map((format: any) => ({
            format_id: format.format_id,
            ext: format.ext,
            resolution: format.resolution,
            filesize: format.filesize,
            url: format.url
          })) : undefined
        }
      };
    } catch (error) {
      console.error('Media info error:', error);
      return {
        success: false,
        creator: this.creator,
        error: error instanceof Error ? error.message : 'Failed to get media information'
      };
    }
  }

  // Download video from any supported platform
  async downloadVideo(request: AllDownloaderRequest): Promise<AllDownloaderResult> {
    try {
      const { url, format = 'video', quality = 'best' } = request;

      let formatSelection = 'best[ext=mp4]/best';
      
      if (format === 'audio') {
        formatSelection = 'bestaudio[ext=m4a]/bestaudio';
      } else if (format === 'video') {
        switch (quality.toLowerCase()) {
          case '720p':
            formatSelection = 'best[height<=720][ext=mp4]/best[height<=720]';
            break;
          case '480p':
            formatSelection = 'best[height<=480][ext=mp4]/best[height<=480]';
            break;
          case '360p':
            formatSelection = 'best[height<=360][ext=mp4]/best[height<=360]';
            break;
          case '1080p':
            formatSelection = 'best[height<=1080][ext=mp4]/best[height<=1080]';
            break;
          default:
            formatSelection = 'best[ext=mp4]/best';
        }
      }

      const args = [
        '--dump-json',
        '--format', formatSelection,
        '--no-playlist',
        url
      ];

      const output = await this.executeYtDlp(args);
      const data = JSON.parse(output.trim());

      return {
        success: true,
        creator: this.creator,
        data: {
          title: data.title || 'Unknown Title',
          thumbnail: data.thumbnail || '',
          duration: this.formatDuration(data.duration || 0),
          uploader: data.uploader || data.channel || 'Unknown',
          platform: this.detectPlatform(url),
          downloadUrl: data.url,
          filesize: this.formatFilesize(data.filesize || data.filesize_approx),
          format: data.ext || (format === 'audio' ? 'm4a' : 'mp4'),
          resolution: format === 'video' ? `${data.height}p` || 'Unknown' : undefined,
          bitrate: format === 'audio' ? `${data.abr}kbps` || 'Unknown' : undefined,
          description: data.description
        }
      };
    } catch (error) {
      console.error('Download error:', error);
      return {
        success: false,
        creator: this.creator,
        error: error instanceof Error ? error.message : 'Failed to process download'
      };
    }
  }

  // Get supported platforms list
  getSupportedPlatforms() {
    return {
      success: true,
      creator: this.creator,
      data: {
        platforms: [
          'YouTube',
          'TikTok', 
          'Instagram',
          'Twitter/X',
          'Facebook',
          'Vimeo',
          'Dailymotion',
          'Twitch',
          'Reddit',
          'Pinterest',
          'SoundCloud',
          'Bandcamp',
          'Rumble',
          'Odysee',
          'And 1000+ more platforms...'
        ],
        note: 'This service uses yt-dlp which supports over 1000 platforms. If a platform is not working, please report it.'
      }
    };
  }
}

export const allDownloaderService = new AllDownloaderService();