# AI-Friendliness Audit: Evaluation Report

> Phase 2 Output - Dimension Scoring with Evidence
> Date: 2026-01-06

---

## Executive Summary

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Documentation Quality | 3.5/5 | 25% | 0.875 |
| Structural Clarity | 3.0/5 | 25% | 0.750 |
| Effect Pattern Compliance | 2.0/5 | 20% | 0.400 |
| Tooling Integration | 4.5/5 | 15% | 0.675 |
| AI Instruction Optimization | 2.0/5 | 15% | 0.300 |
| **Overall Score** | **3.0/5** | 100% | **3.00** |

**Rating**: Fair - Focused remediation needed
**Confidence**: High (verified across multiple audit agents)

---

## Dimension 1: Documentation Quality (3.5/5)

### Evidence Summary
- README coverage: 4/46 packages (8.7%) - apps only
- AGENTS.md coverage: 31/42 packages (73.8%)
- JSDoc coverage: Variable (30%-173% across sampled packages)
- @example blocks: Concentrated in schema/contract packages

### JSDoc Analysis (6 Package Sample)

| Package | Exports | JSDoc Blocks | JSDoc % | @example | Example % |
|---------|---------|--------------|---------|----------|-----------|
| common/contract | 134 | 233 | 174% | 36 | 27% |
| common/schema | 1,172 | 1,614 | 138% | 784 | 67% |
| shared/domain | 516 | 315 | 61% | 23 | 4% |
| iam/domain | 502 | 792 | 158% | 8 | 2% |
| documents/server | 43 | 66 | 154% | 0 | 0% |
| runtime/server | 43 | 13 | 30% | 0 | 0% |

