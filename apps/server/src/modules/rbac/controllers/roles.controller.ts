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
import { roleService } from '@/modules/rbac/services/role.service';
import { permissionConfig, roleConfig } from '@/types/rbac';
import { ApiError } from '@/lib/api-error';

class RoleController {
    // Get all roles
    getAllRoles = asyncHandler(async (req, res) => {
        const roles = await roleService.getAllRoles();

        new ApiResponse(
            res,
            200,
            "Roles fetched successfully",
            { roles }
        );
    });

    // Get role by ID
    getRoleById = asyncHandler(async (req, res) => {
        const role = await roleService.getRoleById(req.params.roleId);
        if (!role) {
            throw new ApiError(404, 'Role not found');
        }

        new ApiResponse(
            res,
            200,
            "Role fetched successfully",
            role
        );
    });

    // Create a new role
    createRole = asyncHandler(async (req, res) => {
        const { name, guard_name = 'api' } = req.validatedData as roleConfig;
        const role = await roleService.createRole(name, guard_name);

        new ApiResponse(
            res,
            201,
            "Role created successfully",
            role
        );
    });

    // Update role
    updateRole = asyncHandler(async (req, res) => {
        const role = await roleService.updateRole(
            req.params.roleId,
            req.validatedData as roleConfig
        );
        if (!role) {
            throw new ApiError(404, 'Role not found');
        }
        new ApiResponse(
            res,
            200,
            "Role updated successfully",
            role
        );
    });

    // Delete role
    deleteRole = asyncHandler(async (req, res) => {
        const role = await roleService.deleteRole(req.params.roleId);
        if (!role) {
            throw new ApiError(404, 'Role not found');
        }
        new ApiResponse(
            res,
            204,
            "Role deleted successfully"
        );
    });

    // Get role permissions
    getRolePermissions = asyncHandler(async (req, res) => {
        const permissions = await roleService.getRolePermissions(req.params.roleId);

        new ApiResponse(
            res,
            200,
            "Role permissions fetched successfully",
            { permissions }
        );
    });

    // Sync role permissions
    syncRolePermissions = asyncHandler(async (req, res) => {
        const { permissions } = req.validatedData as permissionConfig;
        await roleService.syncRolePermissions(req.params.roleId, permissions);

        new ApiResponse(
            res,
            200,
            "Role permissions synced successfully"
        );
    });

}

export const roleController = new RoleController();
