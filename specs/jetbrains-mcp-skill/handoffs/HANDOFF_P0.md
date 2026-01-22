# Phase 0 Handoff: Discovery - Tool Capability Research

## Context

This is the first phase of the JetBrains MCP Skill specification. The goal is to create a comprehensive `.claude/skills/jetbrains-mcp.md` skill that guides Claude in effectively using JetBrains IDE MCP tools.

## Your Mission

Exhaustively document all JetBrains MCP tools and their capabilities by:

1. **Extracting tool schemas** - Document every parameter, required vs optional
2. **Testing tools** - Execute each tool to understand actual behavior
3. **Identifying dependencies** - Note which tools require `projectPath`, timeouts, etc.
4. **Documenting edge cases** - What happens with invalid input, missing files, etc.

## Available JetBrains MCP Tools

The following tools are available via the JetBrains MCP server:

### Code Intelligence
| Tool | Description |
|------|-------------|
| `mcp__jetbrains__get_symbol_info` | Quick Documentation at a position |
| `mcp__jetbrains__get_file_problems` | IntelliJ inspections for a file |
| `mcp__jetbrains__rename_refactoring` | Rename symbol across project |
| `mcp__jetbrains__build_project` | Trigger build and get errors |

### File Operations
| Tool | Description |
|------|-------------|
| `mcp__jetbrains__get_file_text_by_path` | Read file contents |
| `mcp__jetbrains__replace_text_in_file` | Replace text with options |
| `mcp__jetbrains__create_new_file` | Create new file |
| `mcp__jetbrains__reformat_file` | Apply code formatting |
| `mcp__jetbrains__open_file_in_editor` | Open file in IDE |

### Search & Navigation
| Tool | Description |
|------|-------------|
| `mcp__jetbrains__find_files_by_name_keyword` | Fast indexed name search |
| `mcp__jetbrains__find_files_by_glob` | Glob pattern search |
| `mcp__jetbrains__search_in_files_by_text` | Project-wide text search |
| `mcp__jetbrains__search_in_files_by_regex` | Project-wide regex search |
| `mcp__jetbrains__list_directory_tree` | Tree view of directory |
| `mcp__jetbrains__get_all_open_file_paths` | Currently open files |

### Project Structure
| Tool | Description |
|------|-------------|
| `mcp__jetbrains__get_project_modules` | List project modules |
| `mcp__jetbrains__get_project_dependencies` | List dependencies |
| `mcp__jetbrains__get_repositories` | List VCS roots |

### Execution
| Tool | Description |
|------|-------------|
| `mcp__jetbrains__get_run_configurations` | List run configurations |
| `mcp__jetbrains__execute_run_configuration` | Execute a run config |
| `mcp__jetbrains__execute_terminal_command` | Run shell command in IDE terminal |

## Research Questions to Answer

For each tool, document:

1. **Parameters**
   - Required vs optional
   - Default values
   - Valid ranges/formats

2. **Behavior**
   - What does it return?
   - How does output format vary?
   - What are truncation limits?

3. **Error Conditions**
   - What happens with invalid paths?
   - What happens if IDE is not connected?
   - What are timeout behaviors?

4. **Common Patterns**
   - The `projectPath` parameter appears in many tools - when is it required?
   - How do `timeout` and `maxLinesCount` interact?
   - What does `truncateMode` do?

## Output Artifacts

Create these files in `specs/jetbrains-mcp-skill/outputs/`:

### 1. `tool-inventory.md`

For each tool, document:

```markdown
## mcp__jetbrains__[tool_name]

**Purpose**: [One-line description]

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| ... | ... | ... | ... | ... |

**Returns**: [Description of return value]

**Example Usage**:
```
[Tool call example]
```

**Notes**: [Edge cases, gotchas, tips]
```

### 2. `tool-dependencies.md`

Document cross-cutting concerns:

```markdown
## Common Parameters

### projectPath
- Which tools require it?
- What happens if omitted?
- How to determine correct value?

### timeout
- Default values per tool
- Recommended values for different operations

### truncateMode
- Available options: START, MIDDLE, END, NONE
- When to use each
```

## Verification Steps

After completing research:

```bash
# Verify outputs exist
ls -la specs/jetbrains-mcp-skill/outputs/

# Check markdown validity
head -50 specs/jetbrains-mcp-skill/outputs/tool-inventory.md
```

## Success Criteria

Phase 0 is complete when:

- [ ] All 20+ tools documented in `tool-inventory.md`
- [ ] Each tool has parameters, returns, and example documented
- [ ] `tool-dependencies.md` covers common parameter patterns
- [ ] Edge cases and error conditions noted
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings
- [ ] `HANDOFF_P1.md` created for Phase 1
- [ ] `P1_ORCHESTRATOR_PROMPT.md` created

## Reference Files

- **Spec README**: `specs/jetbrains-mcp-skill/README.md`
- **Similar skill**: `.claude/skills/playwright-mcp.md` (pattern to follow)
- **REFLECTION_LOG**: `specs/jetbrains-mcp-skill/REFLECTION_LOG.md`

## Notes

- The JetBrains MCP server must be running (IDE must be open)
- Tools use paths relative to project root
- The IDE provides intelligent features like indexing, inspections
- Results are limited and may require pagination for large codebases
