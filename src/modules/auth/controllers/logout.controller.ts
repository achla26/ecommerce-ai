/**
 * @copyright 2025 
 * @license Apache-2.0
 */


/**
 * Custom Modules
 */
import { ApiResponse } from "@/lib/api-response";
import asyncHandler from "@/middlewares/async-handler.middleware";
import { tokenService } from "@/modules/auth/services/token.service";
import { authCookieOptions } from "@/utils/cookie";

export const logout = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies?.refreshToken;

    tokenService.deleteToken(refreshToken);

    res.clearCookie('accessToken', authCookieOptions.accessToken);

    res.clearCookie('refreshToken', authCookieOptions.refreshToken);

    new ApiResponse(
        res,
        201,
        "User logout successfully",
    );

});


export const refreshToken = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies.refreshToken as string;

    // const accessToken = await tokenService.refreshToken(refreshToken);

    new ApiResponse(
        res,
        201,
        "User Login successfully",
        {}
    );

});
