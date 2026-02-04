# Batch Workflow Architecture Design

**Date**: 2025-12-10
**Status**: Draft (v4 - Added @effect/workflow research: persistence layers, engine architecture)
**Author**: Claude + pooks

## Overview

This document specifies the architecture for batch document processing in the effect-ontology project. The design separates concerns into four pipeline stages, uses `@effect/workflow` for durable execution with `@effect/experimental/Persistence` for storage, and maps to Google Cloud infrastructure via Terraform.

### Refinements (v3 - tighter coupling)
- Prefer `@effect/workflow` primitives (`Workflow.make`, `Workflow.runActivity`, `Workflow.emit`) for durability and replay; remove manual state-transition code.
- Single `Schema.Union` for workflow state + `Match.type` for exhaustive case handling (no separate stage enum).
- Paths as typed schemas: `Schema.TemplateLiteral` patterns for GCS paths with branded segments, eliminating string builders.
- `Schema.parseJson` at all JSON boundaries; `Schema.decode` for manifest loading.
- Single activity-runner Cloud Run Job that dispatches by `ACTIVITY_NAME` env var (no per-activity job boilerplate).
- Tests: `@effect/vitest` `layer()` + `TestContext` with deterministic clock for timing tests.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Intermediate format | Turtle (RDF/TTL) | Simple, standard, inspectable, already working |
| Document source | GCS bucket + manifest | Event-driven, scalable |
| Queue system | Cloud Tasks | Rate limiting, retries, deduplication |
| Document model | Full audit trail | Operational visibility, debugging |
| Batch model | Explicit stage tracking | Separation of concerns |
| GCS layout | Hybrid (docs + batches) | Documents reusable across batches |
| Canonical store | GCS Turtle files | Simple MVP, add triplestore later |
| **Workflow durability** | **@effect/workflow + Persistence.layerKeyValueStore** | **Tested primitives, less custom code** |
| Infrastructure | Terraform MVP | GCS, Cloud Tasks, Cloud Run, Secret Manager |

### Open Questions (Answered)

**Q: Are we okay to depend on @effect/workflow for Cloud Tasks/Run jobs durability, or do we need a lighter wrapper due to infra constraints?**

**A: Yes, use @effect/workflow.** The package provides:
- `Workflow.make` for durable workflow definitions with idempotency keys
- `Activity.make` for execute-once guarantees with automatic retry
- `Workflow.withCompensation` for saga/rollback patterns
- Persistence adapters via `@effect/experimental/Persistence.layerKeyValueStore`

We provide a thin GCS-backed `KeyValueStore` layer to satisfy persistence, and Cloud Tasks simply delivers HTTP requests to Cloud Run Jobs. The workflow engine handles state transitions, retries, and recovery internally.

**Q: Should Cloud Tasks payloads include ontology/version/path info as branded types (vs strings) at the boundary to enforce invariants before hitting workers?**

**A: Yes, use branded types at boundaries.** Activity input schemas use branded types (`GcsUri`, `OntologyVersion`, `BatchId`, `DocumentId`) which are validated on decode at the Cloud Run Job entry point. This catches malformed payloads before any processing begins.

---

## Architecture Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT LAYER                                          │
│                                                                                          │
│   ┌─────────────────┐                                                                   │
│   │  Client App     │  POST /api/v1/batch                                               │
│   │  (CLI/Web/API)  │──────────────────────────────────────────┐                        │
│   └─────────────────┘                                          │                        │
└────────────────────────────────────────────────────────────────┼────────────────────────┘
                                                                 │
                                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              EFFECT APPLICATION LAYER                                    │
│                                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                           HttpServer (Cloud Run Service)                         │   │
│   │                                                                                  │   │
│   │  POST /api/v1/batch      POST /api/v1/batch/:id/cancel    GET /api/v1/batch/:id │   │
│   │  └─> BatchWorkflow       └─> Workflow.interrupt            └─> load status      │   │
│   └──────────────┬───────────────────────────────────────────────────────────────────┘   │
│                  │                                                                       │
│                  ▼                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                    @effect/workflow + @effect/experimental                       │   │
│   │                                                                                  │   │
│   │  ┌──────────────────────────────────────────────────────────────────────────┐   │   │
│   │  │  BatchWorkflow = Workflow.make({                                          │   │   │
│   │  │    name: "batch-extraction",                                              │   │   │
│   │  │    payload: BatchWorkflowPayload,                                         │   │   │
│   │  │    idempotencyKey: (p) => p.batchId                                       │   │   │
│   │  │  })                                                                       │   │   │
│   │  └──────────────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                                  │   │
│   │  ┌──────────────────┐                                                           │   │
│   │  │ Persistence      │  ← Persistence.layerKeyValueStore                         │   │
│   │  │ .BackingPersist  │  ← Backed by GcsKeyValueStore                             │   │
│   │  │ ence             │                                                           │   │
│   │  └──────────────────┘                                                           │   │
│   │                                                                                  │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              ACTIVITIES (Activity.make)                          │   │
│   │                                                                                  │   │
│   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │   │
│   │  │  Extraction    │  │  Resolution    │  │  Validation    │  │  Ingestion     │ │   │
│   │  │  Activity      │  │  Activity      │  │  Activity      │  │  Activity      │ │   │
│   │  │                │  │                │  │                │  │                │ │   │
│   │  │ Input:         │  │ Input:         │  │ Input:         │  │ Input:         │ │   │
│   │  │  documentId:   │  │  batchId:      │  │  batchId:      │  │  batchId:      │ │   │
│   │  │   DocumentId   │  │   BatchId      │  │   BatchId      │  │   BatchId      │ │   │
│   │  │  sourceUri:    │  │  extractionUri:│  │  resolvedUri:  │  │  validatedUri: │ │   │
│   │  │   GcsUri       │  │   GcsUri       │  │   GcsUri       │  │   GcsUri       │ │   │
│   │  │  ontologyUri:  │  │                │  │  shaclUri:     │  │  targetNs:     │ │   │
│   │  │   GcsUri       │  │                │  │   GcsUri       │  │   Namespace    │ │   │
│   │  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘ │   │
│   └──────────┼───────────────────┼───────────────────┼───────────────────┼──────────┘   │
│              │                   │                   │                   │               │
└──────────────┼───────────────────┼───────────────────┼───────────────────┼───────────────┘
               │                   │                   │                   │
               ▼                   ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           GOOGLE CLOUD INFRASTRUCTURE LAYER                              │
│                                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              Cloud Run Job (Single Dispatcher)                  │   │
│   │                                                                                  │   │
│   │  ┌──────────────────────────────────────────────────────────────────────────┐   │   │
│   │  │                        activity-runner                                    │   │   │
│   │  │                                                                           │   │   │
│   │  │  ACTIVITY_NAME env var routes to:                                         │   │   │
│   │  │  • extraction  → ExtractionActivity   (LLM extraction)                    │   │   │
│   │  │  • resolution  → ResolutionActivity   (entity clustering)                 │   │   │
│   │  │  • validation  → ValidationActivity   (SHACL check)                       │   │   │
│   │  │  • ingestion   → IngestionActivity    (canonical write)                   │   │   │
│   │  │                                                                           │   │   │
│   │  │  Timeout: 30min  |  Memory: 4Gi  |  CPU: 2                                │   │   │
│   │  └──────────────────────────────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                          ▲                                              │
│                                          │ Triggers (HTTP POST)                         │
│   ┌──────────────────────────────────────┴──────────────────────────────────────────┐   │
│   │                           Cloud Tasks Queue                                      │   │
│   │                           "workflow-tasks"                                       │   │
│   │                                                                                  │   │
│   │  Rate Limits:                    Retry Policy:                                  │   │
│   │  - maxConcurrentDispatches: 10   - maxAttempts: 5                               │   │
│   │  - maxDispatchesPerSecond: 5     - minBackoff: 10s                              │   │
│   │                                  - maxBackoff: 300s                             │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                           Cloud Storage (GCS)                                    │   │
│   │                           "effect-ontology-{env}"                                │   │
│   │                                                                                  │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │   │
│   │  │ documents/  │  │ batches/    │  │ ontologies/ │  │ canonical/  │            │   │
│   │  │ {docId}/    │  │ {batchId}/  │  │ {ns}/{name}/│  │ {namespace}/│            │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
│   ┌───────────────────┐  ┌───────────────────────────────────────────────────────────┐  │
│   │  Secret Manager   │  │                    Cloud Run Service                      │  │
│   │  ANTHROPIC_API_KEY│  │                    "api-server"                           │  │
│   └───────────────────┘  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Sequence Diagram: Batch Processing Flow

