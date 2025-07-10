import { z } from "zod";

import { firstNameSchema, lastNameSchema, usernameSchema, emailSchema, passwordMatchSchema, genderSchema } from "@/validators/auth";

const RegisterSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    username: usernameSchema,
    email: emailSchema,
    gender: genderSchema,
}).and(passwordMatchSchema);

export default RegisterSchema;

export type RegisterType = z.infer<typeof RegisterSchema>;