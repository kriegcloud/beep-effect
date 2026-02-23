# Database Provider Comparison

> Evaluation of database providers for RLS implementation in beep-effect.

**Generated**: 2026-01-18
**Status**: COMPLETE
**Phase**: P0 - Research & Discovery

---

## Executive Summary

After evaluating self-hosted PostgreSQL, Supabase, and Neon for RLS implementation, **self-hosted PostgreSQL is recommended** for beep-effect. The existing Effect/Drizzle architecture integrates cleanly with PostgreSQL's session variable pattern, and switching providers would introduce unnecessary migration complexity without significant benefits.

---

## Evaluation Criteria

| Criterion | Priority | Weight |
|-----------|----------|--------|
| Effect/Drizzle pattern compatibility | **HIGH** | 40% |
| Migration complexity from current setup | **HIGH** | 30% |
| Session context mechanisms | **MEDIUM** | 15% |
| Connection pooling compatibility | **MEDIUM** | 10% |
| Cost implications | **LOW** | 5% |

---

## Comparison Matrix

| Provider | RLS Support | Auth Context | Migration Effort | Session Variables | Pooling | Recommendation |
|----------|-------------|--------------|------------------|-------------------|---------|----------------|
| **Self-hosted PostgreSQL** | Native | Session vars | None | Full support | Full control | **RECOMMENDED** |
| Supabase | Native + helpers | JWT-based | Major | Limited | Managed | Not recommended |
| Neon | Native | Session vars | Medium | Full support | Transaction mode only | Alternative |

---

## Provider Analysis

### Self-hosted PostgreSQL (Current)

**RLS Support**: Full native PostgreSQL RLS with no limitations

**Pros**:
- No migration required - current infrastructure stays
- Full control over RLS policies and session variables
- Works with existing Effect/Drizzle patterns
- Session-level pooling works without issues
- No vendor lock-in
- Cost-effective at scale

**Cons**:
- No built-in auth integration (must implement TenantContext service)
- Operational overhead for maintenance
- No fancy RLS helpers (must write raw SQL policies)

**Session Variable Pattern**:
```sql
-- Full support for SET LOCAL (transaction-scoped)
SET LOCAL app.current_org_id = 'uuid';

-- Policy can use:
USING (organization_id = current_setting('app.current_org_id', TRUE)::text)
```

**Connection Pooling**: Works with session-level pooling (PgBouncer session mode, or pg.Pool)

**Effect Integration**:
```typescript
// Clean integration with existing PgClient
const sql = yield* SqlClient.SqlClient;
yield* sql`SET LOCAL app.current_org_id = ${orgId}`;
```

---

### Supabase

**RLS Support**: Native PostgreSQL RLS + helper functions

**Pros**:
- Built-in RLS helpers (`auth.uid()`, `auth.jwt()`)
- Integrated authentication with JWT claims
- Dashboard for policy management
- Real-time subscriptions with RLS
- SOC 2 Type 2 + HIPAA compliance

**Cons**:
- **Major migration effort** - would need to migrate auth to Supabase Auth
- JWT-based auth doesn't match current Better Auth setup
- Session variables require workarounds
- Connection pooler (Supavisor) has limitations
- Vendor lock-in
- Higher cost at scale

**Auth Context Pattern**:
```sql
-- Supabase uses JWT claims, not session variables
USING (organization_id = (auth.jwt() ->> 'org_id')::text)
```

**Why Not Recommended**:
1. beep-effect uses Better Auth, not Supabase Auth
2. Migrating auth would be a major undertaking
3. Session variable pattern is more flexible than JWT claims
4. No significant benefit over self-hosted for this use case

---

### Neon

**RLS Support**: Full native PostgreSQL RLS

**Pros**:
- PostgreSQL-compatible (minimal code changes)
- Serverless with scale-to-zero
- Database branching for dev/staging
- Open source (Apache-2.0)
- Session variables work like standard PostgreSQL
- Lower operational overhead than self-hosted

**Cons**:
- Connection pooling in transaction mode only (session mode coming)
- `SET LOCAL` works but `SET` (session) doesn't persist across transactions
- Less mature than self-hosted PostgreSQL
- Some latency overhead for serverless
- Databricks acquisition (May 2025) may affect roadmap

**Session Variable Pattern**:
```sql
-- SET LOCAL works within transactions
SET LOCAL app.current_org_id = 'uuid';

-- Note: Regular SET doesn't persist due to transaction-mode pooling
```

**Why Alternative (Not Primary)**:
- Transaction-mode pooling is a constraint
- Current Effect architecture uses session-level queries
- Migration effort exists even if smaller than Supabase
- Neon would be good for future greenfield projects

---

## Connection Pooling Considerations

### Critical Finding

PostgreSQL session variables (`SET app.current_org_id`) have different behavior depending on pooling mode:

| Pooling Mode | SET Behavior | SET LOCAL Behavior | Recommendation |
|--------------|--------------|-------------------|----------------|
| **Session-level** | Persists for connection | Transaction-scoped | Best for RLS |
| **Transaction-level** | Lost after txn | Transaction-scoped | Works with SET LOCAL only |
| **Statement-level** | Not usable | Not usable | Incompatible with RLS |

**Recommendation**: Use session-level pooling (current pg.Pool behavior) with `SET LOCAL` for maximum safety.

---

## Implementation Differences

### Self-hosted PostgreSQL (Recommended)

