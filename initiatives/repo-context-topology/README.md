# Repo Context Topology

## Status

Active

## Mission

Make repo topology carry more coding-agent context. The first proof is a
generated public export catalog that lets agents find canonical symbols,
import paths, summaries, and source locations before recreating local helpers.

This initiative starts from the observation that paths, package subpaths, role
suffixes, export maps, JSDoc summaries, and generated catalogs can compress
repo knowledge more reliably than another long prompt.

## First Proof

Phase 1 generates:

- `standards/repo-exports.catalog.jsonc`
- `standards/repo-exports.catalog.md`

The catalog is derived from package export maps, TypeScript exported
declarations, and JSDoc. `UnknownRecord` from `@beep/schema` is the seed proof:
an agent should be able to discover the canonical schema by name, intent text,
package, import path, and source location without a hand-maintained duplicate
registry.

## Reading Order

- [SPEC.md](./SPEC.md) - binding contract for the context-topology proof
- [PLAN.md](./PLAN.md) - implementation and follow-up path
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing metadata
