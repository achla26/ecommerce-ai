/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * Node Modules
 */

/**
 * Custom Modules
 */
import { verifyTempAccessToken } from "@/lib/jwt";
import { ApiError } from "@/lib/api-error";

/**
 * types
 */

import { Request, Response, NextFunction } from "express";
// import { JwtPayload } from '@/types/token';
import { JwtPayload } from 'jsonwebtoken';

export const checkTokenType = (requiredType: 'TEMP_ACCESS' | 'ACCESS') => {
    return async (req: Request,
        res: Response,
        next: NextFunction) => {
        try {
            const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

            if (!token) throw new ApiError(401, 'No token provided');

            const jwtPayload = await verifyTempAccessToken(token) as JwtPayload;

            if (jwtPayload.tokenType !== requiredType) {
                throw new ApiError(403, `Requires ${requiredType} token`);
            }
            req.userId = String(jwtPayload.userId);

            next();
        } catch (err) {
            throw err;

        }
    };
};