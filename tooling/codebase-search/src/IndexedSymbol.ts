/**
 * Core schema and types for indexed code symbols in the codebase search system.
 * Defines the canonical IndexedSymbol interface that serves as the contract
 * between the extractor pipeline and the search engine.
 * @since 0.0.0
 * @packageDocumentation
 */

import * as crypto from "node:crypto";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// ---------------------------------------------------------------------------
// Symbol Kind
// ---------------------------------------------------------------------------

/**
 * The classification kind of an indexed code symbol.
 * Represents the nine canonical categories used to classify symbols
 * extracted from an Effect v4 codebase.
 * @since 0.0.0
 * @category types
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
  | "module";

// ---------------------------------------------------------------------------
// Effect Pattern
// ---------------------------------------------------------------------------

/**
 * Known Effect v4 API patterns that can be detected during AST extraction.
 * These patterns drive automatic classification of symbols into their
 * canonical SymbolKind categories.
 * @since 0.0.0
 * @category types
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
  | "Argument.number";

// ---------------------------------------------------------------------------
// ParamDoc
// ---------------------------------------------------------------------------

/**
 * Documentation for a single function parameter extracted from JSDoc @param tags.
 * Used in the natural language embedding text to improve search relevance.
 * @since 0.0.0
 * @category types
 */
export interface ParamDoc {
  readonly name: string;
  readonly description: string;
}

// ---------------------------------------------------------------------------
// FieldDoc
// ---------------------------------------------------------------------------

/**
 * Documentation for a single schema field extracted from Schema annotations.
 * Captures per-field descriptions used to enrich embedding text for struct schemas.
 * @since 0.0.0
 * @category types
 */
export interface FieldDoc {
  readonly name: string;
  readonly description: string;
}

// ---------------------------------------------------------------------------
// IndexedSymbol
// ---------------------------------------------------------------------------

/**
 * The canonical data structure for an indexed code symbol in the codebase search
 * system. Serves as the contract between the extractor pipeline, the vector/BM25
 * indexer, and the search engine. Contains identity, classification, natural
 * language documentation, relationships, code context, and derived fields.
 * @since 0.0.0
 * @category types
 */
export interface IndexedSymbol {
  // --- Identity ---
  /** Unique identifier: `{pkg}/{module}/{name}` */
  readonly id: string;
  /** Simple export name (e.g. `PackageName`) */
  readonly name: string;
  /** Fully qualified name including module path */
  readonly qualifiedName: string;
  /** Relative file path from repo root */
  readonly filePath: string;
  /** 1-based start line number */
  readonly startLine: number;
  /** 1-based end line number */
  readonly endLine: number;

  // --- Classification ---
  /** Canonical kind classification */
  readonly kind: SymbolKind;
  /** Detected Effect API pattern, or null if none */
  readonly effectPattern: EffectPattern | null;
  /** Package name (e.g. `@beep/repo-utils`) */
  readonly package: string;
  /** Module name within the package (e.g. `schemas`) */
  readonly module: string;
  /** JSDoc @category tag value */
  readonly category: string;
  /** Optional domain grouping for cross-cutting concerns */
  readonly domain: string | null;

  // --- Natural language ---
  /** Primary description from JSDoc, >= 20 chars */
  readonly description: string;
  /** Human-readable title from Schema annotations */
  readonly title: string | null;
  /** Schema identifier annotation value */
  readonly schemaIdentifier: string | null;
  /** Schema description annotation value */
  readonly schemaDescription: string | null;
  /** JSDoc @remarks content */
  readonly remarks: string | null;
  /** Parent module's @packageDocumentation description */
  readonly moduleDescription: string | null;
  /** JSDoc @example blocks */
  readonly examples: ReadonlyArray<string>;
  /** JSDoc @param documentation */
  readonly params: ReadonlyArray<ParamDoc>;
  /** JSDoc @returns description */
  readonly returns: string | null;
  /** JSDoc @throws / @error descriptions */
  readonly errors: ReadonlyArray<string>;

