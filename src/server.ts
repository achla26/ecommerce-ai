/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * Custom Modules
 */
import config from "@/config";

import { connectToDatabase, disconnectFromDatabase } from '@/lib/prisma';
import type { Server } from 'http';

import { logger } from "@/lib/winston";
import app from "./app";
/**
 * Routes
 */

/**
* Immediately Invoked Async Function Expression (IIFE) to start the
server.
*/
let server: Server | undefined;

(async () => {
    try {
        await connectToDatabase();

        // Optional health check
        // const isHealthy = await checkDatabaseHealth();
        // if (!isHealthy) {
        //     throw new Error('Database health check failed');
        // }

        // Start your server
        server = app.listen(config.PORT, () => {
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
        logger.warn('Shutdown signal received. Closing HTTP server...');
        if (server) {
            await new Promise<void>((resolve) => {
                server!.close(() => resolve());
            });
        }
        await disconnectFromDatabase();
        logger.warn("Server SHUTDOWN");
        process.exit(0);
    } catch (err) {
        logger.error('Error during server shutdown', err);
        process.exit(1);
    }
}

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