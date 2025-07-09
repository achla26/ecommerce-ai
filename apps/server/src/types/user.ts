export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    emailVerified: Date | null;
    createdAt: Date;
    lastLogin: Date | null;
}