  // --- Schema metadata ---
  /** Per-field descriptions from Schema.Struct annotations */
  readonly fieldDescriptions: ReadonlyArray<FieldDoc> | null;

  // --- Relationships ---
  /** JSDoc @see cross-references */
  readonly seeRefs: ReadonlyArray<string>;
  /** Service/Layer identifiers this symbol provides */
  readonly provides: ReadonlyArray<string>;
  /** Service/Layer identifiers this symbol depends on */
  readonly dependsOn: ReadonlyArray<string>;
  /** Import specifiers used by this symbol */
  readonly imports: ReadonlyArray<string>;

  // --- Code context ---
  /** Type signature or declaration text */
  readonly signature: string;
  /** JSDoc @since version tag */
  readonly since: string;
  /** Whether the symbol is marked @deprecated */
  readonly deprecated: boolean;
  /** Whether the symbol is exported from its module */
  readonly exported: boolean;

  // --- Derived ---
  /** Pre-built natural language text optimized for embedding */
  readonly embeddingText: string;
  /** SHA-256 hex hash of content for change detection */
  readonly contentHash: string;
  /** ISO 8601 timestamp when the symbol was last indexed */
  readonly indexedAt: string;
}

// ---------------------------------------------------------------------------
// IndexMeta Schema
// ---------------------------------------------------------------------------

/**
 * Effect Schema for the codebase search index metadata file. Tracks version,
 * timestamps, symbol/file counts, and embedding model configuration. Persisted
 * as JSON alongside the vector and BM25 indexes.
 * @since 0.0.0
 * @category schemas
 */
export const IndexMeta = S.Struct({
  version: S.Literal(1),
  lastFullIndex: S.String,
  lastIncrementalIndex: S.String,
  totalSymbols: S.Number,
  totalFiles: S.Number,
  embeddingModel: S.String,
  embeddingDimensions: S.Literal(768),
}).annotate({
  identifier: "@beep/codebase-search/IndexedSymbol/IndexMeta",
  title: "Index Metadata",
  description: "Metadata about the codebase search index including version, timestamps, and statistics.",
});

/**
 * TypeScript type derived from the IndexMeta Effect Schema. Represents the
 * decoded form of the index metadata JSON file on disk.
 * @since 0.0.0
 * @category types
 */
export type IndexMeta = typeof IndexMeta.Type;

// ---------------------------------------------------------------------------
// generateId
// ---------------------------------------------------------------------------

/**
 * Generates a deterministic unique identifier for an indexed symbol.
 * Format: `{pkg}/{module}/{name}` (e.g. `@beep/repo-utils/schemas/PackageJson`).
 * @since 0.0.0
 * @category builders
 */
export const generateId = (pkg: string, module: string, name: string): string => `${pkg}/${module}/${name}`;

// ---------------------------------------------------------------------------
// classifySymbol
// ---------------------------------------------------------------------------

/**
 * Input structure for classifying a code symbol into its canonical SymbolKind.
 * Accepts optional hints from AST extraction and JSDoc metadata.
 * @since 0.0.0
 * @category types
 */
export interface ClassifyInput {
  readonly effectPattern: EffectPattern | null;
  readonly category: string;
  readonly isTypeAlias: boolean;
  readonly isInterface: boolean;
  readonly isPackageDocumentation: boolean;
}

/**
 * Classifies a code symbol into one of nine canonical SymbolKind values.
 * Uses a priority-ordered set of heuristics based on Effect patterns,
 * JSDoc categories, and AST node types.
 * @since 0.0.0
 * @category builders
 */
