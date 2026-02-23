# Phase 6 Orchestrator Prompt

Copy-paste this prompt to start Phase 6 verification.

---

## Prompt

You are executing Phase 6 (Verification) of the lexical-utils-effect-refactor spec.

### Context

Phases 4-5 (Implementation) are complete with PASS status. The following files were refactored:

**Phase 4 (Priority 1)**:
- `docSerialization.ts` - Effect.gen, TaggedErrors, Promise wrappers
- `swipe.ts` - MutableHashSet, native WeakMap preserved

**Phase 5 (Priority 2-3)**:
- `getThemeSelector.ts` - A.map, A.join, P.isString
- `joinClasses.ts` - A.filter, A.join
- `url.ts` - HashSet.fromIterable, HashSet.has
- `getSelectedNode.ts` - No changes (confirmed Effect-compatible)

**Excluded** (per Phase 2 evaluation):
- `focusUtils.ts`, `getDOMRangeRect.ts`, `setFloatingElemPosition*.ts`

### Your Mission

1. **Run verification checks**
2. **Update spec status to COMPLETE**
3. **Generate final summary**

### Verification Steps

#### 1. Type Check

```bash
cd apps/todox && bun tsc --noEmit
```

**Expected**: Only pre-existing error in `setupEnv.ts:31`

#### 2. Build Check

```bash
bun run build --filter @beep/todox
```

**Expected**: Build succeeds

#### 3. Lint Check

```bash
bun run lint --filter @beep/todox
```

**Expected**: No new errors in refactored files

### Documentation Updates

1. **Update REFLECTION_LOG.md** with Phase 6 verification results

2. **Update spec README.md**:
   - Change status from `IN_PROGRESS` to `COMPLETE`
   - Add completion date
   - Summarize outcomes

### Success Criteria

- [ ] Type check passes (only pre-existing errors)
- [ ] Build succeeds
- [ ] No new lint errors
- [ ] `REFLECTION_LOG.md` has Phase 6 entry
- [ ] Spec `README.md` status updated to COMPLETE

### Reference Files

- Handoff context: `specs/lexical-utils-effect-refactor/handoffs/HANDOFF_P6.md`
- Reflection log: `specs/lexical-utils-effect-refactor/REFLECTION_LOG.md`
- Spec README: `specs/lexical-utils-effect-refactor/README.md`

### Final Deliverable

Generate a **completion summary** including:
- Total files refactored
- Total schemas created
- Key patterns established
- Documented exceptions
- Recommendations for future work
