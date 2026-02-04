# Stateless Cloud Run Deployment Plan

**Date:** 2024-12-10
**Status:** Final
**Goal:** Production-ready stateless extraction service on GCP with minimal infrastructure

## Executive Summary

The extraction pipeline is **inherently stateless**. Each request transforms `(text, ontology) → triples` with no cross-request dependencies. Entity resolution happens per-document, not cross-document. This enables a radically simple deployment:

| Component | Solution | Cost |
|-----------|----------|------|
| Compute | Cloud Run (stateless) | Pay-per-request |
| Ontologies | GCS bucket | ~$0.02/GB/month |
| Output | GCS bucket | ~$0.02/GB/month |
| Secrets | Secret Manager | ~$0.03/10K accesses |
| **Total Fixed** | | **~$0.10/month** |

Cross-document entity resolution, SHACL validation, and knowledge graph persistence are **downstream concerns** - not part of the extraction service.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────────────────────────┐     ┌─────────────────┐
│   Client/Batch  │────▶│         Cloud Run (Stateless)       │────▶│      GCS        │
│                 │     │                                     │     │                 │
│  POST /extract  │     │  ┌─────────────────────────────┐   │     │ /ontologies/    │
│  {              │     │  │  Per-Process (cached once)  │   │     │   music.ttl     │
│    text,        │     │  │  - Ontology Context         │   │     │   schema.ttl    │
│    ontologyId   │     │  │  - BM25 Index               │   │     │                 │
│  }              │     │  │  - Semantic Index           │   │     │ /extractions/   │
│                 │     │  │  - Nomic Embedding Model    │   │     │   {runId}/      │
└─────────────────┘     │  └─────────────────────────────┘   │     │   - graph.json  │
                        │                                     │     │   - graph.ttl   │
                        │  ┌─────────────────────────────┐   │     │   - meta.json   │
                        │  │  Per-Request (stateless)    │   │     └─────────────────┘
                        │  │  Chunk → Retrieve → Extract │   │
                        │  │  → Resolve → Output         │   │
                        │  └─────────────────────────────┘   │
                        └─────────────────────────────────────┘
                                        │
                                        │ (downstream, separate)
                                        ▼
                        ┌─────────────────────────────────────┐
                        │     Future: Knowledge Graph DB      │
                        │     - Cross-doc entity linking      │
                        │     - SHACL validation              │
                        │     - Query interface               │
                        └─────────────────────────────────────┘
```

---

## Design Decisions

### Why Stateless?

The extraction pipeline processes each document independently:

| Stage | State Required | Scope |
|-------|---------------|-------|
| Chunking | None | Per-request |
| Class Retrieval | Ontology indexes | Per-process (cached) |
| Entity Extraction | None | Per-chunk |
| Relation Extraction | None | Per-chunk |
| Entity Resolution | Embeddings | Per-document |
| Graph Merge | None | Per-document |

**Key insight:** Entity resolution (`EntityResolutionGraph.ts`) clusters entities **within a single document**, not across documents. No shared state needed.

### Why No Distributed Cache?

| Concern | Traditional Solution | Our Approach |
|---------|---------------------|--------------|
| Avoid re-extraction | Redis cache | Idempotent - caller tracks, or check GCS |
| Dedup concurrent requests | Distributed lock | Single request per doc (caller batches) |
| Rate limiting | Redis counter | Per-instance is fine for LLM APIs |
| Job tracking | Database | Caller tracks their batch |

**Result:** No Redis, no Memorystore, no database. Just GCS.

### Provenance Tracking

Already built into the pipeline:

```typescript
// From StreamingExtraction.ts
const chunkId = getChunkId(run.runId, chunk.index)
const entities = Chunk.map(rawEntities, (entity) =>
  new Entity({
    ...entity,
    chunkIndex: chunk.index,
    chunkId  // ← provenance: "run123/chunk/5"
  }))
```

Output structure:
```
/extractions/{runId}/
├── graph.json      # KnowledgeGraph with entity.chunkId provenance
├── graph.ttl       # RDF serialization
└── meta.json       # { runId, ontologyId, timestamp, stats }
```

Downstream services can trace any triple back to its source chunk.

---

## Pluggable Embedding Service

Design for future shared embeddings without implementing now.

### Current: Per-Request (Stateless)

```typescript
// packages/@core-v2/src/Service/Embedding.ts
import { Context, Effect, Layer } from "effect"
import { NomicNlpService, NomicNlpServiceLive } from "./NomicNlp.js"

