/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * node modules
 */
import { Router } from 'express';

/**
 * Controllers
 */
import login from '@/modules/auth/controllers/login.controller';
import register from '@/modules/auth/controllers/register.controller';
import { logout, refreshToken } from '@/modules/auth/controllers/logout.controller';
import { verifyEmailHandler, resendEmailVerificationHandler } from '@/modules/auth/controllers/verify-email.controller';

/**
 * Middlewares
 */
import { validateRequest } from '@/middlewares/validate-request.middleware';
import authenticate from '@/middlewares/authenticated.middleware';
import { checkTokenType } from '@/middlewares/check-token-type.middleware';
/**
 * Schemas
 */
import { LoginSchema, RegisterSchema } from '@/schemas/auth';

import { resndVerifyEmailTokenSchema } from '@/schemas/auth/token';


const router = Router();

router.post('/register', validateRequest(RegisterSchema), register);

router.post('/login', validateRequest(LoginSchema), login);

router.post('/refresh-token', refreshToken);

router.post('/logout', authenticate, logout);

router.get('/verify-email',
    checkTokenType('TEMP_ACCESS'),
    verifyEmailHandler
);

router.post('/resend-verification',
    validateRequest(resndVerifyEmailTokenSchema),
    resendEmailVerificationHandler
);

export default router;