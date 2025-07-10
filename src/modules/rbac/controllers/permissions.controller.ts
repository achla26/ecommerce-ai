/**
 * @copyright 2025
 * @license Apache-2.0
 */

/**
 * Custom Modules
 */
import { ApiResponse } from '@/lib/api-response';
import asyncHandler from '@/middlewares/async-handler.middleware';

/**
 * Services
 */
import { userAccessService } from '@/modules/rbac/services/user-access.service';
import { permissionService } from '@/modules/rbac/services/permission.service';
import type {
    managePermissionInput,
    SyncPermissionRolesInput
} from '@/types/rbac';
import { ApiError } from '@/lib/api-error';
import { roleService } from '../services/role.service';

class PermissionController {

    // Get all permissions
    getAllPermissions = asyncHandler(async (req, res) => {
        const permissions = await permissionService.getAllPermissions();

        new ApiResponse(
            res,
            200,
            "Permissions fetched successfully",
            { permissions }
        );
    });

    // Get permission by ID
    getPermissionById = asyncHandler(async (req, res) => {
        const permission = await permissionService.getPermissionById(req.params.permissionId);
        if (!permission) {
            throw new ApiError(404, 'Permission not found');
        }

        new ApiResponse(
            res,
            200,
            "Permission fetched successfully",
            permission
        );
    });

    // Create a new permission
    createPermission = asyncHandler(async (req, res) => {
        const input = req.validatedData as managePermissionInput;
        const { name, guard_name = 'api' } = input;
        const permission = await permissionService.createPermission(name, guard_name);

        new ApiResponse(
            res,
            201,
            'Permission created successfully',
            permission
        );
    });

    // Update permission
    updatePermission = asyncHandler(async (req, res) => {
        const input = req.validatedData as managePermissionInput;
        const permission = await permissionService.updatePermission(
            req.params.permissionId,
            input
        );

        new ApiResponse(
            res,
            200,
            "Permission updated successfully",
            permission
        );
    });

    // Delete permission
    deletePermission = asyncHandler(async (req, res) => {
        await permissionService.deletePermission(req.params.permissionId);

        new ApiResponse(
            res,
            204,
            "Permission deleted successfully"
        );
    });

    /**
     * Sync roles for a permission
     */
    syncPermissionRoles = asyncHandler(async (req, res) => {
        const { roleIds } = req.validatedData as SyncPermissionRolesInput;
        await permissionService.syncPermissionRoles(
            req.params.permissionId,
            roleIds
        );

        new ApiResponse(
            res,
            200,
            'Permission roles synced successfully'
        );
    });

    // Assign Permissions to Roles
    // assignPermissionToRole = asyncHandler(async (req, res) => {
    //     await permissionService.assignPermissionToRole(req.params.permissionId);

    //     new ApiResponse(
    //         res,
    //         204,
    //         "Permission deleted successfully"
    //     );
    // });

    // // Assign Permissions to Roles
    // revokePermissionFromRole = asyncHandler(async (req, res) => {
    //     await permissionService.revokePermissionFromRole(req.params.permissionId);

    //     new ApiResponse(
    //         res,
    //         204,
    //         "Permission deleted successfully"
    //     );
    // });

}

export const permissionController = new PermissionController();
