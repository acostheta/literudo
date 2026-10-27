-- Tests de autorizacion (RLS) de Literudo.
--
-- Se ejecutan en una transaccion que termina en ROLLBACK: crean usuarios y
-- contenido de prueba y no dejan rastro.
--
--   npx supabase test db          (contra la DB local)
--
-- Todo lo que un cliente puede pedir, lo puede pedir sin la UI: por eso se
-- prueba con `set role` + request.jwt.claims y se afirman conteos de filas.
-- Un UPDATE/DELETE bloqueado por RLS no falla: afecta 0 filas.

begin;

create extension if not exists pgtap;

select plan(26);

-- ---------------------------------------------------------------------------
-- Fixtures (como postgres, sin RLS)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000001', 'admin@test.local'),
  ('00000000-0000-4000-8000-000000000002', 'autor1@test.local'),
  ('00000000-0000-4000-8000-000000000003', 'autor2@test.local');

update public.profiles set role = 'Administrador'
where id = '00000000-0000-4000-8000-000000000001';

insert into public.posts (id, title, slug, content, author_id, status) values
  ('10000000-0000-4000-8000-000000000001', 'Publicado', 'publicado', '{}',
   '00000000-0000-4000-8000-000000000002', 'publicado'),
  ('10000000-0000-4000-8000-000000000002', 'Borrador de autor1', 'borrador-autor1', '{}',
   '00000000-0000-4000-8000-000000000002', 'borrador'),
  ('10000000-0000-4000-8000-000000000003', 'Borrador de autor2', 'borrador-autor2', '{}',
   '00000000-0000-4000-8000-000000000003', 'borrador'),
  ('10000000-0000-4000-8000-000000000004', 'Desechable', 'desechable', '{}',
   '00000000-0000-4000-8000-000000000002', 'borrador');

insert into public.gallery_posts (id, slug, title, author_id, status) values
  ('20000000-0000-4000-8000-000000000001', 'galeria-autor1', 'Galeria de autor1',
   '00000000-0000-4000-8000-000000000002', 'borrador');

insert into public.gallery_images (id, gallery_post_id, image_url) values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'a.jpg');

insert into public.gallery_embeds (id, gallery_post_id, platform, url, embed_url) values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
   'youtube', 'https://youtu.be/x', 'https://www.youtube.com/embed/x');

insert into public.comments (id, target_id, target_type, user_id, content) values
  ('50000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000001', 'post',
   '00000000-0000-4000-8000-000000000003', 'comentario en publicado'),
  ('50000000-0000-4000-8000-000000000002',
   '10000000-0000-4000-8000-000000000002', 'post',
   '00000000-0000-4000-8000-000000000003', 'comentario en borrador ajeno');

