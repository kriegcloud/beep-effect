# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 (Design) of the JetBrains MCP Skill spec.

### Context

Phases 0-1 are complete. We have comprehensive analysis:
- `specs/jetbrains-mcp-skill/outputs/tool-inventory.md` - All 20 tools
- `specs/jetbrains-mcp-skill/outputs/tool-dependencies.md` - Parameters & relationships
- `specs/jetbrains-mcp-skill/outputs/comparison-matrix.md` - JetBrains vs Standard recommendations
- `specs/jetbrains-mcp-skill/outputs/decision-tree.md` - Tool selection flowcharts
- `specs/jetbrains-mcp-skill/outputs/workflow-analysis.md` - 7 complete workflows

### Your Mission

Design the skill file structure for `.claude/skills/jetbrains-mcp.md`.

### Design Decisions to Make

1. **Skill Structure** - Choose organization pattern:
   - Option A: Task-oriented (Finding Files, Editing, Running, etc.)
   - Option B: Tool-oriented (Code Intelligence, File Ops, Search, etc.)
   - Option C: Hybrid (Quick Reference + Detailed Tools + Workflows)

2. **Tool Scope** - Which of the 20 tools to include:
   - All 20 tools (comprehensive but long)
   - Top 10-12 high-value tools (focused)
   - Core tools + reference to full inventory

3. **Detail Level** - For each included tool:
   - Full parameter table (verbose, ~10-15 lines per tool)
   - Example-only (compact, ~3-5 lines per tool)
   - Quick reference + link to full docs

4. **Path Activation** - When skill should trigger:
   ```yaml
   paths:
     - "**/*"  # Always available
     - "packages/**/*"  # Only packages
     - ???
   ```

5. **Workflow Inclusion** - How to present workflows:
   - Full workflows (from workflow-analysis.md)
   - Abbreviated quick patterns
   - Reference to separate document

### Reference: Playwright Skill

Read `.claude/skills/playwright-mcp.md` for the established skill pattern:
1. When to Invoke section
2. Critical configuration note
3. Tool tables by category
4. Common Workflows with examples
5. Output format explanation
6. Debugging tips
7. Troubleshooting section

### Key Insights from Phase 1

**Always use JetBrains for:**
- `rename_refactoring` (semantic, project-wide)
- `get_file_problems` (IntelliJ inspections)
- `get_symbol_info` (Quick Documentation)
- `find_files_by_name_keyword` (indexed search)

**Always use Standard for:**
- `Read` (simpler API)
- `Edit` (precise, unique string matching)
- `LSP goToDefinition/findReferences` (JetBrains lacks these)
- `Bash` (no confirmation needed)

**JetBrains unique capabilities:**
- Semantic refactoring
- IDE context awareness
- IntelliJ inspection engine
- Project/module structure

### Outputs to Create

1. **`outputs/skill-outline.md`** - Proposed structure with all headings
2. **`outputs/path-strategy.md`** - When skill activates + rationale
3. **`outputs/content-plan.md`** - What to include, what to reference

### Skill Size Constraint

Target: **200-300 lines** (per CLAUDE.md guidelines)

Current content would yield ~500+ lines if all included. Must make selective choices.

### Verification

After completing:
```bash
ls -la specs/jetbrains-mcp-skill/outputs/
```

Should show new files: `skill-outline.md`, `path-strategy.md`, `content-plan.md`

### Success Criteria

- [ ] `outputs/skill-outline.md` created with proposed structure
- [ ] `outputs/path-strategy.md` created with activation strategy
- [ ] `outputs/content-plan.md` created with content decisions
- [ ] Design justifies choices with rationale
- [ ] Estimated line count within 200-300 range
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/jetbrains-mcp-skill/handoffs/HANDOFF_P2.md`