```
┌────────┐ ┌─────────────┐ ┌─────────────────┐ ┌────────────┐ ┌─────────────┐ ┌─────────────┐
│ Client │ │ API Server  │ │ @effect/workflow│ │Cloud Tasks │ │  Cloud Run  │ │     GCS     │
│        │ │(Cloud Run)  │ │   BatchWorkflow │ │   Queue    │ │    Jobs     │ │   Bucket    │
└───┬────┘ └──────┬──────┘ └────────┬────────┘ └─────┬──────┘ └──────┬──────┘ └──────┬──────┘
    │             │                 │                │               │               │
    │ POST /api/v1/batch            │                │               │               │
    │ {manifestUri, config}         │                │               │               │
    │────────────>│                 │                │               │               │
    │             │                 │                │               │               │
    │             │ Workflow.make   │                │               │               │
    │             │ (idempotencyKey)│                │               │               │
    │             │────────────────>│                │               │               │
    │             │                 │                │               │               │
    │             │                 │ Persistence.BackingPersistence.set()           │
    │             │                 │───────────────────────────────────────────────>│
    │             │                 │<───────────────────────────────────────────────│
    │             │                 │                │               │               │
    │             │                 │ Activity.make("extraction")   │               │
    │             │                 │ → enqueue task │               │               │
    │             │                 │───────────────>│               │               │
    │             │                 │<───────────────│ taskId        │               │
    │             │                 │                │               │               │
    │             │  {batchId,      │                │               │               │
    │             │   status}       │                │               │               │
    │<────────────│<────────────────│                │               │               │
    │             │                 │                │               │               │
    │             │                 │                │ HTTP POST     │               │
    │             │                 │                │ extraction-worker              │
    │             │                 │                │──────────────>│               │
    │             │                 │                │               │               │
    │             │                 │                │               │ Schema.decode │
    │             │                 │                │               │ (branded input)
    │             │                 │                │               │               │
    │             │                 │                │               │ StorageService│
    │             │                 │                │               │ .get(sourceUri)
    │             │                 │                │               │──────────────>│
    │             │                 │                │               │<──────────────│
    │             │                 │                │               │               │
    │             │                 │                │               │ Extraction    │
    │             │                 │                │               │ Pipeline      │
    │             │                 │                │               │               │
    │             │                 │                │               │ StorageService│
    │             │                 │                │               │ .set(graph.ttl)
    │             │                 │                │               │──────────────>│
    │             │                 │                │               │<──────────────│
    │             │                 │                │               │               │
    │             │                 │                │  complete     │               │
    │             │                 │                │<──────────────│               │
    │             │                 │                │               │               │
    │             │                 │ Activity complete callback     │               │
    │             │                 │ (next activity or state transition)            │
    │             │                 │                │               │               │
    │             │                 │ ... (resolution, validation, ingestion) ...    │
    │             │                 │                │               │               │
    │             │                 │ Workflow complete              │               │
    │             │                 │───────────────────────────────────────────────>│
    │             │                 │                │               │               │
    │ GET /api/v1/batch/:id        │                │               │               │
    │────────────>│                 │                │               │               │
    │             │ load(batchId)   │                │               │               │
    │             │────────────────>│                │               │               │
    │             │                 │ Persistence.get()              │               │
    │             │                 │───────────────────────────────────────────────>│
    │             │                 │<───────────────────────────────────────────────│
    │             │<────────────────│                │               │               │
    │<────────────│  {status,stats} │                │               │               │
    │             │                 │                │               │               │
┌───┴────┐ ┌──────┴──────┐ ┌────────┴────────┐ ┌─────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
│ Client │ │ API Server  │ │ @effect/workflow│ │Cloud Tasks │ │  Cloud Run  │ │     GCS     │
└────────┘ └─────────────┘ └─────────────────┘ └────────────┘ └─────────────┘ └─────────────┘
```

---

## Domain Models (v3 - Aligned Identity Shapes)

### Branded Types for URIs/IDs

```typescript
// packages/@core-v2/src/Domain/Identity.ts

import { Schema, Brand } from "effect"

// ─────────────────────────────────────────────────────────────────────────────
// Core Branded Types (aligned to actual usage patterns)
// ─────────────────────────────────────────────────────────────────────────────

// GCS bucket URI: gs://bucket-name/path/to/object
export const GcsUri = Schema.String.pipe(
  Schema.pattern(/^gs:\/\/[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]\/.+$/),
  Schema.brand("GcsUri")
)
export type GcsUri = Schema.Schema.Type<typeof GcsUri>

// BatchId: 12 hex chars for better collision resistance
export const BatchId = Schema.String.pipe(
  Schema.pattern(/^batch-[a-f0-9]{12}$/),
  Schema.brand("BatchId")
)
export type BatchId = Schema.Schema.Type<typeof BatchId>

// DocumentId: 12 hex chars
export const DocumentId = Schema.String.pipe(
  Schema.pattern(/^doc-[a-f0-9]{12}$/),
  Schema.brand("DocumentId")
)
export type DocumentId = Schema.Schema.Type<typeof DocumentId>

// OntologyVersion: namespace/name@hash (full semantic version)
// Example: "football/ontology@a1b2c3d4e5f6a7b8"
export const OntologyVersion = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9-]*\/[a-z][a-z0-9_-]*@[a-f0-9]{16}$/),
  Schema.brand("OntologyVersion")
)
export type OntologyVersion = Schema.Schema.Type<typeof OntologyVersion>

// Namespace: lowercase hyphenated identifier
export const Namespace = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9-]*$/),
  Schema.brand("Namespace")
)
export type Namespace = Schema.Schema.Type<typeof Namespace>

// ContentHash: SHA-256 prefix (16 hex)
export const ContentHash = Schema.String.pipe(
  Schema.pattern(/^[a-f0-9]{16}$/),
  Schema.brand("ContentHash")
)
export type ContentHash = Schema.Schema.Type<typeof ContentHash>

// ─────────────────────────────────────────────────────────────────────────────
// Path Schemas using Schema.TemplateLiteral (typed, validated paths)
// ─────────────────────────────────────────────────────────────────────────────

// Document paths - typed template literals
export const DocumentMetadataPath = Schema.TemplateLiteral(
  "documents/", DocumentId, "/metadata.json"
)
export type DocumentMetadataPath = Schema.Schema.Type<typeof DocumentMetadataPath>

export const DocumentInputPath = Schema.TemplateLiteral(
  "documents/", DocumentId, "/input/content.txt"
)
export type DocumentInputPath = Schema.Schema.Type<typeof DocumentInputPath>

export const DocumentGraphPath = Schema.TemplateLiteral(
  "documents/", DocumentId, "/extraction/graph.ttl"
)
export type DocumentGraphPath = Schema.Schema.Type<typeof DocumentGraphPath>

// Batch paths - typed template literals
export const BatchManifestPath = Schema.TemplateLiteral(
  "batches/", BatchId, "/manifest.json"
)
export type BatchManifestPath = Schema.Schema.Type<typeof BatchManifestPath>

export const BatchStatusPath = Schema.TemplateLiteral(
  "batches/", BatchId, "/status.json"
)
export type BatchStatusPath = Schema.Schema.Type<typeof BatchStatusPath>

export const BatchResolutionPath = Schema.TemplateLiteral(
  "batches/", BatchId, "/resolution/merged.ttl"
)
export type BatchResolutionPath = Schema.Schema.Type<typeof BatchResolutionPath>

export const BatchValidationPath = Schema.TemplateLiteral(
  "batches/", BatchId, "/validation/report.json"
)
export type BatchValidationPath = Schema.Schema.Type<typeof BatchValidationPath>

export const BatchCanonicalPath = Schema.TemplateLiteral(
  "batches/", BatchId, "/canonical/final.ttl"
)
export type BatchCanonicalPath = Schema.Schema.Type<typeof BatchCanonicalPath>

// Ontology paths - namespace/name@version structure
export const OntologyPath = Schema.TemplateLiteral(
  "ontologies/", Namespace, "/", Schema.String, "/", Schema.String, ".ttl"
)
export type OntologyPath = Schema.Schema.Type<typeof OntologyPath>

// Canonical namespace paths
export const CanonicalPath = Schema.TemplateLiteral(
  "canonical/", Namespace, "/entities.ttl"
)
export type CanonicalPath = Schema.Schema.Type<typeof CanonicalPath>

// ─────────────────────────────────────────────────────────────────────────────
// Path Layout Service (type-safe path construction)
// ─────────────────────────────────────────────────────────────────────────────

export const PathLayout = {
  document: (docId: DocumentId) => ({
    metadata: `documents/${docId}/metadata.json` as DocumentMetadataPath,
    input: `documents/${docId}/input/content.txt` as DocumentInputPath,
    graph: `documents/${docId}/extraction/graph.ttl` as DocumentGraphPath,
  }),

  batch: (batchId: BatchId) => ({
    manifest: `batches/${batchId}/manifest.json` as BatchManifestPath,
    status: `batches/${batchId}/status.json` as BatchStatusPath,
    resolution: `batches/${batchId}/resolution/merged.ttl` as BatchResolutionPath,
    validation: `batches/${batchId}/validation/report.json` as BatchValidationPath,
    canonical: `batches/${batchId}/canonical/final.ttl` as BatchCanonicalPath,
  }),

  canonical: (ns: Namespace) => ({
    entities: `canonical/${ns}/entities.ttl` as CanonicalPath,
  }),
} as const

// GcsUri construction from bucket + path
export const toGcsUri = (bucket: string, path: string): GcsUri =>
  `gs://${bucket}/${path}` as GcsUri
