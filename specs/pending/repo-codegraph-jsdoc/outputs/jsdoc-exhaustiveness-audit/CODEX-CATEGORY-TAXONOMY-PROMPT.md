# Codex Task: Definitive `@category` Taxonomy for TypeScript Knowledge Graphs

## Objective

Produce a TypeScript file (`ts-category-taxonomy.ts`) containing a closed,
discriminated-union taxonomy of **code categories** that can classify any
code element in a production TypeScript monorepo. This taxonomy becomes the
set of allowed values for `@category` JSDoc tags in our knowledge graph pipeline.

This is NOT an "authoritative" taxonomy in the mathematical sense — no proof of
minimality or completeness is possible for something this subjective. What we
need is an **engineering-informed, practically useful, closed set of terms**
that:

1. Covers the vast majority of code patterns in production TypeScript
2. Is grounded in established architectural theory (not arbitrary)
3. Is deterministically assignable when possible via AST signals
4. Enables useful graph queries (the whole point)
5. Is small enough for developers to internalize (8–15 categories)

---

## Reference Files (same directory)

These files are your primary sources. Read them thoroughly before starting.

| File | What it contains | How to use it |
|------|-----------------|---------------|
| `./jsdoc-tags-database.ts` | Complete JSDoc/TSDoc tag metadata database (~80 entries) with `ASTDerivability`, `ApplicableTo`, `TagKind`, and `Specification` types. The `@category` tag entry already exists with `specifications: ["typedoc"]` and `astDerivable: "none"`. | Study the type modeling patterns (`_tag` discriminant, `readonly` arrays, etc.). The `TSCategory` type you produce must be stylistically consistent with `JSDocTagDefinition`. The `ApplicableTo` union shows what AST node kinds exist — your categories must be able to attach to all of them. |
| `./CODEX-AUDIT-REPORT.md` | Exhaustiveness audit of the tags database against TypeScript compiler sources. | Section 6 (`ApplicableTo ↔ SyntaxKind Mapping`) is critical — it maps every `ApplicableTo` value to concrete `SyntaxKind` nodes. Your categories must cover code elements at ALL of these syntax kinds, not just the obvious ones (classes, functions). Section 5 (`AST Derivability Validation`) shows which tags are truly derivable — use the same rigor when defining `astSignals`. |
| `./typescript-syntaxkind-enum.ts` | Full `SyntaxKind` enum from `typescript.d.ts` (359 entries). | Reference for concrete syntax kinds when defining `typicalSyntaxKinds` per category. Key ranges: declarations (263-268), statements (244-260), expressions (210-239), JSDoc nodes (310-352). |
| `./typescript-hasjsdoc-type.ts` | The `HasJSDoc` union — compiler's authoritative list of what AST nodes can host JSDoc. | Every node in this union can potentially carry a `@category` tag. Your taxonomy must be able to classify code at ALL of these nodes, even unusual ones like `BinaryExpression`, `Block`, and statement nodes. |
| `./CODEX-AUDIT-PROMPT.md` | The audit task specification (for context on project methodology). | Shows the rigor level expected. Your taxonomy should be auditable against the same standards. |

---

## Research Plan

### Phase 1: Survey existing classification systems

Research and synthesize classification approaches from these sources:

**1a. TypeScript's own structural categories**
- Analyze `ts.SyntaxKind` groups: declarations, statements, expressions,
  types, JSDoc nodes, tokens
- Map these to semantic roles: what IS a `VariableStatement` doing in a
  codebase? What IS a `ClassDeclaration` for?
- Note: SyntaxKind is structural, not semantic — `FunctionDeclaration`
  tells you "this is a function" but not "this function does validation"

**1b. Established architectural patterns**
- Clean Architecture (Robert C. Martin, 2012): Entities → Use Cases →
  Interface Adapters → Frameworks & Drivers
- Hexagonal Architecture (Alistair Cockburn, 2005): Ports ↔ Adapters
- Onion Architecture (Jeffrey Palermo, 2008): Domain Core → Domain
  Services → Application Services → Infrastructure
- Domain-Driven Design: Entities, Value Objects, Aggregates, Domain
  Services, Application Services, Infrastructure Services, Repositories
- Identify the **convergent categories** that appear across all patterns

**1c. Moggi's categorical semantics of computation**
- Identity monad → pure computation
- Maybe/Option → partial computation
- Either → error handling / validation
- State → stateful computation
- Reader → environment/dependency injection
- Writer → logging / accumulation
- IO → side effects
- Continuation → control flow
- Map these to TypeScript code patterns

