# @beep/contract — Effect-first contract runtime

Effect-based primitives for declaring, implementing, and organizing RPC-style contracts shared across slices. The stable public surface exposes `Contract`, `ContractKit`, and `ContractError`.

## Purpose

Provides a typed, schema-validated contract system for client-runtime interactions across the monorepo. Normalizes payload/success/failure schemas with Effect continuations, enabling consistent RPC communication patterns that are transport-agnostic. Used by `@beep/iam-client`, runtime services, and all future domain slices.

## Key Exports

| Export | Description |
|--------|-------------|
| `Contract` | Build contracts (`make`), annotate metadata (`Domain`, `Method`, `Title`), swap schemas (`setPayload`/`setSuccess`/`setFailure`), derive continuations with abort support, implement handlers, and handle outcomes (`handleOutcome`) |
| `ContractKit` | Group contracts into bundles, register implementations (`of`), build contexts/Layers (`toContext`, `toLayer`), and expose lifted service handlers (`liftService`) with hooks |
| `ContractError` | Schema-backed error taxonomy covering HTTP request/response failures, malformed input/output, and unknown errors with transport-independent metadata |
| `FailureMode` | Type-level discriminator for error handling: `"error"` (fail Effect channel) or `"return"` (return discriminated union) |

## Architecture Fit

- **Vertical Slice + Hexagonal**: Contract definitions are pure schema declarations; transport adapters (HTTP, RPC, Next.js routes) live in owning slices/runtimes
- **Effect-first**: All operations return `Effect`, with continuations providing abort awareness and structured error normalization
- **Transport-agnostic**: Contracts define the "what" (schemas, metadata); runtimes/slices wire the "how" (HTTP clients, RPC handlers, etc.)
- **Path alias**: Import as `@beep/contract`. Public surface aggregates three namespaces from `src/index.ts`

## Module Structure

```
src/
├── index.ts              # Public exports (Contract, ContractKit, ContractError)
├── Contract.ts           # Re-export of contract namespace
├── ContractKit.ts        # Re-export of kit namespace
├── ContractError.ts      # Re-export of error taxonomy
└── internal/
    ├── contract/
    │   ├── index.ts          # Namespace aggregation
    │   ├── contract.ts       # Prototype with schema helpers, annotations, implement
    │   ├── types.ts          # Contract types, FailureMode, Implementation* types
    │   ├── continuation.ts   # FailureContinuation (run, runDecode, handleOutcome)
    │   ├── lift.ts           # Contract.lift for kit/service layers
    │   ├── annotations.ts    # Annotation tags (Title, Domain, Method, etc.)
    │   └── constants.ts      # TypeIds
    ├── contract-kit/
    │   ├── index.ts          # Namespace aggregation
    │   └── contract-kit.ts   # ContractKit.make, toLayer, liftService, hooks
    ├── contract-error/
    │   ├── index.ts          # Namespace aggregation
    │   └── contract-error.ts # Error hierarchy (HttpRequestError, etc.)
    └── utils.ts              # Internal schema helpers
```

## Core Concepts

### Failure Modes

Contracts support two failure handling strategies:

- **`"error"`** (default) — Business failures are raised into the Effect error channel, requiring consumers to handle them explicitly via `Effect.catchTag` or similar
- **`"return"`** — Failures stay in the success channel as discriminated unions (`{ result: "success" | "failure", ... }`). Use `Contract.handleOutcome` to process both cases

### Continuations

Continuations normalize promise-based transport operations into Effect workflows with abort awareness. Two primary methods:

- **`continuation.runDecode(handler)`** — Automatically decodes success responses and raises failures. Best for simple cases where external APIs return data matching your success schema
- **`continuation.run(handler)`** — Returns raw `{ data, error }` for manual handling. Use when you need custom error mapping or conditional logic

Both accept a handler function receiving `{ onSuccess, onError, signal }` callbacks to integrate with promise-based clients.

### Error Mapping

Continuations support composable error mapping via the `mapError` option:

```typescript
const continuation = contract.continuation({
  mapError: (error, ctx) => {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      return new CustomError.NotAllowedError({
        message: error.message,
        domain: ctx.metadata.domain,
      });
    }
    return undefined; // Fall through to default normalization
  },
});
```

**Error processing pipeline** (first match wins):
1. Schema decoding against `failureSchema`
2. Custom `mapError` function(s)
3. Legacy `normalizeError` fallback (deprecated)
4. Default `ContractError.UnknownError`

### Annotations

Use annotation tags to enrich contracts with metadata for logging, telemetry, and observability:

| Annotation | Purpose |
|------------|---------|
| `Contract.Title` | Human-readable contract name |
| `Contract.Domain` | Slice/domain identifier (e.g., `"catalog"`, `"iam"`) |
| `Contract.Method` | RPC-style method name (e.g., `"widgets.list"`) |
| `Contract.SupportsAbort` | Enable/disable abort signal handling |
| `Contract.Visibility` | Access control metadata |
| `Contract.RateLimitKey` | Rate limiting identifier |
| `Contract.Audience` | Target consumer metadata |

