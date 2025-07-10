import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/lib/api-error';
import { userAccessService } from '@/modules/rbac/services/user-access.service';

// Type definitions for your role/permission objects
type Role = {
    id: string;
    name: string;
};

type Permission = {
    id: string;
    name: string;
};

// Keep your existing middleware with proper typing
export const hasPermission = (permission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId;
            if (!userId) throw ApiError.unauthorized('Not authenticated');

            const hasPerm = await userAccessService.userHasPermission(userId, permission);
            if (!hasPerm) throw ApiError.forbidden('Insufficient permissions');

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const hasRole = (role: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId;
            if (!userId) throw ApiError.unauthorized('Not authenticated');

            const hasRole = await userAccessService.userHasRole(userId, role);
            if (!hasRole) throw ApiError.forbidden('Insufficient role');

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Enhanced authorization builder with proper typing
type AuthOptions = {
    roles?: string | string[];
    permissions?: string | string[];
    requireAll?: boolean;
};

// Promise.any polyfill for older TS versions
const promiseAny = async <T>(promises: Promise<T>[]): Promise<T> => {
    return new Promise((resolve, reject) => {
        let rejectedCount = 0;
        const errors: any[] = [];

        promises.forEach(promise => {
            promise
                .then(resolve)
                .catch(error => {
                    errors.push(error);
                    if (++rejectedCount === promises.length) {
                        reject(new AggregateError(errors, "All promises were rejected"));
                    }
                });
        });
    });
};

export const authorize = (options: AuthOptions) => {
    const middlewares: ((req: Request, res: Response, next: NextFunction) => Promise<void>)[] = [];

    const roles = Array.isArray(options.roles) ? options.roles : (options.roles ? [options.roles] : []);
    const permissions = Array.isArray(options.permissions) ? options.permissions : (options.permissions ? [options.permissions] : []);

    // Authentication check
    middlewares.push(async (req, res, next) => {
        if (!req.userId) throw ApiError.unauthorized('Not authenticated');
        next();
    });

    // Role checking
    if (roles.length) {
        if (options.requireAll) {
            roles.forEach(role => middlewares.push(hasRole(role)));
        } else {
            middlewares.push(async (req, res, next) => {
                try {
                    const roleChecks = roles.map(role =>
                        userAccessService.userHasRole(req.userId!, role)
                    );

                    // Use either native Promise.any or our polyfill
                    const hasAny = await (Promise.any || promiseAny)(roleChecks);
                    if (!hasAny) throw ApiError.forbidden(`Requires one of these roles: ${roles.join(', ')}`);
                    next();
                } catch {
                    next(ApiError.forbidden(`Requires one of these roles: ${roles.join(', ')}`));
                }
            });
        }
    }

    // Permission checking
    if (permissions.length) {
        if (options.requireAll) {
            permissions.forEach(perm => middlewares.push(hasPermission(perm)));
        } else {
            middlewares.push(async (req, res, next) => {
                try {
                    const permChecks = permissions.map(perm =>
                        userAccessService.userHasPermission(req.userId!, perm)
                    );

                    const hasAny = await (Promise.any || promiseAny)(permChecks);
                    if (!hasAny) throw ApiError.forbidden(`Requires one of these permissions: ${permissions.join(', ')}`);
                    next();
                } catch {
                    next(ApiError.forbidden(`Requires one of these permissions: ${permissions.join(', ')}`));
                }
            });
        }
    }

    return middlewares;
};