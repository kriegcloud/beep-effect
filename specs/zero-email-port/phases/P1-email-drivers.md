# Phase 1: Email Provider Drivers

> Extend the existing Gmail integration and create a unified MailDriver abstraction for multi-provider support.

---

## Prerequisites

- P0 (Foundation) completed
- EntityIds and domain models exist
- Familiarity with existing `@beep/shared-integrations` Gmail implementation

---

## Overview

This phase builds on the **existing Gmail integration** at `packages/shared/integrations/src/google/gmail/` and creates a unified driver abstraction:

```
                      ┌─────────────────────────────────────────────────────────┐
                      │                     MailDriver                          │
                      │  (Abstract interface for email operations)              │
                      └───────────────┬─────────────────────────────────────────┘
                                      │
                              ┌───────┴───────┐
                              │               │
                      ┌───────▼───────┐ ┌─────▼───────┐
                      │  GmailDriver  │ │OutlookDriver│
                      │   (EXTEND)    │ │   (NEW)     │
                      └───────────────┘ └─────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼───────┐     │     ┌───────▼───────┐
        │   EXISTING    │     │     │   NEW OPS     │
        │  12 actions   │     │     │   (drafts,    │
        │  in Group     │     │     │    threads,   │
        └───────────────┘     │     │    mark r/w)  │
                              │     └───────────────┘
                              │
                      packages/shared/integrations/
                        src/google/gmail/
```

---

## Existing Gmail Integration Reference

**Location**: `packages/shared/integrations/src/google/gmail/`

### Already Implemented (12 Operations)

| Category | Operation | Description |
|----------|-----------|-------------|
| **Email** | `SendEmail` | Send with cc, bcc, attachments |
| **Email** | `ListEmails` | List with query filtering (maxResults: 10) |
| **Email** | `GetEmail` | Get single email with full body |
| **Email** | `SearchEmails` | Search with query string |
| **Email** | `ModifyEmail` | Add/remove labels on single email |
| **Email** | `BatchModify` | Add/remove labels on multiple emails |
| **Email** | `TrashEmail` | Move to trash |
| **Email** | `DeleteEmail` | Permanent delete |
| **Label** | `CreateLabel` | Create with color/visibility |
| **Label** | `ListLabels` | List all user labels |
| **Label** | `UpdateLabel` | Update properties |
| **Label** | `DeleteLabel` | Delete label |

### Core Patterns in Use

**GmailClient Context.Tag** (`common/GmailClient.ts`):
```typescript
type GmailClientShape = {
  client: Gmail.gmail_v1.Gmail;
};
export class GmailClient extends Context.Tag($I`GmailClient`)<GmailClient, GmailClientShape>() {}
```

**WrapperGroup Layer** (`actions/layer.ts`):
```typescript
export const Group = Wrap.WrapperGroup.make(
  BatchModify.Wrapper,
  CreateLabel.Wrapper,
  DeleteEmail.Wrapper,
  // ... 12 total wrappers
);

export const layer = Group.toLayer({
  BatchModify: BatchModify.Handler,
  CreateLabel: CreateLabel.Handler,
  // ... all handlers
});
```

**wrapGmailCall Pattern** (`common/wrap-gmail-call.ts`):
```typescript
export const wrapGmailCall = Effect.fn("wrapGmailCall")(
  function* <A>(params: WrapGmailCallParams<A>) {
    const { client } = yield* GmailClient;
    return yield* Effect.tryPromise({
      try: () => params.operation(client),
      catch: GmailMethodError.fromUnknown(params.failureMessage),
    });
  },
  Effect.tapErrorCause((cause) => F.pipe(cause, Cause.pretty, Effect.logError))
);
```

**Error Types** (`errors.ts`):
- `GmailOperationError` - General API failures (with optional status code)
- `GmailAuthenticationError` - 401, invalid_grant, invalid_token
- `GmailMethodError` - Union of operation and auth errors with `fromUnknown` factory

**Email Model** (`models/email.ts`):
```typescript
export class Email extends S.Class<Email>($I`Email`)({
  id: S.String,
  threadId: S.String,
  subject: S.String,
  from: S.String,
  to: S.Array(S.String),
  cc: S.optionalWith(S.Array(S.String), { as: "Option" }),
  bcc: S.optionalWith(S.Array(S.String), { as: "Option" }),
  date: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { as: "Option" }),
  snippet: S.String,
  body: S.optionalWith(S.String, { as: "Option" }),
  labels: S.optionalWith(S.Array(S.String), { as: "Option" }),
  attachments: S.optionalWith(S.Array(EmailAttachment), { as: "Option" }),
}) {}
```

### Gaps to Fill for Zero

| Gap | Priority | Description |
|-----|----------|-------------|
| Draft Management | High | `CreateDraft`, `GetDraft`, `ListDrafts`, `SendDraft`, `DeleteDraft` |
| Thread Operations | High | `GetThread`, `ListThreads` (not just messages) |
| Mark Operations | High | `MarkAsRead`, `MarkAsUnread` (use BatchModify internally) |
| Archive | Medium | `ArchiveEmail` (remove INBOX label) |
| Attachment Download | Medium | Get attachment body (currently metadata only) |
| Watch/Push | Low | Gmail push notification webhooks |
| Email Aliases | Low | Get send-as aliases |

---

## Tasks

### Task 1.1: Add Missing Gmail Operations

Extend the existing Gmail integration with new operations following the established patterns.

**Directory**: `packages/shared/integrations/src/google/gmail/actions/`

#### 1.1.1: Create Draft

**Files**:
- `create-draft/contract.ts`
- `create-draft/handler.ts`
- `create-draft/index.ts`
- `create-draft/mod.ts`