```

### Batch Workflow States (Single Union + Match)

Implemented as a single `Schema.Union` of `Schema.TaggedStruct` variants (tags: `"Pending" | "Extracting" | "Resolving" | "Validating" | "Ingesting" | "Complete" | "Failed"`). Dates use `Schema.DateTimeUtc`; helpers (`stageDisplayName`, `isTerminal`, `progressPercent`, `getError`) are implemented with `Match.type` for exhaustiveness.

```typescript
// packages/@core-v2/src/Domain/Model/BatchWorkflow.ts

import { Match, Schema } from "effect"
import { BatchId, DocumentId, GcsUri, OntologyVersion } from "../Identity"

const BatchBase = {
  batchId: BatchId,
  manifestUri: GcsUri,
  ontologyVersion: OntologyVersion,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc
}

export const BatchPending = Schema.TaggedStruct("Pending", {
  ...BatchBase,
  documentCount: Schema.Number
})

export const BatchExtracting = Schema.TaggedStruct("Extracting", {
  ...BatchBase,
  documentsTotal: Schema.Number,
  documentsCompleted: Schema.Number,
  documentsFailed: Schema.Number,
  currentDocumentId: Schema.optional(DocumentId)
})

export const BatchResolving = Schema.TaggedStruct("Resolving", {
  ...BatchBase,
  extractionOutputUri: GcsUri,
  entitiesTotal: Schema.Number,
  clustersFormed: Schema.Number
})

export const BatchValidating = Schema.TaggedStruct("Validating", {
  ...BatchBase,
  resolvedGraphUri: GcsUri,
  validationStartedAt: Schema.DateTimeUtc
})

export const BatchIngesting = Schema.TaggedStruct("Ingesting", {
  ...BatchBase,
  validatedGraphUri: GcsUri,
  triplesTotal: Schema.Number,
  triplesIngested: Schema.Number
})

export const BatchComplete = Schema.TaggedStruct("Complete", {
  ...BatchBase,
  canonicalGraphUri: GcsUri,
  stats: Schema.Struct({
    documentsProcessed: Schema.Number,
    entitiesExtracted: Schema.Number,
    relationsExtracted: Schema.Number,
    clustersResolved: Schema.Number,
    triplesIngested: Schema.Number,
    totalDurationMs: Schema.Number
  }),
  completedAt: Schema.DateTimeUtc
})

export const BatchFailed = Schema.TaggedStruct("Failed", {
  ...BatchBase,
  failedAt: Schema.DateTimeUtc,
  failedInStage: Schema.Literal("pending", "extracting", "resolving", "validating", "ingesting"),
  error: Schema.Struct({
    code: Schema.String,
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }),
  lastSuccessfulStage: Schema.optional(Schema.Literal("pending", "extracting", "resolving", "validating", "ingesting"))
})

export const BatchState = Schema.Union(
  BatchPending,
  BatchExtracting,
  BatchResolving,
  BatchValidating,
  BatchIngesting,
  BatchComplete,
  BatchFailed
)

export type BatchState = Schema.Schema.Type<typeof BatchState>
export const BatchStateJson = Schema.parseJson(BatchState)

export const stageDisplayName = Match.type<BatchState>().pipe(
  Match.tag("Pending", () => "Pending"),
  Match.tag("Extracting", () => "Extracting"),
  Match.tag("Resolving", () => "Resolving"),
  Match.tag("Validating", () => "Validating"),
  Match.tag("Ingesting", () => "Ingesting"),
  Match.tag("Complete", () => "Complete"),
  Match.tag("Failed", () => "Failed"),
  Match.exhaustive
)

export const isTerminal = Match.type<BatchState>().pipe(
  Match.tag("Complete", "Failed", () => true),
  Match.tag("Pending", "Extracting", "Resolving", "Validating", "Ingesting", () => false),
  Match.exhaustive
)

export const progressPercent = Match.type<BatchState>().pipe(
  Match.tag("Pending", () => 0),
  Match.tag("Extracting", (s) =>
    s.documentsTotal > 0 ? Math.round((s.documentsCompleted / s.documentsTotal) * 25) : 0
  ),
  Match.tag("Resolving", () => 50),
  Match.tag("Validating", () => 75),
  Match.tag("Ingesting", (s) =>
    s.triplesTotal > 0 ? 75 + Math.round((s.triplesIngested / s.triplesTotal) * 25) : 90
  ),
  Match.tag("Complete", () => 100),
  Match.tag("Failed", () => -1),
  Match.exhaustive
)

export const getError = Match.type<BatchState>().pipe(
  Match.tag("Failed", (s) => s.error),
  Match.orElse(() => undefined)
)
```

### Document Model (with branded types)

```typescript
// packages/@core-v2/src/Domain/Model/Document.ts

import { Schema } from "effect"
import { DocumentId, ContentHash, GcsUri, OntologyVersion } from "../Identity"

export const DocumentStatus = Schema.Literal("pending", "processing", "completed", "failed")
export type DocumentStatus = Schema.Schema.Type<typeof DocumentStatus>

