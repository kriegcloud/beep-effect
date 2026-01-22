# Tool Selection Decision Tree

> Flowchart-style guide for choosing between JetBrains MCP and standard Claude Code tools.

---

## Master Decision Tree

```
START: What do you need to do?
│
├─► FIND FILES
│   │
│   ├─► Know part of the filename?
│   │   │
│   │   ├─► YES → JetBrains: find_files_by_name_keyword
│   │   │         (Uses indexes, much faster)
│   │   │
│   │   └─► NO  → What kind of pattern?
│   │             │
│   │             ├─► Glob pattern (e.g., **/*.ts)
│   │             │   → Standard: Glob (simpler API)
│   │             │
│   │             └─► Complex path matching
│   │                 → Either works, prefer Glob
│   │
├─► READ FILES
│   │
│   ├─► Simple file read?
│   │   │
│   │   ├─► YES → Standard: Read
│   │   │         (No config needed)
│   │   │
│   │   └─► NO  → What's special?
│   │             │
│   │             ├─► Need unsaved IDE buffer
│   │             │   → JetBrains: get_file_text_by_path
│   │             │
│   │             ├─► Very large file (control truncation)
│   │             │   → Either works
│   │             │   - Read: use offset/limit
│   │             │   - JetBrains: use truncateMode
│   │             │
│   │             └─► Need line numbers
│   │                 → Standard: Read (built-in)
│   │
├─► EDIT FILES
│   │
│   ├─► Renaming a symbol (function, variable, class)?
│   │   │
│   │   ├─► YES → JetBrains: rename_refactoring
│   │   │         (Project-wide, semantic-aware, SAFE)
│   │   │
│   │   └─► NO  → Continue below
│   │
│   ├─► Need precise, unique location?
│   │   │
│   │   ├─► YES → Standard: Edit
│   │   │         (Unique string matching prevents wrong edits)
│   │   │
│   │   └─► NO  → Simple find/replace across file?
│   │             │
│   │             ├─► YES → Either works
│   │             │   - Edit: replace_all=true
│   │             │   - JetBrains: replaceAll=true
│   │             │
│   │             └─► NO  → Standard: Edit (safer default)
│   │
├─► SEARCH CONTENT
│   │
│   ├─► What are you searching?
│   │   │
│   │   ├─► Simple text
│   │   │   → Either: Grep or search_in_files_by_text
│   │   │
│   │   ├─► Regex pattern
│   │   │   → Either: Grep or search_in_files_by_regex
│   │   │
│   │   └─► Need to scope by directory or file type?
│   │       → Both support this, use what's convenient
│   │
├─► CODE INTELLIGENCE
│   │
│   ├─► What information do you need?
│   │   │
│   │   ├─► File errors/warnings
│   │   │   → JetBrains: get_file_problems
│   │   │     (IntelliJ inspections are more thorough)
│   │   │
│   │   ├─► Symbol info (type, signature, docs)
│   │   │   → JetBrains: get_symbol_info
│   │   │     (Full Quick Documentation)
│   │   │
│   │   ├─► Go to definition
│   │   │   → Standard: LSP goToDefinition
│   │   │     (JetBrains lacks this)
│   │   │
│   │   ├─► Find all references
│   │   │   → Standard: LSP findReferences
│   │   │     (JetBrains lacks this)
│   │   │
│   │   └─► Call hierarchy
│   │       → Standard: LSP incomingCalls/outgoingCalls
│   │
├─► RUN COMMANDS
│   │
│   ├─► Is there an IDE run configuration for this?
│   │   │
│   │   ├─► YES + Want IDE integration
│   │   │   → JetBrains: execute_run_configuration
│   │   │     (Note: Requires confirmation unless Brave Mode)
│   │   │
│   │   ├─► NO or want quick execution
│   │   │   → Standard: Bash
│   │   │     (No confirmation, immediate)
│   │   │
│   │   └─► Need background execution
│   │       → Standard: Bash (run_in_background=true)
│   │         (JetBrains waits for completion)
│   │
└─► PROJECT STRUCTURE
    │
    ├─► What do you need?
    │   │
    │   ├─► Directory tree
    │   │   → JetBrains: list_directory_tree
    │   │     (Better formatting, depth control)
    │   │
    │   ├─► Currently open files
    │   │   → JetBrains: get_all_open_file_paths
    │   │     (Unique capability)
    │   │
    │   ├─► Project modules/structure
    │   │   → JetBrains: get_project_modules
    │   │     (Unique capability)
    │   │
    │   ├─► Dependencies
    │   │   → JetBrains: get_project_dependencies
    │   │     (Cross-platform: npm, Maven, Gradle)
    │   │
    │   └─► VCS/Git info
    │       → Either: Bash git or get_repositories
```

---

## Quick Reference Cards

### File Operations

```
┌─────────────────────────────────────────────────────┐
│ FILE OPERATIONS QUICK REFERENCE                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  FIND FILES                                         │
│  ├── Know filename part → JetBrains indexed search │
│  └── Glob pattern      → Standard Glob             │
│                                                     │
│  READ FILES                                         │
│  ├── Simple read       → Standard Read             │
│  └── IDE buffer        → JetBrains read            │
│                                                     │
│  EDIT FILES                                         │
│  ├── Rename symbol     → JetBrains refactoring     │
│  └── Text edit         → Standard Edit             │
│                                                     │
│  CREATE FILES                                       │
│  └── Either works      → Standard Write preferred  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Code Intelligence

```
┌─────────────────────────────────────────────────────┐
│ CODE INTELLIGENCE QUICK REFERENCE                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  DIAGNOSTICS                                        │
│  └── File problems     → JetBrains (more thorough) │
│                                                     │
│  SYMBOL INFO                                        │
│  ├── Type/docs         → JetBrains get_symbol_info │
│  ├── Definition        → Standard LSP              │
│  └── References        → Standard LSP              │
│                                                     │
│  REFACTORING                                        │
│  └── Rename            → JetBrains ALWAYS          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Execution

