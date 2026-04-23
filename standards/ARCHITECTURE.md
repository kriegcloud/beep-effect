# beep-effect Architecture Standard

This document is the binding architecture constitution for beep-effect. It
defines how slice packages, non-slice families, and repo-local agent bundles are
shaped, where responsibilities live, and how agents and humans should infer
intent from topology. If a proposed slice, package, adapter, or dependency
contradicts this document, the proposal must change or this document must be
amended.

The companion rationale packet lives in
[`standards/architecture/`](architecture/README.md). The companion packet
explains why these rules exist. This file states the rules and teaches the
default way to apply them.

## North Star

beep-effect uses a hexagonal vertical slice architecture for product code.

Domain-agnostic reusable substrate, developer-operational packages, and
repo-local AI steering artifacts use explicit non-slice family/kind grammar so
they are as legible as slices instead of becoming generic `common` buckets.

A slice is a domain-bounded module family with its own domain language,
application use-cases, typed configuration contracts when those exist, server
adapters, client adapters, tables, and UI. Technical wrappers live in the
repo-level `drivers` family. The goal is high modularity without copy-paste
drift:
experiments should be easy to create, easy to delete, and still shaped like
production-quality code.

The architecture optimizes for four things:

1. Fast domain experiments that do not create long-term topology debt.
2. Clear driver boundaries so Drizzle, Postgres, browser APIs, queues, and
   other infrastructure do not leak into domain language.
3. Reusable rich domain concepts without turning the repo into one giant shared
   horizontal layer.
4. Agent-readable topology where file paths and role suffixes carry enough
   context to keep work consistent.

## Core Principles

### 1. Slice First

Default to putting product behavior inside the slice that owns the domain
language. Do not create horizontal runtime packages just to gather all similar
layers from every slice.

Effect v4 Layers are memoized by default, so slices can provide their own local
dependencies without building a global "God Layer" that knows every database,
repository, handler, and driver in the system.

### 2. Ports Point Inward, Adapters Point Outward

Domain concepts must not know about drivers. Use-cases define product ports and
boundary contracts. Server packages implement product ports using tables and
drivers. Driver packages expose technical capabilities and dev-safe wrappers
around third-party
libraries.

### 3. Shared Is A Shared Kernel

`packages/shared` is the DDD shared kernel. It contains cross-cutting language
that multiple slices deliberately share. It is not a dumping ground for code
that did not fit elsewhere. Domain-agnostic reusable substrate belongs in
`packages/foundation`, not in `shared`.

### 4. Rich Domain, Pure Behavior

Domain models should be richer than value bags. They should model shape,
validation, and pure behavior. Domain behavior may return Effect values for
typed validation and domain failure, but it must not perform infrastructure side
effects.

### 5. Schemas Are Executable Contracts

For pure data models, `Schema` is the source of truth. Rich annotations, codecs,
constructors, defaults, guards, equivalence, documentation metadata, and runtime
decoders should come from the same schema value. Plain `type` aliases and
`interface` declarations may describe compile-time intent, but they cannot prove
unknown runtime data is valid.

Service contracts and type-level-only utility surfaces may stay as TypeScript
types. Domain payloads, wire payloads, persisted rows, and config payloads
should be schema-first whenever `Schema` can represent the shape.

### 6. Topology Is Compressed Context

Humans get the map from mirrored package paths. Agents get instruction from role
suffixes. This is why the repo uses concept-qualified role module names such as
`Membership.policy.ts`, `Membership.event-handlers.ts`, and
`Membership.command-client.ts`.

Role suffixes are canonical when the role exists. The full vocabulary is not
required for every concept.

### 7. Non-Slice Families Are Explicit

Non-slice artifacts are never `misc`.

- `foundation` owns domain-agnostic reusable substrate
- `drivers` owns flat repo-level technical boundary wrappers
- `tooling` owns developer-operational code packages
- `agents` owns repo-local AI steering bundles

Every non-slice artifact declares exactly one family so humans, agents, and
tooling can infer the intended boundary before opening the first file. `kind` is
required only for families that intentionally declare a kind segment;
`drivers` remains the flat family exception.

## Package Dependency Graph

The legal dependency flow is inward toward domain and outward only through
adapters. Arrows point from the importing package to the imported package.
`domain` is the pure core: its only outbound dependencies are shared-kernel
language and allowed foundation packages that stay driver-neutral.

This graph focuses on slice boundaries plus direct driver imports. Driver-to-
driver and driver-to-foundation rules are defined in
[07-non-slice-families.md](architecture/07-non-slice-families.md).

```mermaid
flowchart TD
  ui["@beep/<slice>-ui"]
  client["@beep/<slice>-client"]
  usecases["@beep/<slice>-use-cases"]
  config["@beep/<slice>-config"]
  server["@beep/<slice>-server"]
  domain["@beep/<slice>-domain"]
  tables["@beep/<slice>-tables"]
  drivers["@beep/<driver>"]
  sharedDomain["@beep/shared-domain"]
  sharedUseCases["@beep/shared-use-cases"]
  sharedConfig["@beep/shared-config"]
  foundation["foundation primitive/modeling"]

  ui --> client
  ui --> domain
  client --> domain
  client --> usecases
  client --> config
  client --> drivers
  server --> usecases
  server --> config
  server --> domain
  server --> tables
  server --> drivers
  usecases --> config
  usecases --> domain
  config --> domain
  tables --> domain
  tables --> drivers

  domain --> sharedDomain
  usecases --> sharedUseCases
  domain --> foundation
  usecases --> sharedDomain
  usecases --> sharedConfig
  server --> sharedUseCases
  usecases --> foundation
  config --> sharedDomain
  config --> sharedConfig
  config --> foundation
  server --> sharedDomain
  server --> sharedConfig
  server --> foundation
  client --> sharedUseCases
  client --> sharedDomain
  client --> sharedConfig
  client --> foundation
  ui --> sharedDomain
  ui --> foundation
  tables --> sharedDomain
  tables --> foundation
```

Forbidden by default:

- `domain` depending on anything except shared-kernel language and
  `foundation/primitive` or `foundation/modeling` packages. This excludes slice
  `config`, `@beep/shared-config`, `foundation/capability`,
  `foundation/ui-system`, `Config`, `ConfigProvider`, server, client, tables,
  UI, drivers, and use-cases.