export const classifySymbol = (input: ClassifyInput): SymbolKind => {
  const { effectPattern, category, isTypeAlias, isInterface, isPackageDocumentation } = input;

  // 1. TaggedErrorClass → error
  if (effectPattern === "Schema.TaggedErrorClass") return "error";

  // 2. Command-related
  if (effectPattern === "Command.make") return "command";
  if (category === "commands") return "command";

  // 3. Context.Tag or services category → service
  if (effectPattern === "Context.Tag") return "service";
  if (category === "services") return "service";

  // 4. Layer patterns or layers category → layer
  if (effectPattern === "Layer.effect" || effectPattern === "Layer.succeed" || effectPattern === "Layer.provide")
    return "layer";
  if (category === "layers") return "layer";

  // 5. Schema patterns or schemas category → schema
  if (
    effectPattern === "Schema.Struct" ||
    effectPattern === "Schema.Class" ||
    effectPattern === "Schema.Union" ||
    effectPattern === "Schema.TaggedStruct" ||
    effectPattern === "Schema.brand"
  )
    return "schema";
  if (category === "schemas") return "schema";

  // 6. Type alias or interface → type
  if (isTypeAlias || isInterface) return "type";

  // 7. Effect.fn or function patterns → function
  if (
    effectPattern === "Effect.fn" ||
    effectPattern === "Effect.gen" ||
    effectPattern === "Flag.string" ||
    effectPattern === "Flag.boolean" ||
    effectPattern === "Argument.string" ||
    effectPattern === "Argument.number"
  )
    return "function";

  // 8. Package documentation → module
  if (isPackageDocumentation) return "module";

  // 9. Default → constant
  return "constant";
};

// ---------------------------------------------------------------------------
// buildEmbeddingText
// ---------------------------------------------------------------------------

/** @internal */
const MAX_EMBEDDING_CHARS = 3000;

/**
 * Composes a natural language text representation of an IndexedSymbol
 * optimized for semantic embedding models. Concatenates documentation
 * fields in priority order and truncates to a maximum of 3000 characters.
 * @since 0.0.0
 * @category builders
 */
export const buildEmbeddingText = (symbol: IndexedSymbol): string => {
  const parts = A.empty<string>();

  // 1. Kind prefix
  parts.push(`[${symbol.kind}]`);

  // 2. Title
  if (symbol.title !== null) {
    parts.push(symbol.title);
  }

  // 3. Description
  parts.push(symbol.description);

  // 4. Schema description
  if (symbol.schemaDescription !== null) {
    parts.push(symbol.schemaDescription);
  }

  // 5. Remarks
  if (symbol.remarks !== null) {
    parts.push(symbol.remarks);
  }

  // 6. Module description
  if (symbol.moduleDescription !== null) {
    parts.push(symbol.moduleDescription);
  }

  // 7. Example comments (strip code, keep natural language)
  pipe(
    symbol.examples,
    A.forEach((example) => {
      const lines = Str.split("\n")(example);
      const commentLines = pipe(
        lines,
        A.filter((line) => Str.startsWith("//")(Str.trim(line)) || Str.startsWith("*")(Str.trim(line))),
        A.map((line) => pipe(Str.trim(line), (trimmed) => trimmed.replace(/^\/\/\s*/, "").replace(/^\*\s*/, ""))),
        A.filter((line) => pipe(line, Str.trim, Str.length) > 0)
      );
      if (A.isArrayNonEmpty(commentLines)) {
        parts.push(A.join(" ")(commentLines));
      }
    })
  );

  // 8. Parameter descriptions
  pipe(
    symbol.params,
    A.forEach((param) => {
      parts.push(`Parameter ${param.name}: ${param.description}`);
    })
  );

  // 9. Returns description
  if (symbol.returns !== null) {
    parts.push(`Returns: ${symbol.returns}`);
  }

  // 10. Error descriptions
  pipe(
    symbol.errors,
    A.forEach((error) => {
      parts.push(`Throws: ${error}`);
    })
  );

  // 11. Field descriptions
  if (symbol.fieldDescriptions !== null) {
    pipe(
      symbol.fieldDescriptions,
      A.forEach((field) => {
        parts.push(`Field ${field.name}: ${field.description}`);
      })
    );
  }

  // 12. Cross-references (@see)
  if (A.isReadonlyArrayNonEmpty(symbol.seeRefs)) {
    parts.push(`See also: ${A.join(", ")(symbol.seeRefs)}`);
  }

  // 13. Dependency context
  if (A.isReadonlyArrayNonEmpty(symbol.provides)) {
    parts.push(`Provides: ${A.join(", ")(symbol.provides)}`);
  }
  if (A.isReadonlyArrayNonEmpty(symbol.dependsOn)) {
    parts.push(`Depends on: ${A.join(", ")(symbol.dependsOn)}`);
  }

  // 14. Domain tag
  if (symbol.domain !== null) {
    parts.push(`Domain: ${symbol.domain}`);
  }

  const joined = A.join(" ")(parts);

  // Truncate if over max
  if (Str.length(joined) > MAX_EMBEDDING_CHARS) {
    return joined.slice(0, MAX_EMBEDDING_CHARS);
  }

  return joined;
};

