/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * node modules
 */

import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import listEndpoints from 'express-list-endpoints';
import '@/lib/passport';
/**
 * Custom Modules
 */
import config from "@/config";
import limiter from "@/lib/express-rate-limit";

import { db, connectToDatabase, disconnectFromDatabase } from '@/lib/prisma';

import { logger } from "@/lib/winston";

/**
 * Routes
 */

import v1Routes from "@/routes/v1";

/**
 * Types
 */

import type { CorsOptions } from "cors";
import { errorHandler } from "@/middlewares/error-handler.middleware";
import session from "express-session";
import passport from "passport";

/**
 * Express app initial
 */

const app: Application = express();

//Configure CORS Options
const corsOptions: CorsOptions = {
    origin(origin, callback) {
        if (config.NODE_ENV === 'development' || !origin || config.WHITELIST_ORIGINS.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error(`CORS Error: ${origin} is not allowed by CORS`), false);

            logger.warn(`CORS Error: ${origin} is not allowed by CORS`)
        }
    },
    credentials: true // Add this if using cookies/auth
}
// use helmet to enhance security by setting various HTTP headers
app.use(helmet());

app.use(compression({
    threshold: 1024, // only compress responses larager than 1KB
}))

// Enable JSON request body parsing

app.use(express.json({ limit: "16kb" }));

// Enable URL-encoded request body parsing with extended mode
// 'extended: true' allows rich objects and arrays via querystring library

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser())

//Apply CORS Middleware
app.use(cors(corsOptions))

// apply rate limiting middleware to prevent excessive requests and enhance secuirity

app.use(limiter as express.RequestHandler);

/**
* Immediately Invoked Async Function Expression (IIFE) to start the
server.
*/


(async () => {
    try {
        await connectToDatabase();

        // Optional health check
        // const isHealthy = await checkDatabaseHealth();
        // if (!isHealthy) {
        //     throw new Error('Database health check failed');
        // }

        // Start your server
        app.listen(config.PORT, () => {
            logger.info(`Server running on port ${config.PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
})()

/**
 * * Handles server shutdown gracefully by disconnecting from the
database.
*
* - Attempts to disconnect from the database before shutting down the
server.
* - Logs a success message if the disconnection is successful.
* - If an error occurs during disconnection, it is logged to the
console.I
* - Exits the process with status code '0' (indicating a successful
shutdown).
 */


const handleServerShutdown = async () => {
    try {
        await disconnectFromDatabase();
        logger.warn("Server SHUTDOWN");
        process.exit(0)
    } catch (err) {
        logger.error('Error during server shutdown', err)
    }
}

// Session configuration (MUST come before passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize()); // 2. Then passport init
app.use(passport.session());
app.use('/api/v1', v1Routes);

app.use(errorHandler);

// Print routes on startup
// console.table(listEndpoints(v1Routes));


/**
 * * Listens for termination signals ('SIGTERM' and 'SIGINT').
*
* - 'SIGTERM' is typically sent when stopping a process (e.g., 'kill'
command or container shutdown).
* - 'SIGINT' is triggered when the user interrupts the process (e.g.,
pressing 'Ctrl + C').
* - When either signal is received, 'handleServerShutdown' is executed
to ensure proper cleanup.
 *
 */

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);