# Todox Application Design Specification

**Status**: Phase 0 (Foundation)
**Complexity**: Complex (8+ sessions expected)

---

## Purpose

Design and implement Todox, an AI-native multi-tenant SaaS application for small to midsize wealth management firms. Todox automates repetitive tasks through intelligent agents, email automation, and collaborative workspaces.

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Organization** | GitHub-style tenant boundary (wealth management firm) |
| **WorkSpace** | Notion-like collaborative containers with Documents, Databases, and Files |
| **Client Database** | Structured data about clients (CRM-like) providing AI context |
| **Agent** | User-configurable AI assistant with context sources and tool permissions |
| **Dashboard** | FlexLayout-powered real-time collaborative workspace UI |

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              TODOX CLIENT                                │
├─────────────────────────────────────────────────────────────────────────┤
│  PowerSync SQLite      │  Liveblocks          │  @effect/ai/McpServer   │
│  (structured data)     │  (presence/cursors)  │  (agent tooling)        │
└──────────┬─────────────┴───────┬──────────────┴────────────┬────────────┘
           │                     │                           │
           ▼                     ▼                           ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐
│  PowerSync Service   │  │  Liveblocks      │  │  Effect Backend API      │
│  (self-hosted)       │  │  Cloud           │  │  (@effect/rpc handlers)  │
└────────┬─────────────┘  └──────────────────┘  └──────────────┬───────────┘
         │                                                     │
         ▼                                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PostgreSQL + Row-Level Security                       │
│  (source of truth, tenant isolation via org_id)                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

### Quantitative

- [ ] Multi-tenant RLS policies cover 100% of tenant-scoped tables
- [ ] PowerSync sync rules correctly partition data by org_id + team_id
- [ ] FlexLayout workspace persistence achieves <100ms layout restore
- [ ] Email sync latency <5s for new messages
- [ ] Agent tool execution respects permission boundaries (100% coverage)
- [ ] All @effect/ai integrations use Effect Schema (no Zod or manual types)

### Qualitative

- [ ] WorkSpaces support hierarchical nesting (Notion-style)
- [ ] Agents can be configured via UI without code changes
- [ ] Dashboard layouts persist and sync across devices
- [ ] Email automation supports approval workflows
- [ ] FINRA/SEC compliance requirements addressed in audit trail design

---

## Phase Overview

| Phase | Description | Sessions | Status |
|-------|-------------|----------|--------|
| **P0** | Foundation: Multi-tenancy + RLS + PowerSync spike | 1-2 | Pending |
| **P1** | WorkSpaces: Documents, Files, Hierarchical structure | 2-3 | Pending |
| **P2** | FlexLayout Integration: Unify /demo and / routes | 1-2 | Pending |
| **P3** | Email Integration: Gmail OAuth + read-only sync | 2-3 | Pending |
| **P4** | Agent Framework: @effect/ai + MCP server | 2-3 | Pending |
| **P5** | Email Automation: Send + approval workflows | 2-3 | Pending |
| **P6** | Integrations: Salesforce/Wealthbox + Schwab/Fidelity | 3-4 | Pending |
| **P7** | Advanced Features: Client DBs, Custom Dashboards | 2-3 | Pending |

---

## Key Technology Decisions

### Local-First Sync: PowerSync

**Selected over**: Zero, LiveStore, ElectricSQL, Triplit

**Rationale**:
- Production-proven with industrial heritage
- Excellent Sync Rules for multi-tenant JWT-based authorization
- Full SQLite on client for complex queries
- PostgreSQL-native (aligns with existing stack)
- Open source, self-hostable

### AI Tooling: @effect/ai + McpServer

**Selected over**: Vercel AI SDK, LangChain

**Rationale**:
- Native Effect integration with existing @beep/schema
- McpServer from @effect/ai for tool definitions
- Effect.gen-based agent flows
- Type-safe tool parameters via Effect Schema

### Multi-Tenancy: Row-Level Security

**Selected over**: Database-per-tenant, Schema-per-tenant

**Rationale**:
- Single schema simplifies migrations
- RLS provides strong isolation with session context
- Enterprise tier can upgrade to dedicated database if needed
- Aligns with GitHub/Linear/Slack patterns

---

## Directory Structure

```
specs/todox-design/
├── README.md                      # This overview
├── QUICK_START.md                 # 5-minute triage
├── MASTER_ORCHESTRATION.md        # Phase workflows & checkpoints
├── AGENT_PROMPTS.md               # Ready-to-use agent prompts
├── RUBRICS.md                     # Evaluation criteria
├── REFLECTION_LOG.md              # Session learnings
├── outputs/
│   ├── design-research.md         # Initial research findings
│   ├── spec-review.md             # Spec quality review
│   └── ...                        # P0 deliverables (created during execution)
├── handoffs/
│   ├── P0_ORCHESTRATOR_PROMPT.md  # Phase 0 orchestrator
│   ├── HANDOFF_P1.md              # Phase 0→1 handoff (after P0)
│   └── ...
└── templates/
    └── agent-config.template.ts   # Agent configuration schema template
```

---

## Quick Start

### For New Instances

1. Read [QUICK_START.md](./QUICK_START.md) for 5-minute triage
2. Read `handoffs/P0_ORCHESTRATOR_PROMPT.md` for current phase
3. Execute Phase 0: Foundation

### Key Reference Files

| File | Purpose |
|------|---------|
| `apps/todox/src/app/page.tsx` | Root route (theme reference) |
| `apps/todox/src/app/demo/` | FlexLayout demo (capability reference) |
| `packages/ui/ui/src/flexlayout-react/` | FlexLayout wrapper |
| `packages/iam/client/` | IAM client patterns (handler factory) |
| `.claude/rules/effect-patterns.md` | Mandatory Effect patterns |

---

## Agents Used

| Agent | Phase | Purpose |
|-------|-------|---------|
| `codebase-researcher` | P0, P1 | Explore existing patterns |
| `mcp-researcher` | P4 | Effect/AI documentation |
| `web-researcher` | P0 | External integration research |
| `architecture-pattern-enforcer` | All | Validate layer boundaries |
| `test-writer` | All | Create test coverage |
| `doc-writer` | P7 | Final documentation |
| `reflector` | All | Log and synthesize learnings |

---

## Implementation Scope

### In Scope

- Multi-tenant organization/team/user model
- WorkSpaces with Documents, Databases, Files
- FlexLayout-based dashboard system
- Gmail OAuth integration for email
- @effect/ai agent framework with MCP servers
- PowerSync local-first sync
- Tier 1 integrations (Salesforce, Schwab, Fidelity)

### Out of Scope (Future Phases)

- IMAP/SMTP generic email support
- Outlook integration
- P2P sync (decentralized)
- Mobile native apps
- Custom AI model training

---

## Related Documentation

- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md)
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
- [RUBRICS.md](./RUBRICS.md)
- [Effect Patterns](../../.claude/rules/effect-patterns.md)
- [Existing Todox App](../../apps/todox/)
- [Spec Guide](../_guide/README.md)
- [HANDOFF_STANDARDS](../_guide/HANDOFF_STANDARDS.md)
