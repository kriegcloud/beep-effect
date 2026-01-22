# better-auth-client-wrappers: Evaluation Rubrics

> Criteria for evaluating spec completion and quality per phase

---

## Overall Completion Rubric

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Functionality | 40% | All methods wrapped, handlers work correctly |
| Code Quality | 25% | Effect patterns, schema correctness, layer composition |
| Testing | 15% | Verification commands pass, schemas validated |
| Documentation | 10% | JSDoc, reflection updates |
| Handoff Quality | 10% | Context preservation for next phase |

---

## Functionality Scoring (40%)

### 5/5 - Exceptional

- All methods for phase implemented
- All handlers work correctly with Better Auth API
- All edge cases handled (no-payload, array response, query-wrapped)
- `mutatesSession` flags correct for all methods
- No runtime errors in any handler

### 4/5 - Good

- All methods implemented
- Minor issues (1-2 handlers with incorrect `mutatesSession`)
- All edge case patterns correct
- Verification commands pass

### 3/5 - Acceptable

- 80%+ methods implemented
- Some handlers with incorrect patterns (3-5)
- Basic functionality works
- Some verification failures

### 2/5 - Needs Improvement

- 50-79% methods implemented
- Significant pattern violations
- Multiple verification failures

### 1/5 - Incomplete

- <50% methods implemented
- Major structural issues
- Does not compile

---

## Code Quality Scoring (25%)

### Contract Quality Checklist

| Criterion | Points | Example |
|-----------|--------|---------|
| Correct $I identifier pattern | 2 | `$IamClientId.create("core/update-user")` |
| Payload schema matches API | 3 | Fields and types match Better Auth docs |
| Success schema matches response | 3 | Response shape validated against actual API |
| Error uses Common.IamError | 1 | `error: Common.IamError` |
| formValuesAnnotation present (if payload) | 1 | With appropriate defaults |

**Total: 10 points per contract**

### Handler Quality Checklist

| Criterion | Points | Example |
|-----------|--------|---------|
| Uses `Contract.Wrapper.implement()` | 2 | Pattern compliance |
| Uses `Common.wrapIamMethod()` | 2 | Factory pattern |
| Correct `mutatesSession` flag | 3 | true for mutations, false for queries |
| Correct client path | 2 | `client.method(encoded)` |
| No-payload uses `() =>` syntax | 1 | `() => client.deleteUser()` |

**Total: 10 points per handler**

### Scoring Scale

| Score | Contract Avg | Handler Avg |
|-------|-------------|-------------|
| 5/5 | 9-10 | 9-10 |
| 4/5 | 7-8 | 7-8 |
| 3/5 | 5-6 | 5-6 |
| 2/5 | 3-4 | 3-4 |
| 1/5 | 0-2 | 0-2 |

---

## Pattern Compliance Examples

### Good Contract Example (10/10)

```typescript
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/update-user");  // ✓ Correct identifier

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    name: S.optional(S.String),     // ✓ Matches API
    image: S.optional(S.String),
  },
  formValuesAnnotation({            // ✓ Has defaults
    name: "",
    image: "",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  { user: Common.DomainUserFromBetterAuthUser }  // ✓ Uses common schema
) {}

export const Wrapper = W.Wrapper.make("UpdateUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,  // ✓ Standard error
});
```

### Bad Contract Example (3/10)

```typescript
// Missing $I identifier
// Missing formValuesAnnotation
// Using S.Any for success schema

import * as S from "effect/Schema";

export const Payload = S.Struct({
  name: S.String,  // Wrong: should be optional
});

export const Success = S.Any;  // ✗ Never use S.Any

export const Wrapper = {  // ✗ Not using W.Wrapper.make
  payload: Payload,
  success: Success,
};
```

### Good Handler Example (10/10)

```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,  // ✓ Correct: updateUser mutates session
  })((encoded) => client.updateUser(encoded))
);
```

### Bad Handler Example (2/10)

```typescript
// Direct Effect implementation without factory pattern

import * as Effect from "effect/Effect";
import { client } from "@beep/iam-client/adapters";

export const Handler = Effect.tryPromise(async () => {  // ✗ No factory
  const result = await client.updateUser(payload);
  return result.data;  // ✗ No error handling
});
```

---

## Testing & Verification Scoring (15%)

### 5/5 - All Checks Pass

```bash
✓ bun run check --filter @beep/iam-client  # 0 errors
✓ bun run lint:fix --filter @beep/iam-client  # 0 issues
✓ tsc --noEmit on all contracts  # Compiles
```

### 4/5 - Minor Issues

- Lint warnings (not errors)
- All type checks pass

### 3/5 - Some Failures

- 1-2 type errors requiring fixes
- Lint errors present

### 2/5 - Significant Issues

- Multiple type errors
- Compilation failures

