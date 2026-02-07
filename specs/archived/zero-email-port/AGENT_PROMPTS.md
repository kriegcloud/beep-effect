# Zero Email Port - Agent Prompt Templates

> Copy-paste ready prompts for delegating work to specialized sub-agents during the zero-email-port implementation.

---

## Table of Contents

1. [codebase-researcher](#1-codebase-researcher)
2. [effect-code-writer](#2-effect-code-writer)
3. [test-writer](#3-test-writer)
4. [code-reviewer](#4-code-reviewer)
5. [domain-modeler](#5-domain-modeler)
6. [react-expert](#6-react-expert)

---

## 1. codebase-researcher

Use for: Exploring package structure, finding existing patterns, understanding code dependencies, mapping architectures.

### 1.1 Research Existing Gmail Integration

```markdown
## Research Question

Map the existing Gmail integration in `packages/shared/integrations/src/google/gmail/` to understand:
1. What operations are already implemented?
2. What patterns does the WrapperGroup use?
3. What error types exist?
4. How is the GmailClient context structured?

## Scope

- `packages/shared/integrations/src/google/gmail/**/*`
- Depth: deep

## Research Objectives

1. List all existing Gmail operations (wrappers/handlers)
2. Document the Wrap.WrapperGroup pattern and how handlers are composed
3. Extract the `wrapGmailCall` helper pattern
4. Document `GmailMethodError` and error handling approach
5. Identify the Email model schema shape

## Output Requirements

Provide:
- File:line references for each finding
- Code examples using namespace imports (import * as Effect from "effect/Effect")
- Recommendations for extending vs. creating new patterns
- Gaps that need filling for Zero email client features

## Success Criteria

- [ ] All 12 existing Gmail operations documented
- [ ] WrapperGroup.toLayer pattern extracted
- [ ] Error types catalogued with fromUnknown factory pattern
- [ ] GmailClient Context.Tag shape documented
- [ ] Clear gap analysis for draft/thread operations
```

### 1.2 Research Comms Slice Current State

```markdown
## Research Question

Analyze the current state of `packages/comms/` to understand what exists and what needs to be created for the zero-email-port.

## Scope

- `packages/comms/**/*`
- `packages/shared/domain/src/entity-ids/comms/**/*`
- Depth: deep

## Research Objectives

1. What domain models exist in `@beep/comms-domain`?
2. What EntityIds are defined in `CommsEntityIds`?
3. What value objects exist (Label, Sender, ParsedMessage, etc.)?
4. Does `@beep/comms-tables` exist? What tables?
5. Does `@beep/comms-server` exist? What services?

## Output Requirements

Provide:
- Inventory table: | Package | Status | Contents |
- EntityId inventory with prefixes
- Schema shapes for existing value objects
- Missing packages that need creation
- File:line references for all findings

## Success Criteria

- [ ] Complete package inventory for comms slice
- [ ] All existing EntityIds documented
- [ ] MailValues value objects catalogued
- [ ] Clear CREATE vs EXTEND designation for each package
```

### 1.3 Research RPC Contract Patterns

```markdown
## Research Question

Find existing RPC contract patterns in the codebase to use as templates for the comms RPC contracts.

## Scope

- `packages/*/domain/src/rpc/**/*`
- `packages/shared/domain/src/rpc/**/*`
- Depth: shallow

## Research Objectives

1. What is the standard RPC contract file structure?
2. How are Payload and Success classes defined?
3. What is the $I pattern for identifiers?
4. How do contracts handle optional fields?
5. How are contracts grouped into RpcGroups?

## Output Requirements

Provide:
- Template code for a complete RPC contract (Payload, Success, Contract)
- Examples of Rpc.make usage with different payload shapes
- RpcGroup composition pattern
- Handler implementation pattern
- formValuesAnnotation usage for client forms

## Success Criteria

- [ ] Complete RPC contract template extracted
- [ ] Rpc.make signature documented
- [ ] RpcGroup.make pattern documented
- [ ] At least 3 example contracts referenced with file:line
```

### 1.4 Research Table Factory Patterns

```markdown
## Research Question

Find table definition patterns to use for `@beep/comms-tables` creation.

## Scope

- `packages/*/tables/src/**/*.table.ts`
- `packages/shared/tables/src/**/*`
- Depth: shallow

## Research Objectives

1. How does Table.make work with EntityIds?
2. How does OrgTable.make differ for multi-tenant tables?
3. What column type patterns are used (.$type<EntityId.Type>())?
4. How are foreign key references typed?
5. What index patterns are common?

## Output Requirements

Provide:
- Table.make template with EntityId
- OrgTable.make template for multi-tenant
- Column typing pattern for foreign keys
- Index creation patterns
- Example from iam-tables or documents-tables

## Success Criteria

- [ ] Table.make pattern documented
- [ ] OrgTable.make pattern documented
- [ ] .$type<EntityId.Type>() pattern documented
- [ ] At least 2 complete table examples with file:line
```

---

## 2. effect-code-writer

Use for: Implementing Effect services, RPC contracts, handlers, domain models, and infrastructure code.

### 2.1 Implement Gmail Draft Operations

```markdown
## Task

Extend the existing Gmail integration with draft operations following established patterns.

## Context

- Existing Gmail integration: `packages/shared/integrations/src/google/gmail/`
- Pattern reference: `actions/send-email/` (Wrapper + Handler structure)
- Error types: `errors.ts` (GmailMethodError union)

## Operations to Implement

1. **CreateDraft** - `actions/create-draft/`
2. **GetDraft** - `actions/get-draft/`
3. **ListDrafts** - `actions/list-drafts/`
4. **SendDraft** - `actions/send-draft/`
5. **DeleteDraft** - `actions/delete-draft/`

## File Structure (per operation)

```
actions/{operation}/
  contract.ts   # PayloadFrom, Success, Wrapper
  handler.ts    # Wrapper.implement(Effect.fn(...))
  index.ts      # Re-exports
  mod.ts        # Barrel
```

## Required Patterns

1. Use `$SharedIntegrationsId.create()` for identifiers
2. Use `Wrap.Wrapper.make()` for contracts
3. Use `wrapGmailCall` from `common/wrap-gmail-call.ts`
4. Use `GmailMethodError` for error type
5. Use `S.optionalWith(S.X, { as: "Option" })` for optional fields
6. Use `O.getOrUndefined()` to extract options in handlers

## Contract Template

```typescript
import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/create-draft/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  to: S.Array(S.String),
  subject: S.optionalWith(S.String, { as: "Option" }),
  body: S.optionalWith(S.String, { as: "Option" }),
  threadId: S.optionalWith(S.String, { as: "Option" }),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  id: S.String,
  message: S.Struct({ id: S.String, threadId: S.String }),
}) {}

export const Wrapper = Wrap.Wrapper.make("CreateDraft", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

## Handler Template

```typescript
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(function* (payload) {
    const response = yield* wrapGmailCall({
      operation: (client) =>
        client.users.drafts.create({
          userId: "me",
          requestBody: {
            message: {
              raw: buildRawEmail(payload),
              threadId: O.getOrUndefined(payload.threadId),
            },
          },
        }),
      failureMessage: "Failed to create draft",
    });

    return yield* S.decode(Success)({
      id: response.data.id ?? "",
      message: {
        id: response.data.message?.id ?? "",
        threadId: response.data.message?.threadId ?? "",
      },
    });
  })
);
```

## Verification

After implementing each operation:
```bash
bun run check --filter @beep/shared-integrations
bun run lint --filter @beep/shared-integrations
```

## Success Criteria

- [ ] All 5 draft operations implemented
- [ ] Each has contract.ts, handler.ts, index.ts, mod.ts
- [ ] All use GmailMethodError
- [ ] All use wrapGmailCall helper
- [ ] Namespace imports only (import * as X)
- [ ] No async/await - only Effect.gen
- [ ] `bun run check --filter @beep/shared-integrations` passes
```

### 2.2 Implement MailDriver Interface

```markdown
## Task

Create a provider-agnostic MailDriver abstraction for email operations.

## Location

`packages/comms/server/src/services/mail/MailDriver.ts`

## Requirements

1. Define MailDriver interface with Context.Tag
2. Include all operations needed by Zero email client
3. Use typed Effect errors (ProviderApiError, ThreadNotFoundError, etc.)
4. Use Option for nullable responses
5. Make it compatible with both Gmail and Outlook implementations

## Interface Shape

```typescript
export interface MailDriver {
  readonly provider: EmailProvider;

  // Thread operations
  readonly listThreads: (params: ListThreadsParams) =>
    Effect.Effect<ThreadsResponse, ProviderApiError>;

  readonly getThread: (id: string) =>
    Effect.Effect<ThreadResponse, ThreadNotFoundError | ProviderApiError>;

  // Message operations
  readonly sendMail: (data: SendMailData) =>
    Effect.Effect<SendResult, ProviderApiError>;

  // Draft operations
  readonly createDraft: (data: DraftData) =>
    Effect.Effect<{ id: string }, ProviderApiError>;

  // Label operations
  readonly getUserLabels: () =>
    Effect.Effect<ReadonlyArray<Label>, ProviderApiError>;

  // Read/unread operations
  readonly markAsRead: (messageIds: ReadonlyArray<string>) =>
    Effect.Effect<void, ProviderApiError>;
}

export class MailDriver extends Context.Tag("@beep/comms/MailDriver")<MailDriver, MailDriver>() {}
```

## Error Types

```typescript
export class ProviderApiError extends S.TaggedError<ProviderApiError>()(
  "ProviderApiError",
  {
    provider: S.Literal("google", "microsoft"),
    statusCode: S.optionalWith(S.Number, { as: "Option" }),
    message: S.String,
  }
) {}

export class ThreadNotFoundError extends S.TaggedError<ThreadNotFoundError>()(
  "ThreadNotFoundError",
  { threadId: S.String }
) {}
```

## Context Patterns

- All methods return `Effect.Effect<A, E>` (no R - requirements come from Layer)
- Use `S.TaggedError` for all error types
- Use `Option` for nullable values (not null/undefined)
- Use branded EntityIds where applicable

## Success Criteria

- [ ] MailDriver interface covers all Zero operations
- [ ] Context.Tag defined correctly
- [ ] All error types use S.TaggedError
- [ ] All optional fields use Option
- [ ] Compatible with Gmail WrapperGroup
- [ ] `bun run check --filter @beep/comms-server` passes
```

### 2.3 Implement RPC Handlers for Mail Router

```markdown
## Task

Implement RPC handlers for the mail router (P2 scope).

## Location

`packages/comms/server/src/rpc/v1/mail/`

## Contracts to Implement (from @beep/comms-domain)

1. `mail_listThreads` - Thread listing with pagination
2. `mail_getThread` - Single thread with messages
3. `mail_send` - Send email
4. `mail_markAsRead` - Mark threads as read
5. `mail_modifyLabels` - Add/remove labels

## Handler Pattern

```typescript
// packages/comms/server/src/rpc/v1/mail/list-threads.handler.ts
import { $CommsServerId } from "@beep/identity/packages";
import { ListThreadsContract } from "@beep/comms-domain/rpc/v1/mail";
import { MailDriver } from "../../../services/mail/MailDriver";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $CommsServerId.create("rpc/v1/mail/list-threads");

export const handler = Effect.fn($I`handler`)(
  function* (payload: ListThreadsContract.Payload) {
    const driver = yield* MailDriver;

    const response = yield* driver.listThreads({
      folder: payload.folder,
      query: payload.query ?? undefined,
      maxResults: payload.maxResults ?? 50,
      pageToken: payload.cursor ?? undefined,
      labelIds: payload.labelIds ?? undefined,
    });

    return new ListThreadsContract.Success({
      threads: response.threads,
      nextPageToken: response.nextPageToken,
    });
  }
);
```

## RPC Group Assembly

```typescript
// packages/comms/server/src/rpc/v1/mail/index.ts
import { RpcGroup } from "@effect/rpc/RpcGroup";
import * as ListThreads from "./list-threads.handler";
import * as GetThread from "./get-thread.handler";
import * as Send from "./send.handler";
import * as MarkAsRead from "./mark-as-read.handler";
import * as ModifyLabels from "./modify-labels.handler";

export const MailRpcGroup = RpcGroup.make(
  ListThreads.handler,
  GetThread.handler,
  Send.handler,
  MarkAsRead.handler,
  ModifyLabels.handler
);
```

## Dependencies

Each handler requires:
- `MailDriver` - For email provider operations
- `CommsDb` - For database operations (summaries, notes)
- `AuthContext` - For user authentication

## Success Criteria

- [ ] All 5 handlers implemented
- [ ] Each handler uses MailDriver service
- [ ] Proper error handling with catchTag
- [ ] RpcGroup exports correctly
- [ ] No async/await - only Effect.gen
- [ ] `bun run check --filter @beep/comms-server` passes
```

### 2.4 Create @beep/comms-tables Package

```markdown
## Task

Create the `@beep/comms-tables` package with table definitions.

## Location

`packages/comms/tables/`

## Package Structure

```
packages/comms/tables/
  src/
    tables/
      connection.table.ts
      thread-summary.table.ts
      note.table.ts
      user-settings.table.ts
      user-hotkeys.table.ts
      email-template.table.ts
      index.ts
    index.ts
  package.json
  tsconfig.src.json
  tsconfig.build.json
  tsconfig.test.json
  CLAUDE.md
```

## Table Pattern (using Table.make)

```typescript
// connection.table.ts
import { Table } from "@beep/tables";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as pg from "drizzle-orm/pg-core";

export const connectionTable = Table.make(CommsEntityIds.ConnectionId)({
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),
  email: pg.text("email").notNull(),
  name: pg.text("name"),
  picture: pg.text("picture"),
  accessToken: pg.text("access_token"),
  refreshToken: pg.text("refresh_token"),
  scope: pg.text("scope").notNull(),
  providerId: pg.text("provider_id").$type<"google" | "microsoft">().notNull(),
  expiresAt: pg.timestamp("expires_at").notNull(),
}, (t) => ({
  userIdIdx: pg.index("connection_user_id_idx").on(t.userId),
  emailUserIdx: pg.unique("connection_email_user_unique").on(t.userId, t.email),
}));
```

## Tables to Create

| Table | EntityId | Key Foreign Keys |
|-------|----------|------------------|
| `connectionTable` | `ConnectionId` | `userId` -> SharedEntityIds.UserId |
| `threadSummaryTable` | `ThreadSummaryId` | `connectionId` -> ConnectionId |
| `noteTable` | `NoteId` | `userId` -> SharedEntityIds.UserId |
| `userSettingsTable` | `UserSettingsId` | `userId` -> SharedEntityIds.UserId |
| `userHotkeysTable` | `UserHotkeysId` | `userId` -> SharedEntityIds.UserId |
| `emailTemplateTable` | `EmailTemplateId` | `userId` -> SharedEntityIds.UserId |

## Critical Patterns

1. **Always use .$type<EntityId.Type>()** for foreign key columns
2. **Use Table.make(EntityId)** - provides id, createdAt, updatedAt automatically
3. **Add appropriate indexes** for query patterns
4. **Use unique constraints** where needed

## Verification

```bash
bun run check --filter @beep/comms-tables
bun run db:generate
```

## Success Criteria

- [ ] All 6 tables created
- [ ] All foreign keys typed with .$type<>()
- [ ] Indexes added for common queries
- [ ] Package exports all tables
- [ ] `bun run check --filter @beep/comms-tables` passes
- [ ] `bun run db:generate` succeeds
```

---

## 3. test-writer

Use for: Creating Effect-based tests with @beep/testkit, testing services, VMs, and RPC handlers.

### 3.1 Test Gmail Draft Operations

```markdown
## Task

Create tests for the new Gmail draft operations.

## Test Location

`packages/shared/integrations/test/google/gmail/actions/`

## Test Framework

Use `@beep/testkit` for Effect-based tests:
```typescript
import { assert, describe, it } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
```

## Test Structure

```typescript
// create-draft.test.ts
import { assert, describe, it } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { CreateDraft } from "@beep/shared-integrations/google/gmail/actions/create-draft";
import { GmailClient } from "@beep/shared-integrations/google/gmail/common/GmailClient";

// Mock GmailClient
const MockGmailClient = Layer.succeed(GmailClient, {
  client: {
    users: {
      drafts: {
        create: async () => ({
          data: {
            id: "draft_123",
            message: { id: "msg_456", threadId: "thread_789" }
          }
        })
      }
    }
  } as any
});

describe("CreateDraft", () => {
  it.effect("should create a draft with minimal payload", () =>
    Effect.gen(function* () {
      const result = yield* CreateDraft.Handler(
        new CreateDraft.PayloadFrom({
          to: ["test@example.com"],
          subject: O.none(),
          body: O.none(),
          threadId: O.none(),
        })
      );

      assert.strictEqual(result.id, "draft_123");
      assert.strictEqual(result.message.id, "msg_456");
    }).pipe(Effect.provide(MockGmailClient))
  );

  it.effect("should create a draft with full payload", () =>
    Effect.gen(function* () {
      const result = yield* CreateDraft.Handler(
        new CreateDraft.PayloadFrom({
          to: ["test@example.com"],
          subject: O.some("Test Subject"),
          body: O.some("Test body content"),
          threadId: O.some("thread_existing"),
        })
      );

      assert.strictEqual(result.id, "draft_123");
    }).pipe(Effect.provide(MockGmailClient))
  );
});
```

## Tests Required

| Operation | Test Cases |
|-----------|------------|
| CreateDraft | minimal payload, full payload, error handling |
| GetDraft | found draft, not found error |
| ListDrafts | empty list, paginated results |
| SendDraft | success, draft not found |
| DeleteDraft | success, already deleted |

## Mocking Pattern

```typescript
// Use Layer.succeed for mock services
const MockGmailClient = Layer.succeed(GmailClient, {
  client: mockClientImplementation
});

// Use Effect.provide in each test
it.effect("test name", () =>
  Effect.gen(function* () {
    // test logic
  }).pipe(Effect.provide(MockGmailClient))
);
```

## Error Testing Pattern

```typescript
it.effect("should fail with GmailOperationError on API failure", () =>
  Effect.gen(function* () {
    const error = yield* Effect.flip(
      CreateDraft.Handler(payload)
    );
    assert.isTrue(error instanceof GmailOperationError);
  }).pipe(Effect.provide(MockGmailClientWithError))
);
```

## Verification

```bash
bun run test --filter @beep/shared-integrations -- --grep "gmail"
```

## Success Criteria

- [ ] All 5 draft operations have tests
- [ ] Happy path covered for each
- [ ] Error cases covered for each
- [ ] Uses @beep/testkit (not raw bun:test)
- [ ] Uses assert.* (not expect())
- [ ] All tests pass
```

### 3.2 Test MailDriver Adapter

```markdown
## Task

Create tests for the GmailDriverAdapter that wraps Gmail operations into MailDriver interface.

## Test Location

`packages/comms/server/test/services/mail/drivers/GmailDriverAdapter.test.ts`

## Test Framework

```typescript
import { assert, describe, it } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
```

## Test Structure

```typescript
import { assert, describe, it } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { GmailDriverAdapterLive, MailDriver } from "@beep/comms-server/services/mail";
import { GmailActions } from "@beep/shared-integrations/google/gmail";

// Mock the Gmail WrapperGroup
const MockGmailActions = Layer.succeed(GmailActions.Group.Tag, {
  ListThreads: () => Effect.succeed({
    threads: [
      { id: "thread_1", historyId: O.some("123"), snippet: O.some("Preview") }
    ],
    nextPageToken: O.none(),
    resultSizeEstimate: O.some(1),
  }),
  GetThread: ({ threadId }) =>
    threadId === "thread_1"
      ? Effect.succeed({
          id: "thread_1",
          historyId: O.some("123"),
          messages: [{
            id: "msg_1",
            threadId: "thread_1",
            subject: "Test",
            from: "sender@example.com",
            to: ["recipient@example.com"],
            cc: O.none(),
            bcc: O.none(),
            date: O.some(new Date()),
            snippet: "Preview text",
            body: O.some("Full body"),
            labels: O.some(["INBOX", "UNREAD"]),
            attachments: O.none(),
          }],
        })
      : Effect.fail(new GmailOperationError({ message: "Not found", status: 404 })),
  // ... other mocked operations
});

const TestLayer = GmailDriverAdapterLive.pipe(
  Layer.provide(MockGmailActions)
);

describe("GmailDriverAdapter", () => {
  it.effect("should list threads", () =>
    Effect.gen(function* () {
      const driver = yield* MailDriver;

      const result = yield* driver.listThreads({ maxResults: 10 });

      assert.strictEqual(result.threads.length, 1);
      assert.strictEqual(result.threads[0].id, "thread_1");
    }).pipe(Effect.provide(TestLayer))
  );

  it.effect("should get thread with messages", () =>
    Effect.gen(function* () {
      const driver = yield* MailDriver;

      const result = yield* driver.getThread("thread_1");

      assert.strictEqual(result.messages.length, 1);
      assert.isTrue(result.hasUnread);
    }).pipe(Effect.provide(TestLayer))
  );

  it.effect("should fail with ThreadNotFoundError for missing thread", () =>
    Effect.gen(function* () {
      const driver = yield* MailDriver;

      const error = yield* Effect.flip(driver.getThread("nonexistent"));

      assert.isTrue(error instanceof ThreadNotFoundError);
      assert.strictEqual(error.threadId, "nonexistent");
    }).pipe(Effect.provide(TestLayer))
  );
});
```

## Test Coverage Matrix

| MailDriver Method | Happy Path | Error Case | Edge Case |
|-------------------|------------|------------|-----------|
| listThreads | with results | API error | empty list |
| getThread | found | not found | |
| sendMail | success | API error | |
| createDraft | success | API error | |
| getDraft | found | not found | |
| listDrafts | with results | API error | empty |
| deleteDraft | success | API error | |
| sendDraft | success | draft not found | |
| getUserLabels | with labels | API error | empty |
| markAsRead | success | API error | |
| markAsUnread | success | API error | |
| modifyLabels | success | API error | |

## Success Criteria

- [ ] All MailDriver methods have tests
- [ ] Error mapping verified (GmailError -> ProviderApiError)
- [ ] ThreadNotFoundError thrown for 404s
- [ ] Option handling correct
- [ ] Uses @beep/testkit patterns
- [ ] All tests pass
```

### 3.3 Test RPC Handlers

```markdown
## Task

Create tests for the mail RPC handlers.

## Test Location

`packages/comms/server/test/rpc/v1/mail/`

## Test Layer Pattern

```typescript
import { assert, describe, it, layer } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Duration from "effect/Duration";

// Mock services
const MockMailDriver = Layer.succeed(MailDriver, {
  provider: "google",
  listThreads: () => Effect.succeed({ threads: [], nextPageToken: O.none() }),
  getThread: () => Effect.fail(new ThreadNotFoundError({ threadId: "test" })),
  // ... other mocked methods
});

const MockAuthContext = Layer.succeed(Policy.AuthContext, {
  userId: "user_123" as SharedEntityIds.UserId.Type,
  sessionId: "session_456" as SharedEntityIds.SessionId.Type,
});

const TestLayer = Layer.mergeAll(
  MockMailDriver,
  MockAuthContext
);

// Use layer() for shared expensive resources
layer(TestLayer, { timeout: Duration.seconds(30) })("Mail RPC Handlers", (it) => {
  it.effect("listThreads should return empty list", () =>
    Effect.gen(function* () {
      const result = yield* listThreadsHandler(
        new ListThreadsContract.Payload({
          connectionId: "conn_123" as CommsEntityIds.ConnectionId.Type,
          folder: "inbox",
        })
      );

      assert.strictEqual(result.threads.length, 0);
      assert.isTrue(O.isNone(result.nextPageToken));
    })
  );

  it.effect("getThread should fail with not found", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        getThreadHandler(
          new GetThreadContract.Payload({
            connectionId: "conn_123" as CommsEntityIds.ConnectionId.Type,
            threadId: "nonexistent",
          })
        )
      );

      assert.isTrue(error instanceof ThreadNotFoundError);
    })
  );
});
```

## Handlers to Test

| Handler | Test Cases |
|---------|------------|
| listThreadsHandler | empty, with results, pagination, with filters |
| getThreadHandler | found, not found |
| sendHandler | success, validation error, provider error |
| markAsReadHandler | success, partial failure |
| modifyLabelsHandler | add labels, remove labels, both |

## Success Criteria

- [ ] Each handler has 2+ test cases
- [ ] Uses layer() for shared test layer
- [ ] Tests error scenarios
- [ ] Uses strictEqual/isTrue (not expect)
- [ ] All tests pass
```

---

## 4. code-reviewer

Use for: Reviewing Effect pattern compliance, type safety, architecture boundaries.

### 4.1 Review Gmail Extensions

```markdown
## Review Target

`packages/shared/integrations/src/google/gmail/actions/create-draft/`
`packages/shared/integrations/src/google/gmail/actions/get-draft/`
`packages/shared/integrations/src/google/gmail/actions/list-drafts/`
`packages/shared/integrations/src/google/gmail/actions/send-draft/`
`packages/shared/integrations/src/google/gmail/actions/delete-draft/`

## Review Categories

- [x] effect-patterns
- [x] architecture
- [x] type-safety

## Review Checklist

### Effect Patterns (HIGH Priority)
- [ ] Namespace imports only (`import * as Effect from "effect/Effect"`)
- [ ] No async/await (use Effect.gen)
- [ ] PascalCase Schema constructors (`S.Struct`, not `S.struct`)
- [ ] Option for nullable values (`S.optionalWith(X, { as: "Option" })`)

### Architecture (HIGH Priority)
- [ ] File structure matches existing patterns (contract.ts, handler.ts, index.ts)
- [ ] Uses wrapGmailCall helper
- [ ] Uses GmailMethodError for errors
- [ ] Wrapper.implement pattern for handlers

### Type Safety (MEDIUM Priority)
- [ ] No `any` types
- [ ] No `@ts-ignore`
- [ ] All fields properly typed
- [ ] Schema decode for responses

## Expected Output

```markdown
# Code Review: Gmail Draft Operations

## Summary

| Category | Issues | H:M:L |
|----------|--------|-------|
| Effect Patterns | X | Y:Z:W |
| Architecture | X | Y:Z:W |
| Type Safety | X | Y:Z:W |

**Status**: PASS | NEEDS_WORK | CRITICAL

---

### Issue N: [Title]

**Severity**: HIGH | MEDIUM | LOW
**Location**: `file:line`

```typescript
// Problem
[code]
```

**Fix**:
```typescript
[corrected code]
```
```

## Success Criteria

- [ ] All HIGH priority issues identified
- [ ] File:line references for each issue
- [ ] Fix examples provided
- [ ] Status recommendation given
```

### 4.2 Review Comms Server RPC Handlers

```markdown
## Review Target

`packages/comms/server/src/rpc/v1/**/*.handler.ts`

## Review Categories

- [x] effect-patterns
- [x] architecture
- [x] type-safety

## Architecture-Specific Checks

### Layer Boundaries
- [ ] Handlers only use injected services (MailDriver, CommsDb)
- [ ] No direct database access (must go through repos)
- [ ] No direct Gmail/Outlook API calls (must go through MailDriver)

### Error Handling
- [ ] All errors are typed (S.TaggedError)
- [ ] Proper catchTag usage for known errors
- [ ] withSpan for observability

### Contract Compliance
- [ ] Handler signature matches contract
- [ ] Response matches Success schema
- [ ] All required fields populated

## Review Questions

1. Does each handler follow the single-responsibility principle?
2. Are all effects properly composed (no orphan effects)?
3. Is error handling exhaustive for each MailDriver method?
4. Are there any N+1 query patterns?

## Success Criteria

- [ ] All handlers reviewed
- [ ] Layer boundary violations identified
- [ ] Error handling gaps identified
- [ ] Performance issues flagged
- [ ] Status: PASS, NEEDS_WORK, or CRITICAL
```

---

## 5. domain-modeler

Use for: Designing EntityIds, M.Class models, schemas, value objects.

### 5.1 Create Connection Domain Model

```markdown
## Task

Create the Connection domain model for OAuth connections to email providers.

## Location

`packages/comms/domain/src/entities/connection/connection.model.ts`

## Requirements

1. Use M.Class from @effect/sql/Model
2. Use makeFields from @beep/shared-domain/common
3. Include audit fields (id, createdAt, updatedAt)
4. Mark tokens as sensitive (BS.FieldSensitiveOptionOmittable)
5. Use existing EmailProvider literal from mail.value.ts

## Schema Shape

| Field | Type | Notes |
|-------|------|-------|
| id | ConnectionId | Primary key |
| userId | UserId | Foreign key to IAM user |
| email | BS.Email | OAuth email |
| name | S.optional(S.String) | Display name |
| picture | S.optional(BS.URLString) | Avatar URL |
| accessToken | BS.FieldSensitiveOptionOmittable | OAuth access (sensitive!) |
| refreshToken | BS.FieldSensitiveOptionOmittable | OAuth refresh (sensitive!) |
| scope | S.String | OAuth scopes |
| providerId | EmailProvider | "google" | "microsoft" |
| expiresAt | S.Date | Token expiration |
| createdAt | S.Date | Audit |
| updatedAt | S.Date | Audit |

## Pattern

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { EmailProvider } from "../../value-objects/mail.value";

const $I = $CommsDomainId.create("entities/connection");

export class Model extends M.Class<Model>($I`ConnectionModel`)(
  makeFields(CommsEntityIds.ConnectionId, {
    userId: SharedEntityIds.UserId,
    email: BS.Email,
    name: BS.FieldOptionOmittable(S.String),
    picture: BS.FieldOptionOmittable(BS.URLString),
    accessToken: BS.FieldSensitiveOptionOmittable(S.String),
    refreshToken: BS.FieldSensitiveOptionOmittable(S.String),
    scope: S.String,
    providerId: EmailProvider,
    expiresAt: S.Date,
  }),
  $I.annotations("ConnectionModel", {
    description: "OAuth connection to email provider (Gmail/Outlook)",
  })
) {
  static readonly utils = modelKit(Model);
}
```

## Exports

```typescript
// connection/index.ts
export * as Connection from "./connection.model";
```

## Critical Rules

1. **Sensitive fields** - accessToken and refreshToken MUST use BS.FieldSensitiveOptionOmittable
2. **EntityIds** - MUST use branded EntityIds, not plain S.String
3. **makeFields** - Provides id, createdAt, updatedAt automatically
4. **modelKit** - Provides decode, encode, make utilities

## Verification

```bash
bun run check --filter @beep/comms-domain
```

## Success Criteria

- [ ] Model uses M.Class pattern
- [ ] All EntityIds are branded
- [ ] Tokens are marked sensitive
- [ ] Schema annotations included
- [ ] modelKit utilities exported
- [ ] Passes type check
```

### 5.2 Create Error Types

```markdown
## Task

Create typed error classes for the comms slice.

## Location

`packages/comms/domain/src/errors/index.ts`

## Required Errors

| Error | Fields | Usage |
|-------|--------|-------|
| ConnectionNotFoundError | connectionId | Connection lookup failure |
| ConnectionExpiredError | connectionId | OAuth token expired |
| ProviderApiError | provider, statusCode, message | Gmail/Outlook API failure |
| ThreadNotFoundError | threadId | Thread lookup failure |
| DraftNotFoundError | draftId | Draft lookup failure |
| LabelOperationError | operation, labelId?, message | Label CRUD failure |
| SendEmailError | reason, details? | Email send failure |
| AiServiceError | service, message | AI feature failure |

## Pattern

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("errors");

export class ConnectionNotFoundError extends S.TaggedError<ConnectionNotFoundError>()(
  "ConnectionNotFoundError",
  {
    connectionId: S.String,
  }
) {}

export class ProviderApiError extends S.TaggedError<ProviderApiError>()(
  "ProviderApiError",
  {
    provider: S.Literal("google", "microsoft"),
    statusCode: S.Number,
    message: S.String,
  }
) {}
```

## Critical Rules

1. **Use S.TaggedError** - Not Data.TaggedError or plain Error
2. **Unique _tag** - Each error has distinct tag for catchTag
3. **Include context** - Errors should include diagnostic fields
4. **No sensitive data** - Never include tokens/credentials in errors

## Error Handling Pattern

```typescript
// In handlers
Effect.gen(function* () {
  const thread = yield* driver.getThread(id);
  // ...
}).pipe(
  Effect.catchTag("ThreadNotFoundError", (e) =>
    Effect.fail(new RpcError({ code: "NOT_FOUND", message: `Thread ${e.threadId} not found` }))
  ),
  Effect.catchTag("ProviderApiError", (e) =>
    Effect.fail(new RpcError({ code: "INTERNAL", message: e.message }))
  )
);
```

## Success Criteria

- [ ] All 8 error types created
- [ ] Each uses S.TaggedError
- [ ] Each has unique _tag
- [ ] All exported from errors/index.ts
- [ ] Passes type check
```

### 5.3 Extend CommsEntityIds

```markdown
## Task

Add new EntityIds for email-related entities to CommsEntityIds.

## Location

`packages/shared/domain/src/entity-ids/comms/ids.ts`

## EntityIds to Add

| EntityId | Prefix | Brand |
|----------|--------|-------|
| ConnectionId | `comms_connection__` | ConnectionId |
| ThreadSummaryId | `comms_thread_summary__` | ThreadSummaryId |
| NoteId | `comms_note__` | NoteId |
| UserSettingsId | `comms_user_settings__` | UserSettingsId |
| UserHotkeysId | `comms_user_hotkeys__` | UserHotkeysId |

## Pattern

```typescript
import { EntityId } from "@beep/schema";

export const ConnectionId = EntityId.make("comms_connection", {
  brand: "ConnectionId",
  actions: ["create", "read", "update", "delete", "*"],
});

export const ThreadSummaryId = EntityId.make("comms_thread_summary", {
  brand: "ThreadSummaryId",
  actions: ["create", "read", "update", "delete", "*"],
});

// ... etc
```

## Export Pattern

```typescript
// entity-ids/comms/index.ts
export * as CommsEntityIds from "./ids";
export * as CommsTableNames from "./table-name";
```

## Usage in Domain Models

```typescript
// In connection.model.ts
import { CommsEntityIds } from "@beep/shared-domain";

export class Model extends M.Class<Model>($I`ConnectionModel`)(
  makeFields(CommsEntityIds.ConnectionId, {
    // id is automatically typed as ConnectionId.Type
  })
) {}
```

## Usage in Tables

```typescript
// In connection.table.ts
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";

export const connectionTable = Table.make(CommsEntityIds.ConnectionId)({
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),
  // ...
});
```

## Success Criteria

- [ ] All 5 EntityIds created
- [ ] Proper prefix format (slice_entity__)
- [ ] Actions defined for each
- [ ] Exported from CommsEntityIds namespace
- [ ] Passes type check
```

---

## 6. react-expert

Use for: P5 UI components with VM pattern, Effect-Atom state management.

### 6.1 Implement InboxView Component

```markdown
## Task

Create the InboxView component with VM pattern for email thread listing.

## Location

```
packages/comms/ui/src/components/InboxView/
  InboxView.tsx
  InboxView.vm.ts
  index.ts
```

## Requirements

1. VM owns all state and logic
2. Component is pure renderer
3. Use Data.TaggedEnum for state machines
4. Use Atom for reactive state
5. Actions return void (fire-and-forget)

## VM Interface

```typescript
// InboxView.vm.ts
import * as Atom from "@effect-atom/atom/Atom";
import { AtomRegistry } from "@effect-atom/atom/Registry";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Data from "effect/Data";

// UI-ready thread item (VM does ALL formatting)
export interface ThreadItem {
  readonly key: string;
  readonly from: string;           // "John Doe"
  readonly subject: string;
  readonly preview: string;        // First 100 chars
  readonly date: string;           // "Jan 15" or "2:30 PM"
  readonly isUnread: boolean;
  readonly hasAttachments: boolean;
  readonly isStarred: boolean;
}

// State machine
export type InboxState = Data.TaggedEnum<{
  Loading: {}
  Loaded: { threads: readonly ThreadItem[]; hasMore: boolean }
  Error: { message: string }
}>
export const InboxState = Data.taggedEnum<InboxState>();

export type Folder = "inbox" | "sent" | "drafts" | "starred" | "archive" | "spam" | "trash";

export interface InboxViewVM {
  readonly state$: Atom.Atom<InboxState>
  readonly selectedFolder$: Atom.Atom<Folder>
  readonly searchQuery$: Atom.Atom<string>
  readonly isRefreshing$: Atom.Atom<boolean>

  // Actions (return void!)
  readonly refresh: () => void
  readonly loadMore: () => void
  readonly selectFolder: (folder: Folder) => void
  readonly search: (query: string) => void
  readonly markAsRead: (threadIds: readonly string[]) => void
  readonly archive: (threadIds: readonly string[]) => void
  readonly deleteThreads: (threadIds: readonly string[]) => void
  readonly star: (threadId: string) => void
}

export const InboxViewVM = Context.GenericTag<InboxViewVM>("InboxViewVM");

const layer = Layer.effect(
  InboxViewVM,
  Effect.gen(function* () {
    const registry = yield* AtomRegistry;
    const mailClient = yield* Mail.Client;

    // State atoms
    const state$ = Atom.make<InboxState>(InboxState.Loading());
    const selectedFolder$ = Atom.make<Folder>("inbox");
    const searchQuery$ = Atom.make("");
    const isRefreshing$ = Atom.make(false);

    // Transform API response to UI-ready format
    const toThreadItem = (thread: Mail.Thread): ThreadItem => ({
      key: thread.id,
      from: thread.sender?.name ?? thread.sender?.email ?? "Unknown",
      subject: thread.subject ?? "(No subject)",
      preview: (thread.snippet ?? "").slice(0, 100),
      date: formatRelativeDate(thread.receivedAt),  // VM does formatting!
      isUnread: !thread.isRead,
      hasAttachments: (thread.attachments?.length ?? 0) > 0,
      isStarred: thread.isStarred ?? false,
    });

    const refresh = () => {
      Effect.runFork(/* fetch logic */);
    };

    // ... implement other actions

    return {
      state$, selectedFolder$, searchQuery$, isRefreshing$,
      refresh, loadMore, selectFolder, search, markAsRead, archive, deleteThreads, star
    };
  })
);

export default { tag: InboxViewVM, layer };
```

## Component Pattern

```typescript
// InboxView.tsx
"use client";

import { useVM } from "../../lib/VMRuntime";
import { useAtomValue } from "@effect-atom/atom-react";
import * as Result from "@effect-atom/atom/Result";
import InboxViewVM, { InboxState, type InboxViewVM as InboxViewVMType } from "./InboxView.vm";

// Child component receives VM as prop
function ThreadList({ vm }: { vm: InboxViewVMType }) {
  const state = useAtomValue(vm.state$);

  return InboxState.$match(state, {
    Loading: () => <Skeleton />,
    Error: ({ message }) => <ErrorDisplay message={message} onRetry={vm.refresh} />,
    Loaded: ({ threads, hasMore }) => (
      <>
        {threads.map((thread) => (
          <ThreadItem key={thread.key} item={thread} />
        ))}
        {hasMore && <LoadMoreButton onClick={vm.loadMore} />}
      </>
    ),
  });
}

// Parent owns VM
export default function InboxView() {
  const vmResult = useVM(InboxViewVM.tag, InboxViewVM.layer);

  return Result.match(vmResult, {
    onInitial: () => <Spinner />,
    onSuccess: ({ value: vm }) => <ThreadList vm={vm} />,
    onFailure: ({ cause }) => <Error cause={cause} />,
  });
}
```

## Critical Rules

1. **VM does ALL formatting** - dates, numbers, strings formatted in VM
2. **Component receives UI-ready values** - no Date objects, raw numbers
3. **Actions return void** - use Effect.runFork internally
4. **State machines use Data.TaggedEnum** - exhaustive matching
5. **No useEffect for side effects** - VM handles all effects
6. **No boolean props** - use composition pattern
7. **Child components receive VM as prop** - parent owns VM

## Verification

```bash
bun run check --filter @beep/comms-ui
```

## Success Criteria

- [ ] VM file has: interface, tag, layer, default export
- [ ] Component uses useVM hook
- [ ] State machine uses Data.TaggedEnum
- [ ] $match for exhaustive rendering
- [ ] All formatting in VM (not component)
- [ ] Actions return void
- [ ] No useEffect for data fetching
- [ ] Passes type check
```

### 6.2 Implement ComposeModal Component

```markdown
## Task

Create the ComposeModal component with AI-assisted composition.

## Location

```
packages/comms/ui/src/components/ComposeModal/
  ComposeModal.tsx
  ComposeModal.vm.ts
  index.ts
```

## VM Interface

```typescript
// ComposeModal.vm.ts

// Compose state machine
export type ComposeState = Data.TaggedEnum<{
  Editing: {}
  Saving: {}
  Sending: {}
  Sent: { messageId: string }
  Error: { message: string }
}>
export const ComposeState = Data.taggedEnum<ComposeState>();

// AI suggestion state
export type AiState = Data.TaggedEnum<{
  Idle: {}
  Generating: {}
  Suggestion: { content: string }
}>
export const AiState = Data.taggedEnum<AiState>();

export interface ComposeModalVM {
  // Form atoms
  readonly to$: Atom.Atom<string>
  readonly cc$: Atom.Atom<string>
  readonly bcc$: Atom.Atom<string>
  readonly subject$: Atom.Atom<string>
  readonly body$: Atom.Atom<string>
  readonly attachments$: Atom.Atom<readonly AttachmentItem[]>

  // UI state
  readonly state$: Atom.Atom<ComposeState>
  readonly aiState$: Atom.Atom<AiState>
  readonly showCcBcc$: Atom.Atom<boolean>

  // Derived (UI-ready)
  readonly canSend$: Atom.Atom<boolean>  // Computed from form validation

  // Actions
  readonly send: () => void
  readonly saveDraft: () => void
  readonly discard: () => void
  readonly addAttachment: (file: File) => void
  readonly removeAttachment: (key: string) => void
  readonly aiCompose: (prompt: string) => void
  readonly aiGenerateSubject: () => void
  readonly acceptAiSuggestion: () => void
  readonly rejectAiSuggestion: () => void
}
```

## Derived Atom Pattern

```typescript
// Derived atoms compute UI-ready values
const canSend$ = pipe(
  Atom.tuple(to$, subject$, body$),
  Atom.map(([to, subject, body]) =>
    to.trim().length > 0 &&
    subject.trim().length > 0 &&
    body.trim().length > 0
  )
);
```

## AI Integration Pattern

```typescript
const aiCompose = (prompt: string) => {
  registry.set(aiState$, AiState.Generating());

  Effect.runFork(
    Effect.gen(function* () {
      const response = yield* aiClient.compose({
        prompt,
        context: registry.get(body$) || undefined,
      });
      registry.set(aiState$, AiState.Suggestion({ content: response.content }));
    }).pipe(
      Effect.catchAll(() => Effect.sync(() => {
        registry.set(aiState$, AiState.Idle());
      }))
    )
  );
};

const acceptAiSuggestion = () => {
  const aiState = registry.get(aiState$);
  if (aiState._tag === "Suggestion") {
    registry.set(body$, aiState.content);
  }
  registry.set(aiState$, AiState.Idle());
};
```

## Component Rendering

```typescript
function AiSuggestionPanel({ vm }: { vm: ComposeModalVM }) {
  const aiState = useAtomValue(vm.aiState$);

  return AiState.$match(aiState, {
    Idle: () => null,
    Generating: () => <Spinner label="AI is thinking..." />,
    Suggestion: ({ content }) => (
      <Panel>
        <Preview>{content}</Preview>
        <Button onClick={vm.acceptAiSuggestion}>Accept</Button>
        <Button onClick={vm.rejectAiSuggestion}>Reject</Button>
      </Panel>
    ),
  });
}
```

## Success Criteria

- [ ] Two state machines (ComposeState, AiState)
- [ ] Derived canSend$ computed from inputs
- [ ] AI suggestion flow implemented
- [ ] All form state in atoms
- [ ] No useEffect for form handling
- [ ] Passes type check
```

---

## Usage Guide

### How to Use These Prompts

1. **Select the appropriate agent** based on the task type
2. **Copy the relevant prompt template** from this document
3. **Customize** if needed (add specific file paths, modify scope)
4. **Paste into a new agent session** (use Task tool or parallel agent)
5. **Review the output** and iterate if needed

### Agent Delegation Rules

From `specs/_guide/README.md`:

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (>3 files) | codebase-researcher | Sequential Glob/Read |
| Effect documentation lookup | mcp-researcher | Manual doc searching |
| Source code implementation | effect-code-writer | Writing .ts files |
| Test implementation | test-writer | Writing .test.ts files |
| Architecture validation | code-reviewer | Manual pattern checks |
| Domain modeling | domain-modeler | Creating models |
| UI components | react-expert | Creating VMs/components |

### Success Verification

After each agent completes work:

```bash
# Type check the affected packages
bun run check --filter @beep/comms-*

# Lint
bun run lint --filter @beep/comms-*

# Run tests
bun run test --filter @beep/comms-*
```

---

## References

| Document | Purpose |
|----------|---------|
| `specs/zero-email-port/README.md` | Spec overview |
| `specs/zero-email-port/MAPPING.md` | tRPC to Effect mapping |
| `specs/zero-email-port/phases/*.md` | Phase details |
| `.claude/rules/effect-patterns.md` | Effect coding rules |
| `.claude/agents/*.md` | Agent definitions |
| `specs/_guide/README.md` | Spec guide |
