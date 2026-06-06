# Research Synthesis

Status: `batch-03-closeout`

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

## Highest-Value Follow-Up Gaps

- CI setup/cache comparable-run tuning remains one of the largest PR-level
  opportunities. Latest run `27064446802` still spent about 2m17s-2m53s in
  `Setup monorepo CI` on the main verification jobs, but shared workflow/cache
  behavior needs three comparable before and after runs before any policy change.
- Package-local repo-export catalog shards plus deterministic root aggregation
  remain the strongest metadata speed and merge-conflict reduction opportunity.
  The root aggregate must stay authoritative until repo-cli, repo-codegraph,
  Turbo, hooks, package scripts, and generated artifacts migrate together.
- Docgen package fingerprint reuse should start in shadow mode. Symbol/example
  selectivity remains rejected for current-PR behavior until a full-fallback
  correctness model is proven.
- Scoped Turbo/config blast-radius reduction should start with a dry-run proof
  harness and task-specific inputs, not blanket package-local configs.
- Type-test and integration participation filtering should be a focused proof;
  coverage remains full-only or scheduled/report-only for now.
- Yeet fast-plus-monitor should be opt-in until PR-branch guardrails, known
  check baselines, monitor output, and explicit `audit:github pre-push` fallback
  are implemented.
- OXC, tsgo, Bun cache, and bundle-tool candidates are prototype-only. Batch 3
  rejected wholesale tool replacement in the current PR.

## Task Inventory Changes

| Task | Change | Reason | Evidence |
| --- | --- | --- | --- |
| rqt-001 | done | Duplicate Yeet affected feedback before full pre-push was removed for verify/publish; repair feedback is preserved. | `research/batch-02-repo-cli-orchestration.md`, `history/outputs/before-after-matrix.md`, PR run `27064446802` |
| rqt-002 | done | The original `lint:fix` regression is guarded by clean-tree and changed-file proofs. | `research/batch-02-lint-fix-biome-eslint.md`, `history/outputs/before-after-matrix.md`, PR run `27064446802` |
| rqt-003 | deferred | CI setup/cache dominates repeated PR lanes but needs comparable-run proof before policy tuning. | `research/batch-02-ci-nix-storybook-data-sync.md`, `research/batch-03-tooling-candidates.md` |
| rqt-004 | done | Proof parity, check names, and Yeet proof-mode guardrails are recorded. | `history/outputs/quality-review-inventory.md`, `history/outputs/check-name-baseline.md`, `history/outputs/proof-parity-map.md` |
| rqt-005 | deferred | Docgen package fingerprinting is safe only as shadow proof with full fallback. | `research/batch-01-docgen-cost-model.md`, `research/batch-03-docgen-selectivity-shadow.md` |
| rqt-006 | deferred | Turbo/config blast-radius changes need a scoped dry-run harness and task-input proof. | `research/batch-01-turbo-dag-cache.md`, `research/batch-03-scoped-config-design.md` |
| rqt-007 | deferred | Repo-export catalog is a measured 100s red metadata gate, but the safe package-shard design needs a dedicated shard-v2 migration across repo-cli, repo-codegraph, Turbo, hooks, package scripts, generated artifacts, and agent guidance. | `research/batch-02-metadata-release-sidecars.md`, `research/repo-exports-sharding-design.md` |
| rqt-008 | deferred | Coverage is full-only/scheduled for now; integration/type-test need participation and no-op graph fixes. | `research/batch-02-check-test-coverage.md`, `research/batch-03-tooling-candidates.md` |
| rqt-009 | deferred | Security/hooks/side workflow parity must precede proof relaxation. | `research/batch-02-security-audit-sast.md`, `research/batch-02-ci-nix-storybook-data-sync.md`, `research/batch-03-yeet-fast-monitor.md` |
| rqt-010 | deferred | User-requested Effect v4 and external tooling exploration found prototype-only candidates and rejected broad tool swaps. | `research/batch-03-effect-v4-tools.md`, `research/batch-03-tooling-candidates.md` |
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

## Batch 3 Closeout Findings

- Effect v4 prior art supports source-hashed metadata, OXC diagnostics replay,
  and generator-service decomposition as follow-up designs, but no current-PR
  wholesale adoption is safe.
- External tooling candidates are prototype-only. Batch 3 rejected replacing
  Biome/ESLint, Vitest, root build, Turbo, or workflow policy without a focused
  benchmark and fallback proof.
- Docgen selectivity should start at package fingerprint shadow metadata.
  Symbol/example selectivity remains rejected for current-PR behavior.
- Scoped configuration should be a hybrid proof harness. Package-local
  Turbo/Biome overlays may help only where resolved task definitions show a
  smaller affected graph.
- Yeet fast-plus-monitor should be opt-in and PR-branch guarded; manual quality
  lanes remain canonical until dedicated Yeet proof gates pass.
- Latest live pre-closeout PR evidence: PR #214 was mergeable at
  `a7be8dc1e1119d095be0239b39cd812e5650ebec`, Check run `27064446802`, with
  all current checks green or intentionally skipped.

## Deferred Tasks

- `rqt-003`: setup/cache comparable-run tuning.
- `rqt-005`: docgen package fingerprint shadow proof.
- `rqt-006`: scoped-config dry-run harness and task-input proof.
- `rqt-007`: repo-export package shards plus root aggregation.
- `rqt-008`: type-test/integration participation filtering.
- `rqt-009`: security/hooks/side workflow parity and opt-in monitor proof.
- `rqt-010`: external tooling prototypes only.

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
