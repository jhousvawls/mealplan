import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Placeholder for image processing routes
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'image-processor',
      timestamp: new Date().toISOString(),
    },
  });
}));

// TODO: Add image processing routes
// - Image upload
// - Image optimization
// - Image proxy/cache

export { router as imageRoutes };
