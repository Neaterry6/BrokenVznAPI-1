import axios from 'axios';

export interface SocialDownloadRequest {
  url: string;
  platform?: string;
}

export interface SocialDownloadResponse {
  success: boolean;
  platform: string;
  url: string;
  data?: SocialMediaData;
  creator: string;
  error?: string;
}

export interface SocialMediaData {
  title?: string;
  description?: string;
  author?: string;
  duration?: string;
  thumbnail?: string;
  download_links?: DownloadLink[];
  stats?: {
    views?: number;
    likes?: number;
    shares?: number;
  };
}

export interface DownloadLink {
  quality: string;
  url: string;
  type: 'video' | 'audio' | 'image';
  size?: string;
}

export class SocialDownloaderService {
  private readonly creator = 'Broken VZN';

  async downloadContent(request: SocialDownloadRequest): Promise<SocialDownloadResponse> {
    try {
      const { url, platform } = request;

      if (!url || !this.isValidUrl(url)) {
        return {
          success: false,
          platform: platform || 'unknown',
          url,
          creator: this.creator,
          error: 'Valid URL is required'
        };
      }

      const detectedPlatform = this.detectPlatform(url);
      
      switch (detectedPlatform) {
        case 'tiktok':
          return await this.downloadTikTok(url);
        case 'twitter':
          return await this.downloadTwitter(url);
        case 'telegram':
          return await this.downloadTelegram(url);
        default:
          return await this.downloadGeneric(url, detectedPlatform);
      }

    } catch (error) {
      console.error('Social downloader error:', error);
      return {
        success: false,
        platform: request.platform || 'unknown',
        url: request.url,
        creator: this.creator,
        error: 'Failed to download content'
      };
    }
  }

  private async downloadTwitter(url: string): Promise<SocialDownloadResponse> {
    try {
      // Use multiple Twitter/X video downloader APIs with environment variables
      const betaBotApiKey = process.env.BETABOT_API_KEY;
      if (!betaBotApiKey) {
        throw new Error('Twitter downloader API key not configured');
      }
      const apiUrl = `https://api.betabotz.eu.org/api/download/twitter?url=${encodeURIComponent(url)}&apikey=${betaBotApiKey}`;
      
      const response = await axios.get(apiUrl, { timeout: 15000 });
      
      if (response.data.status && response.data.result) {
        const data = response.data.result;
        
        return {
          success: true,
          platform: 'twitter',
          url,
          data: {
            title: data.desc || 'Twitter Video',
            author: data.author?.name || 'Unknown',
            thumbnail: data.thumb || '',
            download_links: data.video ? [{
              quality: 'default',
              url: data.video,
              type: 'video'
            }] : [],
            stats: {
              views: data.view_count,
              likes: data.like_count
            }
          },
          creator: this.creator
        };
      } else {
        throw new Error('API response invalid');
      }
    } catch (error) {
      return {
        success: false,
        platform: 'twitter',
        url,
        creator: this.creator,
        error: 'Twitter download temporarily unavailable'
      };
    }
  }

  private async downloadTelegram(url: string): Promise<SocialDownloadResponse> {
    try {
      // Telegram sticker downloader logic
      if (url.includes('t.me/addstickers')) {
        const stickerSet = this.extractStickerSetName(url);
        
        return {
          success: true,
          platform: 'telegram',
          url,
          data: {
            title: `Telegram Sticker Set: ${stickerSet}`,
            description: 'Telegram sticker set detected',
            download_links: [{
              quality: 'original',
              url: `https://telegram-stickers-api.herokuapp.com/stickers/${stickerSet}`,
              type: 'video'
            }]
          },
          creator: this.creator
        };
      } else {
        return {
          success: false,
          platform: 'telegram',
          url,
          creator: this.creator,
          error: 'Only sticker sets are supported for Telegram'
        };
      }
    } catch (error) {
      return {
        success: false,
        platform: 'telegram',
        url,
        creator: this.creator,
        error: 'Telegram download failed'
      };
    }
  }

