# Kita Connect — System Overview & Architecture
### Technical Presentation · May 2026

---

# Page 1 — What is Kita Connect?

## The Problem

German daycare centers (Kitas) rely on **WhatsApp groups, paper forms, and phone calls** to communicate with parents and document child development. This creates:

- **Privacy violations** — WhatsApp is not GDPR-compliant for child data
- **Information silos** — no central place for development documentation
- **Manual overhead** — educators spend hours on paperwork instead of children

## The Solution

**Kita Connect** is a unified, GDPR-compliant platform for German Kitas that connects parents, educators, and management in one place.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   PARENTS              EDUCATORS              MANAGEMENT        │
│                                                                 │
│  • View child docs    • Log observations    • Send broadcasts   │
│  • Support tickets    • Write Lerngesch.   • Approve parents   │
│  • Notifications      • Track milestones   • Manage invites    │
│  • Multi-language     • AI assistance      • Full oversight    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                    KITA CONNECT PLATFORM
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           In-App           Email            SMS
        Notification       (Resend)       (seven.io)
```

## Target
- **Pilot:** 1 Kita in Berlin (Kita Bergfalke)
- **Scale:** All Kitas in Germany (~57,000)
- **Cost:** ~0 €/month (free tiers across all services)

---

# Page 2 — Tech Stack, APIs & Policies

## Technology Stack

```
┌────────────────────────────────────────────────────────────────┐
│  LAYER              SERVICE              PURPOSE               │
├────────────────────────────────────────────────────────────────┤
│  Frontend           Next.js 14           Parent + Staff Portal │
│                     (App Router)         Vercel hosting        │
├────────────────────────────────────────────────────────────────┤
│  Database           Supabase             PostgreSQL + Auth     │
│                     (EU Ireland)         RLS + Realtime        │
├────────────────────────────────────────────────────────────────┤
│  Automation         n8n                  8 Workflows           │
│                     (German company)     Webhook-triggered     │
├────────────────────────────────────────────────────────────────┤
│  Email              Resend SMTP          Transactional email   │
│                     kita-connect.cloud   3,000/month free      │
├────────────────────────────────────────────────────────────────┤
│  SMS                seven.io             Opt-in SMS channel    │
│                     (German company)     Broadcast fallback    │
├────────────────────────────────────────────────────────────────┤
│  AI                 Claude Haiku         Learning stories      │
│                     Anthropic API        FAQ chatbot           │
└────────────────────────────────────────────────────────────────┘
```

## Hosting Regions — All EU

| Service | Region | GDPR |
|---|---|---|
| Supabase | EU Ireland (eu-west-1) | ✅ |
| Vercel | Frankfurt (eu-central-1) | ✅ |
| n8n | Germany (irn.hk) | ✅ |
| Resend | EU (eu-west-1 SES) | ✅ |
| Anthropic | US — pseudonymized data only | ⚠️ mitigated |

## Key Policies in Place

| Policy | Status |
|---|---|
| Row Level Security (RLS) on all DB tables | ✅ Done |
| HTTPS / TLS everywhere | ✅ Done |
| Pseudonymization before AI API calls | ✅ Done |
| EU-only infrastructure | ✅ Done |
| Audit logging (children, profiles) | ✅ Done |
| Deletion concept (Art. 17 GDPR) | ✅ Defined |

## ⚠️ Missing DPAs — Must Be Signed Before Launch

> A **DPA (Data Processing Agreement / Auftragsverarbeitungsvertrag)** is legally required under Art. 28 GDPR whenever a third party processes personal data on your behalf.

| Provider | DPA Available | Status | Priority |
|---|---|---|---|
| **Supabase** | Yes — in dashboard | ❌ Not signed | 🔴 Critical |
| **Vercel** | Yes — in dashboard | ❌ Not signed | 🔴 Critical |
| **n8n** | Yes — on request | ❌ Not signed | 🔴 Critical |
| **seven.io** | Available | ❌ Not reviewed | 🟡 Important |
| **Anthropic** | US — needs SCCs | ❌ Not signed | 🔴 Critical + pseudonymization |

**Also missing before launch:**
- [ ] Datenschutzerklärung (Privacy Policy) — German + English
- [ ] Impressum (Legal Notice) — required by § 5 TMG
- [ ] Photo/Video consent form per child
- [ ] Data processing register (Art. 30 GDPR) — internal document

---

# Page 3 — Full System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    KITA CONNECT — SYSTEM OVERVIEW                   │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │         Next.js Frontend             │
  │  /parent  /teacher  /admin           │
  │  Supabase Auth (Magic Link / JWT)    │
  └────────────────┬─────────────────────┘
                   │ POST webhooks
                   ▼
  ┌──────────────────────────────────────┐
  │           n8n Automation             │
  │                                      │
  │  01 ticket-created                   │
  │  02 broadcast                        │
  │  03 parent-registered                │
  │  04 observation-created              │
  │  05 lerngeschichte-generieren        │
  │  06 faq-chatbot                      │
  │  07 invitation-send                  │
  │  08 parent-approval                  │
  └────────┬──────────────────┬──────────┘
           │                  │
           ▼                  ▼
  ┌─────────────────┐  ┌──────────────────────────┐
  │  Supabase DB    │  │   External Services       │
  │                 │  │                           │
  │  profiles       │  │  Resend SMTP              │
  │  notifications  │  │  → onboarding@            │
  │  children       │  │    kita-connect.cloud     │
  │  learning_      │  │                           │
  │  stories        │  │  seven.io SMS             │
  │  faq_cache      │  │  → opt-in parents         │
  │  ai_pseudonym_  │  │                           │
  │  map            │  │  Claude Haiku API         │
  │  invitations    │  │  → pseudonymized only     │
  │  tickets        │  │                           │
  │  observations   │  │  (all EU or pseudonymized)│
  └─────────────────┘  └──────────────────────────┘

  NOTIFICATION CHANNELS:
  ┌──────────────┬───────────────┬────────────┐
  │   In-App     │     Email     │    SMS     │
  │  (Supabase   │   (Resend)    │ (seven.io) │
  │  Realtime)   │               │  opt-in    │
  └──────────────┴───────────────┴────────────┘
```

