# codex-claude-parity: Reflection Log

> Cumulative execution learnings for parity work between `.claude` and `.codex`.

---

## Reflection Protocol

For each phase, capture:

- What worked
- What failed or surprised us
- Concrete adjustment
- Reusable pattern
- Follow-up action

Keep entries short and technical. Avoid generic commentary.

---

## Entry Template

### Phase
- `P#`:

### What Worked
-

### What Failed / Surprised Us
-

### Concrete Adjustment
-

### Reusable Pattern
-

### Follow-Up Action
-

---

## Entries

### Phase
- `P0`:

### What Worked
- Starting from measured `.claude` inventory prevented premature implementation assumptions.
- Defining parity by capability domains reduced scope ambiguity.

### What Failed / Surprised Us
- Bootstrap-generated spec text was too generic for a complex multi-session target.

### Concrete Adjustment
- Replaced placeholders with strict phase gates, output contracts, and handoff discipline.

### Reusable Pattern
- For parity migration work, commit to baseline + matrix before any implementation.

### Follow-Up Action
- Ensure P1 decision log includes mitigation for every non-direct mapping.

---

### Phase
- `P1`:

### What Worked
- Capability matrix + decision log made each adaptation explicit and auditable.
- Mapping by category (rules, workflows, skills, agents, runtime, safety) reduced omission risk.

### What Failed / Surprised Us
- Some parity targets were workflow-equivalent but not implementation-equivalent (especially lifecycle hooks).

### Concrete Adjustment
- Added explicit defer path with proof requirements for hook automation instead of forcing speculative parity claims.

### Reusable Pattern
- Treat non-provable automation parity as deferred with closure criteria, not as implicit pass/fail.

### Follow-Up Action
- Keep defer status visible in all downstream scorecards and handoffs.

---

### Phase
- `P2`:

### What Worked
- Structured `.codex` tree implementation aligned with P1 decisions without cross-file drift.
- Copy-fallback plus checksum checks provided deterministic portability control.

### What Failed / Surprised Us
- Initial symlink portability confidence was weaker than expected until link-mode verification was tested later.

### Concrete Adjustment
- Documented copy fallback as first-class strategy and required drift checks.

### Reusable Pattern
- Prefer explicit fallback contracts over environment-sensitive assumptions.

### Follow-Up Action
- Revisit symlink policy only with in-session git mode evidence.

---

### Phase
- `P3`:

### What Worked
- Scenario-based validation produced reproducible evidence and clear gate outputs.
- Review scenario (S3) validated severity-order behavior with concrete file:line findings.

### What Failed / Surprised Us
- S2 was blocked by repo-wide `package.json` parse failure unrelated to the fixture edit.

### Concrete Adjustment
- Escalated blocker into P4 with explicit required re-run sequence and unchanged commands.

### Reusable Pattern
- Separate workflow validation failures from environmental/parser blockers to avoid false parity conclusions.

### Follow-Up Action
- In P4, resolve or formally defer blocker with owner/date and rescore gates.

---

### Phase
- `P4`:

### What Worked
- Re-run confirmed `packages/knowledge/domain/package.json` is now valid and parser blocker is cleared.
- Full verification sequence executed end-to-end and produced actionable non-parser failures.

### What Failed / Surprised Us
- `lint`, `test`, and `build` still fail due unrelated code-quality/test-timeout/module-resolution issues.
- Acceptance gate still fails overall because score remains below 90 and hook automation defer remains open.

### Concrete Adjustment
- Marked status explicitly NON-COMPLETE and produced downstream handoff focused on closure blockers.

### Reusable Pattern
- Hardening should reclassify blockers precisely (cleared vs still-open) and avoid blanket failure narratives.

### Follow-Up Action
- Resolve build/test/lint defects and prove hook automation feasibility in-session before claiming completion.

---

## Prompt Refinement History

| Date | Phase | Prompt Change | Why |
|------|-------|---------------|-----|
| 2026-02-07 | P0 | Added explicit output contract and handoff requirement | Prevented partial phase completion |
| 2026-02-07 | P1 | Added classification taxonomy and mitigation requirement | Reduced ambiguous mappings |
| 2026-02-07 | P4 | Added blocker-resolution proof + mandatory rerun evidence language | Prevented stale blocker carryover |

---

## Transferable Learnings

- Phase gates reduce rework when multiple sessions are involved.
- Dual handoff files are essential for reliable continuation.
- Decision logs are the primary defense against parity drift.
- Re-run evidence is required whenever a blocker changes state.
