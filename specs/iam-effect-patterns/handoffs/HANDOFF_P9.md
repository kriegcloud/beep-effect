# Phase 9 Handoff: Type Safety Audit & Remediation

## Context

Phase 8 introduced testing infrastructure and the `atom.factory.ts` utility. During implementation, several type assertions and `any` casts were introduced as pragmatic workarounds. Phase 9 focuses on auditing all unsafe code patterns in `@beep/iam-client` and either:
1. Replacing them with properly typed alternatives
2. Documenting why the assertion is structurally necessary

## Objectives

1. **Audit** all type assertions (`as` casts) in `@beep/iam-client`
2. **Audit** all explicit `any` usage
3. **Identify** other unsafe patterns (unchecked casts, `@ts-ignore`, etc.)
4. **Fix** each instance or document why it's necessary
5. **Ensure** `bun run check --filter @beep/iam-client` passes with zero errors

## Scope

### Files to Audit

```
packages/iam/client/src/_common/
├── atom.factory.ts          # Known: `useAtomSet as any`, return type casts
├── handler.factory.ts       # Check for any assertions
├── schema.helpers.ts        # Check for any assertions
├── errors.ts                # Check for any assertions
├── transformation-helpers.ts # Check for any assertions
└── __tests__/
    ├── handler.factory.test.ts  # Known: mock type casts
    └── schema.helpers.test.ts
```

Also audit:
- `packages/iam/client/src/core/`
- `packages/iam/client/src/sign-in/`
- `packages/iam/client/src/sign-up/`
- `packages/iam/client/src/sign-out/`

## Known Issues from Phase 8

### 1. atom.factory.ts - Follow Existing `core/atoms.ts` Pattern

**Location**: `packages/iam/client/src/_common/atom.factory.ts`

**Current Code**:
```typescript
const mutate = (useAtomSet as any)(atom, { mode: "promise" });
return { mutate: mutate as (input: Input) => Promise<Output> };
```

**Problem**: Two issues - missing `as const` on mode, and `runtime.fn()` returning `unknown`.

**Reference Implementation**: `packages/iam/client/src/core/atoms.ts` (lines 7-44)

The existing codebase already has a working pattern:

```typescript
// From core/atoms.ts - the canonical pattern
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
    mode: "promise" as const,  // <-- Key: "as const" for literal type
  });
  // ...
};
```

**Key insight**: `Atom.family` is for **parameterized atoms** (like `uploadAtom` keyed by `uploadId`). IAM atoms are NOT parameterized - there's only one "sign out" operation. Don't use `Atom.family` for IAM mutations.

**Investigation Required**:
1. **First**: Apply `as const` fix to `atom.factory.ts`
2. **Then**: Determine if `any` cast on `atom` is avoidable by:
   - Checking if `makeAtomRuntime` returns a more specific type
   - Looking at `@effect-atom/atom-react` type exports
   - Accepting the cast with documentation if structurally necessary

**Recommended Fix for atom.factory.ts**:
```typescript
const useMutation = () => {
  // The atom type is `unknown` due to AtomRuntime.fn() return type.
  // This is structural - runtime.fn() erases type info at the interface boundary.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutate = (useAtomSet as any)(atom, { mode: "promise" as const });
  return { mutate: mutate as (input: Input) => Promise<Output> };
};
```

**Decision Points**:
- **Keep `createMutationAtom`**: If it provides value (reduces boilerplate, enforces toast pattern)
- **Document the cast**: Explain why `any` is structurally necessary
- **Consider alternatives**: Could factory return `{ atom, useMutation }` where caller handles hooks?

### 2. handler.factory.test.ts - Mock Type Casts

**Location**: `packages/iam/client/src/_common/__tests__/handler.factory.test.ts`

**Current Code**:
```typescript
const calledWith = mockSignInEmail.mock.calls[0]?.[0] as Record<string, unknown>;
```

**Problem**: Mock return types need explicit casting to inspect call arguments.

**Investigation Required**:
1. Check if bun:test provides better mock typing
2. Consider using type-safe mock patterns

## Audit Checklist

For each file, search for:

```bash
# Type assertions
grep -n " as " <file>

# Explicit any
grep -n ": any" <file>
grep -n "as any" <file>

# ts-ignore/ts-expect-error
grep -n "@ts-ignore" <file>
grep -n "@ts-expect-error" <file>

# Non-null assertions
grep -n "!\." <file>
grep -n "!\[" <file>
```

## Output Requirements

### 1. Create Audit Report

Create `specs/iam-effect-patterns/outputs/type-safety-audit.md`:

```markdown
# Type Safety Audit Report

## Summary
- Total type assertions found: X
- Total explicit any found: X
- Fixed: X
- Documented as necessary: X

## Findings

### File: path/to/file.ts

#### Line XX: Description
- **Pattern**: `as SomeType` | `any` | `@ts-ignore`
- **Context**: Why this exists
- **Resolution**: Fixed | Documented
- **Fix Applied**: (code snippet if fixed)
- **Justification**: (if documented as necessary)
```

### 2. Fix Priority

1. **High**: Type assertions that hide potential runtime errors
2. **Medium**: `any` casts that could be replaced with generics
3. **Low**: Test file casts (acceptable in test context)

## Success Criteria

1. `bun run check --filter @beep/iam-client` passes
2. `bun run lint --filter @beep/iam-client` passes
3. All type assertions either:
   - Removed and replaced with proper typing
   - Documented with justification in audit report
4. No `@ts-ignore` or `@ts-expect-error` without explanatory comment

## Phase 9 Completion

Upon successful completion:
1. Update `REFLECTION_LOG.md` with Phase 9 learnings
2. Create `HANDOFF_P10.md` for E2E testing phase
3. Update `README.md` to mark Phase 9 complete

## Commands Reference

```bash
# Type check
bun run check --filter @beep/iam-client

# Lint check
bun run lint --filter @beep/iam-client

# Run tests
bun run test --filter @beep/iam-client

# Build
bunx turbo run build --filter @beep/iam-client
```
