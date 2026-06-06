# Batch 3 Synthesis

Status: `batch-03-closeout`

## Final Inventory

### Done In Current PR

1. `rqt-001` removes duplicated Yeet affected feedback from verify/publish
   when the explicit full proof immediately follows. Repair still plans affected
   feedback, so the fast repair workflow keeps local signal.
2. `rqt-002` keeps `lint:fix` on the fast repo-cli changed-file path. The
   clean-tree proof remains sub-50 ms and changed-file fixing stays on
   `biome check --write`, not Turbo fan-out.
3. `rqt-004` records proof parity and check-name guardrails so future speedups
   cannot silently weaken the authoritative lane.

### Deferred To Focused Proof PRs

1. `rqt-003` CI setup/cache tuning remains high value, but setup/cache policy
   changes need three comparable before runs and three comparable after runs.
2. `rqt-005` docgen package fingerprint reuse should start as shadow metadata
   with full docgen fallback. Symbol/example-level selectivity is not safe for
   current-PR behavior.
3. `rqt-006` scoped config work should start with a dry-run proof harness and
   task-specific input classification. Blanket package-local Turbo/Biome
   configs are too broad.
4. `rqt-007` repo-export package shards plus deterministic root aggregation are
   the right structural direction, but the shard-v2 migration spans repo-cli,
   repo-codegraph, Turbo, hooks, package manifests, and generated artifacts.
5. `rqt-008` type-test and integration participation filtering should be a
   focused proof. Coverage remains full-only or scheduled/report-only, not part
   of the common End-to-End Green lane.
6. `rqt-009` security, hooks, release, data-sync, Storybook, Vercel, Nix,
   secrets, SAST, and dependency-review parity must stay intact before any wait
   is removed.
7. `rqt-010` external tooling candidates are prototype-only. Useful experiments
   include OXC shadow metadata scanning, CI setup/Bun cache A/B proof, tsgo
   timing, and small bundle/reporting fixtures.
8. Yeet fast-plus-monitor should remain opt-in until a dedicated proof adds
   PR-branch guardrails, known check baselines, monitor output, and explicit
   `audit:github pre-push` fallback.

### Rejected For Now

- Current-PR symbol-level docgen/example selectivity.
- Making Yeet canonical or defaulting to fast-plus-monitor.
- Oxlint replacing Biome/ESLint, Bun test replacing Vitest, Rollup replacing
  root build, Rspack migration, and blind tsgo/native-preview upgrades.
- Blanket package-local Turbo/Biome configs.
- Removing `package.json`, `bun.lock`, or root config from hashes for speed.
- Hash-only repo-export or docgen reuse as authoritative proof.
- Caching `lint:fix`.
- Adding coverage to common End-to-End Green.
- `rqt-011` and `rqt-012` remain rejected because current source already
  satisfies those predecessor findings.

## Task Status Updates

| Task | Final status | Update |
| --- | --- | --- |
| `rqt-001` | done | Keep done and refresh proof evidence to the latest green PR head available before this packet-only closeout commit. |
| `rqt-002` | done | Keep done and keep the original `lint:fix` regression guard explicit. |
| `rqt-003` | deferred | Add Batch 3 setup/cache evidence and keep comparable-run proof as the next gate. |
| `rqt-004` | done | Keep done and refresh check-name/proof-parity artifacts. |
| `rqt-005` | deferred | Defer package-level docgen fingerprint shadow proof. |
| `rqt-006` | deferred | Defer scoped-config dry-run harness and task-input proof. |
| `rqt-007` | deferred | Keep deferred and add Batch 3 generator/scoped-config support. |
| `rqt-008` | deferred | Defer type-test/integration participation filtering; coverage remains full-only/scheduled. |
| `rqt-009` | deferred | Defer side-lane wait removal until proof parity remains complete. |
| `rqt-010` | deferred | Defer prototype-only external tooling candidates and record rejected swaps. |
| `rqt-011` | rejected | Keep rejected. |
| `rqt-012` | rejected | Keep rejected. |

## Acceptance Risks Resolved By Closeout

- Packet evidence needed to be refreshed from `899d5b4b6` / `27063362752` to
  the live green PR evidence available before the final packet-only closeout
  commit: `a7be8dc1e1119d095be0239b39cd812e5650ebec` / `27064446802`.
- `ops/manifest.json` still marked Batch 3 and P3 pending before this closeout.
- `tasks/tasks.jsonc` still had undecided `candidate` tasks after Batch 3.
- P6 needed a fresh zero-blocker quality-review-fix-loop after the evidence
  refresh.
- The canonical synthesis artifact is
  `history/outputs/research-synthesis.md`; no separate
  `research/research-synthesis.md` file is required.

## Closeout Checklist

1. Persist this report.
2. Update `tasks/tasks.jsonc`, `ops/manifest.json`,
   `history/outputs/research-synthesis.md`, `ci-proof.md`,
   `check-name-baseline.md`, `proof-parity-map.md`,
   `before-after-matrix.md`, `implementation-closeout.md`, and
   `quality-review-inventory.md`.
3. Validate packet JSON/schema, markdown diffs, and stale status references.
4. Run `bun run lint:fix` and the packet verification commands.
5. Check PR comments and checks before pushing the follow-up commit.
6. After pushing, monitor PR #214 and confirm it remains mergeable with all
   known checks green or intentionally skipped.
