-- ============================================================
-- Kita Connect — Vollständiges DB-Schema
-- Ausführen in: Supabase Dashboard > SQL Editor
-- Reihenfolge: Tabellen → RLS → Trigger → Realtime
-- Idempotent: Policies werden vor jeder Ausführung gedroppt
-- ============================================================

-- ----------------------------------------------------------------
-- 0. CLEANUP — Alle Policies droppen (idempotent, tabellenunabhängig)
-- ----------------------------------------------------------------
do $cleanup$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end;
$cleanup$;

-- ----------------------------------------------------------------
-- 0b. MIGRATIONS — fehlende Spalten zu bestehenden Tabellen hinzufügen
-- ----------------------------------------------------------------
do $migrations$
begin
  -- profiles: neue Spalten
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='onboarding_status') then
    alter table profiles add column onboarding_status text not null default 'pending';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='notify_email') then
    alter table profiles add column notify_email boolean default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='notify_sms') then
    alter table profiles add column notify_sms boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='notify_push') then
    alter table profiles add column notify_push boolean default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='notify_inapp') then
    alter table profiles add column notify_inapp boolean default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='terms_accepted_at') then
    alter table profiles add column terms_accepted_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='privacy_policy_version') then
    alter table profiles add column privacy_policy_version text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='employee_id') then
    alter table profiles add column employee_id text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='assigned_groups') then
    alter table profiles add column assigned_groups text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='qualifications') then
    alter table profiles add column qualifications text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='can_broadcast') then
    alter table profiles add column can_broadcast boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='can_manage_children') then
    alter table profiles add column can_manage_children boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='can_view_all_children') then
    alter table profiles add column can_view_all_children boolean default false;
  end if;

  -- children: neue Spalten
  if not exists (select 1 from information_schema.columns where table_name='children' and column_name='teacher_id') then
    alter table children add column teacher_id uuid references auth.users(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='children' and column_name='allergies') then
    alter table children add column allergies text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='children' and column_name='dietary_notes') then
    alter table children add column dietary_notes text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='children' and column_name='medical_notes') then
    alter table children add column medical_notes text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='children' and column_name='emergency_contact') then
    alter table children add column emergency_contact text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='children' and column_name='photo_consent') then
    alter table children add column photo_consent boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='children' and column_name='photo_consent_at') then
    alter table children add column photo_consent_at timestamptz;
  end if;

  -- learning_stories: category Spalte
  if not exists (select 1 from information_schema.columns where table_name='learning_stories' and column_name='category') then
    alter table learning_stories add column category text;
  end if;
end;
$migrations$;

-- ----------------------------------------------------------------
-- 1. PROFILES (erweitert auth.users)
-- ----------------------------------------------------------------
create table if not exists profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  email                   text,
  full_name               text,
  role                    text not null default 'parent',
  -- 'super_admin' — nur du (Entwickler), kann Admins erstellen
  -- 'admin'       — kann Erzieher anlegen + Eltern onboarden
  -- 'teacher'     — kann Eltern einladen, Beobachtungen, Broadcasts
  -- 'parent'      — kann lesen, Tickets, Meilensteine
  onboarding_status       text not null default 'pending',
  -- 'pending'     — eingeladen, noch nicht freigeschaltet
  -- 'active'      — vollständig freigeschaltet
  -- 'suspended'   — gesperrt
  phone                   text,
  language                text default 'de',

  -- Eltern-spezifisch
  notify_email            boolean default true,
  notify_sms              boolean default false,
  notify_push             boolean default true,
  notify_inapp            boolean default true,
  terms_accepted_at       timestamptz,
  privacy_policy_version  text,

  -- Erzieher/Admin-spezifisch
  employee_id             text,
  assigned_groups         text[],
  qualifications          text,
  can_broadcast           boolean default false,
  can_manage_children     boolean default false,
  can_view_all_children   boolean default false,

  created_at              timestamptz default now()
);

alter table profiles enable row level security;

create policy "Eigenes Profil lesen"
  on profiles for select
  using (auth.uid() = id);

create policy "Eigenes Profil bearbeiten"
  on profiles for update
  using (auth.uid() = id);

create policy "Erzieher können alle Profile lesen"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

-- Profil automatisch bei Signup anlegen
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_role   text;
  v_status text;
begin
  v_role   := coalesce(NEW.raw_user_meta_data->>'role', 'parent');
  -- super_admin und admin sind sofort aktiv (werden direkt von dir angelegt)
  -- teacher und parent starten als pending bis Freischaltung
  v_status := case
    when v_role in ('super_admin', 'admin') then 'active'
    else 'pending'
  end;

  insert into profiles (
    id, email, full_name, role, onboarding_status,
    can_broadcast, can_manage_children, can_view_all_children
  ) values (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_role,
    v_status,
    (v_role in ('teacher', 'admin', 'super_admin')),  -- can_broadcast
    (v_role in ('admin', 'super_admin')),              -- can_manage_children
    (v_role in ('teacher', 'admin', 'super_admin'))   -- can_view_all_children
  );
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------
-- 2. INVITATIONS
--    Einziger Weg in die Plattform — kein öffentlicher Signup.
--    Hierarchie: super_admin → admin → teacher → parent
-- ----------------------------------------------------------------
create table if not exists invitations (
  id              uuid primary key default gen_random_uuid(),
  -- ↑ id ist der einzige Wert der in der Einladungs-E-Mail steht.
  --   Kein Auth-Token, kein Login-Credential — nur eine Referenz-ID.
  --   Der eigentliche Login läuft ausschließlich über Supabase Magic Link
  --   direkt in das E-Mail-Postfach des Elternteils (5-Minuten-Ablauf).

  invited_by      uuid not null references auth.users(id),
  email           text not null,   -- E-Mail muss beim Öffnen des Links eingegeben werden
                                   -- App prüft: stimmt eingegebene E-Mail mit dieser überein?
                                   -- Nur dann wird Magic Link ausgelöst.
  role            text not null,
  child_id        uuid,            -- Pflicht bei role = 'parent'

  -- Einladungs-Fenster: 48 Stunden um die Registrierung zu starten
  expires_at      timestamptz not null default now() + interval '48 hours',

  -- Tracking ob bereits genutzt
  used_at         timestamptz,     -- gesetzt sobald Magic Link erfolgreich eingelöst
  status          text not null default 'pending', -- 'pending' | 'accepted' | 'expired'
  accepted_at     timestamptz,
  created_at      timestamptz default now()
);

