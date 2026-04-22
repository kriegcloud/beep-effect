# Shared Kernel

`packages/shared` is a DDD shared kernel.

That phrase is doing real work. It means shared code is a deliberate contract
between slices, not a place to put whatever happens to be reusable today.

## What Belongs In Shared

Shared may contain:

- cross-cutting value objects
- schema building blocks
- identity helpers
- provider-neutral domain primitives
- shared config primitives and contracts that multiple slices deliberately agree on
- UI primitives that are intentionally product-agnostic
- technical helpers that are stable across slices

Shared should feel boring, small, and carefully named.

## What Does Not Belong In Shared

Shared should not contain:

- product-specific behavior from one slice
- a partial domain model waiting for a home
- provider-specific leakage that domain packages will inherit
- one-off convenience wrappers created to avoid a local import
- global registries that make slices depend on each other indirectly
- app-wide config registries that aggregate every slice's private config

If a concept belongs to `iam`, keep it in `iam`. Promote only when the concept is
truly shared and the owning teams/slices accept the coupling.

## Why Shared Kernel Matters

Every dependency on shared is easy to add and hard to remove. That makes shared
powerful and dangerous.

A shared kernel keeps the danger visible. The question is not "can this code be
used by two packages?" The question is "should these packages agree on this
language as a durable contract?"

## Example

A rich `LocalDate` value object can belong in shared if multiple slices need the
same calendar semantics. It should own provider-neutral shape and pure behavior.
It should not know about database columns, browser date pickers, or Postgres
time zones.

Those adapter concerns belong in tables, UI, client, server, or providers.

`@beep/shared-config` follows the same rule. It may hold shared config
building blocks, browser-safe shared config contracts, server config contracts,
redacted secret helpers, and test `ConfigProvider` utilities when multiple
slices intentionally share that language. It must not become the place where all
slice config is gathered into one global object or Layer.

Domain packages may depend on shared/common domain primitives, but not shared
config contracts or helpers. `@beep/shared-config` is for config, use-case,
adapter, runtime, and test composition code; it is not an escape hatch for
domain code to read configuration.
