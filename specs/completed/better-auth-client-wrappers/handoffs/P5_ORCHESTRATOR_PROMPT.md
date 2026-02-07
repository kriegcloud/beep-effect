# Phase 5 Orchestrator Prompt

> Copy-paste this entire prompt to start Phase 5 implementation

---

## Mission

Implement 22 better-auth client wrappers for OAuth2 provider, device flow, JWT, and additional sign-in methods using the 3-stage batched workflow.

## Context Files

Read these FIRST before implementation:
1. `specs/better-auth-client-wrappers/handoffs/HANDOFF_P5.md` - Full handoff context
2. `specs/better-auth-client-wrappers/outputs/method-implementation-guide.md` - Per-method specs
3. `specs/better-auth-client-wrappers/outputs/phase-0-pattern-analysis.md` - Templates

## Methods to Implement

### OAuth2 (13 methods)
| Method | Client Path | mutatesSession |
|--------|-------------|----------------|
| getClient | `client.oauth2.getClient({ query })` | `false` |
| publicClient | `client.oauth2.publicClient(encoded)` | `false` |
| getClients | `client.oauth2.getClients()` | `false` |
| updateClient | `client.oauth2.updateClient(encoded)` | `false` |
| rotateSecret | `client.oauth2.client.rotateSecret(encoded)` | `false` |
| deleteClient | `client.oauth2.deleteClient(encoded)` | `false` |
| getConsent | `client.oauth2.getConsent({ query })` | `false` |
| getConsents | `client.oauth2.getConsents()` | `false` |
| updateConsent | `client.oauth2.updateConsent(encoded)` | `false` |
| deleteConsent | `client.oauth2.deleteConsent(encoded)` | `false` |
| register | `client.oauth2.register(encoded)` | `false` |
| consent | `client.oauth2.consent(encoded)` | `false` |
| continue | `client.oauth2.continue(encoded)` | `false` |
| link | `client.oauth2.link(encoded)` | `true` |

### Device (4 methods)
| Method | Client Path | mutatesSession |
|--------|-------------|----------------|
| code | `client.device.code(encoded)` | `false` |
| token | `client.device.token(encoded)` | `false` |
| approve | `client.device.approve(encoded)` | `true` |
| deny | `client.device.deny(encoded)` | `true` |

### JWT (1 method)
| Method | Client Path | mutatesSession |
|--------|-------------|----------------|
| jwks | `client.jwks()` | `false` |

### Sign-in Extensions (4 methods)
| Method | Client Path | mutatesSession |
|--------|-------------|----------------|
| social | `client.signIn.social(encoded)` | `true` |
| oauth2 | `client.signIn.oauth2(encoded)` | `true` |
| anonymous | `client.signIn.anonymous()` | `true` |

## 3-Stage Workflow

### Stage 0: Pre-Flight
```bash
bun run check --filter @beep/iam-client
```
STOP if this fails. Fix existing issues first.

### Stage 1: Research
- Fetch Better Auth documentation for all methods
- Create `outputs/phase-5-research.md` with payload/response schemas
- Checkpoint: All 22 methods documented

### Stage 2: Contracts
```bash
# Create directories
mkdir -p packages/iam/client/src/oauth2/{get-client,public-client,get-clients,update-client,rotate-secret,delete-client,get-consent,get-consents,update-consent,delete-consent,register,consent,continue,link}
mkdir -p packages/iam/client/src/device/{code,token,approve,deny}
mkdir -p packages/iam/client/src/jwt/jwks
mkdir -p packages/iam/client/src/sign-in/{social,oauth2,anonymous}
```
- Create all 22 `contract.ts` files
- Checkpoint: `bun run check --filter @beep/iam-client`

### Stage 3: Handlers + Wire-up
- Create all `handler.ts`, `mod.ts`, `index.ts` files
- Create layer.ts for each new category (oauth2, device, jwt)
- Update sign-in layer with new handlers
- Update main `src/index.ts` with new exports
- Checkpoint: `bun run check --filter @beep/iam-client`

## Pattern Reminders

**Query-wrapped handler**:
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.getClient({ query: encodedPayload }))
);
```

**No-payload handler**:
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.oauth2.getClients())
);
```

**Sensitive fields**: Use `S.Redacted(S.String)` for `clientSecret`

## Success Criteria

- [ ] `outputs/phase-5-research.md` created
- [ ] All 22 contracts created
- [ ] All 22 handlers created
- [ ] 3 new categories with full layer setup (oauth2, device, jwt)
- [ ] Sign-in extensions added
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] `bun run lint:fix --filter @beep/iam-client` passes
- [ ] `HANDOFF_P6.md` and `P6_ORCHESTRATOR_PROMPT.md` created
