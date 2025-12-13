# @beep/errors

A library for system-wide errors and error utilities

## Purpose

Effect-first observability toolkit providing logging layers, telemetry helpers, and a schema-backed error taxonomy. This package serves as the foundational observability layer for the entire monorepo, offering runtime-specific entry points (server vs client) while maintaining a shared core of pure helpers. All errors are annotated with HTTP status codes for seamless RPC integration.

## Key Exports

### Shared Exports (client-safe)

| Export | Description |
|--------|-------------|
| `withLogContext` | Annotate an effect with stable log fields for service/component context |
| `withRootSpan` | Wrap an effect with a root span label for distributed tracing |
| `withSpanAndMetrics` | Instrument an effect with spans, counters, and histograms |
| `accumulateEffects` | Partition concurrent effects into successes/errors (pure aggregation) |
| `formatCausePretty` | Pretty-print Effect causes with optional colors |
| `parseLevel` | Convert log level literals to Effect LogLevel values |
| `BeepError.*` | Re-exported error classes namespace (see Tagged Errors below) |

### Client-Only Exports

| Export | Description |
|--------|-------------|
| `accumulateEffectsAndReport` | Accumulate effects and log failures (client-safe variant) |
| `withEnvLogging` | No-op placeholder for env-driven logging (tree-shakeable) |

### Server-Only Exports

| Export | Description |
|--------|-------------|
| `makePrettyConsoleLoggerLayer` | Pretty console logger Layer factory |
| `makePrettyConsoleLogger` | Pretty console Logger instance factory |
| `withPrettyLogging` | Wrap an effect with pretty logging and minimum log level |
| `runWithPrettyLogsExit` | Run an effect with pretty logging and return Exit |
| `makeEnvLoggerLayerFromEnv` | Env-driven logger Layer (`APP_LOG_FORMAT`, `APP_LOG_LEVEL`) |
| `readEnvLoggerConfig` | Parse environment variables for logger configuration |
| `withEnvLogging` | Apply env-driven logging to an effect (server implementation) |
| `accumulateEffectsAndReport` | Accumulate effects and log failures (server variant with rich output) |
| `formatCauseHeading` | Rich error headers with stack parsing and code frames |
| `withResponseErrorLogging` | HTTP client wrapper with error logging |

### Tagged Errors

All errors are exported as individual classes with HTTP status annotations:

| Error Class | Status | Description |
|-------------|--------|-------------|
| `UnknownError` | 500 | Generic wrapper with optional custom message |
| `NotFoundError` | 404 | Resource not found |
| `UniqueViolationError` | 409 | Unique constraint violation |
| `DatabaseError` | 500 | Database operation failure |
| `TransactionError` | 500 | Transaction failure |
| `ConnectionError` | 500 | Connection/channel failure |
| `ParseError` | 400 | Payload/decoding failure |
| `Unauthorized` | 401 | Authentication required |
| `Forbidden` | 403 | Authorization denied |
| `UnrecoverableError` | 500 | Fatal error marker |
| `Es5Error` | N/A | ES5-compatible error wrapper |

## Architecture Fit

- **Client/Server Split**: Strict separation between browser-safe (`client.ts`, `shared.ts`) and Node-dependent (`server.ts`) code
- **Entry Points**: Three module paths for different runtime contexts:
  - `@beep/errors` — Default (re-exports client)
  - `@beep/errors/client` — Browser-safe helpers
  - `@beep/errors/server` — Node.js-specific logging layers
  - `@beep/errors/shared` — Pure, environment-agnostic helpers
- **HTTP Integration**: All `BeepError.*` classes use `HttpApiSchema.annotations` for automatic status code mapping in RPC handlers
- **Effect-First**: No `async/await` or Promises; uses Effect namespace imports and utilities exclusively

## Module Structure

```
src/
├── errors.ts     # BeepError.* tagged error taxonomy
├── shared.ts     # Pure helpers (withLogContext, withSpanAndMetrics, accumulateEffects)
├── client.ts     # Client-safe exports + no-op withEnvLogging
├── server.ts     # Node-specific logger layers, stack parsing, code frames
└── index.ts      # Default export (re-exports client)
```