  private async downloadTikTok(url: string): Promise<SocialDownloadResponse> {
    try {
      // Using multiple working TikTok downloader APIs
      const apis = [
        {
          name: 'ssstik',
          url: 'https://ssstik.io/abc?url=dl',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          data: `id=${encodeURIComponent(url)}&locale=en&tt=MTcyNzAyNjM0OA==`
        },
        {
          name: 'tikmate', 
          url: 'https://tikmate.app/download',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          data: `url=${encodeURIComponent(url)}`
        },
        {
          name: 'tikwm',
          url: 'https://www.tikwm.com/api/',
          method: 'POST', 
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: `url=${encodeURIComponent(url)}&hd=1`
        }
      ];

      for (const api of apis) {
        try {
          let response;
          if (api.method === 'POST') {
            response = await axios.post(api.url, api.data, {
              headers: api.headers,
              timeout: 15000
            });
          } else {
            response = await axios.get(api.url, {
              headers: api.headers,
              timeout: 15000
            });
          }

          // Parse response based on API
          let videoData: any = null;
          
          if (api.name === 'ssstik' && response.data) {
            // Parse SSSTIK HTML response
            const html = response.data;
            const linkMatch = html.match(/href="([^"]*)"/g);
            if (linkMatch) {
              const videoUrl = linkMatch.find((link: string) => link.includes('.mp4'))?.match(/href="([^"]*)"/)?.[1];
              if (videoUrl) {
                videoData = {
                  title: 'TikTok Video',
                  download_url: videoUrl,
                  thumbnail: ''
                };
              }
            }
          } else if (api.name === 'tikwm' && response.data?.data) {
            const data = response.data.data;
            videoData = {
              title: data.title || 'TikTok Video',
              author: data.author?.nickname || 'Unknown',
              download_url: data.hdplay || data.play,
              thumbnail: data.cover,
              music: data.music,
              stats: {
                views: data.play_count,
                likes: data.digg_count,
                shares: data.share_count
              }
            };
          } else if (api.name === 'tikmate' && response.data) {
            // Handle tikmate response format
            const data = response.data;
            if (data.success && data.video_url) {
              videoData = {
                title: data.title || 'TikTok Video',
                download_url: data.video_url,
                thumbnail: data.thumbnail
              };
            }
          }

          if (videoData && videoData.download_url) {
            return {
              success: true,
              platform: 'tiktok',
              url,
              data: {
                title: videoData.title || 'TikTok Video',
                author: videoData.author || 'Unknown',
                thumbnail: videoData.thumbnail || '',
                download_links: [
                  {
                    quality: 'HD',
                    url: videoData.download_url,
                    type: 'video' as const
                  },
                  videoData.music && {
                    quality: 'Audio',
                    url: videoData.music,
                    type: 'audio' as const
                  }
                ].filter(Boolean).filter(link => link.url),
                stats: videoData.stats || {}
              },
              creator: this.creator
            };
          }
        } catch (error: any) {
          console.log(`TikTok API ${api.name} failed:`, error?.message || 'Unknown error');
          continue;
        }
      }

