# Agent Prompts: Enron Knowledge Demo Integration

> Standardized delegated prompts for each phase.

---

## Delegation Policy

- Do not run broad sequential repository scans in orchestrator when a read-only research agent is available.
- Every delegated task must produce a tangible artifact or explicit findings summary.
- Record every delegation run in `outputs/delegation-log.md`.

---

## Phase 1: Discovery

### Prompt A: codebase-researcher (mock-to-real mapping)

```text
Analyze the Enron knowledge demo migration scope.

Target files:
- apps/todox/src/app/knowledge-demo/*
- packages/runtime/server/src/Rpc.layer.ts
- packages/knowledge/domain/src/rpc/*
- packages/knowledge/server/src/entities/*/rpc/*

Output file:
- specs/pending/enron-knowledge-demo-integration/outputs/codebase-context.md

Required sections:
1) Current mock paths
2) Existing real RPC paths
3) Gaps/blockers
4) Regression risks
5) File-level migration map

Constraints:
- Evidence every claim with concrete file paths
- Keep report concise and directly actionable
```

### Prompt B: codebase-researcher (scenario source design)

```text
Build deterministic scenario catalog design using curated Enron sources.

Inputs:
- specs/pending/enron-data-pipeline/outputs/meeting-prep-quality.json
- specs/pending/enron-data-pipeline/outputs/extraction-results.json

Output:
- specs/pending/enron-knowledge-demo-integration/outputs/scenario-catalog.md

Required sections:
1) deterministic ordering rule
2) scenario table with rationale
3) extraction scope (full thread, cap 25)
4) query seeds for GraphRAG/meeting prep
```

### Prompt C: spec-reviewer (post-P1 structure quality)

```text
Run spec-reviewer rubric on specs/pending/enron-knowledge-demo-integration.

Output:
- specs/pending/enron-knowledge-demo-integration/outputs/spec-review.md

Requirements:
- score each dimension out of 5 with evidence
- include anti-pattern status
- include dual handoff audit
- include context budget audit
- provide prioritized fixes
```

---

## Phase 2: RPC Client Migration

### Prompt D: effect-code-writer (Atom RPC client wiring)

```text
Migrate knowledge-demo data flow from mock actions to Atom RPC client calls.

Scope:
- apps/todox/src/app/knowledge-demo/*
- runtime client constructors as needed

Requirements:
- websocket path: /v1/knowledge/rpc
- serialization compatibility with server NDJSON
- add typed query/mutation wrappers for Batch, GraphRag, MeetingPrep, Evidence, Entity, Relation
- remove default mock entity/relation generation path
- preserve existing UI components where practical

Output artifacts:
- specs/pending/enron-knowledge-demo-integration/outputs/rpc-client-migration.md
```

### Prompt E: test-writer (client/runtime integration checks)

```text
Add deterministic tests for RPC client migration layer.

Validate:
1) protocol path and serialization setup
2) ingest status state transitions
3) failure-state rendering behavior

Touched package tests must remain green.
```

### Prompt F: package-error-fixer (post-merge stabilization)

```text
Fix type/build/test failures introduced by Phase 2 only.

Constraints:
- no unrelated refactors
- no weakening types
- preserve behavior contracts
```

---

## Phase 3: Meeting Prep Rewrite

### Prompt G: effect-code-writer (LLM synthesis rewrite)

```text
Rewrite meetingprep_generate to produce meaningful LLM-synthesized bullets backed by evidence.

Target:
- packages/knowledge/server/src/entities/MeetingPrep/rpc/generate.ts

Hard requirements:
- preserve persisted bullet/evidence model and contract
- maintain deterministic recoverable-failure behavior (no defects for DB/LLM/transient failures)
- no PII/secrets in logs
- ensure every returned bullet has evidence link(s) or explicit deterministic fallback behavior

Output:
- specs/pending/enron-knowledge-demo-integration/outputs/meeting-prep-rewrite-notes.md
```

### Prompt H: code-reviewer (meeting prep quality/risk)

```text
Review meeting prep rewrite for:
1) evidence-chain integrity
2) claim grounding strength
3) failure-mode safety
4) regressions against contract shape

Output:
- specs/pending/enron-knowledge-demo-integration/outputs/evidence-chain-regression-check.md
```

---

## Phase 4: Demo Validation

### Prompt I: codebase-researcher (flow validation evidence collection)

```text
Collect evidence for end-to-end demo flow using real data:
- scenario ingest
- batch completion
- entity/relation retrieval
- GraphRAG query
- meeting prep generation
- evidence resolution

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/demo-validation.md
```

### Prompt J: reflector (risk/remediation synthesis)

```text
Summarize residual demo risks and recommended remediation priorities.

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/demo-risks.md
```

---

## Phase 5: Closure

### Prompt K: spec-reviewer (final score)

```text
Run final strict spec-reviewer pass.

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/spec-review.md

Goal:
- latest score is exactly 5.0/5 with evidence.
```

### Prompt L: doc-writer (closure handoff)

```text
Create closure documents:
- handoffs/HANDOFF_COMPLETE.md
- handoffs/COMPLETE_ORCHESTRATOR_PROMPT.md

Include:
- status
- verification summary
- known deferred items
- move-to-completed instructions
```

---

## Delegation Log Template

For each delegated run append to `outputs/delegation-log.md`:

```markdown
| Date | Phase | Agent | Task | Inputs | Output | Status |
|------|-------|-------|------|--------|--------|--------|
```
