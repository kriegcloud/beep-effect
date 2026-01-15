# Better Auth Config Alignment — P4 Handoff (Integration Plugin Models)

> Phase 4: Verify and document integration plugin model configurations

---

## Phase 3 Summary

Phase 3 is complete. Documentation comments added to `Options.ts`:

### TwoFactor Plugin — Documentation added:
- PARTIAL support (modelName + fields only, NO additionalFields)
- OrgTable.make defaults exist in DB but not API-exposed
- Reference to `packages/iam/tables/src/tables/twoFactor.table.ts`

### Passkey Plugin — Documentation added:
- PARTIAL support (modelName + fields only, NO additionalFields)
- Table.make defaults exist in DB but not API-exposed
- Custom column `aaguid` (Authenticator Attestation GUID) documented
- Reference to `packages/iam/tables/src/tables/passkey.table.ts`

### ApiKey Plugin — Documentation added:
- PARTIAL support (modelName + fields only, NO additionalFields)
- OrgTable.make defaults exist in DB but not API-exposed
- Custom columns documented: `enabled`, `rateLimitEnabled`, `rateLimitTimeWindow`, `rateLimitMax`, `requestCount`, `permissions`, `metadata`
- Column mapping documented: `key` → `hashedSecret`, `lastRequest` → `lastUsedAt`
- Reference to `packages/iam/tables/src/tables/apiKey.table.ts`

### Verification:
- `bun run check --filter @beep/iam-server` ✅ Passed
- `bun run build --filter @beep/iam-server` ✅ Passed

---

## P4 Objective

Verify and document integration plugin model configurations. These plugins have **PARTIAL** or **MINIMAL** schema support.

Target plugins and models:
1. **stripe** — subscription model (PARTIAL)
2. **sso** — ssoProvider model (MINIMAL)
3. **siwe** — walletAddress model (PARTIAL)
4. **jwt** — jwks model (PARTIAL)
5. **oidcProvider** — oauthApplication, oauthAccessToken, oauthConsent models (PARTIAL)
6. **deviceAuthorization** — deviceCode model (PARTIAL)

---

## Important: Plugin Support Levels

From Phase 0 research:

### PARTIAL Support (InferOptionSchema)
- ✅ `modelName` — rename the table
- ✅ `fields` — rename columns
- ❌ `additionalFields` — NOT SUPPORTED

Applies to: stripe, siwe, jwt, oidcProvider, deviceAuthorization

### MINIMAL Support (Direct Properties)
- ✅ `modelName` — rename the table
- ✅ `fields` — rename columns
- ❌ `additionalFields` — NOT SUPPORTED

Applies to: sso (direct properties on options, not InferOptionSchema)

---

## Files to Know

| File | Purpose |
|------|---------|
| `packages/iam/server/src/adapters/better-auth/Options.ts` | Primary verification target |
| `packages/iam/tables/src/tables/subscription.table.ts` | Stripe subscription Drizzle schema |
| `packages/iam/tables/src/tables/ssoProvider.table.ts` | SSO provider Drizzle schema |
| `packages/iam/tables/src/tables/walletAddress.table.ts` | SIWE wallet Drizzle schema |
| `packages/iam/tables/src/tables/jwks.table.ts` | JWT JWKS Drizzle schema |
| `packages/iam/tables/src/tables/oauthApplication.table.ts` | OIDC application Drizzle schema |
| `packages/iam/tables/src/tables/oauthAccessToken.table.ts` | OIDC access token Drizzle schema |
| `packages/iam/tables/src/tables/oauthConsent.table.ts` | OIDC consent Drizzle schema |
| `packages/iam/tables/src/tables/deviceCode.table.ts` | Device authorization Drizzle schema |
| `specs/better-auth-config-alignment/outputs/plugin-schema-support.md` | Plugin support levels |

---

## P4 Tasks

### Task 4.1: Read Stripe/Subscription Table Schema

Read `packages/iam/tables/src/tables/subscription.table.ts` and identify:
- Columns that are Better Auth plugin core fields
- Custom columns added by beep-effect (Table.make defaults)

### Task 4.2: Read SSO Provider Table Schema

Read `packages/iam/tables/src/tables/ssoProvider.table.ts` and identify:
- Columns that are Better Auth plugin core fields
- Custom columns added by beep-effect