- `use-cases` depending on `server`, `client`, `ui`, `tables`, or concrete
  drivers.
- `config` depending on `use-cases`, `server`, `client`, `ui`, `tables`, or
  concrete drivers.
- `drivers/*` depending on product concepts from any slice or `shared/*`.
- `ui`, `tables`, or `drivers/*` importing slice `config` directly.
- `shared/*` depending on product slices or drivers.
- slice packages importing `tooling/*` packages or `agents/*` bundles.
- Runtime packages merging all slice layers into one global dependency object.

Client/UI dependency caveats:

- `config --> domain` is one-way. Config may reuse domain schemas, brands, and
  value objects; domain must never import config or read runtime configuration.
- `client` may import `use-cases` only through required client-safe contract
  subpaths such as `@beep/<slice>-use-cases/public` and
  `@beep/shared-use-cases/public`. Those exports may include command/query
  language, driver-neutral boundary contracts, driver-neutral DTOs, actionable
  application errors, and client-safe facade contracts. They must not include
  product ports, server-only service/facade contracts, workflows, process
  managers, schedulers, or live Layer values.
- `client` may import config only through `@beep/<slice>-config/public` and
  `@beep/shared-config/public`. It must not import `/server`, `/secrets`,
  `/layer`, or `/test`.
- `client` may import drivers only through the required browser-safe subpath
  `@beep/<driver>/browser`. Driver package roots are never browser-safe by
  default.
- `use-cases` may import config contracts or services for application tunables.
  Live config resolution helpers belong under config `/layer`; live application
  Layer composition belongs in `server`, `client`, or top-level application
  entrypoint composition that assembles those adapter boundaries.
- `ui` may import `domain` only for driver-neutral schemas, value objects,
  display contracts, and form validation. UI behavior should go through
  `client` services/state instead of calling use-case orchestration directly.
- `shared/domain` and `shared/config` follow the same inward rules as slice
  `domain` and `config`. High-bar `shared/use-cases`, `shared/client`,
  `shared/server`, `shared/tables`, and `shared/ui` packages never own drivers.

## Slice Package Topology

Every product slice uses the same package family unless a package genuinely has
no role in that slice.

```txt
packages/<slice>/
  domain/
  use-cases/
  config/
  server/
  client/
  tables/
  ui/
```

The package names follow the public package convention:

```txt
@beep/<slice>-domain
@beep/<slice>-use-cases
@beep/<slice>-config
@beep/<slice>-server
@beep/<slice>-client
@beep/<slice>-tables
@beep/<slice>-ui
```

`config` is canonical but optional. Create it only when a slice has meaningful
configuration contracts. The canonical shared package names are
`@beep/shared-domain`, `@beep/shared-config`, and high-bar
`@beep/shared-use-cases` when that package exists. `env` package naming is
legacy source-specific vocabulary, not a slice package kind. Environment
variables are one possible `ConfigProvider` source for config declarations.

`shared` is the canonical cross-slice slice with a reduced spine:

```txt
packages/shared/
  domain/
  config/
  use-cases/ # high bar only
  client/   # high bar only
  server/   # high bar only
  tables/   # high bar only
  ui/       # high bar only
```

`shared/domain` and `shared/config` are the normal homes. `shared/use-cases`,
`shared/client`, `shared/server`, `shared/tables`, and `shared/ui` are high-bar
exceptions. `shared/use-cases` is contract-only: deliberate cross-slice
commands, queries, driver-neutral DTOs, driver-neutral boundary contracts,
client-safe application errors, facade interfaces, and product ports are
allowed. It never owns workflows, process managers, schedulers, handlers,
concrete adapters, driver imports, or live Layer values. `shared` never owns
drivers or generic substrate.

Technical wrappers live in the flat repo-level drivers family:

```txt
packages/drivers/<name> -> @beep/<name>
```

New packages should follow this target layout immediately.

## Boundary-Sensitive Export Contracts

This standard is target-first. Boundary-sensitive package roots and `./*`
wildcard exports may remain during migration for compatibility, but explicit
subpaths are the only canonical boundary contract in new examples and new
package guidance.

`use-cases` publishes explicit boundary subpaths:

```txt
@beep/<slice>-use-cases/public
@beep/<slice>-use-cases/server
@beep/<slice>-use-cases/test
```

When it exists, `@beep/shared-use-cases` follows the same contract.

- `/public` is client-safe: commands, queries, driver-neutral DTOs, boundary
  contracts, actionable application errors, and client-safe facade interfaces.
- `/server` is the server-only application contract surface, including product
  ports, server-only service or facade contracts, and slice-local
  workflow/process/scheduler contracts when that slice uses them.
- `/test` is for use-case test helpers and fixtures.

`config` publishes explicit boundary subpaths:

```txt
@beep/<slice>-config/public
@beep/<slice>-config/server
@beep/<slice>-config/secrets
@beep/<slice>-config/layer
@beep/<slice>-config/test
```

`@beep/shared-config` follows the same contract.

- `/public` is the only browser/client-safe config surface.
- `/server`, `/secrets`, and `/test` are server/test-only.
- `/layer` remains canonical, but it is server/runtime-only config resolution
  surface rather than a browser-safe API.

Driver browser safety is also explicit: if a driver exposes a browser-safe
surface, it must do so from `@beep/<driver>/browser`. The package root is never
browser-safe by default.

Required subpaths are required names when that role exists. They are not a
requirement to publish placeholder exports from packages that do not need that
role.

## Non-Slice Family Grammar

Not every important artifact is a product slice. Non-slice artifacts use
explicit family and, when applicable, kind grammar so topology still compresses
context.

The canonical non-slice families are:

| Family       | Canonical kinds                                         | Purpose                                           |
|--------------|---------------------------------------------------------|---------------------------------------------------|
| `foundation` | `primitive`, `modeling`, `capability`, `ui-system`      | Repo-owned domain-agnostic reusable substrate.    |
| `drivers`    | flat family; no extra kind segment                      | External engines, SDKs, services, and frameworks. |
| `tooling`    | `library`, `tool`, `policy-pack`, `test-kit`            | Developer-operational code packages.              |
| `agents`     | `skill-pack`, `policy-pack`, `runtime-adapter`          | Repo-local AI steering bundles.                   |

