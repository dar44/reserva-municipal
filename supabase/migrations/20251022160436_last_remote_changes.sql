drop policy "citizen_select_cursos" on "public"."cursos";

drop policy "delete_inscripciones_self_or_staff" on "public"."inscripciones";

drop policy "delete_reservas" on "public"."reservas";

drop policy "insert_users_self_or_staff" on "public"."users";

revoke select on table "public"."inscripciones" from "anon";

drop function if exists "public"."is_admin_or_worker"();

drop function if exists "public"."worker_course_enrollments"(curso_id integer);


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



  create policy "select_users_self_any_role"
  on "public"."users"
  as permissive
  for select
  to public
using ((uid = auth.uid()));



  create policy "insert_users_self_or_staff"
  on "public"."users"
  as permissive
  for insert
  to public
with check (((uid = auth.uid()) OR ((auth.jwt() ->> 'role'::text) = ANY (ARRAY['admin'::text, 'worker'::text]))));


CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


