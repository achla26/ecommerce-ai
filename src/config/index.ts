import dotenv from 'dotenv';

import type ms from 'ms';

dotenv.config();

const _config: any = {
    app: {
        port: Number(process.env.PORT || 3000),
        env: process.env.NODE_ENV || 'development',
        baseUrl: process.env.BASE_URL,
        name: process.env.APP_NAME,
        apiUrl: `${process.env.BASE_URL}/api/v1/`,
        supportEmail: process.env.SUPPORT_EMAIL,
        whitelistOrigins: ['http://localhost'],
        logLevel: process.env.LOG_LEVEL || 'info'
    },

    db: {
        uri: process.env.DB_URI,
        name: 'chat-app'
    },

    jwt: {
        access: {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            expiry: process.env.JWT_ACCESS_TOKEN_EXPIRY
        },
        tempAccess: {
            secret: process.env.JWT_TEMP_ACCESS_TOKEN_SECRET,
            expiry: process.env.JWT_TEMP_ACCESS_TOKEN_EXPIRY
        },
        refresh: {
            secret: process.env.JWT_REFRESH_TOKEN_SECRET,
            expiry: process.env.JWT_REFRESH_TOKEN_EXPIRY
        },
        verification: {
            secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
            expiry: process.env.JWT_VERIFICATION_TOKEN_EXPIRY
        },
        reset: {
            secret: process.env.JWT_RESET_TOKEN_SECRET,
            expiry: process.env.JWT_RESET_TOKEN_EXPIRY
        }
    },

    email: {
        smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 2525,
            mail: process.env.SMTP_MAIL,
            password: process.env.SMTP_PASSWORD
        },
        gmail: {
            user: process.env.GMAIL_USER,
            password: process.env.GMAIL_PASSWORD
        },
        resend: {
            apiKey: process.env.RESEND_API_KEY
        }
    },

    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
        },
        apple: {
            serviceId: process.env.APPLE_SERVICE_ID,
            teamId: process.env.APPLE_TEAM_ID,
            keyId: process.env.APPLE_KEY_ID,
            keyFilePath: process.env.APPLE_KEY_FILE_PATH
        }
    }
};

export const config = {
    get(key: keyof typeof _config) {
        return _config[key];
    }
};