# Handoff: Phase 2 - Codex Config Implementation

> Context document for P2 execution after P1 gap analysis.

---

## Working Context (<=2,000 tokens)

Primary objective:

- Implement `.codex/` according to approved P1 decisions, without modifying `.claude/` source assets.

P1 outputs completed:

- `specs/codex-claude-parity/outputs/P1_GAP_ANALYSIS.md`
- `specs/codex-claude-parity/outputs/parity-decision-log.md`

Required implementation deliverables:

- `.codex/**`
- `specs/codex-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`

Critical carry-forward decisions:

1. Required capability classifications are complete.
2. Hook orchestration wiring is `defer` with mandatory manual fallback docs.
3. Skill parity denominator is `37` structured `SKILL.md` files (not `60` top-level entries).
4. Symlink usage is conditional and must pass portability criteria before adoption.

---

## Episodic Context (<=1,000 tokens)

Completed in P1:

- Every `required` capability mapped to a target path and classified.
- All non-direct mappings include rationale and mitigation.
- Hotspots resolved with explicit policy:
  - hook parity uncertainty: deferred runtime parity + manual fallback
  - skill denominator ambiguity: canonicalized to 37 structured skills
  - agent manifest portability: adaptation to tool-agnostic delegation docs

Carry-forward concern:

- If P2 treats deferred hook parity as solved, P3 parity claims will be invalid.

---

## Semantic Context (<=500 tokens)

Implementation posture:

- `AGENTS.md` remains the primary execution surface for Codex.
- `.codex/` provides structured parity artifacts and workflow documentation.
- Prefer symlink-first only for static tool-agnostic docs; use copy for any adapted content.

Non-negotiable P2 rule:

- Every adaptation decision and every symlink rejection must be documented in `P2_IMPLEMENTATION_REPORT.md`.

---

## Procedural Context (links only)

- `specs/codex-claude-parity/outputs/P1_GAP_ANALYSIS.md`
- `specs/codex-claude-parity/outputs/parity-decision-log.md`
- `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`
- `specs/codex-claude-parity/RUBRICS.md`

---

## P2 Prerequisites (Must Satisfy Before File Porting)

1. Confirm `.codex/` target tree:
- `.codex/rules/`
- `.codex/workflows/`
- `.codex/skills/`
- `.codex/agents/`
- `.codex/safety/`
- `.codex/patterns/`
- `.codex/runtime/`

2. Symlink portability criteria:
- `ln -s` works and Git preserves symlink mode.
- Consumer tooling resolves symlinked markdown content.
- File requires no Claude-specific token/path rewrite.
- Non-portable fallback is documented.

3. Deferred capability handling:
- Create `.codex/runtime/hook-parity.md` with manual pre/post execution fallback.
- Record explicit feasibility verdict for runtime hooks before closing P2.

---

## Exit Criteria

- [ ] Required `.codex` structure implemented
- [ ] Every required capability implemented per P1 classification
- [ ] Deferred hook capability has documented fallback + owner status
- [ ] Symlink/copy decisions documented with portability evidence
- [ ] `outputs/P2_IMPLEMENTATION_REPORT.md` complete
- [ ] P3 handoff pair created