export interface EmbeddingService {
  readonly embed: (
    text: string,
    taskType?: "search_query" | "search_document" | "clustering"
  ) => Effect.Effect<ReadonlyArray<number>, EmbeddingError>

  readonly cosineSimilarity: (
    a: ReadonlyArray<number>,
    b: ReadonlyArray<number>
  ) => number
}

export class EmbeddingService extends Context.Tag("@core-v2/EmbeddingService")<
  EmbeddingService,
  EmbeddingService
>() {}

// Current implementation: delegates to Nomic, no caching
export const EmbeddingServiceLive: Layer.Layer<EmbeddingService, never, NomicNlpService> =
  Layer.effect(
    EmbeddingService,
    Effect.gen(function*() {
      const nomic = yield* NomicNlpService

      return {
        embed: (text, taskType = "search_document") =>
          nomic.embed(text, taskType),
        cosineSimilarity: nomic.cosineSimilarity
      }
    })
  )

// Default: Nomic local model, stateless
export const EmbeddingServiceDefault = EmbeddingServiceLive.pipe(
  Layer.provideMerge(NomicNlpServiceLive)
)
```

### Future: With Shared Store

```typescript
// Future implementation when cross-doc intelligence is needed
export const EmbeddingServiceWithCache: Layer.Layer<
  EmbeddingService,
  never,
  NomicNlpService | EmbeddingStore
> = Layer.effect(
  EmbeddingService,
  Effect.gen(function*() {
    const nomic = yield* NomicNlpService
    const store = yield* EmbeddingStore  // GCS, Vertex AI, etc.

    return {
      embed: (text, taskType = "search_document") =>
        Effect.gen(function*() {
          const key = hashText(text, taskType)

          // Check cache first
          const cached = yield* store.get(key).pipe(
            Effect.option
          )

          if (Option.isSome(cached)) {
            return cached.value
          }

          // Generate and cache
          const embedding = yield* nomic.embed(text, taskType)
          yield* store.put(key, embedding).pipe(Effect.ignore)

          return embedding
        }),
      cosineSimilarity: nomic.cosineSimilarity
    }
  })
)
```

### Swap at Composition Time

```typescript
// ProductionRuntime.ts

// Today: Stateless
const EmbeddingLayer = EmbeddingServiceDefault

// Future: With shared store
// const EmbeddingLayer = EmbeddingServiceWithCache.pipe(
//   Layer.provideMerge(EmbeddingStoreLive)
// )

export const ProductionRuntime = Layer.mergeAll(
  OntologyServiceLive,
  ExtractionWorkflowLive,
  // ... other services
).pipe(
  Layer.provideMerge(EmbeddingLayer)  // ← swap here
)
```

**Pipeline code unchanged.** Just swap the layer.

---

## Implementation

### Phase 1: GCP Infrastructure

```bash
# 1. Create GCS bucket
gcloud storage buckets create gs://effect-ontology-data \
  --location=us-central1 \
  --uniform-bucket-level-access

# 2. Create secrets
echo -n "sk-ant-api03-..." | gcloud secrets create anthropic-api-key --data-file=-
echo -n "sk-..." | gcloud secrets create openai-api-key --data-file=-

# 3. Create service account
gcloud iam service-accounts create ontology-extractor \
  --display-name="Ontology Extraction Service"

# 4. Grant permissions
gcloud storage buckets add-iam-policy-binding gs://effect-ontology-data \
  --member="serviceAccount:ontology-extractor@${PROJECT}.iam.gserviceaccount.com" \
  --role="roles/storage.objectUser"

gcloud secrets add-iam-policy-binding anthropic-api-key \
  --member="serviceAccount:ontology-extractor@${PROJECT}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Phase 2: GCS Storage Service

