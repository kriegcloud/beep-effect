# Yeet Turborepo Continuation Notes

## Status

Captured 2026-06-02 before context compaction. This is a continuation note,
not a final implementation plan.

The current branch is `repo-cli-yeet`. The worktree already has unrelated or
parallel-agent changes, including the Turborepo skill sync under
`.claude/skills/turborepo`. Preserve those changes.

## Decisions Locked So Far

- Keep the work inside the existing `goals/repo-quality-acceleration` goal
  packet instead of creating a separate goal for `yeet`.
- Treat `yeet` v1 as a commit-and-push command after quality succeeds.
- Use a shared in-process `RepoRunContext` as the v1 state model.
- Use a feedback-then-full quality flow: run fixers and hot/affected checks
  first for fast backpressure, then require the canonical full proof before
  commit/push.
- Use conservative skips: only skip read-only package-scoped checks whose
  content/task fingerprints are unchanged; never skip write-mode fixers or the
  final full proof in v1.
- Refactor toward a shared planning core: extract repo/git/package planning and
  task metadata into shared services while leaving most existing task execution
  surfaces intact.

## Product Direction

The strongest framing is that `yeet` should become a quality feedback system,
not only a faster quality runner.

The target loop is:

```text
hydrate RepoRunContext
run write-mode fixers/generators
run hot or affected checks for fast backpressure
normalize findings into a QualityIssueIndex
render per-package quality packets with @beep/md
route issue categories to appropriate specialist agents/skills
rerun intelligently
run canonical full proof
stage safely, generate commitlint-compliant message, commit, and push
```

The `@beep/md` idea is important. It should render deterministic, per-package
Markdown feedback documents from schema-first issue data rather than ad-hoc
strings. The rendered documents should make backpressure useful for coding
agents by including issue categories, commands, affected files, suggested first
repair paths, specialist skill/agent routing, and verification commands.

The data model should stay JSON/schema-first. Markdown is a rendered view, not
the source of truth.

## Current Repo Evidence

- `packages/tooling/tool/cli/src/bin.ts` already has a fast path that parses
  `build`, `check`, `test`, `lint`, and `audit` invocations before falling back
  to the full command tree.
- `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts` already handles
  root vs package-local quality task execution, Turbo wrapper steps, lint
  policy sidecars, integration-test isolation, cache arguments, and local env
  behavior.
- `packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts` already
  has `github-checks` lanes for quality, repo sanity, secrets, security, SAST,
  Nix, and pre-push.
- `lefthook.yml` already enforces commit-msg commitlint plus pre-push repo
  export catalog checks.
- Existing research under this goal already identifies repo-cli orchestration,
  Turbo cache/scope, and quality safety semantics as acceleration tracks.

## Turborepo Skill Sync

Another agent synced all writable Turborepo skill copies from the official
Vercel source.

Official source:

- Skills page: `https://www.skills.sh/vercel/turborepo/turborepo`
- GitHub source dir: `https://github.com/vercel/turborepo/tree/main/skills/turborepo`
- Raw skill: `https://raw.githubusercontent.com/vercel/turborepo/main/skills/turborepo/SKILL.md`
- Upstream commit used by the sync agent:
  `1eeeb97bfc0d07f583d3598ea53a7327f554912f`

Synced writable directories:

- `/home/elpresidank/.agents/skills/turborepo`
- `/home/elpresidank/YeeBois/projects/beep-effect/.agents/skills/turborepo`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/skills/turborepo`

Symlinks preserved:

- `/home/elpresidank/.claude/skills/turborepo -> ../../.agents/skills/turborepo`
- `/home/elpresidank/.codex/skills/turborepo -> ../../.agents/skills/turborepo`

Final reported skill version everywhere: `2.9.17-canary.2`.

Final reported tree checksum for all three writable copies:
`bb06b57cec0f0371af436807f094f8a070bada947e328388cf1ec898bac2d41f`.

Generated/cache copies under `.codex/.tmp` and `.direnv/**` are not sync
targets.

## Turborepo Exploration Targets

Next research should use the updated Turborepo skill plus official docs. The
local CLI supports:

```sh
bunx turbo docs "<query>" --docs-version 2.9.16
```

The `turbo docs` output tells agents to retrieve Markdown docs by appending
`.md` to returned URLs.

Explore these capabilities for `yeet` and repo-wide quality acceleration:

- `turbo query` and GraphQL package/task graph access
- `turbo ls`
- `turbo devtools`
- package configurations
- boundaries
- `--affected`, filter microsyntax, and base selection
- `--dry-run=json`, `--summarize`, `--profile`, and `--anon-profile`
- `--continue`
- `--cache-workers`, local/remote cache settings, and remote cache timeouts
- OpenTelemetry flags, especially run summary and task detail metrics
- `watch`, `with`, `persistent`, and `interruptible`
- `stream-with-experimental-timestamps` and any other useful experimental UI or
  logging mode

Important question: which Turbo surfaces can supply structured graph, task,
timing, cache-hit, and failure metadata to `RepoRunContext` or
`QualityIssueIndex` without reimplementing Turbo?

## Research Shape To Resume

Recommended sub-agent lanes:

1. Official Turbo feature research using `turbo docs` and returned Markdown
   docs only.
2. Local repo config audit for `turbo.json`, root scripts, workflow usage, and
   quality-task wrappers.
3. Structured metadata audit for `turbo query`, `turbo ls`, dry-runs,
   summaries, profiles, and OpenTelemetry as possible `yeet` inputs.
4. Safety semantics audit: where scoped/affected feedback is acceptable and
   where the full proof must remain mandatory.

Do not implement yet. The next useful artifact is a research synthesis that
connects Turbo capabilities to:

- faster hot/affected backpressure;
- reduced repeated graph/package computation;
- better per-package issue packet generation;
- conservative skip/resume semantics;
- final full-proof safety before commit and push.

## Post-Compaction Turbo Research Pass

Captured later in the same design session when remaining context was about 34%.
This section preserves the results of the read-only Turborepo exploration before
another compaction.

All four Turbo explorer agents finished and were closed:

- Official Turbo feature research.
- Local repo Turbo/config audit.
- Structured metadata surface audit.
- Safety semantics audit.

Graphiti MCP was reachable, but narrow fact searches timed out earlier, so this
research pass is grounded in local repo files, local Turbo CLI behavior, and
official Turborepo docs.

Current worktree facts at capture time:

- `.claude/skills/turborepo/**` remains modified from the official skill sync.
  Preserve it.
- `goals/repo-quality-acceleration/research/yeet-turborepo-continuation.md`
  is untracked unless a later agent stages/adds it.
- `package.json`,
  `packages/tooling/tool/cli/src/commands/CreatePackage/Handler.ts`, and
  `packages/tooling/tool/cli/test/create-package.test.ts` are modified by a
  separate create-package / lockfile bootstrap fix lane. Do not revert them.
- `bun.lock` is currently modified too. Treat it as part of the separate
  create-package / lockfile bootstrap lane unless a later status proves
  otherwise.
- `bun.lock` was accidentally touched earlier by a parent-session probe using
  `bun install --lockfile-only --dry-run`. Do not assume the package bootstrap
  issue is resolved until the separate fixer reports back.

Important tooling caution:

- Prefer the resolved local Turbo binary for future `yeet` implementation over
  `bunx turbo` when possible. Multiple agents observed that `bunx turbo ...`
  can unexpectedly refresh `bun.lock` when workspace/lockfile metadata is in a
  stale or invalid state.

## Turbo Findings For Yeet

Strongest structured inputs:

- `turbo query packageGraph` can provide package graph nodes and edges without
  rebuilding graph logic in `@beep/repo-cli`.
- `turbo query affected --packages --base <ref> --head <ref>` can provide
  affected packages plus reasons such as `GlobalDepsChanged`.
- `turbo query affected --tasks <tasks...> --base <ref> --head <ref>` can
  provide affected task IDs plus reasons such as `TaskGlobalDepsChanged` or
  `TaskFileChanged`.
- `turbo ls --output=json` provides cheap package inventory; scoped invocations
  add dependency/dependent and task detail.
- `turbo run <tasks...> --dry-run=json` is the best no-execute task planner. It
  exposes task IDs, package, task hash, global hash, command, inputs, outputs,
  dependency/dependent task edges, resolved task definition, env mode, declared
  env/pass-through env, cache status, log paths, Turbo version, and SCM branch.
- Real runs with `--summarize` produce `.turbo/runs` JSON containing affected
  packages, executed task timings/hashes, cache status, and artifact file lists.
- Real runs with `--json` or `--log-file` can preserve raw task output for
  `QualityIssueIndex`, but Turbo should not own lint/test/typecheck issue
  parsing.

Key product conclusion:

- `yeet` should use Turbo as the structured package/task graph, affected-plan,
  task-fingerprint, cache/timing, and run-log provider. It should not
  reimplement Turbo's graph planner, and it should not ask Turbo to understand
  tool-specific quality diagnostics.

Feedback phase recommendation:

- Hydrate `RepoRunContext` from `turbo query`, `turbo ls`, and
  `turbo run --dry-run=json`.
- Run fast affected/hot package tasks with
  `--continue=dependencies-successful` so independent failures are collected
  while dependent tasks with failed prerequisites are skipped.
- Avoid bare `--continue`, because Turbo treats it as `always`, which can run
  tasks even when their dependencies failed.
- Use `--json` or `--log-file` only when `yeet` needs durable raw output; use
  `--summarize` for timing/cache telemetry.
- Prefer `--json` over `stream-with-experimental-timestamps` for stable parsing.

Final proof recommendation:

- Turbo scoping is feedback only. `yeet` must run an unscoped canonical full
  proof after the final fixer/generator and before staging, commit, or push.
- Current full quality command path in `Quality.command.ts` runs build, check,
  lint, docgen generate/aggregate, repo export catalog check, test, repo sanity,
  and changeset status. Coverage is not currently part of that sequence.

Skip/resume safety rule:

- Skip only read-only, cacheable, package-scoped tasks when the prior run and
  current plan match on task ID, package path, command, args, Turbo version,
  `turbo.json`, package config, lockfile-relevant state, base/head refs, cache
  mode, env mode, task hash, global hash, declared inputs, declared outputs, and
  declared env/pass-through env.
- Never skip write-mode fixers/generators, cache-disabled/stateful tasks,
  persistent/watch/dev tasks, generated-artifact drift checks, or the final full
  proof.

Safety cautions:

- `--affected` defaults to a main/head comparison and requires complete checkout
  history. Shallow history can mark every package changed. That is noisy but
  safe; it must not authorize commit/push.
- Root/global dependency changes can legitimately make all packages affected.
  In this branch, Turbo reported broad affected scope because branch changes
  included global inputs such as root `package.json`, `tsconfig.json`,
  `tsconfig.packages.json`, and `tstyche.json`.
- Turbo uses the lockfile for package graph stability. The observed warning
  `Unable to calculate transitive closures: Workspace 'packages/drivers/box'
  not found in lockfile` should be captured as `RepoRunContext` graph-health
  metadata and should downgrade trust in dependency-aware shortcuts.
- `passThroughEnv` makes variables available but does not hash them. Runtime
  variables that affect outputs must be represented in task `env` and relevant
  files must be in task inputs.

## Turbo Config Opportunities

Most promising config idea:

- Evaluate the official Turbo transit-node pattern. Current `lint`, `check`,
  `type-test`, and `audit` use `^same-task`, which is safe but may
  over-serialize tasks that only need dependency-source cache invalidation rather
  than dependency task outputs. A `transit` task with
  `transit: { "dependsOn": ["^transit"] }` and package tasks depending on
  `transit` may preserve dependency-aware invalidation while improving
  parallelism.

Other opportunities:

- Do not make `yeet` call `turbo run audit` by default. Most package
  `beep:audit` scripts serially chain build/check/test/lint, and root audit
  depends on `^audit`; compose affected package tasks directly for feedback.
- Consider package-level `turbo.json` only for genuinely unusual packages
  needing specialized outputs/env/inputs. The repo currently has only the root
  `turbo.json`, which is simple and audit-friendly.
- Consider updating the root Turbo schema URL from `v2-9-6` to match the
  installed Turbo `2.9.16` or current catalog target.
- Treat `turbo boundaries` as a future advisory quality signal, not a v1
  commit/push proof. It is experimental and can mutate when ignore modes are
  used.
- Treat OpenTelemetry as a later observability phase. CLI flags exist, but the
  repo does not currently have `futureFlags.experimentalObservability`.

## Suggested Next Session Shape

Stay in research/design unless the user explicitly asks for implementation.
Recommended next steps:

1. Wait for or inspect the separate create-package / lockfile bootstrap fix
   before trusting live Turbo graph warnings.
2. Synthesize the four Turbo explorer memos into a `yeet` v1 design slice:
   `RepoRunContext`, `TurboPlanSnapshot`, `QualityIssueIndex`, feedback lanes,
   final proof gate, and per-package `@beep/md` packets.
3. Use sub-agents for any additional bounded research:
   - `@beep/md` packet model and rendering shape.
   - existing repo-cli service boundaries for shared planning core.
   - Turbo transit-node A/B feasibility using dry-run-only comparisons.
   - quality output parsing categories for `QualityIssueIndex`.
4. Keep the parent session as the coordinator/synthesis thread to preserve
   context.

## Implementation Note: Task-Aware Feedback Filters

Captured 2026-06-02 after implementing the scoped feedback lane.

What landed:

- `yeet` now hydrates `RepoRunContext.turbo.tasks` from:
  - `turbo query affected --tasks build check lint test --base <base> --head <head>`
  - `turbo query ls --output json`
- The feedback phase derives exact `--filter=<package>` selectors per task from
  that Turbo query snapshot.
- Feedback steps no longer pass `--affected`; this keeps package-scoped
  feedback fast and suppresses the slow repo-wide lint policy/sidecar tail
  because the existing quality adapter already treats `--filter` as explicit
  Turbo scope.
- Feedback tasks with an empty affected package set are omitted. If every
  feedback task is empty, feedback is a no-op and does not fall back to an
  all-package run.
- The write-mode `prepare:lint:fix` step still uses Turbo affected semantics,
  but base/head are supplied through `TURBO_SCM_BASE` and `TURBO_SCM_HEAD`.

Important Turbo correction:

- `turbo run ... --affected-base=<base> --affected-head=<head>` was not a valid
  run-shape for the installed Turbo `2.9.16` CLI. For `turbo run --affected`,
  Yeet uses `TURBO_SCM_BASE` and `TURBO_SCM_HEAD`; for structured planning, it
  uses `turbo query affected --base <base> --head <head>`.

Safety fallback:

- The scoped feedback phase is only fast backpressure. The final
  `full:quality` phase remains an unscoped canonical proof immediately before
  staging, commit, and push. This is the named fallback that allows scoped
  feedback without weakening release readiness.

Deferred:

- The edited-package-first two-tier feedback pass remains deferred. The landed
  v1 uses Turbo's affected task set directly and does not rely on dependency
  direction filter microsyntax.
