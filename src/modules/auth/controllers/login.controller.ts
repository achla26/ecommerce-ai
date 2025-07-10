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
import loginService from "@/modules/auth/services/login.service";
/**
 * Types
 */
import { LoginCredentials } from "@/types/auth";
/**
 * utils
 */
import { authCookieOptions } from '@/utils/cookie';


const login = asyncHandler(async (req, res) => {

    const result = await loginService(req.validatedData as LoginCredentials);

    if (result.requiresVerification) {
        res.cookie('accessToken', result.accessToken, authCookieOptions.accessToken);
        new ApiResponse(
            res,
            201,
            "Email verification link sent to your mail. please verify your Email",
            result
        );
    } else {
        // Destructure tokens from result
        const { accessToken, refreshToken } = result;
        // Set cookies using pre-configured options
        res.cookie('accessToken', accessToken, authCookieOptions.accessToken);

        res.cookie('refreshToken', refreshToken, authCookieOptions.refreshToken);

        new ApiResponse(
            res,
            201,
            "User Login successfully",
            result
        );
    }


});

export default login;