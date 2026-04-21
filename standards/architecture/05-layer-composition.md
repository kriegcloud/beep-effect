# Layer Composition

Effect v4 changes the layer-composition tradeoff.

In earlier Effect versions, providing layers required more caution because layer
composition and memoization behavior made global composition feel safer. That
encouraged runtime packages that merged many slice dependencies into broad
`DataAccess.layer` or `Persistence.layer` values.

In Effect v4, Layers are memoized by default. Slice-local composition is a
better default.

## The Problem With God Layers

God Layers centralize unrelated ownership:

```txt
runtime/server
  DataAccess.layer
    IamDb.layer
    BillingDb.layer
    EditorDb.layer
    ...
```

This makes every slice feel cheaper to wire at first and more expensive to
change later. The runtime package becomes a registry of unrelated product
adapters.

## Slice-Local Composition

Prefer:

```txt
packages/iam/server/src/Layer.ts
  composes iam use-cases
  composes iam product port implementations
  composes iam tables
  composes iam providers
```

The app/runtime boundary can still import `iam/server/Layer.ts`, but it should
not need to know every concept-level repository and provider inside the slice.

## Context.Service Shape

Services should be explicit, small, and composed at the boundary:

```ts
export class TwoFactorService extends Context.Service<
  TwoFactorService,
  {
    readonly disable: (
      command: DisableTwoFactorCommand,
    ) => Effect.Effect<void, TwoFactorAccessDenied | TwoFactorNotFound>
  }
>()($I`TwoFactorService`) {}
```

Layers should provide the service from its dependencies:

```ts
export const layer = Layer.effect(
  TwoFactorService,
  Effect.gen(function* () {
    const access = yield* TwoFactorAccess
    const repo = yield* TwoFactorRepository

    return {
      disable: Effect.fn("TwoFactorService.disable")(function* (command) {
        yield* access.assertCanManage(command)
        const model = yield* repo.get(command.twoFactorId)
        yield* repo.save(model.disable())
      }),
    }
  }),
)
```

The dependencies are explicit, but local. That is the key distinction.

## When A Higher-Level Layer Is Fine

Higher-level app composition is still necessary. The rule is scope:

- concept-level Layers compose one concept
- package-level Layers compose one package
- slice-level Layers compose one slice
- app-level Layers compose slices

The smell is a runtime Layer that reaches through slice boundaries and wires the
private details of many slices at once.