      throw new Error('All TikTok APIs failed');
    } catch (error) {
      return {
        success: false,
        platform: 'tiktok',
        url,
        creator: this.creator,
        error: 'TikTok download service temporarily unavailable'
      };
    }
  }

  private async downloadInstagram(url: string): Promise<SocialDownloadResponse> {
    try {
      // Using reliable Instagram downloader APIs
      const apis = [
        {
          url: 'https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index',
          method: 'GET',
          params: { url },
          headers: {
            'X-RapidAPI-Host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com',
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || ''
          }
        }
      ];

      for (const api of apis) {
        try {
          let response;
          if (api.method === 'GET') {
            response = await axios.get(api.url, {
              params: 'params' in api ? api.params : undefined,
              headers: api.headers || {
                'X-RapidAPI-Host': api.url.split('//')[1].split('/')[0],
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || ''
              },
              timeout: 15000
            });
          } else {
            const requestData = 'data' in api ? (api as any).data : {};
            response = await axios.post(api.url, requestData, {
              headers: api.headers || {
                'Content-Type': 'application/json',
                'X-RapidAPI-Host': api.url.split('//')[1].split('/')[0],
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || ''
              },
              timeout: 15000
            });
          }

          if (response.data && (response.data.url || response.data.data)) {
            const data = response.data.data || response.data;
            return {
              success: true,
              platform: 'instagram',
              url,
              data: {
                title: data.caption || 'Instagram Content',
                author: data.username || data.owner?.username || 'Unknown',
                thumbnail: data.thumbnail_url || data.display_url,
                download_links: [
                  {
                    quality: 'HD',
                    url: data.video_url || data.url || data.download_url,
                    type: data.is_video ? ('video' as const) : ('image' as const)
                  }
                ].filter(link => link.url),
                stats: {
                  likes: data.like_count,
                  views: data.view_count
                }
              },
              creator: this.creator
            };
          }
        } catch (error: any) {
          console.log(`Instagram API failed: ${api.url}`, error?.message || 'Unknown error');
          continue;
        }
      }

      throw new Error('All Instagram APIs failed');
    } catch (error) {
      return {
        success: false,
        platform: 'instagram',
        url,
        creator: this.creator,
        error: 'Instagram download service temporarily unavailable'
      };
    }
  }

  private async downloadPinterest(url: string): Promise<SocialDownloadResponse> {
    try {
      // Pinterest video/image downloader
      const apiUrl = 'https://pinterest-video-and-image-downloader.p.rapidapi.com/pinterest';
      
      const response = await axios.get(apiUrl, {
        params: { url },
        headers: {
          'X-RapidAPI-Host': 'pinterest-video-and-image-downloader.p.rapidapi.com',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'demo'
        },
        timeout: 15000
      });

      if (response.data && response.data.success) {
        const data = response.data.data;
        return {
          success: true,
          platform: 'pinterest',
          url,
          data: {
            title: data.title || 'Pinterest Content',
            description: data.description,
            thumbnail: data.image,
            download_links: [
              {
                quality: 'Original',
                url: data.video || data.image,
                type: data.video ? ('video' as const) : ('image' as const)
              }
            ].filter(link => link.url)
          },
          creator: this.creator
        };
      }

      throw new Error('Pinterest API response invalid');
    } catch (error) {
      return {
        success: false,
        platform: 'pinterest',
        url,
        creator: this.creator,
        error: 'Pinterest download service temporarily unavailable'
      };
    }
  }

  private async downloadGeneric(url: string, platform: string): Promise<SocialDownloadResponse> {
    // Route to specific downloaders based on platform
    switch (platform) {
      case 'tiktok':
        return await this.downloadTikTok(url);
      case 'instagram':
        return await this.downloadInstagram(url);
      case 'pinterest':
        return await this.downloadPinterest(url);
      default:
        return {
          success: false,
          platform,
          url,
          creator: this.creator,
          error: `${platform} downloads not yet supported`
        };
    }
  }

  private detectPlatform(url: string): string {
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter';
    } else if (url.includes('t.me')) {
      return 'telegram';
    } else if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
      return 'tiktok';
    } else if (url.includes('instagram.com')) {
      return 'instagram';
    } else if (url.includes('pinterest.com') || url.includes('pin.it')) {
      return 'pinterest';
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else {
      return 'unknown';
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private extractStickerSetName(url: string): string {
    const match = url.match(/addstickers\/([^/?]+)/);
    return match ? match[1] : 'unknown';
  }

  private extractInstagramUsername(url: string): string {
    const match = url.match(/instagram\.com\/([^/?]+)/);
    return match ? match[1] : 'unknown';
  }

  getSupportedPlatforms(): string[] {
    return ['twitter', 'telegram', 'tiktok', 'instagram', 'pinterest', 'youtube'];
  }
}

export const socialDownloaderService = new SocialDownloaderService();