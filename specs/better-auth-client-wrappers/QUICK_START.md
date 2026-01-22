# better-auth-client-wrappers Quick Start

> Rapid reference for implementing better-auth client wrappers

---

## Quick Reference

| Resource | Purpose |
|----------|---------|
| [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | **Start here** - Infrastructure & scope reduction |
| [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | Phase 1 implementation guide |
| [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) | Method documentation URLs |

---

## Phase Order

**P0** (Infrastructure) → **P1** (Core+Username) → **P2-P6** (Remaining)

---

## 3-Stage Workflow

**DO NOT** implement method-by-method. Use the batched approach:

```
Stage 1: Research ALL methods → outputs/phase-N-research.md
Stage 2: Create ALL contracts → verify with tsc --noEmit
Stage 3: Create ALL handlers + wire layer ONCE → full verification
```

---

## Pattern Quick Reference

### Standard Contract (with payload)

```typescript
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/update-user");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { name: S.optional(S.String) },
  formValuesAnnotation({ name: "" })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  { user: Common.DomainUserFromBetterAuthUser }
) {}

export const Wrapper = W.Wrapper.make("UpdateUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
```

### Standard Handler

```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.updateUser(encoded))
);
```

### No-Payload Pattern

```typescript
// contract.ts - omit payload field
export const Wrapper = W.Wrapper.make("DeleteUser", {
  success: Success,
  error: Common.IamError,
});

// handler.ts - no parameter
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.deleteUser())
);
```

---

## Common Gotchas

| Issue | Solution |
|-------|----------|
| Query-wrapped payloads | `(encoded) => client.method({ query: encoded })` |
| Sensitive fields | `S.Redacted(S.String)` |
| Array response | `S.Array(Schema).annotations($I.annotations("Success", {}))` |

---

## Verification Commands

```bash
# Pre-flight (before changes)
bun run check --filter @beep/iam-client

# After contracts only
bun tsc --noEmit packages/iam/client/src/core/*/contract.ts

# After full implementation
bun run check --filter @beep/iam-client
bun run lint:fix --filter @beep/iam-client
```

---

## Checklist Per Method

- [ ] Contract has appropriate Payload (or none)
- [ ] Success schema matches API response
- [ ] Handler uses `wrapIamMethod` with correct `mutatesSession`
- [ ] `mod.ts` and `index.ts` export correctly
- [ ] Handler added to category Layer

---

## Need Help?

- [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) - Infrastructure & scope reduction
- [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) - Phase 1 full context
- [Existing patterns](../../packages/iam/client/src/sign-in/email/) - Reference implementation
