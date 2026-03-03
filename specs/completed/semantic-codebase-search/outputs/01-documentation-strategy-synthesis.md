# Documentation Strategy for Annotation-Driven Semantic Search

**Date:** 2026-02-19
**Prerequisite for:** Strategy B (Custom Hybrid MCP Server)
**Core Insight:** Enforce high-quality JSDoc + Effect annotations → extract deterministically via ts-morph → embed natural language metadata → get better search than LLM-translated code at zero indexing cost

---

## Research Inputs

| Document | What It Tells Us |
|----------|-----------------|
| [jsdoc-strategy-research.md](./jsdoc-strategy-research.md) | 70+ JSDoc tags cataloged with semantic search value ratings; file-level doc patterns; embedding-friendly description writing guide; custom tag definitions |
| [docgen-enforcement-research.md](./docgen-enforcement-research.md) | eslint-plugin-jsdoc rules; git hook enforcement (husky/lefthook); TypeDoc JSON output for structured extraction; gradual adoption strategies |
| [docgen-source-analysis.md](./docgen-source-analysis.md) | @effect/docgen uses ts-morph + doctrine; Domain model extracts name/description/since/category/examples/signature; 6 enforcement flags; exported Parser APIs |
| [current-docs-patterns.md](./current-docs-patterns.md) | Only 4/8 files have @module; almost no @example tags; zero @see cross-references; schema fields lack .annotateKey(); categories well-used |

---

## The Annotation-Driven Indexing Architecture

```
Source Code (with enforced JSDoc + Schema annotations)
        │
        ▼
┌─────────────────────────┐
│  ts-morph AST Parser    │  ← Deterministic, fast, zero LLM cost
│  + doctrine JSDoc parse │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────────────┐
│  Structured Extraction (per symbol)             │
│                                                 │
│  • name, kind (schema/service/layer/error/fn)   │
│  • description (from JSDoc)                     │
│  • title (from Schema .annotate())              │
│  • identifier (from Schema .annotate())         │
│  • category (from @category)                    │
│  • examples (from @example)                     │
│  • cross-refs (from @see / {@link})             │
│  • signature (TypeScript type signature)        │
│  • module description (from @module JSDoc)      │
│  • field descriptions (from .annotateKey())     │
│  • error metadata (from TaggedErrorClass)       │
│  • dependencies (from type params R channel)    │
└───────────┬─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│  Embedding Unit          │  ← ~150-300 tokens of pure natural language
│  (description + title +  │
│   category + examples +  │
│   cross-refs + fields)   │
└───────────┬──────────────┘
            │
            ▼
┌─────────────────────────┐
│  Nomic CodeRankEmbed    │  ← Local, 137M params, Apache-2.0
│  or Ollama nomic-embed  │
└───────────┬──────────────┘
            │
            ▼
┌─────────────────────────┐
│  LanceDB Vector Store   │  ← Serverless, TypeScript-native
│  + BM25 keyword index   │
└─────────────────────────┘
```

**Why this beats LLM translation:**
- **Zero cost** during indexing (no API calls)
- **Deterministic** (same code → same extraction every time)
- **Higher quality** (human-authored descriptions understand domain intent)
- **Always fresh** (annotations live with code, change together)
- **Virtuous cycle** (better docs → better search → motivation for better docs)

---

## Documentation Standards Required

### Tier 1: MUST HAVE (Enforced by lint + docgen)

These are required for the indexing pipeline to work at all.

#### Every File: @module JSDoc Header
```typescript
/**
 * Filesystem utility service for common monorepo operations.
 *
 * Provides effectful wrappers around glob matching, JSON file I/O,
 * path existence checks, and file/directory type queries.
 *
 * @remarks
 * This service abstracts platform-specific filesystem operations behind
 * an Effect service interface, enabling testability via Layer mocking.
 *
 * @since 0.0.0
 * @module
 */
```

**What this gives search:** File-level description for "what does this module do?" queries.

#### Every Export: Description + @since + @category
```typescript
/**
 * Resolves workspace dependency ordering via topological sort.
 *
 * Given a workspace dependency graph, produces a linear ordering where
 * every package appears after all of its dependencies. Detects and
 * reports cyclic dependencies.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const topologicalSort = Effect.fn(function* (...) { ... })
```

**What this gives search:** Symbol-level description for "find the function that sorts dependencies" queries.

#### Every Schema: .annotate() with identifier + title + description
```typescript
export const PackageJson = S.Struct({
  name: PackageName,
  version: S.String.annotateKey({
    description: "Semantic version string following semver conventions",
    messageMissingKey: "Package must have a version field"
  }),
  // ... fields with annotateKey
}).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/PackageJson",
  title: "Package JSON",
  description: "Standard package.json structure with workspace-aware dependency resolution and catalog support",
  examples: [{ name: "@beep/repo-utils", version: "0.1.0" }]
})
```

**What this gives search:** Schema-level + field-level descriptions, examples as context.

#### Every Error: TaggedErrorClass with title + description
Already enforced — all 3 errors follow the pattern.

