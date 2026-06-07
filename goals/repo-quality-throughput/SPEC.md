# Repo Quality Throughput Spec

## Objective

Squeeze the maximum practical performance from the repo's End-to-End Green lane
by implementing the already-researched performance tasks end to end.

The objective is complete only when:

- selected performance tasks have implementation changes in repo-owned tooling,
  configuration, workflows, or package-local surfaces;
- at least one major measured bottleneck is structurally improved;
- every viable selected task is either `done` or carries a blocker-quality
  waiver record;
- before/after evidence is recorded;
- local proof and PR/CI proof remain green or unrelated failures are documented;
- the PR is mergeable with no unresolved actionable review comments.

## Optimization Target

Optimize the full developer path:

1. edit files;
2. repair locally with fast commands, especially `lint:fix`;
3. run local blockers through Yeet or the canonical quality command;
4. commit and push once;
5. use GitHub Actions as authoritative proof where appropriate;
6. monitor and fix PR comments or failed pipelines until mergeable.

Do not optimize only one command if the net End-to-End Green lane stays slow.

## Implementation Bar

This packet is no longer a research packet. Existing `research/` and `history/`
files are source-backed evidence. Do not launch new research batches unless a
selected implementation task is blocked by missing facts that cannot be learned
from current source, dry-runs, or focused proof.

A selected implementation task must satisfy at least one gate before `done`:

- remove a duplicated command, wait, setup phase, scan, or no-op graph segment;
- reduce a measured lane by a meaningful human wait, targeting at least 10
  percent or 30 seconds on non-trivial lanes;
- change an all-up blocker into a safe fast guard plus named full fallback;
- prevent workstation-hostile resource behavior;
- unlock and then apply a larger measured speedup with proof metadata.

Deferral is allowed only after concrete blocker evidence. A deferral must record
the blocking condition, owner/surface, fallback proof, residual risk, and
acceptance evidence in `tasks/tasks.jsonc`.

## Required Implementation Lanes

No selected implementation task remains. Continue with final proof, publish, PR
monitoring, and review closeout.

Completed guardrails and implementation tasks `rqt-001`, `rqt-002`, `rqt-004`,
`rqt-003`, `rqt-005`, `rqt-006`, `rqt-007`, `rqt-008`, and `rqt-009` must stay
true. `rqt-010` carries bounded prototype gate and waiver evidence. Rejected
tasks `rqt-011` and `rqt-012` must not be reopened unless source drift
invalidates the recorded rejection.

## Lane Contracts

Repo-export sharding:

- Add tracked package-local shards and a small root index.
- Keep lookup ergonomic by making `@beep/repo-codegraph` shard-aware.
- Update repo-cli generation/checking, Turbo tasks, Lefthook, package
  scaffolding, generated-file ignore policy, and agent guidance.
- Do not trust hash-only shards as authoritative proof.

Test participation:

- Add missing integration participation for packages with integration tests.
- Prevent integration tests from leaking into unit lanes where that is happening.
- Filter root type-test/integration invocations to real owners.
- Add a guard so future packages with integration/type-test files cannot be
  missed silently.
- Keep integration in End-to-End Green; keep coverage full-only or scheduled
  unless a later policy decision changes it.

Docgen:

- Add package proof manifests with fingerprints that cover package source,
  docgen config, example typecheck inputs, generator/tooling version, docs
  outputs, and dependency radius.
- Start with shadow parity against full docgen, then enable package-level reuse
  only when the manifest and full fallback agree.
- Keep symbol/example-level selectivity shadow-only.

Scoped config:

- Add a dry-run harness for root config and package-local overlay changes.
- Move only proven non-universal root inputs into task-specific Turbo inputs.
- Add package-local Turbo/Biome overlays only for proven package exceptions.
- Compare resolved task definitions before and after.

CI and workflows:

- Add setup timing/cache metadata summaries.
- Implement safe workflow-order wins such as avoiding full Bun setup for Nix
  when proof parity is preserved and moving release no-op detection before
  setup.
- Do not mark cache-policy changes as speedups without comparable before/after
  GitHub run evidence.

Yeet:

- Add `yeet monitor` and/or `yeet publish --fast --monitor` only as explicit,
  guarded PR-branch modes.
- Preserve `bun run audit:github pre-push` as the named fallback.
- Do not make Yeet canonical/default until the dedicated proof PR and agent
  guidance gates are complete.

External tooling:

- Prototype only lane-tied candidates with isolated proof, such as OXC metadata
  scanning, tsgo timing, Bun cache A/B, or small bundle/report fixtures.
