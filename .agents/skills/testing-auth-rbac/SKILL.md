---
name: testing-auth-rbac
description: Test the login + RBAC flow end-to-end (Next.js 16 + MySQL). Use when verifying auth, user/role/permission management, or route protection.
---

# Testing: Auth + RBAC

App Next.js 16 (App Router) + MySQL (Prisma). Autenticación propia (jose JWT en cookie httpOnly + sesión en BD) y RBAC (permisos `users:read/write`, `roles:read/write`).

## Puesta en marcha local
1. MySQL no queda corriendo tras el boot del snapshot: `sudo service mysql start`.
2. `npm run db:push && npm run db:seed` (idempotente).
3. `npm run dev` (Turbopack, puerto 3000). Verifica: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login` → 200.
4. Ruta protegida sin sesión: `GET /dashboard` → 307 a `/login`.

## Credenciales seed
- Admin: `admin@example.com` / `Admin123!` (rol `admin`, los 4 permisos).
- Rol `viewer` = solo lectura (`users:read`, `roles:read`).

## Flujo de prueba (UI)
1. Login inválido → banner "Correo o contraseña incorrectos." (permanece en /login).
2. Login válido admin → `/dashboard` muestra rol y permisos.
3. `/dashboard/roles`: crear rol marcando permisos concretos; verificar que el rol nuevo lista SOLO esos permisos.
4. `/dashboard/users`: crear usuario con un rol; verificar fila nueva + Estado Activo.
5. RBAC: iniciar sesión como usuario `viewer` y confirmar que en `/dashboard/users` y `/dashboard/roles` NO aparecen los formularios de crear ni los checkboxes/acciones de escritura. Controlado por `canWrite` en `src/app/dashboard/{users,roles}/page.tsx`.

## Trampa importante al automatizar
- El formulario de login (y los de crear) **conservan los valores al fallar** (buen UX). Al reescribir con herramientas de teclado, el texto se **concatena** (p.ej. `admin@example.comadmin@example.com`) y produce falsos "incorrectos".
- Solución: antes de teclear, enfocar el campo y limpiarlo (`ctrl+a` → `Delete`/`BackSpace`), y `Escape` para cerrar el autocompletado del navegador.
- Para confirmar que el login funciona a nivel de datos: `bcrypt.compare("Admin123!", passwordHash)` debe dar `true`; el server log muestra `pwlen` de la contraseña recibida.

## Devin Secrets Needed
- Ninguno. Todo es local: MySQL de desarrollo (`appuser`/`apppassword`) y `SESSION_SECRET` generado en `.env` (no versionado).
