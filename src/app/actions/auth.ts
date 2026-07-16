"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import { LoginFormSchema, type ActionState } from "@/lib/definitions";

export async function login(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Constant-ish path: always run a hash comparison to reduce user enumeration.
  const passwordOk = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidin");

  if (!user || !passwordOk) {
    return { message: "Correo o contraseña incorrectos." };
  }

  if (!user.isActive) {
    return { message: "Tu cuenta está desactivada. Contacta al administrador." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
