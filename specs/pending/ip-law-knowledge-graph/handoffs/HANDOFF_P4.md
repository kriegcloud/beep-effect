# P4 Handoff — Verification

## Objective

Run all repository quality gates against the `packages/ip-law-graph` package, classify any failures, resolve new issues, and produce a final readiness statement.

## Inputs

- [README.md](../README.md) — Success Criteria checklist
- [p3-implementation-notes.md](../outputs/p3-implementation-notes.md) — Implementation record, known issues, test results

## Required Work

1. Run `pnpm check --filter @beep/ip-law-graph` and record full output.
2. Run `pnpm lint-fix --filter @beep/ip-law-graph` and record full output.
3. Run `pnpm test --filter @beep/ip-law-graph` and record full output.
4. Run `pnpm build --filter @beep/ip-law-graph` and record full output.
5. Classify each failure as pre-existing (not caused by this package) or new (introduced by this package).
6. Resolve all new failures. Document fixes applied.
7. Write a final readiness statement addressing each item in the README Success Criteria checklist.

## Deliverable

Write: `outputs/p4-verification.md`

## Completion Checklist

- [ ] All 4 quality gate commands executed and output recorded
- [ ] Failures classified as pre-existing or new
- [ ] All new failures resolved
- [ ] Final readiness statement addresses all Success Criteria items

## Exit Gate

P4 is complete when all 4 commands exit 0 for the package scope, all new failures are resolved, and `outputs/p4-verification.md` contains the signed-off readiness statement.