---

# Page 4 — Workflow 01: Ticket Reply Notification

## What it does
When a **teacher or admin replies to a parent's support ticket**, the parent is automatically notified via in-app notification and email.

## Trigger
`POST /webhook/ticket-created` — called from the Next.js frontend when a ticket reply is saved.

## Flow

```
  Frontend saves ticket reply
           │
           ▼
  ┌─────────────────┐
  │  Webhook        │──────► Respond 200 OK (immediate)
  │  Ticket Created │
  └────────┬────────┘
           │
           ▼
  ┌──────────────────────────┐
  │  Supabase                │
  │  Fetch parent email,     │
  │  full_name, child_name   │
  │  from profiles table     │
  └────────┬─────────────────┘
           │
           ▼
  ┌──────────────────────────┐
  │  Supabase                │
  │  INSERT notifications    │
  │  type: ticket_update     │
  │  → visible in-app        │
  └────────┬─────────────────┘
           │
           ▼
  ┌──────────────────────────┐
  │  Resend SMTP             │
  │  From: onboarding@       │
  │    kita-connect.cloud    │
  │  Subject: Neue Antwort   │
  │    auf dein Ticket       │
  │  HTML email with         │
  │    Kita Connect branding │
  └──────────────────────────┘
```

**Payload expected:**
```json
{
  "ticket_id": "uuid",
  "parent_id": "uuid",
  "child_id": "uuid",
  "title": "Ticket subject",
  "reply_body": "Teacher's reply text"
}
```

---

