---
paths:
  - "**/*"
---

# JetBrains MCP Integration Skill

Use JetBrains MCP tools alongside standard Claude Code tools for IDE-enhanced development. These tools leverage IntelliJ's code intelligence for operations that benefit from semantic understanding.

## When to Invoke

Invoke this skill when:
- Renaming symbols (functions, classes, variables) across the project
- Running comprehensive code inspections (more thorough than LSP)
- Understanding IDE context (open files, project structure)
- Using IDE run configurations for builds/tests
- Working with monorepo module structure
- Needing fast indexed filename search

Do NOT use JetBrains tools when:
- Reading files (Standard `Read` is simpler)
- Making precise edits (Standard `Edit` is safer)
- Running quick shell commands (Standard `Bash` needs no confirmation)
- Finding code references (Standard `LSP findReferences` - JetBrains lacks this)
- Going to definitions (Standard `LSP goToDefinition` - JetBrains lacks this)

## Critical: Project Path

ALL JetBrains tools require `projectPath` - the absolute path to the project root containing `.idea/`.

```typescript
// CORRECT - Every JetBrains tool call needs projectPath
mcp__jetbrains__get_file_problems({
  filePath: "src/User.ts",           // Relative to project
  errorsOnly: false,
  timeout: 30000,
  projectPath: "/home/user/project"  // Absolute path to project root
})
```

---

## Quick Reference: Tool Selection

| Task | Preferred | Alternative | Why Prefer |
|------|-----------|-------------|------------|
| Rename symbol | JetBrains `rename_refactoring` | Standard `Edit` | Semantic, project-wide, won't rename strings |
| File diagnostics | JetBrains `get_file_problems` | LSP diagnostics | IntelliJ inspections find more issues |
| Symbol info | JetBrains `get_symbol_info` | LSP hover | Full Quick Documentation |
| Find by filename | JetBrains `find_files_by_name_keyword` | Standard `Glob` | Indexed, much faster |
| Directory tree | JetBrains `list_directory_tree` | `Bash tree` | Better format, depth control |
| Open files context | JetBrains `get_all_open_file_paths` | N/A | Unique capability |
| Project modules | JetBrains `get_project_modules` | N/A | Unique for monorepos |
| Read file | Standard `Read` | JetBrains `get_file_text_by_path` | Simpler API |
| Precise edit | Standard `Edit` | JetBrains `replace_text_in_file` | Unique string matching is safer |
| Run command | Standard `Bash` | JetBrains `execute_terminal_command` | No confirmation needed |
| Find references | Standard `LSP` | N/A | JetBrains lacks this |
| Go to definition | Standard `LSP` | N/A | JetBrains lacks this |
| Glob patterns | Standard `Glob` | JetBrains `find_files_by_glob` | Simpler API |

---

## JetBrains-Only Capabilities

These tools have NO standard equivalent:

### `rename_refactoring` - Semantic Symbol Rename

```typescript
mcp__jetbrains__rename_refactoring({
  pathInProject: "src/services/UserService.ts",
  symbolName: "getUserById",
  newName: "findUserById",
  projectPath: "/home/user/project"
})
// Updates ALL references across project, respects semantics
// Won't rename string literals containing same text
```

### `get_file_problems` - IntelliJ Inspections

```typescript
mcp__jetbrains__get_file_problems({
  filePath: "src/components/Button.tsx",
  errorsOnly: false,    // Include warnings
  timeout: 30000,
  projectPath: "/home/user/project"
})
// Returns: type errors, unused imports, complexity warnings, code style issues
```

### `get_all_open_file_paths` - IDE Context

```typescript
mcp__jetbrains__get_all_open_file_paths({
  projectPath: "/home/user/project"
})
// Returns list of files open in IDE editor tabs
```

### `get_project_modules` - Monorepo Structure

```typescript
mcp__jetbrains__get_project_modules({
  projectPath: "/home/user/project"
})
// Returns module names and types for multi-module projects
```

---

## Tool Reference

### Code Intelligence

| Tool | Purpose |
|------|---------|
| `mcp__jetbrains__get_symbol_info` | Quick Documentation at cursor position |
| `mcp__jetbrains__get_file_problems` | IntelliJ inspections and errors |
| `mcp__jetbrains__rename_refactoring` | Safe project-wide symbol rename |

