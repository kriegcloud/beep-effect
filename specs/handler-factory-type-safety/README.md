# Handler Factory Type Safety Specification

**Status**: Ready (Phase 0 Pending)

## Orchestration Files

| File | Purpose |
|------|---------|
| `QUICK_START.md` | Entry point for new AI sessions |
| `MASTER_ORCHESTRATION.md` | Phase-by-phase execution guide |
| `AGENT_PROMPTS.md` | Pre-configured agent prompts |
| `RUBRICS.md` | Quality gates for each phase |
| `handoffs/P0_ORCHESTRATOR_PROMPT.md` | Phase 0 detailed tasks |

## Purpose

Improve type safety and exhaustiveness in `packages/iam/client/src/_common/handler.factory.ts` by leveraging Effect's `Predicate` and `Match` modules to eliminate unsafe type assertions (`as` casts) while maintaining full backward compatibility with existing handler implementations.

## Problem Statement

The current `createHandler` factory has multiple unsafe type assertions that bypass TypeScript's type narrowing:

| Line | Unsafe Pattern | Issue |
|------|----------------|-------|
| 143 | `config.payloadSchema as S.Schema.Any` | Runtime branch doesn't narrow type |
| 144-146 | `config.execute as (encoded: unknown ...) => Promise<...>` | Execute signature loses type safety |
| 176, 205 | `config.successSchema as S.Schema.Any` | Schema context not preserved |
| 181 | `config.execute as () => Promise<...>` | Alternative branch also uses assertion |

### Root Cause

The implementation uses `P.isNotUndefined(config.payloadSchema)` to branch between payload/no-payload variants, but TypeScript's control flow analysis doesn't narrow the union type within each branch. This forces unsafe assertions to satisfy the type checker.

## Target Improvements

### Approach Options

| Option | Description | Trade-offs |
|--------|-------------|------------|
| **A: Discriminated Union** | Add `kind: "with-payload" \| "no-payload"` field | Requires config change (breaking) |
| **B: Separate Functions** | Internal `createWithPayload` / `createNoPayload` | Hidden complexity, same public API |
| **C: Effect Match** | Use `Match.type<Config>()` with exhaustive matching | Most idiomatic, leverages Effect |
| **D: Predicate Refinement** | Type guard predicates with proper narrowing | Simpler but less comprehensive |

### Recommended Approach

**Option C (Effect Match) + Option D (Predicate Refinement)** combined:

1. Use `effect/Predicate` to create type-safe refinements
2. Use `effect/Match` for exhaustive pattern matching on config variants
3. Dispatch to type-specific implementation functions
4. Maintain identical public API (overloads unchanged)

## Success Criteria

### Quantitative

- [ ] Zero `as` type assertions in implementation
- [ ] Zero `@ts-ignore` or `@ts-expect-error` comments
- [ ] 100% backward compatibility (no signature changes)
- [ ] All existing tests pass without modification
- [ ] Type inference preserved at call sites

### Qualitative

- [ ] Implementation uses idiomatic Effect patterns
- [ ] Code is more readable than current version
- [ ] Error cases are exhaustively handled
- [ ] Pattern is reusable for other factories

## Phase Overview

| Phase | Description | Status | Output |
|-------|-------------|--------|--------|
| 0 | Discovery & Pattern Research | Pending | `outputs/pattern-analysis.md` |
| 1 | Scratchpad Setup & Baseline | Pending | `scratchpad/` with factory + handlers |
| 2 | Design Type-Safe Architecture | Pending | `outputs/design-proposal.md` |
| 3 | Implement in Scratchpad | Pending | Refactored `scratchpad/handler.factory.ts` |
| 4 | Validate Scratchpad Handlers | Pending | All scratchpad usages type-check |
| 5 | Apply to Real Code | Pending | Updated `handler.factory.ts` |
| 6 | Final Validation & Docs | Pending | All tests green, AGENTS.md updated |

## Scratchpad Validation Strategy

To ensure changes don't break existing usage, the implementation will use an isolated scratchpad:

### Phase 1: Scratchpad Setup

Create complete duplicates in `scratchpad/` directory:

```
specs/handler-factory-type-safety/scratchpad/
├── handler.factory.ts           # Exact copy of current factory
├── errors.ts                    # Required dependency
├── common.types.ts              # Required dependency
├── schema.helpers.ts            # Required dependency
├── handlers/
│   ├── sign-in-email.handler.ts # With-payload example
│   ├── sign-in-email.contract.ts
│   ├── sign-out.handler.ts      # No-payload example
│   ├── sign-out.contract.ts
│   ├── list-sessions.handler.ts # Another no-payload
│   └── list-sessions.contract.ts
└── tsconfig.json                # Isolated type checking
```

### Phase 3-4: Validate in Isolation

1. Refactor `scratchpad/handler.factory.ts` with type-safe patterns
2. Verify all `scratchpad/handlers/*.handler.ts` still type-check
3. Verify return type inference matches original
4. Only after scratchpad passes → apply to real code

### Benefits

- **Zero risk to production code** during experimentation
- **Isolated type checking** via scratchpad tsconfig
- **Easy rollback** - just delete scratchpad if approach fails
- **Side-by-side comparison** of old vs new implementation

