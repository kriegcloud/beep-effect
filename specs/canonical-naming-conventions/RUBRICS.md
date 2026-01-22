# Evaluation Rubrics: Canonical Naming Conventions

> Criteria for evaluating each phase of the naming conventions research spec.

---

## Phase 0: Codebase Inventory

### Completeness (40%)

| Score | Criteria |
|-------|----------|
| 4 | All file patterns identified; all folders analyzed; all barrel patterns documented |
| 3 | Most patterns identified; minor gaps in coverage |
| 2 | Significant patterns missing; incomplete folder analysis |
| 1 | Major gaps in inventory; only partial coverage |

### Accuracy (30%)

| Score | Criteria |
|-------|----------|
| 4 | Counts verifiable via grep; examples accurate; no misclassifications |
| 3 | Minor inaccuracies in counts or classifications |
| 2 | Some incorrect counts or misclassified patterns |
| 1 | Significant errors in pattern identification |

### Inconsistency Detection (30%)

| Score | Criteria |
|-------|----------|
| 4 | All inconsistencies identified with severity ratings and examples |
| 3 | Most inconsistencies found; some missing severity ratings |
| 2 | Major inconsistencies found; minor ones missed |
| 1 | Incomplete inconsistency analysis |

---

## Phase 1: External Research

### Research Breadth (30%)

| Score | Criteria |
|-------|----------|
| 4 | All research areas covered: Effect/FP repos, AI standards, industry practices, category theory |
| 3 | Most areas covered; one area has gaps |
| 2 | Two or more areas have significant gaps |
| 1 | Research limited to one or two areas |

### Source Quality (30%)

| Score | Criteria |
|-------|----------|
| 4 | All findings have citations; authoritative sources used |
| 3 | Most findings cited; some unattributed claims |
| 2 | Limited citations; some questionable sources |
| 1 | Few or no citations; sources not verifiable |

### Relevance (20%)

| Score | Criteria |
|-------|----------|
| 4 | All research directly applicable to beep-effect naming conventions |
| 3 | Most research relevant; some tangential findings |
| 2 | Significant irrelevant content; needs filtering |
| 1 | Research not focused on naming conventions |

### Synthesis Readiness (20%)

| Score | Criteria |
|-------|----------|
| 4 | Findings organized for easy synthesis; clear recommendations emerging |
| 3 | Findings organized but synthesis connections not explicit |
| 2 | Findings scattered; synthesis will require significant work |
| 1 | Raw findings only; no organization |

---

## Phase 2: Synthesis & Standards Definition

### Taxonomy Completeness (25%)

| Score | Criteria |
|-------|----------|
| 4 | All file types categorized; no gaps; clear layer mapping |
| 3 | Most types categorized; minor gaps |
| 2 | Several types uncategorized or miscategorized |
| 1 | Taxonomy has significant gaps |

### Decision Quality (25%)

| Score | Criteria |
|-------|----------|
| 4 | All decisions have documented rationale citing evidence |
| 3 | Most decisions have rationale; some lacking evidence |
| 2 | Decisions made but rationale incomplete |
| 1 | Decisions without clear rationale |

### Casing Matrix (20%)

| Score | Criteria |
|-------|----------|
| 4 | Clear, unambiguous rules for all contexts; examples provided |
| 3 | Rules clear for most contexts; minor ambiguities |
| 2 | Some rules ambiguous or conflicting |
| 1 | Casing rules incomplete or unclear |

### Rules Draft Quality (20%)

| Score | Criteria |
|-------|----------|
| 4 | Draft ready for adoption; complete, well-organized, with examples |
| 3 | Draft mostly complete; needs minor revisions |
| 2 | Draft incomplete; significant sections missing |
| 1 | Draft unusable in current state |

### Validation (10%)

| Score | Criteria |
|-------|----------|
| 4 | All validation checks pass; migration impact assessed |
| 3 | Most checks pass; minor issues identified |
| 2 | Several validation issues need resolution |
| 1 | Validation not performed or major issues |

---

## Cross-Phase Rubrics

### Handoff Quality

| Score | Criteria |
|-------|----------|
| 4 | Both HANDOFF and ORCHESTRATOR_PROMPT created; complete context preserved |
| 3 | Both files created; minor context gaps |
| 2 | Only one file created; or significant context missing |
| 1 | No handoff files; or files incomplete |

### Reflection Quality

| Score | Criteria |
|-------|----------|
| 4 | Rich phase learnings documented; prompt improvements suggested |
| 3 | Phase learnings documented; improvements noted |
| 2 | Basic learnings only; no prompt improvements |
| 1 | Reflection not updated or empty |

### Research Integrity

