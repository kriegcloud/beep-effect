# Master Orchestration: Zero Email Port to Effect RPC

> Complete 6-phase workflow for porting Zero email client capabilities to Effect RPC architecture with @effect/ai integration.

---

## Orchestrator Identity Contract

**CRITICAL**: Read this before executing ANY phase.

You are an **ORCHESTRATOR**. You are NOT:
- A code writer
- A code reviewer
- A researcher

Your ONLY responsibilities:
1. Deploy sub-agents with optimized prompts
2. Monitor sub-agent progress via checklist documents
3. Synthesize reports into master checklists
4. Create handoff documents when phases complete or context reaches 50%
5. Run verification commands

**If you find yourself reading source files, writing code, or analyzing patterns - STOP. Delegate to a sub-agent.**

---

## Executive Summary

### Project Scope

Port the Zero email client (located in `tmp/Zero/`) to the beep-effect architecture using:
- Effect RPC for all server endpoints
- @effect/ai for AI-powered email features
- VM pattern for React components
- Vertical slice architecture (`packages/comms/*`)

### Source Analysis

The Zero email client in `tmp/Zero/apps/mail/` contains:
- **Email drivers**: Gmail integration (Outlook to be added)
- **Core features**: Mail, drafts, labels, connections
- **User features**: Templates, notes, shortcuts, settings
- **AI features**: Summaries, composition, categorization
- **UI components**: Full React component library

### Target Architecture

```
packages/comms/
  domain/     # @beep/comms-domain - EntityIds, models, errors
  tables/     # @beep/comms-tables - Drizzle schemas
  server/     # @beep/comms-server - Effect RPC endpoints, drivers
  client/     # @beep/comms-client - Contracts, handlers
  ui/         # @beep/comms-ui - React components with VM pattern
```

---

## Phase Dependency Graph

```
P0: Foundation ──────┐
                     │
P1: Email Drivers ───┤
                     │
P2: Core Email RPC ──┼─────────────────────┐
                     │                     │
P3: User Features ───┘                     │
                                           ▼
P4: AI Features RPC ◄──────────── (depends on P2)
                                           │
P5: UI Components ◄────────────────────────┘
```

### Parallel Work Opportunities

| Phase | Can Run In Parallel With |
|-------|--------------------------|
| P0 | None (foundation) |
| P1 | P0 (if EntityIds exist) |
| P2 | P1 (driver interfaces first) |
| P3 | P2 (independent user features) |
| P4 | Requires P2 completion |
| P5 | Requires P2, P4 completion |

---

## Phase 0: Foundation

**Duration**: 2-3 sessions
**Complexity**: Medium (Score: 35)
**Status**: Pending
**Agents**: `codebase-researcher`, `mcp-researcher`, `effect-code-writer`

### Objectives

1. Define `CommsEntityIds` for all email entities
2. Create domain models for email, thread, label, attachment, draft
3. Create Drizzle table schemas
4. Define typed error classes

### Current State

The `packages/comms/` slice exists but is minimally bootstrapped. This phase extends it with email-specific domain models.

### Tasks

#### Task 0.1: Zero Source Analysis (codebase-researcher)

```
Research the Zero email client source code:

1. Map all entity types in tmp/Zero/apps/mail/:
   - Mail/Thread entities
   - Label entities
   - Connection/Account entities
   - Draft entities
   - Attachment entities
   - Template entities
   - Note entities

2. Document field types and relationships:
   - Required vs optional fields
   - Foreign key relationships
   - Nullable patterns

3. Identify existing schemas:
   - tmp/Zero/apps/mail/lib/schemas.ts
   - tmp/Zero/apps/mail/types/index.ts

Output: outputs/P0-zero-entity-analysis.md
```

#### Task 0.2: EntityId Definitions (effect-code-writer)

```typescript
// packages/comms/domain/src/CommsEntityIds.ts
import { EntityId } from "@beep/schema";

export const ThreadId = EntityId.make("comms_thread__");
export const MessageId = EntityId.make("comms_message__");
export const LabelId = EntityId.make("comms_label__");
export const DraftId = EntityId.make("comms_draft__");
export const AttachmentId = EntityId.make("comms_attachment__");
export const ConnectionId = EntityId.make("comms_connection__");
export const TemplateId = EntityId.make("comms_template__");
export const NoteId = EntityId.make("comms_note__");
export const ShortcutId = EntityId.make("comms_shortcut__");
```

#### Task 0.3: Domain Models (effect-code-writer)

Create domain models following the knowledge slice pattern:

- `entities/Thread/Thread.model.ts`
- `entities/Message/Message.model.ts`
- `entities/Label/Label.model.ts`
- `entities/Draft/Draft.model.ts`
- `entities/Attachment/Attachment.model.ts`
- `entities/Connection/Connection.model.ts`
- `entities/Template/Template.model.ts`
- `entities/Note/Note.model.ts`

#### Task 0.4: Error Types (effect-code-writer)

