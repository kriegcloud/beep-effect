# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 execution.

---

## Pre-Flight Checklist

Before executing this phase, verify P0 and P1 are complete:
- [ ] EntityIds exist: `ConnectionId`, `ThreadSummaryId`, `NoteId`, etc.
- [ ] Domain models exist: `Connection.Model`, `Note.Model`, etc.
- [ ] Error types exist: `ProviderApiError`, `ConnectionNotFoundError`, etc.
- [ ] `MailDriver` interface defined in `packages/comms/server/src/services/mail/`
- [ ] `GmailDriverAdapter` and `OutlookDriver` implemented
- [ ] Gmail WrapperGroup has 22 operations

If any items are missing, complete the prerequisite phase first.

---

## Prompt

You are implementing Phase 2 (Core Email RPC) of the Zero Email Port spec.

### Context

P0 established types, P1 created the MailDriver abstraction. This phase implements **39 RPC contracts and handlers** across 4 routers:
- `connections` (4 procedures)
- `labels` (5 procedures)
- `drafts` (4 procedures)
- `mail` (26 procedures)

**Critical Insight**: Reference existing RPC patterns in `packages/iam/server/src/rpc/` for handler structure.

### Your Mission

1. Create RPC contracts in `@beep/comms-domain/rpc/v1/`
2. Implement handlers in `@beep/comms-server/rpc/v1/`
3. Create `ActiveConnectionMiddleware` for connection resolution
4. Compose all groups into `CommsRpcsLive` Layer

### Critical Patterns

**RPC Contract**:
```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("rpc/mail/list-threads");

export class Payload extends S.Class<Payload>($I`Payload`)({
  folder: S.String.pipe(S.propertySignature, S.withDefault(() => "inbox")),
  q: S.optional(S.String),
  maxResults: S.optional(S.Number),
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

**RPC Group**:
```typescript
import * as RpcGroup from "@effect/rpc/RpcGroup";

export class Rpcs extends RpcGroup.make(
  ListThreads.Contract,
  GetThread.Contract,
  SendMail.Contract,
  // ... all contracts
).prefix("mail_") {}
```

**Handler Pattern**:
```typescript
export const Handler = Effect.fn("mail_listThreads")(
  function* (payload) {
    const driver = yield* MailDriver;

    const response = yield* driver.listThreads({
      folder: payload.folder,
      query: payload.q,
      maxResults: payload.maxResults,
    });

    return new ListThreads.Success({
      threads: A.map(response.threads, (t) => ({
        id: t.id,
        historyId: O.getOrNull(t.historyId),
      })),
      nextPageToken: O.getOrNull(response.nextPageToken),
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

**Middleware Stacking**:
```typescript
export const MailRpcsLive = Mail.Rpcs
  .middleware(Policy.AuthContextRpcMiddleware)  // Auth first
  .middleware(ActiveConnectionRpcMiddleware)    // Then connection
  .toLayer({ listThreads: Handler, /* ... */ });
```

### Reference Files

- RPC contracts: `packages/shared/domain/src/rpc/`
- Handler patterns: `packages/iam/server/src/rpc/`
- Policy middleware: `packages/shared/domain/src/policies/`
- Value objects: `packages/comms/domain/src/value-objects/mail.value.ts`

### Implementation Order

1. Connections RPC (no MailDriver, just database)
2. Labels RPC (MailDriver.getUserLabels, createLabel, etc.)
3. Drafts RPC (MailDriver draft operations)
4. Mail RPC (largest - all thread/message operations)
5. ActiveConnectionMiddleware
6. CommsRpcsLive composition

### Procedure Checklist

**Connections (4)**:
- [ ] `listConnections` - List user's OAuth connections
- [ ] `setDefaultConnection` - Set default connection
- [ ] `deleteConnection` - Revoke and delete connection
- [ ] `getDefaultConnection` - Get user's default

**Labels (5)**:
- [ ] `listLabels` - Get user + system labels
- [ ] `createLabel` - Create with optional color
- [ ] `updateLabel` - Update name/color
- [ ] `deleteLabel` - Delete user label
- [ ] `getLabel` - Get single label details

**Drafts (4)**:
- [ ] `createDraft` - Create new draft
- [ ] `getDraft` - Get draft by ID
- [ ] `listDrafts` - List with pagination
- [ ] `deleteDraft` - Delete draft

**Mail (26)** - Key procedures:
- [ ] `listThreads` - Paginated thread list
- [ ] `getThread` - Thread with all messages
- [ ] `sendMail` - Send email (with attachments)
- [ ] `modifyLabels` - Add/remove labels
- [ ] `markAsRead` / `markAsUnread`
- [ ] `toggleStar` / `toggleImportant`
- [ ] `bulkStar` / `bulkUnstar`
- [ ] `bulkDelete` / `bulkArchive` / `bulkMute`
- [ ] `delete` / `deleteAllSpam`
- [ ] `snoozeThreads` / `unsnoozeThreads`
- [ ] `unsend` (cancel scheduled)
- [ ] `forceSync`
- [ ] `suggestRecipients`
- [ ] `getEmailAliases`
- [ ] `getAttachments`
- [ ] `processEmailContent`
- [ ] `getRawEmail`
- [ ] `verifyEmail`

### Verification

After each router complete:

```bash
# Domain contracts
bun run check --filter @beep/comms-domain

# Server handlers
bun run check --filter @beep/comms-server

# Tests
bun run test --filter @beep/comms-server -- --grep "RPC"
```

### Success Criteria

- [ ] All 39 RPC contracts defined in `@beep/comms-domain/rpc/v1/`
- [ ] All 39 handlers implemented in `@beep/comms-server/rpc/v1/`
- [ ] `ActiveConnectionMiddleware` resolves connection from request or user default
- [ ] `CommsRpcsLive` composes all groups with proper middleware order
- [ ] All type checks pass
- [ ] Handler tests for critical paths
- [ ] REFLECTION_LOG.md updated

### Handoff Document

Full context: `specs/zero-email-port/handoffs/HANDOFF_P2.md`

### Next Steps

After completing Phase 2:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P3.md` (context for user features RPC)
3. Create `P3_ORCHESTRATOR_PROMPT.md` to start Phase 3
