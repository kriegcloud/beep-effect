# JSDoc Strategy Research for Annotation-Driven Semantic Codebase Search

> **Purpose**: Exhaustive research on JSDoc tags and documentation strategies that enable
> annotation-driven semantic search via ts-morph extraction and vector embeddings.
>
> **Context**: TypeScript/Effect monorepo where strict JSDoc standards produce natural language
> metadata extractable by ts-morph, embeddable for semantic search, and usable as knowledge graph
> nodes/edges.

---

## Table of Contents

1. [Complete JSDoc Tag Inventory](#1-complete-jsdoc-tag-inventory)
2. [File-Level Documentation Best Practices](#2-file-level-documentation-best-practices)
3. [Documentation for Semantic Discovery](#3-documentation-for-semantic-discovery)
4. [Documentation as Knowledge Graph Nodes](#4-documentation-as-knowledge-graph-nodes)
5. [Enforcement and Linting](#5-enforcement-and-linting)
6. [Best Practices from Major Projects](#6-best-practices-from-major-projects)
7. [Documentation-Driven Development Patterns](#7-documentation-driven-development-patterns)
8. [ts-morph Extraction API](#8-ts-morph-extraction-api)
9. [Embedding Strategy for Documentation](#9-embedding-strategy-for-documentation)
10. [Concrete Recommendations for beep-effect2](#10-concrete-recommendations)

---

## 1. Complete JSDoc Tag Inventory

### 1.1 Standard JSDoc Tags (jsdoc.app)

The canonical JSDoc specification defines approximately 70 block tags and 3 inline tags.

#### Description and Classification Tags

| Tag | Purpose | Semantic Search Value |
|-----|---------|----------------------|
| `@description` / `@desc` | Main description of a symbol | **CRITICAL** - primary natural language content for embeddings |
| `@summary` | Shortened version of the full description | **HIGH** - concise semantic anchor, excellent for embedding |
| `@classdesc` | Describe an entire class | **HIGH** - class-level semantic context |
| `@file` / `@fileoverview` / `@overview` | Describe a file's purpose | **CRITICAL** - module-level semantic context |
| `@module` | Document a JavaScript module | **HIGH** - module identity and purpose |
| `@namespace` | Document a namespace object | **MEDIUM** - organizational context |

#### Relationship and Cross-Reference Tags

| Tag | Purpose | Semantic Search Value |
|-----|---------|----------------------|
| `@see` | Reference related documentation | **CRITICAL** - explicit relationship edges |
| `@link` / `@linkcode` / `@linkplain` | Inline link to another symbol | **CRITICAL** - inline relationship edges |
| `@requires` | Indicate required modules | **HIGH** - dependency edges |
| `@augments` / `@extends` | Indicate inheritance | **HIGH** - hierarchy edges |
| `@implements` | Indicate interface implementation | **HIGH** - contract edges |
| `@borrows` | Object uses something from another | **MEDIUM** - reuse edges |
| `@mixes` | Object mixes in from another source | **MEDIUM** - composition edges |
| `@memberof` | Indicate parent symbol ownership | **MEDIUM** - containment edges |
| `@inheritdoc` | Inherit parent's documentation | **LOW** - documentation reuse (no new content) |

#### Parameter and Return Tags

| Tag | Purpose | Semantic Search Value |
|-----|---------|----------------------|
| `@param` | Document function parameters | **HIGH** - describes inputs with natural language |
| `@returns` / `@return` | Document return values | **HIGH** - describes outputs with natural language |
| `@throws` / `@exception` | Describe potential errors | **HIGH** - error domain context |
| `@yields` | Document generator function values | **MEDIUM** - generator output context |
| `@this` | Clarify 'this' keyword references | **LOW** - context binding |
| `@callback` | Document a callback function | **MEDIUM** - interface contract |

#### Type and Template Tags

| Tag | Purpose | Semantic Search Value |
|-----|---------|----------------------|
| `@type` | Document object types | **LOW** in TS (redundant with type system) |
| `@typedef` | Document custom types | **LOW** in TS (redundant) |
| `@template` | Declare type parameters | **MEDIUM** - generic constraint descriptions |
| `@property` / `@prop` | Document object properties | **MEDIUM** - property-level descriptions |

#### Usage and Example Tags

| Tag | Purpose | Semantic Search Value |
|-----|---------|----------------------|
| `@example` | Provide usage examples | **CRITICAL** - rich usage context, code patterns |
| `@tutorial` | Link to included tutorials | **MEDIUM** - extended learning context |
| `@todo` | Document incomplete tasks | **LOW** - maintenance metadata |

#### Lifecycle and Versioning Tags

| Tag | Purpose | Semantic Search Value |
|-----|---------|----------------------|
| `@since` | Indicate feature addition version | **MEDIUM** - temporal context |
| `@version` | Document version numbers | **LOW** - version metadata |
| `@deprecated` | Mark as no longer preferred | **HIGH** - lifecycle state + migration guidance |
| `@license` | Identify applicable license | **LOW** - legal metadata |
| `@copyright` | Document copyright information | **LOW** - legal metadata |
| `@author` | Identify the item's creator | **LOW** - authorship metadata |

#### Access Control Tags

| Tag | Purpose | Semantic Search Value |
|-----|---------|----------------------|
| `@access` | Specify visibility level | **MEDIUM** - API surface classification |
| `@public` | Mark as public | **MEDIUM** |
| `@protected` | Mark as protected | **LOW** |
| `@private` | Mark as private | **LOW** |
| `@package` | Mark as package-private | **LOW** |
| `@readonly` | Mark as read-only | **LOW** |

#### Other Standard Tags

| Tag | Purpose | Semantic Search Value |
|-----|---------|----------------------|
| `@abstract` / `@virtual` | Must be implemented by inheritor | **MEDIUM** - extension point marker |
| `@override` | Overriding parent symbol | **LOW** - inheritance marker |
| `@async` | Mark as asynchronous | **LOW** - redundant in TS |
| `@generator` | Mark as generator | **LOW** - redundant in TS |
| `@global` | Document a global object | **LOW** |
| `@ignore` | Omit from documentation | **NONE** |
| `@hideconstructor` | Hide constructor from docs | **NONE** |
| `@kind` | Specify the symbol's type | **LOW** - redundant in TS |
| `@static` | Document static members | **LOW** - redundant in TS |
| `@inner` | Document inner objects | **LOW** |
| `@instance` | Document instance members | **LOW** |
| `@constructs` | Mark as class constructor | **LOW** |
| `@constant` / `@const` | Document as constant | **LOW** - redundant in TS |
| `@default` / `@defaultvalue` | Document the default value | **MEDIUM** - behavioral context |
| `@enum` | Document related properties as collection | **LOW** - redundant in TS |
| `@event` | Document an event | **MEDIUM** - event-driven patterns |
| `@fires` / `@emits` | Events a method may trigger | **MEDIUM** - event edges |
| `@listens` | Events a symbol monitors | **MEDIUM** - event edges |
| `@function` / `@func` / `@method` | Describe a function | **LOW** - redundant in TS |
| `@class` / `@constructor` | Mark as class constructor | **LOW** - redundant in TS |
| `@external` / `@host` | Identify external class/namespace | **MEDIUM** - external dependency |
| `@exports` | Identify exported members | **LOW** - redundant in TS |
| `@lends` | Document object literal as belonging elsewhere | **LOW** |
| `@name` | Document object's name | **LOW** |
| `@mixin` | Document a mixin object | **MEDIUM** |
| `@variation` | Distinguish same-name objects | **LOW** |

### 1.2 TSDoc Standard Tags

TSDoc is a stricter specification designed specifically for TypeScript, defined by Microsoft. It distinguishes three kinds of tags: **block tags**, **inline tags**, and **modifier tags**.

#### TSDoc Block Tags

| Tag | Purpose | Notes |
|-----|---------|-------|
| `@param` | Document function parameters | Requires hyphen: `@param name - Description` |
| `@returns` | Document return value | |
| `@remarks` | Extended description after summary | **Key TSDoc addition** - separates summary from details |
| `@example` | Usage examples | Supports multiple `@example` blocks |
| `@defaultValue` | Default value for optional property | Contractual, not just informational |
| `@typeParam` | Document generic type parameters | TSDoc-specific (JSDoc uses `@template`) |
| `@throws` | Document thrown exceptions | |
| `@see` | Reference related items | |
| `@deprecated` | Mark as deprecated | Should include migration guidance |
| `@privateRemarks` | Internal-only notes (excluded from public docs) | **Key TSDoc addition** - developer-facing context |
| `@decorator` | Document ECMAScript decorator | |
| `@label` | Reference markers for `{@link}` | |

#### TSDoc Modifier Tags (Presence/Absence Flags)

| Tag | Purpose | Notes |
|-----|---------|-------|
| `@public` | Official release and supported | API maturity level |
| `@beta` | Preview/experimental | API maturity level |
| `@alpha` | Early-stage development | API maturity level |
| `@experimental` | Experimental feature | API maturity level |
| `@internal` | Same-maintainer use only | API maturity level |
| `@sealed` | Subclasses must not inherit/override | Extension control |
| `@virtual` | Subclasses may override | Extension control |
| `@override` | Overrides inherited definition | Extension control |
| `@readonly` | Read-only semantics | |
| `@eventProperty` | Property value is an event object | |
| `@packageDocumentation` | File-level package documentation | Must be first comment in file |

#### TSDoc Inline Tags

| Tag | Syntax | Purpose |
|-----|--------|---------|
| `@link` | `{@link SymbolName}` or `{@link SymbolName \| display text}` | Cross-reference |
| `@inheritDoc` | `{@inheritDoc SymbolName}` | Copy documentation from another symbol |

### 1.3 TypeDoc-Specific Tags

TypeDoc extends TSDoc with additional tags for documentation organization.

#### TypeDoc Block Tags (Beyond TSDoc)

| Tag | Purpose | Semantic Search Value |
|-----|---------|----------------------|
| `@category` | Organize symbols into categories | **HIGH** - taxonomy/classification |
| `@categoryDescription` | Describe a category | **HIGH** - category-level semantic context |
| `@group` | Organize symbols into groups | **HIGH** - alternative taxonomy |
| `@groupDescription` | Describe a group | **HIGH** - group-level context |
| `@module` | Mark comment as file-level (rename module) | **CRITICAL** - file-level identity |
| `@document` | Include external markdown file | **MEDIUM** - extended documentation |
| `@mergeModuleWith` | Merge module documentation | **LOW** |
| `@import` | Import declarations for examples | **LOW** |
| `@since` | Version introduced | **MEDIUM** |
| `@author` | Document creator | **LOW** |
| `@license` | License information | **LOW** |
| `@summary` | Brief overview | **HIGH** |
| `@sortStrategy` | Custom sorting | **NONE** |
| `@expandType` / `@preventExpand` | Type expansion control | **NONE** |
| `@inlineType` / `@preventInline` | Inline type control | **NONE** |
| `@template` | Generic type parameters (JSDoc compat) | **MEDIUM** |
| `@property` / `@prop` | Property documentation | **MEDIUM** |

#### TypeDoc Modifier Tags (Beyond TSDoc)

| Tag | Purpose | Semantic Search Value |
|-----|---------|----------------------|
| `@hidden` / `@ignore` | Exclude from documentation | **NONE** |
| `@abstract` | Mark as abstract | **MEDIUM** |
| `@class` / `@enum` / `@interface` | Type declaration hints | **LOW** |
| `@function` / `@namespace` | Symbol kind hints | **LOW** |
| `@event` | Mark as event | **MEDIUM** |
| `@private` / `@protected` | Access modifiers | **LOW** |
| `@showGroups` / `@hideGroups` / `@disableGroups` | Group visibility | **NONE** |
| `@showCategories` / `@hideCategories` | Category visibility | **NONE** |

#### TypeDoc Inline Tags (Beyond TSDoc)

| Tag | Syntax | Purpose |
|-----|--------|---------|
| `@linkcode` | `{@linkcode Symbol}` | Monospace font link |
| `@linkplain` | `{@linkplain Symbol}` | Plain text link |
| `@include` | `{@include path}` | Embed external content |
| `@includeCode` | `{@includeCode path}` | Embed code file |

### 1.4 Custom Tags for Domain-Specific Metadata

TSDoc supports custom tag definitions via `tsdoc.json`. This is critical for our use case.

#### Defining Custom Tags in `tsdoc.json`

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json",
  "extends": ["typedoc/tsdoc.json"],
  "tagDefinitions": [
    { "tagName": "@layer", "syntaxKind": "block" },
    { "tagName": "@service", "syntaxKind": "block" },
    { "tagName": "@schema", "syntaxKind": "block" },
    { "tagName": "@effect", "syntaxKind": "block" },
    { "tagName": "@error", "syntaxKind": "block" },
    { "tagName": "@pipe", "syntaxKind": "block" },
    { "tagName": "@depends", "syntaxKind": "block" },
    { "tagName": "@provides", "syntaxKind": "block" },
    { "tagName": "@domain", "syntaxKind": "block" },
    { "tagName": "@rationale", "syntaxKind": "block" },
    { "tagName": "@invariant", "syntaxKind": "block" },
    { "tagName": "@constraint", "syntaxKind": "block" },
    { "tagName": "@pattern", "syntaxKind": "modifier" },
    { "tagName": "@pure", "syntaxKind": "modifier" },
    { "tagName": "@effectful", "syntaxKind": "modifier" }
  ]
}
```

#### Recommended Custom Tags for Effect Monorepo

| Custom Tag | Kind | Purpose | Example |
|-----------|------|---------|---------|
| `@layer` | block | Which Effect Layer this belongs to | `@layer ConfigService` |
| `@service` | block | Which Effect Service this implements | `@service FileSystem` |
| `@schema` | block | Related Effect Schema | `@schema PackageJson` |
| `@effect` | block | Effect signature description (R, E, A) | `@effect Effect<Config, ConfigError, ConfigService>` |
| `@error` | block | Error channel documentation | `@error ParseError when JSON is malformed` |
| `@pipe` | block | Pipeline/composition context | `@pipe Used in validation pipeline` |
| `@depends` | block | Service dependencies (explicit) | `@depends FileSystem, Path` |
| `@provides` | block | What this Layer provides | `@provides ConfigService` |
| `@domain` | block | Business domain classification | `@domain package-management` |
| `@rationale` | block | Design decision explanation | `@rationale Uses streaming to handle large files` |
| `@invariant` | block | Invariant this code maintains | `@invariant Output array is always sorted` |
| `@constraint` | block | Constraint or limitation | `@constraint Max 1000 items` |
| `@pattern` | modifier | Design pattern flag | `@pattern` (presence = uses pattern) |
| `@pure` | modifier | Pure function flag | `@pure` |
| `@effectful` | modifier | Has side effects flag | `@effectful` |

---

## 2. File-Level Documentation Best Practices

### 2.1 Tag Options for File-Level Docs

There are three competing conventions for file-level documentation:

#### `@packageDocumentation` (TSDoc Standard)

```typescript
/**
 * Provides utilities for parsing and validating package.json files
 * within the monorepo tooling infrastructure.
 *
 * This module is the primary entry point for package manifest operations,
 * including schema validation, dependency resolution, and workspace
 * catalog expansion.
 *
 * @remarks
 * All operations are Effect-based and require FileSystem + Path services.
 * Schema validation uses Effect Schema with rich error messages.
 *
 * @see {@link PackageJsonSchema} for the validation schema
 * @see {@link readPackageJson} for the primary reading function
 *
 * @packageDocumentation
 */
```

- **Pros**: TSDoc standard, recognized by API Extractor, TypeDoc, eslint-plugin-tsdoc
- **Cons**: Must be the first comment in the file, before any `import` statements
- **Recommendation**: Use this as the primary file-level documentation mechanism

#### `@module` (TypeDoc / JSDoc)

```typescript
/**
 * @module PackageJson
 *
 * Provides utilities for parsing and validating package.json files.
 */
```

- **Pros**: Can rename the module, TypeDoc recognizes it, simpler syntax
- **Cons**: Not TSDoc standard, TypeDoc-specific behavior
- **Recommendation**: Use for TypeDoc-specific module renaming only

#### `@file` / `@fileoverview` (Classic JSDoc)

```typescript
/**
 * @file Package JSON utilities for monorepo tooling
 * @fileoverview Parsing, validation, and manipulation of package.json manifests.
 */
```

- **Pros**: Classic JSDoc, Google style guide uses it, eslint-plugin-jsdoc supports it
- **Cons**: Not TSDoc standard, some TS tools may not recognize it
- **Recommendation**: Avoid in favor of `@packageDocumentation`

### 2.2 What to Include in File-Level Docs

A file-level doc comment should answer these questions for both humans and search systems:

1. **What does this module do?** (1-2 sentence summary)
2. **Why does it exist?** (context within the larger system)
3. **What are its primary exports?** (key symbols)
4. **What are its dependencies?** (services, other modules)
5. **How does it relate to other modules?** (`@see` references)
6. **When was it introduced?** (`@since` version)
7. **What domain does it belong to?** (`@category` or `@domain`)

#### Comprehensive File Header Template

```typescript
/**
 * Parses, validates, and transforms package.json manifests for monorepo tooling.
 *
 * @remarks
 * This module serves as the canonical source of truth for package manifest
 * operations. It provides Effect-based APIs that handle the full lifecycle
 * of package.json interaction: reading from disk, validating against the
 * {@link PackageJsonSchema}, resolving workspace catalog references, and
 * writing back to disk with deterministic formatting.
 *
 * All operations require the {@link FileSystem} and {@link Path} services
 * from `effect`. Error handling uses typed errors via
 * {@link PackageJsonError}.
 *
 * @example
 * ```ts
 * import { PackageJson } from "@repo/repo-utils"
 * import { Effect } from "effect"
 *
 * const program = PackageJson.read("./package.json")
 * ```
 *
 * @see {@link PackageJsonSchema} - validation schema
 * @see {@link readPackageJson} - primary read function
 * @see {@link writePackageJson} - primary write function
 * @see {@link resolveWorkspaceCatalog} - catalog resolution
 *
 * @since 0.1.0
 * @category Package Management
 * @domain package-management
 * @depends FileSystem, Path
 *
 * @packageDocumentation
 */
```

### 2.3 Convention for Re-Exports and Barrel Files

Barrel files (index.ts) present a unique documentation challenge. They aggregate exports
but typically contain no logic.

#### Recommended Pattern for Barrel Files

```typescript
/**
 * Public API surface for the repo-utils package.
 *
 * @remarks
 * This barrel file re-exports the public API from internal modules.
 * Each sub-module handles a specific domain concern:
 *
 * - {@link PackageJson} - Package manifest operations
 * - {@link WorkspaceGraph} - Workspace dependency graph
 * - {@link TaskRunner} - Monorepo task orchestration
 * - {@link SchemaRegistry} - Shared validation schemas
 *
 * @see {@link PackageJson} for package manifest operations
 * @see {@link WorkspaceGraph} for dependency graph operations
 *
 * @since 0.1.0
 * @packageDocumentation
 */

/** @since 0.1.0 */
export * as PackageJson from "./PackageJson.js"

/** @since 0.1.0 */
export * as WorkspaceGraph from "./WorkspaceGraph.js"
```

**Key Rule**: Every individual named export needs its own `/** @since X.Y.Z */` JSDoc.
This is required by Effect's docgen and is a good practice for any project.

---

## 3. Documentation for Semantic Discovery

### 3.1 Tags Ranked by Semantic Search Value

The following ranking prioritizes tags by their contribution to embedding quality
and search relevance:

#### Tier 1: Critical for Semantic Search

1. **Main description** (the prose before any tags) - This is the single most important
   element. It provides the natural language description that embedding models understand best.

2. **`@remarks`** - Extended description with design rationale, constraints, and context.
   Provides the richest natural language content after the main description.

3. **`@example`** - Code examples with comments provide rich usage context that helps
   embeddings understand what the code does in practice. The natural language in example
   comments is particularly valuable.

4. **`@see` / `{@link}`** - Cross-references create explicit relationship edges. When
   extracted, these form the edges of a code knowledge graph.

5. **`@category`** - Taxonomy/classification provides high-level domain grouping. Enables
   faceted search and hierarchical navigation.

#### Tier 2: High Value for Semantic Search

6. **`@param` descriptions** - Not the type (TypeScript handles that), but the natural
   language description of what the parameter means, its constraints, and its semantics.

7. **`@returns` description** - Natural language description of what the function produces.

8. **`@throws` description** - Error domain context, failure modes.

9. **`@deprecated` with migration guidance** - Lifecycle state plus replacement references
   via `{@link}`.

10. **`@summary`** - Concise semantic anchor, excellent as a standalone embedding chunk.

11. **Custom domain tags** (`@layer`, `@service`, `@domain`, etc.) - Domain-specific
    classification that enables faceted search.

#### Tier 3: Medium Value

12. **`@since`** - Temporal context for filtering.
13. **`@defaultValue`** - Behavioral context.
14. **`@typeParam`** - Generic constraint descriptions.
15. **`@privateRemarks`** - Internal design rationale (valuable for maintainer search).

#### Tier 4: Low/No Value for Search

16. **Access modifiers** (`@public`, `@private`, `@protected`) - Filtering metadata only.
17. **Type tags** (`@type`, `@typedef`) - Redundant in TypeScript.
18. **`@ignore` / `@hidden`** - Explicitly excluded from documentation.

### 3.2 Writing Descriptions That Are Embedding-Friendly

Embedding models work best with natural language that is:

1. **Specific rather than generic**: "Parses a package.json file and validates it against
   the PackageJsonSchema" beats "Handles package data."

2. **Action-oriented**: Start with a verb. "Reads", "Validates", "Transforms", "Resolves".

3. **Domain-rich**: Include domain terminology. "Resolves workspace catalog references in
   pnpm monorepo package manifests" is far more searchable than "Resolves references."

4. **Contextual**: Explain the "why", not just the "what". "Validates package.json to
   ensure all workspace dependencies use the `catalog:` protocol, preventing version
   drift in the monorepo" is much richer than "Validates package.json."

5. **Self-contained**: Each description should make sense without reading the code.
   Someone searching for "how to validate package.json in a monorepo" should find
   your function from the description alone.

#### Anti-Patterns (Fail `informative-docs` Rule)

```typescript
// BAD: Restates the name
/** The user id. */
const userId: string

// BAD: Generic, adds nothing
/** Reads the file. */
function readFile(path: string): string

// BAD: Just types (redundant in TS)
/** @param path - string */
function readFile(path: string): string
```

#### Good Patterns (Embedding-Friendly)

```typescript
// GOOD: Specific, action-oriented, domain-rich
/**
 * Reads a package.json file from disk and validates it against the
 * canonical PackageJsonSchema, returning a typed PackageJson object.
 *
 * @remarks
 * Uses streaming file I/O to handle large manifests efficiently.
 * The validation step ensures all required fields are present and
 * that workspace dependency references use the `catalog:` protocol.
 *
 * @param path - Absolute or relative path to the package.json file.
 *   Resolved against the current working directory if relative.
 * @returns A validated PackageJson object with all fields typed
 *   according to the schema.
 * @throws PackageJsonError when the file cannot be read or fails
 *   schema validation.
 *
 * @example
 * ```ts
 * import { PackageJson } from "@repo/repo-utils"
 * import { Effect } from "effect"
 *
 * // Read and validate a package.json
 * const pkg = yield* PackageJson.read("./package.json")
 * console.log(pkg.name) // "@repo/my-package"
 * ```
 *
 * @see {@link writePackageJson} for writing back to disk
 * @see {@link PackageJsonSchema} for the validation schema
 * @see {@link resolveWorkspaceCatalog} for catalog resolution
 *
 * @category Package Management
 * @since 0.1.0
 */
```

### 3.3 Cross-Referencing with `@see` and `{@link}`

These tags are the most valuable for building a code knowledge graph because they
create **explicit edges** between code entities.

#### `@see` Tag Patterns

```typescript
/**
 * @see {@link OtherSymbol} - related symbol in same module
 * @see {@link ./OtherModule#Symbol} - symbol in another module
 * @see {@link https://example.com | External Resource} - external link
 * @see OtherSymbol for the inverse operation
 */
```

#### `{@link}` Inline Patterns

```typescript
/**
 * Transforms a {@link PackageJson} into a {@link WorkspaceNode} for
 * inclusion in the {@link WorkspaceGraph}. Uses the
 * {@link resolveWorkspaceDeps} function to compute edges.
 */
```

#### Link Variations

- `{@link Symbol}` - Standard link
- `{@link Symbol | display text}` - Custom display text
- `{@linkcode Symbol}` - Monospace font (code-like)
- `{@linkplain Symbol}` - Plain text (no code formatting)

#### Best Practice: Import Referenced Symbols

Even if only used in JSDoc, import the symbol so TypeScript's language service can
resolve the reference:

```typescript
import type { PackageJsonSchema } from "./schemas.js" // Type-only import for JSDoc

/**
 * @see {@link PackageJsonSchema} for the validation schema
 */
```

### 3.4 `@example` as Rich Search Context

Examples are one of the most valuable sources of natural language content for embeddings
because they contain:

1. **Import paths** (how to use the module)
2. **Function call patterns** (API usage)
3. **Natural language comments** (explaining what the code does)
4. **Expected outputs** (behavioral documentation)

#### Example Best Practices

```typescript
/**
 * @example Reading and validating a package.json
 * ```ts
 * import { PackageJson } from "@repo/repo-utils"
 * import { Effect, Console } from "effect"
 *
 * // Read the root package.json and extract workspace info
 * const program = Effect.gen(function* () {
 *   const pkg = yield* PackageJson.read("./package.json")
 *   yield* Console.log(`Package: ${pkg.name}`)
 *   yield* Console.log(`Version: ${pkg.version}`)
 * })
 * ```
 *
 * @example Handling validation errors
 * ```ts
 * import { PackageJson } from "@repo/repo-utils"
 * import { Effect } from "effect"
 *
 * // Gracefully handle missing or invalid package.json
 * const program = PackageJson.read("./nonexistent.json").pipe(
 *   Effect.catchTag("PackageJsonError", (err) =>
 *     Effect.succeed({ name: "unknown", version: "0.0.0" })
 *   )
 * )
 * ```
 */
```

**Key Insight**: The title line after `@example` (e.g., "Reading and validating a
package.json") is prime natural language content for embeddings. Always include a
descriptive title.

### 3.5 `@category` / `@group` for Taxonomy

Categories create a classification hierarchy that enables faceted search.

#### Recommended Category Taxonomy for Effect Monorepo

```
@category Constructors        - Functions that create new values
@category Getters             - Functions that extract data
@category Guards              - Type guard / predicate functions
@category Pattern Matching    - Match/case/when functions
@category Transformations     - Functions that transform data
@category Combinators         - Functions that combine values
@category Filtering           - Functions that filter collections
@category Folding             - Reduce/fold operations
@category Errors              - Error types and handlers
@category Services            - Effect Service definitions
@category Layers              - Effect Layer definitions
@category Schemas             - Effect Schema definitions
@category Models              - Data model types
@category Utilities           - General-purpose helpers
@category Configuration       - Configuration handling
@category IO                  - File system / network operations
```

---

## 4. Documentation as Knowledge Graph Nodes

### 4.1 Mapping JSDoc to Knowledge Graph Elements

A code knowledge graph has **nodes** (code entities) and **edges** (relationships).
JSDoc annotations map naturally to both.

#### Nodes (Code Entities)

Each documented symbol becomes a node with properties extracted from JSDoc:

```
Node {
  id: "PackageJson.readPackageJson"
  type: "function"
  description: "Reads a package.json file from disk and validates it..."
  summary: "Read and validate package.json"
  category: "IO"
  domain: "package-management"
  since: "0.1.0"
  deprecated: false
  examples: ["Reading and validating a package.json", ...]
  tags: ["@effectful", "@service FileSystem"]
  file: "src/PackageJson.ts"
  line: 42
}
```

#### Edges (Relationships)

JSDoc annotations create explicit edges:

| Source | Edge Type | Target | JSDoc Source |
|--------|-----------|--------|-------------|
| `readPackageJson` | `REFERENCES` | `PackageJsonSchema` | `@see` / `{@link}` |
| `readPackageJson` | `RETURNS_TYPE` | `PackageJson` | `@returns` type |
| `readPackageJson` | `THROWS` | `PackageJsonError` | `@throws` |
| `readPackageJson` | `DEPENDS_ON` | `FileSystem` | `@depends` custom tag |
| `readPackageJson` | `CATEGORIZED_AS` | `IO` | `@category` |
| `readPackageJson` | `BELONGS_TO_DOMAIN` | `package-management` | `@domain` custom tag |
| `readPackageJson` | `RELATES_TO` | `writePackageJson` | `@see` |
| `ConfigLayer` | `PROVIDES` | `ConfigService` | `@provides` custom tag |
| `ConfigLayer` | `REQUIRES` | `FileSystem` | `@depends` custom tag |

### 4.2 Encoding Relationships Explicitly

The key insight is that most relationships in code are **implicit** (buried in type
signatures, import graphs, call sites). JSDoc makes them **explicit** in natural language.

#### Implicit vs. Explicit Relationships

```typescript
// IMPLICIT: You have to read the code to understand relationships
export const readPackageJson = Effect.fn(function* (path: string) {
  const fs = yield* FileSystem
  const content = yield* fs.readFileString(path)
  return yield* S.decodeUnknown(PackageJsonSchema)(JSON.parse(content))
})

// EXPLICIT: JSDoc encodes the relationships as natural language
/**
 * Reads a package.json file from disk and validates it against
 * {@link PackageJsonSchema}.
 *
 * @param path - Path to the package.json file
 * @returns A validated {@link PackageJson} object
 * @throws {@link PackageJsonError} when validation fails
 *
 * @see {@link writePackageJson} for the inverse operation
 * @see {@link PackageJsonSchema} for the validation schema
 * @depends FileSystem
 * @provides PackageJson
 * @category IO
 * @domain package-management
 */
```

### 4.3 Effect-Specific Relationship Patterns

For an Effect monorepo, there are domain-specific relationships that are extremely
valuable to encode:

#### Service Dependencies (Layer Graph)

```typescript
/**
 * Provides the PackageJsonService backed by real file system operations.
 *
 * @provides PackageJsonService
 * @depends FileSystem, Path
 * @layer PackageJsonServiceLive
 *
 * @see {@link PackageJsonService} for the service interface
 * @see {@link PackageJsonServiceTest} for the test implementation
 */
```

#### Error Channels

```typescript
/**
 * @error ParseError - when the JSON is syntactically invalid
 * @error ValidationError - when the JSON doesn't match PackageJsonSchema
 * @error FileNotFoundError - when the file doesn't exist on disk
 */
```

#### Schema Relationships

```typescript
/**
 * Schema for validating package.json manifest files.
 *
 * @schema PackageJsonSchema
 * @see {@link PackageJson} for the decoded type
 * @see {@link PackageJsonEncoded} for the encoded type
 * @category Schemas
 */
```

---

## 5. Enforcement and Linting

### 5.1 eslint-plugin-jsdoc (58+ Rules)

This is the most comprehensive JSDoc linting plugin. Key rules for our use case:

#### Documentation Presence Rules

| Rule | Purpose | Recommended Setting |
|------|---------|-------------------|
| `require-jsdoc` | Require JSDoc on functions, classes, etc. | `"error"` for exports |
| `require-file-overview` | Require `@file` / `@fileoverview` / `@packageDocumentation` | `"error"` |
| `require-description` | Require description text | `"error"` |
| `require-param` | Require `@param` for all parameters | `"error"` |
| `require-param-description` | Require description on `@param` | `"error"` |
| `require-returns` | Require `@returns` | `"warn"` |
| `require-returns-description` | Require description on `@returns` | `"warn"` |
| `require-throws` | Require `@throws` documentation | `"warn"` |
| `require-example` | Require `@example` | `"warn"` for public APIs |

#### Documentation Quality Rules

| Rule | Purpose | Recommended Setting |
|------|---------|-------------------|
| `informative-docs` | Prevent docs that just restate the name | `"error"` |
| `require-description-complete-sentence` | Require complete sentences | `"warn"` |
| `match-description` | Match description against regex pattern | Custom regex |
| `no-blank-block-descriptions` | No empty description blocks | `"error"` |

#### Tag Validation Rules

| Rule | Purpose | Recommended Setting |
|------|---------|-------------------|
| `check-tag-names` | Verify tag names are recognized | `"error"` with custom tag definitions |
| `check-param-names` | Validate param names match signature | `"error"` |
| `check-values` | Validate tag values | `"error"` |
| `check-types` | Ensure types are properly formatted | `"off"` (TypeScript handles types) |
| `no-types` | Disallow type annotations in JSDoc | `"error"` (TypeScript projects) |
| `sort-tags` | Order tags consistently | `"warn"` |
| `empty-tags` | Detect empty tag blocks | `"error"` |

#### Style Rules

| Rule | Purpose | Recommended Setting |
|------|---------|-------------------|
| `check-alignment` | Ensure proper alignment | `"error"` |
| `check-indentation` | Verify consistent indentation | `"warn"` |
| `check-line-alignment` | Check line alignment | `"off"` (too opinionated) |
| `multiline-blocks` | Enforce multiline format | `"error"` |
| `tag-lines` | Manage spacing between tags | `"warn"` |
| `require-asterisk-prefix` | Enforce asterisk prefixes | `"error"` |

#### Recommended Configuration for Effect Monorepo

```javascript
// eslint.config.js
import jsdoc from "eslint-plugin-jsdoc"

export default [
  jsdoc.configs["flat/recommended-typescript-error"],
  {
    plugins: { jsdoc },
    rules: {
      // Presence
      "jsdoc/require-jsdoc": ["error", {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false, // Only when exported
          FunctionExpression: false
        },
        contexts: [
          "ExportNamedDeclaration > FunctionDeclaration",
          "ExportNamedDeclaration > VariableDeclaration",
          "ExportNamedDeclaration > TSTypeAliasDeclaration",
          "ExportNamedDeclaration > TSInterfaceDeclaration",
          "ExportNamedDeclaration > ClassDeclaration",
          "ExportDefaultDeclaration"
        ],
        checkGetters: true,
        checkSetters: true
      }],
      "jsdoc/require-file-overview": ["error", {
        tags: {
          file: {
            initialCommentsOnly: true,
            mustExist: true,
            preventDuplicates: true
          }
        }
      }],
      "jsdoc/require-description": ["error", {
        contexts: ["any"]
      }],
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-description": "warn",
      "jsdoc/require-example": ["warn", {
        contexts: [
          "ExportNamedDeclaration > FunctionDeclaration",
          "ExportNamedDeclaration > VariableDeclaration"
        ]
      }],

      // Quality
      "jsdoc/informative-docs": ["error", {
        uselessWords: ["a", "an", "the", "i", "in", "of", "s", "is", "are", "was", "get", "set"],
        aliases: {
          a: ["an", "our"]
        }
      }],
      "jsdoc/require-description-complete-sentence": ["warn", {
        abbreviations: ["e.g.", "i.e.", "etc.", "vs."]
      }],

      // Tags
      "jsdoc/check-tag-names": ["error", {
        definedTags: [
          "layer", "service", "schema", "effect", "error",
          "pipe", "depends", "provides", "domain",
          "rationale", "invariant", "constraint",
          "pattern", "pure", "effectful",
          "packageDocumentation", "remarks", "privateRemarks",
          "defaultValue", "typeParam", "sealed", "virtual",
          "override", "eventProperty", "label",
          "alpha", "beta", "experimental", "internal"
        ]
      }],
      "jsdoc/sort-tags": ["warn", {
        tagSequence: [
          { tags: ["summary"] },
          { tags: ["remarks"] },
          { tags: ["privateRemarks"] },
          { tags: ["example"] },
          { tags: ["param"] },
          { tags: ["typeParam"] },
          { tags: ["returns"] },
          { tags: ["throws"] },
          { tags: ["see"] },
          { tags: ["link"] },
          { tags: ["layer", "service", "schema", "effect", "error"] },
          { tags: ["depends", "provides", "pipe"] },
          { tags: ["domain", "category"] },
          { tags: ["since", "deprecated"] },
          { tags: ["rationale", "invariant", "constraint"] },
          { tags: ["alpha", "beta", "experimental", "internal", "public"] },
          { tags: ["pure", "effectful", "pattern"] },
          { tags: ["packageDocumentation"] }
        ]
      }],
      "jsdoc/no-types": "error", // TypeScript handles types
      "jsdoc/empty-tags": "error",
      "jsdoc/no-blank-block-descriptions": "error",

      // Style
      "jsdoc/check-alignment": "error",
      "jsdoc/multiline-blocks": "error",
      "jsdoc/require-asterisk-prefix": "error"
    }
  }
]
```

### 5.2 eslint-plugin-tsdoc

Provides a single rule `tsdoc/syntax` that validates TSDoc comment syntax:

```javascript
{
  plugins: ["eslint-plugin-tsdoc"],
  rules: {
    "tsdoc/syntax": "warn"
  }
}
```

This catches:
- Missing hyphens in `@param` tags (TSDoc requires `@param name - description`)
- Invalid tag syntax
- Malformed inline tags
- Unclosed `{@link}` tags

### 5.3 Microsoft API Extractor

API Extractor provides build-time validation beyond what ESLint can catch:

#### Release Tag Enforcement

```typescript
/** @public */
export function readPackageJson(path: string): Effect<PackageJson, PackageJsonError> { ... }

/** @internal */
export function _parseRawJson(content: string): unknown { ... }
```

API Extractor enforces:
- Every exported declaration must have a release tag (`@public`, `@beta`, `@alpha`, `@internal`)
- `@internal` declarations must have underscore-prefixed names
- Mixed release tags are forbidden (e.g., `@public` function returning `@internal` type)
- Generates `.d.ts` rollup files trimmed by release level

#### API Report Files

API Extractor generates `.api.md` report files that serve as a snapshot of the public API.
Changes to the API require explicit approval by updating the report file.

### 5.4 Enforcement Timing Matrix

| Check | Lint Time | Build Time | Pre-Commit | CI |
|-------|-----------|------------|------------|-----|
| JSDoc presence | eslint-plugin-jsdoc | - | Yes | Yes |
| JSDoc quality (informative-docs) | eslint-plugin-jsdoc | - | Yes | Yes |
| TSDoc syntax | eslint-plugin-tsdoc | - | Yes | Yes |
| Release tags | - | API Extractor | - | Yes |
| Cross-reference validity | - | API Extractor | - | Yes |
| API surface changes | - | API Extractor | - | Yes |
| Custom tag extraction | - | ts-morph script | - | Yes |
| Embedding generation | - | - | - | Yes |
| Description quality (length, specificity) | Custom ESLint rule | - | Yes | Yes |
| `@since` tag presence | eslint-plugin-jsdoc | - | Yes | Yes |
| `@category` tag presence | Custom ESLint rule | - | Yes | Yes |

### 5.5 Custom ESLint Rule Ideas

Beyond existing plugins, consider custom rules for:

1. **`require-category`**: Every exported symbol must have `@category`
2. **`require-since`**: Every exported symbol must have `@since`
3. **`require-see-for-related`**: Functions that reference other symbols in their body
   should have `@see` tags
4. **`min-description-length`**: Descriptions must be at least N words (e.g., 5)
5. **`require-domain-for-services`**: Effect Service/Layer must have `@domain`
6. **`require-depends-for-effects`**: Effectful functions must document `@depends`
7. **`require-example-for-public`**: Public API exports must have `@example`
8. **`consistent-description-style`**: Enforce verb-first descriptions

---

## 6. Best Practices from Major Projects

### 6.1 Effect-TS

Effect-TS follows a distinctive documentation pattern:

#### Module-Level Documentation

```typescript
/**
 * This module provides utility functions for working with arrays in TypeScript.
 *
 * @since 2.0.0
 */
```

- Simple, direct prose
- Always includes `@since`
- No `@packageDocumentation` tag (uses a comment-only approach)

#### Function-Level Documentation

```typescript
/**
 * Retrieves the first element of an array, returning `O.none` if the
 * array is empty.
 *
 * @example
 * ```ts
 * import * as A from "effect/Array"
 * import * as O from "effect/Option"
 *
 * const result = A.head([1, 2, 3])
 * console.log(result) // O.some(1)
 * ```
 *
 * @category getters
 * @since 2.0.0
 */
```

#### Key Patterns

1. **No `@param`/`@returns`**: Relies entirely on TypeScript types
2. **Always `@since`**: Required on every export
3. **Always `@category`**: Used for TypeDoc organization
4. **Rich `@example`**: Realistic code with expected output
5. **Markdown in examples**: Uses headings within example blocks
6. **Simple prose**: Plain language, avoids jargon

#### Docgen Requirements

- Every individual named export needs `/** @since 0.0.0 */`
- Empty modules crash docgen -- need at least one export
- This means even re-exports get a `@since` tag

### 6.2 Google TypeScript Style Guide

#### Key Requirements

1. **Use `/** JSDoc */` for user-facing documentation**
2. **Use `// comments` for implementation details only**
3. **Do not declare types in `@param` or `@return` blocks** (TypeScript handles this)
4. **Do not use `@override`, `@implements`, `@enum`, `@private`** (use keywords instead)
5. **`@param` and `@return` are only required when they add information** beyond the type
6. **JSDoc uses Markdown formatting** for rich content
7. **File-level `@fileoverview`** is supported for describing files
8. **No decorative comment boxes**
9. **Descriptions should not merely restate the name**

#### Google's `@fileoverview` Pattern

```typescript
/**
 * @fileoverview Description of file, its uses and information
 * about its dependencies.
 */
```

### 6.3 Microsoft Fluid Framework (TSDoc Reference Implementation)

The Fluid Framework has the most detailed TSDoc guidelines of any open-source project:

#### Key Requirements

1. **Multi-line comment blocks only** for public APIs (no single-line `/** ... */`)
2. **Plain text only** in descriptions (no custom indentation/formatting)
3. **`@param` must list parameters in signature order** with hyphens
4. **`@param` must document contracts, side effects, and semantic info** beyond types
5. **`@returns` clarifies what a function produces vs. what it does**
6. **`@remarks`** for detailed context beyond the summary
7. **`@privateRemarks`** for internal developer notes and TODOs
8. **`@deprecated`** must include migration guidance and `{@link}` to replacements
9. **`@defaultValue`** for contractual defaults on optional properties
10. **`@sealed`** for types not intended for external extension
11. **`@packageDocumentation`** in index.ts entry points only
12. **`{@link}`** for cross-references with declaration references
13. **`{@inheritDoc}`** to eliminate duplication during implementation

#### Fluid Framework Custom Modifier Tags

- `@sealed` - Type must not be extended externally
- `@input` - Interface for implementation only (never reading)
- `@system` - Internal API, not for external import
- `@virtual` - Class member intentionally extendable
- `@override` - Overrides base class member

### 6.4 Angular (Compodoc/ngdoc)

Angular uses a custom JSDoc flavor called **ngdoc** parsed by **Dgeni**:

1. All docs stored inline in the source code
2. Custom `@ngdoc` tag specifying the type of thing documented
3. Angular-specific directives for components, services, pipes, etc.
4. Framework-aware documentation tooling

### 6.5 RxJS

RxJS historically relied on TypeScript types more than JSDoc, but has moved toward
better documentation:

1. Emphasis on TypeScript type information over JSDoc type annotations
2. `@deprecated` with migration guidance
3. Marble diagrams in documentation (visual representation)
4. Limited use of `@example` (an area for improvement)

### 6.6 Common Patterns Across Major Projects

| Practice | Effect | Google | Fluid | Angular |
|----------|--------|--------|-------|---------|
| Module-level docs | Yes | Yes | Yes | Yes |
| `@since` on exports | Required | No | No | No |
| `@category` | Required | No | No | Custom |
| `@example` | Required | Optional | Required | Optional |
| `@param` descriptions | No | When useful | Required | Required |
| `@returns` descriptions | No | When useful | Required | Required |
| `@remarks` | No | No | Required | No |
| `@deprecated` guidance | Yes | No | Required | Yes |
| `@see` cross-refs | Occasional | No | Required | No |
| Custom domain tags | No | No | Yes | Yes (ngdoc) |
| Type in JSDoc | No (TS) | No (TS) | No (TS) | Some |

---

## 7. Documentation-Driven Development Patterns

### 7.1 "Docs as Code" Movement

The docs-as-code approach treats documentation with the same rigor as source code:

1. **Version controlled**: Documentation lives alongside code in git
2. **Reviewed**: Documentation changes go through code review
3. **Tested**: Documentation accuracy is validated (examples compile, links resolve)
4. **Automated**: Documentation is generated/published via CI/CD
5. **Colocated**: Module documentation is in the module directory, not a separate docs/ tree

For monorepos specifically, documentation should be as close to the code as possible
at a **folder-level** rather than a **repository-level**. Each module's docs live
inside its own directory.

### 7.2 README-Driven Development Applied to Modules

Adapted for TypeScript modules:

1. **Write the file-level `@packageDocumentation` first** before any implementation
2. **Define the public API surface** with full JSDoc (descriptions, examples, see-refs)
   before implementing
3. **Use `@example` blocks as acceptance criteria**: The examples define what the API
   should do
4. **Let `@see` references define the module boundary**: Cross-references reveal
   which modules are coupled

This inverts the typical flow: instead of writing code then documenting, you document
the **intent** first, then implement to match the documentation.

### 7.3 Architecture Decision Records (ADRs) Embedded in Code

ADRs typically live as separate markdown files, but key decisions can be embedded
directly in code using `@remarks` and `@privateRemarks`:

```typescript
/**
 * Resolves workspace catalog references using a two-pass algorithm.
 *
 * @remarks
 * ## Design Decision: Two-Pass Resolution
 *
 * We use a two-pass algorithm instead of single-pass because:
 * 1. Circular references between workspaces are possible
 * 2. First pass collects all catalog entries
 * 3. Second pass resolves references with the complete catalog
 *
 * A topological sort was considered but rejected because the catalog
 * graph can have cycles (workspace A depends on B which depends on A
 * at different version ranges).
 *
 * See ADR-003 for the full decision record.
 *
 * @privateRemarks
 * TODO: Consider memoizing the catalog collection pass.
 * The current implementation re-reads package.json files that
 * were already read during dependency analysis.
 *
 * @since 0.2.0
 */
```

### 7.4 `@rationale` Custom Tag Pattern

For a more structured approach than embedding ADRs in `@remarks`:

```typescript
/**
 * Uses streaming file I/O for package.json reading.
 *
 * @rationale Streaming prevents OOM for monorepos with very large
 *   generated package.json files (e.g., 10MB+ in some enterprise
 *   monorepos). Benchmarks showed 3x memory reduction vs. readFileSync
 *   for files over 1MB.
 */
```

This separates **what** (description) from **why** (rationale), making both independently
searchable.

---

## 8. ts-morph Extraction API

### 8.1 Core JSDoc API

ts-morph provides full access to JSDoc comments through the TypeScript compiler API:

#### Getting JSDoc from Nodes

```typescript
import { Project } from "ts-morph"

const project = new Project()
const sourceFile = project.addSourceFileAtPath("src/PackageJson.ts")

// Get all exports
for (const declaration of sourceFile.getExportedDeclarations()) {
  const [name, nodes] = declaration
  for (const node of nodes) {
    // Get JSDoc comments
    const jsDocs = node.getJsDocs() // returns JSDoc[]

    for (const jsDoc of jsDocs) {
      // Main description
      const description = jsDoc.getDescription() // string

      // Inner text (without delimiters)
      const innerText = jsDoc.getInnerText() // string

      // All tags
      const tags = jsDoc.getTags() // JSDocTag[]

      for (const tag of tags) {
        const tagName = tag.getTagName()    // e.g., "param", "returns", "since"
        const tagText = tag.getCommentText() // e.g., "path - The file path"
        const fullText = tag.getText()       // Full tag text including @
      }
    }
  }
}
```

#### JSDocTag Properties

```typescript
interface JSDocTag {
  getTagName(): string           // "param", "returns", "category", etc.
  getCommentText(): string | undefined  // The text after the tag name
  getText(): string              // Full text including @ prefix
  getComment(): NodeArray<JSDocComment> | string | undefined
}
```

#### Adding/Modifying JSDoc

```typescript
// Add a new JSDoc comment
functionDeclaration.addJsDoc({
  description: "Reads a package.json file.",
  tags: [
    { tagName: "param", text: "path - The file path" },
    { tagName: "returns", text: "A validated PackageJson" },
    { tagName: "since", text: "0.1.0" },
    { tagName: "category", text: "IO" }
  ]
})

// Insert JSDoc at specific position
functionDeclaration.insertJsDoc(0, {
  description: "New description"
})
```

### 8.2 Extraction Strategy for Semantic Search

For each documented symbol, extract a structured document:

```typescript
interface ExtractedDoc {
  // Identity
  symbolName: string
  symbolKind: "function" | "class" | "interface" | "type" | "variable" | "enum"
  filePath: string
  lineNumber: number
  exported: boolean

  // Natural Language Content (for embedding)
  description: string           // Main description
  summary: string | undefined   // @summary if present
  remarks: string | undefined   // @remarks block
  privateRemarks: string | undefined  // @privateRemarks (for internal search)

  // Structured Metadata
  params: Array<{ name: string; description: string }>
  returns: string | undefined
  throws: Array<string>
  examples: Array<{ title: string; code: string }>
  since: string | undefined
  deprecated: string | undefined  // deprecation message if present

  // Taxonomy
  category: string | undefined
  domain: string | undefined

  // Relationships (edges)
  sees: Array<string>           // @see references
  links: Array<string>          // {@link} inline references
  depends: Array<string>        // @depends custom tag
  provides: Array<string>       // @provides custom tag
  layer: string | undefined     // @layer custom tag
  service: string | undefined   // @service custom tag
  schema: string | undefined    // @schema custom tag

  // Flags
  isPure: boolean               // @pure modifier
  isEffectful: boolean          // @effectful modifier
  isPattern: boolean            // @pattern modifier
}
```

### 8.3 Chunking Strategy for Embeddings

Based on research into how Cursor and other AI tools index codebases:

1. **Primary chunk**: Concatenate `description + summary + remarks` as the main
   embedding text. This is the richest natural language content.

2. **Example chunks**: Each `@example` block becomes its own chunk, with the
   example title as a prefix. Examples are rich in usage context.

3. **Parameter chunk**: Concatenate all `@param` descriptions into one chunk.
   This captures input semantics.

4. **Relationship chunk**: Concatenate `@see`, `{@link}`, `@depends`, `@provides`
   into one chunk. This captures the relationship context.

5. **Metadata**: `category`, `domain`, `since`, `deprecated` are stored as
   filterable metadata on the vector, not embedded.

Target chunk size: 200-400 tokens per chunk, matching the sweet spot identified
by Cursor's indexing research.

---

## 9. Embedding Strategy for Documentation

### 9.1 Why Documentation Improves Code Search

Research from the CodeCSE and Code Semantic Enrichment papers demonstrates:

1. **Code alone has less semantic information than its description**. The natural language
   description of a function captures intent, purpose, and context that raw code cannot.

2. **Enriching code embeddings with documentation metadata significantly improves retrieval**.
   Concatenating title and description as metadata influences embedding calculations and
   enriches semantic context.

3. **Docstrings, comments, and metadata can be used to enrich chunks** with additional
   information beyond what the code itself provides.

4. **Descriptions of similar code share functional keywords**. Well-documented code creates
   a shared vocabulary that improves cluster quality in embedding space.

### 9.2 Dual-Embedding Strategy

For optimal search, maintain two types of embeddings per symbol:

1. **Documentation embedding**: The JSDoc natural language content. Best for natural
   language queries like "how do I validate a package.json?"

2. **Code embedding**: The actual source code. Best for code-similarity queries like
   "show me functions that use Effect.gen with FileSystem."

A hybrid search combines both, with documentation embeddings weighted higher for
natural language queries and code embeddings weighted higher for code-pattern queries.

### 9.3 Documentation Quality Signals for Embedding Confidence

Not all documentation is equally useful. Quality signals include:

| Signal | How to Measure | Weight |
|--------|---------------|--------|
| Description length | Word count > 10 | High |
| Passes `informative-docs` | ESLint rule | High |
| Has `@example` | Tag presence | High |
| Has `@see` references | Tag presence + count | Medium |
| Has `@remarks` | Tag presence | Medium |
| Has `@category` | Tag presence | Medium |
| Description starts with verb | Regex check | Medium |
| Complete sentences | ESLint rule | Low |
| Has `@since` | Tag presence | Low |

Low-quality documentation should be flagged for improvement rather than embedded,
as poor documentation can actually degrade search quality.

---

## 10. Concrete Recommendations for beep-effect2

### 10.1 Tag Standard (Required Tags by Context)

#### Every Exported Symbol (Minimum)

```typescript
/**
 * [Description: 10+ words, starts with verb, specific and domain-rich]
 *
 * @since X.Y.Z
 * @category [CategoryName]
 */
```

#### Exported Functions

```typescript
/**
 * [Description]
 *
 * @remarks
 * [Extended context, design rationale, constraints]
 *
 * @example [Descriptive title]
 * ```ts
 * [Realistic code example with expected output]
 * ```
 *
 * @param name - [Description of semantics, constraints, defaults]
 * @returns [Description of what is produced]
 * @throws {@link ErrorType} [When/why this error occurs]
 *
 * @see {@link RelatedSymbol} - [relationship description]
 *
 * @category [CategoryName]
 * @since X.Y.Z
 */
```

#### Effect Services

```typescript
/**
 * [Description]
 *
 * @remarks [Design rationale, usage patterns]
 *
 * @service ServiceName
 * @depends Dep1, Dep2
 *
 * @see {@link ServiceNameLive} - production implementation
 * @see {@link ServiceNameTest} - test implementation
 *
 * @category Services
 * @since X.Y.Z
 */
```

#### Effect Layers

```typescript
/**
 * [Description]
 *
 * @layer LayerName
 * @provides ServiceName
 * @depends Dep1, Dep2
 *
 * @see {@link ServiceName} - the service this layer provides
 *
 * @category Layers
 * @since X.Y.Z
 */
```

#### Effect Schemas

```typescript
/**
 * [Description]
 *
 * @example [Usage example]
 *
 * @schema SchemaName
 * @see {@link DecodedType} - the decoded type
 *
 * @category Schemas
 * @since X.Y.Z
 */
```

#### Tagged Errors

```typescript
/**
 * [Description of when/why this error occurs]
 *
 * @remarks [Recovery strategies, common causes]
 *
 * @see {@link RelatedOperation} - the operation that throws this
 *
 * @category Errors
 * @since X.Y.Z
 */
```

#### File Headers

```typescript
/**
 * [One-line summary of module purpose]
 *
 * @remarks
 * [Extended description: what this module does, why it exists,
 *  how it fits into the larger system]
 *
 * @example [Primary usage pattern]
 * ```ts
 * [How to import and use this module]
 * ```
 *
 * @see {@link RelatedModule1} - [relationship]
 * @see {@link RelatedModule2} - [relationship]
 *
 * @depends Service1, Service2
 * @domain [domain-name]
 * @since X.Y.Z
 *
 * @packageDocumentation
 */
```

### 10.2 Tag Ordering Convention

Tags should appear in this order (enforced by `jsdoc/sort-tags`):

1. `@summary` (if separate from description)
2. `@remarks`
3. `@privateRemarks`
4. `@example` (can have multiple)
5. `@param` (in signature order)
6. `@typeParam`
7. `@returns`
8. `@throws`
9. `@see`
10. `@layer` / `@service` / `@schema` / `@effect` / `@error`
11. `@depends` / `@provides` / `@pipe`
12. `@domain` / `@category`
13. `@since` / `@deprecated`
14. `@rationale` / `@invariant` / `@constraint`
15. `@alpha` / `@beta` / `@experimental` / `@internal` / `@public`
16. `@pure` / `@effectful` / `@pattern`
17. `@packageDocumentation`

### 10.3 Description Writing Guide

1. **Start with a verb**: "Reads", "Validates", "Transforms", "Creates", "Resolves"
2. **Be specific**: Name the types, services, and operations involved
3. **Include domain terms**: "workspace", "catalog", "monorepo", "manifest"
4. **Explain the "why"**: Not just what it does, but why you would use it
5. **Minimum 10 words**: Short enough for a summary, long enough for semantic richness
6. **Avoid restating the name**: "readPackageJson reads a package json" is useless
7. **Include constraints/invariants**: "Returns a sorted array" or "Fails if file missing"

### 10.4 tsdoc.json Configuration

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json",
  "extends": ["typedoc/tsdoc.json"],
  "noStandardTags": false,
  "tagDefinitions": [
    { "tagName": "@layer", "syntaxKind": "block" },
    { "tagName": "@service", "syntaxKind": "block" },
    { "tagName": "@schema", "syntaxKind": "block" },
    { "tagName": "@effect", "syntaxKind": "block" },
    { "tagName": "@error", "syntaxKind": "block" },
    { "tagName": "@pipe", "syntaxKind": "block" },
    { "tagName": "@depends", "syntaxKind": "block" },
    { "tagName": "@provides", "syntaxKind": "block" },
    { "tagName": "@domain", "syntaxKind": "block" },
    { "tagName": "@rationale", "syntaxKind": "block" },
    { "tagName": "@invariant", "syntaxKind": "block" },
    { "tagName": "@constraint", "syntaxKind": "block" },
    { "tagName": "@pattern", "syntaxKind": "modifier" },
    { "tagName": "@pure", "syntaxKind": "modifier" },
    { "tagName": "@effectful", "syntaxKind": "modifier" }
  ],
  "supportForTags": {
    "@layer": true,
    "@service": true,
    "@schema": true,
    "@effect": true,
    "@error": true,
    "@pipe": true,
    "@depends": true,
    "@provides": true,
    "@domain": true,
    "@rationale": true,
    "@invariant": true,
    "@constraint": true,
    "@pattern": true,
    "@pure": true,
    "@effectful": true
  }
}
```

### 10.5 Phased Rollout Plan

#### Phase 1: Foundation (Week 1-2)
- Add `tsdoc.json` with custom tag definitions
- Configure `eslint-plugin-jsdoc` with recommended-typescript-error
- Enable `require-jsdoc` for exported declarations
- Enable `require-description` and `informative-docs`
- Add `require-file-overview` for all source files
- Require `@since` on all exports (via custom rule or check-values)

#### Phase 2: Enrichment (Week 3-4)
- Add `@category` to all exported symbols
- Add `@see` cross-references between related symbols
- Add `@example` to all public API functions
- Add `@remarks` to complex functions
- Add file-level `@packageDocumentation` with `@see` references

#### Phase 3: Domain Tags (Week 5-6)
- Add `@domain` to all modules
- Add `@service` / `@layer` / `@schema` to Effect-specific symbols
- Add `@depends` / `@provides` to layers and services
- Add `@rationale` to design-critical functions

#### Phase 4: Extraction and Embedding (Week 7-8)
- Build ts-morph extraction pipeline
- Generate structured ExtractedDoc objects
- Create embeddings from documentation content
- Build semantic search index
- Validate search quality with test queries

---

## Sources

### Official Documentation
- [JSDoc Reference (jsdoc.app)](https://jsdoc.app/)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [TSDoc Specification](https://tsdoc.org/)
- [TSDoc Tag Kinds](https://tsdoc.org/pages/spec/tag_kinds/)
- [TypeDoc Tags](https://typedoc.org/documents/Tags.html)
- [TypeDoc TSDoc Support](https://typedoc.org/documents/Doc_Comments.TSDoc_Support.html)

### Style Guides
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Microsoft Fluid Framework TSDoc Guidelines](https://github.com/microsoft/FluidFramework/wiki/TSDoc-Guidelines)
- [API Extractor Doc Comment Syntax](https://api-extractor.com/pages/tsdoc/doc_comment_syntax/)

### Linting and Enforcement
- [eslint-plugin-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc)
- [eslint-plugin-jsdoc informative-docs rule](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/informative-docs.md)
- [eslint-plugin-tsdoc](https://tsdoc.org/pages/packages/eslint-plugin-tsdoc/)
- [Microsoft API Extractor](https://api-extractor.com/)

### Code Search and Embeddings
- [How Cursor Actually Indexes Your Codebase](https://towardsdatascience.com/how-cursor-actually-indexes-your-codebase/)
- [Semantic Code Search Explained](https://bytebell.ai/blog/semantic-code-search/)
- [Building a Knowledge Graph of Your Codebase (Daytona)](https://www.daytona.io/dotfiles/building-a-knowledge-graph-of-your-codebase)
- [GraphGen4Code: A Toolkit for Generating Code Knowledge Graphs](https://wala.github.io/graph4code/)
- [Code Semantic Enrichment for Deep Code Search](https://www.sciencedirect.com/science/article/abs/pii/S0164121223002510)
- [CodeRAG-Bench: Can Retrieval Augment Code Generation?](https://arxiv.org/html/2406.14497v1)
- [6 Best Code Embedding Models Compared](https://modal.com/blog/6-best-code-embedding-models-compared)

### ts-morph
- [ts-morph Documentation](https://ts-morph.com/)
- [ts-morph JSDoc Handling](https://ts-morph.com/details/documentation)
- [Generate TypeScript Docs Using ts-morph](https://souporserious.com/generate-typescript-docs-using-ts-morph/)

### Documentation-Driven Development
- [Docs as Code (GitBook)](https://www.gitbook.com/blog/what-is-docs-as-code)
- [README-Driven Development](https://ponyfoo.com/articles/readme-driven-development)
- [Documentation-Driven Development](https://gist.github.com/zsup/9434452)
- [Solving Documentation for Monorepos (Spotify)](https://engineering.atspotify.com/2019/10/solving-documentation-for-monoliths-and-monorepos)

### Academic Research
- [Code Search: A Survey of Techniques (ACM)](https://software-lab.org/publications/csur2022_code_search.pdf)
- [A Review on Source Code Documentation (ACM TIST)](https://dl.acm.org/doi/10.1145/3519312)
- [Survey of Code Search Based on Deep Learning (ACM TOSEM)](https://dl.acm.org/doi/10.1145/3628161)
- [Architecture Decision Records](https://adr.github.io/)

### Effect-TS
- [Effect-TS GitHub Repository](https://github.com/Effect-TS/effect)
- [Effect-TS Array.ts Documentation](https://effect-ts.github.io/effect/effect/Array.ts.html)
