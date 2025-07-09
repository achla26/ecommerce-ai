import { RequestHandler } from 'express';

const asyncHandler = (fn: RequestHandler): RequestHandler => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            next(err);
        }
    };
};

export default asyncHandler;