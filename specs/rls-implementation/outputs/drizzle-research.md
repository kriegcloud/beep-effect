# Drizzle RLS Integration Research

> Findings on integrating Row-Level Security with Drizzle ORM in beep-effect.

**Generated**: 2026-01-18
**Status**: COMPLETE
**Phase**: P0 - Research & Discovery

---

## Executive Summary

Drizzle ORM v1.0.0-beta.1+ provides native RLS support via `pgPolicy`, `pgRole`, and `.withRLS()`. However, the current beep-effect architecture uses self-hosted PostgreSQL with custom SQL migrations and manual session variable management. Drizzle's RLS features are most useful with Supabase/Neon integrations.

**Recommendation**: Use Drizzle for table definitions but manage RLS policies via custom SQL migrations for maximum control.

---

## Drizzle RLS Features (v1.0.0-beta.1+)

### 1. Enabling RLS on Tables

**Modern approach (recommended)**:
```typescript
import { pgTable, integer } from 'drizzle-orm/pg-core';

export const users = pgTable.withRLS('users', {
  id: integer(),
});
```

**Legacy approach**:
```typescript
export const users = pgTable('users', { id: integer() });
// Then call .enableRLS() on the table
```

**Note**: Adding policies automatically enables RLS (no need for explicit `.enableRLS()`)

### 2. Defining Policies

```typescript
import { sql } from 'drizzle-orm';
import { pgPolicy, pgRole, pgTable } from 'drizzle-orm/pg-core';

export const admin = pgRole('admin');

export const users = pgTable('users', {
  id: integer(),
}, (t) => [
  pgPolicy('policy', {
    as: 'permissive',
    to: admin,
    for: 'delete',
    using: sql``,
    withCheck: sql``,
  }),
]);
```

### 3. Policy Options

| Option | Values | Purpose |
|--------|--------|---------|
| `as` | `permissive`, `restrictive` | Policy combination logic |
| `to` | `public`, `current_role`, `current_user`, `session_user`, custom role | Target role |
| `for` | `all`, `select`, `insert`, `update`, `delete` | Command scope |
| `using` | SQL expression | Read filter |
| `withCheck` | SQL expression | Write validation |

---

## Provider-Specific Integrations

### Neon Integration

Neon provides a `crudPolicy` helper:

```typescript
import { crudPolicy } from 'drizzle-orm/neon';
import { pgRole, pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer(),
}, (t) => [
  crudPolicy({ role: admin, read: true, modify: false }),
]);
```

**Predefined Neon roles**:
- `authenticatedRole`
- `anonymousRole`

**Neon helper functions**:
- `authUid(userIdColumn)` - For user ID comparisons

### Supabase Integration

Supabase provides predefined roles marked as existing:

```typescript
import {
  anonRole,
  authenticatedRole,
  serviceRole,
  postgresRole,
  supabaseAuthAdminRole
} from 'drizzle-orm/supabase';
```

**Supabase utilities**:
- `authUsers` table from auth schema
- `realtimeMessages` from realtime schema
- `authUid()` - Current user ID from JWT
- `realtimeTopic()` - Current topic

### RLS on Views

Enable RLS on views using `security_invoker`:

```typescript
export const roomsUsersProfiles = pgView("rooms_users_profiles")
  .with({
    securityInvoker: true,
  })
  .as((qb) =>
    qb.select({...}).from(roomsUsers)...
  );
```

---

## Approach for beep-effect

### Why NOT Use Drizzle's RLS Features

1. **Current architecture**: beep-effect uses self-hosted PostgreSQL, not Supabase/Neon
2. **Session variables**: Drizzle's RLS helpers are designed for JWT-based auth, not session variables
3. **Migration control**: Custom SQL migrations give explicit control over policy definitions
4. **Effect integration**: Session variable setup happens at the Effect layer, independent of Drizzle
5. **Provider lock-in**: Using provider-specific helpers creates lock-in

### Recommended Approach: Custom SQL Migrations

**Step 1: Keep table definitions in Drizzle (unchanged)**

```typescript
// packages/iam/tables/src/tables/member.table.ts
export const member = OrgTable.make(IamEntityIds.MemberId)(
  {
    userId: pg.text("user_id").notNull(),
    role: memberRoleEnum("role").notNull(),
    // ...
  },
  (t) => [
    pg.index("member_organization_id_idx").on(t.organizationId),
  ]
);
```

**Step 2: Add RLS via custom migration**

```sql
-- drizzle/XXXX_enable_rls.sql

-- Enable RLS on org-scoped tables
ALTER TABLE member ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
-- ... for all 21 tables

-- Create tenant isolation policies
CREATE POLICY tenant_isolation_member ON member
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);

-- ... for all 21 tables
```

### Type Safety Boundary

Application code uses branded types (`OrganizationId.Type`), but PostgreSQL policies work with underlying storage types (`text`). The policy:

```sql
organization_id = current_setting('app.current_org_id')::text
```

This is correct because:
1. **Branded types are compile-time only** - erased at runtime, stored as `text` in PostgreSQL
2. **PostgreSQL sees `organization_id` as `text` column** - the `.$type<>()` call is TypeScript-only
3. **Session variable is also `text`** - set via `SET LOCAL app.current_org_id = 'uuid-string'`
4. **Type safety enforced at Effect/Drizzle layer** - not at database layer

The boundary is: TypeScript enforces branded types in application code, PostgreSQL enforces tenant isolation via RLS policies using underlying `text` storage.

**Step 3: Set session variable in Effect**

