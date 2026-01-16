# Handoff Document: Phase 3 - Pattern Design

## Session Context

This handoff provides all context needed to execute Phase 3 of the IAM Effect Patterns specification. The goal is to design canonical patterns based on Phase 1 analysis and Phase 2 research findings.

---

## Objective

Design concrete, type-safe pattern implementations that address all issues identified in Phase 1, using Effect best practices from Phase 2:

1. **Handler Factory** - Eliminate boilerplate, enforce naming, handle errors and session signals
2. **Schema Helpers** - Standardize Better Auth response handling and form annotations
3. **Atom Factory** - Standardize toast integration and hook generation
4. **State Machine Utilities** - Support multi-step authentication flows

---

## Prerequisites

### Required Reading (in order)

1. `specs/iam-effect-patterns/outputs/current-patterns.md` - Phase 1 analysis
2. `specs/iam-effect-patterns/outputs/effect-research.md` - Phase 2 research
3. `specs/iam-effect-patterns/REFLECTION_LOG.md` - Prior learnings

### Key Findings to Address

From Phase 1 (critical issues):

| Issue | Severity | Pattern to Design |
|-------|----------|-------------------|
| Session signal missing from sign-out/sign-up | Critical | Handler Factory with `mutatesSession` flag |
| `response.error` not checked | Critical | Schema transform or Handler Factory error check |
| Effect.fn name inconsistency | Medium | Handler Factory name validation |
| 70-80% handler boilerplate | Medium | Handler Factory |
| Annotation approach variance | Low | Schema Helpers |

From Phase 2 (patterns to apply):

| Pattern | Source | Application |
|---------|--------|-------------|
| Effect.fn span naming | Effect docs | `"domain/feature/handler"` convention |
| `transformOrFail` | Schema docs | `BetterAuthSuccessFrom` wrapper |
| `Data.TaggedError` | Error docs | Yieldable errors in handlers |
| `Ref` state management | Ref docs | Multi-step auth flows |

---

## Design Targets

### 1. Handler Factory (`handler.factory.ts`)

**Location**: `packages/iam/client/src/_common/handler.factory.ts`

**Must solve**:
- Eliminate Effect.fn boilerplate (~10 lines per handler)
- Enforce `"domain/feature/handler"` naming convention
- Auto-check `response.error` before decode
- Auto-notify `$sessionSignal` when `mutatesSession: true`
- Support both payload and no-payload handler variants

**API Design Target**:
```typescript
// Desired usage - 5-8 lines vs current 15-20
export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (payload) => client.signIn.email(payload),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,  // Optional - enables encode
  mutatesSession: true,              // Triggers session signal
});
```

**Implementation Requirements**:
- Must return `Effect<Success, IamError | BetterAuthError, never>`
- Must preserve type inference for payload
- Must validate name format at compile time if possible
- Must use proper Effect imports (`import * as Effect from "effect/Effect"`)

**Reference**: Phase 2 handler factory design in `outputs/effect-research.md`

---

### 2. Schema Helpers (`schema.helpers.ts`)

**Location**: `packages/iam/client/src/_common/schema.helpers.ts`

**Must solve**:
- Handle Better Auth `{ data, error }` response pattern consistently
- Standardize form annotation approach
- Ensure `response.error` is checked at schema level

**API Design Target**:
```typescript
// Better Auth response wrapper
const SuccessSchema = BetterAuthSuccessFrom(DataSchema);

// Enhanced form annotations (already exists, may need extension)
const Payload = S.Class(...)(fields, withFormAnnotations(annotations, defaults));
```

**Implementation Requirements**:
- `BetterAuthSuccessFrom<A>` using `S.transformOrFail`
- Return `ParseResult.fail` when `response.error` is present
- Surface Better Auth error message in parse failure
- Maintain existing `withFormAnnotations` helper

**Reference**: Phase 2 Schema transformation patterns in `outputs/effect-research.md`

---

### 3. Error Hierarchy (`errors.ts` enhancement)

**Location**: `packages/iam/client/src/_common/errors.ts`

**Must solve**:
- Enable yieldable errors in generators
- Preserve error cause for debugging
- Support selective error recovery

