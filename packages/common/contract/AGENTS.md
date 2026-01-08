# AGENTS Guide — `@beep/contract`

## Purpose & Fit

- Effect-first contract runtime powering all RPC-style interactions shared across slices (`@beep/iam-client` contracts, runtime services, and future documents slices).
- Publishes three public entry points (`Contract`, `ContractKit`, `ContractError`) that wrap the internal implementation and keep internal layout flexible.
- Consumed anywhere we need typed payload schemas, runtime-independent error envelopes, continuations with abort awareness, or contract grouping/lifting helpers.
- **Dependencies**: `effect`, `@beep/schema`, `@beep/invariant`, `@beep/utils`, `@beep/identity` (all peer dependencies).

## Surface Map

- **Public exports (`src/index.ts`)** — aggregates `Contract`, `ContractKit`, and `ContractError`; import from here in downstream packages.
- **Contract runtime (`src/internal/contract/*`)**
  - `contract.ts` — prototype with schema helpers, annotations, `continuation`, and `implement`.
  - `types.ts` — all shared types (contracts, FailureMode, Implementation* types, metadata helpers).
  - `continuation.ts` — metadata derivation plus `FailureContinuation` (with `run`, `runDecode` methods) and `handleOutcome`.
  - `lift.ts` — `Contract.lift` implementation used by kits/service layers.
  - `annotations.ts` — annotation tags (`Title`, `Domain`, `Method`, `SupportsAbort`, `Visibility`, `RateLimitKey`, `Audience`).
  - `constants.ts`, `index.ts` — TypeIds, namespace export.
- **Contract kits (`src/internal/contract-kit/*`)** — `contract-kit.ts` implements `ContractKit.make`, `.toLayer`, `.liftService` plus hooks/modes.
- **Error taxonomy (`src/internal/contract-error/*`)** — schema-backed `ContractError` hierarchy (HttpRequestError, HttpResponseError, MalformedInput, MalformedOutput, UnknownError).
- **Utilities (`src/internal/utils.ts`)** — schema helpers (e.g., `constEmptyStruct`, `toSchemaAnyNoContext`) reused across runtime files.

## Usage Snapshots

- `packages/iam/client/src/clients/passkey/passkey.contracts.ts` defines Better Auth-facing contracts via `Contract.make` and groups them with `ContractKit.make`.
- `packages/iam/client/src/clients/passkey/passkey.implementations.ts` uses `contract.continuation` inside `.implement` calls to normalize Better Auth responses and surface `IamError`.
- `packages/iam/client/src/clients/passkey/passkey.service.ts` lifts a contract kit into an Effect Service via `ContractKit.liftService`, wiring hooks for UI runtimes.
- Implementations use `continuation.run` for manual error handling or `continuation.runDecode` for automatic success/failure processing.

## Authoring Guardrails

- **IMPORTANT: Namespace Effect imports** everywhere (`import * as Effect`, `import * as A`, `import * as Str`). Native array/string helpers are BANNED; ALWAYS use the Effect equivalents referenced throughout docstrings.
- Treat `Contract.make` payload/success/failure schemas as the single source of truth. Adjusting runtime fields requires updating both schema definitions and downstream TypeScript types (NEVER use `any`/casts without `toSchemaAnyNoContext`).
- Continuations: ALWAYS pass accurate metadata (`domain`, `method`, optional `extra`). When adding new continuation options, keep normalization idempotent and ensure `supportsAbort` stays in sync with annotations.
- Failure modes:
  - `"error"` — implementations MUST fail the Effect channel on business failures (default).
  - `"return"` — implementations return `HandleOutcome` where failures stay in the success channel; `Contract.handleOutcome` MUST cover both.
  - ALWAYS document new behavior in `types.ts` + this guide before exposing publicly.
- `ContractKit.liftService`: hooking `onFailure`/`onSuccess`/`onDefect` MUST stay pure and NEVER modify payloads. Keep `Mode = "success"` vs `"result"` semantics documented.
- When extending `ContractError`, update schema annotations, docstrings, and any derivations in `failureContinuation` that rely on metadata.
- Every new helper MUST ship with JSDoc + code comments describing when to use it; NEVER use IAM- or Better Auth-specific prose to keep the package slice-agnostic.

## Key Concepts

### Continuation Methods

Continuations provide two main methods for handling promise-based operations:

