# Kita Connect — Claude Instructions

## At the end of every session
Update `docs/recap.md` with a new entry for today's date:
- Headline: `## YYYY-MM-DD — Short title`
- Bullet points: what was built, decided, or changed
- Keep it short — one line per topic, in German

## When adding any new feature or UI text
- Every new user-facing string must be added to `portal/src/lib/translations.ts` in all 4 languages: DE, EN, TR, RU
- Use the existing flat object structure: `{ de: '...', en: '...', tr: '...', ru: '...' }`
- Then use `tr(t.yourKey)` in the component — never hardcode German strings directly
- Do this without being asked. Translation is not optional.

## General rules
- Never paste API keys, tokens, or credentials in chat. Tell the user which file to copy from.
- Communicate in German unless the user writes in English.
- Short and direct answers preferred.
- Working directory: `f:\Kita connect`
