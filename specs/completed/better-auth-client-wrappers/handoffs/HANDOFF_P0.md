# Handoff: Phase 0 - Infrastructure & Scope Reduction (COMPLETED)

> Pattern analysis and scope-reducing infrastructure for P1-P6

---

## Phase Summary

| Metric | Value |
|--------|-------|
| Purpose | Reduce scope through analysis and shared utilities |
| Methods analyzed | 90 |
| Status | **COMPLETED** |
| Branch | `feat/iam-client-wrappers-p0` |

---

## Deliverables Created

| Deliverable | Location | Purpose |
|-------------|----------|---------|
| Pattern Analysis | `outputs/phase-0-pattern-analysis.md` | Handler patterns, file structure, JSDoc templates |
| Method Guide | `outputs/method-implementation-guide.md` | Per-method specs for all 90 methods |
| Updated Workflow | `outputs/OPTIMIZED_WORKFLOW.md` | 3-stage batched approach |

---

## Key Findings

### Handler Patterns Identified

| Pattern | Count | Description |
|---------|-------|-------------|
| **Standard** | ~55 | Has payload, returns object |
| **No-payload** | ~15 | No input required |
| **Query-wrapped** | ~12 | Expects `{ query: payload }` |
| **Array response** | ~10 | Returns `Array<Item>` |
| **With Captcha** | ~6 | Public auth endpoints only |

### Boilerplate Savings

| File | Savings | Action |
|------|---------|--------|
| `mod.ts` | 100% | Copy template (identical for all) |
| `index.ts` | 95% | Only namespace name varies |
| Handler | 80% | Fill in method name |
| JSDoc | 70% | Fill in placeholders |

### Scope Reduction Decision

**Decision**: Do NOT create new shared response schemas.

**Rationale**:
1. Existing `_internal/` infrastructure is sufficient
2. Response shapes have subtle variations between methods
3. Over-abstracting would make contracts less clear
4. Better to copy patterns than maintain shared code

---

## Pattern Reference (Quick Lookup)

### Standard Handler Template

```typescript
// contract.ts
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("[category]/[operation]");

export class Payload extends S.Class<Payload>($I`Payload`)({...}) {}
export class Success extends S.Class<Success>($I`Success`)({...}) {}
export const Wrapper = W.Wrapper.make("[Operation]", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});

// handler.ts
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: [true|false],
  })((encoded) => client.[method](encoded))
);
```

### No-Payload Template

```typescript
// contract.ts - No Payload class, Wrapper omits payload field
export const Wrapper = W.Wrapper.make("[Operation]", {
  success: Success,
  error: Common.IamError,
});

// handler.ts - Callback takes no arguments
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: [true|false],
  })(() => client.[method]())
);
```

### Query-Wrapped Template

```typescript
// handler.ts - Wrap payload in { query: encoded }
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.[method]({ query: encoded }))
);
```

---

## Existing Infrastructure (Reuse, Don't Recreate)

### From `@beep/iam-client/_internal`

| Export | Purpose |
|--------|---------|
| `wrapIamMethod` | Core factory for all handlers |
| `IamError` | Error type |
| `CaptchaMiddleware` | For public auth endpoints |
| `withCaptchaResponse` | Before hook for captcha |
| `formValuesAnnotation` | Form default values |
| `DomainUserFromBetterAuthUser` | User transform |
| `DomainSessionFromBetterAuthSession` | Session transform |
| `UserEmail`, `UserPassword` | Common field schemas |

---

## Phase 1 Recommendations

Based on P0 analysis:

1. **Use the 3-stage workflow** from `OPTIMIZED_WORKFLOW.md`:
   - Stage 1: Research all methods (document schemas)
   - Stage 2: Create all contracts (batch verify)
   - Stage 3: Create handlers + wire up (single layer update)

2. **Start with core methods** that use existing schemas:
   - `updateUser` → Uses `DomainUserFromBetterAuthUser`
   - `deleteUser` → Simple `{ success: boolean }`
   - `revokeSession` → Simple `{ success: boolean }`

3. **Defer complex methods** to later in phase:
   - `linkSocial` → OAuth redirect flow
   - `listAccounts` → New `AccountSchema` needed

4. **Copy boilerplate files verbatim** - don't try to optimize further

---

## Verification

```bash
# P0 made no code changes, so verification should pass unchanged:
bun run check --filter @beep/iam-client

# Files created in specs/ directory only
```

---

## Next Phase

**Phase 1: Core + Username**

- Methods: 9
- Estimated effort: 1 session
- See: `handoffs/HANDOFF_P1.md`
- Prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
