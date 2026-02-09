# R17 Spec Review: TodoX Wealth Mgmt Knowledge MVP

Date: 2026-02-09
Reviewer: spec-reviewer (strict)
Spec: `specs/pending/todox-wealth-mgmt-knowledge-mvp`

## Summary
The spec is strong on technical depth, contracts, and execution gates, but it misses several repo-standard spec hygiene requirements. The most critical gaps are missing `REFLECTION_LOG.md` and non-compliant handoff documents/prompts relative to `specs/_guide/HANDOFF_STANDARDS.md`. There are also cross-doc inconsistencies (Connections UI location and Evidence.List shape drift) that will cause implementation churn.

**Overall score: 3.0 / 5**

## Rubric (5.0 total)

| Dimension | Weight | Score | Rationale |
|---|---:|---:|---|
| Structure completeness | 1.5 | 1.0 | Required files mostly present, but `REFLECTION_LOG.md` is missing. |
| Handoff standards compliance | 1.5 | 0.5 | Handoffs and orchestrator prompts do not match mandatory sections, context budgets, or verification checklists. |
| Decision + contract clarity | 1.0 | 0.9 | P0 decisions and contracts are strong, but Evidence.List shape drift remains in older outputs. |
| Execution plan quality | 0.75 | 0.6 | PR breakdown is detailed with gates; ordering/blocked dependencies are noted but not reconciled in plan structure. |
| Cross-doc consistency | 0.25 | 0.0 | Conflicting UI host for Connections and inconsistent Evidence.List schema across R8/R12. |

**Total: 3.0 / 5**

## Blocking Issues (Must Fix to Reach 5/5)

1) **Missing `REFLECTION_LOG.md` in the spec root**
- Required by `specs/_guide/README.md` for all specs. Its absence is a structural failure for a multi-phase spec.

2) **Handoffs and orchestrator prompts are non-compliant with `specs/_guide/HANDOFF_STANDARDS.md`**
- Missing mandatory Working/Episodic/Semantic/Procedural sections.
- No context budget tracking, no checkpoint handling, no verification tables, and no source verification blocks.
- Orchestrator prompts lack required sections (mission, critical patterns, reference files, success criteria, link to handoff).

3) **Connections UI host is inconsistent across outputs**
- `R6_OAUTH_SCOPE_EXPANSION_FLOW.md` suggests an  Integrations page, but `README.md`, `AGENT_PROMPTS.md`, and `P1_PR_BREAKDOWN.md` assume TodoX settings tab. This is a scope/ownership drift that will fragment UI work.

4) **Evidence.List canonical shape is inconsistent across outputs**
- `R8_PROVENANCE_PERSISTENCE_AND_API.md` uses `sourceType/sourceId` while `R12_EVIDENCE_MODEL_CANON.md` and `P0_DECISIONS.md` define a different canonical shape (`kind`, `source`, and `documentVersionId`). The spec must lock a single contract.

## Non-Blocking Improvements (Should Fix, Not Required for 5/5)

- **Clarify PR ordering for blockers**: PR4 is blocked on PR5, but PR5 is listed after PR4. Reorder or rename for clarity and build flow.
- **Thread aggregation + tombstone semantics**: D-07 tombstone/resurrect in Documents and PR2B thread aggregation should explicitly define whether `knowledge_email_thread_message` rows are soft-deleted or retained with a `documentDeletedAt` marker.
- **IaC/tooling consistency**: D-13 “AWS S3 only” vs Cloud Run GCP posture is called out but not reconciled. Add a single statement in README about the accepted cross-cloud posture for MVP.

## Exact File Edits Suggested

### 1) Add missing reflection log
Create a new file:

`specs/pending/todox-wealth-mgmt-knowledge-mvp/REFLECTION_LOG.md`

```markdown
# Reflection Log: Todox Wealth Mgmt Knowledge MVP

## Protocol
- Record learnings at the end of each phase.
- Each entry must include: what worked, what failed, what to change next phase.

## Phase P0
- Date: 2026-02-09
- What worked:
  - [TBD]
- What failed:
  - [TBD]
- Changes for next phase:
  - [TBD]
```

