# Shared Kernel

`generated shared-kernel package family` is a DDD shared kernel.

That phrase is doing real work. It means shared code is a deliberate contract
between slices, not a place to put whatever happens to be reusable today.

## What Belongs In Shared

Shared may contain:

- `shared/domain` value objects and semantic building blocks tied to product
  language
- `shared/domain` driver-neutral primitives that multiple slices deliberately
  share
- `shared/config` contracts and config vocabulary that multiple slices
  deliberately agree on
- high-bar `shared/use-cases` application contracts when multiple slices
  deliberately share commands, queries, driver-neutral DTOs, driver-neutral
  boundary contracts, client-safe application errors, facade interfaces, or
  product ports
- high-bar `shared/client`, `shared/server`, `shared/tables`, or `shared/ui`
  packages only when they encode deliberate cross-slice product semantics

Shared should feel boring, small, and carefully named.

## What Does Not Belong In Shared

Shared should not contain:

- product-specific behavior from one slice
- a partial domain model waiting for a home
- driver-specific leakage that domain packages will inherit
- workflows, process managers, schedulers, handlers, or concrete adapters that
  execute shared contracts
- one-off convenience wrappers created to avoid a local import
- global registries that make slices depend on each other indirectly
- app-wide config registries that aggregate every slice's private config
- generic schema kits, identity kits, or reusable technical capability packages
- product-agnostic UI primitive libraries
- technical wrappers or external drivers
- repo tooling, agent policy packs, or runtime-specific agent wiring

If a concept belongs to `iam`, keep it in `iam`. Promote only when the concept is
truly shared and the owning teams/slices accept the coupling.

## Shared Is A Cross-Slice Slice

`shared` is not a special horizontal bucket. It is the canonical cross-slice
slice with a deliberately reduced spine:

```txt
packages/<kernel>/
  domain/
  config/
  use-cases/ # high bar only
  client/   # high bar only
  server/   # high bar only
  tables/   # high bar only
  ui/       # high bar only
```

`shared/domain` and `shared/config` are the normal homes. `shared/use-cases`,
`shared/client`, `shared/server`, `shared/tables`, and `shared/ui` are
exceptional and require a deliberate cross-slice product contract.

`shared/use-cases` is contract-only. It may hold cross-slice commands, queries,
driver-neutral DTOs, driver-neutral boundary contracts, client-safe application
errors, facade interfaces, and product ports. It does not hold workflows,
process managers, schedulers, handlers, concrete adapters, driver imports, or
live Layer values.

When `shared/use-cases` exists, it follows the same explicit export contract as
slice `use-cases`: `/public`, `/server`, and `/test`. `/public` stays
client-safe. `/server` is limited to server-only shared application contracts
such as product ports and server-only facade interfaces. `/test` is for test
helpers and fixtures.

This is what keeps `shared` small. The reduced spine is a rule, not a
suggestion.

## Shared Is Not Foundation

`shared` and `foundation` solve different problems.

```txt
shared      = deliberate cross-slice product language
foundation  = domain-agnostic reusable substrate
```

Put a concept in `shared` when slices are intentionally agreeing on semantics.
Put it in `foundation` when the package is reusable without any product-domain
coupling.

Examples:

- `packages/<kernel>/domain` may hold a value object that several slices treat as
  the same product concept.
- `packages/foundation/modeling/schema` may hold generic schema helpers that do
  not encode any product semantics.
- `packages/foundation/ui-system/ui` may hold shared UI primitives and themes.

This is why `shared` is not a synonym for `common`, `core`, or `misc`. Shared
language is expensive by design. Foundation packages are reusable substrate; the
shared kernel is deliberate coupling.

## Why Shared Kernel Matters

Every dependency on shared is easy to add and hard to remove. That makes shared
powerful and dangerous.

A shared kernel keeps the danger visible. The question is not "can this code be
used by two packages?" The question is "should these packages agree on this
language as a durable contract?"

## Example

A rich `LocalDate` value object can belong in shared if multiple slices need the
same calendar semantics. It should own driver-neutral shape and pure behavior.
It should not know about database columns, browser date pickers, or Postgres
time zones.

Those adapter concerns belong in tables, UI, client, server, or drivers.

By contrast, generic date/time parsing helpers, schema brands, and technical
formatting helpers belong in `foundation`, not `shared`, because they do not
create shared product semantics.

`@beep/<kernel>-config` follows the same rule. It may hold shared config
building blocks, browser-safe shared config contracts, server config contracts,
redacted secret helpers, and test `ConfigProvider` utilities when multiple
slices intentionally share that language. It must not become the place where all
slice config is gathered into one global object or Layer.

Domain packages may depend on shared-kernel language plus allowed
`foundation/primitive` and `foundation/modeling` packages, but not shared config
contracts or helpers. `@beep/<kernel>-config` is for config, use-case, adapter,
runtime, and test composition code; it is not an escape hatch for domain code
to read configuration.

Generic config helper libraries that do not encode shared product language
belong in `foundation/capability`, not `@beep/<kernel>-config`.

Client packages may import `@beep/<kernel>-config/public` only. Shared server
config, secret helpers that expose secret contracts, live server Layers, and
test `ConfigProvider` utilities stay behind `/server`, `/secrets`, `/layer`, and
`/test`.
