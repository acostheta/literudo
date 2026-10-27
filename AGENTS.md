<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next 15.5, App Router) has breaking changes — APIs, conventions, and file structure may all differ from your training data. This install does NOT ship guides at `node_modules/next/dist/docs/`; check the installed sources or official docs before writing code. Heed deprecation notices (`next lint` already warns it is removed in Next 16).
<!-- END:nextjs-agent-rules -->

## Verify before done

- `npx tsc --noEmit` → must pass (no npm script exists for it)
- `npm run lint` (`next lint`, deprecated) → exits 0 with warnings today; warnings are the baseline
- `npm run db:test` → pgTAP de RLS (`supabase test db`). Necesita el stack local (`npm run db:reset` antes, y Docker arrancado). Si el test muere con «server closed the connection», es la imagen `supabase/postgres:17.6.1.106`: hace segfault cuando un rol sin `EXECUTE` llama a una función. No llames funciones revocadas como `anon` en un test; usa `has_function_privilege`
- CI: `.github/workflows/ci.yml` corre tsc + lint + `supabase db start` + `supabase test db`. El otro workflow es `.github/workflows/supabase-keepalive.yml` (keepalive — don't break or "simplify" it)

## Run

- `npm run dev` — Turbopack; needs `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (used for password-recovery links). `SUPABASE_SERVICE_ROLE_KEY` is only for the user server actions (Vercel también la necesita)
- `npm run build` — what Vercel deploys (README)
- `npm run db:reset` / `npm run db:test` — stack local de Supabase (Docker Desktop + WSL2 con virtualización habilitada)

## Backend: Supabase only

- Auth/DB/Storage via `@supabase/ssr`; the three clients live in `src/lib/supabase/{client,server,middleware}.ts`
- Firebase leftovers exist (`firebase` dep, `firebase.json`, `firestore.rules`, `src/lib/firebase.ts`) but nothing imports them — don't add Firebase code
- `supabase/migrations/*.sql` es la fuente del esquema, incluida la línea base (`20260502000000_base_profiles_posts.sql`): `supabase db reset` reconstruye la DB desde cero. Las versiones están alineadas con `supabase_migrations.schema_migrations` del remoto; antes de un `db push` nuevo, `supabase migration list --linked`
- DDL puntual también puede ir por el Supabase MCP, pero una feature va en migración versionada (una aplicada no se edita)
- Reglas RLS: una política por operación, nunca `FOR ALL`, y las de administrador usan `public.is_admin()`. El correo de `profiles` está revocado para `anon`/`authenticated`: se lee por `mi_perfil()` (propio) o `admin_list_profiles()` (solo Administrador)
- `posts`/`gallery_posts` usan `author_id = auth.uid()` en alta y en `WITH CHECK`; el `author_id` no se puede reasignar
- Orden de despliegue: **código primero, migración de RLS después**. El código nuevo tolera el esquema viejo (fallbacks sin correo); al revés, el código viejo hace `select *` sobre `profiles` y se rompe cuando el correo queda revocado
- Keepalive is intentional two-layer defense (pg_cron heartbeat migration + weekly GH Actions restore) against Supabase Free auto-pause

## Auth gotchas

- `src/middleware.ts` matcher hits every path but only runs logic for `/admin`: session refresh, redirect to `/login` when signed out, and sign-out of users missing the `literudo_remember` cookie. Preserve both behaviors
- Capacidades en código con `src/lib/permissions.ts`: `getCurrentProfile`, `isAdmin`, `isAdminRole` (solo etiquetas), `canManageContent`, `ROLES`, `STATUS`, `POST_STATUS`. No comparar contra `"Administrador"` suelto
- La UI no es la seguridad: RLS es la autorización real; `/admin/users` además muestra un 403 en servidor (`app/admin/users/layout.tsx`)
- Escrituras sensibles por Server Actions: `app/admin/{users,posts,gallery}/actions.ts` (rol, estatus, alta/baja con la Admin API, publicar). Devuelven `{ ok, error }` y la UI usa `Alert`, no `alert()`
- Comments read via RPC `get_comments_with_profile` from `src/components/comments/CommentSection.tsx` (count is done client-side); la lectura exige que el post/galería sea visible (`can_read_target`)

## Conventions

- Spanish everywhere: UI strings, code comments, commit messages (`feat: ...`)
- MUI v9 + Emotion is app-wide: theme in `src/theme.ts`, wrapped by `src/components/Providers.tsx` in the root layout; heavier in the `/admin` backoffice. `next.config.ts` sets `experimental.optimizePackageImports` for MUI to keep dev compiles fast — keep it
- ESLint is flat config (`eslint.config.mjs`): `no-explicit-any` off, unused vars warn
- Branches: `main`, `master` (local `permissions` holds this plan)
