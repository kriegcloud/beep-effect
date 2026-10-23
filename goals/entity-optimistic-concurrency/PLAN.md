# Entity Optimistic Concurrency Plan

## Status

Status: `completed-retained` (2026-10-23, operator ruling; final PR #1941)

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | completed | Inventory every entity UPDATE path and the version machinery. | Inventory and decisions D1–D4 recorded in `SPEC.md`. |
| P1 Implement | completed | Schema (`RowVersion`, `version()`), migration, port errors, guarded adapters, stale-write tests. | Acceptance criteria are met. |
| P2 Verify | completed | Run required checks and capture evidence. | Verification is green or blockers are documented. |
| P3 Yeet: PR to mergeable | completed (2026-10-21, #1941 merged `2a42813ca1` under S43) | Publish through yeet and drive the PR to mergeable: required checks green, review comments answered and resolved. | `mergeStateStatus` is `CLEAN`; zero unresolved review threads. |
| P4 Close | completed (2026-10-23) | Write the closeout reflection and flip packet state. | Packet status and evidence are updated; a closeout reflection exists. |

## Closeout Checklist

Before marking the packet closed:

1. Write a closeout reflection via the `/reflect` skill to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Its YAML frontmatter must
   validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts`.
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses and a typed `proposedCloseout` with status `completed-retained`
   and finalPullRequest. Keep `initiative.status` operative until completion
   evidence verifies; do not close the external execution/session ledger from a proposal.

## Write-path inventory (2026-10-20)

| Path | Rule (SPEC §2) | Proof |
| --- | --- | --- |
| `SyncItemRepository.update` | 1 full-entity | contract `staleSyncItemUpdate` (in-memory + PGlite) |
| `SyncOperationRepository.update` | 1 full-entity | contract `staleSyncOperationAfterRequeue` (both) |
| `SyncOperationRepository.requeueLeased` | 3 bump | same scenario: requeued row reaches v3 |
| `SyncConflictRepository.markReviewed` | 2 read-modify-write | `racedSyncConflictReview` (PGlite, injected competing write) |
| `SyncCursorRepository.upsert` (replace) | 2 read-modify-write | `racedSyncCursorUpsert` (PGlite, injected competing write) |
| `ProviderInstanceRepository.save` | 1 full-entity | PGlite: update lands mid-probe, probe save rejected |
| `ThreadStore.setTitleIfEmpty` | 3 bump | in-memory + PGlite: rename reaches v2 |
| `ThreadStore.appendTurn` items reconciliation | exempt (same-transaction insert) | PGlite: new turn at v1 |
| `WorkspaceVaultStore.setVaultRoot` | 3 bump | PGlite: second root reaches v2 |
| `EdgeAuthority` head close | 3 bump | PGlite: former head reaches v2 |
| `VaultSyncEngine.reviveFailedOperations` | caller threads written rows | regression: two failed ops on one item |

Out of scope: `WorkItem` (no `rowVersion`), law-practice append-only
repositories (triggers forbid UPDATE).

## Verification evidence (2026-10-20, local)

- `turbo run check test --filter='...@beep/shared-domain'` (47 packages,
  storybook and scratchpad excluded): 188/188 tasks green.
- `turbo run test:integration` for db-admin, documents/workspace/epistemic/
  law-practice servers and professional-desktop: 87/87 tasks green (applies
  the new migration).
- `migrations:check` (db-admin): no drift; `codegen:check` (desktop bundle):
  in sync.
- Mutation checks: removing the `row_version` predicate from SyncConflict's
  write, ProviderInstance's save, or the engine's revive threading turns the
  matching test red.
- `package-verify` (audit + docgen) green for effect-drizzle, shared-domain,
  db-admin, documents use-cases/server, agents use-cases/server, workspace
  server and epistemic server; `package-verify --quick` (lint + check) green for
  the ten test-only packages and professional-desktop.
- Local cheap-gate attribution: effect-vitest (3), schema-first (1), fallow
  complexity (5), goals doctor (phase status) and the observability catalog
  (two stale shards) were introduced here and fixed. The markdown
  Effect-imports red came only from the ignored
  `scratchpad/.jsdoc-loop/generated-docs/` residue (dated 2026-09-09), parked
  outside the tree; hosted CI never sees it.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.

## Verification Commands

```sh
test "$(wc -m < goals/entity-optimistic-concurrency/GOAL.md)" -le 4000
jq . goals/entity-optimistic-concurrency/ops/manifest.json
rg -n "entity-optimistic-concurrency|GOAL.md|agentLaunchers|packetAnchorDocument" goals/entity-optimistic-concurrency
git diff --check -- goals/entity-optimistic-concurrency
```
