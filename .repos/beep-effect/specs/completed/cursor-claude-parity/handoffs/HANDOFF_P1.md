# Handoff: Phase 1 - Gap Analysis

> Context document for executing P1 of `cursor-claude-parity`. Populate Episodic when P0 completes.

---

## Working Context (<=2,000 tokens)

Primary objective:

- Translate P0 baseline into concrete implementation decisions for `.cursor`.

P0 artifacts to consume:

- `specs/cursor-claude-parity/outputs/P0_BASELINE.md`
- `specs/cursor-claude-parity/outputs/parity-capability-matrix.md`

Immediate outputs:

- `specs/cursor-claude-parity/outputs/P1_GAP_ANALYSIS.md`
- `specs/cursor-claude-parity/outputs/parity-decision-log.md`

Blocking condition:

- Do not proceed to P2 until every `required` capability from matrix has classification and rationale.

---

## Episodic Context (<=1,000 tokens)

**P0 completed 2026-02-07.** Key findings:

- **Counts (timestamped):** .claude: rules 5, structured skills 37 (+ flat .md), commands 13, agents 29, hooks 6 subsystems. .codex: rules 3, workflows 8, skills 3 ports + index, patterns (code-smells + dangerous-commands), agents manifest + 5 profiles. .cursor: rules 5 (.mdc, synced), skills 2 only.
- **Strength:** .cursor has full instruction parity via sync-cursor-rules; all five rule domains present.
- **Gap:** Skills (37 in .claude → 2 in .cursor), commands/workflows (no mapping), agent delegation (none), context index (AGENTS.md only; no .cursor-specific index).
- **Carry-forward:** P1 must classify every *required* matrix row (direct-port | adaptation | unsupported | defer), decide which skills are required vs optional, document Cursor mechanism for commands/workflows, and answer sync-cursor-rules extension. Open questions listed in P0_BASELINE.md and HANDOFF_P1 Priority Questions.

---

## Semantic Context (<=500 tokens)

Stable rules:

- `.claude/` is reference source of truth; `.codex/` is secondary reference.
- `.cursor/` is target implementation.
- Every non-direct mapping requires rationale in parity-decision-log.
- Every completed phase requires both handoff files.

P1 classification taxonomy:

- `direct-port`
- `adaptation`
- `unsupported`
- `defer`

---

## Procedural Context (links only)

- `specs/cursor-claude-parity/README.md`
- `specs/cursor-claude-parity/MASTER_ORCHESTRATION.md`
- `specs/cursor-claude-parity/RUBRICS.md`
- `specs/cursor-claude-parity/outputs/P0_BASELINE.md`
- `specs/cursor-claude-parity/outputs/parity-capability-matrix.md`

---

## P1 Priority Questions

1. Which skills are required vs optional for Cursor parity?
2. How should sync-cursor-rules be extended (if at all)?
3. What workflow/command mechanisms does Cursor support (rules, skills, docs)?

---

## Exit Criteria

- [ ] All required capabilities classified
- [ ] Every non-direct mapping has rationale and mitigation
- [ ] P2 implementation prerequisites documented
- [ ] P2 handoff pair created
