# Research Synthesis

Status: `batch-02-closeout`

## Accepted Known Findings

- Clean-tree `lint:fix` is currently fast through repo-cli:
  `bash -lc 'time -p bun run lint:fix'` completed in `real 0.04` and printed
  `[beep-cli] lint:fix: no changed files`.
- The current branch is a global-dependency invalidation case because
  `package.json`, `bun.lock`, and `tsconfig.base.json` changed relative to
  `origin/main`.
- Before the rqt-001 implementation, Yeet verify/publish did affected
  build/check/lint/test feedback before full `pre-push` proof. On this branch,
  affected feedback planned almost the whole workspace.
- GitHub Actions setup/cache is a critical repeated cost. Batch 1 found sampled
  setup times around 140s to 270s and large Bun cache restore logs.
- Docgen has 87 task nodes, 82 real docgen configs, and a full/affected path
  that becomes all-package when root/global inputs change.
- Coverage exists as a root/Turbo task but is absent from current PR Check and
  canonical `audit:github quality` proof.
- Hooks are fast guards, not full proof replacements.
- Release, Storybook, data-sync, Vercel/external, security, Nix, and SAST side
  lanes share enough setup/proof surface that they must be included before
  cache or proof behavior is relaxed.

## Stale Or Rejected Findings

- Removing Turbo credentials from task hashes is stale. Current `turbo.json`
  already uses `globalPassThroughEnv` for `TURBO_TOKEN` and `TURBO_TEAM`.
- Adding initial bounded lint sidecar grouping is stale. Current repo-cli
  already has bounded lint policy grouping.
- Replacing `bunx turbo` solely for launcher overhead is low priority. Batch 1
  measured roughly 9ms median difference between `bunx turbo --version` and the
  local binary.
- Treating this branch's all-package affected graph as a normal small-PR
  baseline is rejected; the branch changed root/global inputs.

## Highest-Value Gaps For Next Batch

- Run Batch 3 for Effect v4 prior art, scoped config design, docgen selectivity
  shadow design, Yeet fast-plus-monitor, external tooling candidates, and final
  synthesis.
- Finish publish proof for the in-progress Yeet duplicate-feedback
  implementation: focused tests, plan evidence, and local
  `audit:github quality` are green, but `audit:github pre-push` and PR checks
  remain outstanding.
- Design package-local repo-export catalog shards plus deterministic root
  aggregation, mirroring docgen's package-owned `./docs` generated-artifact
  pattern.
- Add focused `lint:fix` clean/no-op and changed-file regression tests.
- Decide whether `@beep/repo-cli` test hot spots belong in this PR: focused
  proof found the unit lane took 2m40s and `reuse-command.test.ts` took 84s,
  while repo-cli `type-test` ran the root TSTyche suite.
- Keep coverage classified as full-only or scheduled/report-only unless policy
  changes. Integration stays in End-to-End Green, but participation gaps need
  fixing.
- Preserve security, SAST, Nix, dependency-review, and check-name parity before
  relaxing local waits.

## Task Inventory Changes

