You are implementing Phase 2 for `enron-knowledge-demo-integration`.

Read first:
- `specs/pending/enron-knowledge-demo-integration/README.md`
- `specs/pending/enron-knowledge-demo-integration/MASTER_ORCHESTRATION.md`
- `specs/pending/enron-knowledge-demo-integration/RUBRICS.md`
- `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2.md`

Mission:
1. Replace default `knowledge-demo` mock actions with Atom RPC client flows.
2. Implement scenario ingest start/status UX.
3. Preserve existing UI components where practical.

Required outputs:
- `outputs/rpc-client-migration.md`
- `outputs/ingest-status-contract.md`

Hard constraints:
- websocket endpoint `/v1/knowledge/rpc`
- serialization compatibility with NDJSON server transport
- no default fallback to mock entities/relations
- no unrelated refactors

Verification:
- checks/tests for touched packages

Then update:
- `REFLECTION_LOG.md` Phase 2
- `handoffs/HANDOFF_P3.md`
- `handoffs/P3_ORCHESTRATOR_PROMPT.md`
