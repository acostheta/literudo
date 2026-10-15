<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next 15.5, App Router) has breaking changes — APIs, conventions, and file structure may all differ from your training data. This install does NOT ship guides at `node_modules/next/dist/docs/`; check the installed sources or official docs before writing code. Heed deprecation notices (`next lint` already warns it is removed in Next 16).
<!-- END:nextjs-agent-rules -->

## Verify before done

- `npx tsc --noEmit` → must pass (no npm script exists for it)
- `npm run lint` (`next lint`, deprecated) → exits 0 with warnings today; warnings are the baseline
- No test suite exists — don't invent one
- No CI runs lint/build; the only workflow is `.github/workflows/supabase-keepalive.yml` (keepalive — don't break or "simplify" it)

## Run

- `npm run dev` — Turbopack; needs `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (used for password-recovery links)
- `npm run build` — what Vercel deploys (README)

## Backend: Supabase only

- Auth/DB/Storage via `@supabase/ssr`; the three clients live in `src/lib/supabase/{client,server,middleware}.ts`
- Firebase leftovers exist (`firebase` dep, `firebase.json`, `firestore.rules`, `src/lib/firebase.ts`) but nothing imports them — don't add Firebase code
- `supabase/migrations/*.sql` covers only later features (gallery, comments, keepalive, lockdown) and is applied to the linked remote project (`supabase/.temp/linked-project.json`). No local stack (no `supabase/config.toml`); DDL also via the Supabase MCP from `opencode.json`
- The base tables (`profiles`, `posts`, `handle_new_user` trigger) were created outside the repo and exist only in the live DB — inspect before assuming. (`avatars` is a Storage bucket, not a table)
- Root `schema.sql` is stale: defines `authors` (unused by the app) and lacks `profiles`, `gallery_*`. Trust the live DB / migrations, not that file
- Keepalive is intentional two-layer defense (pg_cron heartbeat migration + weekly GH Actions restore) against Supabase Free auto-pause

## Auth gotchas

- `src/middleware.ts` matcher hits every path but only runs logic for `/admin`: session refresh, redirect to `/login` when signed out, and sign-out of users missing the `literudo_remember` cookie. Preserve both behaviors
- Role checks are client-side and partial — individual pages compare `profiles.role === "Administrador"` (Spanish string); RLS policies in `supabase/migrations` are the real enforcement, so new admin data needs RLS, not just a UI gate
- Comments read via RPC `get_comments_with_profile` from `src/components/comments/CommentSection.tsx` (count is done client-side); the lockdown migration deliberately leaves the comment RPCs callable

## Conventions

- Spanish everywhere: UI strings, code comments, commit messages (`feat: ...`)
- MUI v9 + Emotion is app-wide: theme in `src/theme.ts`, wrapped by `src/components/Providers.tsx` in the root layout; heavier in the `/admin` backoffice. `next.config.ts` sets `experimental.optimizePackageImports` for MUI to keep dev compiles fast — keep it
- `src/app/(dashboard)/` (`/mis-escritos`, `/nuevo-envio`) is mock content from `src/lib/mock-store.ts`, not wired to Supabase
- ESLint is flat config (`eslint.config.mjs`): `no-explicit-any` off, unused vars warn
- Branches: `main`, `master`, `nueva-ui` (currently checked out)