### 1/5 - Does Not Build

- Project does not compile
- Critical errors

---

## Documentation Scoring (10%)

### JSDoc Requirements

| Element | Required | Example |
|---------|----------|---------|
| `@fileoverview` | Yes | Brief description |
| `@module` | Yes | `@beep/iam-client/core/update-user/contract` |
| `@category` | Yes | `Core/UpdateUser` |
| `@since` | Yes | `0.1.0` |
| `@example` | Optional | Usage example |

### 5/5 Example

```typescript
/**
 * @fileoverview
 * Update user contract schemas and wrapper for Better Auth integration.
 *
 * @module @beep/iam-client/core/update-user/contract
 * @category Core/UpdateUser
 * @since 0.1.0
 */
```

### Scoring

| Score | Criteria |
|-------|----------|
| 5/5 | All files have complete JSDoc |
| 4/5 | Most files have JSDoc (80%+) |
| 3/5 | Some files have JSDoc (50%+) |
| 2/5 | Few files have JSDoc (<50%) |
| 1/5 | No JSDoc |

---

## Handoff Quality Scoring (10%)

### 5/5 - Complete Context Preservation

- `HANDOFF_P[N+1].md` created with all context
- `P[N+1]_ORCHESTRATOR_PROMPT.md` created
- Verified schemas documented
- Issues and learnings captured
- REFLECTION_LOG.md updated

### 4/5 - Good Handoff

- Both handoff files created
- Most context preserved
- Minor gaps in documentation

### 3/5 - Acceptable

- Handoff files exist
- Some context missing
- Next agent may need to re-research

### 2/5 - Incomplete

- One handoff file missing
- Significant context gaps

### 1/5 - No Handoff

- No handoff documentation
- Next agent starts from scratch

---

## Phase-Specific Evaluation

### Phase 0 (Infrastructure)

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Pattern analysis complete | 30% | All 90 methods categorized |
| Templates documented | 25% | mod.ts, index.ts, contract, handler templates |
| Method guide created | 25% | Per-method implementation specs |
| Scope reduction achieved | 20% | Estimated savings documented |

### Phase 1-6 (Implementation)

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Methods implemented | 40% | All phase methods wrapped |
| Pattern compliance | 25% | Follows canonical patterns |
| Verification passing | 20% | type-check + lint pass |
| Handoff quality | 15% | Context for next phase |

---

## mutatesSession Reference

Use this reference when scoring `mutatesSession` correctness:

| Operation Type | mutatesSession | Examples |
|----------------|----------------|----------|
| User profile changes | `true` | updateUser, deleteUser |
| Session operations | `true` | revokeSession, revokeSessions |
| Account linking | `true` | linkSocial, unlinkAccount |
| Read-only queries | `false` | listAccounts, getSession |
| Availability checks | `false` | isUsernameAvailable |
| Admin operations on other users | `false` | admin.banUser, admin.listUsers |

---

## Final Grade Calculation

```
Final Score = (Functionality × 0.40) + (Code Quality × 0.25) +
              (Testing × 0.15) + (Documentation × 0.10) + (Handoff × 0.10)
```

| Grade | Score Range | Description |
|-------|-------------|-------------|
| A | 90-100% | Exceptional - exceeds all requirements |
| B | 80-89% | Good - meets all requirements |
| C | 70-79% | Acceptable - meets core requirements |
| D | 60-69% | Needs improvement |
| F | <60% | Incomplete - requires rework |

---

## Common Deductions

| Issue | Deduction | Fix |
|-------|-----------|-----|
| Using `S.Any` | -5 per instance | Define proper schema |
| Wrong `mutatesSession` | -3 per handler | Check reference table |
| Missing JSDoc | -1 per file | Add template JSDoc |
| Lint errors | -2 per error | Run `bun run lint:fix` |
| Type errors | -5 per error | Fix type mismatches |
| Missing handoff | -10 | Create HANDOFF_P[N+1].md |
| No reflection update | -5 | Update REFLECTION_LOG.md |

---

## Review Checklist

Use this checklist when reviewing phase completion:

### Per-Method Checklist

- [ ] `contract.ts` exists with correct Payload/Success/Wrapper
- [ ] `handler.ts` exists using `wrapIamMethod` factory
- [ ] `mod.ts` re-exports contract and handler
- [ ] `index.ts` provides namespace export
- [ ] JSDoc present on contract and handler
- [ ] Handler added to category layer

### Per-Phase Checklist

- [ ] All phase methods implemented
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] `bun run lint:fix --filter @beep/iam-client` passes
- [ ] `outputs/phase-N-research.md` created (if applicable)
- [ ] HANDOFF_P[N+1].md created
- [ ] P[N+1]_ORCHESTRATOR_PROMPT.md created
- [ ] REFLECTION_LOG.md updated with learnings
