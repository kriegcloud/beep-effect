# Agent Prompts: Enron Knowledge Demo Integration

> Standardized delegated prompt set for this critical-complexity spec.

---

## 1) How To Use This File

1. Pick the active phase.
2. Use one prompt at a time for each concrete task.
3. Require artifact output at the path listed in the prompt.
4. Log every delegated run in `outputs/delegation-log.md`.
5. Re-run `spec-reviewer` after structural updates.

This file is intentionally phase-ordered and designed for copy/paste use.

---

## 2) Global Constraints For All Delegated Tasks

1. Keep package boundaries strict.
2. No `any`, unchecked casts, or `@ts-ignore`.
3. Preserve deterministic scenario ordering and reporting.
4. Do not launch long-running dev servers.
5. If blocked by dependencies, record concrete blocker evidence.
6. Do not claim verification that was not executed.

---

## 3) Global Prompt Preamble

Use this preamble in every delegated task.

```text
You are executing a delegated task for:
- specs/pending/enron-knowledge-demo-integration

Read first:
- specs/pending/enron-knowledge-demo-integration/README.md
- specs/pending/enron-knowledge-demo-integration/MASTER_ORCHESTRATION.md
- specs/pending/enron-knowledge-demo-integration/RUBRICS.md
- specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P[N].md

Hard constraints:
1. Respect locked product decisions.
2. Keep changes phase-local.
3. Avoid unrelated refactors.
4. Cite concrete file paths for all findings.

Output contract:
- Write required artifact file(s).
- Include command summary and blocker status.
- Include risks/follow-ups with severity.
```

Replace `P[N]` with active phase.

---

## 4) Artifact Quality Standard

Every delegated output must contain:

1. objective
2. inputs used
3. method
4. findings with file references
5. blocker status
6. verification summary
7. next-step recommendation

Outputs missing file-path evidence should be rejected and re-run.

---

## 5) Delegation Log Format

Append one row per delegated task using one of: `completed`, `blocked`, `needs-revision`.

```markdown
| Date | Phase | Agent | Task | Inputs | Output | Status |
|---|---|---|---|---|---|---|
```

---

## 6) Phase 0 Prompts (Scaffolding)

### P0-A: spec-reviewer (bootstrap audit)

```text
Run strict spec-reviewer audit for:
- specs/pending/enron-knowledge-demo-integration

Focus:
1. critical file presence
2. directory structure
3. dual handoff status
4. reflection quality
5. context budget compliance indicators
6. delegation evidence presence

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/spec-review-bootstrap.md

Required output format:
- summary table
- dimension scores with evidence
- anti-pattern status table
- exact blocking items
```

### P0-B: doc-writer (critical-depth uplift)

```text
Upgrade critical docs to operational depth.

Files:
- QUICK_START.md
- MASTER_ORCHESTRATION.md
- AGENT_PROMPTS.md
- RUBRICS.md

Requirements:
1. deterministic workflows
2. explicit transition guards
3. context budget controls
4. delegation policy and evidence requirements

No speculative implementation details.
```

---

## 7) Phase 1 Prompts (Discovery & Design)

### P1-A: codebase-researcher (mock-to-real inventory)

```text
Build mock-to-real migration inventory.

Scope:
- apps/todox/src/app/knowledge-demo/**
- runtime RPC wiring files
- knowledge RPC domain/server contracts

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/codebase-context.md

Required sections:
1. current mock flow
2. target real RPC flow
3. unresolved gaps
4. file-level migration map
5. regression risks
```

### P1-B: codebase-researcher (current-vs-target matrix)

```text
Create current-vs-target matrix for demo features.

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/current-vs-target-matrix.md

Columns required:
1. feature
2. current state
3. target state
4. contract/rpc path
5. persistence expectation
6. risk level
7. phase owner
```

### P1-C: codebase-researcher (deterministic scenarios)

```text
Define deterministic curated scenario catalog.

Inputs:
- specs/pending/enron-data-pipeline/outputs/extraction-results.md
- specs/pending/enron-data-pipeline/outputs/extraction-results.json
- specs/pending/enron-data-pipeline/outputs/meeting-prep-quality.md

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/scenario-catalog.md

Required sections:
1. deterministic order rule
2. 3-5 scenario table with rationale
3. extraction cap policy (25 docs)
4. GraphRAG query seeds
5. meeting prep seeds
```

