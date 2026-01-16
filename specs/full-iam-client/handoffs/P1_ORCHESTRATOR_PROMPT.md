# Phase 1 Orchestrator Prompt: Multi-Session Implementation

**Spec**: `full-iam-client`
**Phase**: 1 (Multi-Session)
**Status**: READY FOR EXECUTION
**Objective**: Implement Effect wrappers for Better Auth multi-session plugin methods

---

## Context

You are executing Phase 1 of the `full-iam-client` specification. Phase 0 completed discovery and verified all Better Auth methods exist.

### Background Reading (Priority Order)

1. **This prompt** - Current phase instructions
2. **`handoffs/HANDOFF_P1.md`** - Detailed implementation guidance
3. **`outputs/method-inventory.md`** - Complete method catalog with verified signatures
4. **`packages/iam/client/src/_common/handler.factory.ts`** - Factory pattern implementation

### Key Discovery from Phase 0

Method names differ from original expectations:
- `client.multiSession.setActive()` (NOT `setActiveSession`)
- `client.multiSession.revoke()` (NOT `revokeDeviceSession`)
- `client.multiSession.listDeviceSessions({})` - requires empty object parameter

---

## Phase 1 Tasks

### Task 1.1: Create Directory Structure

Create the multi-session module structure:

```bash
mkdir -p packages/iam/client/src/multi-session/{list-sessions,set-active,revoke}
```

### Task 1.2: Implement list-sessions Handler

**Location**: `packages/iam/client/src/multi-session/list-sessions/`

**Files to create:**

1. **list-sessions.contract.ts**
```typescript
import * as S from "effect/Schema";

// No payload needed - Better Auth expects empty object
export const Payload = S.Struct({});
export type Payload = S.Schema.Type<typeof Payload>;

// Session schema based on Better Auth response
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
export type Session = S.Schema.Type<typeof Session>;

export const Success = S.Array(Session);
export type Success = S.Schema.Type<typeof Success>;
```

2. **list-sessions.handler.ts**
```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./list-sessions.contract.ts";

/**
 * Handler for listing all device sessions for the current user.
 *
 * Features:
 * - Returns all active sessions across devices
 * - Does NOT notify $sessionSignal (read-only operation)
 * - Uses consistent span naming: "multi-session/list-sessions/handler"
 */
export const Handler = createHandler({
  domain: "multi-session",
  feature: "list-sessions",
  execute: () => client.multiSession.listDeviceSessions({}),
  successSchema: Contract.Success,
  mutatesSession: false,
});
```

3. **index.ts**
```typescript
export * as Contract from "./list-sessions.contract.ts";
export { Handler } from "./list-sessions.handler.ts";
```

### Task 1.3: Implement set-active Handler

**Location**: `packages/iam/client/src/multi-session/set-active/`

**Files to create:**

1. **set-active.contract.ts**
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

2. **set-active.handler.ts**
```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./set-active.contract.ts";

/**
 * Handler for setting a specific session as active.
 *
 * Features:
 * - Switches to a different session by token
 * - Notifies $sessionSignal after success (session state changes)
 * - Uses consistent span naming: "multi-session/set-active/handler"
 */
export const Handler = createHandler({
  domain: "multi-session",
  feature: "set-active",
  execute: (encoded) => client.multiSession.setActive(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

3. **index.ts**
```typescript
export * as Contract from "./set-active.contract.ts";
export { Handler } from "./set-active.handler.ts";
```

### Task 1.4: Implement revoke Handler

**Location**: `packages/iam/client/src/multi-session/revoke/`

**Files to create:**

1. **revoke.contract.ts**
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

2. **revoke.handler.ts**
```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./revoke.contract.ts";

/**
 * Handler for revoking a specific session.
 *
 * Features:
 * - Removes a session by token
 * - Notifies $sessionSignal after success (session state changes)
 * - Uses consistent span naming: "multi-session/revoke/handler"
 */
