# Phase 1 Handoff: Email Provider Drivers

**Date**: 2025-01-29
**From**: Phase 0 (Foundation)
**To**: Phase 1 (Email Drivers)
**Status**: Ready for implementation

---

## Context for Phase 1

### Working Context (Critical - Read First)

**Current Task**: Extend existing Gmail integration and create unified MailDriver abstraction for multi-provider support.

**Success Criteria**:
- 10 new Gmail operations added to existing WrapperGroup
- `MailDriver` interface defined for provider-agnostic email operations
- `GmailDriverAdapter` wraps existing Gmail actions into MailDriver
- `OutlookDriver` implements MailDriver using Microsoft Graph API
- All operations have proper error handling with `ProviderApiError`

**Blocking Issues**: None if P0 completed

**Immediate Dependencies**:
- P0 completed: EntityIds, domain models, tables exist
- Existing: `packages/shared/integrations/src/google/gmail/` (12 operations)
- Package: `@beep/wrap` - WrapperGroup pattern

### Episodic Context (P0 Summary)

**What P0 Accomplished**:
- Created 5 EntityIds in `CommsEntityIds`
- Created 5 domain models with `M.Class` pattern
- Created 9 error types extending `S.TaggedError`
- Created `@beep/comms-tables` package

**Key Decisions**:
- OAuth tokens marked as sensitive fields (not logged)
- `EmailProvider` literal: `"google" | "microsoft"`
- Connection stores both `accessToken` and `refreshToken`

**Patterns Discovered**:
- Use `wrapGmailCall` for consistent Gmail API error handling
- WrapperGroup composition for action bundling

### Semantic Context (Tech Stack)

- **Gmail SDK**: `googleapis` (already configured)
- **Outlook SDK**: `@effect/platform/HttpClient` with Microsoft Graph API
- **Wrapper Pattern**: `@beep/wrap` WrapperGroup for action bundling
- **Context Tags**: `GmailClient`, `OutlookClient` for dependency injection

### Procedural Context (Reference Links)

- Existing Gmail: `packages/shared/integrations/src/google/gmail/`
- Effect HTTP patterns: Use `mcp-researcher` to query Effect docs
- Graph API: `https://graph.microsoft.com/v1.0`

---

## Source Verification (MANDATORY)

### Gmail API Endpoints

All Gmail operations verified against `googleapis` types:

| Operation | Gmail Method | Response Type | Verified |
|-----------|--------------|---------------|----------|
| `CreateDraft` | `users.drafts.create` | `GaxiosResponse<gmail_v1.Schema$Draft>` | Y |
| `GetDraft` | `users.drafts.get` | `GaxiosResponse<gmail_v1.Schema$Draft>` | Y |
| `ListDrafts` | `users.drafts.list` | `GaxiosResponse<gmail_v1.Schema$ListDraftsResponse>` | Y |
| `SendDraft` | `users.drafts.send` | `GaxiosResponse<gmail_v1.Schema$Message>` | Y |
| `DeleteDraft` | `users.drafts.delete` | `GaxiosResponse<void>` | Y |
| `GetThread` | `users.threads.get` | `GaxiosResponse<gmail_v1.Schema$Thread>` | Y |
| `ListThreads` | `users.threads.list` | `GaxiosResponse<gmail_v1.Schema$ListThreadsResponse>` | Y |
| `MarkAsRead` | `users.messages.batchModify` | `GaxiosResponse<void>` | Y |
| `MarkAsUnread` | `users.messages.batchModify` | `GaxiosResponse<void>` | Y |
| `GetAttachment` | `users.messages.attachments.get` | `GaxiosResponse<gmail_v1.Schema$MessagePartBody>` | Y |

### Microsoft Graph API Endpoints

