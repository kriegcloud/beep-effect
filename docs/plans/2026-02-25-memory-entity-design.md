# MemoryEntity — Design Document

**Date:** 2026-02-25
**Status:** Approved
**Goal:** Implement a MemoryEntity cluster entity with Store/Retrieve/Forget RPCs, SQLite + FTS5 persistence, and pre-turn context injection in TurnProcessingWorkflow.

---

## Context

The PAO ontology defines a rich memory system with four tiers (Working, Episodic, Semantic, Procedural), five operations (Encoding, Retrieval, Consolidation, Forgetting, Rehearsal), and three item subtypes (Episode, Claim, MemoryBlock). Currently the codebase has a stubbed `MemoryPortMemory` (in-memory, text substring match) that nothing uses.

This slice implements the foundation: a dedicated MemoryEntity cluster entity that owns persistent memory storage. It aligns with the broader actor-based architecture where MemoryAgent is a first-class entity managing long-term knowledge, separate from the conversation entity.

### Ontology Alignment

| Ontology Concept | Implementation |
|-----------------|----------------|
| `pao:MemoryItem` | `memory_items` table row |
| `pao:MemoryTier` (Working, Episodic, Semantic, Procedural) | `tier` column enum. Working = ChatPersistence (already exists). Procedural = AgentConfig persona (already exists). This slice adds Semantic + Episodic. |
| `pao:MemoryScope` (SessionScope, ProjectScope, GlobalScope) | `scope` column enum |
| `pao:MemorySource` (UserSource, SystemSource, AgentSource) | `source` column enum |
| `pao:SensitivityLevel` | `sensitivity` column enum |
| `pao:Encoding` | `store` RPC |
| `pao:Retrieval` | `retrieve` RPC |
| `pao:Forgetting` | `forget` RPC |
| `pao:Consolidation` / `pao:Rehearsal` | Deferred to future slice (background routines) |

### Tier Semantics

| Tier | Context Behavior | Write Mechanism | Status |
|------|-----------------|-----------------|--------|
| **Procedural** | Always in context (system prompt + tools) | AgentConfig | Already exists |
| **Working** | Always in context (current conversation) | ChatPersistence | Already exists |
| **Semantic** | Auto-injected before each turn | Agent calls explicit tools | **This slice** |
| **Episodic** | Retrieved on-demand by agent | Agent-initiated or background routine | **This slice** (storage + retrieval) |

---

## Data Model

### `memory_items` Table

```sql
CREATE TABLE memory_items (
  memory_item_id    TEXT PRIMARY KEY,
  agent_id          TEXT NOT NULL,
  tier              TEXT NOT NULL CHECK (tier IN ('SemanticMemory', 'EpisodicMemory')),
  scope             TEXT NOT NULL CHECK (scope IN ('SessionScope', 'ProjectScope', 'GlobalScope')),
  source            TEXT NOT NULL CHECK (source IN ('UserSource', 'SystemSource', 'AgentSource')),
  content           TEXT NOT NULL,
  metadata_json     TEXT,
  generated_by_turn_id TEXT,
  session_id        TEXT,
  sensitivity       TEXT NOT NULL DEFAULT 'Internal'
                    CHECK (sensitivity IN ('Public', 'Internal', 'Confidential', 'Restricted')),
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE INDEX idx_memory_items_agent_tier ON memory_items(agent_id, tier);
CREATE INDEX idx_memory_items_agent_scope ON memory_items(agent_id, scope);
```

### FTS5 Virtual Table

```sql
CREATE VIRTUAL TABLE memory_items_fts USING fts5(
  content,
  metadata_json,
  content=memory_items,
  content_rowid=rowid
);

-- Triggers to keep FTS in sync
CREATE TRIGGER memory_items_ai AFTER INSERT ON memory_items BEGIN
  INSERT INTO memory_items_fts(rowid, content, metadata_json)
  VALUES (new.rowid, new.content, new.metadata_json);
END;

CREATE TRIGGER memory_items_ad AFTER DELETE ON memory_items BEGIN
  INSERT INTO memory_items_fts(memory_items_fts, rowid, content, metadata_json)
  VALUES ('delete', old.rowid, old.content, old.metadata_json);
END;

CREATE TRIGGER memory_items_au AFTER UPDATE ON memory_items BEGIN
  INSERT INTO memory_items_fts(memory_items_fts, rowid, content, metadata_json)
  VALUES ('delete', old.rowid, old.content, old.metadata_json);
  INSERT INTO memory_items_fts(rowid, content, metadata_json)
  VALUES (new.rowid, new.content, new.metadata_json);
END;
```

