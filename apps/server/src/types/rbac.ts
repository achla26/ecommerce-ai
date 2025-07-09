export interface roleConfig {
    guard_name: string,
    name: string
}

export interface permissionConfig {
    permissions: string[],
}


export interface managePermissionInput {
    name: string;
    guard_name?: string;
    description?: string;
}


export interface SyncPermissionRolesInput {
    roleIds: string[];
}
