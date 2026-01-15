# Better Auth Config Alignment: Final Gap Analysis

> Final analysis of gaps between Drizzle schemas and Better Auth API exposure

---

## Executive Summary

The Better Auth Config Alignment spec successfully documented and addressed schema configuration gaps between Drizzle table definitions and Better Auth's plugin configuration. The primary finding is that **most plugins only support PARTIAL schema configuration** (modelName + fields renaming), meaning custom columns exist at the database level but cannot be exposed via Better Auth's API/OpenAPI documentation.

### Key Outcomes

| Category | Count | Status |
|----------|-------|--------|
| Models with Full Support | 7 | Configured with additionalFields |
| Models with Partial Support | 12 | Documented (cannot expose custom columns) |
| Models with Minimal Support | 1 | Documented |
| Models with No Support | 3 | Documented |

---

## Plugin Support Level Summary

| Support Level | Definition | Plugins |
|---------------|------------|---------|
| **FULL** | additionalFields supported | Core (user, session), organization (5/6 models) |
| **PARTIAL** | modelName + fields only | twoFactor, passkey, apiKey, stripe, siwe, jwt, oidcProvider, deviceAuthorization, phoneNumber, anonymous, admin, username |
| **MINIMAL** | Direct properties only | sso |
| **NONE** | Hardcoded schema | lastLoginMethod, scim, account |

---

## Fields in Drizzle but NOT in Better Auth API

The following custom columns exist in the database but **cannot** be exposed via Better Auth's API because their respective plugins only support PARTIAL schema configuration.

### Core Models

#### Account (NO additionalFields support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId` | serial | Auto-increment identifier |
| `deletedAt` | timestamp | Soft delete support |
| `createdBy` | text | Audit trail |
| `updatedBy` | text | Audit trail |
| `deletedBy` | text | Audit trail |
| `version` | integer | Optimistic concurrency |
| `source` | text | Origin tracking |

### Authentication Plugin Models

#### TwoFactor (PARTIAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source` | various | OrgTable.make defaults |
| `organizationId` | text | Multi-tenant scoping |

#### Passkey (PARTIAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source` | various | Table.make defaults |
| `aaguid` | text | Authenticator Attestation GUID for device identification |

#### ApiKey (PARTIAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source`, `organizationId` | various | OrgTable.make defaults |
| `enabled` | boolean | Soft enable/disable toggle |
| `rateLimitEnabled` | boolean | Extended rate limiting |
| `rateLimitTimeWindow` | integer | Rate limit window (seconds) |
| `rateLimitMax` | integer | Max requests per window |
| `requestCount` | bigint | Usage tracking |
| `permissions` | text | Authorization scope (JSON) |
| `metadata` | text | Custom data storage |

### Integration Plugin Models

#### Subscription (stripe - PARTIAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source`, `organizationId` | various | OrgTable.make defaults |
| `stripeSubscriptionId` | text | Additional Stripe identifier |

#### SSOProvider (sso - MINIMAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source` | various | Table.make defaults |
| `providerId` | text | Unique SSO provider identifier |

#### WalletAddress (siwe - PARTIAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source` | various | Table.make defaults |
| `chainId` | integer | Blockchain chain ID for multi-chain |
| `isPrimary` | boolean | Primary wallet flag |

#### JWKS (jwt - PARTIAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source` | various | Table.make defaults |
| `expiresAt` | timestamp | Key rotation scheduling |

#### OAuthApplication (oidcProvider - PARTIAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source`, `organizationId` | various | OrgTable.make defaults |
| `metadata` | text | Application metadata storage |

#### OAuthAccessToken (oidcProvider - PARTIAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source`, `organizationId` | various | OrgTable.make defaults (no custom columns) |

#### OAuthConsent (oidcProvider - PARTIAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source`, `organizationId` | various | OrgTable.make defaults (no custom columns) |

#### DeviceCode (deviceAuthorization - PARTIAL support)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source` | various | Table.make defaults |
| `status` | enum | Custom enum (pending/approved/denied) |
| `pollingInterval` | integer | Device-specific polling override |

### Organization Plugin Models

#### TeamMember (NO additionalFields support within organization plugin)
| Column | Type | Notes |
|--------|------|-------|
| `_rowId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source`, `organizationId` | various | OrgTable.make defaults |

---

## Client/Server Schema Alignment Status

### User Model: ALIGNED

