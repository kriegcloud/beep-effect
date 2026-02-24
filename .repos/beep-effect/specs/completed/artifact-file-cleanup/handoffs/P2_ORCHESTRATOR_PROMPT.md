# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 (Validation) of the artifact-file-cleanup spec.

---

## Prompt

You are implementing Phase 2 (Validation) of the `artifact-file-cleanup` spec.

### Context

Phase 1 discovered 23 artifact candidates. 9 are confirmed for deletion, 6 are confirmed to keep, and 8 need validation. Your mission is to resolve the uncertain files and prepare the final deletion list.

### Your Mission

1. **Get user confirmation** on uncertain files
2. **Handle link removal** for the linked audit report
3. **Investigate duplicate tooling**
4. **Generate validation-report.md** with final decisions

### Files Requiring User Validation

Ask the user about these files:

```
terragon-setup.sh
- Purpose: Nix/direnv development environment setup
- Question: Is this still needed? No .envrc file exists in repo.

agents-meta-prompt.md
- Purpose: Planning notes for agent system
- Question: Is this superseded by the implemented .claude/agents/ system?
```

### Link Removal Required

Before deleting `packages/common/utils/AUDIT_REPORT.md`:

1. Edit `packages/common/utils/README.md`
2. Remove line ~490: `- [AUDIT_REPORT.md](./AUDIT_REPORT.md)`

### Duplicate Investigation

Check if `scripts/analyze-jsdoc.mjs` can be removed:
- It's referenced in `.claude/commands/done-feature.md`
- An Effect version exists at `tooling/repo-scripts/src/analyze-jsdoc.ts`
- Determine if they serve different purposes

### Confirmed DELETE List (from Phase 1)

These 9 files are safe to delete:
```
update-spec-guide.py
update-spec-guide.sh
test-splitter.mjs
chat-ui.md
scripts/update-handoff-standards.py
scripts/update-handoff-standards.ts
packages/shared/client/README_AUDIT_REPORT.md
packages/common/identity/IMPLEMENTATION_PROMPT.md
tooling/repo-scripts/README_AUDIT_REPORT.md
```

### Critical Commands

```bash
# Check file still exists before adding to delete list
ls -la path/to/file

# Verify no references missed
rg "filename" --type ts --type md -l

# Edit README to remove link
# Use Edit tool on packages/common/utils/README.md
```

### Output Requirements

Create `specs/artifact-file-cleanup/outputs/validation-report.md`:

```markdown
# Validation Report

**Date**: [DATE]
**Phase**: Validation (P2)

## User Decisions
| File | User Decision | Rationale |
|------|--------------|-----------|

## Final DELETE List
| # | File Path | Category |
|---|-----------|----------|
| 1 | update-spec-guide.py | Migration Script |
...

## Final KEEP List
| File | Reason |
|------|--------|

## Pre-Deletion Actions Completed
- [ ] README link removed for utils/AUDIT_REPORT.md
```

### Success Criteria

- [ ] User validation obtained for uncertain files
- [ ] README link removed
- [ ] Duplicate tooling decision made
- [ ] `outputs/validation-report.md` created
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P3.md` created

### Reference Files

- `specs/artifact-file-cleanup/outputs/artifact-candidates.md` - Phase 1 findings
- `specs/artifact-file-cleanup/handoffs/HANDOFF_P2.md` - Detailed methodology
- `specs/artifact-file-cleanup/README.md` - Full spec

### Next Phase

After validation, create:
1. `handoffs/HANDOFF_P3.md` - Cleanup execution context
2. `handoffs/P3_ORCHESTRATOR_PROMPT.md` - Cleanup execution prompt
