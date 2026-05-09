---
name: quality-review-fix-loop
description: >
  Late-initiative closure loop for repo quality, standards/law review, read-only
  reviewer/critic panels, structured inventory items, fixer-agent routing,
  waiver handling, and zero-blocker readiness. Use when the user asks to run
  repo quality, fix all warnings/errors, close an initiative, perform a
  reviewer/fixer loop, or repeat until reviewers find no required findings.
version: 0.1.0
status: active
---

# Quality Review Fix Loop

Use this skill near the end of a repository initiative. The goal is not endless
polishing. The goal is a green, committed, review-ready repository state with
zero required blockers in the chosen scope.

## Template Header

Fill or infer these values before starting:

- `repo_root`: absolute path to the working repo checkout (for example, the value of `git rev-parse --show-toplevel`)
- `initiative_summary`: one paragraph describing the initiative being closed
- `base_ref`: `origin/main` unless the user provides a different comparison base
- `review_scope`: changed files plus directly affected public APIs, package
  boundaries, docs, tests, generated configs, and package manifests
- `zero_gate`: zero required blocker findings from the named reviewer panel
- `loop_budget`: 3 reviewer/fixer rounds before escalating with unresolved
  blockers
- `commit_policy`: create a green baseline commit before reviewer/fixer loops;
  create follow-up local commits for closure fixes; do not push or open a PR
  unless explicitly asked
- `waiver_policy`: a required blocker may remain only with an explicit waiver
  record: source standard, reason, owner, expiry or follow-up, residual risk, and
  acceptance evidence
- `publish_policy`: local commits only unless the user explicitly asks to push,
  open a PR, reply to review threads, or resolve GitHub comments

## beep-effect Defaults

Use these defaults when `repo_root` is a beep-effect checkout. For other repositories,
replace this section with the local equivalents before starting.

### Source Of Truth

Read the relevant sources before reviewing. Do not review from generic taste.

- `AGENTS.md` and package-local `AGENTS.md` files for active agent rules
- `standards/ARCHITECTURE.md` as binding architecture doctrine
- `standards/architecture/README.md` for target-only posture, drift buckets,
  known unknowns, and the numbered doctrine index
- `standards/architecture/01-hexagonal-vertical-slices.md`
- `standards/architecture/02-shared-kernel.md`
- `standards/architecture/03-driver-boundaries.md`
- `standards/architecture/04-rich-domain-model.md`
- `standards/architecture/05-layer-composition.md`
- `standards/architecture/06-configuration-boundaries.md`
- `standards/architecture/07-non-slice-families.md`
- `standards/architecture/08-testing.md`
- `standards/architecture/09-errors-across-boundaries.md`
- `standards/architecture/10-cross-slice-coordination.md`
- `standards/architecture/11-evolution-and-deprecation.md`
- `standards/architecture/12-observability.md`
- `standards/architecture/13-onboarding-the-minimum-viable-slice.md`
- `standards/effect-laws-v1.md`
- `standards/effect-first-development.md`
- `.patterns/jsdoc-documentation.md`
- `standards/schema-first.inventory.jsonc`
- `standards/jsdoc-documentation.inventory.md`
- `standards/effect-laws.allowlist.jsonc`
- package READMEs for ownership, package policy, and promotion records
- `packages/fixture-lab/specimen` as executable architecture proof

Architecture docs are target doctrine. If current code disagrees with doctrine,
classify the disagreement as one of:

- `target-doctrine-violation`
- `transitional-compatibility`
- `cleanup-on-touch`
- `forbidden-in-new-work`
- `pending-automation`
- `missing-doctrine`

Existing repo-wide inventories are context, not automatic blockers. Treat them
as blockers only when this initiative touched, worsened, or depended on the
affected surface.

### Quality Commands

Run from `repo_root`.

Baseline:

```bash
bun run lint:fix
bun run audit:github quality
```

Portable fallback if the repo has no all-up quality script:

```bash
bun run lint:fix
bun run check
bun run build
bun run test
bun run audit
bun run lint
```

For docs/export changes, ensure the local docgen lane is included. In
beep-effect, `bun run audit:github quality` covers build, check,
lint, docgen generate/aggregate, test, repo sanity, and changeset status.

Warnings and policy diagnostics are actionable. Do not call the baseline green
while relevant warnings remain.

## Operating Rules

- Inspect the current worktree before changing anything. Do not revert unrelated
  user changes.
- Use the current checkout as truth for commands and package surfaces.
- Keep the review scope tied to this initiative. Do not turn known repo-wide
  historical debt into blockers unless the initiative touched it or made it
  worse.
- Reviewer/critic agents are read-only. They may inspect files, run non-mutating
  commands, and report findings. They must not edit.
- Fixer agents may edit only their assigned write surface. Tell them they are
  not alone in the codebase and must not overwrite unrelated work.
