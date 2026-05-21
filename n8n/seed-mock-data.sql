-- ================================================================
-- MOCK DATA SEED — Kita Connect
-- 3 Kitas, 3 admins, 3 teachers per Kita, 10 parents per Kita,
-- ~13-14 children per Kita (42 total), kindergarten ages 1-5
--
-- Run in Supabase SQL Editor.
-- NOTE: Auth users for parents/teachers must be created separately
-- via the portal invite flow. This script seeds profiles + children
-- for users that already exist in auth.users, OR inserts directly
-- into profiles/children using placeholder UUIDs for demo purposes.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. KITAS
-- ----------------------------------------------------------------

insert into kitas (id, name, address, city, postal_code, phone, email, max_children)
values
  ('11111111-0000-0000-0000-000000000001', 'Kita Sonnenschein',    'Gartenstraße 12',      'München',   '80331', '089 123456', 'sonnenschein@kita-connect.cloud', 50),
  ('11111111-0000-0000-0000-000000000002', 'Kita Regenbogen',      'Blumenweg 5',          'Hamburg',   '20095', '040 654321', 'regenbogen@kita-connect.cloud',   50),
  ('11111111-0000-0000-0000-000000000003', 'Kita Waldkinder',      'Waldpfad 33',          'Berlin',    '10115', '030 987654', 'waldkinder@kita-connect.cloud',   50)
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 2. ADMIN PROFILES (one per Kita — no auth.users needed for demo)
--    Using gen_random_uuid() won't work without auth users.
--    We insert with fixed UUIDs and skip auth.users FK by using
--    existing super_admin user as placeholder where needed.
--    Real admins would be invited via portal.
-- ----------------------------------------------------------------

-- We'll create profiles for parents and children only,
-- since those don't require auth.users to exist first
-- (children have parent_id FK, parents need auth.users).
--
-- SOLUTION: Insert auth.users first via Supabase admin, then profiles.
-- For this seed we use the service role workaround below.

-- ----------------------------------------------------------------
-- 3. PARENT AUTH USERS + PROFILES
--    30 parents total (10 per Kita)
--    We insert directly into auth.users using raw SQL (service role only)
-- ----------------------------------------------------------------

