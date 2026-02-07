# Phase 0: Foundation

> Establish EntityIds, domain models, tables, and error types for the comms slice.

---

## Prerequisites

- Understanding of beep-effect domain modeling patterns
- Access to `packages/comms/domain/` (existing)
- Access to `packages/shared/domain/` (for EntityIds)

---

## Tasks

### Task 0.1: Extend CommsEntityIds

**File**: `packages/shared/domain/src/entity-ids/comms/ids.ts`

Add new EntityIds for email-related entities:

```typescript
import { EntityId } from "@beep/schema";

// Connection to email provider (Gmail, Outlook)
export const ConnectionId = EntityId.make("comms_connection", {
  brand: "ConnectionId",
  actions: ["create", "read", "update", "delete", "*"],
});

// Thread summary (AI-generated)
export const ThreadSummaryId = EntityId.make("comms_thread_summary", {
  brand: "ThreadSummaryId",
  actions: ["create", "read", "update", "delete", "*"],
});

// Note attached to a thread
export const NoteId = EntityId.make("comms_note", {
  brand: "NoteId",
  actions: ["create", "read", "update", "delete", "*"],
});

// User settings for email
export const UserSettingsId = EntityId.make("comms_user_settings", {
  brand: "UserSettingsId",
  actions: ["create", "read", "update", "delete", "*"],
});

// User hotkeys/shortcuts
export const UserHotkeysId = EntityId.make("comms_user_hotkeys", {
  brand: "UserHotkeysId",
  actions: ["create", "read", "update", "delete", "*"],
});

// Existing: EmailTemplateId (verify it exists)
```

**Acceptance Criteria**:
- [ ] All EntityIds have proper prefix format
- [ ] All EntityIds define CRUD actions
- [ ] EntityIds exported from `CommsEntityIds` namespace
- [ ] `bun run check --filter @beep/shared-domain` passes

---

### Task 0.2: Update CommsTableNames

**File**: `packages/shared/domain/src/entity-ids/comms/table-name.ts`

Add table name literals:

```typescript
import { BS } from "@beep/schema";

export class CommsTableNames extends BS.StringLiteralKit(
  "comms_connection",
  "comms_thread_summary",
  "comms_note",
  "comms_user_settings",
  "comms_user_hotkeys",
  "comms_email_template", // existing
).annotations(...) {}
```

**Acceptance Criteria**:
- [ ] All table names follow `comms_*` prefix convention
- [ ] Exported from entity-ids index

---

### Task 0.3: Create Connection Domain Model

**File**: `packages/comms/domain/src/entities/connection/connection.model.ts`

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

**Acceptance Criteria**:
- [ ] Uses `makeFields` for audit columns
- [ ] Tokens marked as sensitive (not logged)
- [ ] `providerId` uses existing `EmailProvider` literal
- [ ] Model exports utilities via `modelKit`

---

### Task 0.4: Create ThreadSummary Domain Model

**File**: `packages/comms/domain/src/entities/thread-summary/thread-summary.model.ts`

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/thread-summary");

export class Model extends M.Class<Model>($I`ThreadSummaryModel`)(
  makeFields(CommsEntityIds.ThreadSummaryId, {
    connectionId: CommsEntityIds.ConnectionId,
    messageId: S.NonEmptyTrimmedString, // External message ID from provider
    content: S.String,
    saved: BS.BoolWithDefault(false),
    tags: BS.FieldOptionOmittable(S.String), // JSON array as string
    suggestedReply: BS.FieldOptionOmittable(S.String),
  }),
  $I.annotations("ThreadSummaryModel", {
    description: "AI-generated thread summary",
  })
) {
  static readonly utils = modelKit(Model);
}
```

---

### Task 0.5: Create Note Domain Model

**File**: `packages/comms/domain/src/entities/note/note.model.ts`

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/note");

export class NoteColor extends BS.StringLiteralKit(
  "default",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink"
).annotations($I.annotations("NoteColor", {
  description: "Available note colors",
})) {}

export class Model extends M.Class<Model>($I`NoteModel`)(
  makeFields(CommsEntityIds.NoteId, {
    userId: SharedEntityIds.UserId,
    threadId: S.NonEmptyTrimmedString, // External thread ID from provider
    content: S.String,
    color: NoteColor.pipe(S.propertySignature, S.withDefault(() => "default" as const)),
    isPinned: BS.BoolWithDefault(false),
    order: S.Int.pipe(S.propertySignature, S.withDefault(() => 0)),
  }),
  $I.annotations("NoteModel", {
    description: "User annotation attached to an email thread",
  })
) {
  static readonly utils = modelKit(Model);
}
```

---

### Task 0.6: Create UserSettings Domain Model

**File**: `packages/comms/domain/src/entities/user-settings/user-settings.model.ts`

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/user-settings");

// Settings JSON structure
export class SettingsData extends S.Class<SettingsData>($I`SettingsData`)({
  language: S.optional(S.String),
  timezone: S.optional(S.String),
  trustedSenders: S.optional(S.Array(S.String)),
  externalImages: S.optional(S.Boolean),
  undoSendEnabled: S.optional(S.Boolean),
  undoSendDelay: S.optional(S.Number),
  aiProvider: S.optional(S.String),
  customPrompt: S.optional(S.String),
}) {}

