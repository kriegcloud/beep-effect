# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing Phase 0 (Discovery) of the JetBrains MCP Skill spec.

### Context

We're creating a `.claude/skills/jetbrains-mcp.md` skill to help Claude effectively use JetBrains IDE MCP tools. Phase 0 exhaustively documents all available tools.

### Your Mission

1. **Document all JetBrains MCP tools** in `specs/jetbrains-mcp-skill/outputs/tool-inventory.md`
2. **Document common parameters** in `specs/jetbrains-mcp-skill/outputs/tool-dependencies.md`
3. **Test each tool** to verify behavior matches documentation

### Tools to Document

There are 20+ tools in these categories:
- Code Intelligence: `get_symbol_info`, `get_file_problems`, `rename_refactoring`, `build_project`
- File Operations: `get_file_text_by_path`, `replace_text_in_file`, `create_new_file`, `reformat_file`, `open_file_in_editor`
- Search: `find_files_by_name_keyword`, `find_files_by_glob`, `search_in_files_by_text`, `search_in_files_by_regex`
- Navigation: `list_directory_tree`, `get_all_open_file_paths`
- Project: `get_project_modules`, `get_project_dependencies`, `get_repositories`
- Execution: `get_run_configurations`, `execute_run_configuration`, `execute_terminal_command`

### For Each Tool, Document

1. **Purpose** - One-line description
2. **Parameters** - Required vs optional, types, defaults
3. **Returns** - What the tool returns
4. **Example** - Concrete usage example
5. **Notes** - Edge cases, gotchas, tips

### Critical Patterns to Investigate

- When is `projectPath` required vs optional?
- What are default timeout values?
- How does `truncateMode` (START/MIDDLE/END/NONE) affect output?
- What errors occur with invalid inputs?

### Verification

After documenting:
```bash
ls -la specs/jetbrains-mcp-skill/outputs/
```

### Success Criteria

- [ ] All tools documented in `tool-inventory.md`
- [ ] Common parameters documented in `tool-dependencies.md`
- [ ] Each tool tested at least once
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings
- [ ] `handoffs/HANDOFF_P1.md` created
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/jetbrains-mcp-skill/handoffs/HANDOFF_P0.md`
