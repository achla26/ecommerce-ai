/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import { Response } from 'express';
import { ZodError } from 'zod';
import * as jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

type ErrorType =
    | 'VALIDATION_ERROR'
    | 'AUTHENTICATION_ERROR'
    | 'DATABASE_ERROR'
    | 'API_ERROR'
    | 'NOT_FOUND'
    | 'FORBIDDEN'
    | 'CONFLICT'
    | 'UNPROCESSABLE_ENTITY'
    | 'UNKNOWN_ERROR'
    | 'NETWORK_ERROR'
    | 'INTERNAL_SERVER_ERROR'
    | 'BAD_REQUEST'
    | 'VERIFICATION_ERROR'
    | 'TOKEN_ERROR'
    | 'MAIL_SENT_FAILED';

interface ErrorResponse {
    success: false;
    message: string;
    errorType: ErrorType;
    errors?: Array<{
        field: string;
        message: string;
        code?: string;
    }>;
    stack?: string;
    details?: any;
}

class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errorType: ErrorType;
    public readonly errors?: ErrorResponse['errors'];
    public readonly details?: any;
    public originalError?: Error;

    constructor(
        statusCode: number,
        message: string,
        config: {
            errorType?: ErrorType;
            errors?: ErrorResponse['errors'];
            originalError?: Error;
            details?: any;
            includeOriginal?: boolean;  // New option to include original error
        } = {}
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorType = config.errorType || 'API_ERROR';
        this.errors = config.errors;
        this.originalError = config.originalError;
        this.details = config.details;

        // Set default value for includeOriginal to true if not provided
        const includeOriginal = config.includeOriginal !== undefined ? config.includeOriginal : true;

        if (config.originalError?.stack) {
            this.stack = config.originalError.stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
            // In development, enhance stack with constructor name
            if (process.env.NODE_ENV === 'development') {
                this.stack = `${this.constructor.name}: ${this.stack}`;
            }
        }

        // Store original error information
        if (config.originalError) {
            this.originalError = config.originalError;
            if (includeOriginal) {
                this.details = {
                    ...(this.details || {}),
                    originalError: {
                        message: config.originalError.message,
                        ...(process.env.NODE_ENV === 'development' && {
                            stack: config.originalError.stack
                        })
                    }
                };
            }
        }
    }

    // Convert to response format
    public toResponse(includeStack = false): ErrorResponse {
        return {
            success: false,
            message: this.message,
            errorType: this.errorType,
            errors: this.errors,
            details: this.details,
            ...(includeStack && { stack: this.stack })
        };
    }

    // Send error response directly
    public send(res: Response, includeStack = false): Response {
        return res.status(this.statusCode).json(this.toResponse(includeStack));
    }

    // Factory methods for common error types


    static badRequest(message: string, details?: any, includeOriginal = false) {
        return new ApiError(400, message, {
            errorType: 'BAD_REQUEST',
            details,
            includeOriginal
        });
    }
    static internal(message = 'Internal Server Error', originalError?: Error) {
        return new ApiError(500, message, {
            errorType: 'INTERNAL_SERVER_ERROR',
            originalError,
            includeOriginal: true  // Auto-include for internal errors
        });
    }
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message, { errorType: 'AUTHENTICATION_ERROR' });
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message, { errorType: 'FORBIDDEN' });
    }

    static notFound(message = 'Not Found') {
        return new ApiError(404, message, { errorType: 'NOT_FOUND' });
    }

    static conflict(message: string) {
        return new ApiError(409, message, { errorType: 'CONFLICT' });
    }

    static token(message: string, details?: any) {
        return new ApiError(409, message, { errorType: 'TOKEN_ERROR', details, includeOriginal: true });
    }


    // Specialized factory methods
    static fromZodError(zodError: ZodError) {
        return new ApiError(422, 'Validation failed', {
            errorType: 'VALIDATION_ERROR',
            errors: zodError.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
            })),
            originalError: zodError,
            includeOriginal: true
        });
    }

    // Prisma-specific error handlers
    static fromPrismaError(error: Prisma.PrismaClientKnownRequestError) {
        const baseConfig = {
            originalError: error,
            includeOriginal: true  // Auto-include for Prisma errors
        };

        if (error.code === 'P2002') {
            return new ApiError(409, 'Unique constraint violation', {
                ...baseConfig,
                errorType: 'CONFLICT',
                details: {
                    target: error.meta?.target,
                    code: error.code
                }
            });
        }

        if (error.code === 'P2025') {
            return new ApiError(404, 'Record not found', {
                ...baseConfig,
                errorType: 'NOT_FOUND',
                details: {
                    code: error.code
                }
            });
        }

        return new ApiError(500, 'Database operation failed', {
            ...baseConfig,
            errorType: 'DATABASE_ERROR',
            details: {
                code: error.code,
                meta: error.meta,
            }
        });
    }



    static fromPrismaValidationError(error: Prisma.PrismaClientValidationError) {
        console.error('Prisma Validation Error:', error.message);
        console.error('Full error:', error);

        return new ApiError(422, 'Database validation failed', {
            errorType: 'VALIDATION_ERROR',
            details: {
                message: error.message,
                // This will help identify what's wrong
                validation: 'Check console for full error details'
            },
            originalError: error,
            includeOriginal: true
        });
    }


    static fromJWTError(error: Error) {
        if (error instanceof jwt.TokenExpiredError) {
            return ApiError.token('Token expired', {
                name: error.name,
                message: error.message
            });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return ApiError.token('Invalid token', {
                name: error.name,
                message: error.message
            });
        }
        // Fallback for other JWT errors
        return new ApiError(401, `Token verify failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {
            errorType: 'TOKEN_ERROR',
            details: {
                name: error.name,
                message: error.message
            },
            originalError: error,
            includeOriginal: true
        });
    }
}

export { ApiError, ErrorType, ErrorResponse };