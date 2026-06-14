# Handoff: fallow-zero-dead-code PR #229 closeout

You are picking up an in-flight PR. Read this whole file, then continue.

## Where we are
- Branch: `feat/fallow-zero-dead-code` (checked out).
- PR: #229 — https://github.com/kriegcloud/beep-effect/pull/229 — `MERGEABLE`, no review decision yet.
- 4 commits already pushed (packet author → drive findings to zero → promote lanes → restore instant exports + repo-sanity drift).
- The big work is DONE: `fallow dead-code total_issues: 0`, regression baseline at zero, audit lane clean, dead-code + audit promoted to blocking pre-push, both packet validators pass, 442/442 repo-cli tests passed at last run.

## Uncommitted working-tree changes (NOT yet committed/pushed)
These are review-comment fixes from PR #229. `git status` shows:
- `D  .claude/settings.local.json` — `git rm --cached`'d (now gitignored). Comment fix: DONE.
- `M  .gitignore` — added `.claude/settings.local.json`. DONE.
- `M  .fallowrc.jsonc` — added `"apps/*/src/proxy.ts"` to entry roots. Comment fix (greptile, proxy.ts): DONE.
- `M  goals/fallow-zero-dead-code/ops/validate-packet.ts` — `reviewDiagnostics` now strictly validates `requiredFindingCount`/`openRequiredFindingCount` in review-rounds.jsonc against actual finding rows by `severity === "required"` and `closureStatus === "open"`. Comment fix (coderabbit): DONE.

## REMAINING WORK

### 1. Greptile comment #3 — STILL PENDING (the only unimplemented review comment)
Location: `packages/tooling/tool/cli/test/quality-tasks.test.ts` (~lines 163-169).
Problem: `githubCheckFallowLanes` in `packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts` hard-codes only `fallow:audit` and `fallow:dead-code` as wired pre-push lanes and never consults the feature matrix. There is no assertion that the wired lane IDs equal the promoted-matrix lane IDs. A future matrix promotion that forgets to update the static list would pass silently.

Fix: add a test asserting the wired fallow lane set EQUALS the promoted-lane set derived from the authoritative matrix. The test file ALREADY imports the helpers you need from `@beep/repo-cli/test/Quality`:
- `promotedFallowGithubCheckLaneIdsForTesting` — promoted lane IDs from the matrix.
- `githubCheckPromotedFallowLaneDiagnosticsForTesting` — diagnostics helper.
- `GithubChecksFallowFeatureMatrix` — the matrix itself.
- `githubCheckQualityLanesForTesting` / `githubCheckPrePushExternalLanesForTesting` — wired lanes per mode.
Authoritative matrix file: `goals/fallow-quality-enforcement/research/feature-matrix.jsonc`.
Assert: set of wired fallow lane IDs (from the pre-push wiring) === set of promoted lane IDs (from `promotedFallowGithubCheckLaneIdsForTesting`). Make it fail if a promoted lane is unwired or an unpromoted lane is wired. Match existing test style in this file (effect tests via `it.effect` + `Effect.fnUntraced`).

### 2. Re-run the proof chain after edits
```sh
bun goals/fallow-zero-dead-code/ops/validate-packet.ts
bun goals/fallow-quality-enforcement/ops/validate-packet.ts
bunx fallow dead-code --config .fallowrc.jsonc --format json --quiet | jq .summary.total_issues   # → 0
cd packages/tooling/tool/cli && npx vitest run   # NEVER `bun test`; run the cli suite
```

### 3. Commit and push — user's STANDING instruction: use `--no-verify`
The user explicitly wants pushes with `--no-verify` so reviewers/pipelines run while local checks happen in parallel. Commit message style follows the repo (conventional, with the Claude co-author trailer). Do NOT squash the existing pushed commits; add a new commit for the review fixes.
```sh
git add -A
git commit --no-verify -m "fix(quality): address PR #229 review comments" # + Co-Authored-By trailer
git push --no-verify
```

### 4. Continue closeout to mergeable / 0 required findings
- After pushing, check PR #229 CI + new review-bot comments: `gh pr checks 229`, `gh pr view 229 --comments`.
- Address any remaining REQUIRED findings. Advisory/nit findings: judgment call, note them.
- Goal acceptance: 0 fallow findings (already met) AND a mergeable PR with 0 required review findings.

## Hard rules (project doctrine — do not violate)
- Effect v4 is the runtime. `.repos/effect-v4` is source of truth. NO `Effect.catchAll` (use `Effect.catch`), NO `Object.entries` (use `R.toEntries` from `effect/Record`), NO type assertions (`as X`) except `as const`, NO native Array/Map/Set methods (use `effect/Array`, `MutableHashMap`, etc.), NO `null` (use `effect/Option`).
- Tests: `npx vitest run` or `bun run test` — NEVER `bun test` (breaks @effect/vitest).
- The `instant` exports in `apps/oip-web/src/app/{layout,page}.tsx` are a Next.js framework config export — DO NOT delete them (deleting breaks `next build`); they're suppressed via `.fallowrc.jsonc#ignoreExports`.
- `goals/fallow-quality-enforcement/research/feature-matrix.jsonc` is the authoritative matrix; contract checks point at it.

## Context docs
- Triage evidence: `goals/fallow-zero-dead-code/research/triage.md`
- Plan of record: `~/.claude/plans/can-you-double-check-glistening-barto.md`
- Full prior transcript: `/home/elpresidank/.claude/projects/-home-elpresidank-YeeBois-projects-beep-effect2/652cbbae-8893-493c-8840-4c5a0e669e35.jsonl`
