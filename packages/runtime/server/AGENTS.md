# AGENTS.md — `@beep/runtime-server`

## Purpose & Fit
- Provides the production-grade Effect runtime that powers server-side entry points, bundling observability, persistence, and IAM/files domain services defined in `packages/runtime/server/src/server-runtime.ts`.
- Acts as the shared runtime for both API routes (`apps/web/src/app/api/*`) and any future Bun/Node hosts, encapsulating logging, tracing, repository hydration, and auth flows so apps do not hand-wire layers.
- Anchors environment-sensitive behaviour via `@beep/core-env/server` (log level, OTLP endpoints) while deferring domain contracts to `@beep/iam-infra` and `@beep/files-infra`.

## Surface Map
- `TelemetryLive` — OTLP trace/log exporters, service name binding (`packages/runtime/server/src/server-runtime.ts:38`).
- `LoggerLive` — Pretty console logger in dev, JSON in prod (`packages/runtime/server/src/server-runtime.ts:49`).
- `LogLevelLive` — Applies `serverEnv.app.logLevel` to the Effect logger (`packages/runtime/server/src/server-runtime.ts:52`).
- `DevToolsLive` — Optional web socket dev tools, only active when `serverEnv.app.env === "dev"` (`packages/runtime/server/src/server-runtime.ts:57`).
- `ObservabilityLive` — Merge of logging, telemetry, and dev tooling layers (`packages/runtime/server/src/server-runtime.ts:62`).
- `SliceRepositoriesLive` — Combines IAM and Files repository layers (`packages/runtime/server/src/server-runtime.ts:69`).
- `SliceDatabasesLive` — Materialises IAM and Files database live layers (`packages/runtime/server/src/server-runtime.ts:72`).
- `DatabaseInfrastructureLive` — Supplies slice DB connections into the shared `Db.Live` layer (`packages/runtime/server/src/server-runtime.ts:75`).
- `RepositoriesLive` — Exposes repo services backed by live DB connections (`packages/runtime/server/src/server-runtime.ts:78`).
- `CoreServicesLive` — Aggregates repositories with auth email wiring (`packages/runtime/server/src/server-runtime.ts:90`).
- `serverRuntime` — `ManagedRuntime` instance providing observability and core services (`packages/runtime/server/src/server-runtime.ts:103`).
- `runServerPromise` / `runServerPromiseExit` — Helpers that wrap effects with tracing spans before delegating to `serverRuntime` (`packages/runtime/server/src/server-runtime.ts:110`, `:119`).

## Usage Snapshots
- `apps/web/src/app/layout.tsx:67` — Uses `runServerPromise` to resolve nonce + app config inside a tracing span before rendering the root layout.
- `apps/web/src/app/api/auth/[...all]/route.ts:12` — Wraps Better Auth handler lookup inside `runServerPromise` to ensure auth dependencies and observability are present.
- `packages/runtime/client/src/services/runtime/live-layer.ts:39` — Mirrors the server observability pattern on the client; referencing it helps align cross-runtime guidance when extending logging behaviour.

## Tooling & Docs Shortcuts
- `context7__get-library-docs`  
  ```json
  {"context7CompatibleLibraryID":"/llmstxt/effect_website_llms-full_txt","topic":"ManagedRuntime Layer Effect.withSpan"}
  ```
- `effect_docs__effect_docs_search`  
  ```json
  {"query":"Layer.provideMerge"}
  ```
- `effect_docs__get_effect_doc`  
  ```json
  {"documentId":7107}
  ```
- `effect_docs__get_effect_doc`  
  ```json
  {"documentId":7080}
  ```
- Package scripts (run from repo root): `bun run check --filter=@beep/runtime-server`, `bun run lint --filter=@beep/runtime-server`, `bun run test --filter=@beep/runtime-server`.

## Authoring Guardrails
- Import Effect modules through namespace bindings (`import * as Effect from "effect/Effect";`, `import * as Layer from "effect/Layer";`) and respect the no-native-array/string rule as documented in the root guardrails.
- Never bypass `serverRuntime` when running server effects; downstream hosts rely on its span wrapping (`Effect.withSpan`) for telemetry cohesion.
- Keep observability layers memoizable — prefer `Layer.mergeAll` and `Layer.provideMerge` rather than manual `Layer.build` so Turbo builds can reuse cached allocations.
- Respect environment toggles from `serverEnv.app` (`@beep/core-env/src/server.ts`) before introducing new logging or dev tooling to avoid leaking debug behaviour in production.
- When extending persistence slices, contribute live layers via `Layer.provideMerge(SliceRepositoriesLive, <NewSlice>.Repos.layer)` or `Layer.mergeAll` so that future slices inline cleanly.
- Reuse existing error/tag definitions from `@beep/invariant` / `@beep/errors` instead of ad-hoc classes to keep logging JSON-compatible.

## Quick Recipes
```ts
import {
  CoreServicesLive,
  ObservabilityLive,
  LogLevelLive,
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
  Layer.mergeAll(JobLayer, CoreServicesLive).pipe(Layer.provide([ObservabilityLive, LogLevelLive]))
);

export const runJob = (payload: string) =>
  jobRuntime.runPromise(
    Effect.gen(function* () {
      const { run } = yield* JobPort;
      yield* run(payload);
    }).pipe(Effect.withSpan("jobs.run")),
    "jobs.run"
  );
```

```ts
import { runServerPromise } from "@beep/runtime-server";
import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import * as Effect from "effect/Effect";

// Request-scoped helper that pulls the Better Auth handler with contextual logging.
export const resolveAuthHandler = async (request: Request) => {
  const handler = await runServerPromise(
    Effect.flatMap(AuthService, ({ auth }) =>
      Effect.gen(function* () {
        const handler = auth();
        yield* Effect.logDebug("Resolved auth handler");
        return handler;
      })
    ).pipe(Effect.withSpan("auth.resolve")),
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
- Update `AGENTS_MD_PLAN.md` if the scope or export set changes before editing this guide.
- Align any new environment knobs with `packages/core/env/src/server.ts` and document defaults here.
- Ensure new layers are exposed via `src/server-runtime.ts` exports and recorded in **Surface Map**.
- Capture at least one live usage reference for every new helper or runtime entry point.
- Re-run the package scripts listed in **Verifications** and note results in the handoff.
