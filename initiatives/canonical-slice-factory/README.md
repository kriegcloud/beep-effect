# Canonical Slice Factory

## Status

Active

## Mission

Create the next architecture-automation packet for proving and systemizing
canonical slice creation. This initiative supersedes
`initiatives/repo-architecture-automation`: that packet and
`fixture-lab/Specimen` are reference material only, not the active contract.

The new proof target is the synthetic `architecture-lab/WorkItem` staged proof.
It must prove the smallest legal slice first, then add optional canonical parts
through the same modular factory model that future `beep architecture` commands
will use.

## Current Contract

- `architecture-lab/WorkItem` replaces `fixture-lab/Specimen` as the intended
  executable architecture proof.
- `beep architecture` is the future command group for slice and architecture
  part creation.
- The CLI must use one schema-backed operation-plan core with ergonomic
  wrappers, not independent one-off scaffold scripts.
- The first ergonomic wrappers should prove whole-slice creation, concept or
  domain-kind creation, and role/module creation.
- Existing `create-package` behavior should become a compatibility wrapper over
  the shared planner rather than a parallel scaffolder.

## Reading Order

- [SPEC.md](./SPEC.md) - binding contract and acceptance rules
- [PLAN.md](./PLAN.md) - ordered implementation path for the next Codex session
- [ops/manifest.json](./ops/manifest.json) - machine-readable initiative
  routing and proof metadata
- [ops/codex-handoff-prompt.md](./ops/codex-handoff-prompt.md) - launch prompt
  for the implementation Codex instance

## Reference Material

- `initiatives/repo-architecture-automation` - prior packet to mine for lessons
  and then supersede/delete from active guidance
- `packages/tooling/tool/cli/test/fixtures/repo-architecture-automation` -
  prior registry/check shape to replace
- `packages/fixture-lab/specimen` - drifted live proof workspaces to replace
