---
path: packages/iam/client
summary: Effect wrapper for Better Auth React client - typed contracts, session management, auth flows
tags: [iam, client, effect, better-auth, contracts, handlers, session]
---

# @beep/iam-client

Typed contract layer bridging Better Auth's React client with Effect-first flows. Provides contract schemas plus thin Effect implementations using `wrapIamMethod`. UI slices consume these contracts through runtime helpers while adapters isolate raw Better Auth usage.

## Architecture

```
|------------------|     |------------------|     |------------------|
|    Contracts     | --> |     Handlers     | --> |   UI Consumers   |
| (Schema + Wrap)  |     | (wrapIamMethod)  |     | (Atoms + Hooks)  |
|------------------|     |------------------|     |------------------|
         |                        |
         v                        v
|------------------|     |------------------|
|    _internal     |     |     Adapters     |
| (schemas, utils) |     | (Better Auth)    |
|------------------|     |------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `adapters/better-auth/*` | Better Auth React client with plugins, $store re-export |
| `_internal/*` | wrapIamMethod factory, transformation schemas, error handling |
| `sign-in/*` | Email and username sign-in handlers |
| `sign-up/*` | Email sign-up with password confirmation |
| `password/*` | Change, request-reset, reset password flows |
| `two-factor/*` | Enable, disable, TOTP, OTP, backup codes |
| `organization/*` | CRUD, invitations, members handlers |
| `multi-session/*` | List, revoke, set-active session handlers |
| `core/*` | Session management and sign-out |

## Usage Patterns

### Handler with wrapIamMethod

```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.signIn.email(encodedPayload))
);
```

### Contract Definition

```typescript
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

export class Payload extends S.Class<Payload>($I`Payload`)(
  { email: Common.UserEmail, password: Common.UserPassword },
  formValuesAnnotation({ email: "", password: "" })
) {}

export const Wrapper = W.Wrapper.make("Email", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `wrapIamMethod` factory | Standardizes encoding, error handling, session notification |
| `mutatesSession` flag | Auto-fires `$sessionSignal` for session-changing operations |
| Transformation schemas | Validate EntityIds when mapping Better Auth to domain |
| `formValuesAnnotation` | Provides form default values for UI consumption |
| Branded EntityIds | Type-safe IDs aligned with `@beep/iam-domain` |

## Dependencies

**Internal**: `@beep/iam-domain`, `@beep/shared-domain`, `@beep/wrap`, `@beep/schema`, `@beep/identity`
**External**: `better-auth`, `effect`, `@effect-atom/atom-react`

## Related

- **AGENTS.md** - Detailed contributor guidance with security patterns
- `documentation/patterns/iam-client-patterns.md` - Full pattern reference
- `packages/iam/domain/AGENTS.md` - Domain entity alignment
