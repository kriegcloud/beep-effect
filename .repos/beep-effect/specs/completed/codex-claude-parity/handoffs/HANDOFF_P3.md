# Handoff: Phase 3 - Validation

> Context document for P3 execution after P2 implementation.

---

## Working Context (<=2,000 tokens)

Primary objective:

- Validate operational parity of `.codex/**` against P1 decisions and rubric gates.

P2 implementation outputs completed:

- `.codex/**` created with rules/workflows/skills/agents/safety/patterns/runtime
- `specs/codex-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`

Immediate P3 outputs required:

- `specs/codex-claude-parity/outputs/P3_VALIDATION_REPORT.md`
- `specs/codex-claude-parity/outputs/parity-scorecard.md`

Critical gate:

- Do not claim parity complete while hook orchestration remains deferred without explicit rubric-compliant handling.

---

## Episodic Context (<=1,000 tokens)

Implemented in P2:

1. `.codex` target tree established per prerequisite list.
2. Rules direct-port implemented by copy fallback (not symlink) due failed symlink portability criterion for git mode verification.
3. Skill denominator locked to 37 structured `SKILL.md` files with index evidence.
4. Agent manifest adapted to tool-agnostic capability verbs and phase profiles.
5. Hook orchestration remains deferred with explicit manual fallback in `.codex/runtime/hook-parity.md`.
6. Pattern corpus ported (`30` code-smells + `15` dangerous-commands) with manual pattern-check workflow.

Carry-forward concern:

- P3 S5 must validate copy-fallback behavior and drift-control method (checksums), not only symlink mechanics.

---

## Semantic Context (<=500 tokens)

Validation scenarios (required):

- S1: spec bootstrap + handoff generation workflow parity
- S2: code edit + verification sequence parity
- S3: review workflow quality with severity-ordered findings
- S4: session handoff + resume workflow parity
- S5: portability behavior (symlink criteria + copy fallback) and drift control

Acceptance gates from rubric:

- overall >= 90
- capability coverage >= 4/5
- workflow parity >= 4/5
- no unresolved critical blockers beyond explicitly approved defer

---

## Procedural Context (links only)

- `specs/codex-claude-parity/RUBRICS.md`
- `specs/codex-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`
- `.codex/context-index.md`
- `.codex/runtime/hook-parity.md`

---

## Exit Criteria

- [ ] S1-S5 executed with command-level evidence
- [ ] Scorecard computed with weighted rubric formula
- [ ] Deferred hook handling explicitly scored and justified
- [ ] P4 handoff pair created
