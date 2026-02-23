# V[XX]: [Category Name]

> Effect Pattern Enforcement Report

**Generated**: YYYY-MM-DD
**Scope**: `packages/knowledge/**/src/**/*.ts`
**Source of Truth**: `.claude/rules/effect-patterns.md`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Violations** | N |
| **Files Affected** | M |
| **Severity** | High/Medium/Low |
| **Priority Score** | X |

---

## Rule Reference

**Pattern Violated**:
> Quote the specific rule from `.claude/rules/effect-patterns.md`

**Violation Pattern**:
```typescript
// Code pattern that constitutes a violation
```

**Correct Pattern**:
```typescript
// Code pattern that complies with the rule
```

---

## Violations

### [filename1.ts]

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 42 | [Brief description] | `current code snippet` | `correct code snippet` |
| 87 | [Brief description] | `current code snippet` | `correct code snippet` |

<details>
<summary>Full Context (Lines 40-45)</summary>

```typescript
// Context around the violation
```

</details>

---

### [filename2.ts]

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 15 | [Brief description] | `current code snippet` | `correct code snippet` |

---

## Cross-File Impact

| File | Violation Count | Modules Affected |
|------|-----------------|------------------|
| CanonicalSelector.ts | 3 | EntityResolution |
| EntityClusterer.ts | 2 | EntityResolution |

**Impact Score**: [1-4 based on RUBRICS.md]

---

## Dependency Analysis

### Depends On (Fix These First)
- [ ] V[XX] - [Reason]

### Depended By (Fix These After)
- [ ] V[YY] - [Reason]

### Can Fix Independently
- [x] No dependencies

---

## Remediation Notes

### Special Considerations

[Document any edge cases, complex transformations, or gotchas discovered during audit]

### Recommended Approach

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Imports to Add

```typescript
// Add these imports to affected files
import * as [Module] from "effect/[Module]";
```

### New Types to Create

```typescript
// If new error classes or types are needed
export class [ErrorName] extends S.TaggedError<[ErrorName]>()("[ErrorName]", {
  // fields
}) {}
```

---

## Verification Commands

```bash
# Verify no violations remain
grep -rn "[PATTERN]" packages/knowledge/server/src/

# Type check
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-*
```

---

## Audit Metadata

| Field | Value |
|-------|-------|
| **Agent** | V[XX] Effect Pattern Enforcer |
| **Duration** | X minutes |
| **Files Scanned** | N |
| **False Positives Excluded** | M |
