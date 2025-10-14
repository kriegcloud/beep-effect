# @beep/errors Agent Guide

## Purpose & Fit
- Provides the shared logging, telemetry, and error-tagging toolkit that every slice relies on for observability.
- Exposes entry points tuned for server (`@beep/errors/server`) and browser/runtime-safe (`@beep/errors/client`) contexts while sharing the core helpers under `@beep/errors/shared`.
- Hosts the canonical error namespace (`BeepError.*`) used by higher-level domains (for example `packages/iam/domain/src/IamError.ts`).
- Bridges repo-wide env settings (`APP_LOG_FORMAT`, `APP_LOG_LEVEL`) with the Effect logger stack so runtimes can switch between JSON, logfmt, and pretty output.

## Surface Map
| Module | Key exports | Notes |
| --- | --- | --- |
| `src/errors.ts` (`BeepError.*`) | `UnknownError`, `NotFoundError`, `DatabaseError`, etc. | Tagged errors pre-annotated with `HttpApiSchema.annotations` for status-aware RPC responses. |
| `src/shared.ts` | `withLogContext`, `withRootSpan`, `withSpanAndMetrics`, `accumulateEffects`, `parseLevel`, `formatCausePretty`, `BeepError` re-export | Pure helpers usable in browser bundles; no Node APIs. |
| `src/client.ts` | Re-export of shared helpers + client-safe `withEnvLogging`, `accumulateEffectsAndReport` | `withEnvLogging` is intentionally a no-op so web bundles remain tree-shakeable. |
| `src/server.ts` | Pretty console logger factory (`makePrettyConsoleLoggerLayer`), environment-driven logger wiring (`makeEnvLoggerLayerFromEnv`, `withEnvLogging`), stack-parsing utilities (`formatCauseHeading`) | Uses Node FS/OS APIs—keep behind server entry points. |
| `test/utils/*` | Coverage for env parsing, accumulate aggregation, heading formatting, pretty cause rendering | Use as references when extending behavior. |

## Usage Snapshots
- `apps/web/src/features/upload/UploadFileService.ts:46` – aggregates file processing via `accumulateEffectsAndReport(...)`.
- `apps/web/src/features/upload/observability.ts:43` – composes `withLogContext`, `withRootSpan`, and `withSpanAndMetrics` to instrument the upload pipeline.
- `packages/runtime/server/src/server-runtime.ts:33` – swaps in `makePrettyConsoleLoggerLayer()` for dev-friendly logging.
- `packages/iam/domain/src/IamError.ts:1` – aliases `BeepError.UnknownError` for domain-specific error hierarchies.
- `docs/PRODUCTION_CHECKLIST.md:69` – documents operational expectations for `makeEnvLoggerLayerFromEnv`, `withEnvLogging`, and `accumulateEffectsAndReport`.

## Tooling & Docs Shortcuts
- Run package-scoped checks from repo root (all wrap `dotenvx` automatically):
  - `bunx turbo run test --filter=@beep/errors`
  - `bunx turbo run lint --filter=@beep/errors`
  - `bunx turbo run check --filter=@beep/errors`
- Build artifacts locally (needed before publishing bundles): `bun run --filter @beep/errors build`
- Effect references fetched during authoring:
  - `effect_docs__effect_docs_search` with payload `{"query":"Logger.withMinimumLogLevel Effect"}`
  - `effect_docs__get_effect_doc` with payload `{"documentId":7205}`
  - `context7__resolve-library-id` with payload `{"libraryName":"@effect/platform"}`
  - `context7__get-library-docs` with payload `{"context7CompatibleLibraryID":"/websites/effect-ts_github_io_effect","tokens":800,"topic":"HttpApiSchema annotations"}`
- Local tests leverage `bun test`; you can target a file via `bun run --filter @beep/errors test -- --filter=heading` (delegates to Bun’s `--filter` flag).