export class Document extends Schema.TaggedClass<Document>()("Document", {
  // Identity (branded)
  documentId: DocumentId,
  contentHash: ContentHash,

  // Source provenance (branded URIs)
  sourceUri: GcsUri,
  contentType: Schema.String,
  sizeBytes: Schema.Number,
  fetchedAt: Schema.DateTimeUtc,

  // Processing lineage (branded versions)
  ontologyVersion: OntologyVersion,
  modelId: Schema.String,

  // Status
  status: DocumentStatus,

  // Audit trail
  processingDurationMs: Schema.optional(Schema.Number),
  tokenUsage: Schema.optional(Schema.Struct({
    input: Schema.Number,
    output: Schema.Number
  })),
  retryCount: Schema.Number,
  errors: Schema.Array(Schema.Struct({
    timestamp: Schema.DateTimeUtc,
    code: Schema.String,
    message: Schema.String
  })),

  // Output reference (branded)
  extractionOutputUri: Schema.optional(GcsUri)
}) {}

// JSON roundtrip
export const DocumentJson = Schema.parseJson(Document)
```

---

### Core workflow tasks (unchanged and required)
- Extraction: input `documentId`, `sourceUri`, `ontologyVersion`; output `graph.ttl` + stats under `documents/{docId}/extraction/`.
- Resolution: input all extraction `graph.ttl` paths; output `batches/{batchId}/resolution/merged.ttl` and cluster stats.
- Validation: input `resolvedGraphUri` + `shaclUri`; outputs `validated.ttl` and `report.json` under `batches/{batchId}/validation/`.
- Ingestion: input `validatedGraphUri` + `targetNamespace`; outputs canonical graph `batches/{batchId}/canonical/final.ttl` (and optional mirror under `canonical/{ns}/`).

---

## Effect Service Layer (Using @effect/workflow)

### Manifest Schema (JSON boundary)

```typescript
// packages/@core-v2/src/Domain/Model/Manifest.ts

import { Schema } from "effect"
import { BatchId, DocumentId, GcsUri, OntologyVersion, Namespace } from "../Identity"

// Document entry in manifest
const ManifestDocument = Schema.Struct({
  documentId: DocumentId,
  sourceUri: GcsUri,
  contentType: Schema.String,
  sizeBytes: Schema.Number
})

// Full manifest schema
export const Manifest = Schema.Struct({
  batchId: BatchId,
  ontologyUri: GcsUri,
  ontologyVersion: OntologyVersion,
  shaclUri: Schema.optional(GcsUri),
  targetNamespace: Namespace,
  documents: Schema.Array(ManifestDocument),
  createdAt: Schema.DateTimeUtc
})
export type Manifest = Schema.Schema.Type<typeof Manifest>

// JSON roundtrip for manifest (typed parse/stringify)
export const ManifestJson = Schema.parseJson(Manifest)
```

### Activity Definitions

```typescript
// packages/@core-v2/src/Workflow/Activities.ts

import { Activity } from "@effect/workflow"
import { Effect, Schema, DateTime } from "effect"
import { BatchId, DocumentId, GcsUri, PathLayout, toGcsUri, Namespace } from "../Domain/Identity"
import { StorageService } from "../Service/Storage"
import { ExtractionWorkflow } from "../Workflow/Extraction"

// ─────────────────────────────────────────────────────────────────────────────
// Activity Schemas (branded types at boundaries)
// ─────────────────────────────────────────────────────────────────────────────

const ExtractionInput = Schema.Struct({
  batchId: BatchId,
  documentId: DocumentId,
  sourceUri: GcsUri,
  ontologyUri: GcsUri
})

const ExtractionOutput = Schema.Struct({
  documentId: DocumentId,
  graphUri: GcsUri,
  entityCount: Schema.Number,
  relationCount: Schema.Number,
  durationMs: Schema.Number
})

const ResolutionInput = Schema.Struct({
  batchId: BatchId,
  documentGraphUris: Schema.Array(GcsUri)
})

const ResolutionOutput = Schema.Struct({
  resolvedUri: GcsUri,
  entitiesTotal: Schema.Number,
  clustersFormed: Schema.Number,
  durationMs: Schema.Number
})

const ValidationInput = Schema.Struct({
  batchId: BatchId,
  resolvedUri: GcsUri,
  shaclUri: Schema.optional(GcsUri)
})

const ValidationOutput = Schema.Struct({
  validatedUri: GcsUri,
  conforms: Schema.Boolean,
  violations: Schema.Number,
  durationMs: Schema.Number
})

const IngestionInput = Schema.Struct({
  batchId: BatchId,
  validatedUri: GcsUri,
  targetNamespace: Namespace
})

const IngestionOutput = Schema.Struct({
  canonicalUri: GcsUri,
  triplesIngested: Schema.Number,
  durationMs: Schema.Number
})

// ─────────────────────────────────────────────────────────────────────────────
// Activity Definitions (execute-once guarantee)
// ─────────────────────────────────────────────────────────────────────────────

export const extractionActivity = Activity.make(
  "extraction",
  { input: ExtractionInput, output: ExtractionOutput, error: Schema.String }
)((input) =>
  Effect.gen(function*() {
    const start = yield* DateTime.now
    const storage = yield* StorageService
    const extraction = yield* ExtractionWorkflow

    // Load document (input already validated - branded)
    const content = yield* storage.get(input.sourceUri)

    // Run extraction pipeline
    const graph = yield* extraction.extract(content)

    // Save output using PathLayout (typed paths)
    const outputPath = PathLayout.document(input.documentId).graph
    yield* storage.set(outputPath, graph.serialize())

    const end = yield* DateTime.now

    return {
      documentId: input.documentId,
      graphUri: toGcsUri(storage.bucket, outputPath),
      entityCount: graph.entities.length,
      relationCount: graph.relations.length,
      durationMs: DateTime.distance(start, end)
    }
  })
)

export const resolutionActivity = Activity.make(
  "resolution",
  { input: ResolutionInput, output: ResolutionOutput, error: Schema.String }
)((input) =>
  Effect.gen(function*() {
    const start = yield* DateTime.now
    const storage = yield* StorageService

    // Load all document graphs
    const graphs = yield* Effect.all(
      input.documentGraphUris.map(uri => storage.get(uri)),
      { concurrency: 10 }
    )

    // Run entity resolution/clustering
    const resolved = yield* EntityResolution.resolve(graphs)

    // Save merged graph
    const outputPath = PathLayout.batch(input.batchId).resolution
    yield* storage.set(outputPath, resolved.serialize())

    const end = yield* DateTime.now

    return {
      resolvedUri: toGcsUri(storage.bucket, outputPath),
      entitiesTotal: resolved.entities.length,
      clustersFormed: resolved.clusters.length,
      durationMs: DateTime.distance(start, end)
    }
  })
)

export const validationActivity = Activity.make(
  "validation",
  { input: ValidationInput, output: ValidationOutput, error: Schema.String }
)((input) =>
  Effect.gen(function*() {
    const start = yield* DateTime.now
    const storage = yield* StorageService

    // Load resolved graph
    const graph = yield* storage.get(input.resolvedUri)

    // Run SHACL validation if shapes provided
    const report = input.shaclUri
      ? yield* ShaclValidator.validate(graph, input.shaclUri)
      : { conforms: true, violations: 0 }

    // Save validation report
    const reportPath = PathLayout.batch(input.batchId).validation
    yield* storage.set(reportPath, JSON.stringify(report))

    const end = yield* DateTime.now

    return {
      validatedUri: input.resolvedUri, // Same graph, just validated
      conforms: report.conforms,
      violations: report.violations,
      durationMs: DateTime.distance(start, end)
    }
  })
)