`packages/shared` is not part of this table. `shared` remains the DDD shared
kernel and canonical cross-slice slice. `foundation` is not a rename of the
shared kernel. `drivers` are not candidates for `shared`.

### Canonical Roots And Names

The canonical roots are:

```txt
packages/foundation/<kind>/<name>
packages/drivers/<name>
packages/tooling/<kind>/<name>
agents/<kind>/<name>
```

These roots sit beside slice roots such as `packages/iam/*` and the shared
cross-slice root `packages/shared/*`.

Public package names follow the family role:

```txt
foundation -> @beep/<purpose>
drivers    -> @beep/<driver>
tooling    -> @beep/repo-<purpose>
agents     -> path-identified repo-local bundles
```

Examples:

```txt
packages/foundation/modeling/schema       -> @beep/schema
packages/foundation/modeling/identity     -> @beep/identity
packages/foundation/ui-system/ui          -> @beep/ui
packages/drivers/drizzle                  -> @beep/drizzle
packages/drivers/postgres                 -> @beep/postgres
packages/tooling/tool/cli                 -> @beep/repo-cli
packages/tooling/library/repo-utils       -> @beep/repo-utils
packages/tooling/policy-pack/repo-configs -> @beep/repo-configs
packages/tooling/test-kit/test-utils      -> @beep/test-utils
agents/skill-pack/schema-first-development
agents/policy-pack/core
agents/runtime-adapter/codex
```

A shared UI primitives library such as `@beep/ui` is a
`foundation/ui-system` package. It is not a product slice and not shared-kernel
domain language. A Drizzle wrapper such as `@beep/drizzle` is a `drivers`
package. It is not a slice kind and not shared-kernel language.

### Required Metadata

Every non-slice artifact declares machine-readable family metadata. `kind` is
required for `foundation`, `tooling`, and `agents`. `drivers` is the explicit
flat-family exception and omits `kind`.

Code packages record it in `package.json`:

```json
{
  "name": "@beep/schema",
  "beep": {
    "family": "foundation",
    "kind": "modeling"
  }
}
```

```json
{
  "name": "@beep/drizzle",
  "beep": {
    "family": "drivers"
  }
}
```

Agent bundles record family and kind in `beep.json`:

```json
{
  "family": "agents",
  "kind": "skill-pack",
  "id": "schema-first-development"
}
```

Path and metadata must agree. Repo tooling, doc generation, and future boundary
checks treat this metadata as the source of truth instead of guessing from
directory names alone.

### Family And Kind Dependency Rules

`foundation` is layered:

| Kind           | May depend on                                    |
|----------------|--------------------------------------------------|
| `primitive`    | `foundation/primitive`                           |
| `modeling`     | `foundation/primitive`, `foundation/modeling`    |
| `capability`   | `primitive`, `modeling`, `capability`            |
| `ui-system`    | `primitive`, `modeling`, `ui-system`             |

`ui-system` is a side branch, not a top layer. It does not depend on
`foundation/capability` by default.

`drivers` is intentionally flat:

- drivers may depend on `foundation/primitive`, `foundation/modeling`, and
  `foundation/capability`
- drivers may depend on other drivers when the dependency stays acyclic and the
  boundary remains product-neutral
- drivers do not depend on `shared/*`, product slices, `tooling/*`, or `agents/*`
- if the repo increasingly owns the implementation as reusable substrate, move
  it to `foundation` instead of keeping it in `drivers`

These rules are dependency ceilings, not permission for cycles.

`tooling` is operational code:

| Kind          | May depend on                                                                  |
|---------------|--------------------------------------------------------------------------------|
| `library`     | any `foundation` kind, `tooling/library`                                       |
| `policy-pack` | any `foundation` kind, `tooling/library`                                       |
| `tool`        | any `foundation` kind, `tooling/library`, `tooling/policy-pack`                |
| `test-kit`    | any `foundation` kind, `tooling/library`, `tooling/policy-pack`, `test-kit`    |

Repo-wide orchestration is behavior inside `tool`. It is not a separate
canonical kind.

`agents` stays portable by default:

| Kind              | Dependency rule                                                                 |
|-------------------|----------------------------------------------------------------------------------|
| `skill-pack`      | portable content only; no executable logic or runtime-specific wiring            |
| `policy-pack`     | declarative steering packets; may reference skill ids/selectors, not skill text |
| `runtime-adapter` | declaratively composes skill/policy packs; may contain config/templates only    |

Executable hooks, CLIs, and synchronization code live in `tooling/tool`, not in
`agents`.

### Slice Consumption Rules

Slices and the shared kernel may consume `foundation`, but only in boundary-
appropriate ways:

- `domain` and `shared/domain` may import only `foundation/primitive` and
  `foundation/modeling`.
- `use-cases`, `config`, `server`, and `tables` may also import
  `foundation/capability` when needed.
- `client`, `ui`, and high-bar shared adapters may import browser-safe
  `foundation/ui-system` packages and browser-safe `primitive`/`modeling`
  packages.
- `server` and `tables` may import drivers directly.
- `client` may import only browser-safe driver entrypoints exposed from the
  required subpath `@beep/<driver>/browser`.
- `domain`, `use-cases`, `config`, `ui`, and all `shared/*` packages do not
  import drivers.
- Product slices and shared-kernel packages do not depend on `tooling/*` or
  `agents/*`.
- `foundation`, `drivers`, `tooling`, and `agents` do not depend on product
  slices or the shared kernel.

### Canonical File-Role Anchors

Non-slice file roles are smaller than slice role vocabularies but still
canonical:

| Family/kind                | Canonical anchors                                                                 |
|----------------------------|-----------------------------------------------------------------------------------|
| `foundation/primitive`     | flat modules plus `index.ts`; optional environment entrypoints such as `*.browser.ts` |
| `foundation/modeling`      | `*.schema.ts`, `*.brand.ts`, `*.codec.ts`, `index.ts`                            |
| `foundation/capability`    | `*.service.ts`, `*.layer.ts`, `*.schema.ts`, `*.errors.ts`, optional `*.client.ts` |
| `foundation/ui-system`     | `components/`, `themes/`, `styles/`, `hooks/`, `index.ts`                        |
| `drivers`                  | `*.service.ts`, `*.layer.ts`, `*.errors.ts`, `*.config.ts`, optional `*.browser.ts`, `*.test-layer.ts` |
| `tooling/library`          | library modules plus `index.ts`                                                   |
| `tooling/tool`             | `src/bin.ts`, `commands/`, `*.command.ts`, `*.service.ts`, `*.schema.ts`, `index.ts` |
| `tooling/policy-pack`      | `*.config.ts`, `*.policy.ts`, `index.ts`                                          |
| `tooling/test-kit`         | `*.test-kit.ts`, optional `fixtures/`, `layers/`, `index.ts`                     |
| `agents/skill-pack`        | required `SKILL.md` and `beep.json`; optional `references/`, `assets/`, `_shared/` |
| `agents/policy-pack`       | required `beep.json`; declarative policy packets and optional `README.md`         |
| `agents/runtime-adapter`   | required `beep.json`; runtime config/templates/mappings only                      |