```typescript
// packages/comms/domain/src/errors/index.ts
import * as S from "effect/Schema";

export class MailProviderError extends S.TaggedError<MailProviderError>()(
  "MailProviderError",
  {
    message: S.String,
    provider: S.Literal("gmail", "outlook"),
    cause: S.optional(S.Unknown),
  }
) {}

export class ThreadNotFoundError extends S.TaggedError<ThreadNotFoundError>()(
  "ThreadNotFoundError",
  {
    threadId: S.String,
  }
) {}

export class ConnectionNotFoundError extends S.TaggedError<ConnectionNotFoundError>()(
  "ConnectionNotFoundError",
  {
    connectionId: S.String,
  }
) {}

export class AttachmentUploadError extends S.TaggedError<AttachmentUploadError>()(
  "AttachmentUploadError",
  {
    message: S.String,
    filename: S.String,
  }
) {}

export class RateLimitError extends S.TaggedError<RateLimitError>()(
  "RateLimitError",
  {
    provider: S.Literal("gmail", "outlook"),
    retryAfter: S.Number,
  }
) {}
```

#### Task 0.5: Table Schemas (effect-code-writer)

Create Drizzle table schemas:

- `tables/thread.table.ts`
- `tables/message.table.ts`
- `tables/label.table.ts`
- `tables/draft.table.ts`
- `tables/attachment.table.ts`
- `tables/connection.table.ts`
- `tables/template.table.ts`
- `tables/note.table.ts`

### Checkpoint

Before proceeding to P1:

- [ ] All EntityIds defined and exported
- [ ] Domain models compile without errors
- [ ] Table schemas migrate successfully
- [ ] Error types defined for all failure modes
- [ ] `bun run check --filter @beep/comms-domain` passes
- [ ] `bun run check --filter @beep/comms-tables` passes
- [ ] REFLECTION_LOG.md updated
- [ ] `handoffs/HANDOFF_P1.md` created
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created

### Rollback Procedure

If P0 fails:
1. `git checkout packages/comms/domain/`
2. `git checkout packages/comms/tables/`
3. Document failure in REFLECTION_LOG.md

---

## Phase 1: Email Drivers

**Duration**: 3-4 sessions
**Complexity**: High (Score: 48)
**Status**: Pending
**Agents**: `codebase-researcher`, `mcp-researcher`, `effect-code-writer`, `test-writer`

### Objectives

1. Create provider-agnostic email driver interface
2. Implement Gmail driver using existing Zero code
3. Implement Outlook driver (new)
4. Handle OAuth flows for both providers

### Dependencies

- P0 completed (EntityIds, domain models, error types)

### Tasks

#### Task 1.1: Driver Interface Design (mcp-researcher + effect-code-writer)

```typescript
// packages/comms/server/src/drivers/EmailDriver.ts
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

export interface EmailDriverConfig {
  readonly provider: "gmail" | "outlook";
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface EmailDriver {
  // Thread operations
  readonly listThreads: (query: ListThreadsQuery) =>
    Effect.Effect<PaginatedResult<Thread>, MailProviderError>;

  readonly getThread: (threadId: string) =>
    Effect.Effect<Thread, ThreadNotFoundError | MailProviderError>;

  // Message operations
  readonly getMessage: (messageId: string) =>
    Effect.Effect<Message, MessageNotFoundError | MailProviderError>;

  readonly sendMessage: (message: SendMessagePayload) =>
    Effect.Effect<Message, MailProviderError>;

  // Draft operations
  readonly createDraft: (draft: CreateDraftPayload) =>
    Effect.Effect<Draft, MailProviderError>;

  readonly updateDraft: (draftId: string, draft: UpdateDraftPayload) =>
    Effect.Effect<Draft, DraftNotFoundError | MailProviderError>;

  readonly deleteDraft: (draftId: string) =>
    Effect.Effect<void, DraftNotFoundError | MailProviderError>;

  // Label operations
  readonly listLabels: () =>
    Effect.Effect<ReadonlyArray<Label>, MailProviderError>;

  readonly applyLabels: (threadId: string, labelIds: ReadonlyArray<string>) =>
    Effect.Effect<void, ThreadNotFoundError | MailProviderError>;

  readonly removeLabels: (threadId: string, labelIds: ReadonlyArray<string>) =>
    Effect.Effect<void, ThreadNotFoundError | MailProviderError>;

  // Attachment operations
  readonly getAttachment: (messageId: string, attachmentId: string) =>
    Effect.Effect<AttachmentContent, MailProviderError>;

  // Sync operations
  readonly syncChanges: (sinceHistoryId: string) =>
    Stream.Stream<SyncEvent, MailProviderError>;
}

export class EmailDriver extends Context.Tag("@beep/comms-server/EmailDriver")<
  EmailDriver,
  EmailDriver
>() {}
```

#### Task 1.2: Gmail Driver Implementation (effect-code-writer)

```
Port Gmail driver from Zero:

Source files:
- tmp/Zero/apps/mail/hooks/driver/*.ts
- tmp/Zero/apps/mail/lib/thread-actions.ts

Target:
- packages/comms/server/src/drivers/gmail/GmailDriver.ts
- packages/comms/server/src/drivers/gmail/GmailAuth.ts
- packages/comms/server/src/drivers/gmail/GmailSync.ts

Patterns:
- Use Effect.tryPromise for Google API calls
- Use Stream for sync operations
- Implement retry with exponential backoff for rate limits
```

#### Task 1.3: Outlook Driver Implementation (effect-code-writer)

```
Implement new Outlook driver using Microsoft Graph API:

Target:
- packages/comms/server/src/drivers/outlook/OutlookDriver.ts
- packages/comms/server/src/drivers/outlook/OutlookAuth.ts
- packages/comms/server/src/drivers/outlook/OutlookSync.ts

Reference:
- Microsoft Graph Mail API documentation
- Similar patterns to Gmail driver
```

