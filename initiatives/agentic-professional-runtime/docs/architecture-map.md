# Architecture Map

## Purpose

This document maps the product decisions onto the repository architecture. It
does not define exact files yet. It names slice ownership and boundary rules so
the later implementation plan can scaffold packages without re-opening the
product topology.

## Product Topology

```txt
apps/
  professional-desktop/        # future native app shell, name not final

packages/
  tenancy/
    domain/
    use-cases/
    config/
    server/
    client/
    tables/
    ui/
  workspace/
    domain/
    use-cases/
    config/
    server/
    client/
    tables/
    ui/
  agent-capability/
    domain/
    use-cases/
    config/
    server/
    client/
    tables/
    ui/
  epistemic/
    domain/
    use-cases/
    config/
    server/
    client/
    tables/
    ui/
  law-practice/
    domain/
    use-cases/
    config/
    server/
    client/
    tables/
    ui/
  wealth-management/
    domain/
    use-cases/
    config/
    server/
    client/
    tables/
    ui/
```

Packages should be added only when a role exists. A first implementation may
start with fewer packages per slice, following
`standards/architecture/13-onboarding-the-minimum-viable-slice.md`.

## Slice Responsibilities

### tenancy

Owns organization, user, team, membership, role, and policy scope. It should not
know about law matters, households, claims, or connector implementations.

### workspace

Owns workspaces, threads, turns, artifacts, projects, tasks, approval gates,
comments, and inbox/work-queue contracts. It may reference shared identities and
vertical entity refs, but vertical semantics stay in vertical slices.

### agent-capability

Owns agents, skills, skill versions, commands, context-pack definitions,
connectors, model/provider bindings, and credential references. It owns product
contracts for capability promotion, not vendor SDK code.

### epistemic

Owns claims, evidence, subjects, provenance activities, lifecycle states,
supersession/contestation, knowledge-graph projections, and usage records. It
must keep claim authority separate from semantic search or vector indexes.

### law-practice

Owns legal clients, matters, IP assets, filings, docket references, contracts,
office actions, legal drafts, and legal research overlays.

### wealth-management

Owns parties, households, clients, accounts, holdings, instruments, goals,
meetings, and planning engagements.

## Shared Kernel

Use `packages/shared/*` only for deliberate cross-slice product language.
Likely candidates:

- organization identity and tenant-root behavior
- principal actor references
- source-kind vocabulary
- base entity metadata
- candidate/accepted lifecycle vocabulary
- activity actor references

Promotion records are required where the architecture standard requires them.
Do not move live workflows, process managers, connector adapters, or driver
wrappers into shared.

## Foundation And Drivers

Foundation owns domain-agnostic substrate:

- schema helpers
- identity composers
- generic observability helpers
- generic UI primitives
- reusable data utilities

Drivers own product-neutral wrappers:

- Drizzle/Postgres-compatible storage
- local filesystem
- OS keychain
- email/calendar protocol adapters
- native platform bridge
- model provider gateway adapters

Drivers must not import product concepts.

## Native App Boundary

The native app composes slice clients, runtime layers, native sidecar
management, and first-run onboarding. It is an application boundary, not a
domain package.

Archived apps on `archive/pre-repo-architecture-automation-2026-04-27` provide
reference patterns:

- Tauri shell
- managed sidecar startup
- editor workspace shell
- local development proxy

Those archived apps should inform implementation but should not be restored as
active package topology without a new migration plan.

## First Runtime Data Loop

The first proof should cross the smallest meaningful set of slices:

1. `tenancy` creates a solo or firm organization and user.
2. `workspace` creates a workspace and ingests synthetic artifacts.
3. `agent-capability` supplies an agent/skill/model binding for extraction.
4. `epistemic` stores candidate claims, evidence, activity, and usage.
5. `workspace` stores candidate tasks and approval gates.
6. `law-practice` and `wealth-management` each provide one vertical overlay
   fixture.
7. The SDK reads a bounded context packet for an agent/client.

## Boundary Rules

- Slice domain packages do not import drivers, config, server, client, UI, or
  tables.
- Use-cases define ports and contracts; server packages implement adapters.
- Client packages consume browser-safe `/public` contracts only.
- UI packages call client/state services rather than orchestrating use cases.
- Cross-slice events and contracts go through `shared/use-cases` only after
  promotion.
- Read models are projections and cannot become the source of truth.