```typescript
// TenantContext service
export class TenantContext extends Effect.Service<TenantContext>()(...) {
  withOrganization: (orgId: string, effect: Effect.Effect<A, E, R>) =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      yield* sql`SET LOCAL app.current_org_id = ${orgId}`;
      return yield* effect;
    })
}

// RLS Policy (SQL migration)
CREATE POLICY tenant_isolation ON member
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

### Supabase (If chosen)

```typescript
// Would require Supabase Auth migration
import { createClient } from '@supabase/supabase-js';

// RLS Policy
CREATE POLICY tenant_isolation ON member
  FOR ALL
  USING (organization_id = (auth.jwt() ->> 'org_id')::text);

// JWT must include org_id claim - requires auth changes
```

### Neon (If chosen)

```typescript
// Similar to self-hosted, but with transaction-mode awareness
const withTenant = (orgId: string) => <A, E, R>(
  effect: Effect.Effect<A, E, R>
) => transaction((tx) =>
  Effect.gen(function* () {
    yield* tx`SET LOCAL app.current_org_id = ${orgId}`;
    return yield* effect;
  })
);
```

---

## Cost Analysis

| Provider | Free Tier | Pro Tier (estimate) | Enterprise |
|----------|-----------|---------------------|------------|
| Self-hosted | Infrastructure only | $50-200/mo (cloud VM) | Variable |
| Supabase | 500MB, 2 projects | $25/project/mo + usage | Custom |
| Neon | 0.5GB, 1 project | $19/mo + compute | Custom |

**Note**: Cost is a LOW priority criterion. Self-hosted is most predictable at scale.

---

## Decision Criteria Analysis

### Effect/Drizzle Compatibility (40%)

| Provider | Score | Notes |
|----------|-------|-------|
| Self-hosted | 10/10 | Current setup, no changes needed |
| Supabase | 4/10 | Requires auth migration, different patterns |
| Neon | 8/10 | Minor adjustments for transaction-mode pooling |

### Migration Complexity (30%)

| Provider | Score | Notes |
|----------|-------|-------|
| Self-hosted | 10/10 | No migration - add RLS in place |
| Supabase | 2/10 | Major auth + data migration |
| Neon | 6/10 | Data migration, minor code changes |

### Session Context (15%)

| Provider | Score | Notes |
|----------|-------|-------|
| Self-hosted | 10/10 | Full session variable support |
| Supabase | 5/10 | JWT-based, less flexible |
| Neon | 8/10 | Works with SET LOCAL in transactions |

### Pooling Compatibility (10%)

| Provider | Score | Notes |
|----------|-------|-------|
| Self-hosted | 10/10 | Full control over pooling |
| Supabase | 6/10 | Managed pooler, some limitations |
| Neon | 7/10 | Transaction mode only (improving) |

### Cost (5%)

| Provider | Score | Notes |
|----------|-------|-------|
| Self-hosted | 8/10 | Infrastructure costs, predictable |
| Supabase | 6/10 | Per-project pricing adds up |
| Neon | 7/10 | Compute-based, good for variable loads |

---

## Final Scores

### Calculation

**Self-hosted PostgreSQL**:
- (10 × 0.40) + (10 × 0.30) + (10 × 0.15) + (10 × 0.10) + (8 × 0.05) = 4.0 + 3.0 + 1.5 + 1.0 + 0.4 = **9.9**

**Neon**:
- (8 × 0.40) + (6 × 0.30) + (8 × 0.15) + (7 × 0.10) + (7 × 0.05) = 3.2 + 1.8 + 1.2 + 0.7 + 0.35 = **7.25**

**Supabase**:
- (4 × 0.40) + (2 × 0.30) + (5 × 0.15) + (6 × 0.10) + (6 × 0.05) = 1.6 + 0.6 + 0.75 + 0.6 + 0.3 = **3.85**

| Provider | Weighted Score | Recommendation |
|----------|---------------|----------------|
| **Self-hosted PostgreSQL** | **9.9/10** | **RECOMMENDED** |
| Neon | 7.3/10 | Future consideration |
| Supabase | 3.9/10 | Not recommended |

---

## Recommendation

**Use self-hosted PostgreSQL** for RLS implementation:

1. **Zero migration effort** - RLS is added to existing tables
2. **Full compatibility** - Works with current Effect/Drizzle patterns
3. **Session variables** - Clean integration via TenantContext service
4. **No lock-in** - Standard PostgreSQL, can migrate later if needed
5. **Proven at scale** - PostgreSQL RLS is battle-tested

### Implementation Path

1. Create `TenantContext` Effect service for session variable management
2. Add custom SQL migrations for RLS policies
3. Add missing `organization_id` indexes (17 tables)
4. Update Better Auth hooks to set tenant context
5. Test thoroughly with cross-tenant isolation tests

---

## Future Considerations

- **Neon** could be valuable for development/staging environments (branching)
- **Supabase** might be reconsidered if auth is migrated in the future
- Monitor Neon's session-mode pooling development

---

## References

- [Neon vs Supabase Comparison (2025)](https://seenode.com/blog/top-managed-postgresql-services-compared)
- [PostgreSQL RLS Best Practices](https://www.crunchydata.com/blog/row-level-security-for-tenants-in-postgres)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Neon Security Overview](https://neon.tech/docs/security/security-overview)
- [AWS Multi-tenant RLS Guide](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-managed-postgresql/rls.html)
