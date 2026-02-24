# Agent Configuration Optimization

## Overview

This specification orchestrates the systematic review, optimization, and improvement of all agent-related documentation and `.claude` configurations in the beep-effect monorepo. The goal is to reduce bloat, improve clarity, and make it easier for Claude to contribute effectively to this repository.

## Problem Statement

The repository has accumulated significant agent-related documentation across multiple locations:

1. **Agent definitions** (`.claude/agents/*.md`) - 21 agent files with varying quality and verbosity
2. **Rules files** (`.claude/rules/*.md`) - Core behavioral and pattern rules
3. **Commands** (`.claude/commands/*.md`) - User-invocable slash commands
4. **Skills** (`.claude/skills/*.md`) - Reusable skill modules
5. **AGENTS.md files** (~50 files across packages) - Package-specific agent guidance
6. **CLAUDE.md** - Root configuration file
7. **Spec documentation** (`specs/`) - Spec creation guides and agents documentation

**Current Issues:**

- Redundant information across multiple files
- Overly verbose agent prompts that waste context
- Stale references to deleted/renamed packages
- Inconsistent patterns across similar agents
- Missing cross-references between related documents
- Outdated MCP tool shortcuts in AGENTS.md files

## Solution

A multi-phase optimization process using parallel sub-agents:

1. **Bootstrap Phase**: Optimize the agent configurations themselves first
2. **Inventory Phase**: Exhaustive audit of all agent-related files
3. **Analysis Phase**: Identify redundancy, bloat, and improvement opportunities
4. **Implementation Phase**: Apply targeted improvements
5. **Validation Phase**: Verify improvements maintain functionality

## Phases

### Phase 0: Bootstrap - Agent Configuration Self-Review

**Goal**: Improve the agents that will perform downstream improvements.

**Target Files**:
- `.claude/agents/agents-md-updater.md`
- `.claude/agents/readme-updater.md`
- `.claude/agents/ai-trends-researcher.md`
- `.claude/agents/codebase-researcher.md`

**Sub-Agents**:
- `ai-trends-researcher` - Research latest best practices for agent prompting
- `codebase-researcher` - Audit current agent file structures

**Outputs**:
- `outputs/agent-config-audit.md` - Current state assessment
- `outputs/agent-best-practices.md` - Research findings

### Phase 1: Inventory - Exhaustive Documentation Audit

**Goal**: Create a complete inventory of all agent-related documentation.

**Sub-Agents** (Parallel):
- `codebase-researcher` - Inventory `.claude/` directory structure
- `agents-md-updater` - Audit all AGENTS.md files for stale references
- `readme-updater` - Audit README.md files for agent-related content

**Outputs**:
- `outputs/inventory-claude-config.md` - Full `.claude/` inventory
- `outputs/inventory-agents-md.md` - All AGENTS.md audit results
- `outputs/inventory-readme.md` - README.md audit results

### Phase 2: Analysis - Redundancy and Bloat Detection

**Goal**: Identify specific optimization opportunities.

**Sub-Agents**:
- `ai-trends-researcher` - Benchmark against industry best practices
- `codebase-researcher` - Cross-reference duplicate content
- `spec-reviewer` - Evaluate spec documentation quality

**Outputs**:
- `outputs/redundancy-report.md` - Duplicate content across files
- `outputs/bloat-analysis.md` - Overly verbose sections
- `outputs/improvement-opportunities.md` - Prioritized action list

### Phase 3: Implementation - Apply Optimizations

**Goal**: Execute targeted improvements across all agent documentation.

**Sub-Phases**:
- 3A: Agent definition optimization (`.claude/agents/`)
- 3B: Rules consolidation (`.claude/rules/`)
- 3C: AGENTS.md cleanup (all packages)
- 3D: Cross-reference linking

**Sub-Agents**:
- `agents-md-updater` - Fix AGENTS.md files
- `readme-updater` - Update README.md files
- `doc-writer` - Rewrite verbose sections

### Phase 4: Validation - Verify Improvements

**Goal**: Ensure optimizations maintain functionality and improve clarity.

**Sub-Agents**:
- `spec-reviewer` - Review updated documentation
- `architecture-pattern-enforcer` - Verify structural consistency

**Outputs**:
- `outputs/validation-report.md` - Quality assessment
- `REFLECTION_LOG.md` - Methodology learnings

## Success Criteria

1. **Reduced Token Count**: Agent definitions reduced by 20%+ without losing functionality
2. **Eliminated Stale References**: Zero references to deleted packages
3. **No MCP Tool Shortcuts**: All outdated tool call shortcuts removed from AGENTS.md
4. **Consistent Patterns**: All agents follow the same structural template
5. **Working Cross-References**: All file references point to existing files
6. **Verified Effect Patterns**: All code examples use namespace imports

## Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute triage guide |
| [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) | Full phase workflow |
| [RUBRICS.md](RUBRICS.md) | Quality scoring criteria |
| [REFLECTION_LOG.md](REFLECTION_LOG.md) | Methodology learnings |

## Handoffs

| Phase | Document | Status |
|-------|----------|--------|
| P0 | [handoffs/HANDOFF_P0.md](handoffs/HANDOFF_P0.md) | ✅ Complete |
| P0 | [handoffs/P0_ORCHESTRATOR_PROMPT.md](handoffs/P0_ORCHESTRATOR_PROMPT.md) | ✅ Complete |
| P1 | [handoffs/HANDOFF_P1.md](handoffs/HANDOFF_P1.md) | ✅ Complete |
| P1 | [handoffs/P1_ORCHESTRATOR_PROMPT.md](handoffs/P1_ORCHESTRATOR_PROMPT.md) | ✅ Complete |
| P2 | [handoffs/HANDOFF_P2.md](handoffs/HANDOFF_P2.md) | Ready |
| P2 | [handoffs/P2_ORCHESTRATOR_PROMPT.md](handoffs/P2_ORCHESTRATOR_PROMPT.md) | Copy-paste prompt |

## Key Agents Used

| Agent | Role in Spec |
|-------|--------------|
| `ai-trends-researcher` | Research best practices, benchmark configurations |
| `codebase-researcher` | Inventory files, analyze patterns, map dependencies |
| `agents-md-updater` | Audit and fix AGENTS.md files |
| `readme-updater` | Audit and fix README.md files |
| `spec-reviewer` | Validate spec documentation quality |
| `doc-writer` | Rewrite verbose documentation |
| `architecture-pattern-enforcer` | Verify structural consistency |

## Verification

```bash
# After each phase
bun run lint:fix
bun run check

# Validate no broken references
grep -r "@beep/" .claude/ --include="*.md" | head -20
```

## Related Documentation

- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md) - Spec patterns
- [Agent Specifications](../agents/README.md) - Agent documentation
- [CLAUDE.md](../../CLAUDE.md) - Root configuration
