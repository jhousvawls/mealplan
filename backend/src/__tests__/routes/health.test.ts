import request from 'supertest';
import express from 'express';
import { healthRoutes } from '../../routes/health';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use('/health', healthRoutes);
  return app;
};

describe('Health Route', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          status: 'healthy',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          version: expect.any(String),
          services: {
            database: 'connected',
            storage: 'connected',
            puppeteer: 'ready',
          },
        },
        responseTime: expect.any(String),
      });
    });

    it('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should return positive uptime', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.data.uptime).toBeGreaterThan(0);
      expect(typeof response.body.data.uptime).toBe('number');
    });

    it('should return response time in correct format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.responseTime).toMatch(/^\d+\.\d{2}ms$/);
    });

    it('should have correct content type', async () => {
      await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', async () => {
      await request(app)
        .get('/health/invalid')
        .expect(404);
    });
  });
});
