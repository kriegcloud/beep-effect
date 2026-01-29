# Phase 2 Handoff: Core Email RPC

**Date**: 2025-01-29
**From**: Phase 1 (Email Drivers)
**To**: Phase 2 (Core Email RPC)
**Status**: Ready for implementation

---

## Context for Phase 2

### Working Context (Critical - Read First)

**Current Task**: Implement RPC contracts and handlers for core email functionality - connections, labels, drafts, and mail routers.

**Success Criteria**:
- 4 Connections RPC contracts (list, setDefault, delete, getDefault)
- 5 Labels RPC contracts (list, create, update, delete, get)
- 4 Drafts RPC contracts (create, get, list, delete)
- 26 Mail RPC contracts (listThreads, getThread, sendMail, etc.)
- All handlers implemented using MailDriver
- Middleware for auth and active connection resolution
- RPC Groups composed into `CommsRpcsLive` Layer

**Blocking Issues**: None if P0 and P1 completed

**Immediate Dependencies**:
- P0: EntityIds, domain models, error types
- P1: `MailDriver` interface, Gmail/Outlook drivers
- Existing: `Policy.AuthContext`, `Policy.AuthContextRpcMiddleware`

### Episodic Context (P1 Summary)

**What P1 Accomplished**:
- Extended Gmail WrapperGroup with 10 new operations (22 total)
- Created `MailDriver` provider-agnostic interface
- Implemented `GmailDriverAdapter` wrapping Gmail actions
- Implemented `OutlookDriver` using Microsoft Graph API
- Created `MailDriverFactory` for provider selection

**Key Decisions**:
- `MailDriver` returns `Option` for nullable fields (not null)
- `ProviderApiError` unified error type for both providers
- `ActiveConnection` context tag carries current connection info

**Patterns Discovered**:
- Graph API pagination uses `@odata.nextLink` - extract skip manually
- Gmail `UNREAD` label vs Outlook `isRead` property

### Semantic Context (Tech Stack)

- **RPC**: `@effect/rpc/Rpc`, `@effect/rpc/RpcGroup`
- **Auth**: `Policy.AuthContext`, `Policy.AuthContextRpcMiddleware`
- **Driver**: `MailDriver` context tag from P1
- **Domain**: `@beep/comms-domain` entities and value objects

### Procedural Context (Reference Links)

- RPC patterns: `packages/shared/domain/src/rpc/`
- RPC handlers: `packages/iam/server/src/rpc/`
- Middleware: `packages/shared/domain/src/policies/`
- Domain values: `packages/comms/domain/src/value-objects/mail.value.ts`

---

## Source Verification (MANDATORY)

### Zero tRPC Procedures (from MAPPING.md)

| Router | Procedures | Effect RPC Group |
|--------|------------|------------------|
| `connections` | 4 | `ConnectionsRpcs` |
| `labels` | 5 | `LabelsRpcs` |
| `drafts` | 4 | `DraftsRpcs` |
| `mail` | 26 | `MailRpcs` |

**Total**: 39 procedures in Phase 2

### Contract to Zero Mapping

| Effect Contract | Zero Procedure | Type |
|-----------------|----------------|------|
| `listConnections` | `connections.list` | query |
| `setDefaultConnection` | `connections.setDefault` | mutation |
| `deleteConnection` | `connections.delete` | mutation |
| `getDefaultConnection` | `connections.getDefault` | query |
| `listLabels` | `labels.list` | query |
| `createLabel` | `labels.create` | mutation |
| `updateLabel` | `labels.update` | mutation |
| `deleteLabel` | `labels.delete` | mutation |
| `createDraft` | `drafts.create` | mutation |
| `getDraft` | `drafts.get` | query |
| `listDrafts` | `drafts.list` | query |
| `deleteDraft` | `drafts.delete` | mutation |
| `listThreads` | `mail.listThreads` | query |
| `getThread` | `mail.get` | query |
| `sendMail` | `mail.send` | mutation |
| ... | (26 total mail procedures) | ... |

---

## Deliverables

### 1. Connections RPC Contracts

**Location**: `packages/comms/domain/src/rpc/v1/connections/`

| Contract | File | Payload | Success |
|----------|------|---------|---------|
| `listConnections` | `list-connections.ts` | `{}` | `{ connections: ConnectionInfo[], disconnectedIds: ConnectionId[] }` |
| `setDefaultConnection` | `set-default-connection.ts` | `{ connectionId }` | `{ success: boolean }` |
| `deleteConnection` | `delete-connection.ts` | `{ connectionId }` | `{ success: boolean }` |
| `getDefaultConnection` | `get-default-connection.ts` | `{}` | `{ connection: ConnectionInfo | null }` |

### 2. Labels RPC Contracts

**Location**: `packages/comms/domain/src/rpc/v1/labels/`

| Contract | File | Payload | Success |
|----------|------|---------|---------|
| `listLabels` | `list-labels.ts` | `{}` | `{ labels: Label[] }` |
| `createLabel` | `create-label.ts` | `{ name, color? }` | `{ success, labelId? }` |
| `updateLabel` | `update-label.ts` | `{ labelId, name, color? }` | `{ success }` |
| `deleteLabel` | `delete-label.ts` | `{ labelId }` | `{ success }` |

