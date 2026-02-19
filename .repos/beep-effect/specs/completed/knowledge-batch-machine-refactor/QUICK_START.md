# Quick Start

## What
Refactor `BatchStateMachine` in the knowledge slice to use `@beep/machine` for type-safe state management, persistence, and structured testing.

## Why
- **Current**: In-memory `Ref<HashMap>`, no crash recovery, no structured testing, hand-rolled transition validation
- **Target**: `@beep/machine` builder with branded schemas, `Slot.Guards`, `Slot.Effects`, persistence adapter, `simulate()`/`assertPath()` testing

## Key Files

| Current (to be replaced) | New (to be created) |
|--------------------------|---------------------|
| `packages/knowledge/server/src/Workflow/BatchStateMachine.ts` | `packages/knowledge/server/src/Workflow/BatchMachine.ts` |
| `packages/knowledge/domain/src/value-objects/BatchState.value.ts` | `packages/knowledge/domain/src/value-objects/BatchMachine.schema.ts` |

## Phases

| Phase | What | Entry Point |
|-------|------|-------------|
| P1 | Research @beep/machine API, produce design doc | `handoffs/P1_ORCHESTRATOR_PROMPT.md` |
| P2 | Define State/Event schemas in knowledge-domain | `handoffs/P2_ORCHESTRATOR_PROMPT.md` |
| P3 | Build machine, migrate orchestrator in knowledge-server | `handoffs/P3_ORCHESTRATOR_PROMPT.md` |
| P4 | Comprehensive tests, verification | `handoffs/P4_ORCHESTRATOR_PROMPT.md` |

## Start Here

Copy-paste the contents of `handoffs/P1_ORCHESTRATOR_PROMPT.md` into a new Claude session to begin Phase 1.
