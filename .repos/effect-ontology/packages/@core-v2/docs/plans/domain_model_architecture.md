Effect-First Domain Model Engineering Spec

Executive Summary

Refactor @core-v2 to achieve clean, centralized domain type handling using Effect's most powerful composition patterns. Key technique: Schema.TemplateLiteralParser for
bidirectional string↔tuple transforms, enabling deterministic path generation and parsing from a single source of truth.

---

Part 1: Core Pattern — TemplateLiteralParser

The Problem

Paths like ontologies/{namespace}/{name}/{hash}/ontology.ttl are currently:

- Generated with string interpolation (fragile)
- Parsed with regex (duplicated logic)
- No type safety between path and domain data

The Solution

Schema.TemplateLiteralParser provides bidirectional transforms:

import { Schema } from "effect"

// Define once: Schema<[string, string, string], `ontologies/${string}/${string}/${string}/ontology.ttl`>
const OntologyPath = Schema.TemplateLiteralParser(
"ontologies/",
Schema.String, // namespace
"/",
Schema.String, // name
"/",
Schema.String, // contentHash
"/ontology.ttl"
)

// DECODE: path string → tuple
Schema.decodeSync(OntologyPath)("ontologies/football/premier-league/abc123/ontology.ttl")
// → ["football", "premier-league", "abc123"]

// ENCODE: tuple → path string
Schema.encodeSync(OntologyPath)(["football", "premier-league", "abc123"])
// → "ontologies/football/premier-league/abc123/ontology.ttl"

Why This Matters

1.  Single source of truth — path structure defined once
2.  Bidirectional — generate AND parse from same schema
3.  Type-safe — tuple positions map to domain fields
4.  Composable — can use branded types in spans

---

Part 2: Domain Identity Types

2.1 Branded Primitives

// Domain/Identity.ts

import { Schema } from "effect"

// Content hash: SHA-256 prefix (16 hex chars)
export const ContentHash = Schema.String.pipe(
Schema.pattern(/^[a-f0-9]{16}$/),
Schema.brand("ContentHash")
)
export type ContentHash = typeof ContentHash.Type

// Full SHA-256 for idempotency keys
export const IdempotencyKey = Schema.String.pipe(
Schema.pattern(/^[a-f0-9]{64}$/),
Schema.brand("IdempotencyKey")
)
export type IdempotencyKey = typeof IdempotencyKey.Type

// GCS bucket name (validated)
export const GcsBucket = Schema.String.pipe(
Schema.pattern(/^[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]$/),
Schema.brand("GcsBucket")
)
export type GcsBucket = typeof GcsBucket.Type

// GCS object path (no // or leading/trailing /)
export const GcsObject = Schema.String.pipe(
Schema.pattern(/^[^\/].\*[^\/]$/),
Schema.filter((s) => !s.includes("//"), {
message: () => "Path cannot contain //"
}),
Schema.brand("GcsObject")
)
export type GcsObject = typeof GcsObject.Type

// Namespace identifier (alphanumeric + hyphens)
export const Namespace = Schema.String.pipe(
Schema.pattern(/^[a-z][a-z0-9-]\*$/),
Schema.brand("Namespace")
)
export type Namespace = typeof Namespace.Type

// Ontology name (alphanumeric + hyphens + underscores)
export const OntologyName = Schema.String.pipe(
Schema.pattern(/^[a-z][a-z0-9_-]\*$/),
Schema.brand("OntologyName")
)
export type OntologyName = typeof OntologyName.Type

2.2 Document/Run Identity

// DocumentId: content-derived, deterministic
export const DocumentId = Schema.TemplateLiteral(
Schema.Literal("doc-"),
Schema.String.pipe(Schema.pattern(/^[a-f0-9]{12}$/))
).pipe(Schema.brand("DocumentId"))
export type DocumentId = typeof DocumentId.Type

// Helper to create DocumentId from content hash
export const documentIdFromHash = (hash: ContentHash): DocumentId =>
`doc-${hash.slice(0, 12)}` as DocumentId

// ChunkId: parent document + index
export const ChunkId = Schema.TemplateLiteral(
DocumentId,
Schema.Literal("-chunk-"),
Schema.NumberFromString
).pipe(Schema.brand("ChunkId"))
export type ChunkId = typeof ChunkId.Type

