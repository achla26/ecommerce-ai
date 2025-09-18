/**
 * @copyright 2025
 * @license Apache-2.0
 */

/**
 * node modules
 */
import { Router } from 'express';

import authRoutes from '@/modules/auth/routes/auth.routes';
import oauthRoutes from '@/modules/auth/routes/oauth.routes';

import roleRoutes from '@/modules/rbac/routes/roles.routes';
import permissionRoutes from '@/modules/rbac/routes/permissions.routes';
import userAccessRoutes from '@/modules/rbac/routes/user-access.routes';

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
router.use('/oauth', oauthRoutes);


// Register admin routes
router.use('/admin/roles', roleRoutes);
router.use('/admin/permissions', permissionRoutes);
router.use('/admin/user-access', userAccessRoutes);

export default router;
