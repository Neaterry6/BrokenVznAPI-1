import YTDlpWrap from 'yt-dlp-wrap';

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
    views?: number;
    published?: string;
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

  // Detect platform from URL
  private detectPlatform(url: string): string {
    try {
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
      if (hostname.includes('soundcloud.com')) return 'SoundCloud';
      if (hostname.includes('bandcamp.com')) return 'Bandcamp';
      if (hostname.includes('rumble.com')) return 'Rumble';
      if (hostname.includes('odysee.com')) return 'Odysee';
      return 'Unknown Platform';
    } catch {
      return 'Invalid URL';
    }
  }

  // Format duration to MM:SS or HH:MM:SS
  private formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Format view count
  private formatViewCount(views: number): string {
    if (!views || isNaN(views)) return '0';
    if (views >= 1000000000) return `${(views / 1000000000).toFixed(1)}B`;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return `${views}`;
  }

  // Format published date to relative time
  private formatPublishedDate(uploadDate: string): string {
    if (!uploadDate) return 'Unknown';
    const date = new Date(uploadDate);
    const now = new Date();
    const diffYears = now.getFullYear() - date.getFullYear();
    if (diffYears >= 1) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    const diffMonths = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (diffMonths >= 1) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  // Format file size
  private formatFilesize(bytes: number | null | undefined): string {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  // Validate URL and prevent SSRF
  private validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const ip = urlObj.hostname;

      const privateIPPatterns = [
        /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./,
        /^169\.254\./, /^::1$/, /^fc00:/, /^fe80:/
      ];

      if (privateIPPatterns.some(pattern => pattern.test(ip)) || ['localhost', '0.0.0.0'].includes(hostname)) {
        return { valid: false, error: 'Access to private/internal networks is not allowed.' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL' };
    }
  }

  // Get media information
  async getMediaInfo(url: string): Promise<AllDownloaderInfoResult> {
    try {
      const validation = this.validateUrl(url);
      if (!validation.valid) {
        return { success: false, creator: this.creator, error: validation.error };
      }

      const args = ['--dump-json', '--no-download', '--no-playlist', url];
      const output = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });
      const data = JSON.parse(output);

      if (!data.id || !data.title) {
        return { success: false, creator: this.creator, error: 'No media found at the provided URL' };
      }

      return {
        success: true,
        creator: this.creator,
        data: {
          title: data.title || 'Unknown Title',
          thumbnail: data.thumbnail || '',
          duration: this.formatDuration(data.duration || 0),
          uploader: data.uploader || data.channel || 'Unknown',
          platform: this.detectPlatform(url),
          description: data.description || '',
          viewCount: this.formatViewCount(data.view_count || 0),
          uploadDate: this.formatPublishedDate(data.upload_date || ''),
          formats: data.formats ? data.formats.map((format: any) => ({
            format_id: format.format_id,
            ext: format.ext,
            resolution: format.resolution || format.height ? `${format.height}p` : 'Unknown',
            filesize: format.filesize,
            url: format.url
          })) : []
        }
      };
    } catch (error: any) {
      console.error('Media info error:', error.message);
      return {
        success: false,
        creator: this.creator,
        error: `Failed to get media information: ${error.message || 'Unknown error'}`
      };
    }
  }

  // Download video/audio
  async downloadVideo(request: AllDownloaderRequest): Promise<AllDownloaderResult> {
    try {
      const { url, format = 'video', quality = 'best' } = request;
      const validation = this.validateUrl(url);
      if (!validation.valid) {
        return { success: false, creator: this.creator, error: validation.error };
      }

      let formatSelection = 'best[ext=mp4]/best';
      if (format === 'audio') {
        formatSelection = 'bestaudio[ext=m4a]/bestaudio';
      } else if (format === 'video') {
        switch (quality.toLowerCase()) {
          case '144p':
            formatSelection = 'best[height<=144][ext=mp4]/best[height<=144]';
            break;
          case '240p':
            formatSelection = 'best[height<=240][ext=mp4]/best[height<=240]';
            break;
          case '360p':
            formatSelection = 'best[height<=360][ext=mp4]/best[height<=360]';
            break;
          case '480p':
            formatSelection = 'best[height<=480][ext=mp4]/best[height<=480]';
            break;
          case '720p':
            formatSelection = 'best[height<=720][ext=mp4]/best[height<=720]';
            break;
          case '1080p':
            formatSelection = 'best[height<=1080][ext=mp4]/best[height<=1080]';
            break;
          case '4k':
            formatSelection = 'best[height<=2160][ext=mp4]/best[height<=2160]';
            break;
          default:
            formatSelection = 'best[ext=mp4]/best';
        }
      }

      const args = ['--dump-json', '--format', formatSelection, '--no-playlist', url];
      const output = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });
      const data = JSON.parse(output);

      if (!data.id || !data.title) {
        return { success: false, creator: this.creator, error: 'No media found at the provided URL' };
      }

      return {
        success: true,
        creator: this.creator,
        data: {
          title: data.title || 'Unknown Title',
          thumbnail: data.thumbnail || '',
          duration: this.formatDuration(data.duration || 0),
          uploader: data.uploader || data.channel || 'Unknown',
          platform: this.detectPlatform(url),
          downloadUrl: data.url || '',
          filesize: this.formatFilesize(data.filesize || data.filesize_approx),
          format: data.ext || (format === 'audio' ? 'm4a' : 'mp4'),
          resolution: format === 'video' ? (data.height ? `${data.height}p` : 'Unknown') : undefined,
          bitrate: format === 'audio' ? (data.abr ? `${data.abr}kbps` : 'Unknown') : undefined,
          description: data.description || '',
          views: data.view_count || 0,
          published: this.formatPublishedDate(data.upload_date || '')
        }
      };
    } catch (error: any) {
      console.error('Download error:', error.message);
      return {
        success: false,
        creator: this.creator,
        error: `Failed to process download: ${error.message || 'Unknown error'}`
      };
    }
  }

  // Get supported platforms
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
        note: 'This service uses yt-dlp, which supports over 1000 platforms. See https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md for the full list.'
      }
    };
  }
}

export const allDownloaderService = new AllDownloaderService();