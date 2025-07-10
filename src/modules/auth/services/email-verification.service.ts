import { ApiError } from "@/lib/api-error";
import { generateTempAccessToken } from "@/lib/jwt";
import { userService } from "@/services/user";
import { mailService } from "@/services/mail";
import { db } from "@/lib/prisma";
import { tokenService } from "@/modules/auth/services/token.service";

export const sendEmailVerificationLink = async (user: { id: string, email: string }, tx?: any) =>
// : Promise<{
//     verificationToken: string;
//     tempAccessToken: string;
//     verificationLink: string;
// }> //TODO right now i am sending link afterward it would be html template
{
    try {
        const client = tx || db;
        // Generate verification token USING THE SAME TRANSACTION 
        const verificationToken = await tokenService.generateAndStoreToken('verify', user.id, client);

        const tempAccessToken = await generateTempAccessToken(user.id);

        //TODO Send verification email (uncomment when ready) 
        const verificationLink = await mailService.sendVerificationEmail(user.email, verificationToken);

        return {
            verificationToken,
            accessToken: tempAccessToken,
            verificationLink
        }
    } catch (err) {
        throw err;
    }
}

export const verifyEmail = async (token: string) => {
    // Verify the token 
    const payload = await tokenService.findAndVerifyToken('verify', token);

    // Update user's email_verified field
    const user = await db.user.update({
        where: { id: payload.userId.toString() },
        data: { emailVerified: new Date() }
    });

    // Revoke the verification token
    await tokenService.revokeToken(token);

    // Generate new access  
    const { accessToken, refreshToken } = await tokenService.createTokenPair(payload.userId.toString());

    return {
        user,
        accessToken,
        refreshToken
    };
}


export const resendEmailVerificationLink = async (email: string) => {
    try {
        // 1. Check if user exists using your existing method
        const user = await userService.getUserByEmail(email);

        if (!user) {
            throw new ApiError(404, 'User not found with this email');
        }

        // 3. Check email verification status
        if (user.emailVerified) {
            throw new ApiError(400, 'Email is already verified');
        }
        return await sendEmailVerificationLink(user);


    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Failed to resend verification email');
    }
}