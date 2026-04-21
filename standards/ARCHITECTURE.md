# beep-effect Architecture Standard

This document is the binding architecture constitution for beep-effect. It
defines how packages are shaped, where responsibilities live, and how agents and
humans should infer intent from topology. If a proposed slice, package, adapter,
or dependency contradicts this document, the proposal must change or this
document must be amended.

The companion rationale packet lives in
[`standards/architecture/`](architecture/README.md). The companion packet
explains why these rules exist. This file states the rules and teaches the
default way to apply them.

## North Star

beep-effect uses a hexagonal vertical slice architecture.

A slice is a domain-bounded module family with its own domain language,
application use-cases, server adapters, client adapters, tables, UI, and
technical providers. The goal is high modularity without copy-paste drift:
experiments should be easy to create, easy to delete, and still shaped like
production-quality code.

The architecture optimizes for four things:

1. Fast domain experiments that do not create long-term topology debt.
2. Clear provider boundaries so Drizzle, Postgres, browser APIs, queues, and
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
repository, handler, and provider in the system.

### 2. Ports Point Inward, Adapters Point Outward

Domain concepts must not know about providers. Use-cases define product ports.
Server packages implement product ports using tables and providers. Provider
packages expose technical capabilities and dev-safe wrappers around third-party
libraries.

### 3. Shared Is A Shared Kernel

`packages/shared` is the DDD shared kernel. It contains cross-cutting language
that multiple slices deliberately share. It is not a dumping ground for code
that did not fit elsewhere.

### 4. Rich Domain, Pure Behavior

Domain models should be richer than value bags. They should model shape,
validation, and pure behavior. Domain behavior may return Effect values for
typed validation and domain failure, but it must not perform infrastructure side
effects.

### 5. Topology Is Compressed Context

Humans get the map from mirrored package paths. Agents get instruction from role
suffixes. This is why the repo uses concept-qualified role module names such as
`TwoFactor.policy.ts`, `TwoFactor.event-handlers.ts`, and
`TwoFactor.command-client.ts`.

Role suffixes are canonical when the role exists. The full vocabulary is not
required for every concept.

## Package Dependency Graph

The legal dependency flow is inward toward domain and outward only through
adapters.

```mermaid
flowchart TD
  ui["@beep/<slice>-ui"]
  client["@beep/<slice>-client"]
  server["@beep/<slice>-server"]
  usecases["@beep/<slice>-use-cases"]
  domain["@beep/<slice>-domain"]
  tables["@beep/<slice>-tables"]
  providers["@beep/<slice>-providers/*"]
  shared["@beep/shared-*"]

  ui --> client
  ui --> domain
  client --> domain
  client --> usecases
  server --> usecases
  server --> domain
  server --> tables
  server --> providers
  usecases --> domain
  tables --> domain
  tables --> providers

  domain --> shared
  usecases --> shared
  server --> shared
  client --> shared
  ui --> shared
  tables --> shared
  providers --> shared
```

Forbidden by default:

- `domain` depending on `server`, `client`, `tables`, `ui`, or `providers`.
- `use-cases` depending on `server`, `client`, `ui`, `tables`, or concrete
  provider packages.
- `providers/*` depending on product concepts from `domain` or `use-cases`.
- `shared` depending on product slices.
- Runtime packages merging all slice layers into one global dependency object.

Client/UI dependency caveats:

- `client` may import `use-cases` only for client-safe command/query language,
  boundary contracts, actionable application errors, and client facade contracts.
  It must not import product ports, server-only workflows, process managers, or
  Layer implementations.
- `ui` may import `domain` only for provider-neutral schemas, value objects,
  display contracts, and form validation. UI behavior should go through
  `client` services/state instead of calling use-case orchestration directly.
- If a `use-cases` module is not safe to import in the browser, expose the
  browser-safe language through a narrower role file or package subpath.

## Slice Package Topology

Every product slice uses the same package family unless a package genuinely has
no role in that slice.

```txt
packages/<slice>/
  domain/
  use-cases/
  server/
  client/
  tables/
  ui/
  providers/
    drizzle/
    postgres/
    sqlite/
    memory/
```

The package names follow the public package convention:

```txt
@beep/<slice>-domain
@beep/<slice>-use-cases
@beep/<slice>-server
@beep/<slice>-client
@beep/<slice>-tables
@beep/<slice>-ui
@beep/<slice>-providers-<provider>
```

