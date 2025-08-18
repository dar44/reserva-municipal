SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '80bdb537-b8a2-437c-b0f8-4cfb2597bccd', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"dar44@gcloud.ua.es","user_id":"9b7da909-8c2c-4212-88b0-9e546104f847","user_phone":""}}', '2025-08-06 14:32:45.912165+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d1cf122-13af-4310-b689-c341dd49ddf2', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"dar44@glcoud.ua.es","user_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","user_phone":""}}', '2025-08-06 14:38:29.072941+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cb81140b-4804-4389-a7e0-761980a2a226', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"dar44@glcoud.ua.es","user_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","user_phone":""}}', '2025-08-06 14:38:29.341503+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a655f304-8d3b-4c96-a9fd-44fd65d989ed', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 14:39:54.149813+00', ''),
	('00000000-0000-0000-0000-000000000000', '1b31dbdf-e7bc-41a2-87cf-0781b68f6a4c', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 14:40:55.8993+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dc612ff6-46d9-4268-a528-feb019fe7c22', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 14:42:52.369747+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e97003d7-d6d7-4054-9d3f-85a6bf859a5e', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 14:45:31.562619+00', ''),
	('00000000-0000-0000-0000-000000000000', '6b33efd1-0b01-42d2-96fe-4891f75d315c', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 14:46:45.224574+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bb2a0ce0-6463-40ac-b7ec-8c0ae75c0441', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 14:52:26.428143+00', ''),
	('00000000-0000-0000-0000-000000000000', '570ca1ac-73df-4c4f-bcc9-41877094d79b', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 14:58:31.095883+00', ''),
	('00000000-0000-0000-0000-000000000000', '8bed0695-7ae1-4c54-8683-377b0d427062', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"tusmuelas@gmail.com","user_id":"42d81cc4-2125-4c39-8f47-c8d563213632","user_phone":""}}', '2025-08-06 15:06:09.792153+00', ''),
	('00000000-0000-0000-0000-000000000000', 'df550679-b4f0-434a-81a8-4432c3209225', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tusmuelas@gmail.com","user_id":"42d81cc4-2125-4c39-8f47-c8d563213632","user_phone":""}}', '2025-08-06 15:06:10.388623+00', ''),
	('00000000-0000-0000-0000-000000000000', '1985900e-a95d-4ef9-b352-41a62e60ceed', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 15:06:23.098687+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd5e8543a-a74b-4b95-b31d-ee64f0b1cf12', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 15:11:29.142669+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ecba6ead-eacc-4893-a2ae-c4b980f1f526', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 15:42:46.982411+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d050cac-0992-45f7-a573-5efa1f10614f', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 15:48:34.53741+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd457d546-bb44-4a22-bf2f-ac254247266d', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 15:59:43.62907+00', ''),
	('00000000-0000-0000-0000-000000000000', '92bafd54-a15c-4d6e-b6c1-6bfdf4d78d50', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 16:00:50.054269+00', ''),
	('00000000-0000-0000-0000-000000000000', '4bbe6794-f56a-4df6-a54e-3c3548947f8c', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 16:01:34.398255+00', ''),
	('00000000-0000-0000-0000-000000000000', '192f8705-30a8-4cfa-8a5a-e39a71a3b8d8', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 16:02:27.487621+00', ''),
	('00000000-0000-0000-0000-000000000000', '05577a9e-afe6-49d0-a9ba-9653ece20c07', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-06 16:11:21.904904+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd8cc873c-ba77-4a3a-ad8b-ddea82fcb194', '{"action":"token_refreshed","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-07 05:26:15.957455+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ace68ab-3dd5-47a5-bcaf-7c24bdfa47b5', '{"action":"token_revoked","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-07 05:26:15.964569+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb5127c6-350a-493b-8ce5-9a8affcf8427', '{"action":"token_refreshed","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-07 05:26:35.931571+00', ''),
	('00000000-0000-0000-0000-000000000000', '6c4986ec-96a6-4726-bc6b-8856d04dd85c', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 05:26:35.996944+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd325907f-0813-46fd-8a5d-eac61c244162', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 05:26:48.298137+00', ''),
	('00000000-0000-0000-0000-000000000000', '150ee49e-b47e-42c7-b0e0-848f31c91667', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 05:48:33.464567+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dcbd5ddc-39f9-4913-8e59-a23a8775f172', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"juan@alu.ua.es","user_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","user_phone":""}}', '2025-08-07 05:49:10.737216+00', ''),
	('00000000-0000-0000-0000-000000000000', '9196a48c-205b-4035-b27a-860dd62e7b32', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"juan@alu.ua.es","user_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","user_phone":""}}', '2025-08-07 05:49:11.06221+00', ''),
	('00000000-0000-0000-0000-000000000000', 'edbf67b6-6384-4989-a6d7-8c08a127d103', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 05:49:21.067819+00', ''),
	('00000000-0000-0000-0000-000000000000', '219e471d-abc4-4543-81d3-4ce1fc9d03ea', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 05:57:14.963867+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e5518dab-0ce5-43ea-a7a6-bf648a3b655c', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 06:35:59.932616+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c734af6c-548f-4d3e-8e54-a793a57c15c2', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 06:46:39.86671+00', ''),
	('00000000-0000-0000-0000-000000000000', '78172e6c-0d14-4296-8bdd-f8da948cae56', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 07:08:40.492231+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c8779744-bec4-4c1e-b577-32a4eb74614b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"luis@gmail.com","user_id":"983f23f2-c6b0-4f0a-8dd7-cfcc1876432f","user_phone":""}}', '2025-08-07 07:17:27.573411+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e8d4b04-4d43-4255-9573-c92aa0cc0a2c', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"luis@gmail.com","user_id":"983f23f2-c6b0-4f0a-8dd7-cfcc1876432f","user_phone":""}}', '2025-08-07 07:17:27.90108+00', ''),
	('00000000-0000-0000-0000-000000000000', '0ea016cc-7bab-434a-ac95-fc9704629bbb', '{"action":"login","actor_id":"983f23f2-c6b0-4f0a-8dd7-cfcc1876432f","actor_username":"luis@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 07:17:38.865954+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b786b59a-4971-493d-b905-ff576130234a', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"juancarlo@gmail.com","user_id":"23da9375-2f73-40c3-8204-0205f82a1362","user_phone":""}}', '2025-08-07 07:20:21.710841+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc294df6-1a85-41bb-8114-112b276b42be', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 07:32:14.728473+00', ''),
	('00000000-0000-0000-0000-000000000000', '5af5a05c-16ef-4086-adfd-c780b878179b', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-07 08:51:54.664886+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bfc8771f-6a80-4156-9e45-f5d496ac8983', '{"action":"token_revoked","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-07 08:51:54.689298+00', ''),
	('00000000-0000-0000-0000-000000000000', '1eb21cd1-4285-4bd4-9072-1539fd9a84ae', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-07 08:53:02.337406+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a615230-2c11-497b-bdeb-73469cdf2b27', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-07 08:53:02.411981+00', ''),
	('00000000-0000-0000-0000-000000000000', '2d2d54d1-24f3-4385-8895-6e31e466043b', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:15:38.742489+00', ''),
	('00000000-0000-0000-0000-000000000000', '45dc0f9e-66c4-4c89-9164-0d572065572b', '{"action":"token_revoked","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:15:38.75728+00', ''),
	('00000000-0000-0000-0000-000000000000', '672edef1-34e2-4f6a-8aea-d217321e3312', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:15:40.254389+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b857e9c-1584-4c67-a3bf-3d0a4270e847', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:15:42.454202+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f975c82b-b829-440d-bdbb-571b1ab72830', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:15:43.916501+00', ''),
	('00000000-0000-0000-0000-000000000000', '75a0011b-5288-4ac4-82c3-aefb91f1c2d6', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:15:51.258171+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e9d0a9ac-d981-4a36-8c5d-35a8004587bc', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:15:51.780139+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bb3205e6-5875-457c-8e84-3239f63d899b', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:15:54.8784+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad11c266-b7b7-471f-b253-8b3b080b4e13', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:15:55.330462+00', ''),
	('00000000-0000-0000-0000-000000000000', '7b575d02-bb2b-45f2-965d-cf3b1ad08d4e', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:16:14.461149+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bcf50ddb-37c1-4330-8a3c-0e91c79d5939', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-08 07:17:06.793357+00', ''),
	('00000000-0000-0000-0000-000000000000', '525b7fef-96da-4bf1-b1cd-48ac323922ff', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 07:17:06.866637+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cfd4b9e9-dffa-4e44-8f25-c83bd523783e', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 07:23:41.005382+00', ''),
	('00000000-0000-0000-0000-000000000000', '731ce322-ebe9-4a5a-93ad-ad893a65213e', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 07:36:57.769371+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e045025-38ff-4b0b-86b3-97af4d9a2572', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 07:37:23.002565+00', ''),
	('00000000-0000-0000-0000-000000000000', '4404d6d7-12cb-47ad-8f80-5c283d5bbeb3', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 07:50:14.816661+00', ''),
	('00000000-0000-0000-0000-000000000000', '8c8cefe2-26ee-4ed5-9c19-bfa42a55b889', '{"action":"logout","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account"}', '2025-08-08 07:50:26.337227+00', ''),
	('00000000-0000-0000-0000-000000000000', '437d8f43-c06f-4a3e-b415-1d7152bf0fb0', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 07:50:40.697378+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f1f6d88e-b751-46aa-9a92-304199371e51', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 07:53:05.948366+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ca3775e-d140-457b-8a08-aefeb636d7e8', '{"action":"logout","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account"}', '2025-08-08 07:53:09.587841+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9a9711a-5f0e-4ae6-87c9-4bad5e82099b', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 07:53:41.760635+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e3429266-b494-4b1d-aa58-9e2339c4a9f7', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 08:11:49.468698+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b64531fb-ca16-44e5-b238-1813fab6ecb2', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 08:12:12.087887+00', ''),
	('00000000-0000-0000-0000-000000000000', '82aec2a9-d31a-489d-ab0f-3f30e6f08543', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 08:13:46.354566+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd048cf2-e8fa-4892-a60b-7c151b258ddb', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 08:31:10.830691+00', ''),
	('00000000-0000-0000-0000-000000000000', '7a3fb187-1d36-4f33-9914-fcadc18f9fc6', '{"action":"logout","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account"}', '2025-08-08 08:31:23.239816+00', ''),
	('00000000-0000-0000-0000-000000000000', '9db9b830-9394-4f4e-9c8b-ecbad4cdc985', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 08:31:33.23574+00', ''),
	('00000000-0000-0000-0000-000000000000', '28b847ec-3bff-451c-9e65-45f1020f837d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"worker@gmail.com","user_id":"4e4979c2-bcda-4787-a5ab-35f7f796fc9d","user_phone":""}}', '2025-08-08 08:56:37.335341+00', ''),
	('00000000-0000-0000-0000-000000000000', '807fc514-ebd1-4882-9a28-8a6a8c82097c', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"worker@gmail.com","user_id":"4e4979c2-bcda-4787-a5ab-35f7f796fc9d","user_phone":""}}', '2025-08-08 08:56:37.824465+00', ''),
	('00000000-0000-0000-0000-000000000000', '98ac0fe0-99b9-478f-aa55-9be50fe8e089', '{"action":"login","actor_id":"4e4979c2-bcda-4787-a5ab-35f7f796fc9d","actor_username":"worker@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 08:56:55.546249+00', ''),
	('00000000-0000-0000-0000-000000000000', '946db20f-03c4-4916-bf00-beeae43f8ab3', '{"action":"logout","actor_id":"4e4979c2-bcda-4787-a5ab-35f7f796fc9d","actor_username":"worker@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-08 09:02:45.035909+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2e429ad-8630-4a01-8dd4-93cea3c53974', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 09:03:02.120702+00', ''),
	('00000000-0000-0000-0000-000000000000', '7ae13f1b-a021-43c0-a72a-94b0046e8425', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 09:12:06.038341+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e7f4d168-b2b1-4dd0-ae97-e26026ca1e77', '{"action":"logout","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account"}', '2025-08-08 09:15:56.287524+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b1f35f7-ed05-430b-b94c-1179bc38bf63', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 09:38:19.741861+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a2690cf0-b49b-4899-b686-97a496936acb', '{"action":"logout","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account"}', '2025-08-08 09:38:27.556539+00', ''),
	('00000000-0000-0000-0000-000000000000', '0836601c-bcb1-47fb-a9d2-ce2986dd5d7d', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 09:38:37.489056+00', ''),
	('00000000-0000-0000-0000-000000000000', '007eed07-c9d8-45c8-8194-3b67fe7dc15a', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 10:34:27.281782+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e3316635-6cae-4da6-9978-5e57906a00ac', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 11:19:07.227271+00', ''),
	('00000000-0000-0000-0000-000000000000', '266c1973-69bf-45a2-8f3a-d4672fceeae9', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 11:32:50.174383+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c372736-27e3-4476-9f3c-a30b859b9f5f', '{"action":"logout","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account"}', '2025-08-08 11:34:17.596082+00', ''),
	('00000000-0000-0000-0000-000000000000', '22c7faeb-1cb4-474c-98e0-c6b8038914b4', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 11:34:24.865054+00', ''),
	('00000000-0000-0000-0000-000000000000', '5c54f520-eda7-4f22-9bb4-60f6c4e0faff', '{"action":"login","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 12:14:31.449454+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a509c271-6e43-4e4c-9f25-56dcab3ac61f', '{"action":"logout","actor_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","actor_username":"dar44@glcoud.ua.es","actor_via_sso":false,"log_type":"account"}', '2025-08-08 12:15:32.565957+00', ''),
	('00000000-0000-0000-0000-000000000000', '3dd978a9-4adc-474b-b7ce-9609af9e79c4', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 12:16:36.592805+00', ''),
	('00000000-0000-0000-0000-000000000000', '23c6185d-5144-4fa9-a3a9-fef3ade6c5ee', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 12:16:37.218649+00', ''),
	('00000000-0000-0000-0000-000000000000', '19a752a4-c229-40ce-98bd-a0473bdcef0b', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 12:16:37.82104+00', ''),
	('00000000-0000-0000-0000-000000000000', '2b5f1467-af41-4214-aa0f-576c351c8cdd', '{"action":"login","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-08 12:16:37.967256+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dfe4a853-4c65-4b14-a32b-61a1a64aeca9', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-10 09:44:56.788281+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fb8baba9-942d-48c3-802b-85fb7662fef0', '{"action":"token_revoked","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-10 09:44:56.802696+00', ''),
	('00000000-0000-0000-0000-000000000000', '22f7cc80-012e-4f75-b8d8-4477b0a707c4', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"david@alu.ua.es","user_id":"bc53ba71-d05a-4286-bb20-bc0627715d81","user_phone":""}}', '2025-08-10 09:48:48.530457+00', ''),
	('00000000-0000-0000-0000-000000000000', '716291a4-fcfe-4710-8c55-f43ad620bc82', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"juano@kfkfkfk.es","user_id":"60520f1e-f994-467e-b9de-4f9fc9e9cfb6","user_phone":""}}', '2025-08-10 09:51:41.35442+00', ''),
	('00000000-0000-0000-0000-000000000000', '81a274a5-bcd7-4892-8d5e-693658293b91', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"juano@kfkfkfk.es","user_id":"60520f1e-f994-467e-b9de-4f9fc9e9cfb6","user_phone":""}}', '2025-08-10 09:52:05.750196+00', ''),
	('00000000-0000-0000-0000-000000000000', '4871f86e-b063-4ac0-adca-f84b8dc2feee', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"dar44@gmail.com","user_id":"f9a43d60-8fd1-4af7-ae2b-10c819d217f5","user_phone":""}}', '2025-08-10 10:04:06.669249+00', ''),
	('00000000-0000-0000-0000-000000000000', '451d7546-358d-4d12-91de-e7f4a35a24ef', '{"action":"token_refreshed","actor_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","actor_username":"juan@alu.ua.es","actor_via_sso":false,"log_type":"token"}', '2025-08-10 10:09:01.441859+00', ''),
	('00000000-0000-0000-0000-000000000000', '6b45d461-d845-4a87-b4ca-79d328c9cf2e', '{"action":"login","actor_id":"f9a43d60-8fd1-4af7-ae2b-10c819d217f5","actor_username":"dar44@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 10:09:11.737616+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c2adc6d7-f2d5-4e84-b244-977b9b82d531', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"antonete@gmail.com","user_id":"68169aeb-60fa-45cd-882f-ad4fddc60bf4","user_phone":""}}', '2025-08-10 10:20:09.118316+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7ee8122-c2ee-404a-90ef-034d288ccd2a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"antonete@gmail.com","user_id":"68169aeb-60fa-45cd-882f-ad4fddc60bf4","user_phone":""}}', '2025-08-10 10:20:09.325083+00', ''),
	('00000000-0000-0000-0000-000000000000', '52346687-85db-4849-899a-97dbf72257b9', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"antonete@gmail.com","user_id":"9c4eb1bc-15c0-4f9f-9b70-75c556ef9d3b","user_phone":""}}', '2025-08-10 10:22:19.261035+00', ''),
	('00000000-0000-0000-0000-000000000000', '06357539-a5bb-4a3e-854b-440242fdb662', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"tumulo@gmail.com","user_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","user_phone":""}}', '2025-08-10 10:44:37.987787+00', ''),
	('00000000-0000-0000-0000-000000000000', '261c99ec-b102-4145-96a8-0ba4fc38eb1f', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tumulo@gmail.com","user_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","user_phone":""}}', '2025-08-10 10:44:38.143071+00', ''),
	('00000000-0000-0000-0000-000000000000', '7a257955-4c21-42fd-846b-bad48094c7dd', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 10:45:15.51941+00', ''),
	('00000000-0000-0000-0000-000000000000', '508b456f-b33b-490a-8062-dba00d79efbd', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:03:20.740195+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f6d0f4e8-8abf-4784-b1e6-7bf0558f963a', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:12:19.904523+00', ''),
	('00000000-0000-0000-0000-000000000000', 'faeb9d9f-8907-438a-89f3-684d5ea43a48', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:13:37.027629+00', ''),
	('00000000-0000-0000-0000-000000000000', '2bb55ede-403c-4483-833d-e3b800612669', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:14:28.306447+00', ''),
	('00000000-0000-0000-0000-000000000000', '348cd339-9170-434d-9d1c-7af3d345c15d', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:16:31.250115+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dae6936a-5363-4e33-bb5e-088670e7d501', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"gloria@gmail.com","user_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","user_phone":""}}', '2025-08-10 11:30:17.522362+00', ''),
	('00000000-0000-0000-0000-000000000000', '96a432aa-e824-4a68-a70a-faa586b9e3f2', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"gloria@gmail.com","user_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","user_phone":""}}', '2025-08-10 11:30:17.625461+00', ''),
	('00000000-0000-0000-0000-000000000000', '26207615-ebcc-484b-9fe6-7c6239bb8c5f', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:30:26.543948+00', ''),
	('00000000-0000-0000-0000-000000000000', '11467a66-0181-4e44-b316-80b93a3ddc66', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:30:52.089483+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a4f1eb2-5b0a-44df-a043-ab38e0f2554a', '{"action":"logout","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-10 11:32:14.160231+00', ''),
	('00000000-0000-0000-0000-000000000000', '6158153e-b3bd-4979-a2d9-618def849d49', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:32:21.890518+00', ''),
	('00000000-0000-0000-0000-000000000000', '94b5ec8b-3158-4e71-a5ea-2ce40eda01df', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:36:26.815715+00', ''),
	('00000000-0000-0000-0000-000000000000', '36e8965b-6785-413b-9786-948473723526', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:45:02.455163+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e49df347-70d9-454c-b4b8-f09f855c0212', '{"action":"logout","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-10 11:45:12.887097+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c7c4baf4-5887-4d09-a347-f6703b08fa45', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 11:49:54.29489+00', ''),
	('00000000-0000-0000-0000-000000000000', '179293d7-4f5b-438a-a35e-c4a43ef46ab1', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 12:04:21.307382+00', ''),
	('00000000-0000-0000-0000-000000000000', '2f1992b1-c501-4037-ba49-81c23e821177', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 12:08:31.609757+00', ''),
	('00000000-0000-0000-0000-000000000000', '9f438ef2-545c-48fe-bc5f-bf9403b77b02', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 12:24:26.774568+00', ''),
	('00000000-0000-0000-0000-000000000000', 'abbf1e86-109a-497a-a7f9-c2790677080b', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 12:25:14.562506+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a697c7bb-9f37-4e41-9c51-66e8530f485a', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 12:29:16.809549+00', ''),
	('00000000-0000-0000-0000-000000000000', '89537399-3197-49bd-b5d2-d95d919701ae', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 12:29:27.058318+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b747edf-cf7b-4742-b609-71d9cb12a5e7', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 12:29:59.02982+00', ''),
	('00000000-0000-0000-0000-000000000000', '6f0b68ff-62fd-4008-968d-5c7450df39b5', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 12:30:10.230425+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd861b78a-10b1-4ce8-8660-0ccced9c4b6e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"luisa@gmail.com","user_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","user_phone":""}}', '2025-08-10 12:31:10.434074+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6c45352-319b-440e-8168-612b776e7e5b', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"luisa@gmail.com","user_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","user_phone":""}}', '2025-08-10 12:31:10.59819+00', ''),
	('00000000-0000-0000-0000-000000000000', '635a4e90-8cb5-437d-932a-9db0e1ee25cc', '{"action":"login","actor_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","actor_username":"luisa@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 12:31:25.096778+00', ''),
	('00000000-0000-0000-0000-000000000000', '99f1decd-d728-4d13-8072-b590d517b3b2', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 12:52:08.179722+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f35dafb3-ec14-4cc9-a1aa-2debda72eade', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 13:44:06.649019+00', ''),
	('00000000-0000-0000-0000-000000000000', '67334de6-5439-4df7-a273-155bad48f2be', '{"action":"login","actor_id":"9b7da909-8c2c-4212-88b0-9e546104f847","actor_username":"dar44@gcloud.ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 13:44:44.07274+00', ''),
	('00000000-0000-0000-0000-000000000000', '710715eb-b646-4824-842c-991d9f7084e3', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dar44@gcloud.ua.es","user_id":"9b7da909-8c2c-4212-88b0-9e546104f847","user_phone":""}}', '2025-08-10 13:45:15.25461+00', ''),
	('00000000-0000-0000-0000-000000000000', '689b6a20-ec3e-4889-ac6f-2fbed8437363', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dar44@glcoud.ua.es","user_id":"7880e3a3-93d8-4dc9-9bb6-b73807398d05","user_phone":""}}', '2025-08-10 13:45:21.059811+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f5bd5b8-a8ac-41ef-8aa1-98d9cfe55eaf', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"juan@alu.ua.es","user_id":"086ad7a8-f437-4e30-bfc2-1f9ff31d13ed","user_phone":""}}', '2025-08-10 13:45:25.609828+00', ''),
	('00000000-0000-0000-0000-000000000000', '4cf3f545-04c2-409a-8269-1e8411355062', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tusmuelas@gmail.com","user_id":"42d81cc4-2125-4c39-8f47-c8d563213632","user_phone":""}}', '2025-08-10 13:45:29.950765+00', ''),
	('00000000-0000-0000-0000-000000000000', '5aca6a53-1860-46fe-a592-85722ee7a51a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"juancarlo@gmail.com","user_id":"23da9375-2f73-40c3-8204-0205f82a1362","user_phone":""}}', '2025-08-10 13:45:34.704152+00', ''),
	('00000000-0000-0000-0000-000000000000', '38686c72-2788-4950-b902-3e7bdaad1291', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"luis@gmail.com","user_id":"983f23f2-c6b0-4f0a-8dd7-cfcc1876432f","user_phone":""}}', '2025-08-10 13:45:38.493712+00', ''),
	('00000000-0000-0000-0000-000000000000', '74d6b341-dfb8-46da-8a88-601db41ffad9', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"worker@gmail.com","user_id":"4e4979c2-bcda-4787-a5ab-35f7f796fc9d","user_phone":""}}', '2025-08-10 13:45:42.768982+00', ''),
	('00000000-0000-0000-0000-000000000000', '52ee3195-649c-408f-ba4c-570cebcd7140', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"david@alu.ua.es","user_id":"bc53ba71-d05a-4286-bb20-bc0627715d81","user_phone":""}}', '2025-08-10 13:45:46.54439+00', ''),
	('00000000-0000-0000-0000-000000000000', '6b031711-c273-4401-b9b0-3d5b1ac17bbd', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dar44@gmail.com","user_id":"f9a43d60-8fd1-4af7-ae2b-10c819d217f5","user_phone":""}}', '2025-08-10 13:45:50.365424+00', ''),
	('00000000-0000-0000-0000-000000000000', '561ee342-cf60-4ec9-85b3-c86daaf70b5d', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"antonete@gmail.com","user_id":"9c4eb1bc-15c0-4f9f-9b70-75c556ef9d3b","user_phone":""}}', '2025-08-10 13:45:54.769203+00', ''),
	('00000000-0000-0000-0000-000000000000', '4c765a19-4ca8-40f5-bdbd-16c5dc8bc98d', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"dar44@ua.es","user_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","user_phone":""}}', '2025-08-10 13:47:42.748595+00', ''),
	('00000000-0000-0000-0000-000000000000', '40d7a439-34e0-4c6b-8369-d30641dbbf4d', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"dar44@ua.es","user_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","user_phone":""}}', '2025-08-10 13:47:42.820214+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a24c1263-991b-4388-b61f-bc3bf6caf892', '{"action":"login","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 13:47:51.83211+00', ''),
	('00000000-0000-0000-0000-000000000000', '8152dc68-7f84-4260-b45c-59b086ba2edc', '{"action":"login","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 13:48:49.815441+00', ''),
	('00000000-0000-0000-0000-000000000000', '4696cf52-24d0-4b2c-aae2-6a07704de77c', '{"action":"login","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 13:50:50.372182+00', ''),
	('00000000-0000-0000-0000-000000000000', '3b1eef02-d606-4793-a6ed-913a1d351698', '{"action":"logout","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account"}', '2025-08-10 13:53:30.667311+00', ''),
	('00000000-0000-0000-0000-000000000000', '109549ea-73e8-4500-90e4-b64f677a1f4e', '{"action":"login","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 13:58:57.740394+00', ''),
	('00000000-0000-0000-0000-000000000000', '826a3221-a3ef-4b6e-bb12-04208a80624f', '{"action":"login","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 14:16:16.277826+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc99ae67-2997-41db-a1fc-ef2d6614a92c', '{"action":"login","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 14:21:30.549037+00', ''),
	('00000000-0000-0000-0000-000000000000', '1fd7e32a-e1fd-4576-bc13-d508bac210bd', '{"action":"login","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 14:23:06.708949+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f558e102-7848-4e6a-bd8f-afc502d744c3', '{"action":"login","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 14:34:33.890528+00', ''),
	('00000000-0000-0000-0000-000000000000', '53cad965-e791-4b64-9ac6-b864931b69ac', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 14:39:28.783515+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea347ae9-8a3c-4377-b4b3-3cc07e18c30b', '{"action":"logout","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-10 14:39:48.618655+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6ed5ab9-4ce4-4f1e-8125-e5b20b4eb31b', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 14:40:03.981681+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7e50f1f-3204-4f77-a953-e297c5ec8320', '{"action":"logout","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-10 14:40:25.954254+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dd640450-5494-4a7d-8cbf-0fb68a791774', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 14:40:59.988827+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a6acf78f-7b35-4f36-bb26-935c5ee37223', '{"action":"logout","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-10 14:43:53.670888+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ddb9de5-c184-4efe-bcfa-d34e359587ed', '{"action":"login","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 14:44:04.515646+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e92ff358-9d1b-41f1-87dc-02233e4e6ea9', '{"action":"logout","actor_id":"0576ab6c-c52d-47cc-ad7f-eb1d18b932ac","actor_username":"dar44@ua.es","actor_via_sso":false,"log_type":"account"}', '2025-08-10 14:45:15.914344+00', ''),
	('00000000-0000-0000-0000-000000000000', '50c52b13-7bb6-4e61-8e51-685ec6a7136d', '{"action":"login","actor_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","actor_username":"luisa@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 14:45:53.560582+00', ''),
	('00000000-0000-0000-0000-000000000000', '5f1f0eba-08c2-4c12-ae61-89a749cc1f03', '{"action":"token_refreshed","actor_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","actor_username":"luisa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-08-10 17:42:12.605316+00', ''),
	('00000000-0000-0000-0000-000000000000', '798776d1-fd0e-4363-894b-6102499567fb', '{"action":"token_revoked","actor_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","actor_username":"luisa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-08-10 17:42:12.613681+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4eae8f2-336b-427b-9920-a42170b2d5ef', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-10 17:42:12.661921+00', ''),
	('00000000-0000-0000-0000-000000000000', '3654f9d8-6a2f-49d2-ab90-f993332f95de', '{"action":"token_refreshed","actor_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","actor_username":"luisa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-08-18 09:45:43.082204+00', ''),
	('00000000-0000-0000-0000-000000000000', '0de3d6be-2acf-4236-98a5-d5858fd4942e', '{"action":"token_revoked","actor_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","actor_username":"luisa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-08-18 09:45:43.087994+00', ''),
	('00000000-0000-0000-0000-000000000000', '044500af-4d10-4cdd-8ed7-417a97d8daac', '{"action":"token_refreshed","actor_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","actor_username":"luisa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-08-18 09:45:43.135085+00', ''),
	('00000000-0000-0000-0000-000000000000', '1eb1cb28-031e-445f-9e8b-8b7b0765b9e8', '{"action":"token_refreshed","actor_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","actor_username":"luisa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-08-18 09:45:46.160165+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b1ee43fa-fce3-44d3-b014-80e9a76d5273', '{"action":"login","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-18 09:50:20.912908+00', ''),
	('00000000-0000-0000-0000-000000000000', '44ca8b7a-b0c5-4f82-9db5-128bef620a60', '{"action":"logout","actor_id":"307b9e59-c1f5-469f-b8b0-701ac6d28144","actor_username":"tumulo@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-18 09:50:50.689473+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e66a51b4-4027-4b53-a497-fbbbcb097ebe', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-18 09:50:57.377139+00', ''),
	('00000000-0000-0000-0000-000000000000', '2b53c5bc-9e9a-4ed7-93d3-a905aa254057', '{"action":"logout","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-18 09:51:38.757687+00', ''),
	('00000000-0000-0000-0000-000000000000', '7b0ebe8c-42be-4493-819d-3d45137fe2ea', '{"action":"login","actor_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","actor_username":"luisa@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-18 09:51:47.031124+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fbdab94b-409a-49a3-ab92-820cc5f5b098', '{"action":"logout","actor_id":"6031fbb5-9d8c-4888-a01b-21b06d5d39d8","actor_username":"luisa@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-18 10:14:00.502283+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b3f9d29d-7272-45ac-a957-dd821f9d4690', '{"action":"login","actor_id":"e44ff3b4-c0b5-423d-8237-fbc9e1e54e25","actor_username":"gloria@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-08-18 10:14:10.6407+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '307b9e59-c1f5-469f-b8b0-701ac6d28144', 'authenticated', 'authenticated', 'tumulo@gmail.com', '$2a$10$moXdPV2pN7gzQecAhs5hROF14WRpnR2T3SmWJV4ujZ/8UPcOmR9H.', '2025-08-10 10:44:37.99796+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-08-18 09:50:20.913902+00', '{"role": "citizen", "provider": "email", "providers": ["email"]}', '{"dni": "87777737J", "name": "Jesus", "phone": "222333444", "surname": "Antonio", "email_verified": true}', NULL, '2025-08-10 10:44:37.950036+00', '2025-08-18 09:50:20.924846+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6031fbb5-9d8c-4888-a01b-21b06d5d39d8', 'authenticated', 'authenticated', 'luisa@gmail.com', '$2a$10$Q5Qz.Mm6N8GfvCnXe1tvQenov621yhiflot11xgi7zlQoDzlH6qLW', '2025-08-10 12:31:10.437459+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-08-18 09:51:47.034706+00', '{"role": "citizen", "provider": "email", "providers": ["email"]}', '{"dni": "88833372J", "name": "Davida", "phone": "777333222", "surname": "Luisa", "email_verified": true}', NULL, '2025-08-10 12:31:10.418365+00', '2025-08-18 09:51:47.036429+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e44ff3b4-c0b5-423d-8237-fbc9e1e54e25', 'authenticated', 'authenticated', 'gloria@gmail.com', '$2a$10$wcJKcBNfoKGV1xV/ctX4T.nHXmbnmeU8uXD88eAMtp8gS83v5Rx6e', '2025-08-10 11:30:17.542807+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-08-18 10:14:10.646371+00', '{"role": "citizen", "provider": "email", "providers": ["email"]}', '{"dni": "44400034J", "name": "Glroia", "phone": "888999333", "surname": "Rodriguez", "email_verified": true}', NULL, '2025-08-10 11:30:17.447738+00', '2025-08-18 10:14:10.658949+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0576ab6c-c52d-47cc-ad7f-eb1d18b932ac', 'authenticated', 'authenticated', 'dar44@ua.es', '$2a$10$2en.zjm/kuAFAqMPWyTMnOBUCu2vpWAnVp1wGSIXdlTyWsfXkE2hC', '2025-08-10 13:47:42.752251+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-08-10 14:44:04.517646+00', '{"role": "citizen", "provider": "email", "providers": ["email"]}', '{"dni": "88823293L", "name": "Davd", "phone": "999333399", "surname": "Loloj", "email_verified": true}', NULL, '2025-08-10 13:47:42.726934+00', '2025-08-10 14:44:04.530091+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('307b9e59-c1f5-469f-b8b0-701ac6d28144', '307b9e59-c1f5-469f-b8b0-701ac6d28144', '{"sub": "307b9e59-c1f5-469f-b8b0-701ac6d28144", "email": "tumulo@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-08-10 10:44:37.98046+00', '2025-08-10 10:44:37.98052+00', '2025-08-10 10:44:37.98052+00', '48af6691-0c9f-43a2-bf86-3c48bba32140'),
	('e44ff3b4-c0b5-423d-8237-fbc9e1e54e25', 'e44ff3b4-c0b5-423d-8237-fbc9e1e54e25', '{"sub": "e44ff3b4-c0b5-423d-8237-fbc9e1e54e25", "email": "gloria@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-08-10 11:30:17.516136+00', '2025-08-10 11:30:17.516212+00', '2025-08-10 11:30:17.516212+00', 'd56d1428-1c7f-4149-bd8c-5c8c0cd3cb3b'),
	('6031fbb5-9d8c-4888-a01b-21b06d5d39d8', '6031fbb5-9d8c-4888-a01b-21b06d5d39d8', '{"sub": "6031fbb5-9d8c-4888-a01b-21b06d5d39d8", "email": "luisa@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-08-10 12:31:10.4309+00', '2025-08-10 12:31:10.430958+00', '2025-08-10 12:31:10.430958+00', 'fab66b52-a63a-4472-9984-0fbfefdbe9f8'),
	('0576ab6c-c52d-47cc-ad7f-eb1d18b932ac', '0576ab6c-c52d-47cc-ad7f-eb1d18b932ac', '{"sub": "0576ab6c-c52d-47cc-ad7f-eb1d18b932ac", "email": "dar44@ua.es", "email_verified": false, "phone_verified": false}', 'email', '2025-08-10 13:47:42.745118+00', '2025-08-10 13:47:42.745178+00', '2025-08-10 13:47:42.745178+00', 'f9ead794-d23b-4c41-9f0e-2d3cef33611c');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('8b8e9229-5bff-41b7-ae9b-ebd056d4cadd', 'e44ff3b4-c0b5-423d-8237-fbc9e1e54e25', '2025-08-18 10:14:10.646456+00', '2025-08-18 10:14:10.646456+00', NULL, 'aal1', NULL, NULL, 'node', '91.213.120.189', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('8b8e9229-5bff-41b7-ae9b-ebd056d4cadd', '2025-08-18 10:14:10.659516+00', '2025-08-18 10:14:10.659516+00', 'password', '1b26c69d-b263-4560-ba71-064efc3c3360');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 103, 'ka3ryhwua6ci', 'e44ff3b4-c0b5-423d-8237-fbc9e1e54e25', false, '2025-08-18 10:14:10.65138+00', '2025-08-18 10:14:10.65138+00', NULL, '8b8e9229-5bff-41b7-ae9b-ebd056d4cadd');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: cursos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("uid", "name", "surname", "dni", "email", "email_verified_at", "phone", "role", "image", "remember_token", "created_at", "updated_at") VALUES
	('e44ff3b4-c0b5-423d-8237-fbc9e1e54e25', 'Glroia', 'Rodriguez', '44400034J', 'gloria@gmail.com', NULL, '888999333', 'admin', NULL, NULL, '2025-08-10 11:30:17.446033+00', '2025-08-10 11:30:17.446033+00'),
	('307b9e59-c1f5-469f-b8b0-701ac6d28144', 'Jesus', 'Antonio', '87777737J', 'tumulo@gmail.com', NULL, '222333444', 'worker', NULL, NULL, '2025-08-10 10:44:37.949151+00', '2025-08-10 10:44:37.949151+00'),
	('6031fbb5-9d8c-4888-a01b-21b06d5d39d8', 'Davida', 'Luisa', '88833372J', 'luisa@gmail.com', NULL, '777333222', 'citizen', NULL, NULL, '2025-08-10 12:31:10.417975+00', '2025-08-10 12:31:10.417975+00'),
	('0576ab6c-c52d-47cc-ad7f-eb1d18b932ac', 'Davd', 'Loloj', '88823293L', 'dar44@ua.es', NULL, '999333399', 'admin', NULL, NULL, '2025-08-10 13:47:42.726573+00', '2025-08-10 13:47:42.726573+00');


--
-- Data for Name: inscripciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: recintos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 103, true);


--
-- Name: cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."cursos_id_seq"', 1, false);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."failed_jobs_id_seq"', 1, false);


--
-- Name: inscripciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."inscripciones_id_seq"', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."jobs_id_seq"', 1, false);


--
-- Name: recintos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."recintos_id_seq"', 1, false);


--
-- Name: reservas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."reservas_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
