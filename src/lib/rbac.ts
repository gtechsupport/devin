export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  ROLES_READ: "roles:read",
  ROLES_WRITE: "roles:write",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: { key: PermissionKey; description: string }[] = [
  { key: PERMISSIONS.USERS_READ, description: "Ver usuarios" },
  { key: PERMISSIONS.USERS_WRITE, description: "Crear y editar usuarios" },
  { key: PERMISSIONS.ROLES_READ, description: "Ver roles y permisos" },
  { key: PERMISSIONS.ROLES_WRITE, description: "Crear y editar roles y permisos" },
];
