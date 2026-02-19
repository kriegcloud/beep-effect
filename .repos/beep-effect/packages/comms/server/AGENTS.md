# @beep/comms-server — Agent Guide

## Purpose & Fit
- Contains the server-side infrastructure layer for the communications slice, including database client, repositories, and server-side services.
- Provides `Db` (CommsDb namespace) for database integration with PostgreSQL via `@effect/sql-pg` and Drizzle ORM.
- Bundles repositories into a composable Layer that can be merged into the server runtime.
- Manages communication-specific data persistence (email templates, notifications, messages) and business logic execution.

## Surface Map

| Export | Description |
|--------|-------------|
| `Db` | Database client service tag for the comms slice |
| `Db.layer` | Layer providing the database client |
| `CommsRepos` | Namespace containing all comms repositories as Effect Services |
| `CommsRepos.layer` | Merged Layer providing all repository services |
| `EmailTemplateRepo` | Repository for email template entity operations |

## Usage Snapshots
- Server runtime composes `CommsRepos.layer` to provide repository services to RPC handlers.
- RPC handlers inject repositories to persist email templates and communication data.
- Email services use repositories to load email templates for sending transactional emails.
- Integration tests provide `Db.layer` with test configuration for isolated database testing.

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`, `Layer`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Repositories MUST use `DbRepo.make` factories from `@beep/shared-server/factories` with domain entities from `@beep/comms-domain`.
- Keep repository methods focused on data access — business logic belongs in services or domain layer.
- Use Effect for all async operations — no bare Promises or async/await.
- Email sending MUST use the Email service from `@beep/shared-server` with proper error channels.
- Layer composition MUST follow: `Db -> Repos -> Services` dependency order.

## Quick Recipes
- **Provide comms repositories to server runtime**
  ```ts
  import * as CommsRepos from "@beep/comms-server/db/repositories";
  import { Db } from "@beep/comms-server/db";
  import * as Layer from "effect/Layer";

  const CommsLayer = Layer.provide(
    CommsRepos.layer,
    Db.layer
  );
  ```

- **Create an email template repository**
  ```ts
  import { Entities } from "@beep/comms-domain";
  import { CommsDb } from "@beep/comms-server/db";
  import { $CommsServerId } from "@beep/identity/packages";
  import { CommsEntityIds } from "@beep/shared-domain";
  import { DbRepo } from "@beep/shared-server/factories";
  import * as Effect from "effect/Effect";

  const $I = $CommsServerId.create("db/repos/email-template.repo");

  const dependencies = [CommsDb.layer] as const;

  export class EmailTemplateRepo extends Effect.Service<EmailTemplateRepo>()($I`EmailTemplateRepo`, {
    dependencies,
    accessors: true,
    effect: Effect.gen(function* () {
      yield* CommsDb.Db;

      return yield* DbRepo.make(
        CommsEntityIds.EmailTemplateId,
        Entities.EmailTemplate.Model,
        Effect.succeed({})
      );
    }),
  }) {}
  ```

## Verifications
- `bun run check --filter @beep/comms-server`
- `bun run lint --filter @beep/comms-server`
- `bun run test --filter @beep/comms-server`

## Testing

- Run tests: `bun run test --filter=@beep/comms-server`
- Use `@beep/testkit` for Effect testing utilities
- ALWAYS mock external services in tests
- Test Layer composition with `Layer.provide`

## Security

### Email Validation
- ALWAYS validate email addresses with Effect Schema before sending — use `S.String.pipe(S.pattern(emailRegex))` or a dedicated email schema.
- NEVER send emails to unvalidated addresses — malformed recipients can cause delivery failures and reputation damage.
- ALWAYS normalize email addresses (lowercase, trim) before storage or comparison.

### Template Injection Prevention
- NEVER interpolate user input directly into email templates without sanitization.
- ALWAYS use parameterized template systems that escape HTML/special characters.
- PREFER using a templating library with auto-escaping (e.g., Handlebars with escaping enabled) over string concatenation.
- NEVER allow users to modify template structure — only populate predefined variable slots.

### Rate Limiting
- ALWAYS implement rate limiting on notification endpoints to prevent abuse.
- Notification creation endpoints MUST enforce per-user rate limits (e.g., max 100 notifications/hour).
- Email sending MUST have separate rate limits aligned with provider quotas.
- NEVER allow bulk notification creation without authentication and authorization checks.

### PII Handling
- NEVER log full email addresses or notification content in plain text — use masked/hashed versions for debugging.
- ALWAYS encrypt sensitive notification content at rest when storing message bodies.
- Email logs MUST NOT store full message content — store only metadata (template ID, recipient hash, status).
- PREFER soft deletion for communication records to support audit trails while respecting retention policies.

### WebSocket Security
- ALWAYS authenticate WebSocket connections before allowing subscription to notification channels.
- NEVER broadcast notifications without verifying the recipient's authorization to receive them.
- WebSocket connections MUST use secure protocols (WSS) in production — reject plain WS connections.
- ALWAYS implement connection timeouts and heartbeat mechanisms to detect stale connections.
- Rate limit WebSocket message frequency to prevent channel flooding.

### Database Security
- NEVER expose raw database errors to clients — wrap in typed error channels.
- ALWAYS use parameterized queries (Drizzle ORM handles this) — NEVER concatenate user input into queries.
- Repository methods MUST validate entity ownership before returning notification data.

## Gmail Integration

The `GmailAdapter` provides Effect-based integration with Gmail API for email operations (list, get, send, thread management).

### Required Scopes

```typescript
import { GmailScopes } from "@beep/google-workspace-domain";