Script-only pseudo-packages are not canonical. If an artifact matters enough to
name in the architecture, it should have a real family/kind contract and a real
entrypoint surface.

## Hexagonal Slice

Each slice has a domain core, an application ring, and adapter packages around
the outside.

This diagram shows runtime request/data flow, not import direction. The package
dependency graph above is the source of truth for legal imports.

```mermaid
flowchart LR
  subgraph outside["External World"]
    browser["Browser"]
    http["HTTP / RPC"]
    ai["AI Tools"]
    db["Postgres / SQLite"]
    queue["Queues / EventLog / Cluster"]
    configSource["ConfigProvider / Environment / Secrets"]
  end

  subgraph slice["Slice: iam"]
    domain["domain\nrich models, values, contracts, events"]
    usecases["use-cases\ncommands, queries, ports, protocols"]
    config["config\nEffect Config contracts, public/server/secrets"]
    server["server\nhandlers, product port implementations"]
    client["client\nremote clients, atoms, form models"]
    tables["tables\nwrite/read model tables"]
    ui["ui\nReact views and controls"]
  end

  subgraph repo["Repo Drivers"]
    drivers["drivers/*\ndev-safe technical wrappers"]
  end

  browser --> ui --> client --> usecases --> domain
  client --> config
  client --> drivers
  http --> server --> usecases
  ai --> server
  server --> config
  usecases --> config
  config --> domain
  configSource --> config
  server --> tables
  server --> drivers
  tables --> drivers
  drivers --> db
  drivers --> queue
```

## Canonical Concept Topology

The default concept topology mirrors the domain spine across packages.

```txt
packages/iam/
  domain/src/
    aggregates/
      Enrollment/
        Enrollment.model.ts
        Enrollment.events.ts
        Enrollment.policy.ts
    entities/
      Membership/
        index.ts
        Membership.model.ts
        Membership.values.ts
        Membership.errors.ts
        Membership.behavior.ts
        Membership.policy.ts
        Membership.access.ts
        Membership.contracts.ts
        Membership.events.ts
        Membership.machine.ts
    values/
      LocalDate/
        LocalDate.model.ts
        LocalDate.behavior.ts
    Events.ts

  use-cases/src/
    entities/
      Membership/
        Membership.commands.ts
        Membership.queries.ts
        Membership.access.ts
        Membership.ports.ts
        Membership.service.ts
        Membership.errors.ts
        Membership.http.ts
        Membership.rpc.ts
        Membership.tools.ts
        Membership.cluster.ts
        Membership.workflows.ts
        Membership.processes.ts
    Api.ts
    Rpc.ts
    Tools.ts
    Cluster.ts

  config/src/
    entities/
      Membership/
        Membership.config.ts
    Config.ts
    PublicConfig.ts
    ServerConfig.ts
    Secrets.ts
    Layer.ts
    TestLayer.ts

  server/src/
    entities/
      Membership/
        Membership.repo.ts
        Membership.http-handlers.ts
        Membership.rpc-handlers.ts
        Membership.tool-handlers.ts
        Membership.event-handlers.ts
        Membership.cluster-handlers.ts
        Membership.workflow-handlers.ts
        Membership.projections.ts
        Membership.layer.ts
    Api.ts
    Rpc.ts
    Tools.ts
    Events.ts
    Cluster.ts
    Layer.ts

  tables/src/
    entities/
      Membership/
        Membership.table.ts
        Membership.read-model-table.ts
    Tables.ts
    ReadModels.ts

  client/src/
    entities/
      Membership/
        Membership.command-client.ts
        Membership.query-client.ts
        Membership.service.ts
        Membership.atoms.ts
        Membership.form-model.ts
        Membership.machine.ts
        Membership.layer.ts

  ui/src/
    entities/
      Membership/
        Membership.form.tsx
        Membership.fields.tsx
        Membership.table.tsx
        Membership.list.tsx
        Membership.detail.tsx
        Membership.admin.tsx

packages/drivers/
  postgres/src/
    Postgres.service.ts
    Postgres.layer.ts
    Postgres.errors.ts
    Postgres.config.ts
    Postgres.test-layer.ts
  drizzle/src/
    Drizzle.service.ts
    Drizzle.layer.ts
    Drizzle.errors.ts
    Drizzle.config.ts
    Drizzle.test-layer.ts
```

This topology is a vocabulary, not a requirement to create empty files. A
concept only owns the role files that its behavior actually needs.

## Domain-Kind Folders

Domain package folders classify the kind of domain concept:

| Folder        | Meaning                                                                                                                      |
|---------------|------------------------------------------------------------------------------------------------------------------------------|
| `aggregates/` | Aggregate roots and consistency boundaries. Use when lifecycle and invariants span multiple child entities or values.        |
| `entities/`   | Identity-bearing concepts that are not aggregate roots, or simple aggregate-like concepts whose boundary is only themselves. |
| `values/`     | Value objects with no identity. Prefer local concept values first; promote to `values/` only when reused.                    |
| `policies/`   | Escape hatch for slice-wide or cross-concept pure policies. Not the default.                                                 |
| `services/`   | Rare pure DDD domain services. Not application services, not Effect service ports.                                           |

Aggregates are first-class. Do not hide aggregate roots in `entities/` when the
concept is really a consistency boundary.

## Role Suffixes

Role suffixes are the filename vocabulary that tells humans and agents what a
module is allowed to do.

The grammar is:

```txt
<package>/src/<domain-kind>/<Concept>/<Concept>.<role>.ts
```

For React UI files:

```txt
<package>/src/<domain-kind>/<Concept>/<Concept>.<role>.tsx
```

