# Architecture Review — 2026-02-26

## Overview

Deep review of cluster-based architecture, model selection, and feature readiness.

---

## Model Selection Architecture

**Current:** Models are agent-owned and static. Resolved per-turn from `AgentConfig` → `agentId` → `profile.model` (`TurnProcessingWorkflow.ts:188-195`). Config loaded from `agent.yaml` at startup — immutable at runtime.

**What works:**
- Different agents use different models (configured per-agent in `agent.yaml`)
- Model layer resolved fresh each turn (not cached on session)
- `Chat.Persistence` stores history in provider-agnostic format
- `ModelRegistry` supports anthropic, openai, openrouter, google providers

**What doesn't work:**
- No mechanism to switch model mid-conversation without changing agentId
- Sessions have zero model awareness (no `model_config_json` column)
- No per-turn model metadata tracking (can't audit which model generated which response)

**Path to dynamic switching (minimal, ~2 days):**
1. Add optional `model?: { provider, modelId }` to `SessionState`
2. In workflow: `const modelConfig = session.model ?? profile.model`
3. Backward compatible — existing sessions continue using agent default

---

## Cluster Entity Design

### Entity Hierarchy

| Entity | Key | Purpose |
|--------|-----|---------|
| `SessionEntity` | sessionId | Turn processing, conversation state |
| `CLIAdapterEntity` | channelId | CLI channel adapter (shared AdapterProtocol) |
| `WebChatAdapterEntity` | channelId | WebChat channel adapter |
| `MemoryEntity` | agentId | Memory tiers (episodic/semantic/procedural) |
| `AgentEntity` | agentId | Agent state (permissions, token budget) |
| `IntegrationEntity` | integrationId | MCP service lifecycle (scaffolded) |
| `SchedulerCommandEntity` | scheduleId | Schedule commands (run_now, pause, resume) |

### Strengths
- Entities use persisted RPCs with `primaryKey` for idempotency
- Recovery: entities reconstruct from persistence layer (SQLite ports)
- Sharding by natural keys (sessionId, channelId, agentId) distributes load correctly
- Error schemas properly defined per RPC

### Known Issues
- **Streaming RPC persistence workaround**: `SessionEntity.processTurn` is non-persisted due to Effect beta bug (stream + persisted + DateTimeUtc transforms). Documented in `cluster-entities.md`.
- **No entity state migration**: fine for SingleRunner but would need attention for multi-node.

---

## Port/Adapter Pattern

### Port Tags (`PortTags.ts`)
- AgentStatePortTag, SessionTurnPortTag, MemoryPortTag, GovernancePortTag
- ChannelPortTag, IntegrationPortTag, SchedulePortTag

### Implementations
- **Production**: `*PortSqlite` (AgentStatePortSqlite, SessionTurnPortSqlite, MemoryPortSqlite, etc.)
- **Testing**: `*PortMemory` (GovernancePortMemory, SchedulePortMemory, AgentStatePortMemory, etc.)

### Assessment
- Clean separation — ports define narrow contracts, implementations are swappable
- Type safety via branded IDs prevents cross-domain mixing
- Layer composition in `server.ts` wires everything together

### Gaps
- No async context propagation (audit context manually threaded through each call)
- `MemoryPortSqlite` couples FTS5 search to storage (should separate search port for vector DB)
- `IntegrationPort` lacks bidirectional messaging (needed for MCP callbacks)

---

## Gateway / API Layer

### Routes
- `POST /channels/:channelId/initialize` → adapter init
- `POST /channels/:channelId/messages` → SSE streaming turn
- `GET /channels/:channelId/history` → conversation history
- `GET /channels/:channelId/status` → channel status
- `GET /health` → health check
- `EntityProxy.toHttpApiGroup` auto-derives endpoints for AgentEntity, MemoryEntity

### Strengths
- SSE streaming correctly implemented (backpressure, error → TurnFailedEvent)
- Adapters share `ChannelCore` for consistent behavior

### Gaps
- Manual URL path parsing (`extractParam`) — fragile
- No authentication/authorization at gateway layer
- Error response format inconsistent across endpoints
- IntegrationEntity not exposed via HTTP

---

## Ontology Alignment

### Well-Aligned
| Ontology Class | Implementation |
|---------------|----------------|
| `pao:AIAgent` | AgentEntity (permissionMode, tokenBudget) |
| `pao:Session` | SessionEntity (sessionId, conversationId) |
| `pao:Memory` (3 tiers) | MemoryEntity (search, store, retrieve, forget) |
| `pao:Channel` | CLIAdapterEntity, WebChatAdapterEntity |
| `pao:ContentBlock` | TextBlock, ToolUseBlock, ToolResultBlock, ImageBlock |
| `pao:Policy` | GovernancePort (Allow/Deny/RequireApproval) |
| `pao:Persona` | AgentConfig persona (name, systemPrompt) |
| `pao:FoundationModel` | ModelRegistry (provider, modelId) |
| `pao:Schedule` | SchedulerRuntime, SchedulerDispatchLoop |
| `pao:ExternalService` | IntegrationEntity (scaffolded) |

### Not Yet Implemented
| Ontology Class | Status |
|---------------|--------|
| `pao:SubAgent` | Not modeled — blocks multi-agent delegation |
| `pao:Task` | No explicit task type |
| `pao:Goal` | No goal/objective state for agents |
| `pao:CompactionEvent` | No context window compression |
| `pao:ErrorRecoveryEvent` | No structured error recovery tracing |
| `pao:KnowledgeBase` | No knowledge graph integration |
| `pao:Claim` | No structured knowledge assertions |

---

## Feature Readiness Assessment

| Feature | Readiness | Key Blocker |
|---------|-----------|-------------|
| Multi-channel sessions | 70% | Sessions are per-channel, need userId + session sharing |
| Scheduled tasks | 80% | Need cron validation, timezone support |
| Governance / policies | 75% | Need policy DSL, human-in-the-loop approval |
| Memory tiers | 70% | Need vector embeddings for semantic similarity |
| Dynamic model switching | 90% | Minimal change: session-level model override |
| MCP tools | 30% | Need transport layer + dynamic tool registration |
| Multi-agent orchestration | 10% | SubAgentEntity + delegation tool + budget sharing |
| Context compression | 0% | CompactionEvent not started |
| Auth / multi-tenancy | 0% | No auth middleware, no row-level security |

---

## Recommended Priorities

### Immediate (next 2 slices)
1. **Session sharing across channels** (~3-5 days) — quick win, unblocks multi-channel UX
2. **Context window compression** (~5 days) — prevents OOM on long conversations
3. **Session-level model override** (~2 days) — enables dynamic model switching

### Medium-term
4. **MCP transport** (~16-20 days) — highest ROI for tool integration
5. **Policy DSL + approval workflow** (~8-10 days)
6. **Vector semantic search** (~8 days)

### Long-term
7. **Multi-agent delegation** (~10 days)
8. **Auth & multi-tenancy** (~8 days)
9. **Observability & resilience** (~15 days)

---

## Bug Fix Applied This Session

**`AnthropicStructuredOutput: Unsupported AST Declaration`** — All tools in `ToolRegistry.ts` had `failureMode: "return"`, which caused the Toolkit to build `Schema.Union([success, failure, AiError.AiError])`. `AiError.AiError` is a `Schema.ErrorClass` (Declaration AST), which the Anthropic codec transformer rejects. **Fix:** Removed `failureMode: "return"` from all three tools. Result schema now uses only `tool.successSchema` — no Declaration in the union.