export const ingestionActivity = Activity.make(
  "ingestion",
  { input: IngestionInput, output: IngestionOutput, error: Schema.String }
)((input) =>
  Effect.gen(function*() {
    const start = yield* DateTime.now
    const storage = yield* StorageService

    // Load validated graph
    const graph = yield* storage.get(input.validatedUri)

    // Write to canonical namespace
    const canonicalPath = PathLayout.canonical(input.targetNamespace).entities
    yield* storage.set(canonicalPath, graph)

    const end = yield* DateTime.now

    return {
      canonicalUri: toGcsUri(storage.bucket, canonicalPath),
      triplesIngested: countTriples(graph),
      durationMs: DateTime.distance(start, end)
    }
  })
)
```

### Workflow Definition (Schema.decode + Workflow.emit)

```typescript
// packages/@core-v2/src/Workflow/BatchWorkflow.ts

import { Workflow } from "@effect/workflow"
import { Effect, Schema, DateTime, pipe } from "effect"
import { BatchId, GcsUri, OntologyVersion, PathLayout, toGcsUri } from "../Domain/Identity"
import { BatchComplete, BatchExtracting, BatchResolving, BatchValidating, BatchIngesting } from "../Domain/Model/BatchWorkflow"
import { Manifest, ManifestJson } from "../Domain/Model/Manifest"
import { extractionActivity, resolutionActivity, validationActivity, ingestionActivity } from "./Activities"
import { StorageService } from "../Service/Storage"

// Workflow payload schema (branded at boundary)
const BatchWorkflowPayload = Schema.Struct({
  batchId: BatchId,
  manifestUri: GcsUri,
  ontologyVersion: OntologyVersion
})

