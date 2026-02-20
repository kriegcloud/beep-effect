# IndexedSymbol Schema

> P2 Design Document — Defines the TypeScript interface for `IndexedSymbol`, the canonical contract between the extractor and the search engine.

## Core Interface

```typescript
import type { Option } from "effect/Option"

/**
 * Canonical unit of indexed code metadata.
 *
 * Produced by the extractor, stored in LanceDB, consumed by the search engine.
 * Every field is either extracted deterministically from source code + JSDoc,
 * or derived from Effect Schema annotations.
 *
 * One IndexedSymbol = one row in the vector database = one search result unit.
 */
export interface IndexedSymbol {
  // ─── Identity ────────────────────────────────────────────────────────
  /** Unique identifier. Format: `{package}/{module}/{name}` */
  readonly id: string

  /** Symbol name as written in source (e.g., "PackageName", "readPackageJson") */
  readonly name: string

  /** Fully qualified name within module (e.g., "PackageJson.Name") */
  readonly qualifiedName: string

  /** Absolute file path relative to repo root */
  readonly filePath: string

  /** 1-based line number of the symbol definition */
  readonly startLine: number

  /** 1-based line number of the symbol definition end */
  readonly endLine: number

  // ─── Classification ──────────────────────────────────────────────────
  /** Primary symbol kind */
  readonly kind: SymbolKind

  /** Effect-specific sub-classification (null for non-Effect symbols) */
  readonly effectPattern: EffectPattern | null

  /** Package name from nearest package.json (e.g., "@beep/repo-utils") */
  readonly package: string

  /** Module path within package (e.g., "schemas/PackageJson") */
  readonly module: string

  /** @category tag value (e.g., "schemas", "services", "errors") */
  readonly category: string

  /** @domain tag value (e.g., "package-management", "dependency-graph") */
  readonly domain: string | null

  // ─── Natural Language Fields (Primary Embedding Sources) ─────────────
  /** JSDoc description text (first paragraph) */
  readonly description: string

  /** Schema .annotate({ title }) or JSDoc @summary */
  readonly title: string | null

  /** Schema .annotate({ identifier }) */
  readonly schemaIdentifier: string | null

  /** Schema .annotate({ description }) — may differ from JSDoc description */
  readonly schemaDescription: string | null

  /** @remarks tag content */
  readonly remarks: string | null

  /** Module-level @packageDocumentation description */
  readonly moduleDescription: string | null

  /** @example blocks (raw code strings including comments) */
  readonly examples: ReadonlyArray<string>

  /** @param descriptions as key-value pairs */
  readonly params: ReadonlyArray<ParamDoc>

  /** @returns description */
  readonly returns: string | null

  /** @throws / @errors descriptions */
  readonly errors: ReadonlyArray<string>

  // ─── Schema Field Metadata ───────────────────────────────────────────
  /** .annotateKey({ description }) per struct field */
  readonly fieldDescriptions: ReadonlyArray<FieldDoc> | null

  // ─── Relationships (Graph Edges) ─────────────────────────────────────
  /** @see / {@link} references (symbol IDs or URLs) */
  readonly seeRefs: ReadonlyArray<string>

  /** @provides tag values */
  readonly provides: ReadonlyArray<string>

  /** @depends tag values */
  readonly dependsOn: ReadonlyArray<string>

  /** Import dependencies (other symbol IDs from the same codebase) */
  readonly imports: ReadonlyArray<string>

  // ─── Code Context ────────────────────────────────────────────────────
  /** TypeScript type signature (truncated to 500 chars) */
  readonly signature: string

  /** @since version */
  readonly since: string

  /** Whether the symbol is deprecated */
  readonly deprecated: boolean

  /** Whether the symbol is exported */
  readonly exported: boolean

  // ─── Derived Fields (Computed at Index Time) ─────────────────────────
  /** Pre-built embedding text (output of buildEmbeddingText) */
  readonly embeddingText: string

  /** SHA-256 hash of the source code span (for incremental re-indexing) */
  readonly contentHash: string

  /** Timestamp of last indexing (ISO 8601) */
  readonly indexedAt: string
}
```

