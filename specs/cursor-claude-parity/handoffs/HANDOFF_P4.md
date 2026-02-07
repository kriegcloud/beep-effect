# Handoff: Phase 4 - Hardening & Final Handoff

> Context document for executing P4 of `cursor-claude-parity`. Populate Episodic when P3 completes.

---

## Working Context (<=2,000 tokens)


Primary objective:

- Resolve residual defects from P3, tighten docs, produce final handoff package.

P3 artifacts to consume:

- `specs/cursor-claude-parity/outputs/P3_VALIDATION_REPORT.md`
- `specs/cursor-claude-parity/outputs/parity-scorecard.md`

Immediate outputs:

- `specs/cursor-claude-parity/outputs/P4_HARDENING.md`
- Updated `specs/cursor-claude-parity/REFLECTION_LOG.md`
- Final handoff package for downstream maintenance

---

## Episodic Context (<=1,000 tokens)

**P3 completed 2026-02-07.**

**Validation outcomes:**
- All 5 scenarios (S1–S5) PASS with reproducible evidence
- Parity scorecard: 100/100, grade A, acceptance gate passed
- Evidence in P3_VALIDATION_REPORT.md; scoring in parity-scorecard.md

**Residual gaps:**
- Full `bun run check` fails due to pre-existing @beep/knowledge-server errors (BatchActorRegistry, BatchOrchestrator). Outside cursor-claude-parity scope; documented in P3 report. Use `bun run check --filter=@beep/package` for isolated verification.

**Hardening priorities:**
- P4_HARDENING.md: resolve any residual docs/instruction clarity; update REFLECTION_LOG
- No cursor-claude-parity-specific defects to fix

---

## Semantic Context (<=500 tokens)

Parity accepted only if:

- README required success criteria met
- Rubric acceptance gates passed
- No unresolved critical blockers

---

## Procedural Context (links only)

- `specs/cursor-claude-parity/README.md`
- `specs/cursor-claude-parity/RUBRICS.md`
- `specs/cursor-claude-parity/outputs/P3_VALIDATION_REPORT.md`
- `specs/cursor-claude-parity/outputs/parity-scorecard.md`
- `specs/cursor-claude-parity/MASTER_ORCHESTRATION.md` (Appendix C: Acceptance Gate)

---

## Exit Criteria

- [ ] P4_HARDENING.md created
- [ ] REFLECTION_LOG updated with final learnings
- [ ] README success criteria satisfied
- [ ] No unresolved critical blockers
