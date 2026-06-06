# Batch 2: CI Nix Storybook Data Sync

Status: `complete`

Read-only agent lane. The agent returned this report; the orchestrator persisted
it.

## Hotspots

- Shared setup is the cross-lane hotspot. `Setup monorepo CI` restores Bun/Node,
  a `~/.bun/install/cache` archive, optional Turbo cache, then runs
  `bun install`; sampled Check/Release/Storybook jobs spend about 153s to 271s
  in that composite step.
- The Bun install cache is enormous in sampled logs: about `7397924798` bytes,
  reported as about 7055 MB. Restore plus untar dominates setup before
  verification even starts.
- `Nix Shell` currently pays full monorepo setup before installing Nix and
  running `bun run audit:github nix`; latest PR run spent 169s in setup and 39s
  in Nix checks.
- `Release PR` pays setup before checking whether any changesets exist. A
  no-release-diff run still spent about 174s in setup before skipping PR
  creation.
- Current checkout/main has no `.github/workflows/storybook.yml`, but GitHub
  still lists an active `Storybook Tests` workflow from
  `origin/infra/storybook-vercel-deploy`. Treat it as branch/orphan evidence,
  not current main source.
- PR check names include skipped lanes and external contexts: `Build` is skipped
  on PR, `Docgen` can succeed via skip, and Vercel adds `Vercel Preview
  Comments`, `Vercel - oip-web`, and `Vercel - oip-web-staging`.
- GitHub ruleset evidence is lighter than expected: `main` ruleset only has
  deletion and non-fast-forward rules; classic branch protection reports
  "Branch not protected".

## Source Evidence

- `.github/actions/setup-monorepo-ci/action.yml`: setup has Bun, Node, Bun cache
  restore, optional Turbo restore, install, and cache save, but no durable
  substep timing summary.
- `.github/workflows/check.yml`: matrix names are `Lint`, `Repo Sanity`,
  `Check`, `Test Unit`, `Test Integration`, `Docgen`; `Build` is push-only;
  `Nix Shell` uses setup, Nix, Cachix, then `bun run audit:github nix`.
- `packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts`: Nix proof
  is `nix flake check --all-systems` plus
  `nix develop --command echo "Dev shell OK"`.
- `.github/workflows/release.yml`: setup runs before pending-changeset
  detection.
- `.github/workflows/data-sync.yml`: no recent runs found; it reuses setup, then
  runs focused `@beep/repo-cli` and `@beep/data` checks/tests.
- `origin/infra/storybook-vercel-deploy:.github/workflows/storybook.yml`:
  Storybook job uses setup plus Playwright cache/install and
  `bun run test:storybook`; current main does not contain this file.
- Live PR #214 latest Check run `27058047302`: all current checks pass except
  PR-only `Build` is skipped; Vercel external checks pass.
- Current Action logs warn Node.js 20 actions are deprecated and forced Node 24
  starts on June 16, 2026.

## Duplicate Or Stale Findings Avoided

- Did not re-file Turbo credential hash pollution; Batch 1 already rejected it.
- Did not treat Turbo launcher overhead as material.
- Did not claim a cache-policy speedup from one runner sample.
- Did not treat the Storybook workflow as current main source.
- Did not propose dropping Nix, SAST, secrets, Vercel, or release/data-sync
  proof.

## Candidate Implementation Tasks

| Rank | Task | Write Scope | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Add setup substep timing/cache metadata summary across shared setup consumers. | `.github/actions/setup-monorepo-ci/action.yml`, maybe `packages/tooling/tool/cli/src/commands/Ci` | Measurement unlock for all Check, Release, Storybook, Data Sync lanes. | Low | `gh run view <before/after> --json jobs`; inspect setup summaries and cache hit/size/install timing. | Revert timing-only commit; setup behavior should be unchanged. |
| 2 | Make PR `Nix Shell` avoid full Bun dependency setup, while preserving local `audit:github nix` fallback. | `.github/workflows/check.yml`, possibly a repo-owned lightweight Nix helper | Likely saves about 2-3 minutes on the Nix PR job. | Medium proof-parity risk | Compare `Nix Shell` before/after job steps; run full local `bun run audit:github nix` in proof phase. | Restore setup step and `bun run audit:github nix` workflow command. |
| 3 | Move Release pending-changeset detection before setup and skip setup when no changesets exist. | `.github/workflows/release.yml` | Saves about 174-193s on no-op release main pushes. | Low | Release run with no changesets should skip setup and still report no release PR needed. | Revert step order. |
| 4 | If Storybook workflow lands, remove duplicate Playwright install and disable Turbo cache for cache-disabled `test:storybook`. | `.github/workflows/storybook.yml`, `packages/foundation/ui-system/ui/package.json` only if needed | Saves setup noise and avoids redundant browser install; sampled branch run spent 25s installing Playwright after 153s setup. | Medium | Storybook run passes; `bun run test:storybook` remains usable locally. | Restore prior workflow/package script. |
| 5 | Persist live check-name/ruleset/external-status baseline before workflow edits. | `goals/repo-quality-throughput/history/outputs/check-name-baseline.md`, maybe CI helper | Safety unlock, not direct speed. | Low | `gh pr checks ontology_builder_refinement --json ...`; `gh api repos/kriegcloud/beep-effect/rulesets`; branch protection API. | Revert baseline record only if replaced by stricter equivalent. |

## Resource Risks

- The 7GB Bun cache restore can consume several minutes and significant runner
  IO; do not tune cache policy without three comparable before/after runs.
- Nix direct-workflow optimization risks drifting from repo-cli proof semantics
  unless local `audit:github nix` remains the fallback.
- Cachix read-only setup reported the `beep-effect` cache missing/private but
  continued; this is not currently a blocker, but it makes Cachix benefit
  uncertain.
- Node 20 action deprecation is close: validate Action versions before
  June 16, 2026.
- Data Sync has no recent run history, so any setup/cache change needs either a
  manual proof run later or explicit low-confidence marking.

## Do Not Do

- Do not rename authoritative Check matrix names without an explicit check-name
  decision.
- Do not remove skipped `Build` or `Docgen` behavior without proving
  branch/ruleset impact.
- Do not land Storybook CI tuning against a workflow absent from current main
  unless that workflow is intentionally revived.
- Do not mark cache-policy speedups done from log inspection alone.
- Do not weaken Nix, SAST, secrets, release, data-sync, or Vercel/external proof
  to win local minutes.
