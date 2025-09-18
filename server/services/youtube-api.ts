import axios from 'axios';
import YTDlpWrap from 'yt-dlp-wrap';
import ytdl from '@distube/ytdl-core';

export interface YouTubeSearchRequest {
  query: string;
  maxResults?: number;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
  type?: 'video' | 'channel' | 'playlist';
  videoDuration?: 'short' | 'medium' | 'long';
  videoDefinition?: 'high' | 'standard';
}

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: {
    id: string;
    title: string;
  };
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  tags?: string[];
  url: string;
}

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount?: string;
  viewCount?: string;
  videoCount?: string;
  publishedAt: string;
  url: string;
}

export interface YouTubeSearchResult {
  success: boolean;
  data?: (YouTubeVideoInfo | YouTubeChannelInfo)[];
  totalResults?: number;
  error?: string;
  creator: string;
}

export interface YouTubeVideoResult {
  success: boolean;
  data?: YouTubeVideoInfo;
  error?: string;
  creator: string;
}

export class YouTubeAPIService {
  private apiKey: string | undefined;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';
  private creator = '@BrokenVZN';
  private ytDlpWrap: YTDlpWrap;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
    this.ytDlpWrap = new YTDlpWrap();
    if (!this.apiKey) {
      console.warn("YOUTUBE_API_KEY not found. Falling back to yt-dlp for data retrieval.");
    }
  }

  async searchVideos(request: YouTubeSearchRequest): Promise<YouTubeSearchResult> {
    try {
      const {
        query,
        maxResults = 25,
        order = 'relevance',
        type = 'video',
        videoDuration,
        videoDefinition
      } = request;

      if (!query) {
        return {
          success: false,
          error: "Please provide a search query",
          creator: this.creator
        };
      }

      if (this.apiKey) {
        // Use YouTube Data API v3
        const params: any = {
          part: 'snippet',
          q: query,
          maxResults,
          order,
          type,
          key: this.apiKey
        };

        if (videoDuration) params.videoDuration = videoDuration;
        if (videoDefinition) params.videoDefinition = videoDefinition;

        const searchResponse = await axios.get(`${this.baseUrl}/search`, {
          params,
          timeout: 15000
        });

        const items = searchResponse.data.items || [];
        const videoIds = items
          .filter((item: any) => item.id.kind === 'youtube#video')
          .map((item: any) => item.id.videoId)
          .join(',');

        let videos: YouTubeVideoInfo[] = [];
        if (videoIds) {
          const videoResponse = await axios.get(`${this.baseUrl}/videos`, {
            params: {
              part: 'snippet,statistics,contentDetails',
              id: videoIds,
              key: this.apiKey
            },
            timeout: 15000
          });

          videos = videoResponse.data.items.map((video: any) => ({
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
            channel: {
              id: video.snippet.channelId,
              title: video.snippet.channelTitle
            },
            publishedAt: this.formatPublishedDate(video.snippet.publishedAt),
            duration: this.formatDuration(video.contentDetails?.duration),
            viewCount: video.statistics?.viewCount,
            likeCount: video.statistics?.likeCount,
            commentCount: video.statistics?.commentCount,
            tags: video.snippet.tags,
            url: `https://www.youtube.com/watch?v=${video.id}`
          }));
        }

        return {
          success: true,
          data: videos,
          totalResults: searchResponse.data.pageInfo?.totalResults,
          creator: this.creator
        };
      } else {
        // Fallback to yt-dlp
        const searchResults = await this.searchWithYtDlp(query, maxResults);
        if (!searchResults || searchResults.length === 0) {
          return {
            success: false,
            creator: this.creator,
            error: 'No videos found for the search query'
          };
        }

        const videos = searchResults
          .filter((item: any) => item.type === 'video' || !item.type)
          .map((video: any) => ({
            id: video.id,
            title: video.title || 'Unknown Title',
            description: video.description || '',
            thumbnail: video.thumbnail || 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg',
            channel: {
              id: video.channel_id || `channel-${video.id}`,
              title: video.uploader || 'Unknown Channel'
            },
            publishedAt: this.formatPublishedDate(video.upload_date || ''),
            duration: this.formatDuration(video.duration || 0),
            viewCount: video.view_count ? video.view_count.toString() : '0',
            url: `https://www.youtube.com/watch?v=${video.id}`
          }));

        return {
          success: true,
          data: videos,
          totalResults: videos.length,
          creator: this.creator
        };
      }
    } catch (error: any) {
      console.error("YouTube search error:", error.message);
      return {
        success: false,
        error: error.response?.status === 403 ? 'API key invalid or quota exceeded' : (error.message || "Failed to search YouTube videos"),
        creator: this.creator
      };
    }
  }

  async getVideoInfo(videoId: string, cookies?: string): Promise<YouTubeVideoResult> {
    try {
      if (!videoId) {
        return {
          success: false,
          error: "Please provide a video ID",
          creator: this.creator
        };
      }

      if (this.apiKey) {
        const response = await axios.get(`${this.baseUrl}/videos`, {
          params: {
            part: 'snippet,statistics,contentDetails',
            id: videoId,
            key: this.apiKey
          },
          timeout: 15000
        });

        const video = response.data.items?.[0];
        if (!video) {
          return {
            success: false,
            error: "Video not found",
            creator: this.creator
          };
        }

        const videoInfo: YouTubeVideoInfo = {
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
          channel: {
            id: video.snippet.channelId,
            title: video.snippet.channelTitle
          },
          publishedAt: this.formatPublishedDate(video.snippet.publishedAt),
          duration: this.formatDuration(video.contentDetails?.duration),
          viewCount: video.statistics?.viewCount,
          likeCount: video.statistics?.likeCount,
          commentCount: video.statistics?.commentCount,
          tags: video.snippet.tags,
          url: `https://www.youtube.com/watch?v=${video.id}`
        };

        return {
          success: true,
          data: videoInfo,
          creator: this.creator
        };
      } else {
        // Fallback to yt-dlp and ytdl-core
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const ytDlpEventEmitter = this.ytDlpWrap.execPromise([videoUrl, '-J']);
        const output = await ytDlpEventEmitter;
        const video = JSON.parse(output);

        if (!video || !video.id) {
          return {
            success: false,
            error: "Video not found",
            creator: this.creator
          };
        }

        // Get additional metadata with ytdl-core
        const options: any = {};
        if (cookies) {
          options.requestOptions = {
            headers: { Cookie: cookies }
          };
        }
        const ytdlInfo = await ytdl.getInfo(videoUrl, options);

        const videoInfo: YouTubeVideoInfo = {
          id: video.id,
          title: video.title || 'Unknown Title',
          description: video.description || '',
          thumbnail: video.thumbnail || ytdlInfo.videoDetails.thumbnails[0]?.url || 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg',
          channel: {
            id: video.channel_id || ytdlInfo.videoDetails.channelId || `channel-${video.id}`,
            title: video.uploader || ytdlInfo.videoDetails.author.name || 'Unknown Channel'
          },
          publishedAt: this.formatPublishedDate(video.upload_date || ytdlInfo.videoDetails.uploadDate),
          duration: this.formatDuration(video.duration || parseInt(ytdlInfo.videoDetails.lengthSeconds)),
          viewCount: (video.view_count || ytdlInfo.videoDetails.viewCount || '0').toString(),
          likeCount: ytdlInfo.videoDetails.likes?.toString(),
          commentCount: ytdlInfo.videoDetails.commentCount?.toString(),
          tags: video.tags || ytdlInfo.videoDetails.keywords,
          url: `https://www.youtube.com/watch?v=${video.id}`
        };

        return {
          success: true,
          data: videoInfo,
          creator: this.creator
        };
      }
    } catch (error: any) {
      console.error("YouTube video info error:", error.message);
      return {
        success: false,
        error: error.response?.status === 403 ? 'API key invalid or quota exceeded' : (error.message || "Failed to get video information"),
        creator: this.creator
      };
    }
  }

  async getChannelInfo(channelId: string, cookies?: string): Promise<{ success: boolean; data?: YouTubeChannelInfo; error?: string; creator: string }> {
    try {
      if (!channelId) {
        return {
          success: false,
          error: "Please provide a channel ID",
          creator: this.creator
        };
      }

      if (this.apiKey) {
        const response = await axios.get(`${this.baseUrl}/channels`, {
          params: {
            part: 'snippet,statistics',
            id: channelId,
            key: this.apiKey
          },
          timeout: 15000
        });

        const channel = response.data.items?.[0];
        if (!channel) {
          return {
            success: false,
            error: "Channel not found",
            creator: this.creator
          };
        }

        const channelInfo: YouTubeChannelInfo = {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
          subscriberCount: channel.statistics?.subscriberCount,
          viewCount: channel.statistics?.viewCount,
          videoCount: channel.statistics?.videoCount,
          publishedAt: this.formatPublishedDate(channel.snippet.publishedAt),
          url: `https://www.youtube.com/channel/${channel.id}`
        };

        return {
          success: true,
          data: channelInfo,
          creator: this.creator
        };
      } else {
        // Fallback to yt-dlp (limited channel info)
        const channelUrl = `https://www.youtube.com/channel/${channelId}`;
        const ytDlpEventEmitter = this.ytDlpWrap.execPromise([channelUrl, '-J']);
        const output = await ytDlpEventEmitter;
        const channel = JSON.parse(output);

        if (!channel || !channel.id) {
          return {
            success: false,
            error: "Channel not found",
            creator: this.creator
          };
        }

        const channelInfo: YouTubeChannelInfo = {
          id: channel.id,
          title: channel.title || channel.uploader || 'Unknown Channel',
          description: channel.description || '',
          thumbnail: channel.thumbnail || 'https://yt3.ggpht.com/ytc/default-channel.jpg',
          subscriberCount: channel.subscriber_count?.toString() || '0',
          viewCount: channel.view_count?.toString() || '0',
          videoCount: channel.video_count?.toString() || '0',
          publishedAt: this.formatPublishedDate(channel.upload_date || new Date().toISOString()),
          url: `https://www.youtube.com/channel/${channel.id}`
        };

        return {
          success: true,
          data: channelInfo,
          creator: this.creator
        };
      }
    } catch (error: any) {
      console.error("YouTube channel info error:", error.message);
      return {
        success: false,
        error: error.response?.status === 403 ? 'API key invalid or quota exceeded' : (error.message || "Failed to get channel information"),
        creator: this.creator
      };
    }
  }

  private formatDuration(isoDuration: string | number): string {
    if (typeof isoDuration === 'number') {
      const minutes = Math.floor(isoDuration / 60);
      const seconds = isoDuration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    if (!isoDuration) return '0:00';
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` : `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
      return result.entries || [result];
    } catch (error: any) {
      console.error('yt-dlp search failed:', error.message);
      return [];
    }
  }

  getStatus() {
    return {
      hasApiKey: !!this.apiKey,
      service: 'YouTube Data API v3',
      baseUrl: this.baseUrl,
      fallback: !this.apiKey ? 'yt-dlp' : 'none',
      creator: this.creator
    };
  }
}

export const youtubeAPIService = new YouTubeAPIService();