---

## MemoryEntity — Cluster Entity

**Entity identity:** Keyed by `agentId` — one MemoryEntity instance per agent.

### RPCs

| RPC | Type | Payload | Returns |
|-----|------|---------|---------|
| `store` | Persisted | `{ items: StoreItemInput[] }` | `{ storedIds: MemoryItemId[] }` |
| `retrieve` | Non-persisted | `{ query: string, tier?: MemoryTier, scope?: MemoryScope, limit?: number }` | `MemoryItemRecord[]` |
| `forget` | Persisted | `{ cutoffDate?: Instant, scope?: MemoryScope, itemIds?: MemoryItemId[] }` | `{ deletedCount: number }` |
| `listItems` | Non-persisted | `{ tier?: MemoryTier, scope?: MemoryScope, limit?: number }` | `MemoryItemRecord[]` |

### StoreItemInput

```typescript
interface StoreItemInput {
  tier: "SemanticMemory" | "EpisodicMemory"
  scope: "SessionScope" | "ProjectScope" | "GlobalScope"
  source: "UserSource" | "SystemSource" | "AgentSource"
  content: string
  metadataJson?: string
  generatedByTurnId?: TurnId
  sessionId?: SessionId
}
```

---

## MemoryPortSqlite

Internal service backing the entity. Methods:

- `encode(agentId, items)` — INSERT into `memory_items` + FTS sync via triggers
- `retrieve(agentId, query, filters)` — FTS5 MATCH query with tier/scope WHERE clauses
- `forget(agentId, filters)` — DELETE with cutoff/scope/id filters
- `list(agentId, filters)` — SELECT with tier/scope filters

---

## Turn Workflow Integration

In `TurnProcessingWorkflow`, after policy check but **before** the LLM call:

1. Call `memoryEntity.retrieve({ query: userMessage, tier: "SemanticMemory", limit: 20 })`
2. Format retrieved items as a context block
3. Prepend to the user prompt or append to the system prompt

```
[Relevant Memory]
- User's name is Alex
- User prefers concise responses
- User works with TypeScript and Effect

[User Message]
Hello, can you help me with...
```

This read happens **outside** an Activity boundary — it's a snapshot, so workflow replay determinism is preserved. The memory content becomes part of the prompt text which is already journaled.

---

## Layer Wiring

```
MemoryPortSqlite.layer ← sqlInfrastructureLayer
MemoryEntity.layer ← clusterLayer, memoryPortSqliteLayer

Updated in server.ts:
  memoryPortSqliteLayer = MemoryPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  memoryEntityLayer = MemoryEntity.layer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(memoryPortSqliteLayer)
  )
```

The existing `MemoryPortTag` and `MemoryPortMemory` remain for now (used by `PortsLive`). The entity provides a higher-level interface. In a follow-up, `MemoryPortTag` can be wired to delegate to the entity.

---

## Domain Types (packages/domain)

New types in `packages/domain/src/memory.ts`:

- `MemoryTier = "SemanticMemory" | "EpisodicMemory"` (subset for this slice)
- `MemoryScope = "SessionScope" | "ProjectScope" | "GlobalScope"`
- `MemorySource = "UserSource" | "SystemSource" | "AgentSource"`
- `SensitivityLevel = "Public" | "Internal" | "Confidential" | "Restricted"`
- `MemoryItemRecord` (updated from ports.ts with richer fields)

---

## Test Strategy

- **Unit tests**: `MemoryPortSqlite.test.ts` — CRUD, FTS5 search ranking, tier/scope filters
- **Entity tests**: `MemoryEntity.test.ts` — RPC round-trips via `Entity.makeTestClient`
- **Integration**: Update `TurnProcessingWorkflow.e2e.test.ts` to verify memory context injection
- Use `it.effect` for unit/entity tests, `it.live` for workflow tests (SingleRunner needs real clock)

---

## What's Deferred

- **Consolidation** (episodic → semantic promotion) — background workflow, future slice
- **Rehearsal** (strengthen items on repeated access) — future slice
- **Vector/embedding search** — swap FTS5 for semantic similarity later
- **Agent memory tools** (memory.save_fact, memory.recall) — next slice after this
- **Episode/Claim/MemoryBlock subtypes** — future refinement of MemoryItem
