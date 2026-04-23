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
  composes iam config when present
  composes iam product port implementations
  composes iam tables
  composes repo drivers
```

The application entrypoint can still import `iam/server/Layer.ts`, but it
should not need to know every concept-level repository and driver inside the
slice. Config Layers fit this same local shape: the config package may expose
server/runtime-only `/layer` helpers, and server/client boundaries plus
top-level application entrypoint composition decides which Layers to provide.
`use-cases` and `shared/use-cases` stop at the contract surface; they do not
export live Layer values.

## Context.Service Shape

Services should be explicit, small, and composed at the boundary:

```ts
import { $IamUseCasesId } from "@beep/identity/packages"
import { Context, type Effect } from "effect"
import type { MembershipAlreadyRevoked } from "@beep/iam-domain/entities/Membership"
import {
  MembershipAccessDenied,
  MembershipNotFound,
  MembershipRepositoryError,
} from "./Membership.errors.js"
import type { RevokeMembershipCommand } from "./Membership.commands.js"

const $I = $IamUseCasesId.create("entities/Membership/Membership.service")

export class MembershipService extends Context.Service<
  MembershipService,
  {
    readonly revoke: (
      command: RevokeMembershipCommand,
    ) => Effect.Effect<
      void,
      | MembershipAccessDenied
      | MembershipAlreadyRevoked
      | MembershipNotFound
      | MembershipRepositoryError
    >
  }
>()($I`MembershipService`) {}
```

Use-case packages stop at the contract. A server layer provides the live
implementation from its dependencies:

```ts
import { Effect, Layer } from "effect"
import * as O from "effect/Option"
import {
  MembershipNotFound,
  type RevokeMembershipCommand,
} from "@beep/iam-use-cases/public"
import {
  MembershipAccess,
  MembershipRepository,
  MembershipService,
} from "@beep/iam-use-cases/server"

export const MembershipServerLayer = Layer.effect(
  MembershipService,
  Effect.gen(function* () {
    const access = yield* MembershipAccess
    const repo = yield* MembershipRepository

    return {
      revoke: Effect.fn("MembershipService.revoke")(function* (
        command: RevokeMembershipCommand,
      ) {
        yield* access.assertCanRevoke(command)
        const model = yield* repo.findById(command.membershipId).pipe(
          Effect.flatMap(
            O.match({
              onNone: () => Effect.fail(new MembershipNotFound()),
              onSome: Effect.succeed,
            }),
          ),
        )
        yield* model.revoke().pipe(Effect.flatMap(repo.save))
      }),
    }
  }),
)
```

The dependencies are explicit, but local. That is the key distinction.

Drivers may export boundary-local layer constructors, and config packages may
expose server/runtime-only `/layer` helpers, but package-local application
Layer composition still lives in `server` and `client`. Top-level application
entrypoints compose those package-local Layers.

## When A Higher-Level Layer Is Fine

Higher-level app composition is still necessary. The rule is scope:

- concept-level Layers compose one concept
- package-level Layers compose one package
- slice-level Layers compose one slice
- app-level Layers compose slices

The smell is a runtime Layer that reaches through slice boundaries and wires the
private details of many slices at once. A global config Layer that aggregates
every slice's private config is the same smell in configuration form.