| Operation | Graph Endpoint | Method | Response |
|-----------|----------------|--------|----------|
| List Messages | `/me/messages` | GET | `{ value: Message[], @odata.nextLink? }` |
| Get Message | `/me/messages/{id}` | GET | `Message` |
| Send Mail | `/me/sendMail` | POST | `202 Accepted` |
| Create Draft | `/me/messages` | POST | `Message` |
| Send Draft | `/me/messages/{id}/send` | POST | `202 Accepted` |
| Delete Draft | `/me/messages/{id}` | DELETE | `204 No Content` |
| List Drafts | `/me/mailFolders/drafts/messages` | GET | `{ value: Message[] }` |
| Get Categories | `/me/outlook/masterCategories` | GET | `{ value: Category[] }` |
| Mark Read | `/me/messages/{id}` | PATCH | `{ isRead: true }` |

---

## Deliverables

### 1. Gmail Extensions (10 New Operations)

**Location**: `packages/shared/integrations/src/google/gmail/actions/`

| Operation | Files | Purpose |
|-----------|-------|---------|
| `CreateDraft` | `create-draft/` | Create email draft |
| `GetDraft` | `get-draft/` | Retrieve draft by ID |
| `ListDrafts` | `list-drafts/` | List all drafts with pagination |
| `SendDraft` | `send-draft/` | Send existing draft |
| `DeleteDraft` | `delete-draft/` | Delete draft |
| `GetThread` | `get-thread/` | Get thread with all messages |
| `ListThreads` | `list-threads/` | List threads with pagination |
| `MarkAsRead` | `mark-as-read/` | Remove UNREAD label from messages |
| `MarkAsUnread` | `mark-as-unread/` | Add UNREAD label to messages |
| `GetAttachment` | `get-attachment/` | Download attachment body |

### 2. Update Gmail WrapperGroup

**File**: `packages/shared/integrations/src/google/gmail/actions/layer.ts`

Add all 10 new operations to:
- `Group = Wrap.WrapperGroup.make(...)` - Wrapper definitions
- `layer = Group.toLayer({...})` - Handler implementations

### 3. MailDriver Interface

**File**: `packages/comms/server/src/services/mail/MailDriver.ts`

Provider-agnostic interface with methods:
- Thread operations: `listThreads`, `getThread`
- Message operations: `sendMail`, `getAttachment`
- Draft operations: `createDraft`, `getDraft`, `listDrafts`, `deleteDraft`, `sendDraft`
- Label operations: `getUserLabels`, `createLabel`, `deleteLabel`, `modifyLabels`
- Read/unread: `markAsRead`, `markAsUnread`

### 4. GmailDriverAdapter

**File**: `packages/comms/server/src/services/mail/drivers/GmailDriverAdapter.ts`

Wraps Gmail WrapperGroup into MailDriver interface:
- Translates between Option types and nullable
- Maps Gmail errors to `ProviderApiError`
- Composes with `GmailActions.layer`

### 5. OutlookDriver

**File**: `packages/comms/server/src/services/mail/drivers/OutlookDriver.ts`

Native Microsoft Graph API implementation:
- Uses `@effect/platform/HttpClient`
- Bearer token via `OutlookClient` context
- Converts Graph response schemas to MailDriver types

### 6. MailDriverFactory

**File**: `packages/comms/server/src/services/mail/MailDriverFactory.ts`

Factory for creating provider-specific layers:
- `makeMailDriverLayer(provider)` - Returns appropriate Layer
- `ActiveConnection` context tag for current connection info

---

## Implementation Order

1. **Gmail Extensions** (Tasks 1.1) - Extend existing package
2. **Update WrapperGroup** (Task 1.2) - Register new operations
3. **MailDriver Interface** (Task 1.3) - Define abstraction
4. **GmailDriverAdapter** (Task 1.4) - Wrap Gmail actions
5. **OutlookDriver** (Task 1.5) - Graph API implementation
6. **MailDriverFactory** (Task 1.6) - Provider factory

---

## Critical Patterns

### Gmail Wrapper Contract