### Task 4.3: Read SIWE/WalletAddress Table Schema

Read `packages/iam/tables/src/tables/walletAddress.table.ts` and identify:
- Columns that are Better Auth plugin core fields
- Custom columns added by beep-effect

### Task 4.4: Read JWT/JWKS Table Schema

Read `packages/iam/tables/src/tables/jwks.table.ts` and identify:
- Columns that are Better Auth plugin core fields
- Custom columns added by beep-effect

### Task 4.5: Read OIDC Provider Table Schemas

Read the following files and identify core vs custom columns for each:
- `packages/iam/tables/src/tables/oauthApplication.table.ts`
- `packages/iam/tables/src/tables/oauthAccessToken.table.ts`
- `packages/iam/tables/src/tables/oauthConsent.table.ts`

### Task 4.6: Read Device Authorization Table Schema

Read `packages/iam/tables/src/tables/deviceCode.table.ts` and identify:
- Columns that are Better Auth plugin core fields
- Custom columns added by beep-effect

### Task 4.7: Verify Current Plugin Configurations

Read the relevant sections in `Options.ts` for:
- `stripe({...})`
- `sso({...})`
- `siwe({...})`
- `jwt({...})`
- `oidcProvider({...})`
- `deviceAuthorization({...})`

Verify that configurations only use supported options.

### Task 4.8: Document Gaps

For each plugin model, document:
- Which custom columns exist in Drizzle
- Which cannot be reflected in Better Auth API
- Whether current configuration is correct

### Task 4.9: Update Options.ts Documentation

Add documentation comments to each plugin configuration explaining:
- What schema options ARE supported
- What custom columns exist but cannot be exposed via API
- Reference to Drizzle table file

### Task 4.10: Verify Changes

```bash
bun run check --filter @beep/iam-server
bun run build --filter @beep/iam-server
```

---

## Better Auth Plugin Core Fields Reference

### Stripe Subscription Core Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `plan` | string | ✅ | Plan name |
| `referenceId` | string | ✅ | Stripe subscription ID |
| `stripeCustomerId` | string | ✅ | Stripe customer ID |
| `status` | string | ✅ | Subscription status |
| `periodStart` | date | ❌ | Current period start |
| `periodEnd` | date | ❌ | Current period end |
| `cancelAtPeriodEnd` | boolean | ❌ | Cancel at period end |
| `seats` | number | ❌ | Number of seats |
| `trialStart` | date | ❌ | Trial period start |
| `trialEnd` | date | ❌ | Trial period end |

### SSO Provider Core Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `issuer` | string | ✅ | SSO issuer URL |
| `domain` | string | ✅ | Domain for SSO |
| `oidcConfig` | string | ❌ | OIDC configuration JSON |
| `samlConfig` | string | ❌ | SAML configuration JSON |
| `organizationId` | string | ✅ | FK to organization |
| `userId` | string | ❌ | FK to user |

### SIWE WalletAddress Core Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `address` | string | ✅ | Ethereum wallet address |
| `createdAt` | date | ✅ | |
| `userId` | string | ✅ | FK to user |

### JWT JWKS Core Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `publicKey` | string | ✅ | Public key JSON |
| `privateKey` | string | ✅ | Private key JSON (encrypted) |
| `createdAt` | date | ✅ | |

### OIDC Provider Core Fields

#### OAuthApplication
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `name` | string | ✅ | Application name |
| `icon` | string | ❌ | Application icon |
| `clientId` | string | ✅ | OAuth client ID |
| `clientSecret` | string | ✅ | OAuth client secret |
| `redirectURLs` | string | ✅ | Allowed redirect URLs |
| `type` | string | ✅ | Application type |
| `disabled` | boolean | ❌ | Disabled flag |
| `userId` | string | ❌ | FK to user |
| `createdAt` | date | ✅ | |
| `updatedAt` | date | ❌ | |

#### OAuthAccessToken
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `accessToken` | string | ✅ | Access token |
| `refreshToken` | string | ❌ | Refresh token |
| `accessTokenExpiresAt` | date | ✅ | Access token expiry |
| `refreshTokenExpiresAt` | date | ❌ | Refresh token expiry |
| `clientId` | string | ✅ | OAuth client ID |
| `userId` | string | ✅ | FK to user |
| `scopes` | string | ❌ | Granted scopes |
| `createdAt` | date | ✅ | |
| `updatedAt` | date | ❌ | |