// Main workflow with progress emissions
export const BatchWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchComplete,
  error: Schema.String,
  idempotencyKey: (p) => p.batchId
})(({ batchId, manifestUri, ontologyVersion }) =>
  Effect.gen(function*() {
    const storage = yield* StorageService
    const workflowStart = yield* DateTime.now

    // ─────────────────────────────────────────────────────────────────────────
    // Load manifest using Schema.decode (typed JSON boundary)
    // ─────────────────────────────────────────────────────────────────────────
    const manifestRaw = yield* storage.get(manifestUri)
    const manifest = yield* Schema.decode(ManifestJson)(manifestRaw)

    // ─────────────────────────────────────────────────────────────────────────
    // Extraction Phase - emit progress via Workflow.emit
    // ─────────────────────────────────────────────────────────────────────────
    yield* Workflow.emit("stage", "extracting")

    const extractionResults = yield* Effect.forEach(
      manifest.documents,
      (doc, index) =>
        pipe(
          Workflow.runActivity(extractionActivity, {
            batchId,
            documentId: doc.documentId,
            sourceUri: doc.sourceUri,
            ontologyUri: manifest.ontologyUri
          }),
          Effect.tap(() =>
            Workflow.emit("extraction-progress", {
              completed: index + 1,
              total: manifest.documents.length
            })
          )
        ),
      { concurrency: 5 } // Bounded concurrency for LLM rate limits
    )

    // ─────────────────────────────────────────────────────────────────────────
    // Resolution Phase
    // ─────────────────────────────────────────────────────────────────────────
    yield* Workflow.emit("stage", "resolving")

    const resolutionResult = yield* Workflow.runActivity(resolutionActivity, {
      batchId,
      documentGraphUris: extractionResults.map(r => r.graphUri)
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Validation Phase
    // ─────────────────────────────────────────────────────────────────────────
    yield* Workflow.emit("stage", "validating")

    const validationResult = yield* Workflow.runActivity(validationActivity, {
      batchId,
      resolvedUri: resolutionResult.resolvedUri,
      shaclUri: manifest.shaclUri
    })

    if (!validationResult.conforms) {
      yield* Effect.fail(`SHACL validation failed with ${validationResult.violations} violations`)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Ingestion Phase
    // ─────────────────────────────────────────────────────────────────────────
    yield* Workflow.emit("stage", "ingesting")

    const ingestionResult = yield* Workflow.runActivity(ingestionActivity, {
      batchId,
      validatedUri: validationResult.validatedUri,
      targetNamespace: manifest.targetNamespace
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Complete - return typed result
    // ─────────────────────────────────────────────────────────────────────────
    const workflowEnd = yield* DateTime.now

    return new BatchComplete({
      batchId,
      manifestUri,
      ontologyVersion,
      canonicalGraphUri: ingestionResult.canonicalUri,
      stats: {
        documentsProcessed: manifest.documents.length,
        entitiesExtracted: extractionResults.reduce((sum, r) => sum + r.entityCount, 0),
        relationsExtracted: extractionResults.reduce((sum, r) => sum + r.relationCount, 0),
        clustersResolved: resolutionResult.clustersFormed,
        triplesIngested: ingestionResult.triplesIngested,
        totalDurationMs: DateTime.distance(workflowStart, workflowEnd)
      },
      createdAt: workflowStart,
      updatedAt: workflowEnd,
      completedAt: workflowEnd
    })
  })
)
```

### Persistence Layer (Typed via Persistence.layerKeyValueStore)

```typescript
// packages/@core-v2/src/Service/WorkflowPersistence.ts

import { KeyValueStore } from "@effect/platform"
import { Persistence } from "@effect/experimental"
import { Effect, Layer, Schema, Option } from "effect"
import { StorageService } from "./Storage"
import { BatchWorkflowStateJson } from "../Domain/Model/BatchWorkflow"

// ─────────────────────────────────────────────────────────────────────────────
// GCS-backed KeyValueStore (raw string storage)
// ─────────────────────────────────────────────────────────────────────────────

export const GcsKeyValueStoreLive = Layer.effect(
  KeyValueStore.KeyValueStore,
  Effect.gen(function*() {
    const storage = yield* StorageService
    const prefix = "workflow-state/"

    return KeyValueStore.make({
      get: (key) =>
        storage.get(`${prefix}${key}`).pipe(
          Effect.map(Option.fromNullable),
          Effect.catchAll(() => Effect.succeed(Option.none()))
        ),

      set: (key, value) =>
        storage.set(`${prefix}${key}`, value).pipe(
          Effect.asVoid
        ),

      remove: (key) =>
        storage.remove(`${prefix}${key}`).pipe(
          Effect.asVoid
        ),

      has: (key) =>
        storage.exists(`${prefix}${key}`),

      // Required by interface but not used for workflows
      isEmpty: Effect.succeed(false),
      size: Effect.succeed(0),
      clear: Effect.void,
      modify: (key, f) =>
        Effect.gen(function*() {
          const current = yield* storage.get(`${prefix}${key}`).pipe(
            Effect.map(Option.fromNullable)
          )
          const next = f(current)
          if (Option.isSome(next)) {
            yield* storage.set(`${prefix}${key}`, next.value)
          } else {
            yield* storage.remove(`${prefix}${key}`)
          }
          return current
        })
    })
  })
)

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Persistence Layers
// ─────────────────────────────────────────────────────────────────────────────

// Production: GCS-backed
// Persistence.layerKeyValueStore handles JSON serialization internally
// when used with @effect/workflow's persistence requirements
export const WorkflowPersistenceLive = Persistence.layerKeyValueStore.pipe(
  Layer.provide(GcsKeyValueStoreLive)
)

// Testing: In-memory (deterministic, fast)
export const WorkflowPersistenceTest = Persistence.layerMemory

// ─────────────────────────────────────────────────────────────────────────────
// Typed State Persistence (for application-level state queries)
// ─────────────────────────────────────────────────────────────────────────────

// Service for querying workflow state with typed decoding
export interface BatchStateStore {
  readonly get: (batchId: string) => Effect.Effect<
    Option.Option<BatchWorkflowState>,
    Persistence.PersistenceError
  >
  readonly set: (
    batchId: string,
    state: BatchWorkflowState
  ) => Effect.Effect<void, Persistence.PersistenceError>
}

export const BatchStateStore = Context.GenericTag<BatchStateStore>("@workflow/BatchStateStore")

export const BatchStateStoreLive = Layer.effect(
  BatchStateStore,
  Effect.gen(function*() {
    const kv = yield* KeyValueStore.KeyValueStore

    return {
      get: (batchId) =>
        Effect.gen(function*() {
          const raw = yield* kv.get(batchId)
          if (Option.isNone(raw)) return Option.none()

          // Decode using Schema.parseJson (typed JSON boundary)
          const state = yield* Schema.decode(BatchWorkflowStateJson)(raw.value).pipe(
            Effect.mapError(e => new Persistence.PersistenceParseError({ cause: e }))
          )
          return Option.some(state)
        }),

      set: (batchId, state) =>
        Effect.gen(function*() {
          // Encode using Schema.parseJson (typed JSON boundary)
          const json = yield* Schema.encode(BatchWorkflowStateJson)(state).pipe(
            Effect.mapError(e => new Persistence.PersistenceParseError({ cause: e }))
          )
          yield* kv.set(batchId, json)
        })
    }
  })
)
```

### Cloud Tasks + Single Activity Runner (Unified Dispatcher)

```typescript
// packages/@core-v2/src/Service/CloudTasksQueue.ts

import { Effect, Layer, Context, Schema, Match } from "effect"
import { CloudTasksClient } from "@google-cloud/tasks"
import { ConfigService } from "./Config"
import {
  extractionActivity,
  resolutionActivity,
  validationActivity,
  ingestionActivity
} from "../Workflow/Activities"

// ─────────────────────────────────────────────────────────────────────────────
// Activity Name Enum (for dispatcher routing)
// ─────────────────────────────────────────────────────────────────────────────

export const ActivityName = Schema.Literal(
  "extraction",
  "resolution",
  "validation",
  "ingestion"
)
export type ActivityName = Schema.Schema.Type<typeof ActivityName>

// ─────────────────────────────────────────────────────────────────────────────
// Task Queue Service (enqueue-only, dispatches to single runner job)
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskQueue {
  readonly enqueue: <A extends ActivityName>(
    activityName: A,
    input: ActivityInputType<A>
  ) => Effect.Effect<void, TaskQueueError>
}

export const TaskQueue = Context.GenericTag<TaskQueue>("@workflow/TaskQueue")

export class TaskQueueError extends Schema.TaggedError<TaskQueueError>()("TaskQueueError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown)
}) {}

// Helper to create task payload with Schema.encode
const createTaskPayload = <I extends Schema.Schema.AnyNoContext>(
  activityName: ActivityName,
  input: Schema.Schema.Type<I>,
  inputSchema: I
) =>
  Effect.gen(function*() {
    const encoded = yield* Schema.encode(inputSchema)(input)
    return {
      activityName,
      input: encoded
    }
  })

export const CloudTasksQueueLive = Layer.scoped(
  TaskQueue,
  Effect.gen(function*() {
    const config = yield* ConfigService
    const client = new CloudTasksClient()

    const queuePath = client.queuePath(
      config.gcp.projectId,
      config.gcp.region,
      "workflow-tasks"
    )

    // SINGLE activity-runner job URL (dispatches internally by ACTIVITY_NAME)
    const activityRunnerUrl = `https://${config.gcp.region}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${config.gcp.projectId}/jobs/activity-runner:run`

    // Cleanup on scope finalization
    yield* Effect.addFinalizer(() =>
      Effect.promise(() => client.close())
    )

    return {
      enqueue: (activityName, input) =>
        Effect.gen(function*() {
          // Get schema for activity (type-safe lookup)
          const inputSchema = getActivityInputSchema(activityName)
          const payload = yield* createTaskPayload(activityName, input, inputSchema)
          const payloadJson = JSON.stringify(payload)

          yield* Effect.tryPromise({
            try: () => client.createTask({
              parent: queuePath,
              task: {
                httpRequest: {
                  httpMethod: "POST",
                  url: activityRunnerUrl,
                  headers: { "Content-Type": "application/json" },
                  body: Buffer.from(JSON.stringify({
                    overrides: {
                      containerOverrides: [{
                        env: [
                          { name: "ACTIVITY_NAME", value: activityName },
                          { name: "ACTIVITY_INPUT", value: payloadJson }
                        ]
                      }]
                    }
                  })).toString("base64"),
                  oidcToken: { serviceAccountEmail: config.gcp.serviceAccount }
                }
              }
            }),
            catch: (e) => new TaskQueueError({
              message: `Failed to enqueue ${activityName} task`,
              cause: e
            })
          })
        })
    }
  })
)

// ─────────────────────────────────────────────────────────────────────────────
// Activity Runner Entry Point (single Cloud Run Job)
// ─────────────────────────────────────────────────────────────────────────────

// packages/@core-v2/src/Runner/ActivityRunner.ts

import { Effect, Schema, Match, pipe } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { ConfigService, ConfigServiceLive } from "../Service/Config"
import { StorageService, StorageServiceLive } from "../Service/Storage"
import {
  extractionActivity,
  resolutionActivity,
  validationActivity,
  ingestionActivity
} from "../Workflow/Activities"

// Activity input schemas (for routing)
const ActivityInputSchemas = {
  extraction: ExtractionInput,
  resolution: ResolutionInput,
  validation: ValidationInput,
  ingestion: IngestionInput
} as const

// Activity dispatcher using Match
const dispatchActivity = (activityName: ActivityName, input: unknown) =>
  Match.value(activityName).pipe(
    Match.when("extraction", () =>
      pipe(
        Schema.decode(ExtractionInput)(input),
        Effect.flatMap(extractionActivity)
      )
    ),
    Match.when("resolution", () =>
      pipe(
        Schema.decode(ResolutionInput)(input),
        Effect.flatMap(resolutionActivity)
      )
    ),
    Match.when("validation", () =>
      pipe(
        Schema.decode(ValidationInput)(input),
        Effect.flatMap(validationActivity)
      )
    ),
    Match.when("ingestion", () =>
      pipe(
        Schema.decode(IngestionInput)(input),
        Effect.flatMap(ingestionActivity)
      )
    ),
    Match.exhaustive
  )

// Main entry point
const main = Effect.gen(function*() {
  // Read env vars (set by Cloud Tasks)
  const activityName = yield* Effect.sync(() => process.env.ACTIVITY_NAME).pipe(
    Effect.flatMap(Schema.decode(ActivityName))
  )
  const activityInput = yield* Effect.sync(() => process.env.ACTIVITY_INPUT).pipe(
    Effect.flatMap(v => v ? Effect.succeed(JSON.parse(v)) : Effect.fail("Missing ACTIVITY_INPUT"))
  )

  // Dispatch to appropriate activity (type-safe via Match)
  const result = yield* dispatchActivity(activityName, activityInput)

  console.log(`Activity ${activityName} completed:`, JSON.stringify(result))
})

// Run with production layers
const MainLive = main.pipe(
  Effect.provide(ConfigServiceLive),
  Effect.provide(StorageServiceLive)
)

NodeRuntime.runMain(MainLive)
```

### In-Memory Queue for Testing

```typescript
// packages/@core-v2/src/Service/InMemoryTaskQueue.ts

import { Effect, Layer, Ref } from "effect"
import { TaskQueue, TaskQueueError, ActivityName } from "./CloudTasksQueue"

export interface EnqueuedTask {
  activityName: ActivityName
  input: unknown
  enqueuedAt: Date
}

export const InMemoryTaskQueueLive = Layer.effect(
  TaskQueue,
  Effect.gen(function*() {
    const tasksRef = yield* Ref.make<EnqueuedTask[]>([])

    return {
      enqueue: (activityName, input) =>
        Ref.update(tasksRef, tasks => [
          ...tasks,
          { activityName, input, enqueuedAt: new Date() }
        ])
    }
  })
)

// Test helper to inspect enqueued tasks
export const getEnqueuedTasks = (ref: Ref.Ref<EnqueuedTask[]>) =>
  Ref.get(ref)
```

---

## Testing (Effect.TestContext)

```typescript
// packages/@core-v2/test/Workflow/BatchWorkflow.test.ts

import { it, describe, expect, layer } from "@effect/vitest"
import { Effect, Layer, TestContext, TestClock } from "effect"
import { Persistence } from "@effect/experimental"

// Test layer with all in-memory backends
const TestWorkflowLayer = Layer.mergeAll(
  Persistence.layerMemory,
  InMemoryTaskQueueLive,
  InMemoryStorageServiceLive
).pipe(
  Layer.provideMerge(TestContext.TestContext)
)

describe("BatchWorkflow", () => {
  it.layer(TestWorkflowLayer)("creates batch and persists state", () =>
    Effect.gen(function*() {
      const workflow = yield* BatchWorkflow
      const persistence = yield* Persistence.ResultPersistence

      const result = yield* workflow.execute({
        batchId: "batch-123456789abc" as BatchId,
        manifestUri: "gs://test-bucket/manifest.json" as GcsUri,
        ontologyVersion: "football/ontology@abcd1234abcd1234" as OntologyVersion
      })

      expect(result._tag).toBe("BatchComplete")

      // Verify state was persisted
      const stored = yield* persistence.get("batch-123456789abc")
      expect(stored).toBeDefined()
    })
  )

  it.layer(TestWorkflowLayer)("handles extraction failures with retry", () =>
    Effect.gen(function*() {
      const clock = yield* TestClock.TestClock

      // Simulate failure then success
      // ... test retry behavior with deterministic clock
    })
  )
})
```

---

## Terraform Infrastructure (v3 - Single Activity Runner)

### Summary of Resources

| Resource | Name | Purpose |
|----------|------|---------|
| GCS Bucket | `effect-ontology-{env}` | Documents, batches, ontologies, canonical, workflow-state |
| Cloud Tasks Queue | `workflow-tasks` | Rate-limited task delivery |
| **Cloud Run Job** | **`activity-runner`** | **Single job that dispatches all activities by ACTIVITY_NAME** |
| Cloud Run Service | `api-server` | HTTP API (existing + batch endpoints) |
| Secret Manager | `ANTHROPIC_API_KEY` | LLM API credentials |

### Single Activity Runner Job (Terraform)

```hcl
# ops/terraform/modules/activity-runner/main.tf

resource "google_cloud_run_v2_job" "activity_runner" {
  name     = "activity-runner"
  location = var.region
  project  = var.project_id

  template {
    template {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/effect-ontology/activity-runner:${var.image_tag}"

        resources {
          limits = {
            cpu    = "2"
            memory = "4Gi"
          }
        }

        # Default env vars (ACTIVITY_NAME and ACTIVITY_INPUT set by Cloud Tasks)
        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
        env {
          name  = "GCP_REGION"
          value = var.region
        }
        env {
          name  = "STORAGE_BUCKET"
          value = google_storage_bucket.main.name
        }
        env {
          name = "ANTHROPIC_API_KEY"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.anthropic_api_key.secret_id
              version = "latest"
            }
          }
        }
      }

      timeout     = "1800s"  # 30 min max for any activity
      max_retries = 3

      service_account = google_service_account.activity_runner.email
    }

    task_count = 1
  }

  depends_on = [
    google_project_iam_member.activity_runner_storage,
    google_project_iam_member.activity_runner_secrets
  ]
}

# Service account for activity runner
resource "google_service_account" "activity_runner" {
  account_id   = "activity-runner"
  display_name = "Activity Runner Service Account"
  project      = var.project_id
}

# Storage access
resource "google_project_iam_member" "activity_runner_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.activity_runner.email}"
}

