# telegram-bot

A Bun + grammY bot that gathers product requirements over Telegram and writes
validated specs into the meta-repo's `specs/inbox/`.

## Contract
This bot is a **producer** for the meta-repo. It only ever writes specs with
`status: draft|submitted`. The schema it targets lives at
`meta-repo/specs/spec.schema.json`; the zod mirror is `src/spec/schema.ts`
(keep the two in sync).

## Layout
- `src/index.ts` — grammY entry + commands (`/start`, `/help`, `/new`).
- `src/config.ts` — env (BOT_TOKEN, SPECS_DIR, ALLOWLIST, GIT_COMMIT).
- `src/spec/` — `schema.ts` (zod), `builder.ts` (input → spec + markdown),
  `writer.ts` (write to inbox + optional git commit).
- `src/bot/` — commands/conversations/middleware (filled in A-1+).

## Run
```bash
bun install
cp .env.example .env        # set BOT_TOKEN
bun run dev                 # long-polling bot
# no token? verify the contract end-to-end:
bun run spec:demo           # writes one demo spec into the meta-repo inbox
```

## Roadmap
- A-1: multi-turn requirement gathering (planning → design → constraints)
- A-2: full zod validation + confirmation step before submit
- A-3: `/status`, allowlist hardening
- A-4: Claude API to structure free-form chat into a spec
