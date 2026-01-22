# Workflow Analysis

> Step-by-step workflows combining JetBrains MCP and standard Claude Code tools for common development tasks.

---

## Workflow 1: Bug Investigation

**Scenario**: User reports a bug. Find the issue, understand it, fix it, and verify.

### Steps

```
1. LOCATE THE FILE
   │
   ├─► Know filename?
   │   → JetBrains: find_files_by_name_keyword
   │     {
   │       nameKeyword: "UserService",
   │       fileCountLimit: 20,
   │       timeout: 5000,
   │       projectPath: "/path/to/project"
   │     }
   │
   └─► Know error text?
       → Standard: Grep
         {
           pattern: "NullPointerException",
           type: "java"
         }

2. READ THE FILE
   │
   └─► Standard: Read
       {
         file_path: "/path/to/project/src/UserService.ts"
       }

3. CHECK FOR PROBLEMS
   │
   └─► JetBrains: get_file_problems (PREFERRED)
       {
         filePath: "src/UserService.ts",
         errorsOnly: false,  // Include warnings
         timeout: 30000,
         projectPath: "/path/to/project"
       }

       Returns: Type errors, unused imports,
       complexity warnings, code style issues

4. UNDERSTAND THE SYMBOL (if needed)
   │
   ├─► Symbol info
   │   → JetBrains: get_symbol_info
   │     {
   │       filePath: "src/UserService.ts",
   │       line: 42,
   │       column: 15,
   │       projectPath: "/path/to/project"
   │     }
   │
   └─► Find definition
       → Standard: LSP goToDefinition
         {
           operation: "goToDefinition",
           filePath: "src/UserService.ts",
           line: 42,
           character: 15
         }

5. MAKE THE FIX
   │
   └─► Standard: Edit
       {
         file_path: "/path/to/project/src/UserService.ts",
         old_string: "const result = user.name",
         new_string: "const result = user?.name ?? 'Unknown'"
       }

6. VERIFY FIX
   │
   └─► JetBrains: get_file_problems
       Confirm no new errors/warnings introduced
```

### Tool Selection Rationale

| Step | Tool Choice | Why |
|------|-------------|-----|
| Find file | JetBrains indexed search | Fast, uses IDE indexes |
| Read file | Standard Read | Simple, no config needed |
| Check problems | JetBrains get_file_problems | More thorough than LSP |
| Symbol info | JetBrains get_symbol_info | Full Quick Documentation |
| Make fix | Standard Edit | Precise, unique string matching |
| Verify | JetBrains get_file_problems | Consistent diagnostic source |

---

## Workflow 2: Safe Refactoring (Symbol Rename)

**Scenario**: Rename a function/class/variable across the entire project safely.

### Steps

```
1. UNDERSTAND CURRENT USAGE
   │
   ├─► Find all references
   │   → Standard: LSP findReferences
   │     {
   │       operation: "findReferences",
   │       filePath: "src/services/UserService.ts",
   │       line: 15,
   │       character: 10
   │     }
   │
   └─► Alternatively, search for usage
       → Standard: Grep
         {
           pattern: "getUserById",
           output_mode: "content"
         }

2. VERIFY SYMBOL INFO
   │
   └─► JetBrains: get_symbol_info
       {
         filePath: "src/services/UserService.ts",
         line: 15,
         column: 10,
         projectPath: "/path/to/project"
       }

       Confirms: Function signature, type, documentation

3. PERFORM RENAME
   │
   └─► JetBrains: rename_refactoring (ALWAYS USE THIS)
       {
         pathInProject: "src/services/UserService.ts",
         symbolName: "getUserById",
         newName: "findUserById",
         projectPath: "/path/to/project"
       }

       This will:
       - Update ALL references across the project
       - NOT rename string literals with same text
       - Respect language semantics
       - May require IDE confirmation

4. VERIFY NO ERRORS
   │
   ├─► Check affected files
   │   → JetBrains: get_file_problems
   │     For each file that was modified
   │
   └─► Or run type check
       → Standard: Bash
         {
           command: "bun run check"
         }

5. OPTIONAL: VERIFY SPECIFIC FILES
   │
   └─► Read modified files
       → Standard: Read
         Confirm changes look correct
```