# Secret access
resource "google_project_iam_member" "activity_runner_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.activity_runner.email}"
}
```

### Cloud Tasks Queue (Terraform)

```hcl
# ops/terraform/modules/cloud-tasks/main.tf

resource "google_cloud_tasks_queue" "workflow_tasks" {
  name     = "workflow-tasks"
  location = var.region
  project  = var.project_id

  rate_limits {
    max_concurrent_dispatches = 10
    max_dispatches_per_second = 5
  }

  retry_config {
    max_attempts       = 5
    min_backoff        = "10s"
    max_backoff        = "300s"
    max_retry_duration = "3600s"
  }
}

# Allow Cloud Tasks to invoke Cloud Run Job
resource "google_cloud_run_v2_job_iam_member" "tasks_invoker" {
  name     = google_cloud_run_v2_job.activity_runner.name
  location = var.region
  project  = var.project_id
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.cloud_tasks.email}"
}

resource "google_service_account" "cloud_tasks" {
  account_id   = "cloud-tasks-invoker"
  display_name = "Cloud Tasks Invoker"
  project      = var.project_id
}
```

---

## Implementation Phases

### Phase 1: Domain Models & @effect/workflow Integration
- [ ] Implement branded types (`GcsUri`, `BatchId`, `DocumentId`, etc.)
- [ ] Implement BatchWorkflowState with spread pattern (Schema.TaggedClass + ...BatchWorkflowBase)
- [ ] Implement GcsKeyValueStore for Persistence
- [ ] Implement BatchWorkflow using Workflow.make
- [ ] Unit tests with Persistence.layerMemory

### Phase 2: Activity Workers
- [ ] Implement ExtractionActivity with Activity.make
- [ ] Create extraction-worker Docker image
- [ ] Local testing with InMemoryTaskQueue

### Phase 3: Cloud Tasks Integration
- [ ] Implement CloudTasksQueue (enqueue-only)
- [ ] Wire activity execution to Cloud Tasks → Cloud Run Jobs
- [ ] Integration tests

### Phase 4: Terraform & Deployment
- [ ] Complete Terraform modules
- [ ] Deploy to dev environment
- [ ] E2E tests
- [ ] Deploy to prod

### Phase 5: Future Stages
- [ ] Resolution Activity
- [ ] Validation Activity
- [ ] Ingestion Activity

---

## Summary of Review Changes (v3)

| Finding | Severity | v3 Resolution |
|---------|----------|---------------|
| Identity shapes don't match branded types | Medium | BatchId 12-hex, OntologyVersion namespace/name@hash |
| Manual string builders for paths | Medium | `Schema.TemplateLiteral` for all paths + `PathLayout` service |
| State model with separate stage enum | Medium | Single `Schema.Union` + `Match.type` for exhaustive handling |
| Manual JSON.parse for manifest | Medium | `Schema.decode(ManifestJson)` at boundary |
| Activities inline with Activity.make | Medium | `Workflow.runActivity` + `Workflow.emit` for progress |
| GCS KeyValueStore stubs size/isEmpty | Medium | Full `KeyValueStore.make` impl + `BatchStateStore` typed wrapper |
| Per-activity Cloud Run Jobs | Low | Single `activity-runner` job dispatching by `ACTIVITY_NAME` via `Match` |

### Previous Changes (v2)

| Finding | Severity | v2 Resolution |
|---------|----------|---------------|
| Custom workflow duplicates @effect/workflow | High | Use Workflow.make, Activity.make, Persistence.layerKeyValueStore |
| Batch states repeat base fields | Medium | Share base fields via spread (`...BatchWorkflowBase`) |
| Raw strings for URIs/versions | Medium | Branded types: GcsUri, BatchId, DocumentId, OntologyVersion |
| Manual JSON encode/decode | Medium | Use Schema.parseJson combinator |
| Queue has unnecessary acknowledge API | Medium | Simplified to enqueue-only (Cloud Tasks handles delivery) |
| Manual layer wiring in tests | Low | Use @effect/vitest layer() and TestContext |

---

## Research Findings (v4 - @effect/workflow Deep Dive)

### Key Discoveries from @effect/workflow Analysis

Based on comprehensive research of the `@effect/workflow` package and real-world usage patterns from the Cap codebase:

#### 1. Workflow Engine Architecture

The workflow system requires a **multi-layer architecture**:

```
┌─────────────────────────────────────────────────┐
│  Workflow Definitions Layer                      │
│  (BatchWorkflow.toLayer)                         │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  ClusterWorkflowEngine Layer                     │
│  (Orchestrates workflow execution)               │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  NodeClusterRunnerSocket Layer                   │
│  ({ storage: "sql" | "memory" })                 │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  Persistence Backend                             │
│  (PostgreSQL via @effect/sql-pg for production)  │
└─────────────────────────────────────────────────┘
```

#### 2. Persistence Backend Options

| Backend | Package | Use Case | Our Choice |
|---------|---------|----------|------------|
| **GCS (existing)** | `StorageService` | Production + Local | **Primary - reuse existing!** |
| In-memory | `WorkflowEngine.layerMemory` | Testing | **Unit tests** |
| PostgreSQL | `@effect/sql-pg` | Future (if needed) | Optional upgrade path |

**Decision**: **Reuse existing GCS-backed StorageService** for workflow persistence. Our `StorageService` already extends `KeyValueStore.KeyValueStore` from `@effect/platform`, which is exactly what `Persistence.layerKeyValueStore` expects. Zero new infrastructure needed!

**Key insight**: The `Persistence.layerKeyValueStore` adapter converts any `KeyValueStore` → `BackingPersistence`. Since our `StorageService` already implements `KeyValueStore`, we just compose the layers directly.

#### 3. Activity Definition Pattern (from Cap)

```typescript
yield* Activity.make({
  name: "ExtractionActivity",
  error: Schema.Union(DatabaseError, ExternalServiceError),
  success: ExtractionOutput,
  execute: Effect.gen(function* () {
    // Implementation with retry logic
  }).pipe(
    Effect.retry({
      schedule: Schedule.exponential("200 millis"),
      times: 3,
      while: (e) => e._tag !== "PermanentError",
    }),
  ),
})
```

**Key patterns**:
- Typed `error` schema declares all failure modes upfront
- Conditional retries: only retry transient failures
- `Effect.catchTag` for typed error handling
- `Effect.scoped` for resource cleanup

#### 4. Idempotency Key Design

From Cap's real-world usage:
```typescript
idempotencyKey: (p) =>
  `${p.context.userId}-${p.context.orgId}-${p.batchData.id}-${p.attempt ?? 0}`
