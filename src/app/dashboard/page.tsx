import { getCurrentUser } from "@/lib/dal";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Bienvenido, {user?.name ?? user?.email}
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Panel de administración de usuarios, roles y permisos.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Tus roles
          </h2>
          <p className="mt-2 text-gray-900 dark:text-gray-100">
            {user?.roles.length ? user.roles.join(", ") : "Sin roles asignados"}
          </p>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Tus permisos
          </h2>
          <p className="mt-2 text-gray-900 dark:text-gray-100">
            {user?.permissions.length
              ? user.permissions.join(", ")
              : "Sin permisos"}
          </p>
        </section>
      </div>
    </div>
  );
}
