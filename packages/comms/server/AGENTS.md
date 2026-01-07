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
- Always import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`, `Layer`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Repositories must use `Repo.make` factories from `@beep/shared-server` with domain entities from `@beep/comms-domain`.
- Keep repository methods focused on data access — business logic belongs in services or domain layer.
- Use Effect for all async operations — no bare Promises or async/await.
- Email sending should use the Email service from `@beep/shared-server` with proper error channels.
- Layer composition should follow: `Db -> Repos -> Services` dependency order.

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

## Contributor Checklist
- [ ] Ensure repository methods align with domain entity schemas from `@beep/comms-domain`.
- [ ] Maintain typed error channels — wrap database errors in tagged error types.
- [ ] Add integration tests using Testcontainers for new repository methods.
- [ ] Update `CommsRepos.layer` when adding new repositories.
- [ ] Re-run verification commands above before handing work off.
