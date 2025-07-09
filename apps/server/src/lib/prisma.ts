/**
 * @copyright 2025 
 * @license Apache-2.0
 */
/**
 * node modules
 */
import { PrismaClient } from '@prisma/client'


/**
 * Custom Modules
 */
import config from '@/config';
import { logger } from '@/lib/winston';

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

// Create Prisma client instance
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: config.DB_URI
        }
    },
    log: [
        { level: 'query', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' }
    ]
});

// Log Prisma events
prisma.$on('warn', (e) => logger.warn(e.message));
prisma.$on('error', (e) => logger.error(e.message));
prisma.$on('info', (e) => logger.info(e.message));

/**
 * Establishes connection to database with retry logic
 */
export const connectToDatabase = async (): Promise<void> => {
    if (!config.DB_URI) {
        const error = new Error('Database URI is not defined in configuration');
        logger.error(error.message);
        throw error;
    }

    if (isConnected) {
        logger.info('Already connected to database');
        return;
    }

    try {
        logger.info(`Attempting database connection (Attempt ${connectionAttempts + 1}/${MAX_RETRIES})`);

        // Test connection by making a simple query
        await prisma.$queryRaw`SELECT 1`;
        isConnected = true;
        connectionAttempts = 0;

        logger.info('Connected to database successfully', {
            uri: config.DB_URI
        });

    } catch (error) {
        connectionAttempts++;

        if (connectionAttempts < MAX_RETRIES) {
            logger.warn(`Connection attempt ${connectionAttempts} failed. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return connectToDatabase();
        }

        const err = error instanceof Error ? error : new Error('Unknown database connection error');
        logger.error('Failed to connect to database after retries:', {
            error: err.message,
            stack: err.stack
        });
        process.exit(1);
    }
};

/**
 * Gracefully disconnects from database
 */
export const disconnectFromDatabase = async (): Promise<void> => {
    if (!isConnected) {
        logger.info('No active database connection to disconnect');
        return;
    }

    try {
        await prisma.$disconnect();
        isConnected = false;
        logger.info('Disconnected from database successfully');
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown disconnection error');
        logger.error('Error disconnecting from database:', {
            error: err.message,
            stack: err.stack
        });
        throw err;
    }
};

/**
 * Health check for database connection
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        return false;
    }
};

// Export the Prisma client instance
export const db = prisma;