**1d. Real-world TypeScript project organization**
- How Effect-TS organizes modules: `@effect/platform` (IO/side effects),
  `@effect/schema` (validation/transformation), `@effect/io`
- How Zod, tRPC, Drizzle, Prisma structure their code
- How TypeDoc's `@category` and `@group` tags are actually used in
  popular open-source TypeScript projects
- How Next.js/Remix/Astro separate concerns: pages/routes (presentation),
  API handlers (use cases), data fetching (data access), middleware
  (infrastructure), validation schemas, utility functions

**1e. How existing code graph tools categorize**
- FalkorDB Code Graph's node labels
- Joern Code Property Graph node types
- Code-Graph-RAG's entity classification

### Phase 2: Synthesize candidate taxonomy

Merge Phase 1 findings into 8–15 candidate categories. For each:

1. Write a precise one-sentence `definition`
2. Write `classificationGuidance` as if prompting an LLM classifier
3. Provide 2+ concrete TypeScript `examples` (actual code patterns)
4. Provide 1+ `counterExamples` (what it is NOT — the disambiguation cases)
5. Define `astSignals` with detection methods and confidence weights
6. Map to architectural layers, Effect/monad analogs, purity
7. Define dependency profile and documentation priority

### Phase 3: Validate coverage

Test the taxonomy against these scenarios:

- Can every `ApplicableTo` value (from `jsdoc-tags-database.ts`) be
  classified into at least one category?
- Can every `HasJSDoc` member (from `typescript-hasjsdoc-type.ts`) be
  meaningfully categorized?
- Take 5 real TypeScript files from different domains (API handler,
  database model, validation schema, React component, utility module)
  and classify every exported symbol. Are there gaps?
- Are there any categories with >50% overlap? If so, merge them.
- Are there any categories that would contain <5% of symbols in a
  typical codebase? If so, consider merging into adjacent categories.

### Phase 4: Refine and produce output

- Finalize the taxonomy
- Produce the TypeScript file with full type definitions and data
- Include utility functions for lookup and filtering
- Document design decisions and tradeoffs

---

## Output Type Definitions

The output file must export these types and use them consistently:

```typescript
/**
 * Deterministic heuristic for auto-classifying code elements
 * from the AST without LLM inference.
 */
interface ASTSignal {
  /** What to look for in the AST (human-readable) */
  readonly signal: string;
  /**
   * How confident this signal alone is (0.0–1.0).
   * When combined signals exceed 0.85, classification
   * can skip LLM inference entirely.
   */
  readonly confidence: number;
  /**
   * How to detect this programmatically via ts-morph-morph.
   * Should be specific enough to translate directly to code.
   * e.g., "node.getReturnType().getText().startsWith('Effect<')"
   */
  readonly detection: string;
}

/**
 * Architectural layer mappings across established patterns.
 * Enables cross-framework queries like "show me all code in the
 * domain core that depends on infrastructure".
 */
type ArchitecturalLayer =
  | "domain-entity"       // Clean: Entities / DDD: Entities & Value Objects
  | "use-case"            // Clean: Use Cases / DDD: Application Services
  | "interface-adapter"   // Clean: Interface Adapters / Hex: Ports
  | "framework-driver"    // Clean: Frameworks & Drivers / Hex: Adapters
  | "port"                // Hexagonal: Port interfaces
  | "adapter"             // Hexagonal: Adapter implementations
  | "core"                // Onion: Domain Core
  | "cross-cutting";      // Logging, auth, caching — spans all layers

/**
 * Dependency direction profile. Used to VALIDATE classifications:
 * if something classified as DomainLogic (high fan-in, low fan-out)
 * actually has high fan-out, that's a misclassification signal.
 */
interface DependencyProfile {
  /** How many other categories typically depend on this one */
  readonly typicalFanIn: "low" | "medium" | "high";
  /** How many other categories this one typically depends on */
  readonly typicalFanOut: "low" | "medium" | "high";
}

/**
 * A single member of the closed taxonomy used to classify
 * TypeScript code elements in the knowledge graph.
 *
 * Design principles:
 *   - Every field must serve automated classification,
 *     graph query enrichment, or LLM grounding.
 *   - `astSignals` enables deterministic classification
 *     when signals are strong enough (no LLM needed).
 *   - `classificationGuidance` IS the LLM prompt context
 *     when deterministic signals are insufficient.
 *   - `counterExamples` encode boundary decisions that
 *     prevent the most common misclassifications.
 */
interface TSCategory {
  /**
   * Discriminant — the canonical category identifier.
   * PascalCase, no spaces. This is the value that appears
   * in `@category PascalCaseName` JSDoc tags.
   */
  readonly _tag: string;

  /**
   * One-sentence definition precise enough to resolve ambiguity
   * between adjacent categories.
   * Rule: if two people read this definition, they should agree
   * on classification >90% of the time.
   */
  readonly definition: string;

  /**
   * Extended classification guidance written FOR an LLM classifier.
   * This text is injected directly into the system prompt when the
   * pipeline needs to infer @category for a code element.
   * Should address:
   *   - What belongs here
   *   - What does NOT belong here (and where it goes instead)
   *   - Edge cases and how to resolve them
   */
  readonly classificationGuidance: string;

  /**
   * Concrete TypeScript code patterns that exemplify this category.
   * At least one required. Should be realistic production patterns,
   * not toy examples.
   */
  readonly examples: readonly [string, ...string[]];

  /**
   * Patterns that SEEM like this category but belong elsewhere.
   * Critical for disambiguation — these encode the hard boundary
   * decisions. Each should note which category it actually belongs to.
   */
  readonly counterExamples: readonly string[];

  /**
   * Which ts-morph.SyntaxKind values commonly produce elements in this
   * category. Not exclusive (a FunctionDeclaration can be in ANY
   * category), but indicates the typical structural forms.
   * Use SyntaxKind names, not numbers.
   */
  readonly typicalSyntaxKinds: readonly string[];

  /**
   * Deterministic heuristics for auto-classification from the AST.
   * Each signal has a confidence weight. When combined signals
   * exceed a threshold (recommend 0.85), classification is
   * deterministic (Layer 1/2) — no LLM inference needed.
   *
   * Every category MUST have at least one signal with
   * confidence >= 0.7.
   */
  readonly astSignals: readonly ASTSignal[];

  /**
   * The Moggi monad / Effect-TS analog that corresponds to the
   * computational nature of code in this category.
   * `null` when no clean mapping exists.
   * Used for theoretical grounding and Effect-TS integration.
   */
  readonly effectAnalog: string | null;

  /**
   * Which architectural layers this category maps to.
   * Enables cross-framework graph queries.
   */
  readonly architecturalLayers: readonly ArchitecturalLayer[];

  /**
   * Whether code in this category is typically pure (no side
   * effects, referentially transparent) or effectful.
   * - "pure": no observable side effects
   * - "effectful": performs IO, mutations, or other effects
   * - "mixed": contains both pure and effectful patterns
   */
  readonly purity: "pure" | "effectful" | "mixed";

  /**
   * Categories that are semantically adjacent — used for graph
   * edge weighting and "did you mean?" suggestions when
   * classification is ambiguous.
   * Reference by _tag value.
   */
  readonly adjacentCategories: readonly string[];

  /**
   * Import path patterns (glob-style) that are strong signals
   * for this category.
   * e.g., "drizzle-orm*" → DataAccess
   * e.g., "express*" or "hono*" → Presentation
   * e.g., "@effect/schema*" → Validation
   * Empty array if no reliable import signals exist.
   */
  readonly typicalImportPatterns: readonly string[];

  /**
   * Typical dependency direction. Used to VALIDATE
   * classifications — a mismatch suggests misclassification.
   */
  readonly dependencyProfile: DependencyProfile;

  /**
   * Rank for topological documentation ordering (à la RepoAgent).
   * Lower number = document first (fewer dependencies).
   * Categories with low fan-out get documented before categories
   * that depend on them.
   */
  readonly documentationPriority: number;
}
```

---

## Constraints

1. **Target 8–15 top-level categories.** Fewer than 8 won't capture
   meaningful distinctions. More than 15 becomes unwieldy for developers
   to remember and consistently apply.

2. **Every category must have at least one `astSignal` with
   confidence >= 0.7.** If you can't define a strong signal, the
   category may be too abstract to be useful.

3. **The union must be exhaustive.** Include an `Uncategorized` escape
   hatch as the LAST category for code that genuinely doesn't fit.
   But it should be the last resort — if >10% of a typical codebase
   would land in `Uncategorized`, the taxonomy has gaps.

4. **No deep hierarchies.** This is a flat enum, not a tree. If you
   find yourself wanting sub-categories, reconsider whether the parent
   category is too broad or the sub-categories are too granular.

5. **Bias toward queryability.** A category is good if it enables
   queries like:
   - "Find all `Validation` functions called by `Presentation` layer code"
   - "Show `DataAccess` code that doesn't go through a `UseCase`"
   - "List `DomainLogic` functions that have `SideEffect` dependencies"
   - "Find `Configuration` that differs between environments"

