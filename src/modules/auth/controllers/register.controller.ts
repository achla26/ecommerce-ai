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
import registerService from "@/modules/auth/services/register.service";
/**
 * Types
 */
import { RegisterUserInput } from "@/types/auth";
import { authCookieOptions } from "@/utils/cookie";

const register = asyncHandler(async (req, res) => {
    // req.validatedData is now guaranteed to be valid
    const result = await registerService(req.validatedData as RegisterUserInput);

    res.cookie('accessToken', result.tokens.accessToken, authCookieOptions.accessToken);

    new ApiResponse(
        res,
        201,
        "User registered successfully",
        result
    );

});

export default register;