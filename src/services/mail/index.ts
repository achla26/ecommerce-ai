/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * Node Modules
 */

/**
 * Modles
 */

/**
 * Custom Modules
 */

import { config } from "@/config";
import { mailClient, sender } from "@/config/mail";
import { ApiError } from "@/lib/api-error";
import { renderTemplate } from "@/utils";
/**
 * Types
 */

type EmailOptions = {
    email: string;
    subject: string;
    template?: string;
    context?: Record<string, any>;
    html?: string;
};

const appConfig = config.get('app');


class MailService {
    private async sendEmail({
        email,
        subject,
        template,
        context = {},
        html
    }: EmailOptions) {
        try {
            const finalHtml = template
                ? await renderTemplate(template, {
                    ...context,
                    appName: appConfig.name,
                    supportEmail: appConfig.supportEmail
                })
                : html;

            if (!finalHtml) {
                throw new ApiError(400, 'Either template or html must be provided');
            }

            const { data, error } = await mailClient.emails.send({
                from: sender,
                to: email,
                subject,
                html: finalHtml,
            });
            if (error) throw error;
            return data;
        } catch (error) {
            throw new ApiError(
                500,
                'Failed to send email',
                {
                    errorType: 'MAIL_SENT_FAILED',
                    originalError: error as Error
                }
            );
        }
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationLink = `${appConfig.apiUrl}/verify-email?token=${token}`;
        return verificationLink;  //TODO - UNCOMMENT

        return this.sendEmail({
            email,
            subject: 'Email Verification',
            template: 'verify',
            context: { verificationLink }
        });
    }

    async sendTwoFactorTokenEmail(email: string, token: string) {
        return this.sendEmail({
            email,
            subject: 'Your 2FA Code',
            html: `<p>Your 2FA Code: <strong>${token}</strong></p>`
        });
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const resetLink = `${appConfig.apiUrl}/reset-password?token=${token}`;
        return this.sendEmail({
            email,
            subject: 'Password Reset Request',
            template: 'password-reset',
            context: { resetLink }
        });
    }
}

export const mailService = new MailService();