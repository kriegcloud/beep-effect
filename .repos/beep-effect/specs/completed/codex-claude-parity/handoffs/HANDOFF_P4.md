# Handoff: Phase 4 - Hardening and Finalization

> Context document for P4 execution after P3 validation.

---

## Working Context (<=2,000 tokens)

Primary objective:

- Close P3 validation gaps and complete final hardening for `specs/codex-claude-parity`.

P3 outputs completed:

- `specs/codex-claude-parity/outputs/P3_VALIDATION_REPORT.md`
- `specs/codex-claude-parity/outputs/parity-scorecard.md`

Current gate state from P3:

- Overall score: `79` (Grade `C`)
- Gate outcomes:
  - Overall >= 90: FAIL
  - Capability Coverage >= 4/5: PASS
  - Workflow Parity >= 4/5: FAIL
  - No unresolved critical blockers: FAIL

Critical blockers carried into P4:

1. Repository parser blocker at `packages/knowledge/domain/package.json:44` prevents full validation command execution.
2. Hook orchestration automation parity remains deferred (manual fallback validated only).

---

## Episodic Context (<=1,000 tokens)

Validation scenarios S1-S5 executed with reproducible evidence in:

- `specs/codex-claude-parity/outputs/validation-evidence/`

Scenario outcomes:

- S1 PASS with adaptation: bootstrap did not auto-create `handoffs/`, pair was created manually.
- S2 FAIL: `bun run lint/check/test/build` all blocked by same parse error in `packages/knowledge/domain/package.json:44`.
- S3 PASS: severity-ordered findings generated with file:line references.
- S4 PASS: handoff pair presence and resume checks validated.
- S5 PASS: symlink criteria evidence + copy-fallback checksum drift controls validated.

Important nuance:

- P2 rejected symlink usage due inability to verify git link mode in that session.
- P3 proved link mode can be verified in current session (`120000`), but no automated hook parity claim is made.

---

## Semantic Context (<=500 tokens)

P4 must not claim completion unless all acceptance gates pass.

If S2 blocker remains unresolved, final status must remain non-complete with explicit defer/owner/date.

Hook parity rule:

- Manual fallback is validated and acceptable as defer evidence.
- Automated lifecycle-hook parity must remain unclaimed unless proven in-session.

---

## Procedural Context (links only)

- `specs/codex-claude-parity/outputs/P3_VALIDATION_REPORT.md`
- `specs/codex-claude-parity/outputs/parity-scorecard.md`
- `specs/codex-claude-parity/RUBRICS.md`
- `specs/codex-claude-parity/README.md`
- `.codex/runtime/hook-parity.md`

---

## Exit Criteria

- [ ] Resolve or formally defer `packages/knowledge/domain/package.json:44` parser blocker with owner/date.
- [ ] Re-run S2 verification sequence after blocker handling.
- [ ] Recompute rubric score and acceptance gate outcomes.
- [ ] Update `specs/codex-claude-parity/REFLECTION_LOG.md` with P3/P4 learnings.
- [ ] Produce `specs/codex-claude-parity/outputs/P4_HARDENING.md`.
- [ ] Create final downstream handoff pair.
