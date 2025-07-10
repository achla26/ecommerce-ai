// src/services/user/user.service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ApiError } from '@/lib/api-error';
import { tokenService } from '@/modules/auth/services/token.service';
import { mailService } from '@/services/mail';
import {
    RegisterUserInput,
    LoginCredentials,
    AuthResponse,
    UserResponse,
    IUser
} from '@/types/auth';
import { sanitizeUser } from '@/utils/user';
import { PaginationOptions, PaginationResult } from '@/types/pagination';

const prisma = new PrismaClient();

class UserService {
    // Get user by ID
    async getUserById(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    emailVerified: true,
                    profilePicture: true
                }
            });

            if (!user) {
                throw new ApiError(404, 'User not found');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }
    async getUserByEmail(email: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email },
                select: {
                    id: true,
                    email: true,
                    emailVerified: true,
                    profilePicture: true
                }
            });

            if (!user) {
                throw new ApiError(404, 'User not found');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }
    // Get all users with pagination
    // async getAllUsers(options: PaginationOptions): Promise<PaginationResult<IUser>> {
    //     try {
    //         const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    //         const skip = (page - 1) * limit;
    //         const take = limit;

    //         const [users, totalCount] = await Promise.all([
    //             prisma.user.findMany({
    //                 skip,
    //                 take,
    //                 orderBy: { [sortBy]: sortOrder },
    //                 select: {
    //                     id: true,
    //                     firstName: true,
    //                     lastName: true,
    //                     email: true,
    //                     username: true,
    //                     emailVerified: true,
    //                     createdAt: true,
    //                     updatedAt: true,
    //                     // Exclude sensitive fields
    //                     password: false
    //                 }
    //             }),
    //             prisma.user.count()
    //         ]);

    //         return {
    //             data: users,
    //             pagination: {
    //                 total: totalCount,
    //                 totalPages: Math.ceil(totalCount / limit),
    //                 currentPage: page,
    //                 limit
    //             }
    //         };
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // // Search users with filters and pagination
    // async searchUsers(
    //     query: string,
    //     options: PaginationOptions
    // ): Promise<PaginationResult<IUser>> {
    //     try {
    //         const { page = 1, limit = 10 } = options;
    //         const skip = (page - 1) * limit;
    //         const take = limit;

    //         const [users, totalCount] = await Promise.all([
    //             prisma.user.findMany({
    //                 where: {
    //                     OR: [
    //                         { firstName: { contains: query, mode: 'insensitive' } },
    //                         { lastName: { contains: query, mode: 'insensitive' } },
    //                         { email: { contains: query, mode: 'insensitive' } },
    //                         { username: { contains: query, mode: 'insensitive' } }
    //                     ]
    //                 },
    //                 skip,
    //                 take,
    //                 select: {
    //                     id: true,
    //                     firstName: true,
    //                     lastName: true,
    //                     email: true,
    //                     username: true,
    //                     // Exclude sensitive fields
    //                     password: false
    //                 }
    //             }),
    //             prisma.user.count({
    //                 where: {
    //                     OR: [
    //                         { firstName: { contains: query, mode: 'insensitive' } },
    //                         { lastName: { contains: query, mode: 'insensitive' } },
    //                         { email: { contains: query, mode: 'insensitive' } },
    //                         { username: { contains: query, mode: 'insensitive' } }
    //                     ]
    //                 }
    //             })
    //         ]);

    //         return {
    //             data: users,
    //             pagination: {
    //                 total: totalCount,
    //                 totalPages: Math.ceil(totalCount / limit),
    //                 currentPage: page,
    //                 limit
    //             }
    //         };
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // // Get User profilePicture
    // async getprofilePicture(userId: string): Promise<UserResponse> {
    //     try {
    //         const user = await prisma.user.findUnique({
    //             where: { id: userId },
    //             select: {
    //                 id: true,
    //                 firstName: true,
    //                 lastName: true,
    //                 username: true,
    //                 email: true,
    //                 emailVerified: true,
    //                 createdAt: true,
    //                 lastLogin: true
    //             }
    //         });

    //         if (!user) {
    //             throw new ApiError(404, 'User not found');
    //         }

    //         return user;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // Resend Verification Email
    // async resendVerification(userId: string): Promise<{ verificationLink: string }> {
    //     try {
    //         const user = await prisma.user.findUnique({
    //             where: { id: userId },
    //             select: { email: true, emailVerified: true }
    //         });

    //         if (!user) {
    //             throw new ApiError(404, 'User not found');
    //         }

    //         if (user.emailVerified) {
    //             throw new ApiError(400, 'Email already verified');
    //         }

    //         const { verificationLink } =
    //             await tokenService.handleUnverifiedUser({ id: userId, email: user.email });

    //         return { verificationLink };
    //     } catch (error) {
    //         throw error;
    //     }
    // }
}

export const userService = new UserService();