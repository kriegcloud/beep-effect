# Quick Start: Effect RPC on Next.js API Routes

> 5-minute handoff entrypoint for this spec package.

## What This Spec Delivers

A canonical, source-backed implementation path for `effect/unstable/rpc` in `apps/web` with:
- `/api/rpc/basic` using `HttpEffect.toWebHandler`
- `/api/rpc/stream` using `HttpEffect.toWebHandlerWith`
- tests proving basic + streaming + serialization + handler injection behavior

## Current Status

- P0 Research: Pending
- P1 Design: Pending
- P2 Implementation Plan: Pending
- P3 Implementation: Pending
- P4 Verification: Pending

## Start Here

1. Read [README.md](./README.md) end-to-end.
2. Execute the next pending phase in order.
3. Update [outputs/manifest.json](./outputs/manifest.json) after each phase.

## Phase Entry Files

| Phase | Handoff | Orchestrator Prompt | Output |
|---|---|---|---|
| P0 | [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [p0-research.md](./outputs/p0-research.md) |
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [p1-design.md](./outputs/p1-design.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [p2-implementation-plan.md](./outputs/p2-implementation-plan.md) |
| P3 | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [p3-implementation-notes.md](./outputs/p3-implementation-notes.md) |
| P4 | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [p4-verification.md](./outputs/p4-verification.md) |

## Required Verification Commands (P4)

- `bunx vitest run apps/web/test/effect/rpc-basic-route.test.ts apps/web/test/effect/rpc-stream-route.test.ts`
- `bun run check`
- `bun run lint`
- `bun run test`
