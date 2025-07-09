/**
 * @copyright 2025 
 * @license Apache-2.0
 */

import { Router } from 'express';
import passport from 'passport';
import { oauthController } from '@/modules/auth/controllers/oauth.controller';

const router = Router();

// Redirect user to Google for login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Callback route that Google redirects to after login
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: true }),
    oauthController.googleCallback // Handles session, response, etc.
);

// Redirect user to github for login
router.get('/github', passport.authenticate('github', {
    scope: ['profile', 'email']
}));

// Callback route that github redirects to after login
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login', session: true }),
    oauthController.githubCallback // Handles session, response, etc.
);
// Logout route (optional)
router.post('/logout', oauthController.logout);

export default router;
