# @beep/comms-domain

The domain layer for the Communications vertical slice, providing pure entity models, value objects, and domain contracts for messaging, notifications, and communication workflows.

## Purpose

Centralizes Communications domain models via `M.Class` definitions that provide schema variants for messaging entities, notification preferences, and communication channels. This package exports Effect-first entity models and type-safe error channels that integrate seamlessly with Drizzle ORM and Effect SQL while maintaining type safety and compile-time guarantees.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/comms-domain": "workspace:*"
```

## Key Exports

### Entities

| Export | Description |
|--------|-------------|
| `Entities.EmailTemplate` | Email template entity model with subject, body, to/cc/bcc fields |

### Value Objects (Mail)

Available at `@beep/comms-domain/value-objects/mail.values`:

| Export | Description |
|--------|-------------|
| `Label` | Email label with color, type, and nested labels |
| `LabelColor` | Label color scheme (background and text) |
| `Attachment` | Email attachment with headers and content |
| `MailUser` | Email user representation |
| `Sender` | Email sender with name and address |
| `ParsedMessage` | Parsed incoming email message |
| `OutgoingMessage` | Outgoing email message structure |
| `SendMailInput` | Input schema for sending email |
| `EmailProvider` | Email provider discriminator ("google" \| "microsoft") |
| `MailAccount` | Mail account configuration |
| `MailTag` | Email tag metadata |
| `ThreadProps` | Email thread properties |
| `Tools` | AI tool types for email operations |
| `EmailPrompts` | AI prompt types for email generation |

### Value Objects (Logging)

Available at `@beep/comms-domain/value-objects/logging.values`:

| Export | Description |
|--------|-------------|
| `TraceSpan` | Union of trace span states (started, completed, error) |
| `TraceSpanStarted` | Trace span in started state |
| `TraceSpanCompleted` | Trace span in completed state |
| `TraceSpanError` | Trace span in error state |
| `CallLog` | Call log entry with metadata and trace |
| `CallLogMetadata` | Metadata for call logs |
| `CallLogTrace` | Trace information for call logs |
| `LoggingState` | Current logging state |
| `SessionStats` | Session statistics for logging |

## Architecture Fit

- **Vertical Slice**: Pure domain layer with no infrastructure dependencies
- **Hexagonal**: Entity models serve as the core, consumed by repositories and application services
- **Effect-First**: All entities built on `@effect/sql/Model` with Effect Schema validation
- **Shared Kernel**: Re-exports cross-slice entities where needed for unified imports
- **Path Alias**: Import as `@beep/comms-domain` for entities. Value objects require subpath imports (see below)

## Import Paths

### Entities (Main Export)

```typescript
import { Entities } from "@beep/comms-domain";
```

### Value Objects (Subpath Exports)

Value objects require explicit subpath imports as they are not re-exported from the main index:

```typescript
// Mail value objects
import {
  Sender,
  OutgoingMessage,
  ParsedMessage,
  EmailProvider
} from "@beep/comms-domain/value-objects/mail.values";

// Logging value objects
import {
  TraceSpan,
  CallLog,
  LoggingState
} from "@beep/comms-domain/value-objects/logging.values";
```

> **Note**: The `src/value-objects/index.ts` file currently does not re-export value objects. This is intentional to keep the main package export focused on entities. Use subpath imports for value objects.

## Usage

### Namespace Import

Prefer the namespace import pattern for entities:

```typescript
import { Entities } from "@beep/comms-domain";
import * as Effect from "effect/Effect";

// Access email template entity model
const EmailTemplateModel = Entities.EmailTemplate.Model;
```

### Creating Entity Insert Payloads

Use `Model.insert.make` for type-safe insert operations:

```typescript
import { Entities } from "@beep/comms-domain";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";

