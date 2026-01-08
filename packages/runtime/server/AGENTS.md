# AGENTS.md — `@beep/runtime-server`

## Purpose & Fit
- Provides the production-grade Effect runtime that powers server-side entry points, bundling observability, persistence, and IAM/files domain services defined across multiple modules in `packages/runtime/server/src/`.
- Acts as the shared runtime for both API routes (`apps/web/src/app/api/*`) and any future Bun/Node hosts, encapsulating logging, tracing, repository hydration, and auth flows so apps do not hand-wire layers.
- Anchors environment-sensitive behaviour via `@beep/shared-server` (log level, OTLP endpoints) while deferring domain contracts to `@beep/iam-server` and `@beep/documents-server`.

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
- Respect environment toggles from `serverEnv.app` (`@beep/shared-server`) before introducing new logging or dev tooling to avoid leaking debug behaviour in production.
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
import { AuthService } from "@beep/iam-server/adapters/better-auth/Auth.service";
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

## Gotchas

### Layer Composition Order Matters
- Layers are composed left-to-right in `Layer.mergeAll`; if two layers provide the same service, the rightmost wins. ALWAYS verify which layer should take precedence when extending `AppLive`.
- `Layer.provideMerge` vs `Layer.provide`: use `provideMerge` when you want to expose the dependency to downstream layers; use `provide` when the dependency should remain internal.

### ManagedRuntime Lifecycle
- `ManagedRuntime.make` allocates resources lazily on first effect execution, not at construction time. If layer initialization has side effects (DB connections, OTLP exporters), they occur on the first `runPromise` call.
- NEVER create multiple `ManagedRuntime` instances with overlapping resource layers (e.g., database pools); this leaks connections. Use a single `serverRuntime` and compose additional services via layer extension.
- The runtime disposes resources when the process exits, but in hot-reload scenarios (Next.js dev), the old runtime may not fully dispose before the new one starts. Watch for "connection refused" or "too many clients" errors in development.

### Effect Stream Consumption
- Effect streams (`Stream<A, E, R>`) must be consumed (via `Stream.runCollect`, `Stream.runForEach`, etc.) or they do nothing. Forgetting to run a stream is a silent bug that produces no output and no error.
- When streaming database results, ALWAYS ensure the stream is consumed within the same transaction scope if consistency is required. Streams that escape their transaction context may read stale data.

### Tracing Span Propagation
- `runServerPromise(effect, spanName)` wraps the effect in a span, but nested `Effect.withSpan` calls create child spans only if the outer span context is properly propagated. NEVER use `Effect.runPromise` directly inside `runServerPromise`; it breaks the span hierarchy.
- OTLP exporters batch spans asynchronously. In short-lived processes (serverless functions), spans may be lost if the process exits before the batch flushes. Use `TracingLive` flush hooks in Lambda/edge contexts.

### Environment Configuration Timing
- `serverEnv` is parsed at module load time via Effect Config. If environment variables are set after module initialization (e.g., via dotenv loaded late), the runtime will have stale or missing values. ALWAYS ensure `.env` is loaded before any `@beep/runtime-server` imports.

### Error Type Narrowing
- `Effect.catchTag` narrows the error channel but ONLY if the tag is correctly defined via `Data.TaggedError` or similar. Ad-hoc error objects without a `_tag` property will not match and will propagate unhandled.

## Contributor Checklist
- Align any new environment knobs with `@beep/shared-server` exports and document defaults here.
- Ensure new layers are exposed via appropriate source files and recorded in **Surface Map**.
- Capture at least one live usage reference for every new helper or runtime entry point.
- Re-run the package scripts listed in **Verifications** and note results in the handoff.
- When modifying the runtime layer structure, update all file path and line number references in this document.
