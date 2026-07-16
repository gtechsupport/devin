import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: "users:read", description: "Ver usuarios" },
  { key: "users:write", description: "Crear y editar usuarios" },
  { key: "roles:read", description: "Ver roles y permisos" },
  { key: "roles:write", description: "Crear y editar roles y permisos" },
];

async function main() {
  // 1. Permissions
  await Promise.all(
    PERMISSIONS.map((p) =>
      prisma.permission.upsert({
        where: { key: p.key },
        update: { description: p.description },
        create: p,
      }),
    ),
  );

  const allPermissions = await prisma.permission.findMany();
  const readPermissions = allPermissions.filter((p) =>
    p.key.endsWith(":read"),
  );

  // 2. Admin role (all permissions)
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: { description: "Acceso total" },
    create: { name: "admin", description: "Acceso total" },
  });

  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
  await prisma.rolePermission.createMany({
    data: allPermissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
  });

  // 3. Viewer role (read-only)
  const viewerRole = await prisma.role.upsert({
    where: { name: "viewer" },
    update: { description: "Solo lectura" },
    create: { name: "viewer", description: "Solo lectura" },
  });

  await prisma.rolePermission.deleteMany({ where: { roleId: viewerRole.id } });
  await prisma.rolePermission.createMany({
    data: readPermissions.map((p) => ({
      roleId: viewerRole.id,
      permissionId: p.id,
    })),
  });

  // 4. Admin user
  const email = "admin@example.com";
  const passwordHash = await bcrypt.hash("Admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Administrador",
      passwordHash,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log("Seed completo.");
  console.log("  Admin:  admin@example.com / Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
