import { User as MongoUser, ApiLog as MongoApiLog, UrlShortener as MongoUrlShortener, Admin as MongoAdmin, type User, type ApiLog, type UrlShortener, type Admin, type InsertUser, type InsertApiLog, type InsertUrlShortener, type InsertAdmin } from "@shared/schema";
import mongoose from "mongoose";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByApiKey(apiKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRequestCount(userId: string, count: number): Promise<void>;

  // API logging
  createApiLog(log: InsertApiLog): Promise<ApiLog>;
  getApiLogsByUser(userId: string, limit?: number): Promise<ApiLog[]>;

  // URL shortener
  createShortUrl(data: InsertUrlShortener): Promise<UrlShortener>;
  getUrlByShortCode(shortCode: string): Promise<UrlShortener | undefined>;
  incrementUrlClicks(shortCode: string): Promise<void>;
  getUserUrls(userId: string): Promise<UrlShortener[]>;

  // Admin management
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAllUsers(): Promise<User[]>;
  getAllApiLogs(limit?: number): Promise<ApiLog[]>;
}

export class MongoStorage implements IStorage {
  private memoryFallback: Map<string, any>;
  private isConnected: boolean = false;

  constructor() {
    this.memoryFallback = new Map();
    this.checkConnection();
    this.createDefaultAdmin();
  }

  private async checkConnection() {
    try {
      this.isConnected = mongoose.connection.readyState === 1;
      if (!this.isConnected) {
        // Try to reconnect
        setTimeout(() => this.checkConnection(), 5000);
      }
    } catch (error) {
      this.isConnected = false;
    }
  }

