# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 validation.

---

## Prompt

You are validating Phase 4 (Validation) of the JetBrains MCP Skill spec.

### Context

Phases 0-3 are complete:
- **Phase 0**: Documented all 20 JetBrains MCP tools
- **Phase 1**: Created comparison matrix, decision tree, workflow analysis
- **Phase 2**: Designed skill structure, path strategy, content plan
- **Phase 3**: Wrote skill file (242 lines)

### Your Mission

Validate the skill file: `.claude/skills/jetbrains-mcp.md`

### Validation Steps

**1. Structural Check**
```bash
wc -l .claude/skills/jetbrains-mcp.md
```
Expected: 200-300 lines

**2. Content Verification**

Read these files in parallel:
- `.claude/skills/jetbrains-mcp.md` - The skill to validate
- `outputs/tool-inventory.md` - Source of truth for parameters
- `.claude/skills/playwright-mcp.md` - Format reference

**3. Parameter Accuracy**

Verify each Tier 1 tool example matches the tool inventory:

| Tool | Parameters to Check |
|------|---------------------|
| `rename_refactoring` | `pathInProject`, `symbolName`, `newName`, `projectPath` |
| `get_file_problems` | `filePath`, `errorsOnly`, `timeout`, `projectPath` |
| `get_all_open_file_paths` | `projectPath` only |
| `get_project_modules` | `projectPath` only |
| `execute_run_configuration` | `configurationName`, `timeout`, `maxLinesCount`, `truncateMode`, `projectPath` |

**4. Quick Reference Coverage**

Ensure the Quick Reference table covers these tasks:
- Symbol rename → JetBrains
- File diagnostics → JetBrains
- Symbol info → JetBrains
- Find by filename → JetBrains
- Read file → Standard
- Precise edit → Standard
- Run command → Standard
- Go to definition → Standard LSP
- Find references → Standard LSP

**5. Troubleshooting Completeness**

Verify all 4 issues are addressed:
- File not found
- Timeout errors
- Confirmation required
- MCP not responding

**6. Link Verification**

Check that Related links point to existing files:
```bash
ls specs/jetbrains-mcp-skill/outputs/
```

**7. Format Consistency**

Compare structure with Playwright skill:
- [ ] Frontmatter with paths
- [ ] "When to Invoke" section
- [ ] Tool tables by category
- [ ] Code examples
- [ ] Troubleshooting section
- [ ] Related section at bottom

### Validation Checklist

After completing validation, mark each item:

**Structural**
- [ ] File exists at correct path
- [ ] Line count within 200-300
- [ ] Frontmatter correct
- [ ] All sections present

**Content**
- [ ] All Tier 1 tools have examples
- [ ] Quick Reference comprehensive
- [ ] Tool naming convention correct
- [ ] projectPath requirement emphasized
- [ ] "When NOT to use" included

**Accuracy**
- [ ] Parameter examples match tool-inventory.md
- [ ] No deprecated tools referenced
- [ ] Version requirement mentioned

**Troubleshooting**
- [ ] 4 common issues covered
- [ ] Solutions are actionable

**Links**
- [ ] All Related links valid

### Success Criteria

- [ ] All checklist items pass
- [ ] No parameter errors found
- [ ] Format matches Playwright skill
- [ ] `REFLECTION_LOG.md` updated with Phase 4 findings
- [ ] Spec marked complete

### Output Required

1. Validation report (pass/fail for each item)
2. List of any issues found
3. Fixes applied (if any)
4. Updated `REFLECTION_LOG.md` with Phase 4 section
5. Final status: SPEC COMPLETE or NEEDS REVISION

### Handoff Document

Read full context in: `specs/jetbrains-mcp-skill/handoffs/HANDOFF_P4.md`
