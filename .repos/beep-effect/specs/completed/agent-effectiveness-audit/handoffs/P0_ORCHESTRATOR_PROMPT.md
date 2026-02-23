# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing Phase 0 (Baseline Measurement) of the `agent-effectiveness-audit` spec.

### Context

This spec follows the completed `agent-infrastructure-rationalization` spec. We need to establish baseline metrics BEFORE making any optimizations.

**Key Finding from Predecessor**: Per-prompt token count is ~5,500 (40% above 4K target) but was NOT reduced during rationalization. This spec will fix that, but first we measure.

### Your Mission

Deploy 3 parallel Explore agents to inventory:

1. **Token Audit**: Analyze `.claude/hooks/` and measure per-prompt token costs
2. **Agent Triggers**: Catalog trigger patterns for all 27 agents
3. **Skill Inventory**: Full inventory of 53 skills with metadata

### Critical Patterns

**Parallel Inventory Pattern** (score 85 from predecessor):
- Deploy 3 agents simultaneously for disjoint tasks
- Each agent writes to separate output file
- Synthesize results after all complete

**Manifest Drift Detection** (score 80):
- Cross-reference filesystem state with `.claude/agents-manifest.yaml`
- Report any mismatches

### Agent 1 Task

```
Explore agent task: Token audit

Analyze `.claude/hooks/` to understand per-prompt token costs.

1. Read all hook files in `.claude/hooks/`
2. Trace what content is loaded per prompt:
   - Session context generation
   - Skills list
   - Rules content
   - Agent suggestions
3. Estimate token count per component
4. Write findings to `specs/agent-effectiveness-audit/outputs/token-breakdown.md`

Format output as markdown table with columns:
| Component | Source Files | Estimated Tokens | Notes |
```

### Agent 2 Task

```
Explore agent task: Agent trigger matrix

Catalog trigger patterns for all agents.

1. Read `.claude/agents-manifest.yaml`
2. Read all `.claude/agents/*.md` files
3. Extract trigger patterns (what causes each agent to be suggested)
4. Identify potential confusion points (similar triggers)
5. Write to `specs/agent-effectiveness-audit/outputs/agent-trigger-matrix.md`

Format output as markdown table with columns:
| Agent | Primary Trigger | Secondary Triggers | Confusion Risk |
```

### Agent 3 Task

```
Explore agent task: Skill inventory

Full inventory of all skills.

1. List all directories in `.claude/skills/`
2. For each skill, read SKILL.md and extract:
   - Name
   - Trigger patterns
   - Description summary
3. Note last modified dates
4. Identify naming inconsistencies
5. Write to `specs/agent-effectiveness-audit/outputs/skill-catalog.md`

Format output as markdown table with columns:
| Skill Name | Path | Triggers | Last Modified | Notes |
```

### Verification

After all agents complete:

```bash
# Verify outputs exist
ls specs/agent-effectiveness-audit/outputs/

# Quick metrics
echo "Skills: $(ls -d .claude/skills/*/ 2>/dev/null | wc -l)"
echo "Agents: $(ls .claude/agents/*.md | wc -l)"
```

### Success Criteria

- [ ] `outputs/token-breakdown.md` created
- [ ] `outputs/agent-trigger-matrix.md` created
- [ ] `outputs/skill-catalog.md` created
- [ ] `outputs/P0_BASELINE.md` created (synthesize all findings)
- [ ] REFLECTION_LOG.md updated with P0 entry
- [ ] `handoffs/HANDOFF_P1.md` created
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/agent-effectiveness-audit/handoffs/HANDOFF_P0.md`
