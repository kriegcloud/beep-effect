# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 remediation.

---

## Prompt

You are orchestrating Phase 3 of the `knowledge-code-quality-audit` spec.

### Context

Phase 2 completed successfully with a Master Violations document synthesizing 240 violations across 18 categories. Your mission is to execute remediation in 6 sub-phases.

**Master Document**: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`
**Handoff Document**: `specs/knowledge-code-quality-audit/handoffs/HANDOFF_P3.md`

### Important: Phase Execution Order

Phases MUST be executed in order due to dependencies:

```
3a (Foundation) → 3b (Type Safety) → 3c (Data Structures) → 3d (Method Patterns) → 3e (Modernization) → 3f (Optimization)
```

### Phase 3a: Foundation (Start Here)

**Goal**: Fix critical errors and extract duplicated code.

#### Task 1: Create CanonicalSelectionError (V06)

```bash
# Create the error class
cat > packages/knowledge/domain/src/errors/entity-resolution.errors.ts << 'EOF'
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/entity-resolution");

/**
 * Canonical entity selection error
 * @since 0.1.0
 * @category errors
 */
export class CanonicalSelectionError extends S.TaggedError<CanonicalSelectionError>($I`CanonicalSelectionError`)(
  "CanonicalSelectionError",
  {
    message: S.String,
    reason: S.Literal("empty_cluster", "selection_failed"),
    clusterSize: S.optional(S.Number),
  },
  $I.annotations("CanonicalSelectionError", {
    description: "Failed to select canonical entity from cluster",
  })
) {}
EOF
```

Then update `CanonicalSelector.ts`:
1. Add import: `import { CanonicalSelectionError } from "@beep/knowledge-domain/errors";`
2. Replace 3 `Effect.die(new Error(...))` with `Effect.fail(new CanonicalSelectionError(...))`

#### Task 2: Extract Duplicated Functions (V02)

1. Remove `extractLocalName` duplicates from 4 files (already exported from `constants.ts`)
2. Create `packages/knowledge/server/src/utils/vector.ts` with `cosineSimilarity`
3. Create `packages/knowledge/server/src/utils/formatting.ts` with `formatEntityForEmbedding`

#### Verification

```bash
# Check for remaining violations
grep -rn "const extractLocalName" packages/knowledge/server/src/ | wc -l  # Should be 1
grep -rn "new Error\(" packages/knowledge/server/src/EntityResolution/ | wc -l  # Should be 0

# Type check
bun run check --filter @beep/knowledge-server
```

### Continue to Phase 3b After 3a Passes

Each subsequent phase builds on the previous:

- **3b**: Add `.$type<>()` to table columns, fix EntityId creation patterns
- **3c**: Replace `new Set()` with `MutableHashSet`, `new Map()` with `MutableHashMap`
- **3d**: Replace native methods with Effect utilities (Str.*, A.*, etc.)
- **3e**: Replace switch with Match, Date with DateTime, etc.
- **3f**: Optional Chunk migration for performance

### Success Criteria

After each sub-phase:
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] `bun run test --filter @beep/knowledge-*` passes
- [ ] Verification grep commands return expected counts

After all phases:
- [ ] `bun run build` (full repo) passes
- [ ] `bun run lint:fix` passes
- [ ] All 240 violations addressed

### Approach Options

**Option A: Category-by-category** (recommended)
Fix all violations of one category across all files before moving to next.

**Option B: File-by-file** (alternative)
Fix all violations in one hotspot file before moving to next.

**Option C: Hybrid**
Phase 3a-3c by category, Phase 3d-3e by file (hotspots first).

### Hotspot Files (highest impact)

1. `EntityClusterer.ts` - 27 violations
2. `SameAsLinker.ts` - 30 violations
3. `CanonicalSelector.ts` - 15 violations
4. `EmbeddingService.ts` - 18 violations

### References

- Violation details: `specs/knowledge-code-quality-audit/outputs/violations/V*.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Master document: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`

### After Completing Phase 3

1. Update `REFLECTION_LOG.md` with remediation learnings
2. Run final verification:
   ```bash
   bun run build
   bun run check
   bun run test
   bun run lint:fix
   ```
3. Create commit summarizing all changes
