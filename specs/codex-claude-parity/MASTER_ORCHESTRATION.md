# codex-claude-parity: Master Orchestration

> End-to-end runbook for achieving operational parity between `.claude` and `.codex`.

---

## 1. Operating Model

This spec assumes multi-session execution and strict phase gating.

Core principles:

- Evidence before implementation
- Explicit tradeoff documentation
- Reproducible validation
- Dual handoff discipline

Phase order:

- P0 Discovery Baseline
- P1 Gap Analysis
- P2 Codex Config Implementation
- P3 Validation
- P4 Hardening and Final Handoff

---

## 2. Global Constraints

- `.claude/` is reference source of truth
- `.codex/` is target implementation
- No destructive edits to unrelated files
- Every non-direct mapping requires rationale
- Every completed phase requires both handoff files
- Prefer symlink-first deduplication where portable; require fallback copy strategy where not portable

---

## 3. Phase Gates

Use this shared gate table for all phases.

| Gate | Requirement |
|------|-------------|
| Entry Gate | Prior phase outputs and handoff pair exist |
| Work Gate | Tasks executed with evidence |
| Exit Gate | Deliverables complete + next handoff pair created |
| Quality Gate | No unresolved critical blockers |

---

## 4. P0: Discovery Baseline

### P0 Objective

Build a measurable baseline of `.claude` capability inventory and parity targets.

### P0 Inputs

- `.claude/**`
- `README.md`
- `handoffs/HANDOFF_P0.md`
- `handoffs/P0_ORCHESTRATOR_PROMPT.md`

### P0 Work Items

1. Count and categorize `.claude` capability sources
2. Enumerate parity domains
3. Classify requirements as `required` or `optional`
4. Build initial strategy labels
5. Record risks and unknowns

### P0 Outputs

- `outputs/P0_BASELINE.md`
- `outputs/parity-capability-matrix.md`

### P0 Exit Checklist

- [ ] Baseline facts include timestamped counts
- [ ] Capability matrix includes all required domains
- [ ] Unknowns are explicit and actionable
- [ ] P1 handoff pair created

### P0 Failure Branch

If inventory is incomplete:

- Stop phase progression
- Add missing inventory rows
- Re-run P0 exit checklist

---

## 5. P1: Gap Analysis

### P1 Objective

Translate baseline capability inventory into a concrete implementation decision set.

### P1 Inputs

- `outputs/P0_BASELINE.md`
- `outputs/parity-capability-matrix.md`
- `handoffs/HANDOFF_P1.md`

### P1 Work Items

1. Map each required capability to Codex path
2. Classify mapping (`direct-port`, `adaptation`, `unsupported`, `defer`)
3. Record constraints and risk profile
4. Propose mitigation for all non-direct mappings
5. Define prerequisites for P2 implementation, including symlink portability criteria

### P1 Outputs

- `outputs/P1_GAP_ANALYSIS.md`
- `outputs/parity-decision-log.md`

### P1 Exit Checklist

- [ ] All required capabilities classified
- [ ] Every non-direct mapping has rationale
- [ ] P2 implementation prerequisites documented
- [ ] P2 handoff pair created

### P1 Failure Branch

If unresolved critical ambiguity remains:

- Keep phase open
- Add explicit decision questions
- Do not begin P2

---

## 6. P2: Codex Config Implementation

### P2 Objective

Create `.codex/` implementation that satisfies approved P1 decisions.

### P2 Inputs

- `outputs/P1_GAP_ANALYSIS.md`
- `outputs/parity-decision-log.md`
- `handoffs/HANDOFF_P2.md`

### P2 Work Items

1. Create `.codex/` directory structure
2. Add core instruction files
3. Add skill/workflow mappings
4. Apply symlink-first strategy where validated portable; fallback to copy strategy otherwise
5. Validate consistency with repo guardrails

### P2 Outputs

- `.codex/**`
- `outputs/P2_IMPLEMENTATION_REPORT.md`

### P2 Exit Checklist

- [ ] `.codex/` structure exists and is documented
- [ ] Required capabilities implemented or approved adaptation applied
- [ ] Symlink/copy decisions recorded with rationale and fallback notes
- [ ] No `.claude` regression introduced
- [ ] P3 handoff pair created

### P2 Failure Branch

If implementation violates constraints:

- Roll back specific conflicting change
- Log issue in decision log
- Re-implement with adaptation path

---

## 7. P3: Validation

### P3 Objective

Demonstrate operational parity through scenario-based verification.

### P3 Inputs

- `.codex/**`
- `outputs/P2_IMPLEMENTATION_REPORT.md`
- `RUBRICS.md`
- `handoffs/HANDOFF_P3.md`

### P3 Work Items

1. Execute critical scenario set (S1-S5)
2. Capture command-level evidence
3. Score outcomes using rubric worksheet
4. Identify residual gaps
5. Assign remediation actions

### P3 Outputs

- `outputs/P3_VALIDATION_REPORT.md`
- `outputs/parity-scorecard.md`

### P3 Exit Checklist

- [ ] All required scenarios executed
- [ ] Evidence is reproducible
- [ ] Overall score >= 90 and category gates met
- [ ] P4 handoff pair created

### P3 Failure Branch

If score < threshold:

- Open remediation subset in P4
- Mark failing scenarios as blockers
- Do not claim parity complete

---

## 8. P4: Hardening and Final Handoff

### P4 Objective

