# Handoff: Phase 3 - Validation

> Context document for executing P3 of `cursor-claude-parity`. Populate Episodic when P2 completes.

---

## Working Context (<=2,000 tokens)

Primary objective:

- Execute scenario-based parity verification for `.cursor/` configuration.
- Produce `outputs/P3_VALIDATION_REPORT.md` and `outputs/parity-scorecard.md`.

P2 artifacts to consume:

- `specs/cursor-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`
- `.cursor/README.md`
- `.cursor/skills/` (12 skills: 9 required + 3 workflow + 2 existing)

Blocking condition:

- Do not modify `.claude/` or `.codex/` source assets unless explicitly required.

---

## Episodic Context (<=1,000 tokens)

**P2 completed 2026-02-07.**

**P2 deliverables:**
- 9 required skills ported to `.cursor/skills/` (domain-modeling, layer-design, schema-composition, error-handling, pattern-matching, service-implementation, spec-driven-development, effect-concurrency-testing, onboarding).
- 3 workflow skills: Spec Lifecycle, Done Feature, Task Execution (replacing /new-spec, handoff, /done-feature, /debug, /explore, /write-test).
- `.cursor/README.md` with entry points, rules sync, skill list, command/workflow index.
- AGENTS.md updated with Cursor entry points and agent-tier → skill mapping.

**Validation focus:** Run scenario suite (spec creation, code edit+verify, review workflow, handoff workflow); record evidence; produce parity scorecard per RUBRICS.

---

## Semantic Context (<=500 tokens)

Stable rules:

- Verification is scenario-based; evidence in P3_VALIDATION_REPORT.
- Parity scorecard follows specs/cursor-claude-parity RUBRICS.
- No P2 rollback unless spec scope changes.

---

## Procedural Context (links only)

- `specs/cursor-claude-parity/README.md`
- `specs/cursor-claude-parity/MASTER_ORCHESTRATION.md`
- `specs/cursor-claude-parity/RUBRICS.md`
- `specs/cursor-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`
- `specs/cursor-claude-parity/outputs/parity-decision-log.md`

---

## Exit Criteria

- [ ] Scenario suite executed; results in P3_VALIDATION_REPORT.md
- [ ] parity-scorecard.md produced
- [ ] P4 handoff pair created
