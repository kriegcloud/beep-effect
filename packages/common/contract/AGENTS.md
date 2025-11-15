# AGENTS Guide — `@beep/contract`

## Purpose & Fit

- Effect-first contract runtime powering all RPC-style interactions shared across slices (`@beep/iam-sdk` contracts, runtime services, and future files slices).
- Publishes three public entry points (`Contract`, `ContractKit`, `ContractError`) that wrap the internal implementation and keep internal layout flexible.
- Consumed anywhere we need typed payload schemas, runtime-independent error envelopes, continuations with abort awareness, or contract grouping/lifting helpers.

## Surface Map

- **Public exports (`src/index.ts`)** — aggregates `Contract`, `ContractKit`, and `ContractError`; import from here in downstream packages.
- **Contract runtime (`src/internal/contract/*`)**
  - `contract.ts` — prototype with schema helpers, annotations, `continuation`, and `implement`.
  - `types.ts` — all shared types (contracts, FailureMode, Implementation* types, metadata helpers).
  - `continuation.ts` — metadata derivation plus `FailureContinuation` + `handleOutcome`.
  - `lift.ts` — `Contract.lift` implementation used by kits/service layers.
  - `annotations.ts`, `constants.ts`, `index.ts` — annotation tags, TypeIds, namespace export.
- **Contract kits (`src/internal/contract-kit/*`)** — `contract-kit.ts` implements `ContractKit.make`, `.of`, `.toLayer`, `.liftService` plus LiftService hooks/modes.
- **Error taxonomy (`src/internal/contract-error/*`)** — schema-backed `ContractError` hierarchy (request/response/malformed/unknown) shared by continuations and consumers.
- **Utilities (`src/internal/utils.ts`)** — schema helpers (e.g., `constEmptyStruct`, `toSchemaAnyNoContext`) reused across runtime files.

## Usage Snapshots

- `packages/iam/sdk/src/clients/passkey/passkey.contracts.ts` defines Better Auth-facing contracts via `Contract.make` and groups them with `ContractKit.make`.
- `packages/iam/sdk/src/clients/passkey/passkey.implementations.ts` uses `contract.continuation` inside `.implement` calls to normalize Better Auth responses and surface `IamError`.
- `packages/iam/sdk/src/clients/passkey/passkey.service.ts` lifts a contract kit into an Effect Service via `ContractKit.liftService`, wiring hooks for UI runtimes.
- `packages/iam/sdk/src/execute.ts` demonstrates `Contract.handleOutcome` plus manual `contract.continuation` usage for demos/tests.

## Tooling & Docs Shortcuts

- `effect_docs__effect_docs_search({"query":"Effect.async continuation abort signal"})` — refresher on crafting async bridges similar to `FailureContinuation.run`.
- `effect_docs__get_effect_doc({"documentId":6585})` — `effect/Function.pipe` guidelines (critical for chaining `A.*` helpers when composing schema utilities).
- `context7__resolve-library-id({"libraryName":"effect"})` followed by `context7__get-library-docs({"context7CompatibleLibraryID":"/effect-ts/effect","topic":"Layer","tokens":1200})` — layering references used inside `ContractKit.toLayer` / `.liftService`.
- Internal docs: keep this AGENT + docstrings in `src/internal/**` as the canonical contract runtime reference before touching implementations.

## Authoring Guardrails

- **Namespace Effect imports** everywhere (`import * as Effect`, `import * as A`, `import * as Str`). Native array/string helpers remain banned; use the Effect equivalents referenced throughout docstrings.
- Treat `Contract.make` payload/success/failure schemas as the single source of truth. Adjusting runtime fields requires updating both schema definitions and downstream TypeScript types (no `any`/casts without `toSchemaAnyNoContext`).
- Continuations: always pass accurate metadata (`domain`, `method`, optional `extra`). When adding new continuation options, keep normalization idempotent and ensure `supportsAbort` stays in sync with annotations.
- Failure modes:
  - `"error"` — implementations must fail the Effect channel on business failures (default).
  - `"return"` — implementations return `HandleOutcome` where failures stay in the success channel; `Contract.handleOutcome` must cover both.
  - Document new behavior in `types.ts` + this guide before exposing publicly.
- `ContractKit.liftService`: hooking `onFailure`/`onSuccess`/`onDefect` should stay pure and never modify payloads. Keep `Mode = "success"` vs `"result"` semantics documented.
- When extending `ContractError`, update schema annotations, docstrings, and any derivations in `failureContinuation` that rely on metadata.
- Every new helper should ship with JSDoc + code comments describing when to use it; avoid IAM- or Better Auth-specific prose to keep the package slice-agnostic.

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
export const listWidgets = ListWidgets.implement((payload, { continuation }) =>
  Effect.gen(function* () {
    const result = yield* continuation.run((handlers) =>
      widgetClient.list({ tenantId: payload.tenantId }, handlers)
    );
    yield* continuation.raiseResult(result);
    return yield* ListWidgets.decodeUnknownSuccess(result.data);
  })
);
```

### Lift a kit into a service

```ts
import { ContractKit } from "@beep/contract";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";

const WidgetsKit = ContractKit.make(ListWidgets);
const implementations = WidgetsKit.of({ ListWidgets: listWidgets });
export const WidgetsLayer = WidgetsKit.toLayer(implementations);
export class WidgetsService extends Effect.Service<WidgetsService>()(
  "WidgetsService", 
  {
    dependencies: [WidgetsLayer],
    effect: WidgetsKit.listService(),
    accessors: true,
  }
) {
  static readonly Live = WidgetsService.Default.pipe(Layer.provide(WidgetsLayer))
};
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
- [ ] Reflected significant changes back into this AGENT and alerted consumers (e.g., `@beep/iam-sdk`) when APIs shift.
