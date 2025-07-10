import jwt from 'jsonwebtoken';

import config from '@/config';

import { ApiError } from '@/lib/api-error';

import { TokenType, TokenConfig } from '@/types/token';
import { JwtPayload } from 'jsonwebtoken';

const tokenConfigs: Record<TokenType, TokenConfig> = {
    [TokenType.ACCESS]: {
        secret: config.JWT_ACCESS_TOKEN_SECRET!,
        expiry: config.JWT_ACCESS_TOKEN_EXPIRY!,
        subject: 'accessToken'
    },
    [TokenType.REFRESH]: {
        secret: config.JWT_REFRESH_TOKEN_SECRET!,
        expiry: config.JWT_REFRESH_TOKEN_EXPIRY!,
        subject: 'refreshToken'
    },
    [TokenType.VERIFY]: {
        secret: config.JWT_VERIFICATION_TOKEN_SECRET!,
        expiry: config.JWT_VERIFICATION_TOKEN_EXPIRY!,
        subject: 'verifyToken'
    },
    [TokenType.RESET]: {
        secret: config.JWT_RESET_TOKEN_SECRET!,
        expiry: config.JWT_RESET_TOKEN_EXPIRY!,
        subject: 'resetToken'
    },
    [TokenType.TEMP_ACCESS]: {
        secret: config.JWT_TEMP_ACCESS_TOKEN_SECRET!,
        expiry: config.JWT_TEMP_ACCESS_TOKEN_EXPIRY!,
        subject: 'tempAccess'
    },
};

export const generateToken = async (
    type: TokenType,
    userId: string
): Promise<string> => {
    const config = tokenConfigs[type];
    if (!userId) {
        throw ApiError.token('User ID is required');
    }

    if (!config.secret) {
        throw ApiError.token(`${type}_SECRET is not defined`);

    }
    if (!config.expiry) {
        throw ApiError.token(`${type}_SECRET is not defined`);
    }

    try {
        return jwt.sign(
            {
                userId,
                tokenType: type,
            },
            config.secret,
            {
                expiresIn: config.expiry as jwt.SignOptions['expiresIn'],
                subject: config.subject,
            }
        );
    } catch (error) {
        throw ApiError.token(`Failed to generate ${type} token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const verifyToken = async (
    type: TokenType,
    token: string
): Promise<JwtPayload> => {
    const config = tokenConfigs[type];

    if (!config.secret) {
        throw ApiError.token(`${type}_SECRET is not defined`);
    }

    try {
        const payload = jwt.verify(token, config.secret);
        if (typeof payload === 'string' || !('userId' in payload)) {
            throw ApiError.token('Invalid token payload');
        }
        // console.log("payload" , payload)
        // Ensure required fields are present and not undefined
        // const { iat, exp, nbf, jti, iss, sub, aud, userId, tokenType } = payload as any;
        // return {
        //     userId, tokenType,
        //     iat,
        //     exp,
        //     nbf,
        //     jti,
        //     iss,
        //     sub,
        //     aud
        // };
        // console.log("configuaration", { config })

        return payload;
    } catch (error) {
        throw error;
    }
};

export function parseJwtExpiry(expiry: string): Date {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    if (isNaN(value)) {
        throw ApiError.token('Invalid expiry format');
    }

    const multipliers: Record<string, number> = {
        s: 1000,            // seconds
        m: 60 * 1000,      // minutes
        h: 60 * 60 * 1000, // hours
        d: 24 * 60 * 60 * 1000 // days
    };

    const multiplier = multipliers[unit] || 60 * 60 * 1000; // default 1 hour
    return new Date(Date.now() + value * multiplier);
}

// Convenience functions for specific token types
export const generateAccessToken = (userId: string) => generateToken(TokenType.ACCESS, userId);
export const generateTempAccessToken = (userId: string) => generateToken(TokenType.TEMP_ACCESS, userId);
export const generateRefreshToken = (userId: string) => generateToken(TokenType.REFRESH, userId);
export const generateVerificationToken = (userId: string) => generateToken(TokenType.VERIFY, userId);
export const generateResetToken = (userId: string) => generateToken(TokenType.RESET, userId);

export const verifyAccessToken = (token: string) => verifyToken(TokenType.ACCESS, token);
export const verifyTempAccessToken = (token: string) => verifyToken(TokenType.TEMP_ACCESS, token);
export const verifyRefreshToken = (token: string): Promise<JwtPayload> => verifyToken(TokenType.REFRESH, token);
export const verifyVerificationToken = (token: string) => verifyToken(TokenType.VERIFY, token);
export const verifyResetToken = (token: string) => verifyToken(TokenType.RESET, token);