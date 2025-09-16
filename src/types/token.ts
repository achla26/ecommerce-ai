import { JwtPayload as JsonWebJwtPayload } from 'jsonwebtoken';

export interface IToken {
    token: String;
    userId: String;
    type: TokenType,
    expiresAt: Date,
    isRevoked: Boolean
}

export enum TokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
    VERIFY = 'verify',
    RESET = 'reset',
    TEMP_ACCESS = 'tempAccess'
}

export interface TokenConfig {
    secret: string;
    expiry: string;
    subject: string;
}
export interface JwtPayload extends JsonWebJwtPayload {
    // userId: String;
    iat: number;
    exp: number;
    sub: string;
}