```typescript
// create-draft/contract.ts
import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/create-draft/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  to: S.Array(S.String),
  cc: S.optionalWith(S.Array(S.String), { as: "Option" }),
  bcc: S.optionalWith(S.Array(S.String), { as: "Option" }),
  subject: S.optionalWith(S.String, { as: "Option" }),
  body: S.optionalWith(S.String, { as: "Option" }),
  threadId: S.optionalWith(S.String, { as: "Option" }),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  id: S.String,
  message: S.Struct({
    id: S.String,
    threadId: S.String,
  }),
}) {}

export const Wrapper = Wrap.Wrapper.make("CreateDraft", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

```typescript
// create-draft/handler.ts
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { buildRawEmail } from "../../common/build-raw-email.ts";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(function* (payload) {
    const raw = buildRawEmail({
      to: payload.to,
      cc: O.getOrUndefined(payload.cc),
      bcc: O.getOrUndefined(payload.bcc),
      subject: O.getOrUndefined(payload.subject) ?? "",
      body: O.getOrUndefined(payload.body) ?? "",
    });

    const response = yield* wrapGmailCall({
      operation: (client) =>
        client.users.drafts.create({
          userId: "me",
          requestBody: {
            message: {
              raw,
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

#### 1.1.2: Get Draft

**Files**:
- `get-draft/contract.ts`
- `get-draft/handler.ts`
- `get-draft/index.ts`
- `get-draft/mod.ts`

```typescript
// get-draft/contract.ts
import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/get-draft/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  draftId: S.String,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  id: S.String,
  message: Models.Email,
}) {}

export const Wrapper = Wrap.Wrapper.make("GetDraft", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

```typescript
// get-draft/handler.ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, Wrapper } from "./contract";

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

    const email = Models.parseMessageToEmail(response.data.message, true);

    return yield* S.decode(Success)({
      id: response.data.id ?? "",
      message: email,
    });
  })
);
```

#### 1.1.3: List Drafts

**Files**:
- `list-drafts/contract.ts`
- `list-drafts/handler.ts`
- `list-drafts/index.ts`
- `list-drafts/mod.ts`

```typescript
// list-drafts/contract.ts
import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/list-drafts/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  maxResults: S.optionalWith(S.Number, { default: () => 20 }),
  pageToken: S.optionalWith(S.String, { as: "Option" }),
  q: S.optionalWith(S.String, { as: "Option" }),
}) {}

export class DraftSummary extends S.Class<DraftSummary>($I`DraftSummary`)({
  id: S.String,
  messageId: S.String,
  threadId: S.String,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  drafts: S.Array(DraftSummary),
  nextPageToken: S.optionalWith(S.String, { as: "Option" }),
  resultSizeEstimate: S.optionalWith(S.Number, { as: "Option" }),
}) {}

export const Wrapper = Wrap.Wrapper.make("ListDrafts", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

#### 1.1.4: Send Draft

**Files**:
- `send-draft/contract.ts`
- `send-draft/handler.ts`
- `send-draft/index.ts`
- `send-draft/mod.ts`

```typescript
// send-draft/contract.ts
import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/send-draft/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  draftId: S.String,
}) {}

export class Success extends Models.Email.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", { description: "SendDraft success response." })
) {}

export const Wrapper = Wrap.Wrapper.make("SendDraft", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

#### 1.1.5: Delete Draft

**Files**:
- `delete-draft/contract.ts`
- `delete-draft/handler.ts`
- `delete-draft/index.ts`
- `delete-draft/mod.ts`

```typescript
// delete-draft/contract.ts
import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/delete-draft/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  draftId: S.String,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  deleted: S.Boolean,
}) {}

export const Wrapper = Wrap.Wrapper.make("DeleteDraft", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

#### 1.1.6: Get Thread

**Files**:
- `get-thread/contract.ts`
- `get-thread/handler.ts`
- `get-thread/index.ts`
- `get-thread/mod.ts`

```typescript
// get-thread/contract.ts
import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/get-thread/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  threadId: S.String,
  format: S.optionalWith(S.Literal("full", "metadata", "minimal"), { default: () => "full" as const }),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  id: S.String,
  historyId: S.optionalWith(S.String, { as: "Option" }),
  messages: S.Array(Models.Email),
}) {}

export const Wrapper = Wrap.Wrapper.make("GetThread", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

```typescript
// get-thread/handler.ts
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(function* (payload) {
    const response = yield* wrapGmailCall({
      operation: (client) =>
        client.users.threads.get({
          userId: "me",
          id: payload.threadId,
          format: payload.format,
        }),
      failureMessage: "Failed to get thread",
    });

    const messages = A.map(response.data.messages ?? [], (msg) =>
      Models.parseMessageToEmail(msg, payload.format === "full")
    );

    return yield* S.decode(Success)({
      id: response.data.id ?? "",
      historyId: O.fromNullable(response.data.historyId),
      messages,
    });
  })
);
```

#### 1.1.7: List Threads

**Files**:
- `list-threads/contract.ts`
- `list-threads/handler.ts`
- `list-threads/index.ts`
- `list-threads/mod.ts`

```typescript
// list-threads/contract.ts
import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/list-threads/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  maxResults: S.optionalWith(S.Number, { default: () => 20 }),
  pageToken: S.optionalWith(S.String, { as: "Option" }),
  q: S.optionalWith(S.String, { as: "Option" }),
  labelIds: S.optionalWith(S.Array(S.String), { as: "Option" }),
  includeSpamTrash: S.optionalWith(S.Boolean, { default: () => false }),
}) {}

export class ThreadSummary extends S.Class<ThreadSummary>($I`ThreadSummary`)({
  id: S.String,
  historyId: S.optionalWith(S.String, { as: "Option" }),
  snippet: S.optionalWith(S.String, { as: "Option" }),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  threads: S.Array(ThreadSummary),
  nextPageToken: S.optionalWith(S.String, { as: "Option" }),
  resultSizeEstimate: S.optionalWith(S.Number, { as: "Option" }),
}) {}

