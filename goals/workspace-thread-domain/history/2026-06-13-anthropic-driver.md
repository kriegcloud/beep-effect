# Anthropic Driver Evidence

Date: 2026-06-13
Agent: Codex

## Scope

P1 implementation slice for the `@beep/anthropic` driver package and root
workspace registration.

## Implemented

- Added the `@beep/anthropic` workspace package.
- Registered the `anthropic` package identity composer.
- Added catalog-backed `@effect/ai-anthropic` dependency wiring.
- Added a pinned Claude model, default retry constants, approximate price row,
  language-model options, live client/language-model layers, and a default
  acquisition retry execution plan.
- Added package tests and dtslint coverage.

## Verification

```sh
bun install
bun run --cwd packages/drivers/anthropic check
bun run --cwd packages/drivers/anthropic test
bun run --cwd packages/drivers/anthropic type-test
bun run --cwd packages/drivers/anthropic lint
```

All commands passed.