#### OAuthConsent
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `clientId` | string | ✅ | OAuth client ID |
| `userId` | string | ✅ | FK to user |
| `scopes` | string | ✅ | Consented scopes |
| `createdAt` | date | ✅ | |
| `updatedAt` | date | ❌ | |
| `consentGiven` | boolean | ✅ | Consent status |

### Device Authorization Core Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `deviceCode` | string | ✅ | Device code |
| `userCode` | string | ✅ | User code |
| `clientId` | string | ✅ | OAuth client ID |
| `scopes` | string | ❌ | Requested scopes |
| `userId` | string | ❌ | FK to user (after auth) |
| `expiresAt` | date | ✅ | Code expiry |
| `lastPolledAt` | date | ❌ | Last poll timestamp |

---

## Expected Output Pattern

For each plugin, add documentation like:

```typescript
stripe({
  // ... existing config ...
  // Schema configuration: PARTIAL support (modelName + fields only)
  // - additionalFields NOT supported by this plugin
  // - [Table.make | OrgTable.make] defaults exist in DB but are not exposed via
  //   Better Auth API.
  // - Custom columns: [list any custom columns]
  // See: packages/iam/tables/src/tables/subscription.table.ts
}),
```

---

## P4 Completion Checklist

- [ ] Subscription table schema read and analyzed
- [ ] SSOProvider table schema read and analyzed
- [ ] WalletAddress table schema read and analyzed
- [ ] JWKS table schema read and analyzed
- [ ] OAuth tables (application, accessToken, consent) read and analyzed
- [ ] DeviceCode table schema read and analyzed
- [ ] Current Options.ts configurations verified
- [ ] Documentation comments added to each plugin
- [ ] No invalid configuration options present
- [ ] `bun run check` passes
- [ ] `bun run build` passes
- [ ] REFLECTION_LOG.md Phase 4 section updated

---

## P4 → P5 Handoff

After completing P4:
1. Update `REFLECTION_LOG.md` Phase 4 section
2. **Create `handoffs/HANDOFF_P5.md`** for verification & client alignment (Phase 5)
3. P5 will focus on:
   - Final verification of all plugin configurations
   - Client-side `inferOrgAdditionalFields` alignment
   - OpenAPI documentation verification
   - Final build and lint checks

---

## Orchestrator Prompt for P4

```markdown
# P4 Orchestrator: Integration Plugin Models Documentation

## Your Task
Verify and document Better Auth integration plugin model configurations. These plugins have PARTIAL or MINIMAL schema support only.

## Prerequisite Check
Verify Phase 3 is complete:
- twoFactor plugin documented
- passkey plugin documented
- apiKey plugin documented

## Research Phase
1. Read each Drizzle table schema:
   - subscription.table.ts (stripe)
   - ssoProvider.table.ts
   - walletAddress.table.ts (siwe)
   - jwks.table.ts (jwt)
   - oauthApplication.table.ts, oauthAccessToken.table.ts, oauthConsent.table.ts (oidcProvider)
   - deviceCode.table.ts
2. Read current plugin configurations in Options.ts
3. Compare against plugin core fields reference

## Documentation Phase
For each plugin:
1. Identify custom columns that CANNOT be exposed via API
2. Verify configuration only uses supported options
3. Add documentation comments explaining:
   - Supported schema options (PARTIAL/MINIMAL: modelName + fields)
   - Custom columns that exist but aren't API-exposed
   - Reference to Drizzle table file

## Verification Phase
1. Run `bun run check --filter @beep/iam-server`
2. Run `bun run build --filter @beep/iam-server`

## Output Required
- Updated Options.ts with documentation comments for PARTIAL/MINIMAL-support plugins
- Gap analysis documented in REFLECTION_LOG.md
- handoffs/HANDOFF_P5.md created for next phase

## Key Constraints
- DO NOT add additionalFields to PARTIAL/MINIMAL-support plugins (will be ignored)
- DO document which custom columns exist but cannot be API-exposed
- Focus on documentation, not configuration changes
- Note: sso uses MINIMAL support (direct properties), not InferOptionSchema
```
