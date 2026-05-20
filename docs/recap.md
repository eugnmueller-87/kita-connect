# Kita Connect — Recap

---

## HANDOVER — Stand 2026-05-20 (Session-Ende)

### Was heute vollständig funktioniert ✅
- **Super Admin Login** → `/admin` erreichbar (app.kita-connect.cloud)
- **Admin Dashboard** lädt echte Daten aus Supabase (alle 200er Requests)
- **Einladung senden** → wird in DB gespeichert, n8n wird getriggert

### Was noch offen ist ⏳
1. **n8n Workflow 07 — Email-Body fehlt**
   - Beide Email-Nodes ("Resend: Eltern-Einladung" + "Resend: Staff-Einladung") brauchen einen Body
   - Body eintragen: `<a href="https://app.kita-connect.cloud/register?token={{ $json.token }}">Jetzt registrieren</a>`
   - Danach Workflow **Publish/Activate**
2. **Invite Flow end-to-end testen** — Email bei Empfänger ankommen lassen, Registrierungslink klicken
3. **Registrierung testen** — `/register?token=...` → Formular ausfüllen → Login als Teacher/Parent
4. **Teacher Login testen** — `/teacher` erreichbar?
5. **Parent Login testen** — `/parent` erreichbar?

### Nächste Session — Sofort-Checkliste
```
1. n8n Workflow 07 öffnen → beide Email-Nodes bearbeiten → Body mit Registrierungslink → Publish
2. Einladung für Erzieher senden → Email prüfen → Link klicken → Registrierung durchführen
3. Als Erzieher einloggen → /teacher Dashboard prüfen
4. Einladung für Elternteil senden → gleicher Flow
5. /db-checklist ausführen falls neue Fehler auftreten
```

### Bekannte SQL-Fixes (falls nötig)
```sql
-- GRANTs falls "permission denied" auftritt:
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.invitations TO authenticated;
GRANT SELECT ON public.teacher_kitas TO authenticated;
GRANT SELECT ON public.kitas TO authenticated;
GRANT SELECT ON public.children TO authenticated;
NOTIFY pgrst, 'reload schema';
```

### Commits heute
- `5f31488` — Fix middleware: add super_admin + traeger_admin to ROLE_PREFIXES
- `d90548b` — Fix requireRole for super_admin + traeger_admin on all admin pages
- `c7dd063` — Add traeger_admin to invite API allowed roles
- `0859801` — Fix invite flow: send invitation_id to n8n, add email body

---

## 2026-05-15 — Project Start
- Initial setup, rebrand from Kita Bergfalke → Kita Connect
- README created, confidential files excluded from repo

## 2026-05-16 — n8n Foundation
- n8n wired up: Telegram, API keys, Supabase
- Roadmap updated

## 2026-05-18 — Portal Bootstrap
- Next.js portal started with custom design system (kc-card, kc-btn, kc-badge)
- Teal/cream color scheme established

## 2026-05-19 — Major Build Day
- **Server migration:** n8n moved from Ironhack school server to personal Hostinger VPS (Frankfurt)
- **Real data:** All admin, teacher, and parent pages wired to real Supabase queries (no more mocks)
- **Security:** Middleware auth guard + role-based redirects, invite flow with `/register` + `/api/register`, `pending_registrations` table
- **GDPR/BSI Audit log:** `audit.ts` helper, all sensitive API routes logged, 90-day retention, `user_agent`, `child_created` trigger
- **Content moderation:** n8n workflow 09 — Claude Haiku checks parent messages, blocks toxic content (HTTP 422), logs to `moderation_log`
- **AI ethics policy:** Workflows 05 + 06 forbidden from rating, comparing, or assessing children — enforced in system prompts
- **DGE traffic light:** Nutrition score replaced with German DGE traffic light system (in all 3 meal views)
- **Telegram removed:** Replaced with SMS via seven.io
- **README:** Screenshots (Admin/Teacher/Parent), API docs, GDPR details, phase status added

## 2026-05-20 — i18n (Multilingual Support)
- **Full translation** of entire portal into DE / EN / TR / RU
- `translations.ts` with all strings, `useTranslation` hook, `getLang()` function, `kc_lang` cookie
- All pages translated: parent, teacher, admin, login, register, auth/confirm
- Fixed Russian Thursday typo (`"Четşamba"` → `"Четверг"`)
- TypeScript clean (`npx tsc --noEmit` = 0 errors)

