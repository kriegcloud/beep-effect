# codex-claude-parity: Orchestrator Prompt Library

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
You are executing Phase 0 (Discovery Baseline) of specs/codex-claude-parity.

Goal:
- Build baseline capability inventory from .claude
- Create outputs/P0_BASELINE.md
- Create outputs/parity-capability-matrix.md

Constraints:
- Do not create .codex files
- Do not modify .claude
- Cite source paths for every claim

Definition of done:
- Both required outputs exist
- Required capabilities are explicitly labeled
- Risks and unknowns are documented
- P1 handoff pair created
```

## P0 Focus Prompt: Capability Inventory

```text
Inventory all relevant .claude artifacts by capability domain:
- instruction/rules
- skills
- commands/workflows
- context/handoff systems
- quality/review patterns

Output table fields:
- capability
- source artifact path
- behavior summary
- required/optional
- candidate codex strategy
```

## P0 Focus Prompt: Risk Discovery

```text
Identify parity risks before implementation.

Classify each risk:
- portability risk
- ambiguity risk
- validation risk
- maintenance risk

For each risk include severity, impact, mitigation, owner.
```

---

## P1 Prompt Set

## P1 Main Prompt

```text
You are executing Phase 1 (Gap Analysis) of specs/codex-claude-parity.

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
- Analysis only. No .codex implementation in this phase.
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
- required file scaffolding
- instruction parity implementation tasks
- workflow parity implementation tasks
- validation hooks needed for P3
```

---

## P2 Prompt Set

## P2 Main Prompt

```text
You are executing Phase 2 (Codex Config Implementation) of specs/codex-claude-parity.

Input:
- outputs/P1_GAP_ANALYSIS.md
- outputs/parity-decision-log.md

Deliver:
- implement .codex/** according to approved mapping
- create outputs/P2_IMPLEMENTATION_REPORT.md

Constraints:
- Keep .claude source assets intact unless explicitly required
- preserve repo safety and workflow constraints
- document every adaptation in the implementation report
```

## P2 Focus Prompt: Instruction Port

```text
Port high-value instruction constraints from .claude to .codex format.

For each ported rule include:
- source path
- translated target path
- any semantic drift
- mitigation note
```

## P2 Focus Prompt: Skill/Workflow Port

```text
Map reusable .claude skill and command behaviors to Codex workflows.

Output required in implementation report:
- source workflow
- codex equivalent
- parity level (full/partial)
- remaining gap
```

## P2 Focus Prompt: Symlink Strategy

```text
Evaluate deduplication using a symlink-first strategy.

For each candidate path include:
- source path
- target path
- portability assessment
- fallback copy plan
- validation step
```

## P2 Focus Prompt: Regression Guard

```text
Run a consistency pass:
- verify .claude files are not unintentionally modified
- verify .codex content does not contradict project safety rules
- list unresolved implementation blockers
```

---

## P3 Prompt Set

## P3 Main Prompt

```text
You are executing Phase 3 (Validation) of specs/codex-claude-parity.

Deliver:
- outputs/P3_VALIDATION_REPORT.md
- outputs/parity-scorecard.md

Required scenarios:
- S1 spec bootstrap + handoff
- S2 code edit + check workflow
- S3 review workflow quality
- S4 handoff + resume workflow
- S5 symlink portability + fallback workflow

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
You are executing Phase 4 (Hardening & Final Handoff) of specs/codex-claude-parity.

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

## Prompt: Anti-Drift Audit

```text
Compare current phase outputs against README success criteria and MASTER_ORCHESTRATION gates.

List:
- criteria already met
- criteria partially met
- criteria unmet

Recommend only highest-impact next actions.
```

## Prompt: Context Budget Audit

```text
Audit handoff files against context budget policy:
- Working <= 2,000 tokens
- Episodic <= 1,000 tokens
- Semantic <= 500 tokens
- Procedural links only
- Total <= 4,000 tokens

Report estimated token count and status.
```

## Prompt: Decision Quality Audit

```text
Review parity-decision-log entries for weak rationale.

A strong rationale includes:
- technical compatibility reason
- risk tradeoff
- explicit mitigation

Rewrite weak entries.
```

---

## Prompt Components Library

Use these blocks to compose task prompts.

## Component: Scope Clause

```text
Scope is restricted to specs/codex-claude-parity and .codex/.claude parity artifacts only.
```

## Component: Safety Clause

```text
Do not run destructive git commands or revert unrelated workspace changes.
```

## Component: Evidence Clause

```text
Every non-trivial claim must include source path evidence.
```

## Component: Handoff Clause

```text
At phase end, create both HANDOFF_P[N].md and P[N]_ORCHESTRATOR_PROMPT.md.
```

## Component: Output Contract Clause

```text
Produce all required files listed for this phase before claiming completion.
```

---

## Quality Checklist For Prompt Authors

A high-quality phase prompt should:

- [ ] Name the phase explicitly
- [ ] Name exact output files
- [ ] Include constraints
- [ ] Include definition of done
- [ ] Include no more than 5 core tasks
- [ ] Include evidence requirement
- [ ] Include handoff requirement

---

## Common Prompt Defects and Fixes

| Defect | Impact | Fix |
|--------|--------|-----|
| Missing output files | Incomplete phase artifacts | Add explicit output list |
| Vague "improve" wording | Low reproducibility | Replace with measurable tasks |
| No constraints | Scope drift | Add scope and safety clauses |
| No done criteria | Endless iteration | Add explicit completion gates |
| Mixed phases in one prompt | Confusion | Split into phase-specific prompts |

---

## Example Full Prompt (P1)

```text
Execute Phase 1 (Gap Analysis) for specs/codex-claude-parity.

Read:
- specs/codex-claude-parity/outputs/P0_BASELINE.md
- specs/codex-claude-parity/outputs/parity-capability-matrix.md
- specs/codex-claude-parity/handoffs/HANDOFF_P1.md

Produce:
- specs/codex-claude-parity/outputs/P1_GAP_ANALYSIS.md
- specs/codex-claude-parity/outputs/parity-decision-log.md

Tasks:
1) classify each required capability as direct-port/adaptation/unsupported/defer
2) provide rationale and mitigation for non-direct classifications
3) define explicit prerequisites for P2

Constraints:
- no .codex implementation changes in this phase
- cite source paths for each classification

Done when:
- all required capabilities are classified
- non-direct mappings include rationale and mitigation
- P2 handoff pair is created
```

---

## Handoff Prompt Skeleton

Use this skeleton for creating `P[N]_ORCHESTRATOR_PROMPT.md` files.

```text
# P[N] Orchestrator Prompt: [Phase Name]

Mission:

Read first:

Tasks:

Outputs:

Constraints:

Definition of done:
```

---

## Maintenance Notes

Update this prompt library when:

- Phase workflow changes
- Output contracts change
- New failure modes appear in reflection log
- Rubric acceptance criteria change