---

Part 3: PathLayout with TemplateLiteralParser

3.1 Ontology Paths

// Domain/PathLayout.ts

import { Schema, PrimaryKey } from "effect"
import { Namespace, OntologyName, ContentHash, DocumentId } from "./Identity"

// === ONTOLOGY PATHS ===

// Schema for ontology file path
// Parses: "ontologies/football/premier-league/abc123def456ghij/ontology.ttl"
// Into: [Namespace, OntologyName, ContentHash]
export const OntologyFilePath = Schema.TemplateLiteralParser(
"ontologies/",
Namespace,
"/",
OntologyName,
"/",
ContentHash,
"/ontology.ttl"
)

// Manifest path (for "latest" resolution)
export const OntologyManifestPath = Schema.TemplateLiteralParser(
"ontologies/",
Namespace,
"/",
OntologyName,
"/manifest.json"
)

// === TYPE ALIASES ===
export type OntologyFilePathTuple = typeof OntologyFilePath.Type
export type OntologyFilePathEncoded = typeof OntologyFilePath.Encoded

3.2 Run Paths

// === RUN PATHS ===

// Run metadata: runs/{docId}/metadata.json
export const RunMetadataPath = Schema.TemplateLiteralParser(
"runs/",
DocumentId,
"/metadata.json"
)

// Run input: runs/{docId}/input/document.txt
export const RunInputPath = Schema.TemplateLiteralParser(
"runs/",
DocumentId,
"/input/document.txt"
)

// Chunk path: runs/{docId}/input/chunks/chunk-{n}.txt
export const RunChunkPath = Schema.TemplateLiteralParser(
"runs/",
DocumentId,
"/input/chunks/chunk-",
Schema.NumberFromString,
".txt"
)

// Output types
export const OutputType = Schema.Literal(
"entities",
"relations",
"knowledge-graph",
"resolved-graph",
"turtle",
"jsonld"
)
export type OutputType = typeof OutputType.Type

// Output file mapping
const outputFilename: Record<OutputType, string> = {
entities: "entities.json",
relations: "relations.json",
"knowledge-graph": "knowledge-graph.json",
"resolved-graph": "resolved-graph.json",
turtle: "graph.ttl",
jsonld: "graph.jsonld"
}

// Run output: runs/{docId}/outputs/{filename}
export const RunOutputPath = Schema.TemplateLiteralParser(
"runs/",
DocumentId,
"/outputs/",
Schema.String // filename
)

3.3 PathLayout Service

// === PATH LAYOUT SERVICE ===

// Unified path operations
export const PathLayout = {
// ONTOLOGY
ontology: {
encode: (ns: Namespace, name: OntologyName, hash: ContentHash) =>
Schema.encodeSync(OntologyFilePath)([ns, name, hash]),
decode: (path: string) =>
Schema.decodeSync(OntologyFilePath)(path),
manifest: (ns: Namespace, name: OntologyName) =>
Schema.encodeSync(OntologyManifestPath)([ns, name])
},

// RUN
run: {
metadata: (docId: DocumentId) =>
Schema.encodeSync(RunMetadataPath)([docId]),
input: (docId: DocumentId) =>
Schema.encodeSync(RunInputPath)([docId]),
chunk: (docId: DocumentId, index: number) =>
Schema.encodeSync(RunChunkPath)([docId, index]),
output: (docId: DocumentId, type: OutputType) =>
Schema.encodeSync(RunOutputPath)([docId, outputFilename[type]]),

     // Parse helpers
     parseMetadata: (path: string) =>
       Schema.decodeSync(RunMetadataPath)(path),
     parseChunk: (path: string) =>
       Schema.decodeSync(RunChunkPath)(path),

}
} as const

---

Part 4: Domain Classes with Schema.Class

4.1 OntologyRef

// Domain/Ontology.ts

import { Schema, PrimaryKey } from "effect"
import { Namespace, OntologyName, ContentHash } from "./Identity"
import { PathLayout } from "./PathLayout"

