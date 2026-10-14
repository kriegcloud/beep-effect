lane: rsc-h3-telemetry
head: fc8b8289db009320b3d11d05ad9a357fa9935c6d (frozen validation source; exact publication dispatch follows)
pr: #1590 (OPEN, ready for review; review round 1 fixes complete; one push pending final gates)
package-verify: @beep/repo-ai-metrics pass (fresh full audit 23.3s / docgen 5.4s); @beep/repo-cli pending frozen full retry
hosted-parity: test-tsgo inherited fail (AgentMessage.runtime.test.ts:322 TS377032); docgen local retry after exit 137; jsdoc-ratchet pass; knowledge refs pass; fallow audit/health pass; coverage read pass (four matching baseline rows, 67 metrics + 76 CLI scoped tests; no full coverage-ratchet pass claimed)
receipt: goals/repository-simplification-confidence/history/receipts/stage-4-h3-telemetry.md
handoff: goals/repository-simplification-confidence/history/handoffs/rsc-h3-telemetry-2026-10-14.md
per-client buckets: claude stamped direct adapter and earlier native workflows, current live 0/30; codex stamped direct adapter, ordinary native hooks/ancestry unknown, native metrics unstamped-by-design; cursor stamped direct adapter and earlier native start, native tools unqualified, native OTel/reconciliation unsupported; junie unsupported; grok unsupported
requests to rsc-f-agents / rsc-shared: F owns native Codex trust/root-child attribution, dated namespace cutover/global projection, desktop/Codex OTel fields and the current archive-key reference; orchestrator/shared owns inherited AgentMessage repair, S11 merge and retirement
open items: frozen CLI package gate and serialized docgen retry; one publication and three REST replies/resolutions; latest-push review window and hosted exact-head checks; all 30-session windows remain incomplete; no capability is classified genuinely unused

Review round 1 addresses all three comments read in full: 4276613162 / PRRT_kwDOPbO_N86siFMt, 4276613174 / PRRT_kwDOPbO_N86siFM1, and 4276613187 / PRRT_kwDOPbO_N86siFM_. Hook ingestion degrades per shard/record while keeping valid stamps and reporting failed shard names, rejected-record counts and collection completeness. Refusal decoding keeps valid records and reports rejects; unreadable gap evidence remains fail-closed. Run/status JSON and the OTLP wrapper preserve the diagnostics. Prune coverage emits stamped from qualifying observations and unsupported for Junie/Grok. Supported-client absence stays unknown; non-use qualification is unchanged.

The end-to-end stamp fixture verifies corrupt/unreadable shards beside good evidence, mixed invalid/valid refusals, valid gap suppression, surviving unrelated stamps, DuckDB/OTLP projection and status JSON. Focused runtime suites pass 67 metrics tests and 76 CLI tests. The initial introduced Result/Option compile mismatch and three introduced Fallow complexity findings are fixed; fresh metrics package verification, all 47 compile tasks, Fallow audit/health and schema-first pass. The codemod/fixup reports no new schema sites or manual errors.

The first long CLI audit passed 6,444 tests but straddled a main merge. Newly landed governance/retirement tests saw old cached exports and ledger behavior. All three affected files match main, and a fresh same-runtime process passes all 70 tests. The failed full command remains recorded; a full retry runs on frozen source. Local docgen first passed, then a parallel retry was SIGKILLed with exit 137; the retry serializes package concurrency. Test-tsgo reports only the known main AgentMessage diagnostic. JSDoc's former inherited root-import red is now clear, with zero increases and zero legacy findings; Security ruleset repair #1775 is integrated.

Main merges preserve H3 decisions and H4's landed census/runbook packet evidence. No home configuration, installed timer, remote deployment or live telemetry evidence is changed. F retains affected capabilities on demand. Recovery is revert of the H3 review commits/PR; additive logs and versioned history remain readable. The orchestrator owns merge and lane retirement.

REST reply ids are filled in the exact-head delivery dispatch after the single push. All gate logs and intermediate failures are retained privately under .beep/h3-resume/. Committed receipts bind validation source; the final local dispatch records the self-referential published SHA and post-push thread state.

graft: approximately 95,961 tokens saved by one query in this review wave.
