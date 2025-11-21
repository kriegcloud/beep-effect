# @beep/errors — Shared logging, telemetry, and error taxonomy

Effect-first observability toolkit used across runtimes. Ships server-only logging layers, client-safe helpers, and a schema-backed error namespace (`BeepError.*`). Respect the client/server split: Node-only code must stay under `@beep/errors/server`; browser-safe code under `@beep/errors/client` or `shared`.

## Fit and scope
- Use for platform-agnostic logging wrappers, span/metric helpers, and contract-friendly errors annotated with `HttpApiSchema`.
- Keep transport adapters and route handlers in their owning slice; this package should remain infrastructure-neutral.
- Client entry point must stay free of Node/FS/OS/process access so it can ship to browsers.
- Extend the error taxonomy only with schema-backed, status-aware tagged errors.

## Module map
- `@beep/errors/shared` — pure helpers (`withLogContext`, `withRootSpan`, `withSpanAndMetrics`, `accumulateEffects`, `parseLevel`, `formatCausePretty`, `BeepError` re-export). Safe in all environments.
- `@beep/errors/client` — re-exports shared + client-safe `withEnvLogging` (no-op) and `accumulateEffectsAndReport` that logs via console without Node features.
- `@beep/errors/server` — env-driven logger layers (`makeEnvLoggerLayerFromEnv`, `withEnvLogging`, `makePrettyConsoleLoggerLayer`), pretty console logger, stack/code-frame rendering (`formatCauseHeading`), and server-flavored `accumulateEffectsAndReport`.
- `BeepError.*` (from `src/errors.ts`) — tagged errors annotated with HTTP status: `UnknownError`, `NotFoundError`, `UniqueViolationError`, `DatabaseError`, `TransactionError`, `ConnectionError`, `ParseError`, `Unauthorized`, `Forbidden`, `UnrecoverableError`, plus `Es5Error` shim.

## Usage patterns

Instrument an effect with spans, metrics, and annotations (client-safe)
```ts
import { withLogContext, withRootSpan, withSpanAndMetrics } from "@beep/errors/client";
import * as Effect from "effect/Effect";
import * as Metric from "effect/Metric";

const program = Effect.gen(function* () {
  // work
});

export const run = program.pipe(
  withLogContext({ service: "upload" }),
  withRootSpan("upload.run"),
  withSpanAndMetrics("upload.run", {
    successCounter: Metric.counter("upload_success_total"),
    errorCounter: Metric.counter("upload_error_total"),
    durationHistogram: Metric.histogram("upload_duration_ms"),
  })
);
```

Parse env-driven logging on the server and apply it
```ts
import { makeEnvLoggerLayerFromEnv, withEnvLogging } from "@beep/errors/server";
import * as Effect from "effect/Effect";

const main = Effect.logInfo("boot");

export const run = Effect.gen(function* () {
  const envLayer = yield* makeEnvLoggerLayerFromEnv({ includeCausePretty: true });
  return yield* main.pipe(withEnvLogging({ includeCausePretty: true }), Effect.provide(envLayer));
});
```

Accumulate concurrent effects and report failures
```ts
import { accumulateEffectsAndReport } from "@beep/errors/server";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const tasks = [
  Effect.succeed("ok"),
  Effect.fail(new Error("boom")),
] as const;

export const run = Effect.gen(function* () {
  const { successes, errors } = yield* accumulateEffectsAndReport(tasks, {
    concurrency: "unbounded",
    annotations: { service: "batch" },
  });

  const okCount = F.pipe(successes, A.size);
  const errCount = F.pipe(errors, A.size);
  return { okCount, errCount };
});
```

Define a slice-specific tagged error annotated for HTTP
```ts
import { BeepError } from "@beep/errors/shared";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export class BillingDeniedError extends S.TaggedError<BillingDeniedError>()(
  "BillingDeniedError",
  { subscriptionId: S.String, reason: S.String },
  HttpApiSchema.annotations({ status: 402, description: "Billing failed for this subscription" })
) {
  static toUnknown(): BeepError.UnknownError.Type {
    return new BeepError.UnknownError({ cause: new Error("billing denied") });
  }
}
```

## Architecture notes
- Effect namespace imports only; avoid native array/string helpers in new code. For collections, use `A.*` + `F.pipe`.
- Client/server split is strict: Node APIs (fs, os, process, path, TTY) stay in `server.ts`. Shared/client must stay side-effect free and browser-safe.
- Logging defaults: `readEnvLoggerConfig` maps `APP_LOG_FORMAT` (`pretty` | `logFmt` | `json`) and `APP_LOG_LEVEL`; warns in dev on `NEXT_PUBLIC_*` usage.
- Cause rendering (server) is opt-in via `includeCausePretty`; code-frames are guarded to avoid noisy logs in prod paths.
- Accumulation helpers separate pure aggregation (`accumulateEffects`) from reporting variants (`accumulateEffectsAndReport`).

## Verification commands
- `bunx turbo run lint --filter=@beep/errors`
- `bunx turbo run check --filter=@beep/errors`
- `bunx turbo run test --filter=@beep/errors`
- Optional: `bun run --filter @beep/errors build`, `bun run --filter @beep/errors coverage`, `bunx turbo run lint:circular --filter=@beep/errors`

## Contributor checklist
- Keep client entry points browser-safe; move Node-only logic to `server.ts`.
- Annotate new TaggedErrors with `HttpApiSchema.annotations({ status })` and add usage notes in this README/AGENT.
- Preserve Effect namespace imports; no native array/string helpers in examples or implementations.
- Update tests under `test/utils` for new logging/accumulation behavior; note env knob changes in `docs/PRODUCTION_CHECKLIST.md`.
- Run lint + check (and tests/build when touching emitted surfaces) before handoff.
