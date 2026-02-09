# Top Specs With 5/5 Spec Review Scores

## Proposed output file
`specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R1_TOP_SPECS_5_OF_5_PATTERNS.md`

## Summary
Only two specs in this repo show an explicit **spec review** score of **5.0/5** in spec-review output files. Many other 5/5 mentions are rubric definitions, parity scorecards, or non-spec-review scoring (e.g., visual similarity). Those are excluded because they are not spec review scores.

## Specs With 5/5 Spec Review Scores (Evidence)

1. `specs/completed/cursor-claude-parity/`
- Evidence file: `specs/completed/cursor-claude-parity/outputs/spec-review.md`
- Score recorded at:
  - Summary overall grade: line 9 (`Overall Grade | 5.0/5`)
  - Dimension scores: lines 15-20 (each dimension 5/5)

2. `specs/completed/codex-claude-parity/`
- Evidence file: `specs/completed/codex-claude-parity/outputs/spec-review-pass-2.md`
- Score recorded at:
  - Summary overall grade: line 9 (`Overall Grade | 5.0/5`)
  - Dimension scores: lines 15-20 (each dimension 5/5)

## 5/5 Patterns Observed (What the Reviewers Explicitly Rewarded)
These patterns are taken directly from the spec-review evidence tables and notes in the two 5/5 reports.

- **Full complex-spec structure present**: Required directories and file sets exist (`outputs/`, `templates/`, `handoffs/`) with dual handoff pairs for each phase. Evidence: both spec-review files, Dimension Scores table (Structure, Dual Handoff).
- **Clear objective + scoped domains + measurable success criteria**: README includes explicit scope and structured success criteria (SC/SD). Evidence: both spec-review files, README dimension.
- **Reflection discipline**: Reflection log includes protocol, entry template, phase placeholders, and actual entries. Evidence: both spec-review files, Reflection dimension.
- **Context engineering enforced**: Handoffs use Working/Episodic/Semantic/Procedural sections and stay within token budgets (<4K). Evidence: both spec-review files, Context Engineering dimension + Context Budget Audit tables.
- **Explicit orchestration/delegation rules**: Orchestrator responsibilities and delegation are spelled out in MASTER_ORCHESTRATION. Evidence: both spec-review files, Orchestrator Delegation dimension.
- **Anti-patterns explicitly checked and passed**: Required file presence, handoff completeness, context budget, static prompts, success criteria. Evidence: both spec-review files, Anti-Pattern Status section.

## Recurring Clarifications and Boundary Decisions (Visible in the 5/5 Specs)
These are repeated clarifications in the two spec folders, not just generic rubric text.

- **Scope boundaries are repeatedly reinforced**
  - Both specs have explicit scope clauses in AGENT_PROMPTS and README and reiterate scope changes must update README.
  - Examples:
    - `specs/completed/codex-claude-parity/AGENT_PROMPTS.md` (Scope clause)
    - `specs/completed/cursor-claude-parity/AGENT_PROMPTS.md` (Scope clause)
    - `specs/completed/codex-claude-parity/README.md` and `specs/completed/cursor-claude-parity/README.md` (Scope sections)

- **Counting/measurement clarifications are explicit**
  - Codex spec includes a “Count Clarifications” section to align top-level vs recursive counting and hooks entry counts. This prevents parity disputes.
  - Evidence: `specs/completed/codex-claude-parity/outputs/P0_BASELINE.md`.

- **Required vs optional capability boundaries**
  - Both specs distinguish required parity vs optional areas (e.g., hooks/runtime parity as optional or non-blocking). This is used to prevent scope creep.
  - Evidence: `specs/completed/codex-claude-parity/outputs/P0_BASELINE.md`, `specs/completed/cursor-claude-parity/outputs/P0_BASELINE.md`.

- **Tooling-specific asset preservation boundaries**
  - Codex spec explicitly warns against rewriting `.claude/` assets unless scope changes.
  - Evidence: `specs/completed/codex-claude-parity/README.md`.

- **Symlink policy as a first-class decision** (Codex spec)
  - “Symlink-first + fallback” is elevated to a core design/validation concern, with explicit decision logging requirements.
  - Evidence: `specs/completed/codex-claude-parity/README.md`, `specs/completed/codex-claude-parity/outputs/spec-review-pass-2.md` notes.

- **Known out-of-scope failures are documented** (Cursor spec)
  - Full repo checks failing outside the spec scope are documented and avoided as blockers.
  - Evidence: `specs/completed/cursor-claude-parity/outputs/P3_VALIDATION_REPORT.md`, `specs/completed/cursor-claude-parity/outputs/P4_HARDENING.md`, `specs/completed/cursor-claude-parity/handoffs/HANDOFF_P4.md`.

- **Open questions captured at P0**
  - Both specs record open questions early (e.g., which skills are required vs optional; how to map workflow parity). This reduces rework later.
  - Evidence: `specs/completed/codex-claude-parity/outputs/P0_BASELINE.md`, `specs/completed/cursor-claude-parity/outputs/P0_BASELINE.md`.

## Non-Qualifying 5/5 Mentions (Why They Are Excluded)
- `specs/completed/lexical-playground-port/**`: 5/5 is a visual similarity score, not a spec review score.
- `specs/**/RUBRICS.md`: 5/5 entries define scoring criteria, not awarded scores.
- Parity scorecards (e.g., `outputs/parity-scorecard.md`) are not spec review reports.

## Takeaways for Achieving 5/5 in This Repo
- Treat **spec structure completeness** as a gate: dual handoff pairs, outputs/templates, and reflection protocol are mandatory.
- Make **scope boundaries measurable and repeat them** across README, AGENT_PROMPTS, and handoffs.
- **Quantify and document inventories** with explicit counting rules to avoid scope disputes.
- Keep **context budgets explicit** and verify token limits in handoff audits.
- Maintain **anti-pattern checklists** and show PASS/FAIL status.
- Capture **open questions and optional vs required** decisions early in P0.
