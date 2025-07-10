/// <reference types="express" />

import { User } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import { RequestHandler } from 'express';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            jwtPayload?: JwtPayload & { id: string };
            user?: User & { accounts?: any };
        }

        interface RequestHandler {
            _meta?: RouteMeta;
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        passport: {
            user: any; // Replace 'any' with your user type
        };
        // Add other session properties here if needed
    }
}

interface RouteMeta {
    name: string;
    description?: string;
}
