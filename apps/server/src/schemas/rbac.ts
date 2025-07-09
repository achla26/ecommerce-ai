import z from "zod";

export const manageRoleSchema = z.object({
    name: z.string().min(2).max(50),
    guard_name: z.string().default('api')
});

// export const updateRoleSchema = z.object({
//     name: z.string().min(2).max(50).optional(),
//     guard_name: z.string().optional()
// });


export const syncRolesSchema = z.object({
    roles: z.array(z.string().cuid()).min(1)
});

export const syncPermissionsSchema = z.object({
    permissions: z.array(z.string().cuid()).min(1)
});


// Validation schemas
export const createPermissionSchema = z.object({
    name: z.string().min(3).max(50),
    guard_name: z.string().default('api'),
    description: z.string().optional()
});

export const updatePermissionSchema = createPermissionSchema.partial();

export const syncPermissionRolesSchema = z.object({
    roleIds: z.array(z.string().cuid()).min(1)
});


export const addRoleToUserSchema = z.object({
    roleId: z.string().cuid()
});
