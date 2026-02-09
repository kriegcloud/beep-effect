# Durable Workflow Patterns: @effect/workflow + @effect/cluster

## Scope
This report focuses on durable workflow patterns in this repo and externally, with emphasis on:
- `ClusterWorkflowEngine` + `SingleRunner` (SQL-backed runner storage)
- Migration and storage concerns
- Prefixing / multi-tenant isolation
- Performance and monitoring gotchas

## In-repo findings

### 1) effect-ontology (core-v2) reference implementation

**A. Runtime selection between memory and durable SQL**
- `packages/@core-v2/src/server.ts` selects `ClusterWorkflowEngine` with `SingleRunner` and a `PgClient` when `POSTGRES_HOST` is set, otherwise it falls back to `WorkflowEngine.layerMemory`.
- This mirrors a production vs dev toggle in a single file: durable engine when Postgres is configured, memory when it is not.

**B. SQL-backed SingleRunner and durable workflow engine**
- `ClusterWorkflowEngine.layer` is composed with `SingleRunner.layer({ runnerStorage: "sql" })` and a `PgClient` layer.
- This is the canonical “durable engine with SQL-backed runner storage” wiring in core-v2.

**C. Persistence layers + explicit prefixes for cluster tables**
- `Runtime/Persistence/PostgresLayer.ts` constructs `SqlMessageStorage` and `SqlRunnerStorage` with an explicit prefix `"workflow_"`, resulting in:
  - `workflow_cluster_messages`
  - `workflow_cluster_replies`
  - `workflow_cluster_runners`
- This is an explicit isolation step for cluster tables and avoids cross-app/table collisions.

**D. Migration strategy**
- `Runtime/Persistence/MigrationRunner.ts` runs a custom SQL migration chain for domain tables at startup.
- Cluster storage tables are described as “auto-created on first use” by `SqlMessageStorage` / `SqlRunnerStorage` (so cluster tables are not part of the custom migration set).

**E. Workflow layer dependency ordering**
- `Runtime/WorkflowLayers.ts` uses a pre-provide pattern: workflow layers are composed with all activity dependencies *before* registration.
- There is an explicit warning that workflow `execute` effects may require services at construction time, not after layer composition.

### 2) Knowledge server workflow runtime in this repo

**A. Runtime selection**
- `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts` selects either `WorkflowEngine.layerMemory` or `ClusterWorkflowEngine.layer` based on a config value (`KNOWLEDGE_WORKFLOW_MODE`).

**B. SQL-backed SingleRunner**
- Durable mode uses `SingleRunner.layer({ runnerStorage: "sql" })` with `ClusterWorkflowEngine.layer`.
- Unlike effect-ontology’s `PostgresLayer`, there is no explicit `SqlMessageStorage`/`SqlRunnerStorage` prefix configuration here, so table isolation depends on defaults.

**C. Separation of concerns**
- The file explicitly distinguishes between the workflow engine’s durability and “domain-facing execution records” persisted elsewhere, which keeps runtime concerns clean and focused.

## Cross-repo comparison summary

| Topic | effect-ontology core-v2 | knowledge server | Implication |
|---|---|---|---|
| Durable engine toggle | Env: `POSTGRES_HOST` | Config: `KNOWLEDGE_WORKFLOW_MODE` | Both are runtime switches; knowledge server is explicitly configured, core-v2 is implicit via DB presence. |
| SQL runner storage | `SingleRunner.layer({ runnerStorage: "sql" })` | same | Pattern is consistent. |
| Prefixing | Explicit `"workflow_"` prefix for cluster tables | Not explicit | Risk of table collisions across apps or tenants unless defaults are acceptable. |
| Migrations | Custom domain migrations + auto cluster table creation | Not shown here | Core-v2’s split is a concrete pattern to replicate if needed. |
| Workflow dependency ordering | Pre-provided activity dependencies before workflow layer | Not shown here | Core-v2 warns that late provision can fail at runtime. |

## External research (web)

### A. Official/primary sources

**1) `@effect/workflow` npm README example**
- The README shows `ClusterWorkflowEngine.layer` wired with `NodeClusterRunnerSocket.layer({ storage: "sql" })` and a SQL client. This is a non-`SingleRunner` runner, but it is the canonical “SQL-backed runner storage” example that the project itself publishes. citeturn1search1

**2) SingleRunner module introduction**
- Release notes for `@effect/cluster@0.54.0` introduce `SingleRunner` and explicitly state:
  - message storage is SQL-backed, and
  - multiple nodes are not supported.
- This is the most explicit external statement about SingleRunner’s intended deployment scope. citeturn1search3

**3) Recent cluster/workflow bug fixes**
- A recent Effect blog update notes fixes relevant to workflow durability and storage:
  - `SqlMessageStorage` “last reply” fix for sqlite
  - activity interrupt handling (“Suspended” persistence)
  - Node socket race-condition fixes
- These imply storage correctness and activity interruption handling have been real-world pain points. citeturn1search2

### B. Secondary sources (non-official but useful)

