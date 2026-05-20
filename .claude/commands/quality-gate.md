# /quality-gate — Code & Work Quality Review

Run this before marking any issue as Done. Performs a structured review of recent changes.

## Instructions for Claude

When the user runs /quality-gate (optionally with an issue number like `/quality-gate 9`):

### 1. Code review checklist
Check the staged/recent changes against these criteria:

**Security**
- [ ] No API keys, tokens, or secrets in code (only in .env.local / Vercel env vars)
- [ ] No user input passed unsanitized to DB queries (use Supabase parameterized queries)
- [ ] Service role key only used server-side (Route Handlers), never in client components
- [ ] No child names or personal data logged to console or sent to external services unencrypted

**GDPR**
- [ ] New DB queries respect RLS (no `supabase.from()` bypassing row-level security on client)
- [ ] Any new data collection has a stated legal basis
- [ ] Child data pseudonymized before any AI API call

**Code quality**
- [ ] TypeScript: no `any` types without justification
- [ ] No mock data left in production paths (only in clearly named mock files)
- [ ] No dead code or commented-out blocks
- [ ] Server components used where data fetching is possible (prefer over client-side fetching)

**UX**
- [ ] Loading states handled (not blank screens while fetching)
- [ ] Error states handled (not silent failures)
- [ ] Mobile layout checked (max-w-* containers, readable on 375px width)

### 2. Audit trail check
For any sensitive action (login, approval, invitation, data deletion):
- [ ] Is it written to the Supabase audit_log table?
- [ ] Does the log entry include: user_id, action, timestamp, target_id?

### 3. Run checks
```bash
cd portal && npx tsc --noEmit 2>&1
cd portal && npx next build 2>&1 | tail -20
```

### 4. Output
Produce a short checklist result:
- ✅ passed items
- ❌ failed items with specific file:line references
- ⚠️ warnings (things to watch, not blockers)

If an issue number was given, post the quality gate result as a comment on that GitHub issue:
```
gh issue comment <number> --repo eugnmueller-87/kita-connect --body "..."
```

### 5. Verdict
- **PASS** — all P0 security and GDPR checks passed → safe to move to Done
- **FAIL** — one or more P0 checks failed → do not move to Done, list what to fix
