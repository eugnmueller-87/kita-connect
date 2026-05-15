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

See [roadmap.html](roadmap.html) for the full product roadmap.

| Phase | Status |
|-------|--------|
| 0 — Prototypes & Concept | ✅ Complete |
| 1 — Infrastructure & Automation (n8n) | 🟡 In progress |
| 2 — Next.js App implementation | ⬜ Upcoming |
| 3 — Educator & Admin portal | ⬜ Upcoming |
| 4 — i18n, Polish & Launch | ⬜ Upcoming |

---

## License

Private project — not open source. Repository is public for portfolio purposes.
