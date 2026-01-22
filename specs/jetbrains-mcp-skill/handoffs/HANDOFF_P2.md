# Phase 2 Handoff: Design - Skill File Architecture

## Context

Phase 0 (Discovery) and Phase 1 (Analysis) are complete. We have:
- **Tool Inventory**: All 20 JetBrains MCP tools documented
- **Comparison Matrix**: JetBrains vs Standard tool recommendations
- **Decision Tree**: Tool selection flowcharts
- **Workflow Analysis**: 7 complete workflows with error recovery

## Phase 2 Mission

Design the skill file structure for `.claude/skills/jetbrains-mcp.md`.

## Key Inputs from Phase 1

### Tool Preferences Summary

| Scenario | Recommended Tool |
|----------|------------------|
| **Always JetBrains** | `rename_refactoring`, `get_file_problems`, `get_symbol_info`, `find_files_by_name_keyword` |
| **Always Standard** | `Read`, `Edit`, `LSP goToDefinition/findReferences`, `Bash` (for quick commands) |
| **Context-Dependent** | Content search, file creation, run configurations |

### Unique JetBrains Capabilities

1. `rename_refactoring` - Semantic symbol rename (no standard equivalent)
2. `get_all_open_file_paths` - IDE context awareness
3. `get_project_modules` - Monorepo structure
4. `get_file_problems` - IntelliJ inspections (more thorough than LSP)
5. `reformat_file` - IDE code style application

### Critical Constraints

1. **All tools require `projectPath`** - Universal parameter
2. **Execution tools require confirmation** - Unless Brave Mode enabled
3. **Terminal output capped at 2000 lines**
4. **JetBrains IDE 2025.2+ required** for built-in MCP support

## Design Tasks

### 1. Skill File Structure

Determine overall organization:

**Option A: Task-Oriented**
```markdown
## When to Invoke
## Finding Files
## Reading/Editing Files
## Code Intelligence
## Running Commands
## Project Understanding
## Troubleshooting
```

**Option B: Tool-Oriented**
```markdown
## When to Invoke
## Tool Reference
  ### Code Intelligence Tools
  ### File Operation Tools
  ### Search Tools
  ### Execution Tools
## Common Workflows
## Troubleshooting
```

**Option C: Hybrid (Recommended)**
```markdown
## When to Invoke
## Quick Reference (Task → Tool mapping)
## Detailed Tool Reference
## Common Workflows
## Troubleshooting
```

### 2. Content Decisions

- **How much detail per tool?** Full parameters or just examples?
- **Include all 20 tools?** Or focus on high-value subset?
- **Workflow snippets?** Include or reference separately?
- **Error handling?** Inline or dedicated section?

### 3. Path Configuration

The skill needs `paths:` frontmatter to determine when it's activated:

```yaml
---
paths:
  - "**/*"  # Always available?
  - "packages/**/*"  # Only for packages?
---
```

Consider: When should the JetBrains skill be triggered vs ignored?

### 4. Reference: Playwright MCP Skill Pattern

The existing `playwright-mcp.md` skill follows this structure:
1. When to Invoke
2. Critical configuration note
3. Tool tables by category
4. Common Workflows with code examples
5. Understanding output format
6. Debugging tips
7. Troubleshooting section
8. Related skills

## Design Constraints

### From CLAUDE.md

- Skills should be 200-300 lines (single session scope)
- `.claude/skills/` for single-session tasks
- `specs/` for multi-session orchestration (this is a spec, but output is a skill)

### From Playwright Skill

- Use tables for tool listing
- Include code examples in workflows
- Have a clear troubleshooting section
- Document output formats

## Questions to Answer in Phase 2

1. **Scope**: Include all 20 tools or focus on ~10 high-value ones?
2. **Detail level**: Full parameter docs or link to Phase 0 inventory?
3. **Path activation**: When should this skill trigger?
4. **Workflow depth**: Full workflows or abbreviated quick references?
5. **Integration**: How to indicate when JetBrains vs Standard is preferred?

## Artifacts to Produce

| Artifact | Location | Content |
|----------|----------|---------|
| Skill Outline | `outputs/skill-outline.md` | Proposed structure with headings |
| Path Strategy | `outputs/path-strategy.md` | When skill should activate |
| Content Plan | `outputs/content-plan.md` | What to include/exclude |

## Success Criteria

Phase 2 is complete when:

- [ ] Skill file structure is designed and documented
- [ ] Content decisions are made (tool subset, detail level)
- [ ] Path activation strategy is defined
- [ ] Outline is ready for implementation in Phase 3
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `HANDOFF_P3.md` created for Phase 3

## Reference Documents

| Document | Purpose |
|----------|---------|
| `outputs/tool-inventory.md` | Full tool documentation |
| `outputs/comparison-matrix.md` | Tool selection guidance |
| `outputs/decision-tree.md` | Selection flowcharts |
| `outputs/workflow-analysis.md` | Complete workflow patterns |
| `.claude/skills/playwright-mcp.md` | Reference skill structure |
