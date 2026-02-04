---
path: packages/comms/domain
summary: Communications domain models with email templates, mail value objects, and logging primitives
tags: [comms, domain, effect, schema, email, notifications]
---

# @beep/comms-domain

Centralizes communications domain models via `M.Class` definitions that merge shared audit fields through `makeFields`. Provides entities for email templates and value objects for mail composition and observability logging.

## Architecture

```
|-------------------|     |-------------------|
|   EmailTemplate   |---->|   makeFields()    |
|   (M.Class)       |     |   (audit cols)    |
|-------------------|     |-------------------|
        |
        v
|-------------------|     |-------------------|
|   Mail Values     |     |  Logging Values   |
|  (Sender, etc.)   |     | (TraceSpan, etc.) |
|-------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `entities/email-template/` | Email template entity with subject, body, to/cc/bcc fields |
| `value-objects/mail.values.ts` | Label, Attachment, MailUser, Sender, ParsedMessage, OutgoingMessage |
| `value-objects/logging.values.ts` | TraceSpanStarted, CallLog, LoggingState for observability |

## Usage Patterns

### Creating an Email Template

```typescript
import * as Effect from "effect/Effect";
import { Entities } from "@beep/comms-domain";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";

const program = Effect.gen(function* () {
  const template = Entities.EmailTemplate.Model.make({
    id: CommsEntityIds.EmailTemplateId.make("comms_email_template__123"),
    organizationId: SharedEntityIds.OrganizationId.make("shared_organization__456"),
    userId: SharedEntityIds.UserId.make("shared_user__789"),
    name: "Welcome Email",
    subject: "Welcome to Beep!",
    body: "Thank you for joining us.",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return template;
});
```

### Composing Mail Value Objects

```typescript
import * as Effect from "effect/Effect";
import { Sender, OutgoingMessage } from "@beep/comms-domain/value-objects/mail.values";

const program = Effect.gen(function* () {
  const sender = Sender.make({
    name: "John Doe",
    email: "john@example.com"
  });

  const message = OutgoingMessage.make({
    to: [sender],
    subject: "Test Email",
    message: "Hello world",
    attachments: [],
    headers: {}
  });
  return message;
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `makeFields` for all entities | Inherit audit columns (createdAt, updatedAt, version) and typed IDs consistently |
| Separate mail/logging value objects | Keep concerns isolated; mail for composition, logging for observability |
| `modelKit(Model)` pattern | Expose standardized utilities (`.utils`) on each model class |
| `Symbol.for` naming via `$CommsDomainId` | Stable schema metadata across migrations and clients |

## Dependencies

**Internal**: `@beep/shared-domain` (EntityIds, makeFields, modelKit), `@beep/identity`, `@beep/schema`

**External**: `effect`, `@effect/sql`

## Related

- **AGENTS.md** - Detailed contributor guidance with security considerations and testing patterns
