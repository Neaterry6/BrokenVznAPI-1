import ytdl from '@distube/ytdl-core';
import ytsearch from 'yt-search';

export interface PersonalPlayRequest {
  query?: string;
  url?: string;
  quality?: 'highest' | 'lowest' | 'highestaudio' | 'lowestaudio';
  format?: 'mp4' | 'webm' | 'audio';
}

export interface VideoInfo {
  title: string;
  duration: string;
  views: string;
  author: string;
  thumbnail: string;
  url: string;
}

export interface PersonalPlayResult {
  success: boolean;
  type?: 'search' | 'info' | 'download';
  query?: string;
  results?: VideoInfo[];
  videoInfo?: VideoInfo;
  downloadUrl?: string;
  creator: string;
  error?: string;
}

export class PersonalPlayService {
  async searchVideos(query: string): Promise<PersonalPlayResult> {
    try {
      if (!query || query.trim() === '') {
        return {
          success: false,
          error: 'Query parameter is required',
          creator: 'Broken VZN'
        };
      }

      const searchResults = await ytsearch(query);
      
      if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
        return {
          success: false,
          error: 'No videos found for the search query',
          creator: 'Broken VZN'
        };
      }

      const videos = searchResults.videos.slice(0, 10); // Limit to 10 results

      const results: VideoInfo[] = videos.map((video: any) => ({
        title: video.title || 'Unknown Title',
        duration: video.duration?.timestamp || 'Unknown Duration',
        views: this.formatNumber(video.views || 0),
        author: video.author?.name || 'Unknown Author',
        thumbnail: video.thumbnail || '',
        url: video.url
      }));

      return {
        success: true,
        type: 'search',
        query: query.trim(),
        results,
        creator: 'Broken VZN'
      };

    } catch (error) {
      console.error('Personal play search error:', error);
      return {
        success: false,
        error: 'Failed to search videos',
        creator: 'Broken VZN'
      };
    }
  }

  async getVideoInfo(url: string): Promise<PersonalPlayResult> {
    try {
      if (!url || !this.isValidYouTubeUrl(url)) {
        return {
          success: false,
          error: 'Valid YouTube URL is required',
          creator: 'Broken VZN'
        };
      }

      const info = await ytdl.getInfo(url);
      const videoDetails = info.videoDetails;

      const videoInfo: VideoInfo = {
        title: videoDetails.title || 'Unknown Title',
        duration: this.formatDuration(parseInt(videoDetails.lengthSeconds || '0')),
        views: this.formatNumber(parseInt(videoDetails.viewCount || '0')),
        author: videoDetails.author?.name || 'Unknown Author',
        thumbnail: videoDetails.thumbnails?.[0]?.url || '',
        url: videoDetails.video_url || url
      };

      return {
        success: true,
        type: 'info',
        videoInfo,
        creator: 'Broken VZN'
      };

    } catch (error) {
      console.error('Personal play video info error:', error);
      return {
        success: false,
        error: 'Failed to get video information',
        creator: 'Broken VZN'
      };
    }
  }

  async getDownloadUrl(request: PersonalPlayRequest): Promise<PersonalPlayResult> {
    try {
      const { url, quality = 'highest', format = 'mp4' } = request;

      if (!url || !this.isValidYouTubeUrl(url)) {
        return {
          success: false,
          error: 'Valid YouTube URL is required',
          creator: 'Broken VZN'
        };
      }

      const info = await ytdl.getInfo(url);
      const videoDetails = info.videoDetails;

      let filter: any;
      if (format === 'audio') {
        filter = quality === 'highest' ? 'highestaudio' : 'lowestaudio';
      } else {
        filter = quality === 'highest' ? 'highest' : 'lowest';
      }

      // Get the best format
      const formats = ytdl.filterFormats(info.formats, filter);
      
      if (!formats || formats.length === 0) {
        return {
          success: false,
          error: 'No suitable format found for download',
          creator: 'Broken VZN'
        };
      }

      const bestFormat = formats[0];
      const downloadUrl = bestFormat.url;

      const videoInfo: VideoInfo = {
        title: videoDetails.title || 'Unknown Title',
        duration: this.formatDuration(parseInt(videoDetails.lengthSeconds || '0')),
        views: this.formatNumber(parseInt(videoDetails.viewCount || '0')),
        author: videoDetails.author?.name || 'Unknown Author',
        thumbnail: videoDetails.thumbnails?.[0]?.url || '',
        url: videoDetails.video_url || url
      };

      return {
        success: true,
        type: 'download',
        videoInfo,
        downloadUrl,
        creator: 'Broken VZN'
      };

    } catch (error) {
      console.error('Personal play download error:', error);
      return {
        success: false,
        error: 'Failed to get download URL',
        creator: 'Broken VZN'
      };
    }
  }

  private isValidYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  private formatNumber(num: number): string {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

export const personalPlayService = new PersonalPlayService();