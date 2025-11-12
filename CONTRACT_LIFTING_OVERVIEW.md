# Contract Lifting Overview

This note captures the current ergonomics work across `@beep/contract` and `@beep/iam-sdk` that revolves around
`Contract.implement`, `Contract.lift`, and `ContractKit.liftService`.

## `@beep/contract`

- **Instance-backed `contract.implement`** (`packages/common/contract/src/Contract.ts`) now wraps an implementation
  handler with schema instrumentation, span annotations, and optional `onSuccess` / `onFailure` hooks. The helper
  returns a function that already satisfies the shape expected by `ContractKit.of`, so service authors only focus on
  business logic.
- **`Contract.lift`** turns the validated `handle(name)` method from a kit into two callable shapes:
  - `success(payload)` ⇒ `Effect` that only emits `Success<C>` (and fails on typed failures or defects promoted
    through `ContractError.UnknownError`).
  - `result(payload)` ⇒ `Effect` returning the doubly-discriminated `HandleOutcome<C>` so callers can branch with
    `effect/Match`. The helper wires through `FailureMode.$match` so `"return"` contracts keep failures in the value
    channel while `"error"` contracts short-circuit.
- **`Contract.handleOutcome`** is a small matcher that consumes `HandleOutcome<C>` results (typically from
  `contract.lift(...).result`) and forwards into user-provided `onSuccess` / `onFailure` continuations.
- **Schema helpers** (`decodeSuccess`, `encodeSuccess`, `decodeUnknownSuccess`, etc.) hang directly off contract
  instances so implementers can parse Better Auth payloads without repeating `S.decode(...)` boilerplate.

These primitives keep the runtime strictly typed while allowing hooks (e.g. logging defects via `onDefect`) to run
whenever implementations misbehave.

## `@beep/iam-sdk`

- **Passkey client** (`packages/iam/sdk/src/clients/passkey/passkey.implementations.ts`) now declares every handler via
  `Passkey*Contract.implement(...)`. Each handler leans on the new decode helpers
  (`PasskeyAddContract.decodeUnknownSuccess`, etc.) instead of re-validating schemas inline. The resulting record feeds
  directly into `PasskeyContractKit.toLayer`.
- **Passkey service** (`packages/iam/sdk/src/clients/passkey/passkey.service.ts`) collapsed to
  `effect: PasskeyContractKit.liftService()`, which synthesizes the accessor map compatible with
  `Effect.Service.accessors`.
- **Demo executable** (`packages/iam/sdk/src/execute.ts`) showcases the whole stack:
  - Builds implementations with `contract.implement`.
  - Lifts the kit twice—`mode: "success"` for production-style methods and `mode: "result"` to expose the encoded
    `HandleOutcome`.
  - Routes each outcome through `Contract.handleOutcome` to log encoded payloads, respecting the contract’s
    `failureMode`.

The combined workflow removes the repetitive `handle("name")` + `S.is(...)` dances that previously existed in the
Passkey service, while still surfacing the encoded result/failure envelopes when needed.

## Putting It Together

```ts
const ListHandler = ListContract.implement((payload) =>
  Effect.gen(function* () {
    // business logic...
    return yield* ListContract.encodeSuccess({ items });
  })
);

const layer = MyContractKit.toLayer({ list: ListHandler });

export class MyService extends Effect.Service<MyService>()("@beep/MyService", {
  dependencies: [layer],
  accessors: true,
  effect: MyContractKit.liftService({
    hooks: {
      onFailure: ({ name, failure }) => Effect.logWarning(`${String(name)} failed: ${failure.message}`),
    },
  }),
}) {}

const handleListOutcome = Contract.handleOutcome(ListContract)({
  onSuccess: ({ result }) => Console.log(result),
  onFailure: ({ result }) => Console.warn(result.message),
});
```

This pattern is what the Passkey client/service now follows: implementations sit beside their contracts, the kit lifts
them into an `Effect.Service`, and callers opt into success-only or `HandleOutcome` APIs depending on the context.
