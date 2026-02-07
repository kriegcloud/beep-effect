# cursor-claude-parity

> Orchestrate project-level `.cursor/` configuration to reach full operational parity with `.claude/` and `.codex/` capabilities.

---

## Objective

Deliver a production-ready `.cursor/` configuration in this repository that matches the practical capabilities currently provided by `.claude/` (and achieved in `.codex/` via `specs/codex-claude-parity`), without regressing existing Cursor or Claude workflows.

---

## Why This Spec Exists

Current repo state is asymmetric:

- `.claude/` is mature and heavily customized
- `.codex/` has reached parity via `specs/codex-claude-parity`
- `.cursor/` has partial coverage: rules are synced via `sync-cursor-rules`, but skills, workflows, context, and discoverability lag significantly

This creates inconsistent behavior across AI tooling when developers use Cursor IDE vs Claude Code vs Codex.

---

## Scope

This spec covers parity across five capability domains:

1. **Instruction Parity**
   - Ensure `.cursor/rules/` delivers equivalent guardrails to `.claude/rules/` and `.codex/rules/`. Validate and extend `sync-cursor-rules` as needed.

2. **Skill Parity**
   - Map `.claude/skills/` and `.codex/skills/` to Cursor-native skill format. Cursor skills use `SKILL.md` in named directories; replicate or adapt high-value skills.

3. **Command/Workflow Parity**
   - Map recurring command/workflow patterns to Cursor mechanisms (rules, skills, or documented procedures). Reference `.claude/commands/` and `.codex/workflows/`.

4. **Context & Discoverability Parity**
   - Ensure Cursor sessions can discover project context (AGENTS.md, specs, documentation) as effectively as Claude/Codex. Consider `.cursor/`-specific index or pointers.

5. **Verification Parity**
   - Define and run repeatable scenario-based checks proving Cursor can perform the same core repository tasks safely.

---

## Design Strategy

Primary configuration strategy:

- **Sync-first where tooling exists**: Use and extend `bun run repo-cli sync-cursor-rules` for rules
- **Adaptation where formats differ**: Cursor uses `.mdc` for rules, `SKILL.md` in directories for skills; map content accordingly
- **Reference .codex where applicable**: Since `.codex/` achieved parity, reuse `.codex/` artifacts as intermediate reference where Cursor and Codex share format similarities

All decisions must be documented in:

- `outputs/parity-decision-log.md`
- `outputs/P2_IMPLEMENTATION_REPORT.md`

---

## Non-Goals

- Replacing or deleting `.claude/` or `.codex/` infrastructure
- Forcing byte-for-byte file parity across tools with incompatible formats
- Rewriting unrelated product code

---

## Baseline Facts (as of 2026-02-07)

- `.claude/rules/`: `5` files
- `.claude/skills/`: `60` entries (37 structured SKILL.md)
- `.claude/commands/`: `13` files
- `.codex/rules/`: `3` files (symlinked/copied from .claude)
- `.codex/skills/`: directory-based skills + index (see `.codex/skills/README.md` for the required `SKILL.md` format)
- `.codex/workflows/`: `8` workflow files
- `.cursor/rules/`: `5` files (`.mdc` format, synced from .claude)
- `.cursor/skills/`: `2` skills only

These values must be re-measured in Phase 0 and recorded in outputs.

---

## Success Criteria

Evidence and status as of P4: `outputs/P4_HARDENING.md`.

### Required

- [x] `SC-1` `.cursor/` configuration documented and meets parity targets for required workflows
- [x] `SC-2` Capability parity matrix completed with no unresolved P0/P1 gaps for required workflows
- [x] `SC-3` Cursor-run scenario suite passes for all critical tasks (spec creation, code edit+verify, review workflow, handoff workflow)
- [x] `SC-4` No regressions to existing `.claude/` or `.codex/` behavior
- [x] `SC-5` Handoff artifacts exist for each completed phase (`HANDOFF_P[N].md` + `P[N]_ORCHESTRATOR_PROMPT.md`)

### Desired

- [x] `SD-1` >90% parity score in rubric category totals
- [x] `SD-2` Zero manual "tribal knowledge" steps required to onboard a fresh Cursor session

---

## Phase Plan

| Phase | Name | Goal | Primary Deliverables |
|-------|------|------|----------------------|
| P0 | Discovery Baseline | Inventory `.cursor/`, `.claude/`, `.codex/` and define parity dimensions | `outputs/P0_BASELINE.md`, `outputs/parity-capability-matrix.md` |
| P1 | Gap Analysis | Map capabilities to Cursor equivalents and identify blockers | `outputs/P1_GAP_ANALYSIS.md`, `outputs/parity-decision-log.md` |
| P2 | Cursor Config Implementation | Create/extend `.cursor/` configuration, skills, and instruction docs | `.cursor/**`, `outputs/P2_IMPLEMENTATION_REPORT.md` |
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

## Testing / Verification

To confirm parity tooling and structure still work:

**Smoke test (from repo root):**

```bash
bash specs/cursor-claude-parity/verify.sh
```

This runs:

1. **Rules sync (S5)** — `bun run repo-cli sync-cursor-rules` (must succeed).
2. **.cursor structure** — Asserts at least 5 `.mdc` rules in `.cursor/rules` and `.cursor/README.md` exists.
3. **Edit→verify (S2)** — `bun run check --filter=@beep/testkit` (must succeed; avoids known knowledge-server failures).

**Full scenario evidence:** Re-run the procedures and commands in `outputs/P3_VALIDATION_REPORT.md` (Evidence sections) for complete validation.

---

## Execution Rules For Orchestrator Sessions

- Prefer small, auditable diffs
- Record assumptions explicitly in phase outputs
- Never remove or rewrite `.claude/` or `.codex/` assets unless spec scope is amended
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
