# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing Phase 0 (Inventory & Baseline) of the `agent-infrastructure-rationalization` spec.

### Context

This spec audits and optimizes the agent infrastructure across `.claude/`, `.agents/`, `.cursor/`, `.windsurf/`, `.codex/`, and `.opencode/` directories. P0 establishes baseline metrics before optimization.

**Key Finding from Prior Analysis**: The repository has 30 agents, 36+ skills, and 4 hook systems. Skills are duplicated across 4 directories with inconsistent counts (36 vs 9 vs 11). Token budget violations affected 60% of prior specs.

### Your Mission

Execute 3 parallel inventory tasks:

1. **Agent Inventory**: Catalog all 30 agents in `.claude/agents/` with metadata
2. **Skill Inventory**: Map skills across all directories, identify duplications
3. **Hook Analysis**: Document hook behavior and token injection

### Critical Patterns

**DO use Glob/Grep tools** (10x faster than Bash):
```
Glob(".claude/agents/*.md")           # List all agents
Glob(".claude/skills/*/SKILL.md")     # Find skill definitions
Grep("SessionStart", path=".claude")  # Find hook triggers
```

**DO launch parallel agents**:
- Explore agent 1: Agent inventory
- Explore agent 2: Skill inventory
- Explore agent 3: Hook analysis

**DON'T use Bash for discovery** - Use Glob/Grep instead
**DON'T exceed 5 parallel agents** - 3 is optimal for this scope

### Reference Files

- `specs/agent-infrastructure-rationalization/README.md` - Spec overview
- `specs/agent-infrastructure-rationalization/handoffs/HANDOFF_P0.md` - Full P0 context
- `.claude/agents-manifest.yaml` - Agent registry
- `.claude/settings.json` - Hook configuration

### Verification

After each agent completes:
```bash
# Verify agent count
ls -1 .claude/agents/*.md | wc -l  # Should be ~30

# Verify skill locations exist
ls -d .claude/skills .agents/skills .cursor/skills .windsurf/skills 2>/dev/null
```

### Deliverables

Create these files in `specs/agent-infrastructure-rationalization/outputs/`:
- `P0_BASELINE.md` - Summary metrics
- `agent-catalog.md` - Full agent inventory
- `skill-duplication-matrix.md` - Cross-directory mapping
- `hook-analysis.md` - Hook flow and token costs

### Success Criteria

- [ ] All 30 agents cataloged with tier, capability, triggers
- [ ] Skills mapped across all 4+ directories
- [ ] Hook flow documented with token estimates
- [ ] Baseline metrics recorded

### Handoff Document

Read full context in: `specs/agent-infrastructure-rationalization/handoffs/HANDOFF_P0.md`

---

After completing P0:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P1.md` and `handoffs/P1_ORCHESTRATOR_PROMPT.md`
