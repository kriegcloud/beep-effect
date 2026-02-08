# P3 Orchestrator Prompt: Validation

Copy-paste this into a new Codex session after P2 is complete.

---

You are executing **Phase 3 (Validation)** of `specs/codex-claude-parity`.

## Mission

Validate operational parity and compute rubric scores from reproducible evidence.

## Read First

- `specs/codex-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`
- `specs/codex-claude-parity/RUBRICS.md`
- `specs/codex-claude-parity/handoffs/HANDOFF_P3.md`
- `.codex/context-index.md`

## Deliverables

- `specs/codex-claude-parity/outputs/P3_VALIDATION_REPORT.md`
- `specs/codex-claude-parity/outputs/parity-scorecard.md`

## Required Validation Behavior

1. Execute scenarios S1-S5 with command-level evidence:
- S1: spec bootstrap + handoff pair generation
- S2: code edit + verification workflow
- S3: review workflow quality (severity-ordered findings)
- S4: session handoff + resume
- S5: portability behavior (symlink criteria handling + copy fallback drift control)

2. Use rubric scoring formula exactly.

3. Treat deferred hook orchestration as an explicit scored condition:
- Verify fallback workflow is documented and executable
- Do not claim automated hook parity unless proven in-session

## Constraints

- No untracked parity claims without file-level evidence
- Record expected vs observed outcomes per scenario
- Keep unresolved critical blockers explicit

## Definition of Done

- [ ] S1-S5 completed with reproducible evidence
- [ ] Rubric worksheet complete with weighted score
- [ ] Acceptance gates evaluated explicitly
- [ ] P4 handoff pair created
