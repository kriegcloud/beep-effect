# Architecture Decision Log

This log records closed architecture decisions for the hexagonal vertical slice
standard. Amend this file when the standard changes.

## 2026-04-21: Adopt Hexagonal Vertical Slice Architecture

Decision:

beep-effect uses slice package families with domain, use-cases, optional config,
server, client, tables, UI, and providers.

Rationale:

The repo needs fast experimentation without topology drift. Slice families keep
domain work modular while hexagonal boundaries prevent provider details from
leaking inward.

## 2026-04-21: Treat `shared` As A DDD Shared Kernel

Decision:

`packages/shared` is cross-cutting shared kernel language, not a dumping ground.

Rationale:

Shared code is expensive because every slice can depend on it. It must stay
small, deliberate, and provider-neutral where possible.

## 2026-04-21: Add `use-cases` As A Canonical Slice Package

Decision:

Use-cases are first-class. Product ports live in use-cases by default.

Rationale:

Domain should not own application ports, and server should not define the
product language it implements. Use-cases are the correct application boundary.

## 2026-04-21: Keep `tables` Canonical

Decision:

`tables` remains a canonical package for product-specific persistence schema and
mapping.

Rationale:

Providers own generic Drizzle/Postgres safety wrappers. Tables own slice-specific
persistence shape.

## 2026-04-21: Providers Own Technical Capability Only

Decision:

Provider packages expose dev-safe technical wrappers and low-level runtime
capabilities. Product port implementations belong in `server` by default.

Rationale:

Putting business repository implementations inside `providers/drizzle` or
`providers/postgres` makes providers product-aware and leaks infrastructure
names into product topology.

## 2026-04-21: Use Domain-Kind Folders

Decision:

Domain concepts are grouped by `aggregates/`, `entities/`, and `values/`.
`policies/` and `services/` are escape hatches.

Rationale:

Domain-kind folders preserve DDD meaning and keep concept topology expressive
without flattening everything into one root.

## 2026-04-21: Use Concept-Qualified Role Suffixes

Decision:

The canonical grammar is:

```txt
<package>/src/<domain-kind>/<Concept>/<Concept>.<role>.ts
```

Rationale:

The path tells humans the concept. The role suffix tells agents and reviewers
what the file may do.

## 2026-04-21: Split Access From Policy

Decision:

Use both `.access.ts` and `.policy.ts` where needed.

Rationale:

`access` means who may attempt an action on a resource. `policy` means what the
domain permits to be true.

## 2026-04-21: Prefer Hybrid Rich Domain Models

Decision:

Domain models should own shape, validation, and pure behavior. Behavior can live
as model methods, exported functions, `*.behavior.ts`, and pure `*.policy.ts`.

Rationale:

Pure behavior near the domain concept reduces duplicated rules across use-cases,
handlers, client state, and UI.

## 2026-04-21: Reduce Runtime God Layers

Decision:

Favor slice-local Layer composition over central runtime packages that merge all
similar slice dependencies.

Rationale:

Effect v4 memoized Layers make local composition practical. Slice-local Layers
preserve ownership and reduce cross-slice coupling.

## 2026-04-21: Keep Codegen And Linting Downstream

Decision:

This standard defines architecture. Repo-cli, codegen, codemods, package
constraints, and lint rules are downstream enforcement mechanisms.

Rationale:

The architecture needs to be clear before enforcement is designed.

## 2026-04-21: Restrict Client-Safe Use-Case Imports

Decision:

Client packages may import use-case command/query language, boundary contracts,
and actionable application errors, but not product ports, server-only process
managers, or Layer implementations.

Rationale:

The client needs shared application language without becoming coupled to
server-only orchestration or infrastructure contracts.

## 2026-04-21: Treat Domain Protocol Files As Declarations Only

Decision:

Domain `.http.ts`, `.rpc.ts`, `.tools.ts`, and `.cluster.ts` files may define
provider-neutral protocol declarations. Implementations, handlers, clients,
runtimes, and transports belong in adapter packages.

Rationale:

The domain can own boundary language without owning the runtime side effects
that execute that language.

## 2026-04-22: Add `config` As A Canonical Optional Slice Package

Decision:

`config` is the canonical optional package kind for typed slice configuration.
Package names use `@beep/<slice>-config` and `@beep/shared-config`.

Rationale:

Effect `Config` names a typed runtime contract, while environment variables are
only one possible source. A config package gives application tunables, public
config, server config, secrets, defaults, and config Layers a clear home without
leaking runtime reads into domain code.

## 2026-04-22: Treat `env` Package Naming As Legacy

Decision:

`env` is source vocabulary, not architecture topology. Existing package names
such as `@beep/shared-env` and paths such as `packages/shared/env` should migrate
to `@beep/shared-config` and `packages/shared/config`.

Rationale:

Naming packages after the source encourages direct environment thinking. Naming
packages after config preserves the Effect `Config` abstraction and allows other
`ConfigProvider` sources.

## 2026-04-22: Keep Provider Config Provider-Local

Decision:

Provider `.config.ts` files own technical provider knobs. Slice `config`
packages own application-facing config contracts. Server or app Layers may
compose slice config with provider config at adapter boundaries, but slice
config packages do not own provider internals.

Rationale:

Moving Drizzle, Postgres, EventLog, queue, or workflow-engine settings into a
slice config package would make the package a provider registry. Keeping
technical config provider-local preserves the provider boundary.

## 2026-04-23: Provider Packages Use Short Capability Names

Decision:

Slice-local provider packages use `@beep/<slice>-<provider>`. Shared providers
promoted out of a slice use `@beep/<provider>`.

Rationale:

`@beep/<slice>-providers-<provider>` repeats the provider role without adding
ownership clarity. Keeping the slice in local provider names preserves ownership
while avoiding noisy package names. Reserving `@beep/<provider>` for shared
providers keeps global capability names intentional instead of accidental.
