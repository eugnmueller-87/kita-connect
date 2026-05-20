-- ================================================================
-- Migration 001: Multi-Tenancy — Träger + Kitas + teacher_kitas
-- Ausführen in: Supabase SQL Editor
-- Reihenfolge: exakt so einhalten (Foreign Key Abhängigkeiten)
-- ================================================================

-- ----------------------------------------------------------------
-- 1. TRAEGER (Betreiber/Träger — optional, z.B. AWO, DRK)
--    Eine Einzel-Kita hat keinen Träger (traeger_id = null)
-- ----------------------------------------------------------------
create table if not exists traeger (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,              -- z.B. "AWO München e.V."
  address     text,
  city        text,
  postal_code text,
  phone       text,
  email       text,
  logo_url    text,
  status      text not null default 'active', -- 'active' | 'suspended'
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now()
);

alter table traeger enable row level security;

create policy "Super Admin verwaltet alle Träger"
  on traeger for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));

create policy "Traeger Admin sieht eigenen Träger"
  on traeger for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'traeger_admin' and traeger_id = traeger.id
    )
  );

-- ----------------------------------------------------------------
-- 2. KITAS
--    traeger_id nullable — Einzel-Kita hat keinen Träger
-- ----------------------------------------------------------------
create table if not exists kitas (
  id           uuid primary key default gen_random_uuid(),
  traeger_id   uuid references traeger(id) on delete set null,
  name         text not null,
  address      text,
  city         text,
  postal_code  text,
  phone        text,
  email        text,
  logo_url     text,
  max_children integer default 50,
  status       text not null default 'active', -- 'active' | 'suspended'
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now()
);

alter table kitas enable row level security;

create policy "Super Admin verwaltet alle Kitas"
  on kitas for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));

create policy "Traeger Admin sieht Kitas seines Trägers"
  on kitas for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'traeger_admin' and traeger_id = kitas.traeger_id
    )
  );

create policy "Admin sieht eigene Kita"
  on kitas for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin' and kita_id = kitas.id
    )
  );

-- ----------------------------------------------------------------
-- 3. kita_id + traeger_id auf profiles
--    - parent/teacher/admin: kita_id gesetzt (primäre Kita)
--    - traeger_admin: traeger_id gesetzt, kita_id null
--    - super_admin: beide null
-- ----------------------------------------------------------------
alter table profiles add column if not exists kita_id    uuid references kitas(id)   on delete set null;
alter table profiles add column if not exists traeger_id uuid references traeger(id) on delete set null;

create index if not exists profiles_kita_id_idx    on profiles(kita_id);
create index if not exists profiles_traeger_id_idx on profiles(traeger_id);

-- ----------------------------------------------------------------
-- 4. TEACHER_KITAS (JOIN — Erzieher können in mehreren Kitas arbeiten)
--    Primäre Kita bleibt profiles.kita_id
--    Zusätzliche Kitas über diese Tabelle
-- ----------------------------------------------------------------
create table if not exists teacher_kitas (
  teacher_id uuid not null references auth.users(id) on delete cascade,
  kita_id    uuid not null references kitas(id)      on delete cascade,
  assigned_at timestamptz default now(),
  primary key (teacher_id, kita_id)
);

alter table teacher_kitas enable row level security;

create policy "Teacher sieht eigene Zuordnungen"
  on teacher_kitas for select
  using (auth.uid() = teacher_id);

create policy "Admin verwaltet Zuordnungen seiner Kita"
  on teacher_kitas for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'super_admin', 'traeger_admin')
        and (kita_id = teacher_kitas.kita_id or role in ('super_admin', 'traeger_admin'))
    )
  );

-- ----------------------------------------------------------------
-- 5. kita_id auf invitations
-- ----------------------------------------------------------------
alter table invitations add column if not exists kita_id uuid references kitas(id) on delete cascade;

-- ----------------------------------------------------------------
-- 6. kita_id auf children
-- ----------------------------------------------------------------
alter table children add column if not exists kita_id uuid references kitas(id) on delete cascade;
create index if not exists children_kita_id_idx on children(kita_id);

-- ----------------------------------------------------------------
-- 7. kita_id auf tickets
-- ----------------------------------------------------------------
alter table tickets add column if not exists kita_id uuid references kitas(id) on delete cascade;
create index if not exists tickets_kita_id_idx on tickets(kita_id);

-- ----------------------------------------------------------------
-- 8. kita_id auf observations
-- ----------------------------------------------------------------
alter table observations add column if not exists kita_id uuid references kitas(id) on delete cascade;

-- ----------------------------------------------------------------
-- 9. kita_id auf broadcasts
-- ----------------------------------------------------------------
alter table broadcasts add column if not exists kita_id uuid references kitas(id) on delete cascade;

-- ----------------------------------------------------------------
-- 10. kita_id auf notifications
-- ----------------------------------------------------------------
alter table notifications add column if not exists kita_id uuid references kitas(id) on delete cascade;

-- ----------------------------------------------------------------
-- 11. kita_id auf learning_stories
-- ----------------------------------------------------------------
alter table learning_stories add column if not exists kita_id uuid references kitas(id) on delete cascade;

-- ----------------------------------------------------------------
-- 12. kita_id auf messages
-- ----------------------------------------------------------------
alter table messages add column if not exists kita_id uuid references kitas(id) on delete cascade;