export const makeEmailTemplateInsert = Effect.gen(function* () {
  const now = yield* DateTime.now;
  const nowDate = DateTime.toDate(now);

  return Entities.EmailTemplate.Model.insert.make({
    id: CommsEntityIds.EmailTemplateId.make("comms_email_template__123"),
    organizationId: SharedEntityIds.OrganizationId.make("shared_organization__456"),
    userId: SharedEntityIds.UserId.make("shared_user__789"),
    name: "Welcome Email",
    subject: "Welcome to Beep!",
    body: "Thank you for joining us.",
    createdAt: nowDate,
    updatedAt: nowDate,
  });
});
```

### Working with Mail Value Objects

The package provides comprehensive value objects for email operations:

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import {
  Sender,
  OutgoingMessage,
  SendMailInput
} from "@beep/comms-domain/value-objects/mail.values";

// Create a sender
const createSender = Effect.gen(function* () {
  return Sender.make({
    name: "John Doe",
    email: "john@example.com"
  });
});

// Create an outgoing message
const createMessage = Effect.gen(function* () {
  const sender = yield* createSender;

  return OutgoingMessage.make({
    to: [sender],
    subject: "Welcome to Beep!",
    message: "Thank you for signing up.",
    attachments: [],
    headers: {}
  });
});

// Validate send mail input
const validateSendInput = (input: unknown) =>
  S.decodeUnknown(SendMailInput)(input);
```

### Working with Logging Value Objects

Trace spans and call logs support observability workflows:

```typescript
import * as Effect from "effect/Effect";
import { BS } from "@beep/schema";
import {
  TraceSpanStarted,
  TraceSpanCompleted,
  CallLog,
  LoggingState
} from "@beep/comms-domain/value-objects/logging.values";

// Start a trace span
const startSpan = Effect.gen(function* () {
  const now = yield* BS.DateTimeUtcFromAllAcceptable.make(new Date());

  return TraceSpanStarted.make({
    id: "span-123",
    name: "email-send-operation",
    startTime: now
  });
});

// Complete a trace span
const completeSpan = (spanId: string) => Effect.gen(function* () {
  const now = yield* BS.DateTimeUtcFromAllAcceptable.make(new Date());

  return TraceSpanCompleted.make({
    id: spanId,
    name: "email-send-operation",
    startTime: now,
    endTime: now,
    duration: 1500
  });
});

// Create a call log
const createCallLog = Effect.gen(function* () {
  return CallLog.make({
    id: "log-456",
    timestamp: new Date(),
    operation: "sendEmail",
    status: "success",
    metadata: {}
  });
});
```

## What Belongs Here

- **Pure entity models** built on `@effect/sql/Model` with Effect Schema
- **Value objects** like entity IDs, enums, and communication types
- **Mail value objects** for email composition, parsing, and provider integration
- **Logging value objects** for trace spans, call logs, and observability
- **Schema kits** for literals with Postgres enum helpers
- **Domain utilities** that are pure and stateless

## What Must NOT Go Here

- **No I/O or side effects**: no database queries, network calls, or file system operations
- **No infrastructure**: no Drizzle clients, repositories, or external service adapters
- **No application logic**: keep orchestration in `@beep/comms-server`
- **No framework dependencies**: avoid Next.js, React, or platform-specific code
- **No cross-slice domain imports**: only depend on `@beep/shared-domain` and `@beep//*`

Domain models should be pure, testable, and reusable across all infrastructure implementations.

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema system |
| `@effect/sql` | SQL model base classes and annotations |
| `@beep/shared-domain` | Shared entities (User, Organization, Team, Session), entity ID factories (`CommsEntityIds`, `SharedEntityIds`), `makeFields` helper |
| `@beep/schema` | Schema utilities (BS namespace, EmailEncoded, HexColor, DateTimeUtc) |
| `@beep/identity` | Package identification via `$CommsDomainId` for schema metadata |

## Development

```bash
# Type check
bun run --filter @beep/comms-domain check

# Lint
bun run --filter @beep/comms-domain lint

# Lint and auto-fix
bun run --filter @beep/comms-domain lint:fix

# Build
bun run --filter @beep/comms-domain build

# Run tests
bun run --filter @beep/comms-domain test

# Test with coverage
bun run --filter @beep/comms-domain coverage

# Check for circular dependencies
bun run --filter @beep/comms-domain lint:circular
```

