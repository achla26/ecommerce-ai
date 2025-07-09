export function sanitizeUser(user: any) {
    const { password, refreshToken, ...sanitizedUser } = user;
    return sanitizedUser;
}