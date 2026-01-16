# Type Safety Audit Report - Phase 9

**Date**: 2026-01-15
**Package**: @beep/iam-client

## Executive Summary

| Metric | Count |
|--------|-------|
| Total assertions found | 12 |
| Fixed | 2 |
| Documented as necessary (STRUCTURAL) | 8 |
| Test-only (allowed) | 2 |

## Key Decision: atom.factory.ts Deleted

The `atom.factory.ts` file was **deleted entirely** rather than fixed. Rationale:

1. **Marginal value**: Saved ~5 lines per atom but introduced type safety issues
2. **Unsafe casts**: Required `useAtomSet as any` and `mutate as (input: Input) => Promise<Output>`
3. **Complexity**: Extra abstraction layer for minimal benefit
4. **Manual pattern is clean**: The existing pattern in `core/atoms.ts` is ~15 lines, fully type-safe, and flexible

The canonical pattern for handler atoms is now the manual approach demonstrated in `core/atoms.ts`.

## Detailed Findings

### 1. user.schemas.ts (Line 119)

#### Pattern: `roleValue as User.UserRole.Type`
- **Category**: FIXED
- **Previous**: Direct cast without validation
- **Resolution**: Added `S.is(User.UserRole)(roleValue)` validation before use
- **Fix Applied**:
```typescript
const roleValue = yield* requireField(betterAuthUser, "role", ast);
if (!S.is(User.UserRole)(roleValue)) {
  return yield* ParseResult.fail(
    new ParseResult.Type(
      ast,
      roleValue,
      `Invalid role value: expected "admin" or "user", got "${String(roleValue)}"`
    )
  );
}
const role = roleValue;
```

### 2. atom.factory.ts (Lines 108-109)

#### Pattern: `useAtomSet as any` and `mutate as (input: Input) => Promise<Output>`
- **Category**: DELETED
- **Previous**: Unsafe casts to work around `AtomRuntime.fn()` returning `unknown`
- **Resolution**: File deleted. Manual pattern from `core/atoms.ts` is canonical.

### 3. handler.factory.ts (Lines 142-143, 175, 180, 204)

#### Lines 142-143: Schema/execute casts after payload check
- **Pattern**: `config.payloadSchema as S.Schema.Any` and `config.execute as (...)`
- **Category**: STRUCTURAL
- **Justification**: TypeScript limitation with conditional types in function implementations. After `P.isNotUndefined(config.payloadSchema)` check, TypeScript still cannot narrow the conditional type. The overloads ensure type safety at call sites.

#### Lines 175, 204: Success schema cast
- **Pattern**: `config.successSchema as S.Schema.Any`
- **Category**: STRUCTURAL
- **Justification**: The generic `SuccessSchema extends S.Schema.Any` should be compatible, but the conditional context confuses TypeScript.

#### Line 180: Execute cast for no-payload branch
- **Pattern**: `config.execute as () => Promise<BetterAuthResponse>`
- **Category**: STRUCTURAL
- **Justification**: Same as above - conditional type narrowing limitation.

### 4. transformation-helpers.ts (Lines 17, 29)

#### Pattern: `}) as ParseResult.Type`
- **Category**: STRUCTURAL
- **Justification**: Constructing `ParseResult.Type` objects manually. The object shape is correct, but TypeScript cannot infer the type from the literal object. This is a common pattern when building AST/error nodes.

### 5. transformation-helpers.ts (Line 78)

#### Pattern: `(obj as Record<string, unknown>)[key]`
- **Category**: STRUCTURAL
- **Justification**: After `P.hasProperty(obj, key)` check, we know the key exists, but TypeScript cannot narrow `T extends object` to include that property. The cast is safe due to the runtime check.

### 6. core/atoms.ts (Line 28)

#### Pattern: `mode: "promise" as const`
- **Category**: SAFE
- **Justification**: Literal type annotation, idiomatic TypeScript pattern. Required for `useAtomSet` to infer the correct return type.

### 7. handler.factory.test.ts (Lines 203, 234)

#### Pattern: `as Record<string, unknown>`
- **Category**: TEST-ONLY
- **Justification**: Accessing mock call arguments (`mock.calls[0]?.[0]`) which are typed as `unknown[]`. This is acceptable in test context for inspecting call arguments.

## Patterns Identified

### Safe Assertions (Allowed)
- `as const` for literal types
- Schema decode results (validated at runtime)

### Unsafe Assertions (Fixed/Deleted)
- `user.schemas.ts`: Unvalidated cast to `User.UserRole.Type` → Fixed with `S.is()` validation
- `atom.factory.ts`: Multiple unsafe casts → File deleted

### Structural Assertions (Documented)
- TypeScript conditional type narrowing limitations in function implementations
- Manual construction of ParseResult.Type objects
- Property access after `hasProperty` check

## Verification Results

| Check | Result |
|-------|--------|
| `bun run check --filter @beep/iam-client` | PASS |
| `bun run lint --filter @beep/iam-client` | PASS (pre-existing issues in other packages) |
| `bun run test --filter @beep/iam-client` | FAIL (pre-existing env config issue) |
| `bunx turbo run build --filter @beep/iam-client` | FAIL (pre-existing testkit tsconfig issue) |

**Note**: Test and build failures are pre-existing infrastructure issues unrelated to this audit:
- Test failure: Missing `NEXT_PUBLIC_ENV` environment variable
- Build failure: Testkit tsconfig project reference issue

## Recommendations for Future Work

1. **Document the handler atom pattern** in AGENTS.md showing `core/atoms.ts` as canonical
2. **Consider fixing the testkit tsconfig** to resolve build issues
3. **Add test environment setup** to provide required env vars for handler tests
4. **Consider adding `requireUserRole` helper** to transformation-helpers.ts that validates role values
