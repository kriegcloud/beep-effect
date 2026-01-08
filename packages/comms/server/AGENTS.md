# @beep/comms-server — Agent Guide

## Purpose & Fit
- Contains the server-side infrastructure layer for the communications slice, including database client, repositories, and server-side services.
- Provides `CommsDb` for Drizzle ORM integration with PostgreSQL via `@effect/sql-pg`.
- Bundles repositories into a composable Layer that can be merged into the server runtime.
- Manages communication-specific data persistence (notifications, messages, email logs) and business logic execution.

## Surface Map
- **CommsDb** — Effect-based database client for the comms slice, wrapping Drizzle ORM with `@effect/sql-pg`.
- **CommsRepos** — Namespace containing all comms repositories bundled as Effect Layers.
- **CommsRepos.layer** — Merged Layer providing all repository services.
- **PlaceholderRepo** — Starter repository demonstrating the Repo pattern. Replace with actual comms repositories (NotificationRepo, MessageRepo, etc.) as the feature matures.

## Usage Snapshots
- Server runtime composes `CommsRepos.layer` to provide repository services to RPC handlers.
- RPC handlers inject repositories to persist notifications, messages, and communication preferences.
- Email services use repositories to log sent emails and track delivery status.
- Integration tests use `CommsDb` with Testcontainers for isolated database testing.

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`, `Layer`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Repositories MUST use `Repo.make` factories from `@beep/shared-server` with domain entities from `@beep/comms-domain`.
- Keep repository methods focused on data access — business logic belongs in services or domain layer.
- Use Effect for all async operations — no bare Promises or async/await.
- Email sending MUST use the Email service from `@beep/shared-server` with proper error channels.
- Layer composition MUST follow: `Db -> Repos -> Services` dependency order.

## Quick Recipes
- **Provide comms repositories to server runtime**
  ```ts
  import { CommsRepos, CommsDb } from "@beep/comms-server";
  import * as Layer from "effect/Layer";

  const CommsLayer = Layer.provide(
    CommsRepos.layer,
    CommsDb.layer
  );
  ```

- **Create a notification repository**
  ```ts
  import { Entities } from "@beep/comms-domain";
  import { CommsDbSchema } from "@beep/comms-tables";
  import { Repo } from "@beep/shared-server";
  import * as Effect from "effect/Effect";
  import * as Context from "effect/Context";

  export class NotificationRepo extends Context.Tag("comms/NotificationRepo")<
    NotificationRepo,
    Repo.Repo<typeof Entities.Notification.Model>
  >() {
    static readonly Default = Repo.make({
      model: Entities.Notification.Model,
      table: CommsDbSchema.notification,
    });
  }
  ```

## Verifications
- `bun run check --filter @beep/comms-server`
- `bun run lint --filter @beep/comms-server`
- `bun run test --filter @beep/comms-server`

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

## Contributor Checklist
- [ ] Ensure repository methods align with domain entity schemas from `@beep/comms-domain`.
- [ ] Maintain typed error channels — wrap database errors in tagged error types.
- [ ] Add integration tests using Testcontainers for new repository methods.
- [ ] Update `CommsRepos.layer` when adding new repositories.
- [ ] Validate email addresses before any sending operation.
- [ ] Verify rate limiting is in place for notification endpoints.
- [ ] Re-run verification commands above before handing work off.
