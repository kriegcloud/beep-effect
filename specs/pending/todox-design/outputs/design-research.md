# Design Research: Todox Application

> Pre-P0 research findings from comprehensive analysis of architecture options.

**Date**: 2026-01-18
**Research Agents**: 4 parallel (multi-tenancy, sync engines, agent architectures, integrations)

---

## 1. Multi-Tenancy Architecture

### Recommendation: Row-Level Security (RLS)

**Selected over**: Database-per-tenant, Schema-per-tenant

**Key Findings**:

| Pattern | Pros | Cons | Use Case |
|---------|------|------|----------|
| RLS + tenant_id | Single schema, easy migrations, strong isolation | Complex policies, requires session context | SaaS with shared infrastructure |
| Schema-per-tenant | Good isolation, per-tenant customization | Migration complexity, connection overhead | Moderate isolation needs |
| Database-per-tenant | Maximum isolation, per-tenant encryption | Operational overhead, connection limits | Enterprise compliance |

**Implementation Pattern**:
```sql
-- All tenant-scoped tables get org_id
ALTER TABLE workspaces ADD COLUMN org_id UUID NOT NULL REFERENCES organizations(id);

-- RLS policy pattern
CREATE POLICY tenant_isolation ON workspaces
  FOR ALL
  USING (org_id = current_setting('app.current_org_id')::uuid);

-- Session context (in Effect middleware)
SET LOCAL app.current_org_id = 'org-uuid';
SET LOCAL app.current_user_id = 'user-uuid';
```

**Industry Reference**: GitHub, Linear, Slack all use RLS-style tenant isolation.

---

## 2. Local-First Sync Engine

### Recommendation: PowerSync

**Selected over**: Zero, LiveStore, ElectricSQL, Triplit, VLCN, Liveblocks, Y.js

### Comparison Matrix

| Feature | Zero | LiveStore | ElectricSQL | Triplit | PowerSync |
|---------|------|-----------|-------------|---------|-----------|
| **Production Ready** | No | Beta | Yes | Yes | **Yes** |
| **Offline Writes** | No | Yes | Via API | Yes | **Via API** |
| **Built-in Permissions** | Yes | No | No | Yes | **JWT Rules** |
| **PostgreSQL** | Yes | No | Yes | No | **Yes** |
| **Multi-tenant** | Yes | Manual | Manual | Yes | **Yes** |
| **Scalability** | Low | Medium | High | Low | **High** |

**Why PowerSync**:
1. Production-proven with industrial heritage
2. Sync Rules perfectly fit org_id + team_id partitioning
3. JWT token integration for authorization
4. PostgreSQL-native (aligns with existing stack)
5. Open source, self-hostable

**Sync Rules Example**:
```yaml
bucket_definitions:
  org_data:
    parameters: |
      SELECT org_id FROM organization_members
      WHERE user_id = token_parameters.user_id
    data:
      - SELECT * FROM workspaces WHERE org_id = bucket.org_id
      - SELECT * FROM documents WHERE org_id = bucket.org_id
```

---

## 3. AI Agent Architecture

### Recommendation: @effect/ai + McpServer

**Selected over**: Vercel AI SDK, LangChain, CrewAI

**Key Findings**:

| Framework | Effect Integration | Schema Support | MCP Support |
|-----------|-------------------|----------------|-------------|
| Vercel AI SDK | None (Promise-based) | Zod | Partial |
| LangChain | None | Zod | Yes |
| **@effect/ai** | **Native** | **Effect Schema** | **McpServer** |

**Agent Architecture Pattern**:
```
┌─────────────────────────────────────────────────────────┐
│                  DETERMINISTIC FLOW LAYER                │
│  (Triggers, Routing, Permissions, Checkpoints)           │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │ Email Agent  │ │ Research     │ │ Task Agent   │
   └──────────────┘ │ Agent        │ └──────────────┘
                    └──────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    MCP TOOL LAYER                        │
│    (@effect/ai/McpServer, Permission enforcement)        │
└─────────────────────────────────────────────────────────┘
```

