# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 (Discovery) of the artifact-file-cleanup spec.

---

## Prompt

You are implementing Phase 1 (Discovery) of the `artifact-file-cleanup` spec.

### Context

The repository has accumulated artifact files from completed specs, one-off tasks, and temporary tooling. Your mission is to systematically discover all candidate files for cleanup.

### Your Mission

1. **Scan for artifact file patterns** across the repository
2. **Cross-reference** each candidate against package.json, CLAUDE.md, and codebase imports
3. **Categorize** findings as HIGH_CONFIDENCE_DELETE, NEEDS_VALIDATION, or KEEP
4. **Generate** comprehensive report in `outputs/artifact-candidates.md`

### Detection Patterns

**High Confidence Artifacts:**
- `*.py`, `*.sh` at repository root (not in scripts/)
- `*AUDIT*.md`, `*PROMPT*.md` in `packages/` or `tooling/`
- Root-level meta/planning markdown not in specs/

**Needs Validation:**
- Files in `scripts/` not referenced in package.json
- `*.mjs` files at root
- Any file matching patterns but with unclear purpose

### Critical Commands

```bash
# Find root scripts
ls *.py *.sh *.mjs 2>/dev/null

# Find audit/prompt files in packages
find packages tooling -name "*AUDIT*.md" -o -name "*PROMPT*.md" 2>/dev/null

# Check if file is referenced
rg "filename" --type ts --type md --type json -l

# Check package.json scripts
cat package.json | jq '.scripts | keys'
```

### Delegation

Delegate systematic scanning to `codebase-researcher`:

```
Use codebase-researcher to scan for artifact files:
1. Find *.py, *.sh, *.mjs at root
2. Find *AUDIT*.md, *PROMPT*.md in packages/
3. List scripts/ contents and cross-reference package.json
4. Check each candidate for references in codebase
```

### Output Requirements

Create `specs/artifact-file-cleanup/outputs/artifact-candidates.md`:

```markdown
# Artifact Candidates Report

## Summary
| Category | Count |
|----------|-------|
| High Confidence DELETE | N |
| Needs Validation | N |
| Confirmed KEEP | N |

## High Confidence DELETE
| File | Category | Rationale |
|------|----------|-----------|

## Needs Validation
| File | Category | Question |
|------|----------|----------|

## Confirmed KEEP
| File | Reason |
|------|--------|
```

### Success Criteria

- [ ] All root-level scripts scanned
- [ ] All packages scanned for audit/prompt files
- [ ] scripts/ folder analyzed against package.json
- [ ] Each candidate has reference check documented
- [ ] `outputs/artifact-candidates.md` created
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created for next phase

### Reference Files

- `specs/artifact-file-cleanup/README.md` - Full spec
- `specs/artifact-file-cleanup/handoffs/HANDOFF_P1.md` - Detailed methodology
- `CLAUDE.md` - Check for script references
- `package.json` - Check scripts section

### Next Phase

After discovery, create:
1. `handoffs/HANDOFF_P2.md` - Validation phase context
2. `handoffs/P2_ORCHESTRATOR_PROMPT.md` - Validation phase prompt
