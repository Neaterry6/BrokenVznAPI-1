import axios from 'axios';

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

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
    if (!this.apiKey) {
      console.warn("YOUTUBE_API_KEY not found. YouTube API service will use demo responses.");
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

      // Demo response if no API key
      if (!this.apiKey) {
        const demoVideos: YouTubeVideoInfo[] = Array.from({ length: Math.min(maxResults, 10) }, (_, i) => ({
          id: `demo-video-${i + 1}`,
          title: `${query} - Demo Video ${i + 1}`,
          description: `This is a demo video result for the search query: ${query}`,
          thumbnail: `https://i.ytimg.com/vi/demo${i}/mqdefault.jpg`,
          channel: {
            id: `demo-channel-${i + 1}`,
            title: `Demo Channel ${i + 1}`
          },
          publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          duration: `PT${Math.floor(Math.random() * 10) + 1}M${Math.floor(Math.random() * 60)}S`,
          viewCount: (Math.floor(Math.random() * 1000000)).toString(),
          likeCount: (Math.floor(Math.random() * 10000)).toString(),
          url: `https://www.youtube.com/watch?v=demo-video-${i + 1}`
        }));

        return {
          success: true,
          data: demoVideos,
          totalResults: 1000000,
          creator: this.creator
        };
      }

      // Build search parameters
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

      // Search for videos
      const searchResponse = await axios.get(`${this.baseUrl}/search`, {
        params,
        timeout: 15000
      });

      const items = searchResponse.data.items || [];
      const videoIds = items
        .filter((item: any) => item.id.kind === 'youtube#video')
        .map((item: any) => item.id.videoId)
        .join(',');

      // Get additional video details
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
          publishedAt: video.snippet.publishedAt,
          duration: video.contentDetails?.duration,
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

    } catch (error) {
      console.error("YouTube search error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to search YouTube videos",
        creator: this.creator
      };
    }
  }

  async getVideoInfo(videoId: string): Promise<YouTubeVideoResult> {
    try {
      if (!videoId) {
        return {
          success: false,
          error: "Please provide a video ID",
          creator: this.creator
        };
      }

      // Demo response if no API key
      if (!this.apiKey) {
        const demoVideo: YouTubeVideoInfo = {
          id: videoId,
          title: "Demo Video Title",
          description: "This is a demo video description for video ID: " + videoId,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          channel: {
            id: "demo-channel-id",
            title: "Demo Channel"
          },
          publishedAt: new Date().toISOString(),
          duration: "PT3M45S",
          viewCount: "1000000",
          likeCount: "10000",
          commentCount: "500",
          url: `https://www.youtube.com/watch?v=${videoId}`
        };

        return {
          success: true,
          data: demoVideo,
          creator: this.creator
        };
      }

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
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails?.duration,
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

    } catch (error) {
      console.error("YouTube video info error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get video information",
        creator: this.creator
      };
    }
  }

  async getChannelInfo(channelId: string): Promise<{ success: boolean; data?: YouTubeChannelInfo; error?: string; creator: string }> {
    try {
      if (!channelId) {
        return {
          success: false,
          error: "Please provide a channel ID",
          creator: this.creator
        };
      }

      // Demo response if no API key
      if (!this.apiKey) {
        const demoChannel: YouTubeChannelInfo = {
          id: channelId,
          title: "Demo Channel",
          description: "This is a demo channel description for channel ID: " + channelId,
          thumbnail: `https://yt3.ggpht.com/demo/channel.jpg`,
          subscriberCount: "1000000",
          viewCount: "50000000",
          videoCount: "500",
          publishedAt: new Date().toISOString(),
          url: `https://www.youtube.com/channel/${channelId}`
        };

        return {
          success: true,
          data: demoChannel,
          creator: this.creator
        };
      }

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
        publishedAt: channel.snippet.publishedAt,
        url: `https://www.youtube.com/channel/${channel.id}`
      };

      return {
        success: true,
        data: channelInfo,
        creator: this.creator
      };

    } catch (error) {
      console.error("YouTube channel info error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get channel information",
        creator: this.creator
      };
    }
  }

  // Get service status
  getStatus() {
    return {
      hasApiKey: !!this.apiKey,
      service: 'YouTube Data API v3',
      baseUrl: this.baseUrl
    };
  }
}

export const youtubeAPIService = new YouTubeAPIService();