# Provider Boundaries

Provider leakage was one of the known weaknesses in the earlier architecture.
The new boundary is simple:

```txt
providers = technical capability
config   = application configuration contracts
use-cases = product ports
server    = product port implementations
tables    = product persistence shape
domain    = provider-neutral language
```

## Why Providers Should Not Own Product Ports

It is tempting to put a repository implementation inside
`providers/drizzle` because the implementation uses Drizzle. That is locality by
library, not locality by product language.

The problem is that the provider package becomes product-aware. It starts to
know about `Membership`, `Account`, `Organization`, and business errors. At that
point it is no longer a Drizzle provider. It is a product adapter wearing a
provider name.

## The Better Split

Use-cases define what the application needs:

```ts
import { $IamUseCasesId } from "@beep/identity/packages"
import { Context, type Effect } from "effect"
import type * as O from "effect/Option"
import type {
  Membership,
  MembershipId,
} from "@beep/iam-domain/entities/Membership"
import type { MembershipRepositoryError } from "./Membership.errors.js"

const $I = $IamUseCasesId.create("entities/Membership/Membership.ports")

export class MembershipRepository extends Context.Service<
  MembershipRepository,
  {
    readonly save: (
      model: Membership,
    ) => Effect.Effect<void, MembershipRepositoryError>
    readonly findById: (
      id: MembershipId,
    ) => Effect.Effect<O.Option<Membership>, MembershipRepositoryError>
  }
>()($I`MembershipRepository`) {}
```

Providers define safe technical capability:

```ts
import { $IamDrizzleId } from "@beep/identity/packages"
import { TaggedErrorClass } from "@beep/schema"
import { Context, Effect, Layer } from "effect"
import * as O from "effect/Option"
import * as S from "effect/Schema"

const $I = $IamDrizzleId.create("Drizzle.service")

export class DrizzleError extends TaggedErrorClass<DrizzleError>(
  $I`DrizzleError`,
)(
  "DrizzleError",
  {
    operation: S.String,
    cause: S.OptionFromOptionalKey(S.Defect),
  },
  $I.annote("DrizzleError", {
    description: "Technical Drizzle provider failure.",
  }),
) {}

const toDrizzleError = (operation: string, cause?: unknown): DrizzleError =>
  new DrizzleError({
    operation,
    cause: O.fromUndefinedOr(cause),
  })

export interface DrizzleClient {
  readonly execute: (
    statement: string,
    parameters: ReadonlyArray<unknown>,
  ) => Promise<ReadonlyArray<unknown>>
}

export class Drizzle extends Context.Service<
  Drizzle,
  {
    readonly execute: (
      statement: string,
      parameters: ReadonlyArray<unknown>,
    ) => Effect.Effect<ReadonlyArray<unknown>, DrizzleError>
  }
>()($I`Drizzle`) {}

export const makeDrizzleLayer = (client: DrizzleClient): Layer.Layer<Drizzle> =>
  Layer.effect(
    Drizzle,
    Effect.succeed({
      execute: (statement, parameters) =>
        Effect.tryPromise({
          try: () => client.execute(statement, parameters),
          catch: (cause) => toDrizzleError("execute", cause),
        }),
    }),
  )
```

Server connects them:

```txt
server/Membership.repo.ts
  uses Membership.table.ts
  uses Drizzle.service.ts
  implements MembershipRepository
```

## What "Dev-Safe" Means

A dev-safe provider wrapper should:

- hide unsafe third-party API shape
- expose small typed services
- centralize technical errors
- provide test layers
- own transactions, retries, timeout policy, and config where appropriate
- avoid product domain vocabulary

Provider wrappers are allowed to be useful. They are not allowed to become the
business application layer.

## Provider Package Names

Provider folders stay under `providers/` in the slice topology, but public
package names should stay short:

```txt
packages/<slice>/providers/<provider> -> @beep/<slice>-<provider>
packages/shared/providers/<provider> -> @beep/<provider>
```

Default to the slice-local form. Promote to `@beep/<provider>` only when the
provider contract is product-neutral, stable across multiple slices, and worth
coupling those slices to the same technical capability. If the shared provider
name would be too generic or misleading, choose a more capability-specific name.

## Provider Config Versus Slice Config

Provider `.config.ts` files own technical provider knobs such as connection
URLs, pool sizing, retry policy, timeout policy, and provider-specific feature
flags. They may use Effect `Config`, but their vocabulary must stay technical.

Slice `config` packages own application-facing configuration contracts: public
config, server config, redacted secrets, typed config services, defaults tied to
those declarations, and live/test Layers. Server/client/app Layers compose those
contracts with provider Layers at the boundary.

Do not move Drizzle, Postgres, EventLog, workflow-engine, or queue internals
into `@beep/<slice>-config`. Do not put product ports or business repository
implementations into provider config files.

## Tables Are Not Providers

`tables` stays canonical because product-specific persistence shape is not the
same thing as generic provider capability.

`providers/drizzle` can offer safe Drizzle helpers. `tables` declares the
`Membership` table. `server` uses both to implement the product repository.
