import axios from 'axios';
import * as cheerio from 'cheerio';
import YTDlpWrap from 'yt-dlp-wrap';
export class AppDownloadService {
    creator = '@BrokenVZN';
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
    ytDlpWrap; // Allow null to handle initialization failure
    constructor() {
        try {
            this.ytDlpWrap = new YTDlpWrap();
            console.log('YTDlpWrap initialized successfully in AppDownloadService');
        }
        catch (error) {
            console.error('Failed to initialize YTDlpWrap in AppDownloadService:', error.message);
            this.ytDlpWrap = null;
        }
    }
    // Get APK from APKPure
    async getAPKFromAPKPure(packageName) {
        try {
            if (!packageName) {
                return { success: false, error: 'Package name is required', creator: this.creator };
            }
            const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(packageName)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const firstResult = $('div.ver-item a.ver-item-n').first().attr('href');
            if (!firstResult) {
                throw new Error('App not found on APKPure');
            }
            const appPageUrl = `https://apkpure.com${firstResult}`;
            const appPageResponse = await axios.get(appPageUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const appPage$ = cheerio.load(appPageResponse.data);
            const downloadLink = appPage$('a[href*="/download/"]').attr('href');
            let directDownloadUrl = '';
            if (downloadLink && this.ytDlpWrap) {
                directDownloadUrl = await this.getDirectAPKUrl(downloadLink);
            }
            const appInfo = {
                appName: appPage$('h1').text().trim() || 'Unknown App',
                packageName,
                version: appPage$('.detail_appinfo_version').text().trim() || 'Latest',
                platform: 'android',
                downloadUrl: appPageUrl,
                directDownloadUrl: directDownloadUrl || '',
                fileSize: appPage$('.detail_appinfo_size').text().trim() || 'N/A',
                developer: appPage$('.detail_author').text().trim() || 'Unknown',
                description: appPage$('.description_content').text().trim() || '',
                icon: appPage$('.detail_icon img').attr('src') || '',
                screenshots: appPage$('.swiper-slide img').map((_, el) => appPage$(el).attr('src') || '').get(),
                rating: parseFloat(appPage$('.detail_rating .score').text().trim()) || 0,
                downloads: appPage$('.detail_downloads').text().trim() || '0',
                lastUpdated: appPage$('.detail_updated').text().replace('Updated:', '').trim() || ''
            };
            return {
                success: true,
                data: appInfo,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('APKPure error:', error.message);
            return {
                success: false,
                error: `Failed to fetch app from APKPure: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Get APK from APKMIRROR
    async getAPKFromAPKMirror(packageName) {
        try {
            if (!packageName) {
                return { success: false, error: 'Package name is required', creator: this.creator };
            }
            const searchUrl = `https://www.apkmirror.com/?s=${encodeURIComponent(packageName)}&post_type=app_release&searchtype=apk`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const firstResult = $('.appRowTitle a').first().attr('href');
            if (!firstResult) {
                throw new Error('App not found on APKMIRROR');
            }
            const appPageUrl = `https://www.apkmirror.com${firstResult}`;
            const appPageResponse = await axios.get(appPageUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const appPage$ = cheerio.load(appPageResponse.data);
            const downloadLink = appPage$('.downloadLink').attr('href');
            let directDownloadUrl = '';
            if (downloadLink && this.ytDlpWrap) {
                directDownloadUrl = await this.getDirectAPKUrl(`https://www.apkmirror.com${downloadLink}`);
            }
            const appInfo = {
                appName: appPage$('.appRowTitle').text().trim() || 'Unknown App',
                packageName,
                version: appPage$('.infoSlide-value').eq(0).text().trim() || 'Latest',
                platform: 'android',
                downloadUrl: appPageUrl,
                directDownloadUrl: directDownloadUrl || '',
                fileSize: appPage$('.infoSlide-value').eq(1).text().trim() || 'N/A',
                developer: appPage$('.byDeveloper').text().trim() || 'Unknown',
                description: appPage$('.notes').text().trim() || '',
                icon: appPage$('.appIcon img').attr('src') || '',
                screenshots: [],
                rating: parseFloat(appPage$('.rating').text().trim()) || 0,
                downloads: 'N/A',
                lastUpdated: appPage$('.date').text().trim() || ''
            };
            return {
                success: true,
                data: appInfo,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('APKMIRROR error:', error.message);
            return {
                success: false,
                error: `Failed to fetch app from APKMIRROR: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Get direct APK URL using yt-dlp
    async getDirectAPKUrl(url) {
        try {
            if (!this.ytDlpWrap) {
                console.error('yt-dlp-wrap not initialized for getDirectAPKUrl');
                return '';
            }
            const args = ['--quiet', '--get-url', url];
            const downloadUrl = await this.ytDlpWrap.execPromise(args, { timeout: 30000 });
            return downloadUrl.trim();
        }
        catch (error) {
            console.error('yt-dlp error:', error.message);
            return '';
        }
    }
    // Search apps
    async searchApps(query, platform = 'android') {
        try {
            if (!query) {
                return { success: false, error: 'Query is required', creator: this.creator };
            }
            const searchUrl = platform === 'ios'
                ? `https://www.apple.com/us/search/${encodeURIComponent(query)}?src=serp`
                : `https://apkpure.com/search?q=${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const apps = [];
            if (platform === 'ios') {
                $('.rf-serp-productname a').each((_, el) => {
                    const appName = $(el).text().trim();
                    apps.push({
                        appName,
                        packageName: `ios.${appName.toLowerCase().replace(/\s+/g, '')}`,
                        developer: 'Unknown',
                        icon: $('.rf-serp-productimage img').attr('src') || '',
                        rating: 0,
                        downloads: 'N/A',
                        category: 'Unknown'
                    });
                });
            }
            else {
                $('.search-dl .search-title a').each((_, el) => {
                    const appName = $(el).text().trim();
                    const packageName = $(el).attr('href')?.split('/')[2] || `com.example.${appName.toLowerCase().replace(/\s+/g, '')}`;
                    apps.push({
                        appName,
                        packageName,
                        developer: $('.search-dl .search-developer').eq(_).text().trim() || 'Unknown',
                        icon: $('.search-dl img').eq(_).attr('src') || '',
                        rating: parseFloat($('.search-dl .score').eq(_).text().trim()) || 0,
                        downloads: $('.search-dl .downloads').eq(_).text().trim() || '0',
                        category: $('.search-dl .category').eq(_).text().trim() || 'Unknown'
                    });
                });
            }
            const searchResults = {
                apps: apps.slice(0, 10),
                totalResults: apps.length
            };
            return {
                success: true,
                data: searchResults,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Search error:', error.message);
            return {
                success: false,
                error: `App search failed: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Download from GitHub releases
    async downloadFromGitHub(repoUrl, assetName) {
        try {
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
            let targetAsset = assets[0];
            if (assetName) {
                targetAsset = assets.find((asset) => asset.name.includes(assetName)) || assets[0];
            }
            else {
                targetAsset = assets.find((asset) => asset.name.endsWith('.apk') ||
                    asset.name.endsWith('.exe') ||
                    asset.name.endsWith('.dmg') ||
                    asset.name.endsWith('.deb') ||
                    asset.name.endsWith('.rpm')) || assets[0];
            }
            if (!targetAsset) {
                throw new Error('No downloadable assets found in the latest release');
            }
            const appInfo = {
                appName: release.name || repo,
                packageName: `${owner}.${repo}`,
                version: release.tag_name,
                platform: this.detectPlatformFromFilename(targetAsset.name),
                downloadUrl: release.html_url,
                directDownloadUrl: targetAsset.browser_download_url,
                fileSize: this.formatFileSize(targetAsset.size),
                developer: owner,
                description: release.body || 'GitHub Release',
                icon: '',
                screenshots: [],
                downloads: targetAsset.download_count?.toString() || '0',
                lastUpdated: release.published_at
            };
            return {
                success: true,
                data: appInfo,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('GitHub error:', error.message);
            return {
                success: false,
                error: `Failed to fetch app from GitHub: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Get Windows app
    async getWindowsApp(appName) {
        try {
            if (!appName) {
                return { success: false, error: 'App name is required', creator: this.creator };
            }
            // Scrape Microsoft Store
            const searchUrl = `https://www.microsoft.com/store/search?q=${encodeURIComponent(appName)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const firstResult = $('.m-product-detail a').first().attr('href');
            if (!firstResult) {
                throw new Error('App not found on Microsoft Store');
            }
            const appPageUrl = `https://www.microsoft.com${firstResult}`;
            const appPageResponse = await axios.get(appPageUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const appPage$ = cheerio.load(appPageResponse.data);
            const appInfo = {
                appName: appPage$('h1').text().trim() || appName,
                packageName: `windows.${appName.toLowerCase().replace(/\s+/g, '')}`,
                version: appPage$('.version').text().trim() || 'Latest',
                platform: 'windows',
                downloadUrl: appPageUrl,
                directDownloadUrl: '', // Microsoft Store apps require store installation
                developer: appPage$('.publisher').text().trim() || 'Unknown',
                description: appPage$('.description').text().trim() || '',
                icon: appPage$('.app-icon img').attr('src') || '',
                screenshots: appPage$('.screenshot img').map((_, el) => appPage$(el).attr('src') || '').get(),
                rating: parseFloat(appPage$('.rating').text().trim()) || 0,
                downloads: 'N/A',
                lastUpdated: appPage$('.release-date').text().trim() || ''
            };
            return {
                success: true,
                data: appInfo,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Windows app error:', error.message);
            return {
                success: false,
                error: `Failed to fetch Windows app: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Get Mac app
    async getMacApp(appName) {
        try {
            if (!appName) {
                return { success: false, error: 'App name is required', creator: this.creator };
            }
            // Scrape Mac App Store
            const searchUrl = `https://www.apple.com/us/search/${encodeURIComponent(appName)}?src=serp`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const firstResult = $('.rf-serp-productname a').first().attr('href');
            if (!firstResult) {
                throw new Error('App not found on Mac App Store');
            }
            const appPageUrl = firstResult.startsWith('http') ? firstResult : `https://www.apple.com${firstResult}`;
            const appPageResponse = await axios.get(appPageUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const appPage$ = cheerio.load(appPageResponse.data);
            const appInfo = {
                appName: appPage$('.app-header__title').text().trim() || appName,
                packageName: `mac.${appName.toLowerCase().replace(/\s+/g, '')}`,
                version: appPage$('.version').text().trim() || 'Latest',
                platform: 'mac',
                downloadUrl: appPageUrl,
                directDownloadUrl: '', // Mac App Store apps require store installation
                developer: appPage$('.app-header__developer').text().trim() || 'Unknown',
                description: appPage$('.we-product-details__description').text().trim() || '',
                icon: appPage$('.we-artwork__image').attr('src') || '',
                screenshots: appPage$('.we-media-gallery__image').map((_, el) => appPage$(el).attr('src') || '').get(),
                rating: parseFloat(appPage$('.we-customer-ratings__average').text().trim()) || 0,
                downloads: 'N/A',
                lastUpdated: appPage$('.release-date').text().trim() || ''
            };
            return {
                success: true,
                data: appInfo,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Mac app error:', error.message);
            return {
                success: false,
                error: `Failed to fetch Mac app: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Get popular apps
    async getPopularApps(platform = 'android', category) {
        try {
            const searchUrl = platform === 'ios'
                ? 'https://www.apple.com/us/app-store/'
                : 'https://apkpure.com/charts/android/top';
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const apps = [];
            if (platform === 'ios') {
                $('.we-popular-app').slice(0, 10).each((_, el) => {
                    const appName = $(el).find('.we-popular-app__title').text().trim();
                    apps.push({
                        appName,
                        packageName: `ios.${appName.toLowerCase().replace(/\s+/g, '')}`,
                        developer: $(el).find('.we-popular-app__developer').text().trim() || 'Unknown',
                        icon: $(el).find('.we-popular-app__icon').attr('src') || '',
                        rating: parseFloat($(el).find('.we-customer-ratings__average').text().trim()) || 0,
                        downloads: 'N/A',
                        category: $(el).find('.we-popular-app__category').text().trim() || 'Unknown'
                    });
                });
            }
            else {
                $('.chart-list .app-item').slice(0, 10).each((_, el) => {
                    const appName = $(el).find('.app-name').text().trim();
                    const packageName = $(el).find('a').attr('href')?.split('/')[2] || `com.example.${appName.toLowerCase().replace(/\s+/g, '')}`;
                    apps.push({
                        appName,
                        packageName,
                        developer: $(el).find('.developer').text().trim() || 'Unknown',
                        icon: $(el).find('img').attr('src') || '',
                        rating: parseFloat($(el).find('.score').text().trim()) || 0,
                        downloads: $(el).find('.downloads').text().trim() || '0',
                        category: $(el).find('.category').text().trim() || 'Unknown'
                    });
                });
            }
            const searchResults = {
                apps,
                totalResults: apps.length
            };
            return {
                success: true,
                data: searchResults,
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Popular apps error:', error.message);
            return {
                success: false,
                error: `Failed to fetch popular apps: ${error.message || 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Helper methods
    detectPlatformFromFilename(filename) {
        if (filename.endsWith('.apk'))
            return 'android';
        if (filename.endsWith('.exe') || filename.endsWith('.msi'))
            return 'windows';
        if (filename.endsWith('.dmg') || filename.endsWith('.pkg'))
            return 'mac';
        if (filename.endsWith('.deb') || filename.endsWith('.rpm') || filename.endsWith('.tar.gz'))
            return 'linux';
        return 'unknown';
    }
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    // Get service status
    getStatus() {
        return {
            service: 'App Download API',
            version: '1.1.0',
            status: this.ytDlpWrap ? 'operational' : 'limited (yt-dlp not initialized)',
            supportedPlatforms: ['Android', 'iOS', 'Windows', 'macOS', 'Linux'],
            supportedSources: ['APKPure', 'APKMirror', 'GitHub Releases', 'Microsoft Store', 'Mac App Store'],
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
