# cursor-claude-parity: Orchestrator Prompt Library

> Reusable prompt templates for each phase and task class.

---

## Prompt Usage Rules

- Keep prompts phase-specific
- Include explicit output files
- Include constraints and definition-of-done
- Require evidence-backed conclusions
- For analysis phases, forbid premature implementation

---

## P0 Prompt Set

## P0 Main Prompt

```text
You are executing Phase 0 (Discovery Baseline) of specs/cursor-claude-parity.

Goal:
- Build baseline capability inventory from .claude and .codex
- Assess current .cursor state
- Create outputs/P0_BASELINE.md
- Create outputs/parity-capability-matrix.md

Constraints:
- Do not implement .cursor changes
- Do not modify .claude or .codex
- Cite source paths for every claim

Definition of done:
- Both required outputs exist
- Required capabilities are explicitly labeled
- Risks and unknowns are documented
- P1 handoff pair created
```

## P0 Focus Prompt: Capability Inventory

```text
Inventory all relevant .claude and .codex artifacts by capability domain:
- instruction/rules
- skills
- commands/workflows
- context/handoff systems
- quality/review patterns

Assess .cursor current coverage.

Output table fields:
- capability
- source artifact path
- .cursor current state
- required/optional
- candidate cursor strategy
```

---

## P1 Prompt Set

## P1 Main Prompt

```text
You are executing Phase 1 (Gap Analysis) of specs/cursor-claude-parity.

Input:
- outputs/P0_BASELINE.md
- outputs/parity-capability-matrix.md

Output:
- outputs/P1_GAP_ANALYSIS.md
- outputs/parity-decision-log.md

Task:
- Map each required capability into one of:
  direct-port | adaptation | unsupported | defer
- For every non-direct classification, provide rationale and mitigation.

Constraint:
- Analysis only. No .cursor implementation in this phase.
```

## P1 Focus Prompt: Decision Log Quality

```text
Review parity-decision-log for weak entries.

A valid entry must include:
- capability name
- classification
- explicit decision
- rationale
- risk level
- follow-up action

Rewrite entries that are missing any field.
```

## P1 Focus Prompt: P2 Readiness

```text
Produce a P2 readiness checklist from P1 outputs.

Checklist sections:
- required .cursor scaffolding
- instruction parity implementation tasks
- skill parity implementation tasks
- validation hooks needed for P3
```

---

## P2 Prompt Set

## P2 Main Prompt

```text
You are executing Phase 2 (Cursor Config Implementation) of specs/cursor-claude-parity.

Input:
- outputs/P1_GAP_ANALYSIS.md
- outputs/parity-decision-log.md

Deliver:
- implement/extend .cursor/** according to approved mapping
- create outputs/P2_IMPLEMENTATION_REPORT.md

Constraints:
- Keep .claude and .codex source assets intact unless explicitly required
- preserve repo safety and workflow constraints
- document every adaptation in the implementation report
- Extend sync-cursor-rules if needed; document rationale
```

## P2 Focus Prompt: Instruction Port

```text
Ensure instruction parity for .cursor/rules.

For each rule:
- source path (.claude or .codex)
- .cursor target path
- sync-cursor-rules applicability
- any semantic drift
```

## P2 Focus Prompt: Skill Port

```text
Map .claude/.codex skills to .cursor/skills format.

Output required in implementation report:
- source skill
- cursor equivalent
- parity level (full/partial)
- remaining gap
```

---

## P3 Prompt Set

## P3 Main Prompt

```text
You are executing Phase 3 (Validation) of specs/cursor-claude-parity.

Deliver:
- outputs/P3_VALIDATION_REPORT.md
- outputs/parity-scorecard.md

Required scenarios:
- S1 spec bootstrap + handoff
- S2 code edit + check workflow
- S3 review workflow quality
- S4 handoff + resume workflow
- S5 rules sync + skill discoverability

Constraints:
- provide command-level evidence
- provide expected vs actual outcomes
- score using RUBRICS.md worksheet
```

## P3 Focus Prompt: Evidence Completeness

```text
Audit validation report completeness.

For each scenario verify:
- objective
- procedure
- command evidence
- observed results
- pass/fail
- follow-up

Flag and repair incomplete scenarios.
```

## P3 Focus Prompt: Score Integrity

```text
Recompute weighted score from category scores.

Check:
- math consistency
- acceptance gate thresholds
- category minimum constraints

If score below gate, identify exact blockers.
```

---

## P4 Prompt Set

## P4 Main Prompt

```text
You are executing Phase 4 (Hardening & Final Handoff) of specs/cursor-claude-parity.

Deliver:
- outputs/P4_HARDENING.md
- updated REFLECTION_LOG.md
- final handoff pair

Tasks:
- resolve residual defects from P3
- tighten docs and cross-links
- record final lessons and follow-up plan

Definition of done:
- README required success criteria are met
- rubric acceptance gates pass
- no unresolved critical blockers
```

## P4 Focus Prompt: Documentation Tightening

```text
Audit all spec files for stale references, ambiguous wording, and inconsistent terminology.

Fix:
- phase naming mismatches
- output filename drift
- inconsistent definitions of parity
```

## P4 Focus Prompt: Final Handoff Quality

```text
Prepare final handoff package for downstream maintenance.

Must include:
- current state summary
- completed deliverables
- unresolved items with owner/date
- recommended next actions
```

---

## Cross-Phase Prompts

## Prompt: Scope Clause

```text
Scope is restricted to specs/cursor-claude-parity and .cursor parity artifacts only.
```

## Prompt: Handoff Clause

```text
At phase end, create both HANDOFF_P[N].md and P[N]_ORCHESTRATOR_PROMPT.md.
```

## Prompt: Output Contract Clause

```text
Produce all required files listed for this phase before claiming completion.
```
