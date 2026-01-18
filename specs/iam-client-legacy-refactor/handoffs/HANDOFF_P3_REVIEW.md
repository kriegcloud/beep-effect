# IAM Client Legacy Refactor — Phase 3 Review Handoff

> **Purpose**: Final handoff for code review of the completed IAM client migration from legacy `createHandler` patterns to canonical `wrapIamMethod` patterns.

---

## Executive Summary

**Migration Scope**: 30 handlers across 5 modules
**Migration Status**: ✅ COMPLETE
**Type Check**: ✅ PASSING
**Lint Check**: ✅ PASSING

All legacy IAM client handlers have been migrated to the canonical patterns documented in `documentation/patterns/iam-client-patterns.md`.

---

## Migration Summary by Module

| Module | Handlers | Status | Notes |
|--------|----------|--------|-------|
| `email-verification` | 1 | ✅ Complete | Simple send-verification handler |
| `multi-session` | 3 | ✅ Complete | list-sessions, revoke, set-active |
| `password` | 3 | ✅ Complete | change, request-reset, reset |
| `two-factor` | 8 | ✅ Complete | Nested structure (backup, otp, totp, enable, disable) |
| `organization` | 15 | ✅ Complete | Nested structure (crud, invitations, members) |

---

## Pattern Changes Applied

### Before (Legacy Pattern)

```typescript
import { createHandler } from "../../_common/handler.factory.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "create",
  execute: (encoded) => client.organization.create(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### After (Canonical Pattern)

```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.create(encoded))
);
```

### Key Differences

1. **Import changes**: `createHandler` → `wrapIamMethod` from `@beep/iam-client/_internal`
2. **Implementation style**: Factory config → `Wrapper.implement()` chaining
3. **Contract reference**: Explicit `wrapper` config instead of separate schemas
4. **Type inference**: Handler type inferred from `Wrapper.implement()` return

---

## Contract Pattern

All contracts now follow the `W.Wrapper.make()` pattern:

```typescript
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/crud/create");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    name: S.String,
    slug: S.String,
    // ...
  },
  formValuesAnnotation({
    name: "",
    slug: "",
    // ...
  })
) {}

export const Success = Organization;

