# Foundation Package Migration Spec

## Scope

The migration moves all legacy `packages/common/*` workspaces into
`packages/foundation/<kind>/<name>` while preserving their public package names
and APIs.

## Invariants

- `packages/common` is transitional only and must not remain in the final
  active topology.
- `foundation` packages are repo-owned, domain-agnostic substrate.
- `foundation` is not `shared`; shared-kernel packages remain deliberate
  cross-slice product language.
- Public package names remain stable.
- Existing exports remain stable unless a boundary violation blocks the move.
- Package manifests include:

```json
{
  "beep": {
    "family": "foundation",
    "kind": "<primitive|modeling|capability|ui-system>"
  }
}
```

## Acceptance Criteria

- Root workspaces include `packages/foundation/*/*` and do not include
  `packages/common/*` at the end.
- Root aliases, project references, quality references, tstyche, syncpack, and
  package docgen configs are regenerated from the new package locations.
- `create-package --family foundation --kind <kind>` scaffolds canonical
  foundation package paths and metadata.
- `@beep/utils` has an audit ledger before its move.
- `@beep/schema` has a light audit ledger before its move.
- Active repo references to `packages/common` are removed.
- The canonical repo quality command passes, or any remaining blocker is
  documented with the exact failing command.

## Non-Goals

- Redesigning public package APIs.
- Splitting mixed packages unless a boundary violation blocks the topology
  migration.
- Rewriting historical initiative archives solely to erase old path mentions.