### Why JetBrains rename_refactoring?

**Do NOT use** Standard Edit for symbol renames:
```typescript
// DANGEROUS - Standard Edit with replace_all
Edit({
  file_path: "src/UserService.ts",
  old_string: "getUserById",
  new_string: "findUserById",
  replace_all: true
})
// Problem: Might rename:
// - String literals: "getUserById failed"
// - Comments: // see getUserById
// - Unrelated matches
```

**ALWAYS use** JetBrains rename_refactoring:
```typescript
// SAFE - JetBrains semantic rename
rename_refactoring({
  pathInProject: "src/UserService.ts",
  symbolName: "getUserById",
  newName: "findUserById"
})
// Only renames the actual symbol, not text that happens to match
```

---

## Workflow 3: Code Search and Understanding

**Scenario**: Find and understand how a specific feature/pattern is implemented.

### Steps

```
1. BROAD SEARCH
   │
   ├─► Know text to search
   │   → JetBrains: search_in_files_by_text
   │     {
   │       searchText: "useAuth",
   │       directoryToSearch: "src",
   │       fileMask: "*.tsx",
   │       caseSensitive: true,
   │       maxUsageCount: 50,
   │       timeout: 15000,
   │       projectPath: "/path/to/project"
   │     }
   │
   └─► Need regex pattern
       → JetBrains: search_in_files_by_regex
         {
           regexPattern: "export\\s+(const|function)\\s+use\\w+",
           directoryToSearch: "src/hooks",
           fileMask: "*.ts",
           caseSensitive: true,
           maxUsageCount: 50,
           timeout: 20000,
           projectPath: "/path/to/project"
         }

2. READ RELEVANT FILES
   │
   └─► Standard: Read (for each interesting match)
       {
         file_path: "/path/to/project/src/hooks/useAuth.ts"
       }

3. UNDERSTAND EXPORTS/TYPES
   │
   └─► JetBrains: get_symbol_info
       {
         filePath: "src/hooks/useAuth.ts",
         line: 10,
         column: 15,
         projectPath: "/path/to/project"
       }

       Returns: Full type signature, JSDoc, etc.

4. FIND USAGES
   │
   └─► Standard: LSP findReferences
       {
         operation: "findReferences",
         filePath: "src/hooks/useAuth.ts",
         line: 10,
         character: 15
       }

       Returns: All files that use this symbol

5. UNDERSTAND CALL CHAIN (if needed)
   │
   ├─► What calls this?
   │   → Standard: LSP incomingCalls
   │
   └─► What does this call?
       → Standard: LSP outgoingCalls
```

### Search Result Format

JetBrains search highlights matches with `||` delimiters:
```
src/pages/Login.tsx:15
  const { ||user||, ||login|| } = ||useAuth||();

src/components/Header.tsx:8
  const { ||isAuthenticated|| } = ||useAuth||();
```

---

## Workflow 4: Build and Test

**Scenario**: Run builds, tests, and analyze output.

### Option A: Quick Execution (Standard Bash)

```
1. RUN BUILD
   │
   └─► Standard: Bash
       {
         command: "bun run build",
         timeout: 120000
       }

       Advantage: Immediate, no confirmation

2. RUN TESTS
   │
   └─► Standard: Bash
       {
         command: "bun run test",
         timeout: 300000
       }

3. CHECK SPECIFIC PACKAGE (monorepo)
   │
   └─► Standard: Bash
       {
         command: "bun run check --filter @beep/iam-domain"
       }
```

### Option B: IDE Run Configurations (JetBrains)

