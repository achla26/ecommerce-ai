/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises';

/**
 * Custom Modules
 */
import config from "@/config";
import { ApiError } from '@/lib/api-error';

export const cookieOptions = {
    httpOnly: true, // true if Secure from XSS
    sameSite: "strict" as const, // Prevent CSRF
    secure: config.NODE_ENV === "production",
};


export async function renderTemplate(templateName: string, data: object): Promise<string> {
    const templatePath = path.join(__dirname, `../views/emails/${templateName}.ejs`);
    try {
        const template = await fs.readFile(templatePath, 'utf-8');
        return ejs.render(template, data);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new ApiError(500, `Failed to render template: ${message}`);
    }
}



export const generateRandomCode = (digits: number = 5): number => {
    if (digits < 1) {
        throw new Error("Digits must be at least 1");
    }

    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;

    return Math.floor(min + Math.random() * (max - min + 1));
};



// export const generateRandomString = function (): string {
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     this.resetPasswordToken = crypto
//         .createHash("sha256")
//         .update(resetToken)
//         .digest("hex");
//     this.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
//     return resetToken;
// };
