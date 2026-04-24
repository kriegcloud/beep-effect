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

1. a worker-read acknowledgment naming `README.md`, `SPEC.md`, `PLAN.md`,
   `ops/README.md`, `ops/manifest.json`, `ops/handoffs/README.md`, the active
   handoff, the matching orchestrator prompt, `history/quick-start.md`,
   `ops/prompts/agent-prompts.md`, `ops/prompt-assets/README.md`,
   `ops/prompt-assets/required-outputs.md`,
   `ops/prompt-assets/verification-checks.md`,
   `ops/prompt-assets/blocker-protocol.md`,
   `ops/prompt-assets/review-loop.md`,
   `ops/prompt-assets/manifest-and-evidence.md`, and the phase-specific files
   named in the active `phases[].inputs` manifest record
2. the governing-standards reread required for any `P0` batch that records
   baseline architecture or repo-law status, the standards reads required for
   `P2` through `P7`, and the immediate `P7` reread of those three standards
   plus the live `ops/*` ledgers before scoring or closure when applicable
3. exact changed repo surfaces
4. exact command lines run, timestamps, and exits
5. exact `rg` or equivalent search audits used to prove the active phase's
   `requiredSearchAuditIds` from `ops/manifest.json`; at the current manifest
   version, every phase record lists all seven catalog families
6. consumer/importer batches moved and remaining consumers, with counts
7. compatibility-ledger delta, architecture-amendment-register delta, and
   allowlist delta when applicable
8. blockers discovered, disposition taken, and any reopened earlier phase
9. Graphiti bootstrap and writeback status, or an explicit skipped reason
10. a readiness statement naming the next allowed phase

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

Only the two `ops/*` ledger paths above are live governance state. If legacy
files exist elsewhere, treat them as historical or planning context only.
These paths are the authoritative surfaces for active execution.
