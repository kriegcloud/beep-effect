# Master Orchestration: Todox Design

> Complete phase workflows, checkpoints, and handoff protocols for Todox implementation.

---

## Phase 0: Foundation

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `codebase-researcher`, `architecture-pattern-enforcer`

### Objectives

1. Establish multi-tenant database schema with RLS
2. Validate PowerSync integration feasibility
3. Unify FlexLayout demo patterns with main app structure

### Tasks

#### Task 0.1: Multi-Tenant Schema Design

**Agent**: Manual (Orchestrator)

```
Design the core multi-tenancy schema:

1. Create Organization, Team, OrganizationMember, TeamMember tables
2. Add org_id to ALL tenant-scoped tables
3. Implement RLS policies using SET LOCAL app.current_org_id
4. Create session pooling configuration for PgBouncer

Reference patterns:
- packages/iam/tables/ for existing table patterns
- documentation/patterns/database-patterns.md

Output: outputs/schema-design.md
```

#### Task 0.2: PowerSync Spike

**Agent**: `codebase-researcher` + Manual

```
Evaluate PowerSync integration:

1. Review PowerSync documentation for Sync Rules patterns
2. Design sync rules for org_id + team_id partitioning
3. Create minimal spike: sync single table to client
4. Validate TypeScript integration with existing Effect patterns

Key questions:
- How do Sync Rules interact with RLS?
- What's the client-side query pattern?
- How are write mutations handled?

Output: outputs/powersync-spike.md
```

#### Task 0.3: FlexLayout Unification Plan

**Agent**: `codebase-researcher`

```
Analyze FlexLayout integration requirements:

1. Read apps/todox/src/app/demo/_lib/App.tsx (FlexLayout usage)
2. Read apps/todox/src/app/page.tsx (current root structure)
3. Identify components to merge
4. Plan WorkSpace-to-TabSet mapping

Output: outputs/flexlayout-unification.md
```

### Checkpoint

Before proceeding to P1:
- [ ] Schema design reviewed and approved
- [ ] PowerSync spike demonstrates basic sync
- [ ] FlexLayout unification plan documented
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P1.md created

### Handoff

Create `handoffs/HANDOFF_P1.md` with:
- Schema decisions made
- PowerSync integration patterns discovered
- FlexLayout component mapping
- P1 task refinements

---

## Phase 1: WorkSpaces

**Duration**: 2-3 sessions
**Status**: Pending
**Agents**: `codebase-researcher`, `test-writer`, `architecture-pattern-enforcer`

### Objectives

1. Implement WorkSpace domain model (hierarchical)
2. Create Document and File entities
3. Implement block-based document structure
4. Set up sync via PowerSync

### Tasks

#### Task 1.1: WorkSpace Domain

```
Create WorkSpace domain package:

Location: packages/workspaces/domain/

Entities:
- WorkSpace (id, orgId, teamId, ownerId, type, parentId, name, icon)
- Document (id, workspaceId, title, icon, blocks)
- Block (id, type, content, children, order)
- File (id, workspaceId, name, path, mimeType, size)

Follow patterns from:
- packages/iam/domain/ (entity definitions)
- packages/documents/domain/ (if exists)

Use Effect Schema for all definitions.
```

#### Task 1.2: WorkSpace Tables

```
Create WorkSpace tables package:

Location: packages/workspaces/tables/

Tables:
- workspaces (with org_id, RLS policy)
- documents (with workspace_id, org_id denormalized)
- blocks (with document_id, org_id denormalized)
- files (with workspace_id, org_id denormalized)

Implement RLS policies for each table.
Add PowerSync sync rules in configuration.
```

#### Task 1.3: WorkSpace Server

```
Create WorkSpace server package:

Location: packages/workspaces/server/

Handlers:
- createWorkspace
- updateWorkspace
- deleteWorkspace
- listWorkspaces (by org, by team, by user)
- createDocument
- updateDocument
- listDocuments

Follow handler patterns from packages/iam/client/.
```