- Prefer focused fixes over broad refactors. Add abstractions only when they
  remove real duplication, reduce complexity, or match an established local
  pattern.
- Evidence beats vibes. A blocker requires concrete evidence and a concrete
  unblock action.
- Optional improvements are recorded as backlog unless they protect correctness,
  doctrine compliance, release safety, or future maintainability in the changed
  scope.

## Phase 0: Grounding And Scope

1. Confirm `repo_root`, current branch, dirty worktree, and `base_ref`.
2. Capture the changed surface:

```bash
git status --short
git diff --name-status {{base_ref}}...HEAD
git diff --stat {{base_ref}}...HEAD
```

3. Summarize the initiative in 3-6 bullets:
   - intended behavior or repo change
   - packages/apps/docs touched
   - public APIs, exports, commands, schemas, config, migrations, or docs changed
   - known risk areas
   - known unrelated dirty files
4. Read the source-of-truth documents relevant to the changed surface.

## Phase 1: Baseline Quality And Commit

1. Run the baseline quality commands.
2. Fix every relevant failure or warning.
3. Rerun the baseline until green.
4. Create a local baseline commit using a Conventional Commit message.
5. Record:
   - commit SHA
   - commands run
   - any unrelated failures that were verified out of scope
   - any pre-existing inventory debt that remains out of scope

Do not continue to reviewer/fixer loops until the baseline is green and
committed, unless the user explicitly changes the commit policy.

## Phase 2: Read-Only Reviewer Panel

Launch reviewer/critic agents in parallel where possible. Each reviewer receives
the initiative summary, base commit, changed-surface list, source-of-truth list,
and the inventory item format below.

Every reviewer must:

- stay read-only
- cite source standards and concrete file/command evidence
- classify each finding as `blocking`, `non-blocking`, `question`, or `note`
- distinguish changed-scope blockers from historical repo debt
- include suggested fixes and acceptance commands
- return `0 required findings` when no blockers remain

### Reviewer Roles

1. Quality Gate Reviewer
   - Checks the quality commands, failed lanes, warnings, docgen, generated
     config drift, package metadata, and repo sanity.

2. Architecture Boundary Reviewer
   - Checks package home, dependency direction, canonical subpaths, slice vs
     shared vs foundation vs drivers vs tooling routing, package README policy,
     and shared-kernel promotion records.

3. Schema And Domain Reviewer
   - Checks schema-first models, `S.Class`, annotations, same-name schema/type
     exports, `LiteralKit`, `OptionFrom*`, schema defaults/transforms, entity
     invariants, and table projection rules.
   - Suggested skill: `$schema-first-development`.

4. Effect Law Reviewer
   - Checks A/O/P/R/S aliases, typed errors, no unsafe TypeScript, no native
     runtime helpers in domain logic, `Effect.fn`, `Context.Service`, `Layer`,
     `Config`, `Redacted`, `Path`, `HttpClient`, resource handling, retries,
     timeouts, and concurrency.
   - Suggested skill: `$effect-first-development`.

5. Error Boundary Reviewer
   - Checks driver/internal errors die in adapters, port errors die in
     use-cases, public action errors die in protocol handlers, server-only vs
     public exports are separated, and dropped technical detail is logged at
     the translation boundary.

6. Testing Reviewer
   - Checks slice isolation, `@effect/vitest`, port stubs, contract tests,
     type/dtslint coverage, package-alias imports from tests, targeted coverage,
     and no `bun test` usage for repo tests.

7. Observability Reviewer
   - Checks span-per-boundary, `<slice>.<concept>.<action>` naming,
     domain-semantic vs technical attributes, low-cardinality attributes, no
     secrets/PII, logging vs tracing vs console, and error-translation logs.

8. Documentation And API Reviewer
   - Checks public exports, JSDoc/TSDoc, compilable examples, lowercase
     `@category`, `@since`, useful conditional tags, package READMEs, docs that
     match behavior, and doctrine updates when code changed architecture.
   - Suggested skill: `$jsdoc-annotation-specialist`.

9. Reuse And Duplication Reviewer
   - Checks duplication, missed existing modules, and proposed abstractions.
     Rejects vague `common`, `core`, `utils`, or `lib` gravity. Enforces
     `foundation/capability` only after the specific-home-first routing test and
     at least two named consumers.

10. Evolution And Deprecation Reviewer
    - Checks deprecation windows, feature-flag lifetime, migration notes,
      shared contract versioning, removal triggers, and whether a
      `DECISIONS.md` entry or package promotion record is actually warranted.

## Inventory Item Format

Reviewer findings must use this exact work-order shape. Omit only fields that
are explicitly marked optional.

