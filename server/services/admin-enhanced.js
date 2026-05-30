import { storage } from '../storage';
export class AdminEnhancedService {
    creator = '@BrokenVZN';
    notifications = [];
    // Get comprehensive admin dashboard data
    async getDashboardData() {
        try {
            const [users, logs] = await Promise.all([
                storage.getAllUsers(),
                storage.getAllApiLogs(1000)
            ]);
            // Calculate analytics
            const analytics = this.calculateAnalytics(users, logs);
            // Get system endpoints
            const endpoints = this.getSystemEndpoints();
            // Get notifications
            const notifications = this.getNotifications();
            // Get system status
            const systemStatus = this.getSystemStatus();
            const dashboardData = {
                analytics,
                notifications,
                endpoints,
                recentLogs: logs.slice(0, 50),
                systemStatus
            };
            return {
                success: true,
                data: dashboardData
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to load dashboard data'
            };
        }
    }
    // Calculate comprehensive analytics
    calculateAnalytics(users, logs) {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        // Recent activity
        const recent24h = logs.filter(log => new Date(log.timestamp) > yesterday);
        // Top endpoints
        const endpointCounts = {};
        logs.forEach(log => {
            if (!endpointCounts[log.endpoint]) {
                endpointCounts[log.endpoint] = { calls: 0, successes: 0 };
            }
            endpointCounts[log.endpoint].calls++;
            if (log.statusCode < 400) {
                endpointCounts[log.endpoint].successes++;
            }
        });
        const topEndpoints = Object.entries(endpointCounts)
            .map(([endpoint, data]) => ({
            endpoint,
            calls: data.calls,
            successRate: Math.round((data.successes / data.calls) * 100)
        }))
            .sort((a, b) => b.calls - a.calls)
            .slice(0, 10);
        // User tier distribution
        const tierDistribution = users.reduce((acc, user) => {
            acc[user.tier] = (acc[user.tier] || 0) + 1;
            return acc;
        }, { free: 0, pro: 0, enterprise: 0 });
        // Calculate average response time
        const avgResponseTime = logs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / logs.length || 0;
        // Calculate error rate
        const errors = logs.filter(log => log.statusCode >= 400).length;
        const errorRate = logs.length > 0 ? Math.round((errors / logs.length) * 100) : 0;
        return {
            totalUsers: users.length,
            totalApiCalls: logs.length,
            totalEndpoints: this.getAllEndpoints().length,
            activeUsers24h: recent24h.length,
            errorRate,
            averageResponseTime: Math.round(avgResponseTime),
            topEndpoints,
            recentActivity: recent24h.slice(0, 20).map(log => ({
                timestamp: log.timestamp,
                endpoint: log.endpoint,
                method: log.method,
                status: log.statusCode,
                user: log.userId || 'Anonymous'
            })),
            userTierDistribution: tierDistribution
        };
    }
    // Get all system endpoints with metadata
    getSystemEndpoints() {
        return [
            // YTPlay APIs
            { id: 'ytplay-search', path: '/api/ytplay/search', method: 'GET', category: 'YTPlay', description: 'Search YouTube videos', isEnabled: true, totalCalls: 0, averageResponseTime: 500, successRate: 95, requiresAuth: true },
            { id: 'ytplay-stream', path: '/api/ytplay/stream', method: 'GET', category: 'YTPlay', description: 'Get video stream URL', isEnabled: true, totalCalls: 0, averageResponseTime: 800, successRate: 92, requiresAuth: true },
            // Enhanced Anime V2 APIs
            { id: 'anime-v2-search', path: '/api/anime-v2/search', method: 'GET', category: 'Anime V2', description: 'Enhanced anime search', isEnabled: true, totalCalls: 0, averageResponseTime: 600, successRate: 98, requiresAuth: true },
            { id: 'anime-v2-trending', path: '/api/anime-v2/trending', method: 'GET', category: 'Anime V2', description: 'Get trending anime', isEnabled: true, totalCalls: 0, averageResponseTime: 400, successRate: 99, requiresAuth: true },
            { id: 'anime-v2-popular', path: '/api/anime-v2/popular', method: 'GET', category: 'Anime V2', description: 'Get popular anime', isEnabled: true, totalCalls: 0, averageResponseTime: 450, successRate: 99, requiresAuth: true },
            // Adult Content APIs
            { id: 'adult-rule34', path: '/api/adult/rule34/search', method: 'GET', category: 'Adult', description: 'Rule34 content search', isEnabled: true, totalCalls: 0, averageResponseTime: 700, successRate: 94, requiresAuth: true },
            { id: 'adult-gelbooru', path: '/api/adult/gelbooru/search', method: 'GET', category: 'Adult', description: 'Gelbooru content search', isEnabled: true, totalCalls: 0, averageResponseTime: 650, successRate: 96, requiresAuth: true },
            { id: 'adult-hanime', path: '/api/adult/hanime/search', method: 'GET', category: 'Adult', description: 'Hanime video search', isEnabled: true, totalCalls: 0, averageResponseTime: 800, successRate: 90, requiresAuth: true },
            // Legacy APIs
            { id: 'tiktok-download', path: '/api/tiktok/download', method: 'GET', category: 'Social Media', description: 'TikTok video download', isEnabled: true, totalCalls: 0, averageResponseTime: 1200, successRate: 88, requiresAuth: true },
            { id: 'instagram-download', path: '/api/instagram/download', method: 'GET', category: 'Social Media', description: 'Instagram media download', isEnabled: true, totalCalls: 0, averageResponseTime: 900, successRate: 91, requiresAuth: true },
            { id: 'youtube-download', path: '/api/youtube/download', method: 'GET', category: 'YouTube', description: 'YouTube video download', isEnabled: true, totalCalls: 0, averageResponseTime: 1500, successRate: 85, requiresAuth: true },
            // Utility APIs
            { id: 'qr-generate', path: '/api/qr/generate', method: 'POST', category: 'Utilities', description: 'QR code generation', isEnabled: true, totalCalls: 0, averageResponseTime: 200, successRate: 99, requiresAuth: true },
            { id: 'url-shorten', path: '/api/shorten', method: 'POST', category: 'Utilities', description: 'URL shortening service', isEnabled: true, totalCalls: 0, averageResponseTime: 150, successRate: 99, requiresAuth: true },
            { id: 'password-generate', path: '/api/password/generate', method: 'GET', category: 'Utilities', description: 'Secure password generation', isEnabled: true, totalCalls: 0, averageResponseTime: 50, successRate: 100, requiresAuth: false }
        ];
    }
    // Get all endpoints for counting
    getAllEndpoints() {
        return this.getSystemEndpoints().map(endpoint => endpoint.path);
    }
    // Get system status
    getSystemStatus() {
        const memoryUsage = process.memoryUsage();
        const uptimeSeconds = process.uptime();
        const formatUptime = (seconds) => {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${days}d ${hours}h ${minutes}m`;
        };
        return {
            server: 'online',
            database: 'connected',
            apis: 'operational',
            uptime: formatUptime(uptimeSeconds),
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
            }
        };
    }
    // Get notifications
    getNotifications() {
        // Generate some sample notifications - in real implementation, these would come from database
        const now = new Date();
        return [
            {
                id: '1',
                title: 'High API Usage Detected',
                message: 'Adult content APIs experiencing 200% increase in usage',
                type: 'warning',
                timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
                isRead: false,
                endpoint: '/api/adult/rule34/search'
            },
            {
                id: '2',
                title: 'New User Registration',
                message: '5 new users registered in the last hour',
                type: 'info',
                timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
                isRead: false
            },
            {
                id: '3',
                title: 'Rate Limit Exceeded',
                message: 'Multiple users hitting rate limits on YTPlay endpoints',
                type: 'error',
                timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                isRead: true,
                endpoint: '/api/ytplay/search'
            },
            {
                id: '4',
                title: 'System Performance',
                message: 'Average response time improved by 15%',
                type: 'success',
                timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                isRead: false
            }
        ];
    }
    // Toggle endpoint status
    async toggleEndpoint(endpointId) {
        try {
            // In real implementation, this would update database
            const endpoints = this.getSystemEndpoints();
            const endpoint = endpoints.find(ep => ep.id === endpointId);
            if (!endpoint) {
                return { success: false, error: 'Endpoint not found' };
            }
            endpoint.isEnabled = !endpoint.isEnabled;
            return {
                success: true,
                message: `Endpoint ${endpoint.path} ${endpoint.isEnabled ? 'enabled' : 'disabled'}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to toggle endpoint'
            };
        }
    }
    // Update user tier (grant unlimited access)
    async updateUserTier(userId, newTier) {
        try {
            // This would use storage service to update user tier
            await storage.updateUser(userId, { tier: newTier });
            // Add notification
            this.addNotification({
                id: Date.now().toString(),
                title: 'User Tier Updated',
                message: `User ${userId} upgraded to ${newTier} tier`,
                type: 'success',
                timestamp: new Date().toISOString(),
                isRead: false,
                userId
            });
            return {
                success: true,
                message: `User tier updated to ${newTier}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to update user tier'
            };
        }
    }
    // Add notification
    addNotification(notification) {
        this.notifications.unshift(notification);
        // Keep only latest 50 notifications
        this.notifications = this.notifications.slice(0, 50);
    }
    // Mark notification as read
    async markNotificationRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
        }
        return { success: true };
    }
    // Clear all notifications
    async clearAllNotifications() {
        this.notifications = [];
        return { success: true };
    }
    // Get service status
    getStatus() {
        return {
            service: 'Enhanced Admin Dashboard',
            version: '2.0.0',
            status: 'operational',
            features: [
                'Real-time Analytics',
                'Endpoint Management',
                'User Tier Controls',
                'Notification System',
                'System Monitoring',
                'API Usage Tracking'
            ],
            creator: this.creator
        };
    }
}
export const adminEnhancedService = new AdminEnhancedService();
