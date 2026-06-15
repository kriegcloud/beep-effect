---
title: bin.ts
nav_order: 2
parent: "@beep/repo-cli"
---

## bin.ts overview

Lightweight CLI entry point for the repo command suite.

The root `lint --fix` no-op path intentionally stays in this tiny module so
clean worktrees do not pay the startup cost of loading the full Effect CLI.

Since v0.0.0

---
## Exports Grouped by Category

---