Provider package naming may vary by package manager constraints, but the
architecture role does not vary: providers expose technical capability, not
business behavior.

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
  end

  subgraph slice["Slice: iam"]
    domain["domain\nrich models, values, contracts, events"]
    usecases["use-cases\ncommands, queries, product ports"]
    server["server\nhandlers, product port impls"]
    client["client\nremote clients, atoms, form models"]
    tables["tables\nwrite/read model tables"]
    ui["ui\nReact views and controls"]
    providers["providers/*\ndev-safe technical wrappers"]
  end

  browser --> ui --> client --> usecases --> domain
  http --> server --> usecases
  ai --> server
  server --> tables
  server --> providers
  tables --> providers
  providers --> db
  providers --> queue
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
      TwoFactor/
        index.ts
        TwoFactor.model.ts
        TwoFactor.values.ts
        TwoFactor.errors.ts
        TwoFactor.behavior.ts
        TwoFactor.policy.ts
        TwoFactor.access.ts
        TwoFactor.contracts.ts
        TwoFactor.events.ts
        TwoFactor.machine.ts
        TwoFactor.http.ts
        TwoFactor.rpc.ts
        TwoFactor.tools.ts
        TwoFactor.cluster.ts
    values/
      LocalDate/
        LocalDate.model.ts
        LocalDate.behavior.ts
    Api.ts
    Rpc.ts
    Tools.ts
    Events.ts
    Cluster.ts

  use-cases/src/
    entities/
      TwoFactor/
        TwoFactor.commands.ts
        TwoFactor.queries.ts
        TwoFactor.access.ts
        TwoFactor.ports.ts
        TwoFactor.service.ts
        TwoFactor.errors.ts
        TwoFactor.workflows.ts
        TwoFactor.processes.ts

  server/src/
    entities/
      TwoFactor/
        TwoFactor.repo.ts
        TwoFactor.http-handlers.ts
        TwoFactor.rpc-handlers.ts
        TwoFactor.tool-handlers.ts
        TwoFactor.event-handlers.ts
        TwoFactor.cluster-handlers.ts
        TwoFactor.workflow-handlers.ts
        TwoFactor.projections.ts
        TwoFactor.layer.ts
    Api.ts
    Rpc.ts
    Tools.ts
    Events.ts
    Cluster.ts
    Layer.ts

  tables/src/
    entities/
      TwoFactor/
        TwoFactor.table.ts
        TwoFactor.read-model-table.ts
    Tables.ts
    ReadModels.ts

  client/src/
    entities/
      TwoFactor/
        TwoFactor.command-client.ts
        TwoFactor.query-client.ts
        TwoFactor.service.ts
        TwoFactor.atoms.ts
        TwoFactor.form-model.ts
        TwoFactor.machine.ts
        TwoFactor.layer.ts

  ui/src/
    entities/
      TwoFactor/
        TwoFactor.form.tsx
        TwoFactor.fields.tsx
        TwoFactor.table.tsx
        TwoFactor.list.tsx
        TwoFactor.detail.tsx
        TwoFactor.admin.tsx

  providers/
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

