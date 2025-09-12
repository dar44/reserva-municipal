drop policy "auth_read_cursos" on "public"."cursos";

drop policy "public_read_cursos" on "public"."cursos";

drop policy "select_users_self_any_role" on "public"."users";

drop policy "insert_users_self_or_staff" on "public"."users";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_admin_or_worker()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE uid = auth.uid() AND role IN ('admin', 'worker')
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.worker_course_enrollments(curso_id integer)
 RETURNS TABLE(id integer, dni text, name text, email text, phone text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT i.id, u.dni, u.name, u.email, u.phone
  FROM inscripciones i
  JOIN users u ON u.uid = i.user_uid
  WHERE i.curso_id = $1
    AND i.status = 'activa'
    AND EXISTS (
      SELECT 1 FROM users staff
      WHERE staff.uid = auth.uid()
        AND staff.role IN ('admin', 'worker')
    );
$function$
;

grant select on table "public"."inscripciones" to "anon";


  create policy "citizen_select_cursos"
  on "public"."cursos"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['citizen'::user_role, 'admin'::user_role, 'worker'::user_role]))))));



  create policy "delete_inscripciones_self_or_staff"
  on "public"."inscripciones"
  as permissive
  for delete
  to public
using (((current_setting('jwt.claims.role'::text, true) = ANY (ARRAY['citizen'::text, 'admin'::text, 'worker'::text])) OR (user_uid = (current_setting('jwt.claims.uid'::text, true))::uuid)));



  create policy "delete_reservas"
  on "public"."reservas"
  as permissive
  for delete
  to public
using ((((auth.jwt() ->> 'role'::text) = ANY (ARRAY['citizen'::text, 'admin'::text, 'worker'::text])) OR (user_uid = auth.uid())));



  create policy "insert_users_self_or_staff"
  on "public"."users"
  as permissive
  for insert
  to public
with check (((uid = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users u
  WHERE ((u.uid = auth.uid()) AND (u.role = ANY (ARRAY['admin'::user_role, 'worker'::user_role])))))));