## 2026-05-20 — Multi-Tenancy: Träger + Kitas + Registration Flow
- **DB-Migration 001:** `traeger` + `kitas` + `teacher_kitas` Tables in Supabase ausgeführt
- **kita_id** auf profiles, invitations, children, tickets, observations, broadcasts, notifications, learning_stories, messages
- **Träger-Modell:** Erzieher können mehreren Kitas zugeordnet werden (teacher_kitas JOIN-Table)
- **RLS** alle Policies auf kita_id-Scope aktualisiert
- **Rollen erweitert:** `super_admin`, `traeger_admin` neu
- **Portal:** `/admin/kitas` — Kitas + Träger anlegen und verwalten
- **Invite-Flow:** kita_id wird bei Einladung mitgegeben, `accept_invitation` setzt kita_id auf Profil
- **Vercel Analytics** + `@vercel/analytics` in Root-Layout
- **Web Push Fix:** VAPID lazy init verhindert Build-Crash
- **Quality Gate:** PASS — alle P0 Security + GDPR Checks grün

## 2026-05-21 — Kafka/Redpanda + Web Push
- **Kafka analysis:** Evaluated benefits at 20 Kitas / 200 families (reliability, fan-out, event replay)
- **Redpanda installed:** Single-node Docker on Hostinger VPS alongside n8n + Traefik
- **SSH key auth:** Set up passwordless SSH from dev machine to VPS
- **Docker networking:** Connected Redpanda to n8n's Docker network for internal communication
- **3 Kafka topics created:** `ticket.created`, `notification.created`, `moderation.result`
- **`portal/src/lib/kafka.ts`:** Shared `publishEvent()` helper (fail-open)
- **API routes migrated:** tickets, observations, broadcast now publish to Kafka instead of direct n8n webhooks
- **n8n workflows 01, 02, 04:** Migrated from Webhook trigger to Kafka trigger node
- **End-to-end tested:** Portal → Redpanda → n8n workflow executes ✓
- **CLAUDE.md created:** Auto-instructions for every session (recap updates, translation rule, secrets policy)
- **`/mistake` skill created:** Logs dead ends to `docs/mistakes.md` so we never repeat them
- **Web Push (#45):** VAPID keys generated, `web-push` installed, `/api/push/subscribe` + `/api/push/send` routes created, `sw.js` service worker, `usePushSubscription` hook, parent layout wired up, `push_subscriptions` table added to schema

## 2026-05-20 — Login-Bugfix-Marathon + Invite Flow

- **Super Admin Login:** `getSession()` → `getUser()` nach OTP-Verify; `window.location.href` statt `router.replace()` für Middleware-Cookie-Validierung
- **Middleware:** `super_admin` + `traeger_admin` fehlten in `ROLE_PREFIXES` → Redirect nach `/super_admin` (404)
- **requireRole:** Alle Admin-Seiten (`page.tsx`, `invitations/page.tsx`) auf `['admin','super_admin','traeger_admin']` erweitert
- **Supabase RLS:** Rekursive Policies auf `profiles` entfernt → `auth.jwt() ->> 'role'` statt Subqueries
- **GRANT:** `teacher_kitas`, `kitas`, `children`, `invitations`, `profiles` für `authenticated` freigegeben
- **invitations.token:** Spalte fehlte → per `ALTER TABLE` nachgezogen + Schema-Cache-Reload
- **Invite API:** `invitation_id` wird jetzt ans n8n Webhook mitgegeben; `traeger_admin` darf einladen
- **n8n Workflow 07:** Email-Body mit Registrierungslink fehlt noch → muss manuell in n8n UI eingetragen werden
- **Vercel Env-Vars:** `NEXT_PUBLIC_*` waren als "Sensitive" markiert → Build konnte Keys nicht einbetten → neu angelegt ohne Sensitive-Flag

## 2026-05-21 — Vollständiger Bugfix-Sweep vor App-Build

- **Bug #1 (kritisch):** `api/register` — `kita_id` aus Einladung wird jetzt in `pending_registrations` gespeichert
- **Bug #2 (kritisch):** `auth/confirm` — `kita_id` + korrekter `onboarding_status` (`pending` für Eltern) beim Profil-Upsert
- **Bug #3:** `api/admin/approve` — `super_admin` + `traeger_admin` dürfen jetzt Eltern genehmigen
- **Bug #4:** `admin/parents/page` — `requireRole` auf alle Admin-Rollen erweitert
- TypeScript: 0 Fehler · Build: PASS
