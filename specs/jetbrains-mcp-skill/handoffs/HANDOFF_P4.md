# Phase 4 Handoff: Validation - Verify the Skill File

## Context

Phases 0-3 are complete:
- **Phase 0**: Documented all 20 JetBrains MCP tools
- **Phase 1**: Created comparison matrix, decision tree, workflow analysis
- **Phase 2**: Designed skill structure, path strategy, content plan
- **Phase 3**: Wrote the skill file (242 lines)

## Phase 4 Mission

Validate the skill file: `.claude/skills/jetbrains-mcp.md`

## Validation Checklist

### Structural Validation

- [ ] File exists at `.claude/skills/jetbrains-mcp.md`
- [ ] Line count within 200-300 range
- [ ] Frontmatter has correct `paths:` configuration
- [ ] All major sections present (When to Invoke, Quick Reference, etc.)
- [ ] Format consistent with `playwright-mcp.md`

### Content Validation

- [ ] All Tier 1 tools have examples:
  - `rename_refactoring`
  - `get_file_problems`
  - `get_symbol_info`
  - `find_files_by_name_keyword`
  - `list_directory_tree`
  - `get_all_open_file_paths`
  - `get_project_modules`
  - `execute_terminal_command`
  - `execute_run_configuration`
  - `get_run_configurations`

- [ ] Quick Reference table covers:
  - Symbol rename
  - File diagnostics
  - Symbol info
  - File finding
  - File reading
  - File editing
  - Command execution
  - Code navigation

- [ ] Tool naming convention correct (`mcp__jetbrains__<tool_name>`)
- [ ] `projectPath` requirement documented clearly
- [ ] "When NOT to use" guidance included

### Accuracy Validation

Cross-check tool examples against `outputs/tool-inventory.md`:

- [ ] `rename_refactoring` parameters correct (`pathInProject`, `symbolName`, `newName`, `projectPath`)
- [ ] `get_file_problems` parameters correct (`filePath`, `errorsOnly`, `timeout`, `projectPath`)
- [ ] `get_all_open_file_paths` parameters correct (`projectPath` only)
- [ ] `get_project_modules` parameters correct (`projectPath` only)
- [ ] `execute_run_configuration` parameters correct (includes `truncateMode`, `maxLinesCount`)

### Troubleshooting Validation

- [ ] "File not found" issue addressed
- [ ] "Timeout" issue addressed
- [ ] "Confirmation required" issue addressed
- [ ] "MCP not responding" issue addressed

### Link Validation

- [ ] Related links point to existing files:
  - `specs/jetbrains-mcp-skill/outputs/tool-inventory.md`
  - `specs/jetbrains-mcp-skill/outputs/workflow-analysis.md`
  - `specs/jetbrains-mcp-skill/outputs/decision-tree.md`
  - `specs/jetbrains-mcp-skill/outputs/comparison-matrix.md`

## Comparison with Playwright Skill

| Aspect | Playwright Skill | JetBrains Skill | Match? |
|--------|------------------|-----------------|--------|
| Has frontmatter | ✓ | ? | |
| "When to Invoke" section | ✓ | ? | |
| Tool tables by category | ✓ | ? | |
| Code examples | ✓ | ? | |
| Troubleshooting section | ✓ | ? | |
| Related section | ✓ | ? | |

## Success Criteria

- [ ] All checklist items verified
- [ ] No parameter errors found
- [ ] Format matches existing skills
- [ ] `REFLECTION_LOG.md` updated with Phase 4 findings
- [ ] Spec marked complete if all criteria pass

## Potential Issues to Watch

1. **Parameter mismatches**: Tool inventory may have been updated - verify against official JetBrains docs if uncertain
2. **Missing tools**: Ensure no Tier 1 tools were accidentally omitted
3. **Inconsistent naming**: `pathInProject` vs `filePath` varies between tools - check consistency
4. **Version info**: IDE version 2025.2+ requirement should be mentioned somewhere

## Post-Validation Actions

If validation passes:
1. Update `REFLECTION_LOG.md` with Phase 4 findings
2. Mark spec as complete in `specs/README.md`
3. Create summary of the spec execution

If validation fails:
1. Document specific failures
2. Fix issues in skill file
3. Re-run validation
