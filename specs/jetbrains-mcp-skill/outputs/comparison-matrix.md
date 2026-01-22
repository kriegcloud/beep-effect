# JetBrains MCP vs Standard Claude Code Tools

> Comprehensive comparison to determine when to use JetBrains MCP tools vs standard Claude Code tools.

---

## Quick Decision Summary

| Scenario | Recommended Approach |
|----------|---------------------|
| **Safe refactoring** | JetBrains `rename_refactoring` |
| **Code inspection/diagnostics** | JetBrains `get_file_problems` |
| **Find files by name** | JetBrains `find_files_by_name_keyword` (indexed) |
| **Find files by pattern** | Standard `Glob` (simpler API) |
| **Read single file** | Standard `Read` (no truncation config needed) |
| **Edit file** | Standard `Edit` (precise line-based editing) |
| **Content search** | Either - depends on context |
| **Run commands** | Standard `Bash` (no confirmation needed) |
| **Understand symbol** | JetBrains `get_symbol_info` |
| **Project structure** | JetBrains `list_directory_tree` |

---

## Detailed Comparison Matrix

### File Discovery

| Operation | Standard Tool | JetBrains Tool | Winner | Rationale |
|-----------|---------------|----------------|--------|-----------|
| Find by filename | `Glob` | `find_files_by_name_keyword` | **JetBrains** | Uses IDE indexes, much faster on large codebases |
| Find by glob pattern | `Glob` | `find_files_by_glob` | **Standard** | Simpler API, no timeout/limit config required |
| Find all `.ts` files | `Glob("**/*.ts")` | `find_files_by_glob("**/*.ts")` | **Standard** | Equal results, fewer params |
| Find "Service" files | `Glob("**/*Service*")` | `find_files_by_name_keyword("Service")` | **JetBrains** | Indexed search beats filesystem walk |

**Analysis:**
- `find_files_by_name_keyword` is optimized for partial filename matches using IDE indexes
- `Glob` is simpler for complex patterns but walks filesystem
- JetBrains tools require timeout/limit configuration overhead

---

### File Reading

| Operation | Standard Tool | JetBrains Tool | Winner | Rationale |
|-----------|---------------|----------------|--------|-----------|
| Read entire file | `Read` | `get_file_text_by_path` | **Standard** | No truncation config needed |
| Read large file | `Read` (offset/limit) | `get_file_text_by_path` (truncateMode) | **Tie** | Both handle well, different approaches |
| Read with line numbers | `Read` (built-in) | `get_file_text_by_path` | **Standard** | Read shows line numbers by default |
| Read unsaved changes | N/A | `get_file_text_by_path` | **JetBrains** | Reads from IDE's virtual file system |

**Analysis:**
- Standard `Read` is simpler - just provide path
- JetBrains requires `truncateMode` and `maxLinesCount` even for small files
- JetBrains can read unsaved IDE buffers - useful for live collaboration

**JetBrains Truncation Modes:**
| Mode | Keep | Best For |
|------|------|----------|
| `START` | End of file | Log files (recent entries) |
| `MIDDLE` | Start and end | Overview of long content |
| `END` | Start of file | Source files (imports, declarations) |
| `NONE` | Everything | Small files only |

---

### File Editing

| Operation | Standard Tool | JetBrains Tool | Winner | Rationale |
|-----------|---------------|----------------|--------|-----------|
| Precise line edit | `Edit` | `replace_text_in_file` | **Standard** | Edit has unique string guarantee |
| Find/replace all | `Edit (replace_all)` | `replace_text_in_file (replaceAll)` | **Tie** | Equivalent functionality |
| Multi-line replacement | `Edit` | `replace_text_in_file` | **Standard** | Edit handles context better |
| Symbol rename | Manual `Edit` | `rename_refactoring` | **JetBrains** | Project-wide, semantic-aware |
| Create new file | `Write` | `create_new_file` | **Tie** | Both create with content |

**Analysis:**
- Standard `Edit` uses unique string matching - prevents wrong-location edits
- JetBrains `replace_text_in_file` is plain find/replace - less safe
- `rename_refactoring` is categorically better for symbol renames

**Key Difference:**
```typescript
// Standard Edit - requires unique context
Edit({
  file_path: "src/UserService.ts",
  old_string: "const getUserById = (id: string) =>",
  new_string: "const findUserById = (id: string) =>"
})

// JetBrains replace - basic find/replace
replace_text_in_file({
  pathInProject: "src/UserService.ts",
  oldText: "getUserById",
  newText: "findUserById",
  replaceAll: true  // Might rename unintended matches!
})

// JetBrains rename - semantic, safe
rename_refactoring({
  pathInProject: "src/UserService.ts",
  symbolName: "getUserById",
  newName: "findUserById"  // Only renames the symbol, not string literals
})
```

---

### Content Search

| Operation | Standard Tool | JetBrains Tool | Winner | Rationale |
|-----------|---------------|----------------|--------|-----------|
| Simple text search | `Grep` | `search_in_files_by_text` | **Tie** | Both effective |
| Regex search | `Grep` | `search_in_files_by_regex` | **Tie** | Both support regex |
| Scoped search | `Grep (path)` | `search_in_files (directoryToSearch)` | **Tie** | Both support scoping |
| File type filter | `Grep (glob/type)` | `search_in_files (fileMask)` | **Tie** | Both support filtering |

**JetBrains Search Output Format:**
```
Matches are highlighted with || delimiters:
"some text ||TODO|| fix this later"
```

**Analysis:**
- Results are comparable in most scenarios
- JetBrains uses IDE's search engine with indexing
- Standard Grep uses ripgrep - also very fast
- Choose based on what's more convenient in context

