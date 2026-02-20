# Embedding Pipeline Design

> P2 Design Document — Defines the full indexing pipeline from source code to searchable vector + keyword index.

## Architecture Overview

```
Source Files (.ts)
    │
    ├─ [1] File Scanner (git diff / full scan)
    │      Identifies changed files via content hashing
    │
    ├─ [2] AST Extractor (ts-morph + doctrine)
    │      Extracts IndexedSymbol structs per exported symbol
    │
    ├─ [3] Embedding Unit Builder
    │      buildEmbeddingText(sym) → natural language string
    │      buildKeywordText(sym) → keyword string
    │
    ├─ [4] Embedding Model (Nomic CodeRankEmbed, ONNX)
    │      embeddingText → Float32Array[768]
    │
    ├─ [5] LanceDB Writer
    │      Upserts rows into vector table
    │
    └─ [6] BM25 Index Writer
           Updates keyword search index
```

---

## 1. File Scanner

### Change Detection Strategy: Content Hash Comparison

```typescript
interface FileHash {
  readonly filePath: string
  readonly contentHash: string  // SHA-256 of file content
  readonly lastModified: number // mtime epoch ms
}

interface ScanResult {
  readonly added: ReadonlyArray<string>    // new files
  readonly modified: ReadonlyArray<string> // changed content hash
  readonly deleted: ReadonlyArray<string>  // files removed
  readonly unchanged: ReadonlyArray<string>
}
```

**Algorithm:**

```typescript
/**
 * Compares current file hashes against stored hashes from last index run.
 *
 * Uses SHA-256 of file content (not mtime) to detect actual changes.
 * Stored hashes are kept in `.code-index/file-hashes.json`.
 *
 * For full reindex: treat all files as "added".
 */
const scanFiles = Effect.fn(function* (
  rootDir: string,
  mode: "incremental" | "full"
) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  // Glob all TypeScript source files
  const globPattern = "tooling/*/src/**/*.ts"
  const allFiles = yield* fs.glob(globPattern, { cwd: rootDir })

  // Filter out test files, internal, declaration files
  const sourceFiles = pipe(
    allFiles,
    A.filter((f) =>
      !f.includes(".test.") &&
      !f.includes(".spec.") &&
      !f.includes("/internal/") &&
      !f.endsWith(".d.ts")
    )
  )

  if (mode === "full") {
    return { added: sourceFiles, modified: [], deleted: [], unchanged: [] }
  }

  // Load previous hashes
  const hashFile = path.join(rootDir, ".code-index", "file-hashes.json")
  const prevHashes = yield* loadHashMap(hashFile)

  // Compute current hashes
  const currentHashes = yield* Effect.forEach(sourceFiles, (f) =>
    computeFileHash(f).pipe(Effect.map((hash) => [f, hash] as const))
  )

  // Diff
  const added: Array<string> = []
  const modified: Array<string> = []
  const unchanged: Array<string> = []

  for (const [file, hash] of currentHashes) {
    const prev = prevHashes.get(file)
    if (prev === undefined) added.push(file)
    else if (prev !== hash) modified.push(file)
    else unchanged.push(file)
  }

  const currentFileSet = new Set(sourceFiles)
  const deleted = pipe(
    prevHashes.keys(),
    A.fromIterable,
    A.filter((f) => !currentFileSet.has(f))
  )

  return { added, modified, deleted, unchanged }
})
```

---

## 2. AST Extractor

### Extraction Pipeline

```typescript
/**
 * Extracts IndexedSymbol records from a TypeScript source file.
 *
 * Uses ts-morph for AST traversal and doctrine for JSDoc parsing.
 * Extracts:
 * - JSDoc metadata (description, tags, examples)
 * - Effect Schema annotations (.annotate() calls)
 * - TaggedErrorClass metadata
 * - Type signatures
 * - Import relationships
 */
const extractSymbols = Effect.fn(function* (
  filePath: string,
  project: tsMorph.Project
) {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return []

  const symbols: Array<IndexedSymbol> = []

  // Extract module-level doc
  const moduleDoc = extractModuleDoc(sourceFile)
  if (moduleDoc !== null) {
    symbols.push(moduleDoc)
  }

  // Extract all exported declarations
  for (const exportDecl of sourceFile.getExportedDeclarations()) {
    const [name, decls] = exportDecl
    for (const decl of decls) {
      const sym = extractDeclaration(name, decl, {
        filePath,
        moduleDescription: moduleDoc?.description ?? null,
        packageName: resolvePackageName(filePath),
        modulePath: resolveModulePath(filePath),
      })
      if (sym !== null) {
        symbols.push(sym)
      }
    }
  }

  return symbols
})
```

