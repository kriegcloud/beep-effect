# Architecture Glossary

This glossary defines the vocabulary used by
[`standards/ARCHITECTURE.md`](../ARCHITECTURE.md). Use these terms consistently
in code review, docs, architecture notes, and future enforcement work.

## Aggregate

A consistency boundary with an aggregate root. Use `aggregates/` when lifecycle,
invariants, or transitions span multiple child entities or values.

## Artifact Family

The top-level architecture class for a non-slice artifact. The canonical
non-slice families are `foundation`, `drivers`, `tooling`, and `agents`.

## Artifact Kind

The canonical role inside an artifact family. Every non-slice artifact belongs
to exactly one family. Kinds remain required for families that intentionally
declare a kind segment, such as `foundation`, `tooling`, and `agents`;
`drivers` is the flat-family exception.

## Adapter

Code that connects product language to an external protocol, runtime, library,
or infrastructure capability. Server HTTP handlers, RPC handlers, repository
implementations, projections, and client command/query clients are adapters.

## Actionable Error

A typed failure that callers can branch on to drive product behavior. Access
denied, conflict, stale version, not found, invalid transition, and idempotency
violation are actionable. Driver connection failures are usually internal
until translated.

## Anemic Domain Model

A domain model that only describes data shape and maybe validation. An anemic
model does not own meaningful behavior.

## Client Package

The slice package that owns browser/client adapters, remote command/query
clients, client services, atoms, form models, and client state machines.

## Client-Safe Use-Case Export

A use-case export that may be imported by client packages without dragging
server-only orchestration or infrastructure into the browser. Command/query
language, driver-neutral boundary contracts, driver-neutral DTOs, actionable
application errors, and client-safe facade interfaces are usually client-safe. Those
exports must be re-exported from a client-safe subpath such as
`@beep/<slice>-use-cases/public`. Product ports, server-only service/facade
contracts, workflows, process managers, schedulers, and live Layer values are
not client-safe.

## Concept

A named domain idea such as `Membership`, `Account`, `Enrollment`, or
`Invitation`. Concepts are mirrored across packages by folder path and
distinguished by role suffix.

## Concept-Qualified Role Module Naming

The naming convention:

```txt
<package>/src/<domain-kind>/<Concept>/<Concept>.<role>.ts
```

Examples:

```txt
Membership.policy.ts
Membership.commands.ts
Membership.event-handlers.ts
Membership.command-client.ts
```

## Config Contract

A typed application/runtime configuration contract expressed with Effect
`Config`, schemas, config services, and live/test Layers. A config contract may
be backed by environment variables, files, secret stores, static test fixtures,
or application entrypoint composition.

## Config Package

The slice package that owns typed config contracts for a slice:
`@beep/<slice>-config`. It may define public config, server config, redacted
secret config, config services, config vocabulary, and server/runtime-only
config resolution helpers that read from the ambient `ConfigProvider`. Config
packages publish those boundaries through required subpaths such as `/public`,
`/server`, `/secrets`, `/layer`, and `/test`. `/public` is the only
browser-safe config surface. Required subpaths are required names when that
role exists, not a placeholder-export requirement. Package roots and `./*`
exports may remain during migration, but they are transitional rather than the
canonical boundary contract. A config package is canonical but optional, and it
is not a broad constants package.

## Domain-Kind Folder

A folder that classifies the kind of domain concept. The canonical domain-kind
folders are `aggregates/`, `entities/`, and `values/`. `policies/` and
`services/` are escape hatches.

## Domain Package

The driver-neutral package that owns rich models, values, aggregates,
contracts, domain events, pure policies, access vocabulary, and pure lifecycle
state machines.

## Driver

A technical capability package under `packages/drivers/<name>`. Drivers wrap
third-party or infrastructure concerns such as Drizzle, Postgres, SQLite,
EventLog, workflow engines, queues, sharding, transactions, retries, browser
APIs, and driver-local configuration. Driver packages use short public names
such as `@beep/drizzle`. When a driver exposes browser-safe functionality, it
must do so from `@beep/<driver>/browser`; the package root is not browser-safe
by default.

## Drivers Family

The non-slice family for flat repo-level external boundary wrappers. Drivers may
depend on `foundation` and other drivers when acyclic, but they do not depend on
product slices or the shared kernel.

## Foundation Family

The non-slice family for domain-agnostic reusable substrate. Canonical kinds
are `primitive`, `modeling`, `capability`, and `ui-system`. Foundation packages
do not depend on product slices or the shared kernel.

## Entity

An identity-bearing concept. Use `entities/` for identity-bearing concepts that
are not aggregate roots, or simple concepts whose consistency boundary is only
themselves.

## God Layer

A central runtime Layer that merges many unrelated slices and drivers into one
global dependency graph. God Layers hide ownership, create cross-slice coupling,
and make experiments expensive to remove.

## Hexagonal Vertical Slice

A slice that combines vertical product modularity with hexagonal boundaries.
Domain and use-cases sit inside every slice. Config sits inside the slice when
meaningful config contracts exist. Server, client, tables, and UI are adapters
around that core, while repo-level drivers stay outside the slice as shared
technical boundaries.

## Internal Error

A technical failure that should be logged, traced, retried, or translated at a
boundary, but should not directly drive product behavior in domain/use-case
code.

## Modeling Package