# Page 5 — Workflow 02: Broadcast to All Parents

## What it does
Sends a **Kita-wide announcement** to all parents simultaneously, respecting individual notification preferences.

## Trigger
`POST /webhook/broadcast-created` — called when admin publishes a broadcast.

## Flow

```
  Admin publishes broadcast
           │
           ▼
  ┌─────────────────┐
  │  Webhook        │──────► Respond 200 OK
  │  Broadcast      │
  │  Created        │
  └────────┬────────┘
           │
           ▼
  ┌──────────────────────────┐
  │  Supabase                │
  │  SELECT all parents +    │
  │  notify_email            │
  │  notify_sms              │
  │  notify_push flags       │
  └────────┬─────────────────┘
           │
           ▼
  ┌──────────────────────────┐
  │  Split by Preference     │◄─ JavaScript code node
  │  → email_list            │
  │  → sms_list              │
  └────┬──────┬──────┬───────┘
       │      │      │
       ▼      ▼      ▼
  ┌────────┐  ┌────────────┐  ┌──────────┐
  │In-App  │  │   Email    │  │   SMS    │
  │for ALL │  │(if opted   │  │(if opted │
  │parents │  │   in)      │  │   in)    │
  │        │  │            │  │          │
  │Supabase│  │Resend SMTP │  │seven.io  │
  └────────┘  └────────────┘  └──────────┘
```

**Notification channels:** In-App (always) + Email (if `notify_email = true`) + SMS (if `notify_sms = true`)

---

# Page 6 — Workflow 03 & 04: Onboarding & Observations

## Workflow 03 — Welcome Email on Registration

### What it does
When a **parent completes registration**, they receive a welcome email and an in-app notification.

```
  Parent registers
       │
       ▼
  Webhook ──► Respond 200
       │
       ▼
  Wait 2 seconds
  (ensures Supabase Auth is ready)
       │
       ▼
  ┌─────────────────────────┐
  │  Resend SMTP            │
  │  Welcome Email          │
  │  "Willkommen bei        │
  │   Kita Connect!"        │
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  Supabase               │
  │  INSERT notification    │
  │  type: welcome          │
  └─────────────────────────┘
```

---

## Workflow 04 — Development Observation Notification

### What it does
When a **teacher logs a child development observation**, the parent is notified in-app (no email — observation details stay private until reviewed).

```
  Teacher saves observation
           │
           ▼
  Webhook ──► Respond 200
           │
           ▼
  ┌──────────────────┐
  │  Check:          │
  │  parent_id set?  │
  └──────┬───────────┘
         │ yes
         ▼
  Build notification payload
  Category label mapping:
  sprache → "Sprachentwicklung"
  motorik → "Motorik"
  sozial  → "Sozialverhalten"
  etc.
         │
         ▼
  ┌──────────────────────────┐
  │  Supabase                │
  │  INSERT notification     │
  │  type: observation_added │
  │  "Neue Beobachtung:      │
  │   Sprachentwicklung"     │
  └──────────────────────────┘
```

---

# Page 7 — Workflow 05: AI Learning Story Generation

## What it does
Teachers describe a child observation in plain text. Claude Haiku generates a **Lerngeschichte** (Learning Story) draft in the New Zealand style — warm, child-addressed, pedagogically sound.

## GDPR Protection: Pseudonymization
**Real child names never leave the EU database.** Every child has a pseudonym (`Kind-A1B2`) stored in `ai_pseudonym_map`. Only the pseudonym is sent to the Anthropic API.

## Flow