#### Task 1.4: OAuth Service (effect-code-writer)

```typescript
// packages/comms/server/src/services/OAuthService.ts
export class OAuthService extends Effect.Service<OAuthService>()(
  "@beep/comms-server/OAuthService",
  {
    dependencies: [HttpClient.Default, SecretStore.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const http = yield* HttpClient.HttpClient;
      const secrets = yield* SecretStore.SecretStore;

      return {
        // Exchange authorization code for tokens
        exchangeCode: (provider: Provider, code: string) =>
          Effect.gen(function* () { /* ... */ }),

        // Refresh access token
        refreshToken: (provider: Provider, refreshToken: string) =>
          Effect.gen(function* () { /* ... */ }),

        // Build authorization URL
        getAuthUrl: (provider: Provider, state: string) =>
          Effect.gen(function* () { /* ... */ }),
      };
    }),
  }
) {}
```

#### Task 1.5: Driver Tests (test-writer)

```
Create tests for email drivers:

- test/drivers/gmail/GmailDriver.test.ts
- test/drivers/outlook/OutlookDriver.test.ts
- test/services/OAuthService.test.ts

Use @beep/testkit patterns:
- effect() for unit tests
- layer() for integration tests with mocked HTTP
```

### Checkpoint

Before proceeding to P2:

- [ ] EmailDriver interface defined
- [ ] GmailDriver implements all methods
- [ ] OutlookDriver implements all methods
- [ ] OAuth flows work for both providers
- [ ] Rate limiting handled with retry
- [ ] Driver tests pass
- [ ] `bun run check --filter @beep/comms-server` passes
- [ ] REFLECTION_LOG.md updated
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

### Rollback Procedure

If P1 fails:
1. `git checkout packages/comms/server/src/drivers/`
2. Preserve any working driver code
3. Document specific failures in REFLECTION_LOG.md

### Critical Path

P1 is on the **critical path** - P2, P4, and P5 all depend on driver functionality.

---

## Phase 2: Core Email RPC

**Duration**: 4-5 sessions
**Complexity**: High (Score: 52)
**Status**: Pending
**Agents**: `codebase-researcher`, `effect-code-writer`, `test-writer`

### Objectives

1. Create Effect RPC endpoints for mail operations
2. Create Effect RPC endpoints for draft operations
3. Create Effect RPC endpoints for label operations
4. Create Effect RPC endpoints for connection management
5. Create client contracts and handlers

### Dependencies

- P0 completed (EntityIds, domain models)
- P1 completed (email drivers)

### Tasks

#### Task 2.1: Mail RPC Endpoints (effect-code-writer)

```typescript
// packages/comms/server/src/rpc/mail/MailRpc.ts
import { Rpc, RpcGroup } from "@effect/rpc";
import * as S from "effect/Schema";

// Request schemas
export class ListThreadsRequest extends S.Class<ListThreadsRequest>()(
  "ListThreadsRequest",
  {
    connectionId: CommsEntityIds.ConnectionId,
    labelId: S.optional(CommsEntityIds.LabelId),
    query: S.optional(S.String),
    pageToken: S.optional(S.String),
    pageSize: S.optional(S.Number),
  }
) {}

export class GetThreadRequest extends S.Class<GetThreadRequest>()(
  "GetThreadRequest",
  {
    connectionId: CommsEntityIds.ConnectionId,
    threadId: CommsEntityIds.ThreadId,
  }
) {}

// RPC definitions
export const MailRpc = RpcGroup.make("mail").pipe(
  RpcGroup.add(
    Rpc.effect("listThreads", {
      payload: ListThreadsRequest,
      success: PaginatedThreadsResponse,
      failure: MailProviderError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("getThread", {
      payload: GetThreadRequest,
      success: Thread.Model,
      failure: S.Union(ThreadNotFoundError, MailProviderError),
    })
  ),
  RpcGroup.add(
    Rpc.effect("sendMessage", {
      payload: SendMessageRequest,
      success: Message.Model,
      failure: MailProviderError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("archiveThread", {
      payload: ArchiveThreadRequest,
      success: S.Void,
      failure: S.Union(ThreadNotFoundError, MailProviderError),
    })
  ),
  RpcGroup.add(
    Rpc.effect("deleteThread", {
      payload: DeleteThreadRequest,
      success: S.Void,
      failure: S.Union(ThreadNotFoundError, MailProviderError),
    })
  )
);
```

#### Task 2.2: Draft RPC Endpoints (effect-code-writer)

```typescript
// packages/comms/server/src/rpc/drafts/DraftsRpc.ts
export const DraftsRpc = RpcGroup.make("drafts").pipe(
  RpcGroup.add(
    Rpc.effect("list", {
      payload: ListDraftsRequest,
      success: PaginatedDraftsResponse,
      failure: MailProviderError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("get", {
      payload: GetDraftRequest,
      success: Draft.Model,
      failure: S.Union(DraftNotFoundError, MailProviderError),
    })
  ),
  RpcGroup.add(
    Rpc.effect("create", {
      payload: CreateDraftRequest,
      success: Draft.Model,
      failure: MailProviderError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("update", {
      payload: UpdateDraftRequest,
      success: Draft.Model,
      failure: S.Union(DraftNotFoundError, MailProviderError),
    })
  ),
  RpcGroup.add(
    Rpc.effect("delete", {
      payload: DeleteDraftRequest,
      success: S.Void,
      failure: S.Union(DraftNotFoundError, MailProviderError),
    })
  ),
  RpcGroup.add(
    Rpc.effect("send", {
      payload: SendDraftRequest,
      success: Message.Model,
      failure: S.Union(DraftNotFoundError, MailProviderError),
    })
  )
);
```

