# Evaluation Rubrics

> Scoring criteria for violation severity, remediation priority, and phase completion.

---

## Violation Severity Scoring

### Severity Levels

| Level | Score | Definition | Impact |
|-------|-------|------------|--------|
| **Critical** | 10 | Type safety compromised, runtime errors likely | Blocks production |
| **High** | 7 | Pattern violation with functional impact | May cause bugs |
| **Medium** | 4 | Pattern violation, code smell | Technical debt |
| **Low** | 2 | Style/convention violation | Consistency issue |
| **Info** | 1 | Candidate for improvement | Optional |

### Category Severity Assignment

| ID | Category | Severity | Score | Rationale |
|----|----------|----------|-------|-----------|
| V01 | EntityId Table Typing | **High** | 7 | Type safety at DB boundary |
| V02 | Duplicate Code | **Medium** | 4 | Maintainability concern |
| V03 | Native String Methods | **High** | 7 | Breaks Effect conventions |
| V04 | Error Construction | **High** | 7 | Runtime type mismatch risk |
| V05 | Array Emptiness | **Medium** | 4 | Minor pattern violation |
| V06 | Native Error | **Critical** | 10 | Loses error type safety |
| V07 | Switch Statements | **Medium** | 4 | Exhaustiveness not enforced |
| V08 | Object.entries | **Medium** | 4 | Type inference weaker |
| V09 | Native Set | **Medium** | 4 | Mutability tracking lost |
| V10 | Native Array.map | **High** | 7 | Core Effect convention |
| V11 | Non-null Assertions | **High** | 7 | Runtime crash risk |
| V12 | Native Map | **Medium** | 4 | Mutability tracking lost |
| V13 | Native Array.sort | **Medium** | 4 | Mutates in place |
| V14 | EntityId Creation | **High** | 7 | Branded type safety lost |
| V15 | String.toLowerCase | **Low** | 2 | Minor convention |
| V16 | Native Date | **Medium** | 4 | Time zone handling |
| V17 | Array vs Chunk | **Info** | 1 | Performance candidate |
| V18 | Empty Array Init | **Low** | 2 | Minor pattern |

---

## Priority Score Calculation

### Formula

```
Priority = (Severity Score × Count) + (Cross-File Impact × 2) + (Dependency Factor × 3)
```

Where:
- **Severity Score**: From table above (1-10)
- **Count**: Number of violations in category
- **Cross-File Impact**: Number of unique files affected (capped at 10)
- **Dependency Factor**:
  - 3 if other categories depend on this fix
  - 2 if moderate dependencies
  - 1 if standalone
  - 0 if depends on others

### Example Calculation

```
V06 (Native Error):
- Severity: 10
- Count: 5
- Cross-File Impact: 3 files
- Dependency Factor: 3 (error types needed by other fixes)

Priority = (10 × 5) + (3 × 2) + (3 × 3) = 50 + 6 + 9 = 65
```

---

## Remediation Phase Scoring

### Phase Completion Criteria

| Criterion | Points | Verification |
|-----------|--------|--------------|
| All violations in category fixed | 40 | Grep confirms zero matches |
| Type check passes | 20 | `bun run check` exit 0 |
| Tests pass | 20 | `bun run test` exit 0 |
| No new violations introduced | 10 | Re-run audit on changed files |
| Documentation updated | 10 | REFLECTION_LOG.md entry |

**Minimum to proceed**: 80/100 points (check + tests must pass)

### Phase Gate Checklist

```markdown
## Phase R[N] Gate

- [ ] All V[XX] violations remediated (40 pts)
- [ ] `bun run check --filter @beep/knowledge-*` passes (20 pts)
- [ ] `bun run test --filter @beep/knowledge-*` passes (20 pts)
- [ ] No new violations in changed files (10 pts)
- [ ] REFLECTION_LOG.md updated (10 pts)

**Score**: __/100
**Gate**: PASS (≥80) / FAIL (<80)
```

---

## Inventory Report Quality Rubric

### Agent Output Scoring

| Criterion | Points | Description |
|-----------|--------|-------------|
| **Completeness** | 30 | All violations found (verified by manual spot-check) |
| **Accuracy** | 30 | No false positives in report |
| **Line References** | 20 | Exact line numbers provided |
| **Code Samples** | 10 | Current and correct code shown |
| **Remediation Notes** | 10 | Special considerations documented |

**Minimum acceptable**: 70/100

### Quality Gates

- **≥90**: Excellent - proceed immediately
- **70-89**: Acceptable - proceed with spot verification
- **50-69**: Needs revision - re-run agent with refined patterns
- **<50**: Reject - investigate agent prompt issues

---

## Cross-File Impact Assessment

### Impact Scoring Matrix

| Files Affected | Unique Modules | Impact Score |
|----------------|----------------|--------------|
| 1 | 1 | Low (1) |
| 2-3 | 1-2 | Medium (2) |
| 4-6 | 2-3 | High (3) |
| 7+ | 4+ | Critical (4) |

### Module Boundaries

```
packages/knowledge/
├── domain/      → Module 1
├── tables/      → Module 2
├── server/      → Module 3
│   ├── Embedding/        → Sub-module 3a
│   ├── EntityResolution/ → Sub-module 3b
│   ├── Extraction/       → Sub-module 3c
│   └── Ontology/         → Sub-module 3d
├── client/      → Module 4
└── ui/          → Module 5
```

---

## Dependency Ordering Rules

### Must Fix First (Foundation)

1. **V01 (EntityId Tables)** - Tables are imported by server
2. **V06 (Native Error)** - Error types used everywhere
3. **V04 (Error Construction)** - Depends on V06 error classes

### Can Fix in Parallel

- V09, V10, V12, V13 (Collections) - Independent of each other
- V03, V15 (String methods) - Independent
- V05, V17, V18 (Array patterns) - Independent

### Must Fix Last

- **V02 (Duplicate Code)** - May reference patterns from earlier fixes
- **V14 (EntityId Creation)** - May use new patterns from V01

---

## Success Metrics

### Overall Spec Completion

| Metric | Target | Measurement |
|--------|--------|-------------|
| Violation Categories Inventoried | 18/18 | Report file count |
| Total Violations Remediated | 100% | Zero grep matches |
| Type Check | Pass | Exit code 0 |
| Test Suite | Pass | Exit code 0 |
| Build | Pass | Exit code 0 |
| New Violations | 0 | Audit re-run |

### Quality Indicators

```
✅ EXCELLENT: All targets met, no regressions
⚠️ ACCEPTABLE: All targets met, documented exceptions
❌ INCOMPLETE: Any target missed
```

---

## Audit Trail Requirements

Every remediation must include:

1. **Before**: Exact code that was changed
2. **After**: Replacement code
3. **Rationale**: Which rule from `.claude/rules/effect-patterns.md`
4. **Verification**: Command run to verify fix
5. **Timestamp**: When fix was applied

Example:

```markdown
### Fix: V06-001

**File**: packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts
**Line**: 120
**Before**:
```typescript
return yield* Effect.die(new Error("Cannot select canonical from empty cluster"));
```
**After**:
```typescript
return yield* Effect.fail(new CanonicalSelectionError({
  message: "Cannot select canonical from empty cluster",
  reason: "empty_cluster"
}));
```
**Rule**: `.claude/rules/effect-patterns.md` - Native Error prohibition
**Verified**: `grep -n "new Error" packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts` returns empty
**Timestamp**: 2026-01-22T10:30:00Z
```
