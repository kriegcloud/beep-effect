# Handoff: Phase 3 - Cleanup Execution

> Complete context for Phase 3 of the artifact file cleanup spec.

---

## Previous Phase Summary

**Phase 2 (Validation)** completed:
- User validated 3 uncertain files (all DELETE)
- Identified 5 additional files for deletion beyond Phase 1
- Final DELETE count: 14 files
- Final KEEP count: 6 files
- README link removed for `utils/AUDIT_REPORT.md`
- Generated `outputs/validation-report.md`

---

## Phase 3 Mission

Execute the cleanup: delete validated files, update references, and verify repository integrity.

### Objectives

1. Update `done-feature.md` reference before deleting `analyze-jsdoc.mjs`
2. Delete all 14 validated artifact files
3. Verify no broken references remain
4. Run `bun run check` and `bun run lint`
5. Create git commit with structured message

### Deliverable

- Clean repository with 14 artifact files removed
- Updated `done-feature.md` with Effect analyzer reference
- Git commit documenting changes

---

## Pre-Deletion Action: Update done-feature.md

**CRITICAL**: Must be done BEFORE deleting `scripts/analyze-jsdoc.mjs`

File: `.claude/commands/done-feature.md`

Current reference (line ~29):
```bash
# 6. Verify JSDoc coverage improvements (if applicable)
node scripts/analyze-jsdoc.mjs --file=<modified-files>
```

Replace with:
```bash
# 6. Verify JSDoc coverage improvements (if applicable)
bun run docs:lint
```

Or for file-specific analysis:
```bash
bun run tooling/repo-scripts/src/analyze-jsdoc.ts --file=<modified-files>
```

---

## Files to Delete (14 total)

### Root Level (6 files)

```bash
rm update-spec-guide.py
rm update-spec-guide.sh
rm test-splitter.mjs
rm chat-ui.md
rm terragon-setup.sh
rm agents-meta-prompt.md
```

### Scripts Folder (4 files)

```bash
rm scripts/update-handoff-standards.py
rm scripts/update-handoff-standards.ts
rm scripts/analyze-jsdoc.mjs
rm scripts/analyze-readme-inventory.ts
```

### Packages Folder (3 files)

```bash
rm packages/shared/client/README_AUDIT_REPORT.md
rm packages/common/identity/IMPLEMENTATION_PROMPT.md
rm packages/common/utils/AUDIT_REPORT.md
```

### Tooling Folder (1 file)

```bash
rm tooling/repo-scripts/README_AUDIT_REPORT.md
```

---

## Verification Commands

After deletion, run these verification steps:

```bash
# 1. Check for any remaining references to deleted files
rg "update-spec-guide" --type ts --type md -l
rg "test-splitter" --type ts --type md -l
rg "chat-ui.md" --type ts --type md -l
rg "terragon-setup" --type ts --type md -l
rg "agents-meta-prompt" --type ts --type md -l
rg "update-handoff-standards" --type ts --type md -l
rg "analyze-jsdoc.mjs" --type ts --type md -l
rg "analyze-readme-inventory" --type ts --type md -l
rg "README_AUDIT_REPORT" --type ts --type md -l
rg "IMPLEMENTATION_PROMPT" --type ts --type md -l
rg "AUDIT_REPORT.md" packages/common/utils --type md -l

# 2. Type check
bun run check

# 3. Lint
bun run lint

# 4. Verify scripts still work
bun run docs:lint --help
```

---

## Expected Reference Hits (Safe to Ignore)

These references are in the spec itself and are expected:

- `specs/artifact-file-cleanup/outputs/artifact-candidates.md`
- `specs/artifact-file-cleanup/outputs/validation-report.md`
- `specs/artifact-file-cleanup/handoffs/HANDOFF_P*.md`
- `specs/artifact-file-cleanup/REFLECTION_LOG.md`

---

## Git Commit Template

```bash
git add -A && git commit -m "$(cat <<'EOF'
chore: remove 14 artifact files from repository

Cleanup validated through artifact-file-cleanup spec (P1-P3):

Deleted files:
- Root: update-spec-guide.{py,sh}, test-splitter.mjs, chat-ui.md,
        terragon-setup.sh, agents-meta-prompt.md
- scripts/: update-handoff-standards.{py,ts}, analyze-jsdoc.mjs,
            analyze-readme-inventory.ts
- packages/: README_AUDIT_REPORT.md (3), IMPLEMENTATION_PROMPT.md (1)
- tooling/: README_AUDIT_REPORT.md (1)

Updated:
- .claude/commands/done-feature.md: Updated JSDoc analyzer reference
- packages/common/utils/README.md: Removed AUDIT_REPORT.md link

Validation:
- User confirmed deletion for terragon-setup.sh, agents-meta-prompt.md
- Duplicate tooling resolved (analyze-jsdoc.mjs → Effect version)
- No broken references after cleanup

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Success Criteria for Phase 3

- [ ] `done-feature.md` updated with Effect analyzer reference
- [ ] All 14 files deleted
- [ ] No grep hits for deleted filenames (except spec documentation)
- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] Git commit created with structured message
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings

---

## Rollback Plan

If issues arise:

1. Use `git checkout HEAD -- <file>` to restore individual files
2. Use `git reset --hard HEAD~1` to undo entire commit
3. Re-run verification to identify issue source

---

## Files to Read

1. `specs/artifact-file-cleanup/outputs/validation-report.md` - Final DELETE/KEEP lists
2. `.claude/commands/done-feature.md` - File to update before deletion
3. `specs/artifact-file-cleanup/README.md` - Full spec for context

---

## Transition to Phase 4

After cleanup:

1. Update `REFLECTION_LOG.md` with Phase 3 learnings
2. Mark spec as complete in `specs/README.md`
3. Consider promoting artifact detection patterns to spec guide