#### Task 2.3: Label RPC Endpoints (effect-code-writer)

```typescript
// packages/comms/server/src/rpc/labels/LabelsRpc.ts
export const LabelsRpc = RpcGroup.make("labels").pipe(
  RpcGroup.add(
    Rpc.effect("list", {
      payload: ListLabelsRequest,
      success: S.Array(Label.Model),
      failure: MailProviderError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("create", {
      payload: CreateLabelRequest,
      success: Label.Model,
      failure: MailProviderError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("update", {
      payload: UpdateLabelRequest,
      success: Label.Model,
      failure: S.Union(LabelNotFoundError, MailProviderError),
    })
  ),
  RpcGroup.add(
    Rpc.effect("delete", {
      payload: DeleteLabelRequest,
      success: S.Void,
      failure: S.Union(LabelNotFoundError, MailProviderError),
    })
  ),
  RpcGroup.add(
    Rpc.effect("applyToThread", {
      payload: ApplyLabelRequest,
      success: S.Void,
      failure: S.Union(ThreadNotFoundError, LabelNotFoundError, MailProviderError),
    })
  ),
  RpcGroup.add(
    Rpc.effect("removeFromThread", {
      payload: RemoveLabelRequest,
      success: S.Void,
      failure: S.Union(ThreadNotFoundError, LabelNotFoundError, MailProviderError),
    })
  )
);
```

#### Task 2.4: Connection RPC Endpoints (effect-code-writer)

```typescript
// packages/comms/server/src/rpc/connections/ConnectionsRpc.ts
export const ConnectionsRpc = RpcGroup.make("connections").pipe(
  RpcGroup.add(
    Rpc.effect("list", {
      payload: ListConnectionsRequest,
      success: S.Array(Connection.Model),
      failure: S.Never,
    })
  ),
  RpcGroup.add(
    Rpc.effect("get", {
      payload: GetConnectionRequest,
      success: Connection.Model,
      failure: ConnectionNotFoundError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("create", {
      payload: CreateConnectionRequest,
      success: Connection.Model,
      failure: OAuthError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("delete", {
      payload: DeleteConnectionRequest,
      success: S.Void,
      failure: ConnectionNotFoundError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("refresh", {
      payload: RefreshConnectionRequest,
      success: Connection.Model,
      failure: S.Union(ConnectionNotFoundError, OAuthError),
    })
  )
);
```

#### Task 2.5: RPC Router Assembly (effect-code-writer)

```typescript
// packages/comms/server/src/rpc/router.ts
import { RpcRouter } from "@effect/rpc";

export const CommsRpcRouter = RpcRouter.make(
  MailRpc,
  DraftsRpc,
  LabelsRpc,
  ConnectionsRpc
);

export type CommsRpcRouter = typeof CommsRpcRouter;
```

#### Task 2.6: Client Contracts (effect-code-writer)

```typescript
// packages/comms/client/src/mail/contract.ts
import { Contract } from "@beep/contract";

export const ListThreadsContract = Contract.make({
  id: "comms.mail.listThreads",
  payload: ListThreadsRequest,
  success: PaginatedThreadsResponse,
  failure: MailProviderError,
});

export const GetThreadContract = Contract.make({
  id: "comms.mail.getThread",
  payload: GetThreadRequest,
  success: Thread.Model,
  failure: S.Union(ThreadNotFoundError, MailProviderError),
});

// ... more contracts
```

#### Task 2.7: Client Handlers (effect-code-writer)

```typescript
// packages/comms/client/src/mail/handler.ts
import { createHandler } from "@beep/client-utils";

export const ListThreadsHandler = createHandler({
  domain: "comms",
  feature: "listThreads",
  execute: (encoded) => rpcClient.mail.listThreads(encoded),
  successSchema: PaginatedThreadsResponse,
  payloadSchema: ListThreadsRequest,
  mutatesSession: false,
});
```

#### Task 2.8: RPC Tests (test-writer)

```
Create comprehensive RPC tests:

- test/rpc/mail/MailRpc.test.ts
- test/rpc/drafts/DraftsRpc.test.ts
- test/rpc/labels/LabelsRpc.test.ts
- test/rpc/connections/ConnectionsRpc.test.ts

Test patterns:
- Unit tests with mocked drivers
- Integration tests with test database
- Error handling for all failure modes
```

### Checkpoint

Before proceeding to P3:

- [ ] All RPC endpoints defined
- [ ] RPC router exports all groups
- [ ] Client contracts match server definitions
- [ ] Client handlers created for all contracts
- [ ] All RPC tests pass
- [ ] `bun run check --filter @beep/comms-server` passes
- [ ] `bun run check --filter @beep/comms-client` passes
- [ ] REFLECTION_LOG.md updated
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

### Rollback Procedure

If P2 fails:
1. `git checkout packages/comms/server/src/rpc/`
2. `git checkout packages/comms/client/src/`
3. Preserve working endpoint implementations

