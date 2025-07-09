/**
 * @copyright 2025
 * @license Apache-2.0
 */

import { ApiResponse } from '@/lib/api-response';
import asyncHandler from '@/middlewares/async-handler.middleware';
import { userAccessService } from '@/modules/rbac/services/user-access.service';
import { ApiError } from '@/lib/api-error';

import { syncRolesSchema, syncPermissionRolesSchema, syncPermissionsSchema, manageRoleSchema } from '@/schemas/rbac';

class UserAccessController {
    // Check if a user has a specific role
    userHasRole = asyncHandler(async (req, res) => {
        const userId = req.params.userId || req.body.userId || req.userId;
        const roleName = req.body;

        if (!userId || !roleName) {
            throw new ApiError(400, 'Missing userId or roleName');
        }
        const hasRole = await userAccessService.userHasRole(userId, roleName);
        new ApiResponse(res, 200, 'User role checked', { hasRole });
    });

    // Get all roles assigned to a user     
    getUserRoles = asyncHandler(async (req, res) => {
        const userId = req.params.userId || req.body.userId || req.userId;
        if (!userId) {
            throw new ApiError(400, 'Missing userId');
        }
        const roles = await userAccessService.getUserRoles(userId);
        new ApiResponse(res, 200, 'User roles retrieved', { roles });
    });

    //Synchronize (replace) all roles for a user
    syncUserRoles = asyncHandler(async (req, res) => {
        const userId = req.params.userId || req.body.userId || req.userId;
        const role = req.body;

        if (!userId || !role) {
            throw new ApiError(400, 'Missing userId or role IDs');
        }
        const { roles } = syncRolesSchema.parse(role);

        await userAccessService.syncUserRoles(userId, roles);

        new ApiResponse(res, 204, 'User roles synced');
    });

    //Add a single role to a user
    addRoleToUser = asyncHandler(async (req, res) => {
        const userId = req.params.userId || req.body.userId || req.userId;
        const { roleId } = req.validatedData as any;

        if (!userId || !roleId) {
            throw new ApiError(400, 'Missing userId or role ID');
        }
        await userAccessService.addRoleToUser(userId, roleId);
        new ApiResponse(res, 201, 'Role added to user');
    });

    //Remove a single role from a user     
    removeRoleFromUser = asyncHandler(async (req, res) => {
        const userId = req.params.userId || req.body.userId || req.userId;
        const roleId = req.params.roleId || req.body.roleId;

        if (!userId || !roleId) {
            throw new ApiError(400, 'Missing userId or role ID');
        }
        await userAccessService.removeRoleFromUser(userId, roleId);
        new ApiResponse(res, 204, 'Role removed from user');
    });
    //  Get all permissions assigned to a user (direct + via roles)

    getUserPermissions = asyncHandler(async (req, res) => {
        const userId = req.params.userId || req.body.userId || req.userId;
        const roleId = req.params.roleId || req.body.roleId;

        if (!userId || !roleId) {
            throw new ApiError(400, 'Missing userId or role ID');
        }

        const permissions = await userAccessService.getUserPermissions(userId);

        new ApiResponse(res, 200, 'Permissions fetched', { permissions });
    });
    //  * Synchronize (replace) direct permissions for a user

    syncUserPermissions = asyncHandler(async (req, res) => {
        const { permissions } = syncPermissionsSchema.parse(req.body);
        const userId = req.params.userId || req.body.userId || req.userId;

        if (!userId || !permissions) {
            throw new ApiError(400, 'Missing userId or role ID');
        }
        await userAccessService.syncUserPermissions(userId, permissions);
        new ApiResponse(res, 204, 'Permissions synced');
    });
    //  * Synchronize (replace) direct permissions for a user

    givePermissionToUser = asyncHandler(async (req, res) => {
        const permissionId = req.body;
        const userId = req.params.userId || req.body.userId || req.userId;

        if (!userId || !permissionId) {
            throw new ApiError(400, 'Missing userId or permission ID');
        }
        await userAccessService.givePermissionToUser(req.params.userId, permissionId);
        new ApiResponse(res, 200, 'Permission granted');
    });

    revokePermissionFromUser = asyncHandler(async (req, res) => {
        const permissionId = req.body;
        const userId = req.params.userId || req.body.userId || req.userId;

        if (!userId || !permissionId) {
            throw new ApiError(400, 'Missing userId or permission ID');
        }
        await userAccessService.revokePermissionFromUser(req.params.userId, permissionId);
        new ApiResponse(res, 200, 'Permission revoked');
    });

    userHasPermission = asyncHandler(async (req, res) => {
        const userId = req.params.userId || req.body.userId;
        const permissionName = req.body.permissionName;

        if (!userId || !permissionName) {
            throw new ApiError(400, 'Missing userId or permissionName');
        }
        const result = await userAccessService.userHasPermission(userId, permissionName);

        new ApiResponse(res, 200, 'Permission check complete', { result });
    });

    getAllUserPermissions = asyncHandler(async (req, res) => {
        const userId = req.params.userId || req.body.userId || req.userId;

        if (!userId) {
            throw new ApiError(400, 'Missing userId ');
        }
        const permissions = await userAccessService.getAllUserPermissions(userId);
        new ApiResponse(res, 200, 'All permissions fetched', { permissions });
    });

    getUsersWithPermission = asyncHandler(async (req, res) => {
        const userId = req.params.userId || req.body.userId;
        const permissionName = req.body.permissionName;

        if (!userId || !permissionName) {
            throw new ApiError(400, 'Missing userId or permissionName');
        }
        const users = await userAccessService.getUsersWithPermission(permissionName);
        new ApiResponse(res, 200, 'Users with permission', { users });
    });

}
export const userAccessController = new UserAccessController();
