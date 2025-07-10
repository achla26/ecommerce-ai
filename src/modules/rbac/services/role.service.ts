import { db } from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';

class RoleService {
    // Get all roles
    async getAllRoles() {
        try {
            return await db.role.findMany({
                include: {
                    permissions: true
                },
            });
        } catch (err) {
            throw err;
        }
    }

    // Get role by ID
    async getRoleById(roleId: string) {
        try {
            return await db.role.findUnique({
                where: { id: roleId },
                include: {
                    permissions: true
                },
            });
        } catch (err) {
            throw err;
        }
    }

    // Create a new role
    async createRole(name: string, guardName: string = 'api') {
        try {
            return await db.role.create({
                data: {
                    name,
                    guard_name: guardName,
                },
            });
        } catch (err) {
            throw err;
        }
    }

    // Update role
    async updateRole(roleId: string, data: { name?: string; guard_name?: string }) {
        try {
            return await db.role.update({
                where: { id: roleId },
                data,
            });
        } catch (err) {
            throw err;
        }
    }

    // Delete a role
    async deleteRole(roleId: string) {
        try {
            return await db.role.delete({
                where: { id: roleId },
            });
        } catch (err) {
            throw err;
        }
    }

    // Get all permissions for a role
    async getRolePermissions(roleId: string) {
        try {
            const role = await db.role.findUnique({
                where: { id: roleId },
                include: {
                    RolePermission: true
                },
            });

            return role?.RolePermission || [];
        } catch (err) {
            throw err;
        }
    }

    // Sync role permissions (replace all existing permissions)
    async syncRolePermissions(roleId: string, permissionIds: string[]) {
        try {
            return await db.$transaction([
                db.rolePermission.deleteMany({
                    where: { roleId },
                }),
                db.rolePermission.createMany({
                    data: permissionIds.map((permissionId) => ({
                        roleId,
                        permissionId,
                    })),
                }),
            ]);
        } catch (err) {
            throw err;
        }
    }
}

export const roleService = new RoleService();