/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * node modules
 */
import winston from "winston";

/**
 * Custom Modules
 */
import config from "@/config";

const { combine, timestamp, json, errors, align, printf, colorize } = winston.format;

// Define the transports array to handle diffrent logging transport

const transports: winston.transport[] = [];

// if the application is not running in production, add a console transport

if (config.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
                align(),
                printf(({ timestamp, level, message, ...meta }) => {
                    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta)}` : '';

                    return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
                })
            )
        })
    )
}

// Create a Logger instance using winston
export const logger = winston.createLogger({
    level: config.LOG_LEVEL || 'info',
    format: combine(timestamp(), errors({ stack: true }), json()),
    transports,
    silent: config.NODE_ENV === 'test', // Disable logging in test environment
});