```typescript
// packages/@core-v2/src/Service/Storage.ts
import { Context, Data, Effect, Layer, Option, Schema } from "effect"
import { Storage } from "@google-cloud/storage"

export class StorageError extends Data.TaggedError("StorageError")<{
  readonly operation: string
  readonly path: string
  readonly cause: unknown
}> {}

export interface StorageService {
  readonly readText: (path: string) => Effect.Effect<string, StorageError>
  readonly writeText: (path: string, content: string) => Effect.Effect<void, StorageError>
  readonly writeJson: <A>(path: string, value: A, schema: Schema.Schema<A>) => Effect.Effect<void, StorageError>
  readonly readJson: <A>(path: string, schema: Schema.Schema<A>) => Effect.Effect<A, StorageError>
  readonly exists: (path: string) => Effect.Effect<boolean>
  readonly list: (prefix: string) => Effect.Effect<string[]>
}

export class StorageService extends Context.Tag("@core-v2/StorageService")<
  StorageService,
  StorageService
>() {}

export interface StorageConfig {
  readonly bucketName: string
  readonly pathPrefix?: string
}

export const StorageServiceLive = (config: StorageConfig): Layer.Layer<StorageService> =>
  Layer.succeed(
    StorageService,
    (() => {
      const storage = new Storage()
      const bucket = storage.bucket(config.bucketName)
      const prefix = config.pathPrefix ?? ""

      const toPath = (path: string) =>
        `${prefix}/${path}`.replace(/\/+/g, "/").replace(/^\//, "")

      return {
        readText: (path) =>
          Effect.tryPromise({
            try: async () => {
              const [content] = await bucket.file(toPath(path)).download()
              return content.toString("utf-8")
            },
            catch: (e) => new StorageError({ operation: "readText", path, cause: e })
          }),

        writeText: (path, content) =>
          Effect.tryPromise({
            try: () => bucket.file(toPath(path)).save(content),
            catch: (e) => new StorageError({ operation: "writeText", path, cause: e })
          }),

        writeJson: (path, value, schema) =>
          Effect.gen(function*() {
            const encoded = yield* Schema.encode(schema)(value)
            yield* Effect.tryPromise({
              try: () => bucket.file(toPath(path)).save(
                JSON.stringify(encoded, null, 2),
                { contentType: "application/json" }
              ),
              catch: (e) => new StorageError({ operation: "writeJson", path, cause: e })
            })
          }),

        readJson: (path, schema) =>
          Effect.gen(function*() {
            const content = yield* Effect.tryPromise({
              try: async () => {
                const [data] = await bucket.file(toPath(path)).download()
                return data.toString("utf-8")
              },
              catch: (e) => new StorageError({ operation: "readJson", path, cause: e })
            })
            return yield* Schema.decodeUnknown(schema)(JSON.parse(content))
          }),

        exists: (path) =>
          Effect.tryPromise({
            try: async () => {
              const [exists] = await bucket.file(toPath(path)).exists()
              return exists
            },
            catch: () => false
          }),

        list: (pathPrefix) =>
          Effect.tryPromise({
            try: async () => {
              const [files] = await bucket.getFiles({ prefix: toPath(pathPrefix) })
              return files.map(f => f.name)
            },
            catch: (e) => new StorageError({ operation: "list", path: pathPrefix, cause: e })
          })
      }
    })()
  )
```

### Phase 3: Ontology Loading from GCS

```typescript
// packages/@core-v2/src/Service/OntologyLoader.ts
import { Effect, Layer } from "effect"
import { StorageService } from "./Storage.js"
import { OntologyService, OntologyContext } from "./Ontology.js"

export const OntologyLoaderLive: Layer.Layer<
  OntologyService,
  never,
  StorageService
> = Layer.effect(
  OntologyService,
  Effect.gen(function*() {
    const storage = yield* StorageService

    // Cache ontologies per-process
    const cache = new Map<string, OntologyContext>()

    const loadOntology = (ontologyId: string) =>
      Effect.gen(function*() {
        if (cache.has(ontologyId)) {
          return cache.get(ontologyId)!
        }

        const ttl = yield* storage.readText(`ontologies/${ontologyId}.ttl`)
        const context = yield* parseOntology(ttl)

        // Build indexes (BM25, semantic)
        const indexed = yield* buildIndexes(context)

        cache.set(ontologyId, indexed)
        return indexed
      })

    return {
      loadOntology,
      // ... other OntologyService methods
    }
  })
)
```

### Phase 4: HTTP Server Updates

