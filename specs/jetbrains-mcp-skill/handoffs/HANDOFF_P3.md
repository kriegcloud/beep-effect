# Phase 3 Handoff: Implementation - Write the Skill File

## Context

Phases 0-2 are complete:
- **Phase 0**: Documented all 20 JetBrains MCP tools
- **Phase 1**: Created comparison matrix, decision tree, workflow analysis
- **Phase 2**: Designed skill structure, path strategy, content plan

## Phase 3 Mission

Write the actual skill file: `.claude/skills/jetbrains-mcp.md`

## Design Decisions (from Phase 2)

### Structure

```
1. Frontmatter (paths: "**/*")
2. Header + description
3. When to Invoke (15 lines)
4. Critical: Project Path (10 lines)
5. Quick Reference: Tool Selection (40 lines)
6. JetBrains-Only Capabilities (30 lines)
7. Tool Reference tables (80 lines)
8. Common Workflows - abbreviated (50 lines)
9. Troubleshooting (30 lines)
10. Related links (5 lines)

Total target: ~270 lines
```

### Tool Inclusion

**Tier 1 - Detailed (10 tools)**:
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

**Tier 2 - Brief mention (4 tools)**:
- `get_file_text_by_path`
- `search_in_files_by_text`
- `get_project_dependencies`
- `reformat_file`

**Tier 3 - Omit (6 tools)**:
- `replace_text_in_file`
- `create_new_file`
- `find_files_by_glob`
- `search_in_files_by_regex`
- `open_file_in_editor`
- `get_repositories`

### Path Activation

```yaml
---
paths:
  - "**/*"
---
```

## Key Sources

| Document | Use For |
|----------|---------|
| `outputs/skill-outline.md` | Section structure and line counts |
| `outputs/content-plan.md` | What to include vs reference |
| `outputs/tool-inventory.md` | Accurate tool parameters |
| `outputs/comparison-matrix.md` | Tool selection rationale |
| `outputs/workflow-analysis.md` | Workflow abbreviation source |
| `.claude/skills/playwright-mcp.md` | Format/style reference |

## Implementation Notes

### Quick Reference Table

The central decision aid. Format:

```markdown
| Task | Preferred | Alternative | Why |
|------|-----------|-------------|-----|
| Rename symbol | JetBrains `rename_refactoring` | Standard `Edit` | Semantic, project-wide |
```

### JetBrains-Only Section

Full code examples for tools with NO standard equivalent:

```typescript
mcp__jetbrains__rename_refactoring({
  pathInProject: "src/UserService.ts",
  symbolName: "getUserById",
  newName: "findUserById",
  projectPath: "/path/to/project"
})
```

### Abbreviated Workflows

Steps only, no code blocks:

```markdown
### Bug Investigation
1. Find file → JetBrains `find_files_by_name_keyword`
2. Read file → Standard `Read`
3. Check problems → JetBrains `get_file_problems`
4. Make fix → Standard `Edit`
5. Verify → JetBrains `get_file_problems`
```

### Troubleshooting

Four common issues:
1. File not found → Use relative paths
2. Timeout → Increase timeout, narrow scope
3. Confirmation required → Brave Mode or Bash
4. MCP not responding → IDE checklist

## Success Criteria

- [ ] Skill file created at `.claude/skills/jetbrains-mcp.md`
- [ ] Line count within 200-300 range
- [ ] All Tier 1 tools have examples
- [ ] Quick Reference table covers common tasks
- [ ] Format consistent with `playwright-mcp.md`
- [ ] JetBrains tool naming convention followed
- [ ] `projectPath` requirement emphasized
- [ ] Clear guidance on when NOT to use JetBrains tools
- [ ] Troubleshooting section complete
- [ ] Related links functional

## Validation for Phase 4

After implementation, Phase 4 will:
1. Count actual lines vs target
2. Verify tool examples are accurate
3. Cross-check with Playwright skill for consistency
4. Test skill activation on sample files
5. Review troubleshooting completeness

## Questions to Resolve During Implementation

1. Should "How to Enable" setup instructions be included?
   - Recommendation: Brief mention only, link to JetBrains docs

2. Should Related links be at top or bottom?
   - Recommendation: Bottom (matching Playwright pattern)

3. Are abbreviated workflows too terse?
   - Implementation judgment call - tune if needed
