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
import { permissionController } from '@/modules/rbac/controllers/permissions.controller';
import { hasPermission, hasRole } from '@/middlewares/authorization.middleware';

/**
 * Middlewares
 */
import { validateRequest } from '@/middlewares/validate-request.middleware';
import authenticate from '@/middlewares/authenticated.middleware';
/**
 * Schemas
 */
import {
    createPermissionSchema,
    updatePermissionSchema,
    syncPermissionRolesSchema
} from '@/schemas/rbac';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Permission CRUD endpoints
router.route('/')
    .get(
        // hasRole('admin'),
        // hasPermission('read_permissions'),
        permissionController.getAllPermissions
    )
    .post(
        // hasRole('admin'),
        // hasPermission('create_permissions'),
        validateRequest(createPermissionSchema),
        permissionController.createPermission
    );

router.route('/:permissionId')
    .get(
        // hasRole('admin'),
        // hasPermission('view_permissions'),
        permissionController.getPermissionById
    )
    .put(
        // hasRole('admin'),
        // hasPermission('update_permissions'),
        validateRequest(updatePermissionSchema),
        permissionController.updatePermission
    )
    .delete(
        // hasRole('admin'),
        // hasPermission('delete_permissions'),
        permissionController.deletePermission
    );


export default router;