### Critical Path

P2 is on the **critical path** - P4 (AI features) and P5 (UI) both depend on these RPC endpoints.

---

## Phase 3: User Features RPC

**Duration**: 2-3 sessions
**Complexity**: Medium (Score: 38)
**Status**: Pending
**Agents**: `codebase-researcher`, `effect-code-writer`, `test-writer`

### Objectives

1. Create RPC endpoints for email templates
2. Create RPC endpoints for thread notes
3. Create RPC endpoints for keyboard shortcuts
4. Create RPC endpoints for user settings

### Dependencies

- P0 completed (EntityIds, domain models)
- P2 can run in parallel (independent features)

### Tasks

#### Task 3.1: Templates RPC (effect-code-writer)

```typescript
// packages/comms/server/src/rpc/templates/TemplatesRpc.ts
export const TemplatesRpc = RpcGroup.make("templates").pipe(
  RpcGroup.add(
    Rpc.effect("list", {
      payload: ListTemplatesRequest,
      success: S.Array(Template.Model),
      failure: S.Never,
    })
  ),
  RpcGroup.add(
    Rpc.effect("get", {
      payload: GetTemplateRequest,
      success: Template.Model,
      failure: TemplateNotFoundError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("create", {
      payload: CreateTemplateRequest,
      success: Template.Model,
      failure: S.Never,
    })
  ),
  RpcGroup.add(
    Rpc.effect("update", {
      payload: UpdateTemplateRequest,
      success: Template.Model,
      failure: TemplateNotFoundError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("delete", {
      payload: DeleteTemplateRequest,
      success: S.Void,
      failure: TemplateNotFoundError,
    })
  )
);
```

#### Task 3.2: Notes RPC (effect-code-writer)

```typescript
// packages/comms/server/src/rpc/notes/NotesRpc.ts
export const NotesRpc = RpcGroup.make("notes").pipe(
  RpcGroup.add(
    Rpc.effect("listForThread", {
      payload: ListNotesForThreadRequest,
      success: S.Array(Note.Model),
      failure: ThreadNotFoundError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("create", {
      payload: CreateNoteRequest,
      success: Note.Model,
      failure: ThreadNotFoundError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("update", {
      payload: UpdateNoteRequest,
      success: Note.Model,
      failure: NoteNotFoundError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("delete", {
      payload: DeleteNoteRequest,
      success: S.Void,
      failure: NoteNotFoundError,
    })
  )
);
```

#### Task 3.3: Shortcuts RPC (effect-code-writer)

```typescript
// packages/comms/server/src/rpc/shortcuts/ShortcutsRpc.ts
export const ShortcutsRpc = RpcGroup.make("shortcuts").pipe(
  RpcGroup.add(
    Rpc.effect("list", {
      payload: ListShortcutsRequest,
      success: S.Array(Shortcut.Model),
      failure: S.Never,
    })
  ),
  RpcGroup.add(
    Rpc.effect("update", {
      payload: UpdateShortcutRequest,
      success: Shortcut.Model,
      failure: ShortcutNotFoundError,
    })
  ),
  RpcGroup.add(
    Rpc.effect("reset", {
      payload: ResetShortcutsRequest,
      success: S.Array(Shortcut.Model),
      failure: S.Never,
    })
  )
);
```

#### Task 3.4: Settings RPC (effect-code-writer)

```typescript
// packages/comms/server/src/rpc/settings/SettingsRpc.ts
export const SettingsRpc = RpcGroup.make("settings").pipe(
  RpcGroup.add(
    Rpc.effect("get", {
      payload: GetSettingsRequest,
      success: CommsSettings.Model,
      failure: S.Never,
    })
  ),
  RpcGroup.add(
    Rpc.effect("update", {
      payload: UpdateSettingsRequest,
      success: CommsSettings.Model,
      failure: ValidationError,
    })
  )
);
```

#### Task 3.5: Update RPC Router (effect-code-writer)

Add new RPC groups to router:

```typescript
export const CommsRpcRouter = RpcRouter.make(
  MailRpc,
  DraftsRpc,
  LabelsRpc,
  ConnectionsRpc,
  TemplatesRpc,  // New
  NotesRpc,      // New
  ShortcutsRpc,  // New
  SettingsRpc    // New
);
```

### Checkpoint

Before proceeding to P4:

- [ ] Templates RPC implemented
- [ ] Notes RPC implemented
- [ ] Shortcuts RPC implemented
- [ ] Settings RPC implemented
- [ ] Client contracts for all new RPCs
- [ ] All tests pass
- [ ] `bun run check --filter @beep/comms-*` passes
- [ ] REFLECTION_LOG.md updated
- [ ] `handoffs/HANDOFF_P4.md` created
- [ ] `handoffs/P4_ORCHESTRATOR_PROMPT.md` created

### Rollback Procedure

If P3 fails:
1. Revert user feature RPC files
2. Keep core mail RPC intact (P2)

---

## Phase 4: AI Features RPC

**Duration**: 4-5 sessions
**Complexity**: High (Score: 55)
**Status**: Pending
**Agents**: `codebase-researcher`, `mcp-researcher`, `effect-code-writer`, `test-writer`

### Objectives

1. Integrate @effect/ai for email AI capabilities
2. Create AI-powered thread summarization
3. Create AI-powered email composition
4. Create AI-powered categorization
5. Create AI-powered search

