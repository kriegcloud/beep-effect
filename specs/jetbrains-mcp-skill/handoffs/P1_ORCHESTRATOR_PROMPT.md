# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 (Analysis) of the JetBrains MCP Skill spec.

### Context

Phase 0 (Discovery) is complete. We have comprehensive tool documentation:
- `specs/jetbrains-mcp-skill/outputs/tool-inventory.md` - All 20 JetBrains MCP tools
- `specs/jetbrains-mcp-skill/outputs/tool-dependencies.md` - Common parameters and relationships

### Your Mission

1. **Create tool comparison matrix** in `specs/jetbrains-mcp-skill/outputs/comparison-matrix.md`
2. **Design decision tree** in `specs/jetbrains-mcp-skill/outputs/decision-tree.md`
3. **Document common workflows** in `specs/jetbrains-mcp-skill/outputs/workflow-analysis.md`

### Comparison Tasks

Compare JetBrains MCP tools vs standard Claude Code tools for these operations:

| Operation | Standard Tool | JetBrains Tool |
|-----------|---------------|----------------|
| Find files by name | `Glob` | `find_files_by_name_keyword` |
| Find files by pattern | `Glob` | `find_files_by_glob` |
| Read file | `Read` | `get_file_text_by_path` |
| Edit file | `Edit` | `replace_text_in_file` |
| Search content | `Grep` | `search_in_files_by_text/regex` |
| Get diagnostics | `LSP` | `get_file_problems` |
| Rename symbol | Manual edit | `rename_refactoring` |
| Run commands | `Bash` | `execute_terminal_command` |
| Directory tree | `Bash ls/tree` | `list_directory_tree` |

For each, document:
- Speed/performance difference
- Output quality/completeness
- Ease of use
- When to prefer each

### Workflows to Document

At minimum, document these 5 workflows:

1. **Bug Investigation**: Finding and fixing issues using IDE inspections
2. **Safe Refactoring**: Renaming symbols across a project
3. **Code Search**: Finding usages and understanding code
4. **Build & Test**: Running project configurations
5. **Project Exploration**: Understanding project structure

### Key Insights from Phase 0

- **20 tools** (not 21+): `build_project` doesn't exist - use `execute_run_configuration`
- **All tools require `projectPath`**: Universal parameter
- **Indexed search preferred**: `find_files_by_name_keyword` > `find_files_by_glob`
- **Brave Mode**: Setting that skips confirmation for execution tools
- **Version requirement**: JetBrains IDE 2025.2+ for built-in MCP

### Output Format

**comparison-matrix.md** should include:
- Table comparing tools by task
- Pros/cons analysis
- Clear recommendations

**decision-tree.md** should include:
- Flowchart or decision tree for tool selection
- Based on task type and context
- ASCII art or markdown list format

**workflow-analysis.md** should include:
- Step-by-step workflows
- Tool choices with rationale
- Error handling considerations

### Verification

After completing:
```bash
ls -la specs/jetbrains-mcp-skill/outputs/
```

### Success Criteria

- [ ] `comparison-matrix.md` created
- [ ] `decision-tree.md` created
- [ ] `workflow-analysis.md` created with 5+ workflows
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/jetbrains-mcp-skill/handoffs/HANDOFF_P1.md`
