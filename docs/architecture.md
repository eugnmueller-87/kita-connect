# Kita Connect — System Architecture

## Complete Workflow Overview

```mermaid
flowchart TD
    subgraph FRONTEND["Frontend (Next.js)"]
        APP["Kita Connect Portal"]
    end

    subgraph N8N["n8n Automation Layer"]
        WF01["01 · ticket-created\n/ticket-created"]
        WF02["02 · broadcast\n/broadcast-created"]
        WF03["03 · parent-registered\n/parent-registered"]
        WF04["04 · observation-created\n/observation-created"]
        WF05["05 · lerngeschichte\n/lerngeschichte-generieren"]
        WF06["06 · faq-chatbot\n/faq-chatbot"]
        WF07["07 · invitation-send\n/invitation-created"]
        WF08["08 · parent-approval\n/parent-approval"]
    end

    subgraph DB["Supabase (PostgreSQL)"]
        T_PROFILES["profiles"]
        T_NOTIF["notifications"]
        T_STORIES["learning_stories"]
        T_FAQ["faq_cache"]
        T_PSEUDO["ai_pseudonym_map"]
        T_INVITE["invitations"]
        T_CHILDREN["children"]
    end

    subgraph EXTERNAL["External Services"]
        RESEND["Resend SMTP\nonboarding@kita-connect.cloud"]
        SEVEN["seven.io\nSMS Gateway"]
        CLAUDE["Claude Haiku\nAnthropic API"]
    end

    APP -->|"POST webhook"| WF01
    APP -->|"POST webhook"| WF02
    APP -->|"POST webhook"| WF03
    APP -->|"POST webhook"| WF04
    APP -->|"POST webhook"| WF05
    APP -->|"POST webhook"| WF06
    APP -->|"POST webhook"| WF07
    APP -->|"POST webhook"| WF08

    WF01 --> T_PROFILES
    WF01 --> T_NOTIF
    WF01 --> RESEND

    WF02 --> T_PROFILES
    WF02 --> T_NOTIF
    WF02 --> RESEND
    WF02 --> SEVEN

    WF03 --> T_NOTIF
    WF03 --> RESEND

    WF04 --> T_NOTIF

    WF05 --> T_PSEUDO
    WF05 --> CLAUDE
    WF05 --> T_STORIES
    WF05 --> T_NOTIF

    WF06 --> T_FAQ
    WF06 --> CLAUDE

    WF07 --> T_INVITE
    WF07 --> T_CHILDREN
    WF07 --> RESEND

    WF08 --> T_PROFILES
    WF08 --> T_NOTIF
    WF08 --> RESEND
```

---

## Workflow Details

### 01 · Ticket Reply Notification
**Trigger:** Teacher posts a reply to a parent's support ticket  
**Flow:** Fetch parent data → Write in-app notification → Send email

```mermaid
flowchart LR
    W(Webhook) --> A(Respond 200)
    W --> B[(Supabase\nget parent)]
    B --> C[(Supabase\nwrite notification)]
    C --> D[/Resend\nEmail/]
```

---

### 02 · Broadcast to All Parents
**Trigger:** Admin sends a broadcast message  
**Flow:** Fetch all parents → Split by preference → In-app for all + Email/SMS if opted in

```mermaid
flowchart LR
    W(Webhook) --> A(Respond 200)
    W --> B[(Supabase\nall parents)]
    B --> C{Split by\npreference}
    C --> D[(In-App\nfor ALL)]
    C --> E{Email\nrecipients?}
    C --> F{SMS\nrecipients?}
    E -->|yes| G[/Resend\nEmail/]
    F -->|yes| H[/seven.io\nSMS/]
```

---

### 03 · Welcome Email on Registration
**Trigger:** New parent registers  
**Flow:** 2s delay → Welcome email → In-app notification

```mermaid
flowchart LR
    W(Webhook) --> A(Respond 200)
    W --> B[2s wait]
    B --> C[/Resend\nWelcome Email/]
    C --> D[(Supabase\nwrite notification)]
```

---

