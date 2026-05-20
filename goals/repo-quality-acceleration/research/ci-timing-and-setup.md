# CI Timing And Setup Cost

## Current-State Findings

Measured facts:

- Phase 0 is explicitly read-only and must preserve the full quality proof:
  `goals/repo-quality-acceleration/SPEC.md:41-70`,
  `goals/repo-quality-acceleration/SPEC.md:127-139`, and
  `goals/repo-quality-acceleration/ops/prompts/parallel-explorer.md:17-27`.
- The PR `verify` matrix runs six lanes: Lint, Repo Sanity, Check, Test Unit,
  Test Integration, and Docgen. Each lane repeats checkout, base fetch, lane
  gate, `Setup monorepo CI`, and the lane command:
  `.github/workflows/check.yml:46-205`.
- PR lanes use `--affected --summarize` for Turbo-backed commands and affected
  docgen unless docgen tooling changed: `.github/workflows/check.yml:115-190`.
- `Setup monorepo CI` installs Bun and Node, restores `~/.bun/install/cache`,
  optionally restores local `.turbo/cache` only when remote Turbo env is absent,
  runs `bun install --frozen-lockfile`, and may save caches:
  `.github/actions/setup-monorepo-ci/action.yml:21-71`.
- Recent successful PR runs are currently about 6.3 to 6.5 minutes by job
  wall-clock, with Lint as the critical job.
- The latest successful push run was about 13.3 minutes by job wall-clock, with
  Docgen as the critical job. The previous successful push baseline was about
  9.5 minutes, with Build as the critical job.
- The Bun dependency cache restore is large and repeated. In PR Lint run
  `25906168342`, logs showed a roughly 5099 MB Bun cache restore before
  `bun install`. In push Build run `25949443588`, logs showed a roughly 5090 MB
  Bun cache restore, `bun install`, then a failed cache save after another job
  had reserved the same key.

Inference:

- PR wall-clock is dominated by Lint verification plus setup in the critical
  lane. Setup is overlapped across matrix jobs, so setup reduction improves PR
  wall-clock only when it shortens the critical lane, but it can also cut a lot
  of runner-minutes.
- The highest setup-cost suspect is not local Turbo cache restore; local Turbo
  cache restore is conditional and should be skipped when remote cache env is
  available: `.github/workflows/check.yml:84-86` and
  `.github/actions/setup-monorepo-ci/action.yml:41-51`.
- The broad Bun install cache may be too expensive to restore on every matrix
  lane unless it saves more install time than it costs to download and unpack.

## Evidence

Recent run timing:

| Run | Event | Job Wall | Critical Job | Sum `Setup monorepo CI` | Sum Verification |
|---|---|---:|---|---:|---:|
| `25906168342` | PR | 381s | Lint 377s | 829s | 864s |
| `25905842432` | PR | 392s | Lint 389s | 867s | 883s |
| `25949443588` | push | 800s | Docgen 796s | 1098s | 1957s |
| `25906621282` | push | 1747s workflow, 569s job span | Build 566s | 1283s | 922s |

Commands used:

```sh
gh run list --workflow check.yml --limit 20 --json databaseId,status,conclusion,createdAt,updatedAt,displayTitle,event,headBranch,headSha
gh run view 25906168342 --json jobs
gh run view 25949443588 --json jobs
gh run view 25906168342 --job 76140324654 --log | rg "Cache Size|Cache restored|bun install"
gh run view 25949443588 --job 76284259320 --log | rg "Cache Size|Cache restored|bun install|Failed to save"
```

Primary source paths inspected:

- `.github/workflows/check.yml`
- `.github/actions/setup-monorepo-ci/action.yml`
- `package.json`
- `turbo.json`
- `goals/repo-quality-acceleration/README.md`
- `goals/repo-quality-acceleration/SPEC.md`
- `goals/repo-quality-acceleration/PLAN.md`
- `goals/repo-quality-acceleration/ops/manifest.json`
- `goals/repo-quality-acceleration/ops/prompts/parallel-explorer.md`

External primary docs:

- Turborepo `run` reference: <https://turborepo.dev/docs/reference/run>
- Turborepo caching docs:
  <https://turborepo.dev/docs/crafting-your-repository/caching>
- GitHub `actions/cache`: <https://github.com/actions/cache>

No full local quality pass, formatter, codegen, or write-mode command was run.

## Candidate Interventions

| Rank | Intervention | Expected Impact | Risk | Cost | Verification |
|---|---|---:|---|---|---|
| 1 | A/B a lean PR dependency setup: disable broad restore-key fallback for `~/.bun/install/cache` on PR matrix jobs, or make it exact-key only, while keeping `bun install --frozen-lockfile`. | High | Medium: network variance or missing package cache could make cold installs slower. | Medium | Open one timing-only branch, run normal Check workflow, compare `gh run view <before/after> --json jobs`; commands and proof lanes must remain unchanged. |
| 2 | Move Bun cache writes out of ordinary push Build setup, or serialize them in a dedicated cache-prime workflow/job. | Medium-high for push, low direct PR impact | Low-medium: stale cache if no separate primer keeps exact keys fresh. | Small-medium | Compare push Build setup before/after; logs must show no failed `actions/cache/save`; full push-to-main proof still runs all current lanes. |
| 3 | Add setup substep timing visibility inside the composite action or job summary without changing lane commands. | Low direct, high diagnostic value | Low | Small | Verify one PR and one push include setup timing summary; no command behavior changes. |
| 4 | Replace `tj-actions/changed-files@v47` in PR Size Label with an equivalent checkout/git-diff or GitHub API count. | Low-medium: removes about 40s from PR Size Label, but not current critical path. | Low | Small | Run on a PR with known changed-file count; confirm same `size/*` label behavior and no quality-lane changes. |
| 5 | Research a Nix-specific setup path that avoids full monorepo dependency restore when only `bun run audit:github nix` is needed. | Medium for Nix job, low current critical-path impact | Medium | Medium | Focused branch timing only; compare `Nix Shell` setup and `Run Nix checks`; preserve push/scheduled full proof. |

## Do Not Do

- Do not remove Lint, Check, Test Unit, Test Integration, Docgen, Nix, security,
  or secret scanning just to make PRs faster.
- Do not merge matrix lanes solely to save setup cost; this may reduce
  runner-minutes while worsening PR wall-clock by serializing verification.
- Do not disable `--affected` without a replacement proof.
- Do not optimize cache keys by omitting `bun.lock`, root config, or declared
  Turbo inputs.
- Do not run a full slow local quality pass during Phase 0 for this track.

## Open Questions

- Is the 5 GB Bun install cache expected, or is it accumulating packages that
  could be safely excluded or pruned?
- Is PR branch protection waiting on `PR Size Label`, or is it non-blocking
  decoration?
- Are `TURBO_TOKEN` and `TURBO_TEAM` consistently present for PRs from the
  relevant branch types, including forks if supported?
- Would a cold `bun install --frozen-lockfile` without restoring
  `~/.bun/install/cache` beat the current 5 GB restore plus install path on
  GitHub-hosted runners?
- Should the upcoming `actions/cache` Node 24 migration be handled as a separate
  maintenance item rather than folded into timing acceleration?
