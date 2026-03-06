# Implementation Breakdown

## Thesis
The first implementation pass should establish `shape`, not `breadth`.

That means wiring the monorepo for the chosen topology, defining the protocol and domain contracts that future slices must honor, and standing up a thin desktop shell placeholder that proves the package boundaries are coherent.

## Current Repo Reality
- The repo already has `packages/common/*`, `packages/shared/*`, and `tooling/*` conventions.
- The repo already uses `Effect`, `Schema`, `ServiceMap.Service`, package identity composers, and TS project references.
- The repo does not yet have:
  - `apps/desktop`
  - `packages/runtime/*`
  - `packages/repo-memory/*`

## Strongly Supported Pattern
The lowest-risk order of operations is:

1. Wire workspaces and TS references.
2. Create the protocol and domain packages first.
3. Add server and local-driver service boundaries on top.
4. Add the desktop shell last, consuming only public package surfaces.

This keeps the shell from reaching into server internals and prevents a frontend-led architecture.

## Exploratory Direction
Later iterations may split the runtime more aggressively, add richer local storage, or promote `apps/server`, `apps/web`, and `apps/mobile`. None of that belongs in the first scaffold pass.

## Work Packages

### 1. Monorepo Wiring
Goal:
- register the new packages and app in workspaces
- add TS project references
- add root path aliases
- extend identity composers for new package namespaces

Exit condition:
- the new packages can be imported by package name
- TS project references describe the new graph explicitly

### 2. Runtime Protocol
Goal:
- define the stable local protocol contracts

Scope:
- `SidecarBootstrap`
- `RepoRegistration`
- `IndexRun`
- `QueryRun`
- `RunStreamEvent`

Design rule:
- keep the protocol transport-neutral enough that the same shapes can back local HTTP now and a remote server later

Exit condition:
- the shell and sidecar can depend on one shared contract package instead of duplicating request and response shapes

### 3. Repo-Memory Domain
Goal:
- define the domain-grounding objects that make answers inspectable

Scope:
- `Citation`
- `RetrievalPacket`
- repo and run identifiers
- minimal repo-memory status literals

Design rule:
- keep the domain smaller than the future vision; v0 only needs enough structure to ground answers and track runs

Exit condition:
- answer surfaces can reference one canonical citation and retrieval-packet model

### 4. Runtime and Repo-Memory Services
Goal:
- define effect-first service boundaries without overbuilding implementations

Scope:
- `SidecarRuntime`
- `RepoMemoryServer`
- `RepoMemoryClient`
- `LocalRepoMemoryDriver`

Design rule:
- services expose behavior, not storage choices
- driver packages remain below runtime and semantic layers

Exit condition:
- the sidecar shape is explicit even before HTTP handlers and persistence are implemented

### 5. Desktop Shell Placeholder
Goal:
- reserve the UI/application slot with the agreed stack

Scope:
- `React + Vite + TanStack Router`
- a simple routed shell page
- no fake server semantics
- no embedded business logic

Design rule:
- the desktop shell is a consumer of the sidecar, not the source of truth for runtime behavior

Exit condition:
- the app package exists, builds as a thin shell, and clearly marks `src-tauri` as the next runtime integration step

### 6. First Real Implementation Pass
Goal:
- move from scaffold to one runnable vertical slice

Scope:
- sidecar bootstrap JSON on stdout
- local HTTP health endpoint
- repo registration
- deterministic TypeScript indexing
- grounded repo question flow

Exit condition:
- the desktop shell can register `beep-effect3`, trigger an index run, and render one grounded answer with citations

## Dependency Order
Follow this order unless a concrete blocker appears:

1. `packages/repo-memory/domain`
2. `packages/runtime/protocol`
3. `packages/runtime/server`
4. `packages/repo-memory/server`
5. `packages/repo-memory/drivers-local`
6. `packages/repo-memory/client`
7. `apps/desktop`

Reason:
- domain objects should exist before protocol shapes try to reference them
- protocol should exist before client and server surfaces
- the shell should be the last consumer, not the place where missing abstractions are invented

## Suggested Task Sequence
### Slice A: Shape Lock
- create package manifests and tsconfigs
- add identity composers
- add public `src/index.ts` files
- run targeted TS validation

### Slice B: Protocol Lock
- make the transport contracts concrete in `@beep/runtime-protocol`
- make the grounding contracts concrete in `@beep/repo-memory-domain`
- expose minimal service boundaries in `@beep/runtime-server` and `@beep/repo-memory-server`

### Slice C: Shell Lock
- create the routed desktop placeholder
- render the stack and contract assumptions in the UI
- keep `src-tauri` intentionally thin

### Slice D: Runnable Vertical Slice
- implement sidecar startup
- expose HTTP + SSE
- persist local repo-memory artifacts
- answer the first canonical repo questions

## Non-Goals For This Pass
- multi-user architecture
- auth
- sync
- remote server deployment
- legal or wealth domain support
- advanced ontology or reasoning engine work
- graph store selection beyond the existing driver boundary

## Questions Worth Keeping Open
- Should `@beep/runtime-protocol` stay repo-memory specific for v0, or should it become a more generic sidecar protocol later?
- When the local driver becomes real, does the first persistence target need both graph and vector storage immediately, or can the first slice persist only deterministic index artifacts plus retrieval packets?
- How soon should `src-tauri` move from placeholder to real sidecar process supervision?