```
  Teacher triggers story generation
           │
           ▼
  Webhook ──► Respond 200
           │
           ▼
  ┌──────────────────────────┐
  │  Supabase                │
  │  SELECT pseudonym        │
  │  FROM ai_pseudonym_map   │
  │  WHERE child_id = $1     │
  └────────┬─────────────────┘
           │
           ▼
  ┌──────────────────────────┐
  │  Pseudonym exists?       │
  └────┬──────────┬──────────┘
       │ yes      │ no
       ▼          ▼
  Build prompt  Return 422
  (GDPR-safe)   Error
       │
       ▼
  ┌──────────────────────────────────────────────┐
  │  Claude Haiku API                            │
  │  Prompt: "Kind-A1B2 (4 Jahre) hat heute..."  │
  │  → 150-250 words, Du-Form, warm tone         │
  │  → NO real name, NO birth date               │
  └────────────────┬─────────────────────────────┘
                   │
                   ▼
  ┌──────────────────────────┐
  │  Supabase                │
  │  UPDATE learning_stories │
  │  SET ai_draft = [text]   │
  └────────┬─────────────────┘
           │
           ▼
  ┌──────────────────────────┐
  │  Supabase                │
  │  INSERT notification     │
  │  → notify teacher        │
  │  "Entwurf bereit zur     │
  │   Überarbeitung"         │
  └──────────────────────────┘
```

**Teacher then replaces pseudonym with real name before publishing.**

---

# Page 8 — Workflow 06: FAQ Chatbot (Cache-First)

## What it does
Parents and educators can ask Kita-related questions. Answers are cached to minimize AI API costs — **most questions are answered from cache, no API call needed.**

## Flow

```
  User submits question
           │
           ▼
  ┌──────────────────────────┐
  │  Normalize & Hash        │
  │  "Wie lange dauert die   │
  │   Eingewöhnung?"         │
  │  → faq_abc123            │
  └────────┬─────────────────┘
           │
           ▼
  ┌──────────────────────────┐
  │  Supabase                │
  │  SELECT FROM faq_cache   │
  │  WHERE hash = faq_abc123 │
  └────────┬─────────────────┘
           │
     ┌─────┴──────┐
     │            │
  CACHE HIT    CACHE MISS
     │            │
     ▼            ▼
  Increment    Build Claude
  hit_count    prompt
     │            │
     ▼            ▼
  Return       Claude Haiku
  cached       → max 3 sentences
  answer       → no personal data
                 │
                 ▼
              Store in
              faq_cache
                 │
                 ▼
              Return answer
     │            │
     └─────┬──────┘
           │
           ▼
  ┌──────────────────────────┐
  │  Respond to client       │
  │  { answer, source }      │
  │  source: "cache"         │
  │       or "claude"        │
  └──────────────────────────┘
```

**Cost optimization:** Only unique questions hit the Claude API. Repeated questions are free.

---

# Page 9 — Workflows 07 & 08: Invitations & Approvals

## Workflow 07 — Invitation Email

### What it does
When an admin or teacher sends an invitation, the system automatically sends the correct email depending on whether the invitee is a **parent** or **staff member**.

```
  Invitation created in DB
           │
           ▼
  Webhook ──► Respond 200
           │
           ▼
  ┌──────────────────────────┐
  │  Supabase                │
  │  SELECT invitation +     │
  │  invited_by_name +       │
  │  child_name              │
  └────────┬─────────────────┘
           │
           ▼
  ┌──────────────────────────┐
  │  Invitation found?       │
  └────┬──────────┬──────────┘
       │ yes      │ no → stop
       ▼
  ┌──────────────────────────┐
  │  Parent or Staff?        │
  └────┬──────────┬──────────┘
       │ parent   │ staff
       ▼          ▼
  ┌──────────┐  ┌──────────────┐
  │  Resend  │  │  Resend      │
  │  Parent  │  │  Staff       │
  │  Email   │  │  Email       │
  │  "Ihr    │  │  "Willkommen │
  │  Kind    │  │   im Team"   │
  │  wartet" │  │              │
  └──────────┘  └──────────────┘
```

---

## Workflow 08 — Parent Account Approval

### What it does
When an admin **approves or rejects** a pending parent account, the parent is notified immediately via email.

