# Pre-existing Failures

> Document known failures that exist BEFORE this refactor to distinguish regressions from pre-existing issues.

---

## Baseline (capture before Phase 4)

Run these commands and record any failures here before making changes:

```bash
bun run build
bun run check
bun run test
bun run lint
```

### Known Pre-existing Failures (from MEMORY.md)

- 32 failures in PromptTemplates tests (knowledge-server)
- Type error: `TestLayers.ts:110` (readonly PartEncoded[])
- Type error: `GmailExtractionAdapter.test.ts:460` (readonly string[])

### Build Failures

*(Not captured before Phase 4 — build gate was not run as a separate step)*

### Check Failures

*(Not captured before Phase 4 — turborepo check was not isolated pre-refactor)*

### Test Failures

*(Not captured before Phase 4 — turborepo test was not isolated pre-refactor)*

### Lint Failures

*(Not captured before Phase 4 — turborepo lint was not isolated pre-refactor)*

---

## Post-Refactor Comparison (Phase 5)

**Date**: 2026-02-10
**Verification Results**:

| Gate | Result | Details |
|------|--------|---------|
| `bun run lint:fix` | 64/64 tasks successful | Only pre-existing XSS warnings in todox (unrelated) |
| `bun run check` | 118/118 tasks successful | Zero type errors across all packages |
| `bun run test` | 118/118 tasks successful | All tests pass; 83 cached, 35 fresh |

**Conclusion**: Zero new failures introduced by the BaseRepo interface standardization. The known pre-existing failures from MEMORY.md (PromptTemplates tests, TestLayers type error, GmailExtractionAdapter type error) were not observed in this run, suggesting they may have been fixed in prior commits or are test-environment-dependent.