**API Design Target**:
```typescript
// Base error (yieldable)
class IamError extends Data.TaggedError("IamError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

// Better Auth specific error
class BetterAuthError extends Data.TaggedError("BetterAuthError")<{
  readonly message: string;
  readonly code?: string;
}> {}

// Usage in handlers (no Effect.fail wrapper needed)
if (response.error) {
  yield* new BetterAuthError({ message: response.error.message });
}
```

**Implementation Requirements**:
- Must use `Data.TaggedError` from `effect`
- Must preserve cause in `fromUnknown` static method
- Must support `Effect.catchTag` discrimination

**Reference**: Phase 2 error channel design in `outputs/effect-research.md`

---

### 4. Atom Factory (`atom.factory.ts`)

**Location**: `packages/iam/client/src/_common/atom.factory.ts`

**Must solve**:
- Standardize toast integration pattern
- Generate consistent hooks
- Reduce atom definition boilerplate

**API Design Target**:
```typescript
// Current pattern (~10 lines)
const signInAtom = signInRuntime.fn(
  F.flow(
    SignInService.signInEmail,
    withToast({
      onWaiting: "Signing in...",
      onSuccess: "Signed in successfully",
      onFailure: (e) => e.message,
    })
  )
);
export const useSignIn = () => {
  const signIn = useAtomSet(signInAtom, { mode: "promise" as const });
  return { signIn };
};

// Target pattern (~5 lines)
export const { atom: signInAtom, useSignIn } = createMutationAtom({
  runtime: signInRuntime,
  effect: SignInService.signInEmail,
  toast: {
    waiting: "Signing in...",
    success: "Signed in successfully",
    failure: (e) => e.message,
  },
  hookName: "signIn",
});
```

**Implementation Requirements**:
- Must integrate with existing `runtime.fn()` pattern
- Must support custom toast messages
- Must generate typed hook with `mode: "promise"`
- Must work with `@effect-atom/atom-react`

---

### 5. State Machine Utilities (`state-machine.ts`)

**Location**: `packages/iam/client/src/_common/state-machine.ts`

**Must solve**:
- Support multi-step flows (email verification, MFA, password reset)
- Provide state transition validation
- Integrate with effect-atom for reactive state

**API Design Target**:
```typescript
// State definition
type VerificationState =
  | { _tag: "Initial" }
  | { _tag: "CodeSent"; email: string; expiresAt: Date }
  | { _tag: "Verified"; email: string }
  | { _tag: "Failed"; reason: string };

// State machine creation
const verificationMachine = createStateMachine<VerificationState>({
  initial: { _tag: "Initial" },
  transitions: {
    sendCode: {
      from: "Initial",
      to: "CodeSent",
      effect: (email: string) => sendVerificationEmail(email),
    },
    verifyCode: {
      from: "CodeSent",
      to: "Verified",
      effect: (code: string) => verifyEmailCode(code),
    },
  },
});

// Usage
const { state, sendCode, verifyCode } = useStateMachine(verificationMachine);
```

**Implementation Requirements**:
- Use `Ref` for state storage
- Validate current state before transition
- Fail Effect on invalid transition
- Provide React integration pattern

**Reference**: Phase 2 state machine patterns in `outputs/effect-research.md`

---

## Design Constraints

### Effect Import Rules (MANDATORY)

```typescript
// REQUIRED - Namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Data from "effect/Data";
import * as Ref from "effect/Ref";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as F from "effect/Function";

// REQUIRED - PascalCase constructors
S.Struct({ ... })
S.String
S.Class

// FORBIDDEN - Native methods
array.map()  // Use A.map(array, fn)
string.split()  // Use Str.split(string, sep)
```

### Type Safety (MANDATORY)

```typescript
// FORBIDDEN
any
@ts-ignore
as unknown as T

// REQUIRED
Proper generic inference
Schema-based validation
Explicit error types in Effect signature
```

### Architecture Boundaries

- Factory files go in `_common/`
- No circular imports
- Use `@beep/*` path aliases
- Export from package index

---

## Expected Output

### File: `outputs/pattern-proposals.md`

