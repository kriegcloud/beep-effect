# Manifest And Evidence Duties

Update `ops/manifest.json` whenever the phase artifact bundle, evidence, or
blocker state changes.

## Keep These Fields Current

1. `initiative.updated`
2. `initiative.currentTargetPhase`
3. `phases[].status`
4. `phases[].artifacts.evidencePack.status`
5. `phases[].artifacts.durableOutputs[].status`
6. `phases[].artifacts.review.*.status`
7. `phases[].reviewLoop.*`
8. `phases[].evidence.*`
9. `phases[].blockers.*`
10. `durableArtifacts[].status`
11. `nextAction`

## Required Evidence-Pack Sections

Every phase evidence pack must include all of the following:

1. exact changed repo surfaces
2. exact command lines run, timestamps, and exits
3. exact `rg` or equivalent search audits used to prove the target state
4. consumer/importer batches moved and remaining consumers, with counts
5. compatibility-ledger delta and allowlist delta when applicable
6. blockers discovered, disposition taken, and any reopened earlier phase
7. Graphiti bootstrap and writeback status, or an explicit skipped reason
8. a readiness statement naming the next allowed phase

## Authoritative Paths

- compatibility ledger: `ops/compatibility-ledger.md`
- architecture-amendment register:
  `ops/architecture-amendment-register.md`
- P0 consumer/importer census:
  `history/outputs/p0-consumer-importer-census.md`
- P7 architecture compliance matrix:
  `history/outputs/p7-architecture-compliance-matrix.md`
- P7 repo-law compliance matrix:
  `history/outputs/p7-repo-law-compliance-matrix.md`

If legacy files exist elsewhere, treat them as historical context only. These
paths are the authoritative surfaces for active execution.
