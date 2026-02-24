# Master Orchestration: Agent Configuration Optimization

## Overview

This document provides the complete orchestration workflow for optimizing agent-related documentation in the beep-effect monorepo. Follow phases sequentially, using parallel sub-agents where indicated.

---

## Pre-Flight Checks

Before starting any phase:

```bash
# Verify repository state
git status

# NOTE: Non-clean worktrees are OK in this repo (parallel agents may be active).
# Only require a clean worktree for git operations that strictly need it.
# If you do need a clean state for a specific command, coordinate with the user before stashing/cleaning.

# Verify agents are accessible
ls .claude/agents/*.md | wc -l  # Should show 20+ files
```

---

## Phase 0: Bootstrap - Agent Configuration Self-Review

### Objective

Improve the four key agents that will perform downstream improvements. This solves the "bootstrap problem" - the tools must be good before they can make other things good.

### Duration

1-2 hours (sequential execution)

### Target Files

| File | Purpose | Current Size |
|------|---------|--------------|
| `.claude/agents/agents-md-updater.md` | AGENTS.md maintenance | ~180 lines |
| `.claude/agents/readme-updater.md` | README.md maintenance | ~770 lines |
| `.claude/agents/ai-trends-researcher.md` | Trend research | ~430 lines |
| `.claude/agents/codebase-researcher.md` | Codebase exploration | ~450 lines |

### Sub-Agent Tasks

#### Task 0.1: Research Best Practices (ai-trends-researcher)

```markdown
Launch ai-trends-researcher agent with prompt:

"Research the latest best practices for Claude Code agent prompting and configuration.

Focus areas:
1. Agent prompt structure and length optimization
2. Effective use of examples vs rules
3. Decision trees vs prose instructions
4. Context efficiency patterns

Output: specs/agent-config-optimization/outputs/agent-best-practices.md

Include:
- Source citations with credibility ratings
- Specific recommendations for beep-effect agents
- Before/after examples of prompt optimization"
```

#### Task 0.2: Audit Current Agents (codebase-researcher)

```markdown
Launch codebase-researcher agent with prompt:

"Audit the four key agent files for optimization opportunities:

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

Output: specs/agent-config-optimization/outputs/agent-config-audit.md"
```

#### Task 0.3: Apply Bootstrap Improvements

Based on outputs from 0.1 and 0.2, manually apply improvements to the four target agents.

**Improvement Priorities**:
1. Remove redundant content
2. Add decision trees where prose is unclear
3. Extract shared templates to `.claude/agents/templates/`
4. Add cross-references between related agents
5. Reduce line count by 20%+

### Phase 0 Outputs

| Output | Purpose |
|--------|---------|
| `outputs/agent-best-practices.md` | Research findings |
| `outputs/agent-config-audit.md` | Current state assessment |
| `outputs/bootstrap-changes.md` | List of changes made |

### Phase 0 Success Criteria

- [ ] Research report generated with 3+ credible sources
- [ ] All four agents audited for optimization opportunities
- [ ] At least 20% reduction in target agent line counts
- [ ] No functionality removed
- [ ] `REFLECTION_LOG.md` updated with learnings

### Phase 0 Verification

```bash
# Check line counts reduced
wc -l .claude/agents/agents-md-updater.md
wc -l .claude/agents/readme-updater.md

# Verify no syntax errors
bun run lint --filter @beep/cli
```

---

## Phase 1: Inventory - Exhaustive Documentation Audit

### Objective

Create a complete inventory of all agent-related documentation across the monorepo.

### Duration

1-2 hours (parallel execution)

### Sub-Agent Tasks (PARALLEL)

Launch these three agents simultaneously for efficiency:

#### Task 1.1: Inventory .claude/ Directory (codebase-researcher)

```markdown
Launch codebase-researcher agent with prompt:

"Create an exhaustive inventory of the .claude/ directory structure.

For each file, capture:
1. File path and size (lines)
2. Primary purpose
3. Last modified date (from git)
4. Cross-references to other files
5. Stale references (references to non-existent files)

Categories to inventory:
- .claude/agents/*.md
- .claude/rules/*.md
- .claude/commands/*.md
- .claude/skills/**/*.md
- .claude/templates/*.md
- .claude/handoffs/*.md

Output: specs/agent-config-optimization/outputs/inventory-claude-config.md

Format as a table with columns: File | Lines | Purpose | Cross-Refs | Issues"
```

#### Task 1.2: Audit AGENTS.md Files (agents-md-updater)

