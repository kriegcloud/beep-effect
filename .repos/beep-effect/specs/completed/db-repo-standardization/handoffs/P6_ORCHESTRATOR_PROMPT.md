# Phase 6: Final Verification & Spec Completion

> You are executing Phase 6 of the `db-repo-standardization` spec.
> Phases 1-5 are complete. All quality gates passed in Phase 5.
> Your job is to run the final `build` gate, confirm all success criteria, and move the spec to completed.

---

## Step 1: Run Final Build Gate

```bash
bun run build
```

This is the only gate not yet run. `check`, `test`, and `lint:fix` all passed in Phase 5.

## Step 2: Verify Success Criteria

Check off every item in `specs/pending/db-repo-standardization/README.md` Success Criteria:

### Must Have
- [x] `BaseRepo` interface uses object inputs and `{ readonly data: T }` wrapped non-void outputs
- [x] `makeBaseRepo` runtime implementation matches new interface exactly
- [x] ALL consumer repositories updated
- [x] ALL call sites updated
- [ ] `bun run build` passes → **verify in Step 1**
- [x] `bun run check` passes (118/118 in Phase 5)
- [x] `bun run test` passes (118/118 in Phase 5)
- [x] `bun run lint:fix && bun run lint` passes (64/64 in Phase 5)
- [x] Each phase creates BOTH handoff documents

### Nice to Have
- [x] Pre-existing failures documented in `outputs/pre-existing-failures.md`
- [x] Reflection log contains entries for P0, P1, P2, P3, P4, P5

## Step 3: Add Phase 6 Reflection Entry

Add a brief Phase 6 entry to `REFLECTION_LOG.md` noting:
- Build gate result
- Spec completion status
- Any final observations

## Step 4: Move Spec to Completed

```bash
mv specs/pending/db-repo-standardization specs/completed/db-repo-standardization
```

## Step 5: Commit

Stage all changes and commit with message:
```
complete db-repo-standardization spec: standardize BaseRepo interface

- Phase 4: Wrap insert/update returns in { data }, objectify findById/delete inputs
- Phase 5: Migrate 17 downstream consumers across documents, knowledge, shared, and test files
- Phase 6: All gates green (build, check, test, lint)
```