```md
### {{id}}: {{title}}

- `round`: {{review_round}}
- `reviewer`: {{reviewer_role}}
- `label`: issue | suggestion | question | todo | note
- `blockingStatus`: blocking | non-blocking | question | note
- `severity`: P0-critical | P1-high | P2-medium | P3-low
- `doctrineBucket`: target-doctrine-violation | transitional-compatibility | cleanup-on-touch | forbidden-in-new-work | pending-automation | missing-doctrine | not-doctrine
- `sourceRefs`: {{standard/doc/law path plus section or command output}}
- `affectedFiles`: {{repo-relative paths with line numbers where possible}}
- `evidence`: {{specific diff, code path, failing command, log excerpt, missing doc, or violated rule}}
- `impact`: {{why this matters for correctness, architecture, docs, maintenance, or release readiness}}
- `suggestedFix`: {{smallest actionable fix}}
- `recommendedSkillOrAgent`: {{skill name or specialist role}}
- `fixerGroup`: {{write surface/package/docs area}}
- `acceptanceCommands`: {{focused commands proving the fix}}
- `testsNeeded`: {{runtime/type/doc/coverage/contract tests, or "none"}}
- `dependencies`: {{other findings that must be fixed first, or "none"}}
- `waiverRecord`: {{required only if not fixing a blocker}}
- `status`: open | fixed | waived | backlog | rejected
- `fixedCommit`: {{commit SHA after fix, or "pending"}}
```

Severity calibration:

- `P0-critical`: confirmed data loss, security issue, broken release, or
  impossible-to-ship regression.
- `P1-high`: confirmed doctrine/law/API/test failure in changed scope.
- `P2-medium`: likely maintainability, documentation, boundary, or coverage
  gap that should be fixed before closure.
- `P3-low`: non-blocking polish or future improvement.

Use `blockingStatus`, not severity alone, to decide the loop gate.

## Phase 3: Triage And Fixer Routing

The orchestrator merges reviewer output into one inventory.

1. Deduplicate overlapping findings.
2. Reject findings without concrete evidence or actionable fixes.
3. Reclassify findings that are historical debt outside the changed scope as
   `backlog`.
4. Group blocking findings by write surface:
   - source package
   - docs or standards surface
   - tests/type tests
   - generated config/package metadata
   - repo-cli/tooling
5. Assign fixer agents only to non-overlapping groups.
6. Give each fixer:
   - owned files/packages
   - blocked inventory item IDs
   - exact acceptance commands
   - warning not to revert unrelated work
   - instruction to list changed files and verification results

## Fixer Agent Prompt Template

```text
You are a fixer agent for the quality-review-fix loop.

Repo root: {{repo_root}}
Owned write surface: {{owned_surface}}
Inventory items: {{item_ids_and_summaries}}

You are not alone in the codebase. Other agents may be working on different
surfaces. Do not revert unrelated changes. Edit only the owned surface unless a
fix is impossible without crossing ownership; if that happens, stop and report
the dependency.

For each assigned item:
- inspect the cited source standard and evidence
- make the smallest correct fix
- add or update tests/docs when required by the acceptance condition
- run the focused acceptance commands
- report changed files, commands run, pass/fail status, and any residual risk
```

## Phase 4: Verification Round

After fixer agents return:

1. Review each patch quickly.
2. Resolve conflicts manually and preserve unrelated user changes.
3. Run each item-level acceptance command.
4. Run the baseline quality commands again.
5. Commit the fixes with a Conventional Commit message.
6. Launch the reviewer panel again with the new commit as the target.

Repeat Phases 2-4 until:

- reviewer panel returns zero required blocker findings, or
- every remaining blocker has an explicit waiver record, or
- `loop_budget` is exhausted.

If the loop reaches the budget with blockers remaining, stop and report:

- remaining blockers
- why they remain
- options to proceed
- recommended next action

## Waivers And Backlog

Blocking findings should usually be fixed. If a blocker is intentionally not
fixed, create a waiver record:

```md
### Waiver: {{item_id}}

- `sourceStandard`: {{doc/law/standard}}
- `reason`: {{why fixing now is not the right move}}
- `owner`: {{person/team/package owner}}
- `expiryOrFollowUp`: {{date, issue, or explicit trigger}}
- `residualRisk`: {{what can go wrong}}
- `acceptanceEvidence`: {{why closure is still acceptable}}
```

Non-blocking improvements become backlog work items:

```md
### Backlog: {{title}}

- `source`: {{reviewer/item/source}}
- `evidence`: {{file/command/doc evidence}}
- `suggestedFix`: {{short fix direction}}
- `acceptanceCriteria`: {{how future work knows it is done}}
- `priority`: P2-medium | P3-low
```

## Final Response Format

When the loop closes, report:

- baseline commit SHA and final commit SHA(s)
- reviewer rounds run
- quality commands run and final status
- required blockers fixed
- waived blockers, if any
- backlog items, if any
- files changed by the closure loop
- remaining risk
- publish status: local only unless explicitly pushed/PR'd

Do not say the repository is ready if required blockers remain without waiver,
or if baseline quality is red.
