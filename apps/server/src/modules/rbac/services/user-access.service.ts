import { db } from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';

type Role = {
    id: string;
    name: string;
};

type Permission = {
    id: string;
    name: string;
};
class UserAccessService {
    // Check if a user has a specific role
    // async userHasRole(userId: string, roleName: string): Promise<boolean> {
    //     try {
    //         const role = await db.userRole.findFirst({
    //             where: {
    //                 userId,
    //                 role: {
    //                     name: roleName,
    //                 },
    //             },
    //         });

    //         return !!role; // true if found, false otherwise
    //     } catch (err) {
    //         throw err;
    //     }
    // }
    // Get all user roles
    async getUserRoles(userId: string) {
        try {
            const roles = await db.userRole.findMany({
                where: { userId },
                include: {
                    role: true,
                },
            });

            return roles.map(p => ({
                id: p.role.id,
                name: p.role.name
            }));
        } catch (err) {
            throw err;
        }
    }

    // Sync user roles (replace all existing roles)
    async syncUserRoles(userId: string, roleIds: string[]) {
        try {
            return await db.$transaction([
                db.userRole.deleteMany({
                    where: { userId },
                }),
                db.userRole.createMany({
                    data: roleIds.map((roleId) => ({
                        userId,
                        roleId,
                    })),
                }),
            ]);
        } catch (err) {
            throw err;
        }
    }

    /**
        * Add a single role to a user
        * @param userId - The ID of the user
        * @param roleId - The ID of the role to add
        * @throws ApiError if user or role doesn't exist, or if assignment already exists
        */
    async addRoleToUser(userId: string, roleId: string) {
        try {
            return await db.$transaction(async (tx) => {
                // 1. Verify user exists
                const user = await tx.user.findUnique({
                    where: { id: userId },
                    select: { id: true }
                });
                if (!user) {
                    throw new ApiError(404, 'User not found');
                }

                // 2. Verify role exists
                const role = await tx.role.findUnique({
                    where: { id: roleId },
                    select: { id: true }
                });
                if (!role) {
                    throw new ApiError(404, 'Role not found');
                }

                // 3. Check if assignment already exists
                const existingAssignment = await tx.userRole.findUnique({
                    where: {
                        userId_roleId: {
                            userId,
                            roleId
                        }
                    }
                });

                if (existingAssignment) {
                    throw new ApiError(409, 'User already has this role');
                }

                // 4. Create the assignment
                return await tx.userRole.create({
                    data: {
                        userId,
                        roleId
                    },
                    include: {
                        role: true
                    }
                });
            });
        } catch (err) {
            throw err;
        }
    }

    /**
     * Remove a single role from a user
     * @param userId - The ID of the user
     * @param roleId - The ID of the role to remove
     * @throws ApiError if assignment doesn't exist
     */
    async removeRoleFromUser(userId: string, roleId: string) {
        try {
            return await db.$transaction(async (tx) => {
                // 1. Verify assignment exists
                const assignment = await tx.userRole.findUnique({
                    where: {
                        userId_roleId: {
                            userId,
                            roleId
                        }
                    }
                });

                if (!assignment) {
                    throw new ApiError(404, 'Role assignment not found');
                }

                // 2. Delete the assignment
                return await tx.userRole.delete({
                    where: {
                        userId_roleId: {
                            userId,
                            roleId
                        }
                    },
                    include: {
                        role: true
                    }
                });
            });
        } catch (err) {
            throw err;
        }
    }
    // Get all user permissions (direct + via roles)
    async getUserPermissions(userId: string) {
        try {
            const permissions = await db.userPermission.findMany({
                where: { userId },
                include: {
                    permission: true,
                },
            });

            return permissions.map(p => ({
                id: p.permission.id,
                name: p.permission.name
            }));
        } catch (err) {
            throw err;
        }

    }

