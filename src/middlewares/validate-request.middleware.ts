/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Custom Modules
 */
import { ApiError } from '@/lib/api-error';

// Extend Express Request interface to include validatedData
declare global {
    namespace Express {
        interface Request {
            validatedData?: unknown;
        }
    }
}
export const validateRequest = (schema: ZodSchema): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            throw new ApiError(400, 'Validation failed', {
                errorType: 'VALIDATION_ERROR',
                errors: result.error.errors.map(issue => ({
                    field: issue.path.join('.') || '', // join path array to string, fallback to empty string
                    message: issue.message,
                    code: issue.code
                }))
            });
        }

        req.validatedData = result.data;
        next();
    };
};