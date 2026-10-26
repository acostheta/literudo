-- Endurece las funciones de engagement con un search_path fijo.
-- Sin esto, PostgREST puede ser engañado con objetos temporales o del schema erróneo.
alter function public.get_comment_count(uuid, text) set search_path = public;
alter function public.get_reaction_count(uuid, text) set search_path = public;
alter function public.get_counts(uuid[], text) set search_path = public;
alter function public.get_comments_with_profile(uuid, integer, integer, text) set search_path = public;