### Tier 2: SHOULD HAVE (Enforced gradually)

These significantly improve search quality but can be adopted incrementally.

#### @example on complex functions
```typescript
/**
 * Resolves workspace dependency ordering via topological sort.
 *
 * @example
 * ```ts
 * // Sort packages by dependency order
 * const sorted = yield* topologicalSort(workspaceGraph)
 * // Returns: ["@beep/core", "@beep/utils", "@beep/cli"]
 * ```
 *
 * @since 0.0.0
 * @category DomainLogic
 */
```

**What this gives search:** Usage context — "how do I sort packages?" finds this via the example text.

#### @see cross-references
```typescript
/**
 * Workspace dependency graph schema.
 *
 * @see {@link PackageJson} - Individual package schema
 * @see {@link topologicalSort} - Sort packages by dependency order
 * @see {@link CyclicDependencyError} - Thrown when cycles detected
 *
 * @since 0.0.0
 * @category Validation
 */
```

**What this gives search:** Explicit graph edges between related code. When someone finds WorkspaceDeps, they also discover topologicalSort and CyclicDependencyError.

#### .annotateKey() on schema fields
```typescript
export const PackageJson = S.Struct({
  name: PackageName.annotateKey({
    description: "NPM package name, scoped with @beep/ prefix",
    messageMissingKey: "Package must have a name"
  }),
  dependencies: S.optional(S.Record({ key: S.String, value: S.String })).annotateKey({
    description: "Runtime dependencies, supports catalog: protocol for workspace catalog references"
  }),
})
```

**What this gives search:** Field-level queries — "which schema has a dependencies field with catalog support?"

### Tier 3: NICE TO HAVE (For advanced search)

#### @remarks for design rationale
```typescript
/**
 * Layer providing FsUtils service with platform filesystem access.
 *
 * @remarks
 * This layer requires NodeFileSystem and NodePath from @effect/platform-node.
 * In tests, use `Layer.mock(FsUtils)({...})` to provide a mock implementation.
 * The service methods wrap raw FileSystem operations with domain-specific
 * error handling, converting SystemError to DomainError.
 *
 * @since 0.0.0
 * @category Configuration
 */
```

**What this gives search:** "How do I test FsUtils?" finds the mocking guidance in @remarks.

#### Custom tags for Effect-specific metadata
```typescript
/**
 * @provides FsUtils
 * @requires FileSystem, Path
 * @errors DomainError, NoSuchFileError
 */
```

**What this gives search:** Machine-readable dependency/error graph edges without parsing type signatures.

---

## Enforcement Strategy

### Phase 1: Lint Rules (Immediate)

**eslint-plugin-jsdoc** configuration:

```jsonc
{
  "plugins": ["jsdoc"],
  "rules": {
    // MUST HAVE — enforce on all exports
    "jsdoc/require-jsdoc": ["error", {
      "require": {
        "FunctionDeclaration": true,
        "ClassDeclaration": true,
        "MethodDefinition": true
      },
      "publicOnly": true
    }],
    "jsdoc/require-description": "error",
    "jsdoc/require-param-description": "warn",
    "jsdoc/require-returns-description": "warn",
    "jsdoc/check-tag-names": ["error", {
      "definedTags": ["module", "since", "category", "remarks", "see",
                      "provides", "requires", "errors"]
    }],

    // Quality checks
    "jsdoc/no-blank-blocks": "error",
    "jsdoc/informative-docs": "warn",  // Flags useless descriptions like "The name"
    "jsdoc/tag-lines": ["error", "any", { "startLines": 1 }]
  }
}
```

### Phase 2: Docgen Enforcement (This Sprint)

**docgen.json** updates for both packages:
```json
{
  "enforceDescriptions": true,
  "enforceVersion": true,
  "enforceExamples": false
}
```

`enforceExamples: true` deferred — too disruptive to adopt immediately. Target for Phase 3.

### Phase 3: Git Hook Enforcement

**lefthook.yml** (monorepo-optimized, parallel execution):
```yaml
pre-commit:
  parallel: true
  commands:
    jsdoc-lint:
      glob: "**/*.{ts,tsx}"
      exclude: "**/*.test.*|**/*.tst.*|.repos/**"
      run: npx eslint --rule 'jsdoc/require-jsdoc: error' {staged_files}

pre-push:
  commands:
    docgen-check:
      run: bun run docgen
      fail_text: "Documentation generation failed. Fix JSDoc issues before pushing."
```

### Phase 4: @example Enforcement (Later)

Once existing code has descriptions, incrementally require @example on:
1. Functions with `@category DomainLogic` (complex logic needs examples)
2. Schema constructors (show what valid data looks like)
3. Service methods (show common usage patterns)

---

## Extraction Pipeline (What We Build)

### Input: Source file with enforced JSDoc + annotations

### Output: Structured JSON per symbol

