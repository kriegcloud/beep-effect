# Phase P2 Orchestrator Prompt

Copy-paste this prompt to start Phase P2 execution.

---

## Prompt

You are implementing Phase P2 of the `todox-wealth-mgmt-knowledge-mvp` spec: **Hardening** (implementation allowed).

### Context

MVP credibility depends on deterministic, restart-safe, evidence-grounded behavior:

- Evidence spans are the record (not RDF).
- Evidence pins to `documentVersionId` + UTF-16 offsets (no drift).
- Multi-tenant isolation is demo-fatal if violated.

### Your Mission

Implement and harden the MVP demo path so it is deterministic, restart-safe, and isolation-safe.

- Implement the PR plan in `outputs/P1_PR_BREAKDOWN.md`, preserving all acceptance gates.
- Keep gates in atomic `- [PASS/FAIL] ...` form; do not rewrite into prose or weaken invariants.
- Add hardening tests:
  - cross-org leakage tests for every demo critical path, including embeddings/vector search
  - evidence resolvability tests (no dead links)
  - restart-safety smoke tests

### Critical Patterns

Include the non-negotiable invariants for evidence and isolation.

**Offset drift is forbidden**:
```ts
// Never highlight against "latest" content. Always highlight against the cited version.
// Evidence.List must return:
{ documentId, documentVersionId, startChar, endChar }
```

**Isolation test must fail loud**:
```ts
// Pseudocode: running query under orgA must never return orgB evidence/entities.
// expect(result.every(row => row.organizationId === orgA)).toBe(true)
```

### Reference Files

- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P0_DECISIONS.md` - contracts C-01/C-02/C-03/C-05, D-08, D-10, D-17
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P1_PR_BREAKDOWN.md` - PR plan + gates
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R12_EVIDENCE_MODEL_CANON.md` - evidence tables and invariants
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R13_PII_REDACTION_ENCRYPTION_PLAN.md` - redaction vs encryption posture

### Verification

Commands to run after each step:

```bash
bun run check
bun run test
```

### Success Criteria

- [ ] After restart, meeting prep outputs still resolve to evidence spans and highlight correctly.
- [ ] No relation evidence resolution depends on `relation.extractionId -> extraction.documentId`.
- [ ] TodoX calls only `apps/server` for Gmail/OAuth actions; no direct Gmail/OAuth calls from Next route handlers.
- [ ] Cross-org tests exist and pass for: documents, knowledge graph, evidence list, embeddings, meeting prep.

### Handoff Document

Read full context in: `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P2.md`

### Next Phase

After completing Phase P2:
1. Update `REFLECTION_LOG.md` with learnings
2. Create/update `handoffs/HANDOFF_P3.md`
3. Create/update `handoffs/P3_ORCHESTRATOR_PROMPT.md`
