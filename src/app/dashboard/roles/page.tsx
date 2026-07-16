import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";
import { PERMISSIONS } from "@/lib/rbac";
import { CreateRoleForm, RolePermissionsEditor } from "./role-forms";

export default async function RolesPage() {
  const currentUser = await requirePermission(PERMISSIONS.ROLES_READ);
  const canWrite = currentUser.permissions.includes(PERMISSIONS.ROLES_WRITE);

  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      orderBy: { name: "asc" },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    }),
    prisma.permission.findMany({ orderBy: { key: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          Roles y permisos
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Define roles y los permisos que otorgan.
        </p>
      </div>

      {canWrite && <CreateRoleForm permissions={permissions} />}

      <div className="space-y-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {role.name}
                </h3>
                {role.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {role._count.users} usuario(s)
              </span>
            </div>

            <div className="mt-4">
              {canWrite ? (
                <RolePermissionsEditor
                  roleId={role.id}
                  permissions={permissions}
                  assignedPermissionIds={role.permissions.map(
                    (p) => p.permissionId,
                  )}
                />
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {role.permissions.map((p) => p.permission.key).join(", ") ||
                    "Sin permisos"}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
