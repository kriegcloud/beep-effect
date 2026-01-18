# Migration Design — Phase 2

> Per-module design decisions for migrating legacy handlers to canonical patterns.
> **Created**: 2026-01-18

---

## Design Principles

1. **Simple Pattern Only**: All 30 handlers use the Simple Pattern (no PayloadFrom transforms needed)
2. **No CaptchaMiddleware**: None of the legacy handlers require captcha
3. **Consistent Error Handling**: All handlers use `Common.IamError`
4. **File Renaming**: Rename `{feature}.contract.ts` → `contract.ts`, etc.
5. **Module-Level Files**: Each module needs `layer.ts`, `service.ts`, `atoms.ts`, `mod.ts`, `index.ts`

---

## Module 1: email-verification

### Current Structure
```
email-verification/
├── index.ts
├── send-verification/
│   ├── index.ts
│   ├── send-verification.contract.ts
│   └── send-verification.handler.ts
```

### Target Structure
```
email-verification/
├── index.ts           # export * as EmailVerification from "./mod.ts"
├── mod.ts             # barrel exports
├── layer.ts           # WrapperGroup with single wrapper
├── service.ts         # Effect.Service + runtime
├── atoms.ts           # use() hook
├── send-verification/
│   ├── index.ts       # export * as SendVerification from "./mod.ts"
│   ├── mod.ts         # export * from "./contract.ts"; export * from "./handler.ts"
│   ├── contract.ts    # Payload, Success, Wrapper
│   └── handler.ts     # Handler using wrapIamMethod
```

### WrapperGroup Composition
```typescript
export const Group = Wrap.WrapperGroup.make(SendVerification.Wrapper);
```

### Service Definition
```typescript
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("SendVerification"),
}) {}
```

### Atom Pattern
```typescript
const SendVerificationAtom = runtime.fn(
  F.flow(
    Service.SendVerification,
    withToast({
      onDefect: "An unknown error occurred",
      onFailure: (e) => e.message,
      onSuccess: "Verification email sent",
      onWaiting: "Sending verification email...",
    }),
    Effect.asVoid
  )
);

export const use = () => ({
  sendVerification: useAtomSet(SendVerificationAtom, Common.modePromise),
});
```

### Form Integration
**Not needed** — triggered by email links, not user forms

### File Operations
| Current | Action | Target |
|---------|--------|--------|
| `send-verification.contract.ts` | Rename + update | `contract.ts` |
| `send-verification.handler.ts` | Rename + update | `handler.ts` |
| `index.ts` (feature) | Update | `index.ts` + `mod.ts` |
| — | Create | `layer.ts` |
| — | Create | `service.ts` |
| — | Create | `atoms.ts` |
| — | Create | `mod.ts` (module level) |
| `index.ts` (module) | Update | namespace export |

---

## Module 2: multi-session

### Current Structure
```
multi-session/
├── index.ts
├── list-sessions/
│   ├── index.ts
│   ├── list-sessions.contract.ts
│   └── list-sessions.handler.ts
├── revoke/
│   ├── index.ts
│   ├── revoke.contract.ts
│   └── revoke.handler.ts
├── set-active/
│   ├── index.ts
│   ├── set-active.contract.ts
│   └── set-active.handler.ts
```

### Target Structure
```
multi-session/
├── index.ts           # export * as MultiSession from "./mod.ts"
├── mod.ts             # barrel exports
├── layer.ts           # WrapperGroup with 3 wrappers
├── service.ts         # Effect.Service + runtime
├── atoms.ts           # use() hook
├── list-sessions/
│   ├── index.ts
│   ├── mod.ts
│   ├── contract.ts
│   └── handler.ts
├── revoke/
│   ├── index.ts
│   ├── mod.ts
│   ├── contract.ts
│   └── handler.ts
├── set-active/
│   ├── index.ts
│   ├── mod.ts
│   ├── contract.ts
│   └── handler.ts
```

### WrapperGroup Composition
```typescript
export const Group = Wrap.WrapperGroup.make(
  ListSessions.Wrapper,
  Revoke.Wrapper,
  SetActive.Wrapper
);
```

### Session Mutations
| Handler | `mutatesSession` |
|---------|------------------|
| `list-sessions` | `false` |
| `revoke` | `true` |
| `set-active` | `true` |

### Service Definition
```typescript
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("ListSessions", "Revoke", "SetActive"),
}) {}
```

