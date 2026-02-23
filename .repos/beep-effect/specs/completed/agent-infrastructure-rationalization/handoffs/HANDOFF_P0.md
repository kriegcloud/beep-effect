# Handoff: Phase 0 - Inventory & Baseline

> Context document for P0 execution. Read alongside `P0_ORCHESTRATOR_PROMPT.md`.

---

## Phase Objective

Establish precise baseline metrics for all agent infrastructure components before optimization.

---

## Current Infrastructure Map

### Primary Locations

| Location | Content | Approx Size |
|----------|---------|-------------|
| `.claude/agents/` | 30 agent definition files | ~312KB |
| `.claude/skills/` | 36 skill directories | ~100KB (excl. node_modules) |
| `.claude/rules/` | 3 rule files | ~27KB |
| `.claude/hooks/` | 4 hook systems | ~50KB |
| `.claude/commands/` | 13 command files | ~20KB |
| `.claude/patterns/` | 78 pattern files | ~100KB |
| `.claude/agents-manifest.yaml` | Machine-readable registry | ~18KB |
| `.claude/CLAUDE.md` | Guidelines | ~3KB |
| `CLAUDE.md` (root) | Project instructions | ~8KB |

### Secondary Locations

| Location | Content | Status |
|----------|---------|--------|
| `.agents/skills/` | 9 skill directories | Curated subset |
| `.cursor/rules/` | 3 MDC files | Synced from .claude |
| `.cursor/skills/` | 11 items | Partial mirror |
| `.windsurf/rules/` | Symlink | Points to .claude/rules |
| `.windsurf/skills/` | 11 items | Partial mirror |
| `.codex/skills/` | Empty | Unused |
| `.opencode/skills/` | Empty | Unused |

---

## P0 Tasks

### Task 1: Agent Inventory

**Agent**: Explore (parallel instance 1)

**Scope**: `.claude/agents/*.md`

**Collect for each agent**:
- File name and path
- Line count (proxy for token cost)
- Tier (from agents-manifest.yaml)
- Capability (read-only / write-reports / write-files)
- Triggers (from manifest or file)
- Tool access
- Usage frequency (if determinable from specs)

**Output Format**:
```markdown
| Agent | Lines | Tier | Capability | Tools | Triggers |
|-------|-------|------|------------|-------|----------|
```

### Task 2: Skill Inventory

**Agent**: Explore (parallel instance 2)

**Scope**:
- `.claude/skills/`
- `.agents/skills/`
- `.cursor/skills/`
- `.windsurf/skills/`

**Collect**:
- Skill name and location(s)
- Size (file count, line count)
- Duplication status (exists in multiple locations?)
- Primary content type (markdown, code, both)

**Output Format**:
```markdown
| Skill | .claude | .agents | .cursor | .windsurf | Notes |
|-------|---------|---------|---------|-----------|-------|
```

### Task 3: Hook Analysis

**Agent**: Explore (parallel instance 3)

**Scope**: `.claude/hooks/`

**Collect**:
- Hook trigger type (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse)
- Files loaded/executed
- Approximate token injection
- Dependencies

**Key Files**:
- `.claude/settings.json` - Hook configuration
- `.claude/hooks/agent-init/` - SessionStart hook
- `.claude/hooks/skill-suggester/` - UserPromptSubmit hook
- `.claude/hooks/subagent-init/` - PreToolUse (Task) hook
- `.claude/hooks/pattern-detector/` - PreToolUse/PostToolUse (Bash/Edit/Write)

---

## Verification Commands

```bash
# Count agents
ls -1 .claude/agents/*.md | wc -l
# Expected: ~30

# Count skills per location
ls -1d .claude/skills/*/ | wc -l
ls -1d .agents/skills/*/ 2>/dev/null | wc -l
ls -1d .cursor/skills/*/ 2>/dev/null | wc -l

# Measure agent manifest
wc -l .claude/agents-manifest.yaml

# Check hook settings
cat .claude/settings.json | grep -A 20 "hooks"
```

---

## Success Criteria (P0)

- [ ] Agent catalog complete (30 agents documented)
- [ ] Skill duplication matrix complete (all 4+ locations mapped)
- [ ] Hook flow documented (4 hook systems analyzed)
- [ ] Baseline metrics recorded in `outputs/P0_BASELINE.md`
- [ ] Token cost estimates for each major component

---

## Known Information

### From Prior Exploration

- `.claude/` directory is 173MB total (mostly node_modules)
- 30 agent definitions in `.claude/agents/`
- 36 skills in `.claude/skills/` vs 9 in `.agents/skills/`
- Skills duplicated across 4 directories with inconsistent counts
- `.codex/` and `.opencode/` are empty placeholders

### From Reflection Synthesis

- 92% of specs use Explore agent for discovery
- Agent type confusion affects 58% of specs
- Discovery with Glob/Grep is 10x faster than Bash

---

## Anti-Patterns to Avoid

1. **Don't use Bash for file discovery** - Use Glob/Grep tools instead
2. **Don't read files sequentially** - Launch parallel Explore agents
3. **Don't exceed 5 parallel agents** - 3 is optimal for P0 scope
4. **Don't include inline code in outputs** - Reference file paths instead

---

## Next Phase Preview

P1 will analyze the P0 outputs to identify:
- Agent capability overlaps
- Skill duplication patterns
- Configuration conflicts
- Consolidation opportunities

P1 uses: reflector, code-reviewer, Explore
