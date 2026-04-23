# Design Index

This folder holds the durable design set for the repo architecture convergence
initiative.

The corpus is intentionally split into:

- routing decisions
- migration packets
- governance/control-plane artifacts that later execution phases must update

The design set assumes the architecture-standard meaning of `/public`,
`/server`, `/secrets`, `/layer`, and `/test`: they are canonical export
subpaths on `use-cases` and `config` packages, not package destination kinds.

## Reading Order

1. [current-state-routing-canon.md](./current-state-routing-canon.md) — precise
   destination canon for legacy roots and mixed packages
2. [legacy-path-coupling-inventory.md](./legacy-path-coupling-inventory.md) —
   burn-down inventory of hard-coded legacy paths and package names
3. [compatibility-ledger.md](./compatibility-ledger.md) — live registry for
   every temporary alias, wrapper, or shim plus its deletion gate
4. [architecture-amendment-register.md](./architecture-amendment-register.md) —
   durable register for any proposal to preserve a non-canonical exception
5. [non-slice-family-migration.md](./non-slice-family-migration.md) —
   `foundation`, `drivers`, `tooling`, metadata, identity-registry, and
   pre-slice enablement plan
6. [shared-kernel-contraction.md](./shared-kernel-contraction.md) —
   `shared/*` retention, extraction, and default-delete rules
7. [repo-memory-migration.md](./repo-memory-migration.md) — first slice cutover
   with split audits, consumer impact, and shim deletion mechanics
8. [editor-migration.md](./editor-migration.md) — second slice cutover with
   explicit `editor/ui` creation and control-plane dependency rules
9. [agent-runtime-decomposition-matrix.md](./agent-runtime-decomposition-matrix.md)
   — `.claude` and `.codex` split between declarative agent assets and
   executable tooling code
10. [tooling-and-agent-cutover.md](./tooling-and-agent-cutover.md) —
    operational package relocation plus repo-local agent runtime cutover
11. [verification-and-cutover.md](./verification-and-cutover.md) — final
    verification, amendment closure, and deletion of all temporary shims

## Ordering Assumption

This corpus assumes the following enablement-first order:

1. close routing and inventory
2. establish the compatibility ledger and amendment register
3. land repo wiring, path rewrites, identity-registry updates, scaffolder
   changes, and repo-check enforcement before slice cutovers
4. migrate `repo-memory`
5. migrate `editor`
6. relocate tooling and agent runtime code
7. delete all compatibility layers and close any open amendment candidate
