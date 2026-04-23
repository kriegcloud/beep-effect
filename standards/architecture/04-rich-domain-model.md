# Rich Domain Model

beep-effect prefers a hybrid rich-domain style.

The domain should not be only schemas. Shape and validation are necessary, but
they are not enough. Domain concepts should also own pure behavior: lifecycle
transitions, invariant checks, value-object operations, and domain decisions.

## Rich Versus Anemic

An anemic domain model is a value bag. It may have a schema, but behavior lives
elsewhere.

A rich domain model owns:

- shape
- validation
- identity or value semantics
- pure transformations
- pure decision rules
- actionable domain failures

## Why Schema-First

A schema is not a fancier interface. It is executable domain evidence.

Type aliases and interfaces disappear at runtime. They can describe what we hope
is true, but they cannot decode unknown input, reject invalid data, normalize a
boundary value, produce documentation metadata, or explain a failure. Types can
lie; schemas have to check.

Rich annotated schemas pay back that ceremony because the same definition can:

- create fast backpressure at API, config, persistence, and UI boundaries
- derive TypeScript types instead of duplicating parallel shape definitions
- provide constructors, defaults, normalization, JSON codecs, and boundary
  decoders
- derive guards and equivalence instead of hand-written predicate helpers
- feed generated docs, validation messages, and agent context with the same
  domain descriptions humans read
- keep runtime guarantees attached to the domain language instead of scattered
  through handlers and adapters

For pure data models, define the schema value first and derive the TypeScript
type from it. Plain `interface` and object type aliases remain appropriate for
service contracts, complex type-level transforms, utility types, and overload
surfaces that `Schema` cannot represent cleanly.

## Hybrid Style

Rich behavior does not mean every function must be an instance method.

Use the shape that best communicates the rule:

| Form | Use when |
|---|---|
| Model method | The behavior is obvious single-object behavior. |
| Exported function | The behavior is pipeable, collection-oriented, or clearer as a named operation. |
| `.behavior.ts` | The behavior is pure but large enough to deserve a visible role file. |
| `.policy.ts` | The behavior is a pure decision rule, often involving multiple values or concepts. |

## Pure Does Not Mean Effect-Free

Domain behavior may return `Effect` when typed validation or typed failure makes
the rule clearer.

Pure means:

- no repositories
- no provider services
- no HTTP
- no database
- no filesystem
- no browser APIs
- no environment reads
- no config reads
- no hidden runtime dependency

An Effect that only models domain success/failure can still be pure in the
architectural sense.

Domain may define provider-neutral schemas and value objects that config
packages reuse when resolving typed settings. Domain behavior must still receive
explicit values from callers rather than reading `Config`, `ConfigProvider`,
`@beep/shared-config`, environment variables, secrets, files, or process state.

## Example Shape

`TwoFactor.model.ts` can own simple behavior:

```ts
import { $IamDomainId } from "@beep/identity/packages"
import * as Model from "@beep/schema/Model"
import { Effect } from "effect"
import * as S from "effect/Schema"
import { AccountId } from "@beep/iam-domain/entities/Account"
import { NoRecoveryCodesRemaining } from "./TwoFactor.errors.js"

const $I = $IamDomainId.create("entities/TwoFactor/TwoFactor.model")

export const TwoFactorId = S.String.pipe(
  S.brand("TwoFactorId"),
  $I.annoteSchema("TwoFactorId", {
    description: "Unique identifier for a two-factor authentication configuration",
  }),
)
export type TwoFactorId = typeof TwoFactorId.Type

export class TwoFactor extends Model.Class<TwoFactor>($I`TwoFactor`)(
  {
    id: TwoFactorId,
    accountId: AccountId,
    enabled: S.Boolean,
    recoveryCodesRemaining: S.Number,
  },
  $I.annote("TwoFactor", {
    description: "Two-factor authentication configuration for an account",
  }),
) {
  readonly canDisable = (): boolean => this.enabled

  readonly useRecoveryCode = Effect.fn("TwoFactor.useRecoveryCode")(() =>
    this.recoveryCodesRemaining > 0
      ? Effect.succeed(
          TwoFactor.make({
            id: this.id,
            accountId: this.accountId,
            enabled: this.enabled,
            recoveryCodesRemaining: this.recoveryCodesRemaining - 1,
          }),
        )
      : Effect.fail(new NoRecoveryCodesRemaining()),
  )
}
```

`TwoFactor.policy.ts` can own larger pure decisions:

```ts
import type { TwoFactor } from "./TwoFactor.model.js"

export const canRotateRecoveryCodes = (model: TwoFactor) =>
  model.enabled && model.recoveryCodesRemaining < 3
```

`TwoFactor.behavior.ts` can own pure transitions:

```ts
import { Effect } from "effect"
import { RecoveryCodeRotationRejected } from "./TwoFactor.errors.js"
import { canRotateRecoveryCodes } from "./TwoFactor.policy.js"
import { TwoFactor } from "./TwoFactor.model.js"

export const rotateRecoveryCodes = Effect.fn("TwoFactor.rotateRecoveryCodes")(
  (model: TwoFactor) =>
    canRotateRecoveryCodes(model)
      ? Effect.succeed(
          TwoFactor.make({
            id: model.id,
            accountId: model.accountId,
            enabled: model.enabled,
            recoveryCodesRemaining: 10,
          }),
        )
      : Effect.fail(new RecoveryCodeRotationRejected()),
)
```

The use-case service then orchestrates loading, authorization, persistence, and
event publication around these pure domain rules.
