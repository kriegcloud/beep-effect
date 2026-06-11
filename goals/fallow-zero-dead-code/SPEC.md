# Fallow Zero Dead-Code Spec

## Objective

Drive the Fallow dead-code lane to a true zero (no accepted debt, no
dishonest suppression), promote the dead-code and audit lanes to blocking
pre-push proof, and land everything as one mergeable PR through the normal
yeet path.

## Non-Goals

- Retiring Knip or demoting it from its blocking reference-analyzer role.
- Promoting the dupes, health, boundaries, flags, security, or fix-preview
  lanes (they stay advisory; dupes/health get measured ratchet baselines).
- Enabling `duplicate-exports` or fixing its 21 known findings.
- Making runtime coverage blocking or any hidden `fallow fix` mutation.
- Architecture doctrine changes; this is quality-gate enforcement recorded in
  the feature matrix and packet manifests, not `standards/architecture`.

## Source Hierarchy

1. User objective that created this packet (zero findings + mergeable PR).
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. `goals/fallow-quality-enforcement/SPEC.md` and its validators (the
   feature matrix and knip-parity documents remain authoritative there).
4. This `SPEC.md`.
5. `PLAN.md`, `GOAL.md`.
6. Supporting `research/`, `ops/`, `reports/`, and `history/` files.

## Target Surfaces

- `.fallowrc.jsonc` (entry roots, ignoreDependencies, boundary-violation rule).
- The 20 true-positive findings and any stragglers per
  `research/triage.md` (apps + workspace manifests + root catalog +
  `bun.lock`).
- `standards/fallow.dead-code.regression-baseline.jsonc`.
- `goals/fallow-quality-enforcement/{research/feature-matrix.jsonc,
  research/knip-parity.jsonc, tasks/tasks.jsonc, ops/manifest.json,
  ops/validate-fallow-audit-baseline.ts}`.
- `packages/tooling/tool/cli` (Quality command group, repo-run pre-push
  wiring, Yeet planner advisory step, tests).
- This packet's evidence files (`reports/`, `history/review-rounds.jsonc`).

## Constraints

- False positives are eliminated config-only: app entry roots plus
  `ignoreDependencies` entries, each with a provenance comment. No inline
  suppression comments anywhere (`suppressionPolicy: config-only`).
- No blanket `apps/**` ignorePatterns entry; apps must become reachable
  entries, not invisible.
- Stragglers follow wire-or-delete; deletions rely on git history, no
  "pending" exception list.
- The 2 disputed findings (`@opentelemetry/resources` +
  `@opentelemetry/sdk-trace-node`, `@typescript/native-preview`) must be
  re-verified before any change; record the outcome in
  `research/triage.md`.
- Knip remains blocking; `knip-parity.jsonc` recommendation stays
  `keep-knip` in this packet.
- Promotion follows the old packet's machinery: matrix rows flip to
  `promotionStatus: blocking` with `baselineStatus: measured` and resolved
  `falsePositiveStatus`, lanes wire into `runGithubChecks("pre-push")`, and
  `--expect-promoted-fallow-lanes` proves matrix/code equivalence.
- Three consecutive clean blocking-lane runs are recorded under `reports/`
  before promotion is declared (matrix `minimumCleanRuns: 3`).
- Yeet publish uses the normal path (`publish --message`), not
  `--fast --monitor`.
- Repo coding law applies to all touched TypeScript (Effect-first, no type
  assertions, `npx vitest run` for tests, never `bun test`).

## Acceptance Criteria

- [ ] `bun run fallow:dead-code:json` reports `total_issues: 0` with the
      committed `.fallowrc.jsonc`.
- [ ] `standards/fallow.dead-code.regression-baseline.jsonc` records zero for
      every count, written by `fallow:dead-code:baseline:write`.
- [ ] `bun goals/fallow-quality-enforcement/ops/validate-fallow-audit-baseline.ts`
      passes with post-remediation expected counts.
- [ ] Feature matrix: dead-code + audit rows are `blocking` /
      `blocking-check` / `measured` / resolved false-positive status;
      dupes + health rows carry measured advisory baselines;
      duplicate-exports rationale recorded.
- [ ] `quality github-checks plan-contract-check --mode pre-push ...
      --expect-promoted-fallow-lanes` passes.
- [ ] fqe-005 and fqe-006 are `done` in the old packet with their proof
      commands satisfied; both packet validators pass.
- [ ] PR opened via `bun run beep yeet publish --message ...`; `yeet monitor`
      reports hosted checks green; review closeout reaches 0 required
      findings recorded in `history/review-rounds.jsonc`.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/fallow-zero-dead-code/GOAL.md)" -le 4000` | Passes |
| Packet validity | `bun goals/fallow-zero-dead-code/ops/validate-packet.ts` | Passes |
| Old packet validity | `bun goals/fallow-quality-enforcement/ops/validate-packet.ts` | Passes |
| Zero findings | `bun run fallow:dead-code:json` | `total_issues: 0` |
| Audit lane clean | `bun run fallow:audit -- --base origin/main --gate new-only` | Clean verdict |
| Audit baseline | `bun goals/fallow-quality-enforcement/ops/validate-fallow-audit-baseline.ts` | Passes |
| Promotion contract | `bun run beep quality github-checks plan-contract-check --mode pre-push --feature-matrix goals/fallow-quality-enforcement/research/feature-matrix.jsonc --expect-promoted-fallow-lanes` | Passes |
| Knip parity evidence | `bun goals/fallow-quality-enforcement/ops/validate-knip-parity-baselines.ts` | Passes |
| CLI tests | `npx vitest run` in `packages/tooling/tool/cli` | Green |
| Mergeable PR | `bun run beep yeet monitor` | Checks green, 0 required findings |
| Whitespace | `git diff --check -- goals/fallow-zero-dead-code` | Passes |

## Stop Conditions

- A triage verdict in `research/triage.md` fails re-verification and changes
  the remediation class (report before proceeding).
- Zero cannot be reached without an inline suppression or an `apps/**`
  blanket ignore.
- Lane promotion breaks pre-push for unrelated consumers, or the
  `--expect-promoted-fallow-lanes` contract cannot be satisfied without
  weakening the old packet's validator.
- Yeet monitor surfaces hosted failures that require credentials or policy
  approval not named here.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