```markdown
Launch agents-md-updater agent with prompt:

"Perform a complete audit of all AGENTS.md files in the repository.

Audit scope:
- All packages/**/AGENTS.md
- All apps/**/AGENTS.md
- All tooling/**/AGENTS.md
- Root AGENTS.md

For each file, check:
1. Stale @beep/* package references
2. MCP tool shortcuts (should be removed)
3. Invalid file path references
4. Non-Effect code examples
5. Missing required sections

Output: specs/agent-config-optimization/outputs/inventory-agents-md.md

Include:
- Summary metrics table
- Per-file status (Valid/Issues/Missing)
- Categorized issues list"
```

#### Task 1.3: Audit README.md Files (readme-updater)

```markdown
Launch readme-updater agent with prompt:

"Audit all README.md files for agent-related content issues.

Focus on:
1. References to agent configurations
2. Import path accuracy
3. Effect pattern compliance in examples
4. Consistency with corresponding AGENTS.md

Scope:
- packages/**/README.md
- apps/**/README.md
- tooling/**/README.md
- .claude/**/README.md (if any)

Output: specs/agent-config-optimization/outputs/inventory-readme.md

Include:
- Missing README files list
- Files with stale references
- Non-Effect pattern violations"
```

### Phase 1 Outputs

| Output | Purpose |
|--------|---------|
| `outputs/inventory-claude-config.md` | Full .claude/ inventory |
| `outputs/inventory-agents-md.md` | AGENTS.md audit results |
| `outputs/inventory-readme.md` | README.md audit results |

### Phase 1 Success Criteria

- [ ] All .claude/ files inventoried with line counts
- [ ] All AGENTS.md files audited (should be ~50)
- [ ] All README.md files checked for agent references
- [ ] Issues categorized by type
- [ ] No missing audit reports

### Phase 1 Verification

```bash
# Verify inventory completeness
find .claude -name "*.md" | wc -l  # Compare to inventory count
find . -name "AGENTS.md" -not -path "*/node_modules/*" | wc -l
```

---

## Phase 2: Analysis - Redundancy and Bloat Detection

### Objective

Analyze inventory data to identify specific optimization opportunities.

### Duration

2-3 hours (mixed sequential/parallel)

### Sub-Agent Tasks

#### Task 2.1: Benchmark Against Best Practices (ai-trends-researcher)

```markdown
Launch ai-trends-researcher agent with prompt:

"Compare the beep-effect .claude/ configuration against industry best practices.

Use the inventory from:
- outputs/inventory-claude-config.md
- outputs/agent-best-practices.md (from Phase 0)

Benchmark areas:
1. CLAUDE.md structure vs recommended patterns
2. Agent prompt length vs effective length guidelines
3. Rules organization vs modular patterns
4. Skills usage vs recommended skill patterns

Output: specs/agent-config-optimization/outputs/benchmark-report.md

Include:
- Gap analysis table
- Priority recommendations
- External sources cited"
```

#### Task 2.2: Cross-Reference Duplicate Content (codebase-researcher)

```markdown
Launch codebase-researcher agent with prompt:

"Analyze agent documentation for duplicate and redundant content.

Use inventories:
- outputs/inventory-claude-config.md
- outputs/inventory-agents-md.md

Identify:
1. Identical sections appearing in multiple agents
2. Similar patterns that could be extracted to templates
3. Effect pattern documentation repeated across files
4. Decision trees that appear in multiple places

Output: specs/agent-config-optimization/outputs/redundancy-report.md

Format:
- Duplicate content map (file A → file B → shared content)
- Extraction candidates (content → suggested template file)
- Estimated line savings"
```

#### Task 2.3: Identify Bloat Sections (spec-reviewer)

```markdown
Launch spec-reviewer agent with prompt:

"Review agent definitions for bloat and verbosity.

Analyze files in .claude/agents/ for:
1. Overly long example sections (could be shorter)
2. Explanations that repeat what code shows
3. Sections that duplicate CLAUDE.md or rules files
4. Comments and annotations that add no value

Output: specs/agent-config-optimization/outputs/bloat-analysis.md

For each bloated section:
- File path and line range
- Current content summary
- Suggested reduction
- Estimated line savings"
```

### Phase 2 Outputs

| Output | Purpose |
|--------|---------|
| `outputs/benchmark-report.md` | Comparison to best practices |
| `outputs/redundancy-report.md` | Duplicate content map |
| `outputs/bloat-analysis.md` | Verbose sections identified |
| `outputs/improvement-opportunities.md` | Prioritized action list |

### Phase 2 Success Criteria

- [ ] Benchmark against 3+ external sources
- [ ] Redundancy analysis covers all 21 agents
- [ ] Bloat analysis identifies specific line ranges
- [ ] Prioritized improvement list created
- [ ] Estimated total line reduction calculated

---

## Phase 3: Implementation - Apply Optimizations

### Objective

Execute targeted improvements across all agent documentation.

### Duration

4-6 hours (sequential sub-phases)

### Sub-Phase 3A: Agent Definition Optimization