| Task | Change | Reason | Evidence |
| --- | --- | --- | --- |
| rqt-001 | in-progress | Duplicate Yeet affected feedback before full pre-push is the clearest current-PR speedup; focused plan, repo-cli test proof, and local `audit:github quality` are green. | `research/batch-02-repo-cli-orchestration.md`, `history/outputs/before-after-matrix.md` |
| rqt-002 | selected | The original `lint:fix` regression needs an explicit guard and changed-file proof. | `research/batch-02-lint-fix-biome-eslint.md`, `history/outputs/before-after-matrix.md` |
| rqt-003 | selected | CI setup/cache dominates repeated PR lanes and needs safe timing before policy tuning. | `research/batch-02-ci-nix-storybook-data-sync.md` |
| rqt-004 | selected | Proof parity, check names, and Yeet proof-mode guardrails are required before wait removal. | `history/outputs/quality-review-inventory.md` |
| rqt-005 | candidate | Docgen is high value but needs Batch 2/3 safety design. | `research/batch-01-docgen-cost-model.md` |
| rqt-006 | candidate | Turbo blast-radius changes are high risk and need scoped design proof. | `research/batch-01-turbo-dag-cache.md` |
| rqt-007 | deferred | Repo-export catalog is a measured 100s red metadata gate, but the safe package-shard design needs a dedicated shard-v2 migration across repo-cli, repo-codegraph, Turbo, hooks, package scripts, generated artifacts, and agent guidance. | `research/batch-02-metadata-release-sidecars.md`, `research/repo-exports-sharding-design.md` |
| rqt-008 | candidate | Coverage is full-only/scheduled for now; integration/type-test need participation and no-op graph fixes. | `research/batch-02-check-test-coverage.md` |
| rqt-009 | candidate | Security/hooks/side workflow parity must precede proof relaxation. | `research/batch-02-security-audit-sast.md`, `research/batch-02-ci-nix-storybook-data-sync.md` |
| rqt-010 | candidate | User-requested external tooling and Effect v4 prior art must remain represented. | `ops/prompts/batch-03-external-and-synthesis.md` |
| rqt-011 | rejected | Turbo credential hash work is already done. | `research/batch-01-turbo-dag-cache.md` |
| rqt-012 | rejected | Initial lint sidecar grouping is already done. | `research/batch-01-quality-command-map.md` |

## Selected Current-PR Tasks

- `rqt-001`: remove duplicated Yeet affected feedback when full pre-push
  immediately follows. Status: in progress; focused plan and repo-cli test proof
  plus local `audit:github quality` are green.
- `rqt-002`: preserve and prove the `lint:fix` clean-tree and changed-file fast
  paths.
- `rqt-003`: instrument CI setup/cache and require comparable CI evidence
  before cache-policy speedup claims.
- `rqt-004`: maintain proof parity, check-name, and Yeet proof-mode guardrails.
- `rqt-007`: shard repo-export catalogs per package, then aggregate like docgen
  package docs. Deferred from the current PR because hash-only shard reuse would
  weaken the authoritative proof; the safe version needs Turbo-backed package
  shard tasks and shard-aware lookup consumers.

## Batch 2 Closeout Findings

- Yeet verify/publish no longer need affected feedback before the full proof.
  The implementation now plans only `full:pre-push` for verify and
  `commit -> full:pre-push -> push` for publish; repair still plans affected
  feedback.
- `lint:fix` remains on the changed-file Biome path. The latest dirty-worktree
  proof repeatedly checked 8 processable files, applied no fixes, stayed out of
  Turbo, and ranged from 5.58s to 8.68s on shell samples.
- `repo-exports:catalog:check` was refreshed and is now green, but remains a
  measured full-quality bottleneck. The refreshed check reported 92 packages,
  1078 import specifiers, and 15094 public export entries; earlier read-only
  probing took `real 100.70`, and the refreshed proof took roughly 117s.
- CI setup remains one of the largest repeated costs, with sampled setup around
  153-271s and a roughly 7GB Bun install cache restore.
- Coverage is classified as `full-only` or `scheduled/report-only`, not common
  End-to-End Green, until policy changes.
- Integration stays in End-to-End Green, but packages with integration files
  but no `test:integration` script are currently missed.
- Security, SAST, dependency review, Nix, and secret-scanning surfaces are not
  exact local/CI duplicates; preserve check names and proof parity.

## Deferred Tasks

- None yet. P3 synthesis must defer any candidate that remains too risky, too
  small, or dependent on a separate proof gate.

## Rejected Tasks

- `rqt-011`: Turbo credential hashing cleanup is already implemented.
- `rqt-012`: initial bounded lint sidecar grouping is already implemented.

## Batch 1 Closeout Process Snapshot

- Snapshot record:
  [`history/outputs/process-snapshots.md`](./process-snapshots.md).
- Historical note: the original Batch 1 pre-launch process snapshot was not
  persisted before the first six read-only agents ran. This is accepted only as
  a closeout waiver for already-completed Batch 1. Batch 2 and Batch 3 must not
  launch without a fresh pre-batch process snapshot.