### Effect-Specific Extractors

```typescript
/**
 * Detects Effect patterns from AST node structure.
 *
 * Decision tree:
 * 1. `extends S.TaggedErrorClass` → EffectPattern.TaggedErrorClass
 * 2. `S.Struct({...})` → EffectPattern.SchemaStruct
 * 3. `S.Class(...)` → EffectPattern.SchemaClass
 * 4. `.pipe(S.brand(...))` → EffectPattern.SchemaBrand
 * 5. `Context.Tag(...)` → EffectPattern.ContextTag
 * 6. `Layer.effect(...)` → EffectPattern.LayerEffect
 * 7. `Layer.succeed(...)` → EffectPattern.LayerSucceed
 * 8. `Effect.fn(function* ...)` → EffectPattern.EffectFn
 * 9. `Command.make(...)` → EffectPattern.CommandMake
 */
const detectEffectPattern = (node: tsMorph.Node): EffectPattern | null => {
  const text = node.getText()

  // TaggedErrorClass (class declaration extends)
  if (tsMorph.Node.isClassDeclaration(node)) {
    const heritage = node.getHeritageClauses()
    for (const clause of heritage) {
      if (clause.getText().includes("TaggedErrorClass")) {
        return "Schema.TaggedErrorClass"
      }
    }
  }

  // Schema patterns (variable declarations)
  if (tsMorph.Node.isVariableDeclaration(node)) {
    const init = node.getInitializerIfKind(tsMorph.SyntaxKind.CallExpression)
    if (init) {
      const callText = init.getExpression().getText()
      if (callText.match(/^S\.(Struct|Class|Union|TaggedStruct)$/)) {
        return `Schema.${callText.split(".")[1]}` as EffectPattern
      }
    }
    // Brand detection in pipe chain
    if (text.includes("S.brand(")) return "Schema.brand"
  }

  // Layer/Context/Effect/Command patterns (simpler text matching)
  if (text.includes("Context.Tag(")) return "Context.Tag"
  if (text.includes("Layer.effect(")) return "Layer.effect"
  if (text.includes("Layer.succeed(")) return "Layer.succeed"
  if (text.includes("Effect.fn(")) return "Effect.fn"
  if (text.includes("Command.make(")) return "Command.make"

  return null
}

/**
 * Extracts .annotate() metadata from Schema expressions.
 *
 * Parses the object literal inside .annotate({ ... }) to get
 * identifier, title, description, examples fields.
 */
const extractSchemaAnnotations = (
  node: tsMorph.Node
): SchemaAnnotations | null => {
  const text = node.getText()
  const annotateMatch = text.match(/\.annotate\s*\(\s*\{([\s\S]*?)\}\s*\)/)
  if (!annotateMatch) return null

  const content = annotateMatch[1]
  return {
    identifier: extractStringField(content, "identifier"),
    title: extractStringField(content, "title"),
    description: extractStringField(content, "description"),
  }
}

interface SchemaAnnotations {
  readonly identifier: string | null
  readonly title: string | null
  readonly description: string | null
}
```

---

## 3. Embedding Unit Construction

See `indexed-symbol-schema.md` for the full `buildEmbeddingText` and `buildKeywordText` functions.

### Token Budget Per Symbol

| Symbol Kind | Avg Embedding Text | Avg Tokens |
|------------|-------------------|-----------|
| schema | Title + description + schema description + remarks + field descriptions | 150-300 |
| service | Title + description + remarks + provides/depends | 200-350 |
| layer | Title + description + provides/depends | 100-200 |
| error | Description + related operations | 80-150 |
| function | Description + params + returns + errors + example comments | 200-400 |
| type | Description + related types | 80-150 |
| constant | Description + value context | 50-100 |
| command | Description + remarks + errors | 150-300 |
| module | Module description + key exports | 100-250 |

