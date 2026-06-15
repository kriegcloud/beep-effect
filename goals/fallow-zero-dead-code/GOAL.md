# GOAL: Drive Fallow Dead-Code Findings To Zero And Promote Blocking Lanes

Repo: repository root (`./`).

Outcome: `fallow dead-code --config .fallowrc.jsonc` reports `total_issues: 0`,
the regression baseline reads zero, the dead-code and audit lanes are blocking
in `quality github-checks pre-push` (closing fqe-005/fqe-006 in the old
packet), and the work lands as a mergeable PR via the normal yeet path.

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/fallow-zero-dead-code/README.md`
- `goals/fallow-zero-dead-code/SPEC.md`
- `goals/fallow-zero-dead-code/PLAN.md`
- `goals/fallow-zero-dead-code/ops/manifest.json`
- `goals/fallow-zero-dead-code/research/triage.md`
- `goals/fallow-zero-dead-code/tasks/tasks.jsonc`

Read those first, then `AGENTS.md`, `CLAUDE.md`, and the old packet's
`goals/fallow-quality-enforcement/SPEC.md` plus
`research/feature-matrix.jsonc` (still the authoritative matrix).

Scope:

- In: the 61 triaged findings (20 true positives, 41 false positives),
  `.fallowrc.jsonc` entry/ignore tuning, workspace manifests and root catalog,
  `standards/fallow.dead-code.regression-baseline.jsonc`, feature-matrix and
  knip-parity updates in the old packet, `quality github-checks pre-push`
  lane wiring in `packages/tooling/tool/cli`, and yeet publish/monitor.
- Out: retiring Knip, promoting dupes/health/boundaries lanes, fixing the 21
  duplicate-exports, hidden `fallow fix` mutations, inline suppressions.

Workflow:

1. Stay on `feat/fallow-zero-dead-code`.
2. Run `bun goals/fallow-zero-dead-code/ops/validate-packet.ts`.
3. Execute tasks `fzd-002` through `fzd-006` in rank order; respect each
   task's proofCommands and decisionGate.
4. Locked policies (see `research/triage.md`): false positives die in config
   only (app entry roots + ignoreDependencies with provenance, no inline
   suppressions); stragglers are wired in or deleted (0 means 0);
   `boundary-violation` flips warn -> error; Knip stays blocking with parity
   evidence recorded (`keep-knip`).
5. Re-verify the 2 disputed findings (`@opentelemetry/*` pair,
   `@typescript/native-preview`) before changing them.
6. Update the hardcoded counts in
   `goals/fallow-quality-enforcement/ops/validate-fallow-audit-baseline.ts`
   when re-baselining.
7. Use `npx vitest run` for `packages/tooling/tool/cli` tests, never
   `bun test`. Refresh the repo-exports catalog if exported symbols changed.

Acceptance:

- [ ] `bun run fallow:dead-code:json` reports `total_issues: 0`.
- [ ] Regression baseline rewritten at zero; audit-baseline validator updated
      and passing.
- [ ] Feature matrix promotes dead-code + audit to blocking; contract check
      `--expect-promoted-fallow-lanes` passes; fqe-005/fqe-006 are done.
- [ ] Both packet validators pass.
- [ ] `bun run beep yeet publish --message ...` then `yeet monitor` reach a
      mergeable PR with 0 required review findings.

Verification:

```sh
test "$(wc -m < goals/fallow-zero-dead-code/GOAL.md)" -le 4000
bun goals/fallow-zero-dead-code/ops/validate-packet.ts
bun run fallow:dead-code:json
git diff --check -- goals/fallow-zero-dead-code
```

Stop and report with evidence if a finding re-verifies differently than
`research/triage.md`, if zero cannot be reached without an inline suppression
or an apps/** blanket ignore, or if lane promotion breaks unrelated pre-push
consumers.