| Folder | Meaning |
|---|---|
| `aggregates/` | Aggregate roots and consistency boundaries. Use when lifecycle and invariants span multiple child entities or values. |
| `entities/` | Identity-bearing concepts that are not aggregate roots, or simple aggregate-like concepts whose boundary is only themselves. |
| `values/` | Value objects with no identity. Prefer local concept values first; promote to `values/` only when reused. |
| `policies/` | Escape hatch for slice-wide or cross-concept pure policies. Not the default. |
| `services/` | Rare pure DDD domain services. Not application services, not Effect service ports. |

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
TwoFactor.event-handlers.ts
TwoFactor.command-client.ts
TwoFactor.read-model-table.ts
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
```

### Domain Role Vocabulary

| Role | Meaning |
|---|---|
| `.model.ts` | Schema-first model, identity, constructors, simple rich methods. |
| `.values.ts` | Concept-local value objects. |
| `.errors.ts` | Actionable domain failures callers may branch on. |
| `.behavior.ts` | Pure behavior too large or visible for the model file. |
| `.policy.ts` | Pure domain decision law. |
| `.access.ts` | Pure permission/action/resource vocabulary. |
| `.contracts.ts` | Provider-neutral DTOs shared by protocols and use-cases. |
| `.events.ts` | Domain events and event groups. |
| `.machine.ts` | Pure lifecycle state machine. |
| `.http.ts` | Provider-neutral HttpApi endpoint/group declarations. |
| `.rpc.ts` | Provider-neutral Rpc/RpcGroup declarations. |
| `.tools.ts` | Provider-neutral AI tool/toolkit declarations. |
| `.cluster.ts` | Provider-neutral cluster entity protocol definitions. |

Domain protocol role files declare boundary language only. They may define
HttpApi, Rpc, AI tool, or cluster protocol contracts, but they must not define
handlers, clients, transports, runtimes, persistence, or provider access.

### Use-Case Role Vocabulary

| Role | Meaning |
|---|---|
| `.commands.ts` | Application command envelopes and command language. |
| `.queries.ts` | Application query envelopes and query language. |
| `.access.ts` | Effectful authorization over domain access vocabulary. |
| `.ports.ts` | Product ports needed by use-cases. |
| `.service.ts` | Application service contract/orchestration facade. |
| `.errors.ts` | Actionable application failures. |
| `.workflows.ts` | Durable workflow declarations or application workflow contracts. |
| `.processes.ts` | Process managers/sagas coordinating multiple commands, events, ports, or workflows. |

### Server Role Vocabulary

| Role | Meaning |
|---|---|
| `.repo.ts` | Product repository port implementation. |
| `.<port-name>.ts` | Product port implementation named after the port, such as `.mailer.ts` or `.token-signer.ts`. |
| `.http-handlers.ts` | HttpApi handlers. |
| `.rpc-handlers.ts` | Rpc server handlers. |
| `.tool-handlers.ts` | AI tool handlers. |
| `.event-handlers.ts` | Side-effectful domain event reactions. |
| `.cluster-handlers.ts` | Cluster entity runtime handlers. |
| `.workflow-handlers.ts` | Workflow runtime handlers. |
| `.projections.ts` | Projection/read-model writers. |
| `.layer.ts` | Concept-level server Layer composition. |

### Client Role Vocabulary

| Role | Meaning |
|---|---|
| `.command-client.ts` | Remote command adapter. |
| `.query-client.ts` | Remote query adapter. |
| `.service.ts` | Ergonomic client-facing `Context.Service` facade. |
| `.atoms.ts` | Effect Reactivity atoms, refs, and client state. |
| `.form-model.ts` | Form schemas, metadata, and client validation model. |
| `.machine.ts` | Browser/client interaction state machine. |
| `.layer.ts` | Concept-level client Layer composition. |

### Tables, UI, And Provider Role Vocabulary

| Package | Roles |
|---|---|
| `tables` | `.table.ts`, `.read-model-table.ts`, `Tables.ts`, `ReadModels.ts` |
| `ui` | `.form.tsx`, `.fields.tsx`, `.table.tsx`, `.list.tsx`, `.detail.tsx`, `.admin.tsx` |
| `providers/*` | `.service.ts`, `.layer.ts`, `.errors.ts`, `.config.ts`, `.test-layer.ts` |

## Responsibility Boundaries

### `domain`

Domain owns provider-neutral semantic language and pure transition law:

- rich models, value objects, entities, aggregates
- domain contracts, events, policies, access vocabulary
- pure lifecycle state machines
- provider-neutral protocol declarations

Domain does not own product ports, repository interfaces, provider wrappers,
handlers, tables, browser state, or runtime Layers that connect to external
systems.

### `use-cases`

Use-cases own imperative application intent:

- commands and queries
- effectful application authorization
- product ports
- orchestration services
- workflows and process managers
- actionable application errors

Product ports live here by default because they describe what the application
needs in product language. They do not describe how Drizzle, Postgres, EventLog,
or an HTTP client works.

### `server`

Server owns runtime adapters and product port implementations:

- HTTP, RPC, AI tool, cluster, event, and workflow handlers
- repository and product port implementations
- projections and read-model writers
- concept-level and package-level server Layers

Server may depend on use-cases, domain, tables, and providers.

### `providers/*`

Providers own technical engines and dev-safe wrappers:

- Drizzle, Postgres, SQLite, EventLog, message storage, workflow engines,
  sharding, queues, locks, transactions, retries, and low-level config
- technical errors and test layers
- provider service facades that hide unsafe third-party shape

Provider packages do not define product/business ports by default.

Providers may start slice-local when that keeps experiments removable. Promote a
provider to `shared` only when it is genuinely product-neutral, stable across
multiple slices, and worth coupling those slices to the same technical contract.

### `tables`

Tables own product-specific persistence shape:

- write-model tables
- read-model/projection tables
- table-level mapping helpers when they are unavoidable

Tables may depend on domain for schema/value identity and provider-safe table
kits, but tables are not domain.

### `client`

Client owns browser/client adapters and domain-facing client state:

- command/query clients
- client service facades
- atoms, form models, optimistic state, and client state machines

UI code should consume this package instead of implementing domain CRUD and
remote orchestration directly inside React components.

### `ui`

UI owns React composition:

- forms, fields, tables, detail views, admin views, and lists
- presentation behavior
- interaction wiring to client services/state

UI does not implement product use-cases, server handlers, or provider adapters.

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
TwoFactor enrollment can be disabled or whether recovery codes may be rotated.

Errors are split by actionability:

| Error kind | Location |
|---|---|
| Actionable domain failure | `domain/<Concept>.errors.ts` |
| Actionable application failure | `use-cases/<Concept>.errors.ts` |
| Technical/internal provider failure | `providers/<Provider>.errors.ts` |
| Boundary translation failure | server handlers translate to protocol response shape |

Do not create `*.errors.ts` files just to wrap every possible failure. Create
them when callers can make product decisions from the error tag.

## Provider Boundary

Provider packages wrap third-party and infrastructure shape. Server packages
adapt those technical capabilities to product ports.

In this diagram, solid arrows are import/use dependencies. The dotted arrow is an
implementation relationship.

```mermaid
flowchart LR
  usecases["use-cases\nTwoFactor.ports.ts\nTwoFactorRepository"]
  server["server\nTwoFactor.repo.ts"]
  tables["tables\nTwoFactor.table.ts"]
  drizzle["providers/drizzle\nDrizzle.service.ts"]
  postgres["providers/postgres\nPostgres.service.ts"]
  db[("Postgres")]

  server -. "implements" .-> usecases
  server --> tables
  server --> drizzle
  drizzle --> postgres
  postgres --> db
```

In this shape, a use-case can ask for `TwoFactorRepository` without knowing
whether the implementation uses Drizzle, Postgres, SQLite, a test store, or an
event-sourced projection.

Provider services use Effect v4 `Context.Service` and expose technical
capability, not product verbs:

```ts
import { $I as $RootId } from "@beep/identity/packages"
import { TaggedErrorClass } from "@beep/schema"
import { Context, Effect, Layer } from "effect"
import * as O from "effect/Option"
import * as S from "effect/Schema"

const $I = $RootId.create("iam/providers/drizzle/src/Drizzle.service.ts")

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

Product ports use product language. Actionable port failures live in
`TwoFactor.errors.ts`; the port file imports those errors instead of defining
technical/provider failures inline:

```ts
import { $I as $RootId } from "@beep/identity/packages"
import { Context, type Effect } from "effect"
import type * as O from "effect/Option"
import type { TwoFactor } from "@beep/iam-domain/entities/TwoFactor"
import type { AccountId } from "@beep/iam-domain/entities/Account"
import type { TwoFactorRepositoryError } from "./TwoFactor.errors.js"

const $I = $RootId.create("iam/use-cases/src/entities/TwoFactor/TwoFactor.ports.ts")

export class TwoFactorRepository extends Context.Service<
  TwoFactorRepository,
  {
    readonly save: (
      model: TwoFactor,
    ) => Effect.Effect<void, TwoFactorRepositoryError>
    readonly findByAccountId: (
      accountId: AccountId,
    ) => Effect.Effect<O.Option<TwoFactor>, TwoFactorRepositoryError>
  }
>()($I`TwoFactorRepository`) {}
```

The implementation belongs in server:

```ts
import { Effect, Layer } from "effect"
import * as O from "effect/Option"
import { Drizzle } from "@beep/iam-providers-drizzle"
import {
  TwoFactorRepository,
  toTwoFactorRepositoryError,
} from "@beep/iam-use-cases/entities/TwoFactor"
import {
  TwoFactorTable,
  type TwoFactorRow,
} from "@beep/iam-tables/entities/TwoFactor"

export const TwoFactorRepositoryLive = Layer.effect(
  TwoFactorRepository,
  Effect.gen(function* () {
    const drizzle = yield* Drizzle

    return {
      save: Effect.fn("TwoFactorRepository.save")((model) =>
        drizzle
          .execute(`upsert into ${TwoFactorTable.name}`, [
            TwoFactorTable.toRow(model),
          ])
          .pipe(
            Effect.asVoid,
            Effect.mapError((error) =>
              toTwoFactorRepositoryError("save", error),
            ),
          )),
      findByAccountId: Effect.fn("TwoFactorRepository.findByAccountId")(
        (accountId) =>
          drizzle
            .execute(
              `select * from ${TwoFactorTable.name} where account_id = $1 limit 1`,
              [accountId],
            )
            .pipe(
              Effect.map((rows) =>
                O.fromNullishOr(rows[0] as TwoFactorRow | undefined).pipe(
                  O.map(TwoFactorTable.fromRow),
                ),
              ),
              Effect.mapError((error) =>
                toTwoFactorRepositoryError("findByAccountId", error),
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
  command["TwoFactor.commands.ts\nEnableTwoFactorCommand"]
  service["TwoFactor.service.ts\napplication service"]
  policy["TwoFactor.policy.ts\npure decision law"]
  repo["TwoFactor.ports.ts\nTwoFactorRepository"]
  impl["server/TwoFactor.repo.ts"]
  table["tables/TwoFactor.table.ts"]
  provider["providers/drizzle"]

  command --> service
  service --> policy
  service --> repo
  impl -. "implements" .-> repo
  impl --> table
  impl --> provider
```

Domain owns events and pure lifecycle machines:

```txt
domain/src/entities/TwoFactor/TwoFactor.events.ts
domain/src/entities/TwoFactor/TwoFactor.machine.ts
domain/src/Events.ts
```

Use-cases own commands, queries, workflows, process managers, and product ports:

```txt
use-cases/src/entities/TwoFactor/TwoFactor.commands.ts
use-cases/src/entities/TwoFactor/TwoFactor.queries.ts
use-cases/src/entities/TwoFactor/TwoFactor.workflows.ts
use-cases/src/entities/TwoFactor/TwoFactor.processes.ts
use-cases/src/entities/TwoFactor/TwoFactor.ports.ts
```

Server owns handlers, projections, and runtime layers:

```txt
server/src/entities/TwoFactor/TwoFactor.event-handlers.ts
server/src/entities/TwoFactor/TwoFactor.projections.ts
server/src/entities/TwoFactor/TwoFactor.cluster-handlers.ts
server/src/entities/TwoFactor/TwoFactor.workflow-handlers.ts
```

Providers own technical engines:

```txt
providers/eventlog/src/EventLog.service.ts
providers/message-storage/src/MessageStorage.service.ts
providers/workflow/src/WorkflowEngine.service.ts
providers/sharding/src/Sharding.service.ts
```

Event and projection flow:

```mermaid
sequenceDiagram
  participant Command as TwoFactor command handler
  participant Domain as TwoFactor domain behavior
  participant Port as use-cases event port
  participant Adapter as server event adapter
  participant EventLog as providers/eventlog
  participant Handler as server event-handlers
  participant Projection as server projections
  participant ReadModel as tables read model

  Command->>Domain: apply pure transition
  Domain-->>Command: new model + domain event
  Command->>Port: publish provider-neutral event
  Note over Port,Adapter: server Layer provides the port implementation
  Adapter->>EventLog: write through provider service
  EventLog->>Handler: deliver event
  Handler->>Projection: update projection
  Projection->>ReadModel: write read model table
```

State machine placement:

| Machine | Location |
|---|---|
| Pure lifecycle transition law | `domain/<Concept>.machine.ts` |
| Process manager / saga | `use-cases/<Concept>.processes.ts` |
| Cluster runtime mailbox behavior | `server/<Concept>.cluster-handlers.ts` |
| Client interaction state | `client/<Concept>.machine.ts` |

## Layer Composition Without God Layers

Avoid central runtime packages that merge every slice's repositories, database
access, handlers, and providers into one global layer.

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
    iamProviders["iam/providers/*"]
    iamTables["iam/tables"]
    iamUse["iam/use-cases"]
    iamLayer --> iamUse
    iamLayer --> iamTables
    iamLayer --> iamProviders
  end
```

Package-level Layer composers are still useful. The rule is that they should
compose a slice or adapter boundary, not become the place where unrelated slices
are welded together.

## Worked `iam/TwoFactor` Example

Domain errors are actionable, and domain model behavior is pure:

```ts
import { $I as $RootId } from "@beep/identity/packages"
import { TaggedErrorClass } from "@beep/schema"

const $I = $RootId.create("iam/domain/src/entities/TwoFactor/TwoFactor.errors.ts")

export class NoRecoveryCodesRemaining extends TaggedErrorClass<NoRecoveryCodesRemaining>(
  $I`NoRecoveryCodesRemaining`,
)(
  "NoRecoveryCodesRemaining",
  {},
  $I.annote("NoRecoveryCodesRemaining", {
    description: "Recovery-code use failed because no recovery codes remain.",
  }),
) {}
```

```ts
import { $I as $RootId } from "@beep/identity/packages"
import * as Model from "@beep/schema/Model"
import { Effect } from "effect"
import * as S from "effect/Schema"
import { AccountId } from "@beep/iam-domain/entities/Account"
import { NoRecoveryCodesRemaining } from "./TwoFactor.errors.js"

const $I = $RootId.create("iam/domain/src/entities/TwoFactor/TwoFactor.model.ts")

export const TwoFactorId = S.String.pipe(S.brand("TwoFactorId"))
export type TwoFactorId = typeof TwoFactorId.Type

export class TwoFactor extends Model.Class<TwoFactor>("TwoFactor")({
  id: TwoFactorId,
  accountId: AccountId,
  enabled: S.Boolean,
  recoveryCodesRemaining: S.Number,
}) {
  readonly canDisable = (): boolean => this.enabled

  readonly disable = (): TwoFactor =>
    TwoFactor.make({
      id: this.id,
      accountId: this.accountId,
      enabled: false,
      recoveryCodesRemaining: this.recoveryCodesRemaining,
    })

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

Use-case service orchestrates ports and domain behavior:

```ts
import { $I as $RootId } from "@beep/identity/packages"
import { Context, Effect, Layer } from "effect"
import * as O from "effect/Option"
import { TwoFactorAccess } from "./TwoFactor.access.js"
import { DisableTwoFactorCommand } from "./TwoFactor.commands.js"
import {
  TwoFactorAccessDenied,
  TwoFactorNotFound,
  TwoFactorRepositoryError,
} from "./TwoFactor.errors.js"
import { TwoFactorRepository } from "./TwoFactor.ports.js"

const $I = $RootId.create("iam/use-cases/src/entities/TwoFactor/TwoFactor.service.ts")

export class TwoFactorService extends Context.Service<
  TwoFactorService,
  {
    readonly disable: (
      command: DisableTwoFactorCommand,
    ) => Effect.Effect<
      void,
      TwoFactorAccessDenied | TwoFactorNotFound | TwoFactorRepositoryError
    >
  }
>()($I`TwoFactorService`) {}

export const TwoFactorServiceLive = Layer.effect(
  TwoFactorService,
  Effect.gen(function* () {
    const access = yield* TwoFactorAccess
    const repo = yield* TwoFactorRepository

    return {
      disable: Effect.fn("TwoFactorService.disable")(function* (
        command: DisableTwoFactorCommand,
      ) {
        yield* access.assertCanDisable(command)
        const model = yield* repo.findByAccountId(command.accountId).pipe(
          Effect.flatMap(
            O.match({
              onNone: () => Effect.fail(new TwoFactorNotFound()),
              onSome: Effect.succeed,
            }),
          ),
        )

        if (model.canDisable()) {
          yield* repo.save(model.disable())
        }
      }),
    }
  }),
)
```

Server handlers consume use-case services:

```ts
import { Effect } from "effect"
import { DisableTwoFactorCommand } from "@beep/iam-use-cases/entities/TwoFactor"
import { TwoFactorService } from "@beep/iam-use-cases/entities/TwoFactor"

export const disableTwoFactorHandler = Effect.fn("disableTwoFactorHandler")(
  function* (command: DisableTwoFactorCommand) {
    const twoFactor = yield* TwoFactorService
    return yield* twoFactor.disable(command)
  },
)
```

The important part is not the exact method names. The important part is the
dependency direction:

```txt
domain model behavior
  <- use-case service
  <- server handler
  <- protocol/runtime
```

## Enforcement Later

This document defines the architecture. Repo checks, lint rules, package
constraints, codemods, and repo-cli commands may later enforce it, but they are
downstream mechanisms.

Do not treat this standard as a generator design. Treat it as the map that
generators, lint rules, reviewers, and agents must obey.