export const Handler = createHandler({
  domain: "multi-session",
  feature: "revoke",
  execute: (encoded) => client.multiSession.revoke(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

3. **index.ts**
```typescript
export * as Contract from "./revoke.contract.ts";
export { Handler } from "./revoke.handler.ts";
```

### Task 1.5: Create Module Index

**Location**: `packages/iam/client/src/multi-session/index.ts`

```typescript
export * as ListSessions from "./list-sessions/index.ts";
export * as SetActive from "./set-active/index.ts";
export * as Revoke from "./revoke/index.ts";
```

### Task 1.6: Add to Package Exports

Update `packages/iam/client/src/index.ts` to export the new module:

```typescript
// Add to existing exports
export * as MultiSession from "./multi-session/index.ts";
```

### Task 1.7: Verify Implementation

Run verification commands:

```bash
# Type check
bun run --filter @beep/iam-client check

# Lint and fix
bun run --filter @beep/iam-client lint:fix
```

---

## Important Patterns

### Factory Pattern Usage

All three handlers use the factory pattern because:
1. Standard `{ data, error }` response shape
2. No computed fields in payload
3. Simple encode → execute → decode flow

### Session Signal Notification

| Handler | `mutatesSession` | Reason |
|---------|------------------|--------|
| list-sessions | `false` | Read-only operation |
| set-active | `true` | Changes active session context |
| revoke | `true` | Removes a session from the system |

### Session Token Handling

Session tokens are NOT user credentials - they are opaque identifiers returned by the server.
Use plain `S.String` and pass encoded payloads directly to handlers:

```typescript
// In contract
export const Payload = S.Struct({
  sessionToken: S.String,  // Plain string - not a user credential
});

// In handler - pass encoded directly
execute: (encoded) => client.multiSession.setActive(encoded),
```

> **Note**: Reserve `S.Redacted(S.String)` for actual user credentials like passwords and API keys
> that should never appear in logs. Session tokens are server-generated and safe to log.

---

## Effect Patterns Reminder

```typescript
// REQUIRED - Namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// REQUIRED - PascalCase constructors
S.String    // Correct
S.string    // WRONG

// REQUIRED - No native methods
A.map(array, fn)    // Correct
array.map(fn)       // WRONG
```

---

## Completion Protocol

After completing Phase 1:

### 1. Verify All Checks Pass

```bash
bun run --filter @beep/iam-client check
bun run --filter @beep/iam-client lint
```

### 2. Update REFLECTION_LOG.md

```markdown
## Phase 1: Multi-Session Implementation

**Date**: [DATE]

### What Was Done
- Implemented 3 multi-session handlers
- All using factory pattern as predicted

### What Worked Well
- [Patterns that helped]

### What Needed Adjustment
- [Any schema refinements needed]
- [Any factory limitations encountered]

### Learnings
- [Insights about Better Auth response shapes]
- [Any pattern refinements for future phases]

### Metrics
- Handlers implemented: 3
- Type errors resolved: X
- Factory pattern success rate: 100%
```

### 3. Create HANDOFF_P2.md

Create handoff for Phase 2 (Password Recovery):

```markdown
# Phase 2 Handoff: Password Recovery Implementation

**From**: Phase 1 (Multi-Session)
**To**: Phase 2 (Password Recovery)

## Phase 1 Summary
[What was accomplished]

## Methods to Implement
- requestPasswordReset
- resetPassword
- changePassword

## Learnings Applied
[Any refinements from Phase 1]
```

---

## Success Criteria

Phase 1 is complete when:
- [ ] `multi-session/list-sessions/` implemented with factory pattern
- [ ] `multi-session/set-active/` implemented with factory pattern, `mutatesSession: true`
- [ ] `multi-session/revoke/` implemented with factory pattern, `mutatesSession: true`
- [ ] `multi-session/index.ts` exports all handlers
- [ ] Package `index.ts` exports `MultiSession` module
- [ ] `bun run --filter @beep/iam-client check` passes
- [ ] `bun run --filter @beep/iam-client lint` passes
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] HANDOFF_P2.md created for Password Recovery phase

---

## Quick Reference

### Files to Create
1. `packages/iam/client/src/multi-session/list-sessions/list-sessions.contract.ts`
2. `packages/iam/client/src/multi-session/list-sessions/list-sessions.handler.ts`
3. `packages/iam/client/src/multi-session/list-sessions/index.ts`
4. `packages/iam/client/src/multi-session/set-active/set-active.contract.ts`
5. `packages/iam/client/src/multi-session/set-active/set-active.handler.ts`
6. `packages/iam/client/src/multi-session/set-active/index.ts`
7. `packages/iam/client/src/multi-session/revoke/revoke.contract.ts`
8. `packages/iam/client/src/multi-session/revoke/revoke.handler.ts`
9. `packages/iam/client/src/multi-session/revoke/index.ts`
10. `packages/iam/client/src/multi-session/index.ts`

### Files to Modify
1. `packages/iam/client/src/index.ts` - Add MultiSession export

### Better Auth Method Signatures
```typescript
client.multiSession.listDeviceSessions({})
client.multiSession.setActive({ sessionToken: string })
client.multiSession.revoke({ sessionToken: string })
```

---

**Begin Phase 1 execution now.**
