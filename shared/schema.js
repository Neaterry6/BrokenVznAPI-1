import { z } from 'zod';
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
export const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});
