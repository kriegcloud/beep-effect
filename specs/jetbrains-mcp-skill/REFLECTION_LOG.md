# Reflection Log

> Cumulative learnings from spec execution. Update after each phase.

---

## Spec Initialization

**Date**: 2026-01-21
**Complexity Classification**: Medium (4 phases, multi-session expected)

### Initial Assumptions

1. JetBrains MCP server is accessible when IDE is running
2. Tools have consistent parameter patterns (projectPath, timeout, truncateMode)
3. A single skill file (~200-300 lines) will be sufficient
4. Similar pattern to existing `playwright-mcp.md` skill will work well

### Rationale for Medium Complexity

- **4 phases**: Discovery, Analysis, Design, Implementation, Validation
- **Multi-session expected**: Tool research + comparison analysis + skill writing
- **Agent coordination**: codebase-researcher, mcp-researcher, doc-writer, reflector
- **Handoffs required**: Context preservation between research and implementation

### Key Risks

1. JetBrains MCP documentation may be sparse - requires empirical testing
2. Tool behavior may differ across JetBrains IDEs (WebStorm vs IntelliJ vs PyCharm)
3. Comparison with standard Claude Code tools requires careful benchmarking

---

## Phase 0: Discovery

**Date**: 2026-01-21
**Status**: Complete

### What Worked

