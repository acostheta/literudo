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
