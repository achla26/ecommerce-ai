interface ICookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge?: number;
    domain?: string;
}

export const getCookieOptions = (maxAge?: number): ICookieOptions => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    ...(maxAge && { maxAge }) // Optional maxAge
});

// Pre-configured options for common cases
export const authCookieOptions = {
    accessToken: getCookieOptions(15 * 60 * 1000), // 15 mins
    refreshToken: getCookieOptions(7 * 24 * 60 * 60 * 1000) // 7 days
};