-- Cambia de rol y fija las claims de la sesion, como hace PostgREST.
create function pg_temp.como(p_uid uuid) returns void language plpgsql as $$
begin
  execute 'reset role';
  if p_uid is null then
    perform set_config('role', 'anon', true);
    perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  else
    perform set_config('role', 'authenticated', true);
    perform set_config('request.jwt.claims',
      json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Anonimo: solo lo publicado
-- ---------------------------------------------------------------------------
select pg_temp.como(null);

select is((select count(*) from public.posts), 1::bigint,
  'anonimo solo ve articulos publicados');

select is((select count(*) from public.comments), 1::bigint,
  'anonimo no ve comentarios de borradores');

select throws_ok(
  $$ select email from public.profiles limit 1 $$,
  '42501', null,
  'anonimo no puede leer el correo de los perfiles');

select cmp_ok((select count(*) from public.profiles), '>', 0::bigint,
  'anonimo si puede leer el nombre publico');

-- ---------------------------------------------------------------------------
-- Usuario: gestiona lo suyo, nada ajeno
-- ---------------------------------------------------------------------------
select pg_temp.como('00000000-0000-4000-8000-000000000002');

select is((select count(*) from public.posts), 3::bigint,
  'autor1 ve sus tres articulos');

select is((select count(*) from public.posts
           where id = '10000000-0000-4000-8000-000000000003'), 0::bigint,
  'autor1 no ve el borrador de autor2');

update public.profiles set name = 'hackeado'
where id = '00000000-0000-4000-8000-000000000003';

select is((select count(*) from public.profiles
           where id = '00000000-0000-4000-8000-000000000003'
             and name = 'hackeado'), 0::bigint,
  'un Usuario no edita el perfil de otro');

update public.profiles set name = 'Autor Uno'
where id = '00000000-0000-4000-8000-000000000002';

select is((select count(*) from public.profiles
           where id = '00000000-0000-4000-8000-000000000002'
             and name = 'Autor Uno'), 1::bigint,
  'un Usuario edita su propio perfil');

select throws_ok(
  $$ update public.profiles set role = 'Administrador'
     where id = auth.uid() $$,
  'P0001', null,
  'un Usuario no puede escalar su rol');

select pg_temp.como('00000000-0000-4000-8000-000000000002');

select is((select count(*) from public.profiles
           where id = '00000000-0000-4000-8000-000000000002'
             and role = 'Administrador'), 0::bigint,
  'el rol sigue siendo Usuario despues del intento');

select throws_ok(
  $$ insert into public.posts (title, slug, content, author_id)
     values ('Robado', 'robado', '{}', '00000000-0000-4000-8000-000000000003') $$,
  '42501', null,
  'no se puede insertar un articulo con author_id ajeno');

select throws_ok(
  $$ update public.posts
     set author_id = '00000000-0000-4000-8000-000000000003'
     where id = '10000000-0000-4000-8000-000000000002' $$,
  '42501', null,
  'el autor no puede regalar su articulo a otro');

delete from public.posts where id = '10000000-0000-4000-8000-000000000003';

reset role;

select is((select count(*) from public.posts
           where id = '10000000-0000-4000-8000-000000000003'), 1::bigint,
  'un Usuario no borra el articulo de otro');

select pg_temp.como('00000000-0000-4000-8000-000000000002');

delete from public.posts where id = '10000000-0000-4000-8000-000000000004';

reset role;

select is((select count(*) from public.posts
           where id = '10000000-0000-4000-8000-000000000004'), 0::bigint,
  'un Usuario borra su propio articulo');

-- ---------------------------------------------------------------------------
-- Galeria: solo sobre galerias propias
-- ---------------------------------------------------------------------------
select pg_temp.como('00000000-0000-4000-8000-000000000003');

select throws_ok(
  $$ insert into public.gallery_images (gallery_post_id, image_url)
     values ('20000000-0000-4000-8000-000000000001', 'b.jpg') $$,
  '42501', null,
  'no se pueden agregar imagenes a una galeria ajena');

select pg_temp.como('00000000-0000-4000-8000-000000000002');

update public.gallery_embeds set caption = 'nuevo'
where id = '40000000-0000-4000-8000-000000000001';

select is((select count(*) from public.gallery_embeds
           where id = '40000000-0000-4000-8000-000000000001'
             and caption = 'nuevo'), 1::bigint,
  'el autor actualiza el embed de su propia galeria');

select pg_temp.como('00000000-0000-4000-8000-000000000003');

update public.gallery_images set caption = 'hackeado'
where id = '30000000-0000-4000-8000-000000000001';

select pg_temp.como('00000000-0000-4000-8000-000000000003');

select is((select count(*) from public.gallery_images
           where id = '30000000-0000-4000-8000-000000000001'
             and caption = 'hackeado'), 0::bigint,
  'un Usuario no edita imagenes de una galeria ajena');

-- ---------------------------------------------------------------------------
-- Comentarios: no se comenta ni se ve lo que no se puede leer
-- ---------------------------------------------------------------------------
select pg_temp.como('00000000-0000-4000-8000-000000000003');

select throws_ok(
  $$ insert into public.comments (target_id, target_type, user_id, content)
     values ('10000000-0000-4000-8000-000000000002', 'post', auth.uid(), 'colado') $$,
  '42501', null,
  'no se comenta en un borrador ajeno');

select throws_ok(
  $$ update public.comments
     set user_id = '00000000-0000-4000-8000-000000000002'
     where id = '50000000-0000-4000-8000-000000000001' $$,
  '42501', null,
  'no se puede falsificar el autor de un comentario');

select pg_temp.como('00000000-0000-4000-8000-000000000002');

delete from public.comments
where id = '50000000-0000-4000-8000-000000000001';

reset role;

select is((select count(*) from public.comments
           where id = '50000000-0000-4000-8000-000000000001'), 1::bigint,
  'un Usuario no borra el comentario de otro');

-- ---------------------------------------------------------------------------
-- Administrador: acceso total, auditado
-- ---------------------------------------------------------------------------
select pg_temp.como('00000000-0000-4000-8000-000000000001');

select is((select count(*) from public.posts
           where id = '10000000-0000-4000-8000-000000000003'), 1::bigint,
  'el Administrador ve el borrador ajeno');

update public.profiles set status = 'inactivo'
where id = '00000000-0000-4000-8000-000000000003';

select pg_temp.como('00000000-0000-4000-8000-000000000001');

select is((select count(*) from public.profiles
           where id = '00000000-0000-4000-8000-000000000003'
             and status = 'inactivo'), 1::bigint,
  'el Administrador cambia el estatus de otro usuario');

select is((select count(*) from public.profiles_audit
           where profile_id = '00000000-0000-4000-8000-000000000003'
             and field = 'status' and new_value = 'inactivo'), 1::bigint,
  'el cambio de estatus queda auditado');

select pg_temp.como('00000000-0000-4000-8000-000000000002');

select throws_ok(
  $$ select * from public.admin_list_profiles() $$,
  '42501', null,
  'un Usuario no puede listar los perfiles con correo');

select is((select email from public.mi_perfil()), 'autor1@test.local'::text,
  'cada usuario lee su propio correo');

select pg_temp.como(null);

select throws_ok(
  $$ select * from public.admin_list_profiles() $$,
  '42501', null,
  'un anonimo no puede listar los perfiles con correo');

select * from finish();

rollback;
