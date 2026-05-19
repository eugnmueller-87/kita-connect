# Kita Connect

**Full-stack Kita management platform** — built for German daycare centers (Kitas), designed to run at near-zero monthly cost.

> Portfolio project by [Eugen Mueller](https://github.com/eugnmueller-87). Live at [app.kita-connect.cloud](https://app.kita-connect.cloud).

---

## Screenshots

| Admin Portal | Educator Portal | Parent Portal |
|---|---|---|
| ![Admin](Screenshots/Admin.png) | ![Teacher](Screenshots/teacher.png) | ![Parent](Screenshots/parent.png) |

---

## What it does

Kita Connect replaces fragmented communication tools (WhatsApp groups, paper forms, phone calls) with a unified platform for parents, educators, and Kita management.

**For Parents**
- Secure portal to view their child's development documentation and observations
- Direct messaging with educators via support ticket system
- Real-time in-app notifications
- Multi-language: German, English, Russian

**For Educators**
- Development observations (Sismik, Seldak, Perik standardized assessments)
- AI-assisted learning stories (Lerngeschichten) via Claude AI — GDPR-pseudonymized before sending to AI
- Child milestone tracking
- Broadcast announcements to all parents

**For Kita Management**
- Multi-channel communication: In-App, E-Mail, Telegram, SMS
- Invite-only registration — no self-signup, full access control
- Automated workflows for registrations, tickets, announcements
- GDPR-compliant audit log with 90-day retention

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) | Free hosting on Vercel, server components |
| Database | Supabase (EU Ireland) | Generous free tier, built-in RLS, Realtime |
| Auth | Supabase Magic Link | Invite-only, no password management |
| Automation | n8n (self-hosted) | German company, GDPR-compliant, self-hostable |
| Email | Resend | 3,000 emails/month free |
| Push | Web Push API (VAPID) | Browser-native, no cost |
| AI | Claude Haiku (Anthropic) | Most cost-efficient model for summaries & learning stories |
| Hosting | Vercel + Supabase EU | EU region, GDPR-compliant data residency |
| Analytics | Vercel Web Analytics | Privacy-friendly, no cookies, included in Hobby plan |
| Logging | Supabase audit_log + pg_cron | No third-party logging tool needed |

**Target running cost: ~0 €/month** (free tiers across all services)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Next.js App (Vercel)                           │
│  Parent Portal · Educator Dashboard · Admin     │
│  Middleware: role-based auth guard on all routes│
└──────────────┬──────────────────────────────────┘
               │ Server Components + Route Handlers
               ▼
┌─────────────────────────────────────────────────┐
│  Supabase (EU Ireland)                          │
│  PostgreSQL · Auth · RLS · Realtime · Storage   │
│  audit_log table — 90-day retention via pg_cron │
└──────────────┬──────────────────────────────────┘
               │ Webhooks
               ▼
┌─────────────────────────────────────────────────┐
│  n8n Automation (8 workflows)                   │
│  Tickets · Broadcasts · Onboarding · AI Stories │
└──────┬──────────┬─────────────┬─────────────────┘
       │          │             │
       ▼          ▼             ▼
   Resend      Telegram     Claude Haiku
   (Email)    (Broadcast)   (AI, pseudonymized)
```

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/admin/invite` | admin | Send invite email with role-scoped token |
| POST | `/api/admin/approve` | admin | Approve or reject a parent account |
| POST | `/api/admin/broadcast` | admin | Send broadcast to all parents |
| POST | `/api/teacher/observations` | teacher | Create an observation for a child |
| POST | `/api/tickets` | parent/teacher | Create or reply to a support ticket |
| GET | `/api/tickets` | parent/teacher | Fetch own tickets |

All routes:
- Validate session via Supabase SSR
- Check role from `profiles` table
- Write to `audit_log` via `write_audit_log()` RPC (includes IP + user-agent)
- Never expose service role key to the client

---

## GDPR & Security

### Data Residency
- Supabase project hosted in **EU (Ireland)**
- Vercel deployment in **Frankfurt**
- n8n self-hosted (EU)
- No personal data leaves the EU

### Row Level Security (RLS)
Every table has RLS enabled. Key policies:
- Parents can only read their own children's data
- Teachers can only read children in their assigned group
- Admins have full read access, no write bypass
- `audit_log` table: no direct write access for any user — only via `security definer` function

### Invite-Only Registration
- No self-signup. Users register only via a time-limited invite token
- Token is role-scoped (`parent` / `teacher`) — can't escalate privileges
- Tokens stored in `invitations` table, consumed on first use

### Audit Log
- Table: `audit_log` — records every sensitive action
- Fields: `actor_id`, `action`, `table_name`, `record_id`, `details` (JSONB, no plaintext PII), `ip_address`, `user_agent`
- Write access: only via `write_audit_log()` RPC with `security definer` — regular users cannot insert directly
- Read access: admin role only
- Retention: **90 days** — automated via `pg_cron` (runs daily at 03:00 UTC)
- Covers: login, approval, invitation, broadcast, observation, data deletion, profile changes

### Pseudonymization for AI
- Before sending data to Claude Haiku, child names are replaced with UUIDs via `ai_pseudonym_map` table
- No real names, birth dates, or identifiers ever sent to Anthropic API
- Reversible only by the system (not exposed to users)

### Photo Consent
- Child photos require explicit `photo_consent = true` per child
- Storage RLS enforces this — photos are inaccessible without consent flag set
- `photo_consent_at` timestamp recorded for GDPR accountability

---

## Status

**[View Kanban →](https://github.com/users/eugnmueller-87/projects/9/views/1)** · **[View Roadmap →](https://github.com/users/eugnmueller-87/projects/9/views/2)**

| Phase | Description | Status |
|-------|-------------|--------|
| 0 — Foundation | DB schema (18 tables), RLS, Supabase Auth | ✅ Complete |
| 1 — Automation | n8n — 8 workflows active and tested | ✅ Complete |
| 2 — Portal | Next.js — all 25 screens across 3 role portals | ✅ Complete |
| 3 — Live | Real Supabase data, middleware auth guards, audit log | 🔵 In progress |
| 4 — Mobile | PWA installable on iOS & Android | ⬜ Planned |
| 5 — Launch | Legal (DPAs), marketing website, CI/CD | ⬜ Planned |
| 6 — Monetization | Pricing, Stripe, pilot program, i18n | ⬜ Planned |

**Phase 3 remaining:** Web Push (VAPID), error monitoring (Sentry)

---

## License

Private project — not open source. Repository is public for portfolio purposes.
