# Repo Quality Throughput Plan

## Status

Status: `current-pr-proof-green-batch-03-closed`

## Operating Posture

This packet is aggressive but bounded. It should improve the current PR, not
only produce a report. It should also avoid workstation-hostile runs by using
bounded concurrency, focused probes, and GitHub timing evidence before launching
slow local commands.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Bootstrap | complete | Create the executable packet and supersede the old research packet. | Packet files validate and old packet points here. |
| P1 Research Batch 1 | complete | Establish command map, timing baseline, DAG/cache shape, duplicate work, docgen cost, and config inventory. | Six reports exist under `research/`, synthesis is updated, and Batch 2 is not launched from stale tasks. |
| P2 Research Batch 2 | complete | Inspect implementation hotspots across repo-cli, lint, check/test, security, metadata, and CI side lanes. | Reports exist under `research/`, synthesis is updated, and concrete candidate/selected tasks are recorded. |
| P3 Research Batch 3 | complete | Compare external prior art, scoped config designs, docgen selectivity, Yeet UX, and synthesize tasks. | Six reports exist, including `research/batch-03-synthesis.md`; no task remains only a seeded hypothesis or undecided candidate. |
| P4 Implement Current-PR Wins | complete | Implement ranked tasks until diminishing returns or separate design gates. | `rqt-001`, `rqt-002`, and `rqt-004` are done; remaining high-value tasks are deferred with owner, risk, rollback, and next proof steps. |
| P5 Prove End-to-End Green | complete | Run the fast local path, full proof, push/PR monitor, and benchmark comparison. | Before/after matrix, proof parity, check-name baseline, local quality evidence, and live green PR proof are recorded under `history/`. |
| P6 Close | complete | Run final quality-review-fix-loop, update packet status, and prepare PR notes. | Current packet review has zero blocking findings; PR #214 was mergeable and green before the final packet-only follow-up push. |

## Research Batch Commands

Launch agents with:

- [`ops/prompts/batch-01-baseline-and-dag.md`](./ops/prompts/batch-01-baseline-and-dag.md)
- [`ops/prompts/batch-02-hotspots.md`](./ops/prompts/batch-02-hotspots.md)
- [`ops/prompts/batch-03-external-and-synthesis.md`](./ops/prompts/batch-03-external-and-synthesis.md)

Research agents return a report in the requested shape. The orchestrator writes
the returned reports under `research/` using stable filenames:

```text
batch-01-<lane>.md
batch-02-<lane>.md
batch-03-<lane>.md
```

Do not start the next research batch until the current batch closeout is done:

1. Confirm all six expected report paths exist.
2. Add accepted, stale, and rejected findings to
   `history/outputs/research-synthesis.md`.
3. Update `tasks/tasks.jsonc` with new evidence, rank/status changes,
   acceptance commands, rollback commands, and deferred/rejected records.
4. Record a process snapshot and note whether any heavy local lane is already
   running.

## Synthesis

After each batch, update `tasks/tasks.jsonc` rather than keeping findings only
in prose. New tasks must use the schema in
[`tasks/tasks.schema.json`](./tasks/tasks.schema.json).

Before launching the next batch, add a short synthesis note to
`history/outputs/research-synthesis.md` with:

- findings that are now accepted as known;
- stale or rejected findings that later agents should not repeat;
- highest-value gaps for the next batch;
- tasks added, reprioritized, deferred, or rejected.

Ranking dimensions:

- wall-clock impact on End-to-End Green;
- frequency in developer workflow;
- correctness risk;
- implementation cost;
- resource risk;
- proof burden;
- rollback simplicity.

Selection bar:

- `selected` tasks must have a measured or strongly evidenced path to a
  substantial benefit as defined in `SPEC.md`.
- `done` tasks must update `history/outputs/before-after-matrix.md`.
- `deferred` tasks must name the next proof gate, owner/surface, and residual
  risk.
- `rejected` tasks must say whether they were stale, too risky, too small, or
  already implemented.
- Do not keep `baseline.status = "pending"` on a `selected` task unless the
  task exists only to add missing measurement/instrumentation.
