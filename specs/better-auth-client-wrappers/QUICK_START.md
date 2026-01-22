# better-auth-client-wrappers Quick Start

> Rapid reference for implementing better-auth client wrappers

---

## Quick Reference

| Resource | Purpose |
|----------|---------|
| [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | **Start here** - Phase 1 implementation guide |
| [OPTIMIZED_WORKFLOW.md](./outputs/OPTIMIZED_WORKFLOW.md) | 3-stage batched workflow details |
| [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) | All method documentation URLs |

---

## 3-Stage Workflow Overview

**DO NOT** implement method-by-method. Use the batched approach:

```
Stage 1: Research ALL methods → outputs/phase-N-research.md
Stage 2: Create ALL contracts → verify with tsc --noEmit
Stage 3: Create ALL handlers + wire layer ONCE → full verification
```

See [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) for complete workflow.

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
  {
    name: S.optional(S.String),
    image: S.optional(S.String),
  },
  formValuesAnnotation({
    name: "",
    image: "",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
  }
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

### No-Payload Contract & Handler

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

### Array Response

```typescript
export const Success = S.Array(AccountSchema).annotations(
  $I.annotations("Success", {
    description: "List of linked accounts",
  })
);
```

### Layer Update Pattern

```typescript
import { Wrap } from "@beep/wrap";
import { GetSession } from "./get-session";
import { SignOut } from "./sign-out";
import { UpdateUser } from "./update-user";  // Import from index.ts

export const Group = Wrap.WrapperGroup.make(
  SignOut.Wrapper,
  GetSession.Wrapper,
  UpdateUser.Wrapper,
);

export const layer = Group.toLayer({
  SignOut: SignOut.Handler,
  GetSession: GetSession.Handler,
  UpdateUser: UpdateUser.Handler,
});
```

---

## Common Gotchas

### Query-Wrapped Payloads

Some methods expect `{ query: payload }`:

```typescript
// List operations often need query wrapping
(encoded) => client.admin.listUsers({ query: encoded })
```

### Sensitive Fields

Use `S.Redacted` for credentials:

```typescript
password: S.Redacted(S.String),
apiKey: S.optional(S.Redacted(S.String)),
```

### Response Transformation

When Better Auth response differs from Success schema:

```typescript
Common.wrapIamMethod({
  wrapper: Contract.Wrapper,
  transformResponse: (response) => ({ data: response.data }),
})(() => client.getSession())
```

---

## Verification Commands

```bash
# Pre-flight (before changes)
bun run check --filter @beep/iam-client

# After Stage 2 (contracts only)
bun tsc --noEmit packages/iam/client/src/core/*/contract.ts

# After Stage 3 (full)
bun run check --filter @beep/iam-client
bun run lint:fix --filter @beep/iam-client
```

---

## Checklist Per Method

- [ ] Contract has appropriate Payload (or none for no-payload ops)
- [ ] Contract has Success schema matching API response
- [ ] Handler uses `Contract.Wrapper.implement()` + `wrapIamMethod`
- [ ] Handler sets correct `mutatesSession` value
- [ ] `mod.ts` exports both contract and handler
- [ ] `index.ts` provides namespace export
- [ ] Handler added to category Layer
- [ ] JSDoc added with `@module`, `@category`, `@since`

---

## Need Help?

- [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) - Phase 1 full context
- [packages/iam/client/CLAUDE.md](../../packages/iam/client/CLAUDE.md) - Package documentation
- [Existing patterns](../../packages/iam/client/src/sign-in/email/) - Reference implementation
