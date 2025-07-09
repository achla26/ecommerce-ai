import { ApiError } from "@/lib/api-error";
import {
    generateAccessToken,
    generateRefreshToken,
    generateVerificationToken,
    generateResetToken,
    parseJwtExpiry,
    verifyAccessToken,
    verifyRefreshToken,
    verifyVerificationToken,
    verifyResetToken,
    generateTempAccessToken
} from '@/lib/jwt';
import { db } from '@/lib/prisma';
import config from '@/config';
import { TokenType } from '@/types/token';
import { JwtPayload } from 'jsonwebtoken';

type TokenHandler = {
    type: TokenType;
    generateFn: (userId: string) => Promise<string>;
    verifyFn: (token: string) => Promise<JwtPayload>;
    expiry: string;
};

class TokenService {
    private tokenHandlers: Record<string, TokenHandler> = {
        refresh: {
            type: TokenType.REFRESH,
            generateFn: generateRefreshToken,
            verifyFn: verifyRefreshToken,
            expiry: config.JWT_REFRESH_TOKEN_EXPIRY!
        },
        verify: {
            type: TokenType.VERIFY,
            generateFn: generateVerificationToken,
            verifyFn: verifyVerificationToken,
            expiry: config.JWT_VERIFICATION_TOKEN_EXPIRY!
        },
        reset: {
            type: TokenType.RESET,
            generateFn: generateResetToken,
            verifyFn: verifyResetToken,
            expiry: config.JWT_RESET_TOKEN_EXPIRY!
        }
    };

    async generateAndStoreToken(
        tokenType: keyof typeof this.tokenHandlers,
        userId: string,
        tx?: any
    ): Promise<string> {
        const handler = this.tokenHandlers[tokenType];

        if (!handler) {
            throw ApiError.token('Invalid token type');
        }

        const client = tx || db;

        try {
            // ✅ Generate the JWT
            const token = await handler.generateFn(userId);

            // ✅ Check user only if not in transaction
            if (!tx) {
                const userExists = await client.user.findUnique({
                    where: { id: userId },
                    select: { id: true }
                });

                if (!userExists) {
                    throw ApiError.notFound('User not found');
                }
            }

            // ✅ Store token
            await client.token.upsert({
                where: {
                    userId_type_unique: {
                        userId,
                        type: handler.type,
                    },
                },
                update: {
                    token,
                    expiresAt: parseJwtExpiry(handler.expiry),
                    isRevoked: false,
                },
                create: {
                    token,
                    type: handler.type,
                    expiresAt: parseJwtExpiry(handler.expiry),
                    userId,
                    isRevoked: false,
                },
            });

            // ✅ Return token string
            return token;
        } catch (err) {
            throw err;
        }
    }

    async createTokenPair(
        userId: string,
        tx?: any
    ): Promise<{ accessToken: string; refreshToken: string }> {

        try {
            const accessToken = await generateAccessToken(userId);
            const refreshToken = await this.generateAndStoreToken('refresh', userId, tx);

            return { accessToken, refreshToken };
        } catch (error) {
            throw error;
        }
    }


    async findAndVerifyToken(
        tokenType: keyof typeof this.tokenHandlers,
        token: string
    ): Promise<JwtPayload> {

        const handler = this.tokenHandlers[tokenType];
        if (!handler) {
            throw ApiError.badRequest('Invalid token type');
        }

        try {
            // 1. Check if token exists in database
            const tokenRecord = await db.token.findFirst({
                where: {
                    token: token,                // Exact token match
                    type: handler.type as any,   // Cast to any or the correct Prisma enum type if available
                    isRevoked: false,            // Not revoked
                    expiresAt: { gt: new Date() } // Not expired
                }
            });

            if (!tokenRecord) throw ApiError.token('Invalid or expired token');

            // 2. Verify JWT signature
            const payload = await handler.verifyFn(token);

            // 3. Validate payload structure
            if (!payload.userId) throw ApiError.token('Invalid token payload');

            return payload;
        } catch (error) {
            throw error;
        }
    }


    async revokeToken(token: string, tx?: any) {
        const client = tx || db;
        await client.token.updateMany({
            where: { token },
            data: { isRevoked: true }
        });
    }

    async deleteToken(token: string, tx?: any) {
        const client = tx || db;
        await client.token.deleteMany({
            where: { token }
        });
    }
    async cleanupExpiredTokens() {
        await db.token.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
    }
    async refreshAccessToken(refreshToken: string): Promise<string> {
        const payload = await this.findAndVerifyToken('refresh', refreshToken);
        return generateAccessToken(payload.userId.toString());
    }


    async verifyResetToken(resetToken: string): Promise<JwtPayload> {
        return this.findAndVerifyToken('reset', resetToken);
    }
}

export const tokenService = new TokenService();