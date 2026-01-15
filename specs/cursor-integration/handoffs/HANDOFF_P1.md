# Cursor Integration Handoff — Phase 1 Implementation

**Date**: 2026-01-14
**Purpose**: Handoff document for implementing Cursor IDE configuration integration
**Status**: Ready for orchestrator execution

---

## Session Summary: Research Phase Completed

| Metric | Status |
|--------|--------|
| Research outputs created | ✅ 4 files (cursor-research.md, claude-config-audit.md, compatibility-matrix.md, MASTER_RESEARCH.md) |
| Implementation plan created | ✅ PLAN.md with phased approach |
| Spec structure created | ✅ README.md, REFLECTION_LOG.md, handoffs/ directory |
| Verification needed | ⚠️ Critic review of outputs (in progress) |

---

## Context from Research Phase

### Key Findings

1. **Rules Migration is Viable**: All 3 rule files (7,977 bytes, ~260 lines) are compatible with Cursor's format requirements.

2. **Transformation Required**: 
   - File extension: `.md` → `.mdc`
   - Frontmatter: Add `description:` (required), `alwaysApply:` (recommended)
   - Field rename: `paths:` → `globs:` (for effect-patterns.md)

3. **Symlinks Not Viable**: Cursor has broken symlink support. Must use file copy/transform approach.

4. **Skills/Agents Cannot Migrate**: No Cursor equivalent for these concepts.

### Research Artifacts

All research outputs are in `specs/cursor-integration/outputs/`:
- `cursor-research.md` - Comprehensive Cursor configuration documentation
- `claude-config-audit.md` - Current .claude/ state (verified)
- `compatibility-matrix.md` - Feature mapping between systems
- `MASTER_RESEARCH.md` - Synthesized findings and recommendations

---

## Remaining Work: Phase 1 Implementation

### Task 1: Proof of Concept (1-2 hours)

**Goal**: Manually transform one rule file and verify it works in Cursor.

**Steps**:
1. Create `.cursor/rules/` directory
2. Manually transform `behavioral.md` → `behavioral.mdc`:
   - Add frontmatter with `description:` and `alwaysApply: true`
   - Copy content from `.claude/rules/behavioral.md`
   - Save as `.cursor/rules/behavioral.mdc`
3. Open project in Cursor IDE
4. Verify rule appears and applies correctly
5. Test with a coding session to confirm behavioral rules are followed

**Verification**:
- [ ] `.cursor/rules/behavioral.mdc` exists
- [ ] File has correct frontmatter format
- [ ] Cursor recognizes the rule
- [ ] Rule applies in Cursor chat sessions

### Task 2: Transformation Script (2-3 hours)

**Goal**: Create Effect-based script to automate transformation.

**Steps**:
1. Create `scripts/sync-cursor-rules.ts`
2. Implement using Effect FileSystem (NOT Node.js fs):
   - Read `.claude/rules/*.md` files
   - Parse/transform frontmatter
   - Write `.cursor/rules/*.mdc` files
3. Test script on all 3 rule files
4. Verify output format matches expected structure

**Critical Requirements**:
- ✅ Must use Effect FileSystem service
- ✅ Must use Effect Array/String utilities (not native methods)
- ✅ Must handle errors through Effect runtime
- ✅ Must transform `paths:` → `globs:`
- ✅ Must add `description:` and `alwaysApply:` fields

**Reference**: See PLAN.md Phase 2 for script template.

### Task 3: Full Integration (1 hour)

**Goal**: Run transformation on all files and verify both IDEs work.

**Steps**:
1. Execute transformation script
2. Verify all 3 `.mdc` files created
3. Test in Cursor: verify rules load and apply
4. Test in Claude Code: verify no regression
5. Document any issues

### Task 4: Documentation (30 minutes)

**Goal**: Update project docs and version control changes.

**Steps**:
1. Add Cursor section to README.md or CLAUDE.md
2. Document setup process
3. Commit changes with clear message
4. Update REFLECTION_LOG.md with learnings

---

