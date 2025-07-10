import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { oauthService } from '@/modules/auth/services/oauth.service';
import { ApiResponse } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';

class OAuthController {
    private handleProviderCallback(provider: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            passport.authenticate(provider, async (err: Error, user: any) => {
                try {
                    if (err) throw err;
                    if (!user) throw new ApiError(401, `${provider} authentication failed`);

                    req.logIn(user, (loginErr) => {
                        if (loginErr) return next(loginErr);
                        new ApiResponse(res, 200, `${provider} login successful`, {
                            user,
                            accounts: user.accounts
                        });
                    });
                } catch (error) {
                    next(error);
                }
            })(req, res, next);
        };
    }

    googleCallback = this.handleProviderCallback('google');
    githubCallback = this.handleProviderCallback('github');

    async logout(req: Request, res: Response, next: NextFunction) {
        try {

            if (!req.user) throw new ApiError(401, 'Not authenticated');

            // await oauthService.logout(req.user.id);
            req.logout((err) => {
                if (err) return next(err);
                new ApiResponse(res, 200, 'Logout successful');
            });
        } catch (error) {
            next(error);
        }
    }
}

export const oauthController = new OAuthController();