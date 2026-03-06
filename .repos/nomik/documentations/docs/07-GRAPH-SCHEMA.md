# NOMIK — Neo4j Graph Schema

> All nodes and edges have a `projectId` property for multi-project isolation.

---

## Node Types

### Project Node (root per project)

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique project identifier |
| `name` | string | Project name |
| `rootPath` | string | Project root path |
| `createdAt` | datetime | Creation date |
| `updatedAt` | datetime | Last update |

> **Note:** The `Project` node has no `projectId` property — its `id` serves as the project identifier.

### ScanMeta Node (scan metadata)

| Property | Type | Description |
|----------|------|-------------|
| `sha` | string | Full Git commit SHA |
| `shortSha` | string | Short SHA (7 characters) |
| `message` | string | Commit message |
| `author` | string | Commit author |
| `gitDate` | string | Git commit date |
| `scannedAt` | datetime | Scan date/time |
| `fileCount` | number | Number of files scanned |
| `nodeCount` | number | Number of nodes created |
| `edgeCount` | number | Number of edges created |
| `projectId` | string | Associated project |

### Node types summary table

| Label | Main properties | Description |
|-------|-----------------|-------------|
| `File` | `id`, `type='file'`, `path`, `language`, `hash`, `size`, `lineCount`, `lastParsed`, `projectId` | Source file |
| `Function` | `id`, `type='function'`, `name`, `filePath`, `startLine`, `endLine`, `params`, `returnType?`, `isAsync`, `isExported`, `isGenerator`, `decorators[]`, `confidence`, `bodyHash?`, `projectId` | Function or method |
| `Class` | `id`, `type='class'`, `name`, `filePath`, `startLine`, `endLine`, `isExported`, `isAbstract`, `superClass?`, `interfaces[]`, `decorators[]`, `methods[]`, `properties[]`, `bodyHash?`, `projectId` | Class or interface |
| `Variable` | `id`, `type='variable'`, `name`, `filePath`, `line`, `kind` (const/let/var), `isExported`, `valueType?`, `projectId` | Top-level variable or constant |
| `Module` | `id`, `type='module'`, `name`, `path`, `moduleType` (file/package/external), `projectId` | Logical module |
| `Route` | `id`, `type='route'`, `method`, `path`, `handlerName`, `filePath`, `middleware[]`, `apiTags?[]`, `apiSummary?`, `apiDescription?`, `apiResponseStatus?[]`, `projectId` | HTTP endpoint (with optional Swagger/OpenAPI metadata) |
| `DBTable` | `id`, `type='db_table'`, `name`, `schema?`, `operations[]`, `projectId` | Database table reference |
| `ExternalAPI` | `id`, `type='external_api'`, `name`, `baseUrl?`, `methods[]`, `projectId` | External API (Stripe, AWS, etc.) |
| `CronJob` | `id`, `type='cron_job'`, `name`, `schedule`, `handlerName`, `filePath`, `projectId` | Scheduled task |
| `Event` | `id`, `type='event'`, `name`, `eventKind` (emit/listen), `filePath`, `namespace?`, `room?`, `projectId` | Event bus publish/subscribe (with Socket.io room/namespace) |
| `EnvVar` | `id`, `type='env_var'`, `name`, `required`, `defaultValue?`, `projectId` | Environment variable |
| `QueueJob` | `id`, `type='queue_job'`, `name`, `queueName`, `filePath`, `jobKind` (producer/consumer), `projectId` | Job queue task (Bull/BullMQ/Bee-Queue) |
| `Metric` | `id`, `type='metric'`, `name`, `metricType` (counter/gauge/histogram/summary), `help?`, `filePath`, `projectId` | Prometheus/OpenTelemetry metric |
| `Span` | `id`, `type='span'`, `name`, `spanKind?` (server/client/producer/consumer/internal), `attributes?[]`, `filePath`, `projectId` | OpenTelemetry tracing span |
| `Topic` | `id`, `type='topic'`, `name`, `broker` (kafka/rabbitmq/nats/sqs/sns/pubsub), `topicKind` (producer/consumer), `filePath`, `projectId` | Message broker topic/queue |

---

## Edge Types

All edges have a `projectId` property for multi-project isolation.

### Edge types summary table

