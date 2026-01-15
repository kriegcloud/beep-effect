# Better Auth Configuration Alignment: Master Orchestration

> Complete workflow for aligning Better Auth plugin configurations with Drizzle table schemas.

---

## Prerequisites

### Better Auth Source Code Setup

Before starting any phase, ensure the Better Auth source code is available for analysis:

```bash
# Clone Better Auth source (if not already present)
if [ ! -d "tmp/better-auth" ]; then
  mkdir -p tmp
  git clone https://github.com/better-auth/better-auth.git tmp/better-auth
fi

# Checkout version matching your installed package
cd tmp/better-auth
git fetch --tags
git checkout $(jq -r '.dependencies["better-auth"]' packages/iam/server/package.json | sed 's/^[\^~]//')
cd ../..
```

**Why?** Source code analysis is the PRIMARY research method. External documentation tools may be unavailable, and source is always authoritative.

---

## Critical Orchestration Rules

1. **ALWAYS analyze Better Auth source code** in `tmp/better-auth/` as the PRIMARY research method before modifying any plugin configuration
2. **NEVER guess field types** - verify against both Better Auth source AND Drizzle table definitions
3. **ALWAYS run verification commands** after each entity update
4. **PRESERVE `additionalFieldsCommon`** - it provides the base audit columns; only ADD entity-specific fields
5. **UPDATE REFLECTION_LOG.md** after completing each phase - learnings improve subsequent phases
6. **UNDERSTAND plugin heterogeneity** - plugins do NOT all follow the same `additionalFields` pattern (see below)
7. **CHECK current state first** - before assuming work needs to be done, verify what's already configured in Options.ts

---

## CRITICAL: Plugin Configuration Heterogeneity

**Better Auth plugins have THREE levels of schema support.** Each plugin's support level is determined by its TypeScript types.

### Configuration Categories

| Support Level | Plugins | What's Configurable |
|---------------|---------|---------------------|
| **Full** | Core models (user, session, account), organization plugin models (except teamMember) | `modelName`, `fields`, **`additionalFields`** |
| **Partial** | passkey, twoFactor, apiKey, phoneNumber, anonymous, admin, jwt, oidcProvider | `modelName`, `fields` (column renaming) - NO additionalFields |
| **Minimal** | sso, teamMember (organization plugin) | `modelName` + `fields` but NO additionalFields |
| **None** | scim, siwe, some internal models | Hardcoded schema - no configuration options |

### Schema Type Detection (CRITICAL)

Plugins use one of two schema types. **Check the plugin's types.ts file:**

```typescript
// PARTIAL SUPPORT - Uses InferOptionSchema
// Only modelName and fields (column renaming) are available
schema?: InferOptionSchema<typeof schema>

// FULL SUPPORT - Custom type with additionalFields
// All configuration options including additionalFields
schema?: {
  <model>: {
    modelName?: string;
    fields?: { ... };
    additionalFields?: { ... };  // <-- This is what you're looking for
  }
}
```

### Implications for Partial Support Plugins

For plugins that **only support `modelName`/`fields`** (NO additionalFields):
1. Configure only `modelName` to match your Drizzle table name
2. Your extra Drizzle columns (audit fields, etc.) WILL work at database level
3. Extra columns WON'T appear in Better Auth's OpenAPI documentation
4. Extra columns WON'T be validated/transformed by Better Auth
5. This is acceptable - application code can still use these columns

### Research Protocol for Each Plugin

When investigating a plugin, follow this precise methodology:

**Step 1: Locate plugin source files**
```bash
ls tmp/better-auth/packages/<plugin>/src/  # External plugins (passkey, etc.)
ls tmp/better-auth/packages/better-auth/src/plugins/<plugin>/  # Built-in plugins
```

**Step 2: Check schema type in types.ts**
```bash
# Look for InferOptionSchema (partial support) vs custom type (full support)
grep -A5 "schema?" tmp/better-auth/packages/<plugin>/src/types.ts
```

