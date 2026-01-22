# JetBrains MCP Skill Specification

## Overview

This specification orchestrates the research, design, planning, and implementation of a `.claude/skills/jetbrains-mcp.md` skill that enables Claude to effectively use the JetBrains MCP server tools when assisting with development in WebStorm (or other JetBrains IDEs).

## Problem Statement

The JetBrains MCP server exposes 20+ tools for IDE integration:

| Category | Tools | Purpose |
|----------|-------|---------|
| **Code Intelligence** | `get_symbol_info`, `get_file_problems`, `rename_refactoring`, `build_project` | IDE-powered analysis |
| **File Operations** | `get_file_text_by_path`, `replace_text_in_file`, `create_new_file`, `reformat_file` | IDE-aware editing |
| **Search** | `find_files_by_name_keyword`, `find_files_by_glob`, `search_in_files_by_text`, `search_in_files_by_regex` | Indexed searching |
| **Execution** | `get_run_configurations`, `execute_run_configuration`, `execute_terminal_command` | Task running |
| **Project Structure** | `list_directory_tree`, `get_project_modules`, `get_project_dependencies` | Project navigation |

**Current Issues:**

- No structured guidance on when to prefer JetBrains tools over standard file tools
- Tool capabilities and limitations undocumented
- No workflow patterns for common development tasks
- Missing decision criteria for tool selection

## Solution

Create a comprehensive skill that:

1. **Documents all JetBrains MCP tools** with clear purposes and parameter guidance
2. **Provides decision criteria** for when to use JetBrains tools vs standard tools
3. **Defines common workflows** for development assistance
4. **Includes troubleshooting guidance** for IDE connection issues

## Phases

### Phase 0: Discovery - Tool Capability Research

**Goal**: Exhaustively document all JetBrains MCP tools and their capabilities.

**Tasks**:
1. Extract complete tool schemas from MCP server
2. Document parameter requirements and optional fields
3. Identify tool interdependencies (e.g., need `projectPath` consistently)
4. Test each tool to understand behavior and edge cases
5. Document error conditions and handling

**Sub-Agents**:
- `codebase-researcher` - Find existing JetBrains tool usage patterns
- `mcp-researcher` - Research official JetBrains MCP documentation

**Outputs**:
- `outputs/tool-inventory.md` - Complete tool documentation
- `outputs/tool-dependencies.md` - Parameter requirements and relationships

### Phase 1: Analysis - Workflow Pattern Identification

**Goal**: Identify optimal workflows for common development tasks.

**Tasks**:
1. Map development tasks to JetBrains tools
2. Compare JetBrains tools vs standard Claude Code tools
3. Identify scenarios where JetBrains tools provide advantages
4. Document scenarios where standard tools are preferable
5. Design decision tree for tool selection

**Comparison Matrix to Build**:

| Task | Standard Tool | JetBrains Tool | Advantage |
|------|---------------|----------------|-----------|
| Find files by name | `Glob` | `find_files_by_name_keyword` | ? |
| Read file | `Read` | `get_file_text_by_path` | ? |
| Edit file | `Edit` | `replace_text_in_file` | ? |
| Search content | `Grep` | `search_in_files_by_text` | ? |
| Get errors | LSP `getDiagnostics` | `get_file_problems` | ? |
| Rename symbol | Manual edit | `rename_refactoring` | ? |

**Outputs**:
- `outputs/workflow-analysis.md` - Task-to-tool mapping
- `outputs/comparison-matrix.md` - JetBrains vs standard tool comparison
- `outputs/decision-tree.md` - Tool selection criteria

### Phase 2: Design - Skill Architecture

**Goal**: Design the skill structure and content organization.

**Tasks**:
1. Define skill frontmatter (paths, triggers)
2. Structure tool documentation sections
3. Design workflow examples
4. Create troubleshooting section
5. Define related skill references

**Skill Structure**:

```markdown
---
paths:
  - "**/*"
---
# JetBrains MCP Development Skill

## When to Invoke
[Decision criteria for using JetBrains tools]

## Available Tools
[Categorized tool reference]

## Common Workflows
[Step-by-step patterns]

## Tool Selection Guide
[Decision tree / comparison matrix]

## Troubleshooting
[Connection issues, error handling]

## Related Skills
[Links to other skills]
```

