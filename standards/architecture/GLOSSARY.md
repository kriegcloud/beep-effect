# Architecture Glossary

This glossary defines the vocabulary used by
[`standards/ARCHITECTURE.md`](../ARCHITECTURE.md). Use these terms consistently
in code review, docs, architecture notes, and future enforcement work.

## Aggregate

A consistency boundary with an aggregate root. Use `aggregates/` when lifecycle,
invariants, or transitions span multiple child entities or values.

## Adapter

Code that connects product language to an external protocol, runtime, library,
or infrastructure capability. Server HTTP handlers, RPC handlers, repository
implementations, projections, and client command/query clients are adapters.

## Actionable Error

A typed failure that callers can branch on to drive product behavior. Access
denied, conflict, stale version, not found, invalid transition, and idempotency
violation are actionable. Provider connection failures are usually internal
until translated.

## Anemic Domain Model

A domain model that only describes data shape and maybe validation. An anemic
model does not own meaningful behavior.

## Client Package

The slice package that owns browser/client adapters, remote command/query
clients, client services, atoms, form models, and client state machines.

## Concept

A named domain idea such as `TwoFactor`, `Account`, `Enrollment`, or
`RecoveryCode`. Concepts are mirrored across packages by folder path and
distinguished by role suffix.

## Concept-Qualified Role Module Naming

The naming convention:

```txt
<package>/src/<domain-kind>/<Concept>/<Concept>.<role>.ts
```

Examples:

```txt
TwoFactor.policy.ts
TwoFactor.commands.ts
TwoFactor.event-handlers.ts
TwoFactor.command-client.ts
```

## Domain-Kind Folder

A folder that classifies the kind of domain concept. The canonical domain-kind
folders are `aggregates/`, `entities/`, and `values/`. `policies/` and
`services/` are escape hatches.

## Domain Package

The provider-neutral package that owns rich models, values, aggregates,
contracts, domain events, pure policies, access vocabulary, and pure lifecycle
state machines.

## Entity

An identity-bearing concept. Use `entities/` for identity-bearing concepts that
are not aggregate roots, or simple concepts whose consistency boundary is only
themselves.

## God Layer

A central runtime Layer that merges many unrelated slices and providers into one
global dependency graph. God Layers hide ownership, create cross-slice coupling,
and make experiments expensive to remove.

## Hexagonal Vertical Slice

A slice that combines vertical product modularity with hexagonal boundaries.
Domain and use-cases sit inside the slice. Server, client, tables, UI, and
providers are adapters around that core.

## Internal Error

A technical failure that should be logged, traced, retried, or translated at a
boundary, but should not directly drive product behavior in domain/use-case
code.

## Port

A product-language capability required by use-cases. Ports live in
`use-cases` by default and are implemented by adapters, usually in `server`.

## Product Port Implementation

A server-side implementation of a use-case port. Example:
`server/src/entities/TwoFactor/TwoFactor.repo.ts` implements
`TwoFactorRepository` using tables and providers.

## Provider

A technical capability package under `providers/`. Providers wrap third-party
or infrastructure concerns such as Drizzle, Postgres, SQLite, EventLog,
workflow engines, queues, sharding, transactions, retries, and configuration.

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

## Role Suffix

The filename suffix that states a module's role. Examples include `.model.ts`,
`.policy.ts`, `.ports.ts`, `.http-handlers.ts`, `.projections.ts`, and
`.test-layer.ts`.

## Shared Kernel

The DDD meaning of `packages/shared`: deliberately shared cross-cutting
language, value objects, schemas, and capabilities. Shared is not a place for
miscellaneous leftovers from product slices.

## Slice

A bounded product/domain package family such as `iam`. A slice owns its domain,
use-cases, server adapters, client adapters, tables, UI, and providers.

## Tables Package

The slice package that owns product-specific persistence schema and mapping.
Tables are not domain and are not generic provider wrappers.

## Use-Case Package

The slice package that owns application intent: commands, queries,
authorization, ports, services, workflows, process managers, and actionable
application errors.

## Value Object

A concept with no identity. Value objects own validation and pure behavior.
Promote value objects to `values/` only when they are reused; otherwise keep
them local to the concept that uses them.

## Workflow

A durable application process. Workflow declarations belong in `use-cases` when
they are product/application concepts. Runtime workflow handlers belong in
`server`; engines and storage belong in `providers`.