**Step 3: Verify mergeSchema usage in index.ts**
```bash
# If uses mergeSchema, check what it processes
grep -B2 -A2 "mergeSchema" tmp/better-auth/packages/<plugin>/src/index.ts
```

**Step 4: Document finding**
- `InferOptionSchema` → Partial support (modelName + fields only)
- Custom type with `additionalFields` → Full support
- No schema option → Minimal/no support

**Step 5: Configure appropriately**
- Full support: Add all custom fields to additionalFields
- Partial support: Configure modelName only
- Minimal support: No configuration needed

---

## Understanding the Configuration Structure

### Better Auth Options Pattern

Better Auth uses `additionalFields` to extend model schemas. The type is `DBFieldAttribute<T>` from `better-auth/packages/core/src/db/type.ts`:

```typescript
// DBFieldType - all supported field types
type DBFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "json"
  | "string[]"
  | "number[]"
  | Array<LiteralString>;  // For enum-like literal unions

// DBFieldAttributeConfig - the full configuration object
type DBFieldAttributeConfig = {
  /**
   * If the field should be required on a new record.
   * @default true  // <-- NOTE: defaults to TRUE, not false!
   */
  required?: boolean;

  /**
   * If the value should be returned on a response body.
   * @default true
   */
  returned?: boolean;

  /**
   * If a value should be provided when creating a new record.
   * @default true
   */
  input?: boolean;

  /**
   * Default value for the field.
   * Note: This is a runtime default, NOT a database-level default.
   */
  defaultValue?: DBPrimitive | (() => DBPrimitive);

  /**
   * Update value for the field - called when updating a record.
   */
  onUpdate?: () => DBPrimitive;

  /**
   * Transform the value before storing/retrieving.
   */
  transform?: {
    input?: (value: DBPrimitive) => Awaitable<DBPrimitive>;
    output?: (value: DBPrimitive) => Awaitable<DBPrimitive>;
  };

  /**
   * Reference to another model (foreign key).
   */
  references?: {
    model: string;
    field: string;
    onDelete?: "no action" | "restrict" | "cascade" | "set null" | "set default";
  };

  /** If the field should be unique */
  unique?: boolean;

  /** If the field should be a bigint instead of integer (for number type) */
  bigint?: boolean;

  /** Standard Schema validator for input/output validation */
  validator?: {
    input?: StandardSchemaV1;
    output?: StandardSchemaV1;
  };

  /** Custom database column name (if different from field name) */
  fieldName?: string;

  /** If the field should be sortable (uses varchar instead of text) */
  sortable?: boolean;

  /** If the field should be indexed. @default false */
  index?: boolean;
};

// DBFieldAttribute<T> = { type: T } & DBFieldAttributeConfig
```

**CRITICAL**: The `required` property defaults to `true`, NOT `false`. This means:
- Fields without `.notNull()` in Drizzle should have `required: false` explicitly set
- Fields with `.notNull()` can omit `required` (it defaults to true) or set `required: true`

### Current `additionalFieldsCommon` (PRESERVE AS-IS)

```typescript
const additionalFieldsCommon = {
  _rowId: { type: "number", required: false },
  deletedAt: { type: "date", required: false },
  updatedAt: { type: "date", required: false },
  createdAt: { type: "date", required: false },
  createdBy: { type: "string", required: false },
  updatedBy: { type: "string", required: false },
  deletedBy: { type: "string", required: false },
  version: { type: "number", required: false },
  source: { type: "string", required: false },
} as const;
```

---

## Phase 0: Discovery & Documentation Gathering

**MANDATORY PREREQUISITE**: Phase 0 MUST be completed before any other phase. It determines which fields are plugin-managed vs require explicit configuration.

### Task 0.1: Research Plugin Schema Support

For EACH plugin in the imports of Options.ts, analyze the source code in `tmp/better-auth/`:

