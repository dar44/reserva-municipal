

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."curso_state" AS ENUM (
    'Disponible',
    'No disponible',
    'Cancelado'
);


ALTER TYPE "public"."curso_state" OWNER TO "postgres";


CREATE TYPE "public"."recinto_state" AS ENUM (
    'Disponible',
    'No disponible',
    'Bloqueado'
);


ALTER TYPE "public"."recinto_state" OWNER TO "postgres";


CREATE TYPE "public"."status_activa" AS ENUM (
    'activa',
    'cancelada'
);


ALTER TYPE "public"."status_activa" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'worker',
    'citizen'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cache" (
    "key" character varying(255) NOT NULL,
    "value" "text" NOT NULL,
    "expiration" integer NOT NULL
);


ALTER TABLE "public"."cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cache_locks" (
    "key" character varying(255) NOT NULL,
    "owner" character varying(255) NOT NULL,
    "expiration" integer NOT NULL
);


ALTER TABLE "public"."cache_locks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cursos" (
    "id" bigint NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" character varying(255),
    "location" character varying(255),
    "begining_date" "date",
    "end_date" "date",
    "price" numeric(8,2) DEFAULT 0,
    "state" "public"."curso_state" DEFAULT 'Disponible'::"public"."curso_state",
    "capacity" integer DEFAULT 0,
    "image" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cursos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."cursos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."cursos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."cursos_id_seq" OWNED BY "public"."cursos"."id";



CREATE TABLE IF NOT EXISTS "public"."failed_jobs" (
    "id" bigint NOT NULL,
    "uuid" character varying(255) NOT NULL,
    "connection" "text" NOT NULL,
    "queue" "text" NOT NULL,
    "payload" "text" NOT NULL,
    "exception" "text" NOT NULL,
    "failed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."failed_jobs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."failed_jobs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."failed_jobs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."failed_jobs_id_seq" OWNED BY "public"."failed_jobs"."id";



CREATE TABLE IF NOT EXISTS "public"."inscripciones" (
    "id" bigint NOT NULL,
    "user_uid" "uuid",
    "curso_id" bigint,
    "status" "public"."status_activa" DEFAULT 'activa'::"public"."status_activa",
    "paid" boolean DEFAULT false,
    "cancelled_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."inscripciones" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."inscripciones_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."inscripciones_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."inscripciones_id_seq" OWNED BY "public"."inscripciones"."id";



CREATE TABLE IF NOT EXISTS "public"."job_batches" (
    "id" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "total_jobs" integer NOT NULL,
    "pending_jobs" integer NOT NULL,
    "failed_jobs" integer NOT NULL,
    "failed_job_ids" "text" NOT NULL,
    "options" "text",
    "cancelled_at" integer,
    "created_at" integer NOT NULL,
    "finished_at" integer
);


ALTER TABLE "public"."job_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" bigint NOT NULL,
    "queue" character varying(255) NOT NULL,
    "payload" "text" NOT NULL,
    "attempts" smallint NOT NULL,
    "reserved_at" integer,
    "available_at" integer NOT NULL,
    "created_at" integer NOT NULL
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."jobs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."jobs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."jobs_id_seq" OWNED BY "public"."jobs"."id";



CREATE TABLE IF NOT EXISTS "public"."password_reset_tokens" (
    "email" character varying(255) NOT NULL,
    "token" character varying(255) NOT NULL,
    "created_at" timestamp with time zone
);


ALTER TABLE "public"."password_reset_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recintos" (
    "id" bigint NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" character varying(255) NOT NULL,
    "ubication" character varying(255) NOT NULL,
    "province" character varying(255) NOT NULL,
    "postal_code" character varying(20) NOT NULL,
    "image" character varying(255),
    "state" "public"."recinto_state" DEFAULT 'Disponible'::"public"."recinto_state",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."recintos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."recintos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."recintos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."recintos_id_seq" OWNED BY "public"."recintos"."id";



CREATE TABLE IF NOT EXISTS "public"."reservas" (
    "id" bigint NOT NULL,
    "user_uid" "uuid",
    "recinto_id" bigint,
    "price" numeric(10,2) NOT NULL,
    "start_at" timestamp with time zone NOT NULL,
    "end_at" timestamp with time zone NOT NULL,
    "status" "public"."status_activa" DEFAULT 'activa'::"public"."status_activa",
    "paid" boolean DEFAULT false,
    "observations" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reservas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."reservas_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."reservas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."reservas_id_seq" OWNED BY "public"."reservas"."id";



CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" character varying(255) NOT NULL,
    "user_uid" "uuid",
    "ip_address" character varying(45),
    "user_agent" "text",
    "payload" "text" NOT NULL,
    "last_activity" integer NOT NULL
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "uid" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "surname" character varying(255) NOT NULL,
    "dni" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "email_verified_at" timestamp with time zone,
    "phone" character varying(50) NOT NULL,
    "role" "public"."user_role" DEFAULT 'citizen'::"public"."user_role",
    "image" character varying(255),
    "remember_token" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cursos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."cursos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."failed_jobs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."failed_jobs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."inscripciones" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."inscripciones_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."jobs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."jobs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."recintos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."recintos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."reservas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."reservas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."cache_locks"
    ADD CONSTRAINT "cache_locks_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."cache"
    ADD CONSTRAINT "cache_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."cursos"
    ADD CONSTRAINT "cursos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."failed_jobs"
    ADD CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."failed_jobs"
    ADD CONSTRAINT "failed_jobs_uuid_key" UNIQUE ("uuid");



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_batches"
    ADD CONSTRAINT "job_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("email");



ALTER TABLE ONLY "public"."recintos"
    ADD CONSTRAINT "recintos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reservas"
    ADD CONSTRAINT "reservas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_dni_key" UNIQUE ("dni");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("uid");



CREATE INDEX "idx_inscripciones_curso" ON "public"."inscripciones" USING "btree" ("curso_id");



CREATE INDEX "idx_inscripciones_user" ON "public"."inscripciones" USING "btree" ("user_uid");



CREATE INDEX "idx_reservas_recinto" ON "public"."reservas" USING "btree" ("recinto_id");



CREATE INDEX "idx_reservas_user" ON "public"."reservas" USING "btree" ("user_uid");



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("uid") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inscripciones"
    ADD CONSTRAINT "inscripciones_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reservas"
    ADD CONSTRAINT "reservas_recinto_id_fkey" FOREIGN KEY ("recinto_id") REFERENCES "public"."recintos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reservas"
    ADD CONSTRAINT "reservas_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_uid_fkey" FOREIGN KEY ("uid") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."inscripciones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_inscripciones" ON "public"."inscripciones" FOR INSERT WITH CHECK ((("user_uid" = "auth"."uid"()) OR (("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'worker'::"text"]))));



CREATE POLICY "insert_reservas" ON "public"."reservas" FOR INSERT WITH CHECK ((("user_uid" = "auth"."uid"()) OR (("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'worker'::"text"]))));



CREATE POLICY "insert_users_self_or_staff" ON "public"."users" FOR INSERT WITH CHECK ((("uid" = "auth"."uid"()) OR (("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'worker'::"text"]))));



CREATE POLICY "public_read_recintos" ON "public"."recintos" FOR SELECT USING (true);



ALTER TABLE "public"."recintos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reservas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_inscripciones" ON "public"."inscripciones" FOR SELECT USING (((("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'worker'::"text"])) OR ("user_uid" = "auth"."uid"())));



CREATE POLICY "select_reservas" ON "public"."reservas" FOR SELECT USING (((("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'worker'::"text"])) OR ("user_uid" = "auth"."uid"())));



CREATE POLICY "select_users_self_any_role" ON "public"."users" FOR SELECT USING (("uid" = "auth"."uid"()));



CREATE POLICY "select_users_self_or_staff" ON "public"."users" FOR SELECT USING ((("uid" = "auth"."uid"()) OR (("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'worker'::"text"]))));



CREATE POLICY "staff_write_recintos" ON "public"."recintos" USING (("current_setting"('jwt.claims.role'::"text", true) = ANY (ARRAY['admin'::"text", 'worker'::"text"]))) WITH CHECK (("current_setting"('jwt.claims.role'::"text", true) = ANY (ARRAY['admin'::"text", 'worker'::"text"])));



CREATE POLICY "update_reservas" ON "public"."reservas" FOR UPDATE USING (((("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'worker'::"text"])) OR ("user_uid" = "auth"."uid"())));



CREATE POLICY "update_users_self_or_staff" ON "public"."users" FOR UPDATE USING ((("uid" = "auth"."uid"()) OR (("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'worker'::"text"])))) WITH CHECK ((("uid" = "auth"."uid"()) OR (("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'worker'::"text"]))));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "anon";








































































































































































GRANT SELECT ON TABLE "public"."users" TO "authenticated";
GRANT SELECT ON TABLE "public"."users" TO "anon";

































RESET ALL;