**Target: 150-400 tokens per symbol.** Truncate at 3000 characters (model context limit safety).

---

## 4. Embedding Model

### Selection: Nomic CodeRankEmbed (137M)

| Property | Value |
|----------|-------|
| Model | `nomic-ai/CodeRankEmbed` |
| Parameters | 137M |
| Dimensions | 768 |
| Context window | 8,192 tokens |
| License | Apache-2.0 |
| Runtime | ONNX via `@huggingface/transformers` |
| Model size | ~521MB (ONNX quantized) |
| Inference time | ~100-200ms per embedding (CPU) |

### Why CodeRankEmbed

1. **SOTA for size** — Beats models 10-50x larger on code search benchmarks
2. **Local execution** — No API calls, no data leaves the machine
3. **Apache-2.0** — Compatible with any project license
4. **ONNX support** — Runs efficiently on CPU via transformers.js
5. **8K context** — Handles our 150-400 token embedding units easily
6. **Code-optimized** — Trained specifically on code + documentation pairs

### Integration

```typescript
import { pipeline } from "@huggingface/transformers"

/**
 * Embedding service backed by Nomic CodeRankEmbed ONNX model.
 *
 * Model is loaded once and kept in memory for the lifetime of the
 * indexing process. Uses transformers.js ONNX runtime for CPU inference.
 */
class EmbeddingService extends Context.Tag("EmbeddingService")<
  EmbeddingService,
  {
    readonly embed: (text: string) => Effect.Effect<Float32Array>
    readonly embedBatch: (texts: ReadonlyArray<string>) => Effect.Effect<ReadonlyArray<Float32Array>>
  }
>() {}

const EmbeddingServiceLive = Layer.effect(
  EmbeddingService,
  Effect.fn(function* () {
    const extractor = yield* Effect.promise(() =>
      pipeline("feature-extraction", "nomic-ai/CodeRankEmbed", {
        quantized: true,
      })
    )

    return {
      embed: Effect.fn(function* (text: string) {
        const output = yield* Effect.promise(() =>
          extractor(text, { pooling: "mean", normalize: true })
        )
        return new Float32Array(output.data)
      }),

      embedBatch: Effect.fn(function* (texts: ReadonlyArray<string>) {
        const outputs = yield* Effect.promise(() =>
          extractor(Array.from(texts), { pooling: "mean", normalize: true })
        )
        // Split batch output into individual embeddings
        const dim = 768
        return pipe(
          A.range(0, texts.length - 1),
          A.map((i) => new Float32Array(outputs.data.slice(i * dim, (i + 1) * dim)))
        )
      }),
    }
  })
)
```

### Batch Processing

```typescript
/**
 * Process symbols in batches of 32 for efficient embedding.
 *
 * Batch size chosen to balance:
 * - Memory usage (~32 * 3000 chars = ~96KB per batch)
 * - GPU/CPU utilization
 * - Progress reporting granularity
 */
const BATCH_SIZE = 32

const embedSymbols = Effect.fn(function* (
  symbols: ReadonlyArray<IndexedSymbol>
) {
  const embedder = yield* EmbeddingService
  const batches = A.chunksOf(symbols, BATCH_SIZE)
  const results: Array<{ symbol: IndexedSymbol; vector: Float32Array }> = []

  for (const batch of batches) {
    const texts = pipe(batch, A.map((s) => s.embeddingText))
    const vectors = yield* embedder.embedBatch(texts)

    for (let i = 0; i < batch.length; i++) {
      results.push({ symbol: batch[i], vector: vectors[i] })
    }

    yield* Effect.log(`Embedded ${results.length}/${symbols.length} symbols`)
  }

  return results
})
```

---

## 5. LanceDB Storage

### Table Schema