```typescript
// packages/shared/server/src/TenantContext/TenantContext.ts
import * as SqlClient from "@effect/sql/SqlClient";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

/** Shape interface for TenantContext service */
export interface TenantContextShape {
  /** Set the organization context for subsequent queries in this transaction */
  readonly setOrganizationId: (orgId: string) => Effect.Effect<void>;
  /** Clear the organization context */
  readonly clearContext: () => Effect.Effect<void>;
  /** Execute an effect within a specific organization context */
  readonly withOrganization: <A, E, R>(
    orgId: string,
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>;
}

/** TenantContext service tag for dependency injection */
export class TenantContext extends Context.Tag("@beep/shared-server/TenantContext")<
  TenantContext,
  TenantContextShape
>() {
  /** Layer that provides TenantContext, requires SqlClient */
  static readonly layer: Layer.Layer<TenantContext, never, SqlClient.SqlClient> =
    Layer.effect(
      TenantContext,
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        return {
          setOrganizationId: (orgId: string) =>
            sql`SET LOCAL app.current_org_id = ${orgId}`.pipe(Effect.asVoid),

          clearContext: () =>
            sql`RESET app.current_org_id`.pipe(Effect.asVoid),

          withOrganization: <A, E, R>(orgId: string, effect: Effect.Effect<A, E, R>) =>
            Effect.gen(function* () {
              yield* sql`SET LOCAL app.current_org_id = ${orgId}`;
              return yield* effect;
            }),
        };
      })
    );
}
```

---

## Migration Strategy

### Phase 1: Add Missing Indexes

16 tables need `organization_id` indexes for RLS performance (session table already has one):

```typescript
// Example: file.table.ts update
export const file = OrgTable.make(SharedEntityIds.FileId)(
  {
    // existing columns...
  },
  (t) => [
    pg.index("file_organization_id_idx").on(t.organizationId),  // ADD THIS
    // existing indexes...
  ]
);
```

### Phase 2: Enable RLS

Create custom migration:

```sql
-- drizzle/XXXX_enable_rls.sql

-- Enable RLS on all 21 org-scoped tables
ALTER TABLE member ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE file ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE document ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_file ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_provider ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_provider ENABLE ROW LEVEL SECURITY;
ALTER TABLE session ENABLE ROW LEVEL SECURITY;
```

### Phase 3: Create Policies

Create policies for each table type:

```sql
-- drizzle/XXXX_rls_policies.sql

-- Standard org-scoped policy template (NOT NULL organizationId)
CREATE POLICY tenant_isolation_member ON member
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);

-- Nullable organizationId (ssoProvider, scimProvider)
CREATE POLICY tenant_isolation_sso_provider ON sso_provider
  FOR ALL
  USING (
    organization_id IS NULL OR
    organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text
  )
  WITH CHECK (
    organization_id IS NULL OR
    organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text
  );

-- Session table (activeOrganizationId pattern)
CREATE POLICY tenant_isolation_session ON session
  FOR ALL
  USING (
    active_organization_id IS NULL OR
    active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text
  );
```

---

## drizzle.config.ts Updates

Enable role management if using Drizzle's role features:

```typescript
// drizzle.config.ts
export default defineConfig({
  dialect: 'postgresql',
  entities: {
    roles: {
      provider: undefined,  // Not using Supabase/Neon
      exclude: ['postgres', 'pg_*'],  // Exclude system roles
    }
  }
});
```

---

## Effect Integration Patterns

### Raw SQL Execution

```typescript
import * as SqlClient from "@effect/sql/SqlClient";
import * as Effect from "effect/Effect";

const setTenantContext = (orgId: string) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    // SET LOCAL scopes to current transaction
    yield* sql`SET LOCAL app.current_org_id = ${orgId}`;
  });
```

### Integration with Existing Transaction Pattern

The existing `transaction` method in `PgClient.ts` (line 520-552) can be enhanced:

```typescript
// Proposed transactionWithTenant wrapper
const transactionWithTenant = (orgId: string) =>
  <T, E, R>(txExecute: (tx: TransactionContextShape) => Effect.Effect<T, E, R>) =>
    transaction((tx) =>
      Effect.gen(function* () {
        yield* sql`SET LOCAL app.current_org_id = ${orgId}`;
        return yield* txExecute(tx);
      })
    );
```

---

## Testing RLS

### Test Pattern

```typescript
// test/rls/tenant-isolation.test.ts
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

layer(TestLayer, { timeout: Duration.seconds(30) })("RLS Tenant Isolation", (it) => {
  it.effect("prevents cross-tenant data access", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      // Set tenant context to org1
      yield* sql`SET LOCAL app.current_org_id = 'org1-uuid'`;

      // Insert as org1
      yield* sql`INSERT INTO member (organization_id, user_id) VALUES ('org1-uuid', 'user1')`;

      // Switch to org2
      yield* sql`SET LOCAL app.current_org_id = 'org2-uuid'`;

      // Should not see org1's data
      const result = yield* sql`SELECT * FROM member`;
      strictEqual(result.length, 0);
    })
  );
});
```

---

## Key Findings

1. **Drizzle RLS is provider-focused**: Best suited for Supabase/Neon with JWT auth
2. **Custom migrations preferred**: For self-hosted PostgreSQL, custom SQL gives more control
3. **Session variables work**: PostgreSQL's `current_setting()` integrates cleanly with Effect
4. **SET LOCAL is transaction-scoped**: Perfect for request-level isolation
5. **Index first**: 16 tables need `organization_id` indexes before enabling RLS

---

## References

- [Drizzle RLS Documentation](https://orm.drizzle.team/docs/rls)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Drizzle Supabase Integration](https://orm.drizzle.team/docs/get-started-postgresql#supabase)
- [Drizzle Neon Integration](https://orm.drizzle.team/docs/get-started-postgresql#neon)
- [@effect/sql Documentation](https://effect.website/docs/guides/sql)