    // Sync user direct permissions
    async syncUserPermissions(userId: string, permissionIds: string[]) {
        try {
            return await db.$transaction([
                db.userPermission.deleteMany({
                    where: { userId },
                }),
                db.userPermission.createMany({
                    data: permissionIds.map((permissionId) => ({
                        userId,
                        permissionId,
                    })),
                }),
            ]);
        } catch (err) {
            throw err;
        }
    }


    //!SECTION

    // Assign Direct Permissions to Users
    async givePermissionToUser(userId: string, permissionId: string) {
        try {
            return await db.userPermission.create({
                data: {
                    userId,
                    permissionId,
                },
            });
        } catch (err) {
            throw err;
        }
    }

    async revokePermissionFromUser(userId: string, permissionId: string) {
        try {
            return await db.userPermission.delete({
                where: {
                    userId_permissionId: {
                        userId,
                        permissionId,
                    },
                },
            });
        } catch (err) {
            throw err;
        }
    }

    // Check if a user has a specific permission (direct or via roles)
    async userHasPermission(userId: string, permissionName: string): Promise<boolean> {
        try {
            // 1. Check direct permissions (optimized query)
            const directPermission = await db.userPermission.findFirst({
                where: {
                    user: { id: userId },
                    permission: { name: permissionName }
                },
                select: {
                    permission: {
                        select: { name: true }
                    }
                }
            });
            if (directPermission) return true;

            // 2. Check role permissions (optimized query)
            const rolePermission = await db.rolePermission.findFirst({
                where: {
                    role: {
                        users: {
                            some: {
                                id: userId
                            }
                        }
                    },
                    permission: { name: permissionName }
                },
                select: {
                    permission: {
                        select: { name: true }
                    }
                }
            });

            return !!rolePermission;
        } catch (error) {
            console.error(`Permission check failed for user ${userId}:`, error);
            throw new ApiError(500, 'Failed to verify permissions');
        }
    }

    // Get all permissions (direct + via roles) for a user
    async getAllUserPermissions(userId: string): Promise<string[]> {
        try {
            const user = await db.user.findUnique({
                where: { id: userId },
                include: {
                    permissions: true,
                    roles: {
                        include: {
                            permissions: true,
                        },
                    },
                },
            });

            if (!user) return [];

            const directPermissions = user.permissions.map((p) => p.name);
            const rolePermissions = user.roles.flatMap((r) =>
                r.permissions.map((p) => p.name)
            );

            return [...new Set([...directPermissions, ...rolePermissions])];
        } catch (err) {
            throw err;
        }
    }

    // Get all users who have a specific permission (direct or via role)
    async getUsersWithPermission(permissionName: string) {
        try {
            return await db.user.findMany({
                where: {
                    OR: [
                        {
                            permissions: {
                                some: {
                                    name: permissionName,
                                },
                            },
                        },
                        {
                            roles: {
                                some: {
                                    permissions: {
                                        some: {
                                            name: permissionName,
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
            });
        } catch (err) {
            throw err;
        }
    }


    // Updated with proper typing
    async userHasRole(userId: string, roleName: string): Promise<boolean> {
        const userRoles = await this.getUserRoles(userId); // Returns Role[]
        return userRoles.some((role: Role) => role.name === roleName);
    }

    // async userHasPermission(userId: string, permissionName: string): Promise<boolean> {
    //     const userPermissions = await this.getUserPermissions(userId); // Returns Permission[]
    //     return userPermissions.some((perm: Permission) => perm.name === permissionName);
    // }

    // Batch checking methods
    async userHasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
        const userRoles = await this.getUserRoles(userId);
        return roleNames.some(roleName =>
            userRoles.some((role: Role) => role.name === roleName)
        );
    }

    async userHasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
        const userPermissions = await this.getUserPermissions(userId);
        return permissionNames.every(permName =>
            userPermissions.some((perm: Permission) => perm.name === permName)
        );
    }

}

export const userAccessService = new UserAccessService();
