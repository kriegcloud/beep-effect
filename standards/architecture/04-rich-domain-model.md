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
import { $I as $RootId } from "@beep/identity/packages"
import * as Model from "@beep/schema/Model"
import { Effect } from "effect"
import * as S from "effect/Schema"
import { AccountId } from "@beep/iam-domain/entities/Account"
import { NoRecoveryCodesRemaining } from "./TwoFactor.errors.js"

const $I = $RootId.create("iam/domain/src/entities/TwoFactor/TwoFactor.model.ts")

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

  readonly useRecoveryCode = (): Effect.Effect<
    TwoFactor,
    NoRecoveryCodesRemaining
  > =>
    this.recoveryCodesRemaining > 0
      ? Effect.succeed(
          TwoFactor.make({
            id: this.id,
            accountId: this.accountId,
            enabled: this.enabled,
            recoveryCodesRemaining: this.recoveryCodesRemaining - 1,
          }),
        )
      : Effect.fail(new NoRecoveryCodesRemaining())
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

export const rotateRecoveryCodes = (model: TwoFactor) =>
  canRotateRecoveryCodes(model)
    ? Effect.succeed(
        TwoFactor.make({
          id: model.id,
          accountId: model.accountId,
          enabled: model.enabled,
          recoveryCodesRemaining: 10,
        }),
      )
    : Effect.fail(new RecoveryCodeRotationRejected())
```

The use-case service then orchestrates loading, authorization, persistence, and
event publication around these pure domain rules.
