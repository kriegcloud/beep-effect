---
path: tooling/beep-sync
summary: Scaffold for unified AI tooling sync runtime and POC fixtures
tags: [effect]
---

# @beep/beep-sync

Scaffold for unified AI tooling sync runtime and POC fixtures.

## Architecture

The package currently provides a scaffold CLI and fixture-driven helper functions
while runtime contracts are being completed in subsequent phases.

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/bin.ts` | CLI argument parsing and command dispatch |
| `src/index.ts` | Fixture loading, normalization helpers, and scaffold operations |

## Dependencies

**Internal**: `@beep/repo-utils`
**External**: `effect`, `yaml`