### Atom Pattern
```typescript
export const use = () => ({
  listSessions: useAtomSet(ListSessionsAtom, Common.modePromise),
  revoke: useAtomSet(RevokeAtom, Common.modePromise),
  setActive: useAtomSet(SetActiveAtom, Common.modePromise),
});
```

### Form Integration
**Not needed** — programmatic session management (buttons, not forms)

---

## Module 3: password

### Current Structure
```
password/
├── index.ts
├── change/
│   ├── index.ts
│   ├── change.contract.ts
│   └── change.handler.ts
├── request-reset/
│   ├── index.ts
│   ├── request-reset.contract.ts
│   └── request-reset.handler.ts
├── reset/
│   ├── index.ts
│   ├── reset.contract.ts
│   └── reset.handler.ts
```

### Target Structure
```
password/
├── index.ts
├── mod.ts
├── layer.ts
├── service.ts
├── atoms.ts
├── form.ts            # 3 form hooks
├── change/
│   ├── index.ts
│   ├── mod.ts
│   ├── contract.ts    # + formValuesAnnotation
│   └── handler.ts
├── request-reset/
│   ├── index.ts
│   ├── mod.ts
│   ├── contract.ts    # + formValuesAnnotation
│   └── handler.ts
├── reset/
│   ├── index.ts
│   ├── mod.ts
│   ├── contract.ts    # + formValuesAnnotation
│   └── handler.ts
```

### WrapperGroup Composition
```typescript
export const Group = Wrap.WrapperGroup.make(
  Change.Wrapper,
  RequestReset.Wrapper,
  Reset.Wrapper
);
```

### Session Mutations
| Handler | `mutatesSession` |
|---------|------------------|
| `change` | `true` |
| `request-reset` | `false` |
| `reset` | `false` |

### Schema Corrections
1. `change/contract.ts`: Change `currentPassword: S.String` → `currentPassword: S.Redacted(S.String)`
2. `change/contract.ts`: Change `newPassword: S.String` → `newPassword: S.Redacted(S.String)`
3. `change/contract.ts`: Replace local `User` class with `Common.DomainUserFromBetterAuthUser`
4. `reset/contract.ts`: Change `newPassword: S.String` → `newPassword: S.Redacted(S.String)`

### Form Integration
```typescript
export const use = () => {
  const { change, requestReset, reset } = Atoms.use();

  return {
    changeForm: useAppForm(
      formOptionsWithDefaults({
        schema: Change.Payload,
        onSubmit: change,
      })
    ),
    requestResetForm: useAppForm(
      formOptionsWithDefaults({
        schema: RequestReset.Payload,
        onSubmit: requestReset,
      })
    ),
    resetForm: useAppForm(
      formOptionsWithDefaults({
        schema: Reset.Payload,
        onSubmit: reset,
      })
    ),
  };
};
```

---

## Module 4: two-factor

### Current Structure
```
two-factor/
├── index.ts
├── _common/
│   └── user.schema.ts   # TwoFactorUser
├── enable/
├── disable/
├── backup/
│   ├── generate/
│   └── verify/
├── otp/
│   ├── send/
│   └── verify/
├── totp/
│   ├── get-uri/
│   └── verify/
```

### Target Structure
```
two-factor/
├── index.ts
├── mod.ts
├── layer.ts           # WrapperGroup with 8 wrappers
├── service.ts
├── atoms.ts
├── form.ts            # 7 form hooks
├── _common/
│   └── user.schema.ts
├── enable/
│   ├── index.ts
│   ├── mod.ts
│   ├── contract.ts
│   └── handler.ts
├── disable/
│   └── ...
├── backup/
│   ├── generate/
│   └── verify/
├── otp/
│   ├── send/
│   └── verify/
├── totp/
│   ├── get-uri/
│   └── verify/
```

### WrapperGroup Composition
```typescript
export const Group = Wrap.WrapperGroup.make(
  Enable.Wrapper,
  Disable.Wrapper,
  BackupGenerate.Wrapper,
  BackupVerify.Wrapper,
  OtpSend.Wrapper,
  OtpVerify.Wrapper,
  TotpGetUri.Wrapper,
  TotpVerify.Wrapper
);
```

### Session Mutations
| Handler | `mutatesSession` |
|---------|------------------|
| `enable` | `false` |
| `disable` | `true` |
| `backup/generate` | `false` |
| `backup/verify` | `true` |
| `otp/send` | `false` |
| `otp/verify` | `true` |
| `totp/get-uri` | `false` |
| `totp/verify` | `true` |

