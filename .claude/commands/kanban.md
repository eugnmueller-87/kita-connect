# /kanban — Kita Connect Project Board

Interact with the GitHub project board at https://github.com/users/eugnmueller-87/projects/9

Project number: 9 | Owner: eugnmueller-87 | Repo: eugnmueller-87/kita-connect

## What you can do

### View the board
```
gh project item-list 9 --owner eugnmueller-87 --format json
```

### Show issues by status
Show all items grouped by status. Use this to give a quick Kanban overview.

### Move an issue to a new status
```
gh project item-edit --project-id PVT_kwHOEI0pfs4BYJOZ --id <ITEM_ID> \
  --field-id PVTSSF_lAHOEI0pfs4BYJOZzhTRFys \
  --single-select-option-id <STATUS_ID>
```

Status option IDs:
- Backlog:     f75ad846
- Ready:       61e4505c
- In progress: 47fc9ee4
- In review:   df73e18b
- Done:        98236657

Priority option IDs:
- P0: 79628723
- P1: 0a877460
- P2: da944a9c

Size option IDs:
- XS: 6c6483d2
- S:  f784b110
- M:  7515a9f1
- L:  817d0097
- XL: db339eb2

### Get an item ID from an issue number
```
gh project item-list 9 --owner eugnmueller-87 --format json
```
Then find the item where content.number matches the issue number.

### Create a new issue and add to board
```
gh issue create --repo eugnmueller-87/kita-connect --title "..." --label "..." --body "..."
gh project item-add 9 --owner eugnmueller-87 --url <issue-url>
```

## Issue label conventions
- phase:0-foundation — DB schema, auth, prototypes
- phase:1-automation — n8n workflows
- phase:2-portal — Next.js frontend screens
- phase:3-live — Live Supabase integration, auth guards, logging
- phase:4-mobile — PWA, mobile app
- phase:5-launch — Legal, CI/CD, marketing website, app stores
- phase:6-monetize — Pricing, Stripe, pilot program, i18n
- legal — GDPR, DPA, legal requirements
- infrastructure — Hosting, CI/CD, env setup
- ux — Design and UX work

## Instructions for Claude

When the user runs /kanban, do the following:

1. **List** — fetch the board with `gh project item-list 9 --owner eugnmueller-87 --format json` and display a clean summary grouped by status (Done / In progress / Ready / Backlog).

2. **Move** — if the user says "move #X to [status]", find the item ID for issue #X and update its status field.

3. **Add** — if the user describes a new task, create a GitHub issue with the right label and add it to the board. Ask for priority (P0/P1/P2) and size (XS/S/M/L/XL) if not obvious.

4. **Close** — if the user says "close #X" or "mark #X as done", set status to Done AND close the GitHub issue.

5. **Quality gate** — before marking anything as Done, ask: "What was tested? Any edge cases verified?" Log the answer as a comment on the issue.

Always show the board URL at the end: https://github.com/users/eugnmueller-87/projects/9/views/1
