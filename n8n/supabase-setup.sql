-- ============================================================
-- Kita Bergfalke — Supabase Setup für n8n-Integration
-- Ausführen in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ----------------------------------------------------------------
-- 1. In-App Notifications Tabelle
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

-- RLS: Eltern sehen nur ihre eigenen Notifications
alter table notifications enable row level security;

create policy "Eigene Notifications lesen"
  on notifications for select
  using (auth.uid() = user_id);

create policy "System kann Notifications schreiben"
  on notifications for insert
  with check (true); -- n8n / Edge Functions schreiben via Service Role Key

-- ----------------------------------------------------------------
-- 2. Broadcasts Tabelle (Kita-weite Ankündigungen)
-- ----------------------------------------------------------------
create table if not exists broadcasts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references auth.users(id),
  title       text not null,
  body        text not null,
  channels    text[] not null default '{}', -- ['email','telegram','sms','push']
  sent_at     timestamptz,
  created_at  timestamptz default now()
);

-- Nur Erzieher/Leitung dürfen Broadcasts sehen und schreiben
alter table broadcasts enable row level security;

create policy "Erzieher können Broadcasts lesen"
  on broadcasts for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

create policy "Erzieher können Broadcasts erstellen"
  on broadcasts for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('teacher', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- 3. Webhook-Funktion: Supabase → n8n
-- Ersetzt <N8N_WEBHOOK_URL> mit deiner lokalen oder Cloud-URL
-- ----------------------------------------------------------------

-- Extension für HTTP-Requests aktivieren (einmalig)
create extension if not exists http with schema extensions;

-- Generische Webhook-Hilfsfunktion
create or replace function notify_n8n(payload jsonb, endpoint text)
returns void
language plpgsql security definer
as $$
begin
  perform extensions.http_post(
    url     := endpoint,
    body    := payload::text,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
exception when others then
  -- Fehler loggen aber nicht den DB-Trigger blockieren
  raise warning 'n8n webhook failed: %', sqlerrm;
end;
$$;

-- ----------------------------------------------------------------
-- 4. Trigger: Neues Ticket → n8n
-- ----------------------------------------------------------------
create or replace function on_ticket_created()
returns trigger
language plpgsql security definer
as $$
begin
  perform notify_n8n(
    jsonb_build_object(
      'event',      'ticket.created',
      'ticket_id',  NEW.id,
      'parent_id',  NEW.parent_id,
      'subject',    NEW.subject,
      'body',       NEW.body,
      'created_at', NEW.created_at
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

-- ----------------------------------------------------------------
-- 5. Trigger: Neue Eltern-Registrierung → n8n
-- ----------------------------------------------------------------
create or replace function on_parent_registered()
returns trigger
language plpgsql security definer
as $$
begin
  -- Nur auslösen wenn Rolle = 'parent'
  if NEW.role = 'parent' then
    perform notify_n8n(
      jsonb_build_object(
        'event',      'parent.registered',
        'user_id',    NEW.id,
        'email',      NEW.email,
        'full_name',  NEW.full_name,
        'created_at', NEW.created_at
      ),
      'https://eugen-m.n8n.irn.hk/webhook/parent-registered'
    );
  end if;
  return NEW;
end;
$$;

-- Trigger auf profiles-Tabelle (wird bei Magic-Link-Signup befüllt)
drop trigger if exists parent_registered_trigger on profiles;
create trigger parent_registered_trigger
  after insert on profiles
  for each row execute function on_parent_registered();

-- ----------------------------------------------------------------
-- 6. Trigger: Entwicklungsdoku hinzugefügt → n8n
-- ----------------------------------------------------------------
create or replace function on_observation_created()
returns trigger
language plpgsql security definer
as $$
declare
  v_parent_id uuid;
  v_child_name text;
begin
  -- Parent-ID und Kindname ermitteln
  select c.parent_id, c.name
  into v_parent_id, v_child_name
  from children c
  where c.id = NEW.child_id;

  perform notify_n8n(
    jsonb_build_object(
      'event',          'observation.created',
      'observation_id', NEW.id,
      'child_id',       NEW.child_id,
      'child_name',     v_child_name,
      'parent_id',      v_parent_id,
      'category',       NEW.category,
      'created_at',     NEW.created_at
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

-- ----------------------------------------------------------------
-- 7. Trigger: Broadcast erstellt → n8n
-- ----------------------------------------------------------------
create or replace function on_broadcast_created()
returns trigger
language plpgsql security definer
as $$
begin
  perform notify_n8n(
    jsonb_build_object(
      'event',    'broadcast.created',
      'id',       NEW.id,
      'title',    NEW.title,
      'body',     NEW.body,
      'channels', NEW.channels
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
-- 8. Realtime für In-App Notifications aktivieren
-- ----------------------------------------------------------------
alter publication supabase_realtime add table notifications;

-- ----------------------------------------------------------------
-- Fertig! Nächste Schritte:
-- 1. Workflows in n8n importieren: https://eugen-m.n8n.irn.hk
-- 2. profiles-Tabelle muss Felder haben: id, email, full_name, role
-- 3. Service Role Key für n8n-Credentials in Supabase holen
-- ----------------------------------------------------------------
