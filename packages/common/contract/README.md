# @beep/contract — Effect-first contract runtime

Effect-based primitives for declaring, implementing, and organizing RPC-style contracts shared across slices. The stable public surface exposes `Contract`, `ContractKit`, and `ContractError`.

## Purpose and fit
- Typed payload/success/failure schemas with Effect continuations that normalize client ↔ runtime traffic.
- Domain-agnostic: contract definitions live here; transports (HTTP, RPC, Next routes) stay in the owning slice/runtime.
- Works with slice runtimes that lift kits into Layers or services; avoid embedding infrastructure concerns in this package.

## Public surface map
- `Contract` — build contracts (`make`), annotate them (`Domain`, `Method`, `Title`, `Context`), swap schemas (`setPayload`/`setSuccess`/`setFailure`), derive continuations, and decode/encode helpers. Supports `failureMode: "error" | "return"` plus `handleOutcome`.
- `ContractKit` — group contracts, register implementations (`of`), build contexts and Layers (`toContext`, `toLayer`), and expose lifted handlers (`liftService`) with optional hooks and `mode: "success" | "result"`.
- `ContractError` — schema-backed taxonomy for request/response/malformed/unknown failures with constructors usable across clients and servers.

## Core behaviors and guardrails
- **Failure modes**: `failureMode: "error"` fails the Effect channel on business failures; `failureMode: "return"` returns a `HandleOutcome`. Always route outcomes through `Contract.handleOutcome` when using `"return"`.
- **Continuations**: `continuation.run` executes transport calls with abort awareness; `continuation.raiseResult` promotes failures; pass accurate metadata (`domain`, `method`, `extra`) for logging/telemetry.
- **Annotations**: use `Contract.Domain`, `Contract.Method`, `Contract.Title`, and `annotateContext` to keep observability consistent across slices.
- **Effect style**: namespace imports only; rely on `effect/Array`, `effect/String`, and friends instead of native helpers. Uppercase `Schema` constructors are required.

## Usage snapshots

Define and annotate a contract
```ts
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

Implement with a continuation (normalizing transport outcomes)
```ts
import { ListWidgets } from "./contracts";
import * as Effect from "effect/Effect";

export const listWidgets = ListWidgets.implement((payload, { continuation }) =>
  Effect.gen(function* () {
    const raw = yield* continuation.run((handlers) =>
      widgetClient.list(payload, handlers)
    );
    yield* continuation.raiseResult(raw);
    return yield* ListWidgets.decodeUnknownSuccess(raw.data);
  })
);
```

Handle `failureMode: "return"` with `handleOutcome`
```ts
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

Lift a kit into a Layer and service accessors
```ts
import { ContractKit } from "@beep/contract";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { ListWidgets, listWidgets } from "./contracts";

const WidgetsKit = ContractKit.make(ListWidgets);
const implementations = WidgetsKit.of({ ListWidgets: listWidgets });

export const WidgetsLayer = WidgetsKit.toLayer(implementations);

export const WidgetsService = WidgetsKit.liftService({
  hooks: {
    onFailure: ({ name }) => Effect.logWarning({ contract: name }),
  },
});
```

Map a platform error into `ContractError`
```ts
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

## Verification and scripts
- `bun run --filter @beep/contract lint`
- `bun run --filter @beep/contract check`
- `bun run --filter @beep/contract build`
- `bun run --filter @beep/contract test`
- Optional: `bun run --filter @beep/contract lint:circular`

## Contributor checklist
- Keep contracts slice-agnostic; transport adapters belong in runtimes/apps.
- Use Effect namespace imports and collection/string helpers (no native array/string methods).
- Update schemas, annotations, and continuation handling when touching `ContractError` or `FailureMode`.
- Document new helpers and surface changes in both this README and `AGENTS.md`.
- Run lint + check before handoff; run build/tests when modifying emitted surfaces.
