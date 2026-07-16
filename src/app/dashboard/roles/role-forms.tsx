"use client";

import { useActionState, useEffect, useRef } from "react";

import { createRole, updateRolePermissions } from "@/app/actions/admin";

type Permission = { id: string; key: string; description: string | null };

export function CreateRoleForm({ permissions }: { permissions: Permission[] }) {
  const [state, action, pending] = useActionState(createRole, undefined);
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
        Crear rol
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Nombre
          </label>
          <input
            name="name"
            required
            placeholder="editor"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
          {state?.errors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Descripción
          </label>
          <input
            name="description"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Permisos
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {permissions.map((perm) => (
            <label
              key={perm.id}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <input type="checkbox" name="permissionIds" value={perm.id} />
              <span>
                {perm.key}
                {perm.description && (
                  <span className="text-gray-400"> — {perm.description}</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-60 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {pending ? "Creando…" : "Crear rol"}
        </button>
        {state?.success && (
          <span className="text-sm text-green-600">{state.message}</span>
        )}
      </div>
    </form>
  );
}

export function RolePermissionsEditor({
  roleId,
  permissions,
  assignedPermissionIds,
}: {
  roleId: string;
  permissions: Permission[];
  assignedPermissionIds: string[];
}) {
  const [state, action, pending] = useActionState(
    updateRolePermissions,
    undefined,
  );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="roleId" value={roleId} />
      <div className="grid gap-2 sm:grid-cols-2">
        {permissions.map((perm) => (
          <label
            key={perm.id}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <input
              type="checkbox"
              name="permissionIds"
              value={perm.id}
              defaultChecked={assignedPermissionIds.includes(perm.id)}
            />
            <span>
              {perm.key}
              {perm.description && (
                <span className="text-gray-400"> — {perm.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {pending ? "Guardando…" : "Guardar permisos"}
        </button>
        {state?.success && (
          <span className="text-xs text-green-600">{state.message}</span>
        )}
      </div>
    </form>
  );
}
