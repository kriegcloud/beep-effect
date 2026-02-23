# Quick Start: AI-Friendliness 10/10

5-minute triage for the ai-friendliness-10-of-10 spec.

---

## At a Glance

| Field | Value |
|-------|-------|
| **Goal** | 8.5/10 → 10/10 AI-friendliness |
| **Core Gaps** | 0% ai-context.md coverage, no error catalog, no onboarding |
| **Phases** | 6 (Discovery → ai-context → Errors → Onboarding → Self-Healing → Validation) |
| **Sessions** | 8-11 estimated |
| **Status** | P0 Ready |

---

## The Problem

```
Current: 8.5/10
├── ✅ Excellent: CLAUDE.md, rules, agents, skills
├── ⚠️ Gap: 0% ai-context.md coverage (62+ packages)
├── ⚠️ Gap: No error pattern catalog
├── ⚠️ Gap: No onboarding for new agents
└── ⚠️ Gap: Abstract rules lack worked examples

Target: 10/10
```

---

## Start Phase 0 (Discovery)

```bash
# Copy-paste this to start
cat specs/ai-friendliness-10-of-10/handoffs/P0_ORCHESTRATOR_PROMPT.md
```

**P0 Deliverables** (5 files):
1. `outputs/packages-inventory.md` - 62+ packages with ai-context status
2. `outputs/agents-md-quality.md` - Quality scores for 66 AGENTS.md files
3. `outputs/error-patterns.md` - 20+ error patterns from reflection logs
4. `outputs/rules-without-examples.md` - Abstract rules needing examples
5. `outputs/onboarding-gaps.md` - Friction points for new agents

---

## Phase Exit Criteria

| Phase | Done When |
|-------|-----------|
| P0 | 5 output files exist, REFLECTION_LOG updated |
| P1 | 62+ ai-context.md files, `/modules` returns 100% |
| P2 | 50+ error catalog entries, CLAUDE.md table added |
| P3 | Onboarding docs + `/onboarding` skill functional |
| P4 | 2 hooks registered, safe errors auto-fixable |
| P5 | Ambiguity audit ≥95%, final score 10/10 |

---

## Key Files

| Need | File |
|------|------|
| Full context | `README.md` |
| Detailed workflow | `MASTER_ORCHESTRATION.md` |
| Phase 0 context | `handoffs/HANDOFF_P0.md` |
| Quality criteria | `RUBRICS.md` |
| Templates | `templates/` |

---

## Verification Commands

```bash
# Check ai-context.md coverage
find packages apps tooling -name "ai-context.md" | wc -l
# Target: 62+

# Test module discovery
bun run .claude/scripts/context-crawler.ts -- --mode=list

# Count error catalog entries (after P2)
grep -c "^  - id:" .claude/errors/catalog.yaml
# Target: 50+

# Test onboarding skill (after P3)
/onboarding
```

---

## Agent Allocation

| Phase | Primary Agent | Task |
|-------|---------------|------|
| P0 | `codebase-researcher` | Discovery & baseline |
| P1 | `documentation-expert` | ai-context.md generation |
| P2 | `effect-expert` | Error catalog creation |
| P3 | `skill-creator` | Onboarding system |
| P4 | `effect-expert` | Self-healing hooks |
| P5 | `code-reviewer` | Validation & examples |

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| ai-context.md coverage | 0% | 100% |
| Error patterns documented | 0 | 50+ |
| New agent success rate | Unknown | 95%+ |
| Auto-fix coverage | 0% | 80%+ |
| Rules with examples | ~50% | 100% |