| Type | From → To | Properties | Description |
|------|-----------|------------|-------------|
| `CONTAINS` | File → Function/Class/Variable | — | The file defines this symbol |
| `IMPORTS` | File → Module | `specifiers[]`, `isDefault`, `isDynamic` | The file imports from the module |
| `EXPORTS` | Module → Function/Class/Variable | `isDefault`, `alias?` | The module exports this symbol |
| `EXTENDS` | Class → Class | — | Class inheritance |
| `IMPLEMENTS` | Class → Class | — | Interface implementation |
| `CALLS` | Function → Function | `line`, `column?` | Function invocation |
| `DEPENDS_ON` | Function → Module | `kind` (import/call/http/event/env) | Dependency |
| `HANDLES` | Route → Function | `middleware[]` | Route handler binding |
| `READS_FROM` | Function → DBTable | `query?` | Database read |
| `WRITES_TO` | Function → DBTable | `operation` | Database write |
| `CALLS_EXTERNAL` | Function → ExternalAPI | `method`, `endpoint?` | External API call |
| `TRIGGERS` | CronJob → Function | `schedule?` | The cron triggers the function |
| `EMITS` | Function → Event | `payload?` | Event emission |
| `LISTENS_TO` | Function → Event | `handler` | Event subscription |
| `USES_ENV` | Function → EnvVar | — | Environment variable usage |
| `PRODUCES_JOB` | Function → QueueJob | `jobName?` | Function enqueues a job |
| `CONSUMES_JOB` | Function → QueueJob | `jobName?` | Function processes a job |
| `USES_METRIC` | Function → Metric | `operation` (inc/dec/set/observe/startTimer/define) | Function uses a Prometheus metric |
| `STARTS_SPAN` | Function → Span | `spanName?` | Function starts an OpenTelemetry span |
| `PRODUCES_MESSAGE` | Function → Topic | `topicName?` | Function publishes to a message broker topic |
| `CONSUMES_MESSAGE` | Function → Topic | `topicName?` | Function consumes from a message broker topic |

---

## Cypher Example

```cypher
// Create a payment subgraph (with projectId)
CREATE (f:File {id: 'file:src/services/payment.ts', path: 'src/services/payment.ts',
                 language: 'typescript', hash: 'abc123', size: 2048, lineCount: 87, lastParsed: datetime(),
                 projectId: 'my-api'})
CREATE (fn:Function {id: 'fn:payment:processPayment', name: 'processPayment',
                     filePath: 'src/services/payment.ts', startLine: 42, endLine: 87,
                     isAsync: true, isExported: true, isGenerator: false, decorators: '[]',
                     confidence: 1.0, projectId: 'my-api'})
CREATE (route:Route {id: 'route:POST:/api/checkout', method: 'POST', path: '/api/checkout',
                     handlerName: 'checkoutHandler', filePath: 'src/routes.ts',
                     middleware: '[]', projectId: 'my-api'})
CREATE (stripe:ExternalAPI {id: 'ext:stripe', name: 'Stripe', baseUrl: 'https://api.stripe.com',
                            methods: '["POST"]', projectId: 'my-api'})
CREATE (txTable:DBTable {id: 'db:transactions', name: 'transactions', schema: 'public',
                         operations: '["INSERT"]', projectId: 'my-api'})
CREATE (cron:CronJob {id: 'cron:monthlyBilling', name: 'monthlyBilling',
                      schedule: '0 0 1 * *', handlerName: 'runBilling', filePath: 'src/jobs.ts',
                      projectId: 'my-api'})

CREATE (f)-[:CONTAINS {projectId: 'my-api'}]->(fn)
CREATE (route)-[:HANDLES {projectId: 'my-api'}]->(fn)
CREATE (fn)-[:CALLS_EXTERNAL {method: 'POST', endpoint: '/v1/charges', projectId: 'my-api'}]->(stripe)
CREATE (fn)-[:WRITES_TO {operation: 'INSERT', projectId: 'my-api'}]->(txTable)
CREATE (cron)-[:TRIGGERS {projectId: 'my-api'}]->(fn)
```

---

## Key Queries

### Impact analysis

```cypher
// What breaks if I modify processPayment?
MATCH (target)
WHERE (target.name = $name OR target.id = $name) AND target.projectId = $projectId
WITH target LIMIT 1
CALL apoc.path.subgraphNodes(target, {
  relationshipFilter: "<CALLS|<HANDLES|<TRIGGERS|<DEPENDS_ON|<LISTENS_TO",
  maxLevel: $maxDepth
}) YIELD node
WHERE node <> target AND node.projectId = $projectId
RETURN COALESCE(node.name, node.path) as name,
       labels(node)[0] as type,
       COALESCE(node.filePath, node.path) as filePath,
       1 as depth,
       "DEPENDS_ON" as relType
```

### God Object detection

```cypher
// Functions with unexpected cross-file coupling (excludes intra-file dispatch
// and calls to directly imported files). Default threshold: 15
MATCH (f:Function)-[:CALLS]->(target)
WHERE f.projectId = $projectId
MATCH (ff:File)-[:CONTAINS]->(f)
WHERE NOT (ff)-[:CONTAINS]->(target)
MATCH (tf:File)-[:CONTAINS]->(target)
WHERE NOT (ff)-[:DEPENDS_ON]->(tf)
WITH f, count(DISTINCT target) as depCount
WHERE depCount > $threshold
RETURN f.name as name, f.filePath as filePath, depCount
ORDER BY depCount DESC
```

