# Verification And Cutover

## Goal

Ensure the repo does not stop at "mostly migrated." Final closure requires
canonical import surfaces, real verification, amendment closure, and deletion
of temporary compatibility layers.

## Preconditions

Final verification starts only after all of the following are true:

1. the enablement gate has rewritten root workspaces, aliases, app launch
   surfaces, scaffolder rules, and identity-registry coupling
2. shared-kernel and non-slice extraction has reduced `shared/*`,
   `foundation`, and `drivers` to architecture-legal roles only
3. `repo-memory` has cut over to canonical slice packages
4. `editor` has cut over to canonical slice packages
5. tooling and executable agent runtime code have moved to canonical non-slice
   families

## Required Verification Surfaces

The final phase must prove all of the following:

1. no active canonical workspace or agent bundle still lives under a legacy
   root such as `packages/common`, top-level `tooling`,
   `packages/shared/providers`, `packages/runtime`, `.agents`,
   `.aiassistant`, `.claude`, or `.codex`
2. all non-slice packages declare `beep.family` and, when required,
   `beep.kind`
3. all agent bundles declare canonical `beep.json` metadata
4. boundary-sensitive packages expose canonical subpaths
5. repo imports use those canonical subpaths instead of relying on package-root
   ambiguity
6. dependency directions remain architecture-legal after package moves
7. `../ops/compatibility-ledger.md` contains no live row without an approved
   extension window
8. `../ops/architecture-amendment-register.md` contains no unresolved
   candidate
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

Rows that remain open in `../ops/compatibility-ledger.md` at final verification
block closure unless the architecture has been amended explicitly.

## Amendment Closure Rule

The live amendment register at `../ops/architecture-amendment-register.md` is
not a parking lot for unresolved discomfort.

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
- closeout of `../ops/compatibility-ledger.md`
- closeout of `../ops/architecture-amendment-register.md`
- remaining exception count
- final deletion checklist for any legacy shim package or wrapper entrypoint

The initiative does not close while the repo still needs "later cleanup" to
become architecture-compliant.