```typescript
import * as lancedb from "@lancedb/lancedb"

/**
 * LanceDB table schema for the symbols table.
 *
 * Primary table storing all indexed symbols with their embeddings.
 * Supports both vector similarity search and metadata filtering.
 */
interface SymbolRow {
  // Vector column (768-dimensional, cosine distance)
  readonly vector: Float32Array

  // Identity (filterable)
  readonly id: string
  readonly name: string
  readonly qualified_name: string

  // Location
  readonly file_path: string
  readonly start_line: number
  readonly end_line: number

  // Classification (filterable)
  readonly kind: string
  readonly effect_pattern: string | null
  readonly package: string
  readonly module: string
  readonly category: string
  readonly domain: string | null

  // Natural language (for display)
  readonly description: string
  readonly title: string | null
  readonly signature: string
  readonly since: string
  readonly deprecated: boolean

  // Search text (for BM25)
  readonly keyword_text: string

  // Incremental indexing
  readonly content_hash: string
  readonly indexed_at: string

  // Full metadata (JSON blob for complete IndexedSymbol)
  readonly metadata_json: string
}
```

### Table Creation

```typescript
const createSymbolsTable = Effect.fn(function* (indexPath: string) {
  const db = yield* Effect.promise(() => lancedb.connect(indexPath))

  // Create or overwrite table
  const table = yield* Effect.promise(() =>
    db.createTable(
      "symbols",
      [],  // Empty initial data
      {
        mode: "overwrite",
        schema: {
          vector: { type: "fixed_size_list", listSize: 768, children: [{ type: "float32" }] },
          id: { type: "utf8" },
          name: { type: "utf8" },
          qualified_name: { type: "utf8" },
          file_path: { type: "utf8" },
          start_line: { type: "int32" },
          end_line: { type: "int32" },
          kind: { type: "utf8" },
          effect_pattern: { type: "utf8", nullable: true },
          package: { type: "utf8" },
          module: { type: "utf8" },
          category: { type: "utf8" },
          domain: { type: "utf8", nullable: true },
          description: { type: "utf8" },
          title: { type: "utf8", nullable: true },
          signature: { type: "utf8" },
          since: { type: "utf8" },
          deprecated: { type: "bool" },
          keyword_text: { type: "utf8" },
          content_hash: { type: "utf8" },
          indexed_at: { type: "utf8" },
          metadata_json: { type: "utf8" },
        },
      }
    )
  )

  // Create IVF_PQ index for vector search (after initial data load)
  // Only needed when table has > 256 rows
  return table
})
```

### Upsert Logic

```typescript
/**
 * Upserts symbol rows into LanceDB.
 *
 * For incremental indexing:
 * 1. Delete all rows for modified/deleted files
 * 2. Insert new rows for added/modified files
 *
 * LanceDB doesn't support true upsert, so we delete-then-insert.
 */
const upsertSymbols = Effect.fn(function* (
  table: lancedb.Table,
  scan: ScanResult,
  symbols: ReadonlyArray<{ symbol: IndexedSymbol; vector: Float32Array }>
) {
  // Delete rows for changed/deleted files
  const filesToDelete = [...scan.modified, ...scan.deleted]
  if (filesToDelete.length > 0) {
    const fileList = filesToDelete.map((f) => `'${f}'`).join(", ")
    yield* Effect.promise(() =>
      table.delete(`file_path IN (${fileList})`)
    )
  }

  // Insert new/modified symbols
  if (symbols.length > 0) {
    const rows = symbols.map(({ symbol, vector }) => ({
      vector,
      id: symbol.id,
      name: symbol.name,
      qualified_name: symbol.qualifiedName,
      file_path: symbol.filePath,
      start_line: symbol.startLine,
      end_line: symbol.endLine,
      kind: symbol.kind,
      effect_pattern: symbol.effectPattern,
      package: symbol.package,
      module: symbol.module,
      category: symbol.category,
      domain: symbol.domain,
      description: symbol.description,
      title: symbol.title,
      signature: symbol.signature.slice(0, 500),
      since: symbol.since,
      deprecated: symbol.deprecated,
      keyword_text: buildKeywordText(symbol),
      content_hash: symbol.contentHash,
      indexed_at: symbol.indexedAt,
      metadata_json: JSON.stringify(symbol),
    }))

    yield* Effect.promise(() => table.add(rows))
  }

  yield* Effect.log(`Upserted ${symbols.length} symbols, deleted files: ${filesToDelete.length}`)
})
```

---

## 6. BM25 Keyword Index