## Authoring Guardrails
- **Effect-first imports**: always namespace Effect modules (`import * as Effect from "effect/Effect"`, `import * as A from "effect/Array"`, `import * as Str from "effect/String"`, etc.). Never fall back to native `Array` / `String` helpers in new code paths.
- **Client vs Server split**: Any helper that touches Node globals (FS, OS, process) or colorized output must live behind `@beep/errors/server`. Shared and client entry points must remain side-effect free and bundle-safe.
- **Environment defaults**: `withEnvLogging` reads `APP_LOG_FORMAT` / `APP_LOG_LEVEL` (falling back to pretty+All outside prod). If you introduce new env toggles, keep the shared parser in `shared.ts` so both runtime surfaces stay in sync and log a deprecation warning when touching legacy `NEXT_PUBLIC_*` keys.
- **Metrics wiring**: `withSpanAndMetrics` expects Effect Metric counters/histograms. Pass counters that are already registered with the service’s Layer to avoid duplicate instrumentation.
- **Cause rendering**: `formatCauseHeading` reads source files to render code frames. Guard any new IO so it respects `PrettyLoggerConfig.includeCausePretty` and remains optional for high-volume warning paths.
- **Accumulation**: `accumulateEffects` partitions successes/errors without logging. Only the `*AndReport` variants perform side effects—use them deliberately in orchestration layers, not core business logic.

## Quick Recipes
```ts
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Metric from "effect/Metric";
import { accumulateEffectsAndReport, withLogContext, withRootSpan, withSpanAndMetrics } from "@beep/errors/client";

interface UploadJob {
  readonly file: File;
  readonly effect: Effect.Effect<unknown, Error>;
}

const processJobs = (jobs: ReadonlyArray<UploadJob>) =>
  Effect.gen(function* () {
    const effects = F.pipe(
      jobs,
      A.map((job) =>
        job.effect.pipe(
          withLogContext({ service: "upload", fileName: job.file.name }),
          withRootSpan("upload.processFile"),
          withSpanAndMetrics(
            "upload.processFile",
            {
              successCounter: Metric.counter("upload.files_processed_total"),
              errorCounter: Metric.counter("upload.files_failed_total"),
              durationHistogram: Metric.histogram("upload.process_file_duration_ms")
            },
            { service: "upload", fileSize: job.file.size }
          )
        )
      )
    );

    return yield* accumulateEffectsAndReport(effects, {
      concurrency: "unbounded",
      annotations: { service: "upload" }
    });
  });
```

```ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as LogLevel from "effect/LogLevel";
import * as Logger from "effect/Logger";
import { makeEnvLoggerLayerFromEnv, makePrettyConsoleLoggerLayer, withEnvLogging } from "@beep/errors/server";

const ObservabilityLayer = Layer.mergeAll(
  makePrettyConsoleLoggerLayer({ includeCausePretty: true }),
  Logger.minimumLogLevel(LogLevel.Info)
);

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Booting API server");
  // ...
});

const main = Effect.gen(function* () {
  const envLayer = yield* makeEnvLoggerLayerFromEnv({ colors: process.stdout.isTTY });
  return yield* program.pipe(
    withEnvLogging({ colors: process.stdout.isTTY }),
    Effect.provide(ObservabilityLayer),
    Effect.provide(envLayer)
  );
});
```

```ts
import * as S from "effect/Schema";
import { BeepError } from "@beep/errors/shared";

export class BillingDeniedError extends S.TaggedError<BillingDeniedError>()(
  "BillingDeniedError",
  { subscriptionId: S.String, reason: S.String },
  BeepError.Unauthorized.annotations
) {}
```

## Verifications
- `bunx turbo run test --filter=@beep/errors` – runs Bun test suites under `packages/common/errors/test`.
- `bunx turbo run lint --filter=@beep/errors` – enforces Biome formatting plus circular checks defined in the package.
- `bunx turbo run check --filter=@beep/errors` – Typescript project references (`tsconfig.*`) validation.
- `bun run --filter @beep/errors coverage` – optional coverage sweep when updating observability helpers.

## Contributor Checklist
- [ ] Confirm new helpers respect the client/server split and avoid Node APIs unless exporting from `server.ts`.
- [ ] Extend or add tests under `packages/common/errors/test/utils` for any new logging or accumulation behavior.
- [ ] Update usage snapshots within this guide when introducing new canonical entry points.
- [ ] Re-run `bunx turbo run lint --filter=@beep/errors` and `bunx turbo run test --filter=@beep/errors`; note results in handoff.
- [ ] If introducing additional env knobs, document them in `docs/PRODUCTION_CHECKLIST.md` and mirror warnings for deprecated variables.
- [ ] When adding new TaggedErrors, annotate them with `HttpApiSchema.annotations({ status })` and link to caller workflows (e.g., IAM or Files slices).