-- Kita Sonnenschein parents (kita_id = 11111111-...-001)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values
  ('22000001-0000-0000-0000-000000000001', 'anna.mueller@example.com',    crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Anna Müller"}'),
  ('22000001-0000-0000-0000-000000000002', 'thomas.schmidt@example.com',  crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Thomas Schmidt"}'),
  ('22000001-0000-0000-0000-000000000003', 'julia.wagner@example.com',    crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Julia Wagner"}'),
  ('22000001-0000-0000-0000-000000000004', 'markus.bauer@example.com',    crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Markus Bauer"}'),
  ('22000001-0000-0000-0000-000000000005', 'sabine.hoffmann@example.com', crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Sabine Hoffmann"}'),
  ('22000001-0000-0000-0000-000000000006', 'peter.fischer@example.com',   crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Peter Fischer"}'),
  ('22000001-0000-0000-0000-000000000007', 'maria.weber@example.com',     crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Maria Weber"}'),
  ('22000001-0000-0000-0000-000000000008', 'stefan.meyer@example.com',    crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Stefan Meyer"}'),
  ('22000001-0000-0000-0000-000000000009', 'claudia.schulz@example.com',  crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Claudia Schulz"}'),
  ('22000001-0000-0000-0000-000000000010', 'michael.lehmann@example.com', crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Michael Lehmann"}'),
-- Kita Regenbogen parents (kita_id = 11111111-...-002)
  ('22000002-0000-0000-0000-000000000001', 'lisa.braun@example.com',      crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Lisa Braun"}'),
  ('22000002-0000-0000-0000-000000000002', 'kevin.wolf@example.com',      crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Kevin Wolf"}'),
  ('22000002-0000-0000-0000-000000000003', 'sandra.neumann@example.com',  crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Sandra Neumann"}'),
  ('22000002-0000-0000-0000-000000000004', 'david.schwarz@example.com',   crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"David Schwarz"}'),
  ('22000002-0000-0000-0000-000000000005', 'petra.zimmermann@example.com',crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Petra Zimmermann"}'),
  ('22000002-0000-0000-0000-000000000006', 'frank.krueger@example.com',   crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Frank Krüger"}'),
  ('22000002-0000-0000-0000-000000000007', 'nicole.hartmann@example.com', crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Nicole Hartmann"}'),
  ('22000002-0000-0000-0000-000000000008', 'christian.lange@example.com', crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Christian Lange"}'),
  ('22000002-0000-0000-0000-000000000009', 'monika.koehler@example.com',  crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Monika Köhler"}'),
  ('22000002-0000-0000-0000-000000000010', 'andreas.richter@example.com', crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Andreas Richter"}'),
-- Kita Waldkinder parents (kita_id = 11111111-...-003)
  ('22000003-0000-0000-0000-000000000001', 'katrin.klein@example.com',    crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Katrin Klein"}'),
  ('22000003-0000-0000-0000-000000000002', 'oliver.huber@example.com',    crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Oliver Huber"}'),
  ('22000003-0000-0000-0000-000000000003', 'anja.schreiber@example.com',  crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Anja Schreiber"}'),
  ('22000003-0000-0000-0000-000000000004', 'joerg.koenig@example.com',    crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Jörg König"}'),
  ('22000003-0000-0000-0000-000000000005', 'heike.vogel@example.com',     crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Heike Vogel"}'),
  ('22000003-0000-0000-0000-000000000006', 'ralf.herrmann@example.com',   crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Ralf Herrmann"}'),
  ('22000003-0000-0000-0000-000000000007', 'birgit.jung@example.com',     crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Birgit Jung"}'),
  ('22000003-0000-0000-0000-000000000008', 'tobias.bachmann@example.com', crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Tobias Bachmann"}'),
  ('22000003-0000-0000-0000-000000000009', 'andrea.krueger@example.com',  crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Andrea Krüger"}'),
  ('22000003-0000-0000-0000-000000000010', 'christoph.roth@example.com',  crypt('Passwort123!', gen_salt('bf')), now(), now(), now(), '{"full_name":"Christoph Roth"}')
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 4. PROFILES for parents
-- ----------------------------------------------------------------

insert into profiles (id, email, full_name, role, kita_id, phone, onboarding_status, terms_accepted_at, privacy_policy_version)
values
-- Kita Sonnenschein
  ('22000001-0000-0000-0000-000000000001', 'anna.mueller@example.com',    'Anna Müller',      'parent', '11111111-0000-0000-0000-000000000001', '+491701234001', 'complete', now(), '1.0'),
  ('22000001-0000-0000-0000-000000000002', 'thomas.schmidt@example.com',  'Thomas Schmidt',   'parent', '11111111-0000-0000-0000-000000000001', '+491701234002', 'complete', now(), '1.0'),
  ('22000001-0000-0000-0000-000000000003', 'julia.wagner@example.com',    'Julia Wagner',     'parent', '11111111-0000-0000-0000-000000000001', '+491701234003', 'complete', now(), '1.0'),
  ('22000001-0000-0000-0000-000000000004', 'markus.bauer@example.com',    'Markus Bauer',     'parent', '11111111-0000-0000-0000-000000000001', '+491701234004', 'complete', now(), '1.0'),
  ('22000001-0000-0000-0000-000000000005', 'sabine.hoffmann@example.com', 'Sabine Hoffmann',  'parent', '11111111-0000-0000-0000-000000000001', '+491701234005', 'complete', now(), '1.0'),
  ('22000001-0000-0000-0000-000000000006', 'peter.fischer@example.com',   'Peter Fischer',    'parent', '11111111-0000-0000-0000-000000000001', '+491701234006', 'complete', now(), '1.0'),
  ('22000001-0000-0000-0000-000000000007', 'maria.weber@example.com',     'Maria Weber',      'parent', '11111111-0000-0000-0000-000000000001', '+491701234007', 'complete', now(), '1.0'),
  ('22000001-0000-0000-0000-000000000008', 'stefan.meyer@example.com',    'Stefan Meyer',     'parent', '11111111-0000-0000-0000-000000000001', '+491701234008', 'complete', now(), '1.0'),
  ('22000001-0000-0000-0000-000000000009', 'claudia.schulz@example.com',  'Claudia Schulz',   'parent', '11111111-0000-0000-0000-000000000001', '+491701234009', 'complete', now(), '1.0'),
  ('22000001-0000-0000-0000-000000000010', 'michael.lehmann@example.com', 'Michael Lehmann',  'parent', '11111111-0000-0000-0000-000000000001', '+491701234010', 'complete', now(), '1.0'),
-- Kita Regenbogen
  ('22000002-0000-0000-0000-000000000001', 'lisa.braun@example.com',      'Lisa Braun',       'parent', '11111111-0000-0000-0000-000000000002', '+491701234011', 'complete', now(), '1.0'),
  ('22000002-0000-0000-0000-000000000002', 'kevin.wolf@example.com',      'Kevin Wolf',       'parent', '11111111-0000-0000-0000-000000000002', '+491701234012', 'complete', now(), '1.0'),
  ('22000002-0000-0000-0000-000000000003', 'sandra.neumann@example.com',  'Sandra Neumann',   'parent', '11111111-0000-0000-0000-000000000002', '+491701234013', 'complete', now(), '1.0'),
  ('22000002-0000-0000-0000-000000000004', 'david.schwarz@example.com',   'David Schwarz',    'parent', '11111111-0000-0000-0000-000000000002', '+491701234014', 'complete', now(), '1.0'),
  ('22000002-0000-0000-0000-000000000005', 'petra.zimmermann@example.com','Petra Zimmermann', 'parent', '11111111-0000-0000-0000-000000000002', '+491701234015', 'complete', now(), '1.0'),
  ('22000002-0000-0000-0000-000000000006', 'frank.krueger@example.com',   'Frank Krüger',     'parent', '11111111-0000-0000-0000-000000000002', '+491701234016', 'complete', now(), '1.0'),
  ('22000002-0000-0000-0000-000000000007', 'nicole.hartmann@example.com', 'Nicole Hartmann',  'parent', '11111111-0000-0000-0000-000000000002', '+491701234017', 'complete', now(), '1.0'),
  ('22000002-0000-0000-0000-000000000008', 'christian.lange@example.com', 'Christian Lange',  'parent', '11111111-0000-0000-0000-000000000002', '+491701234018', 'complete', now(), '1.0'),
  ('22000002-0000-0000-0000-000000000009', 'monika.koehler@example.com',  'Monika Köhler',    'parent', '11111111-0000-0000-0000-000000000002', '+491701234019', 'complete', now(), '1.0'),
  ('22000002-0000-0000-0000-000000000010', 'andreas.richter@example.com', 'Andreas Richter',  'parent', '11111111-0000-0000-0000-000000000002', '+491701234020', 'complete', now(), '1.0'),
-- Kita Waldkinder
  ('22000003-0000-0000-0000-000000000001', 'katrin.klein@example.com',    'Katrin Klein',     'parent', '11111111-0000-0000-0000-000000000003', '+491701234021', 'complete', now(), '1.0'),
  ('22000003-0000-0000-0000-000000000002', 'oliver.huber@example.com',    'Oliver Huber',     'parent', '11111111-0000-0000-0000-000000000003', '+491701234022', 'complete', now(), '1.0'),
  ('22000003-0000-0000-0000-000000000003', 'anja.schreiber@example.com',  'Anja Schreiber',   'parent', '11111111-0000-0000-0000-000000000003', '+491701234023', 'complete', now(), '1.0'),
  ('22000003-0000-0000-0000-000000000004', 'joerg.koenig@example.com',    'Jörg König',       'parent', '11111111-0000-0000-0000-000000000003', '+491701234024', 'complete', now(), '1.0'),
  ('22000003-0000-0000-0000-000000000005', 'heike.vogel@example.com',     'Heike Vogel',      'parent', '11111111-0000-0000-0000-000000000003', '+491701234025', 'complete', now(), '1.0'),
  ('22000003-0000-0000-0000-000000000006', 'ralf.herrmann@example.com',   'Ralf Herrmann',    'parent', '11111111-0000-0000-0000-000000000003', '+491701234026', 'complete', now(), '1.0'),
  ('22000003-0000-0000-0000-000000000007', 'birgit.jung@example.com',     'Birgit Jung',      'parent', '11111111-0000-0000-0000-000000000003', '+491701234027', 'complete', now(), '1.0'),
  ('22000003-0000-0000-0000-000000000008', 'tobias.bachmann@example.com', 'Tobias Bachmann',  'parent', '11111111-0000-0000-0000-000000000003', '+491701234028', 'complete', now(), '1.0'),
  ('22000003-0000-0000-0000-000000000009', 'andrea.krueger@example.com',  'Andrea Krüger',    'parent', '11111111-0000-0000-0000-000000000003', '+491701234029', 'complete', now(), '1.0'),
  ('22000003-0000-0000-0000-000000000010', 'christoph.roth@example.com',  'Christoph Roth',   'parent', '11111111-0000-0000-0000-000000000003', '+491701234030', 'complete', now(), '1.0')
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 5. CHILDREN
-- Ages 1-5 (born 2020-2024), ~14 per Kita = 42 total
-- Groups: Schmetterlinge (3-5y), Sonnenkinder (2-3y), Krümelmonster (1-2y)
-- ----------------------------------------------------------------

insert into children (id, parent_id, name, birth_date, group_name, kita_id, photo_consent, dietary_notes, allergies, emergency_contact)
values

-- ===== KITA SONNENSCHEIN =====
-- Gruppe Schmetterlinge (3-5 Jahre, born 2020-2022)
('33000001-0000-0000-0000-000000000001', '22000001-0000-0000-0000-000000000001', 'Lena Müller',      '2021-03-14', 'Schmetterlinge', '11111111-0000-0000-0000-000000000001', true,  null,           null,       'Oma Ingrid Müller +4915112340001'),
('33000001-0000-0000-0000-000000000002', '22000001-0000-0000-0000-000000000002', 'Felix Schmidt',    '2020-07-22', 'Schmetterlinge', '11111111-0000-0000-0000-000000000001', true,  'vegetarisch',  null,       'Oma Helga Schmidt +4915112340002'),
('33000001-0000-0000-0000-000000000003', '22000001-0000-0000-0000-000000000003', 'Emma Wagner',      '2021-11-05', 'Schmetterlinge', '11111111-0000-0000-0000-000000000001', false, null,           'Nüsse',    'Tante Petra Wagner +4915112340003'),
('33000001-0000-0000-0000-000000000004', '22000001-0000-0000-0000-000000000004', 'Noah Bauer',       '2020-02-18', 'Schmetterlinge', '11111111-0000-0000-0000-000000000001', true,  'halal',        null,       'Opa Klaus Bauer +4915112340004'),
('33000001-0000-0000-0000-000000000005', '22000001-0000-0000-0000-000000000005', 'Mia Hoffmann',     '2022-06-30', 'Schmetterlinge', '11111111-0000-0000-0000-000000000001', true,  null,           'Laktose',  'Vater Lars Hoffmann +4915112340005'),
-- Gruppe Sonnenkinder (2-3 Jahre, born 2022-2023)
('33000001-0000-0000-0000-000000000006', '22000001-0000-0000-0000-000000000006', 'Paul Fischer',     '2022-09-12', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000001', true,  null,           null,       'Mutter Silke Fischer +4915112340006'),
('33000001-0000-0000-0000-000000000007', '22000001-0000-0000-0000-000000000007', 'Sophie Weber',     '2023-01-08', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000001', true,  'vegan',        null,       'Oma Ruth Weber +4915112340007'),
('33000001-0000-0000-0000-000000000008', '22000001-0000-0000-0000-000000000008', 'Luis Meyer',       '2022-04-25', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000001', false, null,           null,       'Vater Hans Meyer +4915112340008'),
('33000001-0000-0000-0000-000000000009', '22000001-0000-0000-0000-000000000009', 'Hannah Schulz',    '2023-08-17', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000001', true,  null,           'Eier',     'Oma Ute Schulz +4915112340009'),
-- Gruppe Krümelmonster (1-2 Jahre, born 2023-2024)
('33000001-0000-0000-0000-000000000010', '22000001-0000-0000-0000-000000000010', 'Jonas Lehmann',    '2023-11-03', 'Krümelmonster',  '11111111-0000-0000-0000-000000000001', true,  null,           null,       'Mutter Gabi Lehmann +4915112340010'),
('33000001-0000-0000-0000-000000000011', '22000001-0000-0000-0000-000000000001', 'Lea Müller',       '2024-02-14', 'Krümelmonster',  '11111111-0000-0000-0000-000000000001', true,  null,           null,       'Oma Ingrid Müller +4915112340001'),
('33000001-0000-0000-0000-000000000012', '22000001-0000-0000-0000-000000000003', 'Tom Wagner',       '2023-05-20', 'Krümelmonster',  '11111111-0000-0000-0000-000000000001', false, 'vegetarisch',  null,       'Tante Petra Wagner +4915112340003'),
('33000001-0000-0000-0000-000000000013', '22000001-0000-0000-0000-000000000006', 'Marie Fischer',    '2024-01-09', 'Krümelmonster',  '11111111-0000-0000-0000-000000000001', true,  null,           null,       'Mutter Silke Fischer +4915112340006'),
('33000001-0000-0000-0000-000000000014', '22000001-0000-0000-0000-000000000009', 'Ben Schulz',       '2023-09-28', 'Krümelmonster',  '11111111-0000-0000-0000-000000000001', true,  null,           'Gluten',   'Oma Ute Schulz +4915112340009'),

-- ===== KITA REGENBOGEN =====
-- Gruppe Schmetterlinge
('33000002-0000-0000-0000-000000000001', '22000002-0000-0000-0000-000000000001', 'Ella Braun',       '2021-04-16', 'Schmetterlinge', '11111111-0000-0000-0000-000000000002', true,  null,           null,       'Opa Dieter Braun +4915112340011'),
('33000002-0000-0000-0000-000000000002', '22000002-0000-0000-0000-000000000002', 'Max Wolf',         '2020-08-11', 'Schmetterlinge', '11111111-0000-0000-0000-000000000002', true,  'halal',        null,       'Mutter Sabine Wolf +4915112340012'),
('33000002-0000-0000-0000-000000000003', '22000002-0000-0000-0000-000000000003', 'Lilly Neumann',    '2021-12-03', 'Schmetterlinge', '11111111-0000-0000-0000-000000000002', true,  null,           'Nüsse',    'Vater Klaus Neumann +4915112340013'),
('33000002-0000-0000-0000-000000000004', '22000002-0000-0000-0000-000000000004', 'Leon Schwarz',     '2020-03-27', 'Schmetterlinge', '11111111-0000-0000-0000-000000000002', false, null,           null,       'Oma Maria Schwarz +4915112340014'),
('33000002-0000-0000-0000-000000000005', '22000002-0000-0000-0000-000000000005', 'Amelie Zimmermann','2022-07-19', 'Schmetterlinge', '11111111-0000-0000-0000-000000000002', true,  'vegan',        'Laktose',  'Vater Bernd Zimmermann +4915112340015'),
-- Gruppe Sonnenkinder
('33000002-0000-0000-0000-000000000006', '22000002-0000-0000-0000-000000000006', 'Nico Krüger',      '2022-10-05', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000002', true,  null,           null,       'Mutter Andrea Krüger +4915112340016'),
('33000002-0000-0000-0000-000000000007', '22000002-0000-0000-0000-000000000007', 'Emilia Hartmann',  '2023-02-22', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000002', true,  null,           null,       'Opa Werner Hartmann +4915112340017'),
('33000002-0000-0000-0000-000000000008', '22000002-0000-0000-0000-000000000008', 'Finn Lange',       '2022-05-14', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000002', true,  'vegetarisch',  null,       'Oma Lisa Lange +4915112340018'),
('33000002-0000-0000-0000-000000000009', '22000002-0000-0000-0000-000000000009', 'Clara Köhler',     '2023-09-01', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000002', false, null,           'Erdbeeren','Vater Dirk Köhler +4915112340019'),
-- Gruppe Krümelmonster
('33000002-0000-0000-0000-000000000010', '22000002-0000-0000-0000-000000000010', 'Lukas Richter',    '2023-12-07', 'Krümelmonster',  '11111111-0000-0000-0000-000000000002', true,  null,           null,       'Mutter Eva Richter +4915112340020'),
('33000002-0000-0000-0000-000000000011', '22000002-0000-0000-0000-000000000001', 'Hanna Braun',      '2024-03-18', 'Krümelmonster',  '11111111-0000-0000-0000-000000000002', true,  null,           null,       'Opa Dieter Braun +4915112340011'),
('33000002-0000-0000-0000-000000000012', '22000002-0000-0000-0000-000000000004', 'Tim Schwarz',      '2023-06-25', 'Krümelmonster',  '11111111-0000-0000-0000-000000000002', true,  null,           null,       'Oma Maria Schwarz +4915112340014'),
('33000002-0000-0000-0000-000000000013', '22000002-0000-0000-0000-000000000007', 'Mila Hartmann',    '2024-01-30', 'Krümelmonster',  '11111111-0000-0000-0000-000000000002', true,  'vegan',        null,       'Opa Werner Hartmann +4915112340017'),
('33000002-0000-0000-0000-000000000014', '22000002-0000-0000-0000-000000000009', 'Ben Köhler',       '2023-10-12', 'Krümelmonster',  '11111111-0000-0000-0000-000000000002', false, null,           null,       'Vater Dirk Köhler +4915112340019'),

-- ===== KITA WALDKINDER =====
-- Gruppe Schmetterlinge
('33000003-0000-0000-0000-000000000001', '22000003-0000-0000-0000-000000000001', 'Laura Klein',      '2021-05-09', 'Schmetterlinge', '11111111-0000-0000-0000-000000000003', true,  null,           null,       'Opa Heinz Klein +4915112340021'),
('33000003-0000-0000-0000-000000000002', '22000003-0000-0000-0000-000000000002', 'Elias Huber',      '2020-09-23', 'Schmetterlinge', '11111111-0000-0000-0000-000000000003', true,  'vegetarisch',  null,       'Oma Gerda Huber +4915112340022'),
('33000003-0000-0000-0000-000000000003', '22000003-0000-0000-0000-000000000003', 'Nora Schreiber',   '2022-01-15', 'Schmetterlinge', '11111111-0000-0000-0000-000000000003', true,  null,           'Nüsse',    'Vater Hans Schreiber +4915112340023'),
('33000003-0000-0000-0000-000000000004', '22000003-0000-0000-0000-000000000004', 'Moritz König',     '2020-04-07', 'Schmetterlinge', '11111111-0000-0000-0000-000000000003', false, 'halal',        null,       'Mutter Fatma König +4915112340024'),
('33000003-0000-0000-0000-000000000005', '22000003-0000-0000-0000-000000000005', 'Ida Vogel',        '2022-08-21', 'Schmetterlinge', '11111111-0000-0000-0000-000000000003', true,  null,           'Laktose',  'Oma Hilde Vogel +4915112340025'),
-- Gruppe Sonnenkinder
('33000003-0000-0000-0000-000000000006', '22000003-0000-0000-0000-000000000006', 'Emil Herrmann',    '2022-11-13', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000003', true,  null,           null,       'Mutter Claudia Herrmann +4915112340026'),
('33000003-0000-0000-0000-000000000007', '22000003-0000-0000-0000-000000000007', 'Frieda Jung',      '2023-03-04', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000003', true,  'vegan',        null,       'Vater Stefan Jung +4915112340027'),
('33000003-0000-0000-0000-000000000008', '22000003-0000-0000-0000-000000000008', 'Anton Bachmann',   '2022-06-18', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000003', true,  null,           null,       'Oma Erika Bachmann +4915112340028'),
('33000003-0000-0000-0000-000000000009', '22000003-0000-0000-0000-000000000009', 'Rosa Krüger',      '2023-10-29', 'Sonnenkinder',   '11111111-0000-0000-0000-000000000003', true,  null,           'Gluten',   'Vater Bernd Krüger +4915112340029'),
-- Gruppe Krümelmonster
('33000003-0000-0000-0000-000000000010', '22000003-0000-0000-0000-000000000010', 'Oscar Roth',       '2024-01-21', 'Krümelmonster',  '11111111-0000-0000-0000-000000000003', true,  null,           null,       'Mutter Susi Roth +4915112340030'),
('33000003-0000-0000-0000-000000000011', '22000003-0000-0000-0000-000000000002', 'Mathilda Huber',   '2023-07-11', 'Krümelmonster',  '11111111-0000-0000-0000-000000000003', true,  'vegetarisch',  null,       'Oma Gerda Huber +4915112340022'),
('33000003-0000-0000-0000-000000000012', '22000003-0000-0000-0000-000000000005', 'Karl Vogel',       '2024-04-02', 'Krümelmonster',  '11111111-0000-0000-0000-000000000003', false, null,           null,       'Oma Hilde Vogel +4915112340025'),
('33000003-0000-0000-0000-000000000013', '22000003-0000-0000-0000-000000000007', 'Greta Jung',       '2023-08-16', 'Krümelmonster',  '11111111-0000-0000-0000-000000000003', true,  'vegan',        null,       'Vater Stefan Jung +4915112340027'),
('33000003-0000-0000-0000-000000000014', '22000003-0000-0000-0000-000000000010', 'Bruno Roth',       '2024-02-28', 'Krümelmonster',  '11111111-0000-0000-0000-000000000003', true,  null,           null,       'Mutter Susi Roth +4915112340030')
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- SUMMARY
-- Kita Sonnenschein (München):  10 parents, 14 children
-- Kita Regenbogen (Hamburg):    10 parents, 14 children
-- Kita Waldkinder (Berlin):     10 parents, 14 children
-- Total: 30 parents, 42 children
-- Groups per Kita: Schmetterlinge (5 kids), Sonnenkinder (4 kids), Krümelmonster (5 kids)
-- Age range: 1-5 years (born 2020-2024)
-- All passwords: Passwort123!
-- ----------------------------------------------------------------