export const Wrapper = Wrap.Wrapper.make("ListThreads", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

#### 1.1.8: Mark As Read / Mark As Unread

These can be implemented using the existing `BatchModify` operation internally.

**Files**:
- `mark-as-read/contract.ts`
- `mark-as-read/handler.ts`
- `mark-as-unread/contract.ts`
- `mark-as-unread/handler.ts`

```typescript
// mark-as-read/contract.ts
import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/mark-as-read/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  messageIds: S.Array(S.String),
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  modifiedCount: S.Number,
}) {}

export const Wrapper = Wrap.Wrapper.make("MarkAsRead", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

```typescript
// mark-as-read/handler.ts
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(function* (payload) {
    // Use batchModify to remove UNREAD label
    yield* wrapGmailCall({
      operation: (client) =>
        client.users.messages.batchModify({
          userId: "me",
          requestBody: {
            ids: payload.messageIds as string[],
            removeLabelIds: ["UNREAD"],
          },
        }),
      failureMessage: "Failed to mark messages as read",
    });

    return yield* S.decode(Success)({
      modifiedCount: A.length(payload.messageIds),
    });
  })
);
```

#### 1.1.9: Get Attachment

**Files**:
- `get-attachment/contract.ts`
- `get-attachment/handler.ts`
- `get-attachment/index.ts`
- `get-attachment/mod.ts`

```typescript
// get-attachment/contract.ts
import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/get-attachment/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)({
  messageId: S.String,
  attachmentId: S.String,
}) {}

export class Success extends S.Class<Success>($I`Success`)({
  data: S.String, // Base64 encoded
  size: S.Number,
}) {}

export const Wrapper = Wrap.Wrapper.make("GetAttachment", {
  payload: PayloadFrom,
  success: Success,
  error: GmailMethodError,
});
```

### Task 1.2: Update Gmail WrapperGroup

**File**: `packages/shared/integrations/src/google/gmail/actions/layer.ts`

Update the Group to include all new operations:

```typescript
import { Wrap } from "@beep/wrap";
// Existing imports
import { BatchModify } from "./batch-modify";
import { CreateLabel } from "./create-label";
import { DeleteEmail } from "./delete-email";
import { DeleteLabel } from "./delete-label";
import { GetEmail } from "./get-email";
import { ListEmails } from "./list-emails";
import { ListLabels } from "./list-labels";
import { ModifyEmail } from "./modify-email";
import { SearchEmails } from "./search-emails";
import { SendEmail } from "./send-email";
import { TrashEmail } from "./trash-email";
import { UpdateLabel } from "./update-label";
// NEW imports
import { CreateDraft } from "./create-draft";
import { DeleteDraft } from "./delete-draft";
import { GetAttachment } from "./get-attachment";
import { GetDraft } from "./get-draft";
import { GetThread } from "./get-thread";
import { ListDrafts } from "./list-drafts";
import { ListThreads } from "./list-threads";
import { MarkAsRead } from "./mark-as-read";
import { MarkAsUnread } from "./mark-as-unread";
import { SendDraft } from "./send-draft";

export const Group = Wrap.WrapperGroup.make(
  // Existing operations
  BatchModify.Wrapper,
  CreateLabel.Wrapper,
  DeleteEmail.Wrapper,
  DeleteLabel.Wrapper,
  GetEmail.Wrapper,
  ListEmails.Wrapper,
  ListLabels.Wrapper,
  ModifyEmail.Wrapper,
  SendEmail.Wrapper,
  SearchEmails.Wrapper,
  TrashEmail.Wrapper,
  UpdateLabel.Wrapper,
  // NEW operations
  CreateDraft.Wrapper,
  DeleteDraft.Wrapper,
  GetAttachment.Wrapper,
  GetDraft.Wrapper,
  GetThread.Wrapper,
  ListDrafts.Wrapper,
  ListThreads.Wrapper,
  MarkAsRead.Wrapper,
  MarkAsUnread.Wrapper,
  SendDraft.Wrapper
);

