"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requirePermission } from "@/lib/dal";
import { PERMISSIONS } from "@/lib/rbac";
import {
  CreateUserSchema,
  UpdateUserRolesSchema,
  CreateRoleSchema,
  UpdateRolePermissionsSchema,
  type ActionState,
} from "@/lib/definitions";

export async function createUser(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.USERS_WRITE);

  const validated = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    roleIds: formData.getAll("roleIds"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, password, roleIds } = validated.data;

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        roles: {
          create: roleIds.map((roleId) => ({ roleId })),
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { errors: { email: ["Ya existe un usuario con ese correo."] } };
    }
    throw error;
  }

  revalidatePath("/dashboard/users");
  return { success: true, message: "Usuario creado correctamente." };
}

export async function updateUserRoles(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.USERS_WRITE);

  const validated = UpdateUserRolesSchema.safeParse({
    userId: formData.get("userId"),
    roleIds: formData.getAll("roleIds"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { userId, roleIds } = validated.data;

  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId } }),
    prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
    }),
  ]);

  revalidatePath("/dashboard/users");
  return { success: true, message: "Roles actualizados." };
}

export async function toggleUserActive(formData: FormData): Promise<void> {
  await requirePermission(PERMISSIONS.USERS_WRITE);

  const userId = String(formData.get("userId"));
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/dashboard/users");
}

export async function createRole(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.ROLES_WRITE);

  const validated = CreateRoleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    permissionIds: formData.getAll("permissionIds"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, description, permissionIds } = validated.data;

  try {
    await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { errors: { name: ["Ya existe un rol con ese nombre."] } };
    }
    throw error;
  }

  revalidatePath("/dashboard/roles");
  return { success: true, message: "Rol creado correctamente." };
}

export async function updateRolePermissions(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.ROLES_WRITE);

  const validated = UpdateRolePermissionsSchema.safeParse({
    roleId: formData.get("roleId"),
    permissionIds: formData.getAll("permissionIds"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { roleId, permissionIds } = validated.data;

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
    }),
  ]);

  revalidatePath("/dashboard/roles");
  return { success: true, message: "Permisos actualizados." };
}