-- ----------------------------------------------------------------
-- 13. kita_id auf pending_registrations
-- ----------------------------------------------------------------
alter table pending_registrations add column if not exists kita_id uuid references kitas(id) on delete cascade;

-- ----------------------------------------------------------------
-- 14. RLS POLICIES — kita_id-scoped ersetzen
-- ----------------------------------------------------------------

-- profiles: Erzieher sehen nur Profile ihrer Kitas
drop policy if exists "Erzieher können alle Profile lesen" on profiles;

create policy "Erzieher sehen Profile ihrer Kita"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('teacher', 'admin')
        and p.kita_id = profiles.kita_id
    )
    or
    -- Erzieher mit mehreren Kitas: über teacher_kitas
    exists (
      select 1 from teacher_kitas tk
      join profiles p on p.id = auth.uid() and p.role = 'teacher'
      where tk.teacher_id = auth.uid() and tk.kita_id = profiles.kita_id
    )
  );

create policy "Super Admin sieht alle Profile"
  on profiles for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));

create policy "Traeger Admin sieht Profile seiner Kitas"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      join kitas k on k.traeger_id = p.traeger_id
      where p.id = auth.uid() and p.role = 'traeger_admin'
        and k.id = profiles.kita_id
    )
  );

-- children: Erzieher sehen Kinder ihrer Kita(s)
drop policy if exists "Erzieher sehen alle Kinder" on children;

create policy "Erzieher sehen Kinder ihrer Kita"
  on children for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('teacher', 'admin')
        and kita_id = children.kita_id
    )
    or
    exists (
      select 1 from teacher_kitas tk
      join profiles p on p.id = auth.uid() and p.role = 'teacher'
      where tk.teacher_id = auth.uid() and tk.kita_id = children.kita_id
    )
  );

drop policy if exists "Admin kann Kinder anlegen" on children;

create policy "Admin kann Kinder in eigener Kita anlegen"
  on children for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'super_admin')
        and kita_id = children.kita_id
    )
  );

-- invitations: scoped auf Kita
drop policy if exists "Admin sieht eigene Einladungen" on invitations;

create policy "Admin sieht Einladungen seiner Kita"
  on invitations for select
  using (
    auth.uid() = invited_by
    or
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'super_admin', 'traeger_admin')
        and kita_id = invitations.kita_id
    )
  );

-- ----------------------------------------------------------------
-- 15. handle_new_user TRIGGER — kita_id + traeger_id aus metadata
-- ----------------------------------------------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_role       text;
  v_status     text;
  v_kita_id    uuid;
  v_traeger_id uuid;
begin
  v_role       := coalesce(NEW.raw_user_meta_data->>'role', 'parent');
  v_kita_id    := nullif(NEW.raw_user_meta_data->>'kita_id', '')::uuid;
  v_traeger_id := nullif(NEW.raw_user_meta_data->>'traeger_id', '')::uuid;

  v_status := case
    when v_role in ('super_admin', 'admin', 'traeger_admin') then 'active'
    else 'pending'
  end;

  insert into profiles (
    id, email, full_name, role, onboarding_status, kita_id, traeger_id,
    can_broadcast, can_manage_children, can_view_all_children
  ) values (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_role,
    v_status,
    v_kita_id,
    v_traeger_id,
    (v_role in ('teacher', 'admin', 'super_admin', 'traeger_admin')),
    (v_role in ('admin', 'super_admin', 'traeger_admin')),
    (v_role in ('teacher', 'admin', 'super_admin', 'traeger_admin'))
  );
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------
-- 16. accept_invitation — kita_id auf Profil setzen
-- ----------------------------------------------------------------
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

  update invitations set
    status      = 'accepted',
    accepted_at = now(),
    used_at     = now()
  where id = v_inv.id;

  update profiles set
    role              = v_inv.role,
    kita_id           = v_inv.kita_id,
    onboarding_status = case when v_inv.role = 'parent' then 'pending' else 'active' end
  where id = p_user_id;

  -- Bei Erzieher: auch teacher_kitas Eintrag anlegen
  if v_inv.role = 'teacher' and v_inv.kita_id is not null then
    insert into teacher_kitas (teacher_id, kita_id)
    values (p_user_id, v_inv.kita_id)
    on conflict do nothing;
  end if;

  return jsonb_build_object(
    'ok', true,
    'role', v_inv.role,
    'child_id', v_inv.child_id,
    'kita_id', v_inv.kita_id
  );
end;
$$;

-- ----------------------------------------------------------------
-- 17. validate_invitation — kita_id im Result
-- ----------------------------------------------------------------
create or replace function validate_invitation(p_invite_id uuid, p_email text)
returns jsonb language plpgsql security definer as $$
declare
  v_inv invitations%rowtype;
begin
  select * into v_inv from invitations
  where id = p_invite_id
    and lower(email) = lower(p_email)
    and status = 'pending'
    and expires_at > now()
    and used_at is null;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Einladung ungültig, abgelaufen oder E-Mail stimmt nicht überein.');
  end if;

  return jsonb_build_object(
    'ok', true,
    'role', v_inv.role,
    'child_id', v_inv.child_id,
    'kita_id', v_inv.kita_id
  );
end;
$$;
