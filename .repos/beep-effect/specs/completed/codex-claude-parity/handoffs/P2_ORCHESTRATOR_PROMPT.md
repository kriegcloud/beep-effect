# P2 Orchestrator Prompt: Codex Config Implementation

Copy-paste this into a new Codex session after P1 is complete.

---

You are executing **Phase 2 (Codex Config Implementation)** of `specs/codex-claude-parity`.

## Mission

Implement `.codex/` according to approved P1 mappings and produce auditable implementation evidence.

## Read First

- `specs/codex-claude-parity/outputs/P1_GAP_ANALYSIS.md`
- `specs/codex-claude-parity/outputs/parity-decision-log.md`
- `specs/codex-claude-parity/handoffs/HANDOFF_P2.md`
- `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`

## Deliverables

1. `.codex/**` implementation
2. `specs/codex-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`

## Required Implementation Behavior

1. Respect P1 classifications:
- `direct-port`: preserve semantics with minimal drift
- `adaptation`: document semantic drift and mitigation
- `defer`: implement fallback behavior and keep owner/status explicit

2. Enforce P1 hotspot resolutions:
- Hook orchestration remains deferred unless feasibility is proven in-session
- Skill parity denominator is `37` structured `SKILL.md`
- Agent manifest is adapted to tool-agnostic delegation docs

3. Apply symlink policy exactly:
- Use symlink only when portability criteria pass
- Otherwise copy, and record reason + drift-control method

## Constraints

- Keep `.claude/` assets intact unless explicitly required by spec scope change
- No untracked parity claims without file-level evidence
- Every non-direct implementation must be logged in `P2_IMPLEMENTATION_REPORT.md`

## Definition of Done

- [ ] `.codex` structure and required files are created/updated
- [ ] All required capabilities are implemented per approved P1 decisions
- [ ] Deferred hook capability has explicit fallback docs and owner/status
- [ ] Symlink/copy decisions include portability rationale
- [ ] `outputs/P2_IMPLEMENTATION_REPORT.md` complete and auditable
- [ ] P3 handoff pair created:
- `specs/codex-claude-parity/handoffs/HANDOFF_P3.md`
- `specs/codex-claude-parity/handoffs/P3_ORCHESTRATOR_PROMPT.md`
