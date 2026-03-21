---
path: apps/crypto-taxes
summary: Next.js App Router shell for the crypto tax workflow
tags: [nextjs, app-router]
---

# @beep/crypto-taxes

Next.js App Router workspace for the crypto tax workflow.

## Architecture

- `src/app/layout.tsx` owns metadata and shared page chrome.
- `src/app/page.tsx` is the initial landing page placeholder.
- `next.config.ts` is the hook point for future Next-specific configuration.

## Commands

```bash
bun run --cwd apps/crypto-taxes dev
bun run --cwd apps/crypto-taxes build
bun run --cwd apps/crypto-taxes check
bun run --cwd apps/crypto-taxes lint
```

## Related

- `AGENTS.md` for local contributor guidance