| Score | Criteria |
|-------|----------|
| 4 | Phase 0-1: No normative judgments; Phase 2: All judgments cite evidence |
| 3 | Minor premature judgments in research phases |
| 2 | Some judgments without evidence |
| 1 | Research and synthesis conflated; judgments not supported |

---

## Deliverable Checklist

### Phase 0 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `outputs/existing-patterns-audit.md` | Yes | Contains postfix, casing, and barrel sections |
| `outputs/file-category-inventory.md` | Yes | Categories by layer and purpose |
| `outputs/inconsistency-report.md` | Yes | Categorized inconsistencies with severity |
| `REFLECTION_LOG.md` update | Yes | Phase 0 section populated |
| `handoffs/HANDOFF_P1.md` | Yes | Complete context for Phase 1 |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Yes | Copy-paste ready prompt |

### Phase 1 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `outputs/fp-repo-conventions.md` | Yes | Effect/FP ecosystem patterns |
| `outputs/ai-codebase-standards.md` | Yes | llms.txt, CLAUDE.md patterns |
| `outputs/industry-best-practices.md` | Yes | Clean Architecture, DDD, monorepo |
| `outputs/category-theory-naming.md` | Yes | Category theory mappings |
| `REFLECTION_LOG.md` update | Yes | Phase 1 section populated |
| `handoffs/HANDOFF_P2.md` | Yes | Complete context for Phase 2 |
| `handoffs/P2_ORCHESTRATOR_PROMPT.md` | Yes | Copy-paste ready prompt |

### Phase 2 Outputs

| Deliverable | Required | Verification |
|-------------|----------|--------------|
| `outputs/category-taxonomy.md` | Yes | Complete taxonomy with rationale |
| `outputs/casing-decision-matrix.md` | Yes | Clear rules with examples |
| `outputs/module-structure-patterns.md` | Yes | Barrel export conventions |
| `outputs/naming-rules-draft.md` | Yes | Draft rules file |
| `outputs/validation-report.md` | Yes | Validation results |
| `REFLECTION_LOG.md` finalized | Yes | All phases documented |

---

## Overall Scoring

### Phase Completion Threshold

| Rating | Score Range | Meaning |
|--------|-------------|---------|
| Excellent | 3.5 - 4.0 | Phase complete, ready for next phase |
| Good | 2.5 - 3.4 | Minor issues, can proceed with notes |
| Needs Work | 1.5 - 2.4 | Significant gaps, rework required |
| Unsatisfactory | < 1.5 | Phase not complete, major rework |

### Spec Completion Criteria

The spec is complete when:

- [ ] Phase 0 score >= 3.0
- [ ] Phase 1 score >= 3.0
- [ ] Phase 2 score >= 3.5 (higher bar for synthesis)
- [ ] All deliverables created
- [ ] REFLECTION_LOG.md complete with all phases
- [ ] Standards validated by architecture-pattern-enforcer

---

## Quality Gates

### Phase 0 → Phase 1 Gate

Cannot proceed unless:
- [ ] All three Phase 0 output files exist
- [ ] Pattern counts are verifiable via grep
- [ ] Inconsistency report has severity ratings
- [ ] Handoff files created

### Phase 1 → Phase 2 Gate

Cannot proceed unless:
- [ ] All four Phase 1 research files exist
- [ ] Findings have citations
- [ ] Research covers all required topics
- [ ] Handoff files created

### Phase 2 → Complete Gate

Cannot mark complete unless:
- [ ] Category taxonomy covers all file types
- [ ] Casing matrix is unambiguous
- [ ] Rules draft is ready for review
- [ ] Validation passes
- [ ] REFLECTION_LOG finalized

---

## Research Integrity Rules

### Phase 0 & 1: Observation Only

- NO normative statements (should, must, better)
- NO recommendations
- NO judgments about quality
- ONLY factual observations and counts

### Phase 2: Evidence-Based Synthesis

- ALL normative statements cite supporting evidence
- Conflicting evidence acknowledged
- Rationale documented for each decision
- Alternatives considered and documented

---

## Anti-Pattern Detection

### Red Flags (Score = 0)

| Anti-Pattern | Detection |
|--------------|-----------|
| Empty outputs | File exists but < 10 lines |
| No citations | Phase 1 outputs lack sources |
| Premature judgment | Phase 0-1 outputs contain "should" |
| Missing handoff | Either HANDOFF or ORCHESTRATOR_PROMPT missing |
| Static reflection | REFLECTION_LOG not updated per phase |

### Warnings (Score Penalty)

| Warning | Penalty |
|---------|---------|
| Unverifiable counts | -0.5 from Accuracy |
| Missing examples | -0.5 from Completeness |
| Ambiguous rules | -0.5 from Decision Quality |
| No migration assessment | -0.5 from Validation |
