# Skill File Outline

> Proposed structure for `.claude/skills/jetbrains-mcp.md`

---

## Design Decision: Hybrid Structure (Option C)

After analyzing the Playwright skill (283 lines), I recommend a **Hybrid structure** that provides:
1. Quick task-based lookup (what do I need → which tool)
2. Condensed tool reference (high-value tools only)
3. Essential workflows (abbreviated, not comprehensive)
4. Clear JetBrains vs Standard guidance

### Rationale

- **Task-oriented sections** help Claude select the right tool quickly
- **Tool tables** (like Playwright) provide scannable reference
- **Abbreviated workflows** give patterns without bloating the file
- **Troubleshooting** addresses the most common issues

---

## Proposed Structure

```markdown
---
paths:
  - "**/*"
---

# JetBrains MCP Integration Skill

Use JetBrains MCP tools alongside standard Claude Code tools for IDE-enhanced development.

## When to Invoke                                    (~15 lines)

List of scenarios where JetBrains MCP adds value over standard tools.

## Critical: Project Path                            (~10 lines)

All JetBrains tools require `projectPath`. Brief explanation + example.

## Quick Reference: Tool Selection                   (~40 lines)

| Task | Preferred Tool | Why |
|------|----------------|-----|
| Rename symbol | JetBrains `rename_refactoring` | Semantic, project-wide |
| Read file | Standard `Read` | Simpler API |
| ... | ... | ... |

## JetBrains-Only Capabilities                       (~30 lines)

Tools with NO standard equivalent:
- `rename_refactoring` - with example
- `get_file_problems` - with example
- `get_all_open_file_paths` - with example
- `get_project_modules` - with example

## Tool Reference                                    (~80 lines)

### Code Intelligence
| Tool | Purpose |
|------|---------|
| `mcp__jetbrains__get_symbol_info` | ... |

### File Operations
...

### Search & Navigation
...

### Execution
...

## Common Workflows                                  (~50 lines)

### Bug Investigation (abbreviated)
### Safe Refactoring (abbreviated)
### Project Exploration (abbreviated)

## Troubleshooting                                   (~30 lines)

### File Not Found
### Timeout Errors
### Confirmation Required
### MCP Server Not Responding

## Related                                           (~5 lines)

Links to full documentation in specs/
```

---

## Estimated Line Counts

| Section | Lines | Notes |
|---------|-------|-------|
| Frontmatter + Header | 10 | Standard |
| When to Invoke | 15 | Bullet list of scenarios |
| Critical: Project Path | 10 | Must-know configuration |
| Quick Reference | 40 | Decision table |
| JetBrains-Only | 30 | 4 unique tools with examples |
| Tool Reference | 80 | Tables by category |
| Common Workflows | 50 | 3 abbreviated workflows |
| Troubleshooting | 30 | 4 common issues |
| Related | 5 | Links |
| **Total** | **270** | Within 200-300 target |

---

## Section Details

### 1. When to Invoke (~15 lines)

Invoke this skill when:
- Renaming symbols (functions, classes, variables) across the project
- Running comprehensive code inspections (more thorough than LSP)
- Understanding IDE context (open files, project structure)
- Using IDE run configurations for builds/tests
- Working with monorepo module structure
- Applying IDE code style formatting

### 2. Critical: Project Path (~10 lines)

```typescript
// ALL JetBrains tools require projectPath
mcp__jetbrains__get_file_problems({
  filePath: "src/User.ts",        // Relative to project
  projectPath: "/path/to/project" // Absolute path to project root
})
```

Note about how to determine `projectPath` (directory containing `.idea/`).

### 3. Quick Reference: Tool Selection (~40 lines)

Table mapping tasks to recommended tools with brief rationale:

| Task | Use This | Not This | Why |
|------|----------|----------|-----|
| Rename symbol | JetBrains `rename_refactoring` | Standard `Edit` | Semantic, won't rename strings |
| Read file | Standard `Read` | JetBrains `get_file_text_by_path` | Simpler, no truncate config |
| Precise edit | Standard `Edit` | JetBrains `replace_text_in_file` | Unique string matching |
| File diagnostics | JetBrains `get_file_problems` | LSP diagnostics | IntelliJ inspections |
| Go to definition | Standard `LSP` | N/A | JetBrains lacks this |
| Find references | Standard `LSP` | N/A | JetBrains lacks this |
| Find by filename | JetBrains `find_files_by_name_keyword` | Standard `Glob` | Indexed, faster |
| Find by pattern | Standard `Glob` | JetBrains `find_files_by_glob` | Simpler API |
| Run command | Standard `Bash` | JetBrains `execute_terminal_command` | No confirmation |
| Directory tree | JetBrains `list_directory_tree` | `Bash tree` | Better format |

### 4. JetBrains-Only Capabilities (~30 lines)

These tools have NO standard equivalent:

**`rename_refactoring`** - Semantic symbol rename
```typescript
mcp__jetbrains__rename_refactoring({
  pathInProject: "src/UserService.ts",
  symbolName: "getUserById",
  newName: "findUserById",
  projectPath: "/path/to/project"
})
// Updates ALL references, respects semantics
```

**`get_file_problems`** - IntelliJ inspections
```typescript
mcp__jetbrains__get_file_problems({
  filePath: "src/User.ts",
  errorsOnly: false,  // Include warnings
  timeout: 30000,
  projectPath: "/path/to/project"
})
```

**`get_all_open_file_paths`** - IDE context
**`get_project_modules`** - Monorepo structure

### 5. Tool Reference (~80 lines)

Tables organized by category (like Playwright skill):
- Code Intelligence (3 tools)
- File Operations (5 tools - abbreviated to 3 high-value)
- Search & Navigation (4 key tools)
- Execution (3 tools)

Each table: Tool name | Purpose (one line)

### 6. Common Workflows (~50 lines)

**Bug Investigation**
1. Find file → JetBrains `find_files_by_name_keyword`
2. Read file → Standard `Read`
3. Check problems → JetBrains `get_file_problems`
4. Make fix → Standard `Edit`
5. Verify → JetBrains `get_file_problems`

**Safe Refactoring**
1. Find references → Standard `LSP findReferences`
2. Rename → JetBrains `rename_refactoring`
3. Verify → `bun run check`

**Project Exploration**
1. Directory tree → JetBrains `list_directory_tree`
2. Open files → JetBrains `get_all_open_file_paths`
3. Modules → JetBrains `get_project_modules`
4. Read key files → Standard `Read`

### 7. Troubleshooting (~30 lines)

| Error | Solution |
|-------|----------|
| File not found | Use relative paths from project root |
| Timeout | Increase timeout, narrow search scope |
| Confirmation required | Brave Mode in IDE settings, or use Standard `Bash` |
| MCP not responding | Check IDE is running, project is open, version 2025.2+ |

### 8. Related (~5 lines)

- Full tool documentation: `specs/jetbrains-mcp-skill/outputs/tool-inventory.md`
- Detailed workflows: `specs/jetbrains-mcp-skill/outputs/workflow-analysis.md`
- Decision tree: `specs/jetbrains-mcp-skill/outputs/decision-tree.md`

---

## What's Excluded (to meet line target)

1. **Full parameter tables** - Reference full inventory instead
2. **Comprehensive workflows** - Reference workflow-analysis.md
3. **Performance tiers** - Too detailed for quick reference
4. **All 20 tools** - Focus on 12-14 high-value tools
5. **Output format details** - Only mention `||` highlighting briefly

---

## Comparison with Playwright Skill

| Aspect | Playwright Skill | JetBrains Skill (Proposed) |
|--------|------------------|---------------------------|
| Lines | 283 | ~270 |
| Tool count | 20 | 14 (high-value subset) |
| Workflows | 7 detailed | 3 abbreviated |
| Examples | Full code blocks | Compact snippets |
| Troubleshooting | 4 issues | 4 issues |
| Structure | Tool-oriented | Hybrid (task + tool) |

---

## Next Steps for Phase 3

1. Write the actual skill file following this outline
2. Validate line count stays within 200-300
3. Test tool examples for accuracy
4. Cross-reference with existing Playwright skill for consistency
