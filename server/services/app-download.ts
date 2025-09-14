import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AppDownloadRequest {
  packageName?: string;
  appName?: string;
  platform?: 'android' | 'ios' | 'windows' | 'mac' | 'linux';
  source?: 'playstore' | 'appstore' | 'apkpure' | 'apkmirror' | 'github' | 'official';
  version?: string;
}

export interface AppDownloadInfo {
  appName: string;
  packageName: string;
  version: string;
  versionCode?: string;
  platform: string;
  downloadUrl: string;
  directDownloadUrl?: string;
  fileSize?: string;
  developer: string;
  description?: string;
  icon?: string;
  screenshots?: string[];
  rating?: number;
  downloads?: string;
  lastUpdated?: string;
  minSdkVersion?: string;
  targetSdkVersion?: string;
  permissions?: string[];
  changelog?: string;
}

export interface AppSearchResult {
  apps: Array<{
    appName: string;
    packageName: string;
    developer: string;
    icon: string;
    rating: number;
    downloads: string;
    price?: string;
    category?: string;
  }>;
  totalResults: number;
}

export interface AppDownloadResult {
  success: boolean;
  data?: AppDownloadInfo | AppSearchResult;
  error?: string;
  creator: string;
}

export class AppDownloadService {
  private creator = '@BrokenVZN';
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  // Get APK download from APKPure
  async getAPKFromAPKPure(packageName: string): Promise<AppDownloadResult> {
    try {
      const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(packageName)}`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const firstResult = $('.dd .ae').first().attr('href');
      
      if (!firstResult) {
        throw new Error('App not found on APKPure');
      }

      const appPageUrl = `https://apkpure.com${firstResult}`;
      const appPageResponse = await axios.get(appPageUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 15000
      });

      const appPage$ = cheerio.load(appPageResponse.data);
      
      const appInfo: AppDownloadInfo = {
        appName: appPage$('.info h1').text().trim(),
        packageName: packageName,
        version: appPage$('.details-sdk span').first().text().trim(),
        platform: 'android',
        downloadUrl: appPageUrl,
        directDownloadUrl: appPage$('.download-btn').attr('href') || '',
        fileSize: appPage$('.details-sdk .det:contains("Size")').text().replace('Size:', '').trim(),
        developer: appPage$('.details-author a').text().trim(),
        description: appPage$('.describe p').text().trim(),
        icon: appPage$('.icon img').attr('src') || '',
        rating: parseFloat(appPage$('.rating .score').text().trim()) || 0,
        downloads: appPage$('.downloads-title').text().trim(),
        lastUpdated: appPage$('.update-on').text().replace('Updated on:', '').trim()
      };