```
1. DISCOVER CONFIGURATIONS
   │
   └─► JetBrains: get_run_configurations
       {
         projectPath: "/path/to/project"
       }

       Returns: All IDE run configs with:
       - Command line
       - Working directory
       - Environment variables

2. EXECUTE CONFIGURATION
   │
   └─► JetBrains: execute_run_configuration
       {
         configurationName: "npm run build",
         timeout: 120000,
         maxLinesCount: 500,
         truncateMode: "END",
         projectPath: "/path/to/project"
       }

       Note: Requires IDE confirmation (unless Brave Mode)

3. ANALYZE OUTPUT
   │
   └─► Check for errors in output
       If build failed, proceed to bug investigation workflow
```

### When to Use Each

| Scenario | Recommended |
|----------|-------------|
| Quick one-off command | Standard Bash |
| Complex build with env vars | JetBrains run config |
| Need background execution | Standard Bash |
| Want IDE coverage/debugging | JetBrains run config |
| Testing in CI context | Standard Bash |

---

## Workflow 5: Project Exploration

**Scenario**: New to a codebase, need to understand structure and patterns.

### Steps

```
1. GET DIRECTORY STRUCTURE
   │
   └─► JetBrains: list_directory_tree
       {
         directoryPath: ".",
         maxDepth: 3,
         timeout: 5000,
         projectPath: "/path/to/project"
       }

       Returns: Pseudo-graphic tree view

       src/
       ├── components/
       │   ├── auth/
       │   ├── common/
       │   └── layout/
       ├── hooks/
       ├── pages/
       └── services/

2. GET PROJECT MODULES (monorepo)
   │
   └─► JetBrains: get_project_modules
       {
         projectPath: "/path/to/project"
       }

       Returns: Module names and types

       Useful for understanding monorepo structure

3. GET DEPENDENCIES
   │
   └─► JetBrains: get_project_dependencies
       {
         projectPath: "/path/to/project"
       }

       Returns: Libraries, versions
       Works with npm, Maven, Gradle, etc.

4. SEE WHAT USER IS WORKING ON
   │
   └─► JetBrains: get_all_open_file_paths
       {
         projectPath: "/path/to/project"
       }

       Returns: Currently open editor tabs
       Helps understand user's context

5. FIND KEY FILES
   │
   ├─► Find entry points
   │   → JetBrains: find_files_by_name_keyword
   │     { nameKeyword: "index" }
   │
   ├─► Find configurations
   │   → JetBrains: find_files_by_name_keyword
   │     { nameKeyword: "config" }
   │
   └─► Find tests
       → Standard: Glob
         { pattern: "**/*.test.ts" }

6. READ KEY FILES
   │
   └─► Standard: Read
       - package.json
       - tsconfig.json
       - README.md
       - .env.example
```

---

## Workflow 6: Code Review Preparation

**Scenario**: Review changes for quality, errors, and style.

### Steps

```
1. IDENTIFY CHANGED FILES
   │
   └─► Standard: Bash
       {
         command: "git diff --name-only HEAD~1"
       }

2. CHECK EACH FILE FOR PROBLEMS
   │
   └─► JetBrains: get_file_problems (for each file)
       {
         filePath: "src/ChangedFile.ts",
         errorsOnly: false,
         timeout: 30000,
         projectPath: "/path/to/project"
       }

       Returns ALL inspections:
       - Type errors
       - Unused imports
       - Code style violations
       - Complexity warnings
       - Potential bugs

3. VERIFY CODE STYLE
   │
   └─► JetBrains: reformat_file (optional)
       {
         path: "src/ChangedFile.ts",
         projectPath: "/path/to/project"
       }

       Or check with linter:
       → Standard: Bash
         { command: "bun run lint src/ChangedFile.ts" }

4. UNDERSTAND NEW SYMBOLS
   │
   └─► JetBrains: get_symbol_info
       For new functions/classes to verify types

5. FIND USAGE PATTERNS
   │
   └─► Standard: LSP findReferences
       Verify new code integrates correctly
```

