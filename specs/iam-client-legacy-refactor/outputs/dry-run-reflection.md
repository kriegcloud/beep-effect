# Dry Run Reflection — Phase 2

> Learnings from trial implementation of 3 representative handlers.
> **Date**: 2026-01-18

---

## Summary

Successfully implemented 3 representative handlers using canonical patterns:

| Handler | Pattern | Verified |
|---------|---------|----------|
| `multi-session/list-sessions` | No-payload handler | ✅ Type-check passed |
| `email-verification/send-verification` | Simple with-payload handler | ✅ Type-check passed |
| `password/change` | With-payload + session mutation + schema corrections | ✅ Type-check passed |

All implementations passed `bun run check --filter @beep/iam-client` without errors.

---

## Key Learnings

### 1. Wrapper Definition is Straightforward

Adding `W.Wrapper.make()` to legacy contracts is minimal:

```typescript
// No-payload wrapper (no payload schema)
export const Wrapper = W.Wrapper.make("ListSessions", {
  success: Success,
  error: Common.IamError,
});

// With-payload wrapper
export const Wrapper = W.Wrapper.make("Change", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
```

**Friction**: None. The pattern is clear and consistent.

### 2. wrapIamMethod Works Identically to createHandler

The migration from `createHandler` to `wrapIamMethod` is mechanical:

**Before (createHandler)**:
```typescript
export const Handler = createHandler({
  domain: "password",
  feature: "change",
  execute: (encoded) => client.changePassword(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

**After (wrapIamMethod)**:
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.changePassword(encodedPayload))
);
```

**Key Differences**:
- `createHandler` generates span name from `domain`/`feature` → `wrapIamMethod` derives from wrapper `_tag`
- `createHandler` takes separate `successSchema`/`payloadSchema` → `wrapIamMethod` reads from `wrapper`
- `wrapIamMethod` uses curried `execute` function pattern

**Friction**: Very low. The pattern is easy to follow.

### 3. S.Redacted for Password Fields Works Transparently

Using `S.Redacted(S.String)` for password fields:
- Encoded type is plain `string` → passed directly to Better Auth
- Type form is `Redacted.Redacted<string>` → user must use `Redacted.make()`
- No manual `Redacted.value()` extraction needed in handler

**formValuesAnnotation needs plain strings**:
```typescript
formValuesAnnotation({
  currentPassword: "",  // Plain string, not Redacted
  newPassword: "",
  revokeOtherSessions: false,
})
```

**Friction**: None. Works as expected.

### 4. No-Payload Handlers Are Simple

For handlers without payload (like `list-sessions`):
- Wrapper has no `payload` key
- Execute function takes no arguments

```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.multiSession.listDeviceSessions({}))
);
```

**Friction**: None.

### 5. JSDoc and Category Tags Add Bulk

Adding proper documentation increases file length significantly:
- `@fileoverview` at top
- `@module`, `@category`, `@since` tags
- `@example` blocks for public exports

This is necessary for maintainability but adds ~30-50 lines per file.

**Recommendation**: Create a snippet/template for faster JSDoc generation.

---

## Issues Discovered

### 1. Schema Consistency for User Objects

The `password/change` success schema defines a local `User` class while `sign-in/email` uses `Common.DomainUserFromBetterAuthUser`.

**Decision**: Keep local `User` class for password endpoints because:
- `DomainUserFromBetterAuthUser` requires all plugin fields (role, banned, etc.)
- Password change endpoint may return simpler user object
- Matching schema to actual Better Auth response is more important than consistency

**Action**: Document this discrepancy in migration notes.

### 2. formValuesAnnotation Import

The `formValuesAnnotation` helper is exported from `@beep/iam-client/_internal`. For handlers without forms, this import is unnecessary.

**Pattern**:
- Handlers with forms: Import `formValuesAnnotation` and add to Payload
- Handlers without forms: Skip `formValuesAnnotation`

### 3. File Renaming Strategy

Current files use `{feature}.contract.ts` and `{feature}.handler.ts`. Target files are `contract.ts` and `handler.ts`.

**Two approaches**:
1. **Git rename**: `git mv {feature}.contract.ts contract.ts`
   - Preserves git history
   - Requires updating imports across codebase

2. **Edit in place**: Change file contents, rename at end
   - Simpler workflow during development
   - Manual git history tracking

**Recommendation**: Use git rename for production migration.

---

## Migration Effort Estimate

Based on dry run:

| Task | Per Handler | Per Module |
|------|-------------|------------|
| Add Wrapper to contract | 2 min | — |
| Update handler to wrapIamMethod | 3 min | — |
| Add JSDoc documentation | 5 min | — |
| Create mod.ts / index.ts | — | 3 min |
| Create layer.ts | — | 5 min |
| Create service.ts | — | 5 min |
| Create atoms.ts | — | 10 min |
| Create form.ts (if needed) | — | 10 min |
| Verify type-check | 2 min | — |

**Estimated Total**:
- `email-verification` (1 handler, no forms): ~35 min
- `multi-session` (3 handlers, no forms): ~55 min
- `password` (3 handlers, 3 forms): ~75 min
- `two-factor` (8 handlers, 7 forms): ~120 min
- `organization` (15 handlers, 4 forms): ~180 min

**Total**: ~8 hours for all 30 handlers + module-level files

---

## Pattern Validation

All three canonical patterns were validated:

### No-Payload Pattern ✅
```typescript
// Contract: no payload property
export const Wrapper = W.Wrapper.make("Name", {
  success: Success,
  error: Common.IamError,
});

// Handler: no execute arguments
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({ wrapper: Contract.Wrapper, mutatesSession: false })(
    () => client.method()
  )
);
```

### Simple With-Payload Pattern ✅
```typescript
// Contract: has payload property
export const Wrapper = W.Wrapper.make("Name", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

// Handler: execute receives encoded payload
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({ wrapper: Contract.Wrapper, mutatesSession: false })(
    (encodedPayload) => client.method(encodedPayload)
  )
);
```

### With-Payload + Session Mutation Pattern ✅
```typescript
// Same as simple, but with mutatesSession: true
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({ wrapper: Contract.Wrapper, mutatesSession: true })(
    (encodedPayload) => client.method(encodedPayload)
  )
);
```

---

## Rollback Instructions

After dry run analysis, rollback implementations:

```bash
git checkout -- packages/iam/client/src/multi-session/list-sessions/
git checkout -- packages/iam/client/src/email-verification/send-verification/
git checkout -- packages/iam/client/src/password/change/
```

---

## Ready for Phase 3

With all patterns validated and no blocking issues discovered, the migration can proceed to Phase 3 (Implementation) following the documented patterns and designs.