## Usage

### Namespace Import

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Metric from "effect/Metric";
```

### Instrument Effects with Spans and Metrics

```typescript
import { withLogContext, withRootSpan, withSpanAndMetrics } from "@beep/errors/client";
import * as Effect from "effect/Effect";
import * as Metric from "effect/Metric";

const uploadFile = (file: File) =>
  Effect.gen(function* () {
    // File processing logic
    yield* Effect.logInfo("Processing file", { fileName: file.name });
  });

export const run = uploadFile(myFile).pipe(
  withLogContext({ service: "upload", userId: "user-123" }),
  withRootSpan("upload.processFile"),
  withSpanAndMetrics(
    "upload.processFile",
    {
      successCounter: Metric.counter("upload_success_total"),
      errorCounter: Metric.counter("upload_error_total"),
      durationHistogram: Metric.histogram("upload_duration_ms"),
    },
    { fileSize: myFile.size }
  )
);
```

### Server-Side Pretty Logging

```typescript
import { makePrettyConsoleLoggerLayer, withPrettyLogging } from "@beep/errors/server";
import * as Effect from "effect/Effect";
import * as LogLevel from "effect/LogLevel";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Starting application");
  // Application logic
});

export const run = program.pipe(
  withPrettyLogging({
    level: LogLevel.Info,
    colors: true,
    showDate: true,
    showSpans: true,
    includeCausePretty: true,
  })
);
```

### Environment-Driven Logging

```typescript
import { makeEnvLoggerLayerFromEnv, withEnvLogging } from "@beep/errors/server";
import * as Effect from "effect/Effect";

const main = Effect.gen(function* () {
  yield* Effect.logInfo("Server booting");
  // Server initialization
});

export const run = Effect.gen(function* () {
  const envLayer = yield* makeEnvLoggerLayerFromEnv({
    includeCausePretty: true
  });
  return yield* main.pipe(
    withEnvLogging({ includeCausePretty: true }),
    Effect.provide(envLayer)
  );
});
```

Reads environment variables:
- `APP_LOG_FORMAT` — `pretty` | `logfmt` | `json` (defaults to `pretty` in dev)
- `APP_LOG_LEVEL` — `All` | `Trace` | `Debug` | `Info` | `Warning` | `Error` | `Fatal` | `None`

### Accumulate Concurrent Effects

```typescript
import { accumulateEffectsAndReport } from "@beep/errors/server";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";

const tasks = [
  Effect.succeed("task-1"),
  Effect.fail(new Error("task-2 failed")),
  Effect.succeed("task-3"),
];

export const run = Effect.gen(function* () {
  const { successes, errors } = yield* accumulateEffectsAndReport(tasks, {
    concurrency: "unbounded",
    annotations: { service: "batch-processor" },
    spanLabel: "batch.process",
  });

  const successCount = F.pipe(successes, A.size);
  const errorCount = F.pipe(errors, A.size);

  yield* Effect.logInfo("Batch complete", { successCount, errorCount });
  return { successCount, errorCount };
});
```

### Define Custom Tagged Errors

```typescript
import { BeepError } from "@beep/errors/shared";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export class PaymentRequiredError extends S.TaggedError<PaymentRequiredError>()(
  "PaymentRequiredError",
  {
    subscriptionId: S.String,
    reason: S.String,
    amount: S.Number
  },
  HttpApiSchema.annotations({
    status: 402,
    description: "Payment required to access this resource"
  })
) {
  static toUnknown(cause: unknown): BeepError.UnknownError.Type {
    return new BeepError.UnknownError({
      cause,
      customMessage: "Payment processing failed"
    });
  }
}
```

### Use Built-In Error Types

```typescript
import { BeepError } from "@beep/errors/shared";
import * as Effect from "effect/Effect";