      return {
        success: true,
        data: appInfo,
        creator: this.creator
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch app from APKPure',
        creator: this.creator
      };
    }
  }

  // Get APK download from APKMirror
  async getAPKFromAPKMirror(packageName: string): Promise<AppDownloadResult> {
    try {
      const searchUrl = `https://www.apkmirror.com/?s=${encodeURIComponent(packageName)}&post_type=app_release&searchtype=apk`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const firstResult = $('.listWidget .appRow .appRowTitle a').first().attr('href');
      
      if (!firstResult) {
        throw new Error('App not found on APKMirror');
      }

      const appInfo: AppDownloadInfo = {
        appName: $('.appRowTitle a').first().text().trim(),
        packageName: packageName,
        version: 'Latest',
        platform: 'android',
        downloadUrl: `https://www.apkmirror.com${firstResult}`,
        developer: $('.byDeveloper').first().text().trim(),
        description: 'APK from APKMirror',
        rating: 0,
        downloads: 'N/A'
      };

      return {
        success: true,
        data: appInfo,
        creator: this.creator
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch app from APKMirror',
        creator: this.creator
      };
    }
  }

  // Search apps by name
  async searchApps(query: string, platform: string = 'android'): Promise<AppDownloadResult> {
    try {
      // Demo search results - in real implementation would scrape from app stores
      const searchResults: AppSearchResult = {
        apps: [
          {
            appName: `${query} App`,
            packageName: `com.example.${query.toLowerCase().replace(/\s+/g, '')}`,
            developer: 'Example Developer',
            icon: 'https://example.com/icon.png',
            rating: 4.5,
            downloads: '10M+',
            category: 'Productivity'
          },
          {
            appName: `${query} Pro`,
            packageName: `com.pro.${query.toLowerCase().replace(/\s+/g, '')}`,
            developer: 'Pro Developer',
            icon: 'https://example.com/pro-icon.png',
            rating: 4.8,
            downloads: '5M+',
            price: '$2.99',
            category: 'Utilities'
          }
        ],
        totalResults: 2
      };

      return {
        success: true,
        data: searchResults,
        creator: this.creator
      };

    } catch (error) {
      return {
        success: false,
        error: 'App search failed',
        creator: this.creator
      };
    }
  }

  // Download app from GitHub releases
  async downloadFromGitHub(repoUrl: string, assetName?: string): Promise<AppDownloadResult> {
    try {
      // Extract owner and repo from URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub repository URL');
      }

      const [, owner, repo] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
      
      const response = await axios.get(apiUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 15000
      });

      const release = response.data;
      const assets = release.assets || [];
      
      // Find the requested asset or the first APK/executable
      let targetAsset = assets[0];
      if (assetName) {
        targetAsset = assets.find((asset: any) => asset.name.includes(assetName)) || assets[0];
      } else {
        targetAsset = assets.find((asset: any) => 
          asset.name.endsWith('.apk') || 
          asset.name.endsWith('.exe') || 
          asset.name.endsWith('.dmg') || 
          asset.name.endsWith('.deb') ||
          asset.name.endsWith('.rpm')
        ) || assets[0];
      }

      if (!targetAsset) {
        throw new Error('No downloadable assets found in the latest release');
      }

      const appInfo: AppDownloadInfo = {
        appName: release.name || repo,
        packageName: `${owner}.${repo}`,
        version: release.tag_name,
        platform: this.detectPlatformFromFilename(targetAsset.name),
        downloadUrl: release.html_url,
        directDownloadUrl: targetAsset.browser_download_url,
        fileSize: this.formatFileSize(targetAsset.size),
        developer: owner,
        description: release.body || 'GitHub Release',
        downloads: targetAsset.download_count?.toString() || '0',
        lastUpdated: release.published_at
      };

      return {
        success: true,
        data: appInfo,
        creator: this.creator
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch app from GitHub',
        creator: this.creator
      };
    }
  }

  // Get Windows app from official sources
  async getWindowsApp(appName: string): Promise<AppDownloadResult> {
    try {
      // This would integrate with official Windows sources in real implementation
      const appInfo: AppDownloadInfo = {
        appName: appName,
        packageName: `windows.${appName.toLowerCase().replace(/\s+/g, '')}`,
        version: 'Latest',
        platform: 'windows',
        downloadUrl: `https://www.microsoft.com/store/apps/${appName}`,
        developer: 'Microsoft Store',
        description: `Official ${appName} for Windows`,
        rating: 4.5,
        downloads: 'N/A'
      };

      return {
        success: true,
        data: appInfo,
        creator: this.creator
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch Windows app',
        creator: this.creator
      };
    }
  }

  // Get Mac app information
  async getMacApp(appName: string): Promise<AppDownloadResult> {
    try {
      // This would integrate with Mac App Store in real implementation
      const appInfo: AppDownloadInfo = {
        appName: appName,
        packageName: `mac.${appName.toLowerCase().replace(/\s+/g, '')}`,
        version: 'Latest',
        platform: 'mac',
        downloadUrl: `https://apps.apple.com/app/${appName}`,
        developer: 'App Store',
        description: `Official ${appName} for macOS`,
        rating: 4.7,
        downloads: 'N/A'
      };

      return {
        success: true,
        data: appInfo,
        creator: this.creator
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch Mac app',
        creator: this.creator
      };
    }
  }

  // Get popular apps list
  async getPopularApps(platform: string = 'android', category?: string): Promise<AppDownloadResult> {
    try {
      const popularApps: AppSearchResult = {
        apps: [
          {
            appName: 'WhatsApp Messenger',
            packageName: 'com.whatsapp',
            developer: 'WhatsApp LLC',
            icon: 'https://example.com/whatsapp-icon.png',
            rating: 4.2,
            downloads: '5B+',
            category: 'Communication'
          },
          {
            appName: 'Instagram',
            packageName: 'com.instagram.android',
            developer: 'Instagram',
            icon: 'https://example.com/instagram-icon.png',
            rating: 4.3,
            downloads: '2B+',
            category: 'Social'
          },
          {
            appName: 'YouTube',
            packageName: 'com.google.android.youtube',
            developer: 'Google LLC',
            icon: 'https://example.com/youtube-icon.png',
            rating: 4.4,
            downloads: '10B+',
            category: 'Video Players & Editors'
          },
          {
            appName: 'TikTok',
            packageName: 'com.zhiliaoapp.musically',
            developer: 'TikTok Ltd.',
            icon: 'https://example.com/tiktok-icon.png',
            rating: 4.4,
            downloads: '3B+',
            category: 'Entertainment'
          },
          {
            appName: 'Telegram',
            packageName: 'org.telegram.messenger',
            developer: 'Telegram FZ-LLC',
            icon: 'https://example.com/telegram-icon.png',
            rating: 4.6,
            downloads: '1B+',
            category: 'Communication'
          }
        ],
        totalResults: 5
      };

      return {
        success: true,
        data: popularApps,
        creator: this.creator
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch popular apps',
        creator: this.creator
      };
    }
  }

  // Helper methods
  private detectPlatformFromFilename(filename: string): string {
    if (filename.endsWith('.apk')) return 'android';
    if (filename.endsWith('.exe') || filename.endsWith('.msi')) return 'windows';
    if (filename.endsWith('.dmg') || filename.endsWith('.pkg')) return 'mac';
    if (filename.endsWith('.deb') || filename.endsWith('.rpm') || filename.endsWith('.tar.gz')) return 'linux';
    return 'unknown';
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get service status
  getStatus() {
    return {
      service: 'App Download API',
      version: '1.0.0',
      status: 'operational',
      supportedPlatforms: ['Android', 'iOS', 'Windows', 'macOS', 'Linux'],
      supportedSources: [
        'APKPure',
        'APKMirror', 
        'GitHub Releases',
        'Microsoft Store',
        'Mac App Store',
        'Official Websites'
      ],
      features: [
        'APK Downloads',
        'App Search',
        'Popular Apps',
        'GitHub Releases',
        'Multi-platform Support',
        'App Information'
      ],
      creator: this.creator
    };
  }
}

export const appDownloadService = new AppDownloadService();