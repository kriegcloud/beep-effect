# Architecture Decision Log

This log records closed architecture decisions for the hexagonal vertical slice
standard. Amend this file when the standard changes.

## 2026-04-21: Adopt Hexagonal Vertical Slice Architecture

Decision:

beep-effect uses slice package families with domain, use-cases, optional config,
server, client, tables, and UI. Technical wrappers live outside slices in the
repo-level `drivers` family.

Rationale:

The repo needs fast experimentation without topology drift. Slice families keep
domain work modular while hexagonal boundaries prevent driver details from
leaking inward.

## 2026-04-21: Treat `shared` As A DDD Shared Kernel

Decision:

`packages/shared` is cross-cutting shared kernel language, not a dumping ground.

Rationale:

Shared code is expensive because every slice can depend on it. It must stay
small, deliberate, and driver-neutral where possible.

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

Drivers own generic Drizzle/Postgres safety wrappers. Tables own slice-specific
persistence shape.

## 2026-04-21: Drivers Own Technical Capability Only

Decision:

Driver packages expose dev-safe technical wrappers and low-level runtime
capabilities. Product port implementations belong in `server` by default.

Rationale:

Putting business repository implementations inside `drivers/drizzle` or
`drivers/postgres` makes drivers product-aware and leaks infrastructure
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

Client packages may import use-case command/query language, driver-neutral
boundary contracts, driver-neutral DTOs, client-safe facade contracts, and
actionable application errors, but not product ports, server-only
service/facade contracts, workflows, process managers, schedulers, or live
Layer implementations.

Amended 2026-04-23: this client-safe contract is now taught through the
canonical `@beep/<slice>-use-cases/public` boundary.

Rationale:

The client needs shared application language without becoming coupled to
server-only orchestration or infrastructure contracts.

## 2026-04-21: Put Protocol Declarations In `use-cases`

Decision:

Use-case `.http.ts`, `.rpc.ts`, `.tools.ts`, and `.cluster.ts` files define
driver-neutral protocol declarations. Implementations, handlers, clients,
runtime Layers, and transports belong in adapter packages.

Rationale:

The application boundary should own command/query and protocol language without
owning the runtime side effects that execute that language.

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

## 2026-04-22: Keep Driver Config Driver-Local

Decision:

Driver `.config.ts` files own technical driver knobs. Slice `config` packages
own application-facing config contracts. Server or client Layers may compose
slice config with driver config at adapter boundaries, but slice config
packages do not own driver internals.

Rationale:

Moving Drizzle, Postgres, EventLog, queue, or workflow-engine settings into a
slice config package would make the package a driver registry. Keeping
technical config driver-local preserves the driver boundary.

## 2026-04-23: Recast Provider Packages As Repo-Level Drivers

Decision:

Third-party dev-safe wrappers live in flat repo-level drivers under
`packages/drivers/<name>`. Earlier drafts modeled them as slice-local
`providers`; this packet supersedes that model.

Rationale:

Technical wrappers are architecture-wide boundaries, not slice kinds and not
candidates for `shared`. Flat repo-level roots keep those boundaries visible
and keep `shared` focused on cross-slice product semantics.

## 2026-04-23: Driver Packages Use Short Capability Names

Decision:

Driver packages use short public names such as `@beep/drizzle`,
`@beep/postgres`, and `@beep/firecrawl`.

Rationale:

The driver role is already visible from the canonical root
`packages/drivers/<name>`. Repeating that role in the import path adds noise
without adding clarity.

## 2026-04-23: Add Explicit Non-Slice Artifact Families

Decision:

Non-slice architecture uses four canonical families:

- `foundation` for domain-agnostic reusable substrate
- `drivers` for flat repo-level external boundary wrappers
- `tooling` for developer-operational code packages
- `agents` for repo-local AI steering bundles

`shared` remains the DDD shared kernel. It is not renamed to `foundation`, and
it is not a synonym for `common`, `core`, or `misc`.

Rationale:

The repo needs reusable artifacts that are not slices, but those artifacts
still need topology that compresses context for humans and agents. Naming
families explicitly prevents generic buckets from becoming junk drawers.

## 2026-04-23: Give Every Non-Slice Artifact A Family And, When Applicable, A Kind

Decision:

Every non-slice artifact declares exactly one canonical family. Kind remains
required only for families that intentionally declare a kind segment.

- `foundation`: `primitive`, `modeling`, `capability`, `ui-system`
- `drivers`: flat family with no extra kind segment
- `tooling`: `library`, `tool`, `policy-pack`, `test-kit`
- `agents`: `skill-pack`, `policy-pack`, `runtime-adapter`