A `foundation` kind for reusable schemas, brands, identity contracts, and
modeling vocabulary that higher-level foundation packages and slices may reuse
without taking product-domain dependencies.

## Port

A product-language capability required by use-cases. Ports live in
`use-cases` by default and are implemented by adapters, usually in `server`.

## Product Port Implementation

A server-side implementation of a use-case port. Example:
`server/src/entities/Membership/Membership.repo.ts` implements
`MembershipRepository` using tables and drivers.

## Required Subpath

A canonical export name for a boundary-sensitive package role. Required means
use this subpath name when the role exists; it does not require placeholder
exports from packages that do not need that role.

## Policy Pack

A declarative policy/configuration bundle. In `tooling`, policy packs publish
shared governance data or config presets. In `agents`, policy packs publish
bounded steering packets and activation rules. Policy packs are not executable
applications.

## Public Config

Browser-safe config contracts and services exported from a config package. Client
packages may import public config; they must not import server config or secret
config.

## Protocol Declaration

A driver-neutral boundary contract such as an HttpApi endpoint group, Rpc
group, AI tool contract, or cluster entity protocol. Protocol declarations live
in `use-cases`; handlers, clients, transports, runtimes, persistence, and
driver access do not.

## Projection

A server-side writer that consumes events or write-model changes and updates a
read model. Projection code belongs in `server`; read-model table declarations
belong in `tables`.

## Read Model

A persistence shape optimized for queries, UI, reporting, or projections. Read
model tables use `.read-model-table.ts` and are composed by `ReadModels.ts`.

## Rich Domain Model

A domain model that owns shape, validation, and pure behavior. Rich behavior may
be instance methods, exported pure functions, `*.behavior.ts`, or pure
`*.policy.ts` modules.

## Portable Agent Bundle

A repo-local bundle under `agents/<kind>/<name>` with required `beep.json`
metadata. Portable bundles are runtime-neutral content artifacts; they are not
workspace packages.

## Runtime Adapter

An `agents` kind that declaratively assembles `skill-pack` and `policy-pack`
bundles for a concrete runtime such as Codex or Claude. Runtime adapters may
contain config, templates, and mappings, but not executable logic.

## Schema-First Model

A pure data model whose `Schema` value is the source of truth. TypeScript types,
constructors, decoders, encoders, guards, equivalence, defaults, validation
messages, and documentation metadata derive from that schema instead of living
beside it as parallel definitions.

## Skill Pack

An `agents` kind for portable task guidance. Skill packs are anchored by
`SKILL.md`, declare metadata in `beep.json`, and may include sidecars such as
`references/`, `assets/`, or `_shared/`.

## Role Suffix

The filename suffix that states a module's role. Examples include `.model.ts`,
`.policy.ts`, `.ports.ts`, `.http-handlers.ts`, `.projections.ts`, and
`.config.ts`.

## Secret Config

Server-only secret configuration represented with redacted values. Secret config
must live behind explicit secret/server-only modules and must not be exported
through `/public` or any other browser-safe surface.

## Server Config

Server-only config contracts and services exported from a config package. Server
config may include runtime settings that are not safe or meaningful in browser
bundles.

## Shared Kernel

The DDD meaning of `packages/shared`: deliberately shared cross-cutting
language, value objects, schemas, config contracts, and a small number of
high-bar cross-slice adapters. `shared/domain` and `shared/config` are the
normal homes. `shared/use-cases`, `shared/client`, `shared/server`,
`shared/tables`, and `shared/ui` are exceptional. `shared/use-cases` is
contract-only: it may hold cross-slice commands, queries, driver-neutral DTOs,
driver-neutral boundary contracts, client-safe application errors, facade
interfaces, and product ports, but not workflows, process managers,
schedulers, handlers, concrete adapters, driver imports, or live Layers.
Shared packages consume shared-kernel language from shared and may consume
appropriate `foundation` packages beside it; they do not own drivers. Shared
is not a synonym for `common` or `foundation`, and it is not a place for
miscellaneous leftovers from product slices.

## Slice

A bounded product/domain package family such as `iam`. A slice owns its domain,
use-cases, config contracts when present, server adapters, client adapters,
tables, and UI. Drivers stay repo-level instead of being slice package kinds.

## Tables Package

The slice package that owns product-specific persistence schema and mapping.
Tables are the slice-local persistence adapter surface for product schema and
mappings. They are not domain and they are not generic driver wrappers.

## Tooling Package

A code-bearing package in the `tooling` family. Canonical kinds are `library`,
`tool`, `policy-pack`, and `test-kit`. Tooling packages support development and
operations; product/runtime code does not depend on them.

## Use-Case Package

The slice package that owns application intent: commands, queries,
driver-neutral boundary/protocol contracts, authorization, ports,
service/facade contracts, slice-local workflow/process/scheduler contracts, and
actionable application errors. Canonical export surfaces are `/public`,
`/server`, and `/test`.
`/public` is client-safe application contract surface. `/server` is server-only
application contract surface. Package roots and `./*` exports may remain during
migration, but they are transitional rather than the canonical boundary
contract.

## Value Object

A concept with no identity. Value objects own validation and pure behavior.
Promote value objects to `values/` only when they are reused; otherwise keep
them local to the concept that uses them.

## Workflow

A durable application process. Workflow declarations belong in `use-cases` when
they are product/application concepts. Runtime workflow handlers belong in
`server`; engines and storage belong in `drivers`.
