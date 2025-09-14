import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// User Schema and Model
export interface IUser extends Document {
  _id: string;
  username: string;
  email?: string;
  password: string;
  apiKey: string;
  requestCount: number;
  tier: 'free' | 'pro' | 'enterprise';
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, default: null },
  password: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true },
  requestCount: { type: Number, default: 0 },
  tier: { type: String, default: 'free', enum: ['free', 'pro', 'enterprise'] },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

export const User = mongoose.model<IUser>('User', userSchema);

// API Log Schema and Model
export interface IApiLog extends Document {
  _id: string;
  userId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime?: number;
  timestamp: Date;
}

const apiLogSchema = new Schema<IApiLog>({
  userId: { type: String, ref: 'User', default: null },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  statusCode: { type: Number, required: true },
  responseTime: { type: Number, default: null },
  timestamp: { type: Date, default: Date.now }
});

export const ApiLog = mongoose.model<IApiLog>('ApiLog', apiLogSchema);

// URL Shortener Schema and Model
export interface IUrlShortener extends Document {
  _id: string;
  shortCode: string;
  originalUrl: string;
  userId?: string;
  clicks: number;
  createdAt: Date;
}

const urlShortenerSchema = new Schema<IUrlShortener>({
  shortCode: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
  userId: { type: String, ref: 'User', default: null },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const UrlShortener = mongoose.model<IUrlShortener>('UrlShortener', urlShortenerSchema);

// Admin Schema and Model
export interface IAdmin extends Document {
  _id: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

const adminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

// User Session Schema and Model
export interface IUserSession extends Document {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const userSessionSchema = new Schema<IUserSession>({
  userId: { type: String, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const UserSession = mongoose.model<IUserSession>('UserSession', userSessionSchema);

// API Category Schema and Model
export interface IApiCategory extends Document {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: Date;
}

const apiCategorySchema = new Schema<IApiCategory>({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: null },
  icon: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const ApiCategory = mongoose.model<IApiCategory>('ApiCategory', apiCategorySchema);

// Validation schemas using Zod
export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().optional(),
  password: z.string().min(1),
  tier: z.enum(['free', 'pro', 'enterprise']).optional(),
  role: z.enum(['user', 'admin']).optional()
});

export const insertApiLogSchema = z.object({
  userId: z.string().optional(),
  endpoint: z.string(),
  method: z.string(),
  statusCode: z.number(),
  responseTime: z.number().optional()
});

export const insertUrlShortenerSchema = z.object({
  shortCode: z.string().optional(),
  originalUrl: z.string(),
  userId: z.string().optional()
});

export const insertAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.string().optional()
});

export const insertUserSessionSchema = z.object({
  userId: z.string(),
  token: z.string(),
  expiresAt: z.date()
});

export const insertApiCategorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional()
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Basic types for data without Mongoose Document methods
export interface User {
  _id?: string;
  username: string;
  email?: string | null;
  password: string;
  apiKey: string;
  requestCount: number;
  tier: 'free' | 'pro' | 'enterprise';
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
}

export interface ApiLog {
  _id?: string;
  userId?: string | null;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime?: number | null;
  timestamp: Date;
}

export interface UrlShortener {
  _id?: string;
  shortCode: string;
  originalUrl: string;
  userId?: string | null;
  clicks: number;
  createdAt: Date;
}

export interface Admin {
  _id?: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

export interface UserSession {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ApiCategory {
  _id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  createdAt: Date;
}

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertApiLog = z.infer<typeof insertApiLogSchema>;
export type InsertUrlShortener = z.infer<typeof insertUrlShortenerSchema>;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type InsertApiCategory = z.infer<typeof insertApiCategorySchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;