import { ErrorRequestHandler } from 'express';
import { ApiError } from '@/lib/api-error';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const formattedError = ApiError.fromPrismaError(err);
        formattedError.send(res);
        return;
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        const formattedError = ApiError.fromPrismaValidationError(err);
        formattedError.send(res);
        return;
    }

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const formattedError = ApiError.fromZodError(err);
        formattedError.send(res);
        return;
    }


    if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
        const formattedError = ApiError.fromJWTError(err);
        formattedError.send(res);
        return;
    }

    // Handle other ApiErrors
    if (err instanceof ApiError) {
        err.send(res);
        return;
    }

    // Fallback to generic error
    console.error('Unhandled error:', err);
    if (process.env.NODE_ENV === 'development') {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: err.message,
            stack: err.stack,
        });
    } else {
        const serverError = ApiError.internal();
        serverError.send(res);
    }
}