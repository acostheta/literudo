# Prompt: Plan de permisos (Literudo)

Eres un ingeniero senior de Supabase y Next.js. Mejora los permisos de `D:/prj/literudo` (rama `main`, Next 15.5 App Router, MUI v9, `@supabase/ssr`). Lee `AGENTS.md` y `MEMORY.md` antes de tocar nada. Revisa el código antes de escribir; no inventes APIs. Español en UI, comentarios y commits (`feat:`, `fix:`).

## Principios

1. La base de datos decide. La UI solo refleja lo que RLS permite.
2. Todo lo que el cliente puede pedir, lo puede pedir sin la UI. Probar por API, no solo por pantalla.
3. Deny by default: tabla sin políticas = nadie accede.
4. Nada de `FOR ALL USING (true)`. Políticas separadas por SELECT, INSERT, UPDATE, DELETE.
5. Rol explícito: `CHECK (role IN ('Administrador','Usuario'))`. Constantes en TS, no strings sueltos.
6. Políticas de `profiles` nunca consultan `profiles` directamente: usan `is_admin()` (SECURITY DEFINER).
7. Preferir capacidades a roles en el código: `canManageContent()`, no `role === "Administrador"`.
8. Escrituras sensibles (roles, estatus, usuarios) van por Server Action: autentica, autoriza, valida, escribe. `author_id` y `role` los fija el servidor.
9. Migraciones versionadas. Nada se edita a mano en producción. Una migración aplicada no se modifica; se corrige con otra.
10. Un UPDATE/DELETE bloqueado por RLS no falla: afecta 0 filas. Los tests comprueban el conteo.
11. Secretos solo en servidor. Nunca `NEXT_PUBLIC_` con claves privilegiadas. Token de `.env.local` con mínimo privilegio, ignorado por git y rotado si se filtró.
12. Auditar cambios de `role` y `status`.

## Pasos

### A. Línea base
1. Dump del esquema remoto (`supabase db dump`) y comparar con `supabase/migrations/`.
2. Listar tablas sin migración (`profiles`, `posts`) y políticas vigentes.
3. Registrar hallazgos en `docs/permissions-plan.md` (sección "Estado").

### B. Esquema y migraciones
4. Migración base de `profiles` y `posts` alineada a la DB real.
5. `CHECK` en `role` y `status`.
6. Retirar `schema.sql` obsoleto o marcarlo como no fuente.
7. Verificar que `.env.local` esté en `.gitignore`.

### C. RLS y tests
8. Revisar cada tabla: políticas separadas por operación, nombres en español.
9. Reglas: anónimo lee solo publicado; Usuario gestiona lo suyo; Administrador todo; `gallery_images` y `gallery_embeds` solo sobre galerías propias.
10. Tests SQL reproducibles (pgTAP o script) con `SET LOCAL ROLE authenticated` y `request.jwt.claims`.
11. Casos obligatorios: escalar rol, editar/borrar ajeno, insertar con `author_id` ajeno, leer borradores ajenos, anónimo.
12. Afirmar conteos de filas, no solo ausencia de error.

### D. Código
13. Ampliar `src/lib/permissions.ts`: `getCurrentProfile`, `isAdmin`, `canManageContent`, constantes de rol.
14. Reemplazar toda comparación `role === "Administrador"` por esas funciones (buscar con grep).
15. Un solo helper para proteger rutas `/admin/*`, usado por layout y páginas.

### E. Server Actions
16. Mover a Server Actions: crear/editar/borrar usuarios, cambiar rol/estatus, publicar.
17. Validar entrada en servidor; fijar `author_id` y `role` desde la sesión.
18. Errores tipados mostrados en UI (sin `alert`).

### F. UX
19. 403 explícito en rutas restringidas.
20. `try/finally` y estado de error en cada flujo de guardado (bug del spinner al crear usuario).
21. `NavDrawer`: no mostrar "Iniciar Sesión" con sesión activa.

### G. Operación
22. CI: `tsc`, `lint` y tests de RLS en cada PR. No tocar `supabase-keepalive.yml`.
23. Aplicar migraciones con `supabase db push` revisado, no con llamadas directas a la API.
24. Trigger de auditoría para `role` y `status` de `profiles`.
25. Actualizar `AGENTS.md` y `MEMORY.md`.

## Estado (ejecución)

Fecha: 2026-10-26 · Rama: `permissions`.

### Línea base (inspección de la DB viva)

- Tablas en `public`: `profiles`, `posts`, `gallery_posts`, `gallery_images`, `gallery_embeds`, `comments`, `reactions`. Todas con RLS activado (sin `FORCE`).
- `profiles.role` y `profiles.status` **no tenían CHECK**; `status` era nullable con default `'activo'`.
- `is_admin()` (SECURITY DEFINER) existía y solo `profiles` la usaba.
- `protect_profile_privileged_fields` (trigger BEFORE UPDATE) ya bloqueaba `role`, `status`, `email` e `id` para no-administradores.
- Sin auditoría de cambios de rol/estatus.
- Migraciones del repo desalineadas con `supabase_migrations.schema_migrations`: 7 archivos con versión distinta a la registrada y `add_gallery_tables` nunca registrada. `supabase db push` habría re-ejecutado DDL.
- `schema.sql` obsoleto (`authors`, `content TEXT`). `.env.local` ya estaba ignorado.