// Ontology identity - content-addressed
export class OntologyRef extends Schema.Class<OntologyRef>("OntologyRef")({
namespace: Namespace,
name: OntologyName,
contentHash: ContentHash
}) {
// Effect PrimaryKey for deduplication
[PrimaryKey.symbol]() {
return `${this.namespace}:${this.name}@${this.contentHash}`
}

// Derived: storage path
get storagePath(): string {
return PathLayout.ontology.encode(this.namespace, this.name, this.contentHash)
}

// Derived: short ID for display
get shortId(): string {
return `${this.namespace}/${this.name}`
}

// Factory: from storage path (bidirectional!)
static fromPath(path: string): OntologyRef {
const [namespace, name, contentHash] = PathLayout.ontology.decode(path)
return new OntologyRef({ namespace, name, contentHash })
}
}

4.2 ExtractionRun

// Domain/ExtractionRun.ts

import { Schema, Data, PrimaryKey } from "effect"
import { DocumentId, IdempotencyKey } from "./Identity"
import { OntologyRef } from "./Ontology"
import { PathLayout } from "./PathLayout"

// Error codes
export const ErrorCode = Schema.Literal(
"validation",
"llm_error",
"storage",
"timeout",
"rate_limited",
"cancelled",
"unknown"
)
export type ErrorCode = typeof ErrorCode.Type

// Run status as TaggedEnum for pattern matching
export type RunStatus = Data.TaggedEnum<{
Pending: {}
Running: { startedAt: Date }
Complete: { completedAt: Date }
Failed: { failedAt: Date; errorCode: ErrorCode }
}>
export const RunStatus = Data.taggedEnum<RunStatus>()

// Chunking config
export class ChunkingConfig extends Schema.Class<ChunkingConfig>("ChunkingConfig")({
maxChunkSize: Schema.Int.pipe(Schema.positive(), Schema.between(100, 10000)),
preserveSentences: Schema.optionalWith(Schema.Boolean, { default: () => true }),
overlapTokens: Schema.optionalWith(Schema.Int.pipe(Schema.between(0, 200)), { default: () => 50 })
}) {}

// LLM config
export class LlmConfig extends Schema.Class<LlmConfig>("LlmConfig")({
model: Schema.NonEmptyString,
temperature: Schema.Number.pipe(Schema.between(0, 2)),
maxTokens: Schema.Int.pipe(Schema.positive()),
timeoutMs: Schema.Int.pipe(Schema.between(1000, 300000))
}) {}

// Full run config
export class RunConfig extends Schema.Class<RunConfig>("RunConfig")({
ontology: OntologyRef,
chunking: ChunkingConfig,
llm: LlmConfig,
concurrency: Schema.optionalWith(Schema.Int.pipe(Schema.between(1, 32)), { default: () => 4 }),
enableGrounding: Schema.optionalWith(Schema.Boolean, { default: () => true })
}) {}

// Run statistics
export class RunStats extends Schema.Class<RunStats>("RunStats")({
chunkCount: Schema.Int.pipe(Schema.nonNegative()),
entityCount: Schema.Int.pipe(Schema.nonNegative()),
relationCount: Schema.Int.pipe(Schema.nonNegative()),
resolvedCount: Schema.Int.pipe(Schema.nonNegative()),
tokensUsed: Schema.Int.pipe(Schema.nonNegative()),
durationMs: Schema.Int.pipe(Schema.nonNegative())
}) {}

// Extraction run record
export class ExtractionRun extends Schema.Class<ExtractionRun>("ExtractionRun")({
id: DocumentId,
idempotencyKey: IdempotencyKey,
status: Schema.Literal("pending", "running", "complete", "failed"),
config: RunConfig,
createdAt: Schema.DateFromSelf,
updatedAt: Schema.DateFromSelf,
completedAt: Schema.optional(Schema.DateFromSelf),
stats: Schema.optional(RunStats),
error: Schema.optional(Schema.Struct({
code: ErrorCode,
message: Schema.String
}))
}) {
[PrimaryKey.symbol]() {
return this.id
}

// Derived paths
get metadataPath(): string {
return PathLayout.run.metadata(this.id)
}

get inputPath(): string {
return PathLayout.run.input(this.id)
}

outputPath(type: OutputType): string {
return PathLayout.run.output(this.id, type)
}
}

---

Part 5: Config Service (Effect-Idiomatic)

// Service/Config.ts

import { Config, Effect, Layer, Redacted } from "effect"

