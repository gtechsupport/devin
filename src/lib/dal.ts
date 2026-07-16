import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { decrypt, getSessionCookie } from "@/lib/session";
import type { PermissionKey } from "@/lib/rbac";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  permissions: string[];
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await getSessionCookie();
  const payload = await decrypt(token);
  if (!payload?.sessionId || !payload.userId) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: { include: { permissions: { include: { permission: true } } } },
            },
          },
        },
      },
    },
  });

  if (!session || session.userId !== payload.userId) return null;
  if (session.expiresAt < new Date()) return null;
  if (!session.user.isActive) return null;

  const user = session.user;
  const roles = user.roles.map((ur) => ur.role.name);
  const permissions = Array.from(
    new Set(
      user.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => rp.permission.key),
      ),
    ),
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles,
    permissions,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(
  permission: PermissionKey,
): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.permissions.includes(permission)) {
    redirect("/dashboard?error=forbidden");
  }
  return user;
}

export function hasPermission(
  user: CurrentUser | null,
  permission: PermissionKey,
): boolean {
  return Boolean(user?.permissions.includes(permission));
}