### Dependencies

- P2 completed (Core Email RPC - needs thread/message data)

### Tasks

#### Task 4.1: @effect/ai Integration Research (mcp-researcher)

```
Research @effect/ai patterns:

1. Search effect-docs for LanguageModel patterns
2. Search effect-docs for Tool definitions
3. Search effect-docs for streaming responses
4. Document provider configuration (Anthropic, OpenAI)

Output: outputs/P4-effect-ai-research.md
```

#### Task 4.2: AI Service Layer (effect-code-writer)

```typescript
// packages/comms/server/src/services/ai/CommsAiService.ts
import { LanguageModel, Tool } from "@effect/ai";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

export class CommsAiService extends Effect.Service<CommsAiService>()(
  "@beep/comms-server/CommsAiService",
  {
    dependencies: [LanguageModel.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const model = yield* LanguageModel.LanguageModel;

      return {
        summarizeThread: (thread: Thread) =>
          Effect.gen(function* () {
            const prompt = buildSummarizationPrompt(thread);
            const result = yield* model.generateText({
              prompt,
              maxTokens: 500,
            });
            return result.text;
          }),

        composeReply: (thread: Thread, instructions: string) =>
          Stream.gen(function* () {
            const prompt = buildCompositionPrompt(thread, instructions);
            const stream = yield* model.streamText({
              prompt,
              maxTokens: 2000,
            });
            return stream;
          }),

        categorizeThread: (thread: Thread, labels: ReadonlyArray<Label>) =>
          Effect.gen(function* () {
            const result = yield* model.generateObject({
              schema: CategorizationResult,
              prompt: buildCategorizationPrompt(thread, labels),
            });
            return result;
          }),

        extractAction: (thread: Thread) =>
          Effect.gen(function* () {
            const result = yield* model.generateObject({
              schema: ActionExtraction,
              prompt: buildActionExtractionPrompt(thread),
            });
            return result;
          }),
      };
    }),
  }
) {}
```

#### Task 4.3: AI RPC Endpoints (effect-code-writer)

```typescript
// packages/comms/server/src/rpc/ai/AiRpc.ts
export const AiRpc = RpcGroup.make("ai").pipe(
  RpcGroup.add(
    Rpc.effect("summarizeThread", {
      payload: SummarizeThreadRequest,
      success: ThreadSummary,
      failure: S.Union(ThreadNotFoundError, AiServiceError),
    })
  ),
  RpcGroup.add(
    Rpc.stream("composeReply", {
      payload: ComposeReplyRequest,
      success: S.String,  // Streaming text chunks
      failure: S.Union(ThreadNotFoundError, AiServiceError),
    })
  ),
  RpcGroup.add(
    Rpc.effect("categorize", {
      payload: CategorizeThreadRequest,
      success: CategorizationResult,
      failure: S.Union(ThreadNotFoundError, AiServiceError),
    })
  ),
  RpcGroup.add(
    Rpc.effect("extractActions", {
      payload: ExtractActionsRequest,
      success: S.Array(ActionItem),
      failure: S.Union(ThreadNotFoundError, AiServiceError),
    })
  ),
  RpcGroup.add(
    Rpc.stream("search", {
      payload: AiSearchRequest,
      success: SearchResult,
      failure: AiServiceError,
    })
  )
);
```

#### Task 4.4: AI Tool Definitions (effect-code-writer)

```typescript
// packages/comms/server/src/services/ai/tools/index.ts
import { Tool } from "@effect/ai";
import * as S from "effect/Schema";

export const SearchEmailsTool = Tool.make({
  name: "search_emails",
  description: "Search for emails matching a query",
  parameters: S.Struct({
    query: S.String,
    fromDate: S.optional(S.DateFromString),
    toDate: S.optional(S.DateFromString),
    sender: S.optional(S.String),
    labels: S.optional(S.Array(S.String)),
  }),
  handler: (params) =>
    Effect.gen(function* () {
      const driver = yield* EmailDriver;
      return yield* driver.search(params);
    }),
});

export const GetThreadContentTool = Tool.make({
  name: "get_thread_content",
  description: "Get full content of an email thread",
  parameters: S.Struct({
    threadId: S.String,
  }),
  handler: (params) =>
    Effect.gen(function* () {
      const driver = yield* EmailDriver;
      return yield* driver.getThread(params.threadId);
    }),
});

export const CommsToolkit = Toolkit.make(
  SearchEmailsTool,
  GetThreadContentTool
);
```

#### Task 4.5: AI Streaming Handlers (effect-code-writer)

Create client-side streaming handlers for AI responses:

```typescript
// packages/comms/client/src/ai/hooks/useComposeReply.ts
import { useSubscriptionRef } from "@beep/client-utils";

export const useComposeReply = () => {
  const [state, setState] = useState<ComposeState>({ status: "idle" });

  const compose = useCallback((threadId: string, instructions: string) => {
    setState({ status: "streaming", text: "" });

    const stream = rpcClient.ai.composeReply.stream({ threadId, instructions });

    Stream.runForEach(stream, (chunk) => {
      setState((prev) => ({
        ...prev,
        text: prev.text + chunk,
      }));
    }).pipe(
      Effect.tap(() => setState((prev) => ({ ...prev, status: "complete" }))),
      Effect.catchTag("AiServiceError", (e) => {
        setState({ status: "error", error: e.message });
        return Effect.void;
      }),
      Effect.runFork
    );
  }, []);

  return { state, compose };
};
```

