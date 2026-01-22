# Content Plan

> What to include, what to reference, what to exclude

---

## Design Principle

**The skill should answer: "Which tool should I use for this task?"**

Not: "What are all the parameters for every tool?"

---

## Content Decisions

### Include in Skill File

| Content | Format | Lines | Rationale |
|---------|--------|-------|-----------|
| When to Invoke | Bullet list | 15 | Quick context check |
| Project Path requirement | Code snippet | 10 | Universal config |
| Tool Selection table | Decision matrix | 40 | Core value: task → tool |
| JetBrains-only examples | Compact code | 30 | Unique capabilities |
| Tool Reference tables | Category tables | 80 | Scannable reference |
| Abbreviated workflows | Numbered steps | 50 | Pattern guidance |
| Troubleshooting | Problem/solution table | 30 | Error recovery |
| Related links | Links | 5 | Full documentation |

**Total: ~270 lines**

### Reference (Not Include)

| Content | Location | Why Reference |
|---------|----------|---------------|
| Full parameter tables | `outputs/tool-inventory.md` | Too verbose for quick reference |
| Complete workflows | `outputs/workflow-analysis.md` | Already comprehensive |
| Performance tiers | `outputs/decision-tree.md` | Specialized info |
| All 20 tools | `outputs/tool-inventory.md` | Focus on high-value subset |
| Detailed output formats | `outputs/tool-inventory.md` | Edge case documentation |

### Exclude Entirely

| Content | Rationale |
|---------|-----------|
| Version history | Not useful for tool selection |
| IDE-specific variations | WebStorm/IntelliJ differences are minimal |
| NPM proxy setup | Deprecated, only built-in supported |
| Exhaustive error codes | Reference full docs instead |

---

## Tool Subset Selection

### Tier 1: Always Include (10 tools)

These tools are either unique to JetBrains or have clear advantages:

| Tool | Category | Why Include |
|------|----------|-------------|
| `rename_refactoring` | Code Intelligence | **No equivalent** - semantic rename |
| `get_file_problems` | Code Intelligence | **Better than LSP** - IntelliJ inspections |
| `get_symbol_info` | Code Intelligence | Quick Documentation |
| `find_files_by_name_keyword` | Search | **Faster** - indexed search |
| `list_directory_tree` | Navigation | **Better output** than tree command |
| `get_all_open_file_paths` | Navigation | **No equivalent** - IDE context |
| `get_project_modules` | Project | **No equivalent** - monorepo structure |
| `execute_terminal_command` | Execution | IDE terminal integration |
| `execute_run_configuration` | Execution | IDE run configs |
| `get_run_configurations` | Execution | Prerequisite for execute |

### Tier 2: Mention Briefly (4 tools)

Include in tables but no detailed examples:

| Tool | Category | Notes |
|------|----------|-------|
| `get_file_text_by_path` | File Ops | Useful for unsaved buffers |
| `search_in_files_by_text` | Search | Alternative to Grep |
| `get_project_dependencies` | Project | Cross-platform deps |
| `reformat_file` | File Ops | IDE code style |

### Tier 3: Omit (6 tools)

These have equivalent or better standard tools:

| Tool | Omit Because |
|------|--------------|
| `replace_text_in_file` | Standard `Edit` is safer |
| `create_new_file` | Standard `Write` is equivalent |
| `find_files_by_glob` | Standard `Glob` is simpler |
| `search_in_files_by_regex` | Standard `Grep` is equivalent |
| `open_file_in_editor` | Nice-to-have, not essential |
| `get_repositories` | `Bash git` is equivalent |

---

## Example Density Strategy

### High Density (full code block)

For unique/critical tools:

```typescript
// rename_refactoring - full example
mcp__jetbrains__rename_refactoring({
  pathInProject: "src/UserService.ts",
  symbolName: "getUserById",
  newName: "findUserById",
  projectPath: "/path/to/project"
})
```

### Medium Density (inline example)

For common tools:

`mcp__jetbrains__get_file_problems({ filePath: "src/User.ts", errorsOnly: false, timeout: 30000, projectPath: "..." })`

### Low Density (just mention)

For secondary tools:

"Use `get_project_dependencies` for cross-platform dependency listing"

---

## Quick Reference Table Design

The central table maps tasks to tools with clear guidance:

```markdown
| Task | Preferred | Alternative | Why Prefer |
|------|-----------|-------------|------------|
| Rename symbol | JetBrains `rename_refactoring` | Standard `Edit` | Semantic, project-wide |
| Read file | Standard `Read` | JetBrains `get_file_text_by_path` | Simpler API |
```

**Design principles**:
1. **Task-first**: User starts with what they need
2. **Clear winner**: Preferred tool is unambiguous
3. **Alternative given**: For when preferred isn't available
4. **Brief rationale**: One-phrase justification

---

## Workflow Abbreviation Strategy

Full workflows in `workflow-analysis.md` are 50-80 lines each. Skill file needs 15-20 lines per workflow.

**Abbreviation technique**: Steps only, no code blocks

**Before (full)**:
```
1. LOCATE THE FILE
   │
   ├─► Know filename?
   │   → JetBrains: find_files_by_name_keyword
   │     {
   │       nameKeyword: "UserService",
   │       fileCountLimit: 20,
   │       ...
   │     }
```

**After (abbreviated)**:
```
1. Find file → JetBrains `find_files_by_name_keyword`
2. Read file → Standard `Read`
3. Check problems → JetBrains `get_file_problems`
4. Make fix → Standard `Edit`
5. Verify → JetBrains `get_file_problems`
```

---

## Troubleshooting Coverage

Focus on the 4 most common issues from workflow analysis:

| Issue | Solution | Lines |
|-------|----------|-------|
| File not found | Relative paths from project root | 5 |
| Timeout errors | Increase timeout, narrow scope | 5 |
| Confirmation required | Brave Mode or use Standard Bash | 10 |
| MCP not responding | IDE requirements checklist | 10 |

**Total: ~30 lines**

---

## Related Links Section

```markdown
## Related

- Full tool documentation: `specs/jetbrains-mcp-skill/outputs/tool-inventory.md`
- Detailed workflows: `specs/jetbrains-mcp-skill/outputs/workflow-analysis.md`
- Decision tree: `specs/jetbrains-mcp-skill/outputs/decision-tree.md`
- Comparison matrix: `specs/jetbrains-mcp-skill/outputs/comparison-matrix.md`
```

This keeps the skill focused while providing paths to deeper documentation.

---

## Quality Checklist for Implementation

Phase 3 should verify:

- [ ] Line count within 200-300 range
- [ ] All Tier 1 tools have examples
- [ ] Quick Reference table covers common tasks
- [ ] Troubleshooting addresses observed errors
- [ ] Links to full documentation work
- [ ] Consistent formatting with Playwright skill
- [ ] JetBrains tool naming convention followed (`mcp__jetbrains__*`)
- [ ] `projectPath` requirement emphasized
- [ ] Clear guidance on when NOT to use JetBrains tools
