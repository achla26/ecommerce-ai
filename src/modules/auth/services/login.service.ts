import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ApiError } from '@/lib/api-error';
import { tokenService } from '@/modules/auth/services/token.service';
import { LoginCredentials } from '@/types/auth';
import { sanitizeUser } from '@/utils/user';
import { sendEmailVerificationLink } from '@/modules/auth/services/email-verification.service'
const prisma = new PrismaClient();

async function login(credentials: LoginCredentials) {
    const { email, password } = credentials;

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                username: true,
                password: true,
                emailVerified: true,
                // role: true,
            },
        });

        if (!user) {
            throw new ApiError(404, 'User with this email does not exist', {
                errorType: 'NOT_FOUND',
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ApiError(401, 'Invalid credentials', {
                errorType: 'AUTHENTICATION_ERROR',
            });
        } // TO DO: Enable this if email verification is required


        // Handle unverified users
        if (!user.emailVerified) {
            const { verificationToken, accessToken, verificationLink } = await sendEmailVerificationLink(user)

            return {
                verificationToken, accessToken, verificationLink,
                user: sanitizeUser(user),
                requiresVerification: true,
            };
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        // Generate full access tokens for verified users

        const { accessToken, refreshToken } = await tokenService.createTokenPair(user.id);

        return {
            requiresVerification: false,
            accessToken,
            refreshToken,
            verificationLink: null,
            user: sanitizeUser(user)
        };

    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

export default login;