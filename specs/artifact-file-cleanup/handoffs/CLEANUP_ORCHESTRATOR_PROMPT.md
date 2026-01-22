# Cleanup Execution Orchestrator Prompt

Copy-paste this prompt after Phase 2 (Validation) is complete to execute the cleanup.

**PREREQUISITE**: `outputs/artifact-candidates.md` must exist with validated findings.

---

## Prompt

You are implementing Phase 3 (Cleanup Execution) of the `artifact-file-cleanup` spec.

### Context

Phase 1 (Discovery) and Phase 2 (Validation) have been completed. The `outputs/artifact-candidates.md` file contains a validated list of artifact files categorized as DELETE, MOVE, or KEEP.

### Your Mission

1. **Read** the validated artifact report
2. **Delete** all files marked as DELETE
3. **Move** any files marked as MOVE to appropriate locations
4. **Verify** no references are broken after each deletion
5. **Run** verification commands to confirm repo health

### Pre-Cleanup Checklist

Before deleting anything:

- [ ] Read `specs/artifact-file-cleanup/outputs/artifact-candidates.md`
- [ ] Confirm the report has been validated (Phase 2 complete)
- [ ] Note which files are marked DELETE vs MOVE vs KEEP
- [ ] Ensure git working directory is clean (can revert if needed)

### Cleanup Protocol

**For each file marked DELETE:**

```bash
# 1. Final reference check
rg "filename" --type ts --type md --type json -l

# 2. If no references, delete
rm path/to/file

# 3. Quick verification
bun run check 2>&1 | head -20
```

**For each file marked MOVE:**

```bash
# 1. Identify destination (usually specs/[related-spec]/outputs/)
# 2. Move file
mv path/to/file specs/[spec]/outputs/

# 3. Update any references if needed
```

### Expected Deletions

Based on preliminary inventory, expect to delete:

**Root-level:**
- `update-spec-guide.py`
- `update-spec-guide.sh`
- `agents-meta-prompt.md`
- (others as identified in artifact-candidates.md)

**In packages/:**
- `packages/shared/client/README_AUDIT_REPORT.md`
- `packages/common/utils/AUDIT_REPORT.md`
- `packages/common/identity/IMPLEMENTATION_PROMPT.md`
- `tooling/repo-scripts/README_AUDIT_REPORT.md`

**In scripts/:**
- `scripts/update-handoff-standards.py`
- (others as validated in artifact-candidates.md)

### Verification Commands

After ALL deletions:

```bash
# Type checking
bun run check

# Linting
bun run lint

# Check for broken references to deleted files
rg "update-spec-guide|agents-meta-prompt|AUDIT_REPORT|IMPLEMENTATION_PROMPT" --type ts --type md

# If any tests reference deleted files
bun run test
```

### Commit Message Template

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: remove artifact files from completed specs

Removed leftover files from spec work and one-off tasks:
- Migration scripts (*.py, *.sh at root)
- Audit reports in package folders
- Implementation prompts in package folders
- Planning/meta documents at root

See specs/artifact-file-cleanup/outputs/artifact-candidates.md
for full inventory and rationale.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Success Criteria

- [ ] All DELETE files removed
- [ ] All MOVE files relocated
- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] No broken references (grep returns empty)
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] Git commit created with descriptive message

### Error Recovery

If deletion breaks something:

```bash
# Revert last deletion
git checkout -- path/to/file

# Check what broke
bun run check 2>&1 | grep -i error

# Update artifact-candidates.md to mark file as KEEP
# Add note about why it's needed
```

### Post-Cleanup

1. Update `REFLECTION_LOG.md` with:
   - Total files deleted
   - Any surprises or issues encountered
   - Recommendations for preventing future artifact accumulation

2. Consider proposing:
   - Pre-commit hook to warn about artifact patterns
   - Documentation policy for spec outputs
   - Cleanup checklist for spec completion

### Reference Files

- `specs/artifact-file-cleanup/README.md` - Full spec
- `specs/artifact-file-cleanup/outputs/artifact-candidates.md` - Validated file list
- `specs/artifact-file-cleanup/REFLECTION_LOG.md` - Phase learnings