### 04 · Observation Notification
**Trigger:** Teacher adds a child development observation  
**Flow:** Check parent_id → Build payload → Write in-app notification

```mermaid
flowchart LR
    W(Webhook) --> A(Respond 200)
    W --> B{Parent ID\npresent?}
    B -->|yes| C[Build payload]
    C --> D[(Supabase\nwrite notification)]
    B -->|no| E[stop]
```

---

### 05 · AI Learning Story Generation (GDPR-Pseudonymized)
**Trigger:** Teacher requests a learning story draft  
**Flow:** Fetch pseudonym → Build prompt (no real name) → Claude Haiku → Save draft → Notify teacher

```mermaid
flowchart LR
    W(Webhook) --> A(Respond 200)
    W --> B[(Supabase\nget pseudonym)]
    B --> C{Pseudonym\nexists?}
    C -->|no| ERR[422 Error]
    C -->|yes| D[Build prompt\npseudonymized]
    D --> E[/Claude Haiku\ngenerate story/]
    E --> F[Extract text]
    F --> G[(Supabase\nsave ai_draft)]
    G --> H[(Supabase\nnotify teacher)]
```

---

### 06 · FAQ Chatbot (Cache-First)
**Trigger:** Parent or teacher asks a question  
**Flow:** Normalize & hash question → Check cache → Cache hit: return immediately / Cache miss: ask Claude → Store answer

```mermaid
flowchart LR
    W(Webhook) --> A[Normalize\n& hash]
    A --> B[(Supabase\ncache lookup)]
    B --> C{Cache\nhit?}
    C -->|yes| D[(Increment\nhit count)]
    D --> E[Return cached\nanswer]
    C -->|no| F[Build Claude\nprompt]
    F --> G[/Claude Haiku\nFAQ answer/]
    G --> H[Extract answer]
    H --> I[(Supabase\nstore in cache)]
    E --> J[/Respond\nto client/]
    I --> J
```

---

### 07 · Invitation Email
**Trigger:** Admin/Teacher invites a parent or new staff member  
**Flow:** Fetch invitation details → Parent or Staff? → Send appropriate email

```mermaid
flowchart LR
    W(Webhook) --> A(Respond 200)
    W --> B[(Supabase\nget invitation)]
    B --> C{Invitation\nfound?}
    C -->|yes| D{Parent or\nStaff?}
    D -->|parent| E[/Resend\nParent Email/]
    D -->|staff| F[/Resend\nStaff Email/]
    C -->|no| G[stop]
```

---

### 08 · Parent Account Approval
**Trigger:** Admin approves or rejects a pending parent account  
**Flow:** Approve → Activate in DB + notify + email / Reject → Suspend + email

```mermaid
flowchart LR
    W(Webhook) --> A(Respond 200)
    W --> B{Approve or\nReject?}
    B -->|approve| C[(Supabase\nset active)]
    C --> D[(Supabase\nwrite notification)]
    C --> E[/Resend\nApproval Email/]
    B -->|reject| F[(Supabase\nset suspended)]
    F --> G[/Resend\nRejection Email/]
```

---

## Notification Channels

| Channel | Service | Workflows |
|---------|---------|-----------|
| In-App | Supabase `notifications` table | 01, 02, 03, 04, 05, 08 |
| Email | Resend SMTP (`onboarding@kita-connect.cloud`) | 01, 02, 03, 07, 08 |
| SMS | seven.io | 02 (opt-in only) |

## AI Usage

| Workflow | Model | Purpose | GDPR |
|----------|-------|---------|------|
| 05 | Claude Haiku | Generate learning story draft | Pseudonymized — no real names sent to API |
| 06 | Claude Haiku | Answer FAQ questions | No personal data in prompts |

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts (parents, teachers, admins) with notification preferences |
| `notifications` | In-app notification inbox |
| `learning_stories` | AI-generated story drafts |
| `faq_cache` | Cached FAQ answers (hash → answer) |
| `ai_pseudonym_map` | Maps child_id → pseudonym for GDPR-safe AI calls |
| `invitations` | Pending invitations with expiry |
| `children` | Child profiles linked to parents |
