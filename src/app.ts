/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * node modules
 */

import express, { Application } from "express";
import type { RequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import '@/lib/passport';
/**
 * Custom Modules
 */
import limiter from "@/lib/express-rate-limit";
import { corsOptions } from "@/shared/utils/cors";

/**
 * Routes
 */

import v1Routes from "@/routes/v1";

/**
 * Types
 */

import { errorHandler } from "@/middlewares/error-handler.middleware";
import passport from "passport";
import { sessionConfig } from "@/shared/utils/session";

/*
 * Express app initial
 */

const app: Application = express();


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

app.use(limiter as RequestHandler);

// Session configuration (MUST come before passport)
app.use(sessionConfig);
app.use(passport.initialize()); // 2. Then passport init
app.use(passport.session());
app.use('/api/v1', v1Routes);

app.use(errorHandler);

// Print routes on startup
// console.table(listEndpoints(v1Routes));

export default app;
