lane: rsc-h3-telemetry
head: round-3 source repair; exact delivery SHA recorded after publication
pr: #1590 (OPEN, ready for review; round-3 wave in progress)
package-verify: @beep/repo-ai-metrics pass (prior wave; untouched this wave); @beep/repo-cli pending integrated rerun
hosted-parity: pending integrated rerun; coverage read passed 106 tests before the assertion-only test simplification
receipt: goals/repository-simplification-confidence/history/receipts/stage-4-h3-telemetry.md
handoff: goals/repository-simplification-confidence/history/handoffs/rsc-h3-telemetry-2026-10-15.md
per-client buckets: claude stamped workflows with mixed/out-of-regime observations, incomplete 0/30; codex adapter stamped, native trust/ancestry unqualified, native metrics unstamped-by-design, 0/30; cursor adapter/native-start stamped, native tools unqualified, native OTel/reconciliation unsupported, 0/30; junie unsupported; grok unsupported
requests to rsc-f-agents / rsc-shared: existing F-owned native trust/ancestry, namespace/global projection, OTel and archive-key items remain; orchestrator owns merge and retirement
open items: H3-R3-001 storage completeness versus stamp qualification; final package/parity gates, publication and REST replies pending

Round-3 source: reconciliation uses `S.toCodecJson(HarnessTelemetryReconciliation)` before the shared printer serializes once. The command regression captures the existing output service, parses exactly once, and asserts report fields. The Markdown prefix space moves outside its code span. No metrics storage code is changed; H3-R3-001 tracks that lower-severity finding under the driver's round-3 cap.

Initial merge 6f97412008 included main 59212c5e84 and `bun install` completed. Focused 32 tests and scoped CLI coverage 106 tests passed. Six CLI baseline rows were read; the changed command exceeds every percentage baseline. This is a scoped read, not a full coverage-ratchet pass. Generated owner commands reported no tracked drift. Codemod check passed.

Main then advanced to 87dac5099d (security binding and ESLint retirement). The integration preview found only the generated observability Markdown conflict. The owned pre-integration full audit was stopped during its test phase so the final proof can run on the merged result. Initial cheap gates caught an introduced schema-test property-coverage threshold: remove the unnecessary extra schema decode, keeping exactly one JSON parse and direct field assertions. No baseline or production policy is weakened. Final integrated proof and REST reply ids replace these pending statuses before handoff. No readiness monitor is started; recovery is a revert of this repair wave.