---

## Workflow 7: Debugging with IDE Context

**Scenario**: Debug issue while leveraging IDE state (open files, breakpoints, etc.).

### Steps

```
1. CHECK USER'S CURRENT CONTEXT
   │
   └─► JetBrains: get_all_open_file_paths
       {
         projectPath: "/path/to/project"
       }

       See what files user already has open

2. OPEN RELEVANT FILE IN IDE
   │
   └─► JetBrains: open_file_in_editor
       {
         filePath: "src/problematic/File.ts",
         projectPath: "/path/to/project"
       }

       Directs user attention to specific file

3. GET FILE PROBLEMS
   │
   └─► JetBrains: get_file_problems
       Check for issues IDE has detected

4. READ UNSAVED CHANGES
   │
   └─► JetBrains: get_file_text_by_path
       {
         pathInProject: "src/problematic/File.ts",
         truncateMode: "NONE",
         maxLinesCount: 1000,
         projectPath: "/path/to/project"
       }

       Note: Reads from IDE buffer, includes unsaved changes

5. MAKE FIXES
   │
   └─► Standard: Edit (file must be saved first)
       Or have user make changes in IDE

6. RUN TESTS IN IDE
   │
   └─► JetBrains: execute_run_configuration
       {
         configurationName: "Run Tests",
         timeout: 60000,
         maxLinesCount: 500,
         truncateMode: "END",
         projectPath: "/path/to/project"
       }
```

---

## Error Recovery Patterns

### File Not Found

```
Error: "file not found" from JetBrains tool
│
├─► Verify file exists
│   → Standard: Glob
│     { pattern: "**/suspected_name*" }
│
├─► Check path is relative (not absolute)
│   → JetBrains uses paths relative to projectPath
│
└─► Verify projectPath is correct
    → Should be the root containing .idea/
```

### Timeout Errors

```
Error: Operation timed out
│
├─► Increase timeout value
│   → Simple searches: 5000-10000ms
│   → Project-wide: 15000-30000ms
│   → Inspections: 30000-60000ms
│   → Execution: 60000-300000ms
│
├─► Narrow search scope
│   → Add directoryToSearch
│   → Add fileMask
│   → Reduce fileCountLimit
│
└─► For execution, check if command is hanging
    → May need to kill via IDE
```

### No Occurrences Found

```
Error: "no occurrences found" in replace
│
├─► Verify exact text matches
│   → Check whitespace, line endings
│   → Check case sensitivity setting
│
├─► Use search first to verify
│   → JetBrains: search_in_files_by_text
│   → Standard: Grep
│
└─► Read file to see actual content
    → Standard: Read
```

### MCP Server Connection Issues

```
Error: MCP server not responding
│
├─► Check IDE is running
│   → JetBrains IDE must be open
│
├─► Check project is open in IDE
│   → The specific project must be loaded
│
├─► Verify MCP is enabled
│   → Settings | Tools | MCP Server
│
└─► Check IDE version
    → Requires JetBrains 2025.2+
```

---

## Summary: Workflow Tool Patterns

| Workflow | Primary JetBrains Tools | Primary Standard Tools |
|----------|-------------------------|------------------------|
| Bug Investigation | `get_file_problems`, `get_symbol_info` | `Read`, `Edit`, `LSP` |
| Safe Refactoring | `rename_refactoring` | `LSP findReferences` |
| Code Search | `search_in_files_by_*`, `find_files_by_name_keyword` | `Grep`, `Read` |
| Build & Test | `execute_run_configuration` | `Bash` |
| Project Exploration | `list_directory_tree`, `get_project_modules` | `Read` |
| Code Review | `get_file_problems` | `Bash`, `LSP` |
| IDE Context Debug | `get_all_open_file_paths`, `open_file_in_editor` | `Edit` |
