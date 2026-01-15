# Better Auth Config Alignment — P3 Handoff (Authentication Plugin Models)

> Phase 3: Verify and document authentication plugin model configurations

---

## Phase 2 Summary

Phase 2 is complete. Changes made to `Options.ts`:

### Team additionalFields — Added 1 missing field:
- `slug` (unique team slug) - nullable string, `required: false` with NOTE about hook generation

### Invitation additionalFields — Added 1 missing field:
- `teamId` (optional team-specific invitation) - nullable string

### OrganizationRole additionalFields — Added 2 missing fields:
- `role` (role name) - required string
- `permission` (permission string) - required string

### TeamMember — Documented limitation:
- Better Auth organization plugin does NOT support additionalFields for teamMember
- OrgTable.make defaults exist in DB but are not exposed via API
- Removed invalid `additionalFields: additionalFieldsCommon` and added documentation comment

### Models verified complete (no changes needed):
- Organization — all custom fields already configured
- Member — all custom fields already configured
- Verification — only Table.make defaults (already in `additionalFieldsCommon`)

### Verification:
- `bun run check --filter @beep/iam-server` ✅ Passed
- `bun run build --filter @beep/iam-server` ✅ Passed

---

## P3 Objective

Verify and document authentication plugin model configurations. These plugins have **PARTIAL** schema support (modelName + fields only, NO additionalFields).

Target models:
1. **twoFactor** — Two-factor authentication secrets
2. **passkey** — WebAuthn passkey credentials
3. **apiKey** — API key management

---

## Important: Plugin Support Level

From Phase 0 research, these plugins use `InferOptionSchema<T>` which means:
- ✅ `modelName` — rename the table
- ✅ `fields` — rename columns
- ❌ `additionalFields` — NOT SUPPORTED

Any custom columns in Drizzle beyond Better Auth core fields will:
- Work at the database level
- NOT appear in Better Auth's OpenAPI documentation
- NOT be validated/transformed by Better Auth

---

## Files to Know

| File | Purpose |
|------|---------|
| `packages/iam/server/src/adapters/better-auth/Options.ts` | Primary verification target |
| `packages/iam/tables/src/tables/twoFactor.table.ts` | TwoFactor Drizzle schema |
| `packages/iam/tables/src/tables/passkey.table.ts` | Passkey Drizzle schema |
| `packages/iam/tables/src/tables/apiKey.table.ts` | ApiKey Drizzle schema |
| `specs/better-auth-config-alignment/outputs/core-fields.md` | Better Auth core fields reference |
| `specs/better-auth-config-alignment/outputs/plugin-schema-support.md` | Plugin support levels |

---

## P3 Tasks

### Task 3.1: Read TwoFactor Table Schema

Read `packages/iam/tables/src/tables/twoFactor.table.ts` and identify:
- Columns that are Better Auth plugin core fields
- Custom columns added by beep-effect (Table.make defaults)

### Task 3.2: Read Passkey Table Schema

Read `packages/iam/tables/src/tables/passkey.table.ts` and identify:
- Columns that are Better Auth plugin core fields
- Custom columns added by beep-effect

### Task 3.3: Read ApiKey Table Schema

Read `packages/iam/tables/src/tables/apiKey.table.ts` and identify:
- Columns that are Better Auth plugin core fields
- Custom columns added by beep-effect

### Task 3.4: Verify Current Plugin Configurations

Read the relevant sections in `Options.ts` for:
- `twoFactor({...})`
- `passkey({...})`
- `apiKey({...})`

Verify that configurations only use supported options (modelName, fields).

### Task 3.5: Document Gaps

For each model, document:
- Which custom columns exist in Drizzle
- Which cannot be reflected in Better Auth API (all additionalFields-equivalent)
- Whether current configuration is correct

### Task 3.6: Update Options.ts Documentation

Add documentation comments to each plugin configuration explaining:
- What schema options ARE supported
- What custom columns exist but cannot be exposed via API
- Reference to Drizzle table file

### Task 3.7: Verify Changes

```bash
bun run check --filter @beep/iam-server
bun run build --filter @beep/iam-server
```

---

## Better Auth Plugin Core Fields Reference

### TwoFactor Core Fields (from source code analysis)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `secret` | string | ✅ | TOTP secret |
| `backupCodes` | string | ✅ | JSON array of backup codes |
| `userId` | string | ✅ | FK to user |

