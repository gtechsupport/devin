import * as z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ error: "Introduce un correo válido." }).trim(),
  password: z.string().min(1, { error: "La contraseña es obligatoria." }),
});

export const CreateUserSchema = z.object({
  name: z.string().min(2, { error: "El nombre debe tener al menos 2 caracteres." }).trim(),
  email: z.email({ error: "Introduce un correo válido." }).trim(),
  password: z
    .string()
    .min(8, { error: "Debe tener al menos 8 caracteres." })
    .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
    .regex(/[0-9]/, { error: "Debe contener al menos un número." }),
  roleIds: z.array(z.string()).default([]),
});

export const UpdateUserRolesSchema = z.object({
  userId: z.string().min(1),
  roleIds: z.array(z.string()).default([]),
});

export const CreateRoleSchema = z.object({
  name: z
    .string()
    .min(2, { error: "El nombre del rol debe tener al menos 2 caracteres." })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      error: "Solo letras, números, guiones y guiones bajos.",
    })
    .trim(),
  description: z.string().trim().optional(),
  permissionIds: z.array(z.string()).default([]),
});

export const UpdateRolePermissionsSchema = z.object({
  roleId: z.string().min(1),
  permissionIds: z.array(z.string()).default([]),
});

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

export type SessionPayload = {
  userId: string;
  sessionId: string;
  expiresAt: string;
};
