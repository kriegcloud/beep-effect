# Quality Green Orchestrator Prompt

Use this in a fresh Codex session to drive the repo back to a fully green quality state after the `@effect/tsgo` migration work.

## Prompt

You are working in the `beep-effect` monorepo at `/home/elpresidank/YeeBois/projects/beep-effect`.

Your mission is to make **all repo quality commands green again** without weakening the intended governance or reintroducing legacy `@effect/language-service` package usage.

This is not a read-only investigation. Execute the work end to end:

1. diagnose the failing quality lanes
2. implement the necessary fixes
3. rerun the commands until they are green
4. commit all current changes
5. push the branch

## Current Known State

As of the handoff point, the repo is on branch `main` at commit `996d8b67fb0`.

Known facts from the latest validation:

- `bash scripts/run-github-checks.sh quality` is **not passing**
- It fails in the `build:ci` step before reaching the later quality lanes
- The current stopping point is `@beep/ui#build`
- The failure includes many Effect diagnostics during build, especially `effect(strictBooleanExpressions)`, and at least one prop-type mismatch in `packages/common/ui/src/components/toolbar.tsx`

Representative build failures:

- `packages/common/ui/src/components/avatar.tsx`
- `packages/common/ui/src/components/badge.tsx`
- `packages/common/ui/src/components/banner.tsx`
- `packages/common/ui/src/components/button-group.tsx`
- `packages/common/ui/src/components/calendar-event-card.tsx`
- `packages/common/ui/src/components/combobox.tsx`
- `packages/common/ui/src/components/input-group.tsx`
- `packages/common/ui/src/components/input.tsx`
- `packages/common/ui/src/components/item.tsx`
- `packages/common/ui/src/components/knowledge-graph.tsx`
- `packages/common/ui/src/components/toolbar.tsx`
- `packages/common/ui/src/hooks/useNumberInput.ts`

Also already observed in earlier validation:

- `bun run check` is red
- Root `check` now runs both:
  - Turbo workspace `tsgo` checks
  - repo-wide `dtslint` / `.tst.ts` `tsgo` sweep
- `bun run check:types` is red under `tstyche`
- Known current `tstyche` failures include:
  - `packages/common/schema/dtslint/Duration.tst.ts`
  - `packages/common/schema/dtslint/EffectSchema.tst.ts`
  - `tooling/repo-utils/dtslint/Graph.tst.ts`

## Non-Negotiable Constraints

- Do not revert unrelated repo changes.
- Do not paper over failures by broadly disabling diagnostics or loosening global governance without strong evidence and explicit justification in the final summary.
- Do not reintroduce the legacy `@effect/language-service` dependency package as the runtime solution.
- Keep the current direction:
  - `@effect/tsgo` is the intended TypeScript-governance path
  - root `check` should remain the full `tsgo` gate
  - `tstyche` remains separate unless you can prove a better equivalent path
- Prefer fixing code over muting rules.

## Required Working Style

- Start by reading current repo state, not by assuming the prior session was correct.
- Use the actual repository structure and actual current scripts.
- Be explicit about what you changed and why.
- Validate continuously instead of batching everything until the end.
- Persist until the repo is green or you hit a concrete blocker you can prove.

## Commands To Use As Your Truth

Use these as the canonical quality targets:

1. `bash scripts/run-github-checks.sh quality`
2. `bun run build:ci`
3. `bun run check`
4. `bun run check:types`
5. `bun run lint`
6. `bun run docgen`
7. `bun run test`
8. `bunx syncpack lint`
9. `bun run audit:high:ci`

Treat `bash scripts/run-github-checks.sh quality` as the final integrated gate, but iterate locally with narrower commands to make progress faster.

## Recommended Execution Order

1. Reconfirm the current failures with:
   - `bun run build:ci`
   - `bun run check`
   - `bun run check:types`
2. Fix the blocking `@beep/ui` build failures first, since quality currently dies there.
3. Re-run `bun run build:ci` until build is green.
4. Fix remaining `check` failures from the `tsgo` lane.
5. Fix remaining `tstyche` failures.
6. Run:
   - `bun run lint`
   - `bun run docgen`
   - `bun run test`
7. Run the full integrated quality command:
   - `bash scripts/run-github-checks.sh quality`
8. Once everything is green:
   - `git status --short`
   - `git add ...`
   - `git commit -m "<clear message>"`
   - `git push`

## Important Repo-Specific Notes

- Root `check` now comes from `scripts/run-check.sh` and is intentionally broader than plain Turbo.
- The repo has a dedicated `scripts/run-dtslint-tsgo-checks.mjs` sweep for `dtslint` / `.tst.ts` coverage.
- `tstyche` still catches assertion-suite failures that `tsgo` does not currently reproduce; do not delete that lane unless you can prove parity and update the repo intentionally.
- Be careful with `@beep/ui`: build currently runs with the repo’s actual TypeScript toolchain and is surfacing Effect diagnostics during build, so the fastest honest fix is likely code changes in that package rather than script surgery.

## Deliverables

Before you stop, provide:

- a short summary of the root causes you fixed
- the exact commands you ran for validation
- confirmation that all quality commands are green
- the commit SHA
- confirmation that the branch was pushed

If you cannot get to green, stop only with a concrete blocker that includes:

- the exact failing command
- the exact file(s)
- what you already tried
- why the blocker is not locally resolvable in-session