### Checkpoint

Before proceeding to P5:

- [ ] @effect/ai integration complete
- [ ] AI service implements all methods
- [ ] AI RPC endpoints defined
- [ ] AI tools for agent capabilities
- [ ] Streaming handlers work correctly
- [ ] AI tests pass
- [ ] `bun run check --filter @beep/comms-*` passes
- [ ] REFLECTION_LOG.md updated
- [ ] `handoffs/HANDOFF_P5.md` created
- [ ] `handoffs/P5_ORCHESTRATOR_PROMPT.md` created

### Rollback Procedure

If P4 fails:
1. Disable AI features via feature flag
2. Keep core email functionality intact
3. Document AI integration issues

### Critical Path

P4 is on the **critical path** for AI features in UI (P5).

---

## Phase 5: UI Components

**Duration**: 4-5 sessions
**Complexity**: High (Score: 50)
**Status**: Pending
**Agents**: `codebase-researcher`, `effect-code-writer`, `test-writer`

### Objectives

1. Create View Models (VMs) for all email features
2. Port Zero UI components to VM pattern
3. Integrate with @beep/ui components
4. Create Effect Atom state management

### Dependencies

- P2 completed (Core Email RPC - for data fetching)
- P4 completed (AI Features - for AI UI)

### Tasks

#### Task 5.1: Thread List VM (effect-code-writer)

```typescript
// packages/comms/ui/src/thread-list/ThreadList.vm.ts
import { atom, useAtomValue, useSetAtom } from "@beep/atom";
import * as Effect from "effect/Effect";

// State atoms
export const threadsAtom = atom<ReadonlyArray<Thread>>([]);
export const selectedThreadIdAtom = atom<string | null>(null);
export const loadingAtom = atom<boolean>(false);
export const errorAtom = atom<Error | null>(null);

// Derived atoms
export const selectedThreadAtom = atom((get) => {
  const threads = get(threadsAtom);
  const selectedId = get(selectedThreadIdAtom);
  return A.findFirst(threads, (t) => t.id === selectedId);
});

// Actions
export const loadThreads = (connectionId: string, labelId?: string) =>
  Effect.gen(function* () {
    yield* Effect.sync(() => loadingAtom.set(true));

    const result = yield* ListThreadsHandler.execute({
      connectionId,
      labelId,
    });

    yield* Effect.sync(() => {
      threadsAtom.set(result.threads);
      loadingAtom.set(false);
    });

    return result;
  }).pipe(
    Effect.catchAll((error) =>
      Effect.sync(() => {
        errorAtom.set(error);
        loadingAtom.set(false);
      })
    )
  );

// Hook exports
export const useThreads = () => useAtomValue(threadsAtom);
export const useSelectedThread = () => useAtomValue(selectedThreadAtom);
export const useLoadThreads = () => {
  const runtime = useRuntime();
  return useCallback(
    (connectionId: string, labelId?: string) =>
      runtime.runPromise(loadThreads(connectionId, labelId)),
    [runtime]
  );
};
```

#### Task 5.2: Thread View VM (effect-code-writer)

```typescript
// packages/comms/ui/src/thread-view/ThreadView.vm.ts
export const currentThreadAtom = atom<Thread | null>(null);
export const messagesAtom = atom<ReadonlyArray<Message>>([]);
export const replyDraftAtom = atom<string>("");
export const aiSummaryAtom = atom<string | null>(null);
export const aiSummaryLoadingAtom = atom<boolean>(false);

export const loadThread = (connectionId: string, threadId: string) =>
  Effect.gen(function* () {
    const thread = yield* GetThreadHandler.execute({ connectionId, threadId });
    yield* Effect.sync(() => currentThreadAtom.set(thread));
    return thread;
  });

export const summarizeThread = () =>
  Effect.gen(function* () {
    const thread = currentThreadAtom.get();
    if (!thread) return;

    yield* Effect.sync(() => aiSummaryLoadingAtom.set(true));

    const summary = yield* SummarizeThreadHandler.execute({
      threadId: thread.id,
    });

    yield* Effect.sync(() => {
      aiSummaryAtom.set(summary.text);
      aiSummaryLoadingAtom.set(false);
    });
  });
```

#### Task 5.3: Compose VM (effect-code-writer)

```typescript
// packages/comms/ui/src/compose/Compose.vm.ts
export const composeStateAtom = atom<ComposeState>({
  to: [],
  cc: [],
  bcc: [],
  subject: "",
  body: "",
  attachments: [],
  replyToThreadId: null,
});

export const sendingAtom = atom<boolean>(false);
export const aiAssistAtom = atom<AiAssistState>({ status: "idle" });

export const sendMessage = () =>
  Effect.gen(function* () {
    const state = composeStateAtom.get();
    yield* Effect.sync(() => sendingAtom.set(true));

    const message = yield* SendMessageHandler.execute({
      to: state.to,
      cc: state.cc,
      bcc: state.bcc,
      subject: state.subject,
      body: state.body,
      attachments: state.attachments,
      replyToThreadId: state.replyToThreadId,
    });

    yield* Effect.sync(() => {
      sendingAtom.set(false);
      composeStateAtom.set(initialComposeState);
    });

    return message;
  });

export const aiCompose = (instructions: string) =>
  Effect.gen(function* () {
    yield* Effect.sync(() => aiAssistAtom.set({ status: "generating", text: "" }));

    const stream = yield* ComposeReplyHandler.stream({ instructions });

    yield* Stream.runForEach(stream, (chunk) =>
      Effect.sync(() => {
        aiAssistAtom.set((prev) => ({
          ...prev,
          text: prev.text + chunk,
        }));
      })
    );

    yield* Effect.sync(() => aiAssistAtom.set((prev) => ({ ...prev, status: "complete" })));
  });
```