export const layer = Group.toLayer({
  // Existing handlers
  BatchModify: BatchModify.Handler,
  CreateLabel: CreateLabel.Handler,
  DeleteEmail: DeleteEmail.Handler,
  DeleteLabel: DeleteLabel.Handler,
  GetEmail: GetEmail.Handler,
  ListEmails: ListEmails.Handler,
  ListLabels: ListLabels.Handler,
  ModifyEmail: ModifyEmail.Handler,
  SearchEmails: SearchEmails.Handler,
  SendEmail: SendEmail.Handler,
  TrashEmail: TrashEmail.Handler,
  UpdateLabel: UpdateLabel.Handler,
  // NEW handlers
  CreateDraft: CreateDraft.Handler,
  DeleteDraft: DeleteDraft.Handler,
  GetAttachment: GetAttachment.Handler,
  GetDraft: GetDraft.Handler,
  GetThread: GetThread.Handler,
  ListDrafts: ListDrafts.Handler,
  ListThreads: ListThreads.Handler,
  MarkAsRead: MarkAsRead.Handler,
  MarkAsUnread: MarkAsUnread.Handler,
  SendDraft: SendDraft.Handler,
});
```

---

### Task 1.3: Define MailDriver Interface

Create a provider-agnostic abstraction that wraps provider-specific implementations.

**File**: `packages/comms/server/src/services/mail/MailDriver.ts`

```typescript
import { $CommsServerId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $CommsServerId.create("services/mail/MailDriver");

// ============================================================================
// Domain Types for MailDriver
// ============================================================================

export class EmailProvider extends S.Literal("google", "microsoft").annotations(
  $I.annotations("EmailProvider", { description: "Supported email providers" })
) {}
export type EmailProvider = S.Schema.Type<typeof EmailProvider>;

export class ThreadSummary extends S.Class<ThreadSummary>($I`ThreadSummary`)({
  id: S.String,
  historyId: S.optionalWith(S.String, { as: "Option" }),
}) {}

export class ThreadsResponse extends S.Class<ThreadsResponse>($I`ThreadsResponse`)({
  threads: S.Array(ThreadSummary),
  nextPageToken: S.optionalWith(S.String, { as: "Option" }),
}) {}

export class ParsedMessage extends S.Class<ParsedMessage>($I`ParsedMessage`)({
  id: S.String,
  threadId: S.String,
  subject: S.String,
  from: S.String,
  to: S.Array(S.String),
  cc: S.optionalWith(S.Array(S.String), { as: "Option" }),
  bcc: S.optionalWith(S.Array(S.String), { as: "Option" }),
  date: S.optionalWith(S.Date, { as: "Option" }),
  snippet: S.String,
  body: S.optionalWith(S.String, { as: "Option" }),
  labels: S.optionalWith(S.Array(S.String), { as: "Option" }),
  unread: S.Boolean,
}) {}

export class ThreadResponse extends S.Class<ThreadResponse>($I`ThreadResponse`)({
  messages: S.Array(ParsedMessage),
  latest: S.optionalWith(ParsedMessage, { as: "Option" }),
  hasUnread: S.Boolean,
  totalReplies: S.Number,
  labels: S.Array(S.Struct({ id: S.String, name: S.String })),
}) {}

export class DraftData extends S.Class<DraftData>($I`DraftData`)({
  to: S.Array(S.Struct({ email: S.String, name: S.optionalWith(S.String, { as: "Option" }) })),
  cc: S.optionalWith(S.Array(S.Struct({ email: S.String, name: S.optionalWith(S.String, { as: "Option" }) })), { as: "Option" }),
  bcc: S.optionalWith(S.Array(S.Struct({ email: S.String, name: S.optionalWith(S.String, { as: "Option" }) })), { as: "Option" }),
  subject: S.optionalWith(S.String, { as: "Option" }),
  body: S.optionalWith(S.String, { as: "Option" }),
  threadId: S.optionalWith(S.String, { as: "Option" }),
}) {}

export class SendResult extends S.Class<SendResult>($I`SendResult`)({
  id: S.optionalWith(S.String, { as: "Option" }),
  success: S.Boolean,
}) {}

export class Label extends S.Class<Label>($I`Label`)({
  id: S.String,
  name: S.String,
  color: S.optionalWith(S.Struct({
    backgroundColor: S.String,
    textColor: S.String,
  }), { as: "Option" }),
}) {}

// ============================================================================
// Error Types
// ============================================================================

export class ProviderApiError extends S.TaggedError<ProviderApiError>($I`ProviderApiError`)(
  "ProviderApiError",
  {
    provider: EmailProvider,
    statusCode: S.optionalWith(S.Number, { as: "Option" }),
    message: S.String,
  }
) {}

export class ThreadNotFoundError extends S.TaggedError<ThreadNotFoundError>($I`ThreadNotFoundError`)(
  "ThreadNotFoundError",
  {
    threadId: S.String,
  }
) {}

export class DraftNotFoundError extends S.TaggedError<DraftNotFoundError>($I`DraftNotFoundError`)(
  "DraftNotFoundError",
  {
    draftId: S.String,
  }
) {}

// ============================================================================
// MailDriver Interface
// ============================================================================

export interface MailDriver {
  readonly provider: EmailProvider;

  // Thread operations
  readonly listThreads: (params: {
    readonly folder?: string;
    readonly query?: string;
    readonly maxResults?: number;
    readonly labelIds?: ReadonlyArray<string>;
    readonly pageToken?: string;
  }) => Effect.Effect<ThreadsResponse, ProviderApiError>;

  readonly getThread: (
    id: string
  ) => Effect.Effect<ThreadResponse, ThreadNotFoundError | ProviderApiError>;

  // Message operations
  readonly sendMail: (data: {
    to: ReadonlyArray<string>;
    cc?: ReadonlyArray<string>;
    bcc?: ReadonlyArray<string>;
    subject: string;
    body: string;
    threadId?: string;
  }) => Effect.Effect<SendResult, ProviderApiError>;

  readonly getAttachment: (
    messageId: string,
    attachmentId: string
  ) => Effect.Effect<O.Option<string>, ProviderApiError>;

  // Draft operations
  readonly createDraft: (
    data: DraftData
  ) => Effect.Effect<{ id: string }, ProviderApiError>;

  readonly getDraft: (
    id: string
  ) => Effect.Effect<DraftData & { id: string }, DraftNotFoundError | ProviderApiError>;

  readonly listDrafts: (params: {
    q?: string;
    maxResults?: number;
    pageToken?: string;
  }) => Effect.Effect<ThreadsResponse, ProviderApiError>;

  readonly deleteDraft: (
    id: string
  ) => Effect.Effect<void, ProviderApiError>;

  readonly sendDraft: (
    id: string
  ) => Effect.Effect<SendResult, ProviderApiError>;

  // Label operations
  readonly getUserLabels: () => Effect.Effect<ReadonlyArray<Label>, ProviderApiError>;

  readonly createLabel: (label: {
    name: string;
    color?: { backgroundColor: string; textColor: string };
  }) => Effect.Effect<Label, ProviderApiError>;

  readonly deleteLabel: (
    id: string
  ) => Effect.Effect<void, ProviderApiError>;

  readonly modifyLabels: (
    messageIds: ReadonlyArray<string>,
    options: { addLabels: ReadonlyArray<string>; removeLabels: ReadonlyArray<string> }
  ) => Effect.Effect<void, ProviderApiError>;

  // Read/unread operations
  readonly markAsRead: (
    messageIds: ReadonlyArray<string>
  ) => Effect.Effect<void, ProviderApiError>;

  readonly markAsUnread: (
    messageIds: ReadonlyArray<string>
  ) => Effect.Effect<void, ProviderApiError>;
}

export class MailDriver extends Context.Tag($I`MailDriver`)<MailDriver, MailDriver>() {}
```

---

### Task 1.4: Implement Gmail MailDriver Adapter

Create an adapter that wraps the existing Gmail WrapperGroup into the MailDriver interface.

**File**: `packages/comms/server/src/services/mail/drivers/GmailDriverAdapter.ts`

```typescript
import { $CommsServerId } from "@beep/identity/packages";
import { GmailActions } from "@beep/shared-integrations/google/gmail";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import {
  DraftNotFoundError,
  MailDriver,
  ProviderApiError,
  ThreadNotFoundError,
} from "../MailDriver";

const $I = $CommsServerId.create("services/mail/drivers/GmailDriverAdapter");

// Helper to convert Gmail errors to ProviderApiError
const toProviderError = (err: unknown): ProviderApiError =>
  new ProviderApiError({
    provider: "google",
    statusCode: O.none(),
    message: err instanceof Error ? err.message : String(err),
  });

export const GmailDriverAdapterLive = Layer.effect(
  MailDriver,
  Effect.gen(function* () {
    // Get the Gmail WrapperGroup services
    const gmail = yield* GmailActions.Group.Tag;

    return {
      provider: "google" as const,

      listThreads: (params) =>
        gmail.ListThreads({
          maxResults: params.maxResults ?? 20,
          pageToken: O.fromNullable(params.pageToken),
          q: O.fromNullable(params.query),
          labelIds: O.fromNullable(params.labelIds),
          includeSpamTrash: false,
        }).pipe(
          Effect.map((result) => ({
            threads: A.map(result.threads, (t) => ({
              id: t.id,
              historyId: t.historyId,
            })),
            nextPageToken: result.nextPageToken,
          })),
          Effect.mapError(toProviderError)
        ),

      getThread: (id) =>
        gmail.GetThread({
          threadId: id,
          format: "full",
        }).pipe(
          Effect.map((result) => ({
            messages: A.map(result.messages, (m) => ({
              id: m.id,
              threadId: m.threadId,
              subject: m.subject,
              from: m.from,
              to: m.to,
              cc: m.cc,
              bcc: m.bcc,
              date: m.date,
              snippet: m.snippet,
              body: m.body,
              labels: m.labels,
              unread: O.getOrElse(m.labels, () => []).includes("UNREAD"),
            })),
            latest: A.last(result.messages).pipe(
              O.map((m) => ({
                ...m,
                unread: O.getOrElse(m.labels, () => []).includes("UNREAD"),
              }))
            ),
            hasUnread: A.some(result.messages, (m) =>
              O.getOrElse(m.labels, () => []).includes("UNREAD")
            ),
            totalReplies: A.length(result.messages),
            labels: [],
          })),
          Effect.catchTag("GmailOperationError", (err) =>
            err.status === 404
              ? Effect.fail(new ThreadNotFoundError({ threadId: id }))
              : Effect.fail(toProviderError(err))
          ),
          Effect.mapError(toProviderError)
        ),

      sendMail: (data) =>
        gmail.SendEmail({
          to: data.to as string[],
          cc: data.cc as string[] | undefined,
          bcc: data.bcc as string[] | undefined,
          subject: data.subject,
          body: data.body,
        }).pipe(
          Effect.map((result) => ({
            id: O.fromNullable(result.id),
            success: true,
          })),
          Effect.mapError(toProviderError)
        ),

      getAttachment: (messageId, attachmentId) =>
        gmail.GetAttachment({
          messageId,
          attachmentId,
        }).pipe(
          Effect.map((result) => O.some(result.data)),
          Effect.mapError(toProviderError)
        ),

      createDraft: (data) =>
        gmail.CreateDraft({
          to: A.map(data.to, (r) => r.email),
          cc: O.map(data.cc, A.map((r) => r.email)),
          bcc: O.map(data.bcc, A.map((r) => r.email)),
          subject: data.subject,
          body: data.body,
          threadId: data.threadId,
        }).pipe(
          Effect.map((result) => ({ id: result.id })),
          Effect.mapError(toProviderError)
        ),

      getDraft: (id) =>
        gmail.GetDraft({ draftId: id }).pipe(
          Effect.map((result) => ({
            id: result.id,
            to: A.map(result.message.to, (email) => ({ email, name: O.none() })),
            cc: O.map(result.message.cc, A.map((email) => ({ email, name: O.none() }))),
            bcc: O.map(result.message.bcc, A.map((email) => ({ email, name: O.none() }))),
            subject: O.fromNullable(result.message.subject),
            body: result.message.body,
            threadId: O.some(result.message.threadId),
          })),
          Effect.catchTag("GmailOperationError", (err) =>
            err.status === 404
              ? Effect.fail(new DraftNotFoundError({ draftId: id }))
              : Effect.fail(toProviderError(err))
          ),
          Effect.mapError(toProviderError)
        ),

      listDrafts: (params) =>
        gmail.ListDrafts({
          maxResults: params.maxResults ?? 20,
          pageToken: O.fromNullable(params.pageToken),
          q: O.fromNullable(params.q),
        }).pipe(
          Effect.map((result) => ({
            threads: A.map(result.drafts, (d) => ({
              id: d.id,
              historyId: O.none(),
            })),
            nextPageToken: result.nextPageToken,
          })),
          Effect.mapError(toProviderError)
        ),

      deleteDraft: (id) =>
        gmail.DeleteDraft({ draftId: id }).pipe(
          Effect.asVoid,
          Effect.mapError(toProviderError)
        ),

      sendDraft: (id) =>
        gmail.SendDraft({ draftId: id }).pipe(
          Effect.map((result) => ({
            id: O.fromNullable(result.id),
            success: true,
          })),
          Effect.mapError(toProviderError)
        ),

      getUserLabels: () =>
        gmail.ListLabels({}).pipe(
          Effect.map((result) =>
            A.map(result.labels, (l) => ({
              id: l.id,
              name: l.name,
              color: l.color,
            }))
          ),
          Effect.mapError(toProviderError)
        ),

      createLabel: (label) =>
        gmail.CreateLabel({
          name: label.name,
          backgroundColor: label.color?.backgroundColor,
          textColor: label.color?.textColor,
        }).pipe(
          Effect.map((result) => ({
            id: result.id,
            name: result.name,
            color: O.fromNullable(result.color),
          })),
          Effect.mapError(toProviderError)
        ),

      deleteLabel: (id) =>
        gmail.DeleteLabel({ labelId: id }).pipe(
          Effect.asVoid,
          Effect.mapError(toProviderError)
        ),

      modifyLabels: (messageIds, options) =>
        gmail.BatchModify({
          ids: messageIds as string[],
          addLabelIds: options.addLabels as string[],
          removeLabelIds: options.removeLabels as string[],
        }).pipe(
          Effect.asVoid,
          Effect.mapError(toProviderError)
        ),

      markAsRead: (messageIds) =>
        gmail.MarkAsRead({ messageIds: messageIds as string[] }).pipe(
          Effect.asVoid,
          Effect.mapError(toProviderError)
        ),

      markAsUnread: (messageIds) =>
        gmail.MarkAsUnread({ messageIds: messageIds as string[] }).pipe(
          Effect.asVoid,
          Effect.mapError(toProviderError)
        ),
    };
  })
);

// Compose with Gmail dependencies
export const GmailDriverLive = GmailDriverAdapterLive.pipe(
  Layer.provide(GmailActions.layer)
);
```

---

### Task 1.5: Implement Microsoft Outlook Driver (NEW)

Create a new Outlook driver using Microsoft Graph API.

**File**: `packages/comms/server/src/services/mail/drivers/OutlookDriver.ts`

```typescript
import { $CommsServerId } from "@beep/identity/packages";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import {
  DraftNotFoundError,
  MailDriver,
  ProviderApiError,
  ThreadNotFoundError,
} from "../MailDriver";

const $I = $CommsServerId.create("services/mail/drivers/OutlookDriver");

const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0";

// ============================================================================
// Outlook Client Context
// ============================================================================

interface OutlookClientShape {
  readonly accessToken: Redacted.Redacted<string>;
}

export class OutlookClient extends Context.Tag($I`OutlookClient`)<OutlookClient, OutlookClientShape>() {}

// ============================================================================
// Graph API Response Schemas
// ============================================================================

const GraphMessageSchema = S.Struct({
  id: S.String,
  conversationId: S.String,
  subject: S.optionalWith(S.String, { nullable: true }),
  from: S.optionalWith(S.Struct({
    emailAddress: S.Struct({
      name: S.optionalWith(S.String, { nullable: true }),
      address: S.String,
    }),
  }), { nullable: true }),
  toRecipients: S.optionalWith(S.Array(S.Struct({
    emailAddress: S.Struct({
      name: S.optionalWith(S.String, { nullable: true }),
      address: S.String,
    }),
  })), { nullable: true }),
  ccRecipients: S.optionalWith(S.Array(S.Struct({
    emailAddress: S.Struct({
      name: S.optionalWith(S.String, { nullable: true }),
      address: S.String,
    }),
  })), { nullable: true }),
  bodyPreview: S.optionalWith(S.String, { nullable: true }),
  body: S.optionalWith(S.Struct({
    contentType: S.String,
    content: S.String,
  }), { nullable: true }),
  isRead: S.Boolean,
  receivedDateTime: S.optionalWith(S.String, { nullable: true }),
  categories: S.optionalWith(S.Array(S.String), { nullable: true }),
});

const GraphMessagesResponse = S.Struct({
  value: S.Array(GraphMessageSchema),
  "@odata.nextLink": S.optionalWith(S.String, { nullable: true }),
});

// ============================================================================
// Helper Functions
// ============================================================================

const graphRequest = <A>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    params?: Record<string, string | number | undefined>;
  }
) =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const { accessToken } = yield* OutlookClient;

    let url = `${GRAPH_API_BASE}${path}`;

    if (options?.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const paramStr = searchParams.toString();
      if (paramStr) {
        url = `${url}?${paramStr}`;
      }
    }

    let request = HttpClientRequest.make(options?.method ?? "GET")(url).pipe(
      HttpClientRequest.bearerToken(Redacted.value(accessToken)),
      HttpClientRequest.setHeader("Content-Type", "application/json")
    );

    if (options?.body) {
      request = HttpClientRequest.jsonBody(request, options.body);
    }

    const response = yield* httpClient.execute(request);

    if (!HttpClientResponse.isSuccess(response)) {
      return yield* Effect.fail(
        new ProviderApiError({
          provider: "microsoft",
          statusCode: O.some(response.status),
          message: `Graph API error: ${response.status}`,
        })
      );
    }

    if (options?.method === "DELETE") {
      return undefined as A;
    }

    return (yield* HttpClientResponse.json(response)) as A;
  });