**Outputs**:
- `outputs/skill-outline.md` - Detailed skill structure
- `templates/skill.template.md` - Skill file template

### Phase 3: Implementation - Skill Creation

**Goal**: Write the complete skill file.

**Tasks**:
1. Write skill frontmatter
2. Document all tools with examples
3. Write workflow patterns with concrete examples
4. Create decision criteria section
5. Add troubleshooting guidance
6. Link to related skills

**Deliverable**:
- `.claude/skills/jetbrains-mcp.md`

### Phase 4: Validation - Testing and Refinement

**Goal**: Verify skill effectiveness and iterate.

**Tasks**:
1. Test skill in real development sessions
2. Validate tool documentation accuracy
3. Refine decision criteria based on experience
4. Update workflows based on edge cases discovered
5. Document learnings in REFLECTION_LOG.md

**Outputs**:
- `outputs/validation-report.md` - Testing results
- Updated `.claude/skills/jetbrains-mcp.md`

## Success Criteria

1. **Complete Tool Coverage**: All 20+ JetBrains MCP tools documented
2. **Clear Decision Criteria**: Unambiguous guidance on when to use each tool
3. **Practical Workflows**: 5+ common development workflows documented
4. **Working Examples**: Every tool has at least one usage example
5. **Troubleshooting Guide**: Common issues and solutions documented
6. **IDE Independence**: Works for WebStorm, IntelliJ, PyCharm, etc.

## Documentation

| Document | Purpose |
|----------|---------|
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Methodology learnings |
| [outputs/](./outputs/) | Phase artifacts |
| [handoffs/](./handoffs/) | Phase transition documents |

## Handoffs

| Phase | Document | Status |
|-------|----------|--------|
| P0 | [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | Ready to start |
| P0 | [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | Copy-paste prompt |

## Key Agents Used

| Agent | Role in Spec |
|-------|--------------|
| `codebase-researcher` | Find existing tool usage patterns |
| `mcp-researcher` | Research official documentation |
| `doc-writer` | Write skill documentation |
| `reflector` | Synthesize learnings and improve prompts |

## Verification

```bash
# After skill creation
bun run lint:fix

# Test skill activation (skill should be recognized)
# Check .claude/skills/jetbrains-mcp.md exists and has valid frontmatter
```

## JetBrains MCP Tools Reference

Quick reference for tools to document:

### Code Intelligence
- `mcp__jetbrains__get_symbol_info` - Quick Documentation at position
- `mcp__jetbrains__get_file_problems` - IntelliJ inspections
- `mcp__jetbrains__rename_refactoring` - Context-aware rename
- `mcp__jetbrains__build_project` - Trigger compilation

### File Operations
- `mcp__jetbrains__get_file_text_by_path` - Read file (IDE-aware)
- `mcp__jetbrains__replace_text_in_file` - Replace with regex support
- `mcp__jetbrains__create_new_file` - Create with auto-directories
- `mcp__jetbrains__reformat_file` - Apply code style
- `mcp__jetbrains__open_file_in_editor` - Open in IDE

### Search & Navigation
- `mcp__jetbrains__find_files_by_name_keyword` - Fast indexed search
- `mcp__jetbrains__find_files_by_glob` - Glob pattern search
- `mcp__jetbrains__search_in_files_by_text` - Project-wide text search
- `mcp__jetbrains__search_in_files_by_regex` - Project-wide regex search
- `mcp__jetbrains__list_directory_tree` - Directory tree view
- `mcp__jetbrains__get_all_open_file_paths` - Currently open files

### Project Structure
- `mcp__jetbrains__get_project_modules` - List modules
- `mcp__jetbrains__get_project_dependencies` - List dependencies
- `mcp__jetbrains__get_repositories` - VCS roots

### Execution
- `mcp__jetbrains__get_run_configurations` - List run configs
- `mcp__jetbrains__execute_run_configuration` - Run a config
- `mcp__jetbrains__execute_terminal_command` - Run shell command

## Related Documentation

- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md) - Spec patterns
- [playwright-mcp.md](../../.claude/skills/playwright-mcp.md) - Similar skill pattern
- [CLAUDE.md](../../CLAUDE.md) - Root configuration
