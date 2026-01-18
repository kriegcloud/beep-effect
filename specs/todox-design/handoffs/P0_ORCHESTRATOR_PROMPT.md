# Phase 0 Orchestrator Prompt: Foundation

**Date**: 2026-01-18
**Phase**: P0 (Foundation)
**Status**: Ready for execution
**Expected Duration**: 1-2 sessions

---

## Context

You are implementing the foundation phase of Todox, an AI-native multi-tenant SaaS application for wealth management firms. This phase establishes the core infrastructure that all subsequent phases depend on.

### Key Decisions Already Made

| Decision | Choice | Documentation |
|----------|--------|---------------|
| Sync Engine | PowerSync | MASTER_ORCHESTRATION.md |
| AI Tooling | @effect/ai + McpServer | README.md |
| Multi-Tenancy | RLS + org_id | MASTER_ORCHESTRATION.md |
| UI Layout | FlexLayout | README.md |

### Reference Materials

| Resource | Purpose |
|----------|---------|
| `apps/todox/` | Existing Todox application |
| `packages/iam/tables/` | Table/RLS patterns |
| `packages/iam/client/` | Handler patterns |
| `.claude/rules/effect-patterns.md` | Mandatory Effect rules |

---

## Source Verification (MANDATORY)

Per HANDOFF_STANDARDS.md, all external API methods must be verified during implementation.

### PowerSync API Methods (To Be Verified During P0 Task 0.2)

| Method | Source File | Type Definition | Verified |
|--------|-------------|-----------------|----------|
| `PowerSyncDatabase.execute()` | @powersync/web | TBD | Pending P0.2 |
| `PowerSyncDatabase.watch()` | @powersync/web | TBD | Pending P0.2 |
| `PowerSyncDatabase.connect()` | @powersync/web | TBD | Pending P0.2 |
| `PowerSyncDatabase.waitForFirstSync()` | @powersync/web | TBD | Pending P0.2 |

