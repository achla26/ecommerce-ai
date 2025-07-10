import { db } from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';

class PermissionService {
    // Get all permissions in the system
    async getAllPermissions() {
        try {
            return await db.permission.findMany();
        } catch (err) {
            throw err;
        }
    }

    // Get permission by ID
    async getPermissionById(permissionId: string) {
        try {
            return await db.permission.findUnique({
                where: { id: permissionId },
            });
        } catch (err) {
            throw err;
        }
    }

    // Permission Management
    async createPermission(name: string, guardName: string = 'api') {
        try {
            return await db.permission.create({
                data: {
                    name,
                    guard_name: guardName,
                },
            });
        } catch (err) {
            throw err;
        }
    }

    // Update a permission
    async updatePermission(permissionId: string, data: { name?: string; guard_name?: string }) {
        try {
            return await db.permission.update({
                where: { id: permissionId },
                data,
            });
        } catch (err) {
            throw err;
        }
    }

    async deletePermission(permissionId: string) {
        try {
            return await db.permission.delete({
                where: { id: permissionId },
            });
        } catch (err) {
            throw err;
        }
    }
    syncPermissionRoles(permissionId: string, roleIds: string[]) {
        throw new Error('Method not implemented.');
    }

    // Assign Permissions to Roles
    async assignPermissionToRole(roleId: string, permissionId: string) {
        try {
            return await db.rolePermission.create({
                data: {
                    roleId,
                    permissionId,
                },
            });
        } catch (err) {
            throw err;
        }
    }

    async revokePermissionFromRole(roleId: string, permissionId: string) {
        try {
            return await db.rolePermission.delete({
                where: {
                    roleId_permissionId: {
                        roleId,
                        permissionId,
                    },
                },
            });
        } catch (err) {
            throw err;
        }
    }

    // Assign Roles to Users


}

export const permissionService = new PermissionService();
