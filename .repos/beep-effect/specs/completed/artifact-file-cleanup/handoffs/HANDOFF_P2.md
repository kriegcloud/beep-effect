# Handoff: Phase 2 - Validation

> Complete context for Phase 2 of the artifact file cleanup spec.

---

## Previous Phase Summary

**Phase 1 (Discovery)** completed:
- Scanned 23 total files matching artifact patterns
- Categorized: 9 HIGH_CONFIDENCE_DELETE, 8 NEEDS_VALIDATION, 6 KEEP
- Generated `outputs/artifact-candidates.md` with full analysis
- Discovered linked audit report requiring README update before deletion
- Identified potential duplicate tooling (analyze-jsdoc.mjs vs .ts)

---

## Phase 2 Mission

Validate uncertain candidates and prepare final deletion list with user confirmation.

### Objectives

1. Get user confirmation on uncertain files
2. Handle link removal for `packages/common/utils/AUDIT_REPORT.md`
3. Investigate duplicate tooling (analyze-jsdoc)
4. Generate final validation report with explicit DELETE/KEEP decisions
5. Prepare Phase 3 execution plan

### Deliverable

`specs/artifact-file-cleanup/outputs/validation-report.md`

---

## Files Requiring Validation

### User Confirmation Needed

| File | Question | Recommendation |
|------|----------|----------------|
| `terragon-setup.sh` | Is Nix/direnv dev environment setup still needed? | DELETE if no active use |
| `agents-meta-prompt.md` | Is this planning doc superseded by `.claude/agents/`? | DELETE if superseded |

### Link Removal Required

| File | Linked From | Action |
|------|-------------|--------|
| `packages/common/utils/AUDIT_REPORT.md` | `packages/common/utils/README.md` line 490 | Remove link, then delete |

### Duplicate Investigation

| File A | File B | Question |
|--------|--------|----------|
| `scripts/analyze-jsdoc.mjs` | `tooling/repo-scripts/src/analyze-jsdoc.ts` | Same purpose? Keep Effect version? |
| `scripts/analyze-readme-inventory.ts` | `scripts/analyze-readme-simple.ts` | Superseded? |

---

## Validated File Lists (from Phase 1)

### HIGH_CONFIDENCE_DELETE (9 files)

These files are safe to delete without further validation:

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

### CONFIRMED KEEP (6 files)

These files should NOT be deleted:

```
scripts/sync-cursor-rules.ts (referenced in CLAUDE.md)
scripts/install-gitleaks.sh (security tooling)
scripts/analyze-agents-md.ts (active tooling)
scripts/analyze-readme-simple.ts (active tooling)
scripts/find-missing-agents.ts (active tooling)
scripts/analyze-jsdoc.md (documentation)
```

---

## Validation Methodology

### Step 1: User Validation

Ask user about:
1. `terragon-setup.sh` - "Is Nix/direnv setup still used for developer onboarding?"
2. `agents-meta-prompt.md` - "Is this planning doc superseded by the agent implementation?"

### Step 2: Link Removal

For `packages/common/utils/AUDIT_REPORT.md`:

1. Read `packages/common/utils/README.md`
2. Remove line 490: `- [AUDIT_REPORT.md](./AUDIT_REPORT.md)`
3. Add file to DELETE list

### Step 3: Duplicate Analysis

For `scripts/analyze-jsdoc.mjs`:
1. Check `.claude/commands/done-feature.md` reference
2. Compare functionality with `tooling/repo-scripts/src/analyze-jsdoc.ts`
3. Determine if Node.js version can be deprecated

### Step 4: Final Categorization

Update `outputs/artifact-candidates.md` or create `outputs/validation-report.md` with:
- Final DELETE list (with paths)
- Final KEEP list (with reasons)
- Any deferred decisions

---

## Output Template

Create `outputs/validation-report.md`:

```markdown
# Validation Report

**Date**: [DATE]
**Phase**: Validation (P2)

## Final Decisions

### DELETE (confirmed)
| File | Reason |
|------|--------|
| path/to/file | Pattern match + no refs |

### KEEP (confirmed)
| File | Reason |
|------|--------|
| path/to/file | Referenced in X |

### DEFERRED
| File | Reason for Deferral |
|------|---------------------|
| path/to/file | Needs further investigation |

## Pre-Deletion Checklist
- [ ] README link removed for utils/AUDIT_REPORT.md
- [ ] User confirmed terragon-setup.sh decision
- [ ] User confirmed agents-meta-prompt.md decision
```

---

## Success Criteria for Phase 2

- [ ] User validation obtained for uncertain files
- [ ] README link removed for utils/AUDIT_REPORT.md
- [ ] Duplicate tooling decision made (analyze-jsdoc)
- [ ] Final DELETE/KEEP lists generated
- [ ] `outputs/validation-report.md` created
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created for cleanup execution

---

## Files to Read

1. `specs/artifact-file-cleanup/outputs/artifact-candidates.md` - Phase 1 findings
2. `packages/common/utils/README.md` - For link removal
3. `.claude/commands/done-feature.md` - Check analyze-jsdoc.mjs usage

---

## Transition to Phase 3

After validation:

1. Create `outputs/validation-report.md` with final decisions
2. Update `REFLECTION_LOG.md` with Phase 2 learnings
3. Create `handoffs/HANDOFF_P3.md` with:
   - Exact file paths to delete
   - README edit to apply
   - Verification steps
4. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md`
