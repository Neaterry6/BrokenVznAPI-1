import axios from 'axios';
import * as cheerio from 'cheerio';
export class EnhancedAPKSearchService {
    creator = '@BrokenVZN';
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    // Enhanced APK search with multiple sources
    async searchApps(query, page = 1, limit = 10) {
        try {
            const searchPromises = [
                this.searchAPKPure(query, limit),
                this.searchUptodown(query, limit),
                this.searchFDroid(query, limit)
            ];
            const results = await Promise.allSettled(searchPromises);
            const allApps = [];
            // Collect results from all sources
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.length > 0) {
                    allApps.push(...result.value);
                }
            });
            if (allApps.length === 0) {
                return {
                    success: false,
                    error: `No apps found for "${query}"`,
                    creator: this.creator
                };
            }
            // Remove duplicates and paginate
            const uniqueApps = this.removeDuplicateApps(allApps);
            const startIndex = (page - 1) * limit;
            const paginatedApps = uniqueApps.slice(startIndex, startIndex + limit);
            return {
                success: true,
                data: {
                    apps: paginatedApps,
                    query,
                    totalResults: uniqueApps.length,
                    page
                },
                creator: this.creator
            };
        }
        catch (error) {
            console.error('Enhanced APK search error:', error);
            return {
                success: false,
                error: `App search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Search APKPure
    async searchAPKPure(query, limit) {
        try {
            const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const apps = [];
            $('.search-dl .search-item').slice(0, limit).each((index, element) => {
                const $el = $(element);
                const appName = $el.find('.p1 a').text().trim();
                const packageName = this.extractPackageFromUrl($el.find('.p1 a').attr('href') || '');
                const developer = $el.find('.p2').text().trim();
                const icon = $el.find('.icon img').attr('src') || $el.find('.icon img').attr('data-src') || '';
                const rating = parseFloat($el.find('.stars').attr('data-score') || '0') || 0;
                const downloadUrl = `https://apkpure.com${$el.find('.p1 a').attr('href')}`;
                if (appName) {
                    apps.push({
                        appName,
                        packageName: packageName || `apkpure.${appName.toLowerCase().replace(/\s+/g, '')}`,
                        developer: developer || 'Unknown Developer',
                        icon: icon.startsWith('//') ? `https:${icon}` : icon,
                        rating,
                        downloads: 'N/A',
                        category: 'Apps',
                        downloadUrl,
                        source: 'APKPure'
                    });
                }
            });
            return apps;
        }
        catch (error) {
            console.warn('APKPure search failed:', error);
            return [];
        }
    }
    // Search Uptodown
    async searchUptodown(query, limit) {
        try {
            const searchUrl = `https://en.uptodown.com/android/search/${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);
            const apps = [];
            $('.item').slice(0, limit).each((index, element) => {
                const $el = $(element);
                const appName = $el.find('.name').text().trim();
                const developer = $el.find('.author').text().trim();
                const icon = $el.find('.icon img').attr('src') || '';
                const rating = parseFloat($el.find('.rating').text().trim()) || 0;
                const version = $el.find('.version').text().trim();
                const downloadUrl = $el.find('a').attr('href') || '';
                if (appName) {
                    apps.push({
                        appName,
                        packageName: `uptodown.${appName.toLowerCase().replace(/\s+/g, '')}`,
                        developer: developer || 'Unknown Developer',
                        icon: icon.startsWith('//') ? `https:${icon}` : (icon.startsWith('/') ? `https://en.uptodown.com${icon}` : icon),
                        rating,
                        downloads: 'N/A',
                        version,
                        category: 'Android Apps',
                        downloadUrl: downloadUrl.startsWith('/') ? `https://en.uptodown.com${downloadUrl}` : downloadUrl,
                        source: 'Uptodown'
                    });
                }
            });
            return apps;
        }
        catch (error) {
            console.warn('Uptodown search failed:', error);
            return [];
        }
    }
    // Search F-Droid (Open Source Apps)
    async searchFDroid(query, limit) {
        try {
            const searchUrl = `https://search.f-droid.org/?q=${encodeURIComponent(query)}&lang=en`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 10000
            });
            // F-Droid search returns JSON
            const apps = [];
            if (response.data && response.data.packages) {
                response.data.packages.slice(0, limit).forEach((pkg) => {
                    apps.push({
                        appName: pkg.name || pkg.packageName,
                        packageName: pkg.packageName,
                        developer: pkg.authorName || 'F-Droid Community',
                        icon: pkg.icon ? `https://f-droid.org/repo/icons-640/${pkg.icon}` : '',
                        rating: 4.5, // F-Droid apps are generally high quality
                        downloads: 'Open Source',
                        version: pkg.suggestedVersionName || 'Latest',
                        category: pkg.categories?.[0] || 'Open Source',
                        description: pkg.summary || pkg.description || '',
                        downloadUrl: `https://f-droid.org/packages/${pkg.packageName}`,
                        source: 'F-Droid'
                    });
                });
            }
            return apps;
        }
        catch (error) {
            console.warn('F-Droid search failed:', error);
            return [];
        }
    }
    // Get popular apps from multiple sources
    async getPopularApps(category) {
        try {
            const popularQueries = category ? [category] : [
                'WhatsApp', 'Instagram', 'TikTok', 'YouTube', 'Spotify',
                'Netflix', 'Telegram', 'Discord', 'Chrome', 'Twitter'
            ];
            const allApps = [];
            for (const query of popularQueries.slice(0, 5)) {
                const result = await this.searchApps(query, 1, 3);
                if (result.success && result.data?.apps) {
                    allApps.push(...result.data.apps);
                }
            }
            const uniqueApps = this.removeDuplicateApps(allApps);
            return {
                success: true,
                data: {
                    apps: uniqueApps.slice(0, 20),
                    query: category || 'popular apps',
                    totalResults: uniqueApps.length,
                    page: 1
                },
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to get popular apps',
                creator: this.creator
            };
        }
    }
    // Get app details with download links
    async getAppDetails(packageName, source) {
        try {
            let appDetails = null;
            // Try different sources based on preference
            const sources = source ? [source] : ['APKPure', 'Uptodown', 'F-Droid'];
            for (const src of sources) {
                try {
                    if (src === 'APKPure') {
                        appDetails = await this.getAPKPureDetails(packageName);
                    }
                    else if (src === 'Uptodown') {
                        appDetails = await this.getUptodownDetails(packageName);
                    }
                    else if (src === 'F-Droid') {
                        appDetails = await this.getFDroidDetails(packageName);
                    }
                    if (appDetails)
                        break;
                }
                catch (error) {
                    console.warn(`${src} details failed:`, error);
                    continue;
                }
            }
            if (!appDetails) {
                return {
                    success: false,
                    error: `App details not found for ${packageName}`,
                    creator: this.creator
                };
            }
            return {
                success: true,
                data: {
                    apps: [appDetails],
                    query: packageName,
                    totalResults: 1,
                    page: 1
                },
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get app details: ${error instanceof Error ? error.message : 'Unknown error'}`,
                creator: this.creator
            };
        }
    }
    // Helper methods
    async getAPKPureDetails(packageName) {
        try {
            const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(packageName)}`;
            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 10000
            });
            const $ = cheerio.load(response.data);
            const firstResult = $('.search-dl .search-item').first();
            if (!firstResult.length)
                return null;
            return {
                appName: firstResult.find('.p1 a').text().trim(),
                packageName,
                developer: firstResult.find('.p2').text().trim(),
                icon: firstResult.find('.icon img').attr('src') || '',
                rating: parseFloat(firstResult.find('.stars').attr('data-score') || '0'),
                downloads: 'N/A',
                downloadUrl: `https://apkpure.com${firstResult.find('.p1 a').attr('href')}`,
                source: 'APKPure'
            };
        }
        catch {
            return null;
        }
    }
    async getUptodownDetails(packageName) {
        // Similar implementation for Uptodown
        return null; // Placeholder
    }
    async getFDroidDetails(packageName) {
        try {
            const apiUrl = `https://f-droid.org/api/v1/packages/${packageName}`;
            const response = await axios.get(apiUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 10000
            });
            const pkg = response.data;
            return {
                appName: pkg.name,
                packageName: pkg.packageName,
                developer: pkg.authorName || 'F-Droid Community',
                icon: pkg.icon ? `https://f-droid.org/repo/icons-640/${pkg.icon}` : '',
                rating: 4.5,
                downloads: 'Open Source',
                version: pkg.suggestedVersionName,
                description: pkg.summary,
                downloadUrl: `https://f-droid.org/packages/${packageName}`,
                source: 'F-Droid'
            };
        }
        catch {
            return null;
        }
    }
    removeDuplicateApps(apps) {
        const seen = new Set();
        return apps.filter(app => {
            const key = app.packageName || app.appName;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
    extractPackageFromUrl(url) {
        const match = url.match(/\/([^\/]+)$/);
        return match ? match[1] : '';
    }
    // Get service status
    getStatus() {
        return {
            service: 'Enhanced APK Search API',
            version: '2.0.0',
            status: 'operational',
            supportedSources: ['APKPure', 'Uptodown', 'F-Droid'],
            features: [
                'Multi-source App Search',
                'Popular Apps Discovery',
                'App Details & Downloads',
                'Open Source Apps Support',
                'Duplicate Filtering',
                'Enhanced Error Handling'
            ],
            creator: this.creator
        };
    }
}
export const enhancedAPKSearchService = new EnhancedAPKSearchService();
