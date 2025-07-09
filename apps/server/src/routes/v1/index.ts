/**
 * @copyright 2025
 * @license Apache-2.0
 */

/**
 * node modules
 */
import { Router } from 'express';

import authRoutes from '@/routes/v1/shared/auth.routes';


const router = Router();

/**
 * Root Route
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is live',
    status: 'ok',
    version: '1.0.0',
    docs: 'https://docs.blog-api.com',
    timeStamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);


export default router;
