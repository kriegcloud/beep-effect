# Phase 0 Handoff: Bootstrap - Agent Configuration Self-Review

**Date**: 2026-01-18
**From**: Spec Creation
**To**: Phase 0 (Bootstrap)
**Status**: Ready for implementation

---

## Objective

Optimize the four key agents that will perform downstream improvements. This solves the "bootstrap problem" - improving the improvement tools first.

---

## Target Files

| File | Lines | Purpose |
|------|-------|---------|
| `.claude/agents/agents-md-updater.md` | ~180 | AGENTS.md maintenance |
| `.claude/agents/readme-updater.md` | ~770 | README.md maintenance |
| `.claude/agents/ai-trends-researcher.md` | ~430 | Trend research |
| `.claude/agents/codebase-researcher.md` | ~450 | Codebase exploration |

**Total current lines**: ~1,830
**Target reduction**: 20%+ (~370 lines)

---

## Sub-Agent Tasks

### Task 0.1: Research Best Practices

**Agent**: `ai-trends-researcher`

**Prompt**:
```
Research the latest best practices for Claude Code agent prompting and configuration.

Focus areas:
1. Agent prompt structure and length optimization
2. Effective use of examples vs rules
3. Decision trees vs prose instructions
4. Context efficiency patterns

Output: specs/agent-config-optimization/outputs/agent-best-practices.md

Include:
- Source citations with credibility ratings
- Specific recommendations for beep-effect agents
- Before/after examples of prompt optimization
```

**Expected Output**: Research report with 3+ credible sources

### Task 0.2: Audit Current Agents

**Agent**: `codebase-researcher`

**Prompt**:
```
Audit the four key agent files for optimization opportunities:

Target files:
- .claude/agents/agents-md-updater.md
- .claude/agents/readme-updater.md
- .claude/agents/ai-trends-researcher.md
- .claude/agents/codebase-researcher.md

For each file, identify:
1. Redundant sections (repeated content)
2. Overly verbose explanations
3. Missing cross-references
4. Outdated patterns or references
5. Template sections that could be shared

Output: specs/agent-config-optimization/outputs/agent-config-audit.md
```

**Expected Output**: Per-file audit with specific line references

### Task 0.3: Apply Improvements

**Agent**: Manual implementation

Based on 0.1 and 0.2 outputs:
1. Remove redundant content
2. Add decision trees where prose is unclear
3. Extract shared templates to `.claude/agents/templates/`
4. Add cross-references between related agents
5. Reduce line count by 20%+

---

## Known Patterns in Target Files

### agents-md-updater.md (180 lines)

- Has decision tree (good)
- Has validation checklist (good)
- Could share template structure with readme-updater

### readme-updater.md (770 lines)

- Significantly bloated
- Contains full package list that may be extractable
- Many anti-pattern examples could be consolidated
- Decision tree is good but verbose

### ai-trends-researcher.md (430 lines)

- Embedded knowledge base is valuable
- Query patterns could be more concise
- Example workflows may be redundant with templates

### codebase-researcher.md (450 lines)

- Grep/glob pattern libraries are useful references
- Architecture reference duplicates CLAUDE.md
- Example explorations may be overly detailed

---

## Optimization Strategies

### Strategy 1: Extract Shared Templates

Content appearing in multiple agents:
- Effect pattern compliance checks
- Verification checklists
- Error recovery patterns

**Action**: Create `.claude/agents/templates/shared-patterns.md`

### Strategy 2: Reference Instead of Repeat

Architecture information repeated across agents:
- Layer dependency order
- Package structure
- Import rules

**Action**: Reference CLAUDE.md or rules files instead of duplicating

### Strategy 3: Compress Examples

Many agents have lengthy example sections:
- Before/after comparisons
- Multi-step workflows

**Action**: Keep 1-2 key examples, remove redundant ones

### Strategy 4: Add Decision Trees

Replace verbose prose with decision trees:
- When to use which tool
- Error handling choices
- Output format selection

**Action**: Convert prose to `├── Yes → ...` format

---

## Verification Steps

After implementing changes:

```bash
# Verify line count reduction
wc -l .claude/agents/agents-md-updater.md
wc -l .claude/agents/readme-updater.md
wc -l .claude/agents/ai-trends-researcher.md
wc -l .claude/agents/codebase-researcher.md

# Verify no syntax errors
bun run lint --filter @beep/cli

# Test agent still works (manual)
# Launch each agent and verify it can complete a simple task
```

---

## Success Criteria

- [ ] `outputs/agent-best-practices.md` generated with 3+ sources
- [ ] `outputs/agent-config-audit.md` generated for all 4 files
- [ ] Total line count reduced by 20%+ (from ~1,830 to ~1,460)
- [ ] No functionality removed
- [ ] All agents still pass lint
- [ ] Shared templates extracted if applicable
- [ ] Cross-references added between related agents
- [ ] `REFLECTION_LOG.md` updated with learnings
- [ ] `HANDOFF_P1.md` created
- [ ] `P1_ORCHESTRATOR_PROMPT.md` created

---

## Next Phase

After Phase 0 completion, proceed to Phase 1: Inventory.

Phase 1 will launch parallel sub-agents to create an exhaustive inventory of all agent-related documentation.

---

## Related Documentation

- [README.md](../README.md) - Spec overview
- [MASTER_ORCHESTRATION.md](../MASTER_ORCHESTRATION.md) - Full workflow
- [RUBRICS.md](../RUBRICS.md) - Quality scoring