export const REQUIRED_SCOPES = [GmailScopes.read, GmailScopes.send] as const;
```

- `GmailScopes.read` - `https://www.googleapis.com/auth/gmail.readonly` (read emails)
- `GmailScopes.send` - `https://www.googleapis.com/auth/gmail.send` (send emails)

### Key Operations

| Method | Purpose | Returns |
|--------|---------|---------|
| `listMessages` | Search messages by query | `ReadonlyArray<GmailMessage>` |
| `getMessage` | Fetch single message by ID | `GmailMessage` |
| `sendMessage` | Send email via Gmail | `GmailMessage` |
| `getThread` | Fetch conversation thread | `GmailThread` |

### Usage Pattern

The `GmailAdapter` requires `AuthContext` at layer construction time, so it must be provided within the request context where `AuthContext` is available.

```typescript
import { GmailAdapter } from "@beep/comms-server/adapters";
import * as GoogleWorkspace from "@beep/runtime-server/GoogleWorkspace.layer";
import * as Effect from "effect/Effect";

// In a handler with AuthContext available:
const sendEmail = (to: string, subject: string, body: string) =>
  Effect.gen(function* () {
    const gmail = yield* GmailAdapter;
    const sentMessage = yield* gmail.sendMessage(to, subject, body);
    return sentMessage;
  }).pipe(
    Effect.provide(GoogleWorkspace.layer)
  );
```

### Error Handling

The adapter emits these tagged errors:
- `GoogleApiError` - HTTP/API failures (network, invalid response)
- `GoogleAuthenticationError` - OAuth token failures
- `GoogleScopeExpansionRequiredError` - User lacks required OAuth scopes (triggers incremental consent)

```typescript
import { GoogleScopeExpansionRequiredError } from "@beep/google-workspace-domain";

const program = sendEmail(to, subject, body).pipe(
  Effect.catchTag("GoogleScopeExpansionRequiredError", (error) =>
    // Redirect user to OAuth consent with expanded scopes
    redirectToOAuthConsent(error.requiredScopes)
  )
);
```

### ACL Translation

The adapter translates between Gmail API wire format and domain models:

- **Base64 URL encoding**: Email content is base64url-encoded in Gmail API
- **RFC 2822 format**: Outgoing emails constructed using RFC 2822 message format
- **Multipart parsing**: Handles MIME multipart messages, extracting text/plain and text/html parts
- **Header extraction**: Parses `From`, `To`, `Subject`, `Date` headers into structured fields

This Anti-Corruption Layer ensures the domain remains independent of Gmail API format changes.

### Message Format

```typescript
export interface GmailMessage {
  readonly id: string;
  readonly threadId: string;
  readonly labelIds: ReadonlyArray<string>;
  readonly snippet: string;
  readonly payload: O.Option<MessagePayload>;  // Headers + body + parts
  readonly internalDate: O.Option<DateTime.Utc>;
}
```

## Contributor Checklist
- [ ] Ensure repository methods align with domain entity schemas from `@beep/comms-domain`.
- [ ] Use `DbRepo.make` from `@beep/shared-server/factories` for all repository implementations.
- [ ] Maintain typed error channels — wrap database errors in `DatabaseError` from `@beep/shared-domain/errors`.
- [ ] Add integration tests with Effect test utilities from `@beep/testkit`.
- [ ] Update `CommsRepos.layer` in `src/db/repositories.ts` when adding new repositories.
- [ ] Export new repository classes from `src/db/repos/index.ts`.
- [ ] Validate email addresses before any sending operation using schemas from `@beep/schema`.
- [ ] Verify rate limiting is in place for communication endpoints.
- [ ] Gmail operations check for scope expansion errors and handle incremental OAuth consent.
- [ ] Re-run verification commands above before handing work off.
