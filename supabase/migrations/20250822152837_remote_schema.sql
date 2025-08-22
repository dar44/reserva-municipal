drop policy "insert_inscripciones" on "public"."inscripciones";

drop policy "select_inscripciones" on "public"."inscripciones";

drop policy "staff_write_recintos" on "public"."recintos";

drop policy "insert_reservas" on "public"."reservas";

drop policy "select_reservas" on "public"."reservas";

drop policy "update_reservas" on "public"."reservas";

drop policy "select_users_self_or_staff" on "public"."users";

drop policy "update_users_self_or_staff" on "public"."users";

alter table "public"."cursos" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Inserta fila mínima; ajusta los defaults que quieras
  insert into public.users (
    uid, email, name, surname, dni, phone, role, created_at, updated_at
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'surname',''),
    coalesce(new.raw_user_meta_data->>'dni',''),
    coalesce(new.raw_user_meta_data->>'phone',''),
    'citizen',
    now(), now()
  )
  on conflict (uid) do nothing;

  return new;
end;
$function$
;

grant select on table "public"."cursos" to "anon";

grant delete on table "public"."cursos" to "authenticated";

grant insert on table "public"."cursos" to "authenticated";

grant select on table "public"."cursos" to "authenticated";

grant update on table "public"."cursos" to "authenticated";

grant delete on table "public"."inscripciones" to "authenticated";

grant insert on table "public"."inscripciones" to "authenticated";

grant references on table "public"."inscripciones" to "authenticated";

grant select on table "public"."inscripciones" to "authenticated";

grant trigger on table "public"."inscripciones" to "authenticated";

grant truncate on table "public"."inscripciones" to "authenticated";

grant update on table "public"."inscripciones" to "authenticated";

grant delete on table "public"."inscripciones" to "service_role";

grant insert on table "public"."inscripciones" to "service_role";

grant references on table "public"."inscripciones" to "service_role";

grant select on table "public"."inscripciones" to "service_role";

grant trigger on table "public"."inscripciones" to "service_role";

grant truncate on table "public"."inscripciones" to "service_role";

grant update on table "public"."inscripciones" to "service_role";

grant select on table "public"."recintos" to "anon";

grant delete on table "public"."recintos" to "authenticated";

grant insert on table "public"."recintos" to "authenticated";

grant select on table "public"."recintos" to "authenticated";

grant update on table "public"."recintos" to "authenticated";

grant delete on table "public"."reservas" to "authenticated";

grant insert on table "public"."reservas" to "authenticated";

grant references on table "public"."reservas" to "authenticated";

grant select on table "public"."reservas" to "authenticated";

grant trigger on table "public"."reservas" to "authenticated";

grant truncate on table "public"."reservas" to "authenticated";

grant update on table "public"."reservas" to "authenticated";

grant delete on table "public"."reservas" to "service_role";

grant insert on table "public"."reservas" to "service_role";

grant references on table "public"."reservas" to "service_role";

grant select on table "public"."reservas" to "service_role";

grant trigger on table "public"."reservas" to "service_role";

grant truncate on table "public"."reservas" to "service_role";

grant update on table "public"."reservas" to "service_role";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "auth_read_cursos"
  on "public"."cursos"
  as permissive
  for select
  to public
using ((auth.uid() IS NOT NULL));



  create policy "public_read_cursos"
  on "public"."cursos"
  as permissive
  for select
  to public
using (true);



  create policy "staff_delete_cursos"
  on "public"."cursos"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role]))))));



  create policy "staff_insert_cursos"
  on "public"."cursos"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role]))))));



  create policy "staff_update_cursos"
  on "public"."cursos"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role]))))));



  create policy "delete_inscripciones"
  on "public"."inscripciones"
  as permissive
  for delete
  to public
using (((user_uid = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role])))))));



  create policy "delete_inscripciones_staff"
  on "public"."inscripciones"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role]))))));



  create policy "update_inscripciones"
  on "public"."inscripciones"
  as permissive
  for update
  to public
using (((user_uid = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role])))))));



  create policy "delete_reservas_staff"
  on "public"."reservas"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role]))))));



  create policy "delete_users_self_or_staff"
  on "public"."users"
  as permissive
  for delete
  to public
using (((uid = auth.uid()) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'worker'::text]))));



  create policy "insert_inscripciones"
  on "public"."inscripciones"
  as permissive
  for insert
  to public
with check (((user_uid = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role])))))));



  create policy "select_inscripciones"
  on "public"."inscripciones"
  as permissive
  for select
  to public
using (((user_uid = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role])))))));



  create policy "staff_write_recintos"
  on "public"."recintos"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role]))))));



  create policy "insert_reservas"
  on "public"."reservas"
  as permissive
  for insert
  to public
with check (((user_uid = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role])))))));



  create policy "select_reservas"
  on "public"."reservas"
  as permissive
  for select
  to public
using (((user_uid = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role])))))));



  create policy "update_reservas"
  on "public"."reservas"
  as permissive
  for update
  to public
using (((user_uid = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role])))))));



  create policy "select_users_self_or_staff"
  on "public"."users"
  as permissive
  for select
  to public
using (((uid = auth.uid()) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'worker'::text]))));



  create policy "update_users_self_or_staff"
  on "public"."users"
  as permissive
  for update
  to public
using (((uid = auth.uid()) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'worker'::text]))))
with check (((uid = auth.uid()) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['admin'::text, 'worker'::text]))));



