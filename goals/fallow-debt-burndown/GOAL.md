# GOAL: Implement Fallow Debt Burn-Down

Repo: repository root (`./`).

Outcome: turn current advisory Fallow reports into concrete remediation work and
narrow repo quality checks. Fix selected debt classes first; wire "new or
regressed debt fails" only after false positives, baselines, and doctrine gaps
are closed.

Read first:

- `goals/fallow-debt-burndown/README.md`
- `goals/fallow-debt-burndown/SPEC.md`
- `goals/fallow-debt-burndown/PLAN.md`
- `goals/fallow-debt-burndown/research/current-fallow-snapshot.md`
- `goals/fallow-debt-burndown/tasks/tasks.jsonc`
- `goals/fallow-debt-burndown/ops/manifest.json`
- `goals/fallow-quality-enforcement/README.md`
- `goals/fallow-quality-enforcement/SPEC.md`
- `goals/fallow-quality-enforcement/research/feature-matrix.jsonc`

Scope:

- In: direct boundary import burn-down, first-tranche health refactors,
  security candidate triage/fixes, low-risk clone cleanup, and later
  new/regressed debt checks.
- Out: blanket Fallow promotion, inherited all-debt failure, hidden
  suppressions, Knip removal, non-dry-run `fallow fix`, runtime coverage
  blocking, and new architecture doctrine encoded only in Fallow config.

Workflow:

1. Start from updated `origin/main` on `feat/fallow-debt-burndown`.
2. Preserve unrelated worktree and untracked files.
3. Treat `.beep/fallow/*` as evidence; do not commit generated local envelopes
   unless a task explicitly asks for a curated artifact.
4. For `boundaries`, replace direct internal package imports with public
   package exports or update canonical exports before touching Fallow config.
5. For `health`, split critical/high hotspots into smaller named functions;
   do not add complexity suppressions as the default fix.
6. For `security`, verify candidate reachability and existing coverage before
   suppressing or making a finding blocking.
7. For `dupes`, prefer existing helpers/exports; accept generated-code clones
   only through inventory.
8. Wire repo quality checks only after the matching burn-down or inventory is
   ready.

Acceptance:

- [ ] Packet validator passes.
- [ ] Boundary, health, security, and dupes work queues are explicit.
- [ ] Stop conditions preserve Knip, dry-run-only fix-preview, and deferred
      runtime/editor lanes.
- [ ] Future checks fail only new or regressed debt, not all inherited findings.

Verification:

```sh
test "$(wc -m < goals/fallow-debt-burndown/GOAL.md)" -le 4000
bun goals/fallow-debt-burndown/ops/validate-packet.ts
bun goals/fallow-quality-enforcement/ops/validate-packet.ts
bun run beep quality fallow boundaries --advisory --base origin/main --out .beep/fallow/boundaries.json --quiet
bun run beep quality fallow health --advisory --base origin/main --out .beep/fallow/health.json --quiet
bun run beep quality fallow security --advisory --base origin/main --out .beep/fallow/security.json --quiet
git diff --check -- goals/fallow-debt-burndown
```

Stop and report before removing Knip, running non-dry-run `fallow fix`, making
runtime coverage blocking, adding inline Fallow suppressions as the main fix, or
promoting a lane with unresolved false positives or doctrine gaps.

