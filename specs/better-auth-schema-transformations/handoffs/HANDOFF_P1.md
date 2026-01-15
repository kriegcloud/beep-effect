# Better Auth Schema Transformations — Handoff P1

> Transition document from Phase 0 (scaffolding) to Phase 1 (Session Entity)

---

## Session Summary: Phase 0 Completed

| Metric | Value | Status |
|--------|-------|--------|
| Total entities to map | 21 | Identified |
| Entities complete | 1 (User) | Reference implementation |
| Entities remaining | 20 | Ready for orchestration |
| Spec files created | 7 | Complete |
| Phases defined | 20 (one per entity) | Complete |

---

## Phase 0 Artifacts

### Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `README.md` | Entry point, 21-entity mapping | ~150 |
| `MASTER_ORCHESTRATION.md` | Full workflow, agent protocols, helpers | ~300 |
| `REFLECTION_LOG.md` | Initial learnings from User | ~140 |
| `QUICK_START.md` | 5-min getting started | ~90 |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | P1 execution guide | ~190 |
| `handoffs/HANDOFF_P1.md` | This document | ~150 |
| `outputs/spec-review-final.md` | Spec review report | ~1000 |

### Reference Implementation Analysis

The `DomainUserFromBetterAuthUser` transformation in `common.schemas.ts` established:

1. **Schema class pattern**: `S.Class<T>(identifier)(fields, annotations)`
2. **Transformation pattern**: `S.transformOrFail(Source, Target, { strict, decode, encode })`
3. **Decode return type**: `S.Schema.Encoded<typeof Target>` (encoded form, not instance)
4. **Encode return type**: `new SourceSchema({ ... })` (schema class instance)

---

## Lessons from Phase 0

### What Worked Well

1. **Examining existing codebase first** — Found Better Auth configured with `generateId: false`, explaining ID format
2. **Reading domain models** — Understood required fields before designing transformation
3. **Effect Schema expert consultation** — Clarified encoded vs decoded types in transformOrFail

### What Didn't Work

1. **Initial assumption about return type** — Tried returning Model instance instead of encoded form
2. **Import path assumptions** — `BetterAuthError` path was `@better-auth/core/error`, not `@better-auth/core`

### Prompt Refinements Applied

- Added explicit instruction: "decode returns encoded form (`S.Schema.Encoded<typeof Model>`)"
- Added ID validation pattern as mandatory step
- Added nullable handling rules: `?? null` for decode, `?? undefined` for encode
- Added agent delegation protocol: use `effect-schema-expert` for schema code
- Added mandatory reflection step after each phase
- Added helper extraction protocol when duplication detected

---

## Complete Entity List (20 Remaining)