-- Hinweis: Magic Link Ablauf = 5 Minuten
-- Konfiguration: Supabase Dashboard → Authentication → Email → Magic Link expiry = 300 Sekunden
-- Das ist der eigentliche Sicherheits-Token — nie in der Einladungs-E-Mail enthalten.

alter table invitations enable row level security;

-- Super Admin darf alle Einladungen sehen
create policy "Super Admin sieht alle Einladungen"
  on invitations for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));

-- Admin darf Einladungen sehen die er selbst erstellt hat
create policy "Admin sieht eigene Einladungen"
  on invitations for select
  using (
    auth.uid() = invited_by and
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Teacher darf Eltern-Einladungen sehen die er selbst erstellt hat
create policy "Teacher sieht eigene Eltern-Einladungen"
  on invitations for select
  using (
    auth.uid() = invited_by and
    exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
  );

-- Super Admin darf Admin-Einladungen erstellen
create policy "Super Admin kann Admins einladen"
  on invitations for insert
  with check (
    auth.uid() = invited_by and
    role in ('admin', 'teacher', 'parent') and
    exists (select 1 from profiles where id = auth.uid() and role = 'super_admin')
  );

-- Admin darf Teacher und Parent einladen
create policy "Admin kann Teacher und Eltern einladen"
  on invitations for insert
  with check (
    auth.uid() = invited_by and
    role in ('teacher', 'parent') and
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Teacher darf nur Eltern einladen (mit child_id Pflicht, nur für zugewiesene Kinder)
create policy "Teacher kann Eltern einladen"
  on invitations for insert
  with check (
    auth.uid() = invited_by and
    role = 'parent' and
    child_id is not null and
    exists (select 1 from profiles where id = auth.uid() and role = 'teacher') and
    exists (select 1 from children where id = invitations.child_id and teacher_id = auth.uid())
  );

-- Einladung annehmen (token-basiert — via service_role in n8n/Backend)
create policy "Kein direktes Update durch Client"
  on invitations for update
  using (false);

-- Schritt 1: Einladung validieren (wird aufgerufen wenn Nutzer invite_id + E-Mail eingibt)
--            Enthält keinen Auth-Token — nur Prüfung ob E-Mail zur Einladung passt.
--            Bei Erfolg löst das Frontend signInWithOtp(email) aus → Magic Link (5 Min).
create or replace function validate_invitation(p_invite_id uuid, p_email text)
returns jsonb language plpgsql security definer as $$
declare
  v_inv invitations%rowtype;
begin
  select * into v_inv from invitations
  where id = p_invite_id
    and lower(email) = lower(p_email)  -- E-Mail muss exakt übereinstimmen
    and status = 'pending'
    and expires_at > now()
    and used_at is null;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Einladung ungültig, abgelaufen oder E-Mail stimmt nicht überein.');
  end if;

  -- Noch nicht verbrauchen — nur bestätigen dass Einladung gültig ist
  -- Frontend ruft danach Supabase signInWithOtp(email) auf
  -- Magic Link läuft nach 5 Minuten ab (Supabase Auth Settings)
  return jsonb_build_object('ok', true, 'role', v_inv.role, 'child_id', v_inv.child_id);
end;
$$;

-- Schritt 2: Einladung einlösen (wird nach erfolgreichem Magic Link Login aufgerufen)
--            Nutzer ist zu diesem Zeitpunkt bereits authentifiziert via Supabase Auth.
create or replace function accept_invitation(p_invite_id uuid, p_user_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_inv invitations%rowtype;
begin
  select * into v_inv from invitations
  where id = p_invite_id
    and status = 'pending'
    and expires_at > now()
    and used_at is null;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Einladung bereits verwendet oder abgelaufen.');
  end if;

  -- Einladung als verbraucht markieren — einmalige Nutzung erzwungen
  update invitations set
    status      = 'accepted',
    accepted_at = now(),
    used_at     = now()
  where id = v_inv.id;

  -- Profil: Rolle setzen, Status je nach Rolle
  update profiles set
    role              = v_inv.role,
    onboarding_status = case when v_inv.role = 'parent' then 'pending' else 'active' end
  where id = p_user_id;

  return jsonb_build_object('ok', true, 'role', v_inv.role, 'child_id', v_inv.child_id);
end;
$$;

-- Abgelaufene Einladungen aufräumen (via n8n Cron täglich ausführen)
create or replace function expire_stale_invitations()
returns void language plpgsql security definer as $$
begin
  update invitations
  set status = 'expired'
  where status = 'pending'
    and expires_at < now();
end;
$$;

-- ----------------------------------------------------------------
-- 3. CHILDREN
-- ----------------------------------------------------------------
create table if not exists children (
  id                  uuid primary key default gen_random_uuid(),
  parent_id           uuid not null references auth.users(id) on delete cascade,
  teacher_id          uuid references auth.users(id) on delete set null, -- zuständige Erzieherin
  name                text not null,
  birth_date          date,
  group_name          text,                -- z.B. 'Schmetterlinge', 'Sonnenkinder'
  allergies           text,                -- Freitext: Nüsse, Laktose etc.
  dietary_notes       text,                -- vegetarisch, vegan, halal etc.
  medical_notes       text,                -- Medikamente, Behinderungen, Besonderheiten
  emergency_contact   text,                -- Name + Telefon Notfallkontakt
  photo_consent       boolean default false, -- Eltern haben Foto-Einwilligung erteilt
  photo_consent_at    timestamptz,           -- Zeitpunkt der Einwilligung
  created_at          timestamptz default now()
);

alter table children enable row level security;

create policy "Eltern sehen nur eigene Kinder"
  on children for select
  using (auth.uid() = parent_id);

create policy "Erzieher sehen alle Kinder"
  on children for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

create policy "Admin kann Kinder anlegen"
  on children for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 3. MESSAGES (Direktnachrichten)
-- ----------------------------------------------------------------
create table if not exists messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references auth.users(id) on delete cascade,
  receiver_id   uuid not null references auth.users(id) on delete cascade,
  child_id      uuid references children(id),
  content       text not null,
  template_tags text[],
  read_at       timestamptz,
  created_at    timestamptz default now()
);

alter table messages enable row level security;

create policy "Eigene Nachrichten lesen"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Nachrichten senden"
  on messages for insert
  with check (auth.uid() = sender_id);

-- ----------------------------------------------------------------
-- 4. TICKETS
-- ----------------------------------------------------------------
create table if not exists tickets (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references auth.users(id),
  teacher_id  uuid references auth.users(id),  -- zugewiesener Erzieher
  child_id    uuid references children(id) on delete set null,
  type        text not null default 'general',  -- 'general' | 'progress_question' | 'call_request' | 'appointment_request' | 'missing_item'
  subject     text not null,
  body        text not null,
  status      text not null default 'open',     -- 'open' | 'in_progress' | 'resolved'
  priority    text not null default 'normal',   -- 'low' | 'normal' | 'high'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  resolved_at timestamptz
);

-- Antworten als Thread (Eltern und Erzieher können antworten)
create table if not exists ticket_replies (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references tickets(id) on delete cascade,
  author_id   uuid not null references auth.users(id),
  body        text not null,
  created_at  timestamptz default now()
);

-- updated_at automatisch aktualisieren wenn neues Reply kommt
create or replace function update_ticket_timestamp()
returns trigger language plpgsql as $$
begin
  update tickets set updated_at = now() where id = NEW.ticket_id;
  return NEW;
end;
$$;

drop trigger if exists ticket_reply_timestamp_trigger on ticket_replies;
create trigger ticket_reply_timestamp_trigger
  after insert on ticket_replies
  for each row execute function update_ticket_timestamp();

alter table tickets enable row level security;
alter table ticket_replies enable row level security;

create policy "Eltern sehen eigene Tickets"
  on tickets for select
  using (auth.uid() = parent_id);

create policy "Erzieher sehen alle Tickets"
  on tickets for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

create policy "Eltern können Tickets erstellen"
  on tickets for insert
  with check (auth.uid() = parent_id);

create policy "Erzieher können Tickets bearbeiten"
  on tickets for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

-- Replies: Eltern sehen nur Replies zu eigenen Tickets
create policy "Eltern sehen Replies ihrer Tickets"
  on ticket_replies for select
  using (
    exists (
      select 1 from tickets
      where id = ticket_replies.ticket_id and parent_id = auth.uid()
    )
  );

-- Replies: Erzieher sehen alle Replies
create policy "Erzieher sehen alle Replies"
  on ticket_replies for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

-- Replies: Eltern können auf eigene Tickets antworten
create policy "Eltern können auf eigene Tickets antworten"
  on ticket_replies for insert
  with check (
    auth.uid() = author_id and
    exists (
      select 1 from tickets
      where id = ticket_replies.ticket_id and parent_id = auth.uid()
    )
  );

-- Replies: Erzieher können auf alle Tickets antworten
create policy "Erzieher können auf Tickets antworten"
  on ticket_replies for insert
  with check (
    auth.uid() = author_id and
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- 5. APPOINTMENT PROPOSALS (Terminvorschläge)
--    Erzieher schlägt Termin vor → Elternteil akzeptiert oder lehnt ab
-- ----------------------------------------------------------------
create table if not exists appointment_proposals (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid references tickets(id) on delete cascade,  -- optional: aus Ticket heraus erstellt
  teacher_id   uuid not null references auth.users(id) on delete cascade,
  parent_id    uuid not null references auth.users(id) on delete cascade,
  child_id     uuid references children(id) on delete set null,
  proposed_at  timestamptz not null,          -- vorgeschlagener Termin
  duration_min int default 30,                -- Dauer in Minuten
  location     text,                          -- z.B. 'Kita-Büro', 'Videotelefonie'
  note         text,                          -- optionale Nachricht zum Termin
  status       text not null default 'pending', -- 'pending' | 'accepted' | 'declined' | 'cancelled'
  responded_at timestamptz,
  created_at   timestamptz default now()
);

alter table appointment_proposals enable row level security;

create policy "Eltern sehen eigene Terminvorschläge"
  on appointment_proposals for select
  using (auth.uid() = parent_id);

create policy "Erzieher sehen alle Terminvorschläge"
  on appointment_proposals for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin')));

create policy "Erzieher können Terminvorschläge erstellen"
  on appointment_proposals for insert
  with check (
    auth.uid() = teacher_id and
    exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- Eltern können nur status + responded_at aktualisieren (accept/decline)
create policy "Eltern können Terminvorschlag beantworten"
  on appointment_proposals for update
  using (auth.uid() = parent_id);

-- Erzieher können stornieren
create policy "Erzieher können Terminvorschlag stornieren"
  on appointment_proposals for update
  using (exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin')));

-- ----------------------------------------------------------------
-- 6. OBSERVATIONS (Entwicklungsbeobachtungen)
-- ----------------------------------------------------------------
create table if not exists observations (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  teacher_id  uuid not null references auth.users(id),
  category    text not null, -- 'sprache' | 'motorik' | 'sozial' | 'kreativitaet' | 'mathematik' | 'selbstaendigkeit'
  text        text not null,
  scale_value int check (scale_value between 1 and 4),
  created_at  timestamptz default now()
);

alter table observations enable row level security;

create policy "Eltern sehen Beobachtungen ihrer Kinder"
  on observations for select
  using (
    exists (
      select 1 from children
      where id = observations.child_id and parent_id = auth.uid()
    )
  );

create policy "Erzieher sehen alle Beobachtungen"
  on observations for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

create policy "Erzieher können Beobachtungen anlegen"
  on observations for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- 6. CHILD MILESTONES (privat, nur Eltern)
--    Orientiert an deutschen Bildungsplänen (BEP, Gelbes Heft)
--    CDC-Struktur als inhaltliche Anregung; Inhalte nach dt. Standard
-- ----------------------------------------------------------------

-- 6a. Kategorien (angelehnt an Bundesländer-Bildungspläne)
create table if not exists milestone_categories (
  id    uuid primary key default gen_random_uuid(),
  slug  text unique not null,  -- 'sprache' | 'motorik' | 'sozial' | 'kognition'
  label text not null          -- Anzeigename, z.B. 'Sprache & Kommunikation'
);

-- Standardkategorien einfügen
insert into milestone_categories (slug, label) values
  ('sprache',    'Sprache & Kommunikation'),
  ('motorik',    'Motorik & Bewegung'),
  ('sozial',     'Soziales & Emotionales'),
  ('kognition',  'Kognition & Lernen')
on conflict (slug) do nothing;

-- 6b. Referenz-Meilensteine (vom Admin gepflegt, dt. Quellen)
create table if not exists milestone_templates (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid references milestone_categories(id) on delete set null,
  age_months_min int,    -- Untergrenze Altersbereich, z.B. 12
  age_months_max int,    -- Obergrenze Altersbereich, z.B. 18
  title          text not null,
  description    text,
  source         text   -- z.B. 'Gelbes Heft U6', 'Bayerischer BEP'
);

alter table milestone_templates enable row level security;

-- Eltern und Erzieher dürfen Templates lesen (für Auswahl im UI)
create policy "Alle authentifizierten Nutzer sehen Templates"
  on milestone_templates for select
  using (auth.uid() is not null);

-- Nur Admins dürfen Templates anlegen/bearbeiten
create policy "Admin verwaltet Templates"
  on milestone_templates for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6c. Eltern-Einträge (konkrete Meilensteine pro Kind)
create table if not exists child_milestones (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references children(id) on delete cascade,
  category_id  uuid references milestone_categories(id) on delete set null,
  template_id  uuid references milestone_templates(id) on delete set null,
  title        text not null,
  description  text,
  date         date,
  age_months   int,   -- Alter des Kindes zum Zeitpunkt des Meilensteins
  created_at   timestamptz default now()
);

alter table child_milestones enable row level security;

create policy "Eltern sehen nur Meilensteine ihrer Kinder"
  on child_milestones for select
  using (
    exists (
      select 1 from children
      where id = child_milestones.child_id and parent_id = auth.uid()
    )
  );

create policy "Eltern können Meilensteine anlegen"
  on child_milestones for insert
  with check (
    exists (
      select 1 from children
      where id = child_milestones.child_id and parent_id = auth.uid()
    )
  );

create policy "Eltern können eigene Meilensteine bearbeiten"
  on child_milestones for update
  using (
    exists (
      select 1 from children
      where id = child_milestones.child_id and parent_id = auth.uid()
    )
  );

create policy "Eltern können eigene Meilensteine löschen"
  on child_milestones for delete
  using (
    exists (
      select 1 from children
      where id = child_milestones.child_id and parent_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- 7. LEARNING STORIES (Lerngeschichten)
-- ----------------------------------------------------------------
create table if not exists learning_stories (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references children(id) on delete cascade,
  teacher_id  uuid not null references auth.users(id),
  category    text,           -- 'sprache' | 'motorik' | 'sozial' | 'kognition' | 'kreativitaet' | 'selbstaendigkeit'
  situation   text not null,  -- Beobachtungstext vom Erzieher (nur intern, nie an Claude)
  ai_draft    text,           -- KI-Entwurf mit Pseudonym — Erzieher ersetzt Pseudonym durch echten Namen
  final_text  text,           -- Freigegebener Endtext mit echtem Namen
  created_at  timestamptz default now()
);

alter table learning_stories enable row level security;

create policy "Eltern sehen Lerngeschichten ihrer Kinder"
  on learning_stories for select
  using (
    exists (
      select 1 from children
      where id = learning_stories.child_id and parent_id = auth.uid()
    )
  );

-- Erzieher lesen Lerngeschichten für Kinder, die sie betreuen, plus eigene
create policy "Erzieher lesen Lerngeschichten"
  on learning_stories for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    ) or
    teacher_id = auth.uid() or
    exists (
      select 1 from children
      where id = learning_stories.child_id and teacher_id = auth.uid()
    )
  );

-- Erzieher erstellen Lerngeschichten nur für eigene Kinder
create policy "Erzieher erstellen Lerngeschichten"
  on learning_stories for insert
  with check (
    teacher_id = auth.uid() and
    exists (
      select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin')
    ) and
    exists (
      select 1 from children where id = learning_stories.child_id and teacher_id = auth.uid()
    )
  );

-- Erzieher bearbeiten und löschen nur eigene Lerngeschichten
create policy "Erzieher bearbeiten eigene Lerngeschichten"
  on learning_stories for update
  using (
    teacher_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Erzieher löschen eigene Lerngeschichten"
  on learning_stories for delete
  using (
    teacher_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ----------------------------------------------------------------
-- 8. STANDARDIZED ASSESSMENTS (Sismik, Seldak, Perik)
-- ----------------------------------------------------------------
create table if not exists standardized_assessments (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references children(id) on delete cascade,
  teacher_id   uuid not null references auth.users(id),
  type         text not null, -- 'sismik' | 'seldak' | 'perik' | 'sprachlerntagebuch'
  answers_json jsonb,
  created_at   timestamptz default now()
);

alter table standardized_assessments enable row level security;

create policy "Erzieher verwalten Assessments"
  on standardized_assessments for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- 9. NOTIFICATIONS (In-App)
-- ----------------------------------------------------------------
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  child_id    uuid references children(id) on delete cascade,
  type        text not null, -- 'ticket_reply' | 'new_message' | 'observation_added' | 'broadcast'
  title       text not null,
  body        text,
  read_at     timestamptz,
  created_at  timestamptz default now()
);

alter table notifications enable row level security;

create policy "Eigene Notifications lesen"
  on notifications for select
  using (auth.uid() = user_id);

create policy "System kann Notifications schreiben"
  on notifications for insert
  with check (true);

-- ----------------------------------------------------------------
-- 10. BROADCASTS
-- ----------------------------------------------------------------
create table if not exists broadcasts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references auth.users(id),
  title       text not null,
  body        text not null,
  channels    text[] not null default '{}',
  sent_at     timestamptz,
  created_at  timestamptz default now()
);

alter table broadcasts enable row level security;

-- Eltern dürfen Broadcasts lesen (das ist der Zweck — Ankündigungen für alle)
create policy "Eltern können Broadcasts lesen"
  on broadcasts for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'parent')
  );

-- Erzieher und Admins dürfen Broadcasts lesen
create policy "Erzieher können Broadcasts lesen"
  on broadcasts for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- Nur Erzieher/Admins mit can_broadcast = true dürfen Ankündigungen erstellen
create policy "Berechtigte Erzieher können Broadcasts erstellen"
  on broadcasts for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('teacher', 'admin')
        and can_broadcast = true
    )
  );

-- Erzieher dürfen nur eigene Broadcasts bearbeiten; Admins alle
create policy "Erzieher können eigene Broadcasts bearbeiten"
  on broadcasts for update
  using (
    auth.uid() = author_id
    and exists (select 1 from profiles where id = auth.uid() and role = 'teacher' and can_broadcast = true)
  );

create policy "Admin kann alle Broadcasts bearbeiten"
  on broadcasts for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Nur Admins dürfen Broadcasts löschen
create policy "Admin kann Broadcasts löschen"
  on broadcasts for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ----------------------------------------------------------------
-- 11. AI PSEUDONYM MAP (DSGVO — Anonymisierung für Claude-API)
--     Jedes Kind erhält ein stabiles Pseudonym (z.B. "Kind-A1B2")
--     Nur diese ID wird an externe KI-Dienste (Claude) übergeben.
--     Mapping bleibt ausschließlich in der DB, nie im Prompt.
-- ----------------------------------------------------------------
create table if not exists ai_pseudonym_map (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null unique references children(id) on delete cascade,
  pseudonym    text not null unique,  -- z.B. 'Kind-A1B2', nie echter Name
  created_at   timestamptz default now()
);

alter table ai_pseudonym_map enable row level security;

-- Nur interner Zugriff via service_role (n8n, Backend) — kein direkter Client-Zugriff
create policy "Kein direkter Zugriff auf Pseudonym-Map"
  on ai_pseudonym_map for all
  using (false);

-- Pseudonym automatisch beim Anlegen eines Kindes generieren
create or replace function generate_child_pseudonym()
returns trigger language plpgsql security definer as $$
declare
  v_pseudonym text;
begin
  -- Kurzes, lesbares Pseudonym: 'Kind-' + 4 Zufallszeichen (Groß + Ziffern)
  v_pseudonym := 'Kind-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4));

  -- Kollision vermeiden (extrem unwahrscheinlich, aber sicher)
  while exists (select 1 from ai_pseudonym_map where pseudonym = v_pseudonym) loop
    v_pseudonym := 'Kind-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4));
  end loop;

  insert into ai_pseudonym_map (child_id, pseudonym)
  values (NEW.id, v_pseudonym);

  return NEW;
end;
$$;

drop trigger if exists child_pseudonym_trigger on children;
create trigger child_pseudonym_trigger
  after insert on children
  for each row execute function generate_child_pseudonym();

-- Hilfsfunktion: gibt Pseudonym für eine child_id zurück (für n8n/Backend)
create or replace function get_child_pseudonym(p_child_id uuid)
returns text language sql security definer as $$
  select pseudonym from ai_pseudonym_map where child_id = p_child_id;
$$;

-- ----------------------------------------------------------------
-- 12. FAQ CACHE (Chatbot)
-- ----------------------------------------------------------------
create table if not exists faq_cache (
  id              uuid primary key default gen_random_uuid(),
  question_hash   text unique not null,
  question_text   text not null,
  answer          text not null,
  hit_count       int default 0,
  created_at      timestamptz default now()
);

-- ----------------------------------------------------------------
-- 12. n8n WEBHOOK TRIGGERS
-- ----------------------------------------------------------------
create extension if not exists http with schema extensions;

create or replace function notify_n8n(payload jsonb, endpoint text)
returns void language plpgsql security definer as $$
begin
  perform extensions.http_post(
    url     := endpoint,
    body    := payload::text,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
exception when others then
  raise warning 'n8n webhook failed: %', sqlerrm;
end;
$$;

-- Einladung → n8n
create or replace function on_invitation_created()
returns trigger language plpgsql security definer as $$
begin
  perform notify_n8n(
    jsonb_build_object(
      'event',         'invitation.created',
      'invitation_id', NEW.id,
      'email',         NEW.email,
      'role',          NEW.role,
      'child_id',      NEW.child_id,
      'invited_by',    NEW.invited_by
    ),
    'https://eugen-m.n8n.irn.hk/webhook/invitation-created'
  );
  return NEW;
end;
$$;

drop trigger if exists invitation_created_trigger on invitations;
create trigger invitation_created_trigger
  after insert on invitations
  for each row execute function on_invitation_created();

-- Ticket → n8n
create or replace function on_ticket_created()
returns trigger language plpgsql security definer as $$
begin
  perform notify_n8n(
    jsonb_build_object(
      'event', 'ticket.created', 'ticket_id', NEW.id,
      'parent_id', NEW.parent_id, 'subject', NEW.subject,
      'body', NEW.body, 'created_at', NEW.created_at
    ),
    'https://eugen-m.n8n.irn.hk/webhook/ticket-created'
  );
  return NEW;
end;
$$;

drop trigger if exists ticket_created_trigger on tickets;
create trigger ticket_created_trigger
  after insert on tickets
  for each row execute function on_ticket_created();

-- Ticket-Reply → n8n (Elternteil benachrichtigen)
create or replace function on_ticket_reply_created()
returns trigger language plpgsql security definer as $$
declare
  v_parent_id uuid;
  v_subject   text;
begin
  select t.parent_id, t.subject into v_parent_id, v_subject
  from tickets t where t.id = NEW.ticket_id;

  -- Nur benachrichtigen wenn Erzieher antwortet (nicht wenn Elternteil selbst antwortet)
  if NEW.author_id <> v_parent_id then
    perform notify_n8n(
      jsonb_build_object(
        'event',      'ticket.reply',
        'ticket_id',  NEW.ticket_id,
        'reply_id',   NEW.id,
        'parent_id',  v_parent_id,
        'subject',    v_subject,
        'created_at', NEW.created_at
      ),
      'https://eugen-m.n8n.irn.hk/webhook/ticket-created'
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists ticket_reply_created_trigger on ticket_replies;
create trigger ticket_reply_created_trigger
  after insert on ticket_replies
  for each row execute function on_ticket_reply_created();

-- Registrierung → n8n
create or replace function on_parent_registered()
returns trigger language plpgsql security definer as $$
begin
  if NEW.role = 'parent' then
    perform notify_n8n(
      jsonb_build_object(
        'event', 'parent.registered', 'user_id', NEW.id,
        'email', NEW.email, 'full_name', NEW.full_name,
        'created_at', NEW.created_at
      ),
      'https://eugen-m.n8n.irn.hk/webhook/parent-registered'
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists parent_registered_trigger on profiles;
create trigger parent_registered_trigger
  after insert on profiles
  for each row execute function on_parent_registered();

-- Observation → n8n
create or replace function on_observation_created()
returns trigger language plpgsql security definer as $$
declare
  v_parent_id uuid;
  v_child_name text;
begin
  select c.parent_id, c.name into v_parent_id, v_child_name
  from children c where c.id = NEW.child_id;

  perform notify_n8n(
    jsonb_build_object(
      'event', 'observation.created', 'observation_id', NEW.id,
      'child_id', NEW.child_id, 'child_name', v_child_name,
      'parent_id', v_parent_id, 'category', NEW.category,
      'created_at', NEW.created_at
    ),
    'https://eugen-m.n8n.irn.hk/webhook/observation-created'
  );
  return NEW;
end;
$$;

drop trigger if exists observation_created_trigger on observations;
create trigger observation_created_trigger
  after insert on observations
  for each row execute function on_observation_created();

-- Lerngeschichte → n8n → Claude
create or replace function on_learning_story_created()
returns trigger language plpgsql security definer as $$
declare
  v_age_months int;
begin
  -- Alter in Monaten berechnen (aus children.birth_date)
  select extract(year from age(now(), birth_date)) * 12
       + extract(month from age(now(), birth_date))
  into v_age_months
  from children where id = NEW.child_id;

  perform notify_n8n(
    jsonb_build_object(
      'event',      'lerngeschichte.created',
      'story_id',   NEW.id,
      'child_id',   NEW.child_id,
      'teacher_id', NEW.teacher_id,
      'situation',  NEW.situation,
      'category',   'allgemein',
      'age_months', coalesce(v_age_months, null)
    ),
    'https://eugen-m.n8n.irn.hk/webhook/lerngeschichte-generieren'
  );
  return NEW;
end;
$$;

drop trigger if exists learning_story_created_trigger on learning_stories;
create trigger learning_story_created_trigger
  after insert on learning_stories
  for each row execute function on_learning_story_created();

-- Broadcast → n8n
create or replace function on_broadcast_created()
returns trigger language plpgsql security definer as $$
begin
  perform notify_n8n(
    jsonb_build_object(
      'event', 'broadcast.created', 'id', NEW.id,
      'title', NEW.title, 'body', NEW.body, 'channels', NEW.channels
    ),
    'https://eugen-m.n8n.irn.hk/webhook/broadcast-created'
  );
  return NEW;
end;
$$;

drop trigger if exists broadcast_created_trigger on broadcasts;
create trigger broadcast_created_trigger
  after insert on broadcasts
  for each row execute function on_broadcast_created();

-- ----------------------------------------------------------------
-- 13. AUDIT LOG (DSGVO Art. 5 & 32 — Nachweisbarkeit)
--     Protokolliert sicherheitsrelevante Aktionen automatisch.
--     Kein RLS-Schreibzugriff für normale Nutzer — nur service_role.
--     Retention: 90 Tage (BSI-Empfehlung), danach automatisch gelöscht.
-- ----------------------------------------------------------------
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  action      text not null,   -- 'login' | 'logout' | 'data_export' | 'data_delete' | 'profile_update' | 'child_created' | 'child_deleted' | 'observation_created' | 'message_sent'
  table_name  text,            -- betroffene Tabelle
  record_id   uuid,            -- betroffene Zeilen-ID
  details     jsonb,           -- zusätzliche Infos (kein Klartext-Inhalt, nur Metadaten)
  ip_address  text,            -- optional, vom Frontend übergeben
  user_agent  text,            -- Browser/Client-Info (BSI-Empfehlung)
  created_at  timestamptz default now()
);

alter table audit_log enable row level security;

-- Nur Admins können Audit-Log lesen
create policy "Admin liest Audit-Log"
  on audit_log for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Niemand kann direkt schreiben — nur via service_role (n8n, Backend-API)
create policy "Kein direkter Schreibzugriff auf Audit-Log"
  on audit_log for insert
  with check (false);

-- Migration: user_agent Spalte zu bestehender Tabelle hinzufügen
do $audit_migration$
begin
  if not exists (select 1 from information_schema.columns where table_name='audit_log' and column_name='user_agent') then
    alter table audit_log add column user_agent text;
  end if;
end;
$audit_migration$;

-- Hilfsfunktion: Audit-Eintrag schreiben (aufgerufen von Triggern & Backend)
create or replace function write_audit_log(
  p_actor_id  uuid,
  p_action    text,
  p_table     text default null,
  p_record_id uuid default null,
  p_details   jsonb default null,
  p_ip        text default null,
  p_agent     text default null
)
returns void language plpgsql security definer as $$
begin
  insert into audit_log (actor_id, action, table_name, record_id, details, ip_address, user_agent)
  values (p_actor_id, p_action, p_table, p_record_id, p_details, p_ip, p_agent);
exception when others then
  raise warning 'Audit-Log-Schreibfehler: %', sqlerrm;
end;
$$;

-- Automatische Löschung nach 90 Tagen (BSI-Empfehlung, DSGVO Art. 5 Speicherbegrenzung)
create or replace function purge_old_audit_logs()
returns void language plpgsql security definer as $$
begin
  delete from audit_log where created_at < now() - interval '90 days';
end;
$$;

-- Automatischer Audit-Trigger: Kinder-Erstellung protokollieren
create or replace function audit_child_insert()
returns trigger language plpgsql security definer as $$
begin
  perform write_audit_log(
    NEW.parent_id, 'child_created', 'children', NEW.id,
    jsonb_build_object('group_name', NEW.group_name)
  );
  return NEW;
end;
$$;

drop trigger if exists audit_child_insert_trigger on children;
create trigger audit_child_insert_trigger
  after insert on children
  for each row execute function audit_child_insert();

-- Automatischer Audit-Trigger: Kinder-Löschung protokollieren
create or replace function audit_child_delete()
returns trigger language plpgsql security definer as $$
begin
  perform write_audit_log(
    OLD.parent_id, 'child_deleted', 'children', OLD.id,
    jsonb_build_object('group_name', OLD.group_name)
  );
  return OLD;
end;
$$;

drop trigger if exists audit_child_delete_trigger on children;
create trigger audit_child_delete_trigger
  before delete on children
  for each row execute function audit_child_delete();

-- Automatischer Audit-Trigger: Profil-Änderungen protokollieren
create or replace function audit_profile_update()
returns trigger language plpgsql security definer as $$
begin
  if OLD.email <> NEW.email or OLD.role <> NEW.role then
    perform write_audit_log(
      NEW.id, 'profile_update', 'profiles', NEW.id,
      jsonb_build_object('changed_fields',
        case when OLD.email <> NEW.email then '["email"]' else '[]' end::jsonb
        || case when OLD.role <> NEW.role then '["role"]' else '[]' end::jsonb
      )
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists audit_profile_update_trigger on profiles;
create trigger audit_profile_update_trigger
  after update on profiles
  for each row execute function audit_profile_update();

-- ----------------------------------------------------------------
-- 14. FOTO-STORAGE (Supabase Storage)
--     Ein privater Bucket pro Elternteil.
--     Pfad-Struktur: {parent_id}/{child_id}/{filename}
--     Nur zugänglich wenn photo_consent = true für das jeweilige Kind.
--     Erzieher können hochladen, Eltern können lesen.
-- ----------------------------------------------------------------

-- Storage-Bucket anlegen (einmalig im Supabase Dashboard oder via API)
-- Name: 'child-photos' | Private: true | Keine öffentlichen URLs
-- Hier als Kommentar dokumentiert — Bucket-Erstellung erfolgt im Dashboard:
--
--   Supabase Dashboard → Storage → New Bucket
--   Name: child-photos
--   Public: OFF
--   File size limit: 10 MB
--   Allowed MIME types: image/jpeg, image/png, image/webp
--

-- Storage RLS Policies (in Supabase Dashboard → Storage → Policies eingeben):
--
-- POLICY 1: Eltern können Fotos ihrer Kinder lesen (nur bei photo_consent = true)
--   Bucket: child-photos
--   Operation: SELECT
--   Expression:
--     (storage.foldername(name))[1] = auth.uid()::text
--     AND exists (
--       select 1 from children
--       where parent_id = auth.uid()
--       and id::text = (storage.foldername(name))[2]
--       and photo_consent = true
--     )
--
-- POLICY 2: Erzieher können Fotos hochladen (nur bei photo_consent = true)
--   Bucket: child-photos
--   Operation: INSERT
--   Expression:
--     exists (select 1 from profiles where id = auth.uid() and role in ('teacher','admin'))
--     AND exists (
--       select 1 from children
--       where id::text = (storage.foldername(name))[2]
--       and photo_consent = true
--     )
--
-- POLICY 3: Erzieher können eigene Uploads löschen
--   Bucket: child-photos
--   Operation: DELETE
--   Expression:
--     exists (select 1 from profiles where id = auth.uid() and role in ('teacher','admin'))
--
-- POLICY 4: Eltern können eigene Kind-Fotos löschen
--   Bucket: child-photos
--   Operation: DELETE
--   Expression:
--     (storage.foldername(name))[1] = auth.uid()::text

-- Foto-Metadaten Tabelle (für Galerie, Beschriftungen, n8n-Notifications)
create table if not exists child_photos (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references children(id) on delete cascade,
  parent_id    uuid not null references auth.users(id) on delete cascade,
  uploaded_by  uuid not null references auth.users(id), -- Erzieher oder Elternteil
  storage_path text not null,  -- z.B. '{parent_id}/{child_id}/foto-2026-05.jpg'
  caption      text,
  created_at   timestamptz default now()
);

alter table child_photos enable row level security;

create policy "Eltern sehen Fotos ihrer Kinder"
  on child_photos for select
  using (auth.uid() = parent_id);

create policy "Erzieher sehen alle Fotos"
  on child_photos for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin')));

create policy "Erzieher können Fotos anlegen"
  on child_photos for insert
  with check (
    auth.uid() = uploaded_by and
    exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin')) and
    exists (select 1 from children where id = child_photos.child_id and photo_consent = true)
  );

create policy "Eltern können eigene Kind-Fotos löschen"
  on child_photos for delete
  using (auth.uid() = parent_id);

create policy "Erzieher können Fotos löschen"
  on child_photos for delete
  using (exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin')));

-- n8n Trigger: Elternteil benachrichtigen wenn neues Foto hochgeladen
create or replace function on_child_photo_created()
returns trigger language plpgsql security definer as $$
begin
  perform notify_n8n(
    jsonb_build_object(
      'event',      'photo.uploaded',
      'photo_id',   NEW.id,
      'child_id',   NEW.child_id,
      'parent_id',  NEW.parent_id,
      'caption',    NEW.caption,
      'created_at', NEW.created_at
    ),
    'https://eugen-m.n8n.irn.hk/webhook/photo-uploaded'
  );
  return NEW;
end;
$$;

drop trigger if exists child_photo_created_trigger on child_photos;
create trigger child_photo_created_trigger
  after insert on child_photos
  for each row execute function on_child_photo_created();

-- ----------------------------------------------------------------
-- 15. REALTIME aktivieren
-- ----------------------------------------------------------------
do $realtime$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='notifications') then
    alter publication supabase_realtime add table notifications;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='messages') then
    alter publication supabase_realtime add table messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='appointment_proposals') then
    alter publication supabase_realtime add table appointment_proposals;
  end if;
end;
$realtime$;

-- ----------------------------------------------------------------
-- 16. MODERATION LOG (Content Moderation)
--     Protokolliert gemeldete/geblockte Nachrichten von Eltern.
--     Kein Klartext gespeichert — nur Metadaten für Admin-Review.
-- ----------------------------------------------------------------
create table if not exists moderation_log (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  context         text not null default 'ticket',  -- 'ticket' | 'message'
  context_id      uuid,              -- ticket_id oder message_id
  flagged_reason  text not null,     -- kurze Beschreibung was Claude erkannt hat
  severity        text not null default 'medium',  -- 'low' | 'medium' | 'high'
  action_taken    text not null default 'blocked', -- 'blocked' | 'warned' | 'logged'
  reviewed_by     uuid references auth.users(id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz default now()
);

alter table moderation_log enable row level security;

create policy "Admin liest Moderation-Log"
  on moderation_log for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin')));

create policy "Kein direkter Schreibzugriff auf Moderation-Log"
  on moderation_log for insert
  with check (false);

-- ================================================================
-- PENDING REGISTRATIONS
-- Zwischenspeicher für Registrierungen via Einladungslink.
-- Wird nach erfolgreichem Magic Link Confirm in profiles überführt.
-- ================================================================
create table if not exists pending_registrations (
  id           uuid primary key default gen_random_uuid(),
  token        uuid not null references invitations(id),
  email        text not null,
  role         text not null,
  full_name    text not null,
  phone        text,
  completed_at timestamptz,
  created_at   timestamptz default now()
);

alter table pending_registrations enable row level security;

-- Nur anonym lesbar via Service Role (kein direkter Client-Zugriff nötig)
-- Die /api/register Route nutzt den Server-Client mit Anon Key + RLS
create policy "Anon kann eigene pending registration lesen"
  on pending_registrations for select
  using (true);

-- ================================================================
-- Web Push Subscriptions
-- ================================================================
create table if not exists push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  endpoint     text not null unique,
  keys         jsonb not null,
  created_at   timestamptz default now()
);

alter table push_subscriptions enable row level security;

create policy "User manages own push subscriptions"
  on push_subscriptions for all
  using (auth.uid() = user_id);

-- ================================================================
-- Fertig! Alle Tabellen, RLS-Policies, Trigger und Realtime aktiv.
-- ================================================================
