# Verification And Cutover

## Goal

Ensure the repo does not stop at "mostly migrated." Final closure requires
canonical import surfaces, real verification, amendment closure, and deletion
of temporary compatibility layers.

## Preconditions

Final verification starts only after all of the following are true:

1. the enablement gate has rewritten root workspaces, aliases, app launch
   surfaces, scaffolder rules, and identity-registry coupling
2. `repo-memory` has cut over to canonical slice packages
3. `editor` has cut over to canonical slice packages
4. tooling and executable agent runtime code have moved to canonical non-slice
   families

## Required Verification Surfaces

The final phase must prove all of the following:

1. no active canonical workspace still lives under a legacy root such as
   `packages/common`, top-level `tooling`, `packages/runtime`, or
   `packages/shared/providers`
2. all non-slice packages declare `beep.family` and, when required,
   `beep.kind`
3. all agent bundles declare canonical `beep.json` metadata
4. boundary-sensitive packages expose canonical subpaths
5. repo imports use those canonical subpaths instead of relying on package-root
   ambiguity
6. dependency directions remain architecture-legal after package moves
7. the compatibility ledger contains no `planned` or `active` row without an
   approved extension window
8. the amendment register contains no unresolved candidate
9. repo quality commands still pass after the cutover

## Compatibility Deletion Rule

Temporary aliases are allowed only during active migration windows. They are not
allowed to survive as a permanent second architecture.

Every compatibility layer therefore needs:

- an owner
- a consumer list
- a deletion gate
- an explicit validation query
- a final verification step proving it was removed

Rows that remain open at final verification block closure unless the
architecture has been amended explicitly.

## Amendment Closure Rule

The amendment register is not a parking lot for unresolved discomfort.

Every candidate must close as one of:

1. `rejected` and routed canonically
2. `approved` with a matching change to `standards/ARCHITECTURE.md`
3. `withdrawn` because the migration made the exception unnecessary

If a path, package, or executable runtime exception still exists without one of
those outcomes, the initiative is not finished.

## Expected Deliverable

Final cutover must produce a repo-wide verification and cleanup packet covering:

- canonical subpath rollout
- import rewrite completion
- family/kind metadata validation
- architecture-audit checks
- compatibility-ledger closeout
- amendment-register closeout
- remaining exception count
- final deletion checklist for any legacy shim package or wrapper entrypoint

The initiative does not close while the repo still needs "later cleanup" to
become architecture-compliant.