### P1-D: codebase-researcher (ingestion flow)

```text
Design ingestion flow and status lifecycle.

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/ingestion-flow.md

Required sections:
1. request/response shape
2. status transitions
3. retry/idempotency rules
4. error-state mapping for UI
5. deterministic execution notes
```

### P1-E: spec-reviewer (post-discovery review)

```text
Run strict review for P1 readiness.

Check:
1. required P1 outputs present
2. locked decisions preserved
3. handoff pair for P2 exists
4. context budget details present

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/spec-review-p1.md
```

### P1-F: doc-writer (P2 handoff generation)

```text
Generate P2 handoff pair.

Create:
- specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2.md
- specs/pending/enron-knowledge-demo-integration/handoffs/P2_ORCHESTRATOR_PROMPT.md

Requirements:
1. working/episodic/semantic/procedural split
2. context budget audit table
3. phase objective, outputs, and verification expectations
```

---

## 8) Phase 2 Prompts (RPC Client Migration)

### P2-A: effect-code-writer (RPC client wiring)

```text
Migrate knowledge-demo from mock actions to Atom RPC client calls.

Scope:
- apps/todox/src/app/knowledge-demo/**
- runtime client helper files only if necessary

Hard requirements:
1. endpoint `/v1/knowledge/rpc`
2. NDJSON protocol compatibility
3. typed query/mutation wrappers for Batch, GraphRag, Entity, Relation, MeetingPrep, Evidence
4. remove default mock fallback path
5. preserve existing UI components where feasible

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/rpc-client-migration.md
```

### P2-B: effect-code-writer (ingest status UX)

```text
Implement deterministic ingest status UX.

Required states:
- idle
- submitted
- running
- success
- failed

Rules:
1. explicit user action for retry
2. no hidden background retries
3. clear button disable/enable behavior

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/ingest-status-contract.md
```

### P2-C: test-writer (migration test coverage)

```text
Add deterministic tests for Phase 2.

Validate:
1. endpoint/protocol configuration
2. status transitions for success/failure
3. no default mock data fallback
4. scenario switching behavior

Scope tests to touched packages.
```

### P2-D: package-error-fixer (build/test stabilization)

```text
Fix only failures introduced by P2 changes.

Constraints:
1. no unrelated refactors
2. no type weakening
3. preserve behavior contracts

Return summary:
- failing command
- root cause
- file-level fix list
```

### P2-E: code-reviewer (risk scan)

```text
Review P2 migration for hidden risks.

Check:
1. residual mock dependencies
2. ingest race conditions
3. scenario switch inconsistencies
4. protocol mismatch risks

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/p2-risk-review.md

Each finding must include severity + file path evidence.
```

### P2-F: doc-writer (P3 handoff generation)

```text
Generate P3 handoff pair after P2 completion.

Create:
- specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P3.md
- specs/pending/enron-knowledge-demo-integration/handoffs/P3_ORCHESTRATOR_PROMPT.md

Requirements:
1. include P2 outputs as required inputs
2. include context budget table
3. include required P3 verification commands
```

---

## 9) Phase 3 Prompts (Meeting Prep Rewrite)

### P3-A: effect-code-writer (handler rewrite)

```text
Rewrite meeting prep generation for live LLM synthesis.

Target file:
- packages/knowledge/server/src/entities/MeetingPrep/rpc/generate.ts

Hard requirements:
1. preserve contract shape from Generate.contract
2. preserve persistence for bullets and evidence links
3. deterministic recoverable-failure behavior
4. no PII/secrets in logs
5. no relation-id template bullet output

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/meeting-prep-rewrite-notes.md
```

### P3-B: code-reviewer (evidence-chain audit)

```text
Audit evidence-chain quality for rewritten meeting prep.

Required mismatch classes:
1. missing evidence
2. wrong span
3. weak support
4. cross-thread leakage

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/evidence-chain-regression-check.md
```

### P3-C: test-writer (meeting prep tests)