- **`continuation.runDecode(handler)`** — Automatically decodes success responses and raises failures. Best for simple cases where the external API returns data matching your success schema.
- **`continuation.run(handler)`** — Returns a raw result object with `{ data, error }` for manual handling. Use when you need custom error mapping or conditional logic.

Both methods accept a handler function that receives `{ onSuccess, onError, signal }` callbacks to integrate with promise-based clients.

### Error Mapping (V2)

Continuations support composable error mapping via the `mapError` option in `contract.continuation()`:

```ts
const continuation = contract.continuation({
  mapError: (error, ctx) => {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      return new PasskeyError.NotAllowedError({
        message: error.message,
        domain: ctx.metadata.domain,
      });
    }
    return undefined; // Fall through to default normalization
  },
});
```

Error processing pipeline (first match wins):
1. **Schema Decoding** — Attempts to decode against `failureSchema`
2. **Custom Mappers** — User-provided `mapError` function(s)
3. **Legacy Normalizer** — Deprecated `normalizeError` fallback
4. **Default** — Creates `ContractError.UnknownError`

### FailureMode

Contracts support two failure modes:

- **`"error"`** (default) — Failures are raised into the Effect error channel, requiring consumers to handle them.
- **`"return"`** — Failures stay in the success channel as discriminated unions. Use with `Contract.handleOutcome` to handle both success and failure cases.

## Quick Recipes

### Define & annotate a contract

```ts
import { Contract } from "@beep/contract";
import * as S from "effect/Schema";

export const ListWidgets = Contract.make("ListWidgets", {
  description: "Fetch widgets scoped to a tenant",
  payload: { tenantId: S.String },
  success: S.Array(S.Struct({ id: S.String, label: S.String })),
  failure: S.Struct({ message: S.String }),
  failureMode: "error",
})
  .annotate(Contract.Title, "List Widgets")
  .annotate(Contract.Domain, "catalog")
  .annotate(Contract.Method, "widgets.list");
```

### Implement with a continuation

```ts
// Using runDecode for automatic success/failure handling
export const listWidgets = ListWidgets.implement((payload, { continuation }) =>
  continuation.runDecode((handlers) =>
    widgetClient.list({ tenantId: payload.tenantId }, handlers)
  )
);

// Using run for manual error handling
export const createWidget = CreateWidget.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      widgetClient.create({ tenantId: payload.tenantId }, handlers)
    );
    if (result.error) {
      return yield* WidgetError.match(result.error);
    }
    return result.data;
  })
);
```

### Lift a kit into a service

```ts
import { ContractKit } from "@beep/contract";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";

const WidgetsKit = ContractKit.make(ListWidgets, CreateWidget);

export const widgetsLayer = WidgetsKit.toLayer({
  ListWidgets: listWidgets,
  CreateWidget: createWidget,
});

export class WidgetsService extends Effect.Service<WidgetsService>()(
  "WidgetsService",
  {
    dependencies: [widgetsLayer],
    effect: WidgetsKit.liftService(),
    accessors: true,
  }
) {
  static readonly Live = this.Default.pipe(Layer.provide(widgetsLayer));
}
```

## Verifications

- `bun run --filter @beep/contract lint` — Biome + formatting pass (also covers doc drift).
- `bun run --filter @beep/contract check` — TypeScript project references (ensure exported types stay sound).
- `bun run --filter @beep/contract build` — emits ESM+CJS, catches missing exports.
- `bun run --filter @beep/contract test` — placeholder until meaningful suites land; extend alongside new runtime logic.
- `bun run --filter @beep/contract lint:circular` — optional but useful when reorganizing `internal/**`.

## Contributor Checklist

- [ ] Added/updated JSDoc + comments for all new exports, keeping language domain-neutral.
- [ ] Used Effect namespace imports + helpers instead of native arrays/strings; leveraged `_internal/utils` casts where unavoidable.
- [ ] Updated `ContractError` schemas + metadata derivations when adding new error types, and documented them here.
- [ ] Provided usage guidance/examples when evolving `ContractKit`, `continuation`, or FailureMode semantics.
- [ ] Ran `bun run lint --filter @beep/contract` and `bun run check --filter @beep/contract`; triggered builds/tests if touching emitted artifacts.
- [ ] Reflected significant changes back into this AGENT and alerted consumers (e.g., `@beep/iam-client`) when APIs shift.
