# JetBrains MCP Tool Dependencies

> Documentation of common parameters, cross-cutting concerns, and tool relationships.
>
> **Sources**: [WebStorm MCP Server](https://www.jetbrains.com/help/webstorm/mcp-server.html), [IntelliJ IDEA MCP Server](https://www.jetbrains.com/help/idea/mcp-server.html)

---

## Common Parameters

### projectPath

**Description**: The root directory of the project being worked on.

**Which tools require it**: **ALL tools** require this parameter.

**Type**: `string`

**What happens if omitted**: Tool call will fail - projectPath is always required.

**How to determine correct value**:
1. Use the directory containing the project's configuration files (`.idea/`, `package.json`, etc.)
2. If working directory is known, use that as projectPath
3. For monorepos, use the root workspace directory

**Example Values**:
```
/home/user/my-project
/Users/developer/projects/webapp
C:\Users\dev\projects\myapp
```

**Best Practice**: Always provide the absolute path to avoid ambiguity.

---

### timeout

**Description**: Maximum time (in milliseconds) to wait for the operation to complete.

**Which tools use it**:
| Tool | Required |
|------|----------|
| `execute_run_configuration` | Yes |
| `execute_terminal_command` | Yes |
| `get_file_problems` | Yes |
| `find_files_by_glob` | Yes |
| `find_files_by_name_keyword` | Yes |
| `search_in_files_by_text` | Yes |
| `search_in_files_by_regex` | Yes |
| `list_directory_tree` | Yes |

**Type**: `number` (milliseconds)

**Recommended values**:
| Operation Type | Recommended Timeout |
|----------------|---------------------|
| Simple file search | 5,000 - 10,000 ms |
| Project-wide search | 15,000 - 30,000 ms |
| File analysis/inspections | 30,000 - 60,000 ms |
| Build/test execution | 60,000 - 300,000 ms |
| Large codebase operations | 120,000+ ms |

**What happens on timeout**: Operation is cancelled and an error is returned.

---

### maxLinesCount

**Description**: Maximum number of lines to return in the output.

**Which tools use it**:
| Tool | Required |
|------|----------|
| `get_file_text_by_path` | Yes |
| `execute_run_configuration` | Yes |
| `execute_terminal_command` | Yes |

**Type**: `number`

**Constraints**:
- `execute_terminal_command`: Hard cap at **2000 lines** (regardless of specified value)
- Other tools: No documented hard cap

**Recommended values**:
| Use Case | Recommended Lines |
|----------|-------------------|
| Quick file peek | 100 - 200 |
| Full file read | 500 - 1000 |
| Log/output analysis | 500 - 1000 |
| Full output capture | 2000 (max for terminal) |

---

### truncateMode

**Description**: Strategy for truncating output when it exceeds the maximum line count.

**Which tools use it**:
| Tool | Required |
|------|----------|
| `get_file_text_by_path` | Yes |
| `execute_run_configuration` | Yes |
| `execute_terminal_command` | Yes |

**Type**: `string` (enum)

**Available options**:
| Value | Description | Best For |
|-------|-------------|----------|
| `START` | Truncate from the beginning, keep end | Log files (recent entries) |
| `MIDDLE` | Truncate from the middle, keep start and end | Overview of long content |
| `END` | Truncate from the end, keep beginning | Source files (top-level code) |
| `NONE` | No truncation (may fail on large content) | Small files only |

**Usage guidelines**:
- **Log output**: Use `START` to see most recent entries
- **Source code**: Use `END` to see imports and top declarations
- **Build output**: Use `END` to see final result/errors
- **Small files**: Use `NONE` when content is known to be small

---

### caseSensitive

**Description**: Whether text matching should be case-sensitive.

**Which tools use it**:
| Tool | Required |
|------|----------|
| `replace_text_in_file` | Yes |
| `search_in_files_by_text` | Yes |
| `search_in_files_by_regex` | Yes |

**Type**: `boolean`

**Guidelines**:
- Use `true` for code identifiers, imports, exact matches
- Use `false` for natural language search, comments, documentation
- Note: `find_files_by_name_keyword` is **always case-sensitive**

---

### fileMask / fileCountLimit / maxUsageCount

**Description**: Limits and filters for search operations.

**fileMask** (string, optional):
- File pattern filter (e.g., `*.ts`, `*.java`, `*.py`)
- Narrows search to specific file types
- Used by: `search_in_files_by_text`, `search_in_files_by_regex`

**fileCountLimit** (number, required):
- Maximum number of files to return
- Used by: `find_files_by_name_keyword`, `find_files_by_glob`
- Recommended: 50-100 for interactive use

**maxUsageCount** (number, required):
- Maximum number of search results/usages
- Used by: `search_in_files_by_text`, `search_in_files_by_regex`
- Recommended: 50-100 for most searches

---

## Tool Relationships & Dependencies

### File Reading Pipeline

```
find_files_by_name_keyword (discover file)
         ↓
get_file_text_by_path (read content)
         ↓
get_file_problems (analyze for issues)
```

### File Modification Pipeline

```
get_file_text_by_path (read current content)
         ↓
replace_text_in_file (make changes)
         ↓
reformat_file (apply code style)
```

### Search Workflow

```
search_in_files_by_text (find usages)
         ↓
get_file_text_by_path (read context)
         ↓
get_symbol_info (understand symbol)
```

### Refactoring Workflow

```
get_symbol_info (understand symbol)
         ↓
rename_refactoring (rename across project)
         ↓
get_file_problems (verify no errors introduced)
```

### Execution Workflow

```
get_run_configurations (list available)
         ↓
execute_run_configuration (run selected)
         OR
execute_terminal_command (custom command)
```

---

## Error Conditions

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `project dir not found` | Invalid `projectPath` | Verify path exists and is correct |
| `file not found` | File doesn't exist at path | Check file path is correct |
| `could not get document` | File can't be opened | Check file permissions and encoding |
| `no occurrences found` | Search/replace found nothing | Verify search text is correct |
| `timeout` | Operation took too long | Increase timeout value |

### Connection Errors

| Error | Cause | Solution |
|-------|-------|----------|
| MCP server not responding | IDE not running | Start JetBrains IDE |
| Connection refused | MCP server disabled | Enable MCP in IDE settings |
| Invalid project | Project not open in IDE | Open project in IDE |

---

## IDE Configuration

### Brave Mode

Located in: **Settings | Tools | MCP Server**

**When enabled**:
- `execute_run_configuration` runs without confirmation
- `execute_terminal_command` runs without confirmation

**When disabled** (default):
- User must confirm execution in IDE
- Safer for untrusted operations

### Transport Options

**STDIO (Standard I/O)**:
- IDE launches MCP server as subprocess
- Default for local development
- Requires NPM proxy for external clients

**Streamable HTTP**:
- MCP server accessible over HTTP
- Allows remote connections
- Better for IDE integrations

---

## Performance Considerations

### Fast Operations (< 100ms typical)
- `get_all_open_file_paths`
- `get_project_modules`
- `get_project_dependencies`
- `get_repositories`
- `get_run_configurations`
- `find_files_by_name_keyword` (uses indexes)

### Medium Operations (100ms - 5s typical)
- `get_file_text_by_path`
- `open_file_in_editor`
- `reformat_file`
- `create_new_file`
- `replace_text_in_file`
- `list_directory_tree`
- `find_files_by_glob`

### Slow Operations (5s+ possible)
- `get_file_problems` (depends on file complexity)
- `get_symbol_info` (depends on symbol)
- `rename_refactoring` (project-wide)
- `search_in_files_by_text` (project-wide)
- `search_in_files_by_regex` (project-wide)
- `execute_run_configuration` (depends on config)
- `execute_terminal_command` (depends on command)

### Optimization Tips

1. **Prefer indexed search**: Use `find_files_by_name_keyword` over `find_files_by_glob`
2. **Limit search scope**: Use `directoryToSearch` and `fileMask` parameters
3. **Set reasonable limits**: Use `fileCountLimit` and `maxUsageCount`
4. **Use appropriate timeouts**: Match timeout to expected operation duration
5. **Truncate large outputs**: Use `truncateMode` to avoid memory issues

---

## Tool Selection Decision Tree

```
Need to find files?
├── Know part of filename? → find_files_by_name_keyword (FAST)
└── Need pattern matching? → find_files_by_glob (slower)

Need to search content?
├── Simple text? → search_in_files_by_text
└── Complex pattern? → search_in_files_by_regex

Need to modify file?
├── Simple text replacement? → replace_text_in_file
├── Rename symbol? → rename_refactoring (SAFER)
└── Create new file? → create_new_file

Need to analyze code?
├── Single file issues? → get_file_problems
└── Symbol information? → get_symbol_info

Need to run something?
├── Existing run config? → execute_run_configuration
└── Custom command? → execute_terminal_command
```

---

## Version Compatibility

| IDE Version | MCP Support |
|-------------|-------------|
| < 2025.2 | Requires NPM proxy package |
| 2025.2+ | Built-in MCP server |

**Recommendation**: Use JetBrains IDE **2025.2 or later** for native MCP support without external dependencies.