```typescript
import { Wrap } from "@beep/wrap";
import { GmailMethodError } from "../../errors.ts";

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  draftId: S.String,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  id: S.String,
  message: S.Struct({ id: S.String, threadId: S.String }),
}) {}

export const Wrapper = Wrap.Wrapper.make("GetDraft", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

### Gmail Handler Implementation

```typescript
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";

export const Handler = Wrapper.implement(
  Effect.fn(function* (payload) {
    const response = yield* wrapGmailCall({
      operation: (client) =>
        client.users.drafts.get({
          userId: "me",
          id: payload.draftId,
          format: "full",
        }),
      failureMessage: "Failed to get draft",
    });

    return yield* S.decode(Success)({
      id: response.data.id ?? "",
      message: Models.parseMessageToEmail(response.data.message, true),
    });
  })
);
```

### MailDriver Interface Method

```typescript
readonly listThreads: (params: {
  readonly folder?: string;
  readonly query?: string;
  readonly maxResults?: number;
  readonly pageToken?: string;
}) => Effect.Effect<ThreadsResponse, ProviderApiError>;
```

### Graph API Request Helper

```typescript
const graphRequest = <A>(path: string, options?: RequestOptions) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const { accessToken } = yield* OutlookClient;

    const response = yield* httpClient.execute(
      HttpClientRequest.get(`${GRAPH_API_BASE}${path}`).pipe(
        HttpClientRequest.bearerToken(Redacted.value(accessToken))
      )
    );

    if (!HttpClientResponse.isSuccess(response)) {
      return yield* Effect.fail(new ProviderApiError({
        provider: "microsoft",
        statusCode: O.some(response.status),
        message: `Graph API error: ${response.status}`,
      }));
    }

    return (yield* HttpClientResponse.json(response)) as A;
  });
```

---

## Verification Steps

```bash
# Gmail extensions
bun run check --filter @beep/shared-integrations

# MailDriver and adapters
bun run check --filter @beep/comms-server

# Run Gmail tests
bun run test --filter @beep/shared-integrations -- --grep "gmail"

# Run driver tests
bun run test --filter @beep/comms-server -- --grep "MailDriver"

# Lint
bun run lint --filter @beep/shared-integrations
bun run lint --filter @beep/comms-server
```

---

## Known Issues & Gotchas

1. **Gmail BatchModify**: `MarkAsRead`/`MarkAsUnread` use `batchModify` internally - not individual modify calls
2. **Option vs Nullable**: Gmail returns nullable, MailDriver uses `Option` - adapter must convert
3. **Graph Pagination**: Uses `@odata.nextLink` not `nextPageToken` - extract skip count manually
4. **Outlook Categories**: Microsoft uses "categories" not "labels" - map terminology
5. **Thread Simulation**: Outlook uses `conversationId` for threading - group messages by this field
6. **UNREAD Label**: Gmail uses `UNREAD` label; Outlook uses `isRead: boolean` property

---

## Success Criteria

Phase 1 is complete when:
- [ ] 10 Gmail operations added to WrapperGroup
- [ ] WrapperGroup layer exports all 22 operations (12 existing + 10 new)
- [ ] `MailDriver` interface defined with all methods
- [ ] `GmailDriverAdapter` implements MailDriver using Gmail actions
- [ ] `OutlookDriver` implements MailDriver using Graph API
- [ ] `MailDriverFactory` creates provider-specific layers
- [ ] `bun run check --filter @beep/shared-integrations` passes
- [ ] `bun run check --filter @beep/comms-server` passes
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `HANDOFF_P2.md` created for Phase 2

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `mcp-researcher` | Research Effect HTTP client patterns |
| `web-researcher` | Research Microsoft Graph mail API details |
| `codebase-researcher` | Analyze existing Gmail integration patterns |
| `test-writer` | Create unit tests for drivers |
| `code-observability-writer` | Add tracing spans to driver operations |

---

## Next Phase

After Phase 1 completes, proceed to Phase 2 (Core Email RPC) using `P2_ORCHESTRATOR_PROMPT.md`.
