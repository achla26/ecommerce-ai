import { z } from "zod";

export const tokenSchema = z.object({
    token: z.string({
        required_error: "Token is required",
        invalid_type_error: "Token must be a string"
    }),
});
export const resndVerifyEmailTokenSchema = z.object({
    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
    }).email("Invalid email address"),
});
