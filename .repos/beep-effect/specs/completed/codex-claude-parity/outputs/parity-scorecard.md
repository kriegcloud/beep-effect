# Parity Scorecard (P4 Final)

| Category | Weight | Score (1-5) | Weighted Contribution | Evidence |
|----------|--------|-------------|-----------------------|----------|
| Capability Coverage | 35 | 4 | 28 | `specs/codex-claude-parity/outputs/P1_GAP_ANALYSIS.md`, `specs/codex-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md` |
| Behavioral Fidelity | 20 | 4 | 16 | `.codex/rules/general.md`, `.codex/rules/behavioral.md`, `.codex/safety/permissions.md` |
| Workflow Parity | 20 | 4 | 16 | `specs/codex-claude-parity/outputs/P3_VALIDATION_REPORT.md`, `specs/codex-claude-parity/outputs/P4_HARDENING.md`, `specs/codex-claude-parity/outputs/validation-evidence/P4.lint.out`, `specs/codex-claude-parity/outputs/validation-evidence/P4.check.out`, `specs/codex-claude-parity/outputs/validation-evidence/P4.test.out`, `specs/codex-claude-parity/outputs/validation-evidence/P4.build.out` |
| Verification Quality | 15 | 5 | 15 | `specs/codex-claude-parity/outputs/validation-evidence/` |
| Documentation Quality | 10 | 5 | 10 | `specs/codex-claude-parity/outputs/P4_HARDENING.md`, `specs/codex-claude-parity/handoffs/HANDOFF_P5.md`, `specs/codex-claude-parity/handoffs/P5_ORCHESTRATOR_PROMPT.md` |
| **Total** | **100** | - | **85** | - |

## Formula

`overall = sum((category_score / 5) * category_weight)`

`= (4/5*35) + (4/5*20) + (4/5*20) + (5/5*15) + (5/5*10)`

`= 28 + 16 + 16 + 15 + 10 = 85`

## Grade Band

- Overall `85` => **B** (Strong parity with minor residuals)

## Acceptance Gate Evaluation

- Overall >= 90: **FAIL**
- Capability Coverage >= 4/5: **PASS**
- Workflow Parity >= 4/5: **PASS**
- No unresolved critical blockers: **FAIL**

## Critical Blockers

1. Automated lifecycle-hook parity is still deferred and unproven in-session.

## Notes

- P3 parser blocker at `packages/knowledge/domain/package.json:44` is resolved in current repo state and no longer blocks validation command execution.
- Validation command failures now represent normal code/test/build defects, not turbo graph parse failure.