### Service Definition
```typescript
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers(
    "Enable",
    "Disable",
    "BackupGenerate",
    "BackupVerify",
    "OtpSend",
    "OtpVerify",
    "TotpGetUri",
    "TotpVerify"
  ),
}) {}
```

### Form Integration

Forms needed for:
1. `enable` — password confirmation
2. `disable` — password confirmation
3. `backup/generate` — password confirmation
4. `backup/verify` — code entry
5. `otp/verify` — code entry
6. `totp/get-uri` — password confirmation
7. `totp/verify` — code entry

`otp/send` is button-triggered, no form needed.

---

## Module 5: organization

### Current Structure
```
organization/
├── index.ts
├── _common/
│   ├── index.ts
│   ├── organization.schema.ts
│   ├── full-organization.schema.ts
│   ├── member.schema.ts
│   └── invitation.schema.ts
├── crud/
│   ├── create/
│   ├── delete/
│   ├── get-full/
│   ├── list/
│   ├── set-active/
│   └── update/
├── invitations/
│   ├── accept/
│   ├── cancel/
│   ├── create/
│   ├── list/
│   └── reject/
├── members/
│   ├── list/
│   ├── remove/
│   └── update-role/
```

### Target Structure
Same directory structure with added module-level files:
```
organization/
├── index.ts
├── mod.ts
├── layer.ts           # WrapperGroup with 15 wrappers
├── service.ts
├── atoms.ts
├── form.ts            # 4 form hooks
├── _common/           # Keep shared schemas
└── ...                # Sub-modules unchanged structure
```

### WrapperGroup Composition
```typescript
export const Group = Wrap.WrapperGroup.make(
  // CRUD
  CrudCreate.Wrapper,
  CrudDelete.Wrapper,
  CrudGetFull.Wrapper,
  CrudList.Wrapper,
  CrudSetActive.Wrapper,
  CrudUpdate.Wrapper,
  // Invitations
  InvitationsAccept.Wrapper,
  InvitationsCancel.Wrapper,
  InvitationsCreate.Wrapper,
  InvitationsList.Wrapper,
  InvitationsReject.Wrapper,
  // Members
  MembersList.Wrapper,
  MembersRemove.Wrapper,
  MembersUpdateRole.Wrapper
);
```

### Session Mutations
| Handler | `mutatesSession` |
|---------|------------------|
| `crud/set-active` | `true` |
| All others | `false` |

### Service Definition
```typescript
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers(
    "CrudCreate",
    "CrudDelete",
    "CrudGetFull",
    "CrudList",
    "CrudSetActive",
    "CrudUpdate",
    "InvitationsAccept",
    "InvitationsCancel",
    "InvitationsCreate",
    "InvitationsList",
    "InvitationsReject",
    "MembersList",
    "MembersRemove",
    "MembersUpdateRole"
  ),
}) {}
```

### Form Integration

Forms needed for:
1. `crud/create` — create org form
2. `crud/update` — update org form
3. `invitations/create` — invite member form
4. `members/update-role` — update role form

All other handlers are programmatic (button clicks, list operations).

### Schema Corrections
1. `crud/create`: Fix `isPersonal` encoding to avoid `Boolean()` workaround

---

## Naming Conventions Summary

### Wrapper Names
- Feature directories → PascalCase: `list-sessions/` → `ListSessions.Wrapper`
- Nested features → Combined: `backup/generate/` → `BackupGenerate.Wrapper`

### Service Accessors
- Match wrapper names: `Service.ListSessions`, `Service.BackupGenerate`

### File Renaming Pattern
| Current | Target |
|---------|--------|
| `{feature}.contract.ts` | `contract.ts` |
| `{feature}.handler.ts` | `handler.ts` |
| (add) | `mod.ts` |
| `index.ts` | Update to namespace export |

---

## Implementation Order

1. **email-verification** (1 handler) — Validate patterns with simplest module
2. **multi-session** (3 handlers) — Test WrapperGroup without forms
3. **password** (3 handlers) — Introduce form.ts pattern + schema corrections
4. **two-factor** (8 handlers) — Complex sub-module structure
5. **organization** (15 handlers) — Most complex, multiple sub-modules

---

## Dry Run Handlers

Per HANDOFF_P1, implement these 3 handlers as trial:

1. **multi-session/list-sessions** — No-payload handler pattern
2. **email-verification/send-verification** — Simple with-payload handler
3. **password/change** — With-payload + session mutation + schema corrections

Document findings, verify type-check passes, then rollback.