```
  Admin clicks Approve / Reject
           │
           ▼
  Webhook ──► Respond 200
  payload: { parent_id, action }
           │
           ▼
  ┌──────────────────────────┐
  │  action = "approve"?     │
  └────┬──────────┬──────────┘
       │ yes      │ no (reject)
       ▼          ▼
  ┌──────────┐  ┌──────────────┐
  │ Supabase │  │  Supabase    │
  │ SET      │  │  SET         │
  │ status = │  │  status =    │
  │ 'active' │  │ 'suspended'  │
  └────┬─────┘  └──────┬───────┘
       │               │
       ▼               ▼
  ┌──────────┐  ┌──────────────┐
  │ Supabase │  │  Resend      │
  │ notify   │  │  Rejection   │
  │ in-app   │  │  Email       │
  └────┬─────┘  └──────────────┘
       │
       ▼
  ┌──────────┐
  │  Resend  │
  │  Approval│
  │  Email   │
  │ "Ihr     │
  │  Zugang  │
  │  ist     │
  │  aktiv"  │
  └──────────┘
```

---

# Page 10 — Status, Open Items & Roadmap

## Current Status

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Concept, DB Schema, RLS Policies | ✅ Complete |
| Phase 1 | n8n Automation (all 8 workflows) | ✅ Complete |
| Phase 2 | Next.js Frontend | 🔄 Starting now |
| Phase 3 | Educator & Admin Portal | ⬜ Planned |
| Phase 4 | i18n, Polish & Pilot Launch | ⬜ Planned |
| Phase 5 | Mobile App (React Native/Expo) | ⬜ Planned |

## What's Working Today

- ✅ All 8 n8n workflows published and active
- ✅ Email domain `kita-connect.cloud` verified (Resend + Hostinger DNS)
- ✅ Supabase database with full schema, RLS, and triggers
- ✅ Anthropic (Claude Haiku) connected
- ✅ seven.io SMS connected via environment variable
- ✅ GDPR pseudonymization for AI calls implemented

## Open Items Before Launch

### 🔴 Critical (Legal Blockers)
- [ ] Sign DPA with **Supabase** (in Supabase dashboard)
- [ ] Sign DPA with **Vercel** (in Vercel dashboard)
- [ ] Sign DPA with **n8n** (contact n8n)
- [ ] Sign DPA / review SCCs with **Anthropic** (US company)
- [ ] Sign DPA with **seven.io**
- [ ] Create **Datenschutzerklärung** (Privacy Policy)
- [ ] Create **Impressum** (Legal Notice)

### 🟡 Important (Before Pilot)
- [ ] Next.js frontend (Phase 2)
- [ ] Parent data export function (GDPR Art. 15 — right of access)
- [ ] Account deletion function (GDPR Art. 17)
- [ ] Monthly deletion cron job (time-based retention)
- [ ] EU AI Act assessment (is Kita Connect high-risk AI?)

### ⬜ Nice to Have
- [ ] Mobile app (React Native / Expo)
- [ ] Multi-language UI (DE / EN / RU)
- [ ] BSI IT-Grundschutz or ISO 27001 certification review
- [ ] Data Protection Officer (required if >20 staff with data access)

---

## Summary

```
┌─────────────────────────────────────────────────────────────┐
│  Kita Connect in one sentence:                              │
│                                                             │
│  A GDPR-compliant, AI-assisted Kita management platform    │
│  built on modern EU-hosted infrastructure, automating      │
│  parent communication, child documentation, and educator   │
│  workflows — at near-zero monthly cost.                    │
└─────────────────────────────────────────────────────────────┘
```

| Metric | Value |
|---|---|
| Workflows automated | 8 |
| Notification channels | 3 (In-App, Email, SMS) |
| AI models used | Claude Haiku |
| Monthly infrastructure cost | ~0 € (free tiers) |
| Data residency | EU only |
| GDPR compliance | By design |