### 3. Drafts RPC Contracts

**Location**: `packages/comms/domain/src/rpc/v1/drafts/`

| Contract | File | Payload | Success |
|----------|------|---------|---------|
| `createDraft` | `create-draft.ts` | `{ to, cc?, bcc?, subject?, body?, threadId? }` | `{ id, success, error? }` |
| `getDraft` | `get-draft.ts` | `{ id }` | `{ draft: DraftContent }` |
| `listDrafts` | `list-drafts.ts` | `{ q?, maxResults?, pageToken? }` | `{ drafts, nextPageToken }` |
| `deleteDraft` | `delete-draft.ts` | `{ id }` | `{ success }` |

### 4. Mail RPC Contracts

**Location**: `packages/comms/domain/src/rpc/v1/mail/`

Key contracts (26 total):

| Contract | Payload | Success |
|----------|---------|---------|
| `listThreads` | `{ folder, q?, maxResults?, cursor?, labelIds? }` | `{ threads, nextPageToken }` |
| `getThread` | `{ id }` | `{ messages, latest?, hasUnread, totalReplies, labels }` |
| `sendMail` | `{ to, subject, message, attachments?, cc?, bcc?, threadId?, ... }` | `{ success, scheduled?, messageId?, error? }` |
| `modifyLabels` | `{ threadIds, addLabels?, removeLabels? }` | `{ success, error? }` |
| `markAsRead` | `{ threadIds }` | `{ success }` |
| `markAsUnread` | `{ threadIds }` | `{ success }` |
| `toggleStar` | `{ threadId }` | `{ success, starred }` |
| `bulkDelete` | `{ threadIds }` | `{ success, error? }` |
| `bulkArchive` | `{ threadIds }` | `{ success, error? }` |
| ... | ... | ... |

### 5. RPC Group Definitions

**File**: `packages/comms/domain/src/rpc/v1/connections/_rpcs.ts`

```typescript
export class Rpcs extends RpcGroup.make(
  ListConnections.Contract,
  SetDefaultConnection.Contract,
  DeleteConnection.Contract,
  GetDefaultConnection.Contract
).prefix("connections_") {}
```

Similar for `labels/_rpcs.ts`, `drafts/_rpcs.ts`, `mail/_rpcs.ts`.

### 6. RPC Handlers

**Location**: `packages/comms/server/src/rpc/v1/`

Each handler follows pattern:
```
{router}/{procedure}.handler.ts
```

### 7. Middleware

**File**: `packages/comms/server/src/middleware/ActiveConnectionMiddleware.ts`

Resolves `ActiveConnection` from user's default or request-specified connection.

### 8. Layer Composition

**File**: `packages/comms/server/src/rpc/v1/CommsRpcsLive.ts`

Combines all RPC groups with middleware.

---

## Implementation Order

1. **Connections RPC** (Tasks 2.1) - Foundation, no MailDriver needed
2. **Labels RPC** (Task 2.2) - Uses MailDriver.getUserLabels
3. **Drafts RPC** (Task 2.3) - Uses MailDriver draft operations
4. **Mail RPC** (Task 2.4) - Largest, uses most MailDriver operations
5. **Middleware** (Task 2.7) - ActiveConnectionMiddleware
6. **Layer Composition** (Task 2.6) - Combine all groups

---

## Critical Patterns

### RPC Contract Definition

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/connections/list-connections");

export class ConnectionInfo extends S.Class<ConnectionInfo>($I`ConnectionInfo`)({
  id: CommsEntityIds.ConnectionId,
  email: S.String,
  name: S.NullOr(S.String),
  picture: S.NullOr(S.String),
  createdAt: S.Date,
  providerId: EmailProvider,
}) {}

export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

export class Success extends S.Class<Success>($I`Success`)({
  connections: S.Array(ConnectionInfo),
  disconnectedIds: S.Array(CommsEntityIds.ConnectionId),
}) {}

export const Contract = Rpc.make("listConnections", {
  payload: Payload,
  success: Success,
});
```

### RPC Group Composition

```typescript
import * as RpcGroup from "@effect/rpc/RpcGroup";

export class Rpcs extends RpcGroup.make(
  ListConnections.Contract,
  SetDefaultConnection.Contract,
  DeleteConnection.Contract,
  GetDefaultConnection.Contract
).prefix("connections_") {}

export { ListConnections, SetDefaultConnection, DeleteConnection, GetDefaultConnection };
```

### Handler Implementation

```typescript
import * as Effect from "effect/Effect";
import { Policy } from "@beep/shared-domain";
import { MailDriver } from "../../../services/mail";
import { ListThreads } from "@beep/comms-domain/rpc/v1/mail";

type HandlerEffect = (
  payload: ListThreads.Payload
) => Effect.Effect<
  ListThreads.Success,
  never,
  Policy.AuthContext | MailDriver
>;

