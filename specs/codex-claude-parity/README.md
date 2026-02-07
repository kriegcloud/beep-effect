# codex-claude-parity

> Orchestrate project-level `.codex/` configuration to reach full operational parity with `.claude/` capabilities.

---

## Objective

Deliver a production-ready `.codex/` configuration in this repository that matches the practical capabilities currently provided by `.claude/`, without regressing existing Claude workflows.

---

## Why This Spec Exists

Current repo state is asymmetric:

- `.claude/` is mature and heavily customized
- `.codex/` is not present at the project root
- Existing agent guidance and skill orchestration assumes Claude-first paths

This creates migration risk and inconsistent behavior across AI tooling.

---

## Scope

This spec covers parity across five capability domains:

1. **Instruction Parity**
- Port and adapt high-value behavioral, coding, and repo workflow constraints from `.claude/` into `.codex/` equivalents.

2. **Skill Parity**
- Recreate or map required skills/workflows so Codex can execute the same classes of tasks (spec orchestration, code quality, docs maintenance, etc.).

3. **Command/Workflow Parity**
- Map recurring Claude command workflows to Codex-native usage patterns.

4. **Context & Discoverability Parity**
- Ensure Codex can discover the same project context quickly (guide links, conventions, phase playbooks, handoff protocols).

5. **Verification Parity**
- Define and run repeatable scenario-based checks proving Codex can perform the same core repository tasks safely.

---

## Design Strategy

Primary configuration migration strategy:

- **Symlink-first where portable** to reduce duplication and drift
- **Fallback copy strategy** where tooling/OS context does not reliably support symlinks

All symlink decisions must be documented in:

- `outputs/parity-decision-log.md`
- `outputs/P2_IMPLEMENTATION_REPORT.md`

---

## Non-Goals

- Replacing or deleting `.claude/` infrastructure
- Forcing byte-for-byte file parity across tools with incompatible formats
- Rewriting unrelated product code

---

## Baseline Facts (as of 2026-02-07)

- `.claude/agents/`: `29` files
- `.claude/skills/`: `60` entries
- `.claude/commands/`: `13` files
- `.claude/rules/`: `5` files
- `.claude/hooks/`: `10` entries
- `.codex/`: absent at repository root

These values must be re-measured in Phase 0 and recorded in outputs.

---

## Success Criteria

### Required

- [ ] `SC-1` `.codex/` directory and core structure exists, documented, and committed
- [ ] `SC-2` Capability parity matrix completed with no unresolved P0/P1 gaps for required workflows
- [ ] `SC-3` Codex-run scenario suite passes for all critical tasks (spec creation, code edit+verify, review workflow, handoff workflow)
- [ ] `SC-4` No regressions to existing `.claude/` behavior
- [ ] `SC-5` Handoff artifacts exist for each completed phase (`HANDOFF_P[N].md` + `P[N]_ORCHESTRATOR_PROMPT.md`)
- [ ] `SC-6` Symlink portability decision recorded with fallback behavior

### Desired

- [ ] `SD-1` >90% parity score in rubric category totals
- [ ] `SD-2` Zero manual "tribal knowledge" steps required to onboard a fresh Codex session

---

## Phase Plan

| Phase | Name | Goal | Primary Deliverables |
|------|------|------|----------------------|
| P0 | Discovery Baseline | Inventory `.claude/` capabilities and define parity dimensions | `outputs/P0_BASELINE.md`, `outputs/parity-capability-matrix.md` |
| P1 | Gap Analysis | Map `.claude` features to Codex equivalents and identify blockers | `outputs/P1_GAP_ANALYSIS.md`, `outputs/parity-decision-log.md` |
| P2 | Codex Config Implementation | Create and wire `.codex/` configuration, skills, and instruction docs | `.codex/**`, `outputs/P2_IMPLEMENTATION_REPORT.md` |
| P3 | Validation | Execute scenario-based parity verification | `outputs/P3_VALIDATION_REPORT.md`, `outputs/parity-scorecard.md` |
| P4 | Hardening & Handoff | Final polish, docs sync, and next-iteration plan | `outputs/P4_HARDENING.md`, final handoff pair |

---

## Required Outputs

- `outputs/P0_BASELINE.md`
- `outputs/parity-capability-matrix.md`
- `outputs/P1_GAP_ANALYSIS.md`
- `outputs/parity-decision-log.md`
- `outputs/P2_IMPLEMENTATION_REPORT.md`
- `outputs/P3_VALIDATION_REPORT.md`
- `outputs/parity-scorecard.md`
- `outputs/P4_HARDENING.md`

---

## Execution Rules For Orchestrator Sessions

- Prefer small, auditable diffs
- Record assumptions explicitly in phase outputs
- Never remove or rewrite `.claude/` assets unless spec scope is amended
- If capability cannot be matched 1:1, document adaptation and rationale in `outputs/parity-decision-log.md`
- End each phase with both required handoff files

---

## Entry Point

Start with:

- `handoffs/P0_ORCHESTRATOR_PROMPT.md`
- `handoffs/HANDOFF_P0.md`

Then follow:

- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `AGENT_PROMPTS.md`
