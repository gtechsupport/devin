import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";
import { PERMISSIONS } from "@/lib/rbac";
import { toggleUserActive } from "@/app/actions/admin";
import { CreateUserForm, UserRolesEditor } from "./user-forms";

export default async function UsersPage() {
  const currentUser = await requirePermission(PERMISSIONS.USERS_READ);
  const canWrite = currentUser.permissions.includes(PERMISSIONS.USERS_WRITE);

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      include: { roles: { include: { role: true } } },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestiona las cuentas y sus roles.
        </p>
      </div>

      {canWrite && <CreateUserForm roles={roles} />}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              {canWrite && <th className="px-4 py-3 font-medium">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((u) => (
              <tr key={u.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {u.name ?? "—"}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  {canWrite ? (
                    <UserRolesEditor
                      userId={u.id}
                      roles={roles}
                      assignedRoleIds={u.roles.map((r) => r.roleId)}
                    />
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">
                      {u.roles.map((r) => r.role.name).join(", ") || "—"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.isActive
                        ? "inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }
                  >
                    {u.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                {canWrite && (
                  <td className="px-4 py-3">
                    <form action={toggleUserActive}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        {u.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