### God File detection

```cypher
// Files with too many functions (threshold default: 10)
// totalLines uses f.lineCount (actual line count, not byte size)
MATCH (f:File)-[:CONTAINS]->(fn:Function)
WHERE f.projectId = $projectId
WITH f, count(fn) as functionCount
WHERE functionCount > $threshold
RETURN f.path as filePath,
       functionCount,
       COALESCE(f.lineCount, 0) as totalLines
ORDER BY functionCount DESC
```

### Dead code detection

```cypher
// Functions never called — excludes constructors, class methods, React, barrel re-exports
MATCH (f:Function)
WHERE NOT (f)<-[:CALLS]-() AND NOT (f)<-[:HANDLES]-()
  AND f.name <> 'constructor'
  AND f.projectId = $projectId
WITH f
WHERE NOT f.filePath ENDS WITH '.tsx'
  AND NOT f.filePath ENDS WITH '.jsx'
OPTIONAL MATCH (parent:File)-[:CONTAINS]->(f)
WITH f, parent
WHERE parent IS NULL
   OR (NOT parent.path ENDS WITH 'index.ts'
       AND NOT parent.path ENDS WITH 'index.js')
// Exclude class methods (called via obj.method(), not directly)
WITH f, parent
OPTIONAL MATCH (parent)-[:CONTAINS]->(cls:Class)
WHERE cls.methods CONTAINS ('"' + f.name + '"')
WITH f, cls
WHERE cls IS NULL
RETURN f.name as name, f.filePath as filePath
ORDER BY f.filePath
```

### Duplicate code detection

```cypher
// Functions with identical bodyHash (copy-paste detection)
// Excludes trivial stubs (<3 lines) to avoid false positives on one-liner wrappers
MATCH (f:Function)
WHERE f.bodyHash IS NOT NULL AND f.projectId = $projectId
  AND (f.endLine - f.startLine) >= 3
WITH f.bodyHash as bodyHash, collect({name: f.name, filePath: f.filePath}) as funcs, count(*) as cnt
WHERE cnt > 1
RETURN bodyHash, cnt as count, funcs as functions
ORDER BY cnt DESC
```

### Dependency cycles

```cypher
// Circular dependency detection between modules
MATCH cycle = (a:Module)-[:IMPORTS*2..6]->(a)
WHERE a.projectId = $projectId
RETURN [n IN nodes(cycle) | n.name] as cyclePath
```

---

## Constraints (schema/init.ts)

```cypher
CREATE CONSTRAINT file_id IF NOT EXISTS FOR (f:File) REQUIRE f.id IS UNIQUE;
CREATE CONSTRAINT function_id IF NOT EXISTS FOR (f:Function) REQUIRE f.id IS UNIQUE;
CREATE CONSTRAINT class_id IF NOT EXISTS FOR (c:Class) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT route_id IF NOT EXISTS FOR (r:Route) REQUIRE r.id IS UNIQUE;
CREATE CONSTRAINT module_id IF NOT EXISTS FOR (m:Module) REQUIRE m.id IS UNIQUE;
CREATE CONSTRAINT variable_id IF NOT EXISTS FOR (v:Variable) REQUIRE v.id IS UNIQUE;
CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE;
```

---

## Indexes (schema/init.ts)

### Search indexes

```cypher
CREATE INDEX file_path IF NOT EXISTS FOR (f:File) ON (f.path);
CREATE INDEX function_name IF NOT EXISTS FOR (f:Function) ON (f.name);
CREATE INDEX function_filepath IF NOT EXISTS FOR (f:Function) ON (f.filePath);
CREATE INDEX class_name IF NOT EXISTS FOR (c:Class) ON (c.name);
CREATE INDEX route_path IF NOT EXISTS FOR (r:Route) ON (r.path);
```

### projectId indexes (multi-project isolation)

```cypher
CREATE INDEX file_project IF NOT EXISTS FOR (f:File) ON (f.projectId);
CREATE INDEX function_project IF NOT EXISTS FOR (f:Function) ON (f.projectId);
CREATE INDEX class_project IF NOT EXISTS FOR (c:Class) ON (c.projectId);
CREATE INDEX module_project IF NOT EXISTS FOR (m:Module) ON (m.projectId);
CREATE INDEX route_project IF NOT EXISTS FOR (r:Route) ON (r.projectId);
CREATE INDEX variable_project IF NOT EXISTS FOR (v:Variable) ON (v.projectId);
```
