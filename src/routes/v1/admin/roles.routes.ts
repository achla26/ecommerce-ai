/**
 * @copyright 2025 
 * @license Apache-2.0
 */

/**
 * node modules
 */
import { Router } from 'express';

/**
 * Controllers
 */
import { roleController } from '@/modules/rbac/controllers/roles.controller';
import { hasPermission, hasRole } from '@/middlewares/authorization.middleware';

/**
 * Middlewares
 */
import { validateRequest } from '@/middlewares/validate-request.middleware';
import authenticate from '@/middlewares/authenticated.middleware';
/**
 * Schemas
 */
import { manageRoleSchema, syncPermissionsSchema } from '@/schemas/rbac';


const router = Router();

// Apply authentication middleware to all routes
// router.use(authenticate);

// Get all roles - Admin only
router.get(
    '/',
    authenticate,
    // hasRole('admin'),
    // hasPermission('view_roles'),
    roleController.getAllRoles
);

// Create new role - Admin only
router.post(
    '/',
    // hasRole('admin'),
    // hasPermission('create_roles'),
    validateRequest(manageRoleSchema),
    roleController.createRole
);

// Get role details - Admin only
router.get(
    '/:roleId',
    // hasRole('admin'),
    // hasPermission('view_roles'),
    roleController.getRoleById
);

// Update role - Admin only
router.put(
    '/:roleId',
    // hasRole('admin'),
    // hasPermission('update_roles'),
    validateRequest(manageRoleSchema),
    roleController.updateRole
);

// Delete role - Admin only
router.delete(
    '/:roleId',
    // hasRole('admin'),
    // hasPermission('delete_roles'),
    roleController.deleteRole
);

// Get role permissions - Admin only
router.get(
    '/:roleId/permissions',
    // hasRole('admin'),
    // hasPermission('view_permissions'),
    roleController.getRolePermissions
);

// Sync role permissions - Admin only
router.put(
    '/:roleId/permissions',
    // hasRole('admin'),
    // hasPermission('update_permissions'),
    validateRequest(syncPermissionsSchema),
    roleController.syncRolePermissions
);

export default router;