### Checkpoint

Before proceeding to P2:
- [ ] WorkSpace CRUD operations functional
- [ ] Hierarchical nesting works
- [ ] Document block structure persists
- [ ] File upload/download works
- [ ] RLS policies verified
- [ ] Tests pass

---

## Phase 2: FlexLayout Integration

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `codebase-researcher`, `architecture-pattern-enforcer`

### Objectives

1. Replace react-resizable-panels with FlexLayout
2. Map WorkSpaces to TabSets
3. Persist layout to database
4. Sync layout changes via PowerSync

### Tasks

#### Task 2.1: Layout Component

```
Create unified layout component:

Location: apps/todox/src/components/workspace-layout/

Features:
- FlexLayout Model persistence
- WorkSpace ↔ Tab mapping
- Border panels for AI chat, navigation
- Popout support for multi-monitor

Reference: apps/todox/src/app/demo/_lib/App.tsx
```

#### Task 2.2: Layout Persistence

```
Implement layout sync:

1. Store FlexLayout JSON in dashboard table
2. Sync layout changes via PowerSync
3. Handle concurrent layout edits (CRDT or last-write-wins)
4. Restore layout on app load (<100ms target)
```

#### Task 2.3: Route Migration

```
Migrate root route to FlexLayout:

1. Update apps/todox/src/app/page.tsx
2. Replace react-resizable-panels with FlexLayout
3. Preserve existing styling/theming
4. Ensure responsive behavior
```

### Checkpoint

Before proceeding to P3:
- [ ] Root route uses FlexLayout
- [ ] Layout persists and syncs
- [ ] WorkSpaces appear as tabs
- [ ] Border panels functional
- [ ] Responsive on mobile

---

## Phase 3: Email Integration

**Duration**: 2-3 sessions
**Status**: Pending
**Agents**: `web-researcher`, `codebase-researcher`

### Objectives

1. Implement Gmail OAuth flow
2. Sync emails read-only
3. Extract action items from threads
4. Link emails to clients

### Tasks

#### Task 3.1: Gmail OAuth

```
Implement Gmail OAuth:

Location: packages/integrations/gmail/

1. OAuth consent flow with Gmail scopes (read-only)
2. Token storage with encryption
3. Token refresh logic
4. Account linking to user

Reference: packages/iam/client/adapters/better-auth/
```

#### Task 3.2: Email Sync

```
Implement email synchronization:

1. Fetch emails from Gmail API
2. Store in email_threads, email_messages tables
3. Sync via PowerSync to client
4. Handle pagination and incremental sync
```

#### Task 3.3: AI Extraction

```
Implement AI action extraction:

Using @effect/ai:
1. Analyze email thread for action items
2. Extract mentioned clients
3. Identify deadlines
4. Create extracted_actions table

MCP Server for email tools:
- getThreadSummary
- extractActionItems
- linkToClient
```

### Checkpoint

Before proceeding to P4:
- [ ] Gmail OAuth flow works
- [ ] Emails sync to client
- [ ] Action extraction functional
- [ ] Client linking works

---

## Phase 4: Agent Framework

**Duration**: 2-3 sessions
**Status**: Pending
**Agents**: `mcp-researcher`, `codebase-researcher`

### Objectives

1. Design agent configuration model
2. Implement @effect/ai integration
3. Create MCP server for tools
4. Build agent execution runtime

### Tasks

#### Task 4.1: Agent Domain

```
Create Agent domain:

Location: packages/agents/domain/

Entities:
- Agent (id, orgId, name, systemPrompt, personality)
- ContextSource (workspaces, databases, emails)
- ToolPermission (toolId, enabled, requiresApproval)
- AgentTrigger (type, config)

Use Effect Schema for all definitions.
```

#### Task 4.2: MCP Server Implementation

