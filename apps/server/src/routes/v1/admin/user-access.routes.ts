/**
 * @copyright 2025 
 * @license Apache-2.0
 */

import express from 'express';
import { userAccessController } from '@/modules/rbac/controllers/user-access.controller';
import { hasRole, hasPermission } from '@/middlewares/authorization.middleware';
import { validateRequest } from '@/middlewares/validate-request.middleware';
import authenticate from '@/middlewares/authenticated.middleware';
import {
    syncRolesSchema,
    syncPermissionsSchema,
    manageRoleSchema,
    addRoleToUserSchema
} from '@/schemas/rbac';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ========== USER ROLES ==========

// GET /:userId/roles
router.get(
    '/:userId/roles',
    // hasRole('admin'),
    // hasPermission('view_user_roles'),
    userAccessController.getUserRoles
);

// PUT /:userId/roles
router.put(
    '/:userId/roles',
    // hasRole('admin'),
    // hasPermission('manage_user_roles'),
    validateRequest(syncRolesSchema),
    userAccessController.syncUserRoles
);

// POST /:userId/roles
router.post(
    '/:userId/roles',
    // hasRole('admin'),
    // hasPermission('manage_user_roles'),
    validateRequest(addRoleToUserSchema),
    userAccessController.addRoleToUser
);

// DELETE /:userId/roles/:roleId
router.delete(
    '/:userId/roles/:roleId',
    // hasRole('admin'),
    // hasPermission('manage_user_roles'),
    userAccessController.removeRoleFromUser
);

// ========== USER PERMISSIONS ==========

// GET /:userId/permissions
router.get(
    '/:userId/permissions',
    // hasRole('admin'),
    // hasPermission('view_user_permissions'),
    userAccessController.getUserPermissions
);

// PUT /:userId/permissions
router.put(
    '/:userId/permissions',
    // hasRole('admin'),
    // hasPermission('manage_user_permissions'),
    validateRequest(syncPermissionsSchema),
    userAccessController.syncUserPermissions
);

export default router;
