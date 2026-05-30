import { randomUUID } from "crypto";
import { getFirestore } from "./db";
export class FirebaseStorage {
    memoryFallback;
    constructor() {
        this.memoryFallback = new Map();
        this.createDefaultAdmin();
    }
    get db() {
        return getFirestore();
    }
    async createDefaultAdmin() {
        const defaultAdmin = {
            _id: randomUUID(),
            email: String(process.env.ADMIN_EMAIL || 'akewusholaabdulbakri101@gmail.com').toLowerCase(),
            password: null,
            authProvider: "google.com",
            role: "admin",
            createdAt: new Date(),
        };
        try {
            const db = this.db;
            if (db) {
                const existing = await db.query('admins', { field: 'email', value: defaultAdmin.email }, { limit: 1 });
                if (existing.length === 0) {
                    await db.setDoc('admins', defaultAdmin._id, defaultAdmin);
                }
                return;
            }
        }
        catch (error) {
            console.error("Failed to create default Firebase admin:", error);
        }
        this.memoryFallback.set('admin-' + defaultAdmin.email, defaultAdmin);
    }
    async getUser(id) {
        const db = this.db;
        if (db) {
            try {
                return await db.getDoc('users', id);
            }
            catch (error) {
                console.error("Firebase getUser error:", error);
            }
        }
        return this.memoryFallback.get('user-' + id);
    }
    async getUserByUsername(username) {
        const db = this.db;
        if (db) {
            try {
                const users = await db.query('users', { field: 'username', value: username }, { limit: 1 });
                return users[0];
            }
            catch (error) {
                console.error("Firebase getUserByUsername error:", error);
            }
        }
        return Array.from(this.memoryFallback.values()).find((item) => item.username === username);
    }
    async getUserByEmail(email) {
        const normalizedEmail = String(email || '').toLowerCase();
        const db = this.db;
        if (db) {
            try {
                const users = await db.query('users', { field: 'email', value: normalizedEmail }, { limit: 1 });
                return users[0];
            }
            catch (error) {
                console.error("Firebase getUserByEmail error:", error);
            }
        }
        return Array.from(this.memoryFallback.values()).find((item) => item.apiKey !== undefined && item.email === normalizedEmail);
    }
    async getUserByFirebaseUid(firebaseUid) {
        const db = this.db;
        if (db) {
            try {
                const users = await db.query('users', { field: 'firebaseUid', value: firebaseUid }, { limit: 1 });
                return users[0];
            }
            catch (error) {
                console.error("Firebase getUserByFirebaseUid error:", error);
            }
        }
        return Array.from(this.memoryFallback.values()).find((item) => item.apiKey !== undefined && item.firebaseUid === firebaseUid);
    }
    async getUserByApiKey(apiKey) {
        const db = this.db;
        if (db) {
            try {
                const users = await db.query('users', { field: 'apiKey', value: apiKey }, { limit: 1 });
                return users[0];
            }
            catch (error) {
                console.error("Firebase getUserByApiKey error:", error);
            }
        }
        return Array.from(this.memoryFallback.values()).find((item) => item.apiKey === apiKey);
    }
    async createUser(insertUser) {
        const id = randomUUID();
        const normalizedEmail = insertUser.email ? String(insertUser.email).toLowerCase() : null;
        const userData = {
            _id: id,
            username: insertUser.username || normalizedEmail || `user-${id.slice(0, 8)}`,
            email: normalizedEmail,
            password: insertUser.password || null,
            firebaseUid: insertUser.firebaseUid || null,
            displayName: insertUser.displayName || insertUser.username || normalizedEmail || '',
            photoURL: insertUser.photoURL || null,
            authProvider: insertUser.authProvider || 'password',
            apiKey: `bvzn_${randomUUID().replace(/-/g, '')}`,
            requestCount: 0,
            tier: insertUser.tier || "free",
            role: insertUser.role || "user",
            isActive: true,
            lastLogin: new Date(),
            createdAt: new Date(),
        };
        const db = this.db;
        if (db) {
            try {
                await db.setDoc('users', id, userData);
                return userData;
            }
            catch (error) {
                console.error("Firebase createUser error:", error);
            }
        }
        this.memoryFallback.set('user-' + id, userData);
        return userData;
    }
    async updateUser(userId, updates) {
        const existing = await this.getUser(userId);
        if (!existing) return undefined;
        const updated = { ...existing, ...updates, _id: userId };
        const db = this.db;
        if (db) {
            try {
                await db.setDoc('users', userId, updated);
                return updated;
            }
            catch (error) {
                console.error("Firebase updateUser error:", error);
            }
        }
        this.memoryFallback.set('user-' + userId, updated);
        return updated;
    }
    async updateUserRequestCount(userId, count) {
        const db = this.db;
        if (db) {
            try {
                const existing = await db.getDoc('users', userId);
                if (existing)
                    await db.setDoc('users', userId, { ...existing, requestCount: count });
                return;
            }
            catch (error) {
                console.error("Firebase updateUserRequestCount error:", error);
            }
        }
        const user = this.memoryFallback.get('user-' + userId);
        if (user) {
            user.requestCount = count;
            this.memoryFallback.set('user-' + userId, user);
        }
    }
    async createApiLog(insertLog) {
        const id = randomUUID();
        const logEntry = {
            _id: id,
            userId: insertLog.userId || null,
            endpoint: insertLog.endpoint,
            method: insertLog.method,
            statusCode: insertLog.statusCode,
            responseTime: insertLog.responseTime || null,
            timestamp: new Date(),
        };
        const db = this.db;
        if (db) {
            try {
                await db.setDoc('apiLogs', id, logEntry);
                return logEntry;
            }
            catch (error) {
                console.error("Firebase createApiLog error:", error);
            }
        }
        this.memoryFallback.set('log-' + id, logEntry);
        return logEntry;
    }
    async getApiLogsByUser(userId, limit = 100) {
        const db = this.db;
        if (db) {
            try {
                return await db.query('apiLogs', { field: 'userId', value: userId }, { orderBy: 'timestamp', direction: 'DESCENDING', limit });
            }
            catch (error) {
                console.error("Firebase getApiLogsByUser error:", error);
            }
        }
        return Array.from(this.memoryFallback.values())
            .filter((item) => item.userId === userId && item.endpoint !== undefined)
            .slice(0, limit);
    }
    async createShortUrl(insertData) {
        const id = randomUUID();
        const shortCode = insertData.shortCode || this.generateShortCode();
        const urlEntry = {
            _id: id,
            shortCode,
            originalUrl: insertData.originalUrl,
            userId: insertData.userId || null,
            clicks: 0,
            createdAt: new Date(),
        };
        const db = this.db;
        if (db) {
            try {
                await db.setDoc('urlShorteners', id, urlEntry);
                return urlEntry;
            }
            catch (error) {
                console.error("Firebase createShortUrl error:", error);
            }
        }
        this.memoryFallback.set('url-' + shortCode, urlEntry);
        return urlEntry;
    }
    async getUrlByShortCode(shortCode) {
        const db = this.db;
        if (db) {
            try {
                const urls = await db.query('urlShorteners', { field: 'shortCode', value: shortCode }, { limit: 1 });
                return urls[0];
            }
            catch (error) {
                console.error("Firebase getUrlByShortCode error:", error);
            }
        }
        return this.memoryFallback.get('url-' + shortCode);
    }
    async incrementUrlClicks(shortCode) {
        const db = this.db;
        if (db) {
            try {
                const urls = await db.query('urlShorteners', { field: 'shortCode', value: shortCode }, { limit: 1 });
                if (urls[0]?._id) {
                    await db.setDoc('urlShorteners', urls[0]._id, { ...urls[0], clicks: (urls[0].clicks || 0) + 1 });
                }
                return;
            }
            catch (error) {
                console.error("Firebase incrementUrlClicks error:", error);
            }
        }
        const url = this.memoryFallback.get('url-' + shortCode);
        if (url) {
            url.clicks = (url.clicks || 0) + 1;
            this.memoryFallback.set('url-' + shortCode, url);
        }
    }
    async getUserUrls(userId) {
        const db = this.db;
        if (db) {
            try {
                return await db.query('urlShorteners', { field: 'userId', value: userId });
            }
            catch (error) {
                console.error("Firebase getUserUrls error:", error);
            }
        }
        return Array.from(this.memoryFallback.values()).filter((item) => item.userId === userId && item.shortCode !== undefined);
    }
    async getAdminByEmail(email) {
        const normalizedEmail = String(email || '').toLowerCase();
        const db = this.db;
        if (db) {
            try {
                const admins = await db.query('admins', { field: 'email', value: normalizedEmail }, { limit: 1 });
                return admins[0];
            }
            catch (error) {
                console.error("Firebase getAdminByEmail error:", error);
            }
        }
        return this.memoryFallback.get('admin-' + normalizedEmail);
    }
    async createAdmin(insertAdmin) {
        const id = randomUUID();
        const adminData = {
            _id: id,
            email: String(insertAdmin.email || '').toLowerCase(),
            password: insertAdmin.password || null,
            authProvider: insertAdmin.authProvider || 'google.com',
            role: insertAdmin.role || "admin",
            createdAt: new Date(),
        };
        const db = this.db;
        if (db) {
            try {
                await db.setDoc('admins', id, adminData);
                return adminData;
            }
            catch (error) {
                console.error("Firebase createAdmin error:", error);
            }
        }
        this.memoryFallback.set('admin-' + adminData.email, adminData);
        return adminData;
    }
    async getAllUsers() {
        const db = this.db;
        if (db) {
            try {
                return await db.query('users', undefined, { limit: 1000 });
            }
            catch (error) {
                console.error("Firebase getAllUsers error:", error);
            }
        }
        return Array.from(this.memoryFallback.values()).filter((item) => item.username !== undefined && item.apiKey !== undefined);
    }
    async getAllApiLogs(limit = 1000) {
        const db = this.db;
        if (db) {
            try {
                return await db.query('apiLogs', undefined, { orderBy: 'timestamp', direction: 'DESCENDING', limit });
            }
            catch (error) {
                console.error("Firebase getAllApiLogs error:", error);
            }
        }
        return Array.from(this.memoryFallback.values())
            .filter((item) => item.endpoint !== undefined)
            .slice(0, limit);
    }
    generateShortCode() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
export const storage = new FirebaseStorage();