export class Model extends M.Class<Model>($I`UserSettingsModel`)(
  makeFields(CommsEntityIds.UserSettingsId, {
    userId: SharedEntityIds.UserId,
    settings: SettingsData,
  }),
  $I.annotations("UserSettingsModel", {
    description: "User email settings",
  })
) {
  static readonly utils = modelKit(Model);
}
```

---

### Task 0.7: Create UserHotkeys Domain Model

**File**: `packages/comms/domain/src/entities/user-hotkeys/user-hotkeys.model.ts`

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/user-hotkeys");

// Shortcut configuration
export class ShortcutBinding extends S.Class<ShortcutBinding>($I`ShortcutBinding`)({
  key: S.String,
  modifiers: S.optional(S.Array(S.Literal("ctrl", "shift", "alt", "meta"))),
  action: S.String,
}) {}

export class ShortcutsData extends S.Class<ShortcutsData>($I`ShortcutsData`)({
  bindings: S.Array(ShortcutBinding),
}) {}

export class Model extends M.Class<Model>($I`UserHotkeysModel`)(
  makeFields(CommsEntityIds.UserHotkeysId, {
    userId: SharedEntityIds.UserId,
    shortcuts: ShortcutsData,
  }),
  $I.annotations("UserHotkeysModel", {
    description: "User keyboard shortcuts configuration",
  })
) {
  static readonly utils = modelKit(Model);
}
```

---

### Task 0.8: Create Error Types

**File**: `packages/comms/domain/src/errors/index.ts`

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("errors");

// Base error for mail operations
export class MailError extends S.TaggedError<MailError>()("MailError", {
  message: S.String,
  code: S.optional(S.String),
}) {}

// Connection not found
export class ConnectionNotFoundError extends S.TaggedError<ConnectionNotFoundError>()(
  "ConnectionNotFoundError",
  {
    connectionId: S.String,
  }
) {}

// Connection expired (OAuth tokens)
export class ConnectionExpiredError extends S.TaggedError<ConnectionExpiredError>()(
  "ConnectionExpiredError",
  {
    connectionId: S.String,
  }
) {}

// Provider API error (Gmail/Outlook)
export class ProviderApiError extends S.TaggedError<ProviderApiError>()(
  "ProviderApiError",
  {
    provider: S.Literal("google", "microsoft"),
    statusCode: S.Number,
    message: S.String,
  }
) {}

// Thread not found
export class ThreadNotFoundError extends S.TaggedError<ThreadNotFoundError>()(
  "ThreadNotFoundError",
  {
    threadId: S.String,
  }
) {}

// Draft not found
export class DraftNotFoundError extends S.TaggedError<DraftNotFoundError>()(
  "DraftNotFoundError",
  {
    draftId: S.String,
  }
) {}

// Label operation error
export class LabelOperationError extends S.TaggedError<LabelOperationError>()(
  "LabelOperationError",
  {
    operation: S.Literal("create", "update", "delete", "modify"),
    labelId: S.optional(S.String),
    message: S.String,
  }
) {}

// Send email error
export class SendEmailError extends S.TaggedError<SendEmailError>()(
  "SendEmailError",
  {
    reason: S.String,
    details: S.optional(S.Unknown),
  }
) {}

// AI service error
export class AiServiceError extends S.TaggedError<AiServiceError>()(
  "AiServiceError",
  {
    service: S.String,
    message: S.String,
  }
) {}
```

**Acceptance Criteria**:
- [ ] All errors extend `S.TaggedError`
- [ ] Each error has unique `_tag`
- [ ] Errors include relevant context fields
- [ ] Errors exported from domain index

---

### Task 0.9: Update Domain Exports

**File**: `packages/comms/domain/src/entities/index.ts`

```typescript
export * as Connection from "./connection";
export * as ThreadSummary from "./thread-summary";
export * as Note from "./note";
export * as UserSettings from "./user-settings";
export * as UserHotkeys from "./user-hotkeys";
export * as EmailTemplate from "./email-template"; // existing
```

**File**: `packages/comms/domain/src/index.ts`

Ensure all entities and errors are exported:

```typescript
export * as Entities from "./entities";
export * as Errors from "./errors";
export * as MailValues from "./value-objects/mail.value";
export * as LoggingValues from "./value-objects/logging.value";
// repos...
```

---

### Task 0.10: Create @beep/comms-tables Package

**Directory**: `packages/comms/tables/`

Create the tables package with proper structure:

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

Example table definition:

**File**: `packages/comms/tables/src/tables/connection.table.ts`

```typescript
import { OrgTable, Table } from "@beep/tables";
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
  providerIdIdx: pg.index("connection_provider_id_idx").on(t.providerId),
}));
```

---

## Verification

```bash
# Check domain types
bun run check --filter @beep/comms-domain

# Check shared domain (EntityIds)
bun run check --filter @beep/shared-domain

# Check tables (after creation)
bun run check --filter @beep/comms-tables

# Generate DB migrations
bun run db:generate

# Lint
bun run lint --filter @beep/comms-*
```

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| EntityIds | `packages/shared/domain/src/entity-ids/comms/ids.ts` |
| Table names | `packages/shared/domain/src/entity-ids/comms/table-name.ts` |
| Connection model | `packages/comms/domain/src/entities/connection/` |
| ThreadSummary model | `packages/comms/domain/src/entities/thread-summary/` |
| Note model | `packages/comms/domain/src/entities/note/` |
| UserSettings model | `packages/comms/domain/src/entities/user-settings/` |
| UserHotkeys model | `packages/comms/domain/src/entities/user-hotkeys/` |
| Error types | `packages/comms/domain/src/errors/index.ts` |
| Tables package | `packages/comms/tables/` |

---

## Dependencies

- None (foundation phase)

## Blocks

- P1 (Email Drivers) - needs EntityIds and tables
- P2 (Core Email RPC) - needs domain models

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `codebase-researcher` | Research existing patterns in `@beep/iam-domain`, `@beep/shared-domain` |
| `doc-writer` | Create CLAUDE.md for new packages |
| `architecture-pattern-enforcer` | Validate layer dependencies |
