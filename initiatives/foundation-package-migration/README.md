# Foundation Package Migration

This initiative tracks the migration from the legacy `packages/common/*`
topology to canonical foundation package homes under
`packages/foundation/<kind>/<name>`.

## Goal

- Move every current `packages/common` workspace into `packages/foundation`.
- Preserve public package names and APIs, such as `@beep/schema`.
- Add package metadata declaring `beep.family = "foundation"` and the canonical
  foundation kind.
- Let repo automation own derived config after each move.
- Delete `packages/common` once all active references are gone.

## Canonical Kinds

| Kind | Purpose |
| --- | --- |
| `primitive` | Leaf types and data substrate |
| `modeling` | Domain-modeling helpers, schemas, identity, messages |
| `capability` | Reusable technical capabilities with runtime behavior |
| `ui-system` | Product-agnostic UI primitives, themes, hooks, styles |

## Execution Rules

- Move packages with `git mv`.
- Preserve public `@beep/*` names and package APIs.
- Commit automation support separately from package moves.
- Commit each package move before starting the next one when practical.
- Run package-local checks and targeted Turbo checks for moved packages.
- Run the full repo quality battery at phase boundaries and final cleanup.

## Artifacts

- [SPEC.md](./SPEC.md): scope, invariants, and acceptance criteria.
- [PLAN.md](./PLAN.md): migration sequence and operational checklist.
- [ops/manifest.json](./ops/manifest.json): machine-readable package move map.
- [ops/handoffs](./ops/handoffs): continuation notes for long agent runs.
- [history](./history): completed-run notes and evidence.
