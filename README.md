# Kita Connect

**Full-stack Kita management platform** — built for German daycare centers (Kitas), designed to run at near-zero monthly cost.

> Currently in active development. Portfolio project by [Eugen Mueller](https://github.com/eugnmueller-87).

---

## What it does

Kita Connect replaces fragmented communication tools (WhatsApp groups, paper forms, phone calls) with a unified platform for parents, educators, and Kita management.

**For Parents**
- Secure portal to view their child's development documentation
- Direct messaging with educators
- Support ticket system
- Multi-language: German, English, Russian

**For Educators**
- Development observations (Sismik, Seldak, Perik standardized assessments)
- AI-assisted learning stories (Lerngeschichten) via Claude AI
- Child milestone tracking
- Broadcast announcements to all parents

**For Kita Management**
- Multi-channel communication: In-App, E-Mail, Telegram, SMS
- Automated workflows for registrations, tickets, announcements
- GDPR-compliant by design

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js (App Router) | Free hosting on Vercel |
| Database | Supabase | Generous free tier, built-in RLS, Realtime |
| Auth | Supabase Magic Link | No password management needed |
| Automation | n8n | German company, GDPR-compliant, self-hostable |
| Email | Resend | 3,000 emails/month free |
| Push | Web Push API | Browser-native, no cost |
| AI | Claude Haiku (Anthropic) | Most cost-efficient model for summaries & learning stories |
| Hosting | Vercel + Supabase EU | Frankfurt region, GDPR-compliant |

**Target running cost: ~0 €/month** (free tiers across all services)

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Next.js App (Vercel)                   │
│  Parent Portal · Educator Dashboard     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Supabase                               │
│  PostgreSQL · Auth · RLS · Realtime     │
└──────────────┬──────────────────────────┘
               │ DB Triggers → Webhooks
               ▼
┌─────────────────────────────────────────┐
│  n8n Automation                         │
│  Tickets · Broadcasts · Onboarding      │
└──────┬──────────┬────────────┬──────────┘
       │          │            │
       ▼          ▼            ▼
   Resend      Telegram    Web Push
   (Email)    (Broadcast)  (In-App)
```

**Row Level Security (RLS)** enforced at database level — parents can only access their own children's data.

---

## Key Features

### Multi-Channel Communication
- **In-App Notifications** — real-time via Supabase Realtime
- **Email** — transactional via Resend
- **Telegram** — broadcast channel for Kita-wide announcements (holidays, closures)
- **SMS** — fallback for parents without smartphones (slot prepared, provider TBD)

### AI-Powered
- **Learning Stories** — educators describe an observation, Claude Haiku writes a draft in the New Zealand Lerngeschichten style
- **Chatbot** — two-tier cache (FAQ DB → Claude Haiku) to minimize API costs
- **Development Reports** — AI-assisted summaries for standardized assessments

### GDPR by Design
- EU-hosted infrastructure (Supabase EU, Vercel Frankfurt, n8n — German company)
- No data shared outside EU
- RLS policies ensure strict data isolation per child/parent

---

## Status

**[View Kanban board →](https://github.com/users/eugnmueller-87/projects/9/views/1)** · **[View Roadmap →](https://github.com/users/eugnmueller-87/projects/9/views/2)**

| Phase | Description | Status |
|-------|-------------|--------|
| 0 — Foundation | DB schema, RLS, Supabase Auth | ✅ Complete |
| 1 — Automation | n8n — 8 workflows built | ✅ Complete |
| 2 — Portal | Next.js frontend — all 3 role portals built | 🟡 In progress |
| 3 — Live integration | Real Supabase data, auth guards, logging | ⬜ Next |
| 4 — Mobile | PWA + App Store submission | ⬜ Planned |
| 5 — Launch | Legal (DPAs), marketing website, CI/CD | ⬜ Planned |
| 6 — Monetization | Pricing, Stripe, pilot program, i18n | ⬜ Planned |

---

## License

Private project — not open source. Repository is public for portfolio purposes.
