# Stale Reference Inventory

## Release Graph

Initial scan found changesets that name packages outside the current workspace
graph.

| File | Stale package(s) | Action |
| --- | --- | --- |
| `.changeset/fuzzy-rabbits-share.md` | `@beep/editor-app` | Delete no-longer-releasable changeset. |
| `.changeset/green-plans-admire.md` | `@beep/runtime-protocol`, `@beep/runtime-server` | Remove stale entries and preserve `@beep/schema`. |
| `.changeset/nervous-coins-sparkle.md` | `@beep/desktop`, `@beep/repo-memory-model`, `@beep/repo-memory-runtime` | Delete no-longer-releasable changeset. |
| `.changeset/slow-caps-fail.md` | `@beep/desktop`, `@beep/repo-memory-client`, `@beep/repo-memory-model`, `@beep/repo-memory-runtime`, `@beep/runtime-protocol`, `@beep/runtime-server` | Delete no-longer-releasable changeset. |

## Tracked Config Drift

| File | Stale reference(s) | Action |
| --- | --- | --- |
| `tsconfig.json` | `apps/desktop`, `apps/editor-app` test excludes | Remove removed-workspace excludes. |

## Paused Initiative Context

`initiatives/knowledge-workspace` still mentions pre-lean-slate editor package
paths. This packet is already classified as needing refresh after lean slate in
`initiatives/README.md`, so it is inventoried but not a P1 blocker.