```
Create MCP servers for agent tools:

Location: packages/agents/mcp-servers/

Servers:
- client-data-server (getClientProfile, searchClients)
- email-server (getThread, draftReply)
- workspace-server (searchDocuments, readDocument)

Use @effect/ai/McpServer pattern:
- Define tools with Effect Schema
- Implement tool handlers as Effect.gen
- Register with agent runtime
```

#### Task 4.3: Agent Runtime

```
Create agent execution runtime:

Location: packages/agents/runtime/

Features:
- Load agent configuration
- Assemble context from sources
- Execute with @effect/ai
- Enforce tool permissions
- Log executions for audit

Flow:
1. User invokes agent
2. Runtime loads config + context
3. Execute with selected AI model
4. Handle tool calls with MCP
5. Return result with audit log
```

### Checkpoint

Before proceeding to P5:
- [ ] Agent configuration persists
- [ ] MCP servers respond to tool calls
- [ ] Agent executes with context
- [ ] Permissions enforced
- [ ] Audit logs captured

---

## Phase 5: Email Automation

**Duration**: 2-3 sessions
**Status**: Pending

### Objectives

1. Enable email sending via Gmail API
2. Implement approval workflows
3. Create email automation triggers
4. Build draft review UI

### Tasks

(Detailed tasks to be refined in HANDOFF_P5.md)

---

## Phase 6: Integrations

**Duration**: 3-4 sessions
**Status**: Pending

### Objectives

1. Salesforce/Wealthbox CRM integration
2. Schwab/Fidelity custodian integration
3. Orion/BlackDiamond portfolio integration
4. Box.com document integration

### Tasks

(Detailed tasks to be refined in HANDOFF_P6.md)

---

## Phase 7: Advanced Features

**Duration**: 2-3 sessions
**Status**: Pending

### Objectives

1. Client database customization
2. Custom dashboard builder
3. Advanced agent triggers
4. Compliance reporting

### Tasks

(Detailed tasks to be refined in HANDOFF_P7.md)

---

## Cross-Phase Considerations

### Effect Patterns (Mandatory)

All code must follow `.claude/rules/effect-patterns.md`:

```typescript
// REQUIRED: Namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// REQUIRED: Effect.gen for async operations
const result = yield* Effect.gen(function* () {
  const data = yield* someEffect;
  return data;
});

// REQUIRED: Effect Schema for all external data
const decoded = yield* S.decodeUnknown(MySchema)(rawData);
```

### @effect/ai Integration

All AI tooling uses @effect/ai:

```typescript
import * as Ai from "@effect/ai";
import * as AiMcp from "@effect/ai/McpServer";
import * as S from "effect/Schema";

// Tool definition with Effect Schema
const GetClientTool = AiMcp.tool({
  name: "getClient",
  description: "Retrieve client profile",
  parameters: S.Struct({
    clientId: S.String,
  }),
  handler: (params) => Effect.gen(function* () {
    // Implementation
  }),
});
```

### Testing Requirements

Each phase must include tests:
- Unit tests for domain logic
- Integration tests for handlers
- Property-based tests for schemas
- E2E tests for critical flows

Use `@beep/testkit` patterns.

### Documentation Requirements

Each phase updates:
- AGENTS.md in affected packages
- REFLECTION_LOG.md with learnings
- HANDOFF_P[N+1].md for next phase

---

## Iteration Protocol

After each phase:

1. **Verify** - Run `bun run check` and `bun run test`
2. **Reflect** - Update REFLECTION_LOG.md
3. **Handoff** - Create HANDOFF_P[N+1].md
4. **Review** - Run `spec-reviewer` agent if structure changed

---

## Emergency Procedures

### If Sync Breaks

1. Check PowerSync service logs
2. Verify Sync Rules match RLS policies
3. Clear client cache and resync
4. Check for schema migrations that broke sync

### If Agent Fails

1. Check agent configuration validity
2. Verify context sources accessible
3. Check tool permissions
4. Review audit log for error details

### If Tests Fail

1. Run isolated: `bun run test --filter @beep/package`
2. Check for RLS context setup in test environment
3. Verify mock data matches schema
