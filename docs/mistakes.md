# Kita Connect — Mistakes & Lessons Learned

Every dead end, wrong approach, or wasted cycle gets logged here.
Goal: never repeat the same mistake twice.

---

## 2026-05-21 — SSH via password from Windows

**What we tried:** `sshpass` and piping passwords via PowerShell to `ssh` and `plink`

**Why it failed:** `sshpass` not available on Windows. Piping passwords to `ssh` on Windows doesn't work — it ignores stdin for passwords. `plink` with `-pw` flag works but hangs in background tasks because it prompts to accept the host key interactively on first connect.

**What to do instead:** Always set up SSH key auth first. Add the public key (`~/.ssh/id_ed25519.pub`) to the VPS `~/.ssh/authorized_keys` via the Hostinger web terminal, then all subsequent SSH from Claude is passwordless and non-interactive.

## 2026-05-21 — n8n Kafka trigger requires manual "Test this trigger" to start listening

**What we tried:** Imported Kafka trigger workflows, published, expected auto-execution.

**Why it failed:** In n8n, a Kafka trigger in test mode does not listen passively — you must click "Test this trigger" first to activate the listener before producing a message.

**What to do instead:** When testing a Kafka trigger in n8n, always click "Test this trigger" first, then produce the message. In production (published + active), it listens automatically without manual activation.

## 2026-05-21 — Docker networks isolation broke n8n → Redpanda connection

**What we tried:** Used `redpanda:9092` as broker address in n8n credential.

**Why it failed:** Redpanda and n8n were on separate Docker networks (`redpanda_default` vs `n8n-n3xl_default`) — containers on different networks cannot resolve each other by name.

**What to do instead:** Run `docker network connect n8n-n3xl_default redpanda` to attach Redpanda to the n8n network. Always check network membership with `docker inspect` before assuming containers can reach each other.