- Reject broad replacements for Turbo, Biome/ESLint, Vitest, root build, or
  TypeScript tooling without measured proof and fallback.

## Ownership

This is repo-operational tooling. Durable implementation belongs in:

- `packages/tooling/tool/cli` through `@beep/repo-cli`;
- `packages/tooling/library/repo-utils` and `packages/tooling/library/repo-codegraph`;
- package-local manifests/configs only where measured proof justifies ownership;
- `.github/workflows/*`, `.github/actions/*`, `lefthook.yml`, `turbo.json`, and
  related root policy/config files.

Do not route repo quality semantics through product slices, shared kernel,
drivers, foundation packages, or one-off root scripts.

## Benchmark Protocol

Every measured claim must record:

- command or GitHub run/job id;
- branch, commit, and worktree state;
- cache state when knowable;
- elapsed wall-clock time;
- Turbo dry-run or summary when Turbo-backed;
- resource notes for heavy lanes;
- comparable before/after evidence or an explicit confidence warning.

Fast commands need at least five warm samples. Medium commands need three
samples when reasonable. Heavy local commands may use one focused sample plus
process evidence when repeated runs would be disruptive. Workflow behavior
changes need comparable GitHub runs before claiming direct CI speedup.

## Resource Governance

- Check process state before heavy local lanes.
- Run at most one heavy local proof at a time.
- Prefer focused package/task proof before full local quality.
- Use GitHub Actions for repeated full-lane proof.
- Stop and record a blocker if a command repeatedly makes the workstation
  unusable despite bounded settings.

## Task Inventory Contract

`tasks/tasks.jsonc` is the active implementation queue. Each task must include:

- lane, affected command/check, baseline, expected impact, expected delta,
  frequency, risk, cost, proof burden, confidence, selection rationale,
  implementation scope, proof commands, acceptance commands, rollback plan,
  rollback commands, and evidence links;
- `selected` for active implementation tasks;
- `done` after implementation with before/after rows, proof evidence, commands,
  commit/run id, confidence, and quality-review status;
- `waiverRecord` when a selected task cannot be completed safely;
- `rejected` only for tasks that should not consume implementation time.

## Acceptance Criteria

- [ ] Active packet files do not instruct agents to rerun research batches.
- [ ] `tasks/tasks.jsonc` marks viable work as selected implementation tasks.
- [ ] `rqt-007`, `rqt-008`, `rqt-005`, `rqt-006`, `rqt-003`, `rqt-009`, and
      `rqt-010` are done or carry blocker-quality waiver records.
- [ ] `lint:fix` remains fast on clean tree and small changed-file probes.
- [ ] Repo-export catalog work materially reduces catalog wall time, root
      generated artifact churn, or both.
- [ ] Type-test/integration dry-runs show reduced no-op graph work and real
      proof still passes.
- [ ] Docgen reuse skips safe unchanged package work only with full fallback.
- [ ] Scoped config changes reduce affected blast radius without stale caches.
- [ ] CI workflow changes preserve check names and proof parity.
- [ ] Yeet monitor remains opt-in guarded and has explicit fallback proof.
- [ ] Canonical quality proof passes locally or in CI.
- [ ] Final quality-review-fix-loop has zero blocking findings or explicit
      waiver records.
- [ ] The branch is pushed, PR checks are monitored, review comments are fixed,
      and the PR is mergeable.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/repo-quality-throughput/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/repo-quality-throughput/ops/manifest.json` | Passes |
| Task schema JSON | `jq . goals/repo-quality-throughput/tasks/tasks.schema.json` | Passes |
| Whitespace | `git diff --check -- goals/repo-quality-throughput` | Passes |
| Fast repair | `bun run lint:fix` | Fast and successful |
| Repo exports | `bun run repo-exports:catalog && bun run repo-exports:catalog:check` | Passes with timing evidence |
| Tests | Filtered dry-runs plus `bun run test` or equivalent | Passes with reduced no-op evidence |
| Docgen | `bun run docgen` plus reuse proof | Passes with fallback |
| Quality | `bun run audit:github quality` | Passes or unrelated failure documented |
| PR proof | `gh pr checks --watch` and review thread sweep | Mergeable |

## Stop Conditions

- Required source files are missing or materially contradictory.
- A proposed speedup weakens proof without a named full fallback.
- The implementation requires secrets, costs, destructive actions, or
  dependency adoption not approved by this spec.
- Performance work repeatedly makes the machine unusable despite bounded
  resource settings.
- The same blocker repeats after reasonable investigation and cannot be
  resolved without user input.