## Supporting Types

```typescript
/**
 * Primary classification of a code symbol.
 */
export type SymbolKind =
  | "schema"
  | "service"
  | "layer"
  | "error"
  | "function"
  | "type"
  | "constant"
  | "command"
  | "module"

/**
 * Effect-specific pattern detected from AST analysis.
 */
export type EffectPattern =
  | "Schema.Struct"
  | "Schema.Class"
  | "Schema.Union"
  | "Schema.TaggedStruct"
  | "Schema.TaggedErrorClass"
  | "Schema.brand"
  | "Context.Tag"
  | "Layer.effect"
  | "Layer.succeed"
  | "Layer.provide"
  | "Effect.fn"
  | "Effect.gen"
  | "Command.make"
  | "Flag.string"
  | "Flag.boolean"
  | "Argument.string"

/**
 * Parameter documentation entry.
 */
export interface ParamDoc {
  readonly name: string
  readonly description: string
}

/**
 * Schema field documentation entry.
 */
export interface FieldDoc {
  readonly fieldName: string
  readonly description: string
  readonly schemaType: string | null
}
```

## Kind Classification Rules

The extractor determines `SymbolKind` using these precedence rules:

```typescript
/**
 * Classification decision tree (evaluated in order):
 *
 * 1. Has S.TaggedErrorClass or extends S.TaggedErrorClass → "error"
 * 2. Has @category "commands" or uses Command.make → "command"
 * 3. Has Context.Tag or @category "services" → "service"
 * 4. Has Layer.effect/Layer.succeed or @category "layers" → "layer"
 * 5. Has S.Struct/S.Class/S.Union/S.brand or @category "schemas" → "schema"
 * 6. Is a type alias or interface → "type"
 * 7. Is Effect.fn or regular function → "function"
 * 8. Is @packageDocumentation file-level comment → "module"
 * 9. Fallback → "constant"
 */
export const classifySymbol: (node: ExtractedNode) => SymbolKind = (node) => {
  if (node.effectPattern === "Schema.TaggedErrorClass") return "error"
  if (node.effectPattern === "Command.make" || node.category === "commands") return "command"
  if (node.effectPattern === "Context.Tag" || node.category === "services") return "service"
  if (node.effectPattern?.startsWith("Layer.") || node.category === "layers") return "layer"
  if (node.effectPattern?.startsWith("Schema.") || node.category === "schemas") return "schema"
  if (node.isTypeAlias || node.isInterface) return "type"
  if (node.isFunction || node.effectPattern === "Effect.fn" || node.effectPattern === "Effect.gen") return "function"
  if (node.isModuleDoc) return "module"
  return "constant"
}
```

## ID Generation

```typescript
/**
 * Generates a stable, unique ID for a symbol.
 *
 * Format: `{package}/{module}/{qualifiedName}`
 * Examples:
 *   - `@beep/repo-utils/schemas/PackageJson/PackageName`
 *   - `@beep/repo-cli/commands/create-package/createPackageCommand`
 *   - `@beep/repo-utils/errors/DomainError`
 *
 * For module-level docs: `{package}/{module}/$module`
 */
export const generateId = (pkg: string, modulePath: string, qualifiedName: string): string =>
  `${pkg}/${modulePath}/${qualifiedName}`
```

## buildEmbeddingText Function