## Relationship to Other Packages

- `@beep/comms-server` — Infrastructure layer implementing domain models as repositories and services
- `@beep/comms-tables` — Drizzle table definitions that consume these entity models
- `@beep/comms-client` — Client-side contracts (may consume domain types)
- `@beep/comms-ui` — React components for communication flows
- `@beep/shared-domain` — Shared kernel entities (User, Organization, Team, Session)
- `@beep/shared-tables` — Table factories (`Table.make`, `OrgTable.make`) used by Communications tables

## Notes

### Entity ID Factories

Entity IDs use typed branded types from `@beep/shared-domain`:

```typescript
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";

// Comms slice IDs
const templateId = CommsEntityIds.EmailTemplateId.make("comms_email_template__123");

// Shared IDs for cross-slice references
const orgId = SharedEntityIds.OrganizationId.make("shared_organization__456");
const userId = SharedEntityIds.UserId.make("shared_user__789");
```

### makeFields Pattern

All entities use `makeFields` to inherit standard audit columns:

```typescript
import { makeFields } from "@beep/shared-domain/common";
import { CommsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";

class MyEntity extends M.Class<MyEntity>("MyEntity")(
  makeFields(CommsEntityIds.MyEntityId, {
    // Custom fields here
    name: S.NonEmptyTrimmedString,
  })
) {}

// Automatically includes:
// - id: MyEntityId
// - _rowId: S.Int (database row ID)
// - version: S.Int (optimistic locking)
// - createdAt: S.Date
// - updatedAt: S.Date
```

NEVER manually define `id`, `_rowId`, `version`, `createdAt`, or `updatedAt` fields.

### Schema Metadata Stability

All models use `$CommsDomainId.create()` for stable Symbol identifiers:

```typescript
import { $CommsDomainId } from "@beep/identity/packages";

const $I = $CommsDomainId.create("entities/my-entity");

class MyModel extends M.Class<MyModel>($I`MyModel`)({
  // fields
}) {}
```

This ensures schema metadata remains stable across database migrations and client serialization.

### Value Object Design

Value objects in this package are:
- **Immutable** — Use Effect Schema Class for structural immutability
- **Self-validating** — Schema validation enforced at construction time
- **Composable** — Can be nested and combined (e.g., `Label` contains nested `labels`)
- **Branded** — Use branded types where appropriate (e.g., email addresses)

### AI Integration Points

The package includes AI-specific value objects for email operations:

- **Tools** — Schema literal kit defining available AI tools ("draftWithAi", "rewriteWithAi", "improveWritingWithAi", etc.)
- **EmailPrompts** — Schema literal kit for AI prompt types ("generateSubject", "generateBody", "fixGrammar", etc.)

These value objects integrate with LLM-based email composition features in the UI layer.

### Testing Patterns

When testing domain models:

```typescript
import { Entities } from "@beep/comms-domain";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// Test schema roundtrip
const testRoundtrip = Effect.gen(function* () {
  const original = Entities.EmailTemplate.Model.make({
    id: CommsEntityIds.EmailTemplateId.make("comms_email_template__test"),
    organizationId: SharedEntityIds.OrganizationId.make("shared_organization__test"),
    userId: SharedEntityIds.UserId.make("shared_user__test"),
    name: "Test Template",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const encoded = yield* S.encode(Entities.EmailTemplate.Model)(original);
  const decoded = yield* S.decode(Entities.EmailTemplate.Model)(encoded);

  // Assert roundtrip equality
  return decoded;
});
```

Always test schema encode/decode roundtrips to ensure serialization stability.

### Security Considerations

- **Sensitive Fields**: `userId` is marked as `.privateSchema` to prevent accidental leakage in logs
- **Email Validation**: Use `BS.EmailFromCommaDelimitedString` for to/cc/bcc fields to ensure valid email addresses
- **Content Length**: No explicit length limits on `body` field — enforce limits in the server layer
- **XSS Prevention**: Email body content is NOT sanitized at domain layer — sanitization belongs in UI/server layers