## Usage

### Define and Annotate a Contract

```typescript
import { Contract } from "@beep/contract";
import * as Context from "effect/Context";
import * as S from "effect/Schema";

export const ListWidgets = Contract.make("ListWidgets", {
  description: "List widgets visible to the caller",
  payload: { tenantId: S.String },
  success: S.Array(S.Struct({ id: S.String, name: S.String })),
  failure: S.Struct({ message: S.String, code: S.optional(S.String) }),
  failureMode: "error",
})
  .annotate(Contract.Domain, "catalog")
  .annotate(Contract.Method, "widgets.list")
  .annotate(Contract.Title, "List Widgets")
  .annotateContext(Context.empty());
```

### Implement with Automatic Decoding

```typescript
import { ListWidgets } from "./contracts";
import * as Effect from "effect/Effect";

export const listWidgets = ListWidgets.implement((payload, { continuation }) =>
  continuation.runDecode((handlers) =>
    widgetClient.list(payload, handlers)
  )
);
```

### Implement with Manual Error Handling

```typescript
import { CreateWidget } from "./contracts";
import * as Effect from "effect/Effect";

export const createWidget = CreateWidget.implement((payload, { continuation }) =>
  Effect.gen(function* () {
    const result = yield* continuation.run((handlers) =>
      widgetClient.create(payload, handlers)
    );

    if (result.error) {
      return yield* WidgetError.match(result.error);
    }

    return result.data;
  })
);
```

### Handle `failureMode: "return"` with `handleOutcome`

```typescript
import { Contract } from "@beep/contract";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const CreateWidget = Contract.make("CreateWidget", {
  payload: { name: S.String },
  success: S.Struct({ id: S.String }),
  failure: S.Struct({ message: S.String }),
  failureMode: "return",
});

const createWidget = CreateWidget.implement((payload) =>
  Effect.succeed({ result: "failure", failure: { message: payload.name } })
);

export const runCreate = Effect.gen(function* () {
  const outcome = yield* createWidget({ name: "example" });
  return yield* Contract.handleOutcome(outcome, {
    onSuccess: Effect.succeed,
    onFailure: Effect.fail,
  });
});
```

### Group Contracts into a Kit

```typescript
import { ContractKit } from "@beep/contract";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { ListWidgets, CreateWidget, listWidgets, createWidget } from "./contracts";

const WidgetsKit = ContractKit.make(ListWidgets, CreateWidget);

// Type-safe implementation declarations
const implementations = WidgetsKit.of({
  ListWidgets: listWidgets,
  CreateWidget: createWidget,
});

// Convert to Layer
export const WidgetsLayer = WidgetsKit.toLayer(implementations);
```

### Lift Kit into a Service

```typescript
import { ContractKit } from "@beep/contract";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const WidgetsKit = ContractKit.make(ListWidgets, CreateWidget);

export class WidgetsService extends Effect.Service<WidgetsService>()(
  "WidgetsService",
  {
    dependencies: [WidgetsLayer],
    effect: WidgetsKit.liftService({
      hooks: {
        onFailure: ({ name }) => Effect.logWarning({ contract: name }),
        onSuccess: ({ name, result }) => Effect.logDebug({ contract: name, result }),
      },
    }),
    accessors: true,
  }
) {
  static readonly Live = this.Default.pipe(Layer.provide(WidgetsLayer));
}
```

### Map Platform Errors to ContractError

```typescript
import { ContractError } from "@beep/contract";
import type * as HttpClientError from "@effect/platform/HttpClientError";

export const toContractError = (error: HttpClientError.RequestError) =>
  new ContractError.HttpRequestError({
    module: "catalog",
    method: "widgets.list",
    reason: error.reason,
    request: error.request,
    description: error.description,
    cause: error,
  });
```

### Custom Error Mapping in Continuations

```typescript
import { Contract } from "@beep/contract";
import * as Effect from "effect/Effect";

const continuation = contract.continuation({
  domain: "widgets",
  method: "create",
  mapError: (error, ctx) => {
    // Custom error handling
    if (error instanceof TypeError) {
      return new CustomError.InvalidInput({
        message: error.message,
        domain: ctx.metadata.domain,
      });
    }
    // Fall through to default handling
    return undefined;
  },
});
```

## What Belongs Here

- **Pure contract definitions** — schema-backed RPC contracts with payload/success/failure types
- **Contract composition helpers** — `ContractKit` for grouping related contracts
- **Transport-agnostic error taxonomy** — `ContractError` hierarchy covering HTTP, validation, and unknown failures
- **Continuation primitives** — abort-aware Effect wrappers for promise-based transports
- **Metadata annotations** — tags for domain, method, title, visibility, rate limiting, etc.
- **Effect-first helpers** — lifting, encoding/decoding, outcome handling

## What Must NOT Go Here

