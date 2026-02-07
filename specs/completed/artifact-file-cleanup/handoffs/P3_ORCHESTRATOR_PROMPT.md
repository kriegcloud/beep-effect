# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 (Cleanup Execution) of the artifact-file-cleanup spec.

---

## Prompt

You are implementing Phase 3 (Cleanup Execution) of the `artifact-file-cleanup` spec.

### Context

Phase 2 validated all candidates. 14 files are confirmed for deletion. One pre-deletion action is required: updating a reference in `done-feature.md` before deleting `analyze-jsdoc.mjs`.

### Your Mission

1. **Update the reference** in `done-feature.md`
2. **Delete all 14 validated files**
3. **Verify no broken references**
4. **Run quality checks**
5. **Create git commit**

### Step 1: Update done-feature.md (CRITICAL - DO FIRST)

Edit `.claude/commands/done-feature.md`:

Find:
```bash
# 6. Verify JSDoc coverage improvements (if applicable)
node scripts/analyze-jsdoc.mjs --file=<modified-files>
```

Replace with:
```bash
# 6. Verify JSDoc coverage improvements (if applicable)
bun run docs:lint
```

### Step 2: Delete Files

Execute these deletions:

```bash
# Root level (6 files)
rm update-spec-guide.py
rm update-spec-guide.sh
rm test-splitter.mjs
rm chat-ui.md
rm terragon-setup.sh
rm agents-meta-prompt.md

# Scripts folder (4 files)
rm scripts/update-handoff-standards.py
rm scripts/update-handoff-standards.ts
rm scripts/analyze-jsdoc.mjs
rm scripts/analyze-readme-inventory.ts

# Packages folder (3 files)
rm packages/shared/client/README_AUDIT_REPORT.md
rm packages/common/identity/IMPLEMENTATION_PROMPT.md
rm packages/common/utils/AUDIT_REPORT.md

# Tooling folder (1 file)
rm tooling/repo-scripts/README_AUDIT_REPORT.md
```

### Step 3: Verify No Broken References

Run grep checks (ignore hits in `specs/artifact-file-cleanup/`):

```bash
rg "analyze-jsdoc.mjs" --type ts --type md -l
rg "README_AUDIT_REPORT" --type ts --type md -l
rg "IMPLEMENTATION_PROMPT.md" --type ts --type md -l
```

### Step 4: Run Quality Checks

```bash
bun run check
bun run lint
```

### Step 5: Create Git Commit

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
- packages/common/utils/README.md: Removed AUDIT_REPORT.md link (P2)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Success Criteria

- [ ] `done-feature.md` updated before deletion
- [ ] All 14 files deleted
- [ ] No broken references (grep clean except spec docs)
- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] Git commit created
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings

### Reference Files

- `specs/artifact-file-cleanup/outputs/validation-report.md` - Final file lists
- `specs/artifact-file-cleanup/handoffs/HANDOFF_P3.md` - Detailed methodology
- `specs/artifact-file-cleanup/README.md` - Full spec

### After Completion

1. Update `REFLECTION_LOG.md` with Phase 3 learnings
2. Mark spec status as `complete` if applicable
3. Consider adding artifact detection patterns to `specs/_guide/PATTERN_REGISTRY.md`
