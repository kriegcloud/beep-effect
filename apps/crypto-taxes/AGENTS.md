# @beep/crypto-taxes Agent Guide

## Purpose & Fit
- App Router Next.js shell for the crypto tax workflow.
- Keep product UI and route logic here.
- Push shared logic into workspace packages when it needs reuse or stronger boundaries.

## Commands
- `bun run --cwd apps/crypto-taxes dev`
- `bun run --cwd apps/crypto-taxes build`
- `bun run --cwd apps/crypto-taxes check`
- `bun run --cwd apps/crypto-taxes lint`

## Boundaries
- Treat this app as the composition layer.
- Prefer shared packages for domain models, parsing, and reusable UI primitives.
- Keep framework-specific concerns in the app and business logic outside it when possible.