6. **Use PascalCase for `_tag` values** (e.g., `"DataAccess"`, not
   `"data-access"`). These appear verbatim in `@category DataAccess`
   JSDoc tags.

7. **Detection methods in `astSignals` must reference ts-morph API.**
   Be specific: `node.getImportDeclarations().some(i => i.getModuleSpecifier().getText().includes('drizzle'))`
   not just "check imports."

8. **`classificationGuidance` is a prompt.** Write it as if you're
   instructing an LLM. Be direct, specific, and address ambiguities
   explicitly.

9. **Style consistency with `jsdoc-tags-database.ts`.** Use the same
   patterns: `readonly` arrays, `as const` assertions where applicable,
   JSDoc comments on exports, Effect-style `_tag` discriminants.

---

## Expected Output Structure

```typescript
// ts-morph-category-taxonomy.ts-morph

/**
 * @module TSCategoryTaxonomy
 * @description Closed taxonomy for classifying TypeScript code elements
 * in a knowledge graph pipeline. Designed as a discriminated union via `_tag`.
 *
 * Design grounding:
 *   - Architectural convergence across Clean/Hex/Onion/DDD patterns
 *   - Moggi's categorical semantics of computation (monad categories)
 *   - Empirical analysis of production TypeScript monorepo organization
 *   - Optimized for graph query utility, not taxonomic purity
 *
 * @since 2025-02-28
 */

// ... type definitions (ASTSignal, ArchitecturalLayer, etc.) ...

export const CATEGORY_TAXONOMY: ReadonlyArray<TSCategory> = [
  // ... 8-15 category entries ...
] as const;

/** All valid category tag values */
export type CategoryTag = typeof CATEGORY_TAXONOMY[number]["_tag"];

/** Lookup a category by _tag */
export function getCategory(tag: string): TSCategory | undefined { ... }

/** Get categories by purity classification */
export function getCategoriesByPurity(
  purity: TSCategory["purity"]
): ReadonlyArray<TSCategory> { ... }

/** Get categories by architectural layer */
export function getCategoriesByArchLayer(
  layer: ArchitecturalLayer
): ReadonlyArray<TSCategory> { ... }

/** Get categories by Effect analog */
export function getCategoriesByEffectAnalog(
  analog: string
): ReadonlyArray<TSCategory> { ... }

/**
 * Get categories whose astSignals could match a given code element.
 * Returns candidates sorted by combined signal confidence.
 */
export function getCandidateCategories(
  signals: ReadonlyArray<{ category: string; confidence: number }>
): ReadonlyArray<{ category: TSCategory; combinedConfidence: number }> { ... }
```

---

## Design Decisions to Document

In a comment block at the end of the file, document:

1. **Why these categories and not others** — what was considered and rejected
2. **Known overlaps** — where two categories are close and how to resolve them
3. **Known gaps** — code patterns that don't fit cleanly (and why that's OK)
4. **Relationship to Effect-TS** — how Effect's type system changes
   classification (e.g., `@throws` becoming deterministic)
5. **Evolution path** — how to add new categories without breaking existing
   classifications (the schema migration story)

---

## Theoretical Foundation (for reference)

The research underpinning this taxonomy draws from:

- **Moggi's "Notions of Computation and Monads" (1991)**: Distinct monads
  correspond to distinct kinds of computation, providing a mathematical
  basis for "what kinds of code exist."
- **Plotkin & Power (2002)**: Monads can be characterized by algebraic
  operations, establishing bidirectional taxonomy.
- **Spivak & Kent's "Ologs" (PLoS ONE, 2012)**: Category theory framework
  for knowledge representation where objects are types and morphisms are
  functional relationships — directly applicable to code graph structure.
- **Fong & Spivak's "Seven Sketches in Compositionality" (2019)**: Galois
  connections model the mapping from observable code properties to
  categories they imply.
- **Architectural convergence**: Clean Architecture, Hexagonal Architecture,
  Onion Architecture, and DDD independently converge on similar layer
  separations, suggesting these categories are natural rather than arbitrary.
- **RepoAgent (EMNLP 2024)**: Validates "AST-first, LLM-second" pipeline
  where deterministic structure analysis provides the foundation for
  LLM enrichment.
- **FORGE (IEEE/ACM 2026)**: Deterministic AST analysis corrected 77% of
  LLM hallucinations in code generation tasks.

The key insight: while no mathematical proof of a "minimal complete set"
of code categories exists, the convergence across independently developed
architectural philosophies and categorical semantics strongly suggests
that 8–12 natural categories cover the overwhelming majority of production
TypeScript code. The taxonomy is not proven complete — it is empirically
grounded and pragmatically sufficient.
