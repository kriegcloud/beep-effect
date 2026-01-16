# Phase 1 Handoff: Multi-Session Implementation

**Date**: 2026-01-15
**From**: Phase 0 (Discovery & Audit)
**To**: Phase 1 (Multi-Session)
**Status**: Ready for implementation

---

## Phase 0 Summary

Phase 0 successfully verified all Better Auth client methods and created a comprehensive inventory. Key discoveries:

1. **Method name corrections** from original handoff:
   - `setActiveSession` → `setActive`
   - `revokeDeviceSession` → `revoke`
   - `revokeSessions` → handled via core session methods or sign-out

2. **All methods verified** - 55+ methods cataloged with exact signatures

3. **Pattern classification complete** - ~80% can use Factory pattern

---

## Methods to Implement

### Multi-Session Plugin (`client.multiSession.*`)

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| listDeviceSessions | `client.multiSession.listDeviceSessions()` | `{}` | `{ data: Session[], error }` | No | Factory |
| setActive | `client.multiSession.setActive()` | `{ sessionToken: string }` | `{ data, error }` | Yes | Factory |
| revoke | `client.multiSession.revoke()` | `{ sessionToken: string }` | `{ data, error }` | Yes | Factory |

### Directory Structure

```
packages/iam/client/src/multi-session/
├── index.ts                     # Re-exports all handlers
├── list-sessions/
│   ├── index.ts
│   ├── list-sessions.contract.ts
│   └── list-sessions.handler.ts
├── set-active/
│   ├── index.ts
│   ├── set-active.contract.ts
│   └── set-active.handler.ts
└── revoke/
    ├── index.ts
    ├── revoke.contract.ts
    └── revoke.handler.ts
```

---

## Pattern Decisions

### All Three Methods: Factory Pattern

All multi-session methods are straightforward:
- Standard `{ data, error }` response shape
- No computed fields in payload
- No complex transformations

```typescript
// Example: list-sessions handler
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./list-sessions.contract.ts";

export const Handler = createHandler({
  domain: "multi-session",
  feature: "list-sessions",
  execute: () => client.multiSession.listDeviceSessions({}),
  successSchema: Contract.Success,
  mutatesSession: false,
});
```

### Session Signal Notification

| Method | `mutatesSession` Setting |
|--------|-------------------------|
| listDeviceSessions | `false` (read-only) |
| setActive | `true` (switches active session) |
| revoke | `true` (removes a session) |

---

## Schema Shapes

### Session Type (from Better Auth)

```typescript
interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Contract Schemas

**list-sessions.contract.ts:**
```typescript
import * as S from "effect/Schema";

// No payload - empty object
export const Payload = S.Struct({});
export type Payload = S.Schema.Type<typeof Payload>;

// Success schema - array of sessions
export const Session = S.Struct({
  id: S.String,
  userId: S.String,
  token: S.String,
  expiresAt: S.DateFromString,
  ipAddress: S.optional(S.String),
  userAgent: S.optional(S.String),
  createdAt: S.DateFromString,
  updatedAt: S.DateFromString,
});

export const Success = S.Array(Session);
export type Success = S.Schema.Type<typeof Success>;
```

**set-active.contract.ts:**
```typescript
import * as S from "effect/Schema";

export const Payload = S.Struct({
  sessionToken: S.String,
});
export type Payload = S.Schema.Type<typeof Payload>;

// Success likely returns the activated session or confirmation
export const Success = S.Struct({
  // Verify exact shape from response
});
export type Success = S.Schema.Type<typeof Success>;
```

**revoke.contract.ts:**
```typescript
import * as S from "effect/Schema";

export const Payload = S.Struct({
  sessionToken: S.String,
});
export type Payload = S.Schema.Type<typeof Payload>;

// Success likely returns confirmation
export const Success = S.Struct({
  // Verify exact shape from response
});
export type Success = S.Schema.Type<typeof Success>;
```

---

## Implementation Order

1. **list-sessions** (easiest - no payload, read-only)
2. **set-active** (simple payload, mutates session)
3. **revoke** (simple payload, mutates session)

---

## Verification Steps

After implementing each handler:

1. **Type Check**:
   ```bash
   bun run --filter @beep/iam-client check
   ```

2. **Lint**:
   ```bash
   bun run --filter @beep/iam-client lint:fix
   ```

3. **Manual Testing** (if dev environment available):
   - Sign in on multiple devices/browsers
   - Call `listDeviceSessions` to verify sessions listed
   - Call `setActive` to switch sessions
   - Call `revoke` to remove a session

---

## Files to Reference

### Pattern Templates
- `packages/iam/client/src/_common/handler.factory.ts` - Factory implementation
- `packages/iam/client/src/_common/errors.ts` - Error hierarchy

### Example Handlers
- `packages/iam/client/src/sign-in/email/` - Factory pattern with payload
- `packages/iam/client/src/core/sign-out/` - Factory pattern without payload

### Method Inventory
- `specs/full-iam-client/outputs/method-inventory.md` - Complete method catalog

---

## Gotchas

1. **Empty Object Parameter**: `listDeviceSessions({})` requires empty object, not no args
2. **Session Token Sensitivity**: `sessionToken` should use `S.Redacted(S.String)` for security
3. **Response Shape Verification**: Verify exact `response.data` shape before finalizing Success schema

---

## Success Criteria

Phase 1 is complete when:
- [ ] 3 handlers implemented (list-sessions, set-active, revoke)
- [ ] All handlers use factory pattern
- [ ] Session-mutating handlers notify `$sessionSignal`
- [ ] Type check passes: `bun run --filter @beep/iam-client check`
- [ ] Lint passes: `bun run --filter @beep/iam-client lint`
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] HANDOFF_P2.md created for Password Recovery phase