```typescript
// packages/@core-v2/src/server.ts
import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { Effect, Layer, Schema } from "effect"
import { ExtractionWorkflow } from "./Workflow/StreamingExtraction.js"
import { StorageService, StorageServiceLive } from "./Service/Storage.js"

const ExtractionRequest = Schema.Struct({
  text: Schema.String,
  ontologyId: Schema.String,
  options: Schema.optional(Schema.Struct({
    outputFormat: Schema.optional(Schema.Literal("json", "turtle")),
    skipResolution: Schema.optional(Schema.Boolean)
  }))
})

const routes = HttpRouter.empty.pipe(
  HttpRouter.post("/extract",
    Effect.gen(function*() {
      const request = yield* HttpServerRequest.schemaBodyJson(ExtractionRequest)
      const workflow = yield* ExtractionWorkflow
      const storage = yield* StorageService

      // Run extraction
      const graph = yield* workflow.extract(request.text, {
        ontologyId: request.ontologyId,
        // ... config from request.options
      })

      // Generate run ID from text hash
      const runId = hashText(request.text)

      // Store results to GCS
      yield* Effect.all([
        storage.writeJson(`extractions/${runId}/graph.json`, graph, KnowledgeGraphSchema),
        storage.writeText(`extractions/${runId}/graph.ttl`, serializeToTurtle(graph)),
        storage.writeJson(`extractions/${runId}/meta.json`, {
          runId,
          ontologyId: request.ontologyId,
          timestamp: new Date().toISOString(),
          stats: {
            entities: graph.entities.length,
            relations: graph.relations.length
          }
        }, MetadataSchema)
      ], { concurrency: 3 })

      // Return result
      return yield* HttpServerResponse.json({
        runId,
        entities: graph.entities.length,
        relations: graph.relations.length,
        outputPath: `gs://effect-ontology-data/extractions/${runId}/`
      })
    })
  ),

  HttpRouter.get("/health",
    Effect.succeed(HttpServerResponse.json({ status: "ok" }))
  )
)

// Runtime composition
const StorageLayer = StorageServiceLive({
  bucketName: process.env.GCS_BUCKET ?? "effect-ontology-data"
})

const MainLive = Layer.mergeAll(
  ExtractionWorkflow.Default,
  OntologyLoaderLive,
  EmbeddingServiceDefault
).pipe(
  Layer.provideMerge(StorageLayer)
)

// Start server
HttpServer.serve(routes).pipe(
  Effect.provide(MainLive),
  Effect.runPromise
)
```

### Phase 5: Dockerfile

```dockerfile
# packages/@core-v2/Dockerfile
FROM node:22-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb ./
RUN npm install --production

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY dist/ ./dist/

ENV NODE_ENV=production
ENV PORT=8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "dist/server.js"]
```

### Phase 6: Cloud Run Deployment

```yaml
# cloudrun-service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: ontology-extractor
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "0"
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      serviceAccountName: ontology-extractor@PROJECT_ID.iam.gserviceaccount.com
      containerConcurrency: 10
      timeoutSeconds: 300
      containers:
        - image: gcr.io/PROJECT_ID/ontology-extractor:latest
          ports:
            - containerPort: 8080
          env:
            - name: GCS_BUCKET
              value: "effect-ontology-data"
            - name: LLM_PROVIDER
              value: "anthropic"
            - name: ANTHROPIC_API_KEY
              valueFrom:
                secretKeyRef:
                  name: anthropic-api-key
                  key: latest
          resources:
            limits:
              cpu: "2"
              memory: "2Gi"
```

```bash
# deploy.sh
#!/bin/bash
set -e

PROJECT_ID="effect-ontology"
REGION="us-central1"

# Build and push
gcloud builds submit \
  --project=$PROJECT_ID \
  --tag=gcr.io/$PROJECT_ID/ontology-extractor:latest \
  packages/@core-v2

# Deploy
gcloud run services replace cloudrun-service.yaml \
  --project=$PROJECT_ID \
  --region=$REGION

