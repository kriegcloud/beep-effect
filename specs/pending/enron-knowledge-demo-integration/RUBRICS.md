# Rubrics: Enron Knowledge Demo Integration

> Scoring framework for phase acceptance and overall spec quality.

---

## Rubric Scale

- `5` = Complete and high confidence
- `4` = Complete with minor gap
- `3` = Functional but meaningful gaps
- `2` = Incomplete and risky
- `1` = Not implemented
- `0` = Missing or regressed

Phase pass threshold:

- Required average: `>= 4.0`
- No critical criterion below `4`

---

## Global Fail Conditions (Any Phase)

If any condition below is true, the phase cannot pass:

1. Default demo path still relies on mock entities/relations
2. Feature flag gating is bypassed
3. Meeting prep returns bullets without resolvable evidence and no deterministic fallback rule
4. Verification commands for touched packages not run or failing
5. Handoff pair missing for next phase

---

## P0 Rubric: Scaffolding

| Criterion | Weight | Score (0-5) | Evidence |
|---|---:|---:|---|
| Critical file set complete | 20% |  | |
| Required directories complete (`outputs`, `handoffs`, `templates`) | 15% |  | |
| Master orchestration quality | 20% |  | |
| Agent prompt coverage quality | 15% |  | |
| Rubric completeness quality | 15% |  | |
| Reflection protocol initialized | 15% |  | |

Pass conditions:

- all weighted criteria average `>=4.0`
- no criterion `<4`

---

## P1 Rubric: Discovery & Design

| Criterion | Weight | Score (0-5) | Evidence |
|---|---:|---:|---|
| Mock-to-real mapping completeness | 20% |  | |
| RPC contract/path/serialization correctness | 20% |  | |
| Deterministic scenario catalog completeness | 20% |  | |
| Ingestion flow design quality (retry/idempotency) | 20% |  | |
| Risk identification and mitigation clarity | 20% |  | |

Pass conditions:

- all four output artifacts present
- no critical ambiguity around ingest flow and protocol

---

## P2 Rubric: RPC Client Migration

| Criterion | Weight | Score (0-5) | Evidence |
|---|---:|---:|---|
| Mock removal in default flow | 20% |  | |
| Atom RPC client correctness | 20% |  | |
| Ingestion state lifecycle UX correctness | 20% |  | |
| Multi-scenario switching correctness | 15% |  | |
| Error handling and resilience | 15% |  | |
| Type-safety and boundary compliance | 10% |  | |

Critical criteria:

- mock removal
- client correctness
- state lifecycle

All critical criteria must score `>=4`.

---

## P3 Rubric: Meeting Prep Rewrite

| Criterion | Weight | Score (0-5) | Evidence |
|---|---:|---:|---|
| LLM synthesis quality (non-template bullets) | 25% |  | |
| Evidence linkage preservation | 25% |  | |
| Handler failure safety (recoverable errors) | 20% |  | |
| Contract compatibility and persistence invariants | 20% |  | |
| Logging safety (PII/secret hygiene) | 10% |  | |

Critical criteria:

- synthesis quality
- evidence linkage
- handler failure safety

---

## P4 Rubric: Demo Validation

| Criterion | Weight | Score (0-5) | Evidence |
|---|---:|---:|---|
| End-to-end ingest->query->meetingprep path works | 30% |  | |
| Multi-scenario behavior quality | 20% |  | |
| Feature flag on/off behavior correctness | 15% |  | |
| Evidence resolution UX clarity | 15% |  | |
| Known risk documentation quality | 20% |  | |

Critical criteria:

- end-to-end path
- feature flag behavior

---

## P5 Rubric: Closure

| Criterion | Weight | Score (0-5) | Evidence |
|---|---:|---:|---|
| Reflection completeness and quality | 20% |  | |
| Verification command evidence completeness | 20% |  | |
| Dual handoff completeness for closure | 20% |  | |
| Deferred items clearly separated | 20% |  | |
| Final spec-review score | 20% |  | |

Pass conditions:

- latest `outputs/spec-review.md` score is `5.0/5`

---

## Verification Gate Checklist

Mark pass/fail and include output summaries.

```bash
bun run check --filter @beep/todox
bun run test --filter @beep/todox
bun run check --filter @beep/server
bun run test --filter @beep/server
bun run check --filter @beep/runtime-server
bun run test --filter @beep/runtime-server
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

Checklist:

- [ ] `@beep/todox` check/test
- [ ] `@beep/server` check/test
- [ ] `@beep/runtime-server` check/test
- [ ] `@beep/knowledge-server` check/test
- [ ] deterministic smoke validation in `outputs/demo-validation.md`

---

## Dual Handoff Audit Checklist

For each phase transition verify both files exist:

- [ ] `handoffs/HANDOFF_P1.md` + `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- [ ] `handoffs/HANDOFF_P2.md` + `handoffs/P2_ORCHESTRATOR_PROMPT.md`
- [ ] `handoffs/HANDOFF_P3.md` + `handoffs/P3_ORCHESTRATOR_PROMPT.md`
- [ ] `handoffs/HANDOFF_P4.md` + `handoffs/P4_ORCHESTRATOR_PROMPT.md`
- [ ] `handoffs/HANDOFF_P5.md` + `handoffs/P5_ORCHESTRATOR_PROMPT.md`

---

## Context Budget Audit Checklist

Every active handoff must include:

- [ ] Working context token estimate
- [ ] Episodic context token estimate
- [ ] Semantic context token estimate
- [ ] Procedural links-only confirmation
- [ ] Total estimate `<= 4000`

---

## Spec Review Quality Target

Final review target dimensions (all must be `5/5`):

1. Structure
2. README
3. Reflection
4. Dual Handoff
5. Context Engineering
6. Orchestrator Delegation

---

## Scoring Worksheet Template

```markdown
## Phase [N] Scoring Worksheet

| Criterion | Weight | Score | Weighted |
|---|---:|---:|---:|
| ... | ... | ... | ... |

- Weighted Total: ...
- Critical criteria all >=4: Yes/No
- Result: PASS/FAIL
```

---

## Remediation Priority Rules

When a phase fails rubric:

1. Fix all critical criteria first
2. Fix structural blockers (missing files/artifacts)
3. Fix quality issues in descending weighted impact
4. Re-run rubric after each patch set

---

## Minimal Evidence Standard

A rubric score without file-path evidence is invalid. Every criterion should include at least one direct evidence reference to:

- file path
- section heading or table row
- command output summary

---

## Reviewer Notes Section

Use this section during each review cycle:

```markdown
## Reviewer Notes

- Date:
- Reviewer:
- Phase:
- Blocking gaps:
- Non-blocking suggestions:
- Next re-review trigger:
```