**McpServer Pattern**:
```typescript
import * as AiMcp from "@effect/ai/McpServer";
import * as S from "effect/Schema";

const GetClientTool = AiMcp.tool({
  name: "getClient",
  description: "Retrieve client profile",
  parameters: S.Struct({
    clientId: S.String,
  }),
  handler: (params) => Effect.gen(function* () {
    // Implementation with Effect.gen
  }),
});
```

---

## 4. Integration Priorities

### Tier 1 (MVP)

| Integration | Priority | Complexity | Rationale |
|-------------|----------|------------|-----------|
| **Gmail OAuth** | P0 | Medium | Email automation is core MVP |
| **Salesforce/Wealthbox** | P1 | Medium | CRM is data hub |
| **Schwab + Fidelity** | P1 | High | 80%+ of RIA assets |

### Tier 2 (Post-MVP)

| Integration | Priority | Complexity | Rationale |
|-------------|----------|------------|-----------|
| Orion/BlackDiamond | P2 | Medium | Portfolio data |
| Box.com | P2 | Low | Document management |
| Zocks | P2 | Medium | Meeting intelligence |
| Zoom (via Recall.ai) | P2 | Medium | Meeting capture |

### Skip

| Integration | Reason |
|-------------|--------|
| Cluely | Major 2025 data breach (83k users) |
| Arch | Too niche |

---

## 5. Domain Model

### Validated Entities

```typescript
// Core Multi-Tenancy
Organization { id, name, slug, tier, settings }
Team { id, orgId, name }
OrganizationMember { id, orgId, userId, role }
TeamMember { id, teamId, userId, role }

// WorkSpace System
WorkSpace { id, orgId, teamId?, ownerId?, type, parentId?, name }
Document { id, workspaceId, title, icon, blocks }
Block { id, type, content, children, order }
File { id, workspaceId, name, path, mimeType, size }

// Email Integration
EmailAccount { id, userId, provider, credentials }
EmailThread { id, accountId, orgId, subject, participants }
EmailMessage { id, threadId, body, attachments }

// Agent System
Agent { id, orgId, name, systemPrompt, personality }
ContextSource { agentId, type, sourceId }
ToolPermission { agentId, toolId, enabled, requiresApproval }
AgentTrigger { agentId, type, config }

// Dashboard System
Dashboard { id, orgId, teamId?, ownerId?, layout, widgets }
```

---

## 6. Compliance Considerations

### FINRA/SEC Requirements

| Requirement | Implementation |
|-------------|----------------|
| Audit trails | Event sourcing pattern, immutable logs |
| Data retention | 7-year retention policy |
| Encryption | At-rest (PostgreSQL) + in-transit (TLS) |
| Access logging | All data access logged |
| WORM compliance | Immutable audit log storage |

### Key Deadline

- **December 2025**: Regulation S-P compliance for RIAs with $1.5B+ AUM

---

## Sources

### Multi-Tenancy
- [GitHub Multi-Tenant Patterns](https://docs.github.com/)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Neon Multi-Tenant Guide](https://neon.tech/docs/guides/multi-tenant)

### Sync Engines
- [PowerSync Documentation](https://docs.powersync.com/)
- [Zero Documentation](https://zero.rocicorp.dev/)
- [ElectricSQL Documentation](https://electric-sql.com/docs)
- [Triplit Documentation](https://www.triplit.dev/docs)

### Agent Architectures
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Anthropic Agent Patterns](https://docs.anthropic.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

### Wealth Management Integrations
- [Salesforce Financial Services Cloud](https://www.salesforce.com/financial-services/)
- [Schwab Advisor Services](https://advisorservices.schwab.com/)
- [Orion API Documentation](https://developers.orionadvisor.com/)
