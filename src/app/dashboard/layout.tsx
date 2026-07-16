import Link from "next/link";

import { requireUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { PERMISSIONS } from "@/lib/rbac";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const nav = [
    { href: "/dashboard", label: "Inicio", show: true },
    {
      href: "/dashboard/users",
      label: "Usuarios",
      show: user.permissions.includes(PERMISSIONS.USERS_READ),
    },
    {
      href: "/dashboard/roles",
      label: "Roles y permisos",
      show: user.permissions.includes(PERMISSIONS.ROLES_READ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 px-2">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Auth App
          </p>
        </div>
        <nav className="flex-1 space-y-1">
          {nav
            .filter((item) => item.show)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {item.label}
              </Link>
            ))}
        </nav>
        <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
          <p className="px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
            {user.name ?? user.email}
          </p>
          <p className="px-3 text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
          <form action={logout} className="mt-3 px-3">
            <button
              type="submit"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
