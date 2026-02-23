# Reflection Log: Todox Design

> Cumulative learnings from spec execution. Updated after each phase.

---

## Entry 1: Initial Design Research

**Date**: 2026-01-18
**Phase**: Pre-P0 (Design Research)
**Author**: Orchestrator

### What Worked

1. **Parallel research agents** - Launching 4 research agents simultaneously (multi-tenancy, sync engines, agent architectures, integrations) maximized information gathering efficiency.

2. **Domain expert input** - The list of specific integrations (FrontApp, Zocks, Vanilla, etc.) from the domain expert provided concrete targets rather than abstract requirements.

3. **Comparative analysis** - Evaluating 8 sync engines (Zero, LiveStore, ElectricSQL, Triplit, PowerSync, VLCN, Liveblocks, Y.js) against the same criteria enabled clear recommendation.

### What Didn't Work

1. **Initial Zero assumption** - The user's initial preference for Zero required research to redirect. Zero is alpha-quality with no offline writes yet.

2. **0.email ambiguity** - The reference to "0.email" was unclear; research revealed it's similar to "Inbox Zero" / "Zero" AI email clients.

### Key Learnings

1. **PowerSync is the clear winner** for this use case:
   - Production-proven industrial heritage
   - JWT-based Sync Rules perfect for multi-tenant auth
   - PostgreSQL-native
   - Open source, self-hostable

2. **Hybrid sync architecture** is the pattern used by Linear, Notion, Figma:
   - Sync engine for reads (efficient real-time data delivery)
   - Traditional API for writes (validation, authorization, business logic)
   - Single database as source of truth

3. **RLS + tenant_id** is the multi-tenancy pattern:
   - Denormalize org_id onto ALL tenant-scoped tables
   - Use session pooling mode with SET LOCAL for RLS context
   - Enterprise tier can upgrade to dedicated database

4. **@effect/ai is the right choice** for agent tooling:
   - Native Effect Schema integration
   - McpServer for tool definitions
   - Aligns with existing @beep/schema patterns

### Pattern Extracted

**Research Agent Parallelization**:
When researching a complex design space, launch specialized research agents in parallel for each major dimension (data layer, sync, AI tooling, integrations). Wait for all to complete, then synthesize.

### Applied Improvements

- Updated spec to use PowerSync instead of Zero
- Updated spec to use @effect/ai instead of Vercel AI SDK
- Documented RLS + tenant_id pattern for multi-tenancy

---

## Template for Future Entries

```markdown
## Entry N: [Phase/Topic]

**Date**: YYYY-MM-DD
**Phase**: P[N]
**Author**: [Agent or User]

### What Worked

1. [Success 1]
2. [Success 2]

### What Didn't Work

1. [Issue 1]
2. [Issue 2]

### Key Learnings

1. [Learning 1]
2. [Learning 2]

### Pattern Extracted

[Reusable pattern discovered]

### Applied Improvements

[Changes made to spec or process based on learnings]
```

---

## Cumulative Patterns

| Pattern | Source Entry | Applied To |
|---------|--------------|------------|
| Research Agent Parallelization | Entry 1 | P0 research tasks |
| PowerSync for multi-tenant sync | Entry 1 | Architecture decision |
| @effect/ai for agent tooling | Entry 1 | P4 agent framework |