### 2) Bring handoffs into compliance (apply to ALL `handoffs/HANDOFF_P*.md`)
Update each handoff to include the mandatory context sections and context budget checklist from `specs/_guide/HANDOFF_STANDARDS.md`.

Example patch for `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P0.md` (apply the same pattern to P1-P4):

```markdown
## Context for Phase P0

### Working Context (≤2K tokens)
- Current task: lock P0 decisions and contracts.
- Success criteria: P0 decisions locked, changelog updated, P1 PR breakdown aligned.
- Blocking issues: [TBD]
- Immediate dependencies: `outputs/R0_SYNTHESIZED_REPORT_V3.md`, `outputs/P0_DECISIONS.md`

### Episodic Context (≤1K tokens)
- Phase outcome: [TBD]
- Key decisions made: [TBD]

### Semantic Context (≤500 tokens)
- MVP scope: Gmail -> Documents -> Knowledge -> /knowledge UI -> meeting prep with persisted evidence.
- Non-goals: calendar sync, webhooks, Outlook/IMAP, doc editor, multi-source resolution.

### Procedural Context (links only)
- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`

## Context Budget Checklist
- [ ] Working context ≤2,000 tokens
- [ ] Episodic context ≤1,000 tokens
- [ ] Semantic context ≤500 tokens
- [ ] Procedural context is links only
```

### 3) Bring orchestrator prompts into compliance (apply to ALL `handoffs/P*_ORCHESTRATOR_PROMPT.md`)
Add the required sections: Mission, Critical Patterns (2-5 code examples if relevant), Reference Files, Verification, Success Criteria, and link to the matching HANDOFF file.

Example patch for `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/P0_ORCHESTRATOR_PROMPT.md`:

```markdown
## Mission
Lock P0 decisions and contracts; update README and P0 decision log.

## Critical Patterns
- Use only `outputs/R0_SYNTHESIZED_REPORT_V3.md` for research context.
- Evidence.List must return `documentId + documentVersionId + offsets`.

## Reference Files
- `outputs/R0_SYNTHESIZED_REPORT_V3.md` (primary synthesis)
- `outputs/P0_DECISIONS.md` (decision contracts)
- `AGENT_PROMPTS.md` (delegation rules)

## Verification
```bash
rg -n "Key Decisions To Lock In P0" specs/pending/todox-wealth-mgmt-knowledge-mvp/README.md
rg -n "Evidence\.List|Evidence\.list" specs/pending/todox-wealth-mgmt-knowledge-mvp -S
```

## Success Criteria
- [ ] P0 decisions locked and changelog updated
- [ ] Evidence.List contract aligned across spec
- [ ] Handoff P1 files updated

## Full Context
See `handoffs/HANDOFF_P0.md`
```

### 4) Resolve Connections UI host inconsistency
Update `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R6_OAUTH_SCOPE_EXPANSION_FLOW.md` to match the locked decision that Connections UI lives in TodoX settings tab.

Replace the section under **“UI Wiring Location (Suggested)”** with:

```markdown
Given the current UI state, the canonical location is:
- TodoX Settings → Connections tab (`settingsTab=connections`) in `apps/todox`.
-  should not host this MVP surface.
```

### 5) Canonicalize Evidence.List contract across R8/R12
Update `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R8_PROVENANCE_PERSISTENCE_AND_API.md` to reference the canonical C-02 shape from `outputs/P0_DECISIONS.md` and `outputs/R12_EVIDENCE_MODEL_CANON.md`.

Add this note under **API Surface (Minimal, Evidence-First)** in R8:

```markdown
Canonical contract note:
- Evidence.List shape MUST match C-02 in `outputs/P0_DECISIONS.md` (fields: documentId, documentVersionId, offsets, kind, source).
- Any alternative field names in this document are deprecated.
```

### 6) Make PR ordering reflect blockers
Update `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P1_PR_BREAKDOWN.md` to reorder PR4 and PR5, or rename to reflect dependency.

Option A (reorder): move PR5 above PR4.
Option B (rename): `PR4` → `PR4_UI` and `PR5` → `PR4A_EvidencePersistence` with explicit ordering.

## Final Note
I looked for flaws, counter-examples, and inconsistencies. The primary defects are structural compliance issues (reflection log and handoff standards) and cross-doc contract drift. Once those are corrected, the spec is in a 5/5 trajectory.
