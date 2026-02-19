# @beep/customization-server — Agent Guide

## Purpose & Fit
- Contains the server-side infrastructure layer for the customization slice, including database client, repositories, and server-side services.
- Provides `CustomizationDb` for Drizzle ORM integration with PostgreSQL via `@effect/sql-pg`.
- Bundles repositories into a composable Layer that can be merged into the server runtime.
- Manages customization-specific data persistence and business logic execution.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/customization-domain` | Domain entities, schemas, and business logic |
| `@beep/customization-tables` | Drizzle table definitions and database schema |
| `@beep/shared-server` | Shared server infrastructure, `Repo.make` factories, and database client utilities |
| `@beep/shared-domain` | Cross-slice entity IDs and shared domain types |
| `@effect/sql-pg` | PostgreSQL integration for Effect SQL |
| `@effect/platform` | Effect platform services (FileSystem, HTTP, etc.) |
| `effect` | Core Effect runtime and data types |

## Surface Map
- **CustomizationDb** — Effect-based database client for the customization slice, wrapping Drizzle ORM with `@effect/sql-pg`.
- **CustomizationRepos** — Namespace containing all customization repositories bundled as Effect Layers.
- **CustomizationRepos.layer** — Merged Layer providing all repository services.
- **UserHotkeyRepo** — Repository service for persisting and querying user hotkey configurations.

## Usage Snapshots
- Server runtime composes `CustomizationRepos.layer` to provide repository services to RPC handlers.
- RPC handlers inject `UserHotkeyRepo` to persist user preference changes.
- Integration tests use `CustomizationDb` with Testcontainers for isolated database testing.
- Server startup layers the `CustomizationDb` over `SliceDbRequirements` from shared server.

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`, `Layer`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Repositories MUST use `Repo.make` factories from `@beep/shared-server` with domain entities from `@beep/customization-domain`.
- Keep repository methods focused on data access — business logic belongs in services or domain layer.
- Use Effect for all async operations — no bare Promises or async/await.
- Wrap external service calls (S3, email) with Effect adapters and proper error channels.
- Layer composition MUST follow: `Db -> Repos -> Services` dependency order.

## Quick Recipes
- **Provide customization repositories to server runtime**
  ```ts
  import { CustomizationRepos } from "@beep/customization-server";
  import * as Layer from "effect/Layer";

  const CustomizationLayer = Layer.provide(
    CustomizationRepos.layer,
    CustomizationDb.layer
  );
  ```

- **Query user hotkeys in an RPC handler**
  ```ts
  import { UserHotkeyRepo } from "@beep/customization-server";
  import * as Effect from "effect/Effect";

  const getUserHotkeys = (userId: string) =>
    Effect.gen(function* () {
      const repo = yield* UserHotkeyRepo;
      return yield* repo.findByUserId(userId);
    });
  ```

## Verifications
- `bun run check --filter @beep/customization-server`
- `bun run lint --filter @beep/customization-server`
- `bun run test --filter @beep/customization-server`

## Testing

- **Run tests**: `bun run test --filter=@beep/customization-server`
- **Testing utilities**: Use `@beep/testkit` for Effect-based test helpers and assertions
- **External services**: ALWAYS mock S3, email, and other external services using Effect test layers
- **Layer composition**: Test repository layers with `Layer.provide` and validate dependency injection
- **Integration tests**: Use Testcontainers for database-backed repository tests (see `@beep/db-admin` for examples)

## Known Issues

- **Stale package.json export**: The `package.json` declares a `"./files": "./src/files/index.ts"` export, but the `src/files/` directory does not exist. This export should be removed if not planned for future use.

## Contributor Checklist
- [ ] Ensure repository methods align with domain entity schemas from `@beep/customization-domain`.
- [ ] Maintain typed error channels — wrap database errors in tagged error types.
- [ ] Add integration tests using Testcontainers for new repository methods.
- [ ] Update `CustomizationRepos.layer` when adding new repositories.
- [ ] Re-run verification commands above before handing work off.