**Primary Research Method (Source Code Analysis):**
```bash
# Step 1: Find plugin location
ls tmp/better-auth/packages/<plugin>/src/types.ts 2>/dev/null || \
ls tmp/better-auth/packages/better-auth/src/plugins/<plugin>/types.ts

# Step 2: Check for InferOptionSchema (indicates partial support)
grep "InferOptionSchema" <types.ts path>

# Step 3: Check for additionalFields in schema type
grep -A20 "schema?" <types.ts path> | grep "additionalFields"

# Step 4: Document support level
```

**Fallback Method (Web Search):**
```
"Better Auth <plugin-name> plugin schema additionalFields site:better-auth.com"
"Better Auth <plugin-name> plugin configuration site:github.com/better-auth"
```

**Plugins to research:**
1. `username` - extends User model
2. `twoFactor` - creates TwoFactor model
3. `stripe` - creates Subscription model
4. `siwe` - creates WalletAddress model
5. `sso` - creates SsoProvider, ScimProvider models
6. `passkey` - creates Passkey model
7. `phoneNumber` - extends User model
8. `organization` - creates/extends Organization, Member, Team, TeamMember, Invitation, OrganizationRole
9. `openAPI` - reads all model configs
10. `oneTimeToken` - may have token model
11. `oidcProvider` - creates OauthConsent, OauthAccessToken, OauthApplication
12. `jwt` - creates Jwks model
13. `deviceAuthorization` - creates DeviceCode model
14. `apiKey` - creates ApiKey model
15. `anonymous` - extends User model
16. `admin` - extends User model

### Task 0.2: Create Plugin-to-Model Mapping

Document which plugins affect which models:

```markdown
| Plugin | Models Created | Models Extended | Schema Config Key |
|--------|---------------|-----------------|-------------------|
| username | - | User (username, displayUsername) | N/A (auto) |
| twoFactor | TwoFactor | - | `twoFactor.schema` |
| passkey | Passkey | - | `passkey.schema` |
| ... | ... | ... | ... |
```

### Task 0.3: Output Discovery Document

Create `outputs/plugin-model-mapping.md` with:
- Plugin import sources
- Models each plugin creates/extends
- Configuration keys for schemas
- Schema support level (Full/Partial/Minimal)
- Better Auth documentation excerpts

### Task 0.4: Identify Plugin-Managed Fields

**CRITICAL**: Before Phase 1, document which user fields are managed by plugins:

| Plugin | User Fields It Manages |
|--------|----------------------|
| username | `username`, `displayUsername` |
| phoneNumber | `phoneNumber`, `phoneNumberVerified` |
| twoFactor | `twoFactorEnabled` |
| admin | `banned`, `banReason`, `banExpires`, `role` |
| anonymous | `isAnonymous` |

**These fields should NOT be added to user.additionalFields** - they are managed automatically by their respective plugins.

---

### Phase 0 Completion Gate

**Before proceeding to Phase 1, verify:**
- [ ] `outputs/plugin-model-mapping.md` exists with all 16 plugins documented
- [ ] Each plugin's schema support level (Full/Partial/Minimal) is recorded
- [ ] Plugin-managed user fields are identified
- [ ] REFLECTION_LOG.md Phase 0 section is updated

---

## Phase 1: Core Models (User, Session, Account)

### Task 1.1: Align User Model

**Drizzle source**: `packages/shared/tables/src/tables/user.table.ts`

**Current additional columns (beyond Table.make defaults):**
```typescript
// From user.table.ts
name: pg.text("name").notNull(),
email: pg.text("email").notNull().unique(),
emailVerified: pg.boolean("email_verified").default(false).notNull(),
uploadLimit: pg.integer("upload_limit").notNull().default(User.USER_UPLOAD_LIMIT),
image: pg.text("image"),
role: userRolePgEnum("role").notNull().default(SharedEntities.User.UserRole.Enum.user),
banned: pg.boolean("banned").notNull().default(false),
banReason: pg.text("ban_reason"),
banExpires: datetime("ban_expires"),
isAnonymous: pg.boolean("is_anonymous").notNull().default(false),
phoneNumber: pg.text("phone_number").unique(),
phoneNumberVerified: pg.boolean("phone_number_verified").notNull().default(false),
twoFactorEnabled: pg.boolean("two_factor_enabled").notNull().default(false),
username: pg.text("username").unique(),
displayUsername: pg.text("display_username"),
stripeCustomerId: pg.text("stripe_customer_id"),
lastLoginMethod: pg.text("last_login_method"),
```

