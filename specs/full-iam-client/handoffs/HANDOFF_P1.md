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
├── index.ts                     # Re-exports all handlers (create LAST)
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

> **Note**: Create `multi-session/index.ts` as the FINAL step after all 3 handlers are complete. This barrel file re-exports all sub-modules.

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
// Note: Better Auth client SDK returns Date objects, not ISO strings
export const Session = S.Struct({
  id: S.String,
  userId: S.String,
  token: S.String,
  expiresAt: S.Date,
  ipAddress: S.optionalWith(S.String, { nullable: true }),
  userAgent: S.optionalWith(S.String, { nullable: true }),
  createdAt: S.Date,
  updatedAt: S.Date,
});
export type Session = S.Schema.Type<typeof Session>;

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

// Success response - session activation confirmed
// Better Auth returns { status: boolean } on success
export const Success = S.Struct({
  status: S.Boolean,
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

// Success response - session revocation confirmed
// Better Auth returns { status: boolean } on success
export const Success = S.Struct({
  status: S.Boolean,
});
export type Success = S.Schema.Type<typeof Success>;
```

---

## Pre-flight Verification

Before implementing, verify Better Auth method signatures exist:

```typescript
// In editor, hover over these to confirm signatures:
client.multiSession.listDeviceSessions  // (params: {}) => Promise<...>
client.multiSession.setActive           // (params: { sessionToken: string }) => Promise<...>
client.multiSession.revoke              // (params: { sessionToken: string }) => Promise<...>
```

If any method is missing or has a different signature, consult the [Better Auth Multi-Session Docs](https://www.better-auth.com/docs/plugins/multi-session) and update this handoff.

---

## Schema Type Decision Table

Use this table when defining contract schemas:

| Better Auth Returns | Effect Schema | Example |
|---------------------|---------------|---------|
| `Date` object | `S.Date` | `expiresAt: S.Date` |
| ISO date string | `S.DateFromString` | `createdAt: S.DateFromString` |
| `string \| undefined` | `S.optional(S.String)` | `name: S.optional(S.String)` |
| `string \| null \| undefined` | `S.optionalWith(S.String, { nullable: true })` | `ipAddress: S.optionalWith(S.String, { nullable: true })` |
| Server-generated token | `S.String` (NOT `S.Redacted`) | `sessionToken: S.String` |
| User credential | `S.Redacted(S.String)` | `password: S.Redacted(S.String)` |

> **Note**: Better Auth client SDK typically returns `Date` objects (not strings) for timestamp fields. Use `S.Date` unless you observe ISO strings at runtime.

---

## Implementation Order

1. **list-sessions** (easiest - no payload, read-only)
2. **set-active** (simple payload, mutates session)
3. **revoke** (simple payload, mutates session)
4. **multi-session/index.ts** (barrel file - create LAST)

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
2. **Session Token Handling**: Use plain `S.String` for `sessionToken` - it's a server-generated identifier, not a user credential. Reserve `S.Redacted` for passwords and API keys only.
3. **Response Shape Verification**: Verify exact `response.data` shape before finalizing Success schema (see protocol below)
4. **Encoded Payload in Factory**: The `execute` function receives the **encoded** payload (after schema encoding), not the decoded type. Pass it directly to Better Auth without manual transformation:
   ```typescript
   // Correct - pass encoded directly
   execute: (encoded) => client.multiSession.setActive(encoded)

   // WRONG - don't re-encode or extract fields manually
   execute: (encoded) => client.multiSession.setActive({ sessionToken: encoded.sessionToken })
   ```
5. **Date Fields**: Better Auth client SDK returns `Date` objects, not ISO strings. Use `S.Date` (not `S.DateFromString`) for timestamp fields.
6. **Nullable vs Optional**: Better Auth may return `null` for optional fields. Use `S.optionalWith(S.String, { nullable: true })` instead of plain `S.optional(S.String)` for robustness.

---

## Response Shape Verification Protocol

Before finalizing any Success schema, verify the exact response shape from Better Auth:

### Step 1: Check Better Auth Documentation

Consult the official docs for the method's expected response:
- [Multi-Session Plugin Docs](https://www.better-auth.com/docs/plugins/multi-session)

### Step 2: Runtime Verification (Recommended)

If documentation is unclear, verify at runtime:

```typescript
// Temporary debug code - remove after verification
const response = await client.multiSession.setActive({ sessionToken: "test" });
console.log("Response shape:", JSON.stringify(response, null, 2));
```

### Step 3: Schema Definition Rules

| Response Pattern | Schema Approach |
|------------------|-----------------|
| `{ status: boolean }` | `S.Struct({ status: S.Boolean })` |
| `{ data: T }` | Schema for `T` directly (factory unwraps) |
| `{ session: Session }` | `S.Struct({ session: SessionSchema })` |
| Empty/void | `S.Struct({})` |

### Step 4: Update Schema and Document

After verification:
1. Update the Success schema with exact fields
2. Add a comment noting the verified response shape
3. Update this handoff if the documented shape differs

> **Expected shapes for Phase 1** (based on Better Auth multi-session plugin):
> - `listDeviceSessions`: Returns `Session[]` directly in `data`
> - `setActive`: Returns `{ status: boolean }` in `data`
> - `revoke`: Returns `{ status: boolean }` in `data`

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