#### Target

All `.claude/agents/*.md` files

#### Tasks

1. **Extract shared templates** to `.claude/agents/templates/`
2. **Remove duplicate content** identified in redundancy report
3. **Trim bloated sections** identified in bloat analysis
4. **Standardize structure** across all agents
5. **Add cross-references** where agents relate

#### Agent

Manual implementation guided by Phase 2 outputs.

### Sub-Phase 3B: Rules Consolidation

#### Target

`.claude/rules/*.md` and `CLAUDE.md`

#### Tasks

1. **Identify rule overlap** between CLAUDE.md and rules files
2. **Consolidate duplicates** - single source of truth
3. **Add rule references** from agents to rules files
4. **Remove inline rules** from agents that exist in rules/

#### Agent

Manual implementation with `doc-writer` assistance.

### Sub-Phase 3C: AGENTS.md Cleanup

#### Target

All ~50 `**/AGENTS.md` files

#### Tasks

```markdown
Launch agents-md-updater agent with prompt:

"Apply fixes to all AGENTS.md files based on Phase 1 audit.

Fix categories:
1. Replace stale @beep/* references with current packages
2. Remove MCP tool shortcut sections entirely
3. Fix invalid file path references
4. Update non-Effect code examples to use namespace imports

Use outputs/inventory-agents-md.md for issue list.

Report changes made to: specs/agent-config-optimization/outputs/agents-md-changes.md"
```

### Sub-Phase 3D: Cross-Reference Linking

#### Tasks

1. **Add "Related Agents" sections** to agent files
2. **Link rules to agents** that use those rules
3. **Cross-reference skills** used by agents
4. **Update README files** to reference AGENTS.md

### Phase 3 Outputs

| Output | Purpose |
|--------|---------|
| `outputs/agents-md-changes.md` | AGENTS.md changes log |
| `outputs/implementation-summary.md` | All changes summary |

### Phase 3 Success Criteria

- [ ] All bloated sections trimmed
- [ ] All redundant content extracted to templates
- [ ] All AGENTS.md stale references fixed
- [ ] All MCP tool shortcuts removed
- [ ] Cross-references added between related files
- [ ] Type check passes: `bun run check`
- [ ] Lint passes: `bun run lint`

---

## Phase 4: Validation - Verify Improvements

### Objective

Ensure optimizations maintain functionality and achieve quality targets.

### Duration

1 hour

### Sub-Agent Tasks

#### Task 4.1: Review Updated Documentation (spec-reviewer)

```markdown
Launch spec-reviewer agent with prompt:

"Review the updated agent documentation for quality.

Verify:
1. All agent files still have required sections
2. Effect patterns are correct in all examples
3. Cross-references point to existing files
4. No functionality was lost in optimization

Review:
- .claude/agents/*.md (all files)
- .claude/rules/*.md
- Sample of AGENTS.md files (10 random)

Output: specs/agent-config-optimization/outputs/validation-report.md"
```

#### Task 4.2: Structural Verification (architecture-pattern-enforcer)

```markdown
Launch architecture-pattern-enforcer agent with prompt:

"Verify structural consistency of agent documentation.

Check:
1. All agents follow same template structure
2. All AGENTS.md files have required sections
3. No broken cross-references
4. File organization follows conventions

Output: specs/agent-config-optimization/outputs/structure-verification.md"
```

### Phase 4 Outputs

| Output | Purpose |
|--------|---------|
| `outputs/validation-report.md` | Quality assessment |
| `outputs/structure-verification.md` | Structural consistency |

### Phase 4 Success Criteria

- [ ] All agents pass structural review
- [ ] No broken cross-references
- [ ] Effect patterns verified correct
- [ ] Line count reduction achieved (target: 20%+)
- [ ] REFLECTION_LOG.md updated with final learnings

---

## Final Verification

```bash
# Verify all files exist
ls -la specs/agent-config-optimization/outputs/

# Run full repo checks
bun run lint:fix
bun run check

# Verify no broken references in .claude/
grep -r "\.\./" .claude/agents/*.md | wc -l  # Should be minimal

# Check for stale package references
grep -r "@beep/core-" .claude/ --include="*.md" | wc -l  # Should be 0
```

---

## Handoff Documents

At the end of each phase, create:

1. `handoffs/HANDOFF_P[N+1].md` - Full context document
2. `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt

See [HANDOFF_STANDARDS.md](../HANDOFF_STANDARDS.md) for templates.

---

## Related Documentation

- [README.md](README.md) - Spec overview
- [QUICK_START.md](QUICK_START.md) - 5-minute triage
- [RUBRICS.md](RUBRICS.md) - Quality scoring
- [REFLECTION_LOG.md](REFLECTION_LOG.md) - Learnings
