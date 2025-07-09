import { UserRole } from '@prisma/client';



export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

interface IOtpAttempts {
    count: number;
    lastAttempt: Date;
}

interface ISocialLinks {
    website?: string;
    facebook?: string;
    instagram?: string;
    x?: string;
    youtube?: string;
    linkedin?: string;
}

export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    username: string;
    gender?: Gender;
    // role: UserRole;
    socialLinks?: ISocialLinks;
    profilePicture?: string;
    lastLogin?: Date;
    otpAttempts?: IOtpAttempts;
    emailVerified: Date | null;
}

// export type RegisterUserInput = Pick<IUser, 'email' | 'password'>;

export type LoginCredentials = Pick<IUser, 'email' | 'password'>;



export interface RegisterUserInput {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    gender?: 'male' | 'female' | 'other';
}

export type UserResponse = Omit<IUser, 'password' | 'otpAttempts'>;

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
}