Multi-word roles use hyphenated suffixes:

```txt
Membership.event-handlers.ts
Membership.command-client.ts
Membership.read-model-table.ts
```

Package-level composers use PascalCase:

```txt
Api.ts
Rpc.ts
Tools.ts
Events.ts
Cluster.ts
Layer.ts
Tables.ts
ReadModels.ts
Config.ts
PublicConfig.ts
ServerConfig.ts
Secrets.ts
TestLayer.ts
```

### Domain Role Vocabulary

| Role            | Meaning                                                          |
|-----------------|------------------------------------------------------------------|
| `.model.ts`     | Schema-first model, identity, constructors, simple rich methods. |
| `.values.ts`    | Concept-local value objects.                                     |
| `.errors.ts`    | Actionable domain failures callers may branch on.                |
| `.behavior.ts`  | Pure behavior too large or visible for the model file.           |
| `.policy.ts`    | Pure domain decision law.                                        |
| `.access.ts`    | Pure permission/action/resource vocabulary.                      |
| `.contracts.ts` | Driver-neutral DTOs shared by domain and use-cases.              |
| `.events.ts`    | Domain events and event groups.                                  |
| `.machine.ts`   | Pure lifecycle state machine.                                    |

Domain role files never define handlers, clients, transports, runtimes,
persistence, or driver access.

### Use-Case Role Vocabulary

| Role            | Meaning                                                                             |
|-----------------|-------------------------------------------------------------------------------------|
| `.commands.ts`  | Application command envelopes and command language.                                 |
| `.queries.ts`   | Application query envelopes and query language.                                     |
| `.access.ts`    | Effectful authorization over domain access vocabulary.                              |
| `.ports.ts`     | Product ports needed by use-cases.                                                  |
| `.service.ts`   | Application service contract/orchestration facade.                                  |
| `.errors.ts`    | Actionable application failures.                                                    |
| `.http.ts`      | Driver-neutral HttpApi endpoint/group declarations.                                 |
| `.rpc.ts`       | Driver-neutral Rpc/RpcGroup declarations.                                           |
| `.tools.ts`     | Driver-neutral AI tool/toolkit declarations.                                        |
| `.cluster.ts`   | Driver-neutral cluster entity protocol definitions.                                 |
| `.workflows.ts` | Durable workflow declarations or application workflow contracts.                    |
| `.processes.ts` | Process managers/sagas coordinating multiple commands, events, ports, or workflows. |
| `.schedulers.ts` | Scheduler contracts or schedule declarations coordinating time-based work.          |

Use-cases publish explicit boundary subpaths:

- `@beep/<slice>-use-cases/public` for client-safe commands, queries,
  driver-neutral DTOs, driver-neutral boundary contracts, actionable
  application errors, and client-safe facade interfaces
- `@beep/<slice>-use-cases/server` for server-only application contracts,
  including product ports, server-only service/facade contracts, and slice-local
  workflow/process/scheduler contracts when present
- `@beep/<slice>-use-cases/test` for test helpers and fixtures

Required subpaths are required names when that role exists, not a requirement
to add placeholder exports. Package roots and `./*` exports may remain during
migration, but they are not the canonical boundary contract.

The high-bar `shared/use-cases` exception follows the same `/public`, `/server`,
and `/test` contract. It is narrower than slice `use-cases`: only commands,
queries, driver-neutral DTOs, driver-neutral boundary contracts, client-safe
application errors, facade interfaces, and product ports are allowed. It never
owns workflows, process managers, schedulers, handlers, concrete adapters,
driver imports, or live Layer values.

### Config Role Vocabulary

| Role              | Meaning                                                                                 |
|-------------------|-----------------------------------------------------------------------------------------|
| `.config.ts`      | Concept-owned Effect `Config` declarations, typed config models, and config vocabulary. |
| `Config.ts`       | Package-level config composer for shared slice config contracts.                        |
| `PublicConfig.ts` | Browser-safe config contracts and services that client packages may import.             |
| `ServerConfig.ts` | Server-only config contracts and services.                                              |
| `Secrets.ts`      | Secret config declarations using redacted values.                                       |
| `Layer.ts`        | Server/runtime-only config resolution helpers, including live Layers that read from the ambient `ConfigProvider`. |
| `TestLayer.ts`    | Static/test config Layers and fixtures tied to config declarations.                     |

These roles map to explicit export subpaths:

- `@beep/<slice>-config/public` for browser-safe config contracts
- `@beep/<slice>-config/server` for server-only config contracts
- `@beep/<slice>-config/secrets` for redacted secret config
- `@beep/<slice>-config/layer` for server/runtime-only config resolution
  helpers
- `@beep/<slice>-config/test` for test helpers and fixtures

`@beep/shared-config` follows the same contract. Required subpaths are required
names when that role exists. Package roots and `./*` exports may remain during
migration, but they are not the canonical boundary contract.

### Server Role Vocabulary

| Role                    | Meaning                                                                                       |
|-------------------------|-----------------------------------------------------------------------------------------------|
| `.repo.ts`              | Product repository port implementation.                                                       |
| `.<port-name>.ts`       | Product port implementation named after the port, such as `.mailer.ts` or `.token-signer.ts`. |
| `.http-handlers.ts`     | HttpApi handlers.                                                                             |
| `.rpc-handlers.ts`      | Rpc server handlers.                                                                          |
| `.tool-handlers.ts`     | AI tool handlers.                                                                             |
| `.event-handlers.ts`    | Side-effectful domain event reactions.                                                        |
| `.cluster-handlers.ts`  | Cluster entity runtime handlers.                                                              |
| `.workflow-handlers.ts` | Workflow runtime handlers.                                                                    |
| `.projections.ts`       | Projection/read-model writers.                                                                |
| `.layer.ts`             | Concept-level server Layer composition.                                                       |

### Client Role Vocabulary

| Role                 | Meaning                                              |
|----------------------|------------------------------------------------------|
| `.command-client.ts` | Remote command adapter.                              |
| `.query-client.ts`   | Remote query adapter.                                |
| `.service.ts`        | Ergonomic client-facing `Context.Service` facade.    |
| `.atoms.ts`          | Effect Reactivity atoms, refs, and client state.     |
| `.form-model.ts`     | Form schemas, metadata, and client validation model. |
| `.machine.ts`        | Browser/client interaction state machine.            |
| `.layer.ts`          | Concept-level client Layer composition.              |