---

### Code Intelligence

| Operation | Standard Tool | JetBrains Tool | Winner | Rationale |
|-----------|---------------|----------------|--------|-----------|
| Symbol information | `LSP hover` | `get_symbol_info` | **JetBrains** | Full Quick Documentation |
| File diagnostics | `LSP diagnostics` | `get_file_problems` | **JetBrains** | IntelliJ inspections are more comprehensive |
| Go to definition | `LSP goToDefinition` | N/A | **Standard** | JetBrains has no equivalent |
| Find references | `LSP findReferences` | N/A | **Standard** | JetBrains has no equivalent |
| Safe rename | Manual | `rename_refactoring` | **JetBrains** | Project-wide semantic rename |

**Analysis:**
- JetBrains `get_file_problems` uses IntelliJ's inspection engine - more thorough than LSP diagnostics
- JetBrains `get_symbol_info` returns Quick Documentation - types, signatures, JSDoc
- Standard `LSP` has navigation features JetBrains lacks
- **Best strategy**: Use JetBrains for diagnostics/refactoring, LSP for navigation

**Diagnostic Comparison:**
```typescript
// LSP diagnostics - basic type errors
LSP({ operation: "diagnostics", filePath: "src/User.ts" })

// JetBrains problems - type errors + inspections
get_file_problems({
  filePath: "src/User.ts",
  errorsOnly: false,  // Include warnings
  timeout: 30000
})
// Returns: unused imports, complexity warnings, code style issues, etc.
```

---

### Execution

| Operation | Standard Tool | JetBrains Tool | Winner | Rationale |
|-----------|---------------|----------------|--------|-----------|
| Run shell command | `Bash` | `execute_terminal_command` | **Standard** | No confirmation required |
| Run build | `Bash npm run build` | `execute_run_configuration` | **Tie** | JetBrains if config exists |
| Run tests | `Bash npm test` | `execute_run_configuration` | **Tie** | JetBrains for IDE coverage |
| Background process | `Bash (run_in_background)` | N/A | **Standard** | JetBrains waits for completion |

**Analysis:**
- Standard `Bash` runs immediately without confirmation
- JetBrains execution tools require user confirmation (unless Brave Mode enabled)
- JetBrains `execute_run_configuration` uses IDE's run configs - good for complex setups
- JetBrains terminal output capped at 2000 lines

**Confirmation Behavior:**
| Tool | Default | Brave Mode |
|------|---------|------------|
| `Bash` | No confirmation | N/A |
| `execute_terminal_command` | **Requires confirmation** | No confirmation |
| `execute_run_configuration` | **Requires confirmation** | No confirmation |

---

### Project Structure

| Operation | Standard Tool | JetBrains Tool | Winner | Rationale |
|-----------|---------------|----------------|--------|-----------|
| Directory tree | `Bash tree/ls` | `list_directory_tree` | **JetBrains** | Better formatting, depth control |
| List open files | N/A | `get_all_open_file_paths` | **JetBrains** | Unique capability |
| Project modules | N/A | `get_project_modules` | **JetBrains** | Unique capability |
| Dependencies | `Read package.json` | `get_project_dependencies` | **JetBrains** | Works across build systems |
| VCS roots | `Bash git` | `get_repositories` | **Tie** | JetBrains for multi-repo |

**Analysis:**
- JetBrains has unique project-awareness features
- `get_all_open_file_paths` useful for understanding user context
- `get_project_modules` valuable for monorepos
- `get_project_dependencies` works with Maven, Gradle, npm, etc.

---

## Feature Gaps

### JetBrains Has, Standard Lacks

| Feature | JetBrains Tool | Workaround |
|---------|----------------|------------|
| Semantic rename | `rename_refactoring` | Manual multi-file Edit |
| IntelliJ inspections | `get_file_problems` | LSP diagnostics (less thorough) |
| Open files list | `get_all_open_file_paths` | None |
| IDE code style | `reformat_file` | Bash with formatter CLI |
| Run configurations | `get/execute_run_configuration` | Bash with manual commands |
| Project modules | `get_project_modules` | Read build files |

### Standard Has, JetBrains Lacks

| Feature | Standard Tool | Workaround |
|---------|---------------|------------|
| Go to definition | `LSP goToDefinition` | None - must use LSP |
| Find references | `LSP findReferences` | Text search (less accurate) |
| Call hierarchy | `LSP incomingCalls/outgoingCalls` | None |
| Background execution | `Bash (run_in_background)` | None - must wait |
| Unlimited output | `Bash` | None - 2000 line cap |

---

## Summary Recommendations

### Always Use JetBrains For

1. **Safe refactoring** - `rename_refactoring` is categorically better
2. **Comprehensive diagnostics** - `get_file_problems` finds more issues
3. **Understanding symbols** - `get_symbol_info` provides full documentation
4. **Fast filename search** - `find_files_by_name_keyword` uses indexes
5. **Project structure** - `list_directory_tree`, `get_project_modules`
6. **User context** - `get_all_open_file_paths` shows what user is working on

### Always Use Standard For

1. **Simple file reads** - `Read` has simpler API
2. **Precise edits** - `Edit` unique string matching is safer
3. **Quick commands** - `Bash` runs without confirmation
4. **Code navigation** - `LSP` has goToDefinition/findReferences
5. **Background tasks** - `Bash` supports background execution
6. **Glob patterns** - `Glob` for complex file patterns

### Use Either (Context-Dependent)

1. **Content search** - Both Grep and JetBrains search work well
2. **File creation** - Both Write and create_new_file work
3. **Build/test execution** - Depends on whether IDE configs exist
