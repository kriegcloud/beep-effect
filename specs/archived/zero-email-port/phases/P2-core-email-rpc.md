# Phase 2: Core Email RPC

> Implement mail, drafts, labels, and connections RPC contracts and handlers.

---

## Prerequisites

- P0 (Foundation) completed
- P1 (Email Drivers) completed
- MailDriver interface available

---

## Overview

This phase implements the core email functionality:

| Router | Procedures | Priority |
|--------|------------|----------|
| `connections` | 4 | P2-1 |
| `labels` | 5 | P2-2 |
| `drafts` | 4 | P2-3 |
| `mail` | 26 | P2-4 |

---

## Tasks

### Task 2.1: Create Connections RPC Contracts

**Directory**: `packages/comms/domain/src/rpc/v1/connections/`

#### list-connections.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import { EmailProvider } from "@beep/comms-domain/value-objects/mail.value";
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

#### set-default-connection.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/connections/set-default");

export class Payload extends S.Class<Payload>($I`Payload`)({
  connectionId: CommsEntityIds.ConnectionId,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

export const Contract = Rpc.make("setDefaultConnection", {
  payload: Payload,
  success: Success,
});
```

#### delete-connection.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/connections/delete");

export class Payload extends S.Class<Payload>($I`Payload`)({
  connectionId: CommsEntityIds.ConnectionId,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

export const Contract = Rpc.make("deleteConnection", {
  payload: Payload,
  success: Success,
});
```

#### get-default-connection.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { ConnectionInfo } from "./list-connections";

const $I = $CommsDomainId.create("rpc/connections/get-default");

export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

export class Success extends S.Class<Success>($I`Success`)({
  connection: S.NullOr(ConnectionInfo),
}) {}

export const Contract = Rpc.make("getDefaultConnection", {
  payload: Payload,
  success: Success,
});
```

#### _rpcs.ts (RPC Group)

```typescript
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as ListConnections from "./list-connections";
import * as SetDefaultConnection from "./set-default-connection";
import * as DeleteConnection from "./delete-connection";
import * as GetDefaultConnection from "./get-default-connection";

export class Rpcs extends RpcGroup.make(
  ListConnections.Contract,
  SetDefaultConnection.Contract,
  DeleteConnection.Contract,
  GetDefaultConnection.Contract
).prefix("connections_") {}

export { ListConnections, SetDefaultConnection, DeleteConnection, GetDefaultConnection };
```

---

### Task 2.2: Create Labels RPC Contracts

**Directory**: `packages/comms/domain/src/rpc/v1/labels/`

#### list-labels.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { Label, LabelColor } from "@beep/comms-domain/value-objects/mail.value";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/labels/list");

export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

export class Success extends S.Class<Success>($I`Success`)({
  labels: S.Array(Label),
}) {}

export const Contract = Rpc.make("listLabels", {
  payload: Payload,
  success: Success,
});
```

#### create-label.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { LabelColor } from "@beep/comms-domain/value-objects/mail.value";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/labels/create");

export class Payload extends S.Class<Payload>($I`Payload`)({
  name: S.NonEmptyTrimmedString,
  color: S.optional(LabelColor),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
  labelId: S.optional(S.String),
}) {}

export const Contract = Rpc.make("createLabel", {
  payload: Payload,
  success: Success,
});
```

#### update-label.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { LabelColor } from "@beep/comms-domain/value-objects/mail.value";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/labels/update");

export class Payload extends S.Class<Payload>($I`Payload`)({
  labelId: S.NonEmptyTrimmedString,
  name: S.NonEmptyTrimmedString,
  color: S.optional(LabelColor),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

export const Contract = Rpc.make("updateLabel", {
  payload: Payload,
  success: Success,
});
```

#### delete-label.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/labels/delete");

export class Payload extends S.Class<Payload>($I`Payload`)({
  labelId: S.NonEmptyTrimmedString,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

export const Contract = Rpc.make("deleteLabel", {
  payload: Payload,
  success: Success,
});
```

---

### Task 2.3: Create Drafts RPC Contracts

**Directory**: `packages/comms/domain/src/rpc/v1/drafts/`

#### create-draft.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { Sender } from "@beep/comms-domain/value-objects/mail.value";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/drafts/create");

export class Payload extends S.Class<Payload>($I`Payload`)({
  to: S.Array(Sender),
  cc: S.optional(S.Array(Sender)),
  bcc: S.optional(S.Array(Sender)),
  subject: S.optional(S.String),
  body: S.optional(S.String),
  threadId: S.optional(S.String),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  id: S.NullOr(S.String),
  success: S.Boolean,
  error: S.optional(S.String),
}) {}

export const Contract = Rpc.make("createDraft", {
  payload: Payload,
  success: Success,
});
```

#### get-draft.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/drafts/get");

export class DraftContent extends S.Class<DraftContent>($I`DraftContent`)({
  id: S.String,
  to: S.optional(S.Array(S.String)),
  cc: S.optional(S.Array(S.String)),
  bcc: S.optional(S.Array(S.String)),
  subject: S.optional(S.String),
  content: S.optional(S.String),
}) {}

export class Payload extends S.Class<Payload>($I`Payload`)({
  id: S.NonEmptyTrimmedString,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  draft: DraftContent,
}) {}

export const Contract = Rpc.make("getDraft", {
  payload: Payload,
  success: Success,
});
```

#### list-drafts.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/drafts/list");

export class DraftSummary extends S.Class<DraftSummary>($I`DraftSummary`)({
  id: S.String,
  historyId: S.NullOr(S.String),
}) {}

export class Payload extends S.Class<Payload>($I`Payload`)({
  q: S.optional(S.String),
  maxResults: S.optional(S.Number),
  pageToken: S.optional(S.String),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  drafts: S.Array(DraftSummary),
  nextPageToken: S.NullOr(S.String),
}) {}

export const Contract = Rpc.make("listDrafts", {
  payload: Payload,
  success: Success,
});
```

#### delete-draft.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/drafts/delete");

export class Payload extends S.Class<Payload>($I`Payload`)({
  id: S.NonEmptyTrimmedString,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}

export const Contract = Rpc.make("deleteDraft", {
  payload: Payload,
  success: Success,
});
```

---

### Task 2.4: Create Mail RPC Contracts

**Directory**: `packages/comms/domain/src/rpc/v1/mail/`

This is the largest router with 26 procedures. Key contracts:

#### list-threads.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/mail/list-threads");

export class ThreadSummary extends S.Class<ThreadSummary>($I`ThreadSummary`)({
  id: S.String,
  historyId: S.NullOr(S.String),
}) {}

export class Payload extends S.Class<Payload>($I`Payload`)({
  folder: S.String.pipe(S.propertySignature, S.withDefault(() => "inbox")),
  q: S.optional(S.String),
  maxResults: S.optional(S.Number),
  cursor: S.optional(S.String),
  labelIds: S.optional(S.Array(S.String)),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  threads: S.Array(ThreadSummary),
  nextPageToken: S.NullOr(S.String),
}) {}

export const Contract = Rpc.make("listThreads", {
  payload: Payload,
  success: Success,
});
```

#### get-thread.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { ParsedMessage } from "@beep/comms-domain/value-objects/mail.value";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/mail/get-thread");

export class Payload extends S.Class<Payload>($I`Payload`)({
  id: S.NonEmptyTrimmedString,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  messages: S.Array(ParsedMessage),
  latest: S.optional(ParsedMessage),
  hasUnread: S.Boolean,
  totalReplies: S.Number,
  labels: S.Array(S.Struct({ id: S.String, name: S.String })),
}) {}

export const Contract = Rpc.make("getThread", {
  payload: Payload,
  success: Success,
});
```

#### send-mail.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { Sender } from "@beep/comms-domain/value-objects/mail.value";
import { BS } from "@beep/schema";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/mail/send");

export class Payload extends S.Class<Payload>($I`Payload`)({
  to: S.Array(Sender),
  subject: S.String,
  message: S.String,
  attachments: S.optional(S.Array(BS.FileFromSelf)),
  headers: S.optional(S.Record({ key: S.String, value: S.String })),
  cc: S.optional(S.Array(Sender)),
  bcc: S.optional(S.Array(Sender)),
  threadId: S.optional(S.String),
  fromEmail: S.optional(BS.Email),
  draftId: S.optional(S.String),
  isForward: S.optional(S.Boolean),
  scheduleAt: S.optional(S.String),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
  scheduled: S.optional(S.Boolean),
  queued: S.optional(S.Boolean),
  messageId: S.optional(S.String),
  sendAt: S.optional(S.Number),
  error: S.optional(S.String),
}) {}

export const Contract = Rpc.make("sendMail", {
  payload: Payload,
  success: Success,
});
```

#### modify-labels.ts

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/mail/modify-labels");

export class Payload extends S.Class<Payload>($I`Payload`)({
  threadIds: S.Array(S.String),
  addLabels: S.optional(S.Array(S.String)),
  removeLabels: S.optional(S.Array(S.String)),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
  error: S.optional(S.String),
}) {}

export const Contract = Rpc.make("modifyLabels", {
  payload: Payload,
  success: Success,
});
```

Additional mail contracts to create:
- `mark-as-read.ts`
- `mark-as-unread.ts`
- `toggle-star.ts`
- `toggle-important.ts`
- `bulk-star.ts`
- `bulk-unstar.ts`
- `bulk-delete.ts`
- `bulk-archive.ts`
- `bulk-mute.ts`
- `delete.ts`
- `delete-all-spam.ts`
- `snooze-threads.ts`
- `unsnooze-threads.ts`
- `unsend.ts`
- `force-sync.ts`
- `suggest-recipients.ts`
- `get-email-aliases.ts`
- `get-attachments.ts`
- `process-email-content.ts`
- `get-raw-email.ts`
- `verify-email.ts`

---

### Task 2.5: Implement RPC Handlers

**Directory**: `packages/comms/server/src/rpc/v1/`

#### connections/list-connections.handler.ts

```typescript
import * as Effect from "effect/Effect";
import { Policy } from "@beep/shared-domain";
import { ConnectionRepo } from "../../../repos/ConnectionRepo";
import { ListConnections } from "@beep/comms-domain/rpc/v1/connections";

type HandlerEffect = (
  payload: ListConnections.Payload
) => Effect.Effect<
  ListConnections.Success,
  never,
  Policy.AuthContext | ConnectionRepo
>;

export const Handler: HandlerEffect = Effect.fn("connections_listConnections")(
  function* (_payload) {
    const { session } = yield* Policy.AuthContext;
    const connectionRepo = yield* ConnectionRepo;

    const connections = yield* connectionRepo.findByUserId(session.userId);

    const disconnectedIds = connections
      .filter((c) => !c.accessToken || !c.refreshToken)
      .map((c) => c.id);

    return new ListConnections.Success({
      connections: connections.map((c) => new ListConnections.ConnectionInfo({
        id: c.id,
        email: c.email,
        name: c.name ?? null,
        picture: c.picture ?? null,
        createdAt: c.createdAt,
        providerId: c.providerId,
      })),
      disconnectedIds,
    });
  },
  Effect.catchTags({
    ParseError: Effect.die,
  })
);
```

#### mail/list-threads.handler.ts

```typescript
import * as Effect from "effect/Effect";
import { Policy } from "@beep/shared-domain";
import { MailDriver, ActiveConnection, withActiveConnection } from "../../../services/mail";
import { ListThreads } from "@beep/comms-domain/rpc/v1/mail";

type HandlerEffect = (
  payload: ListThreads.Payload
) => Effect.Effect<
  ListThreads.Success,
  never,
  Policy.AuthContext | MailDriver | ActiveConnection
>;

export const Handler: HandlerEffect = Effect.fn("mail_listThreads")(
  function* (payload) {
    const driver = yield* MailDriver;

    const response = yield* driver.listThreads({
      folder: payload.folder,
      query: payload.q,
      maxResults: payload.maxResults,
      labelIds: payload.labelIds,
      pageToken: payload.cursor,
    });

    return new ListThreads.Success({
      threads: response.threads.map((t) => new ListThreads.ThreadSummary({
        id: t.id,
        historyId: t.historyId,
      })),
      nextPageToken: response.nextPageToken,
    });
  },
  Effect.catchTags({
    ProviderApiError: (e) => Effect.succeed(new ListThreads.Success({
      threads: [],
      nextPageToken: null,
    })),
  })
);
```

---

### Task 2.6: Create RPC Group Layer Composition

**File**: `packages/comms/server/src/rpc/v1/CommsRpcsLive.ts`

```typescript
import * as Layer from "effect/Layer";
import { Policy } from "@beep/shared-domain";

// Import all RPC groups
import { Connections } from "@beep/comms-domain/rpc/v1/connections";
import { Labels } from "@beep/comms-domain/rpc/v1/labels";
import { Drafts } from "@beep/comms-domain/rpc/v1/drafts";
import { Mail } from "@beep/comms-domain/rpc/v1/mail";

// Import handlers
import * as ListConnectionsHandler from "./connections/list-connections.handler";
import * as SetDefaultConnectionHandler from "./connections/set-default-connection.handler";
// ... other imports

// Compose the full RPC layer
export const ConnectionsRpcsLive = Connections.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .toLayer({
    listConnections: ListConnectionsHandler.Handler,
    setDefaultConnection: SetDefaultConnectionHandler.Handler,
    deleteConnection: DeleteConnectionHandler.Handler,
    getDefaultConnection: GetDefaultConnectionHandler.Handler,
  });

export const LabelsRpcsLive = Labels.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .middleware(ActiveConnectionRpcMiddleware)
  .toLayer({
    listLabels: ListLabelsHandler.Handler,
    createLabel: CreateLabelHandler.Handler,
    updateLabel: UpdateLabelHandler.Handler,
    deleteLabel: DeleteLabelHandler.Handler,
  });

export const DraftsRpcsLive = Drafts.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .middleware(ActiveConnectionRpcMiddleware)
  .toLayer({
    createDraft: CreateDraftHandler.Handler,
    getDraft: GetDraftHandler.Handler,
    listDrafts: ListDraftsHandler.Handler,
    deleteDraft: DeleteDraftHandler.Handler,
  });

export const MailRpcsLive = Mail.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)
  .middleware(ActiveConnectionRpcMiddleware)
  .toLayer({
    listThreads: ListThreadsHandler.Handler,
    getThread: GetThreadHandler.Handler,
    sendMail: SendMailHandler.Handler,
    // ... all 26 handlers
  });

// Combined layer
export const CommsRpcsLive = Layer.mergeAll(
  ConnectionsRpcsLive,
  LabelsRpcsLive,
  DraftsRpcsLive,
  MailRpcsLive,
);
```

---

### Task 2.7: Create ActiveConnection Middleware

**File**: `packages/comms/server/src/middleware/ActiveConnectionMiddleware.ts`

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Policy } from "@beep/shared-domain";
import { ActiveConnection } from "../services/mail/MailDriverFactory";
import { ConnectionRepo } from "../repos/ConnectionRepo";
import { Errors } from "@beep/comms-domain";

// Middleware that resolves the active connection for the user
export const ActiveConnectionRpcMiddleware = <Req, Res, E, R>(
  handler: (req: Req) => Effect.Effect<Res, E, R | ActiveConnection>
) => (req: Req) => Effect.gen(function* () {
  const { session } = yield* Policy.AuthContext;
  const connectionRepo = yield* ConnectionRepo;

  // Get user's default connection
  // This would be passed in the request or resolved from user settings
  const connectionId = (req as any).connectionId ?? session.defaultConnectionId;

  if (!connectionId) {
    return yield* Effect.fail(new Errors.ConnectionNotFoundError({
      connectionId: "none",
    }));
  }

  const connection = yield* connectionRepo.findById(connectionId);

  const activeConnection: ActiveConnection = {
    connectionId: connection.id,
    provider: connection.providerId,
    email: connection.email,
  };

  return yield* handler(req).pipe(
    Effect.provideService(ActiveConnection, activeConnection)
  );
});
```

---

## Verification

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

## Deliverables

| Deliverable | Location |
|-------------|----------|
| Connections RPC contracts | `packages/comms/domain/src/rpc/v1/connections/` |
| Labels RPC contracts | `packages/comms/domain/src/rpc/v1/labels/` |
| Drafts RPC contracts | `packages/comms/domain/src/rpc/v1/drafts/` |
| Mail RPC contracts | `packages/comms/domain/src/rpc/v1/mail/` |
| RPC handlers | `packages/comms/server/src/rpc/v1/` |
| Middleware | `packages/comms/server/src/middleware/` |
| Layer composition | `packages/comms/server/src/rpc/v1/CommsRpcsLive.ts` |

---

## Dependencies

- P0 (Foundation) - EntityIds, domain models
- P1 (Email Drivers) - MailDriver interface

## Blocks

- P5 (UI Components) - needs RPC contracts

---

## Test Strategy

### Unit Tests

For each handler, test:
1. Successful execution with mocked driver
2. Error handling for provider errors
3. Authorization checks

Example:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Handler } from "./list-threads.handler";
import { ListThreads } from "@beep/comms-domain/rpc/v1/mail";

const MockMailDriver = Layer.succeed(MailDriver, {
  listThreads: () => Effect.succeed({
    threads: [{ id: "thread-1", historyId: "123" }],
    nextPageToken: null,
  }),
  // ... other methods
});

effect("listThreads returns threads", () =>
  Effect.gen(function* () {
    const result = yield* Handler(new ListThreads.Payload({
      folder: "inbox",
    }));

    strictEqual(result.threads.length, 1);
    strictEqual(result.threads[0].id, "thread-1");
  }).pipe(
    Effect.provide(MockMailDriver),
    Effect.provide(MockAuthContext),
    Effect.provide(MockActiveConnection),
  )
);
```

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `test-writer` | Create handler unit tests |
| `code-observability-writer` | Add tracing spans to handlers |
| `doc-writer` | Create AGENTS.md for server package |
