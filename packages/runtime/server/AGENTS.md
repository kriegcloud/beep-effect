# AGENTS.md — `@beep/runtime-server`

## Purpose & Fit
- Provides the production-grade Effect runtime that powers server-side entry points, bundling observability, persistence, and IAM/files domain services defined across multiple modules in `packages/runtime/server/src/`.
- Acts as the shared runtime for both API routes (`apps/web/src/app/api/*`) and any future Bun/Node hosts, encapsulating logging, tracing, repository hydration, and auth flows so apps do not hand-wire layers.
- Anchors environment-sensitive behaviour via `@beep/shared-infra` (log level, OTLP endpoints) while deferring domain contracts to `@beep/iam-infra` and `@beep/documents-infra`.

## Surface Map
- `TracingLive` — OTLP trace/log exporters, service name binding (`packages/runtime/server/src/Tracing.ts:16`).
- `LoggingLive` — Pretty console logger in dev, JSON in prod, with log level configuration (`packages/runtime/server/src/Logging.ts:8`).
- `DevToolsLive` — Optional web socket dev tools, only active in dev environment (`packages/runtime/server/src/DevTools.ts:8`).
- `SliceDatabaseClientsLive` — Materializes IAM and Files database live layers (`packages/runtime/server/src/Slices.ts:16`).
- `SliceReposLive` — Combines IAM and Files repository layers (`packages/runtime/server/src/Slices.ts:29`).
- `CoreSliceServicesLive` — Aggregates repositories with database clients and core services like email (`packages/runtime/server/src/Slices.ts:41`).
- `SlicesLive` — Top-level slice layer combining auth service with core slice services (`packages/runtime/server/src/Slices.ts:49`).
- `AppLive` — Root application layer merging all slices, tracing, logging, and dev tools (`packages/runtime/server/src/App.ts:11`).
- `serverRuntime` — `ManagedRuntime` instance providing observability and core services (`packages/runtime/server/src/Runtime.ts:6`).
- `runServerPromise` / `runServerPromiseExit` — Helpers that wrap effects with tracing spans before delegating to `serverRuntime` (`packages/runtime/server/src/Runtime.ts:12`, `:21`).

## Usage Snapshots
- `apps/web/src/app/layout.tsx:38` — Uses `runServerPromise` to resolve app config inside a tracing span before rendering the root layout.
- `apps/web/src/app/api/auth/[...all]/route.ts:8` — Wraps Better Auth handler lookup inside `runServerPromise` to ensure auth dependencies and observability are present.
- `packages/runtime/client/src/services/runtime/live-layer.ts:44` — Mirrors the server observability pattern on the client; referencing it helps align cross-runtime guidance when extending logging behaviour.

## Authoring Guardrails
- Import Effect modules through namespace bindings (`import * as Effect from "effect/Effect";`, `import * as Layer from "effect/Layer";`) and respect the no-native-array/string rule as documented in the root guardrails.
- Never bypass `serverRuntime` when running server effects; downstream hosts rely on its span wrapping (`Effect.withSpan`) for telemetry cohesion.
- Keep observability layers memoizable — prefer `Layer.mergeAll` and `Layer.provideMerge` rather than manual `Layer.build` so Turbo builds can reuse cached allocations.
- Respect environment toggles from `serverEnv.app` (`@beep/shared-infra`) before introducing new logging or dev tooling to avoid leaking debug behaviour in production.
- When extending persistence slices, contribute live layers via `Layer.provideMerge(SliceReposLive, <NewSlice>.Repos.layer)` or `Layer.mergeAll` so that future slices inline cleanly.
- Reuse existing error/tag definitions from `@beep/invariant` / `@beep/errors` instead of ad-hoc classes to keep logging JSON-compatible.

## Quick Recipes
```ts
import {
  AppLive,
  TracingLive,
  LoggingLive,
} from "@beep/runtime-server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";

class JobPort extends Effect.Tag("JobPort")<
  JobPort,
  { readonly run: (payload: string) => Effect.Effect<void> }
>() {}

const JobLayer = Layer.succeed(JobPort, {
  run: (payload: string) => Effect.logInfo("job.received", { payload }),
});

export const jobRuntime = ManagedRuntime.make(
  Layer.mergeAll(JobLayer, AppLive)
);

export const runJob = (payload: string) =>
  jobRuntime.runPromise(
    Effect.gen(function* () {
      const { run } = yield* JobPort;
      yield* run(payload);
    }).pipe(Effect.withSpan("jobs.run"))
  );
```

```ts
import { runServerPromise } from "@beep/runtime-server";
import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import * as Effect from "effect/Effect";

// Request-scoped helper that pulls the Better Auth handler with contextual logging.
export const resolveAuthHandler = async (request: Request) => {
  const handler = await runServerPromise(
    Effect.map(AuthService, ({ auth }) => auth.handler),
    "auth.route"
  );

  return handler(request);
};
```

## Verifications
- `bun run check --filter=@beep/runtime-server` — Type safety against tsconfigs.
- `bun run lint --filter=@beep/runtime-server` — Biome lint with repo conventions.
- `bun run test --filter=@beep/runtime-server` — Vitest suite (currently placeholder but keeps regressions obvious).

## Contributor Checklist
- Align any new environment knobs with `@beep/shared-infra` exports and document defaults here.
- Ensure new layers are exposed via appropriate source files and recorded in **Surface Map**.
- Capture at least one live usage reference for every new helper or runtime entry point.
- Re-run the package scripts listed in **Verifications** and note results in the handoff.
- When modifying the runtime layer structure, update all file path and line number references in this document.