### File Operations

| Tool | Purpose |
|------|---------|
| `mcp__jetbrains__get_file_text_by_path` | Read file (can see unsaved IDE buffers) |
| `mcp__jetbrains__reformat_file` | Apply IDE code style |
| `mcp__jetbrains__replace_text_in_file` | Find and replace in file |
| `mcp__jetbrains__create_new_file` | Create file with content |

### Search & Navigation

| Tool | Purpose |
|------|---------|
| `mcp__jetbrains__find_files_by_name_keyword` | Fast indexed filename search |
| `mcp__jetbrains__list_directory_tree` | Tree view of directory structure |
| `mcp__jetbrains__search_in_files_by_text` | Project-wide text search |
| `mcp__jetbrains__get_all_open_file_paths` | Currently open IDE tabs |

### Project Structure

| Tool | Purpose |
|------|---------|
| `mcp__jetbrains__get_project_modules` | List monorepo modules |
| `mcp__jetbrains__get_project_dependencies` | Cross-platform dependency list |

### Execution

| Tool | Purpose |
|------|---------|
| `mcp__jetbrains__get_run_configurations` | List IDE run configs |
| `mcp__jetbrains__execute_run_configuration` | Run a specific config |
| `mcp__jetbrains__execute_terminal_command` | Run shell command in IDE terminal |

---

## Common Workflows

### Bug Investigation

1. Find file → JetBrains `find_files_by_name_keyword`
2. Read file → Standard `Read`
3. Check problems → JetBrains `get_file_problems`
4. Understand symbol → JetBrains `get_symbol_info`
5. Make fix → Standard `Edit`
6. Verify fix → JetBrains `get_file_problems`

### Safe Refactoring

1. Find references → Standard `LSP findReferences`
2. Rename symbol → JetBrains `rename_refactoring`
3. Verify build → Standard `Bash` or JetBrains `execute_run_configuration`
4. Check for issues → JetBrains `get_file_problems`

### Project Exploration

1. See structure → JetBrains `list_directory_tree`
2. Check user context → JetBrains `get_all_open_file_paths`
3. Understand modules → JetBrains `get_project_modules`
4. Find key files → JetBrains `find_files_by_name_keyword`
5. Read files → Standard `Read`

### Running Tests/Builds

```typescript
// First, discover available configs
mcp__jetbrains__get_run_configurations({
  projectPath: "/home/user/project"
})

// Then run a specific config
mcp__jetbrains__execute_run_configuration({
  configurationName: "npm run test",
  timeout: 120000,
  maxLinesCount: 500,
  truncateMode: "END",
  projectPath: "/home/user/project"
})
```

---

## Troubleshooting

### File Not Found

```
Error: file not found
```
**Solution:** Use paths relative to project root, not absolute paths. The `filePath` parameter should be `src/User.ts`, not `/home/user/project/src/User.ts`.

### Timeout Errors

```
Error: operation timed out
```
**Solution:** Increase the `timeout` parameter (in milliseconds). For large projects, use 30000-60000ms. Narrow search scope with `directoryToSearch` or `fileMask`.

### Confirmation Required

JetBrains execution tools (`execute_terminal_command`, `execute_run_configuration`) require user confirmation by default.

**Solutions:**
1. Enable **Brave Mode** in IDE Settings → Tools → MCP Server → "Allow write operations without confirmation"
2. Or use Standard `Bash` for quick commands (no confirmation needed)

### MCP Server Not Responding

**Checklist:**
- IDE version 2025.2+ (built-in MCP server required)
- Project is open in JetBrains IDE
- MCP Server is enabled in Settings → Tools → MCP Server
- Correct `projectPath` pointing to `.idea/` directory location

---

## Related

- Full tool documentation: `specs/jetbrains-mcp-skill/outputs/tool-inventory.md`
- Detailed workflows: `specs/jetbrains-mcp-skill/outputs/workflow-analysis.md`
- Decision tree: `specs/jetbrains-mcp-skill/outputs/decision-tree.md`
- Comparison matrix: `specs/jetbrains-mcp-skill/outputs/comparison-matrix.md`
