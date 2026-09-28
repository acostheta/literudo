-- Heartbeat para que Supabase no pause el proyecto del plan Free.
-- Supabase pausa proyectos con baja actividad en una ventana de 7 dias.
--
-- Esta capa corre DENTRO del proyecto, asi que no se apaga cuando GitHub
-- deshabilita los workflows programados por inactividad del repositorio.
-- Solo previene: si el proyecto ya esta pausado la base esta apagada y este
-- job tampoco corre. La recuperacion sigue a cargo de
-- .github/workflows/supabase-keepalive.yml, que vive fuera del proyecto.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
-- El linter "extension_in_public" marca pg_net porque cae en el schema public.
-- No se puede evitar: pg_net no soporta SET SCHEMA ni CREATE ... WITH SCHEMA
-- sin dropear la extension. Es un WARN conocido en proyectos Supabase.

-- La clave publica se lee de Supabase Vault porque el cuerpo de un job de
-- cron es legible por cualquiera con acceso a cron.job.command.
--
-- Si aun no existe, el job avisa con un RAISE WARNING y no hace nada. Se
-- carga una sola vez, a mano, y no va en el repo:
--
--   SELECT vault.create_secret(
--     '<SUPABASE_ANON_KEY>',
--     'literudo_anon_key',
--     'Clave publica de Literudo, usada por el heartbeat de pg_cron'
--   );
CREATE OR REPLACE FUNCTION public.keepalive_ping()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, net, vault
AS $$
DECLARE
  v_anon_key text;
  v_request_id bigint;
BEGIN
  SELECT decrypted_secret INTO v_anon_key
  FROM vault.decrypted_secrets
  WHERE name = 'literudo_anon_key'
  LIMIT 1;

  IF v_anon_key IS NULL THEN
    RAISE WARNING 'keepalive_ping: falta el secret literudo_anon_key en vault';
    RETURN NULL;
  END IF;

  -- GET contra la propia API REST: atraviesa Kong y PostgREST hasta Postgres,
  -- asi que genera actividad visible en varias capas, no solo en la base.
  --
  -- El target es una tabla, no la raiz /rest/v1/: desde 2025 la raiz sirve el
  -- OpenAPI spec y responde 401 "Secret API key required" a claves publicas.
  -- Un select de una fila si devuelve 200 con la publishable key, y la
  -- politica de lectura publica de `posts` lo permite sin sesion.
  v_request_id := net.http_get(
    url := 'https://xvsvfwbifupfivnbhiil.supabase.co/rest/v1/posts?select=id&limit=1',
    headers := jsonb_build_object(
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key
    )
  );

  RETURN v_request_id;
END;
$$;

-- Hay que revocar de anon y authenticated ademas de PUBLIC: este proyecto
-- tiene GRANT EXPLICITOS a esos roles sobre las funciones de public, asi que
-- un REVOKE ... FROM PUBLIC solo no basta. Sin esto, cualquiera con la
-- publishable key podria disparar el ping desde el navegador via
-- /rest/v1/rpc/keepalive_ping.
REVOKE ALL ON FUNCTION public.keepalive_ping() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.keepalive_ping() FROM anon;
REVOKE ALL ON FUNCTION public.keepalive_ping() FROM authenticated;

-- Cada 12 horas (00:23 y 12:23 UTC). Dos peticiones GET al dia dejan el
-- contador de inactividad muy lejos del limite de 7 dias.
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'literudo-keepalive';
SELECT cron.schedule('literudo-keepalive', '23 */12 * * *', 'SELECT public.keepalive_ping()');
