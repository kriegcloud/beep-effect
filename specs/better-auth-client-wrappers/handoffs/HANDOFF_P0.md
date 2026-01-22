# Handoff: Phase 0 - Infrastructure & Scope Reduction

> Identify and create scope-reducing infrastructure for P1-P6

---

## Phase Summary

| Metric | Value |
|--------|-------|
| Purpose | Reduce scope through analysis and shared utilities |
| Methods to analyze | 90 |
| Workflow | Analysis → Implementation → Documentation |

---

## Pre-Flight (DO FIRST)

```bash
bun run check --filter @beep/iam-client
git checkout -b feat/iam-client-wrappers-p0
```

**If pre-flight fails**: Fix existing issues before proceeding.

---

## Analysis Tasks

### Task 1: Pattern Audit

Examine existing handlers to identify what varies vs. constant:

**Reference directories:**
- `packages/iam/client/src/sign-in/email/` - Standard pattern
- `packages/iam/client/src/core/sign-out/` - No-payload
- `packages/iam/client/src/organization/members/list/` - Query-wrapped

**Answer:**
1. What parts of contract.ts are constant?
2. What parts of handler.ts are constant?
3. Which response schemas are reused?

### Task 2: Method Categorization

Categorize all 90 methods from MASTER_ORCHESTRATION.md:

| Pattern | Characteristics | Est. Count |
|---------|-----------------|------------|
| **Standard** | Has payload, returns object | ~50 |
| **No-payload** | No input | ~15 |
| **Array response** | Returns array | ~10 |
| **Query-wrapped** | Expects `{ query: payload }` | ~10 |

### Task 3: Common Schema Identification

Identify response shapes appearing 3+ times:

| Response Shape | Methods |
|----------------|---------|
| `{ status: boolean }` | ban, unban, delete, revoke |
| `{ user: User }` | update, create |
| `Session[]` | listSessions, listUserSessions |

---

## Implementation Tasks

### Task 4: Create Shared Response Schemas (if beneficial)

Only create if 5+ methods share identical response shape.

**Location**: `packages/iam/client/src/_internal/common.schemas.ts`

### Task 5: Create Method Reference

Create `outputs/method-implementation-guide.md` with per-method specs.

### Task 6: Document Templates

**mod.ts** (100% identical):
```typescript
export * from "./contract.ts";
export * from "./handler.ts";
```

**index.ts** (namespace varies):
```typescript
export * as [OperationPascalCase] from "./mod.ts";
```

---

## Success Criteria

- [ ] All 90 methods categorized by pattern
- [ ] `outputs/phase-0-pattern-analysis.md` created
- [ ] `outputs/method-implementation-guide.md` created
- [ ] Templates documented
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] HANDOFF_P1.md updated with P0 findings

---

## Rollback Strategy

```bash
git checkout -- packages/iam/client/
```

---

## Reference Files

| Purpose | File |
|---------|------|
| Method list | `MASTER_ORCHESTRATION.md` |
| Internal utils | `packages/iam/client/src/_internal/` |
| Existing handlers | `packages/iam/client/src/*/` |