### Tables And UI Role Vocabulary

| Package       | Roles                                                                              |
|---------------|------------------------------------------------------------------------------------|
| `tables`      | `.table.ts`, `.read-model-table.ts`, `Tables.ts`, `ReadModels.ts`                  |
| `ui`          | `.form.tsx`, `.fields.tsx`, `.table.tsx`, `.list.tsx`, `.detail.tsx`, `.admin.tsx` |

## Responsibility Boundaries

### `domain`

Domain owns driver-neutral semantic language and pure transition law:

- rich models, value objects, entities, aggregates
- domain contracts, events, policies, access vocabulary
- pure lifecycle state machines

Domain does not own protocol declarations, product ports, repository
interfaces, driver wrappers, handlers, tables, browser state, or runtime Layers
that connect to external systems.

### `use-cases`

Use-cases own imperative application intent and boundary language:

- commands and queries
- driver-neutral protocol declarations
- effectful application authorization
- product ports
- service/facade contracts
- slice-local workflow/process orchestration contracts when the slice needs them
- actionable application errors

Product ports live here by default because they describe what the application
needs in product language. Protocol declarations also live here by default.
Slice `use-cases` may also declare workflow/process/scheduler contracts. High-
bar `shared/use-cases` does not: it is contract-only and limited to deliberate
cross-slice commands, queries, driver-neutral DTOs, driver-neutral boundary
contracts, client-safe application errors, facade interfaces, and product ports.

Use-cases may import config contracts and services, but neither slice
`use-cases` nor `shared/use-cases` own live Layers that read the runtime
environment or participate in package-local or top-level application entrypoint
Layer composition.

### `config`

Config owns typed runtime/application configuration contracts:

- Effect `Config` declarations and key namespaces
- typed config schemas, models, and services
- public/browser-safe config contracts
- server-only config contracts
- redacted secret config
- config defaults and literal domains tied directly to config declarations
- server/runtime-only config resolution helpers, including live Layers that read
  from the ambient `ConfigProvider`
- static/test config Layers and fixtures

Config may depend inward on `domain` and `shared` for driver-neutral schemas,
brands, value objects, and validation. That dependency is one-way: domain must
not import config, `@beep/shared-config`, `Config`, `ConfigProvider`, or any
runtime configuration helper. Config must not import use-cases, server, client,
UI, tables, or concrete drivers.

Config is not a general constants package. Business invariants belong in
`domain`; application behavior belongs in `use-cases`; driver defaults belong
in `drivers/*`; presentation constants belong in `client` or `ui`.

### `server`

Server owns runtime adapters, product port implementations, and live Layer
composition:

- HTTP, RPC, AI tool, cluster, event, and workflow handlers
- repository and product port implementations
- projections and read-model writers
- concept-level and package-level server Layers

Server may depend on use-cases, config, domain, tables, and drivers.

### `shared/*`

`shared` is the cross-slice slice. Its normal homes are:

- `shared/domain`
- `shared/config`

High-bar exceptions are:

- `shared/use-cases`
- `shared/client`
- `shared/server`
- `shared/tables`
- `shared/ui`

`shared/use-cases` is contract-only. It may own cross-slice commands, queries,
driver-neutral DTOs, driver-neutral boundary contracts, client-safe application
errors, facade interfaces, and product ports. It never owns workflows, process
managers, schedulers, handlers, concrete adapters, driver imports, or live
Layer values.

Shared packages encode deliberate cross-slice product semantics. They do not
own generic substrate, technical wrappers, or drivers.

### `drivers/*`

Drivers own technical engines and dev-safe wrappers:

- Drizzle, Postgres, SQLite, EventLog, message storage, workflow engines,
  sharding, queues, locks, browser APIs, retries, and low-level config
- technical errors, boundary-local layer constructors, and test layers
- service facades that hide unsafe third-party shape

Driver packages do not define product/business ports, shared-kernel language,
or slice-local application behavior.

Driver packages live under `packages/drivers/<name>` and use short public names
such as `@beep/drizzle`. If a technical package becomes repo-owned substrate
instead of an external boundary wrapper, it belongs in `foundation`, not
`drivers`.

If a driver exposes browser-safe functionality, it must publish that surface
from `@beep/<driver>/browser`. The driver package root is never browser-safe by
default.

### `tables`

Tables own the slice-local persistence adapter surface for product-specific
schema and mapping:

- write-model tables
- read-model/projection tables
- table-level mapping helpers when they are unavoidable

Tables may depend on domain for schema/value identity, foundation helpers, and
drivers, but tables are not domain and they are not repo-level generic drivers.

### `client`

Client owns browser/client adapters, domain-facing client state, and live client
Layer composition:

- command/query clients
- client service facades
- atoms, form models, optimistic state, and client state machines

Client may depend on `@beep/<slice>-use-cases/public`,
`@beep/shared-use-cases/public` when that package exists,
`@beep/<slice>-config/public`, `@beep/shared-config/public`, and browser-safe
driver entrypoints exposed from `@beep/<driver>/browser`. It must not import
server config, secret config, config `/layer`, server-only live Layers, driver
package roots, or non-browser driver surfaces.

UI code should consume this package instead of implementing domain CRUD and
remote orchestration directly inside React components.

### `ui`

UI owns React composition:

- forms, fields, tables, detail views, admin views, and lists
- presentation behavior
- interaction wiring to client services/state

UI does not implement product use-cases, server handlers, or driver adapters.
UI should consume client services/state instead of importing config or drivers
directly.

## Access, Policy, And Error Kinds

`access` and `policy` are not synonyms.

```txt
access = who may attempt which action on which resource
policy = what the domain permits to be true
```

Domain `*.access.ts` defines pure permission/action/resource vocabulary. It
must not query users, grants, sessions, tenancy, or feature flags.

Use-case `*.access.ts` performs effectful authorization over that vocabulary. It
may consult product ports such as grants, org membership, ownership lookup, or
feature flags.

Domain `*.policy.ts` defines pure domain decision law, such as whether a
membership may be revoked or whether a membership role may be changed.

Errors are split by actionability:

| Error kind                          | Location                                             |
|-------------------------------------|------------------------------------------------------|
| Actionable domain failure           | `domain/<Concept>.errors.ts`                         |
| Actionable application failure      | `use-cases/<Concept>.errors.ts`                      |
| Technical/internal driver failure   | `drivers/<Driver>.errors.ts`                         |
| Boundary translation failure        | server handlers translate to protocol response shape |

Do not create `*.errors.ts` files just to wrap every possible failure. Create
them when callers can make product decisions from the error tag.

## Driver Boundary

Driver packages wrap third-party and infrastructure shape. Server packages adapt
those technical capabilities to product ports.

In this diagram, solid arrows are import/use dependencies. The dotted arrow is an
implementation relationship.

```mermaid
flowchart LR
  usecases["use-cases\nMembership.ports.ts\nMembershipRepository"]
  server["server\nMembership.repo.ts"]
  tables["tables\nMembership.table.ts"]
  drizzle["drivers/drizzle\nDrizzle.service.ts"]
  postgres["drivers/postgres\nPostgres.service.ts"]
  db[("Postgres")]

  server -. "implements" .-> usecases
  server --> tables
  server --> drizzle
  drizzle --> postgres
  postgres --> db
```

In this shape, a use-case can ask for `MembershipRepository` without knowing
whether the implementation uses Drizzle, Postgres, SQLite, a test store, or an
event-sourced projection.

Driver services use Effect v4 `Context.Service` and expose technical
capability, not product verbs:

```ts
import { $BeepDriversId } from "@beep/identity/packages"
import { TaggedErrorClass } from "@beep/schema"
import { Context, Effect, Layer } from "effect"
import * as O from "effect/Option"
import * as S from "effect/Schema"

const $I = $BeepDriversId.create("drizzle/Drizzle.service")

export class DrizzleError extends TaggedErrorClass<DrizzleError>(
  $I`DrizzleError`,
)(
  "DrizzleError",
  {
    operation: S.String,
    cause: S.OptionFromOptionalKey(S.Defect),
  },
  $I.annote("DrizzleError", {
    description: "Technical Drizzle driver failure.",
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

Product ports use product language. Actionable port failures live in
`Membership.errors.ts`; the port file imports those errors instead of defining
technical/driver failures inline:

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

The implementation belongs in server:

```ts
import { Effect, Layer } from "effect"
import * as A from "effect/Array"
import * as O from "effect/Option"
import * as S from "effect/Schema"
import { Drizzle } from "@beep/drizzle"
import {
  MembershipRepository,
  toMembershipRepositoryError,
} from "@beep/iam-use-cases/server"
import {
  MembershipRow,
  MembershipTable,
} from "@beep/iam-tables/entities/Membership"

export const MembershipRepositoryLive = Layer.effect(
  MembershipRepository,
  Effect.gen(function* () {
    const drizzle = yield* Drizzle

    return {
      save: Effect.fn("MembershipRepository.save")((model) =>
        drizzle
          .execute(`upsert into ${MembershipTable.name}`, [
            MembershipTable.toRow(model),
          ])
          .pipe(
            Effect.asVoid,
            Effect.mapError((error) =>
              toMembershipRepositoryError("save", error),
            ),
          )),
      findById: Effect.fn("MembershipRepository.findById")(
        (id) =>
          drizzle
            .execute(
              `select * from ${MembershipTable.name} where id = $1 limit 1`,
              [id],
            )
            .pipe(
              Effect.flatMap((rows) =>
                A.head(rows).pipe(
                  O.match({
                    onNone: () => Effect.succeed(O.none()),
                    onSome: (row) =>
                      S.decodeUnknownEffect(MembershipRow)(row).pipe(
                        Effect.map(MembershipTable.fromRow),
                        Effect.map(O.some),
                      ),
                  }),
                ),
              ),
              Effect.mapError((error) =>
                toMembershipRepositoryError("findById", error),
              ),
            ),
      ),
    }
  }),
)
```

## CQRS, Events, Workflows, Cluster, And Read Models

CQRS and distributed-system roles stay concept-local by default.

In this diagram, solid arrows are application flow. The dotted arrow is an
implementation relationship.

```mermaid
flowchart TD
  command["Membership.commands.ts\nRevokeMembershipCommand"]
  service["Membership.service.ts\napplication service"]
  policy["Membership.policy.ts\npure decision law"]
  repo["Membership.ports.ts\nMembershipRepository"]
  impl["server/Membership.repo.ts"]
  table["tables/Membership.table.ts"]
  driver["drivers/drizzle"]

  command --> service
  service --> policy
  service --> repo
  impl -. "implements" .-> repo
  impl --> table
  impl --> driver
```

Domain owns events and pure lifecycle machines:

```txt
domain/src/entities/Membership/Membership.events.ts
domain/src/entities/Membership/Membership.machine.ts
domain/src/Events.ts
```

Use-cases own commands, queries, workflows, process managers, schedulers,
product ports, and protocol declarations:

```txt
use-cases/src/entities/Membership/Membership.commands.ts
use-cases/src/entities/Membership/Membership.queries.ts
use-cases/src/entities/Membership/Membership.http.ts
use-cases/src/entities/Membership/Membership.rpc.ts
use-cases/src/entities/Membership/Membership.tools.ts
use-cases/src/entities/Membership/Membership.cluster.ts
use-cases/src/entities/Membership/Membership.workflows.ts
use-cases/src/entities/Membership/Membership.processes.ts
use-cases/src/entities/Membership/Membership.schedulers.ts
use-cases/src/entities/Membership/Membership.ports.ts
```

Server owns handlers, projections, and runtime layers:

```txt
server/src/entities/Membership/Membership.event-handlers.ts
server/src/entities/Membership/Membership.projections.ts
server/src/entities/Membership/Membership.cluster-handlers.ts
server/src/entities/Membership/Membership.workflow-handlers.ts
```

Drivers own technical engines:

```txt
packages/drivers/eventlog/src/EventLog.service.ts
packages/drivers/message-storage/src/MessageStorage.service.ts
packages/drivers/workflow/src/WorkflowEngine.service.ts
packages/drivers/sharding/src/Sharding.service.ts
```

Event and projection flow:

```mermaid
sequenceDiagram
  participant Command as Membership command handler
  participant Domain as Membership domain behavior
  participant Port as use-cases event port
  participant Adapter as server event adapter
  participant EventLog as drivers/eventlog
  participant Handler as server event-handlers
  participant Projection as server projections
  participant ReadModel as tables read model

  Command->>Domain: apply pure transition
  Domain-->>Command: new model + domain event
  Command->>Port: publish driver-neutral event
  Note over Port,Adapter: server Layer provides the port implementation
  Adapter->>EventLog: write through driver service
  EventLog->>Handler: deliver event
  Handler->>Projection: update projection
  Projection->>ReadModel: write read model table
