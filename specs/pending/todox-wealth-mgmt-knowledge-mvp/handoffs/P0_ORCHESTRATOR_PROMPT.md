# Phase P0 Orchestrator Prompt

Copy-paste this prompt to start Phase P0 execution.

---

## Prompt

You are implementing Phase P0 of the `todox-wealth-mgmt-knowledge-mvp` spec: **Decisions + Contracts**.

### Context

This spec targets a demo-first wealth management Knowledge Base:
Gmail → Documents → Knowledge graph → `/knowledge` UI → meeting prep with persisted evidence.

P0 exists to lock contracts so P1/P2 implementation does not rediscover invariants or drift across docs.

### Your Mission

Lock the MVP contracts and decisions so later phases can implement without re-deriving requirements.

- Confirm the MVP scope and non-goals are locked (no Calendar, no webhooks, no Outlook/IMAP, no doc editor).
- Lock and reconcile the contracts in `outputs/P0_DECISIONS.md`:
  - C-01 typed scope expansion error payload
  - C-02 canonical `Evidence.List` contract
  - C-03 Gmail → Documents mapping invariants
  - C-05 offset drift invariant (`documentVersionId` + UTF-16 indices)
- Ensure all demo-fatal constraints are encoded as PR gates in `outputs/P1_PR_BREAKDOWN.md`.

### Critical Patterns

Include the key contract shapes and invariants that must be preserved.

**Typed scope expansion error (no string matching)**:
```ts
{
  tag: "GoogleScopeExpansionRequiredError",
  providerId: "google",
  missingScopes: ["https://www.googleapis.com/auth/gmail.readonly"],
  relink: {
    callbackURL: "/settings?settingsTab=connections",
    errorCallbackURL: "/settings?settingsTab=connections&relink=failed",
    scopes: ["...required scopes..."]
  }
}
```

**Evidence-of-record must pin to document version**:
```ts
{
  documentId: "doc_123",
  documentVersionId: "docv_456",
  startChar: 120,
  endChar: 165,
  kind: "relation",
  source: { relationEvidenceId: "relev_789" }
}
```

### Reference Files

- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R0_SYNTHESIZED_REPORT_V3.md` - synthesis input
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P0_DECISIONS.md` - contracts
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P1_PR_BREAKDOWN.md` - PR plan + gates

### Verification

Commands to run after each step:

```bash
rg -n "Scope Reminder|Decision Table|C-02: Evidence\\.List|C-05: Offset Drift" specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P0_DECISIONS.md
rg -n "Evidence\\.List|documentVersionId|relation_evidence" specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs -S
```

### Success Criteria

- [ ] No `PROPOSED` decisions remain that block MVP kickoff.
- [ ] Evidence.List contract is consistent across outputs (no `sourceType/sourceId` drift).
- [ ] PR plan includes gates for multi-account selection, thread aggregation, meeting-prep persistence, and relation evidence-of-record.
- [ ] Any changes to P0 decisions are recorded in `outputs/P0_DECISIONS_CHANGELOG.md`.

### Handoff Document

Read full context in: `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P0.md`

### Next Phase

After completing Phase P0:
1. Update `REFLECTION_LOG.md` with learnings
2. Create/update `handoffs/HANDOFF_P1.md`
3. Create/update `handoffs/P1_ORCHESTRATOR_PROMPT.md`
