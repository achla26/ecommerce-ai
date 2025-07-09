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
import { verifyAccessToken } from "@/lib/jwt";
import { ApiError } from "@/lib/api-error";

/**
 * types
 */

import { Request, Response, NextFunction } from "express";
// import { JwtPayload } from '@/types/token';
import { JwtPayload } from 'jsonwebtoken';




export const authenticated = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token =
            req.cookies?.accessToken ||
            (req.headers.authorization?.startsWith('Bearer ')
                ? req.headers.authorization.split(' ')[1]
                : null);

        if (!token) {
            throw ApiError.unauthorized('Unauthorized request. No access token provided');
        }

        const jwtPayload = await verifyAccessToken(token);

        req.userId = jwtPayload.userId;
        return next();
    } catch (err) {
        throw err;
    }
}

export default authenticated;