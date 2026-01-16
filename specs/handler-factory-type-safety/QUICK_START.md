# Quick Start - Handler Factory Type Safety

## For New AI Sessions

**Read these files in order:**

1. `README.md` - Problem statement and approach overview
2. `outputs/initial-analysis.md` - Detailed analysis of type safety issues
3. `MASTER_ORCHESTRATION.md` - Phase-by-phase execution guide
4. `REFLECTION_LOG.md` - Previous session learnings

## Current Status

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | **COMPLETE** | Discovery & Pattern Research |
| 1 | **READY** | Scratchpad Setup |
| 2 | Skipped | Design Type-Safe Architecture (done in P0) |
| 3 | Blocked | Implement in Scratchpad |
| 4 | Blocked | Validate Scratchpad Handlers |
| 5 | Blocked | Apply to Real Code |
| 6 | Blocked | Final Validation & Docs |

## Problem Summary

The `handler.factory.ts` has 5 unsafe `as` type assertions because TypeScript's control flow analysis doesn't narrow generic type parameters through runtime checks like `P.isNotUndefined()`.

**Goal**: Eliminate all `as` assertions using Effect's `Match` and `Predicate` modules while maintaining identical public API.

## Key Files

| File | Purpose |
|------|---------|
| `packages/iam/client/src/_common/handler.factory.ts` | Target file to improve |
| `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts` | With-payload example |
| `packages/iam/client/src/core/sign-out/sign-out.handler.ts` | No-payload example |

## Next Action

**Phase 0 is COMPLETE.** Key finding: Effect Match cannot narrow generic type parameters.

**Chosen approach:** Separate implementation functions with type guard dispatch.

→ Read `handoffs/P1_ORCHESTRATOR_PROMPT.md` and set up scratchpad
→ Design proposal available at `outputs/design-proposal.md`
→ POC code available at `outputs/poc-approach.ts`

## Verification Commands

```bash
# Type check the package
bun run check --filter @beep/iam-client

# Run existing tests
bun run test --filter @beep/iam-client

# Lint check
bun run lint --filter @beep/iam-client
```

## Constraints Reminder

1. **No public API changes** - Overload signatures must remain identical
2. **All tests must pass** - No behavioral changes
3. **Effect patterns required** - Namespace imports, PascalCase constructors
4. **No new dependencies** - Only existing Effect modules