Resolve residual defects, tighten docs, and produce final execution package.

### P4 Inputs

- `outputs/P3_VALIDATION_REPORT.md`
- `outputs/parity-scorecard.md`
- `handoffs/HANDOFF_P4.md`

### P4 Work Items

1. Fix residual defects from validation
2. Improve instruction clarity and cross-links
3. Update reflection log with transferable learnings
4. Finalize completion status against README criteria
5. Publish final handoff pair for downstream maintenance

### P4 Outputs

- `outputs/P4_HARDENING.md`
- Updated `REFLECTION_LOG.md`
- Final handoff pair

### P4 Exit Checklist

- [ ] Required success criteria met
- [ ] Critical blockers resolved or explicitly deferred with owner/date
- [ ] Documentation internally consistent
- [ ] Final handoff is complete

---

## 9. Delegation Rules For Orchestrator Sessions

Orchestrator responsibilities:

- Coordinate work
- Maintain phase state
- Enforce entry/exit gates
- Keep context budget under control

Delegate when:

- Reading/analyzing >3 files in one task
- Producing specialized analysis artifacts
- Running parallel discovery tasks

Do not delegate when:

- Creating phase handoff documents
- Updating reflection log
- Synchronizing phase status in this spec package

---

## 10. Context Engineering Protocol

Each handoff file should include:

- Working Context (<=2,000 tokens)
- Episodic Context (<=1,000 tokens)
- Semantic Context (<=500 tokens)
- Procedural Context (links only)

Context placement guidance:

- Start: critical objectives and blockers
- Middle: supporting background
- End: actionable next steps

---

## 11. Evidence Requirements

For each phase output:

- Must include date/time
- Must include referenced file paths
- Must include decision rationale
- Must include open questions and owner

For validation outputs:

- Include command executed
- Include expected outcome
- Include observed outcome
- Include pass/fail status

---

## 12. Risk Register Template

Use this structure in phase outputs when risk appears.

```markdown
| Risk | Severity | Impact | Mitigation | Owner | Status |
|------|----------|--------|------------|-------|--------|
```

Severity levels:

- Critical
- High
- Medium
- Low

---

## 13. Decision Log Template

Use this structure in `outputs/parity-decision-log.md`.

```markdown
| Capability | Classification | Decision | Rationale | Risk | Follow-up |
|------------|----------------|----------|-----------|------|-----------|
```

Classification values:

- `direct-port`
- `adaptation`
- `unsupported`
- `defer`

---

## 14. Scenario Template For P3

```markdown
## Scenario S#

### Objective

### Preconditions

### Procedure
1.
2.
3.

### Evidence
- Command:
- Output summary:

### Result
- PASS/FAIL

### Notes
```

---

## 15. Completion Checklist

Use at end of P4.

- [ ] `README.md` required criteria all satisfied
- [ ] Rubric gates all passed
- [ ] Final score recorded
- [ ] Handoff package complete
- [ ] Reflection entries updated

---

## 16. Execution Cadence

Recommended cadence:

- One phase per session for P0/P1
- One or more sessions for P2 depending change volume
- Dedicated session for P3 validation
- Short final session for P4 hardening

---

## 17. Change Control

When scope changes:

1. Record change in current phase output
2. Update README scope section
3. Update handoff context for next phase
4. Re-evaluate rubric acceptance threshold if required

---

## 18. Communication Standard

Each phase output should answer:

- What was done
- Why it was done
- What remains
- What blocks progress

Avoid generic prose without operational detail.

---

## 19. Verification Commands

Use these as baseline commands:

```bash
# structure and file presence
find specs/codex-claude-parity -maxdepth 3 -type f | sort

# lint/check/test baseline (when implementation touches code)
bun run check
bun run lint
bun run test
```

If full run is skipped, record exact reason and what subset was run.

---

## 20. Appendix A: Phase Deliverable Matrix

| Phase | Deliverable | Type |
|------|--------------|------|
| P0 | `P0_BASELINE.md` | analysis |
| P0 | `parity-capability-matrix.md` | analysis |
| P1 | `P1_GAP_ANALYSIS.md` | analysis |
| P1 | `parity-decision-log.md` | decision record |
| P2 | `.codex/**` | implementation |
| P2 | `P2_IMPLEMENTATION_REPORT.md` | implementation report |
| P3 | `P3_VALIDATION_REPORT.md` | validation report |
| P3 | `parity-scorecard.md` | scoring artifact |
| P4 | `P4_HARDENING.md` | final hardening report |

---

## 21. Appendix B: Handoff File Matrix

| Transition | Required Files |
|------------|----------------|
| Start -> P0 | `HANDOFF_P0.md`, `P0_ORCHESTRATOR_PROMPT.md` |
| P0 -> P1 | `HANDOFF_P1.md`, `P1_ORCHESTRATOR_PROMPT.md` |
| P1 -> P2 | `HANDOFF_P2.md`, `P2_ORCHESTRATOR_PROMPT.md` |
| P2 -> P3 | `HANDOFF_P3.md`, `P3_ORCHESTRATOR_PROMPT.md` |
| P3 -> P4 | `HANDOFF_P4.md`, `P4_ORCHESTRATOR_PROMPT.md` |

---

## 22. Appendix C: Acceptance Gate

Parity is accepted only if:

- Required success criteria in README are all met
- Rubric minimum acceptance gates are met
- No unresolved critical blockers remain
- Final handoff package enables clean continuation