// Nested config groups
const LlmConfig = Config.nested("LLM")(Config.all({
provider: Config.literal("anthropic", "openai", "google")("PROVIDER").pipe(
Config.withDefault("anthropic")
),
model: Config.string("MODEL").pipe(
Config.withDefault("claude-haiku-4-5")
),
apiKey: Config.redacted("API_KEY"),
timeoutMs: Config.integer("TIMEOUT_MS").pipe(Config.withDefault(60_000)),
maxTokens: Config.integer("MAX_TOKENS").pipe(Config.withDefault(4096)),
temperature: Config.number("TEMPERATURE").pipe(Config.withDefault(0.1))
}))

const StorageConfig = Config.nested("STORAGE")(Config.all({
type: Config.literal("local", "gcs", "memory")("TYPE").pipe(
Config.withDefault("local")
),
bucket: Config.option(Config.string("BUCKET")),
localPath: Config.option(Config.string("LOCAL_PATH")),
prefix: Config.string("PREFIX").pipe(Config.withDefault(""))
}))

const OntologyConfig = Config.nested("ONTOLOGY")(Config.all({
path: Config.string("PATH"),
cacheTtlSeconds: Config.integer("CACHE_TTL").pipe(Config.withDefault(3600))
}))

const RuntimeConfig = Config.nested("RUNTIME")(Config.all({
concurrency: Config.integer("CONCURRENCY").pipe(Config.withDefault(4)),
llmConcurrencyLimit: Config.integer("LLM_CONCURRENCY").pipe(Config.withDefault(2)),
retryMaxAttempts: Config.integer("RETRY_MAX").pipe(Config.withDefault(3)),
enableTracing: Config.boolean("ENABLE_TRACING").pipe(Config.withDefault(false))
}))

// Unified app config type
export interface AppConfig {
readonly llm: Config.Config.Success<typeof LlmConfig>
readonly storage: Config.Config.Success<typeof StorageConfig>
readonly ontology: Config.Config.Success<typeof OntologyConfig>
readonly runtime: Config.Config.Success<typeof RuntimeConfig>
}

// Service definition
export class ConfigService extends Effect.Service<ConfigService>()("ConfigService", {
effect: Effect.gen(function* () {
const [llm, storage, ontology, runtime] = yield* Effect.all([
LlmConfig, StorageConfig, OntologyConfig, RuntimeConfig
])
return { llm, storage, ontology, runtime } satisfies AppConfig
}),
accessors: true
}) {}

---

Part 6: Phased Implementation

Phase 1: Foundation (Identity + PathLayout)

Files:

- Domain/Identity.ts — Create branded identity types
- Domain/PathLayout.ts — Create TemplateLiteralParser schemas

Test:
// Verify bidirectional path transforms
const path = PathLayout.ontology.encode("football", "premier-league", "abc123def456ghij")
expect(path).toBe("ontologies/football/premier-league/abc123def456ghij/ontology.ttl")

const [ns, name, hash] = PathLayout.ontology.decode(path)
expect(ns).toBe("football")
expect(name).toBe("premier-league")
expect(hash).toBe("abc123def456ghij")

Phase 2: Domain Classes

Files:

- Domain/Model/Ontology.ts — Add OntologyRef, OntologySource
- Domain/Model/ExtractionRun.ts — Add RunConfig, RunStats, ExtractionRun

Test:
// Verify Schema.Class decode/encode
const ref = new OntologyRef({
namespace: "football",
name: "premier-league",
contentHash: "abc123def456ghij"
})
expect(ref.storagePath).toContain("ontologies/football/")
expect(OntologyRef.fromPath(ref.storagePath)).toEqual(ref)

Phase 3: Config Refactor

Files:

- Service/Config.ts — Refactor to nested Config pattern

Test:
// Verify config loading
const program = Effect.gen(function* () {
const config = yield* ConfigService
expect(config.llm.provider).toBe("anthropic")
expect(config.storage.type).toBe("local")
})

Phase 4: Storage Integration

Files:

- Service/Storage.ts — Integrate PathLayout
- Service/OntologyLoader.ts — Add manifest support

Test:
// Verify storage uses PathLayout
const storage = yield* StorageService
const content = yield* storage.get(PathLayout.ontology.encode("ns", "name", "hash"))

Phase 5: Migration & Cleanup

Tasks:

- Update all imports across codebase
- Remove redundant path string literals
- Update tests to use new types

