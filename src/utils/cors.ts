import type { CorsOptions } from "cors";
import config from "@/config";
import { logger } from "@/lib/winston";

export const corsOptions: CorsOptions = {
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