Canonical roots are:

```txt
packages/foundation/<kind>/<name>
packages/drivers/<name>
packages/tooling/<kind>/<name>
agents/<kind>/<name>
```

Code packages record `family` and `kind` in `package.json` under a top-level
`beep` object when that family intentionally declares a kind segment.
`drivers` record `family` only. Agent bundles record the same metadata in
`beep.json`.

Rationale:

Family-only taxonomy is too vague for families that use a kind segment. Family
plus kind makes dependency rules, file-role conventions, and browsing
expectations visible from the path and machine-readable in metadata, while
`drivers` remains the explicit flat-family exception.

## 2026-04-23: Allow `shared/use-cases` As A High-Bar Shared-Kernel Exception

Decision:

`shared/use-cases` is canonical only as a high-bar shared-kernel exception. It
is contract-only:

- cross-slice commands and queries
- driver-neutral DTOs and boundary/protocol contracts
- client-safe application errors and facade interfaces
- product ports

It does not own workflows, process managers, schedulers, handlers, concrete
adapters, driver imports, or live Layer values.

Rationale:

Some cross-slice application language deserves a durable shared home, but
shared must stay small and must not become a runtime/orchestration bucket.

## 2026-04-23: Make Boundary-Sensitive Export Subpaths Canonical

Decision:

Boundary-sensitive packages publish explicit canonical subpaths:

- `use-cases`: `/public`, `/server`, `/test`
- `config`: `/public`, `/server`, `/secrets`, `/layer`, `/test`
- browser-safe driver surfaces: `@beep/<driver>/browser`

For `use-cases`, `/public` is the client-safe application contract surface and
`/server` is the server-only application contract surface. The shared-kernel
`shared/use-cases` exception uses the same names but remains narrower than slice
`use-cases`.

Required subpaths are required names when that role exists, not a requirement
to publish placeholder exports. Package roots and `./*` wildcard exports may
remain during migration, but they are transitional only.

Rationale:

Explicit subpaths make browser/server safety visible in imports and let the
target doctrine coexist with migration-era root exports.

## 2026-04-23: Keep Live Application Layer Composition Out Of `use-cases`

Decision:

`use-cases` and `shared/use-cases` never export live Layer values. `drivers`
may export boundary-local layer constructors. `config` may expose
server/runtime-only config resolution helpers under `/layer`. `server` and
`client` own package-local application Layer composition, and top-level
application entrypoints compose those package-local boundaries.

Rationale:

This keeps use-cases as application contract language while leaving live wiring
at adapter boundaries where runtime dependencies belong.

Supersedes older wording that described `use-cases/server` as a runtime-complete
surface. Live Layer composition remains package-local to `server` and `client`,
with top-level application entrypoints composing those boundaries.

## 2026-04-23: Use Semantic Foundation Names And Repo-Scoped Tooling Names

Decision:

Foundation packages use semantic public names such as `@beep/schema`,
`@beep/identity`, and `@beep/ui`. Driver packages use short capability names
such as `@beep/drizzle` and `@beep/postgres`. Tooling packages use repo-scoped
public names such as `@beep/repo-cli` and `@beep/repo-configs`. Agent bundles
are path-identified repo-local artifacts, not workspace packages.

Rationale:

Foundation packages are reusable substrate and should read cleanly in imports.
Tooling packages are repo-operational by design and should advertise that role
in their names. Agent bundles are content artifacts rather than libraries.

## 2026-04-23: Keep Agent Content Portable And Runtime Wiring Declarative

Decision:

Agent architecture separates portable content from runtime wiring.

- `skill-pack` owns portable guidance bundles
- `policy-pack` owns declarative steering packets
- `runtime-adapter` composes skill/policy packs declaratively for a concrete
  runtime

Runtime adapters may contain config, templates, and mappings, but executable
logic lives in `tooling/tool`, not in `agents`.

Rationale:

Portable content should not fork per runtime. Declarative runtime adapters keep
Claude, Codex, and future runtime-specific wiring visible without duplicating
the content itself.

## 2026-04-23: Ban Script-Only Pseudo-Packages As A Canonical Pattern

Decision:

Script-only pseudo-packages are not a canonical architecture style. Repo-wide
task aggregation belongs at the root or inside a real `tooling/tool` package
with explicit topology and entrypoints.

Rationale:

If a package matters enough to be named in the architecture, it should have a
real role contract that humans and agents can infer from structure instead of a
single `package.json` full of scripts.
