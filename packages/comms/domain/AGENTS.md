# @beep/comms-domain — Agent Guide

## Purpose & Fit
- Centralizes communications domain models via `M.Class` definitions that merge shared audit fields through `makeFields`, giving infra and tables a single source of truth for schema variants.
- Re-exports the comms entity inventory to consumers through the package root so repos, tables, and runtimes can import `Entities.*` without piercing folder structure.
- Provides domain entities for email templates, email value objects, and logging value objects for the communications slice.
- Contains pure business logic with no side effects — all I/O belongs in the server layer.

## Surface Map (Exports)

### Entities

| Entity | Location | Purpose |
|--------|----------|---------|
| `EmailTemplate` | `src/entities/email-template/` | Email template entity with subject, body, to/cc/bcc fields |

### Value Objects

| Value Object | Location | Purpose |
|--------------|----------|---------|
| Mail Values | `src/value-objects/mail.values.ts` | Email-related value objects (Label, Attachment, MailUser, Sender, ParsedMessage, Tools, etc.) |
| Logging Values | `src/value-objects/logging.values.ts` | Trace span, call log, and logging state value objects |

### Repository Types

| Type | Location | Purpose |
|------|----------|---------|
| `EmailTemplateRepo` | `src/repos/email-template.repo.ts` | Type definition for email template repository (commented out) |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/shared-domain` | Entity ID factories (`CommsEntityIds`, `SharedEntityIds`), `makeFields` helper, `modelKit` utility |
| `@beep/identity` | Package identification via `$CommsDomainId` for schema metadata |
| `@beep/schema` | Schema utilities (`BS` helpers) and validation types |
| `effect` | Core Effect runtime, Schema module |
| `@effect/sql` | SQL Model base classes (`M.Class`) |

## Usage Snapshots
- Repositories import `Entities` to seed `Repo.make` factories that enforce typed persistence.
- PG tables reference entity ID factories to maintain typed primary keys.
- Integration tests build insert payloads with `Entities.*.Model.insert.make` to validate repo flows end-to-end.
- Test harness seeds comms fixtures directly from `Entities.*` model variants when spinning Postgres containers.
- Web application uses mail value objects for email composition and display.
- Logging infrastructure consumes trace span and call log value objects for observability.

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`, `M`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Use `makeFields` so every entity inherits the audit + tracking columns and typed IDs; NEVER redefine `id`, `_rowId`, `version`, or timestamps manually.
- Maintain `Symbol.for("@beep/comms-domain/<Entity>Model")` naming via `$CommsDomainId` to keep schema metadata stable across database migrations and clients.
- Prefer shared schema helpers (`FieldOptionOmittable`, `FieldSensitiveOptionOmittable`, `toOptionalWithDefault`, `BoolWithDefault`) to describe optionality and defaults.
- When adding new entities, extend entity ID factories in `@beep/shared-domain` (e.g., `CommsEntityIds`) and propagate matching tables in `@beep/comms-tables`.
- Apply `modelKit(Model)` to expose standardized utilities (`.utils`) on each model class.

## Quick Recipes

### Using the EmailTemplate Entity

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

### Creating a New Entity Model

When adding a new entity to the comms domain, follow this pattern:

```typescript
import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/notification");

export class Model extends M.Class<Model>($I`NotificationModel`)(
  makeFields(CommsEntityIds.NotificationId, {
    userId: SharedEntityIds.UserId,
    title: S.NonEmptyTrimmedString,
    body: S.String,
    read: S.Boolean,
    type: S.Literal("info", "warning", "error", "success"),
  }),
  $I.annotations("NotificationModel", {
    description: "User notification model.",
  })
) {
  static readonly utils = modelKit(Model);
}
```

**Important Notes:**
- `makeFields` is available via `@beep/shared-domain/common` subpath export
- `modelKit` is available via `@beep/shared-domain/factories` subpath export
- Both are also accessible through the main exports: `import { Common, ... } from "@beep/shared-domain"` as `Common.makeFields`
- Entity IDs come from `CommsEntityIds` in `@beep/shared-domain`

### Working with Mail Value Objects

The package includes comprehensive mail-related value objects in `src/value-objects/mail.values.ts`:

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import {
  Label,
  Attachment,
  MailUser,
  Sender,
  ParsedMessage,
  OutgoingMessage,
  SendMailInput,
  EmailProvider,
  Tools
} from "@beep/comms-domain/value-objects/mail.values";

// Creating a sender
const sender = Sender.make({
  name: "John Doe",
  email: "john@example.com"
});

// Creating an outgoing message
const message = OutgoingMessage.make({
  to: [sender],
  subject: "Test Email",
  message: "Hello world",
  attachments: [],
  headers: {}
});
```

### Working with Logging Value Objects

Logging value objects in `src/value-objects/logging.values.ts` support trace spans and call logs:

```typescript
import * as Effect from "effect/Effect";
import {
  TraceSpanStarted,
  CallLog,
  LoggingState
} from "@beep/comms-domain/value-objects/logging.values";
import { BS } from "@beep/schema";

// Creating a trace span
const span = TraceSpanStarted.make({
  id: "span-123",
  name: "email-send",
  startTime: BS.DateTimeUtcFromAllAcceptable.make(new Date())
});
```

## Verifications
- `bun run check --filter @beep/comms-domain`
- `bun run lint --filter @beep/comms-domain`
- `bun run test --filter @beep/comms-domain`

## Testing

- Run tests: `bun run test --filter=@beep/comms-domain`
- Test file location: Adjacent to source files as `*.test.ts`
- Use `@beep/testkit` for Effect testing utilities
- ALWAYS test schema encode/decode roundtrips

## Security

### Sensitive Data Modeling
- ALWAYS use `FieldSensitiveOptionOmittable` for PII fields (email, phone, name) — this marks them for special handling in serialization.
- NEVER include raw credentials, API keys, or secrets in domain entities — these belong in environment config.
- Email addresses and phone numbers MUST use validated schema types (e.g., `S.String.pipe(S.pattern(...))`) — never bare strings.

### Data Validation
- ALWAYS validate all incoming data at schema boundaries using Effect Schema — domain entities are the last line of defense.
- NEVER trust client-provided IDs without ownership verification in the server layer.
- Notification content MUST have length limits defined in the schema to prevent storage abuse.

### Audit Trail Requirements
- NEVER modify `makeFields` audit columns manually — let the framework manage `createdAt`, `updatedAt`, and `version`.
- Domain entities MUST preserve audit fields for compliance — avoid transformations that strip tracking metadata.

## Contributor Checklist
- [ ] Align entity changes with `@beep/comms-tables` columns and regenerate migrations (`bun run db:generate`, `bun run db:migrate`).
- [ ] Update `packages/_internal/db-admin` fixtures/tests when adding or removing fields to keep container smoke tests honest.
- [ ] Maintain `Symbol.for` identifiers and audit field structure via `makeFields`.
- [ ] Prefer `Model.insert/update/json` helpers for transformations—avoid handcrafting payloads in repos or services.
- [ ] Mark PII fields with appropriate sensitive field helpers.
- [ ] Re-run verification commands above before handing work off; add Vitest coverage beyond the placeholder suite when touching new behavior.
