# Database Patterns

Comprehensive guide to database design patterns in the beep-effect codebase.

## Table of Contents

- [Foreign Key Design](#foreign-key-design)
- [Table.make vs OrgTable.make](#tablemake-vs-orgtablemake)
- [Index Naming Conventions](#index-naming-conventions)
- [Pre-flight Verification Patterns](#pre-flight-verification-patterns)
- [Turborepo Verification Cascading](#turborepo-verification-cascading)

---

## Foreign Key Design

### Choosing FK Target: Internal ID vs Public Identifier

When creating foreign key relationships, choose the appropriate target column based on the relationship's scope and purpose.

#### Internal References (Same Bounded Context)

Reference the internal `id` column (UUID primary key) for relationships within the same bounded context.

```typescript
// CORRECT - Internal reference
export const memberTable = Table.make("member", {
  userId: SharedEntityIds.UserId,  // References user.id (internal UUID)
  organizationId: SharedEntityIds.OrganizationId,  // References organization.id
  role: S.Literal("admin", "member", "viewer"),
});
```

**Characteristics:**
- Strong referential integrity
- Immutable references (UUIDs don't change)
- Performance optimized (indexed PKs)
- Encapsulation (internal implementation detail)

#### External/Interop References (Cross-System or Standards-Based)

Reference the public identifier column for cross-system relationships or standards-based protocols.

```typescript
// CORRECT - External reference for OAuth tokens
export const oauthAccessTokenTable = Table.make("oauth_access_token", {
  clientId: S.String,  // References oauthClient.clientId (public OAuth identifier)
  userId: SharedEntityIds.UserId,  // References user.id (internal reference)
  token: BS.FieldSensitiveOptionOmittable(S.String),
});
```

**Characteristics:**
- Follows external protocol requirements (e.g., OAuth RFC 6749 defines `client_id` as the identifier)
- Public API stability (clientId is stable across deploys)
- Interoperability (external systems use this identifier)

#### Decision Criteria

Ask these questions when designing FK relationships:

| Question | Internal ID | Public Identifier |
|----------|-------------|-------------------|
| Will external systems reference this? | ❌ | ✅ |
| Is this a standards-based protocol (OAuth, OIDC, SCIM)? | ❌ | ✅ |
| Is this purely internal to our bounded context? | ✅ | ❌ |
| Do we need immutable references? | ✅ | ⚠️ (depends) |
| Is this performance-critical? | ✅ | ⚠️ (depends on index) |

**Examples:**

```typescript
// Internal bounded context - use UUID
export const teamMemberTable = Table.make("team_member", {
  teamId: IamEntityIds.TeamId,      // Internal UUID reference
  userId: SharedEntityIds.UserId,   // Internal UUID reference
});

// OAuth protocol - use public identifier
export const oauthConsentTable = Table.make("oauth_consent", {
  clientId: S.String,               // Public OAuth client_id (per RFC 6749)
  userId: SharedEntityIds.UserId,   // Internal UUID reference
});

// Mixed - internal user, external API
export const apiKeyTable = Table.make("api_key", {
  userId: SharedEntityIds.UserId,   // Internal reference
  key: S.String,                    // Public API key identifier
});
```

---

## Table.make vs OrgTable.make

Choose the appropriate table factory based on data scoping requirements.

### Table.make (User-Scoped or Global)

Use `Table.make` for tables that:
- Are scoped to individual users
- Have no organization context
- Are global system tables

```typescript
import { Table } from "@beep/iam-tables";

// User-scoped data
export const passkeyTable = Table.make("passkey", {
  userId: SharedEntityIds.UserId,
  credentialId: S.String,
  publicKey: S.String,
});

// Global system data
export const ratelimitTable = Table.make("ratelimit", {
  key: S.String,
  count: S.Number,
  expiresAt: S.Date,
});
```

### OrgTable.make (Organization-Scoped)

Use `OrgTable.make` for tables that:
- Are scoped to organizations
- Require organization-level isolation
- Need organization-based queries

```typescript
import { OrgTable } from "@beep/iam-tables";

// Organization-scoped data
export const invitationTable = OrgTable.make("invitation", {
  email: BS.EmailBase,
  inviterId: SharedEntityIds.UserId,
  role: S.Literal("admin", "member"),
});

// Multi-tenant team data
export const teamTable = OrgTable.make("team", {
  name: S.String,
  ownerId: SharedEntityIds.UserId,
});
```

**What OrgTable.make Adds:**

```typescript
// OrgTable.make automatically includes:
{
  organizationId: SharedEntityIds.OrganizationId,  // Added automatically
  // ... your custom fields
}
```

### Selection Decision Tree

```
Is this data scoped to organizations?
├─ YES → Is every row associated with exactly one organization?
│  ├─ YES → Use OrgTable.make
│  └─ NO → Use Table.make with optional organizationId field
└─ NO → Is this user-scoped or global?
   ├─ User-scoped → Use Table.make
   └─ Global → Use Table.make
```

**Examples:**

```typescript
// User-scoped (no organization context needed)
export const twoFactorTable = Table.make("two_factor", {
  userId: SharedEntityIds.UserId,
  secret: BS.FieldSensitiveOptionOmittable(S.String),
  backupCodes: S.Array(S.String),
});

// Organization-scoped (always belongs to an org)
export const memberTable = OrgTable.make("member", {
  userId: SharedEntityIds.UserId,
  role: S.Literal("admin", "member", "viewer"),
  // organizationId is automatically added
});

// Mixed scoping (optional organization context)
export const subscriptionTable = Table.make("subscription", {
  userId: SharedEntityIds.UserId,
  organizationId: S.optional(SharedEntityIds.OrganizationId),  // Optional!
  plan: S.Literal("free", "pro", "enterprise"),
});
```

---

## Index Naming Conventions

Follow consistent naming patterns for database indexes.

### Primary Key Indexes

```sql
-- Automatically created, follows pattern: {table_name}_pkey
CREATE UNIQUE INDEX user_pkey ON "user"(id);
```

### Foreign Key Indexes

```sql
-- Pattern: idx_{table}_{column}
CREATE INDEX idx_member_user_id ON member(user_id);
CREATE INDEX idx_member_organization_id ON member(organization_id);
```

### Composite Indexes

```sql
-- Pattern: idx_{table}_{col1}_{col2}
CREATE INDEX idx_oauth_access_token_client_id_user_id
  ON oauth_access_token(client_id, user_id);
```

### Unique Constraints

```sql
-- Pattern: unq_{table}_{column} or {table}_{column}_unique
CREATE UNIQUE INDEX unq_oauth_client_client_id
  ON oauth_client(client_id);
```

### Partial Indexes

```sql
-- Pattern: idx_{table}_{column}_{condition}
CREATE INDEX idx_invitation_email_pending
  ON invitation(email)
  WHERE status = 'pending';
```

---

## Pre-flight Verification Patterns

Standard verification commands to run before starting multi-phase work.

### Phase Pre-flight Checklist

Before starting any phase of implementation:

#### 1. Existence Check (File/Symbol Exists)

```bash
# Check if a symbol exists in a file
grep -q "SymbolName" path/to/file.ts && echo "✓ Ready" || echo "✗ STOP: Symbol not found"

# Check if a file exists
test -f path/to/file.ts && echo "✓ Ready" || echo "✗ STOP: File not found"

# Check if an export exists
grep -q "export.*SymbolName" path/to/file.ts && echo "✓ Ready" || echo "✗ STOP: Export not found"
```

#### 2. Type Check (Upstream Compiles)

```bash
# Check specific package compiles
bun run check --filter @beep/upstream-package 2>&1 | tail -5

# Check multiple related packages
bun run check --filter @beep/iam-domain --filter @beep/iam-tables 2>&1 | tail -10
```

#### 3. Syntax Check (Isolated File Check)

```bash
# Isolated TypeScript syntax check (no dependency resolution)
bun tsc --noEmit path/to/file.ts 2>&1 | head -20

# Check multiple files
bun tsc --noEmit src/**/*.ts 2>&1 | head -30
```

#### 4. Dependency Graph Check

```bash
# Verify package dependencies are correct
cat package.json | grep -A 10 '"dependencies"'
cat package.json | grep -A 10 '"devDependencies"'
```

#### 5. Database Migration Check

```bash
# Verify migration files exist
ls -la packages/_internal/db-admin/drizzle/*.sql | tail -5

# Check migration journal
cat packages/_internal/db-admin/drizzle/meta/_journal.json | tail -20
```

### Example Pre-flight Script

```bash
#!/usr/bin/env bash
# Pre-flight check for OAuth Provider migration Phase 2

echo "=== Phase 2 Pre-flight Checks ==="

echo -n "1. OAuthClient entity exists: "
grep -q "export const OAuthClient" packages/iam/domain/src/entities/OAuthClient/OAuthClient.model.ts && echo "✓" || echo "✗ STOP"

echo -n "2. Domain package compiles: "
bun run check --filter @beep/iam-domain &>/dev/null && echo "✓" || echo "✗ STOP"

echo -n "3. Table schema ready: "
test -f packages/iam/tables/src/tables/oauthClient.table.ts && echo "✓" || echo "✗ STOP"

echo -n "4. Migration generated: "
ls packages/_internal/db-admin/drizzle/*oauth*.sql &>/dev/null && echo "✓" || echo "✗ STOP"

echo "=== Pre-flight Complete ==="
```

---

## Turborepo Verification Cascading

Understanding how Turborepo's `--filter` flag cascades through dependencies.

### Cascading Behavior

When you run `bun run check --filter @beep/package`, Turborepo:

1. Resolves ALL dependencies of `@beep/package`
2. Type-checks dependencies FIRST (in dependency order)
3. Type-checks the target package LAST
4. Reports errors from ANY package in the dependency chain

**Example:**

```json
// package.json dependencies
{
  "name": "@beep/iam-tables",
  "dependencies": {
    "@beep/iam-domain": "workspace:*",
    "@beep/shared-domain": "workspace:*"
  }
}
```

When running:
```bash
bun run check --filter @beep/iam-tables
```

Turborepo executes:
```
1. bun run check in @beep/shared-domain
2. bun run check in @beep/iam-domain
3. bun run check in @beep/iam-tables
```

**If `@beep/iam-domain` has errors**, the command fails even if `@beep/iam-tables` is correct!

### Debugging Failed Checks

When verification fails, isolate the source of errors:

#### Step 1: Identify the Failing Package

```bash
# Run check and look for package name in error output
bun run check --filter @beep/iam-tables 2>&1 | grep "error TS"
```

Error output shows package path:
```
packages/iam/domain/src/entities/OAuthClient/OAuthClient.model.ts(42,5): error TS2322
                    ^^^^^^^ This is the failing package
```

#### Step 2: Isolate the Error

```bash
# Check if error is in upstream dependency
bun run check --filter @beep/iam-domain 2>&1 | tail -20

# Or use isolated syntax check (no dependency resolution)
bun tsc --noEmit packages/iam/tables/src/tables/oauthClient.table.ts 2>&1 | head -20
```

#### Step 3: Fix Upstream First

Always fix errors in dependency order:
```
1. Fix @beep/shared-domain
2. Fix @beep/iam-domain
3. Fix @beep/iam-tables
```

### Isolated vs Cascading Verification

| Verification Type | Command | Use Case |
|-------------------|---------|----------|
| **Cascading** (includes dependencies) | `bun run check --filter @beep/package` | Pre-commit verification, CI/CD |
| **Isolated** (single file) | `bun tsc --noEmit path/to/file.ts` | Debugging specific file errors |
| **Workspace** (all packages) | `bun run check` | Final verification before PR |

### Spec Workflow Implications

When working through multi-phase specs:

1. **Phase boundaries matter**: If Phase 1 creates `@beep/iam-domain` entities and Phase 2 creates `@beep/iam-tables` schemas, Phase 2 verification will fail if Phase 1 has unresolved errors.

2. **Fix blocking errors first**: Before moving to the next phase, ensure upstream packages pass verification.

3. **Use isolated checks for debugging**: If cascading check fails, use `bun tsc --noEmit path/to/file.ts` to isolate whether the error is in the current file or upstream.

### Example Debugging Workflow

```bash
# Scenario: Phase 2 table creation fails verification

# Step 1: Attempt verification
$ bun run check --filter @beep/iam-tables
# Error: packages/iam/domain/src/entities/OAuthClient/OAuthClient.model.ts(42,5): error TS2322

# Step 2: Error is in domain package (upstream dependency), check it directly
$ bun run check --filter @beep/iam-domain
# Confirms: domain package has errors

# Step 3: Fix domain package errors
$ vim packages/iam/domain/src/entities/OAuthClient/OAuthClient.model.ts

# Step 4: Verify domain package
$ bun run check --filter @beep/iam-domain
# Success: domain package now compiles

# Step 5: Retry tables verification (should now succeed)
$ bun run check --filter @beep/iam-tables
# Success: tables package compiles
```

---

## Related Documentation

- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Effect-specific schema and type patterns
- [Package Structure](../PACKAGE_STRUCTURE.md) - Monorepo layout and slice architecture
- [Production Checklist](../PRODUCTION_CHECKLIST.md) - Pre-deployment verification steps