export const Handler: HandlerEffect = Effect.fn("mail_listThreads")(
  function* (payload) {
    const driver = yield* MailDriver;

    const response = yield* driver.listThreads({
      folder: payload.folder,
      query: payload.q,
      maxResults: payload.maxResults,
      pageToken: payload.cursor,
    });

    return new ListThreads.Success({
      threads: response.threads.map((t) => new ListThreads.ThreadSummary({
        id: t.id,
        historyId: t.historyId ?? null,
      })),
      nextPageToken: response.nextPageToken ?? null,
    });
  },
  Effect.catchTags({
    ProviderApiError: () => Effect.succeed(new ListThreads.Success({
      threads: [],
      nextPageToken: null,
    })),
  })
);
```

### Middleware Pattern

```typescript
export const ActiveConnectionRpcMiddleware = <Req, Res, E, R>(
  handler: (req: Req) => Effect.Effect<Res, E, R | ActiveConnection>
) => (req: Req) => Effect.gen(function* () {
  const { session } = yield* Policy.AuthContext;
  const connectionRepo = yield* ConnectionRepo;

  const connectionId = (req as any).connectionId ?? session.defaultConnectionId;
  const connection = yield* connectionRepo.findById(connectionId);

  return yield* handler(req).pipe(
    Effect.provideService(ActiveConnectionTag, {
      connectionId: connection.id,
      provider: connection.providerId,
      email: connection.email,
    })
  );
});
```

### Layer Composition

```typescript
export const ConnectionsRpcsLive = Connections.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .toLayer({
    listConnections: ListConnectionsHandler.Handler,
    setDefaultConnection: SetDefaultConnectionHandler.Handler,
    deleteConnection: DeleteConnectionHandler.Handler,
    getDefaultConnection: GetDefaultConnectionHandler.Handler,
  });

export const MailRpcsLive = Mail.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .middleware(ActiveConnectionRpcMiddleware)
  .toLayer({
    listThreads: ListThreadsHandler.Handler,
    // ... all 26 handlers
  });

export const CommsRpcsLive = Layer.mergeAll(
  ConnectionsRpcsLive,
  LabelsRpcsLive,
  DraftsRpcsLive,
  MailRpcsLive,
);
```

---

## Verification Steps

```bash
# Check domain contracts
bun run check --filter @beep/comms-domain

# Check server handlers
bun run check --filter @beep/comms-server

# Run RPC tests
bun run test --filter @beep/comms-server -- --grep "RPC"

# Lint
bun run lint --filter @beep/comms-*
```

---

## Known Issues & Gotchas

1. **Option to Nullable**: MailDriver returns `Option`, but RPC contracts use `S.NullOr` - convert with `O.getOrNull`
2. **Error Recovery**: Handlers should catch `ProviderApiError` and return empty/error responses, not fail
3. **Middleware Order**: Auth middleware BEFORE ActiveConnection middleware
4. **Prefix Convention**: RPC groups use prefix like `"connections_"` for namespace isolation
5. **Sender vs String**: Use existing `Sender` value object from `mail.value.ts` for `to`/`cc`/`bcc`
6. **File Attachments**: Use `BS.FileFromSelf` for attachment payloads (handled by platform)

---

## Test Strategy

### Unit Tests for Handlers

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Handler } from "./list-threads.handler";
import { ListThreads } from "@beep/comms-domain/rpc/v1/mail";

const MockMailDriver = Layer.succeed(MailDriver, {
  provider: "google",
  listThreads: () => Effect.succeed({
    threads: [{ id: "thread-1", historyId: O.some("123") }],
    nextPageToken: O.none(),
  }),
  // ... mock other methods
});

effect("listThreads returns threads from driver", () =>
  Effect.gen(function* () {
    const result = yield* Handler(new ListThreads.Payload({
      folder: "inbox",
    }));

    strictEqual(result.threads.length, 1);
    strictEqual(result.threads[0].id, "thread-1");
  }).pipe(
    Effect.provide(MockMailDriver),
    Effect.provide(MockAuthContext),
  )
);
```

---

## Success Criteria

Phase 2 is complete when:
- [ ] 4 Connections contracts + handlers implemented
- [ ] 5 Labels contracts + handlers implemented
- [ ] 4 Drafts contracts + handlers implemented
- [ ] 26 Mail contracts + handlers implemented
- [ ] `ActiveConnectionMiddleware` created
- [ ] All RPC groups composed into `CommsRpcsLive`
- [ ] `bun run check --filter @beep/comms-domain` passes
- [ ] `bun run check --filter @beep/comms-server` passes
- [ ] Handler unit tests written
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `HANDOFF_P3.md` created for Phase 3

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `test-writer` | Create handler unit tests with mocked MailDriver |
| `code-observability-writer` | Add tracing spans to RPC handlers |
| `doc-writer` | Create AGENTS.md for comms-server package |
| `codebase-researcher` | Reference existing IAM RPC patterns |

---

## Next Phase

After Phase 2 completes, proceed to Phase 3 (User Features RPC) using `P3_ORCHESTRATOR_PROMPT.md`.