**Verification Process**:
1. During Task 0.2, install PowerSync: `bun add @powersync/web @powersync/common`
2. Examine TypeScript definitions in `node_modules/@powersync/web/dist/index.d.ts`
3. Cross-reference with [PowerSync documentation](https://docs.powersync.com/)
4. Update this table with verified signatures
5. Create Effect Schema wrappers for response types

**Method Name Convention**: PowerSync uses camelCase for all client methods.

---

## Phase 0 Objectives

1. **Design multi-tenant schema** with RLS policies
2. **Validate PowerSync integration** with minimal spike
3. **Plan FlexLayout unification** between /demo and / routes

---

## Task 0.1: Multi-Tenant Schema Design

### Goal

Create the core multi-tenancy schema that all tenant-scoped data will depend on.

### Requirements

**Core Tables**:
```sql
-- organizations (tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'standard', -- standard | enterprise
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- teams within organizations
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- organization memberships
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner | admin | member | viewer
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- team memberships
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);
```

**RLS Policies**:
```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Organization access: user is member
CREATE POLICY org_member_access ON organizations
  FOR ALL
  USING (
    id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = current_setting('app.current_user_id')::uuid
    )
  );

-- Team access: user is org member
CREATE POLICY team_org_member_access ON teams
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = current_setting('app.current_user_id')::uuid
    )
  );
```

**Session Context Setup**:
```typescript
// In Effect middleware/handler
yield* Effect.gen(function* () {
  const sql = yield* SqlClient;
  yield* sql.unsafe`SET LOCAL app.current_user_id = ${userId}`;
  yield* sql.unsafe`SET LOCAL app.current_org_id = ${orgId}`;
});
```

### Deliverable

Create `outputs/schema-design.md` with:
1. Complete schema DDL
2. RLS policies for all tables
3. Session context setup pattern
4. Migration strategy

---

## Task 0.2: PowerSync Spike

### Goal

Validate PowerSync integration with a minimal implementation.

### Requirements

1. **Install PowerSync**:
   ```bash
   bun add @powersync/web @powersync/common
   ```

2. **Create Sync Rules** (conceptual):
   ```yaml
   bucket_definitions:
     org_data:
       parameters: |
         SELECT org_id FROM organization_members
         WHERE user_id = token_parameters.user_id
       data:
         - SELECT * FROM organizations WHERE id = bucket.org_id
         - SELECT * FROM teams WHERE org_id = bucket.org_id
   ```

3. **Client Integration**:
   ```typescript
   import { PowerSyncDatabase } from "@powersync/web";
   import * as Effect from "effect/Effect";

   // Effect service for PowerSync
   class SyncService extends Context.Tag("SyncService")<
     SyncService,
     {
       readonly database: PowerSyncDatabase;
       readonly waitForSync: Effect.Effect<void>;
     }
   >() {}
   ```

4. **Verify Sync**:
   - Create organization via server
   - Observe sync to client
   - Query locally

### Deliverable

Create `outputs/powersync-spike.md` with:
1. Integration approach
2. Sync rules structure
3. Client service pattern
4. Observed behavior
5. Issues/limitations discovered

---

## Task 0.3: FlexLayout Unification Plan

### Goal

Create a plan to replace react-resizable-panels with FlexLayout.

### Analysis Required

1. **Current Root Route** (`apps/todox/src/app/page.tsx`):
   - ResizablePanelGroup usage
   - Panel content (MiniSidebar, MainContentPanelSidebar, ViewModes, SidePanel)
   - Provider structure

2. **Demo Route** (`apps/todox/src/app/demo/_lib/App.tsx`):
   - FlexLayout Model usage
   - Tab factory pattern
   - Border configuration

3. **Component Mapping**:
   | Current Component | FlexLayout Equivalent |
   |-------------------|----------------------|
   | ResizablePanelGroup | FlexLayout Model |
   | ResizablePanel | TabSet or BorderRow |
   | MiniSidebar | Left Border |
   | MainContentPanelSidebar | Left TabSet |
   | ViewModes (tabs) | Tabs in TabSet |
   | SidePanel (AI Chat) | Right Border |

### Deliverable

Create `outputs/flexlayout-unification.md` with:
1. Component mapping table
2. Migration steps
3. State management changes
4. Styling considerations
5. Responsive behavior plan

---

## Verification Steps

After completing all tasks:

```bash
# If any code was written
bun run check
bun run lint:fix
bun run test

# Verify outputs exist
ls specs/todox-design/outputs/
# Should show: schema-design.md, powersync-spike.md, flexlayout-unification.md
```

---

## Checkpoint Before P1

Before proceeding to Phase 1 (WorkSpaces):

- [ ] `outputs/schema-design.md` created and reviewed
- [ ] `outputs/powersync-spike.md` created with working spike
- [ ] `outputs/flexlayout-unification.md` created with plan
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings
- [ ] HANDOFF_P1.md created for next phase

---

## Handoff Creation

After completing Phase 0, create `handoffs/HANDOFF_P1.md` with:

1. **Phase 0 Summary**: What was accomplished
2. **Schema Decisions**: Final schema design
3. **PowerSync Patterns**: Integration approach
4. **FlexLayout Migration**: Execution plan
5. **P1 Task Refinements**: Updated tasks based on learnings

Follow HANDOFF_STANDARDS.md requirements.

---

## Effect Pattern Reminders

All code must follow these patterns:

```typescript
// REQUIRED: Namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Context from "effect/Context";

// REQUIRED: Effect.gen for async operations
const result = yield* Effect.gen(function* () {
  const sql = yield* SqlClient;
  const rows = yield* sql`SELECT * FROM organizations`;
  return rows;
});

// REQUIRED: Effect Schema for external data
const Organization = S.Struct({
  id: S.String,
  name: S.String,
  slug: S.String,
  tier: S.Literal("standard", "enterprise"),
});
```

---

## Notes

- PowerSync is in public alpha - document any rough edges
- FlexLayout wrapper exists in `packages/ui/ui/src/flexlayout-react/`
- RLS requires session pooling mode in PgBouncer (not transaction pooling)
- All tenant-scoped tables MUST have org_id column
