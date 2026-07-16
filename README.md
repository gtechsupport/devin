# Auth App

Aplicación Next.js (App Router) con autenticación, sesiones seguras y control de acceso basado en roles y permisos (RBAC), sobre Node.js + MySQL.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **MySQL** con **Prisma** (ORM y migraciones)
- **Sesiones**: JWT firmado con [`jose`](https://github.com/panva/jose) (HS256) en cookie `httpOnly`, respaldado por sesiones en base de datos (revocables)
- **Contraseñas**: hash con **bcryptjs** (12 rounds)
- **Validación**: **zod** en cada Server Action
- **Protección de rutas**: `proxy.ts` (reemplazo de `middleware` en Next.js 16) para chequeos optimistas + verificación segura en el Data Access Layer (`src/lib/dal.ts`)
- **UI**: Tailwind CSS v4

## Modelo de datos

`User` · `Role` · `Permission` con tablas de unión `UserRole` (usuario↔rol) y `RolePermission` (rol↔permiso), más `Session` para sesiones persistentes/revocables.

Permisos incluidos: `users:read`, `users:write`, `roles:read`, `roles:write`.

## Puesta en marcha

1. Requisitos: Node.js 20.9+, un servidor MySQL en ejecución.

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Copia `.env.example` a `.env` y ajusta los valores:

   ```bash
   cp .env.example .env
   # DATABASE_URL="mysql://usuario:password@localhost:3306/auth_app"
   # SESSION_SECRET=$(openssl rand -base64 32)
   ```

4. Crea el esquema y los datos iniciales:

   ```bash
   npm run db:push    # crea las tablas
   npm run db:seed    # crea permisos, roles (admin/viewer) y un admin
   ```

5. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre http://localhost:3000

## Credenciales de ejemplo (seed)

- **admin@example.com** / **Admin123!** — rol `admin` (todos los permisos)

## Funcionalidad

- Inicio de sesión seguro (`/login`) y cierre de sesión.
- Panel `/dashboard` protegido.
- **Usuarios** (`/dashboard/users`): crear usuarios, asignar roles, activar/desactivar.
- **Roles y permisos** (`/dashboard/roles`): crear roles y asignar permisos.
- La navegación y las acciones se muestran/permiten según los permisos del usuario.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Comprobación de tipos (tsc) |
| `npm run db:push` | Sincroniza el esquema Prisma con MySQL |
| `npm run db:seed` | Datos iniciales |