```text
Add deterministic tests for meeting prep rewrite.

Cover:
1. output contract compatibility
2. recoverable-failure handling
3. evidence resolution invariants
4. no-template-output regression
```

### P3-D: package-error-fixer (phase stabilization)

```text
Fix P3-introduced failures only.

Priority:
1. knowledge-server checks/tests
2. runtime-server integration failures
3. contract compatibility failures

No broad refactors.
```

### P3-E: reflector (phase learning update)

```text
Update reflection with Phase 3 learnings.

Requirements:
1. concrete success/failure observations
2. at least one prompt refinement
3. explicit deterministic safeguard pattern
4. no placeholders
```

### P3-F: doc-writer (P4 handoff generation)

```text
Create P4 handoff pair after P3 completion.

Create:
- specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P4.md
- specs/pending/enron-knowledge-demo-integration/handoffs/P4_ORCHESTRATOR_PROMPT.md

Must include:
1. validation objective
2. required artifacts
3. context budget audit
4. verification expectations
```

---

## 10) Phase 4 Prompts (Demo Validation)

### P4-A: codebase-researcher (end-to-end evidence)

```text
Collect deterministic evidence for full demo flow.

Validate per scenario:
1. scenario selection
2. ingest trigger
3. batch terminal success/failure behavior
4. entities/relations retrieval
5. GraphRAG result
6. meeting prep result
7. evidence resolution

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/demo-validation.md
```

### P4-B: code-reviewer (demo correctness review)

```text
Review demo for real-data correctness and usability.

Check:
1. no default dummy data remains
2. rendered data is meaningful for demo narratives
3. scenario switching behavior remains coherent
4. errors are actionable and non-silent

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/demo-ux-correctness-review.md
```

### P4-C: reflector (risk prioritization)

```text
Generate prioritized risk report.

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/demo-risks.md

Priority levels:
1. demo-fatal
2. major confusion risk
3. polish risk

Each item must include mitigation and owner phase.
```

### P4-D: test-writer (demo smoke validation)

```text
Add/update deterministic smoke tests for internal demo path.

Must validate:
1. route hidden when `ENABLE_ENRON_KNOWLEDGE_DEMO` is false
2. route available when flag is true
3. ingest/query flow handles success and failure states
```

### P4-E: doc-writer (P5 handoff generation)

```text
Create P5 handoff pair for closure phase.

Create:
- specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P5.md
- specs/pending/enron-knowledge-demo-integration/handoffs/P5_ORCHESTRATOR_PROMPT.md

Must include:
1. closure checklist
2. context budget audit table
3. required final artifacts and review target
```

---

## 11) Phase 5 Prompts (Closure)

### P5-A: spec-reviewer (final strict review)

```text
Run final strict spec-reviewer audit.

Scope:
- specs/pending/enron-knowledge-demo-integration

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/spec-review.md

Requirements:
1. score all dimensions
2. include anti-pattern status table
3. include dual-handoff audit table
4. include context budget audit
5. overall score must be 5.0/5
```

### P5-B: doc-writer (closure handoff pair)

```text
Create closure transition pair.

Create:
- specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_COMPLETE.md
- specs/pending/enron-knowledge-demo-integration/handoffs/COMPLETE_ORCHESTRATOR_PROMPT.md

Include:
1. completion status summary
2. verification summary
3. deferred items list
4. move-to-completed instructions
```

### P5-C: reflector (final reflection quality pass)

```text
Finalize reflection quality for all phases.

Requirements:
1. no placeholders
2. concrete evidence-grounded observations
3. reusable prompt refinements across phases
4. clear anti-pattern notes and mitigations
```

### P5-D: doc-writer (completion packet)

```text
Create final completion packet.

Write:
- specs/pending/enron-knowledge-demo-integration/outputs/completion-packet.md

Sections:
1. artifact index
2. verification index
3. unresolved/deferred risks
4. transition recommendation
```

---

## 12) Acceptance Checklist For Delegated Outputs

Before accepting any delegated output:

1. file exists at expected path
2. required sections are present
3. concrete file references are included
4. blocker status is explicit
5. verification summary is present
6. delegation log entry exists

If any check fails, return the task for a delta-only revision.
