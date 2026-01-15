# Handoff Document: Windsurf Integration - Phase 1

**Created**: 2026-01-14
**Purpose**: Enable orchestrator agent to complete Windsurf integration implementation

---

## Context for Orchestrator

You are picking up the Windsurf Integration spec at the **implementation stage**. Research has been completed and a detailed plan exists. Your task is to execute the plan and validate the integration.

### What Has Been Done

1. **Spec created**: `specs/windsurf-integration/`
2. **Research completed**: Three research reports in `outputs/`
   - `windsurf-research.md` - Windsurf configuration analysis
   - `claude-config-audit.md` - Existing .claude/ audit
   - `compatibility-matrix.md` - Feature mapping
3. **Master synthesis**: `outputs/MASTER_RESEARCH.md`
4. **Implementation plan**: `PLAN.md` with detailed checklist

### What Needs to Be Done

Execute `PLAN.md` phases 1-4:
1. Validate symlink approach
2. Create AGENTS.md
3. Test frontmatter compatibility
4. Document and finalize

---

## Key Findings You Need to Know

### Symlink Strategy (Primary Approach)

The `.claude/rules/` directory can be symlinked to `.windsurf/rules/`:

```bash
mkdir -p .windsurf
ln -s ../.claude/rules .windsurf/rules
```

**Why this works**: All 3 rule files are under Windsurf's 6,000 character limit:
- behavioral.md: 1,826 bytes
- general.md: 2,449 bytes
- effect-patterns.md: 3,702 bytes
- Total: 7,977 bytes (under 12,000 combined limit)

### Potential Blockers

1. **Symlink behavior undocumented**: Windsurf may not follow symlinks. If symlink fails, fall back to file copying.

2. **Frontmatter differences**: Windsurf may require `trigger:` field:
   ```yaml
   # Windsurf expects
   ---
   trigger: always_on
   description: Rule description
   ---
   ```
   Claude Code uses `description:` and `paths:` without `trigger:`.

3. **AGENTS.md naming**: Windsurf uses `AGENTS.md` for directory-scoped rules. This won't conflict with `CLAUDE.md` but serves a similar purpose.

---

## Orchestrator Prompt

```
You are an implementation orchestrator for the Windsurf Integration spec.

## Your Mission

Execute the implementation plan in specs/windsurf-integration/PLAN.md to enable
the beep-effect monorepo to work with both Claude Code and Windsurf IDE.

## Required Outputs

1. Working .windsurf/ configuration (symlink or copy)
2. AGENTS.md file at project root
3. Verified rules loading in Windsurf
4. Updated REFLECTION_LOG.md with implementation learnings
5. Git commit with changes

## Constraints

- NEVER break existing Claude Code functionality
- Test each phase before proceeding
- Document any issues in REFLECTION_LOG.md
- Keep changes minimal and reversible

## Execution Steps

1. Read PLAN.md to understand full implementation
2. Execute Phase 1: Symlink Validation
   - Create .windsurf directory
   - Attempt symlink
   - If symlink fails, use copy fallback
3. Execute Phase 2: AGENTS.md Creation
   - Create root AGENTS.md with behavioral rules
   - Verify Windsurf picks it up
4. Execute Phase 3: Frontmatter Compatibility
   - Test if rules work without transformation
   - If needed, add transformation
5. Execute Phase 4: Documentation
   - Update project docs
   - Commit changes

## Success Criteria

- [ ] .windsurf/rules exists and is populated
- [ ] Rules visible in Windsurf Cascade
- [ ] AGENTS.md created and active
- [ ] Claude Code still works unchanged
- [ ] Changes committed to git

## Available Resources

- PLAN.md: Detailed checklist
- outputs/MASTER_RESEARCH.md: Synthesized findings
- outputs/windsurf-research.md: Windsurf documentation
- outputs/claude-config-audit.md: Current .claude/ analysis
- outputs/compatibility-matrix.md: Feature mapping

## When Complete

1. Mark all PLAN.md checkboxes as complete
2. Update REFLECTION_LOG.md with learnings
3. Create HANDOFF_P2.md if follow-up work identified
4. Commit all changes with descriptive message
```

---

## Quick Reference

### Commands

```bash
# Create symlink
ln -s ../.claude/rules .windsurf/rules

# Verify symlink
ls -la .windsurf/

# Check symlink target
readlink .windsurf/rules

# Remove symlink (if needed)
rm .windsurf/rules

# Copy fallback (if symlink fails)
cp -r .claude/rules/* .windsurf/rules/
```

### File Locations

| Purpose | Path |
|---------|------|
| Implementation Plan | `specs/windsurf-integration/PLAN.md` |
| Master Research | `specs/windsurf-integration/outputs/MASTER_RESEARCH.md` |
| Reflection Log | `specs/windsurf-integration/REFLECTION_LOG.md` |
| Claude Rules | `.claude/rules/` |
| Windsurf Rules (target) | `.windsurf/rules/` |
| AGENTS.md (to create) | `AGENTS.md` (project root) |

### Character Limits

| Platform | Per-File | Total |
|----------|----------|-------|
| Windsurf | 6,000 | 12,000 |
| Claude Code | No limit | Context window |

---

## Fallback Procedures

### If Symlink Fails

```bash
# Option 1: Direct symlink to individual files
for f in .claude/rules/*.md; do
  ln -s "../$f" ".windsurf/rules/$(basename $f)"
done

# Option 2: Copy files instead
mkdir -p .windsurf/rules
cp .claude/rules/*.md .windsurf/rules/
```

### If Frontmatter Incompatible

Add Windsurf frontmatter to existing files:
```yaml
---
trigger: always_on  # Add this line
description: Existing description
---
```

Or create separate Windsurf versions in `.windsurf/rules/` with copy script.

---

## Notes

- The symlink approach assumes Windsurf follows symlinks, which is undocumented
- Windsurf automatically discovers rules in parent directories up to git root
- AGENTS.md is simpler than rules (no frontmatter required)
- All skills/agents are out of scope for Phase 1 (too large or concept doesn't exist)

---

*Handoff prepared: 2026-01-14*