// ---------------------------------------------------------------------------
// buildKeywordText
// ---------------------------------------------------------------------------

/**
 * Composes a keyword-oriented text representation of an IndexedSymbol
 * optimized for BM25 exact-match search. Includes identifiers, classification
 * tokens, and structural metadata.
 * @since 0.0.0
 * @category builders
 */
export const buildKeywordText = (symbol: IndexedSymbol): string => {
  const parts: Array<string> = [];

  // Core identifiers
  parts.push(symbol.name);
  parts.push(symbol.qualifiedName);

  if (symbol.schemaIdentifier !== null) {
    parts.push(symbol.schemaIdentifier);
  }

  // Classification
  parts.push(symbol.kind);
  parts.push(symbol.category);
  parts.push(symbol.package);
  parts.push(symbol.module);

  // Domain
  if (symbol.domain !== null) {
    parts.push(symbol.domain);
  }

  // Signature
  parts.push(symbol.signature);

  // Provides/depends identifiers
  pipe(
    symbol.provides,
    A.forEach((p) => {
      parts.push(p);
    })
  );
  pipe(
    symbol.dependsOn,
    A.forEach((d) => {
      parts.push(d);
    })
  );

  // Field names
  if (symbol.fieldDescriptions !== null) {
    pipe(
      symbol.fieldDescriptions,
      A.forEach((field) => {
        parts.push(field.name);
      })
    );
  }

  return A.join(" ")(parts);
};

// ---------------------------------------------------------------------------
// validateIndexedSymbol
// ---------------------------------------------------------------------------

/**
 * Validates an IndexedSymbol and returns an array of human-readable error
 * messages describing any constraint violations. Returns an empty array
 * when the symbol is fully valid.
 * @since 0.0.0
 * @category validators
 */
export const validateIndexedSymbol = (symbol: IndexedSymbol): ReadonlyArray<string> => {
  const errors = A.empty<string>();

  if (Str.length(symbol.id) === 0) {
    errors.push("id must be non-empty");
  }

  if (Str.length(symbol.name) === 0) {
    errors.push("name must be non-empty");
  }

  if (Str.length(symbol.description) < 20) {
    errors.push("description must be at least 20 characters");
  }

  if (Str.length(symbol.since) === 0) {
    errors.push("since must be non-empty");
  }

  if (Str.length(symbol.category) === 0) {
    errors.push("category must be non-empty");
  }

  const embeddingLen = Str.length(symbol.embeddingText);
  if (embeddingLen < 30 || embeddingLen > MAX_EMBEDDING_CHARS) {
    errors.push(`embeddingText must be 30-${String(MAX_EMBEDDING_CHARS)} characters, got ${String(embeddingLen)}`);
  }

  if (Str.length(symbol.contentHash) === 0) {
    errors.push("contentHash must be non-empty");
  }

  return errors;
};

// ---------------------------------------------------------------------------
// computeContentHash
// ---------------------------------------------------------------------------

/**
 * Computes a SHA-256 hash of the given content string and returns the
 * result as a lowercase hexadecimal string. Used for change detection
 * during incremental indexing.
 * @since 0.0.0
 * @category builders
 */
export const computeContentHash = (content: string): string =>
  crypto.createHash("sha256").update(content).digest("hex");
