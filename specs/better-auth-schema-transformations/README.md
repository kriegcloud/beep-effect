# Better Auth Schema Transformations Spec

> Systematic creation of Effect Schema transformations mapping Better Auth entities to domain model schemas.

---

## Purpose & Scope

Create bidirectional transformation schemas (`S.transformOrFail`) for every Better Auth entity to its corresponding domain model schema in `@beep/iam-domain/entities` or `@beep/shared-domain/entities`.

### Problem Statement

Better Auth returns raw JavaScript objects from its APIs. Our domain models use branded types, Effect's `DateTime.Utc`, `Redacted<Email>`, and other sophisticated transformations. Manual mapping is error-prone and inconsistent.

### Solution

Generate Effect Schema classes that:
1. Define the Better Auth entity structure (`BetterAuth<EntityName>`)
2. Transform bidirectionally to our domain `Model` schemas
3. Handle ID format validation (branded `${table}__${uuid}` format)
4. Map default fields (`_rowId`, `version`, `source`, audit fields)

---

## Entity Mapping Overview (21 Entities)

| # | Better Auth Entity | Docs URL | Domain Package | Priority |
|---|-------------------|----------|----------------|----------|
| 1 | User | [reference#model/user](http://localhost:8080/api/v1/auth/reference#model/user) | `@beep/shared-domain` | **P0** (Done) |
| 2 | Session | [reference#model/session](http://localhost:8080/api/v1/auth/reference#model/session) | `@beep/shared-domain` | **P1** |
| 3 | Account | [reference#model/account](http://localhost:8080/api/v1/auth/reference#model/account) | `@beep/iam-domain` | **P1** |
| 4 | Verification | [reference#model/verification](http://localhost:8080/api/v1/auth/reference#model/verification) | `@beep/iam-domain` | **P2** |
| 5 | RateLimit | *(source only)* | `@beep/iam-domain` | **P2** |
| 6 | TwoFactor | [reference#model/twofactor](http://localhost:8080/api/v1/auth/reference#model/twofactor) | `@beep/iam-domain` | **P3** |
| 7 | WalletAddress | [reference#model/walletaddress](http://localhost:8080/api/v1/auth/reference#model/walletaddress) | `@beep/iam-domain` | **P3** |
| 8 | SsoProvider | [reference#model/ssoprovider](http://localhost:8080/api/v1/auth/reference#model/ssoprovider) | `@beep/iam-domain` | **P4** |
| 9 | Passkey | [reference#model/passkey](http://localhost:8080/api/v1/auth/reference#model/passkey) | `@beep/iam-domain` | **P4** |
| 10 | Organization | [reference#model/organization](http://localhost:8080/api/v1/auth/reference#model/organization) | `@beep/shared-domain` | **P5** |
| 11 | OrganizationRole | [reference#model/organizationrole](http://localhost:8080/api/v1/auth/reference#model/organizationrole) | `@beep/iam-domain` | **P5** |
| 12 | Team | [reference#model/team](http://localhost:8080/api/v1/auth/reference#model/team) | `@beep/shared-domain` | **P6** |
| 13 | TeamMember | [reference#model/teammember](http://localhost:8080/api/v1/auth/reference#model/teammember) | `@beep/iam-domain` | **P6** |
| 14 | Member | [reference#model/member](http://localhost:8080/api/v1/auth/reference#model/member) | `@beep/iam-domain` | **P6** |
| 15 | Invitation | [reference#model/invitation](http://localhost:8080/api/v1/auth/reference#model/invitation) | `@beep/iam-domain` | **P6** |
| 16 | OauthApplication | [reference#model/oauthapplication](http://localhost:8080/api/v1/auth/reference#model/oauthapplication) | `@beep/iam-domain` | **P7** |
| 17 | OauthAccessToken | [reference#model/oauthaccesstoken](http://localhost:8080/api/v1/auth/reference#model/oauthaccesstoken) | `@beep/iam-domain` | **P7** |
| 18 | OauthConsent | [reference#model/oauthconsent](http://localhost:8080/api/v1/auth/reference#model/oauthconsent) | `@beep/iam-domain` | **P7** |
| 19 | Jwks | [reference#model/jwks](http://localhost:8080/api/v1/auth/reference#model/jwks) | `@beep/iam-domain` | **P8** |
| 20 | DeviceCode | [reference#model/devicecode](http://localhost:8080/api/v1/auth/reference#model/devicecode) | `@beep/iam-domain` | **P8** |
| 21 | Apikey | [reference#model/apikey](http://localhost:8080/api/v1/auth/reference#model/apikey) | `@beep/iam-domain` | **P8** |

**Note**: Some entities (like RateLimit) may not appear in the Better Auth reference docs. For these, use source files in `tmp/better-auth/packages/` as the authoritative schema definition.

---

## Phase Structure (One Phase Per Entity)

Each entity gets its own phase. After EACH phase, reflection MUST be run to capture learnings and improve the spec for subsequent phases.

### Phase 1: Session
### Phase 2: Account
### Phase 3: Verification
### Phase 4: RateLimit
### Phase 5: TwoFactor
### Phase 6: WalletAddress
### Phase 7: SsoProvider
### Phase 8: Passkey
### Phase 9: Organization
### Phase 10: OrganizationRole
### Phase 11: Team
### Phase 12: TeamMember
### Phase 13: Member
### Phase 14: Invitation
### Phase 15: OauthApplication
### Phase 16: OauthAccessToken
### Phase 17: OauthConsent
### Phase 18: Jwks
### Phase 19: DeviceCode
### Phase 20: Apikey

---

## Critical Orchestration Protocols

### Reflection Protocol (MANDATORY after each phase)

After completing each entity's transformation schema:

1. **Run the `reflector` agent** to capture learnings
2. **Update `REFLECTION_LOG.md`** with:
   - What worked well
   - What didn't work
   - Surprising findings
   - Prompt refinements for next phase
3. **Update `MASTER_ORCHESTRATION.md`** with any new patterns discovered
4. **Create handoff document** for next phase with refined prompts

### Helper Extraction Protocol (MANDATORY when duplication detected)

When implementing transformation schemas, if you notice **duplicated logic/code** across multiple schemas:

1. **STOP** — Do not continue copy-pasting duplicated code
2. **Extract** the shared logic into a reusable helper in:
   - `packages/iam/client/src/v1/_common/transformation-helpers.ts` (new file if needed)
3. **Document** the helper in:
   - `MASTER_ORCHESTRATION.md` → "Shared Helpers" section
   - The handoff document for next phase
4. **Refactor** any existing schemas that could use the helper
5. **Reference** the helper in future entity instructions

**Common candidates for helper extraction:**
- ID format validation
- `_rowId` placeholder assignment
- `toDate()` conversion for encode
- Nullable field coercion (`?? null` / `?? undefined`)
- Audit field defaults (`source`, `deletedAt`, `createdBy`, etc.)

---

## Success Criteria

- [ ] All 20 remaining entities have `BetterAuth<EntityName>` schema classes
- [ ] All 20 remaining entities have `DomainXxxFromBetterAuthXxx` transformation schemas
- [ ] All transformations validate ID format (branded `${table}__${uuid}`)
- [ ] All transformations handle placeholder values for DB-only fields
- [ ] Shared helpers extracted for duplicated logic (documented in MASTER_ORCHESTRATION)
- [ ] REFLECTION_LOG.md updated after EACH phase
- [ ] `bun run check` passes for `@beep/iam-client`
- [ ] `bun run build` succeeds for `@beep/iam-client`
- [ ] `bun run lint:fix` produces no new issues

---

## Agent Workflow Per Entity (Per Phase)

Each entity/phase follows this workflow:

### Step 1: Research (Gather Schema Definition)
1. Use Playwright to navigate to `http://localhost:8080/api/v1/auth/reference#model/<model-name>`
2. If docs unavailable, read source at `tmp/better-auth/packages/*/src/db/schema/*.ts`
3. Document all fields, types, constraints, and relationships

### Step 2: Check for Existing Helpers
1. Read `packages/iam/client/src/v1/_common/transformation-helpers.ts` (if exists)
2. Read latest `REFLECTION_LOG.md` for accumulated patterns
3. Note which helpers can be reused for this entity

### Step 3: Create Schema
1. Create `BetterAuth<EntityName>` Effect schema class
2. Create `DomainXxxFromBetterAuthXxx` transformOrFail schema
3. Use existing helpers where applicable

### Step 4: Verify
```bash
bun run check --filter=@beep/iam-client
bun run build --filter=@beep/iam-client
bun run lint:fix --filter=@beep/iam-client
```

### Step 5: Reflect & Handoff (MANDATORY)
1. **Run reflection** — Document learnings in REFLECTION_LOG.md
2. **Extract helpers** — If new patterns emerged, extract to transformation-helpers.ts
3. **Update MASTER_ORCHESTRATION** — Add new patterns to "Shared Helpers" section
4. **Create handoff** — Write `handoffs/HANDOFF_P<N+1>.md` for next phase

---

## Reference Files

### Completed Example (User)
- `packages/iam/client/src/v1/_common/user.schemas.ts` - Contains `BetterAuthUser` and `DomainUserFromBetterAuthUser`

### Shared Helpers (grows over time)
- `packages/iam/client/src/v1/_common/transformation-helpers.ts` - Reusable transformation utilities

### Domain Models
- `packages/shared/domain/src/entities/*/` - Shared domain entities (User, Session, Organization, Team)
- `packages/iam/domain/src/entities/*/` - IAM domain entities (Account, Member, Passkey, etc.)

### Better Auth Source
- `tmp/better-auth/packages/core/src/db/schema/` - Core entity schemas
- `tmp/better-auth/packages/better-auth/src/plugins/*/schema.ts` - Plugin entity schemas

---

## Quick Start

```bash
# Start dev server for Better Auth docs
cd tmp/better-auth && pnpm dev

# Run verification after each entity
bun run check --filter=@beep/iam-client
bun run build --filter=@beep/iam-client
bun run lint:fix --filter=@beep/iam-client
```

---

## Related Documentation

| File | Purpose |
|------|---------|
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Full workflow, patterns, shared helpers |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Cumulative learnings from all phases |
| [QUICK_START.md](./QUICK_START.md) | 5-minute onboarding |
| [handoffs/](./handoffs/) | Phase transition documents |
| [user.schemas.ts](../../packages/iam/client/src/v1/_common/user.schemas.ts) | Reference implementation (User) |
