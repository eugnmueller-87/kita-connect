# /db-checklist — Supabase DB Readiness Check

Führe diesen Check aus bevor ein neuer User-Typ oder eine neue Tabelle live geht.
Verhindert Probleme wie: fehlende Profile, fehlende GRANTs, RLS-Rekursion, fehlende Spalten.

## Instructions for Claude

When the user runs /db-checklist, generate the following SQL block and tell the user to run it in the Supabase SQL Editor:

### 1. GRANTs prüfen

```sql
-- Alle relevanten Tabellen müssen für 'authenticated' erreichbar sein
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.invitations TO authenticated;
GRANT SELECT ON public.teacher_kitas TO authenticated;
GRANT SELECT ON public.kitas TO authenticated;
GRANT SELECT ON public.children TO authenticated;
GRANT SELECT ON public.notifications TO authenticated;
GRANT SELECT ON public.broadcasts TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;
NOTIFY pgrst, 'reload schema';
```

### 2. Pflicht-Spalten auf invitations prüfen

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'invitations'
ORDER BY ordinal_position;
```

Erwartete Spalten: `id`, `email`, `role`, `token`, `invited_by`, `kita_id`, `used_at`, `created_at`

Fehlt `token`:
```sql
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS token uuid DEFAULT gen_random_uuid();
```

### 3. RLS auf profiles — keine Rekursion

Policies auf `profiles` dürfen KEINE Subqueries auf `profiles` selbst enthalten.
Erlaubt: `auth.uid() = id` und `auth.jwt() ->> 'role'`
Verboten: `EXISTS (SELECT 1 FROM profiles WHERE ...)`

Aktuelle Policies anzeigen:
```sql
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';
```

Sichere Minimal-Policies (falls Rekursion auftritt — alle alten zuerst droppen):
```sql
DROP POLICY IF EXISTS "Eigenes Profil lesen" ON profiles;
DROP POLICY IF EXISTS "Eigenes Profil bearbeiten" ON profiles;
DROP POLICY IF EXISTS "Admin liest alle Profile" ON profiles;

CREATE POLICY "Eigenes Profil lesen" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Eigenes Profil bearbeiten" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin liest alle Profile" ON profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'role') IN ('admin', 'super_admin', 'traeger_admin')
  );
```

### 4. Profil für manuell erstellte User anlegen

Wenn ein User direkt in `auth.users` angelegt wurde (nicht über Invite-Flow), fehlt das Profil:

```sql
-- Prüfen ob Profil existiert (UUID einsetzen):
SELECT * FROM profiles WHERE id = '<user-uuid>';

-- Falls kein Eintrag: manuell anlegen
INSERT INTO profiles (id, email, role, full_name, onboarding_status, created_at)
VALUES ('<user-uuid>', '<email>', 'super_admin', '<Name>', 'active', now())
ON CONFLICT (id) DO NOTHING;
```

### 5. NEXT_PUBLIC_ Env-Vars in Vercel

- Niemals als **Sensitive** markieren — Sensitive Vars werden nicht in den Build eingebettet
- `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` müssen plain (nicht sensitive) sein
- Nach Änderung: Vercel neu deployen

### 6. Middleware ROLE_PREFIXES

Jede neue Rolle muss in `portal/src/middleware.ts` und in `portal/src/lib/auth.ts` bekannt sein.
Neue Rolle hinzufügen:
```typescript
// middleware.ts
const ROLE_PREFIXES: Record<string, string> = {
  admin: '/admin',
  super_admin: '/admin',   // ← nicht vergessen
  traeger_admin: '/admin', // ← nicht vergessen
  teacher: '/teacher',
  parent: '/parent',
}
```

Jede `requireRole('admin')`-Zeile auf allen Admin-Seiten muss lauten:
```typescript
requireRole(['admin', 'super_admin', 'traeger_admin'])
```

## Wann ausführen

- Vor dem ersten Login-Test eines neuen User-Typs
- Nach jeder DB-Migration
- Nach dem Hinzufügen einer neuen Tabelle
- Wenn ein "permission denied" oder "No API key" Fehler auftritt