```

State machine placement:

| Machine                          | Location                               |
|----------------------------------|----------------------------------------|
| Pure lifecycle transition law    | `domain/<Concept>.machine.ts`          |
| Process manager / saga           | `use-cases/<Concept>.processes.ts`     |
| Cluster runtime mailbox behavior | `server/<Concept>.cluster-handlers.ts` |
| Client interaction state         | `client/<Concept>.machine.ts`          |

## Layer Composition Without God Layers

Avoid central runtime packages that merge every slice's repositories, database
access, handlers, and drivers into one global layer.

```mermaid
flowchart LR
  subgraph god["Avoid: runtime God Layer"]
    data["DataAccess.layer"]
    p["Persistence.layer"]
    iam["IamDb + IamRepo"]
    billing["BillingDb + BillingRepo"]
    editor["EditorDb + EditorRepo"]
    data --> iam
    data --> billing
    data --> editor
    p --> data
  end

  subgraph local["Prefer: slice-local Layers"]
    iamLayer["iam/server/Layer.ts"]
    iamConfig["iam/config"]
    repoDrivers["drivers/*"]
    iamTables["iam/tables"]
    iamUse["iam/use-cases"]
    iamLayer --> iamUse
    iamLayer --> iamConfig
    iamLayer --> iamTables
    iamLayer --> repoDrivers
  end
```

Package-level Layer composers are still useful. The rule is that they should
compose a slice or adapter boundary, not become the place where unrelated slices
are welded together.

## Worked `iam/Membership` Example

Domain errors are actionable, and domain model behavior is pure:

```ts
import { $IamDomainId } from "@beep/identity/packages"
import { TaggedErrorClass } from "@beep/schema"

const $I = $IamDomainId.create("entities/Membership/Membership.errors")

export class MembershipAlreadyRevoked extends TaggedErrorClass<MembershipAlreadyRevoked>(
  $I`MembershipAlreadyRevoked`,
)(
  "MembershipAlreadyRevoked",
  {},
  $I.annote("MembershipAlreadyRevoked", {
    description: "Membership revocation failed because it is already revoked.",
  }),
) {}
```

```ts
import { $IamDomainId } from "@beep/identity/packages"
import { LiteralKit } from "@beep/schema"
import * as Model from "@beep/schema/Model"
import { Effect } from "effect"
import * as S from "effect/Schema"
import { AccountId } from "@beep/iam-domain/entities/Account"
import { OrganizationId } from "@beep/iam-domain/entities/Organization"
import { MembershipAlreadyRevoked } from "./Membership.errors.js"

const $I = $IamDomainId.create("entities/Membership/Membership.model")

export const MembershipId = S.String.pipe(
  S.brand("MembershipId"),
  $I.annoteSchema("MembershipId", {
    description: "Unique identifier for an organization membership.",
  }),
)
export type MembershipId = typeof MembershipId.Type

export const MembershipRole = LiteralKit(["owner", "admin", "member"]).pipe(
  $I.annoteSchema("MembershipRole", {
    description: "Role granted by an organization membership.",
  }),
)
export type MembershipRole = typeof MembershipRole.Type

export const MembershipStatus = LiteralKit([
  "active",
  "invited",
  "revoked",
]).pipe(
  $I.annoteSchema("MembershipStatus", {
    description: "Lifecycle status of an organization membership.",
  }),
)
export type MembershipStatus = typeof MembershipStatus.Type

export class Membership extends Model.Class<Membership>($I`Membership`)(
  {
    id: MembershipId,
    organizationId: OrganizationId,
    accountId: AccountId,
    role: MembershipRole,
    status: MembershipStatus,
  },
  $I.annote("Membership", {
    description: "Account participation in an organization.",
  }),
) {
  readonly canRevoke = (): boolean => !MembershipStatus.is.revoked(this.status)

  readonly revoke = Effect.fn("Membership.revoke")(() =>
    this.canRevoke()
      ? Effect.succeed(
          Membership.make({
            id: this.id,
            organizationId: this.organizationId,
            accountId: this.accountId,
            role: this.role,
            status: MembershipStatus.Enum.revoked,
          }),
        )
      : Effect.fail(new MembershipAlreadyRevoked()),
  )
}
```

Use-case service defines the contract in product language:

```ts
import { $IamUseCasesId } from "@beep/identity/packages"
import { Context, type Effect } from "effect"
import type { MembershipAlreadyRevoked } from "@beep/iam-domain/entities/Membership"
import type { RevokeMembershipCommand } from "./Membership.commands.js"
import {
  MembershipAccessDenied,
  MembershipNotFound,
  MembershipRepositoryError,
} from "./Membership.errors.js"
import { MembershipRepository } from "./Membership.ports.js"

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

Server layer wires that contract to the runtime boundary:

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

export const MembershipLayer = Layer.effect(
  MembershipService,
  Effect.gen(function* () {
    const access = yield* MembershipAccess
    const repo = yield* MembershipRepository

    return {
      revoke: Effect.fn("MembershipLayer.revoke")(function* (
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

Server handlers consume use-case services:

```ts
import { Effect } from "effect"
import type { RevokeMembershipCommand } from "@beep/iam-use-cases/public"
import { MembershipService } from "@beep/iam-use-cases/server"

export const revokeMembershipHandler = Effect.fn("revokeMembershipHandler")(
  function* (command: RevokeMembershipCommand) {
    const membership = yield* MembershipService
    return yield* membership.revoke(command)
  },
)
```

The important part is not the exact method names. The important part is the
dependency direction:

```txt
domain model behavior
  <- use-case service
  <- server handler
  <- protocol/entrypoint adapter
```

## Enforcement Later

This document defines the architecture. Repo checks, lint rules, package
constraints, codemods, and repo-cli commands may later enforce it, but they are
downstream mechanisms.

Do not treat this standard as a generator design. Treat it as the map that
generators, lint rules, reviewers, and agents must obey.
