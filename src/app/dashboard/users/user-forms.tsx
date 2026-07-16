"use client";

import { useActionState, useEffect, useRef } from "react";

import { createUser, updateUserRoles } from "@/app/actions/admin";

type Role = { id: string; name: string };

export function CreateUserForm({ roles }: { roles: Role[] }) {
  const [state, action, pending] = useActionState(createUser, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
    >
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Crear usuario
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Nombre
          </label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
          {state?.errors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Correo
          </label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Contraseña
          </label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
          {state?.errors?.password && (
            <p className="mt-1 text-xs text-red-600">
              {state.errors.password[0]}
            </p>
          )}
        </div>
      </div>

      {roles.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Roles
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {roles.map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <input type="checkbox" name="roleIds" value={role.id} />
                {role.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-60 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {pending ? "Creando…" : "Crear usuario"}
        </button>
        {state?.success && (
          <span className="text-sm text-green-600">{state.message}</span>
        )}
        {state?.message && !state.success && (
          <span className="text-sm text-red-600">{state.message}</span>
        )}
      </div>
    </form>
  );
}

export function UserRolesEditor({
  userId,
  roles,
  assignedRoleIds,
}: {
  userId: string;
  roles: Role[];
  assignedRoleIds: string[];
}) {
  const [state, action, pending] = useActionState(updateUserRoles, undefined);

  if (roles.length === 0) {
    return <span className="text-gray-400">No hay roles</span>;
  }

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <label
            key={role.id}
            className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300"
          >
            <input
              type="checkbox"
              name="roleIds"
              value={role.id}
              defaultChecked={assignedRoleIds.includes(role.id)}
            />
            {role.name}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {pending ? "Guardando…" : "Guardar roles"}
        </button>
        {state?.success && (
          <span className="text-xs text-green-600">{state.message}</span>
        )}
      </div>
    </form>
  );
}
