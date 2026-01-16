# Reflection Log - Handler Factory Type Safety

This document captures learnings, patterns discovered, and methodology improvements across sessions.

---

## Session 1 - Spec Creation

**Date**: 2026-01-15
**Phase**: Scaffolding

### Context Gathered

1. **Current Implementation Analysis**
   - Handler factory at `packages/iam/client/src/_common/handler.factory.ts`
   - Uses function overloads for with-payload and no-payload variants
   - Runtime branching via `P.isNotUndefined(config.payloadSchema)`
   - Five unsafe `as` assertions identified (lines 143, 144-146, 176, 181, 205)

2. **Usage Patterns Discovered**
   - 6+ files import and use `createHandler`
   - Two distinct patterns: with-payload (sign-in) and no-payload (sign-out)
   - All handlers depend on proper type inference from factory

3. **Effect Patterns Available**
   - `effect/Match` provides exhaustive pattern matching
   - `Match.when(predicate, handler)` can dispatch based on config shape
   - `Match.exhaustive` ensures all cases handled at compile time
   - `effect/Predicate` can create type-safe refinements

### Key Insight

The root cause is that TypeScript's control flow analysis with `if (P.isNotUndefined(...))` doesn't narrow union types inside conditional blocks when dealing with generic parameters. The solution requires either:

1. User-defined type guards that explicitly narrow
2. Discriminated unions with literal type tags
3. Match patterns that infer types from predicates

### Questions for Phase 0

- Does `Match.when` properly narrow generic type parameters?
- What's the performance overhead of Match vs simple conditionals?
- Can we preserve the exact return type inference that call sites depend on?

---

## Session 2 - Phase 0: Discovery & Pattern Research

**Date**: 2026-01-15
**Phase**: 0

### What Worked

- **effect-researcher agent** provided definitive answer on Match limitations
- **Explore agent** efficiently cataloged all 10 handler files (8 factory users, 2 manual)
- **Parallel task execution** - running research and call site analysis simultaneously
- **POC approach** validated before full implementation design

### What Didn't Work

- **Initial assumption about Match** - README suggested Option C (Effect Match) as recommended, but research proved Match cannot narrow generic type parameters
- **Match is for value discrimination, not type discrimination** - This was a critical learning

### Patterns Discovered

1. **Separate Implementation Functions Pattern**
   - Define discriminated config interfaces (ConfigWithPayload, ConfigNoPayload)
   - Create type guard that narrows union
   - Extract separate implementation functions for each variant
   - Main function dispatches based on type guard
   - Result: Zero assertions, identical public API

2. **TypeScript Generic Limitation**
   - Control flow analysis narrows *values* but not *generic type parameters*
   - `if (config.payloadSchema !== undefined)` narrows config.payloadSchema
   - But doesn't narrow `PayloadSchema extends Schema | undefined` to just `Schema`

3. **Overload Signatures vs Implementation**
   - Overload signatures handle call-site inference (complex generics)
   - Implementation signature can be simplified (union types)
   - Runtime dispatch bridges the two worlds

### Methodology Improvements

1. **Verify tool applicability before designing** - Research whether Effect Match/Predicate actually solve the problem before committing to an approach
2. **Call site analysis first** - Understanding all usages prevents breaking changes
3. **POC in isolated file** - Validate approach compiles before full design

### Questions Raised

- None remaining - approach is clear

### Deliverables Produced

| File | Purpose |
|------|---------|
| `outputs/pattern-analysis.md` | Match/Predicate research findings |
| `outputs/call-site-analysis.md` | All 10 handler usages documented |
| `outputs/poc-approach.ts` | Working POC demonstrating the approach |
| `outputs/design-proposal.md` | Full implementation plan |

### Phase 0 Success Criteria

- [x] `outputs/pattern-analysis.md` documents Match/Predicate findings
- [x] `outputs/call-site-analysis.md` lists all usages and dependencies
- [x] `outputs/poc-approach.ts` demonstrates feasibility
- [x] `outputs/design-proposal.md` provides clear implementation path
- [x] `REFLECTION_LOG.md` updated with Phase 0 learnings

---

## Template for Future Sessions

### Session N - [Phase Name]

**Date**: YYYY-MM-DD
**Phase**: N

### What Worked

-

### What Didn't Work

-

### Patterns Discovered

-

### Methodology Improvements

-

### Questions Raised

-

---
