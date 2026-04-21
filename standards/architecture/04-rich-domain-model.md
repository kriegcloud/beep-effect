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
- no hidden runtime dependency

An Effect that only models domain success/failure can still be pure in the
architectural sense.

## Example Shape

`TwoFactor.model.ts` can own simple behavior:

```ts
export class TwoFactor extends Model.Class<TwoFactor>("TwoFactor")({
  enabled: S.Boolean,
  recoveryCodesRemaining: S.Number,
}) {
  readonly canDisable = () => this.enabled
}
```

`TwoFactor.policy.ts` can own larger pure decisions:

```ts
export const canRotateRecoveryCodes = (model: TwoFactor) =>
  model.enabled && model.recoveryCodesRemaining < 3
```

`TwoFactor.behavior.ts` can own pure transitions:

```ts
export const rotateRecoveryCodes = (model: TwoFactor) =>
  canRotateRecoveryCodes(model)
    ? Effect.succeed(model.rotateRecoveryCodes())
    : Effect.fail(new RecoveryCodeRotationRejected())
```

The use-case service then orchestrates loading, authorization, persistence, and
event publication around these pure domain rules.