```typescript
/**
 * Constructs the natural language text to be embedded for vector search.
 *
 * Design principles:
 * 1. Title and description are primary (highest embedding weight)
 * 2. Remarks add design context (why, not what)
 * 3. Module description provides scope
 * 4. Example comments are natural language (extract // comments only)
 * 5. Field descriptions enable schema field search
 * 6. Cross-references provide relationship context
 * 7. Params/returns describe the API surface
 *
 * Target: 150-400 tokens per symbol (fits in 8192 token model context)
 */
export const buildEmbeddingText = (sym: IndexedSymbol): string => {
  const parts: Array<string> = []

  // 1. Kind prefix for classification signal
  parts.push(`[${sym.kind}]`)

  // 2. Title (most concise descriptor)
  if (sym.title !== null) {
    parts.push(sym.title)
  }

  // 3. Description (primary semantic content)
  parts.push(sym.description)

  // 4. Schema-specific description (may add detail beyond JSDoc)
  if (sym.schemaDescription !== null && sym.schemaDescription !== sym.description) {
    parts.push(sym.schemaDescription)
  }

  // 5. Remarks (design rationale, constraints, invariants)
  if (sym.remarks !== null) {
    parts.push(sym.remarks)
  }

  // 6. Module context (scoping)
  if (sym.moduleDescription !== null) {
    parts.push(`Module: ${sym.moduleDescription}`)
  }

  // 7. Example comments (natural language within code)
  for (const example of sym.examples) {
    const comments = extractCommentsFromCode(example)
    if (comments.length > 0) {
      parts.push(comments.join(". "))
    }
  }

  // 8. Parameter descriptions (input semantics)
  if (sym.params.length > 0) {
    const paramText = sym.params
      .map((p) => `${p.name}: ${p.description}`)
      .join(". ")
    parts.push(`Parameters: ${paramText}`)
  }

  // 9. Returns description (output semantics)
  if (sym.returns !== null) {
    parts.push(`Returns: ${sym.returns}`)
  }

  // 10. Error descriptions (failure modes)
  if (sym.errors.length > 0) {
    parts.push(`Errors: ${sym.errors.join(". ")}`)
  }

  // 11. Field descriptions (schema granularity)
  if (sym.fieldDescriptions !== null && sym.fieldDescriptions.length > 0) {
    const fieldText = sym.fieldDescriptions
      .map((f) => `${f.fieldName}: ${f.description}`)
      .join(". ")
    parts.push(`Fields: ${fieldText}`)
  }

  // 12. Cross-references (relationship context)
  if (sym.seeRefs.length > 0) {
    parts.push(`Related: ${sym.seeRefs.join(", ")}`)
  }

  // 13. Dependency context
  if (sym.provides.length > 0) {
    parts.push(`Provides: ${sym.provides.join(", ")}`)
  }
  if (sym.dependsOn.length > 0) {
    parts.push(`Depends on: ${sym.dependsOn.join(", ")}`)
  }

  // 14. Domain tag for classification
  if (sym.domain !== null) {
    parts.push(`Domain: ${sym.domain}`)
  }

  return parts.join(". ")
}

/**
 * Extracts single-line comments from code examples.
 * These are natural language and embed well.
 */
const extractCommentsFromCode = (code: string): Array<string> => {
  const commentRegex = /\/\/\s*(.+)/g
  const comments: Array<string> = []
  let match: RegExpExecArray | null
  while ((match = commentRegex.exec(code)) !== null) {
    const text = match[1].trim()
    if (text.length > 5 && !text.startsWith("eslint") && !text.startsWith("@ts-")) {
      comments.push(text)
    }
  }
  return comments
}
```

## BM25 Keyword Text

Separate from embedding text — optimized for exact keyword matching:

```typescript
/**
 * Constructs keyword-optimized text for BM25 index.
 *
 * Includes identifiers, type names, and symbol names that users
 * might search by exact name rather than semantic meaning.
 */
export const buildKeywordText = (sym: IndexedSymbol): string => {
  const parts: Array<string> = []

  parts.push(sym.name)
  parts.push(sym.qualifiedName)
  if (sym.schemaIdentifier !== null) {
    parts.push(sym.schemaIdentifier)
  }
  parts.push(sym.kind)
  parts.push(sym.category)
  parts.push(sym.package)
  parts.push(sym.module)
  if (sym.domain !== null) {
    parts.push(sym.domain)
  }
  parts.push(sym.signature)

  // Add provides/depends as keywords
  for (const p of sym.provides) parts.push(p)
  for (const d of sym.dependsOn) parts.push(d)

  // Add field names
  if (sym.fieldDescriptions !== null) {
    for (const f of sym.fieldDescriptions) {
      parts.push(f.fieldName)
    }
  }

  return parts.join(" ")
}
```

## Example: Fully Populated IndexedSymbol

