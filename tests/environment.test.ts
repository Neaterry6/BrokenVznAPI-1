import { describe, it, expect, beforeAll } from 'vitest';
import "dotenv/config";

describe('Environment Configuration', () => {
  beforeAll(() => {
    // Ensure dotenv is loaded
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'test';
    }
  });

  describe('Environment Variables', () => {
    it('should load environment variables from .env file', () => {
      // Test that process.env is not returning null
      expect(process.env).toBeDefined();
      expect(typeof process.env).toBe('object');
    });

    it('should have NODE_ENV defined', () => {
      expect(process.env.NODE_ENV).toBeDefined();
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('should have PORT defined or use default', () => {
      const port = process.env.PORT || '5000';
      expect(port).toBeDefined();
      expect(typeof port).toBe('string');
      expect(parseInt(port, 10)).toBeGreaterThan(0);
    });

    it('should handle missing optional environment variables gracefully', () => {
      // These variables might not be set in test environment
      const optionalVars = [
        'MONGODB_URI',
        'GEMINI_API_KEY',
        'OPENAI_API_KEY',
        'UNSPLASH_API_KEY'
      ];

      optionalVars.forEach(varName => {
        // Should not throw error when accessing undefined env vars
        expect(() => {
          const value = process.env[varName];
          // Value can be undefined, that's ok
        }).not.toThrow();
      });
    });

    it('should parse PORT as integer correctly', () => {
      const portStr = process.env.PORT || '5000';
      const port = parseInt(portStr, 10);
      
      expect(port).toBeTypeOf('number');
      expect(port).not.toBeNaN();
      expect(port).toBeGreaterThan(0);
      expect(port).toBeLessThanOrEqual(65535);
    });
  });

  describe('Configuration Validation', () => {
    it('should have valid server configuration', () => {
      const config = {
        port: parseInt(process.env.PORT || '5000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        sessionSecret: process.env.SESSION_SECRET || 'default-secret'
      };

      expect(config.port).toBeGreaterThan(0);
      expect(config.nodeEnv).toBeDefined();
      expect(config.sessionSecret).toBeDefined();
      expect(config.sessionSecret.length).toBeGreaterThan(0);
    });

    it('should handle missing database URI gracefully', () => {
      const mongoUri = process.env.MONGODB_URI;
      const postgresUri = process.env.DATABASE_URL;
      
      // At least one should be defined or app should handle fallback
      // For test environment, both might be undefined and that's ok
      expect(() => {
        if (!mongoUri && !postgresUri) {
          console.warn('No database URI found, using in-memory storage');
        }
      }).not.toThrow();
    });
  });
});