## Constraints

### Must Preserve

1. **Function overload signatures** - Existing handlers use these types
2. **Return type inference** - Callers depend on proper type inference
3. **Effect.fn span naming** - Telemetry depends on `{domain}/{feature}/handler`
4. **Session signal behavior** - `mutatesSession` must trigger `$sessionSignal`
5. **Error type union** - `HandlerFactoryError` exported type

### Implementation Boundaries

- Changes confined to `handler.factory.ts` implementation
- No changes to handler call sites (`sign-in-email.handler.ts`, etc.)
- No new external dependencies

## Technical Context

### Current Implementation Structure

```typescript
// Overload 1: With payload schema
export function createHandler<PayloadSchema, SuccessSchema>(config: {
  readonly payloadSchema: PayloadSchema;
  // ...
}): (input: HandlerWithPayloadInput<...>) => Effect.Effect<...>;

// Overload 2: Without payload schema
export function createHandler<SuccessSchema>(config: {
  readonly payloadSchema?: undefined;
  // ...
}): (input?: HandlerNoPayloadInput) => Effect.Effect<...>;

// Implementation (single function with runtime branching)
export function createHandler<PayloadSchema, SuccessSchema>(config: {...}) {
  if (P.isNotUndefined(config.payloadSchema)) {
    // Branch 1: WITH payload - uses unsafe assertions
  }
  // Branch 2: WITHOUT payload - uses unsafe assertions
}
```

### Target Implementation Pattern

```typescript
import * as Match from "effect/Match";
import * as P from "effect/Predicate";

// Type guard that properly narrows
const hasPayloadSchema = <C extends HandlerConfig>(
  config: C
): config is C & { payloadSchema: S.Schema.Any } =>
  P.isNotUndefined(config.payloadSchema);

// Separate type-safe implementations
const createWithPayload = <PayloadSchema extends S.Schema.Any, SuccessSchema extends S.Schema.Any>(
  config: ConfigWithPayload<PayloadSchema, SuccessSchema>
) => { /* fully typed, no assertions */ };

const createNoPayload = <SuccessSchema extends S.Schema.Any>(
  config: ConfigNoPayload<SuccessSchema>
) => { /* fully typed, no assertions */ };

// Main implementation using Match for exhaustive dispatch
export function createHandler<...>(config: ...) {
  return Match.value(config).pipe(
    Match.when(hasPayloadSchema, createWithPayload),
    Match.orElse(createNoPayload)
  );
}
```

## Key Reference Files

| File | Purpose |
|------|---------|
| `packages/iam/client/src/_common/handler.factory.ts` | Target file for improvements |
| `packages/iam/client/src/_common/__tests__/handler.factory.test.ts` | Existing test coverage |
| `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts` | With-payload usage example |
| `packages/iam/client/src/core/sign-out/sign-out.handler.ts` | No-payload usage example |
| `.claude/rules/effect-patterns.md` | Required Effect patterns |

## Effect Patterns Reference

### Match Module Usage

```typescript
import * as Match from "effect/Match";

// Type-safe exhaustive matching
const result = Match.value(input).pipe(
  Match.when(predicate1, handler1),
  Match.when(predicate2, handler2),
  Match.exhaustive // Compile error if cases missing
);

// Or with fallback
const result = Match.value(input).pipe(
  Match.when(predicate, handler),
  Match.orElse(fallbackHandler)
);
```

### Predicate Refinements

```typescript
import * as P from "effect/Predicate";

// Type guard with proper narrowing
const isWithPayload = <T extends { payloadSchema?: S.Schema.Any }>(
  config: T
): config is T & { payloadSchema: S.Schema.Any } =>
  P.isNotUndefined(config.payloadSchema);
```

## Agents Used

| Agent | Phase | Purpose |
|-------|-------|---------|
| `effect-researcher` | 0 | Research Match/Predicate patterns |
| `Explore` | 0 | Analyze call site dependencies |
| `effect-code-writer` | 0-5 | POC, scratchpad setup, implementation |
| `doc-writer` | 6 | Update CLAUDE.md |
| `reflector` | All | Document learnings |

See `AGENT_PROMPTS.md` for pre-configured prompts.

## Quick Start

### For New AI Sessions

**Start here:** Read `QUICK_START.md` for status and next actions.

**Full workflow:**
1. Read `QUICK_START.md` for current status
2. Read `MASTER_ORCHESTRATION.md` for phase details
3. Use `AGENT_PROMPTS.md` for spawning agents
4. Check `RUBRICS.md` for quality gates

### Verification Commands

```bash
# Type check the package
bun run check --filter @beep/iam-client

# Run existing tests
bun run test --filter @beep/iam-client

# Lint check
bun run lint --filter @beep/iam-client
```

## Related Documentation

- [Effect Patterns - Match](https://effect.website/docs/code-style/pattern-matching/)
- [Effect Predicate Module](https://effect.website/docs/api/effect/Predicate/)
- [IAM Client AGENTS.md](../../packages/iam/client/AGENTS.md)
- [Project Effect Patterns](../../.claude/rules/effect-patterns.md)