```typescript
const exampleSymbol: IndexedSymbol = {
  // Identity
  id: "@beep/repo-utils/schemas/PackageJson/PackageName",
  name: "PackageName",
  qualifiedName: "PackageJson.PackageName",
  filePath: "tooling/repo-utils/src/schemas/PackageJson.ts",
  startLine: 42,
  endLine: 55,

  // Classification
  kind: "schema",
  effectPattern: "Schema.brand",
  package: "@beep/repo-utils",
  module: "schemas/PackageJson",
  category: "schemas",
  domain: "package-management",

  // Natural Language
  description: "Validates and brands npm package names per the npm naming specification.",
  title: "Package Name",
  schemaIdentifier: "@beep/repo-utils/schemas/PackageJson/PackageName",
  schemaDescription: "An npm package name conforming to the npm naming specification.",
  remarks: "Rejects scoped packages with empty names, names containing uppercase, and names exceeding 214 characters.",
  moduleDescription: "Schema definitions for npm package.json manifest validation.",
  examples: [
    'const name = S.decodeUnknownSync(PackageName)("@beep/repo-utils") // Decode and brand a package name'
  ],
  params: [],
  returns: null,
  errors: [],

  // Schema Fields
  fieldDescriptions: null,

  // Relationships
  seeRefs: ["PackageJson"],
  provides: [],
  dependsOn: [],
  imports: ["effect/Schema"],

  // Code Context
  signature: 'S.String.pipe(S.pattern(...), S.brand("PackageName"))',
  since: "0.0.0",
  deprecated: false,
  exported: true,

  // Derived
  embeddingText: "[schema] Package Name. Validates and brands npm package names per the npm naming specification. An npm package name conforming to the npm naming specification. Rejects scoped packages with empty names, names containing uppercase, and names exceeding 214 characters. Module: Schema definitions for npm package.json manifest validation. Decode and brand a package name. Related: PackageJson. Domain: package-management",
  contentHash: "a1b2c3d4e5f6...",
  indexedAt: "2026-02-19T12:00:00Z"
}
```

## Validation Rules

```typescript
/**
 * IndexedSymbol validation — applied before storage.
 */
export const validateIndexedSymbol = (sym: IndexedSymbol): Array<string> => {
  const errors: Array<string> = []

  if (sym.id.length === 0) errors.push("id is required")
  if (sym.name.length === 0) errors.push("name is required")
  if (sym.description.length < 20) errors.push("description must be at least 20 characters")
  if (sym.since.length === 0) errors.push("since is required")
  if (sym.category.length === 0) errors.push("category is required")
  if (sym.embeddingText.length < 30) errors.push("embeddingText too short for meaningful embedding")
  if (sym.embeddingText.length > 3000) errors.push("embeddingText exceeds 3000 chars — will be truncated by model")
  if (sym.contentHash.length === 0) errors.push("contentHash is required for incremental indexing")

  return errors
}
```

## LanceDB Row Mapping

See `embedding-pipeline-design.md` for the full LanceDB table schema. The mapping from `IndexedSymbol` to LanceDB row:

| IndexedSymbol Field | LanceDB Column | Type |
|--------------------|--------------------|------|
| `id` | `id` | `string` (primary key) |
| `embeddingText` | → embedded into `vector` | `Float32Array[768]` |
| `buildKeywordText()` | `keyword_text` | `string` (BM25 indexed) |
| `name` | `name` | `string` |
| `kind` | `kind` | `string` |
| `package` | `package` | `string` |
| `module` | `module` | `string` |
| `category` | `category` | `string` |
| `domain` | `domain` | `string?` |
| `filePath` | `file_path` | `string` |
| `startLine` | `start_line` | `int32` |
| `description` | `description` | `string` |
| `signature` | `signature` | `string` |
| `since` | `since` | `string` |
| `deprecated` | `deprecated` | `boolean` |
| `contentHash` | `content_hash` | `string` |
| `indexedAt` | `indexed_at` | `string` |
| Full JSON | `metadata` | `string` (JSON blob for full IndexedSymbol) |