echo "Deployed to: $(gcloud run services describe ontology-extractor --region=$REGION --format='value(status.url)')"
```

---

## API Reference

### POST /extract

Extract knowledge graph from text.

**Request:**
```json
{
  "text": "Arsenal Football Club is a professional football club...",
  "ontologyId": "football",
  "options": {
    "outputFormat": "json",
    "skipResolution": false
  }
}
```

**Response:**
```json
{
  "runId": "a1b2c3d4e5f6...",
  "entities": 15,
  "relations": 23,
  "outputPath": "gs://effect-ontology-data/extractions/a1b2c3d4e5f6/"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Output Structure

```
gs://effect-ontology-data/
├── ontologies/
│   ├── football.ttl
│   ├── music.ttl
│   └── schema.ttl
└── extractions/
    └── {runId}/
        ├── graph.json      # KnowledgeGraph with provenance
        ├── graph.ttl       # RDF/Turtle serialization
        └── meta.json       # Run metadata
```

### graph.json

```json
{
  "entities": [
    {
      "id": "arsenal_fc",
      "mention": "Arsenal Football Club",
      "types": ["http://example.org/FootballClub"],
      "attributes": { "founded": "1886" },
      "chunkIndex": 0,
      "chunkId": "a1b2c3/chunk/0"
    }
  ],
  "relations": [
    {
      "subjectId": "arsenal_fc",
      "predicate": "http://example.org/locatedIn",
      "object": "london"
    }
  ]
}
```

### meta.json

```json
{
  "runId": "a1b2c3d4e5f6",
  "ontologyId": "football",
  "timestamp": "2024-12-10T12:00:00Z",
  "stats": {
    "entities": 15,
    "relations": 23,
    "chunks": 5
  }
}
```

---

## Cost Analysis

### Fixed Costs

| Service | Usage | Cost/Month |
|---------|-------|------------|
| GCS Storage | 1GB ontologies + extractions | ~$0.02 |
| Secret Manager | 3 secrets, ~1K accesses | ~$0.03 |
| **Total Fixed** | | **~$0.05** |

### Variable Costs (Per Extraction)

| Service | Unit | Cost |
|---------|------|------|
| Cloud Run | Per vCPU-second | $0.00002400 |
| Cloud Run | Per GB-second | $0.00000250 |
| GCS Operations | Per 10K Class A ops | $0.05 |
| GCS Operations | Per 10K Class B ops | $0.004 |

**Example:** 1000 extractions/month, 30s avg, 2 vCPU, 2GB RAM
- Compute: 1000 × 30s × 2 vCPU × $0.000024 = $1.44
- Memory: 1000 × 30s × 2GB × $0.0000025 = $0.15
- Storage ops: ~$0.10
- **Total: ~$1.70/month for 1000 extractions**

---

## Future Extensions

### Shared Embedding Store

When cross-document intelligence is needed:

1. Create `EmbeddingStore` service interface
2. Implement with GCS or Vertex AI Vector Search
3. Swap `EmbeddingServiceDefault` → `EmbeddingServiceWithCache`
4. No pipeline code changes

### Cross-Document Entity Linking

Separate downstream service:

1. Consumes extraction outputs from GCS
2. Maintains entity registry
3. Links new entities to existing canonical entities
4. Stores in knowledge graph database

### Batch Processing

For large document sets:

1. Use Cloud Tasks for queue management
2. Each task calls `/extract` endpoint
3. Cloud Run auto-scales
4. Results accumulate in GCS

---

## Implementation Checklist

### Phase 1: Infrastructure
- [ ] Create GCS bucket with uniform access
- [ ] Create secrets in Secret Manager
- [ ] Create service account with permissions

### Phase 2: Storage Service
- [ ] Implement `StorageService` with GCS backend
- [ ] Add `StorageService.Test` with in-memory store
- [ ] Unit tests for read/write operations

### Phase 3: Embedding Service Abstraction
- [ ] Create `EmbeddingService` interface
- [ ] Implement `EmbeddingServiceLive` wrapping Nomic
- [ ] Update `EntityResolutionGraph` to use `EmbeddingService`

### Phase 4: Ontology Loading
- [ ] Implement `OntologyLoaderLive` reading from GCS
- [ ] Add per-process caching with `Effect.cached`
- [ ] Upload test ontologies to GCS

### Phase 5: HTTP Server
- [ ] Update server to use new services
- [ ] Add `/extract` endpoint with GCS output
- [ ] Add request validation with Schema

### Phase 6: Deployment
- [ ] Update Dockerfile
- [ ] Create `cloudrun-service.yaml`
- [ ] Create deploy script
- [ ] Test with single instance
- [ ] Scale test with concurrent requests

---

## References

- Functional Spec: `packages/@core-v2/docs/functional_spec.md`
- Streaming Extraction: `packages/@core-v2/src/Workflow/StreamingExtraction.ts`
- Entity Resolution: `packages/@core-v2/src/Workflow/EntityResolutionGraph.ts`
- Effect Platform: `docs/effect-source/platform/src/`
