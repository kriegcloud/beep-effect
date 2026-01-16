# P9 Orchestrator Prompt: Type Safety Audit & Remediation

## Mission

You are executing Phase 9 of the IAM Effect Patterns specification. Your mission is to audit all unsafe type patterns in `@beep/iam-client`, fix what can be fixed, and document what cannot.

## Context Files to Read First

```
specs/iam-effect-patterns/HANDOFF_P9.md      # Phase requirements
specs/iam-effect-patterns/PLAN.md            # Overall plan
specs/iam-effect-patterns/REFLECTION_LOG.md  # Previous learnings
packages/iam/client/CLAUDE.md                # Package guidelines
```

## Execution Steps

### Step 1: Audit All Type Assertions

Search for all type assertions in the package:

```bash
# Find all type assertions
grep -rn " as " packages/iam/client/src --include="*.ts" | grep -v "as const" | grep -v ".d.ts"

# Find all explicit any
grep -rn ": any\|as any" packages/iam/client/src --include="*.ts"

# Find ts-ignore/ts-expect-error
grep -rn "@ts-ignore\|@ts-expect-error" packages/iam/client/src --include="*.ts"

# Find non-null assertions
grep -rn "!\.\|!\[" packages/iam/client/src --include="*.ts"
```

Record all findings in a structured list.

### Step 2: Categorize Findings

For each finding, categorize as:

| Category | Description | Action |
|----------|-------------|--------|
| **FIXABLE** | Can be replaced with proper typing | Fix it |
| **STRUCTURAL** | Required due to library constraints | Document why |
| **TEST-ONLY** | In test files, acceptable | Note but allow |

### Step 3: Fix atom.factory.ts Following core/atoms.ts Pattern

**Current Issue**: `createMutationAtom` has two type issues:
1. Missing `as const` on `mode: "promise"`
2. `runtime.fn()` returns `unknown`, requiring cast on `atom`

**CRITICAL: Do NOT use Atom.family for IAM mutations**

`Atom.family` is for **parameterized atoms** (memoized by key). Examples:
- `uploadAtom = Atom.family((uploadId: string) => ...)` — keyed by upload ID
- `userAtom = Atom.family((userId: string) => ...)` — keyed by user ID

IAM mutations (sign-in, sign-out, sign-up) are **NOT parameterized**. There's only one "sign out" operation - it doesn't need memoization by key.

**Reference Implementation**: `packages/iam/client/src/core/atoms.ts`

```typescript
// CANONICAL PATTERN - from core/atoms.ts (lines 7-29)
const signOutAtom = coreRuntime.fn(
  F.flow(
    CoreService.signOut,
    withToast({
      onWaiting: "Signing out...",
      onSuccess: "Signed out successfully",
      onFailure: (e) => e.message,
    })
  )
);

export const useCore = () => {
  const signOutSetter = useAtomSet(signOutAtom, {
    mode: "promise" as const,  // <-- KEY: "as const" for literal type
  });
  // ...
};
```

**Action Items**:

1. **Read** `packages/iam/client/src/core/atoms.ts` to understand the existing pattern
2. **Read** `packages/shared/client/src/atom/files/atoms/upload.atom.ts` to understand when `Atom.family` IS appropriate

3. **Fix atom.factory.ts** with `as const`:
```typescript
const useMutation = () => {
  // The atom type is `unknown` due to AtomRuntime.fn() return type.
  // This is structural - runtime.fn() erases type info at the interface boundary.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutate = (useAtomSet as any)(atom, { mode: "promise" as const });
  return { mutate: mutate as (input: Input) => Promise<Output> };
};
```

4. **Investigate** if the `any` cast can be avoided:
   - Check `makeAtomRuntime` return type in `@beep/runtime-client`
   - Check if `@effect-atom/atom-react` exports more specific types
   - If structurally unavoidable, document with a clear comment

5. **Decision**: Keep or deprecate `createMutationAtom`?
   - **Keep if**: Reduces boilerplate, enforces toast pattern consistently
   - **Deprecate if**: Adds complexity without significant value
   - **Document**: Either way, explain the pattern choice in AGENTS.md