**1) DeepWiki summary of cluster persistence semantics**
- Summarizes “storage-first” message persistence for `@effect/cluster`, implying at-least-once delivery and retries around `PersistenceError`. Use as contextual background, not as sole authority. citeturn0search5

**2) Community blog example (Effect Cluster ETL)**
- Provides a real-world wiring example using `ClusterWorkflowEngine.layer` with SQL-backed runner storage via `NodeClusterRunnerSocket.layer({ storage: "sql" })`.
- Does not show `SingleRunner`, but it validates production usage patterns for SQL-backed cluster storage. citeturn1search5

### C. Search results for “ClusterWorkflowEngine + SingleRunner (runnerStorage sql)”
- A targeted web search did **not** surface public GitHub repos using **`ClusterWorkflowEngine` + `SingleRunner` with `runnerStorage: "sql"`**.
- The most concrete public materials are the official release note (SingleRunner introduction) and the official README examples using `NodeClusterRunnerSocket` with SQL storage.

## Practical gotchas and durable workflow patterns

### 1) Migrations and table ownership
**Pattern**
- Separate domain migrations from cluster storage tables.
- Let cluster storage auto-create its tables on first use (as in core-v2), but make ownership explicit: document table names and prefixes.

**Gotchas**
- If cluster tables are auto-created implicitly and multiple services share the same DB/schema, you can end up with collisions or unexpected migration order.

**Recommendation**
- Mirror core-v2’s explicit prefixing using `SqlMessageStorage.layerWith({ prefix })` and `SqlRunnerStorage.layerWith({ prefix })` when multi-service sharing is expected.

### 2) Prefixing and multi-tenant isolation
**Pattern**
- Use a per-service or per-tenant prefix for cluster tables.

**Gotchas**
- Shared DB without prefixing can lead to mixed workflow entity traffic and runner registration cross-talk.
- Tenant isolation is otherwise only enforced at the application layer.

**Recommendation**
- If multi-tenant or multi-app is on the roadmap, define a prefix convention now (for example: `workflow_${tenant}_`).

### 3) SingleRunner limitations
**Pattern**
- SingleRunner is “durable single-node”: SQL-backed durability but **not multi-node** support.

**Gotchas**
- Running multiple nodes with SingleRunner can lead to inefficiency or undefined behavior because it is explicitly designed for a single-node cluster.

**Recommendation**
- Only use SingleRunner when your deployment topology is single-node with failover via restart.
- If you need multiple nodes, prefer the full cluster runner approach (`NodeClusterRunnerSocket` or equivalent) and sharding.

### 4) Workflow layer construction order
**Pattern**
- Compose workflow layers after dependencies are already provided.

**Gotchas**
- If workflow registration or workflow `execute` requires services during construction, late provision will fail at runtime.

**Recommendation**
- Follow the core-v2 pattern of pre-providing activity dependencies before building the workflow layer.

### 5) Monitoring and correctness
**Pattern**
- Treat workflow durability as a storage+messaging system; instrument activity interrupts and reply persistence.

**Gotchas**
- Recent fixes around `SqlMessageStorage` and activity interrupts indicate risk areas: reply persistence and suspend/interrupt semantics.

**Recommendation**
- Track activity interrupts and workflow suspension in telemetry; ensure sql-backed message storage is part of your SLOs.

## Recommended patterns to adopt in this repo

1) **Add explicit cluster table prefixing** (align with core-v2 PostgresLayer):
   - Prefer `SqlMessageStorage.layerWith({ prefix })` and `SqlRunnerStorage.layerWith({ prefix })` where you currently rely on `SingleRunner.layer({ runnerStorage: "sql" })` defaults.

2) **Standardize durable-engine wiring**:
   - Align knowledge server runtime with core-v2’s `PgClient` + cluster storage layering, especially if cross-service DB sharing is likely.

3) **Codify dependency pre-provision**:
   - Add a note or layer wrapper in knowledge workflow runtime mirroring core-v2’s pre-provided dependencies for workflow construction.

4) **Explicitly document SingleRunner’s topology**:
   - If knowledge workflows are expected to run in multiple nodes, explicitly avoid `SingleRunner` and move to a multi-runner cluster setup.

## References

### Local repo references
- `/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-ontology/packages/@core-v2/src/server.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-ontology/packages/@core-v2/src/Runtime/Persistence/PostgresLayer.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-ontology/packages/@core-v2/src/Runtime/Persistence/MigrationRunner.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-ontology/packages/@core-v2/src/Runtime/WorkflowLayers.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect3/packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`

### Web references
- @effect/workflow npm README (ClusterWorkflowEngine + SQL runner example) citeturn1search1
- @effect/cluster release notes: SingleRunner module, SQL-backed, single-node-only citeturn1search3
- Effect blog: recent fixes for SqlMessageStorage and workflow interrupts citeturn1search2
- DeepWiki summary of cluster persistence semantics citeturn0search5
- Effect Cluster ETL blog example with SQL-backed runner storage citeturn1search5
