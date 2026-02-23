# better-auth-client-wrappers

> Wrap remaining better-auth client methods for @beep/iam-client using established patterns

---

## Purpose

Create Effect-wrapped handlers for remaining better-auth client methods in `@beep/iam-client`, following the `Wrapper.implement()` + `wrapIamMethod()` pattern.

---

## Scope

**90 methods across 15 categories:**

| Category | Count | Examples |
|----------|-------|----------|
| admin | 14 | setRole, createUser, banUser |
| core | 8 | updateUser, deleteUser, linkSocial |
| organization | 24 | checkSlug, addMember, createTeam |
| passkey | 4 | addPasskey, listUserPasskeys |
| oauth-provider | 14 | getClient, register, consent |
| phone-number | 4 | sendOtp, verify |
| sign-in | 6 | sso, passkey, phoneNumber |
| api-key | 5 | create, get, update, delete, list |
| device | 4 | code, token, approve, deny |
| sso | 3 | register, verifyDomain |
| Others | 4 | oneTimeToken, scim, jwt, anonymous |

**Existing wrappers (DO NOT reimplement):** `sign-out`, `get-session`, `sign-in/email`, `sign-up/email`, `password/*`, `two-factor/*`, `organization/*`, `multi-session/*`, `email-verification/*`

---

## Success Criteria

| Metric | Target | Verification |
|--------|--------|--------------|
| Methods wrapped | 90/90 | `find src -name 'contract.ts' \| wc -l` |
| File pattern | 360 files (4×90) | `contract.ts` + `handler.ts` + `mod.ts` + `index.ts` |
| Type errors | 0 errors | `bun run check --filter @beep/iam-client` |
| Lint errors | 0 errors | `bun run lint --filter @beep/iam-client` |
| Schema validation | 0 S.Any | `grep -r "S\.Any" src/ \| wc -l` = 0 |
| Layer integration | 90/90 handlers | All handlers registered in WrapperGroup |

---

## Phase Overview

| Phase | Focus | Methods |
|-------|-------|---------|
| P0 | Infrastructure & scope reduction | N/A |
| P1 | Core + Username | 9 |
| P2 | Admin Part 1 | 7 |
| P3 | Admin Part 2 + SSO + Sign-in | 13 |
| P4 | Passkey + Phone-number + OneTimeToken | 10 |
| P5 | OAuth-provider + Device + JWT | 22 |
| P6 | Organization + API-key + Remaining | 29 |

---

## Quick Start

See [QUICK_START.md](QUICK_START.md) for implementation patterns.

**Phase Order**: P0 (Infrastructure) → P1 → P2 → ... → P6

**Workflow**: 3-stage batched approach per phase:
1. Research ALL methods → `outputs/phase-N-research.md`
2. Create ALL contracts → verify compilation
3. Create ALL handlers + wire layer ONCE → full verification

---

## Key Files

| File | Purpose |
|------|---------|
| [QUICK_START.md](QUICK_START.md) | Pattern reference |
| [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) | Full workflow |
| [handoffs/HANDOFF_P0.md](handoffs/HANDOFF_P0.md) | Start here |
| [AGENT_PROMPTS.md](AGENT_PROMPTS.md) | Doc URLs per method |

---

## Canonical Pattern

**File structure per method:**
```
packages/iam/client/src/[category]/[operation]/
├── contract.ts    # Payload, Success, Wrapper
├── handler.ts     # Handler = Wrapper.implement(wrapIamMethod(...))
├── mod.ts         # Re-export contract + handler
└── index.ts       # Namespace export
```

---

## Reference Documentation

- [better-auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [better-auth Organization Plugin](https://www.better-auth.com/docs/plugins/organization)
- [better-auth Passkey Plugin](https://www.better-auth.com/docs/plugins/passkey)
- [better-auth OAuth Provider Plugin](https://www.better-auth.com/docs/plugins/oauth-provider)
