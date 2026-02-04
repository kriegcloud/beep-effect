# Remote Sync Architecture

## Data Flow & Layer Composition

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SDK Instance (Replica A)                     │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │
│  │ AgentRuntime │  │ HookAudit    │  │ ChatHistory.withRecorder│   │
│  │   .query()   │──│ .withAudit() │  │                         │   │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬────────────┘   │
│         │                 │                        │                │
│         │        write()  │  appendMessage()       │                │
│         ▼                 ▼                        ▼                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Storage Layer                            │   │
│  │                                                              │   │
│  │  ┌────────────────┐ ┌───────────────┐ ┌──────────────────┐ │   │
│  │  │AuditEventStore │ │ChatHistoryStore│ │  ArtifactStore   │ │   │
│  │  │                │ │               │ │                  │ │   │
│  │  │ ✅ Journaled   │ │ KV-only today │ │  KV-only today   │ │   │
│  │  │    (EventLog)  │ │ #16: Journal  │ │  #16: Journal    │ │   │
│  │  └───────┬────────┘ └───────┬───────┘ └────────┬─────────┘ │   │
│  │          │                  │                   │            │   │
│  │          ▼                  ▼                   ▼            │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │              EventJournal (KV-backed)                 │   │   │
│  │  │                                                       │   │   │
│  │  │  entries: Entry[]     Per-remote tracking:            │   │   │
│  │  │  idCounter: number    remotes: Map<RemoteId, {        │   │   │
│  │  │  primaryKeys: Map       sequence: number,             │   │   │
│  │  │                         missing: Entry[]              │   │   │
│  │  │                       }>                              │   │   │
│  │  │                                                       │   │   │
│  │  │  writeFromRemote()  ◄── dedup + conflict detect       │   │   │
│  │  │  withRemoteUncommited() ──► entries to push           │   │   │
│  │  │  nextRemoteSequence()                                 │   │   │
│  │  └──────────────────────────┬───────────────────────────┘   │   │
│  │                             │                               │   │
│  └─────────────────────────────┼───────────────────────────────┘   │
│                                │                                    │
│  ┌─────────────────────────────┼───────────────────────────────┐   │
│  │              SyncService (#12)                               │   │
│  │                             │                                │   │
│  │  ┌─────────────────────────┐│┌────────────────────────────┐ │   │
│  │  │     SyncScheduler       │││   ConflictPolicy (#15)     │ │   │
│  │  │                         │││                            │ │   │
│  │  │  interval: Duration     │││  lastWriteWins (default)   │ │   │
│  │  │  push: uncommitted ──►  │││  firstWriteWins            │ │   │
│  │  │  pull: ◄── changes()    │││  merge(fn)                 │ │   │
│  │  │  retry: Schedule        │││  reject                    │ │   │
│  │  └─────────────────────────┘│└────────────────────────────┘ │   │
│  │                             │                                │   │
│  │  ┌─────────────────────────┐│┌────────────────────────────┐ │   │
│  │  │   Compaction (#14)      │││  Selective Sync (#16)      │ │   │
│  │  │                         │││                            │ │   │
│  │  │  byAge(maxAge)          │││  auditLog:    true         │ │   │
│  │  │  byCount(maxEntries)    │││  chatHistory: false        │ │   │
│  │  │  bySize(maxBytes)       │││  artifacts:   false        │ │   │
│  │  │  composite(...)         │││                            │ │   │
│  │  └─────────────────────────┘│└────────────────────────────┘ │   │
│  │                             │                                │   │
│  └─────────────────────────────┼───────────────────────────────┘   │
│                                │                                    │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                    EventLogRemote Protocol
                    ─────────────────────────
                    Hello ──►
                    ◄── RequestChanges(seq)
                    WriteEntries ──►
                    ◄── Changes(entries)
                    Ack ──►
                    Ping/Pong
                    (MsgPack + optional encryption)
                                 │
                    WebSocket    │    TCP Socket
                    ─────────────┼──────────────
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  EventLogRemoteServer (#13)                          │
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────────────────────────┐  │
│  │  Connection Mgr   │    │         Server EventJournal           │  │
│  │                   │    │                                       │  │
│  │  replica_A ●──────┼───►│  Central journal aggregates all      │  │
│  │  replica_B ●──────┼───►│  entries from connected replicas     │  │
│  │  replica_C ●──────┼───►│                                       │  │
│  │                   │    │  Fan-out: broadcast new entries       │  │
│  │  auth + encrypt   │    │  to all other connected replicas     │  │
│  └──────────────────┘    └──────────────┬───────────────────────┘  │
│                                          │                          │
│                    ┌─────────────────────┼─────────────────────┐   │
│                    │    Persistence Backend                     │   │
│                    │                                            │   │
│                    │  Cloudflare Durable Objects / KV / D1      │   │
│                    │  layerFileSystemBun()  ── local dev        │   │
│                    │  layerKeyValueStore()  ── pluggable        │   │
│                    │  layerSql()           ── PostgreSQL        │   │
│                    └────────────────────────────────────────────┘   │
│                                                                     │
│  Deployed as Cloudflare Worker (production)                         │
│  or Bun.serve() (local development)                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Layer Composition

```typescript
// Full setup with remote sync (chat history example)
const chatLayer = ChatHistoryStore.layerJournaledWithSyncWebSocket(serverUrl)

AgentRuntime.layerWithPersistence({
  layers: {
    runtime:      AgentRuntime.layerDefaultFromEnv(),
    chatHistory:  chatLayer,                                 // #16 + sync
    artifacts:    ArtifactStore.layerJournaled(),            // #16
    auditLog:     AuditEventStore.layerFileSystemBun(),
    sessionIndex: SessionIndexStore.layerFileSystemBun(),
  }
}).pipe(
  Layer.provide(ConflictPolicy.layerLastWriteWins()),       // #15
  Layer.provide(Compaction.layerByAge("30 days")),          // #14
  Layer.provide(StorageConfig.layerFromEnv()),
)

// Note: each journaled store owns its own EventLog. To sync artifacts too,
// use `ArtifactStore.layerJournaledWithSyncWebSocket(serverUrl)`.
```

## Issue Tracker

| Issue | Component | Description |
|-------|-----------|-------------|
| [#12](https://github.com/mepuka/effect-claude-agent-sdk/issues/12) | SyncService | Bidirectional sync orchestration with scheduling, retries, backpressure |
| [#13](https://github.com/mepuka/effect-claude-agent-sdk/issues/13) | EventLogRemoteServer | Cloudflare Worker / Bun server accepting replica connections |
| [#14](https://github.com/mepuka/effect-claude-agent-sdk/issues/14) | Compaction | byAge, byCount, bySize strategies to bound journal growth |
| [#15](https://github.com/mepuka/effect-claude-agent-sdk/issues/15) | ConflictPolicy | lastWriteWins, firstWriteWins, merge, reject policies |
| [#16](https://github.com/mepuka/effect-claude-agent-sdk/issues/16) | Store Extensions | Journal-backed ChatHistoryStore and ArtifactStore for sync |