export const Wrapper = W.Wrapper.make("Create", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
```

---

## WrapperGroup Composition

### Flat Modules (email-verification, multi-session, password)

```typescript
export const PasswordGroup = Wrap.WrapperGroup.make(
  Change.Contract.Wrapper,
  RequestReset.Contract.Wrapper,
  Reset.Contract.Wrapper
);
```

### Nested Modules (two-factor, organization)

```typescript
// Submodule groups
export const TwoFactorBackupGroup = Wrap.WrapperGroup.make(
  Generate.Contract.Wrapper,
  Verify.Contract.Wrapper
);

// Parent module merges submodules
export const TwoFactorGroup = TwoFactorBackupGroup.merge(
  TwoFactorOtpGroup,
  TwoFactorTotpGroup,
  Enable.Contract.Wrapper,
  Disable.Contract.Wrapper
);
```

---

## Critical API Discoveries

### 1. WrapperGroup.make() Signature

**WRONG** (legacy pattern):
```typescript
W.WrapperGroup.make("GroupName", { Handler1: Wrapper1, Handler2: Wrapper2 })
```

**CORRECT** (positional arguments):
```typescript
Wrap.WrapperGroup.make(Wrapper1, Wrapper2, Wrapper3)
```

### 2. WrapperGroup.merge() is Instance Method

**WRONG**:
```typescript
Wrap.WrapperGroup.merge(group1, group2, group3)
```

**CORRECT**:
```typescript
group1.merge(group2, group3)
```

### 3. Better Auth Query Wrapping

Some Better Auth methods expect payload wrapped in `query` object:

```typescript
// These methods expect { query: payload }
client.organization.listInvitations({ query: encoded })
client.organization.listMembers({ query: encoded })

// These methods expect flat payload
client.organization.create(encoded)
client.organization.inviteMember(encoded)
```

---

## Files Created/Modified

### Feature-Level Files (per handler)

Each handler directory now contains:
- `contract.ts` - Updated with `W.Wrapper.make()`
- `handler.ts` - Updated with `wrapIamMethod()`
- `mod.ts` - New barrel file (`export * from "./contract.ts"; export * from "./handler.ts"`)
- `index.ts` - Updated to namespace export (`export * as FeatureName from "./mod.ts"`)

### Module-Level Files

Each module now contains:
- `layer.ts` - `WrapperGroup` composition
- `service.ts` - Re-export of layer (simplified)
- `mod.ts` - Barrel file with all feature exports
- `index.ts` - Namespace export

### Nested Module Structure (two-factor, organization)

```
organization/
├── index.ts                    # export * as Organization from "./mod.ts"
├── mod.ts                      # Re-exports all submodules
├── layer.ts                    # OrganizationGroup = Crud.merge(Invitations, Members)
├── service.ts                  # Re-exports layer
├── _common/                    # Shared schemas (Organization, Member, Invitation)
├── crud/
│   ├── index.ts
│   ├── mod.ts
│   ├── layer.ts                # OrganizationCrudGroup
│   ├── service.ts
│   ├── create/                 # Handler directory
│   ├── delete/
│   ├── get-full/
│   ├── list/
│   ├── set-active/
│   └── update/
├── invitations/
│   ├── index.ts
│   ├── mod.ts
│   ├── layer.ts                # OrganizationInvitationsGroup
│   ├── service.ts
│   ├── accept/
│   ├── cancel/
│   ├── create/
│   ├── list/
│   └── reject/
└── members/
    ├── index.ts
    ├── mod.ts
    ├── layer.ts                # OrganizationMembersGroup
    ├── service.ts
    ├── list/
    ├── remove/
    └── update-role/
```

---

## Review Checklist

### Pattern Compliance

- [ ] All handlers use `Contract.Wrapper.implement()` pattern
- [ ] All handlers use `Common.wrapIamMethod()` factory
- [ ] All contracts use `W.Wrapper.make()` pattern
- [ ] All contracts include `formValuesAnnotation()` for default values
- [ ] All contracts use `Common.IamError` for error schema

### File Structure

- [ ] Each feature has `contract.ts`, `handler.ts`, `mod.ts`, `index.ts`
- [ ] Each module has `layer.ts`, `service.ts`, `mod.ts`, `index.ts`
- [ ] Namespace exports follow `export * as FeatureName from "./mod.ts"` pattern
- [ ] Barrel files follow `export * from "./contract.ts"; export * from "./handler.ts"` pattern

### WrapperGroup Composition

- [ ] Flat modules use `WrapperGroup.make(Wrapper1, Wrapper2, ...)`
- [ ] Nested modules use `.merge()` instance method
- [ ] Layer files export both `Group` and `layer`

### Session Mutation Flags

Verify `mutatesSession` flags are set correctly:

| Handler | mutatesSession |
|---------|---------------|
| `multi-session/set-active` | `true` |
| `multi-session/revoke` | `true` |
| `two-factor/enable` | `true` |
| `two-factor/disable` | `true` |
| `organization/crud/set-active` | `true` |
| All others | `false` |

### JSDoc Requirements

- [ ] All files have `@fileoverview`
- [ ] All files have `@module` tags with correct paths
- [ ] All files have `@category` tags following hierarchy
- [ ] All files have `@since 0.1.0` tags

---

## Verification Commands

```bash
# Type check
bun run check --filter @beep/iam-client

# Lint check
bun run lint --filter @beep/iam-client

# Lint fix (if needed)
bun run lint:fix --filter @beep/iam-client
```

---

## Known Edge Cases

### 1. Organization Create Handler

The `organization/crud/create` handler requires explicit Boolean coercion:

```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) =>
    client.organization.create({
      ...encoded,
      isPersonal: Boolean(encoded.isPersonal),  // Required for Better Auth
    })
  )
);
```

### 2. List Handlers with Query Wrapping

```typescript
// organization/invitations/list
(encoded) => client.organization.listInvitations({ query: encoded })

// organization/members/list
(encoded) => client.organization.listMembers({ query: encoded })
```

### 3. Two-Factor TOTP getUri

Returns `{ totpURI: string }` directly, not wrapped in `data`:

```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.twoFactor.getTOTPURI())
);
```

---

## Deprecation Candidates

After review approval, the following can be deprecated:

1. `packages/iam/client/src/_internal/handler.factory.ts` - Legacy `createHandler` factory
2. Any remaining references to `createHandler` pattern in documentation

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `documentation/patterns/iam-client-patterns.md` | **Primary pattern reference** |
| `packages/iam/client/AGENTS.md` | Package-specific agent guide |
| `specs/iam-client-legacy-refactor/REFLECTION_LOG.md` | Migration learnings |

---

## Next Steps After Review

1. **If Approved**:
   - Deprecate `createHandler` factory
   - Update `packages/iam/client/AGENTS.md` to remove legacy pattern references
   - Close the spec as complete

2. **If Changes Requested**:
   - Address review feedback
   - Re-run verification commands
   - Update this handoff with resolution notes
