# Phase 6 Handoff: Reference Implementation

## Status Summary

| Phase | Status | Output |
|-------|--------|--------|
| Phase 0 | Complete | Spec scaffolding |
| Phase 1 | Complete | `outputs/current-patterns.md` |
| Phase 2 | Complete | `outputs/effect-research.md` |
| Phase 3 | Complete | `outputs/pattern-proposals.md` |
| Phase 4 | Complete | `outputs/pattern-review.md` |
| Phase 5 | Complete | `PLAN.md` |
| **Phase 6** | **Ready** | Code changes (to implement) |

## Phase 6 Objective

Implement the canonical Effect patterns and create reference implementations based on the validated designs from Phase 4 and the detailed plan from Phase 5.

## Key Context from Prior Phases

### Critical Bugs to Fix

| Handler | Bug | Impact |
|---------|-----|--------|
| `core/sign-out` | Missing `$sessionSignal` notification | UI doesn't update after sign-out |
| `sign-in/email` | Decodes `response.data` even when `response.error` present | Silent failures |

### Files to Create (Dependency Order)

| Order | File | Dependencies |
|-------|------|--------------|
| 1.1 | `errors.ts` additions | None |
| 1.2 | `schema.helpers.ts` | errors.ts |
| 1.3 | `handler.factory.ts` | errors.ts, schema.helpers.ts |
| 1.4 | `atom.factory.ts` | None (independent) |
| 1.5 | `state-machine.ts` | None (independent) |

### Handlers to Migrate

| Handler | Before | After | Reduction |
|---------|--------|-------|-----------|
| `core/sign-out` | 24 lines | 7 lines | 71% |
| `sign-in/email` | 31 lines | 8 lines | 74% |

## Implementation Order

### Step 1: Enhance `errors.ts`

**File**: `packages/iam/client/src/_common/errors.ts`

**Action**: ADD imports and error classes after line 46.

**Add import**:
```typescript
import * as Data from "effect/Data";
```

**Add after existing exports** (see `outputs/pattern-proposals.md` Section 3 for full code):
- `BetterAuthResponseError` - Data.TaggedError
- `SessionExpiredError` - Data.TaggedError
- `InvalidCredentialsError` - Data.TaggedError
- `RateLimitedError` - Data.TaggedError
- `EmailVerificationRequiredError` - Data.TaggedError
- `HandlerError` type union

### Step 2: Create `schema.helpers.ts`

**File**: `packages/iam/client/src/_common/schema.helpers.ts`

**Contents**: `BetterAuthSuccessFrom` transform + re-export of `withFormAnnotations`

**Reference**: `outputs/pattern-proposals.md` Section 2

### Step 3: Create `handler.factory.ts`

**File**: `packages/iam/client/src/_common/handler.factory.ts`

**Contents**: `createHandler` function with TypeScript overloads

**Reference**: `outputs/pattern-proposals.md` Section 1

### Step 4: Migrate Handlers

**4a. Sign-out handler**:
- Location: `packages/iam/client/src/core/sign-out/sign-out.handler.ts`
- Replace entire file with factory pattern
- Reference: `PLAN.md` Section 2.1

**4b. Sign-in-email handler**:
- Location: `packages/iam/client/src/sign-in/email/sign-in-email.handler.ts`
- Replace entire file with factory pattern
- Reference: `PLAN.md` Section 2.2

### Step 5: Create Factory Files (Lower Priority)

- `atom.factory.ts` - `createMutationAtom` function
- `state-machine.ts` - `createStateMachine` function

### Step 6: Create Tests

- `__tests__/handler.factory.test.ts`
- `__tests__/schema.helpers.test.ts`
- `__tests__/atom.factory.test.ts`
- `__tests__/state-machine.test.ts`

## Files to Read Before Implementation

| File | Purpose |
|------|---------|
| `PLAN.md` | Complete implementation plan |
| `outputs/pattern-proposals.md` | Full code implementations |
| `outputs/pattern-review.md` | Validation results, fixes applied |
| `packages/iam/client/src/_common/errors.ts` | Existing error types |
| `.claude/rules/effect-patterns.md` | Import and naming rules |

## Constraints

1. **Effect namespace imports**: `import * as Effect from "effect/Effect"`
2. **No native methods**: Use `A.map`, `R.keys`, `F.pipe`
3. **PascalCase Schema**: `S.Struct`, `S.String`
4. **Path aliases**: Use `@beep/*` in examples

## Success Verification

After implementation, run:

```bash
# Type checking
bun run check --filter @beep/iam-client

# Linting
bun run lint --filter @beep/iam-client

# Tests
bun run test --filter @beep/iam-client

# Build
bun run build --filter @beep/iam-client
```

## Phase 6 Checkpoint

Before marking Phase 6 complete, verify:

- [ ] `errors.ts` enhanced with Data.TaggedError variants
- [ ] `schema.helpers.ts` created
- [ ] `handler.factory.ts` created
- [ ] `sign-out.handler.ts` migrated
- [ ] `sign-in-email.handler.ts` migrated
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Tests pass
- [ ] Build succeeds
- [ ] REFLECTION_LOG.md updated

## Agent Recommendation

Use `effect-code-writer` agent with `package-error-fixer` for fixes.

## Ready to Execute

All prerequisites satisfied. Phase 6 can proceed immediately.
