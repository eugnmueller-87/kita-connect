# Kita Bergfalke — Handover für VS Code Agent

## Projekt-Kontext

**App-Name:** Kita Bergfalke  
**Zielgruppe:** Eltern, Erzieher, Kita-Leitung  
**Standort:** Berlin  
**Ziel:** Vollständige Kita-Management-App mit nahezu 0 €/Monat laufenden Kosten

---

## Tech Stack

| Layer | Technologie | Warum |
|-------|------------|-------|
| Frontend | Next.js (App Router) | Kostenlos, Vercel-nativ |
| Backend/DB | Supabase | Großzügiger Free Tier, RLS, Realtime |
| Hosting | Vercel | Free Tier ausreichend für 1 Kita |
| Auth | Supabase Magic Link | Kein Passwort-Management |
| E-Mail | Resend | 3.000/Monat kostenlos |
| Push | Web Push API | Browser-nativ, kostenlos |
| KI-Chatbot | Claude Haiku via Anthropic API | Günstigstes Modell |

---

## Marken-Identität

```css
--teal:       #2EA89A;   /* Primärfarbe */
--teal-light: #E1F5EE;
--teal-dark:  #1D7A6F;
--olive:      #8B7D5E;   /* Sekundärfarbe */
--olive-light:#F5F2EC;
```

- **Theme:** Hell (Light Mode)
- **Logo:** Kita Bergfalke (Bergfalken-Vogel, Teal/Olive)
- **Sprachen:** Deutsch, Englisch, Russisch (i18n erforderlich)

---

## Compliance & Datenschutz

- **DSGVO-konform** — EU-basiertes Hosting (Supabase EU-Region, Vercel Frankfurt)
- **Row Level Security (RLS)** in Supabase für alle Kinddaten — Eltern sehen nur ihre eigenen Kinder
- Keine Daten an Dritte außerhalb EU
- Child-Data-Privacy ist **nicht verhandelbar**

---

## Bereits fertiggestellte Screens / Features (als HTML-Prototypen)

### 1. App-Architektur-Diagram
Vollständige Systemarchitektur mit allen Services und Datenflüssen bereits visualisiert.

### 2. KI-Chatbot
- **Two-Tier Cache:** FAQ-Cache → Claude API (spart API-Kosten massiv)
- Flows: FAQ-Anfrage trifft Cache → Cache-Miss → Claude Haiku → Antwort cachen
- System-Prompt: Kita-Assistent für Bergfalke, kennt Öffnungszeiten, Regeln, etc.
- Modell: `claude-haiku-4-5` (kostengünstigster Tier)

### 3. Eltern-Profil & Kindmeilensteine
- Private Meilenstein-Tracking-Funktion (nur für Eltern sichtbar)
- RLS-geschützte Tabelle `child_milestones` in Supabase

### 4. Erzieher-Direktnachrichten
- Multi-Select Quick-Template Chips (z.B. "Windeln", "Erkältung", "Abwesenheit")
- Emoji-Support
- Chat-Bubbles UI (Mobile-first)

### 5. Ticketing-System (Erzieher-seitig)
- Eltern-Anfragen als Tickets
- Status: Offen / In Bearbeitung / Erledigt
- Erzieher bearbeiten und schließen Tickets

### 6. Entwicklungsdoku (letzter gebautr Screen)
- **Schnellerfassung:** Kind → Bereich-Chips → Text → 4-Stufen-Skala → speichern
- **Standardisierte Bögen:** Sismik, Seldak, Perik, Sprachlerntagebuch Berlin
- **Lerngeschichten:** Freitext + Chips → KI (Claude Haiku) schreibt Entwurf im neuseeländischen Stil
- **Portfolio-Timeline:** Chronologische Einträge pro Kind
- Status: **Prototyp fertig, noch nicht in Next.js implementiert**

### 7. Offline-HTML-Präsentation
Vollständige Kita-Bergfalke-Pitch-Präsentation als self-contained HTML mit eingebettetem Base64-Logo.

---

## Supabase DB-Schema (geplant)

```sql
-- Kinder
children (id, parent_id, name, group_name, birth_date, created_at)

-- Meilensteine (privat, nur Eltern)
child_milestones (id, child_id, title, description, date, created_at)

-- Entwicklungsbeobachtungen (Erzieher)
observations (id, child_id, teacher_id, category, text, scale_value, created_at)

-- Standardbögen (Sismik/Seldak/Perik)
standardized_assessments (id, child_id, teacher_id, type, answers_json, created_at)

-- Lerngeschichten
learning_stories (id, child_id, teacher_id, situation, ai_draft, final_text, created_at)

-- Nachrichten
messages (id, sender_id, receiver_id, content, template_tags, read_at, created_at)

-- Tickets
tickets (id, parent_id, teacher_id, subject, body, status, created_at, resolved_at)

-- FAQ-Cache (Chatbot)
faq_cache (id, question_hash, question_text, answer, hit_count, created_at)
```

---

## Was als nächstes implementiert werden soll

### Priorität 1: n8n-Integration
Der Nutzer möchte **n8n** für Automatisierungen einsetzen. Mögliche Workflows:
- Neue Eltern-Registrierung → Willkommens-E-Mail via Resend
- Neues Ticket → Erzieher-Benachrichtigung (Push/E-Mail)
- Tägliche Zusammenfassung → Leitung
- Sprachlerntagebuch-Erinnerung → Erzieher-Push

**n8n Setup:**
- Self-hosted n8n auf Railway/Render (Free Tier) ODER n8n Cloud (Starter: 20€/Monat)
- Supabase Webhook → n8n Trigger → Resend/Web Push
- Alternativ: Supabase Edge Functions als Trigger

### Priorität 2: Next.js App-Gerüst aufsetzen
```bash
npx create-next-app@latest kita-bergfalke \
  --typescript --tailwind --app --src-dir
```
Danach:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Priorität 3: Screens aus Prototypen in Next.js überführen
Reihenfolge: Auth → Eltern-Dashboard → Nachrichten → Entwicklungsdoku

---

## Wichtige Prinzipien für diesen Agent

1. **Kostenminimierung** — Jede Entscheidung gegen Free-Tier-Limits abwägen
2. **Self-contained HTML** — Demos/Präsentationen immer als offline-fähige HTML-Datei
3. **Polished UI** — Bergfalke-Farben (#2EA89A, #8B7D5E), Light Theme, Mobile-first
4. **Eugen kommuniziert auf Deutsch** — Antworten auf Deutsch, kurz und direkt
5. **Iterative Verfeinerung** — Gezielte Anpassungen, keine kompletten Rewrites

---

## Nächste konkrete Frage an den Agent

„Ich möchte n8n mit Supabase verbinden. Welche Workflows sollen wir zuerst bauen, und wie richte ich n8n ein ohne monatliche Kosten?"
