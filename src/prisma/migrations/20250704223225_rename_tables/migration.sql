/*
  Warnings:

  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_B_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToUser" DROP CONSTRAINT "_PermissionToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToUser" DROP CONSTRAINT "_RoleToUser_A_fkey";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RolePermission";

-- DropTable
DROP TABLE "UserPermission";

-- DropTable
DROP TABLE "UserRole";

-- CreateTable
CREATE TABLE "maps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guard_name" TEXT NOT NULL DEFAULT 'api',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guard_name" TEXT NOT NULL DEFAULT 'api',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "user_permission" (
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_permission_pkey" PRIMARY KEY ("userId","permissionId")
);

-- CreateTable
CREATE TABLE "user_role" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "maps_name_key" ON "maps"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "maps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "maps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