### Missing AGENTS.md (11 packages)
- packages/customization/* (5 packages)
- packages/comms/* (5 packages)
- packages/shared/env

### Key Gaps
1. `runtime/server/src/DataAccess.layer.ts` - Core layer with zero JSDoc
2. `runtime/server/src/Persistence.layer.ts` - Infrastructure layer lacking documentation
3. `shared/domain/src/Policy.ts:139-182` - Policy combinators without @example
4. All comms/customization packages - Missing AGENTS.md entirely

---

## Dimension 2: Structural Clarity (3.0/5)

### Evidence Summary
- Barrel exports: 39/42 packages (93%)
- Cross-slice violations: 0
- Deep imports bypassing barrels: 1,495 instances
- Naming violations: 4 PascalCase directories

### Barrel Export Status
**Missing (3 packages):**
- `packages/_internal/db-admin/` - Uses Db/index.ts internally
- `packages/ui/core/` - Uses subpath exports (./* pattern)
- `packages/ui/ui/` - Uses subpath exports (./* pattern)

### Boundary Compliance
| Check | Result |
|-------|--------|
| App-to-app imports | 0 violations |
| Feature slice to slice | 0 violations |
| Shared-to-slice | 0 violations |
| Common-to-slice | 0 violations |

### Deep Import Issues (Critical)
- 1,495 instances of `@beep/package-name/internal/...` imports
- Bypasses public API contracts
- Example: `packages/iam/server/src/adapters/better-auth/Emails.ts:4`
  - Imports `@beep/shared-server/internal/email/adapters/resend/errors`

### Directory Naming Violations
- `packages/shared/tables/src/Table/` (should be `table/`)
- `packages/shared/tables/src/OrgTable/` (should be `org-table/`)
- `packages/_internal/db-admin/src/Db/` (should be `db/`)

---

## Dimension 3: Effect Pattern Compliance (2.0/5)

### Violation Counts

| Category | Count | Severity |
|----------|-------|----------|
| Native .map() | 113 | HIGH |
| Native .filter() | 52 | HIGH |
| Native .forEach() | 58 | HIGH |
| Native Date | 12 | MEDIUM |
| switch statements | 30 | MEDIUM |
| any types (non-types pkg) | 52 | CRITICAL |
| **Total** | **317** | - |

### Top Violations with Locations

1. **packages/documents/server/src/handlers/Discussion.handlers.ts:54**
   ```typescript
   // VIOLATION: Native map on array
   discussions.map((discussion) => ({
     ...transformToUser(discussion),
     comments: discussion.comments.map(transformToUser),
   }))
   ```

2. **packages/shared/server/src/factories/db-client/pg/PgClient.ts:171**
   ```typescript
   // VIOLATION: Native map on query results
   result.map((r) => r.rows ?? [])
   ```

3. **packages/shared/server/src/db/repos/UploadSession.repo.ts:40**
   ```typescript
   // VIOLATION: Native Date constructor
   return new Date(value);
   ```

4. **packages/shared/server/src/factories/db-client/pg/formatter.ts:158**
   ```typescript
   // VIOLATION: switch statement
   switch (type) { ... }
   ```

5. **packages/shared/client/src/atom/files/atoms/upload.atom.ts:36**
   ```typescript
   // VIOLATION: switch on discriminated union
   switch (state._tag) { ... }
   ```

### Sample Fix

```typescript
// BEFORE (packages/documents/server/src/handlers/Discussion.handlers.ts:54)
discussions.map((discussion) => ({
  ...transformToUser(discussion),
  comments: discussion.comments.map(transformToUser),
}))

// AFTER
F.pipe(
  discussions,
  A.map((discussion) => ({
    ...transformToUser(discussion),
    comments: F.pipe(discussion.comments, A.map(transformToUser)),
  }))
)
```

---

## Dimension 4: Tooling Integration (4.5/5)

### TypeScript Strictness: 5/5
All critical strict options enabled:
- strict: true
- noUncheckedIndexedAccess: true
- exactOptionalPropertyTypes: true
- noImplicitOverride: true
- noImplicitAny: true
- strictNullChecks: true

### Biome Configuration: 4/5
- Recommended rules: ON
- 46 rules explicitly disabled
- Concerning gaps:
  - noUnusedVariables: off
  - useExhaustiveDependencies: off (React hooks)
  - noDebugger: off
  - noExplicitAny: warn (not error)

### Test Infrastructure: 3.5/5
- 151 test files
- Bun test + @beep/testkit
- No coverage thresholds configured
- Many placeholder Dummy.test.ts files

### CI/CD: 4/5
- 3 parallel jobs (Types, Code Quality, Test)
- 20-minute timeouts
- Missing: coverage reporting, security scanning

---

## Dimension 5: AI Instruction Optimization (2.0/5)

### CLAUDE.md Analysis
| Metric | Current | Target |
|--------|---------|--------|
| Lines | 562 | <100 |
| Directives (MUST/NEVER/etc) | 25 | <15 |
| Code example blocks | 16 | 0 (→ Skills) |
| Major sections | 13 | 6-8 |

### AGENTS.md Hierarchy
- Coverage: 31/42 packages (73.8%)
- Format consistency: 94% follow standard template
- Average length: ~105 lines per AGENTS.md
- Total lines across all AGENTS.md: 3,800+

### Content Distribution Issues
| Section | Lines | Action |
|---------|-------|--------|
| Critical Rules (Array/String/Date/Match) | 213 | Extract to Skill |
| Package Structure tree | 51 | Extract to docs/ |
| Effect import conventions | 35 | Extract to Skill |
| Code examples | ~150 | Extract to Skills |

### Optimization Potential
- Lines reducible: ~450 (from 562 to ~90)
- Skills candidates: 5 (effect-patterns, forbidden-patterns, datetime, match-predicate, collections)
- AGENTS.md deduplication: Remove repeated import conventions

---

## Aggregate Package Scores (Sample)

| Package | Doc | Structure | Pattern | Tooling | AI Inst | Overall |
|---------|-----|-----------|---------|---------|---------|---------|
| common/contract | 4 | 4 | 3 | 5 | 4 | 3.95 |
| common/schema | 5 | 4 | 3 | 5 | 4 | 4.20 |
| shared/domain | 3 | 4 | 2 | 5 | 3 | 3.25 |
| shared/server | 2 | 3 | 2 | 5 | 3 | 2.85 |
| iam/domain | 3 | 4 | 3 | 5 | 4 | 3.70 |
| documents/server | 2 | 4 | 2 | 5 | 4 | 3.25 |
| runtime/server | 1 | 4 | 3 | 5 | 4 | 3.20 |
| comms/* (avg) | 1 | 4 | 2 | 4 | 1 | 2.35 |
| customization/* (avg) | 1 | 4 | 2 | 4 | 1 | 2.35 |

---

## Confidence Assessment

| Dimension | Confidence | Method |
|-----------|------------|--------|
| Documentation | High | File count + JSDoc sampling |
| Structure | High | Grep analysis + boundary checks |
| Patterns | High | Comprehensive grep with filtering |
| Tooling | High | Config file analysis + CI review |
| AI Instructions | High | Line count + content categorization |

---

## Next Steps

Proceed to Phase 3: Synthesis with prioritized remediation plan.