## Improved Implementation Guidelines

### Based on Windsurf Spec Learnings

1. **Effect Patterns are Critical**: All file operations MUST use Effect FileSystem. The PLAN.md includes a script template following this pattern.

2. **Test Incrementally**: Start with one file, verify it works, then proceed to full automation.

3. **Frontmatter Verification**: Test frontmatter format early - Cursor may have specific requirements not fully documented.

4. **Symlink Avoidance**: Do NOT attempt symlinks - Cursor has broken symlink support. Use file copy/transform only.

5. **Documentation Matters**: Update REFLECTION_LOG.md after each phase with what worked/didn't work.

---

## P1 Orchestrator Prompt

```
You are implementing the Cursor IDE integration for the beep-effect monorepo.

## Context
- Research phase complete: All findings in specs/cursor-integration/outputs/
- Implementation plan: specs/cursor-integration/PLAN.md
- Goal: Transform .claude/rules/*.md → .cursor/rules/*.mdc with proper frontmatter

## Critical Constraints
1. ALL file operations MUST use Effect FileSystem (NOT Node.js fs)
2. ALL string/array operations MUST use Effect utilities (NOT native methods)
3. Do NOT use symlinks - Cursor has broken symlink support
4. Test incrementally - start with one file before automating

## Tasks (in order)
1. Proof of concept: Manually transform behavioral.md → behavioral.mdc, test in Cursor
2. Create transformation script: scripts/sync-cursor-rules.ts using Effect patterns
3. Run full transformation: All 3 rule files
4. Documentation: Update README/CLAUDE.md, commit changes

## Reference Files
- PLAN.md: Detailed implementation steps
- outputs/MASTER_RESEARCH.md: Synthesis of findings
- outputs/compatibility-matrix.md: Field mapping requirements

## Success Criteria
- [ ] All 3 rule files transformed to .mdc format
- [ ] Rules load correctly in Cursor IDE
- [ ] Claude Code continues working unchanged
- [ ] Transformation script uses Effect patterns
- [ ] Documentation updated

Execute tasks sequentially, verifying after each step.
```

---

## Verification Commands

### After Proof of Concept
```bash
# Verify file exists
ls -la .cursor/rules/behavioral.mdc

# Check frontmatter format
head -n 5 .cursor/rules/behavioral.mdc

# Verify file size
wc -c .cursor/rules/behavioral.mdc
```

### After Script Creation
```bash
# Run transformation script
bun run scripts/sync-cursor-rules.ts

# Verify all files created
ls -la .cursor/rules/*.mdc

# Check frontmatter in all files
head -n 5 .cursor/rules/*.mdc
```

### After Full Integration
```bash
# Verify both directories exist
ls -la .claude/rules/
ls -la .cursor/rules/

# Check file counts match
find .claude/rules -name "*.md" | wc -l
find .cursor/rules -name "*.mdc" | wc -l
```

---

## Success Criteria

### Minimum Viable
- [ ] `.cursor/rules/` directory exists with `.mdc` files
- [ ] At least one rule loads in Cursor IDE
- [ ] Claude Code continues working

### Full Success
- [ ] All 3 rule files transformed and loaded
- [ ] Transformation script functional
- [ ] Rules apply correctly in Cursor
- [ ] Documentation complete
- [ ] Changes version controlled

---

## Notes for Next Agent

1. **Start Small**: Proof of concept with one file first
2. **Verify Early**: Test in Cursor after each major step
3. **Effect Patterns**: Double-check all file operations use Effect FileSystem
4. **Document Issues**: Update REFLECTION_LOG.md with any problems encountered
5. **Preserve Source**: Never modify `.claude/rules/` - it's the source of truth

---

## Rollback Instructions

If issues arise:
```bash
# Remove Cursor configuration
rm -rf .cursor/
rm -f scripts/sync-cursor-rules.ts

# If committed, revert
git log --oneline -1 --grep="Cursor"
# git revert HEAD  # If needed
```

---

*Handoff created: 2026-01-14*
*Ready for orchestrator execution*