**Required Options.ts user.additionalFields:**

**IMPORTANT**: First verify which fields are plugin-managed (Phase 0). Only add fields NOT managed by plugins.

```typescript
user: {
  additionalFields: {
    // ALWAYS add (not managed by any plugin):
    uploadLimit: { type: "number", required: false },
    stripeCustomerId: { type: "string", required: false },
    lastLoginMethod: { type: "string", required: false },

    // VERIFY: These may be managed by their respective plugins:
    // - role, banned, banReason, banExpires → admin plugin
    // - isAnonymous → anonymous plugin
    // - twoFactorEnabled → twoFactor plugin
    // - phoneNumber, phoneNumberVerified → phoneNumber plugin
    // - username, displayUsername → username plugin

    // If NOT plugin-managed, add these:
    // role: { type: "string", required: false },
    // isAnonymous: { type: "boolean", required: false },
    // twoFactorEnabled: { type: "boolean", required: false },
    // phoneNumberVerified: { type: "boolean", required: false },
    // banned: { type: "boolean", required: false },
    // banReason: { type: "string", required: false },
    // banExpires: { type: "date", required: false },
    // username: { type: "string", required: false },
    // displayUsername: { type: "string", required: false },
    // phoneNumber: { type: "string", required: false },

    ...additionalFieldsCommon,
  },
}
```

**Note**: `name`, `email`, `emailVerified`, `image` are Better Auth core fields - do NOT add to additionalFields.

### Task 1.2: Align Session Model

**Drizzle source**: `packages/shared/tables/src/tables/session.table.ts`

**Current additional columns (beyond Table.make defaults):**
```typescript
expiresAt: datetime("expires_at").notNull(),
token: pg.text("token").notNull().unique(),
ipAddress: pg.text("ip_address"),
userAgent: pg.text("user_agent"),
userId: pg.text("user_id")...,
impersonatedBy: pg.text("impersonated_by")...,
activeOrganizationId: pg.text("active_organization_id")...,
activeTeamId: pg.text("active_team_id")...,
```

**Required Options.ts session.additionalFields:**
```typescript
session: {
  additionalFields: {
    activeTeamId: { type: "string", required: false },
    activeOrganizationId: { type: "string", required: false },
    impersonatedBy: { type: "string", required: false },
    ...additionalFieldsCommon,
  },
}
```

**Note**: `expiresAt`, `token`, `ipAddress`, `userAgent`, `userId` are Better Auth core fields.

### Task 1.3: Align Account Model

**Drizzle source**: `packages/iam/tables/src/tables/account.table.ts`

**Current additional columns (beyond Table.make defaults):**
```typescript
accountId: pg.text("account_id").notNull(),
providerId: pg.text("provider_id").notNull(),
userId: pg.text("user_id")...,
accessToken: pg.text("access_token"),
refreshToken: pg.text("refresh_token"),
idToken: pg.text("id_token"),
accessTokenExpiresAt: datetime("access_token_expires_at"),
refreshTokenExpiresAt: datetime("refresh_token_expires_at"),
scope: pg.text("scope"),
password: pg.text("password"),
```

**Required Options.ts account.additionalFields:**
The account model columns are mostly Better Auth core fields. Verify with docs which are core vs custom.

```typescript
account: {
  modelName: IamEntityIds.AccountId.tableName,
  additionalFields: additionalFieldsCommon,
  // ...other config
}
```

### Verification Commands (Phase 1)

```bash
bun run check --filter @beep/iam-server
bun run build --filter @beep/iam-server
bun run lint:fix --filter @beep/iam-server
```

---

## Phase 2: Organization Models

### Task 2.1: Align Organization Model

**Drizzle source**: `packages/shared/tables/src/tables/organization.table.ts`