- Do not enter P4 while a task is still `seeded-hypothesis`.
- Do not enter P5 while any `selected` or `in-progress` task lacks a `done`,
  `deferred`, or `rejected` record with evidence.

## Implementation Rules

- Work from the ranked task file.
- Use disjoint write scopes when parallel implementation agents are used.
- Prefer `@beep/repo-cli` and `@beep/repo-utils` over root scripts for durable
  behavior.
- Preserve existing GitHub check names.
- Preserve manual quality lanes as canonical until the dedicated Yeet proof PR
  is green and the Yeet agent skill exists.
- Keep PR affected lanes and push/main full lanes distinct when that reduces
  wait without weakening final proof.
- Do not merge package-local config splits without measured blast-radius proof.
- Keep symbol/example-level docgen selectivity shadow-only until soundness is
  proven.

## Before/After Matrix

Record at least these rows in `history/outputs/before-after-matrix.md`; the
current measured values live in that artifact, not in this plan template:

| Lane | Measurement requirement |
| --- | --- |
| `lint:fix` clean tree | Must be fast. |
| `lint:fix` small changed-file set | Must use the real repo-cli path. |
| Yeet repair | Fast local repair path. |
| Yeet verify/publish local portion | Avoid duplicate full waits. |
| Repo sanity | Split substep cost and duplicate proof work. |
| Build | Include cache/env/setup behavior. |
| Docgen local | Include package/example cost. |
| Integration tests | Separate setup/resource cost from test cost. |
| Coverage | Decide if green-lane, full-only, or out-of-scope. |
| Security/Nix/SAST | Preserve PR/push/pre-push parity. |
| Lefthook | Fast guard cost and CI overlap. |
| PR GitHub Actions wall clock | Preserve check names. |
| Release/data-sync side workflows | Ensure setup/cache changes do not regress them. |
| Slowest CI lane | Record setup vs verification cost. |
| Canonical full proof | Must still pass. |
| Check names and rulesets | Prove workflow edits did not drop checks. |
| Local/CI proof parity | Map quality, pre-push, PR, push, and side workflows. |

Every row should include command shape, run count, cache state, commit/branch,
and resource notes. Use comparable before/after commands; if the command shape
changes, explain why the comparison is still meaningful.

Use [`history/outputs/baseline-methodology.md`](./history/outputs/baseline-methodology.md)
as the timing protocol.

## Verification Commands

Packet bootstrap:

```sh
test "$(wc -m < goals/repo-quality-throughput/GOAL.md)" -le 4000
jq . goals/repo-quality-throughput/ops/manifest.json
jq . goals/repo-quality-throughput/tasks/tasks.schema.json
rg -n "repo-quality-throughput|GOAL.md|agentLaunchers|packetAnchorDocument" goals/repo-quality-throughput goals/repo-quality-acceleration
git diff --check -- goals/repo-quality-throughput goals/repo-quality-acceleration
```

Final proof, adjusted only when task evidence justifies a safer equivalent:

```sh
bun run lint:fix
bun run beep yeet repair
bun run beep yeet verify
bun run audit:github quality
bun run audit:github pre-push # or explicit waiver with fallback CI proof
gh pr checks --watch
```

Final closeout:

```sh
rg -n "blockingStatus.*blocking|waiverRecord|zero blocking" \
  goals/repo-quality-throughput/history/outputs/quality-review-inventory.md
rg -n "dedicated Yeet proof PR|Yeet agent skill|manual quality lanes" \
  goals/repo-quality-throughput
rg -n "Coverage.*(green-lane|full-only|scheduled|out-of-scope|deferred)" \
  goals/repo-quality-throughput
```

## Current Blockers

None for current-PR execution. Remaining high-value performance work is
deferred to focused proof gates: setup/cache comparable-run tuning, repo-export
catalog sharding, docgen fingerprint reuse, scoped Turbo/config blast-radius
reduction, integration/type-test participation filtering, side-workflow parity,
and opt-in Yeet fast-plus-monitor.

Before pushing any follow-up commit, recheck PR comments and pipeline state.
After pushing, rerun `gh pr checks --watch` and keep PR #214 green.
