# Phase 4 Orchestrator Prompt

> Copy-paste this entire prompt to start Phase 4 implementation

---

## Mission

Implement 10 better-auth client wrappers for passkey management, phone number verification, and one-time token operations using the 3-stage batched workflow.

## Context Files

Read these FIRST before implementation:
1. `specs/better-auth-client-wrappers/handoffs/HANDOFF_P4.md` - Full handoff context
2. `specs/better-auth-client-wrappers/outputs/method-implementation-guide.md` - Per-method specs
3. `specs/better-auth-client-wrappers/outputs/phase-0-pattern-analysis.md` - Templates

## Methods to Implement

### Passkey (4 methods)
| Method | Client Path | mutatesSession |
|--------|-------------|----------------|
| addPasskey | `client.passkey.addPasskey` | `false` |
| listUserPasskeys | `client.passkey.listUserPasskeys` | `false` |
| deletePasskey | `client.passkey.deletePasskey` | `false` |
| updatePasskey | `client.passkey.updatePasskey` | `false` |

### Phone-number (4 methods)
| Method | Client Path | mutatesSession |
|--------|-------------|----------------|
| sendOtp | `client.phoneNumber.sendOtp` | `false` |
| verify | `client.phoneNumber.verify` | `false` |
| requestPasswordReset | `client.phoneNumber.requestPasswordReset` | `false` |
| resetPassword | `client.phoneNumber.resetPassword` | `false` |

### OneTimeToken (2 methods)
| Method | Client Path | mutatesSession |
|--------|-------------|----------------|
| verify | `client.oneTimeToken.verify` | `true` |
| generate | `client.oneTimeToken.generate` | `false` |

## 3-Stage Workflow

### Stage 0: Pre-Flight
```bash
bun run check --filter @beep/iam-client
```
STOP if this fails. Fix existing issues first.

### Stage 1: Research
- Fetch Better Auth documentation for all methods
- Create `outputs/phase-4-research.md` with payload/response schemas
- Checkpoint: All 10 methods documented

### Stage 2: Contracts
```bash
# Create directories
mkdir -p packages/iam/client/src/passkey/{add-passkey,list-user-passkeys,delete-passkey,update-passkey}
mkdir -p packages/iam/client/src/phone-number/{send-otp,verify,request-password-reset,reset-password}
mkdir -p packages/iam/client/src/one-time-token/{verify,generate}
```
- Create all 10 `contract.ts` files
- Checkpoint: `bun run check --filter @beep/iam-client`

### Stage 3: Handlers + Wire-up
- Create all `handler.ts`, `mod.ts`, `index.ts` files
- Create layer.ts for each new category
- Update main `src/index.ts` with new exports
- Checkpoint: `bun run check --filter @beep/iam-client`

## Pattern Reminders

**Handler template**:
```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,  // true ONLY for oneTimeToken.verify
  })((encodedPayload) => client.passkey.addPasskey(encodedPayload))
);
```

**Sensitive fields**: Use `S.Redacted(S.String)` for `newPassword`
**Mutable arrays**: Use `S.mutable(S.Array(...))` if Better Auth expects mutable

## Success Criteria

- [ ] `outputs/phase-4-research.md` created
- [ ] All 10 contracts created
- [ ] All 10 handlers created
- [ ] 3 new categories with full layer setup
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] `bun run lint:fix --filter @beep/iam-client` passes
- [ ] `HANDOFF_P5.md` and `P5_ORCHESTRATOR_PROMPT.md` created
