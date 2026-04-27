# Design Index

This folder holds the durable design set for the repo architecture convergence
initiative.

The corpus is intentionally split into:

- P0 routing and inventory baselines
- phase-aligned migration packets
- reference seeds that inform the live governance/control plane in `../ops`

The design set assumes the architecture-standard meaning of `/public`,
`/server`, `/secrets`, `/layer`, and `/test`: they are canonical export
subpaths on `use-cases` and `config` packages, not package destination kinds.

## Phase-Aligned Reading Order

1. [current-state-routing-canon.md](./current-state-routing-canon.md) — precise
   destination canon for legacy roots, mixed packages, and live agent roots
   (`P0`)
2. [legacy-path-coupling-inventory.md](./legacy-path-coupling-inventory.md) —
   burn-down inventory of hard-coded legacy paths and package names (`P0`)
3. [compatibility-ledger.md](./compatibility-ledger.md) — design-time seed for
   temporary alias or shim rows that, when needed, must live in
   `../ops/compatibility-ledger.md` (`P1` reference only)
4. [architecture-amendment-register.md](./architecture-amendment-register.md) —
   design-time seed for amendment candidates that, when needed, must live in
   `../ops/architecture-amendment-register.md` (`P1` reference only)
5. [non-slice-family-migration.md](./non-slice-family-migration.md) —
   `foundation`, `drivers`, `tooling`, metadata, identity-registry, and
   pre-slice enablement plan (`P2`) plus non-slice extraction prerequisites
   (`P3`)
6. [shared-kernel-contraction.md](./shared-kernel-contraction.md) —
   `shared/*` retention, extraction, and default-delete rules (`P3`)
7. [repo-memory-migration.md](./repo-memory-migration.md) — first slice cutover
   with split audits, consumer impact, and shim deletion mechanics (`P4`)
8. [editor-migration.md](./editor-migration.md) — second slice cutover with
   explicit `editor/ui` creation and control-plane dependency rules (`P5`)
9. [agent-runtime-decomposition-matrix.md](./agent-runtime-decomposition-matrix.md)
   — `.agents`, `.aiassistant`, `.claude`, and `.codex` split between
   declarative agent assets and executable tooling code (`P0` routing detail,
   `P6` execution)
10. [tooling-and-agent-cutover.md](./tooling-and-agent-cutover.md) —
    operational package relocation plus repo-local agent runtime cutover (`P6`)
11. [verification-and-cutover.md](./verification-and-cutover.md) — final
    verification, amendment closure, and deletion of all temporary shims
    (`P7`)

## `P0` Baseline Contract

Any `P0` batch that claims a routing, topology, architecture, or repo-law
baseline must read at least:

1. [current-state-routing-canon.md](./current-state-routing-canon.md)
2. [legacy-path-coupling-inventory.md](./legacy-path-coupling-inventory.md)
3. [agent-runtime-decomposition-matrix.md](./agent-runtime-decomposition-matrix.md)

That baseline is incomplete unless it records proof for all of the following
audit families:

1. legacy roots and hard-coded path couplings
2. agent-root routing across `.agents`, `.aiassistant`, `.claude`, and
   `.codex`
3. canonical subpath/export usage on boundary-sensitive packages
4. temporary compatibility surfaces that may need live ledger rows later
5. `beep.family`, `beep.kind`, and agent `beep.json` metadata state

This design folder does not own the live `ops/*` inputs, but any operational
packet that consumes the design surface should inherit this minimum `P0`
baseline set.

## Phase Model Alignment

This corpus follows the authoritative `P0` through `P7` execution model used by
the root packet and the live `ops/*` control plane:

1. `P0` closes routing, inventory, importer census, current-state agent
   modeling, and the baseline audits for canonical subpaths/exports,
   compatibility surfaces, and metadata state
2. `P1` lands the live ledgers only in `ops/*`; the design ledger docs in this
   folder are reference seeds, not live operational authority
3. `P2` lands repo wiring, path rewrites, identity-registry updates,
   scaffolder changes, and repo-check enforcement before any slice moves
4. `P3` executes shared-kernel contraction plus non-slice extraction before
   `repo-memory`, `editor`, or agent/tooling cutover work starts
5. `P4` migrates `repo-memory`
6. `P5` migrates `editor`
7. `P6` relocates tooling and agent-runtime code, retires legacy agent roots,
   and deletes remaining governed compatibility layers
8. `P7` runs final verification, closes the live ledgers, and proves no
   temporary exception remains