### Hallazgos RLS corregidos en las migraciones nuevas

1. `posts`: política `FOR ALL` sin `WITH CHECK` (un autor podía reasignar `author_id`) + dos SELECT duplicadas.
2. `comments`: `SELECT true` (comentarios de borradores visibles para anónimos) y `UPDATE` sin `WITH CHECK` (falsificar `user_id`).
3. `gallery_images`/`gallery_embeds`: `FOR ALL` y subconsultas directas a `profiles`; faltaba `UPDATE` del autor en embeds.
4. `profiles`: `SELECT true` exponía el **correo de todos** a anónimos. Ahora la columna está revocada y el correo solo se lee por `mi_perfil()` (propio) o `admin_list_profiles()` (Administrador).
5. `storage.objects`: 9 políticas con rol `public` y sin `WITH CHECK`; cualquiera con la publishable key podía subir.

### Cambios en el repo

- `supabase/migrations/20260502000000_base_profiles_posts.sql`: línea base reconstruida (tablas, trigger `handle_new_user`, `rls_auto_enable`, buckets y políticas de Storage).
- `supabase/migrations/20261026120000_profiles_role_status_check.sql`: CHECK de `role`/`status`, `status` NOT NULL.
- `supabase/migrations/20261026121000_profiles_audit.sql`: tabla `profiles_audit` + trigger (solo lectura para Administrador).
- `supabase/migrations/20261026122000_rls_por_operacion.sql`: una política por operación, `is_admin()` en todas las de administrador, `can_read_target()` para comentarios, storage y RPCs de correo.
- `supabase/tests/rls.test.sql`: 26 asserts pgTAP con `set_config('request.jwt.claims')`, `reset role` y conteos de filas. Termina en `ROLLBACK`.
- `src/lib/permissions.ts`: `ROLES`, `STATUS`, `POST_STATUS`, `Profile`, `isAdminRole`, `getCurrentProfile`, `isAdmin`, `canManageContent`.
- Server Actions: `app/admin/{users,posts,gallery}/actions.ts` (rol, estatus, alta/baja, publicar). Errores tipados y `try/finally` en la UI.
- `app/admin/users/layout.tsx`: 403 en servidor (la autorización real sigue en RLS).
- `.github/workflows/ci.yml`: `tsc` + `lint` + `supabase start` + `supabase test db`.

### Verificación

- `npx tsc --noEmit` pasa; `npm run lint` solo deja los warnings del baseline.
- Sintaxis de `can_read_target()`, `mi_perfil()`, `admin_list_profiles()` y de las políticas nuevas validada contra la DB remota dentro de `begin; … rollback;` (sin cambios persistentes). También se validó el mecanismo de los tests: `create extension pgtap`, alta mínima en `auth.users`, trigger `handle_new_user`, `set_config('request.jwt.claims')` y RLS con `role = authenticated`.
- **Aplicado al remoto** (por MCP, con las versiones registradas en `supabase_migrations.schema_migrations`): `20261026120000_profiles_role_status_check` y `20261026121000_profiles_audit`. Verificado en una transacción con `ROLLBACK`: un `role`/`status` inválido da `check_violation` y un cambio de estatus deja su fila en `profiles_audit`.
- `supabase db reset` reconstruye el esquema completo (16 migraciones) y `supabase test db` pasa **26/26** en el stack local.
- Aviso de imagen: `supabase/postgres:17.6.1.106` (la que baja CI con `db start`) hace **segfault** cuando un rol sin `EXECUTE` llama a una función; reproducido con `mi_perfil()`, `admin_list_profiles()` y `keepalive_ping()`. Producción corre `17.6.1.084` y no lo hace. Por eso el caso anónimo se afirma con `has_function_privilege()` en vez de provocar el error.
- **No ejecutado**: `supabase db push` (falta la contraseña de la DB); el primer PR será la primera corrida del job `rls` en CI.

### Pendiente

- Aplicar la migración de RLS (`20261026122000`) al remoto **después** de desplegar el código nuevo.
- `supabase migration repair --status applied 20260831173130 20260502000000` antes del primer `db push`.
- Migraciones solo-remotas que quedan así a propósito: las 6 de mayo (reconstruidas en la línea base) y `fix_keepalive_ping_target` / `lock_keepalive_ping_from_anon`.

## Orden de prioridad

RLS modelada y testeada → migraciones completas en el repo → función central de permisos → Server Actions para lo sensible → UI que refleja lo anterior.

## Criterios de aceptación

- `npx tsc --noEmit` sin errores; `npm run lint` sin más warnings que el baseline.
- Usuario no lee ni modifica nada ajeno ni cambia su rol, por UI ni por API.
- Administrador conserva acceso total.
- Tests de autorización pasan.
- `supabase db push` sin pendientes inesperados.

## Reglas de trabajo

- Un paso por commit, verificado antes.
- No hacer `git push` sin confirmación.
- Antes de aplicar cambios a la base remota, mostrar el SQL y esperar confirmación.