```

**Our pattern**:
```typescript
idempotencyKey: (p) => p.batchId  // BatchId already includes hash
```

#### 5. Compensation (Saga) Pattern

```typescript
yield* BatchWorkflow.withCompensation(
  Activity.make({ name: "WriteToCanonical", execute: writeEffect }),
  (result, cause) => Effect.gen(function* () {
    // Rollback on workflow failure
    yield* storage.remove(result.canonicalUri)
  })
)
```

#### 6. DurableClock for Long-Running Waits

```typescript
// Efficient waiting - no resources consumed while sleeping
yield* DurableClock.sleep(Duration.minutes(5))
```

### Updated Architecture Decisions

| Component | Previous Plan | Updated Based on Research |
|-----------|---------------|---------------------------|
| Persistence | GCS KeyValueStore | **Cloud SQL (PostgreSQL)** via `@effect/sql-pg` |
| Local Dev | In-memory | **SQLite** via `@effect/sql-sqlite-bun` |
| Engine | Custom | **ClusterWorkflowEngine** from `@effect/cluster` |
| Socket Layer | N/A | **NodeClusterRunnerSocket** with `storage: "sql"` |
| Activity Retries | Manual | **Activity.retry with Schedule.exponential** |
| Compensation | N/A | **Workflow.withCompensation** for rollback |

### Required Data Structures

#### DurableExecutionJournal Schema (PostgreSQL)

```sql
-- Workflow executions
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name VARCHAR(255) NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'running',
  payload JSONB NOT NULL,
  result JSONB,
  error JSONB,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  UNIQUE(workflow_name, idempotency_key)
);

-- Activity journal (for replay)
CREATE TABLE activity_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id),
  activity_name VARCHAR(255) NOT NULL,
  activity_index INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  result JSONB,
  error JSONB,
  attempt_count INT DEFAULT 0,
  completed_at TIMESTAMP,

  UNIQUE(execution_id, activity_index)
);

-- Compensation log
CREATE TABLE compensation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id),
  compensation_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP
);
```

### Updated Terraform Resources

Add to existing Terraform:

```hcl
# Cloud SQL for workflow persistence
resource "google_sql_database_instance" "workflow_db" {
  name             = "workflow-postgres"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier = "db-f1-micro"  # Upgrade for production

    backup_configuration {
      enabled = true
      start_time = "03:00"
    }
  }
}

resource "google_sql_database" "workflows" {
  name     = "workflows"
  instance = google_sql_database_instance.workflow_db.name
}

resource "google_sql_user" "workflow_app" {
  name     = "workflow_app"
  instance = google_sql_database_instance.workflow_db.name
  password = random_password.db_password.result
}
```

### Revised Implementation Phases

#### Phase 1: Foundation (Current)
- [x] Domain models (Identity, BatchWorkflow, PathLayout) ✓
- [x] Activity schemas ✓
- [x] StorageService (GCS, local, memory) ✓
- [ ] **Add SQLite persistence layer for local dev**
- [ ] **Add PostgreSQL persistence layer for production**

#### Phase 2: Workflow Engine
- [ ] Wire `ClusterWorkflowEngine.layer`
- [ ] Configure `NodeClusterRunnerSocket.layer({ storage: "sql" })`
- [ ] Implement `BatchWorkflow.toLayer()` with real activities
- [ ] Add `Workflow.withCompensation` for rollback

#### Phase 3: Activities with Real Logic
- [ ] **ExtractionActivity**: Wire existing `StreamingExtraction` pipeline
- [ ] **ResolutionActivity**: Wire existing `EntityResolution` module
- [ ] **ValidationActivity**: Integrate SHACL validation (or stub with conforms=true)
- [ ] **IngestionActivity**: Wire RDF triple counting + canonical write

#### Phase 4: Testing
- [ ] Unit tests with `WorkflowEngine.layerMemory`
- [ ] Integration tests with SQLite
- [ ] E2E tests with Cloud SQL

#### Phase 5: Production
- [ ] Terraform Cloud SQL + migrations
- [ ] Deploy workflow engine to Cloud Run
- [ ] Monitor with structured logging

---

## References

- [@effect/workflow](https://www.npmjs.com/package/@effect/workflow)
- [@effect/experimental Persistence](https://www.npmjs.com/package/@effect/experimental)
- [Effect Schema Brand](https://effect.website/docs/schema/brand/)
- [Effect Schema parseJson](https://effect.website/docs/schema/parsejson/)
- [Cloud Tasks Documentation](https://cloud.google.com/tasks/docs)
- [Cloud Run Jobs Documentation](https://cloud.google.com/run/docs/create-jobs)
- [@effect/cluster-workflow](https://www.npmjs.com/package/@effect/cluster-workflow)
- [@effect/sql-pg](https://www.npmjs.com/package/@effect/sql-pg)
- [@effect/sql-sqlite-bun](https://www.npmjs.com/package/@effect/sql-sqlite-bun)
- [Cap Codebase (real-world workflow patterns)](docs/Cap/)