```typescript
interface IndexedSymbol {
  // Identity
  name: string
  kind: "schema" | "service" | "layer" | "error" | "function" | "type" | "constant" | "command"
  filePath: string
  identifier?: string       // from Schema .annotate() or TaggedErrorClass

  // Natural language (embedding targets)
  title?: string            // from .annotate() title
  description: string       // from JSDoc description
  remarks?: string          // from @remarks
  moduleDescription?: string // from @module file header
  examples: string[]        // from @example blocks
  fieldDescriptions?: Record<string, string> // from .annotateKey()

  // Taxonomy
  category: string          // from @category
  package: string           // e.g., "@beep/repo-utils"

  // Relationships (graph edges)
  references: string[]      // from @see tags
  provides?: string[]       // from @provides or type analysis
  requires?: string[]       // from @requires or R channel analysis
  errors?: string[]         // from @errors or error channel analysis

  // Code context
  signature: string         // TypeScript type signature
  since: string             // version string
  deprecated: boolean
}
```

### Embedding unit construction:

```typescript
function buildEmbeddingText(sym: IndexedSymbol): string {
  const parts: string[] = []

  // Title and description are primary
  if (sym.title) parts.push(sym.title)
  parts.push(sym.description)

  // Remarks add design context
  if (sym.remarks) parts.push(sym.remarks)

  // Module context for scoping
  if (sym.moduleDescription) parts.push(`Module: ${sym.moduleDescription}`)

  // Examples are rich natural language
  for (const ex of sym.examples) {
    // Extract just the comments from examples (natural language)
    const comments = ex.match(/\/\/\s*(.+)/g)?.join(". ") ?? ""
    if (comments) parts.push(comments)
  }

  // Field descriptions for validation schemas
  if (sym.fieldDescriptions) {
    const fields = Object.entries(sym.fieldDescriptions)
      .map(([k, v]) => `${k}: ${v}`).join(". ")
    parts.push(`Fields: ${fields}`)
  }

  // Cross-references
  if (sym.references.length > 0) {
    parts.push(`Related: ${sym.references.join(", ")}`)
  }

  return parts.join(". ")
}
```

**Result:** A ~150-400 token pure natural language string per symbol, built entirely from enforced annotations — no LLM needed.

---

## Docgen Extension vs Custom Extractor

### Option A: Extend @effect/docgen

**Pros:** Already parses ts-morph + doctrine, has Domain model, handles re-exports
**Cons:** No plugin system, no JSON output, hardcoded markdown, would need forking

**Verdict:** Use docgen's Parser APIs as a starting point but build a separate extraction tool. Docgen's `Parser.parseFiles()` returns `Module[]` — we can consume that and add Effect-specific extraction on top.

### Option B: Custom ts-morph extractor (Recommended)

**Why:** We need things docgen doesn't extract:
- `.annotate()` call argument objects (Schema metadata)
- `TaggedErrorClass` constructor arguments (error metadata)
- `.annotateKey()` per-field metadata
- Type parameter analysis for `R` channel (service dependencies)
- `@see`/`@link` parsing into structured references

**Architecture:**
```typescript
// Use docgen for JSDoc extraction
import { Parser } from "@effect/docgen"
const modules = yield* Parser.parseFiles(files)

// Add Effect-specific extraction on top
for (const mod of modules) {
  // Extract Schema .annotate() metadata from AST
  // Extract TaggedErrorClass metadata
  // Extract .annotateKey() field descriptions
  // Parse @see/@link into structured references
  // Analyze R channel for service dependencies
}
```

**This gives us the best of both worlds:** docgen handles the well-trodden JSDoc parsing path, our custom code handles Effect-specific patterns.

---

## Gap Analysis: What Needs to Change in the Codebase

| Gap | Current State | Target State | Effort |
|-----|--------------|--------------|--------|
| @module on all files | 4/8 files | 100% of source files | Low (add header comments) |
| @example tags | Only Graph.ts | All DomainLogic + Validation + UseCase | Medium |
| @see cross-references | Zero | Key relationships documented | Medium |
| .annotateKey() on schema fields | Sparse | All fields with descriptions | Medium |
| @remarks on services/layers | None | Design rationale documented | Low-Medium |
| eslint-plugin-jsdoc | Not configured | Full rule set active | Low |
| docgen enforceDescriptions | false | true | Immediate |
| Git hook enforcement | None | lefthook pre-commit + pre-push | Low |

**Estimated total effort to bring existing code to standard:** 2-3 days
**Estimated ongoing cost per new file:** 5-10 minutes of documentation writing

---

## Summary

The documentation-first approach to semantic search is:

1. **Cheaper** than LLM translation (zero indexing cost)
2. **Higher quality** (human-authored, domain-aware descriptions)
3. **Self-reinforcing** (better docs → better search → motivation for better docs)
4. **Deterministic** (ts-morph extraction, no LLM variability)
5. **Already 60% there** (Schema annotations + TaggedErrorClass metadata exist, JSDoc partially enforced)

The prerequisite work is: enforce documentation standards repo-wide, then build the extraction + embedding pipeline on top.