const findUser = (id: string) =>
  Effect.gen(function* () {
    const user = yield* lookupUser(id);
    if (!user) {
      return yield* Effect.fail(
        new BeepError.NotFoundError({
          id,
          resource: "user"
        })
      );
    }
    return user;
  });
```

All built-in error types are accessible via the `BeepError` namespace (see [Tagged Errors](#tagged-errors) above for the complete list with HTTP status codes).

## What Belongs Here

- **Pure observability helpers** safe in all environments (shared)
- **Server-specific logging layers** using Node APIs (fs, os, process)
- **Tagged error taxonomy** with HTTP annotations for RPC
- **Effect-first instrumentation** (spans, metrics, annotations)
- **Cause formatting** and pretty-printing utilities
- **Environment-driven configuration** for runtime logging

## What Must NOT Go Here

- **Transport adapters**: Keep HTTP/RPC/WebSocket handlers in owning slices
- **Domain-specific errors**: Slice-specific errors belong in `packages/*/domain`
- **Business logic**: No validation rules, policies, or workflows
- **Client-unsafe code in shared/client**: Node APIs must stay in `server.ts`

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime, Schema, logging |
| `@effect/platform` | HttpApiSchema annotations |
| `@beep/schema` | Schema utilities |
| `@beep/utils` | Pure runtime helpers |
| `@beep/identity` | Package identity |
| `@beep/constants` | Log level/format schemas |
| `@beep/invariant` | Assertion contracts |
| `picocolors` | Terminal colorization |
| `uuid` | Correlation ID generation |

## Development

```bash
# Type check
bun run --filter @beep/errors check

# Lint
bun run --filter @beep/errors lint

# Lint and auto-fix
bun run --filter @beep/errors lint:fix

# Build
bun run --filter @beep/errors build

# Run tests
bun run --filter @beep/errors test

# Test with coverage
bun run --filter @beep/errors coverage

# Check for circular dependencies
bun run --filter @beep/errors lint:circular
```

## Guidelines for Contributors

### Client/Server Split

- **Shared** (`shared.ts`): Pure helpers, no side effects, browser-safe
- **Client** (`client.ts`): Re-exports shared + client-safe variants (no-op `withEnvLogging`)
- **Server** (`server.ts`): Node APIs only (fs, os, process, TTY)

### Effect Patterns

Always use Effect namespace imports and utilities:

```typescript
// ✅ REQUIRED
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

F.pipe(items, A.map(fn));
F.pipe(str, Str.trim);

// ❌ FORBIDDEN
items.map(fn);
str.trim();
```

### Adding Tagged Errors

1. Define in `src/errors.ts` using `S.TaggedError`
2. Add `HttpApiSchema.annotations({ status })` for HTTP mapping
3. Export via `BeepError.*` namespace
4. Add type namespace declaration for `.Type` and `.Encoded`
5. Document in this README and `AGENTS.md`

### Testing New Helpers

- Place tests in `test/utils/` directory
- Test both success and error paths
- Verify pure functions produce expected outputs
- For logging helpers, verify annotations/spans are applied
- For accumulation, test concurrency behavior

### Environment Variables

When adding new env-driven configuration:
1. Define schema in `@beep/constants`
2. Parse in `shared.ts` if pure, otherwise `server.ts`
3. Document in `docs/PRODUCTION_CHECKLIST.md`
4. Warn on deprecated `NEXT_PUBLIC_*` usage

## Relationship to Other Packages

- `@beep/schema` — Shared schema primitives and EntityId factories
- `@beep/invariant` — Assertion contracts and tagged error base
- `@beep/utils` — Pure string/entity helpers (no validation)
- `@beep/constants` — Schema-backed enums for log levels/formats
- `packages/*/domain` — Domain-specific error extensions
- `packages/runtime/*` — ManagedRuntime integration points

## Testing

- Use Bun test framework via `bun test`
- Tests located in `test/` directory
- Focus on pure function behavior and Effect composition
- Mock Node APIs when testing server-only code

## Versioning and Changes

- Foundational package — prefer **additive** changes
- For breaking changes, coordinate with all consuming slices
- Document migrations in PR description