**Current additional columns:**
```typescript
name: pg.text("name").notNull(),
slug: pg.text("slug").notNull().unique(),
logo: pg.text("logo"),
metadata: pg.text("metadata"),
type: organizationTypePgEnum("type")...,
ownerUserId: pg.text("owner_user_id")...,
isPersonal: pg.boolean("is_personal")...,
maxMembers: pg.integer("max_members"),
features: pg.jsonb("features")...,
settings: pg.jsonb("settings")...,
subscriptionTier: subscriptionTierPgEnum("subscription_tier")...,
subscriptionStatus: subscriptionStatusPgEnum("subscription_status")...,
```

**Required organization plugin schema config:**

**IMPORTANT**: Fields with `.notNull()` in Drizzle MUST have `required: true` (or omit since it defaults to true).

```typescript
organization({
  schema: {
    organization: {
      modelName: SharedEntityIds.OrganizationId.tableName,
      additionalFields: {
        // notNull columns → required: true (can omit since it's the default)
        type: { type: "string", defaultValue: "individual" },  // notNull().default()
        ownerUserId: { type: "string" },                       // notNull()
        isPersonal: { type: "boolean" },                       // notNull().default()
        subscriptionTier: { type: "string", defaultValue: "free" },    // notNull().default()
        subscriptionStatus: { type: "string", defaultValue: "active" }, // notNull().default()
        // Nullable columns → required: false (MUST be explicit)
        maxMembers: { type: "number", required: false },
        features: { type: "json", required: false },
        settings: { type: "json", required: false },
        ...additionalFieldsCommon,
      },
    },
    // ... other schemas
  },
})
```

**Note**: `name`, `slug`, `logo`, `metadata` are Better Auth organization core fields.

### Task 2.2: Align Member Model

**Drizzle source**: `packages/iam/tables/src/tables/member.table.ts`

**Uses OrgTable.make** - includes `organizationId` automatically.

**Current additional columns:**
```typescript
userId: pg.text("user_id")...,
role: memberRoleEnum("role")...,
status: memberStatusEnum("status")...,
invitedBy: pg.text("invited_by"),
invitedAt: datetime("invited_at"),
joinedAt: datetime("joined_at"),
lastActiveAt: datetime("last_active_at"),
permissions: pg.text("permissions"),
```

**Required member schema config:**
```typescript
member: {
  modelName: IamEntityIds.MemberId.tableName,
  additionalFields: {
    status: { type: "string", required: true, defaultValue: "active" },
    invitedBy: { type: "string", required: false },
    invitedAt: { type: "date", required: false },
    joinedAt: { type: "date", required: false },
    lastActiveAt: { type: "date", required: false },
    permissions: { type: "string", required: false },
    ...additionalFieldsCommon,
  },
},
```

**Note**: `userId`, `role`, `organizationId` are Better Auth member core fields.

### Task 2.3: Align Team Model

**Drizzle source**: `packages/shared/tables/src/tables/team.table.ts`

Read this file and document its columns, then update team schema config.

### Task 2.4: Align TeamMember Model

**Drizzle source**: `packages/iam/tables/src/tables/teamMember.table.ts`

Read this file and document its columns, then update teamMember schema config.

### Task 2.5: Align Invitation Model

**Drizzle source**: `packages/iam/tables/src/tables/invitation.table.ts`

Read this file and document its columns, then update invitation schema config.

### Task 2.6: Align OrganizationRole Model

**Drizzle source**: `packages/iam/tables/src/tables/organizationRole.table.ts`

Read this file and document its columns, then update organizationRole schema config.

### Task 2.7: Align Verification Model

**Drizzle source**: `packages/iam/tables/src/tables/verification.table.ts`

Read this file and document its columns, then update verification schema config.

---

## Phase 3: Authentication Plugin Models

### Task 3.1: Research & Align TwoFactor Model

