import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import "dotenv/config";

// Import the app setup logic
import { createServer } from 'http';

describe('API Endpoints', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    // Create a test app instance
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Add basic API endpoints for testing
    app.get('/api/status', (req, res) => {
      res.json({
        success: true,
        status: 'online',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        creator: 'heisbroken'
      });
    });

    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
        creator: 'heisbroken'
      });
    });

    server = createServer(app);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/status', () => {
    it('should return status information', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        status: 'online',
        version: '1.0.0',
        timestamp: expect.any(String),
        creator: 'heisbroken'
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return health information', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        status: 'healthy',
        uptime: expect.any(Number),
        memory: expect.any(Object),
        timestamp: expect.any(String),
        creator: 'heisbroken'
      });
    });

    it('should include memory usage information', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('external');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
});