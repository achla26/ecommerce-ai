import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { db } from '@/lib/prisma';
import { oauthService } from '@/modules/auth/services/oauth.service';
import { config } from '@/config';

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
    const user = await db.user.findUnique({
        where: { id },
        include: { accounts: true }
    });
    done(null, user);
});

const oauthConfig = config.get('oauth');


// Google Strategy
passport.use(new GoogleStrategy({
    clientID: oauthConfig.google.clientId!,
    clientSecret: oauthConfig.google.clientSecret!,
    callbackURL: '/auth/google/callback',
    scope: ['profile', 'email'],
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const user = await oauthService.handleOAuthLogin({
            id: profile.id,
            displayName: profile.displayName,
            name: profile.name,
            emails: profile.emails,
            photos: profile.photos,
            accessToken,
            refreshToken
        }, 'google');
        done(null, user);
    } catch (error) {
        done(error);
    }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: oauthConfig.github.clientId!,
    clientSecret: oauthConfig.github.clientSecret!,
    callbackURL: '/auth/github/callback',
    scope: ['user:email'],
    passReqToCallback: true
}, async (req: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
    try {
        const user = await oauthService.handleOAuthLogin({
            id: profile.id,
            displayName: profile.displayName,
            name: profile.name,
            emails: profile.emails,
            photos: profile.photos,
            accessToken,
            refreshToken
        }, 'github');
        done(null, user);
    } catch (error) {
        done(error);
    }
}));
