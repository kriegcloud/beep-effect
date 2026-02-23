# Database Patterns

Comprehensive guide to database design patterns in the beep-effect codebase.

## Table of Contents

- [Vertical Slice Creation](#vertical-slice-creation)
- [Foreign Key Design](#foreign-key-design)
- [Table.make vs OrgTable.make](#tablemake-vs-orgtablemake)
- [Index Naming Conventions](#index-naming-conventions)
- [Pre-flight Verification Patterns](#pre-flight-verification-patterns)
- [Turborepo Verification Cascading](#turborepo-verification-cascading)

---

## Vertical Slice Creation

When creating a new vertical slice (e.g., `packages/knowledge/*`), follow this strict order to ensure domain completeness before database schema creation.

### Creation Order

```
1. Entity IDs
   ↓
2. Domain Models (complete with ALL fields)
   ↓
3. Table Definitions
   ↓
4. Type Verification (_check.ts)
   ↓
5. Repository Implementation
```

### Step-by-Step Guide

#### 1. Entity IDs (`domain/src/entity-ids/`)

Create branded IDs for each entity using `EntityId.make`.

```typescript
// packages/knowledge/domain/src/entity-ids/KnowledgeEntityIds.ts
import { EntityId } from "@beep/shared-domain";

export const KnowledgeEntityIds = {
  EmbeddingId: EntityId.make("embedding"),
  DocumentChunkId: EntityId.make("document_chunk"),
} as const;
```

Export from barrel file:
```typescript
// packages/knowledge/domain/src/entity-ids.ts
export { KnowledgeEntityIds } from "./entity-ids/KnowledgeEntityIds";
```

#### 2. Domain Models (`domain/src/entities/`)

Define `M.Class` schemas with **ALL fields the table will have**. This is critical because `_check.ts` only validates table → domain alignment, NOT domain → table completeness.

```typescript
// packages/knowledge/domain/src/entities/Embedding/Embedding.model.ts
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain";
import { KnowledgeEntityIds } from "../../entity-ids";

export class Embedding extends M.Class<Embedding>("Embedding")({
  ...makeFields(KnowledgeEntityIds.EmbeddingId, {
    // Custom fields - define ALL columns the table will have
    documentChunkId: KnowledgeEntityIds.DocumentChunkId,
    embedding: S.Array(S.Number),  // Maps to vector(768) column
    model: S.String,

    // Optional fields with defaults
    metadata: BS.FieldOptionOmittable(S.Record({ key: S.String, value: S.Unknown })),
  }),
}) {}
```

**Critical:** If you forget a field here, `_check.ts` will NOT catch it. The table may have 6 columns but the domain only 3, and verification will pass.

#### 3. Table Definitions (`tables/src/tables/`)

Use `Table.make` or `OrgTable.make` with the entity ID from step 1.

```typescript
// packages/knowledge/tables/src/tables/embedding.table.ts
import { Table } from "@beep/shared-tables/table";
import { KnowledgeEntityIds } from "@beep/knowledge-domain";
import { vector768 } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

export const embeddingTable = Table.make(KnowledgeEntityIds.EmbeddingId)(
  {
    // Column names use snake_case, TypeScript uses camelCase
    document_chunk_id: KnowledgeEntityIds.DocumentChunkId,
    embedding: vector768("embedding").notNull(),
    model: pg.text("model").notNull(),
    metadata: pg.jsonb("metadata"),
  },
  (t) => [
    pg.index("idx_embedding_chunk").on(t.document_chunk_id),
  ]
);
```

**Naming convention:** Column names are `snake_case` in Postgres, `camelCase` in TypeScript.

### Domain Model Field Mapping Reference

When defining `M.Class` domain models for database tables, choose the correct schema type based on the database column and desired TypeScript type:

| Database Column | Domain Schema | Example |
|-----------------|---------------|---------|
| `text NOT NULL` | `S.String` | `name: S.String` |
| `boolean DEFAULT false` | `BS.BoolWithDefault(false)` | `isActive: BS.BoolWithDefault(true)` |
| `text` (nullable) | `BS.FieldOptionOmittable(S.String)` | `notes: BS.FieldOptionOmittable(S.String)` |
| `vector(768)` | `S.Array(S.Number)` | `embedding: S.Array(S.Number)` |
| `text CHECK (...)` (enum) | `BS.StringLiteralKit(...)` | `class Status extends BS.StringLiteralKit("active", "inactive") {}` |
| `text` (email) | `BS.EmailBase` | `email: BS.EmailBase` |
| `timestamptz` | `BS.DateTimeUtcFromAllAcceptable` | `timestamp: BS.DateTimeUtcFromAllAcceptable` |
| `bytea` | `S.Uint8Array` | `data: S.Uint8Array` |
| `jsonb` | `S.Record({ key: S.String, value: S.Unknown })` | `metadata: S.Record(...)` |

### EntityId Type Safety (CRITICAL)

ALWAYS add `.$type<EntityId.Type>()` to table columns referencing entity IDs to ensure compile-time type safety.

**Why This Matters:**

Without `.$type<>()`, TypeScript cannot distinguish between different entity ID types, leading to silent runtime bugs:

```typescript
// WITHOUT .$type<>() - compiles but WRONG
db.select()
  .from(relationTable)
  .where(eq(relationTable.subjectId, documentId))  // Should reject DocumentId!
// TypeScript accepts any string, including wrong ID types

// WITH .$type<>() - TypeScript error
db.select()
  .from(relationTable)
  .where(eq(relationTable.subjectId, documentId))  // ❌ Type error: KnowledgeEntityId ≠ DocumentId
```

**Required Pattern:**

```typescript
// REQUIRED - Add .$type<>() to ALL ID columns
import { KnowledgeEntityIds, DocumentsEntityIds } from "@beep/shared-domain";

export const entityTable = Table.make(KnowledgeEntityIds.EntityId)({
  // Same-slice ID reference
  ontologyId: pg.text("ontology_id").notNull()
    .$type<KnowledgeEntityIds.OntologyId.Type>(),

  // Cross-slice ID reference
  documentId: pg.text("document_id")
    .$type<DocumentsEntityIds.DocumentId.Type>(),

  // Shared entity ID reference
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),
});
```

**Forbidden Pattern:**

```typescript
// FORBIDDEN - Missing .$type<>() causes type-unsafe joins
export const entityTable = Table.make(KnowledgeEntityIds.EntityId)({
  ontologyId: pg.text("ontology_id").notNull(),  // ❌ Missing .$type<>()
  documentId: pg.text("document_id"),            // ❌ Missing .$type<>()
  userId: pg.text("user_id").notNull(),          // ❌ Missing .$type<>()
});
```

**Verification:**

```bash
# Check for table columns missing .$type<>() for ID fields
grep -r "pg.text.*notNull()" packages/*/tables/src/tables/ | grep -iE "(id|Id)" | grep -v "\.$type<"
```

If this command returns results, those columns need `.$type<>()` added.

**Common mistakes:**

```typescript
// WRONG - Using internal implementation
const Schema = S.Struct({
  enabled: BS.toOptionalWithDefault(S.Boolean, false)  // DEPRECATED - use BS.BoolWithDefault
});

// CORRECT - Using public BS helper
const Schema = S.Struct({
  enabled: BS.BoolWithDefault(false)
});

// WRONG - Vector column with wrong type
class Embedding extends M.Class<Embedding>("Embedding")({
  ...makeFields(EmbeddingId, {
    embedding: S.String,  // Wrong! Vectors are arrays, not strings
  }),
}) {}

// CORRECT - Vector column with ReadonlyArray<number>
class Embedding extends M.Class<Embedding>("Embedding")({
  ...makeFields(EmbeddingId, {
    embedding: S.Array(S.Number),  // Maps to vector(N) column type
  }),
}) {}
```

#### 4. Type Verification (`tables/src/_check.ts`)

Add select/insert type assertions to ensure table-domain alignment.

```typescript
// packages/knowledge/tables/src/_check.ts
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { Embedding } from "@beep/knowledge-domain/entities";
import type { embeddingTable } from "./tables/embedding.table";

// Select type assertion (table → domain)
({}) as InferSelectModel<typeof embeddingTable> satisfies Embedding.Encoded;

// Insert type assertion (ensures required fields match)
({}) as InferInsertModel<typeof embeddingTable> satisfies Embedding.Encoded;
```

Run verification:
```bash
bun run check --filter @beep/knowledge-tables
```

**Limitation:** This only validates that table types satisfy domain types (table → domain). It does NOT check if the domain has all table fields. See [`_check.ts` Type Assertion Asymmetry](../../packages/shared/tables/CLAUDE.md#integration-with-domain-entities) for details.

#### 5. Repository (`server/src/db/repos/`)

Create repository using table and domain model.

```typescript
// packages/knowledge/server/src/db/repos/EmbeddingRepo.ts
import { Embedding } from "@beep/knowledge-domain/entities";
import { embeddingTable } from "@beep/knowledge-tables";
import { makeRepo } from "@beep/shared-tables/repo";

export class EmbeddingRepo extends makeRepo(embeddingTable, Embedding) {}
```

### Verification Checklist

Before considering slice creation complete:

- [ ] Entity IDs registered in `domain/src/entity-ids/`
- [ ] Domain models define ALL fields (not just subset)
- [ ] Tables use correct entity IDs
- [ ] `_check.ts` assertions added for all tables
- [ ] `bun run check --filter @beep/slice-domain` passes
- [ ] `bun run check --filter @beep/slice-tables` passes
- [ ] Migration generated: `bun run db:generate`
- [ ] Migration applied successfully: `bun run db:migrate`

### Common Mistakes

**1. Incomplete Domain Models**
```typescript
// WRONG - Domain missing fields
class Embedding extends M.Class<Embedding>("Embedding")({
  ...makeFields(KnowledgeEntityIds.EmbeddingId, {
    embedding: S.Array(S.Number),  // Missing documentChunkId, model, metadata
  }),
}) {}

// Table has more fields than domain
export const embeddingTable = Table.make(KnowledgeEntityIds.EmbeddingId)({
  document_chunk_id: KnowledgeEntityIds.DocumentChunkId,  // Not in domain!
  embedding: vector768("embedding").notNull(),
  model: pg.text("model").notNull(),  // Not in domain!
});

// _check.ts PASSES but domain is incomplete!
({}) as InferSelectModel<typeof embeddingTable> satisfies Embedding.Encoded;  // ✅ No error
```

**2. Creating Table Before Domain**
```typescript
// WRONG - Creates table first, domain model is incomplete placeholder
// Problem: _check.ts can't validate completeness, only compatibility
```

**3. Forgetting Entity ID**
```typescript
// WRONG - Trying to use Table.make without entity ID
export const embeddingTable = Table.make("embedding")({  // Type error!
  // ...
});

// CORRECT - Entity ID must exist first
import { KnowledgeEntityIds } from "@beep/knowledge-domain";
export const embeddingTable = Table.make(KnowledgeEntityIds.EmbeddingId)({
  // ...
});
```

---

## Foreign Key Design

### Choosing FK Target: Internal ID vs Public Identifier

When creating foreign key relationships, choose the appropriate target column based on the relationship's scope and purpose.

#### Internal References (Same Bounded Context)

Reference the internal `id` column (UUID primary key) for relationships within the same bounded context.

```typescript
// CORRECT - Internal reference
import { BS } from "@beep/schema";

class MemberRole extends BS.StringLiteralKit("admin", "member", "viewer") {}

export const memberTable = Table.make("member", {
  userId: SharedEntityIds.UserId,  // References user.id (internal UUID)
  organizationId: SharedEntityIds.OrganizationId,  // References organization.id
  role: MemberRole,
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
class InvitationRole extends BS.StringLiteralKit("admin", "member") {}

export const invitationTable = OrgTable.make("invitation", {
  email: BS.EmailBase,
  inviterId: SharedEntityIds.UserId,
  role: InvitationRole,
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
class MemberRole extends BS.StringLiteralKit("admin", "member", "viewer") {}

export const memberTable = OrgTable.make("member", {
  userId: SharedEntityIds.UserId,
  role: MemberRole,
  // organizationId is automatically added
});

// Mixed scoping (optional organization context)
class SubscriptionPlan extends BS.StringLiteralKit("free", "pro", "enterprise") {}

export const subscriptionTable = Table.make("subscription", {
  userId: SharedEntityIds.UserId,
  organizationId: S.optional(SharedEntityIds.OrganizationId),  // Optional!
  plan: SubscriptionPlan,
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
