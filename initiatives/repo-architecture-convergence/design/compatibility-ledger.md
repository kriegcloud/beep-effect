# Compatibility Ledger

## Purpose

Track every temporary alias, re-export, wrapper entrypoint, or compatibility
shim introduced during convergence.

No compatibility surface is allowed unless it has a row here. If a migration can
cut over atomically, it should do so and leave this ledger untouched.

## Required Fields

Every row must record:

- the exact legacy surface
- the shim kind
- the canonical replacement
- the affected consumers
- the owner cutover
- the deletion gate
- the validation query
- the current status

## Planned Compatibility Surfaces

| Legacy surface | Shim kind | Canonical replacement | Affected consumers | Delete when | Validation query | Status |
|---|---|---|---|---|---|---|
| `@beep/runtime-protocol` | package alias / re-export only if the protocol split cannot land atomically | `@beep/shared-use-cases/public`, `@beep/repo-memory-use-cases/public`, `@beep/repo-memory-use-cases/server` | `apps/desktop`, `packages/repo-memory/client`, `packages/editor/protocol`, docs/tests | all imports to `@beep/runtime-protocol` reach zero | `rg -n "@beep/runtime-protocol" apps packages tooling .claude .codex` | planned |
| `@beep/runtime-server` | package alias / wrapper exports only if desktop cutover needs a transition batch | `@beep/repo-memory-server`, `@beep/repo-memory-config/*` | `apps/desktop`, docs/tests, any sidecar launch wrappers | all imports to `@beep/runtime-server` reach zero | `rg -n "@beep/runtime-server" apps packages tooling` | planned |
| `packages/runtime/server/src/main.ts` | wrapper entrypoint only if build/dev scripts cannot flip in one batch | `packages/repo-memory/server/src/main.ts` or the canonical repo-memory server entrypoint chosen during implementation | `apps/desktop` Tauri/dev/build/docs surfaces | no active launch surface points at the old path | `rg -n "packages/runtime/server/src/main.ts" apps package.json README.md` | planned |
| `@beep/shared-server` | package alias only during `shared/server -> drivers/drizzle` extraction | `@beep/drizzle` | shared-server tests, docs, and importers | all imports to `@beep/shared-server` reach zero | `rg -n "@beep/shared-server" apps packages tooling` | planned |
| `@beep/shared-tables` | package alias only during `shared/tables` split | `@beep/drizzle` and, if created, `@beep/table-modeling` | shared-tables tests, docs, and importers | all imports to `@beep/shared-tables` reach zero | `rg -n "@beep/shared-tables" apps packages tooling` | planned |
| `@beep/editor-lexical` | package alias only during `editor-lexical -> editor/ui` cutover | `@beep/editor-ui` | `apps/editor-app`, editor package docs/tests | all imports to `@beep/editor-lexical` reach zero | `rg -n "@beep/editor-lexical" apps packages tooling` | planned |
| `packages/editor/runtime/src/main.ts` | wrapper entrypoint only if app launch scripts cannot flip in one batch | `packages/editor/server/src/main.ts` or the canonical editor server entrypoint chosen during implementation | `apps/editor-app` Tauri/dev/build surfaces | no active launch surface points at the old path | `rg -n "packages/editor/runtime/src/main.ts" apps package.json README.md` | planned |

## Governance Rule

When a row becomes real, the owning phase updates:

1. `Status` from `planned` to `active`
2. the exact implementation location of the shim
3. the consumer list if it changes
4. the validation query output used to prove deletion

If a planned shim turns out to be unnecessary because the cutover lands
atomically, the row changes to `withdrawn`.

At final cutover, every row must be `deleted` or `withdrawn` unless an approved
architecture amendment explicitly preserves the surface.
