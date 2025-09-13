# App Runtime and Layer Composition Proposal

This proposal consolidates Effect layers across the repo into a single, well-structured ManagedRuntime in `apps/web/src`, eliminates duplicated resource allocation (e.g., multiple PG clients / pools), fixes incorrect layer composition, and aligns with the repo’s vertical-slice and Effect-first rules.

- Primary goal: a single `ManagedRuntime` in `apps/web/src` that can be used by route handlers such as `apps/web/src/app/api/auth/[...all]/route.ts` and that provides every required service.
- Secondary goals:
  - Fix current “Fiber Failure” and “AuthEmailService not found” by correcting layer composition order and reducing requirement leakage.
  - Remove double allocation of DB-related layers by exposing “no-deps” layers in slices and providing dependencies only at the app runtime.
  - Keep vertical slice boundaries clean per `.windsurfrules` and docs in `docs/patterns/`.

---

## Findings and Root Causes

- Auth options are built in `packages/iam/infra/src/adapters/better-auth/Auth.service.ts` via `AuthOptions` which requires `IamDb.IamDb` and `OrganizationPlugin`.
  - Lines 102–119 are commented out email hooks because providing `AuthEmailService` and `ResendService` failed at runtime.
- `AuthEmailService` depends on `ResendService`, but the composition in `packages/iam/infra/src/adapters/better-auth/lib/server-runtime.ts` uses the wrong provide order:
  - Current code:
    ```ts
    Layer.provideMerge(AuthEmailService.Default, ResendService.Default)
    ```
    This feeds `AuthEmailService` into `ResendService` instead of the other way around. `AuthEmailService` won’t have `ResendService` in its environment → “service not found”.
- DB layering duplication and requirement leakage:
  - `IamDb.layer` in `packages/iam/infra/src/db/Db.ts` currently self-provides `PgLive` and `DbPool.Live`:
    ```ts
    export const layer = Layer.scoped(IamDb, makeService())
      .pipe(Layer.provideMerge(Layer.mergeAll(PgLive, DbPool.Live)))
    ```
    This means building `IamDb.layer` creates its own PG stack, which conflicts with app-level runtime that also includes `PgLive` and `DbPool.Live` (see `packages/core/runtime/src/server.ts`). Due to layer memoization by reference equality, separate allocations occur.
  - `AuthService` currently inlines `Effect.provide([IamDb.layer])` (end of file) which hides its DB requirements and again risks separate allocations.
- The server runtime lives inside `packages/iam/infra/.../lib/server-runtime.ts`, couples app/runtime wiring to the IAM slice, and merges cross-cutting concerns in the slice instead of the app. This makes refactoring hard and breaks the guideline that apps compose layers and slices expose ports/adapters.
- In `packages/iam/infra/src/adapters/better-auth/internal/plugins/organization.ts`, the `afterCreate` hook dynamically imports `server-runtime` and uses `serverRuntime.runPromise(program)`. This creates an app-into-slice dependency and makes composition circular. The code can simply `await Effect.runPromise(program)` because the `db` drizzle client is already captured by closure and is valid during the runtime scope.

---

## Effect Docs References (what we followed)

- Managing Layers: service construction and avoiding requirement leakage
  - https://effect.website/docs/requirements-management/layers
- Layer.provideMerge semantics and ordering
  - `Layer.provideMerge(provider, dependent)` feeds provider outputs into dependent inputs.
- Layer Memoization: share the same layer instance to avoid duplicate allocation
  - https://effect.website/docs/requirements-management/layer-memoization
- Effect.Service with dependencies for auto wiring
  - Default vs DefaultWithoutDependencies and the `dependencies: [...]` option.
- ManagedRuntime.make for a single runtime instance
  - https://effect.website/docs/api/effect/ManagedRuntime#make

These inform the proposed structure and change list below.

---

## Target Architecture

Single app-owned runtime defined in `apps/web/src/lib/runtime.ts` that merges base platform + infra adapters + slice layers, and only then provides slice services that depend on those layers. Summarized stack:

- Base/observability/platform layer
  - `NodeSdkLive` (OTLP exporter) + `DevToolsLive` (dev-only websockets) + `FetchHttpClient.layer`
  - Logger: pretty in dev, JSON in prod (see `docs/PRODUCTION_CHECKLIST.md` defaults)
- Database layer
  - `PgLive`, `DbPool.Live` provided once
- Email layer
  - `ResendService.Default`
- IAM DB layer
  - `IamDb.layerWithoutDeps` (new) provided with the Database layer above
- Auth email layer
  - `AuthEmailService.DefaultWithoutDependencies` provided with `ResendService.Default`
- Auth service layer
  - `AuthService.DefaultWithoutDependencies` provided with `IamDb.layerWithoutDeps` (and any other IAM deps)

The `ManagedRuntime` is created once from the merged layer graph and imported by route handlers.

---

## Concrete Changes (small, focused patches)

1) IamDb: split the layer
- File: `packages/iam/infra/src/db/Db.ts`
- Keep the current `IamDb` tag and `makeScopedDb` call, but expose two layers:
  - `IamDb.layerWithoutDeps = Layer.scoped(IamDb, makeService())` (requires `PgLive | DbPool.Live`)
  - `IamDb.layer = Layer.provideMerge(IamDb.layerWithoutDeps, Layer.mergeAll(PgLive, DbPool.Live))` (convenience; do not use in app runtime)
- Rationale: app runtime provides `PgLive` + `DbPool.Live` once, so all consumers share a single PG stack.

2) AuthEmailService: declare dependency on Resend
- File: `packages/iam/infra/src/adapters/better-auth/AuthEmail.service.ts`
- Define `dependencies: [ResendService.Default]` on the Effect.Service definition, or expose `AuthEmailService.DefaultWithoutDependencies` and wire it at the app layer with `ResendService.Default`.
- Rationale: `AuthEmailService.Default` becomes plug-and-play for simple contexts; app runtime will use the explicit `DefaultWithoutDependencies` to avoid hidden allocations.

3) AuthService: stop providing layers internally
- File: `packages/iam/infra/src/adapters/better-auth/Auth.service.ts`
- Remove the internal `.pipe(Effect.provide([IamDb.layer]))` on the service effect and either:
  - Specify `dependencies: [IamDb.layerWithoutDeps]` on the service, or
  - Expose/consume `AuthService.DefaultWithoutDependencies` at the app runtime and provide `IamDb.layerWithoutDeps` there.
- This prevents hidden PG allocations and keeps dependencies app-owned.

4) Fix provide order (email wiring)
- File: `packages/iam/infra/src/adapters/better-auth/lib/server-runtime.ts` (will be deprecated)
- If you keep it temporarily, change to:
  ```ts
  Layer.provideMerge(ResendService.Default, AuthEmailService.Default)
  ```
  But the preferred solution is moving all composition into the app (next step) and deleting this file.

5) Create a single app runtime
- New file: `apps/web/src/lib/runtime.ts`
- Compose:
  - Base/platform layer (observability + http + logger)
  - Database: `PgLive`, `DbPool.Live`
  - Email: `ResendService.Default`
  - IAM DB: `IamDb.layerWithoutDeps`
  - Auth email: `AuthEmailService.DefaultWithoutDependencies` provided with `ResendService.Default`
  - Auth: `AuthService.DefaultWithoutDependencies` provided with `IamDb.layerWithoutDeps`
- Export: `export const runtime = ManagedRuntime.make(AppLayer)`.
- Note: To avoid duplicate instantiation during HMR in dev, export a module-level singleton (e.g., cache on `globalThis.__beepRuntime`), or keep it simple and rely on module-level memoization.

6) Route handler uses the app runtime
- File: `apps/web/src/app/api/auth/[...all]/route.ts`
- Import from `apps/web/src/lib/runtime`:
  ```ts
  import { runtime } from "@/lib/runtime"; // using your @/* alias
  import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";

  const program = Effect.map(AuthService, ({ auth }) => auth.handler);
  export const GET = async (req: Request) => (await runtime.runPromise(program))(req);
  export const POST = async (req: Request) => (await runtime.runPromise(program))(req);
  ```
- The previous `serverRuntime` under IAM infra is removed.

