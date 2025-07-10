import { db } from "@/lib/prisma";

async function main() {
    // Create roles
    const adminRole = await db.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
            name: 'admin',
            guard_name: 'api',
        },
    });

    const userRole = await db.role.upsert({
        where: { name: 'user' },
        update: {},
        create: {
            name: 'user',
            guard_name: 'api',
        },
    });

    // Create permissions
    const permissions = [
        'read_permissions',
        'create_permissions',
        'delete_permissions',
        'update_permissions',
        'read_roles',
        'create_roles',
        'delete_roles',
        'update_roles',
        'create_users',
        'read_users',
        'update_users',
        'delete_users',
        'create_posts',
        'read_posts',
        'update_posts',
        'delete_posts',
    ];

    for (const name of permissions) {
        await db.permission.upsert({
            where: { name },
            update: {},
            create: {
                name,
                guard_name: 'api',
            },
        });
    }

    // Assign permissions to admin role
    const allPermissions = await db.permission.findMany();
    for (const permission of allPermissions) {
        await db.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: permission.id,
            },
        });
    }

    // Assign basic permissions to user role
    const userPermissions = await db.permission.findMany({
        where: {
            name: {
                in: ['read_users', 'read_posts', 'create_posts', 'update_posts'],
            },
        },
    });

    for (const permission of userPermissions) {
        await db.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: userRole.id,
                    permissionId: permission.id,
                },
            },
            update: {},
            create: {
                roleId: userRole.id,
                permissionId: permission.id,
            },
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });



/**!RUN this command to execute query
 * npx ts-node prisma/seed/index.ts
 */




