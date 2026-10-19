import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

let pendingUser: Promise<User | null> | null = null

// Varias vistas piden el usuario al montar. Sin deduplicar, cada una toma a la
// vez el Web Lock de auth (`lock:sb-...-auth-token`) y en dev (StrictMode)
// termina en "Lock ... was released because another request stole it".
// Devuelve null en vez de rechazar para que un fallo de auth no rompa la UI.
export function getCurrentUser(): Promise<User | null> {
  pendingUser ??= createClient()
    .auth.getUser()
    .then(({ data }) => data.user ?? null)
    .catch(() => null)
    .finally(() => {
      pendingUser = null
    })
  return pendingUser
}