  private async createDefaultAdmin() {
    try {
      if (this.isConnected) {
        const existingAdmin = await MongoAdmin.findOne({ email: "akewusholaabdulbakri101@gmail.com" });
        if (!existingAdmin) {
          await MongoAdmin.create({
            email: "akewusholaabdulbakri101@gmail.com",
            password: "Makemoney@11",
            role: "admin",
          });
        }
      } else {
        // Create in memory fallback
        const defaultAdmin = {
          _id: randomUUID(),
          email: "akewusholaabdulbakri101@gmail.com",
          password: "Makemoney@11",
          role: "admin",
          createdAt: new Date(),
        };
        this.memoryFallback.set('admin-' + defaultAdmin.email, defaultAdmin);
      }
    } catch (error) {
      console.error("Failed to create default admin:", error);
      // Fallback to memory
      const defaultAdmin = {
        _id: randomUUID(),
        email: "akewusholaabdulbakri101@gmail.com",
        password: "Makemoney@11",
        role: "admin",
        createdAt: new Date(),
      };
      this.memoryFallback.set('admin-' + defaultAdmin.email, defaultAdmin);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    if (this.isConnected) {
      try {
        const user = await MongoUser.findById(id);
        return user ? user.toObject() as User : undefined;
      } catch (error) {
        console.error("MongoDB getUser error:", error);
      }
    }
    return this.memoryFallback.get('user-' + id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (this.isConnected) {
      try {
        const user = await MongoUser.findOne({ username });
        return user ? user.toObject() as User : undefined;
      } catch (error) {
        console.error("MongoDB getUserByUsername error:", error);
      }
    }
    
    const users = Array.from(this.memoryFallback.values()).filter((item: any) => 
      item.username === username && item.username !== undefined
    );
    return users[0];
  }

  async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    if (this.isConnected) {
      try {
        const user = await MongoUser.findOne({ apiKey });
        return user ? user.toObject() as User : undefined;
      } catch (error) {
        console.error("MongoDB getUserByApiKey error:", error);
      }
    }
    
    const users = Array.from(this.memoryFallback.values()).filter((item: any) => 
      item.apiKey === apiKey && item.apiKey !== undefined
    );
    return users[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const apiKey = `bvzn_${randomUUID().replace(/-/g, '')}`;
    
    const userData = { 
      username: insertUser.username,
      email: insertUser.email || null,
      password: insertUser.password,
      apiKey,
      requestCount: 0,
      tier: insertUser.tier || "free",
      role: insertUser.role || "user",
      isActive: true,
      lastLogin: null,
    };

    if (this.isConnected) {
      try {
        const user = new MongoUser(userData);
        await user.save();
        return user.toObject() as User;
      } catch (error) {
        console.error("MongoDB createUser error:", error);
      }
    }
    
    // Memory fallback
    const id = randomUUID();
    const memoryUserData: User = {
      _id: id,
      ...userData,
      createdAt: new Date(),
    };
    this.memoryFallback.set('user-' + id, memoryUserData);
    return memoryUserData;
  }

  async updateUserRequestCount(userId: string, count: number): Promise<void> {
    if (this.isConnected) {
      try {
        await MongoUser.findByIdAndUpdate(userId, { requestCount: count });
        return;
      } catch (error) {
        console.error("MongoDB updateUserRequestCount error:", error);
      }
    }
    
    const user = this.memoryFallback.get('user-' + userId);
    if (user) {
      user.requestCount = count;
      this.memoryFallback.set('user-' + userId, user);
    }
  }

  async createApiLog(insertLog: InsertApiLog): Promise<ApiLog> {
    const logEntry = {
      userId: insertLog.userId || null,
      endpoint: insertLog.endpoint,
      method: insertLog.method,
      statusCode: insertLog.statusCode,
      responseTime: insertLog.responseTime || null,
      timestamp: new Date(),
    };

    if (this.isConnected) {
      try {
        const log = new MongoApiLog(logEntry);
        await log.save();
        return log.toObject() as ApiLog;
      } catch (error) {
        console.error("MongoDB createApiLog error:", error);
      }
    }
    
    // Memory fallback
    const id = randomUUID();
    const memoryLogData: ApiLog = {
      _id: id,
      ...logEntry
    };
    this.memoryFallback.set('log-' + id, memoryLogData);
    return memoryLogData;
  }

  async getApiLogsByUser(userId: string, limit = 100): Promise<ApiLog[]> {
    if (this.isConnected) {
      try {
        const logs = await MongoApiLog.find({ userId })
          .sort({ timestamp: -1 })
          .limit(limit);
        return logs.map(log => log.toObject() as ApiLog);
      } catch (error) {
        console.error("MongoDB getApiLogsByUser error:", error);
      }
    }
    
    const logs = Array.from(this.memoryFallback.values()).filter((item: any) => 
      item.userId === userId && item.endpoint !== undefined
    );
    return logs.slice(0, limit);
  }

  async createShortUrl(insertData: InsertUrlShortener): Promise<UrlShortener> {
    const shortCode = insertData.shortCode || this.generateShortCode();
    const urlEntry = {
      shortCode,
      originalUrl: insertData.originalUrl,
      userId: insertData.userId || null,
      clicks: 0,
    };

    if (this.isConnected) {
      try {
        const url = new MongoUrlShortener(urlEntry);
        await url.save();
        return url.toObject() as UrlShortener;
      } catch (error) {
        console.error("MongoDB createShortUrl error:", error);
      }
    }
    
    // Memory fallback
    const id = randomUUID();
    const memoryUrlData: UrlShortener = {
      _id: id,
      ...urlEntry,
      createdAt: new Date(),
    };
    this.memoryFallback.set('url-' + shortCode, memoryUrlData);
    return memoryUrlData;
  }

  async getUrlByShortCode(shortCode: string): Promise<UrlShortener | undefined> {
    if (this.isConnected) {
      try {
        const url = await MongoUrlShortener.findOne({ shortCode });
        return url ? url.toObject() as UrlShortener : undefined;
      } catch (error) {
        console.error("MongoDB getUrlByShortCode error:", error);
      }
    }
    
    return this.memoryFallback.get('url-' + shortCode);
  }

  async incrementUrlClicks(shortCode: string): Promise<void> {
    if (this.isConnected) {
      try {
        await MongoUrlShortener.findOneAndUpdate(
          { shortCode }, 
          { $inc: { clicks: 1 } }
        );
        return;
      } catch (error) {
        console.error("MongoDB incrementUrlClicks error:", error);
      }
    }
    
    const url = this.memoryFallback.get('url-' + shortCode);
    if (url) {
      url.clicks = (url.clicks || 0) + 1;
      this.memoryFallback.set('url-' + shortCode, url);
    }
  }

  async getUserUrls(userId: string): Promise<UrlShortener[]> {
    if (this.isConnected) {
      try {
        const urls = await MongoUrlShortener.find({ userId });
        return urls.map(url => url.toObject() as UrlShortener);
      } catch (error) {
        console.error("MongoDB getUserUrls error:", error);
      }
    }
    
    const urls = Array.from(this.memoryFallback.values()).filter((item: any) => 
      item.userId === userId && item.shortCode !== undefined
    );
    return urls;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    if (this.isConnected) {
      try {
        const admin = await MongoAdmin.findOne({ email });
        return admin ? admin.toObject() as Admin : undefined;
      } catch (error) {
        console.error("MongoDB getAdminByEmail error:", error);
      }
    }
    
    return this.memoryFallback.get('admin-' + email);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const adminData: Admin = { 
      _id: id,
      email: insertAdmin.email,
      password: insertAdmin.password,
      role: insertAdmin.role || "admin",
      createdAt: new Date(),
    };

    if (this.isConnected) {
      try {
        const admin = new MongoAdmin(adminData);
        await admin.save();
        return admin.toObject() as Admin;
      } catch (error) {
        console.error("MongoDB createAdmin error:", error);
      }
    }
    
    this.memoryFallback.set('admin-' + insertAdmin.email, adminData);
    return adminData;
  }

  async getAllUsers(): Promise<User[]> {
    if (this.isConnected) {
      try {
        const users = await MongoUser.find({});
        return users.map(user => user.toObject() as User);
      } catch (error) {
        console.error("MongoDB getAllUsers error:", error);
      }
    }
    
    const users = Array.from(this.memoryFallback.values()).filter((item: any) => 
      item.username !== undefined && item.apiKey !== undefined
    );
    return users;
  }

  async getAllApiLogs(limit = 1000): Promise<ApiLog[]> {
    if (this.isConnected) {
      try {
        const logs = await MongoApiLog.find({})
          .sort({ timestamp: -1 })
          .limit(limit);
        return logs.map(log => log.toObject() as ApiLog);
      } catch (error) {
        console.error("MongoDB getAllApiLogs error:", error);
      }
    }
    
    const logs = Array.from(this.memoryFallback.values()).filter((item: any) => 
      item.endpoint !== undefined
    );
    return logs.slice(0, limit);
  }

  private generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const storage = new MongoStorage();