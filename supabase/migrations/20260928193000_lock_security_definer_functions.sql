-- Cerrar funciones SECURITY DEFINER de public que el linter marca como
-- ejecutables por anon y authenticated via /rest/v1/rpc/.
--
-- La app NO las invoca: handle_new_user() es un trigger sobre auth.users y
-- rls_auto_enable() es un event trigger, y ninguno de los dos pasa por el
-- chequeo de privilegios EXECUTE al dispararse. Revocar solo afecta a la
-- invocacion directa por RPC desde el navegador.
--
-- No se toca get_comments_with_profile() ni get_comment_count(): la aplicacion
-- las llama legitimamente por RPC desde src/components/comments/CommentSection.tsx.

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM authenticated;

-- handle_new_user() no fijaba search_path, lo que dispara el linter
-- function_search_path_mutable: sin esto, un attacker con CREATE en un
-- schema anterior al search_path podia secuestrar public.profiles.
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
