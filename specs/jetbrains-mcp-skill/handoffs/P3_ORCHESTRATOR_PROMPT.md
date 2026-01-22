# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 (Implementation) of the JetBrains MCP Skill spec.

### Context

Phases 0-2 are complete. Design is finalized:
- `specs/jetbrains-mcp-skill/outputs/skill-outline.md` - Section structure
- `specs/jetbrains-mcp-skill/outputs/content-plan.md` - What to include
- `specs/jetbrains-mcp-skill/outputs/path-strategy.md` - Activation strategy

### Your Mission

Write the skill file: `.claude/skills/jetbrains-mcp.md`

### Target Structure (270 lines)

```markdown
---
paths:
  - "**/*"
---

# JetBrains MCP Integration Skill              (10 lines)

## When to Invoke                              (15 lines)

## Critical: Project Path                      (10 lines)

## Quick Reference: Tool Selection             (40 lines)

## JetBrains-Only Capabilities                 (30 lines)

## Tool Reference                              (80 lines)
### Code Intelligence
### File Operations
### Search & Navigation
### Execution

## Common Workflows                            (50 lines)
### Bug Investigation
### Safe Refactoring
### Project Exploration

## Troubleshooting                             (30 lines)

## Related                                     (5 lines)
```

### Tool Naming Convention

All JetBrains tools use this prefix:
```
mcp__jetbrains__<tool_name>
```

Example: `mcp__jetbrains__rename_refactoring`

### Key Reference Files

Before writing, read these in parallel:
1. `outputs/skill-outline.md` - Full section details
2. `outputs/content-plan.md` - Inclusion decisions
3. `outputs/tool-inventory.md` - Accurate parameters
4. `.claude/skills/playwright-mcp.md` - Format reference

### Critical Content Elements

1. **Quick Reference Table** - The core decision aid:
   ```markdown
   | Task | Preferred | Alternative | Why |
   |------|-----------|-------------|-----|
   | Rename symbol | JetBrains `rename_refactoring` | Standard `Edit` | Semantic, project-wide |
   ```

2. **JetBrains-Only Examples** - Full code for unique tools:
   ```typescript
   mcp__jetbrains__rename_refactoring({
     pathInProject: "src/UserService.ts",
     symbolName: "getUserById",
     newName: "findUserById",
     projectPath: "/path/to/project"
   })
   ```

3. **Abbreviated Workflows** - Steps only:
   ```markdown
   1. Find file → JetBrains `find_files_by_name_keyword`
   2. Read file → Standard `Read`
   ```

4. **Troubleshooting** - Four issues:
   - File not found
   - Timeout errors
   - Confirmation required
   - MCP not responding

### Tier 1 Tools (include with examples)

- `rename_refactoring`
- `get_file_problems`
- `get_symbol_info`
- `find_files_by_name_keyword`
- `list_directory_tree`
- `get_all_open_file_paths`
- `get_project_modules`
- `execute_terminal_command`
- `execute_run_configuration`
- `get_run_configurations`

### Tier 2 Tools (mention briefly)

- `get_file_text_by_path`
- `search_in_files_by_text`
- `get_project_dependencies`
- `reformat_file`

### Quality Checklist

Before completion, verify:
- [ ] File created at `.claude/skills/jetbrains-mcp.md`
- [ ] Line count 200-300 range
- [ ] All Tier 1 tools have examples
- [ ] Quick Reference covers common tasks
- [ ] Format matches `playwright-mcp.md` style
- [ ] `mcp__jetbrains__` prefix used consistently
- [ ] `projectPath` requirement documented
- [ ] Clear "when NOT to use" guidance
- [ ] Troubleshooting complete
- [ ] Related links functional

### Verification

After writing:
```bash
wc -l .claude/skills/jetbrains-mcp.md
```

Should show 200-300 lines.

### Success Criteria

- [ ] Skill file exists at `.claude/skills/jetbrains-mcp.md`
- [ ] Content follows design from Phase 2 outputs
- [ ] Line count within target range
- [ ] Format consistent with existing skills
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] `handoffs/HANDOFF_P4.md` created
- [ ] `handoffs/P4_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/jetbrains-mcp-skill/handoffs/HANDOFF_P3.md`
