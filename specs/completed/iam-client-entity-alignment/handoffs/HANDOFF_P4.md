# Phase 4 Handoff: Verification & Cleanup

---

## Mission
Final verification that all success criteria are met. Fix any remaining issues and update documentation.

---

## Working Memory (Current Tasks)

### Task 4.1: Full Type Check
```bash
bun run check --filter @beep/iam-client
```
- Must pass with 0 errors
- If errors, fix them before proceeding

### Task 4.2: Lint Fix
```bash
bun run lint:fix --filter @beep/iam-client
```
- Apply automatic fixes
- Review any manual fixes needed

### Task 4.3: Verify No Plain String IDs
```bash
grep -r ": S.String" packages/iam/client/src/ | grep -iE "(id|Id):"
```
- Should return **empty** (no matches)
- If matches found, go back and fix them

### Task 4.4: Verify EntityId Imports
```bash
grep -r "IamEntityIds\|SharedEntityIds" packages/iam/client/src/ | head -30
```
- Should show EntityIds being used in schema files
- Verify imports are correct

### Task 4.5: Update Documentation (if needed)
Review `packages/iam/client/AGENTS.md`:
- Add notes about EntityId usage if patterns changed significantly
- Update any examples that show old patterns

### Task 4.6: Update REFLECTION_LOG.md
Document learnings from spec execution:
- What worked well
- What was challenging
- Patterns discovered
- Recommendations for future work

---

## Episodic Memory (Previous Phases)

**P0**: Created inventory of all files needing updates
**P1**: Updated `_common/` and `_internal/` schemas with EntityIds
**P2**: Updated all Payload classes with EntityIds and type assertions
**P3**: Verified/updated Success classes, created transformations if needed

---

## Success Criteria Checklist

From README.md:

| Metric | Target | Verification |
|--------|--------|--------------|
| ID fields using EntityIds | 100% | `grep -r ": S.String" packages/iam/client/src/ \| grep -iE "(id\|Id):" \| wc -l` = 0 |
| Type errors | 0 | `bun run check --filter @beep/iam-client` |
| Lint errors | 0 | `bun run lint --filter @beep/iam-client` |
| Transformation schemas | All entity types | Manual review |

---

## Final Verification Script

Run all checks in sequence:

```bash
# 1. Type check
echo "=== Type Check ===" && \
bun run check --filter @beep/iam-client && \
echo "PASS: Type check" || echo "FAIL: Type check"

# 2. Lint
echo "=== Lint ===" && \
bun run lint --filter @beep/iam-client && \
echo "PASS: Lint" || echo "FAIL: Lint"

# 3. No plain string IDs
echo "=== String ID Check ===" && \
COUNT=$(grep -r ": S.String" packages/iam/client/src/ | grep -iE "(id|Id):" | wc -l) && \
if [ "$COUNT" -eq "0" ]; then echo "PASS: No plain string IDs"; else echo "FAIL: Found $COUNT plain string IDs"; fi
```

---

## Cleanup Checklist

- [ ] Remove any debugging code added during implementation
- [ ] Remove any commented-out old code
- [ ] Ensure consistent import ordering
- [ ] Verify no unused imports

---

## Documentation Updates

If significant patterns changed, update:
- [ ] `packages/iam/client/AGENTS.md` - Add EntityId usage section
- [ ] `packages/iam/client/CLAUDE.md` - Update examples if needed

---

## Spec Completion

When all success criteria pass:

1. Update `REFLECTION_LOG.md` with final learnings
2. Mark spec as complete
3. Consider if patterns should be promoted to `.claude/rules/` or `.claude/skills/`

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `README.md` | Success criteria |
| `REFLECTION_LOG.md` | Update with learnings |
| `packages/iam/client/AGENTS.md` | May need updates |