| Phase | Entity | Docs URL | Domain Package |
|-------|--------|----------|----------------|
| 1 | Session | [session](http://localhost:8080/api/v1/auth/reference#model/session) | `@beep/shared-domain` |
| 2 | Account | [account](http://localhost:8080/api/v1/auth/reference#model/account) | `@beep/iam-domain` |
| 3 | Verification | [verification](http://localhost:8080/api/v1/auth/reference#model/verification) | `@beep/iam-domain` |
| 4 | RateLimit | *(source only)* | `@beep/iam-domain` |
| 5 | TwoFactor | [twofactor](http://localhost:8080/api/v1/auth/reference#model/twofactor) | `@beep/iam-domain` |
| 6 | WalletAddress | [walletaddress](http://localhost:8080/api/v1/auth/reference#model/walletaddress) | `@beep/iam-domain` |
| 7 | SsoProvider | [ssoprovider](http://localhost:8080/api/v1/auth/reference#model/ssoprovider) | `@beep/iam-domain` |
| 8 | Passkey | [passkey](http://localhost:8080/api/v1/auth/reference#model/passkey) | `@beep/iam-domain` |
| 9 | Organization | [organization](http://localhost:8080/api/v1/auth/reference#model/organization) | `@beep/shared-domain` |
| 10 | OrganizationRole | [organizationrole](http://localhost:8080/api/v1/auth/reference#model/organizationrole) | `@beep/iam-domain` |
| 11 | Team | [team](http://localhost:8080/api/v1/auth/reference#model/team) | `@beep/shared-domain` |
| 12 | TeamMember | [teammember](http://localhost:8080/api/v1/auth/reference#model/teammember) | `@beep/iam-domain` |
| 13 | Member | [member](http://localhost:8080/api/v1/auth/reference#model/member) | `@beep/iam-domain` |
| 14 | Invitation | [invitation](http://localhost:8080/api/v1/auth/reference#model/invitation) | `@beep/iam-domain` |
| 15 | OauthApplication | [oauthapplication](http://localhost:8080/api/v1/auth/reference#model/oauthapplication) | `@beep/iam-domain` |
| 16 | OauthAccessToken | [oauthaccesstoken](http://localhost:8080/api/v1/auth/reference#model/oauthaccesstoken) | `@beep/iam-domain` |
| 17 | OauthConsent | [oauthconsent](http://localhost:8080/api/v1/auth/reference#model/oauthconsent) | `@beep/iam-domain` |
| 18 | Jwks | [jwks](http://localhost:8080/api/v1/auth/reference#model/jwks) | `@beep/iam-domain` |
| 19 | DeviceCode | [devicecode](http://localhost:8080/api/v1/auth/reference#model/devicecode) | `@beep/iam-domain` |
| 20 | Apikey | [apikey](http://localhost:8080/api/v1/auth/reference#model/apikey) | `@beep/iam-domain` |

---

## Phase 1 Scope: Session Entity

### Target Entity

| Attribute | Value |
|-----------|-------|
| Entity | Session |
| Docs | http://localhost:8080/api/v1/auth/reference#model/session |
| Source | `tmp/better-auth/packages/core/src/db/schema/session.ts` |
| Target File | `packages/iam/client/src/v1/_common/session.schemas.ts` |
| Domain Model | `@beep/shared-domain/entities/Session` |

### Expected Fields

- id, userId, expiresAt, token, ipAddress, userAgent, createdAt, updatedAt
- Organization plugin fields (if enabled): activeOrganizationId, activeTeamId

### Expected Challenges

1. **Organization plugin fields**: Session may have `activeOrganizationId` from org plugin
2. **Token handling**: Token field might be sensitive — check if domain uses Redacted

---

## P1 Success Criteria

- [ ] `BetterAuthSession` schema class created
- [ ] `DomainSessionFromBetterAuthSession` transformation passing checks
- [ ] All `bun run check/build/lint:fix` passing
- [ ] REFLECTION_LOG.md updated with P1 learnings
- [ ] Helpers extracted if duplication detected
- [ ] HANDOFF_P2.md created for Account entity
- [ ] P2_ORCHESTRATOR_PROMPT.md created for Account entity

---

## Agent Protocols for P1

### Schema Code → `effect-schema-expert`
Delegate all schema writing to the effect-schema-expert agent.

### Research → Playwright + Explore
Use Playwright for Better Auth docs, Explore agent for source files.

### Reflection → `reflector`
Run reflector agent after Phase 1 completion to capture learnings.

---

## Resources for P1

### Better Auth Source Files
```
tmp/better-auth/packages/core/src/db/schema/session.ts
tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts (for session fields)
```

### Domain Model Files
```
packages/shared/domain/src/entities/Session/Session.model.ts
```

### Reference Implementation
```
packages/iam/client/src/v1/_common/common.schemas.ts (BetterAuthUser, DomainUserFromBetterAuthUser)
```

---

## Next Steps

1. Open `handoffs/P1_ORCHESTRATOR_PROMPT.md` for detailed task instructions
2. Execute Phase 1 (Session Entity) following steps 1.1-1.8
3. Run reflection and update REFLECTION_LOG.md
4. Extract helpers if duplication detected
5. Create `handoffs/HANDOFF_P2.md` and `handoffs/P2_ORCHESTRATOR_PROMPT.md`

---

## Notes for Executing Agent

- The Better Auth dev server URL is `http://localhost:8080/api/v1/auth/reference`
- Use Playwright `browser_snapshot` action for accessibility tree (better than screenshots)
- **Delegate schema code to `effect-schema-expert` agent** — do NOT write schema code directly
- **Reflection is MANDATORY** — do NOT skip after completing the entity
- **Extract helpers when duplication detected** — do NOT copy-paste similar code