7) Organization plugin: remove runtime import
- File: `packages/iam/infra/src/adapters/better-auth/internal/plugins/organization.ts`
- Replace dynamic import of `serverRuntime` + `serverRuntime.runPromise(program)` with `await Effect.runPromise(program)` (no additional provide). The `db` drizzle client is captured by closure and the runtime scope is managed by the app runtime.
- This removes an app-into-slice dependency and avoids circular composition.



---

## Example: App Runtime Composition

Below is a reference composition (not a code change yet). Adjust names to your aliases.

```ts
// apps/web/src/lib/runtime.ts
import "server-only";
import { Layer, Logger } from "effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { NodeSdk } from "@effect/opentelemetry";
import { DevTools } from "@effect/experimental";
import { NodeSocket } from "@effect/platform-node";
import { FetchHttpClient } from "@effect/platform";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { serverEnv } from "@beep/core-env/server";
import { PgLive, DbPool } from "@beep/core-db";
import { ResendService } from "@beep/core-email";
import { IamDb } from "@beep/iam-infra/db/Db";
import { AuthEmailService } from "@beep/iam-infra/adapters/better-auth/AuthEmail.service";
import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";

const DevToolsLive = DevTools.layerWebSocket().pipe(Layer.provide(NodeSocket.layerWebSocketConstructor));

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: `${serverEnv.app.name}-server` },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const Base = Layer.mergeAll(
  NodeSdkLive,
  DevToolsLive,
  FetchHttpClient.layer,
  process.env.NODE_ENV === "production" ? Layer.empty : Logger.pretty
);

const Database = Layer.mergeAll(PgLive, DbPool.Live);

const Email = ResendService.Default;

const IamDatabase = IamDb.layerWithoutDeps.pipe(Layer.provide(Database));

const AuthEmail = AuthEmailService.DefaultWithoutDependencies.pipe(Layer.provide(Email));

const Auth = AuthService.DefaultWithoutDependencies.pipe(Layer.provide(IamDatabase));

const AppLayer = Layer.mergeAll(Base, Database, Email, IamDatabase, AuthEmail, Auth);

export const runtime = ManagedRuntime.make(AppLayer);
```

This ensures: one PG stack, email provided once, IAM DB consumes the single PG stack, and `AuthService` depends on IAM DB only (no hidden provides).

---

## Sequencing and Safety

- Start with small patches (DB split, remove internal provides, fix email provide order).
- Add the app runtime file and switch the route handler import.
- Remove the old IAM-local runtime file.
- Run `pnpm check`, `pnpm lint`, and `pnpm test`.
- Verify no extra PG pools are created (logs + DB metrics). Memoization by reference equality will ensure a single allocation, since we now compose the providers only once at the app layer.

---

## Migration Checklist

- IamDb exposes both `layerWithoutDeps` and `layer`. Update consumers to use `layerWithoutDeps` at the app runtime.
- AuthEmailService exposes `DefaultWithoutDependencies` and optionally defines `dependencies: [ResendService.Default]`.
- AuthService removes internal provides and is wired at the app runtime.
- Route handlers import `runtime` from `apps/web/src/lib/runtime`.
- Organization plugin drops the runtime import and uses `Effect.runPromise`.
- Optional: simplify `core/runtime/server.ts` to be platform-only; only one place provides PG layers.

---

## Why this matches our repo rules

- Vertical-slice boundaries are preserved: slices (`iam/*`) don’t wire app-level layers or import from apps.
- Ports/adapters remain in infra; the app composes layers.
- Effect-first design: no requirement leakage; services expose clean interfaces.
- Production posture: JSON logs by default in prod; pretty logs only in dev.

---

## Next Steps (suggested order)

1) Split `IamDb` layers and remove hidden provide in `AuthService`.
2) Add `DefaultWithoutDependencies` wiring in email/auth services and fix provide orders.
3) Create `apps/web/src/lib/runtime.ts` and point route(s) to it.
4) Remove `server-runtime.ts` in IAM infra and clean up plugin runtime import.
5) Validate in dev and production-like envs.

If you’d like, I can implement these as a series of small PR-style patches next.
