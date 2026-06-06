# Repo Quality Throughput Plan

## Status

Status: `ready-to-execute`

## Operating Posture

This packet is aggressive but bounded. It should improve the current PR, not
only produce a report. It should also avoid workstation-hostile runs by using
bounded concurrency, focused probes, and GitHub timing evidence before launching
slow local commands.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Bootstrap | complete | Create the executable packet and supersede the old research packet. | Packet files validate and old packet points here. |
| P1 Research Batch 1 | pending | Establish command map, timing baseline, DAG/cache shape, duplicate work, docgen cost, and config inventory. | Six reports exist under `research/` with evidence and no source edits. |
| P2 Research Batch 2 | pending | Inspect implementation hotspots across repo-cli, lint, check/test, security, metadata, and CI side lanes. | Six reports exist and identify concrete candidate tasks. |
| P3 Research Batch 3 | pending | Compare external prior art, scoped config designs, docgen selectivity, Yeet UX, and synthesize tasks. | Six reports plus synthesis update `tasks/tasks.jsonc`. |
| P4 Implement Current-PR Wins | pending | Implement ranked tasks until diminishing returns or separate design gates. | Each completed task has code/config changes, proof commands, and rollback notes. |
| P5 Prove End-to-End Green | pending | Run the fast local path, full proof, push/PR monitor, and benchmark comparison. | Before/after matrix and green proof are recorded under `history/`. |
| P6 Close | pending | Update packet status and prepare PR notes. | Remaining backlog is explicit and the PR is mergeable. |

## Research Batch Commands

Launch agents with:

- [`ops/prompts/batch-01-baseline-and-dag.md`](./ops/prompts/batch-01-baseline-and-dag.md)
- [`ops/prompts/batch-02-hotspots.md`](./ops/prompts/batch-02-hotspots.md)
- [`ops/prompts/batch-03-external-and-synthesis.md`](./ops/prompts/batch-03-external-and-synthesis.md)

Each agent writes a report under `research/` using stable filenames:

```text
batch-01-<lane>.md
batch-02-<lane>.md
batch-03-<lane>.md
```

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

## Implementation Rules

- Work from the ranked task file.
- Use disjoint write scopes when parallel implementation agents are used.
- Prefer `@beep/repo-cli` and `@beep/repo-utils` over root scripts for durable
  behavior.
- Preserve existing GitHub check names.
- Keep PR affected lanes and push/main full lanes distinct when that reduces
  wait without weakening final proof.
- Do not merge package-local config splits without measured blast-radius proof.
- Keep symbol/example-level docgen selectivity shadow-only until soundness is
  proven.

## Before/After Matrix

Record at least these rows in `history/outputs/before-after-matrix.md`:

| Lane | Baseline command/evidence | After command/evidence | Delta | Notes |
| --- | --- | --- | --- | --- |
| `lint:fix` clean tree | TBD | TBD | TBD | Must be fast. |
| `lint:fix` small changed-file set | TBD | TBD | TBD | Must use the real repo-cli path. |
| Yeet repair | TBD | TBD | TBD | Fast local repair path. |
| Yeet verify/publish local portion | TBD | TBD | TBD | Avoid duplicate full waits. |
| Repo sanity | TBD | TBD | TBD | Split substep cost and duplicate proof work. |
| Build | TBD | TBD | TBD | Include cache/env/setup behavior. |
| Docgen local | TBD | TBD | TBD | Include package/example cost. |
| Integration tests | TBD | TBD | TBD | Separate setup/resource cost from test cost. |
| Coverage | TBD | TBD | TBD | Decide if green-lane, full-only, or out-of-scope. |
| Security/Nix/SAST | TBD | TBD | TBD | Preserve PR/push/pre-push parity. |
| Lefthook | TBD | TBD | TBD | Fast guard cost and CI overlap. |
| PR GitHub Actions wall clock | TBD | TBD | TBD | Preserve check names. |
| Release/data-sync side workflows | TBD | TBD | TBD | Ensure setup/cache changes do not regress them. |
| Slowest CI lane | TBD | TBD | TBD | Record setup vs verification cost. |
| Canonical full proof | TBD | TBD | TBD | Must still pass. |

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
gh pr checks --watch
```

## Current Blockers

None for packet execution. Research and implementation remain pending.
