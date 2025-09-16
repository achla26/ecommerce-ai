/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import { TokenType } from '@/types/token';
import bcrypt from 'bcrypt';
/**
 * Custom Modules
 */
import { ApiError } from "@/lib/api-error";
import {
    generateAccessToken,
    generateRefreshToken,
    generateToken,
    generateVerificationToken,
    parseJwtExpiry
} from '@/lib/jwt';
import { db } from '@/lib/prisma';
import { sanitizeUser } from "@/utils/user";

/**
 * Types
 */
import { RegisterUserInput } from '@/types/auth';
/**
 * Services
 */
import { mailService } from '@/services/mail';
import { tokenService } from '@/modules/auth/services/token.service';
import { UserRepository } from '@/repositories/user.repository';


const userRepository = new UserRepository(db);

const Register = async (userData: RegisterUserInput) => {
    try {

        // Validate password confirmation
        if (userData.password !== userData.confirmPassword) {
            throw ApiError.badRequest("Passwords do not match");
        }

        // Check for existing user with same email or username
        const existingUser = await userRepository.findByEmailOrUsername(
            userData.email,
            userData.username
        );

        if (existingUser) {
            throw ApiError.conflict(
                existingUser.email === userData.email
                    ? 'Email already in use'
                    : 'Username already taken'
            );
        }

        // Hash password before storage
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const result = await db.$transaction(async (tx) => {
            const user = await userRepository.createUser(
                {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    username: userData.username,
                    email: userData.email,
                    password: hashedPassword,
                    confirmPassword: hashedPassword,
                },
                tx
            );

            if (!user?.id) {
                throw ApiError.internal("User creation failed");
            }
            // Generate verification token USING THE SAME TRANSACTION 

            const verificationToken = await tokenService.generateAndStoreToken(
                "verify",
                user.id,
                tx
            );

            const tempAccessToken = await generateToken(TokenType.TEMP_ACCESS, user.id);

            //TODO Send verification email (uncomment when ready)

            const verificationLink = await mailService.sendVerificationEmail(
                user.email,
                verificationToken
            );

            return {
                user: sanitizeUser(user),
                tokens: {
                    accessToken: tempAccessToken,
                    refreshToken: null,
                },
                requiresVerification: true,
                verificationLink,
            };
        });

        return result;
    } catch (error) {
        // Re-throw ApiErrors, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Registration failed', {
            errorType: 'DATABASE_ERROR',
            originalError: error as Error
        });
    }
}

export default Register;