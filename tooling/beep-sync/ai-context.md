---
path: tooling/beep-sync
summary: Unified AI tooling sync runtime and deterministic POC fixture harness
tags: [effect]
---

# @beep/beep-sync

Unified AI tooling sync runtime and deterministic POC fixture harness.

## Architecture

The package provides runtime command handlers for canonical `.beep` workflows and
retains fixture-driven commands for locked compatibility POCs.

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/bin.ts` | CLI argument parsing and command dispatch |
| `src/index.ts` | Fixture loading, normalization helpers, and runtime exports |
| `src/runtime.ts` | Runtime compile/apply/check/doctor/revert engine |

## Dependencies

**Internal**: `@beep/repo-utils`
**External**: `effect`, `yaml`