1. Analyze twoFactor plugin source: `tmp/better-auth/packages/better-auth/src/plugins/two-factor/`
2. Check schema support: `grep -A20 "schema?" tmp/better-auth/packages/better-auth/src/plugins/two-factor/index.ts`
3. Read `packages/iam/tables/src/tables/twoFactor.table.ts`
4. Determine support level (likely Partial - modelName + fields only)
5. Configure modelName if supported:

```typescript
twoFactor({
  schema: {
    twoFactor: {
      modelName: IamEntityIds.TwoFactorId.tableName,
      additionalFields: {
        // Add custom columns from twoFactor.table.ts
        ...additionalFieldsCommon,
      },
    },
  },
})
```

### Task 3.2: Research & Align Passkey Model

1. Analyze passkey plugin source: `tmp/better-auth/packages/passkey/src/`
2. Check schema support: `grep -A20 "schema?" tmp/better-auth/packages/passkey/src/index.ts`
3. Read `packages/iam/tables/src/tables/passkey.table.ts`
4. Determine support level (Partial - modelName + fields only)
5. Configure modelName if supported (additionalFields NOT available)

### Task 3.3: Research & Align ApiKey Model

1. Analyze apiKey plugin source: `tmp/better-auth/packages/better-auth/src/plugins/api-key/`
2. Check schema support: `grep -A20 "schema?" tmp/better-auth/packages/better-auth/src/plugins/api-key/index.ts`
3. Read `packages/iam/tables/src/tables/apiKey.table.ts`
4. Determine support level (Partial - modelName + fields only)
5. Configure modelName if supported (additionalFields NOT available)

---

## Phase 4: Integration Plugin Models

### Task 4.1: Research & Align Stripe/Subscription Model

1. Analyze stripe plugin source: `tmp/better-auth/packages/stripe/src/`
2. Check schema support: `grep -A20 "schema?" tmp/better-auth/packages/stripe/src/index.ts`
3. Read `packages/iam/tables/src/tables/subscription.table.ts`
4. Determine support level and configure accordingly

### Task 4.2: Research & Align SSO Models

**Support Level: MINIMAL** (SSO) / **NONE** (SCIM)

1. Analyze SSO plugin source: `tmp/better-auth/packages/sso/src/`
2. Check schema in index.ts (NOT types.ts): `grep -A30 "schema:" tmp/better-auth/packages/sso/src/index.ts`
3. Read `packages/iam/tables/src/tables/ssoProvider.table.ts`
4. Read `packages/iam/tables/src/tables/scimProvider.table.ts`
5. SSO supports: `modelName` + `fields` (for column name mapping) - NO additionalFields
6. SCIM has hardcoded schema - NO configuration options
7. Configure SSO modelName and field mappings only

### Task 4.3: Research & Align SIWE/WalletAddress Model

**Support Level: NONE** (hardcoded schema)

1. Analyze SIWE plugin source: `tmp/better-auth/packages/better-auth/src/plugins/siwe/`
2. Read `packages/iam/tables/src/tables/walletAddress.table.ts`
3. SIWE has hardcoded schema - NO configuration options
4. Document as limitation: extra Drizzle columns work at DB level but not in OpenAPI

### Task 4.4: Research & Align OIDC Models

1. Analyze oidcProvider plugin source: `tmp/better-auth/packages/better-auth/src/plugins/oidc-provider/`
2. Check schema support: `grep -A20 "schema?" tmp/better-auth/packages/better-auth/src/plugins/oidc-provider/index.ts`
3. Current partial config exists - verify completeness
4. Read OAuth table files and verify modelName alignment

### Task 4.5: Research & Align DeviceCode Model

1. Analyze deviceAuthorization plugin source: `tmp/better-auth/packages/better-auth/src/plugins/device-authorization/`
2. Check schema support: `grep -A20 "schema?" tmp/better-auth/packages/better-auth/src/plugins/device-authorization/index.ts`
3. Read `packages/iam/tables/src/tables/deviceCodes.table.ts`
4. Determine support level and configure accordingly

---

## Phase 5: Verification & Client Alignment

### Task 5.1: Run Full Verification

