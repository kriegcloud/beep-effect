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
import { $I as $RootId } from "@beep/identity/packages"
import { Context, type Effect } from "effect"
import {
  TwoFactorAccessDenied,
  TwoFactorNotFound,
  TwoFactorRepositoryError,
} from "./TwoFactor.errors.js"
import type { DisableTwoFactorCommand } from "./TwoFactor.commands.js"

const $I = $RootId.create("iam/use-cases/src/entities/TwoFactor/TwoFactor.service.ts")

export class TwoFactorService extends Context.Service<
  TwoFactorService,
  {
    readonly disable: (
      command: DisableTwoFactorCommand,
    ) => Effect.Effect<
      void,
      TwoFactorAccessDenied | TwoFactorNotFound | TwoFactorRepositoryError
    >
  }
>()($I`TwoFactorService`) {}
```

Layers should provide the service from its dependencies:

```ts
import { Effect, Layer } from "effect"
import * as O from "effect/Option"
import { TwoFactorAccess } from "./TwoFactor.access.js"
import type { DisableTwoFactorCommand } from "./TwoFactor.commands.js"
import { TwoFactorNotFound } from "./TwoFactor.errors.js"
import { TwoFactorRepository } from "./TwoFactor.ports.js"
import { TwoFactorService } from "./TwoFactor.service.js"

export const layer = Layer.effect(
  TwoFactorService,
  Effect.gen(function* () {
    const access = yield* TwoFactorAccess
    const repo = yield* TwoFactorRepository

    return {
      disable: Effect.fn("TwoFactorService.disable")(function* (
        command: DisableTwoFactorCommand,
      ) {
        yield* access.assertCanDisable(command)
        const model = yield* repo.findByAccountId(command.accountId).pipe(
          Effect.flatMap(
            O.match({
              onNone: () => Effect.fail(new TwoFactorNotFound()),
              onSome: Effect.succeed,
            }),
          ),
        )
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