Structure:
```markdown
# Pattern Proposals

## Summary
[Overview of all designed patterns]

## 1. Handler Factory

### Problem Statement
[What this solves from Phase 1]

### API Design
[TypeScript interfaces and types]

### Implementation
[Complete, type-safe implementation]

### Usage Examples
[Before/after comparison]

### Migration Guide
[How to convert existing handlers]

## 2. Schema Helpers

### Problem Statement
### API Design
### Implementation
### Usage Examples

## 3. Error Hierarchy

### Problem Statement
### API Design
### Implementation
### Usage Examples

## 4. Atom Factory

### Problem Statement
### API Design
### Implementation
### Usage Examples

## 5. State Machine Utilities

### Problem Statement
### API Design
### Implementation
### Usage Examples

## Breaking Changes
[Any breaking changes introduced]

## Migration Sequence
[Recommended order for migrating existing code]

## Type Definitions
[All exported types for consumers]
```

---

## Success Criteria

- [ ] Handler factory designed with full type inference
- [ ] Schema helpers handle Better Auth response pattern
- [ ] Error hierarchy uses `Data.TaggedError`
- [ ] Atom factory reduces boilerplate
- [ ] State machine utilities support multi-step flows
- [ ] All code uses correct Effect imports
- [ ] No `any` types or native methods
- [ ] Each pattern has usage examples
- [ ] Migration guide included
- [ ] `outputs/pattern-proposals.md` created

---

## Agent Recommendation

**Primary Agent**: `effect-code-writer`

Use this agent because:
- Expertise in Effect patterns and idioms
- Understands Schema transformations
- Familiar with effect-atom integration
- Will enforce import conventions

**Prompt for agent**:
```
Design canonical IAM Effect patterns based on Phase 1 analysis and Phase 2 research.

Input:
- specs/iam-effect-patterns/outputs/current-patterns.md (issues to solve)
- specs/iam-effect-patterns/outputs/effect-research.md (patterns to apply)

Output:
- specs/iam-effect-patterns/outputs/pattern-proposals.md

Design targets:
1. Handler Factory - createHandler with mutatesSession, error handling
2. Schema Helpers - BetterAuthSuccessFrom transform
3. Error Hierarchy - Data.TaggedError based errors
4. Atom Factory - Toast-integrated mutation atoms
5. State Machine - Ref-based multi-step flow utilities

Requirements:
- Full TypeScript implementations (not pseudocode)
- Proper Effect namespace imports
- No any types or native methods
- Usage examples for each pattern
- Migration guide from current patterns
```

---

## Reference Files

### Current Implementation (to replace)
```
packages/iam/client/src/sign-in/email/sign-in-email.handler.ts
packages/iam/client/src/sign-out/sign-out.handler.ts
packages/iam/client/src/_common/errors.ts
packages/iam/client/src/_common/common.annotations.ts
packages/iam/ui/src/sign-in/email/sign-in-email.atom.ts
```

### Pattern References (from codebase)
```
packages/runtime/client/src/runtime.ts (makeAtomRuntime)
packages/shared/client/src/atom/files/runtime.ts (atom patterns)
packages/runtime/client/CLAUDE.md (runtime patterns)
```

---

## Gotchas

### Better Auth Client Import

The Better Auth client is imported as:
```typescript
import { client } from "@beep/iam-client/adapters";
// or
import { client } from "../adapters/better-auth/client.ts";
```

The factory must NOT hard-code this import - it should receive the method as a parameter.

### Session Signal Side Effect

`client.$store.notify("$sessionSignal")` is a side effect. The factory must:
- Only call it AFTER successful response decode
- Provide option to disable for read-only operations
- Document that it triggers UI refresh

### Schema Class Annotations

`S.Class` third argument is a tuple: `[classAnnotations, fieldAnnotations, self]`
```typescript
S.Class<T>()(name)(fields, [classAnnotations, fieldAnnotations, undefined])
```

The `withFormAnnotations` helper must return this tuple format.

### Atom Runtime Types

The `runtime.fn()` return type is complex. The atom factory must preserve:
- Effect type inference
- Toast wrapper types
- Hook return types

---

## Next Steps After Phase 3

Phase 3 output feeds into:
- **Phase 4**: Validation of proposed patterns against rules
- **Phase 5**: Implementation plan based on approved designs
- **Phase 6**: Actual implementation of patterns

The pattern proposals will be reviewed for:
- Import rule compliance
- Architecture boundary compliance
- Type safety
- Security considerations
