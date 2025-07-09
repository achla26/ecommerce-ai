import { JwtPayload as JsonWebJwtPayload } from 'jsonwebtoken';

export interface IToken {
    token: String;
    userId: String;
    type: TokenType,
    expiresAt: Date,
    isRevoked: Boolean
}

export enum TokenType {
    ACCESS = 'ACCESS',
    REFRESH = 'REFRESH',
    VERIFY = 'VERIFY',
    RESET = 'RESET',
    TEMP_ACCESS = 'TEMP_ACCESS'
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