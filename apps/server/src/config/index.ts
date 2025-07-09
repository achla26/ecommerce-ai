import dotenv from 'dotenv';

import type ms from 'ms';

dotenv.config();

const config = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    BASE_URL: process.env.BASE_URL,
    APP_NAME: process.env.APP_NAME,
    API_URL: `${process.env.BASE_URL}/api/v1/`,

    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,

    WHITELIST_ORIGINS: ['http://localhost'],

    DB_URI: process.env.DB_URI,
    DB_NAME: 'chat-app',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
    JWT_ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_TOKEN_EXPIRY as ms.StringValue,

    JWT_TEMP_ACCESS_TOKEN_SECRET: process.env.JWT_TEMP_ACCESS_TOKEN_SECRET,
    JWT_TEMP_ACCESS_TOKEN_EXPIRY: process.env.JWT_TEMP_ACCESS_TOKEN_EXPIRY as ms.StringValue,

    JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_TOKEN_EXPIRY as ms.StringValue,

    JWT_VERIFICATION_TOKEN_SECRET: process.env.JWT_VERIFICATION_TOKEN_SECRET,
    JWT_VERIFICATION_TOKEN_EXPIRY: process.env.JWT_VERIFICATION_TOKEN_EXPIRY as ms.StringValue,

    JWT_RESET_TOKEN_SECRET: process.env.JWT_RESET_TOKEN_SECRET,
    JWT_RESET_TOKEN_EXPIRY: process.env.JWT_RESET_TOKEN_EXPIRY as ms.StringValue,

    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 2525,
    SMTP_MAIL: process.env.SMTP_MAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,

    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,

    RESEND_API_KEY: process.env.RESEND_API_KEY,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

    APPLE_SERVICE_ID: process.env.APPLE_SERVICE_ID,
    APPLE_TEAM_ID: process.env.APPLE_TEAM_ID,
    APPLE_KEY_ID: process.env.APPLE_KEY_ID,
    APPLE_KEY_FILE_PATH: process.env.APPLE_KEY_FILE_PATH
}

export default config;