- **No transport implementations**: No HTTP clients, RPC handlers, or Next.js route adapters (those belong in slices/runtimes)
- **No I/O or side effects**: No network, DB, file system, timers, or environment reads (beyond contract implementation)
- **No platform/framework dependencies**: Avoid DOM APIs, React/Next specifics, Node-only modules
- **No domain-specific business logic**: Domain policies belong in slice `domain` or `application` code
- **No cross-slice imports**: Do not depend on `@beep/iam-*`, `@beep/documents-*`, etc.

Contracts here should be generic, reusable, and transport-independent. If a contract is slice-specific, define it in the slice's `sdk` package.

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and Schema system |
| `@beep/schema` | Schema utilities, EntityId, JSON Schema normalization |
| `@beep/invariant` | Assertion contracts and tagged error schemas |
| `@beep/utils` | Pure runtime helpers (noOp, nullOp, etc.) |
| `@beep/identity` | Package identity helpers |

## Development

```bash
# Type check
bun run --filter @beep/contract check

# Lint
bun run --filter @beep/contract lint

# Lint and auto-fix
bun run --filter @beep/contract lint:fix

# Build
bun run --filter @beep/contract build

# Run tests
bun run --filter @beep/contract test

# Test with coverage
bun run --filter @beep/contract coverage

# Check for circular dependencies (optional)
bun run --filter @beep/contract lint:circular
```

## Guidelines for Authoring Contracts

### Effect Patterns

- **Namespace imports only**: `import * as Effect`, `import * as A`, `import * as Str`
- **No native array/string methods**: Use Effect equivalents (`A.map`, `Str.charAt`, etc.)
- **Uppercase Schema constructors**: `S.Struct`, `S.Array`, `S.String` (never `S.struct`, `S.array`)

### Schema Design

- Treat `Contract.make` payload/success/failure schemas as the single source of truth
- Adjusting schemas requires updating both schema definitions and downstream TypeScript types
- No `any` or unchecked casts; use `@beep/schema` utilities for safe schema manipulation

### Continuation Handling

- Always pass accurate metadata (`domain`, `method`, optional `extra`) for logging/telemetry
- Use `continuation.runDecode` for simple cases, `continuation.run` for custom error handling
- When adding new continuation options, ensure normalization stays idempotent
- Keep `supportsAbort` annotation in sync with abort signal usage

### Failure Mode Semantics

- **`"error"`** mode: Implementations must fail the Effect channel on business failures (default)
- **`"return"`** mode: Implementations return `HandleOutcome`; always use `Contract.handleOutcome`
- Document new failure mode behavior in type definitions and this guide

### ContractKit Patterns

- `liftService` hooks (`onFailure`, `onSuccess`, `onDefect`) should stay pure and never modify payloads
- Keep `mode: "success"` vs `"result"` semantics clearly documented
- Use `ContractKit.of` for type-safe implementation declarations

### Error Taxonomy

- When extending `ContractError`, update schema annotations and docstrings
- Ensure metadata derivations in `failureContinuation` stay consistent
- Provide clear guidance for mapping transport errors to contract errors

### Documentation

- Add JSDoc comments for all new exports
- Keep language domain-neutral (avoid slice-specific terminology)
- Provide usage examples for complex features
- Update AGENTS.md when introducing new patterns

## Testing

- Unit tests with Vitest for contract behavior and schema validation
- Test error mapping pipelines and continuation edge cases
- Verify round-trip encoding/decoding for all schemas
- Property-based tests for schema transformations where applicable

## Versioning and Changes

- Broadly used package — prefer **additive** changes
- For breaking changes to contract/kit APIs:
  - Update affected consumers in the same PR
  - Provide migration notes in commit message
  - Alert downstream packages (`@beep/iam-client`, etc.)

## Relationship to Other Packages

- `@beep/schema` — Schema primitives, EntityId, validation utilities
- `@beep/invariant` — Assertion contracts, InvariantViolation errors
- `@beep/utils` — Pure runtime helpers (noOp, nullOp, nullOpE)
- `@beep/iam-client` — IAM contracts built on this package
- `@beep/runtime/*` — Client/server runtimes that execute contract implementations
- Slice `sdk` packages — Domain-specific contracts extending these primitives

## Real-World Usage

- **`packages/iam/client/src/clients/passkey/passkey.contracts.ts`** — Better Auth-facing contracts via `Contract.make`, grouped with `ContractKit.make`
- **`packages/iam/client/src/clients/passkey/passkey.implementations.ts`** — Uses `contract.continuation` inside `.implement` calls to normalize Better Auth responses
- **`packages/iam/client/src/clients/passkey/passkey.service.ts`** — Lifts contract kit into Effect Service via `ContractKit.liftService`
- Implementations use `continuation.run` for manual error handling or `continuation.runDecode` for automatic success/failure processing

## Additional Resources

- See `AGENTS.md` for detailed authoring guidelines and internal architecture notes
- Consult `docs/patterns/` for contract usage patterns across the monorepo
- Review slice `sdk` packages for real-world contract examples
