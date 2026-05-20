# Kita Connect — Recap

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
