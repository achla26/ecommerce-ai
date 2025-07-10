/**
 * @copyright 2025 
 * @license Apache-2.0
 */


/**
 * Custom Modules
 */
import { ApiResponse } from "@/lib/api-response";
import asyncHandler from "@/middlewares/async-handler.middleware";
/**
 * Services
 */
import { verifyEmail, resendEmailVerificationLink } from '@/modules/auth/services/email-verification.service';


export const verifyEmailHandler = asyncHandler(async (req, res) => {

    const token = req.query.token as string;
    // Verify token and update user
    const result = await verifyEmail(token);

    new ApiResponse(
        res,
        200,
        "Email verified successfully",
        result
    );
});

export const resendEmailVerificationHandler = asyncHandler(async (req, res) => {

    const { email } = req.body;

    const result = await resendEmailVerificationLink(email);

    new ApiResponse(
        res,
        200,
        "Email verification link sent successfully",
        result
    );
}); 