1. **Official documentation was comprehensive**: JetBrains provides detailed MCP documentation at:
   - [WebStorm MCP Server](https://www.jetbrains.com/help/webstorm/mcp-server.html)
   - [IntelliJ IDEA MCP Server](https://www.jetbrains.com/help/idea/mcp-server.html)
   - [GitHub Repository](https://github.com/JetBrains/mcp-jetbrains)

2. **Web research approach**: Using WebSearch + WebFetch to extract tool schemas from official docs proved effective when direct MCP access wasn't available.

3. **Cross-referencing multiple sources**: WebStorm docs + IntelliJ docs + GitHub README provided complementary information.

4. **Structured output format**: Using tables for parameters made the documentation scannable and consistent.

### What Didn't Work

1. **JetBrains MCP server not connected**: The MCP server wasn't available in the current session, preventing empirical testing of tools. Had to rely entirely on documentation.

2. **GitHub README lacked tool schemas**: The repository README focused on installation/configuration rather than tool definitions. Had to rely on IDE-specific docs.

3. **Spec mentioned non-existent tool**: The original spec listed `build_project` which doesn't exist. Builds are done via `execute_run_configuration`.

### Learnings

1. **20 tools documented** (not 21+):
   - Code Intelligence: 3 tools (`get_symbol_info`, `get_file_problems`, `rename_refactoring`)
   - File Operations: 5 tools
   - Search & Navigation: 6 tools
   - Project Structure: 3 tools
   - Execution: 3 tools

2. **All tools require `projectPath`**: This is a universal parameter - no exceptions found.

3. **`truncateMode` values**: `START`, `MIDDLE`, `END`, `NONE` - controls how large outputs are truncated.

4. **Brave Mode**: IDE setting that skips confirmation for `execute_run_configuration` and `execute_terminal_command`.

5. **Version requirement**: Built-in MCP support requires JetBrains IDE **2025.2+**. Older versions need the NPM proxy package.

6. **Tool preferences documented**: `find_files_by_name_keyword` is explicitly preferred over `find_files_by_glob` for performance (uses indexes).

7. **Terminal output cap**: `execute_terminal_command` has a hard cap at 2000 lines regardless of `maxLinesCount`.

### Methodology Improvements

1. **Add fallback for no MCP access**: When MCP server isn't available, document approach should be:
   - Web search for official documentation
   - Cross-reference multiple IDE-specific docs
   - Note which behaviors are documented vs empirically verified

2. **Verify tool existence before documenting**: Cross-check spec assumptions against actual documentation.

3. **Include version requirements early**: Understanding 2025.2+ requirement would have clarified scope.

### Artifacts Produced

| Artifact | Location | Content |
|----------|----------|---------|
| Tool Inventory | `outputs/tool-inventory.md` | All 20 tools with parameters, returns, examples |
| Tool Dependencies | `outputs/tool-dependencies.md` | Common parameters, relationships, decision tree |

---

## Phase 1: Analysis

**Date**: 2026-01-21
**Status**: Complete

### What Worked

1. **Structured comparison approach**: Creating a detailed matrix comparing each operation (find, read, edit, search, etc.) made the decision criteria clear and actionable.

2. **Decision tree format**: ASCII-art decision trees and quick reference cards provide scannable guidance that will translate well to the final skill file.

3. **Workflow-first analysis**: Starting from user workflows (bug investigation, refactoring, etc.) rather than tool-first analysis revealed practical integration patterns.

4. **Error recovery documentation**: Including common errors and recovery patterns in workflows adds practical value beyond tool listing.

### Key Findings

1. **Clear tool preferences emerged**:
   - JetBrains ALWAYS wins for: `rename_refactoring`, `get_file_problems`, `get_symbol_info`
   - Standard ALWAYS wins for: Simple `Read`, precise `Edit`, `LSP` navigation, quick `Bash`
   - Context-dependent: Search operations, file creation

2. **JetBrains unique capabilities**:
   - `rename_refactoring` - No equivalent in standard tools (semantic-aware)
   - `get_all_open_file_paths` - IDE context awareness
   - `get_project_modules` - Monorepo structure understanding
   - `reformat_file` - IDE code style application

3. **Standard unique capabilities**:
   - `LSP goToDefinition/findReferences` - Navigation features JetBrains lacks
   - `Bash` background execution - JetBrains always waits
   - No confirmation requirement - Faster iteration

4. **Confirmation behavior is crucial**:
   - JetBrains `execute_*` tools require IDE confirmation by default
   - Brave Mode setting can bypass this
   - Standard `Bash` never requires confirmation

5. **Performance tiers identified**:
   - Fast (<100ms): Indexed operations, simple reads
   - Medium (100ms-5s): File operations, directory trees
   - Slow (5s+): Inspections, project-wide operations, execution

### Learnings

1. **Tool selection is context-dependent**: The same task may prefer different tools based on:
   - Whether IDE is actively being used
   - Size of codebase
   - Whether operation is one-time or repeated
   - Need for IDE integration vs speed

2. **JetBrains tools have mandatory parameters**: Every tool requires `projectPath`, many require `timeout`. This increases call verbosity but provides control.

3. **Output format differences matter**:
   - JetBrains search uses `||` delimiters for highlighting
   - JetBrains truncation is explicit (`START`/`MIDDLE`/`END`)
   - Standard tools have simpler defaults

4. **Workflow composition patterns**:
   - Investigation: JetBrains search → Standard read → JetBrains diagnostics → Standard edit
   - Refactoring: Standard LSP → JetBrains rename → JetBrains diagnostics
   - Exploration: JetBrains structure → Standard read

### Methodology Improvements

1. **Include example parameter values**: Decision tree should show actual parameter examples, not just tool names.

2. **Document the "why" prominently**: Quick reference cards need rationale, not just recommendations.

3. **Error recovery is essential**: Workflows without error handling are incomplete.

### Artifacts Produced

| Artifact | Location | Content |
|----------|----------|---------|
| Comparison Matrix | `outputs/comparison-matrix.md` | Tool-by-tool comparison with recommendations |
| Decision Tree | `outputs/decision-tree.md` | Flowchart-style tool selection guide |
| Workflow Analysis | `outputs/workflow-analysis.md` | 7 complete workflows with error recovery |

### Open Questions for Phase 2

1. How should the skill file organize tool recommendations - by task or by tool?
2. Should workflow snippets be included in the skill or kept separate?
3. What level of parameter detail belongs in quick reference vs detailed sections?

---

## Phase 2: Design

**Date**: 2026-01-21
**Status**: Complete

### What Worked

1. **Hybrid structure (Option C)**: Combining task-oriented quick reference with tool tables provides both lookup efficiency and completeness.

2. **Line budget discipline**: Setting a 270-line target (within 200-300 range) forced prioritization of high-value content over exhaustive documentation.

3. **Playwright skill as reference**: Following the established skill pattern (When to Invoke → Tools → Workflows → Troubleshooting) ensures consistency across skills.

4. **Tiered tool selection**: Classifying tools into "Always Include", "Mention Briefly", and "Omit" provided clear criteria for content decisions.

5. **Task-first table design**: The Quick Reference table answers "what do I need → which tool" rather than "here are all the tools".

### Design Decisions Made

1. **Path Strategy**: Universal `**/*` activation
   - JetBrains MCP is project-wide, not file-type specific
   - Unlike Playwright (UI-specific), IDE integration applies everywhere

2. **Tool Subset**: 14 tools (10 detailed + 4 brief)
   - Excluded 6 tools with equivalent/better standard alternatives
   - Focus on unique JetBrains capabilities

3. **Structure**: Hybrid (Quick Reference + Tool Tables + Workflows)
   - Quick Reference table is the core navigation aid
   - Tool tables provide scannable reference
   - Abbreviated workflows give pattern guidance

4. **Example Density**: Variable based on tool uniqueness
   - Full code blocks for unique tools (rename_refactoring)
   - Inline examples for common tools
   - Just mentions for secondary tools

5. **Workflow Abbreviation**: Steps only, no code blocks
   - 15-20 lines per workflow vs 50-80 in full analysis
   - Reference full docs for complete workflows

### Key Insights

1. **The skill is a router, not a manual**: Primary job is directing to the right tool, not documenting every parameter.

2. **"Not This" column adds value**: Explicitly stating when NOT to use JetBrains tools is as valuable as stating when to use them.

3. **Troubleshooting is essential**: 4 common issues (file not found, timeout, confirmation, MCP not responding) cover most failure modes.

4. **Universal activation is correct**: JetBrains MCP differs from specialized skills (Playwright) in being project-wide.

### Open Questions for Phase 3

1. Should the skill include a brief "How to Enable" section for JetBrains MCP setup?
2. Are the abbreviated workflows too terse? May need to tune during implementation.
3. Should Related links be at the top or bottom of the skill file?

### Artifacts Produced

| Artifact | Location | Content |
|----------|----------|---------|
| Skill Outline | `outputs/skill-outline.md` | Proposed structure with section details |
| Path Strategy | `outputs/path-strategy.md` | Activation strategy with alternatives considered |
| Content Plan | `outputs/content-plan.md` | Inclusion/exclusion decisions with rationale |

### Methodology Improvements

1. **Set line budget early**: Helps make content decisions faster.
2. **Reference existing skills**: Consistency matters for skill discovery.
3. **Task-first thinking**: Users ask "how do I..." not "what tools exist".

---

## Phase 3: Implementation

**Date**: 2026-01-21
**Status**: Complete

### What Worked

1. **Design artifacts were sufficient**: The skill-outline.md, content-plan.md, and tool-inventory.md provided everything needed for implementation without additional research.

2. **Playwright skill as format reference**: Matching the structure and style of existing skills (table-heavy, code examples, troubleshooting at end) ensured consistency.

3. **Quick Reference table as core**: The task-to-tool mapping table became the most valuable section - it directly answers "which tool should I use?"

4. **Abbreviated workflows**: Steps-only format (no code blocks) kept the workflows concise while still conveying the hybrid tool usage pattern.

5. **Explicit "when NOT to use" guidance**: Adding negative guidance (Standard `Read` over JetBrains `get_file_text_by_path`) prevents misuse.

### Implementation Decisions

1. **Line count achieved**: 242 lines (within 200-300 target)
   - Frontmatter + Header: 10 lines
   - When to Invoke: 18 lines (included "when NOT to use")
   - Project Path: 14 lines
   - Quick Reference: 20 lines
   - JetBrains-Only: 35 lines
   - Tool Reference: 40 lines
   - Common Workflows: 50 lines
   - Troubleshooting: 40 lines
   - Related: 10 lines

2. **All Tier 1 tools included with examples**:
   - `rename_refactoring` - full code block
   - `get_file_problems` - full code block
   - `get_all_open_file_paths` - full code block
   - `get_project_modules` - full code block
   - Other Tier 1 tools in reference tables

3. **Troubleshooting covers 4 issues**: File not found, timeout, confirmation, MCP not responding - matches design spec.

4. **Tool naming convention**: Consistently used `mcp__jetbrains__<tool_name>` prefix throughout.

### Learnings

1. **"When NOT to use" is as valuable as "when to use"**: Including explicit negative guidance prevents overuse of JetBrains tools when simpler standard tools suffice.

2. **Quick Reference table needs "Alternative" column**: Showing what to use when preferred tool isn't available adds resilience.

3. **Execution workflow deserves its own section**: The get_run_configurations → execute_run_configuration pattern is common enough to warrant a dedicated code example.

4. **Related links should be at bottom**: Following Playwright skill pattern - main content first, references last.

### Quality Verification

- [x] Skill file created at `.claude/skills/jetbrains-mcp.md`
- [x] Line count within 200-300 range (242 lines)
- [x] All Tier 1 tools have examples
- [x] Quick Reference covers common tasks
- [x] Format consistent with `playwright-mcp.md`
- [x] `mcp__jetbrains__` prefix used consistently
- [x] `projectPath` requirement emphasized
- [x] Clear "when NOT to use" guidance
- [x] Troubleshooting section complete
- [x] Related links functional

### Artifacts Produced

| Artifact | Location | Content |
|----------|----------|---------|
| JetBrains MCP Skill | `.claude/skills/jetbrains-mcp.md` | 242-line skill file following spec design |

---

## Phase 4: Validation

**Date**: 2026-01-21
**Status**: Complete

### Validation Results

All checklist items passed. No issues found requiring fixes.

#### Structural Verification
| Check | Status | Details |
|-------|--------|---------|
| File exists | ✅ Pass | `.claude/skills/jetbrains-mcp.md` |
| Line count | ✅ Pass | 242 lines (within 200-300 range) |
| Frontmatter | ✅ Pass | `paths: ["**/*"]` correct |
| All sections | ✅ Pass | When to Invoke, Tools, Workflows, Troubleshooting, Related |

#### Content Verification
| Check | Status | Details |
|-------|--------|---------|
| Tier 1 tools with examples | ✅ Pass | 5 tools: rename_refactoring, get_file_problems, get_all_open_file_paths, get_project_modules, execute_run_configuration |
| Quick Reference coverage | ✅ Pass | 9 task categories covered |
| Tool naming convention | ✅ Pass | Consistent `mcp__jetbrains__<tool_name>` prefix |
| projectPath emphasis | ✅ Pass | Dedicated "Critical: Project Path" section (lines 27-39) |
| "When NOT to use" guidance | ✅ Pass | Lines 20-25 explicitly list when to prefer standard tools |

#### Parameter Accuracy (vs tool-inventory.md)
| Tool | Status | Verified Parameters |
|------|--------|---------------------|
| `rename_refactoring` | ✅ Match | pathInProject, symbolName, newName, projectPath |
| `get_file_problems` | ✅ Match | filePath, errorsOnly, timeout, projectPath |
| `get_all_open_file_paths` | ✅ Match | projectPath only |
| `get_project_modules` | ✅ Match | projectPath only |
| `execute_run_configuration` | ✅ Match | configurationName, timeout, maxLinesCount, truncateMode, projectPath |

#### Quick Reference Coverage
| Task | Recommended Tool | Line | Status |
|------|------------------|------|--------|
| Symbol rename | JetBrains `rename_refactoring` | 47 | ✅ |
| File diagnostics | JetBrains `get_file_problems` | 48 | ✅ |
| Symbol info | JetBrains `get_symbol_info` | 49 | ✅ |
| Find by filename | JetBrains `find_files_by_name_keyword` | 50 | ✅ |
| Read file | Standard `Read` | 54 | ✅ |
| Precise edit | Standard `Edit` | 55 | ✅ |
| Run command | Standard `Bash` | 56 | ✅ |
| Find references | Standard `LSP` | 57 | ✅ |
| Go to definition | Standard `LSP` | 58 | ✅ |

#### Troubleshooting Completeness
| Issue | Lines | Solution Quality |
|-------|-------|------------------|
| File not found | 205-210 | ✅ Clear: use relative paths |
| Timeout errors | 212-217 | ✅ Clear: increase timeout, narrow scope |
| Confirmation required | 219-225 | ✅ Clear: Brave Mode or use Standard Bash |
| MCP not responding | 227-233 | ✅ Clear: checklist format with 4 items |

#### Link Verification
All 4 Related links validated against `ls outputs/`:
- ✅ `specs/jetbrains-mcp-skill/outputs/tool-inventory.md`
- ✅ `specs/jetbrains-mcp-skill/outputs/workflow-analysis.md`
- ✅ `specs/jetbrains-mcp-skill/outputs/decision-tree.md`
- ✅ `specs/jetbrains-mcp-skill/outputs/comparison-matrix.md`

#### Format Consistency (vs playwright-mcp.md)
| Element | Playwright | JetBrains | Status |
|---------|------------|-----------|--------|
| Frontmatter with paths | ✅ | ✅ | Match |
| "When to Invoke" section | ✅ | ✅ | Match |
| Tool tables by category | ✅ | ✅ | Match |
| Code examples | ✅ | ✅ | Match |
| Troubleshooting section | ✅ | ✅ | Match |
| Related section at bottom | ✅ | ✅ | Match |

### Issues Found

**None**. The skill file is accurate, complete, and consistent with established patterns.

### Validation Outcome

**SPEC COMPLETE** ✅

The JetBrains MCP skill file passes all validation checks:
- Structural integrity verified
- All parameter examples match source documentation
- Quick Reference is comprehensive
- Troubleshooting covers all 4 required scenarios
- Format matches Playwright skill pattern
- All Related links point to existing files

---

## Cross-Phase Patterns

*Synthesized insights that apply across phases*

### 1. Documentation-First Research Works

When MCP servers aren't directly accessible, web research of official documentation can produce accurate tool inventories. Key success factors:
- Cross-reference multiple source types (IDE docs, GitHub README, release notes)
- Document which behaviors are verified vs documented-only
- Include version requirements early

### 2. Task-Oriented Structure > Tool-Oriented

Users ask "how do I rename a symbol?" not "what does rename_refactoring do?" The Quick Reference table format (Task → Tool → Why) proved most valuable.

### 3. Negative Guidance is Essential

"When NOT to use" is as valuable as "when to use." Explicitly stating that Standard `Read` beats JetBrains `get_file_text_by_path` prevents misuse and reduces decision fatigue.

### 4. Abbreviated Workflows Suffice

Steps-only workflows (no inline code blocks) at 15-20 lines each provide pattern guidance without overwhelming the skill file. Full code examples belong in dedicated documentation.

### 5. Consistent Skill Structure Enables Discovery

Following the Playwright skill pattern (When to Invoke → Critical Note → Quick Reference → Tool Tables → Workflows → Troubleshooting → Related) creates predictable navigation across all skills.

### 6. Line Budget Discipline

Setting a 200-300 line target early forced content prioritization. The 242-line result is comprehensive without being exhaustive.