// ============================================================================
// Outlook Driver Implementation
// ============================================================================

export const OutlookDriverLive = Layer.effect(
  MailDriver,
  Effect.gen(function* () {
    return {
      provider: "microsoft" as const,

      listThreads: (params) =>
        Effect.gen(function* () {
          const response = yield* graphRequest<S.Schema.Type<typeof GraphMessagesResponse>>(
            "/me/messages",
            {
              params: {
                $top: params.maxResults ?? 20,
                $skip: params.pageToken ? parseInt(params.pageToken) : undefined,
                $filter: params.query,
                $orderby: "receivedDateTime desc",
                $select: "id,conversationId,subject,from,bodyPreview,isRead,receivedDateTime",
              },
            }
          );

          // Group by conversationId to simulate threads
          const threadMap = new Map<string, { id: string; historyId: O.Option<string> }>();
          for (const msg of response.value) {
            if (!threadMap.has(msg.conversationId)) {
              threadMap.set(msg.conversationId, {
                id: msg.conversationId,
                historyId: O.none(),
              });
            }
          }

          const nextLink = response["@odata.nextLink"];
          const nextPageToken = nextLink
            ? O.some(String(parseInt(params.pageToken ?? "0") + (params.maxResults ?? 20)))
            : O.none();

          return {
            threads: Array.from(threadMap.values()),
            nextPageToken,
          };
        }),

      getThread: (id) =>
        Effect.gen(function* () {
          const response = yield* graphRequest<S.Schema.Type<typeof GraphMessagesResponse>>(
            "/me/messages",
            {
              params: {
                $filter: `conversationId eq '${id}'`,
                $orderby: "receivedDateTime asc",
              },
            }
          );

          if (A.isEmptyReadonlyArray(response.value)) {
            return yield* Effect.fail(new ThreadNotFoundError({ threadId: id }));
          }

          const messages = A.map(response.value, (msg) => ({
            id: msg.id,
            threadId: msg.conversationId,
            subject: msg.subject ?? "",
            from: msg.from?.emailAddress.address ?? "",
            to: A.map(msg.toRecipients ?? [], (r) => r.emailAddress.address),
            cc: O.fromNullable(msg.ccRecipients).pipe(
              O.map(A.map((r) => r.emailAddress.address))
            ),
            bcc: O.none(),
            date: O.fromNullable(msg.receivedDateTime).pipe(
              O.map((d) => new Date(d))
            ),
            snippet: msg.bodyPreview ?? "",
            body: O.fromNullable(msg.body?.content),
            labels: O.fromNullable(msg.categories),
            unread: !msg.isRead,
          }));

          return {
            messages,
            latest: A.last(messages),
            hasUnread: A.some(messages, (m) => m.unread),
            totalReplies: A.length(messages),
            labels: [],
          };
        }),

      sendMail: (data) =>
        Effect.gen(function* () {
          const response = yield* graphRequest<{ id: string }>("/me/sendMail", {
            method: "POST",
            body: {
              message: {
                subject: data.subject,
                body: {
                  contentType: "Text",
                  content: data.body,
                },
                toRecipients: A.map(data.to, (email) => ({
                  emailAddress: { address: email },
                })),
                ccRecipients: data.cc
                  ? A.map(data.cc, (email) => ({
                      emailAddress: { address: email },
                    }))
                  : undefined,
                bccRecipients: data.bcc
                  ? A.map(data.bcc, (email) => ({
                      emailAddress: { address: email },
                    }))
                  : undefined,
              },
              saveToSentItems: true,
            },
          });

          return { id: O.some(response?.id ?? "sent"), success: true };
        }),

      getAttachment: (messageId, attachmentId) =>
        Effect.gen(function* () {
          const response = yield* graphRequest<{ contentBytes: string }>(
            `/me/messages/${messageId}/attachments/${attachmentId}`
          );
          return O.fromNullable(response.contentBytes);
        }),

      createDraft: (data) =>
        Effect.gen(function* () {
          const response = yield* graphRequest<{ id: string }>("/me/messages", {
            method: "POST",
            body: {
              subject: O.getOrUndefined(data.subject),
              body: {
                contentType: "Text",
                content: O.getOrUndefined(data.body) ?? "",
              },
              toRecipients: A.map(data.to, (r) => ({
                emailAddress: { address: r.email, name: O.getOrUndefined(r.name) },
              })),
            },
          });

          return { id: response.id };
        }),

      getDraft: (id) =>
        Effect.gen(function* () {
          const response = yield* graphRequest<S.Schema.Type<typeof GraphMessageSchema>>(
            `/me/messages/${id}`
          ).pipe(
            Effect.catchAll(() =>
              Effect.fail(new DraftNotFoundError({ draftId: id }))
            )
          );

          return {
            id: response.id,
            to: A.map(response.toRecipients ?? [], (r) => ({
              email: r.emailAddress.address,
              name: O.fromNullable(r.emailAddress.name),
            })),
            cc: O.fromNullable(response.ccRecipients).pipe(
              O.map(A.map((r) => ({
                email: r.emailAddress.address,
                name: O.fromNullable(r.emailAddress.name),
              })))
            ),
            bcc: O.none(),
            subject: O.fromNullable(response.subject),
            body: O.fromNullable(response.body?.content),
            threadId: O.some(response.conversationId),
          };
        }),

      listDrafts: (params) =>
        Effect.gen(function* () {
          const response = yield* graphRequest<S.Schema.Type<typeof GraphMessagesResponse>>(
            "/me/mailFolders/drafts/messages",
            {
              params: {
                $top: params.maxResults ?? 20,
                $skip: params.pageToken ? parseInt(params.pageToken) : undefined,
              },
            }
          );

          return {
            threads: A.map(response.value, (m) => ({
              id: m.id,
              historyId: O.none(),
            })),
            nextPageToken: response["@odata.nextLink"]
              ? O.some(String(parseInt(params.pageToken ?? "0") + (params.maxResults ?? 20)))
              : O.none(),
          };
        }),

      deleteDraft: (id) =>
        graphRequest<void>(`/me/messages/${id}`, { method: "DELETE" }).pipe(
          Effect.asVoid
        ),

      sendDraft: (id) =>
        graphRequest<void>(`/me/messages/${id}/send`, { method: "POST" }).pipe(
          Effect.map(() => ({ id: O.some(id), success: true }))
        ),

      getUserLabels: () =>
        Effect.gen(function* () {
          // Microsoft uses categories instead of labels
          const response = yield* graphRequest<{ value: Array<{ id: string; displayName: string; color: string }> }>(
            "/me/outlook/masterCategories"
          );

          return A.map(response.value, (c) => ({
            id: c.id,
            name: c.displayName,
            color: O.some({
              backgroundColor: c.color,
              textColor: "#000000",
            }),
          }));
        }),

      createLabel: (label) =>
        Effect.gen(function* () {
          const response = yield* graphRequest<{ id: string; displayName: string; color: string }>(
            "/me/outlook/masterCategories",
            {
              method: "POST",
              body: {
                displayName: label.name,
                color: label.color?.backgroundColor ?? "preset0",
              },
            }
          );

          return {
            id: response.id,
            name: response.displayName,
            color: O.some({
              backgroundColor: response.color,
              textColor: label.color?.textColor ?? "#000000",
            }),
          };
        }),

      deleteLabel: (id) =>
        graphRequest<void>(`/me/outlook/masterCategories/${id}`, {
          method: "DELETE",
        }).pipe(Effect.asVoid),

      modifyLabels: (messageIds, options) =>
        Effect.forEach(
          messageIds,
          (id) =>
            graphRequest<void>(`/me/messages/${id}`, {
              method: "PATCH",
              body: {
                categories: options.addLabels,
              },
            }),
          { concurrency: 5 }
        ).pipe(Effect.asVoid),

      markAsRead: (messageIds) =>
        Effect.forEach(
          messageIds,
          (id) =>
            graphRequest<void>(`/me/messages/${id}`, {
              method: "PATCH",
              body: { isRead: true },
            }),
          { concurrency: 5 }
        ).pipe(Effect.asVoid),

      markAsUnread: (messageIds) =>
        Effect.forEach(
          messageIds,
          (id) =>
            graphRequest<void>(`/me/messages/${id}`, {
              method: "PATCH",
              body: { isRead: false },
            }),
          { concurrency: 5 }
        ).pipe(Effect.asVoid),
    };
  })
);
```

---

### Task 1.6: Create Driver Factory

**File**: `packages/comms/server/src/services/mail/MailDriverFactory.ts`

```typescript
import { $CommsServerId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import { CommsEntityIds } from "@beep/shared-domain";
import { MailDriver, EmailProvider } from "./MailDriver";
import { GmailDriverLive } from "./drivers/GmailDriverAdapter";
import { OutlookDriverLive, OutlookClient } from "./drivers/OutlookDriver";
import { GmailClient } from "@beep/shared-integrations/google/gmail";

const $I = $CommsServerId.create("services/mail/MailDriverFactory");

// ============================================================================
// Active Connection Context
// ============================================================================

export class ActiveConnection extends S.Class<ActiveConnection>($I`ActiveConnection`)({
  connectionId: CommsEntityIds.ConnectionId,
  provider: EmailProvider,
  email: S.String,
}) {}

export const ActiveConnectionTag = Context.GenericTag<ActiveConnection>(
  $I`ActiveConnectionTag`
);

// ============================================================================
// Factory
// ============================================================================

export const makeMailDriverLayer = (
  provider: EmailProvider
): Layer.Layer<MailDriver, never, GmailClient | OutlookClient> => {
  switch (provider) {
    case "google":
      return GmailDriverLive;
    case "microsoft":
      return OutlookDriverLive;
  }
};

// Helper to run an effect with the appropriate driver
export const withMailDriver = <A, E, R>(
  provider: EmailProvider,
  effect: Effect.Effect<A, E, R | MailDriver>
) =>
  Effect.gen(function* () {
    const driverLayer = makeMailDriverLayer(provider);
    return yield* Effect.provide(effect, driverLayer);
  });
```

---

## Verification

```bash
# Check shared-integrations package (Gmail extensions)
bun run check --filter @beep/shared-integrations

# Check comms-server package (MailDriver abstraction)
bun run check --filter @beep/comms-server

# Run Gmail action tests
bun run test --filter @beep/shared-integrations -- --grep "gmail"

# Run driver tests
bun run test --filter @beep/comms-server -- --grep "MailDriver"

# Lint
bun run lint --filter @beep/shared-integrations
bun run lint --filter @beep/comms-server
```

---

## Deliverables Summary

| Deliverable | Location | Status |
|-------------|----------|--------|
| **Gmail Extensions** | | |
| CreateDraft | `packages/shared/integrations/src/google/gmail/actions/create-draft/` | NEW |
| GetDraft | `packages/shared/integrations/src/google/gmail/actions/get-draft/` | NEW |
| ListDrafts | `packages/shared/integrations/src/google/gmail/actions/list-drafts/` | NEW |
| SendDraft | `packages/shared/integrations/src/google/gmail/actions/send-draft/` | NEW |
| DeleteDraft | `packages/shared/integrations/src/google/gmail/actions/delete-draft/` | NEW |
| GetThread | `packages/shared/integrations/src/google/gmail/actions/get-thread/` | NEW |
| ListThreads | `packages/shared/integrations/src/google/gmail/actions/list-threads/` | NEW |
| MarkAsRead | `packages/shared/integrations/src/google/gmail/actions/mark-as-read/` | NEW |
| MarkAsUnread | `packages/shared/integrations/src/google/gmail/actions/mark-as-unread/` | NEW |
| GetAttachment | `packages/shared/integrations/src/google/gmail/actions/get-attachment/` | NEW |
| Updated layer.ts | `packages/shared/integrations/src/google/gmail/actions/layer.ts` | MODIFY |
| **MailDriver Abstraction** | | |
| MailDriver interface | `packages/comms/server/src/services/mail/MailDriver.ts` | NEW |
| GmailDriverAdapter | `packages/comms/server/src/services/mail/drivers/GmailDriverAdapter.ts` | NEW |
| OutlookDriver | `packages/comms/server/src/services/mail/drivers/OutlookDriver.ts` | NEW |
| MailDriverFactory | `packages/comms/server/src/services/mail/MailDriverFactory.ts` | NEW |

---

## Dependencies

- P0 (Foundation) - EntityIds, domain models, tables

## Blocks

- P2 (Core Email RPC) - needs MailDriver abstraction

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `mcp-researcher` | Research Effect HTTP client patterns, Wrap.WrapperGroup extension patterns |
| `web-researcher` | Research Microsoft Graph API mail endpoints |
| `test-writer` | Create unit tests for Gmail extensions and MailDriver adapters |
| `code-observability-writer` | Add tracing spans to MailDriver operations |
| `codebase-researcher` | Analyze existing Gmail integration for reuse patterns |
