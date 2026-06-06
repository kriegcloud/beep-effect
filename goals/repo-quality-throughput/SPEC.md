# Repo Quality Throughput Spec

## Objective

Squeeze the maximum practical performance from the repo's End-to-End Green lane
while preserving or strengthening the final proof that a pull request is
mergeable.

The objective is complete only when:

- the repo has a source-backed inventory of every credible quality/CI
  performance lane;
- the inventory has been synthesized into ranked, implementation-ready tasks;
- the highest-impact current-PR tasks have been implemented in repo-owned
  tooling, configuration, workflows, or package-local surfaces;
- the final lane has before/after timing evidence and green quality/CI proof;
- remaining opportunities are explicitly deferred with risk, proof, and owner
  notes.

## Optimization Target

Optimize the full developer path:

1. edit files;
2. repair locally with fast commands, especially `lint:fix`;
3. run local blockers through Yeet or the canonical quality command;
4. commit and push once;
5. use GitHub Actions as the authoritative full proof where appropriate;
6. monitor and fix PR comments or failed pipelines until mergeable.

Do not optimize only one command if the net End-to-End Green lane stays slow.

## Substantial Benefit Bar

This packet should not close on cosmetic cleanup. A selected implementation
task must satisfy at least one of these gates before it can be marked `done`:

- removes a duplicated command, wait, setup phase, or scan from the common
  local-to-PR path;
- reduces a measured lane by at least a meaningful human wait: default target
  is at least 10 percent or 30 seconds on a non-trivial lane, whichever is more
  useful for that lane;
- changes an expensive all-up local blocker into a safe fast guard plus named
  full fallback proof;
- prevents workstation-hostile resource behavior with bounded concurrency,
  resumability, or better process supervision;
- unlocks a larger measured speedup by adding timing, cache, or proof metadata
  that was previously missing.

The whole packet should target cumulative improvement to End-to-End Green, not
isolated micro-optimizations. If the synthesis cannot identify at least one
safe high-impact current-PR implementation, it must record why with evidence and
defer the packet instead of claiming completion.

Before P4 begins, the task inventory must contain at least one `selected`
current-PR task whose evidence already satisfies one of the substantial benefit
gates. Before P6 closes, at least one selected task must be `done` with a
measured speedup, removed duplicate wait, or resource-safety win, unless the
packet is explicitly deferred with a waiver-quality record explaining why no
safe implementation exists.

Lane-specific materiality bars:

- `lint:fix`: clean-tree warm runs should be effectively no-op fast, targeting
  single-digit seconds and no Turbo fan-out; small changed-file runs should stay
  on the changed-file Biome fixing path and avoid repo-wide scans.
- Yeet: selected work must remove duplicated local waits, shorten the local
  blocker path, or make CI monitoring replace unnecessary local full-proof
  waiting while preserving an explicit full proof. Yeet remains in proof mode:
  manual quality lanes stay canonical until the dedicated Yeet proof PR is
  green in GitHub Actions and the Yeet agent skill is added.
- GitHub Actions setup/cache: selected work should show at least 30 seconds or
  10 percent improvement on a critical PR lane, or add missing substep timing
  needed to prove such a change safely.
- Docgen: selected work must reduce repeated unchanged-package work, example
  typecheck cost, or aggregation cost while retaining full docgen fallback.
- Repo sanity, build, test, integration, coverage, security, hooks, and side
  workflows: selected work must reduce duplicated setup/check work, isolate an
  expensive resource phase, or clarify that the lane should move out of the
  common End-to-End Green path.

## Non-Goals

- Weakening the authoritative full proof.
- Hiding failures behind advisory-only checks without a named full fallback.
- Replacing GitHub check names in a way that loses branch protection history.
- Adding durable root scripts when the behavior belongs in `@beep/repo-cli`,
  `@beep/repo-utils`, package scripts, Turbo, Lefthook, or workflow config.
- Merging symbol-level docgen/example selectivity until it has a correctness
  model and shadow proof.
- Turning all historical repo-wide warnings into blockers unrelated to the
  touched performance surfaces.

## Source Hierarchy

1. User objective that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. `standards/ARCHITECTURE.md` and numbered architecture docs.
4. `.patterns/jsdoc-documentation.md`.
5. Official documentation for Turbo, Biome, Bun, Vitest, GitHub Actions, and
   any adopted tooling.
