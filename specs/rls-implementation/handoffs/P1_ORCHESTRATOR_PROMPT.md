# Phase 1 Orchestrator Prompt

> Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 (Infrastructure & TenantContext) of the RLS Implementation spec for beep-effect.

### Context

Phase 0 research is complete. Key decisions:
- **Provider**: Self-hosted PostgreSQL (no migration)
- **Session Pattern**: `SET LOCAL app.current_org_id = 'uuid'`
- **21 tables** require RLS, **16 need indexes added**

### Your Mission

Complete these implementation tasks:

#### Task 1: Add Missing Indexes (16 tables)

Add `organization_id` indexes to these tables by updating their table definitions:

**IAM Tables** (`packages/iam/tables/src/tables/`):
- `teamMember.table.ts` - add `team_member_organization_id_idx`
- `organizationRole.table.ts` - add `organization_role_org_id_idx`
- `subscription.table.ts` - add `subscription_organization_id_idx`
- `twoFactor.table.ts` - add `two_factor_organization_id_idx`
- `apiKey.table.ts` - add `api_key_organization_id_idx`
- `ssoProvider.table.ts` - add `sso_provider_org_id_idx`
- `scimProvider.table.ts` - add `scim_provider_org_id_idx`

**Shared Tables** (`packages/shared/tables/src/tables/`):
- `file.table.ts` - add `file_organization_id_idx`
- `folder.table.ts` - add `folder_organization_id_idx`
- `upload-session.table.ts` - add `upload_session_org_id_idx`

**Documents Tables** (`packages/documents/tables/src/tables/`):
- `document.table.ts` - add `document_organization_id_idx`
- `discussion.table.ts` - add `discussion_org_id_idx`
- `comment.table.ts` - add `comment_organization_id_idx`
- `documentFile.table.ts` - add `document_file_org_id_idx`
- `documentVersion.table.ts` - add `document_version_org_id_idx`

**Knowledge Tables** (`packages/knowledge/tables/src/tables/`):
- `embedding.table.ts` - add `embedding_organization_id_idx`

**Pattern**:
```typescript
(t) => [
  pg.index("table_organization_id_idx").on(t.organizationId),
  // ... existing indexes
]
```

#### Task 2: Create TenantContext Service

Create `packages/shared/server/src/TenantContext/TenantContext.ts`:

```typescript
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

Create `packages/shared/server/src/TenantContext/index.ts`:
```typescript
export * from "./TenantContext";
```

#### Task 3: Export TenantContext

Update `packages/shared/server/src/index.ts` to export:
```typescript
export * as TenantContext from "./TenantContext";
```

#### Task 4: Add transactionWithTenant

Enhance `packages/shared/server/src/factories/db-client/pg/PgClient.ts`:
- Add `transactionWithTenant` method to Shape interface
- Implement in `make` function

### Critical Patterns

Follow Effect patterns from `.claude/rules/effect-patterns.md`:
- Namespace imports: `import * as Effect from "effect/Effect"`
- Use `@beep/*` path aliases

### Verification

Before completing Phase 1:
- [ ] Run `bun run check` - all types pass
- [ ] Run `bun run lint:fix` - code formatted
- [ ] Run `bun run db:generate` - migrations created for indexes
- [ ] TenantContext service created and exported
- [ ] REFLECTION_LOG.md updated

### Handoff Document

Full context in: `specs/rls-implementation/handoffs/HANDOFF_P1.md`

After completing, create:
- `specs/rls-implementation/handoffs/HANDOFF_P2.md`
- `specs/rls-implementation/handoffs/P2_ORCHESTRATOR_PROMPT.md`
