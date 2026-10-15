# Documentation lint migration

Lifecycle: `completed-retained`. Implementation is complete in TS7 lane B; local verification is recorded below.

The docs lint runner moves from ESLint to @beep/lint-rules on oxlint. ESLint removal is deferred
until lane A merges; the deprecated-API profile and shared environment remain intact.

- [SPEC.md](./SPEC.md): scope, acceptance and decisions.
- [PLAN.md](./PLAN.md): phase state and ownership.
- [research/spike.md](./research/spike.md): compatibility/timing receipt.
- [research/verification.tsv](./research/verification.tsv): exact command exits.
- [research/OPPORTUNITIES.md](./research/OPPORTUNITIES.md): friction as it occurs.
- [ops/manifest.json](./ops/manifest.json): active machine-readable packet.

The Claude orchestrator owns git, publishing, review closure and post-merge packet completion.

## Latest proof

- Full package verification for lint-rules and repo-configs passes.
- The two owned CLI test files pass 275 tests; test-tsgo passes for 346 CLI test files.
- Full docgen, hosted JSDoc ratchet, knowledge references and Knip pass.
- Full repo-cli audit passes 6160 tests and fails its one HEAD-vs-filesystem packet comparison
  because this bootstrapped packet is uncommitted. Commit ownership belongs to the orchestrator.
- Root documentation lint has zero errors and two inherited TSDoc warnings reproduced by ESLint.
- Generated schema/documentation inventory refreshes include extensive inherited drift; receipts
  identify it for the orchestrator's publication review.

The packet remains active. See research/verification.tsv for all command exits and research/
for attribution. The workstation lane report is written to the assigned report-B.md location.

At handoff, the last Knip rerun was behind the shared five-slot admission budget. Its existing
command records the terminal exit in verification.tsv; a bounded report watcher refreshes
report-B.md after that receipt arrives. Earlier Knip proof passed with zero introduced findings.

2026-10-14 merge recovery: preserve merged lane A and docs Oxlint workers; require positive tsgolint assignment-summary evidence (comment 4276915577). Verification logs and merge-resolution report are held externally by the orchestrator. ESLint deletion remains PR B2 after this merge. Packet remains active until orchestrator merge closeout.

Fallow wave (2026-10-14): split docs rule dispatch/AST lookup, extract assignment-evidence validation and fixture checks. Existing 39 docs tests stay unchanged; audit introduced findings reduced from 8 to 0. Publish and packet closeout remain orchestrator-owned. External report-B.md carries verification exits.
