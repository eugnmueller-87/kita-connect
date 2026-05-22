# Kita Connect — Tech TLDR

*For presentations and technical questions. No jargon, straight answers.*

---

## What is Kita Connect?

A fully working web app for daycare centers — three separate portals in one application: for parents, educators, and management. Live at [app.kita-connect.cloud](https://app.kita-connect.cloud).

---

## Why this project?

Daycare centers today communicate via paper notes, WhatsApp groups, and phone calls. None of that is GDPR-compliant, structured, or efficient. Kita Connect replaces it with a closed, secure system — at almost zero operating cost.

---

## Tech Stack — What is each technology used for?

### Next.js 14 (React)
The actual web app — everything the user sees in the browser. Next.js renders pages partly on the server (faster, more secure) and partly in the browser (interactive). In this project specifically: the three portals (parent, teacher, admin), all forms, navigation, and page routing.

### Supabase (PostgreSQL)
The database — stores everything: child profiles, observations, learning stories, notifications, invitations, meal plans. Supabase also provides authentication (login/logout), file storage (child photos), and row-level security rules (who is allowed to read what) out of the box. No separate auth server needed.

### Vercel
Hosting for the Next.js app. Every time code is pushed to GitHub, Vercel automatically builds a new version and deploys it live — in about 60 seconds. No manual server setup required.

### n8n (self-hosted on VPS)
Automation tool — similar to Zapier, but self-hosted. Concrete uses: when a parent is invited, n8n sends the email. When a ticket is created, n8n notifies the educators. When a message is flagged as toxic, n8n blocks it. Runs on a private server in Frankfurt.

### Redpanda (Kafka-compatible)
An event bus — the app writes "events" (e.g. "ticket created") into Redpanda, and n8n listens and reacts. This decouples the app from the automations: if n8n has an error, the save operation in the app still completes successfully. Standard architecture pattern at larger scale (Kafka), here in a minimal setup.

### Mistral API
The AI layer. Three concrete use cases:
- **FAQ Bot**: answers common parent questions using a fixed set of prompts and context
- **Learning Stories**: assists educators in writing developmental reports
- **Content Moderation**: checks parent messages for toxic content before they are saved

Mistral's smallest model is used by default — very cost-efficient compared to larger alternatives.

### Hostinger VPS (Frankfurt)
A private Linux server (~€5/month) running n8n and Redpanda. Important for GDPR: data stays in Germany. Traefik runs in front of it as a reverse proxy (HTTPS termination, routing).

---

## How does the architecture work?

```
Browser (Parent / Teacher / Admin)
        ↓
    Next.js App  (Vercel — public cloud)
        ↓
    Supabase     (Database + Auth + File Storage)
        ↓
    Redpanda     (Event Bus — private VPS Frankfurt)
        ↓
    n8n          (Automations: email, SMS, notifications)
```

The app never sends emails or SMS directly — it publishes an event (e.g. "ticket.created"), and n8n picks it up and handles the rest. This means an automation failure never breaks the core app.

---

## What can each role do?

### Parent Portal
- Create a child profile (photo, birthday, favorite food, etc.)
- Read notifications (field trips, sick day policies, etc.)
- View the weekly meal plan (with German DGE nutrition traffic light)
- Open support tickets ("Can my child be picked up early tomorrow?")
- Use the AI FAQ bot for common questions
- Switch language: German, English, Turkish, Russian

### Teacher Portal
- See all children in the group
- Document observations by category (Language, Motor Skills, Social, Creativity, Math, Independence)
- Write learning stories (AI-assisted via Claude)
- Send broadcast messages to parent groups
- Manage the meal plan

### Admin Portal
- Send invitations (parents and educators receive a registration link by email)
- Approve parent registrations
- Manage Kitas and Träger (umbrella organizations)
- Send messages to everyone

---

## How do users get access?

There is no open registration form. Only people who receive an invitation can sign up — this prevents strangers from registering as a parent.

Flow:
1. Admin enters an email address and selects a role
2. n8n automatically sends an email with a registration link
3. Recipient clicks the link, sets a password, and is in

---

## What about GDPR?

- All data is stored in the EU (Supabase Frankfurt, private VPS Frankfurt)
- No Google Analytics, no Facebook Pixel
- Audit log: every sensitive action is recorded (who changed what and when)
- Account deletion: parents can delete their own account, data is purged after 90 days
- AI policy: Mistral is explicitly forbidden from rating, ranking, or comparing children (enforced in system prompts)
- Content moderation: parent messages are automatically checked, toxic content is blocked before saving

---

## What does it cost?

| Service | Cost |
|---------|------|
| Vercel (hosting) | ~€0 (free tier) |
| Supabase (database) | ~€0 (free tier) |
| n8n + Redpanda (VPS) | ~€5–7/month |
| Claude API (AI) | ~€0–2/month (Haiku is very cheap) |
| **Total** | **~€5–9/month** |

For comparison: commercial daycare software costs €200–500/month.

---

## Where is the code?

- **GitHub:** [eugnmueller-87/kita-connect](https://github.com/eugnmueller-87/kita-connect)
- **Live:** [app.kita-connect.cloud](https://app.kita-connect.cloud)
- Every `git push` → Vercel rebuilds and deploys automatically

---

## What was the biggest technical challenge?

**Row Level Security (RLS) in Supabase.**

The database has built-in security rules: every request is checked to see whether the logged-in user is actually allowed to read or write that data. This protects the data well, but makes debugging difficult because some operations are silently blocked instead of returning a clear error.

Solution: server-side API routes using an admin key that bypasses RLS — but only on the server, never exposed to the browser.

---

## What would I do differently in a real product?

1. **Fix the database schema upfront** — adding columns later wastes time and creates migration overhead
2. **Automated testing** — currently no test suite; that would be mandatory in production
3. **Mobile app** — currently web-only (responsive), but a native app would be better for parents
4. **Multi-tenancy from day one** — the Träger/Kita model was added later; it should have been in the initial design

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Parent | parenttest@kita-connect.cloud | abc123 |
| Teacher | teachertest@kita-connect.cloud | abc123 |
| Admin | admintest@kita-connect.cloud | abc123 |