### Implementation: wink-bm25-text-search

```typescript
import BM25 from "wink-bm25-text-search"

/**
 * BM25 keyword index stored alongside LanceDB.
 *
 * Persisted as JSON to `.code-index/bm25-index.json`.
 * Rebuilt from scratch on full reindex, updated incrementally
 * by removing/adding documents for changed files.
 */
interface BM25Index {
  /** The wink-bm25 engine instance */
  readonly engine: BM25

  /** Mapping from BM25 doc ID to symbol ID */
  readonly docIdToSymbolId: Map<number, string>
}

/**
 * BM25 document schema per symbol.
 */
interface BM25Document {
  readonly id: number
  readonly symbolId: string
  readonly body: string  // buildKeywordText(symbol)
}
```

### BM25 Configuration

```typescript
const createBM25Index = (): BM25 => {
  const engine = new BM25()

  // Configure text processing
  engine.defineConfig({
    fldWeights: {
      body: 1,
    },
    bm25Params: {
      k1: 1.2,   // Term frequency saturation
      b: 0.75,   // Document length normalization
    },
  })

  // Tokenizer: split on whitespace, camelCase, dots, slashes
  engine.definePrepTasks([
    (text: string) => text
      // Split camelCase: "PackageName" → "Package Name"
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Split on non-alphanumeric
      .replace(/[^a-zA-Z0-9]/g, " ")
      .toLowerCase()
      .split(/\s+/)
      .filter((t: string) => t.length > 1),
  ])

  return engine
}
```

### Persistence

```typescript
const saveBM25Index = Effect.fn(function* (
  indexPath: string,
  index: BM25Index
) {
  const fs = yield* FileSystem.FileSystem
  const outputPath = `${indexPath}/bm25-index.json`
  const data = {
    exportedJSON: index.engine.exportJSON(),
    docMapping: Object.fromEntries(index.docIdToSymbolId),
  }
  yield* fs.writeFileString(outputPath, JSON.stringify(data))
})

const loadBM25Index = Effect.fn(function* (indexPath: string) {
  const fs = yield* FileSystem.FileSystem
  const inputPath = `${indexPath}/bm25-index.json`
  const exists = yield* fs.exists(inputPath)
  if (!exists) return null

  const data = JSON.parse(yield* fs.readFileString(inputPath))
  const engine = new BM25()
  engine.importJSON(data.exportedJSON)

  return {
    engine,
    docIdToSymbolId: new Map(Object.entries(data.docMapping).map(
      ([k, v]) => [Number(k), v as string]
    )),
  }
})
```

---

## 7. Reciprocal Rank Fusion (RRF)

### Formula

```
RRF_score(d) = Σ (1 / (k + rank_i(d)))
```

Where:
- `d` = document (symbol)
- `k` = smoothing constant (60 is standard)
- `rank_i(d)` = rank of document in the i-th result list (1-based)
- Sum over all result lists where `d` appears

### Implementation

```typescript
interface RankedResult {
  readonly symbolId: string
  readonly rank: number  // 1-based position in original result list
}

interface FusedResult {
  readonly symbolId: string
  readonly score: number  // RRF score (higher = better)
  readonly vectorRank: number | null
  readonly keywordRank: number | null
}

/**
 * Fuses vector and keyword search results using Reciprocal Rank Fusion.
 *
 * @param vectorResults - Results from LanceDB vector search, ordered by cosine similarity
 * @param keywordResults - Results from BM25 keyword search, ordered by BM25 score
 * @param k - Smoothing constant (default 60, standard in literature)
 * @returns Fused results ordered by RRF score descending
 */
const reciprocalRankFusion = (
  vectorResults: ReadonlyArray<RankedResult>,
  keywordResults: ReadonlyArray<RankedResult>,
  k: number = 60
): ReadonlyArray<FusedResult> => {
  const scores = new Map<string, {
    score: number
    vectorRank: number | null
    keywordRank: number | null
  }>()

  // Add vector search contributions
  for (const r of vectorResults) {
    const entry = scores.get(r.symbolId) ?? { score: 0, vectorRank: null, keywordRank: null }
    entry.score += 1 / (k + r.rank)
    entry.vectorRank = r.rank
    scores.set(r.symbolId, entry)
  }

  // Add keyword search contributions
  for (const r of keywordResults) {
    const entry = scores.get(r.symbolId) ?? { score: 0, vectorRank: null, keywordRank: null }
    entry.score += 1 / (k + r.rank)
    entry.keywordRank = r.rank
    scores.set(r.symbolId, entry)
  }

  // Sort by fused score descending
  return pipe(
    scores.entries(),
    A.fromIterable,
    A.map(([symbolId, data]) => ({
      symbolId,
      score: data.score,
      vectorRank: data.vectorRank,
      keywordRank: data.keywordRank,
    })),
    A.sort(
      Order.mapInput(Order.reverse(Order.Number), (r: FusedResult) => r.score)
    )
  )
}
```