#### Task 5.4: UI Components (effect-code-writer)

Port Zero components to beep-effect patterns:

```
Components to port:
- ThreadList.tsx (from tmp/Zero/apps/mail/components/mail/)
- ThreadView.tsx
- MessageItem.tsx
- ComposeModal.tsx
- LabelSelector.tsx
- SearchBar.tsx
- SettingsPanel.tsx
- ConnectionManager.tsx

Patterns:
- Use @beep/ui base components
- Integrate with VMs via hooks
- Use Tailwind for styling
- Follow accessibility standards
```

#### Task 5.5: Component Tests (test-writer)

```
Create component tests:

- test/components/ThreadList.test.tsx
- test/components/ThreadView.test.tsx
- test/components/ComposeModal.test.tsx

Use @beep/testkit patterns with React Testing Library
```

### Checkpoint

Spec complete when:

- [ ] All VMs implemented
- [ ] All UI components ported
- [ ] Components integrate with VMs
- [ ] Component tests pass
- [ ] UI renders correctly in browser
- [ ] `bun run check --filter @beep/comms-ui` passes
- [ ] REFLECTION_LOG.md finalized
- [ ] Spec marked complete

### Rollback Procedure

If P5 fails:
1. `git checkout packages/comms/ui/`
2. Keep server/client code intact
3. Document UI issues for future work

---

## Cross-Phase Considerations

### Effect Patterns (Mandatory)

All code must follow `.claude/rules/effect-patterns.md`:

```typescript
// REQUIRED: Namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";

// REQUIRED: Effect.gen for async operations
const result = yield* Effect.gen(function* () {
  const data = yield* someEffect;
  return data;
});

// REQUIRED: Effect.Service for all services
export class MyService extends Effect.Service<MyService>()(
  "@beep/comms-server/MyService",
  {
    dependencies: [...],
    accessors: true,
    effect: Effect.gen(function* () { ... }),
  }
) {}
```

### Testing Requirements

Each phase must include tests using `@beep/testkit`:

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

// Unit test
effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
    strictEqual(result, expected);
  })
);

// Integration test with Layer
layer(TestLayer, { timeout: Duration.seconds(60) })("suite", (it) => {
  it.effect("test name", () =>
    Effect.gen(function* () {
      const service = yield* MyService;
      const result = yield* service.method();
      strictEqual(result, expected);
    })
  );
});
```

### Documentation Requirements

Each phase updates:
- `REFLECTION_LOG.md` with phase learnings
- `handoffs/HANDOFF_P[N+1].md` for next phase context
- `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` for session start

---

## Estimated Complexity Scores

| Phase | Phases | Agents | Cross-Pkg | Ext-Deps | Uncertainty | Research | Total | Level |
|-------|--------|--------|-----------|----------|-------------|----------|-------|-------|
| P0 | 1x2=2 | 3x3=9 | 2x4=8 | 0x3=0 | 2x5=10 | 3x2=6 | **35** | Medium |
| P1 | 1x2=2 | 4x3=12 | 2x4=8 | 2x3=6 | 3x5=15 | 3x2=6 | **48** | High |
| P2 | 1x2=2 | 3x3=9 | 3x4=12 | 1x3=3 | 4x5=20 | 3x2=6 | **52** | High |
| P3 | 1x2=2 | 3x3=9 | 2x4=8 | 0x3=0 | 2x5=10 | 2x2=4 | **38** | Medium |
| P4 | 1x2=2 | 4x3=12 | 3x4=12 | 2x3=6 | 4x5=20 | 4x2=8 | **55** | High |
| P5 | 1x2=2 | 3x3=9 | 4x4=16 | 1x3=3 | 3x5=15 | 3x2=6 | **50** | High |

**Total Estimated Sessions**: 19-25

---

## Success Criteria

This spec is complete when:

- [ ] All 6 phases completed
- [ ] `packages/comms/*` fully implements email functionality
- [ ] Gmail and Outlook drivers operational
- [ ] All RPC endpoints tested
- [ ] AI features integrated via @effect/ai
- [ ] UI components use VM pattern
- [ ] `bun run check` passes for all comms packages
- [ ] REFLECTION_LOG.md captures all learnings
- [ ] Feature can be demonstrated end-to-end

---

## Related Specifications

- `specs/knowledge-graph-integration/` - Similar vertical slice pattern
- `specs/lexical-effect-alignment/` - Effect pattern migration reference
- `.claude/rules/effect-patterns.md` - Mandatory code patterns
- `.claude/commands/patterns/effect-testing-patterns.md` - Test patterns

---

## Non-Goals

This spec does NOT:
- Create a standalone email application
- Implement email server (IMAP/SMTP)
- Handle email encryption (PGP/S-MIME)
- Implement spam filtering
- Create mobile-specific components
