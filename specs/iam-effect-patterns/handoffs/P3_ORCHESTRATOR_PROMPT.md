# Phase 3 Orchestrator Prompt

Copy and paste this prompt to begin Phase 3 execution.

---

## Prompt

```
Execute Phase 3 of the IAM Effect Patterns specification - Pattern Design.

## Context

Read these files in order:
1. specs/iam-effect-patterns/README.md
2. specs/iam-effect-patterns/REFLECTION_LOG.md
3. specs/iam-effect-patterns/outputs/current-patterns.md (Phase 1 - issues to solve)
4. specs/iam-effect-patterns/outputs/effect-research.md (Phase 2 - patterns to apply)
5. specs/iam-effect-patterns/handoffs/HANDOFF_P3.md (detailed requirements)

## Task

Design 5 canonical patterns with complete TypeScript implementations:

### 1. Handler Factory (`handler.factory.ts`)
Location: `packages/iam/client/src/_common/handler.factory.ts`

Design a `createHandler` function that:
- Accepts domain, feature, execute function, schemas, and mutatesSession flag
- Generates Effect.fn name as `"{domain}/{feature}/handler"`
- Checks `response.error` before decode
- Notifies `$sessionSignal` when mutatesSession is true
- Reduces current 15-20 line handlers to 5-8 lines

### 2. Schema Helpers (`schema.helpers.ts`)
Location: `packages/iam/client/src/_common/schema.helpers.ts`

Design a `BetterAuthSuccessFrom` schema transform that:
- Wraps Better Auth `{ data, error }` responses
- Returns ParseResult.fail when error is present
- Surfaces error message in parse failure

### 3. Error Hierarchy (`errors.ts` enhancement)
Location: `packages/iam/client/src/_common/errors.ts`

Redesign errors using Data.TaggedError:
- `IamError` - base error with cause preservation
- `BetterAuthError` - API-specific error with code
- Support yielding directly in generators

### 4. Atom Factory (`atom.factory.ts`)
Location: `packages/iam/client/src/_common/atom.factory.ts`

Design a `createMutationAtom` function that:
- Integrates with runtime.fn()
- Includes toast wrapper
- Generates typed hook
- Reduces 10-line atom definitions to 5 lines

### 5. State Machine Utilities (`state-machine.ts`)
Location: `packages/iam/client/src/_common/state-machine.ts`

Design Ref-based state machine for multi-step flows:
- Type-safe state definitions
- Transition validation
- Effect integration
- React hook pattern

## Output

Create `specs/iam-effect-patterns/outputs/pattern-proposals.md` containing:
- Complete TypeScript implementations (not pseudocode)
- Usage examples (before/after)
- Migration guide from current patterns
- Breaking changes documentation

## Constraints

MANDATORY:
- Use Effect namespace imports (import * as Effect from "effect/Effect")
- Use PascalCase Schema constructors (S.Struct, S.String)
- No `any` types or `@ts-ignore`
- No native array/string methods (use A.map, Str.split)

## Success Criteria

- [ ] All 5 patterns designed with full implementations
- [ ] Each pattern solves specific Phase 1 issues
- [ ] Each pattern applies Phase 2 research
- [ ] All code is type-safe
- [ ] All imports follow conventions
- [ ] Usage examples for each pattern
- [ ] Migration guide included
- [ ] output file created at correct location

After completion:
1. Update REFLECTION_LOG.md with Phase 3 learnings
2. Update README.md to mark Phase 3 as Complete
```

---

## Pre-Flight Checklist

Before running this prompt, verify:

- [ ] Phase 1 output exists: `specs/iam-effect-patterns/outputs/current-patterns.md`
- [ ] Phase 2 output exists: `specs/iam-effect-patterns/outputs/effect-research.md`
- [ ] REFLECTION_LOG.md contains Phase 1 and Phase 2 entries
- [ ] README.md shows Phase 1 and Phase 2 as Complete

---

## Expected Duration

45-60 minutes for complete pattern design

---

## Agent Selection

Use the `effect-code-writer` agent via Task tool:

```typescript
Task({
  subagent_type: "effect-code-writer",
  description: "Design IAM Effect patterns",
  prompt: "[paste prompt above]"
})
```

Or execute directly in main conversation if context is sufficient.
