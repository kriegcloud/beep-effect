# Phase P1 Orchestrator Prompt

Copy-paste this prompt to start Phase P1 execution.

---

## Prompt

You are implementing Phase P1 of the `todox-wealth-mgmt-knowledge-mvp` spec: **MVP Demo Implementation Plan** (plan only; no product code).

### Context

P0 locked contracts in `outputs/P0_DECISIONS.md` and the demo narrative (Gmail → Documents → Knowledge graph → `/knowledge` UI → meeting prep with persisted evidence).

P1 must produce an executable PR plan with pass/fail acceptance gates so P2 can implement without re-deriving requirements.

### Your Mission

Produce an executable PR breakdown with concrete gates for every demo-fatal invariant.

- Ensure `outputs/P1_PR_BREAKDOWN.md` fully covers the MVP critical path:
  - Connections UI + typed incremental consent errors (C-01)
  - Gmail → Documents materialization + idempotency + version pinning (C-03, C-05)
  - Knowledge extraction persistence + embeddings
  - Multi-account selection + required `providerAccountId` (C-06; no defaults)
  - Thread aggregation read model
  - Ontology registry wiring
  - Evidence.List + relation evidence-of-record + migration/backfill
  - Meeting-prep persistence (demo requirement)
  - `/knowledge` UI (blocked on persisted evidence)
- Add acceptance gates for:
  - “TodoX calls only apps/server for Gmail/OAuth actions”
  - “No fragile join path for relation evidence”
  - “Evidence spans always include documentVersionId”

### Critical Patterns

Include 2-5 short examples showing non-negotiable gate style and dependency ordering.

**PR gates are pass/fail, not prose**:
```md
Acceptance gates:
- [PASS/FAIL] Evidence.List returns `documentVersionId` for every evidence row.
- [PASS/FAIL] Relation evidence never requires `relation.extractionId -> extraction.documentId`.
```

**UI must be blocked on persistence**:
```md
Hard dependency (demo integrity):
- `/knowledge` UI is blocked on persisted evidence-backed meeting prep (no transient-only bullets).
```

### Reference Files

- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P0_DECISIONS.md` - authoritative contracts
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P1_PR_BREAKDOWN.md` - PR plan to update
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R0_SYNTHESIZED_REPORT_V3.md` - synthesis context
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/README.md` - demo success criteria + phase plan

### Verification

Commands to run after each step:

```bash
rg -n "PR2A|PR2B|PR2C|Hard dependency|blocked on" specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P1_PR_BREAKDOWN.md
rg -n "TodoX calls only `apps/server`|documentVersionId|relation\\.extractionId" specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P1_PR_BREAKDOWN.md -S
```

### Success Criteria

- [ ] PR plan is executable without re-deriving requirements.
- [ ] Every demo-fatal constraint appears as an acceptance gate.
- [ ] PR ordering/read order matches dependencies (blockers are listed before dependents).

### Handoff Document

Read full context in: `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase P1:
1. Update `REFLECTION_LOG.md` with learnings
2. Create/update `handoffs/HANDOFF_P2.md`
3. Create/update `handoffs/P2_ORCHESTRATOR_PROMPT.md`