| Server additionalField | Client Schema Expects | Status |
|------------------------|----------------------|--------|
| `uploadLimit` | `requireNumber(...)` | Aligned |
| `stripeCustomerId` | `requireString(...)` | Aligned |
| `role` | `requireField(...)` | Aligned |
| `banned` | `requireBoolean(...)` | Aligned |
| `banReason` | `requireString(...)` | Aligned |
| `banExpires` | `requireDate(...)` | Aligned |
| `isAnonymous` | `requireBoolean(...)` | Aligned |
| `phoneNumber` | `requireString(...)` | Aligned |
| `phoneNumberVerified` | `requireBoolean(...)` | Aligned |
| `twoFactorEnabled` | `requireBoolean(...)` | Aligned |
| `username` | `requireString(...)` | Aligned |
| `displayUsername` | `requireString(...)` | Aligned |
| `lastLoginMethod` | `requireString(...)` | Aligned |
| `_rowId`, `version`, `source`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy` | `require*` helpers | Aligned |

### Session Model: ALIGNED

| Server additionalField | Client Schema Expects | Status |
|------------------------|----------------------|--------|
| `activeOrganizationId` | Explicit struct field | Aligned |
| `activeTeamId` | Explicit struct field | Aligned |
| `impersonatedBy` | Explicit struct field | Aligned |
| `_rowId`, `version`, `source`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy` | `require*` helpers | Aligned |

---

## Known Limitations

### 1. Account Model Cannot Have additionalFields
Better Auth's core `account` options do not support `additionalFields`. The `Table.make` default columns exist in the database but cannot be reflected in API schemas or OpenAPI documentation.

**Impact**: Account audit trail columns (`createdBy`, `updatedBy`, etc.) work at DB level only.

### 2. TeamMember Model Cannot Have additionalFields
The organization plugin supports additionalFields for all models EXCEPT `teamMember`.

**Impact**: TeamMember audit trail and custom columns work at DB level only.

### 3. PARTIAL-Support Plugins Cannot Expose Custom Columns
Plugins using `InferOptionSchema<T>` only support `modelName` and `fields` (column renaming). Custom columns added to Drizzle tables work at the database level but:
- Won't appear in Better Auth's OpenAPI documentation
- Won't be validated/transformed by Better Auth
- Must be handled via direct database queries or custom endpoints

### 4. Column Naming Discrepancies
Some Drizzle column names differ from Better Auth's expectations:
- ApiKey: `key` (Drizzle) vs `hashedSecret` (Better Auth)
- ApiKey: `lastRequest` (Drizzle) vs `lastUsedAt` (Better Auth)
- DeviceCode: `scope` (Drizzle) vs `scopes` (Better Auth)

These are handled by the Drizzle adapter's column mapping but may cause confusion.

---

## Recommendations

### Short-term
1. **Use direct database queries** for custom columns in PARTIAL-support models
2. **Document all column mappings** in code comments (already done in Options.ts)
3. **Keep client transformation schemas aligned** with server additionalFields

### Medium-term
1. **Consider custom API endpoints** for operations requiring custom columns (e.g., API key rate limiting, wallet chain management)
2. **Add integration tests** validating round-trip of additionalFields through Better Auth API

### Long-term
1. **Monitor Better Auth releases** for expanded additionalFields support in plugins
2. **Consider contributing PR to Better Auth** adding additionalFields to high-value plugins (apiKey, passkey)

---

## Verification Results

### Server Package (@beep/iam-server)
```
bun run check: PASSED (29 tasks, all cached)
bun run build: PASSED (15 tasks, all cached)
```

### Tables Package (@beep/iam-tables)
```
bun run check: PASSED (23 tasks, all cached)
bun run build: PASSED (12 tasks, all cached)
```

### Client Schema Alignment
- User model: ALIGNED - All additionalFields mapped to require* helpers
- Session model: ALIGNED - All additionalFields mapped to struct fields + require* helpers

---

## Files Modified in This Spec

| File | Changes |
|------|---------|
| `packages/iam/server/src/adapters/better-auth/Options.ts` | Documentation comments for 12 plugins documenting schema support levels and custom columns |
| `packages/iam/client/src/v1/_common/user.schemas.ts` | Pre-existing alignment verified |
| `packages/iam/client/src/v1/_common/session.schemas.ts` | Pre-existing alignment verified |

---

## Spec Completion Status

| Phase | Status | Summary |
|-------|--------|---------|
| Phase 0 | COMPLETE | Discovery & documentation gathering |
| Phase 1 | COMPLETE | Core models (user, session, account) aligned |
| Phase 2 | COMPLETE | Organization models aligned |
| Phase 3 | COMPLETE | Authentication plugin models documented |
| Phase 4 | COMPLETE | Integration plugin models documented |
| Phase 5 | COMPLETE | Final verification & client alignment |

**Spec Status: COMPLETE**
