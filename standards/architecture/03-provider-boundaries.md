# Provider Boundaries

Provider leakage was one of the known weaknesses in the earlier architecture.
The new boundary is simple:

```txt
providers = technical capability
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
know about `TwoFactor`, `Account`, `Organization`, and business errors. At that
point it is no longer a Drizzle provider. It is a product adapter wearing a
provider name.

## The Better Split

Use-cases define what the application needs:

```ts
export class TwoFactorRepository extends Context.Service<
  TwoFactorRepository,
  {
    readonly save: (
      model: TwoFactor,
    ) => Effect.Effect<void, TwoFactorRepositoryError>
  }
>()($I`TwoFactorRepository`) {}
```

Providers define safe technical capability:

```ts
export class Drizzle extends Context.Service<
  Drizzle,
  {
    readonly withTransaction: <A, E, R>(
      effect: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>
  }
>()($I`Drizzle`) {}
```

Server connects them:

```txt
server/TwoFactor.repo.ts
  uses TwoFactor.table.ts
  uses Drizzle.service.ts
  implements TwoFactorRepository
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

## Tables Are Not Providers

`tables` stays canonical because product-specific persistence shape is not the
same thing as generic provider capability.

`providers/drizzle` can offer safe Drizzle helpers. `tables` declares the
`TwoFactor` table. `server` uses both to implement the product repository.