```bash
# Server package
bun run check --filter @beep/iam-server
bun run build --filter @beep/iam-server
bun run lint:fix --filter @beep/iam-server

# Client package (types should infer correctly)
bun run check --filter @beep/iam-client
bun run build --filter @beep/iam-client
```

### Task 5.2: Verify OpenAPI Output

1. Start dev server: `bun run dev`
2. Navigate to `/api/v1/auth/reference`
3. Verify all custom fields appear in model documentation
4. Document any discrepancies

### Task 5.3: Update Client if Needed

If client types need adjustment for `inferOrgAdditionalFields<Auth.Auth>()`:

1. Review `packages/iam/client/src/adapters/better-auth/client.ts`
2. Ensure client plugins match server plugins
3. Update organizationClient schema inference if needed

### Task 5.4: Final Reflection

1. Document all changes made
2. Note any plugins that don't support schema configuration
3. Update REFLECTION_LOG.md with final learnings

---

## Common Patterns Discovered

### Pattern: Converting Drizzle Column to Better Auth additionalFields

```typescript
// Drizzle column
someField: pg.text("some_field").notNull().default("value")

// Better Auth additionalFields entry
someField: { type: "string", required: true, defaultValue: "value" }
```

### Pattern: Enum Columns

```typescript
// Drizzle enum column
role: myPgEnum("role").notNull().default("member")

// Better Auth additionalFields (use string type)
role: { type: "string", required: true, defaultValue: "member" }
```

### Pattern: JSON/JSONB Columns

```typescript
// Drizzle jsonb column
metadata: pg.jsonb("metadata").$type<SomeType>()

// Better Auth additionalFields
metadata: { type: "json", required: false }
```

### Pattern: Nullable vs Required

**CRITICAL**: Better Auth's `required` defaults to `true`, not `false`!

```typescript
// Drizzle nullable (no .notNull())
optionalField: pg.text("optional_field")
// → { type: "string", required: false }  // MUST explicitly set required: false!

// Drizzle required (.notNull())
requiredField: pg.text("required_field").notNull()
// → { type: "string" }  // required defaults to true, can omit
// OR explicit: { type: "string", required: true }

// Drizzle required with default (.notNull().default())
defaultedField: pg.text("defaulted_field").notNull().default("val")
// → { type: "string", defaultValue: "val" }  // required=true by default
// If the field can be omitted during insert (DB provides default):
// → { type: "string", required: false, defaultValue: "val" }
```

### Pattern: Additional DBFieldAttributeConfig Options

```typescript
// Field not returned in API responses (e.g., internal fields)
internalField: { type: "string", returned: false }

// Field not accepted on create (computed/system fields)
computedField: { type: "string", input: false }

// Auto-update on record modification
updatedAt: { type: "date", onUpdate: () => new Date() }

// Foreign key with cascade delete
userId: {
  type: "string",
  references: { model: "user", field: "id", onDelete: "cascade" }
}

// Unique constraint
email: { type: "string", unique: true }

// Indexed for query performance
slug: { type: "string", index: true }

// Custom database column name (snake_case)
createdAt: { type: "date", fieldName: "created_at" }
```

---

## Reflection Protocol

After EACH phase completion:

1. **Update REFLECTION_LOG.md** with:
   - What worked well
   - What didn't work / unexpected findings
   - Plugin documentation gaps found
   - Patterns extracted for reuse

2. **Create handoff document** at `handoffs/HANDOFF_P<N+1>.md`:
   - Summary of completed work
   - Remaining work itemized
   - Refined prompts for next phase

3. **Update this document** if new patterns discovered

---

## Verification Checklist

- [ ] Phase 0: Plugin documentation gathered
- [ ] Phase 1: User, Session, Account aligned
- [ ] Phase 2: Organization models aligned
- [ ] Phase 3: Authentication plugins aligned
- [ ] Phase 4: Integration plugins aligned
- [ ] Phase 5: Full verification passed
- [ ] OpenAPI documentation accurate
- [ ] Client types infer correctly
- [ ] REFLECTION_LOG.md complete
