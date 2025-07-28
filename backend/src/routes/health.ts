import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { HealthCheckResponse } from '../types';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const startTime = process.hrtime();
  
  // Check services
  const services = {
    database: 'connected' as const,
    storage: 'connected' as const,
    puppeteer: 'ready' as const,
  };

  // TODO: Add actual service checks
  // - Test Supabase connection
  // - Test AWS S3 connection
  // - Test Puppeteer browser launch

  const [seconds, nanoseconds] = process.hrtime(startTime);
  const responseTime = seconds * 1000 + nanoseconds / 1000000;

  const healthCheck: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services,
  };

  res.status(200).json({
    success: true,
    data: healthCheck,
    responseTime: `${responseTime.toFixed(2)}ms`,
  });
}));

router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3001,
        logLevel: process.env.LOG_LEVEL || 'INFO',
      },
    },
  });
}));

export { router as healthRoutes };
