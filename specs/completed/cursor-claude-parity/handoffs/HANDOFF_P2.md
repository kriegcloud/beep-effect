# Handoff: Phase 2 - Cursor Config Implementation

> Context document for executing P2 of `cursor-claude-parity`. Populate Episodic when P1 completes.

---

## Working Context (<=2,000 tokens)


Primary objective:

- Implement/extend `.cursor/` configuration per P1 gap analysis and decision log.

P1 artifacts to consume:

- `specs/cursor-claude-parity/outputs/P1_GAP_ANALYSIS.md`
- `specs/cursor-claude-parity/outputs/parity-decision-log.md`

Immediate outputs:

- `.cursor/**` (updated/created)
- `specs/cursor-claude-parity/outputs/P2_IMPLEMENTATION_REPORT.md`

Blocking condition:

- Do not modify `.claude/` or `.codex/` source assets unless explicitly required.

---

## Episodic Context (<=1,000 tokens)

**P1 completed 2026-02-07.**

**Classification outcomes (required capabilities):**
- **direct-port (8):** All 5 instruction rules, spec orchestration, context discoverability (partial—need .cursor/README), verification (P3). sync-cursor-rules: no extension needed.
- **adaptation (7):** Structured skills (9 required of 37), spec lifecycle, done-feature, debug/explore/write-test, agent delegation, session handoff, safety permissions.

**Deferrals (optional):** Flat skill .md, modules/context, pattern library, hook orchestration, self-healing/skill-suggester.

**P2 readiness:**
1. Port 9 required skills to .cursor/skills/: domain-modeling, layer-design, schema-composition, error-handling, pattern-matching, service-implementation, spec-driven-development, effect-concurrency-testing, onboarding.
2. Create command/workflow skills: spec lifecycle, done-feature, debug/explore/write-test (1 or 3 skills).
3. Create .cursor/README.md with command index and pointers.
4. Update AGENTS.md with Cursor-specific entry points.
5. Do not modify .claude/ or .codex/.

---

## Semantic Context (<=500 tokens)

Stable rules:

- Sync-first for rules: extend `sync-cursor-rules` where applicable.
- Adaptation for skills: Cursor uses `SKILL.md` in named directories.
- Reference `.codex/` for workflow/pattern adaptations where format aligns.

---

## Procedural Context (links only)

- `specs/cursor-claude-parity/README.md`
- `specs/cursor-claude-parity/MASTER_ORCHESTRATION.md`
- `specs/cursor-claude-parity/outputs/P1_GAP_ANALYSIS.md`
- `specs/cursor-claude-parity/outputs/parity-decision-log.md`
- `tooling/cli/src/commands/sync-cursor-rules.ts`

---

## Exit Criteria

- [ ] `.cursor/` meets parity targets per decision log
- [ ] P2 implementation report documents all adaptations
- [ ] P3 handoff pair created
