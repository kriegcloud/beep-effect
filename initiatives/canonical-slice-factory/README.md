# Canonical Slice Factory

## Status

Active

## Mission

Create the next architecture-automation packet for proving and systemizing
canonical slice creation. This initiative supersedes the prior repo
architecture automation packet: its retained lessons and `fixture-lab/Specimen`
are reference material only, not the active contract.

The new proof target is the synthetic `architecture-lab` slice with a
`WorkItem` aggregate. It must prove the smallest legal slice first, then add
optional canonical parts through the same modular factory model that future
`beep architecture` commands will use.

## Current Contract

- `architecture-lab/WorkItem` replaces `fixture-lab/Specimen` as the intended
  executable architecture proof.
- `architecture-lab` is a normal slice package family:
  `@beep/architecture-lab-*`, with `WorkItem` at `aggregates/WorkItem`.
- The active proof now includes three domain-kind archetypes:
  `aggregates/WorkItem` for full slice topology, `entities/Worker` for
  persisted domain entities, and `values/WorkPriority` for domain-only value
  objects.
- `beep architecture` is the future command group for slice and architecture
  part creation.
- The CLI must use one schema-backed operation-plan core with ergonomic
  wrappers, not independent one-off scaffold scripts.
- The first ergonomic wrappers should prove whole-slice creation, concept or
  domain-kind creation, role/module creation, JSON plan/apply/check flow, and
  round-trip idempotency.
- Existing `create-package` behavior should become a compatibility wrapper over
  the shared planner rather than a parallel scaffolder.
- `packages/_internal/db-admin` should own the migration aggregation proof for
  `architecture-lab`, using the Effect v3 db-admin package as reference
  material only.

## Reading Order

- [SPEC.md](./SPEC.md) - binding contract and acceptance rules
- [PLAN.md](./PLAN.md) - ordered implementation path for the next Codex session
- [ops/manifest.json](./ops/manifest.json) - machine-readable initiative
  routing and proof metadata
- [ops/codex-handoff-prompt.md](./ops/codex-handoff-prompt.md) - launch prompt
  for the implementation Codex instance

## Reference Material

- [history/repo-architecture-automation-reference.md](./history/repo-architecture-automation-reference.md) -
  compact retained lessons from the deleted prior packet
- `packages/tooling/tool/cli/test/fixtures/repo-architecture-automation` -
  prior registry/check shape to replace
- `packages/fixture-lab/specimen` - drifted live proof workspaces to replace
- `~/YeeBois/projects/beep-effect4/packages/_internal/db-admin` - Effect v3
  db-admin capability reference for drizzle-kit migration aggregation