---

Part 7: Testing Strategy

Unit Tests

describe("PathLayout", () => {
describe("OntologyFilePath", () => {
it("encodes tuple to path string", () => {
const path = Schema.encodeSync(OntologyFilePath)(["ns", "name", "hash"])
expect(path).toBe("ontologies/ns/name/hash/ontology.ttl")
})

     it("decodes path string to tuple", () => {
       const tuple = Schema.decodeSync(OntologyFilePath)("ontologies/ns/name/hash/ontology.ttl")
       expect(tuple).toEqual(["ns", "name", "hash"])
     })

     it("rejects invalid paths", () => {
       expect(() => Schema.decodeSync(OntologyFilePath)("invalid/path")).toThrow()
     })

})
})

Property Tests

import { Arbitrary } from "effect"

describe("PathLayout properties", () => {
it("roundtrips ontology paths", () => {
fc.assert(fc.property(
Arbitrary.make(Namespace),
Arbitrary.make(OntologyName),
Arbitrary.make(ContentHash),
(ns, name, hash) => {
const encoded = Schema.encodeSync(OntologyFilePath)([ns, name, hash])
const decoded = Schema.decodeSync(OntologyFilePath)(encoded)
expect(decoded).toEqual([ns, name, hash])
}
))
})
})

Integration Tests

describe("Storage + PathLayout integration", () => {
it("stores ontology at derived path", async () => {
const ref = new OntologyRef({ namespace: "test", name: "ont", contentHash: "abc123" })
await Effect.runPromise(
storage.put(ref.storagePath, "content").pipe(
Effect.flatMap(() => storage.get(ref.storagePath)),
Effect.map((content) => expect(content).toBe("content"))
)
)
})
})

---

Part 8: File Structure

packages/@core-v2/src/
├── Domain/
│ ├── Identity.ts # NEW: Branded identity types
│ ├── PathLayout.ts # NEW: TemplateLiteralParser paths
│ ├── Model/
│ │ ├── Ontology.ts # MODIFY: Add OntologyRef, LoadedOntology
│ │ ├── ExtractionRun.ts # MODIFY: Add RunConfig, RunStats
│ │ └── index.ts
│ └── index.ts
│
├── Service/
│ ├── Config.ts # MODIFY: Nested Config pattern
│ ├── Storage.ts # MODIFY: PathLayout integration
│ ├── OntologyLoader.ts # MODIFY: Manifest support
│ └── index.ts
│
└── index.ts

---

Part 9: GCS Layout

gs://effect-ontology-bucket/
├── ontologies/
│ └── {namespace}/
│ └── {name}/
│ ├── manifest.json # { latest: ContentHash, versions: {...} }
│ └── {contentHash}/
│ └── ontology.ttl
└── runs/
└── {documentId}/
├── metadata.json # ExtractionRun record
├── input/
│ ├── document.txt
│ └── chunks/
│ └── chunk-{n}.txt
└── outputs/
├── entities.json
├── relations.json
├── knowledge-graph.json
└── graph.ttl

---

Part 10: Key Benefits

| Aspect          | Before                     | After                                      |
| --------------- | -------------------------- | ------------------------------------------ |
| Path generation | String interpolation       | Schema.encodeSync(OntologyFilePath)(tuple) |
| Path parsing    | Regex + manual extraction  | Schema.decodeSync(OntologyFilePath)(path)  |
| Type safety     | None for paths             | Full branded types                         |
| Single source   | Multiple hardcoded strings | One TemplateLiteralParser                  |
| Bidirectional   | Manual sync                | Automatic from schema                      |
| Testing         | Brittle string tests       | Property-based roundtrip                   |

---

Critical Files to Modify

1.  packages/@core-v2/src/Domain/Identity.ts — NEW
2.  packages/@core-v2/src/Domain/PathLayout.ts — NEW
3.  packages/@core-v2/src/Domain/Model/Ontology.ts — Add OntologyRef
4.  packages/@core-v2/src/Domain/Model/ExtractionRun.ts — Add Schema.Class types
5.  packages/@core-v2/src/Service/Config.ts — Nested Config refactor
6.  packages/@core-v2/src/Service/Storage.ts — PathLayout integration
7.  packages/@core-v2/src/Utils/IdempotencyKey.ts — Integrate ContentHash
