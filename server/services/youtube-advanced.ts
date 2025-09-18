import axios from 'axios';
import ytdl from '@distube/ytdl-core';
import YTDlpWrap from 'yt-dlp-wrap';

export interface YouTubeSearchRequest {
  search: string;
}

export interface YouTubePlayRequest {
  search: string;
  cookies?: string; // YouTube cookies for region/age-restricted content
}

export interface YouTubeDownloadRequest {
  url: string;
  cookies?: string; // YouTube cookies for region/age-restricted content
}

export interface YouTubeResponse {
  success: boolean;
  data?: any;
  error?: string;
  creator?: string;
}

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  duration: string;
  published: string;
  thumbnail: string;
  video_url: string;
  views: number;
}

export class YouTubeAdvancedService {
  private creator = '@BrokenVZN';
  private ytDlpWrap: YTDlpWrap;

  constructor() {
    this.ytDlpWrap = new YTDlpWrap(); // Initialize yt-dlp-wrap for searching and downloading
  }

  async searchVideos(search: string): Promise<YouTubeResponse> {
    try {
      if (!search || search.trim() === '') {
        return {
          success: false,
          creator: this.creator,
          error: 'Search query is required'
        };
      }

      console.log(`YouTubeAdvanced: Searching for "${search}"...`);

      // Use yt-dlp for real search results
      const searchResults = await this.searchWithYtDlp(search, 10);

      if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
        return {
          success: false,
          creator: this.creator,
          error: 'No videos found for the search query'
        };
      }

      // Map results to the desired format
      const videos = searchResults
        .filter((item: any) => item.type === 'video' || !item.type)
        .map((video: any) => ({
          id: video.id,
          title: video.title || 'Unknown Title',
          duration: this.formatDuration(video.duration || 0),
          published: this.formatPublishedDate(video.upload_date || ''),
          thumbnail: video.thumbnail || 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg',
          video_url: `https://www.youtube.com/watch?v=${video.id}`,
          views: parseInt(video.view_count || '0')
        }));

      if (videos.length === 0) {
        return {
          success: false,
          creator: this.creator,
          error: 'No valid videos found for the search query'
        };
      }

      return {
        success: true,
        creator: this.creator,
        data: videos
      };
    } catch (error: any) {
      console.error('YouTube search error:', error.message);
      return {
        success: false,
        creator: this.creator,
        error: 'Failed to search YouTube videos. Please try again.'
      };
    }
  }

  async playVideo(search: string, cookies?: string): Promise<YouTubeResponse> {
    try {
      if (!search || search.trim() === '') {
        return {
          success: false,
          creator: this.creator,
          error: 'Search query is required'
        };
      }

      console.log(`YouTubeAdvanced: Playing video for "${search}"...`);

      // Search for the video to get the first result
      const searchResults = await this.searchWithYtDlp(search, 1);

      if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
        return {
          success: false,
          creator: this.creator,
          error: 'No videos found for the search query'
        };
      }

      const video = searchResults[0];
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

      // Get stream info using ytdl-core
      const options: any = {
        quality: 'highestaudio', // Optimize for audio playback
      };
      if (cookies) {
        options.requestOptions = {
          headers: {
            Cookie: cookies
          }
        };
      }

      const info = await ytdl.getInfo(videoUrl, options);
      const videoDetails = info.videoDetails;
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      const format = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });

      if (!format) {
        return {
          success: false,
          creator: this.creator,
          error: 'No suitable audio format found'
        };
      }

      return {
        success: true,
        creator: this.creator,
        data: {
          stream_url: format.url,
          title: videoDetails.title,
          duration: this.formatDuration(parseInt(videoDetails.lengthSeconds)),
          published: this.formatPublishedDate(video.upload_date || ''),
          thumbnail: videoDetails.thumbnails[0]?.url || 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg',
          video_url: videoUrl,
          views: parseInt(videoDetails.viewCount || '0')
        }
      };
    } catch (error: any) {
      console.error('YouTube play error:', error.message);
      return {
        success: false,
        creator: this.creator,
        error: 'Failed to get video stream. Video may be private or unavailable.'
      };
    }
  }

  async downloadVideo(url: string, cookies?: string): Promise<YouTubeResponse> {
    try {
      if (!url || !ytdl.validateURL(url)) {
        return {
          success: false,
          creator: this.creator,
          error: 'Valid YouTube URL is required'
        };
      }

      console.log(`YouTubeAdvanced: Downloading video from ${url}...`);

      // Get video info using ytdl-core
      const options: any = {};
      if (cookies) {
        options.requestOptions = {
          headers: {
            Cookie: cookies
          }
        };
      }

      const info = await ytdl.getInfo(url, options);
      const videoDetails = info.videoDetails;
      const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
      const format = ytdl.chooseFormat(formats, { quality: 'highest' });

      if (!format) {
        return {
          success: false,
          creator: this.creator,
          error: 'No suitable video format found'
        };
      }

      // Use yt-dlp to get a downloadable URL (ensures stable download link)
      const ytDlpEventEmitter = this.ytDlpWrap.execPromise([url, '--get-url', '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best']);
      const downloadUrl = await ytDlpEventEmitter;

      if (!downloadUrl) {
        return {
          success: false,
          creator: this.creator,
          error: 'Failed to retrieve download URL'
        };
      }

      return {
        success: true,
        creator: this.creator,
        result: {
          download_url: downloadUrl.trim(),
          title: videoDetails.title,
          duration: this.formatDuration(parseInt(videoDetails.lengthSeconds)),
          published: this.formatPublishedDate(videoDetails.uploadDate || ''),
          thumbnail: videoDetails.thumbnails[0]?.url || 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg',
          video_url: url,
          views: parseInt(videoDetails.viewCount || '0')
        },
        status: true
      };
    } catch (error: any) {
      console.error('YouTube download error:', error.message);
      return {
        success: false,
        creator: this.creator,
        error: 'Failed to download YouTube video. Video may be private or unavailable.'
      };
    }
  }

  private formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private formatPublishedDate(uploadDate: string): string {
    if (!uploadDate) return 'Unknown';
    const date = new Date(uploadDate);
    const now = new Date();
    const diffYears = now.getFullYear() - date.getFullYear();
    if (diffYears >= 1) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    }
    const diffMonths = now.getMonth() - date.getMonth();
    if (diffMonths >= 1) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  private async searchWithYtDlp(query: string, maxResults: number): Promise<any[]> {
    try {
      const searchQuery = `ytsearch${maxResults}:${query}`;
      const ytDlpEventEmitter = this.ytDlpWrap.execPromise([searchQuery, '-J']);
      const output = await ytDlpEventEmitter;
      const result = JSON.parse(output);
      return result.entries || [result]; // Handle both single video and search results
    } catch (error: any) {
      console.error('yt-dlp search failed:', error.message);
      return [];
    }
  }
}

export const youTubeAdvancedService = new YouTubeAdvancedService();