### Score Normalization

```typescript
/**
 * Normalizes RRF scores to 0-1 range for display.
 *
 * Max possible RRF score = 2 * (1 / (k + 1)) ≈ 0.0328 for k=60
 * (when a result is rank 1 in both lists)
 *
 * We normalize against the max score in the result set.
 */
const normalizeScores = (
  results: ReadonlyArray<FusedResult>
): ReadonlyArray<FusedResult> => {
  if (results.length === 0) return results
  const maxScore = results[0].score // Already sorted descending
  return pipe(
    results,
    A.map((r) => ({ ...r, score: r.score / maxScore }))
  )
}
```

---

## 8. Incremental Indexing Strategy

### Triggers

| Trigger | When | Mode |
|---------|------|------|
| MCP `reindex` tool (incremental) | User/agent explicitly requests | Incremental |
| MCP `reindex` tool (full) | User/agent explicitly requests | Full |
| SessionStart hook | Start of Claude Code session (if index stale > 1h) | Incremental |
| Git post-commit hook | After `git commit` | Incremental |
| File watcher (optional) | File save in `tooling/*/src/` | Incremental |

### Incremental Pipeline

```
1. Scan files → ScanResult { added, modified, deleted, unchanged }
2. For added + modified files:
   a. Extract symbols via AST
   b. Build embedding text
   c. Compute embeddings
   d. Upsert into LanceDB
   e. Update BM25 index
3. For deleted files:
   a. Remove from LanceDB
   b. Remove from BM25 index
4. Save updated file hashes
```

### Performance Targets

| Metric | Target |
|--------|--------|
| Full index (500 symbols) | < 30 seconds |
| Incremental (10 files changed) | < 5 seconds |
| Single file re-index | < 1 second |
| Embedding model load (cold) | < 3 seconds |
| Embedding model load (warm) | < 50ms |
| LanceDB vector search | < 50ms |
| BM25 keyword search | < 30ms |
| RRF fusion | < 5ms |

### File Hash Persistence

```typescript
/**
 * File hash storage for incremental change detection.
 *
 * Stored at `.code-index/file-hashes.json`.
 * Format: { [filePath: string]: contentHash }
 */
const saveFileHashes = Effect.fn(function* (
  indexPath: string,
  hashes: ReadonlyArray<FileHash>
) {
  const fs = yield* FileSystem.FileSystem
  const data = Object.fromEntries(
    hashes.map((h) => [h.filePath, h.contentHash])
  )
  yield* fs.writeFileString(
    `${indexPath}/file-hashes.json`,
    JSON.stringify(data, null, 2)
  )
})
```

---

## Directory Structure

```
.code-index/                       # gitignored
  lancedb/                         # LanceDB data directory
    symbols.lance/                 # Vector table
  bm25-index.json                  # BM25 keyword index
  file-hashes.json                 # Content hashes for incremental detection
  index-meta.json                  # Index metadata (version, last run, stats)
```

### Index Metadata

```typescript
interface IndexMeta {
  readonly version: 1
  readonly lastFullIndex: string      // ISO 8601
  readonly lastIncrementalIndex: string // ISO 8601
  readonly totalSymbols: number
  readonly totalFiles: number
  readonly embeddingModel: string     // "nomic-ai/CodeRankEmbed"
  readonly embeddingDimensions: 768
}
```

### .gitignore Addition

```
# Codebase search index (generated)
.code-index/
```
