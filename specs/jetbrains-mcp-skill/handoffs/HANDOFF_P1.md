# Phase 1 Handoff: Analysis - Workflow Pattern Identification

## Context

Phase 0 (Discovery) is complete. We have comprehensive documentation of all 20 JetBrains MCP tools in:
- `outputs/tool-inventory.md` - Complete tool documentation
- `outputs/tool-dependencies.md` - Common parameters and relationships

## Phase 1 Mission

Identify optimal workflows and create decision criteria for when to use JetBrains tools vs standard Claude Code tools.

## Key Questions to Answer

### 1. Tool Comparison Matrix

For each task type, compare JetBrains vs standard tools:

| Task | Standard Tool | JetBrains Tool | Advantage? |
|------|---------------|----------------|------------|
| Find files by name | `Glob` | `find_files_by_name_keyword` | JetBrains (indexed, faster?) |
| Find files by pattern | `Glob` | `find_files_by_glob` | Standard (simpler?) |
| Read file | `Read` | `get_file_text_by_path` | Standard (no truncation limits?) |
| Edit file | `Edit` | `replace_text_in_file` | Standard (more precise?) |
| Search content | `Grep` | `search_in_files_by_text` | ? |
| Get diagnostics | `LSP` | `get_file_problems` | JetBrains (more inspections?) |
| Rename symbol | Manual + `Edit` | `rename_refactoring` | JetBrains (project-wide, safe) |
| Run commands | `Bash` | `execute_terminal_command` | Standard (no confirmation?) |
| Directory listing | `Bash ls` | `list_directory_tree` | JetBrains (prettier?) |

### 2. When to Prefer JetBrains Tools

Hypotheses to validate:
- **Use JetBrains for IDE-powered features**: Inspections, refactoring, symbol info
- **Use JetBrains for indexed searches**: `find_files_by_name_keyword` faster than `Glob`
- **Use standard for simple file ops**: Read/Edit more direct than JetBrains equivalents
- **Use JetBrains when IDE context matters**: Open files, code style, run configs

### 3. Workflow Patterns to Document

1. **Bug Investigation Workflow**
   - Find file with issue
   - Get file problems
   - Read file content
   - Make fix
   - Verify no new problems

2. **Refactoring Workflow**
   - Understand symbol
   - Rename across project
   - Verify no errors

3. **Code Search Workflow**
   - Find files
   - Search content
   - Read context
   - Understand usage

4. **Build/Test Workflow**
   - List run configurations
   - Execute appropriate config
   - Analyze output

5. **Project Exploration Workflow**
   - Directory tree
   - Open files
   - Get module structure

## Tasks

1. **Compare tools empirically** (if JetBrains MCP available)
   - Test same operation with both tools
   - Measure response time
   - Compare output quality/completeness

2. **Create comparison matrix** (`outputs/comparison-matrix.md`)
   - Task → Tool mapping
   - Pros/cons of each approach
   - Clear recommendations

3. **Design decision tree** (`outputs/decision-tree.md`)
   - Flowchart for tool selection
   - Based on task characteristics

4. **Document workflows** (`outputs/workflow-analysis.md`)
   - Step-by-step patterns
   - When to use which tool

## Inputs Available

### From Phase 0

- **Tool Inventory**: `outputs/tool-inventory.md`
  - All 20 tools documented
  - Parameters, returns, examples

- **Tool Dependencies**: `outputs/tool-dependencies.md`
  - Common parameters
  - Tool relationships
  - Performance considerations

### Reference Skills

- **Playwright MCP Skill**: `.claude/skills/playwright-mcp.md`
  - Example of workflow documentation
  - Pattern for troubleshooting section

## Success Criteria

Phase 1 is complete when:

- [ ] `outputs/comparison-matrix.md` created with tool comparisons
- [ ] `outputs/decision-tree.md` created with selection criteria
- [ ] `outputs/workflow-analysis.md` created with 5+ workflows
- [ ] Clear guidance on when to use JetBrains vs standard tools
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `HANDOFF_P2.md` created for Phase 2

## Key Insights from Phase 0

1. **All tools require `projectPath`** - This is universal, must always be provided
2. **Indexed search is faster** - `find_files_by_name_keyword` preferred over `find_files_by_glob`
3. **Brave Mode affects execution** - Terminal and run configs need confirmation by default
4. **No `build_project` tool** - Use `execute_run_configuration` with build config instead
5. **Version requirement**: JetBrains IDE 2025.2+ needed for built-in MCP support

## Notes for Phase 1 Agent

- Focus on practical guidance, not just documentation
- Consider when user already has IDE open vs starting fresh
- Think about error recovery scenarios
- Consider monorepo vs single-project workflows
- Document any edge cases discovered
