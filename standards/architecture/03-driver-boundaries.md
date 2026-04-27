# Driver Boundaries

The target architecture names these wrappers `drivers` and gives them a
repo-level home from the start:

```txt
drivers    = repo-level external boundary wrappers
foundation = repo-owned reusable substrate
shared     = deliberate cross-slice product language
use-cases  = product ports and driver-neutral boundary/protocol contracts
server     = live server adapters and package-local Layer composition
client     = live client adapters and package-local Layer composition
tables     = product persistence shape
domain     = driver-neutral semantic language
```

## Why Drivers Are Not Slice Kinds

It is tempting to put a repository implementation beside a slice-local Drizzle
wrapper because the implementation uses Drizzle. That is locality by library,
not locality by product language.

The problem is that the wrapper becomes product-aware. It starts to know about
`Membership`, `Account`, `Organization`, and business errors. At that point it
is no longer a Drizzle driver. It is a product adapter wearing a technical
label.

The target layout fixes that by making drivers flat and repo-level:

```txt
packages/drivers/drizzle   -> @beep/drizzle
packages/drivers/postgres  -> @beep/postgres
packages/drivers/<driver> -> @beep/<driver>
```

If a package needs slice language to make sense, it does not belong in
`drivers`.

## The Better Split

Use-cases define what the application needs in product language:

- ports
- command/query contracts
- boundary protocol declarations
- service/facade contracts

Drivers define safe technical capability:

- SDK wrappers
- database clients
- queue engines
- workflow runtimes
- retry, timeout, transaction, and transport helpers
- boundary-local layer constructors and test layers

Server adapts those drivers to product ports. Client may depend on a driver only
through the required browser-safe entrypoint `@beep/<driver>/browser` when that
surface exists. The driver package root is never browser-safe by default.

## What "Dev-Safe" Means

A dev-safe driver should:

- hide unsafe third-party API shape
- expose small typed services
- centralize technical errors
- provide test layers or fixtures
- own retries, timeouts, transactions, and technical config where appropriate
- avoid product-domain vocabulary

Drivers are allowed to be useful. They are not allowed to become the business
application layer.

## Direct Import Rules

Direct driver imports are intentionally narrow:

- `server` may import drivers
- `tables` may import drivers
- `client` may import only browser-safe driver entrypoints
- `domain`, `use-cases`, `config`, `ui`, and `shared/*` do not import drivers

This keeps external engines at adapter boundaries instead of letting technical
details leak into the product core.

## Driver Versus Foundation Versus Shared

These three homes solve different problems:

```txt
drivers    = external engines and SDK boundaries
foundation = repo-owned reusable substrate
shared     = cross-slice product semantics
```

If the repo increasingly owns the implementation and hardens it as internal
substrate, it belongs in `foundation`, not `drivers`.

If multiple slices deliberately share product meaning, it belongs in `shared`,
not `drivers`.

`shared` never owns technical wrappers or external drivers.

## Driver Config Versus Slice Config

Driver `.config.ts` files own technical driver knobs such as connection URLs,
pool sizing, retry policy, timeout policy, and driver-specific feature flags.
They may use Effect `Config`, but their vocabulary must stay technical.

Slice `config` packages own application-facing configuration contracts:
`/public`, `/server`, `/secrets`, `/layer`, and `/test` exports that describe
how the product is configured, not how Drizzle or Postgres works internally.

Live composition happens in `server` or `client`, not in `use-cases`. Those
adapter packages combine slice config with driver config at the boundary when
needed.

Do not move Drizzle, Postgres, EventLog, workflow-engine, or queue internals
into `@beep/<slice>-config`. Do not put product ports or business repository
implementations into driver config files.

## Tables Are Not Drivers

`tables` stays canonical because product-specific persistence shape is not the
same thing as generic driver capability.

`tables` is the slice-local persistence adapter surface for product schema and
mappings. `@beep/drizzle` can offer safe Drizzle helpers. `tables` declares the
`Membership` table. `server` uses both to implement the product repository.