```
┌─────────────────────────────────────────────────────┐
│ EXECUTION QUICK REFERENCE                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  RUN COMMAND                                        │
│  ├── Quick/immediate   → Standard Bash             │
│  ├── IDE run config    → JetBrains execute_config  │
│  └── Background        → Standard Bash             │
│                                                     │
│  NOTE: JetBrains execution requires confirmation   │
│        unless Brave Mode is enabled in IDE         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Task-Specific Decision Guides

### "I need to rename a function"

```
Is it a symbol (function, variable, class, interface)?
│
├─► YES → Use JetBrains rename_refactoring
│         - Updates ALL references project-wide
│         - Respects semantic boundaries
│         - Won't rename string literals with same text
│
└─► NO (just text) → Use Standard Edit with replace_all
```

### "I need to find a file"

```
Do you know part of the filename?
│
├─► YES (e.g., "UserService")
│   → JetBrains find_files_by_name_keyword
│     Reason: Uses IDE indexes, O(1) not O(n)
│
├─► NO, but have a pattern (e.g., "**/*.test.ts")
│   → Standard Glob
│     Reason: Simpler API, no timeout config
│
└─► Need to search in specific directory
    → Either works, choose by convenience
```

### "I need to fix a bug"

```
What stage are you at?
│
├─► Finding the file with the bug
│   │
│   ├─► Know filename → JetBrains find_files_by_name_keyword
│   └─► Know code pattern → Either: Grep or JetBrains search
│
├─► Understanding the code
│   │
│   ├─► Read file → Standard Read
│   ├─► Symbol info → JetBrains get_symbol_info
│   └─► Go to definition → Standard LSP
│
├─► Checking for errors
│   │
│   └─► File diagnostics → JetBrains get_file_problems
│         (Returns IntelliJ inspections, more thorough)
│
└─► Making the fix
    │
    ├─► Simple edit → Standard Edit
    └─► Rename involved → JetBrains rename_refactoring
```

### "I need to run tests"

```
How do you want to run them?
│
├─► Quick, immediate execution
│   → Standard Bash: "bun test" or "npm test"
│     No confirmation needed
│
├─► Use IDE run configuration
│   │
│   ├─► First: JetBrains get_run_configurations
│   │   (List available configs)
│   │
│   └─► Then: JetBrains execute_run_configuration
│       (Will require confirmation in IDE)
│
└─► Need to run in background
    → Standard Bash with run_in_background=true
      JetBrains always waits for completion
```

---

## Confirmation Requirements

```
┌──────────────────────────────────────────────────────────────┐
│ CONFIRMATION REQUIREMENTS                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  STANDARD TOOLS                                              │
│  ├── Bash          → No confirmation (immediate)            │
│  ├── Read          → No confirmation                        │
│  ├── Edit          → No confirmation                        │
│  ├── Write         → No confirmation                        │
│  └── Glob/Grep     → No confirmation                        │
│                                                              │
│  JETBRAINS TOOLS                                             │
│  ├── All read ops  → No confirmation                        │
│  ├── All edit ops  → No confirmation                        │
│  ├── Search ops    → No confirmation                        │
│  │                                                           │
│  │  UNLESS Brave Mode is enabled:                           │
│  ├── execute_terminal_command → REQUIRES CONFIRMATION       │
│  └── execute_run_configuration → REQUIRES CONFIRMATION      │
│                                                              │
│  Brave Mode: Settings | Tools | MCP Server | Enable         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Performance Tiers

```
FAST (< 100ms)
├── JetBrains: get_all_open_file_paths
├── JetBrains: get_project_modules
├── JetBrains: get_run_configurations
├── JetBrains: find_files_by_name_keyword ← Uses indexes!
├── Standard: Glob (small dirs)
└── Standard: Read

MEDIUM (100ms - 5s)
├── JetBrains: get_file_text_by_path
├── JetBrains: replace_text_in_file
├── JetBrains: create_new_file
├── JetBrains: list_directory_tree
├── JetBrains: find_files_by_glob
├── Standard: Glob (large dirs)
├── Standard: Edit
└── Standard: Grep (small scope)

SLOW (5s+, set appropriate timeouts)
├── JetBrains: get_file_problems ← Depends on file complexity
├── JetBrains: get_symbol_info
├── JetBrains: rename_refactoring ← Project-wide operation
├── JetBrains: search_in_files_by_* ← Project-wide search
├── JetBrains: execute_* ← Depends on command
├── Standard: Grep (large scope)
└── Standard: Bash (depends on command)
```

---

## Summary: Default Choices

When in doubt, use these defaults:

| Task | Default Choice | Why |
|------|----------------|-----|
| Find file by name | JetBrains | Indexed, fast |
| Find files by pattern | Standard Glob | Simpler |
| Read file | Standard Read | No config needed |
| Edit file | Standard Edit | Safer, precise |
| Rename symbol | JetBrains | Project-wide, semantic |
| Search content | Standard Grep | Familiar, fast |
| Get diagnostics | JetBrains | More thorough |
| Run command | Standard Bash | Immediate, no confirm |
| Directory tree | JetBrains | Better output |