6. This `SPEC.md`.
7. `PLAN.md`.
8. `GOAL.md`.
9. Supporting `research/`, `tasks/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Ownership

This is repo-operational tooling. Durable implementation belongs in the
`tooling` family, primarily:

- `packages/tooling/tool/cli` through `@beep/repo-cli`;
- `packages/tooling/library/*` through `@beep/repo-utils` or nearby tooling
  libraries when reusable support code is needed;
- package-local `package.json`, `turbo.json`, `biome.json`, or equivalent
  configs only when measured blast-radius reduction justifies local ownership;
- `.github/workflows/*`, `.github/actions/*`, `lefthook.yml`, root
  `turbo.json`, root Biome/ESLint/Vitest/TypeScript configs, and related
  policy/config files when orchestration ownership is root-level.

Do not route repo quality semantics through product slices, shared-kernel
packages, drivers, or foundation packages unless a specific architecture doc
requires that home.

## Target Surfaces

Research and implementation may inspect or change:

- root scripts in `package.json`;
- `turbo.json` and package-local Turbo configs;
- Biome, ESLint, TypeScript, Vitest, Tstyche, Knip, syncpack, cspell, gitleaks,
  OSV, Semgrep, Nix, Storybook, Vite/Next, Vercel, changeset, release, data
  sync, and generated-catalog configs;
- `lefthook.yml` and hook scripts;
- `.github/workflows/*` and `.github/actions/*`;
- `packages/tooling/tool/cli/src/commands/Quality`;
- `packages/tooling/tool/cli/src/commands/Yeet`;
- `packages/tooling/tool/cli/src/commands/Docgen`;
- `packages/tooling/tool/docgen`;
- `packages/tooling/*` support libraries used by those commands;
- generated repo metadata only when a command contract requires regeneration;
- `.repos/effect-v4/packages/tools` as read-only prior-art input unless a later
  task explicitly vendors or adapts a proven isolated approach.

## Required Research Lanes

Run three bounded batches with six independent agents each. Research agents are
read-only: they return a report in the requested shape, and the orchestrator
persists it to the assigned `research/batch-XX-<lane>.md` path. Agents must not
edit source, config, generated outputs, or packet files unless a later
implementation phase assigns an explicit disjoint write set.

Each batch must start by reading all previous batch reports and
`tasks/tasks.jsonc`. Agents must add new evidence or contradict stale evidence;
they must not re-report already-known findings without a current-source
regression or a sharper implementation task.

Batch 1: Baseline and graph

1. canonical quality command and Yeet flow map;
2. local and GitHub Actions timing baseline;
3. Turbo DAG, cache, hash, and package-configuration blast radius;
4. duplicate work across Yeet, hooks, push, PR, and CI;
5. docgen package/example/aggregation cost model;
6. full configuration/tooling inventory.

Batch 2: Implementation hotspots

1. repo-cli orchestration, concurrency, logging, and resource governance;
2. lint, lint:fix, Biome, ESLint, staged-file, and changed-file paths;
3. check, test, type-test, integration, coverage, Vitest, and tsgo paths;
4. security, audit, SAST, dependency, gitleaks, OSV, and Semgrep gates;
5. repo-exports, config-sync, version-sync, knip, syncpack, changeset, release,
   and generated metadata;
6. CI setup/cache internals, Nix/Cachix, Storybook, Vercel, and data-sync lanes.

Batch 3: External prior art and synthesis

1. Effect v4 tool packages, especially bundle, OXC, jsdocs, and generator
   patterns;
2. Rollup, Rspack, OXC, Bun, tsgo, and other tooling candidates;
3. docgen package fingerprinting and symbol/example selectivity shadow design;
4. hybrid scoped configuration design for Turbo/Biome/etc.;
5. Yeet fast-plus-monitor default and explicit full-proof UX;
6. cross-lane synthesis into ranked tasks and proof matrix.

Cross-cutting lanes that must not be missed:

- coverage canonicality: decide whether `coverage` is part of End-to-End Green,
  a scheduled/full-only proof, or a non-goal for this packet;
- repo-sanity throughput: time changeset graph, config sync, version sync,
  syncpack, sherif, and audit substeps separately;
- build throughput: isolate build cache/env/setup behavior and decide whether
  PR needs an affected build lane;
- integration-test resources: separate DB/testcontainer setup timing from test
  execution while preserving exclusive semantics;
- security/Nix/SAST/secrets parity: map workflow jobs to repo-cli
  `github-checks` modes and preserve fallback `pre-push` proof;
- non-Check workflows: ensure cache/setup changes do not regress release,
  data-sync, Vercel/external, or Storybook workflows;
- Lefthook/local push path: classify hooks as fast guards and map overlap with
  CI;
- Turbo launcher overhead: compare repeated `bunx turbo` startup with local
  binary resolution and prove lockfile non-mutation.

## Benchmark Protocol

Every measured claim must record:

- command or GitHub job/run id;
- branch, commit, and whether the worktree was clean, dirty, or intentionally
  changed;
- cold/warm cache status when knowable;
- elapsed wall-clock time and, for local probes, whether the machine was under
  other heavy load;
- Turbo summary or dry-run output when the task is Turbo-backed;
- resource notes for heavy lanes, especially CPU, memory, worker count, and
  long-running child processes;
- comparison baseline and after evidence using the same command shape whenever
  possible.

Sample-count guidance:

- For fast local commands, run at least five comparable warm samples and record
  min, median, max, and any outlier reason.
- For medium local commands, run at least three comparable samples when the
  machine remains responsive.
- For heavy local commands, one focused sample plus process/resource evidence is
  acceptable when repeated runs would be disruptive.
- For GitHub Actions workflow/action behavior changes, require at least three
  comparable before run ids and three comparable after run ids for each changed
  critical lane before marking a direct speedup `done`. If fewer comparable
  runs exist, keep the task measurement-only or low-confidence and do not mark
  it `done` as a speedup unless the change only adds timing/metadata or prevents
  a safety/resource regression.
- Always record cache state as cold, warm, mixed, or unknown. Do not compare a
  cold baseline to a warm after-run without saying the result is low confidence.

Preferred local timing shapes:

```sh
/usr/bin/time -p <command>
bunx turbo run <task> --affected --dry-run=json
ps -eo pid,ppid,pcpu,pmem,etime,command | rg 'bun|turbo|docgen|vitest|semgrep|gitleaks|osv|nix'
```

Use Turbo `--summarize` only in implementation/proof phases where writing
`.turbo/runs/<run-id>.json` is acceptable and the artifact will be recorded.
Read-only research probes should use `--dry-run=json` without `--summarize`
unless the orchestrator explicitly allows generated Turbo run summaries.

Do not run a full expensive local proof just to collect a baseline when recent
GitHub Actions timing, Turbo dry-runs, or focused local probes answer the
question.

## Resource Governance

- Run one research batch at a time. Default maximum: six read-only agents for a
  batch, with no additional local heavy quality command running concurrently.
- Never run multiple heavy local quality lanes in parallel unless the task
  explicitly proves that concurrency is safe.
- Before launching each research batch and before any known-heavy command,
  inspect current repo-related processes and record the snapshot. This is
  mandatory even in a fresh session because prior runs may have left long-lived
  local services or workers alive.
- Prefer `--affected`, package filters, dry-runs, summaries, and read-only
  probes before full all-up commands.
- Default focused probe timeout is 10 minutes; use a shorter timeout for
  expected-fast commands such as `lint:fix`. Full proofs may exceed this only
  when explicitly required by the proof phase.
- Keep integration/container-backed lanes serial unless the implementation task
  proves parallel resource isolation.
- Stop and record evidence when load, memory pressure, disk pressure, or process
  churn makes the workstation severely laggy. Capture `ps` evidence before
  terminating anything when feasible.
- Implementation must favor bounded concurrency with named limits and clear
  failure aggregation over unconstrained subprocess fan-out.


## Implementation Requirements

- Use Yeet as a proved developer orchestrator path only within the current
  proof-mode constraints: fast local blockers, push quickly when allowed,
  monitor CI, and retain an explicit full local proof command. Do not declare
  Yeet canonical until the dedicated Yeet proof PR is green in GitHub Actions
  and the Yeet agent skill is added.
- Eliminate redundant waiting between Yeet, hooks, push, PR checks, and CI
  where doing so does not weaken proof.
- Keep pre-commit and pre-push hooks as fast guards; move expensive exhaustive
  proof to explicit local full proof, PR CI, push/main, or scheduled gates.
- Prefer affected or package-scoped work where correctness is clear.
- Prefer package-local configuration only for measured hotspots. Root defaults
  remain canonical unless local configs reduce blast radius without drift.
- Start docgen selectivity with package-level fingerprints and safe reuse.
  Symbol/example selectivity must run in shadow/prototype mode until sound.
- Adopt new external tooling only after a prototype shows a clear speed win,
  isolated integration, and no proof weakening.
- Keep resource use bounded. No unbounded subprocess fan-out, no unlimited agent
  swarms, and no quality command that makes the workstation unusable.
- Treat already-landed improvements as regression-guard work instead of fresh
  discovery. In particular, Turbo credential pass-through and bounded lint
  policy grouping must be verified against current source before being ranked
  as new implementation tasks.
- Follow Effect-first development for repo-cli/service implementation.
- Follow schema-first development for new task/result/config models.
- Follow `.patterns/jsdoc-documentation.md` for any exported symbols added or
  changed as part of implementation.

## Task Inventory Contract

The synthesis must write:

- `tasks/tasks.jsonc` for machine-readable ranked tasks;
- `tasks/*.md` briefs for human-readable task clusters when needed;
- evidence links from each task to research files or command logs.

Every task must include:

- lane;
- command or check affected;
- baseline timing or a reason timing cannot be measured yet;
- expected impact;
- expected delta or a reason the task is measurement-unlocking rather than a
  direct speedup;
- workflow frequency;
- correctness risk;
- resource risk;
- implementation cost;
- proof burden;
- confidence;
- selection rationale;
- implementation scope;
- proof commands;
- acceptance commands;
- rollback plan;
- rollback commands and proof after rollback;
- status.

Status-specific fields are required:

- `selected`: evidence, substantial benefit gate, current-PR candidacy, and
  named fallback proof;
- `done`: before/after matrix rows, proof evidence, final proof commands,
  commit or run id, confidence, and quality-review status;
- `deferred`: reason, owner/surface, residual risk, next proof step, and
  follow-up trigger when known;
- `rejected`: reason and evidence.

Any red proof or unfixed blocker requires a waiver record with source standard,
reason, owner, expiry or follow-up, residual risk, and acceptance evidence.

## Acceptance Criteria

- [ ] `repo-quality-acceleration` is marked superseded by this packet.
- [ ] All required packet files exist and `GOAL.md` is under 4,000 characters.
- [ ] Three research batches have produced source-backed reports.
- [ ] `tasks/tasks.jsonc` contains a ranked task inventory synthesized from the
      reports.
- [ ] The task inventory identifies selected, deferred, and rejected tasks; each
      selected task satisfies the substantial benefit bar.
- [ ] Before entering P4, no task remains only a `seeded-hypothesis`; each task
      is selected, candidate with a named remaining research lane, deferred, or
      rejected.
- [ ] Highest-impact current-PR tasks are implemented until remaining tasks are
      deferred for low impact, high risk, or separate proof gates.
- [ ] Coverage is classified as common End-to-End Green, full/scheduled proof,
      or out of scope with a deferred-task record.
- [ ] `lint:fix` has a fast clean-tree and small-changed-file proof.
- [ ] Yeet has a fast-plus-monitor proof and no duplicate expensive local/CI
      waits that can be removed safely.
- [ ] Yeet promotion beyond proof mode is blocked until the dedicated proof PR
      is green and the Yeet agent skill exists; manual quality lanes remain
      canonical before that.
- [ ] A local/CI proof parity map covers quality, pre-push, PR jobs, push-only
      jobs, security, Nix, SAST, secrets, release, and side workflows.
- [ ] A check-name/ruleset baseline proves workflow edits did not drop or rename
      authoritative checks without an explicit recorded decision.
- [ ] Before/after timing matrix follows the benchmark protocol and covers
      local repair, local blocker proof, push/PR feedback, docgen, repo sanity,
      build, integration resources, security/hooks, and slowest GitHub Actions
      lanes.
- [ ] Canonical quality proof still exists and passes locally or in CI.
- [ ] A final quality-review-fix-loop panel returns zero blocking findings, or
      every remaining blocker has an explicit waiver record.
- [ ] Any deferred performance opportunity has evidence, risk, owner, and next
      proof step recorded.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/repo-quality-throughput/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/repo-quality-throughput/ops/manifest.json` | Passes |
| Packet references | `rg -n "repo-quality-throughput|GOAL.md|agentLaunchers|packetAnchorDocument" goals/repo-quality-throughput goals/repo-quality-acceleration` | Expected references exist |
| Task schema JSON | `jq . goals/repo-quality-throughput/tasks/tasks.schema.json` | Passes |
| Whitespace | `git diff --check -- goals/repo-quality-throughput goals/repo-quality-acceleration` | Passes |
| Local fast repair | `bun run lint:fix` with clean tree and small changed-file probes | Fast and successful |
| Yeet blocker path | `bun run beep yeet repair` and `bun run beep yeet verify` or newer proven equivalents | Passes or records unrelated blocker |
| Canonical proof | `bun run audit:github quality` and GitHub PR checks | Pass or documented unrelated failure |

## Stop Conditions

- Required source files are missing or materially contradictory.
- A proposed speedup weakens proof without a named full fallback.
- The implementation requires secrets, costs, destructive actions, or
  dependency adoption not approved by this spec.
- Performance work repeatedly makes the machine unusable despite bounded
  resource settings.
- The same blocker repeats after reasonable investigation and cannot be
  resolved without user input.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| Symbol-level docgen selectivity is prototype-only | Docgen example checking | Repo tooling | Correct symbol impact is not yet proven. | Promote only after shadow mode proves soundness against full docgen. |
