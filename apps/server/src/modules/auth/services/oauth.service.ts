import { db } from '@/lib/prisma';
import { User, Account } from '@prisma/client';
import { ApiError } from '@/lib/api-error';

interface OAuthProfile {
    id: string;
    emails?: Array<{ value: string }>;
    displayName?: string;
    name?: { givenName?: string; familyName?: string };
    photos?: Array<{ value: string }>;
    accessToken?: string;
    refreshToken?: string;
}

class OAuthService {
    async handleOAuthLogin(profile: OAuthProfile, provider: string): Promise<User & { accounts: Account[] }> {
        if (!profile.emails?.[0]?.value) {
            throw new ApiError(400, 'No email found in profile');
        }

        const email = profile.emails[0].value;
        const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || '';
        const lastName = profile.name?.familyName || profile.displayName?.split(' ')[1] || '';

        const existingAccount = await db.account.findFirst({
            where: {
                providerAccountId: profile.id,
                provider
            },
            include: { user: { include: { accounts: true } } } // ✅ ensure accounts are included
        });

        if (existingAccount) {
            return existingAccount.user as User & { accounts: Account[] };
        }

        const newUser = await db.user.upsert({
            where: { email },
            update: {
                accounts: {
                    create: {
                        type: 'oauth',
                        provider,
                        providerAccountId: profile.id,
                        accessToken: profile.accessToken,
                        refreshToken: profile.refreshToken
                    }
                }
            },
            create: {
                email,
                username: email.split('@')[0],
                firstName,
                lastName,
                profilePicture: profile.photos?.[0]?.value || 'default.jpg',
                password: '', // add if required
                accounts: {
                    create: {
                        type: 'oauth',
                        provider,
                        providerAccountId: profile.id,
                        accessToken: profile.accessToken,
                        refreshToken: profile.refreshToken
                    }
                }
            },
            include: { accounts: true } // ✅ make sure this is included
        });

        return newUser;
    }


    async logout(userId: string): Promise<void> {
        await db.session.deleteMany({ where: { userId } });
    }
}

export const oauthService = new OAuthService();
