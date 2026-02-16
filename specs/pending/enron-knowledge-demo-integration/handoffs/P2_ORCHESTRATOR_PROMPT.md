You are implementing Phase 2 for `enron-knowledge-demo-integration`.

Read first:
- `specs/pending/enron-knowledge-demo-integration/README.md`
- `specs/pending/enron-knowledge-demo-integration/MASTER_ORCHESTRATION.md`
- `specs/pending/enron-knowledge-demo-integration/RUBRICS.md`
- `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/codebase-context.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/current-vs-target-matrix.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/scenario-catalog.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/ingestion-flow.md`

Mission:
1. Replace default `knowledge-demo` mock actions with Atom RPC client flows wired to `/v1/knowledge/rpc`.
2. Implement explicit curated-scenario ingest UX (`Ingest Scenario`) with visible lifecycle state.
3. Keep migration deterministic and avoid relying on currently unimplemented RPC methods.
4. Add route-level internal feature gating via `ENABLE_ENRON_KNOWLEDGE_DEMO`.

Required outputs:
- `outputs/rpc-client-migration.md`
- `outputs/ingest-status-contract.md`

Hard constraints:
- websocket endpoint `/v1/knowledge/rpc`
- serialization compatibility with NDJSON server transport
- no default fallback to mock entities/relations
- curated scenarios only (from Phase 1 catalog)
- full-thread extraction cap 25 docs/scenario
- explicit ingest action (no silent ingest)
- org-scoped persistence model
- no unrelated refactors
- preserve requirement that meeting prep rewrite to live LLM synthesis is a later phase deliverable

Verification:
- checks/tests for touched packages

Then update:
- `REFLECTION_LOG.md` Phase 2
- `handoffs/HANDOFF_P3.md`
- `handoffs/P3_ORCHESTRATOR_PROMPT.md`
