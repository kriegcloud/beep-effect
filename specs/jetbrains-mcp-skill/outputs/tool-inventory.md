# JetBrains MCP Tool Inventory

> Comprehensive documentation of all JetBrains MCP server tools.
>
> **Sources**: [WebStorm MCP Server](https://www.jetbrains.com/help/webstorm/mcp-server.html), [IntelliJ IDEA MCP Server](https://www.jetbrains.com/help/idea/mcp-server.html), [GitHub Repository](https://github.com/JetBrains/mcp-jetbrains)

---

## Tool Naming Convention

All JetBrains MCP tools follow this naming pattern:
```
mcp__jetbrains__<tool_name>
```

Example: `mcp__jetbrains__get_file_text_by_path`

---

## Code Intelligence Tools

### mcp__jetbrains__get_symbol_info

**Purpose**: Retrieves information about the symbol at the specified position in a file using IDE intelligence.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filePath` | string | Yes | - | Relative path from project root |
| `line` | number | Yes | - | 1-based line number |
| `column` | number | Yes | - | 1-based column number |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Symbol declaration, signature, type information, and documentation (Quick Documentation).

**Example Usage**:
```json
{
  "filePath": "src/services/UserService.ts",
  "line": 42,
  "column": 15,
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Line and column numbers are 1-based (matching editor display)
- Returns IDE-level intelligence (type inference, JSDoc, etc.)
- Works best when IDE indexing is complete

---

### mcp__jetbrains__get_file_problems

**Purpose**: Analyzes a file for errors and warnings using IntelliJ inspections.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filePath` | string | Yes | - | Relative path from project root |
| `errorsOnly` | boolean | Yes | - | If `true`, only return errors; if `false`, include warnings |
| `timeout` | number | Yes | - | Timeout in milliseconds |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: List of problems with severity, description, and location information.

**Example Usage**:
```json
{
  "filePath": "src/components/Button.tsx",
  "errorsOnly": false,
  "timeout": 30000,
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Only project files can be analyzed (not library files)
- Line and column numbers in results are 1-based
- Set `errorsOnly: false` for comprehensive results including warnings
- More thorough than LSP diagnostics due to IntelliJ inspection engine

---

### mcp__jetbrains__rename_refactoring

**Purpose**: Context-aware renaming that intelligently updates all references to a symbol throughout the project.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pathInProject` | string | Yes | - | Relative path to file containing symbol |
| `symbolName` | string | Yes | - | Current name of the symbol |
| `newName` | string | Yes | - | New name for the symbol |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Success confirmation or error message.

**Example Usage**:
```json
{
  "pathInProject": "src/services/UserService.ts",
  "symbolName": "getUserById",
  "newName": "findUserById",
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Updates all references across the entire project
- Respects language semantics (won't rename string literals with same text)
- Much safer than find-replace for refactoring
- May require user confirmation in IDE

---

## File Operations Tools

### mcp__jetbrains__get_file_text_by_path

**Purpose**: Retrieves the text content of a file using its path relative to the project root.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pathInProject` | string | Yes | - | Relative file path |
| `truncateMode` | string | Yes | - | How to truncate: `START`, `MIDDLE`, `END`, or `NONE` |
| `maxLinesCount` | number | Yes | - | Maximum lines to return |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: File content as text.

**Example Usage**:
```json
{
  "pathInProject": "src/index.ts",
  "truncateMode": "END",
  "maxLinesCount": 500,
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Binary files return errors
- Large files are truncated with a marker indicating truncation occurred
- Use `truncateMode: "NONE"` with caution on large files
- File is read from IDE's virtual file system (may include unsaved changes)

---

### mcp__jetbrains__replace_text_in_file

**Purpose**: Performs targeted find-and-replace operations within a file.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pathInProject` | string | Yes | - | Relative file path |
| `oldText` | string | Yes | - | Text to find |
| `newText` | string | Yes | - | Replacement text |
| `replaceAll` | boolean | Yes | - | Replace all occurrences or just first |
| `caseSensitive` | boolean | Yes | - | Case-sensitive matching |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: One of:
- `ok` - Success
- `project dir not found` - Invalid project path
- `file not found` - File doesn't exist
- `could not get document` - File couldn't be opened
- `no occurrences found` - Search text not found

**Example Usage**:
```json
{
  "pathInProject": "src/config.ts",
  "oldText": "const API_URL = 'http://localhost'",
  "newText": "const API_URL = 'https://api.example.com'",
  "replaceAll": false,
  "caseSensitive": true,
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- File is automatically saved after modification
- For multi-line replacements, include newlines in both `oldText` and `newText`
- Prefer `rename_refactoring` for symbol renames

---

### mcp__jetbrains__create_new_file

**Purpose**: Creates a new file at the specified path within the project directory.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pathInProject` | string | Yes | - | Relative file path including filename |
| `text` | string | No | - | Initial file content |
| `overwrite` | boolean | Yes | - | Whether to overwrite if file exists |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Success or failure confirmation.

**Example Usage**:
```json
{
  "pathInProject": "src/components/NewComponent.tsx",
  "text": "export const NewComponent = () => <div>Hello</div>;",
  "overwrite": false,
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Automatically creates parent directories if they don't exist
- Set `overwrite: false` to prevent accidental overwrites

---

### mcp__jetbrains__reformat_file

**Purpose**: Reformats a file according to the IDE's configured code style.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `path` | string | Yes | - | Relative file path |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Success or failure confirmation.

**Example Usage**:
```json
{
  "path": "src/services/UserService.ts",
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Uses IDE's configured code style (EditorConfig, Prettier settings, etc.)
- Respects `.editorconfig` if present
- File must be within project scope

---

### mcp__jetbrains__open_file_in_editor

**Purpose**: Opens the specified file in the JetBrains IDE editor.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filePath` | string | Yes | - | Absolute or relative file path |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Confirmation of file opening.

**Example Usage**:
```json
{
  "filePath": "src/index.ts",
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Useful for directing user attention to specific files
- File path can be absolute or relative to project root
- Opens file in existing IDE window

---

## Search & Navigation Tools

### mcp__jetbrains__find_files_by_name_keyword

**Purpose**: Fast indexed search to locate files by name substring.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `nameKeyword` | string | Yes | - | Case-sensitive substring to match in filename |
| `fileCountLimit` | number | Yes | - | Maximum results to return |
| `timeout` | number | Yes | - | Timeout in milliseconds |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: List of matching file paths.

**Example Usage**:
```json
{
  "nameKeyword": "Service",
  "fileCountLimit": 50,
  "timeout": 5000,
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- **Prefer this tool over `find_files_by_glob`** - it's much faster
- Searches only filenames, not paths
- Case-sensitive matching
- Only searches files within project (excludes libraries/external dependencies)
- Uses IDE indexes for fast search

---

### mcp__jetbrains__find_files_by_glob

**Purpose**: Searches for files whose relative paths match a glob pattern.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `globPattern` | string | Yes | - | Glob pattern (e.g., `**/*.ts`) |
| `subDirectoryRelativePath` | string | No | - | Restrict search to subdirectory |
| `addExcluded` | boolean | Yes | - | Include files in excluded/ignored directories |
| `fileCountLimit` | number | Yes | - | Maximum results to return |
| `timeout` | number | Yes | - | Timeout in milliseconds |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: List of matching file paths.

**Example Usage**:
```json
{
  "globPattern": "src/**/*.test.ts",
  "subDirectoryRelativePath": null,
  "addExcluded": false,
  "fileCountLimit": 100,
  "timeout": 10000,
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Slower than `find_files_by_name_keyword`
- Supports standard glob patterns (`*`, `**`, `?`, `[abc]`)
- Use `subDirectoryRelativePath` to narrow search scope
- `addExcluded: true` includes `.gitignore`d files and IDE-excluded directories

---

### mcp__jetbrains__search_in_files_by_text

**Purpose**: Project-wide text search using IntelliJ's search engine.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `searchText` | string | Yes | - | Text substring to find |
| `directoryToSearch` | string | No | - | Restrict to specific directory |
| `fileMask` | string | No | - | File pattern filter (e.g., `*.java`) |
| `caseSensitive` | boolean | Yes | - | Case-sensitive matching |
| `maxUsageCount` | number | Yes | - | Maximum results to return |
| `timeout` | number | Yes | - | Timeout in milliseconds |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Matches with context, highlighted with `||` delimiters around matched text.

**Example Usage**:
```json
{
  "searchText": "TODO",
  "directoryToSearch": "src",
  "fileMask": "*.ts",
  "caseSensitive": false,
  "maxUsageCount": 100,
  "timeout": 15000,
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Matches are highlighted: `some text ||TODO|| fix this`
- More accurate than grep for project context
- Respects IDE's indexed search

---

### mcp__jetbrains__search_in_files_by_regex

**Purpose**: Project-wide regex pattern search using IntelliJ's search engine.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `regexPattern` | string | Yes | - | Regular expression pattern |
| `directoryToSearch` | string | No | - | Restrict to specific directory |
| `fileMask` | string | No | - | File pattern filter (e.g., `*.tsx`) |
| `caseSensitive` | boolean | Yes | - | Case-sensitive matching |
| `maxUsageCount` | number | Yes | - | Maximum results to return |
| `timeout` | number | Yes | - | Timeout in milliseconds |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Matches with context, highlighted with `||` delimiters.

**Example Usage**:
```json
{
  "regexPattern": "console\\.(log|warn|error)\\(",
  "directoryToSearch": "src",
  "fileMask": "*.ts",
  "caseSensitive": true,
  "maxUsageCount": 50,
  "timeout": 20000,
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Uses Java regex syntax
- Escape special characters appropriately
- More powerful than text search for complex patterns

---

### mcp__jetbrains__list_directory_tree

**Purpose**: Provides a tree representation of a directory in pseudo-graphic format (similar to `tree` command).

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `directoryPath` | string | Yes | - | Relative path to directory |
| `maxDepth` | number | Yes | - | Maximum recursion depth |
| `timeout` | number | Yes | - | Timeout in milliseconds |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Directory tree visualization.

**Example Usage**:
```json
{
  "directoryPath": "src",
  "maxDepth": 3,
  "timeout": 5000,
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- **Prefer this over `ls` or `dir` commands**
- Use low `maxDepth` for large directories
- Good for understanding project structure

---

### mcp__jetbrains__get_all_open_file_paths

**Purpose**: Returns paths of all files currently open in the IDE editor.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: List of relative file paths.

**Example Usage**:
```json
{
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Useful for understanding user's current context
- Returns files from all open editor tabs
- Paths are relative to project root

---

## Project Structure Tools

### mcp__jetbrains__get_project_modules

**Purpose**: Lists all modules in the project with their types.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Module names and types.

**Example Usage**:
```json
{
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Useful for multi-module projects (monorepos)
- Module types vary by IDE (Java modules, Node.js modules, etc.)

---

### mcp__jetbrains__get_project_dependencies

**Purpose**: Returns a list of all dependencies defined in the project.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Structured dependency information.

**Example Usage**:
```json
{
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Works with Maven, Gradle, npm, etc.
- Returns library names and versions
- Good for understanding project dependencies

---

### mcp__jetbrains__get_repositories

**Purpose**: Retrieves the list of VCS (Version Control System) roots in the project.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: All repository locations.

**Example Usage**:
```json
{
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Useful for multi-repository projects
- Returns Git, SVN, Mercurial roots
- Helps understand VCS structure

---

## Execution Tools

### mcp__jetbrains__get_run_configurations

**Purpose**: Lists available run configurations for the project.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Run configurations with command line, working directory, and environment variables.

**Example Usage**:
```json
{
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- Returns all IDE run configurations (npm scripts, test configs, etc.)
- Use with `execute_run_configuration` to run them

---

### mcp__jetbrains__execute_run_configuration

**Purpose**: Runs a specific run configuration and waits for completion.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `configurationName` | string | Yes | - | Name of run configuration to execute |
| `timeout` | number | Yes | - | Timeout in milliseconds |
| `maxLinesCount` | number | Yes | - | Maximum output lines |
| `truncateMode` | string | Yes | - | How to truncate: `START`, `MIDDLE`, `END`, `NONE` |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Execution result with exit code, output, and success status.

**Example Usage**:
```json
{
  "configurationName": "npm run build",
  "timeout": 120000,
  "maxLinesCount": 500,
  "truncateMode": "END",
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- **Requires user confirmation** unless Brave Mode is enabled
- First use `get_run_configurations` to discover available configs
- Good for running builds, tests, and other project tasks

---

### mcp__jetbrains__execute_terminal_command

**Purpose**: Executes a shell command in the IDE's integrated terminal.

**Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `command` | string | Yes | - | Shell command to execute |
| `executeInShell` | boolean | Yes | - | Run in shell (`true`) or as process (`false`) |
| `reuseExistingTerminalWindow` | boolean | No | - | Reuse existing terminal tab |
| `timeout` | number | Yes | - | Timeout in milliseconds |
| `maxLinesCount` | number | Yes | - | Maximum output lines (max 2000) |
| `truncateMode` | string | Yes | - | How to truncate: `START`, `MIDDLE`, `END`, `NONE` |
| `projectPath` | string | Yes | - | Project root directory |

**Returns**: Terminal output (capped at 2000 lines with truncation notice).

**Example Usage**:
```json
{
  "command": "npm run test -- --coverage",
  "executeInShell": true,
  "reuseExistingTerminalWindow": false,
  "timeout": 60000,
  "maxLinesCount": 1000,
  "truncateMode": "END",
  "projectPath": "/home/user/my-project"
}
```

**Notes**:
- **Requires user confirmation** unless Brave Mode is enabled
- Output capped at 2000 lines regardless of `maxLinesCount`
- `executeInShell: true` uses default shell; `false` runs as direct process
- Terminal output visible in IDE

---

## Tool Summary Table

| Category | Tool | Primary Use |
|----------|------|-------------|
| **Code Intelligence** | `get_symbol_info` | Quick Documentation at position |
| | `get_file_problems` | IntelliJ inspections/errors |
| | `rename_refactoring` | Safe symbol rename |
| **File Operations** | `get_file_text_by_path` | Read file content |
| | `replace_text_in_file` | Find and replace |
| | `create_new_file` | Create file with content |
| | `reformat_file` | Apply code style |
| | `open_file_in_editor` | Focus file in IDE |
| **Search** | `find_files_by_name_keyword` | Fast filename search (preferred) |
| | `find_files_by_glob` | Glob pattern search |
| | `search_in_files_by_text` | Project-wide text search |
| | `search_in_files_by_regex` | Project-wide regex search |
| **Navigation** | `list_directory_tree` | Directory structure view |
| | `get_all_open_file_paths` | Currently open files |
| **Project** | `get_project_modules` | List project modules |
| | `get_project_dependencies` | List dependencies |
| | `get_repositories` | VCS roots |
| **Execution** | `get_run_configurations` | List run configs |
| | `execute_run_configuration` | Run a config |
| | `execute_terminal_command` | Shell command |

---

## Notes on Missing Tools

The original spec mentioned `build_project` - this tool **does not exist** in the JetBrains MCP server. To trigger builds:
1. Use `get_run_configurations` to find build configs
2. Use `execute_run_configuration` to run the build config
3. Or use `execute_terminal_command` with build commands

---

## Version Information

- Built-in MCP server available in JetBrains IDEs version **2025.2+**
- NPM proxy package (`@jetbrains/mcp-proxy`) is **deprecated** - use built-in server
- Works with all JetBrains IDEs: IntelliJ IDEA, WebStorm, PyCharm, Rider, etc.
