# Quick Start: Agent Configuration Optimization

## 5-Minute Triage Guide

### What This Spec Does

Optimizes all agent-related documentation in the beep-effect monorepo to:
- Reduce context waste from bloated agent prompts
- Remove stale package references
- Eliminate redundant content across files
- Standardize agent definition patterns

### Key Insight: Bootstrap First

Before improving downstream documentation, we must first improve the agents that will perform those improvements. This creates a positive feedback loop where better agents produce better documentation.

---

## Quick Phase Reference

| Phase | Goal | Duration | Key Agent |
|-------|------|----------|-----------|
| **P0** | Optimize improvement agents | 1-2 hours | `ai-trends-researcher` |
| **P1** | Inventory all files | 1-2 hours | `codebase-researcher` (parallel) |
| **P2** | Analyze redundancy | 2-3 hours | Multiple agents |
| **P3** | Apply fixes | 4-6 hours | `agents-md-updater` |
| **P4** | Validate | 1 hour | `spec-reviewer` |

---

## Starting Point Decision Tree

```
1. Have you run Phase 0?
   ├── No → Start with P0 (bootstrap agents first)
   └── Yes → Continue to step 2

2. Do you have complete inventory?
   ├── No → Run P1 parallel inventory agents
   └── Yes → Continue to step 3

3. Do you have analysis reports?
   ├── No → Run P2 analysis agents
   └── Yes → Continue to step 4

4. Ready to implement?
   ├── Yes → Run P3 implementation
   └── No → Review P2 outputs first
```

---

## Quick Commands

### Start Phase 0 (Recommended Entry Point)

Copy-paste the orchestrator prompt from:
```
specs/agent-config-optimization/handoffs/P0_ORCHESTRATOR_PROMPT.md
```

### Parallel Inventory (Phase 1)

Launch 3 agents simultaneously:
```
1. codebase-researcher → inventory .claude/ structure
2. agents-md-updater → audit all AGENTS.md files
3. readme-updater → audit README.md files
```

### Verification After Any Phase

```bash
bun run lint:fix
bun run check
```

---

## File Locations Quick Reference

### Agent Definitions
```
.claude/agents/*.md          # 21 agent files
```

### Rules and Configuration
```
.claude/rules/*.md           # 3 rules files
CLAUDE.md                    # Root config (symlink to AGENTS.md)
```

### Package Documentation
```
**/AGENTS.md                 # ~50 package-level files
**/README.md                 # Package descriptions
```

### Spec Infrastructure
```
specs/_guide/README.md       # Spec patterns
specs/agents/README.md       # Agent documentation
```

---

## Common Issues & Quick Fixes

### Issue: Stale Package References
**Detection**: `grep -r "@beep/core-" .claude/` shows matches
**Fix**: Run `agents-md-updater` to replace with current packages

### Issue: MCP Tool Shortcuts
**Detection**: `grep -r "jetbrains__\|context7__\|effect_docs__" **/AGENTS.md`
**Fix**: Run `agents-md-updater` to remove entire shortcut sections

### Issue: Verbose Agent Prompts
**Detection**: Agent file > 200 lines
**Fix**: P2 analysis identifies specific bloat sections

---

## Next Steps

1. Read [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for detailed workflow
2. Copy prompt from [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md)
3. Start Phase 0 execution
