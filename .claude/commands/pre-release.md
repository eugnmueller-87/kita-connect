# /pre-release — Pre-Production Release Gate

Run this before merging any feature branch into master and deploying to production.
This is the full gate — stricter than /quality-gate which is for daily dev checks.

## Instructions for Claude

When the user runs /pre-release (optionally with a branch name like `/pre-release feature/meal-planner`):

### 1. Branch & Git state check
```bash
git status
git branch --show-current
git log master..HEAD --oneline
git diff master --name-only
```
- [ ] Working on a feature branch (NOT directly on master)
- [ ] No uncommitted changes
- [ ] All commits have meaningful messages (not "fix", "wip", "test")

### 2. Run /quality-gate checks
Run all checks from /quality-gate first. If /quality-gate FAILS, /pre-release stops here.

**Additional checks beyond /quality-gate:**

**Console & logging**
- [ ] No `console.log` with personal data (email, names, user IDs in plain text)
  ```bash
  grep -rn "console\.log" portal/src/app --include="*.ts" --include="*.tsx"
  ```
- [ ] No `console.error` leaking stack traces to client

**Database migrations**
- [ ] All new migrations are ADDITIVE only (no DROP, no RENAME, no ALTER existing columns)
- [ ] New tables have RLS policies enabled
- [ ] Migration tested on staging DB first

**Environment & secrets**
- [ ] No hardcoded URLs pointing to production Supabase/n8n from test code
  ```bash
  grep -rn "supabase\.co\|n8n\." portal/src --include="*.ts" --include="*.tsx" | grep -v ".env"
  ```
- [ ] .env.local not committed
  ```bash
  git diff master --name-only | grep -i env
  ```

**Feature completeness**
- [ ] Happy path works end-to-end on staging
- [ ] Error states handled (what happens if Supabase is down, n8n fails?)
- [ ] No TODO/FIXME comments in changed files
  ```bash
  git diff master -- "*.ts" "*.tsx" | grep -i "todo\|fixme\|hack\|xxx"
  ```

**Backward compatibility**
- [ ] Existing features still work (login, dashboard, existing DB tables unaffected)
- [ ] New DB columns have DEFAULT values (so old code doesn't break on insert)
- [ ] No breaking changes to shared components (navbar, layout)

### 3. Staging confirmation
Ask the user:
- "Was this feature tested on staging.kita-connect.cloud?"
- "Did you test with a real browser on mobile (375px)?"
- "Did you test the error path (what happens when it fails)?"

### 4. Audit log confirmation
For any new sensitive action in this feature:
- [ ] writeAuditLog called in all relevant Route Handlers
- [ ] No personal data (names, emails) in audit log meta fields — only IDs

### 5. Output
Produce a checklist result:
- ✅ passed
- ❌ failed — with file:line reference
- ⚠️ warning — not a blocker but watch it

### 6. Verdict
- **READY TO MERGE** — all checks pass → safe to open PR into master
- **NOT READY** — list exactly what must be fixed before merge

### 7. If READY — open the PR
```bash
gh pr create --base master --title "<feature name>" --body "$(cat <<'EOF'
## Summary
- [what this feature does]

## Quality Gate
- /pre-release passed ✅

## Tested on staging
- [ ] Happy path
- [ ] Error path  
- [ ] Mobile 375px

🤖 Pre-release gate passed via /pre-release skill
EOF
)"
```

## Decision guide: /quality-gate vs /pre-release

| Situation | Use |
|---|---|
| Quick check during dev | /quality-gate |
| Before marking issue Done | /quality-gate |
| Before merging to master | /pre-release |
| Before deploying to production | /pre-release |
| Small fix with no DB changes | /quality-gate is enough |
| New feature, new DB table, or auth changes | /pre-release required |
