---
path: packages/common/errors
summary: Tagged errors and observability utilities with client/server split for Effect apps
tags: [errors, effect, observability, logging, telemetry, tagged-error]
---

# @beep/errors

Provides the canonical error namespace (`BeepError.*`) and observability toolkit for the monorepo. All tagged errors include `HttpApiSchema.annotations` for HTTP status mapping. Entry points are split: `client` (browser-safe), `server` (Node APIs), and `shared` (pure helpers).

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
|   errors.ts       |     |   shared.ts       |     |   server.ts       |
| BeepError.*       | --> | withLogContext    | <-- | makePrettyLogger  |
| Tagged + HTTP     |     | withSpanAndMetrics|     | withEnvLogging    |
|-------------------|     |-------------------|     |-------------------|
        |                         |
        v                         v
|-------------------------------------------|
|              client.ts                    |
| Re-exports shared + no-op withEnvLogging  |
|-------------------------------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `errors.ts` | Tagged errors: NotFoundError, DatabaseError, Unauthorized, etc. |
| `shared.ts` | Pure helpers: withLogContext, withSpanAndMetrics, accumulateEffects |
| `client.ts` | Browser-safe re-exports, tree-shakeable withEnvLogging |
| `server.ts` | Node-specific: pretty logger, env-driven logging, cause formatting |

## Usage Patterns

### Creating Domain Errors
```typescript
import * as S from "effect/Schema";
import { BeepError } from "@beep/errors/shared";

export class PaymentFailedError extends S.TaggedError<PaymentFailedError>()(
  "PaymentFailedError",
  { orderId: S.String, reason: S.String },
  BeepError.Unauthorized.annotations
) {}
```

### Observability Pipeline
```typescript
import * as Effect from "effect/Effect";
import { withLogContext, withRootSpan } from "@beep/errors/client";

const operation = myEffect.pipe(
  withLogContext({ service: "payments", orderId }),
  withRootSpan("payments.process")
);
```

### Server Logging Setup
```typescript
import * as Layer from "effect/Layer";
import { makePrettyConsoleLoggerLayer, withEnvLogging } from "@beep/errors/server";

const LoggerLayer = makePrettyConsoleLoggerLayer({ includeCausePretty: true });
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Client/server split | Browser bundles stay tree-shakeable, no Node APIs leak |
| HttpApiSchema annotations | Tagged errors map directly to HTTP status codes for RPC |
| accumulateEffects vs AndReport | Core logic pure, only orchestration layers do side effects |
| ENV-driven logging | APP_LOG_FORMAT/APP_LOG_LEVEL switch JSON/pretty per environment |

## Dependencies

**Internal**: `@beep/constants`
**External**: `effect`, `@effect/platform`, `picocolors`

## Related

- **AGENTS.md** - Detailed contributor guidance and recipes