**Why the cast is structural**:
```typescript
interface AtomRuntime {
  readonly fn: <Args extends ReadonlyArray<unknown>, A, E, R>(
    handler: (...args: Args) => Effect.Effect<A, E, R>
  ) => unknown;  // <-- Returns unknown, not a typed atom
}
```

The `unknown` return type is at the interface boundary. Without changing `@beep/runtime-client` to export more specific types, the cast is unavoidable.

### Step 4: Fix handler.factory.test.ts

**Issue**: Mock type casts for inspecting call arguments.

**Fix**: Use proper mock typing:
```typescript
// Define mock function type explicitly
type MockFn = ReturnType<typeof mock<() => Promise<MockResponse>>>;

// Or use type-safe assertions on mock results
const calledArg = mockSignInEmail.mock.calls[0]?.[0];
if (calledArg && typeof calledArg === 'object') {
  expect((calledArg as { email?: string }).email).toBe("test@example.com");
}
```

### Step 5: Audit Remaining Files

Check each file in this order:

1. `src/_common/errors.ts`
2. `src/_common/transformation-helpers.ts`
3. `src/_common/schema.helpers.ts`
4. `src/core/service.ts`
5. `src/core/atoms.ts`
6. `src/sign-in/email/*.ts`
7. `src/sign-up/email/*.ts`

For each file:
- Identify all assertions
- Determine if fixable
- Apply fix or document

### Step 6: Create Audit Report

Create `specs/iam-effect-patterns/outputs/type-safety-audit.md`:

```markdown
# Type Safety Audit Report - Phase 9

**Date**: [Current Date]
**Package**: @beep/iam-client

## Executive Summary

| Metric | Count |
|--------|-------|
| Total assertions found | X |
| Fixed | X |
| Documented as necessary | X |
| Test-only (allowed) | X |

## Detailed Findings

### 1. atom.factory.ts

#### Line 108: useAtomSet any cast
- **Pattern**: `(useAtomSet as any)(atom, { mode: "promise" })`
- **Category**: STRUCTURAL
- **Resolution**: [FIXED/DOCUMENTED]
- **Justification**: [Explain why]

### 2. handler.factory.test.ts

#### Line XX: Mock argument cast
- **Pattern**: `as Record<string, unknown>`
- **Category**: TEST-ONLY
- **Resolution**: Allowed in test context
- **Note**: [Any improvements made]

[Continue for all findings...]

## Patterns Identified

### Safe Assertions (Allowed)
- `as const` for literal types
- Schema decode results (validated at runtime)

### Unsafe Assertions (Fixed)
- [List what was fixed]

### Structural Assertions (Documented)
- [List with justifications]
```

### Step 7: Run Verification

```bash
# All must pass
bun run check --filter @beep/iam-client
bun run lint --filter @beep/iam-client
bun run test --filter @beep/iam-client
bunx turbo run build --filter @beep/iam-client
```

### Step 8: Update Documentation

1. Update `REFLECTION_LOG.md`:
```markdown
## Phase 9: Type Safety Audit

### What Worked
- [List successes]

### What Didn't Work
- [List challenges]

### Key Learnings
- [Insights about type safety in Effect-first patterns]

### Patterns Established
- [Document any new patterns]
```

2. Update `README.md`:
```markdown
- [x] Phase 9: Type Safety Audit — Audited and fixed/documented all type assertions
```

### Step 9: Create P10 Handoff

Upon completion, create `HANDOFF_P10.md` and `P10_ORCHESTRATOR_PROMPT.md` for E2E testing phase.

## Success Criteria

1. Zero TypeScript errors: `bun run check --filter @beep/iam-client`
2. Zero lint errors: `bun run lint --filter @beep/iam-client`
3. All tests pass: `bun run test --filter @beep/iam-client`
4. Build succeeds: `bunx turbo run build --filter @beep/iam-client`
5. Audit report created with all findings documented
6. P10 handoff created

## Important Notes

- **Do NOT add `@ts-ignore` without a comment explaining why**
- **Prefer proper typing over `any` casts**
- **Test files have more lenient requirements than production code**
- **Document WHY an assertion is necessary, not just WHAT it does**
- **Check existing codebase patterns before inventing new solutions**