### Passkey Core Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `name` | string | ❌ | User-assigned name |
| `publicKey` | string | ✅ | WebAuthn public key |
| `userId` | string | ✅ | FK to user |
| `webauthnUserID` | string | ✅ | WebAuthn user handle |
| `counter` | number | ✅ | Signature counter |
| `deviceType` | string | ❌ | Device type |
| `backedUp` | boolean | ❌ | Backup status |
| `transports` | string | ❌ | Supported transports |
| `createdAt` | date | ❌ | Created timestamp |

### ApiKey Core Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Primary key |
| `name` | string | ❌ | Key name |
| `start` | string | ✅ | Key prefix (first chars) |
| `prefix` | string | ❌ | Optional prefix |
| `hashedSecret` | string | ✅ | Hashed key value |
| `createdAt` | date | ✅ | |
| `updatedAt` | date | ❌ | |
| `expiresAt` | date | ❌ | Optional expiration |
| `lastUsedAt` | date | ❌ | Last usage timestamp |
| `userId` | string | ✅ | FK to user |
| `refillInterval` | string | ❌ | Rate limit interval |
| `refillAmount` | number | ❌ | Refill amount |
| `lastRefillAt` | date | ❌ | Last refill time |
| `remaining` | number | ❌ | Remaining calls |

---

## Expected Output Pattern

For each plugin, add documentation like:

```typescript
passkey({
  rpID: serverEnv.app.env === EnvValue.Enum.dev ? "localhost" : serverEnv.app.domain,
  rpName: `${serverEnv.app.name} Auth`,
  // Schema configuration: PARTIAL support (modelName + fields only)
  // - additionalFields NOT supported by this plugin
  // - Table.make defaults (_rowId, deletedAt, version, etc.) exist in DB
  //   but are not exposed via Better Auth API
  // See: packages/iam/tables/src/tables/passkey.table.ts
}),
```

---

## P3 Completion Checklist

- [ ] TwoFactor table schema read and analyzed
- [ ] Passkey table schema read and analyzed
- [ ] ApiKey table schema read and analyzed
- [ ] Current Options.ts configurations verified
- [ ] Documentation comments added to each plugin
- [ ] No invalid configuration options present
- [ ] `bun run check` passes
- [ ] `bun run build` passes
- [ ] REFLECTION_LOG.md Phase 3 section updated

---

## P3 → P4 Handoff

After completing P3:
1. Update `REFLECTION_LOG.md` Phase 3 section
2. **Create `handoffs/HANDOFF_P4.md`** for integration plugin models (Phase 4)
3. P4 will focus on: stripe, sso, siwe, jwt, oidcProvider, deviceAuthorization models

---

## Orchestrator Prompt for P3

```markdown
# P3 Orchestrator: Authentication Plugin Models Documentation

## Your Task
Verify and document Better Auth authentication plugin model configurations. These plugins have PARTIAL schema support only.

## Prerequisite Check
Verify Phase 2 is complete:
- Team additionalFields updated with slug
- Invitation additionalFields updated with teamId
- OrganizationRole additionalFields updated with role, permission
- TeamMember limitation documented

## Research Phase
1. Read each Drizzle table schema:
   - twoFactor.table.ts
   - passkey.table.ts
   - apiKey.table.ts
2. Read current plugin configurations in Options.ts
3. Compare against plugin core fields reference

## Documentation Phase
For each plugin:
1. Identify custom columns that CANNOT be exposed via API
2. Verify configuration only uses supported options
3. Add documentation comments explaining:
   - Supported schema options (PARTIAL: modelName + fields)
   - Custom columns that exist but aren't API-exposed
   - Reference to Drizzle table file

## Verification Phase
1. Run `bun run check --filter @beep/iam-server`
2. Run `bun run build --filter @beep/iam-server`

## Output Required
- Updated Options.ts with documentation comments for PARTIAL-support plugins
- Gap analysis documented in REFLECTION_LOG.md
- handoffs/HANDOFF_P4.md created for next phase

## Key Constraints
- DO NOT add additionalFields to PARTIAL-support plugins (will be ignored)
- DO document which custom columns exist but cannot be API-exposed
- Focus on documentation, not configuration changes
```
