# Handoff: Phase 0 - Baseline Measurement

> Context for establishing comprehensive baseline metrics for agent effectiveness audit.

---

## Context

This is Phase 0 of the `agent-effectiveness-audit` spec, which follows the completed `agent-infrastructure-rationalization` spec. The goal is to measure the current state before making any changes.

**Predecessor Findings Applied**:
- Parallel Inventory Pattern (score 85): Use 3 parallel Explore agents
- Discoverability-First Infrastructure (score 85): Measure before optimizing

---

## Mission

Establish precise baseline metrics for:
1. Per-prompt token count (current: ~5,500, target: ≤4,000)
2. Agent trigger patterns (27 agents in manifest)
3. Skill inventory (53 skills reported, need exact count and metadata)
4. Context file freshness (new from agent-context-optimization)

---

## Parallel Agent Tasks

### Agent 1: Token Audit

**Target**: Analyze `.claude/hooks/` to measure per-prompt token costs.

**Tasks**:
1. Read `.claude/hooks/startup.ts` and related files
2. Identify what content is loaded per prompt
3. Calculate token cost per component:
   - Session context (file structure, git status)
   - Skills list
   - Rules content
   - Agent suggestions
4. Document in `outputs/token-breakdown.md`

**Key Files**:
- `.claude/hooks/`
- `.claude/scripts/session-context.ts`

### Agent 2: Agent Triggers

**Target**: Catalog trigger patterns for all 27 agents.

**Tasks**:
1. Read `.claude/agents-manifest.yaml`
2. Cross-reference with `.claude/agents/*.md` definitions
3. Extract trigger patterns (when each agent is suggested)
4. Identify overlap/confusion potential
5. Document in `outputs/agent-trigger-matrix.md`

**Key Files**:
- `.claude/agents-manifest.yaml`
- `.claude/agents/*.md`

### Agent 3: Skill Inventory

**Target**: Full inventory of all skills with metadata.

**Tasks**:
1. List all `.claude/skills/` directories
2. For each skill:
   - Name and path
   - Trigger patterns (from SKILL.md)
   - Last modified date
   - File count and size
3. Identify naming inconsistencies
4. Document in `outputs/skill-catalog.md`

**Key Files**:
- `.claude/skills/*/SKILL.md`
- `.claude/skills/*/`

---

## Verification Commands

After agent tasks complete:

```bash
# Verify skill count
ls -d .claude/skills/*/ | wc -l

# Verify agent count
ls .claude/agents/*.md | wc -l

# Check manifest entries
grep -E "^  [a-z]" .claude/agents-manifest.yaml | wc -l

# Check context file dates
find context/ -name "*.md" -exec stat --format="%n %y" {} \; 2>/dev/null | head -20
```

---

## Success Criteria

- [ ] `outputs/P0_BASELINE.md` created with all metrics
- [ ] `outputs/token-breakdown.md` with per-component costs
- [ ] `outputs/agent-trigger-matrix.md` with trigger patterns
- [ ] `outputs/skill-catalog.md` with full skill inventory
- [ ] REFLECTION_LOG.md updated with P0 entry

---

## Token Budget

This handoff: ~600 tokens (15% of 4K budget)

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/agent-infrastructure-rationalization/REFLECTION_LOG.md` | Patterns to apply |
| `.claude/agents-manifest.yaml` | Agent registry |
| `.claude/hooks/` | Token source analysis |
| `context/INDEX.md` | Context file index |
