# TSCategory Taxonomy — Refinement Pass

## Objective

Apply targeted refinements to `ts-category-taxonomy.ts` based on a peer review of the 12-category taxonomy. All changes are surgical — preserve existing `_tag` values, category count, overall architecture, and all utility functions. Do not add or remove categories.

---

## Source File

`ts-category-taxonomy.ts` — the closed taxonomy for classifying TypeScript code elements in the knowledge graph pipeline.

## Sibling Context (read-only reference)

- `jsdoc-tags-database.ts` — `ApplicableTo` type definition and tag database
- `hasjsdoc-to-applicableto-map.ts` — HasJSDoc-to-ApplicableTo mapping

---

## Changes Required

### 1. DomainModel — Remove or rework the first AST signal

**Problem:** The first signal ("Type-only domain declarations without effectful method signatures") has a logic flaw. The negation of effectful method signatures is AND-ed with the outer `(isInterface || isTypeAlias || isEnum)` check, meaning enum declarations pass regardless of what the file imports. Its confidence (0.6) stacks with the second signal (0.7) via noisy-OR, producing inflated combined confidence from overlapping structural evidence.

**Action:** Remove the first signal entirely. The second signal ("File imports avoid framework and IO adapters" at 0.7) and third signal ("Branded or opaque type pattern" at 0.8) already provide sufficient coverage. Removing the first signal eliminates a false-positive source without reducing recall — any file that would have matched signal 1 will still match signal 2 if it genuinely has no framework imports.

### 2. DomainLogic — Decompose the third AST signal

**Problem:** The third signal ("Parameters or return type reference domain-typed symbols") is a single monolithic detection string checking parameters, return types, symbol declarations, and file paths in one expression. This hurts debuggability and makes confidence attribution opaque.

**Action:** Split into two independent signals:

```typescript
{
  signal: "Parameters reference domain-typed symbols (branded, enum, or domain-path types)",
  confidence: 0.65,
  detection:
    "Node.isFunctionDeclaration(node) && node.getParameters().some(p => /Id|Status|Amount|Price|Currency|Score/.test(p.getType().getText()) || p.getType().getSymbol()?.getDeclarations()?.some(d => /domain|model|entities/.test(d.getSourceFile().getFilePath())))",
},
{
  signal: "Return type references domain-typed symbols (branded, enum, or domain-path types)",
  confidence: 0.65,
  detection:
    "Node.isFunctionDeclaration(node) && (/Id|Status|Amount|Price|Currency|Score/.test(node.getReturnType().getText()) || node.getReturnType().getSymbol()?.getDeclarations()?.some(d => /domain|model|entities/.test(d.getSourceFile().getFilePath())))",
},
```

When both fire, noisy-OR yields ~0.88 combined confidence — close to the original 0.7 single-signal behavior but with per-signal observability.

### 3. Presentation — Harden the high-confidence signal's export name extraction

**Problem:** The 0.88-confidence signal uses `.getExportedDeclarations().keys().next().value` which silently returns `undefined` when no exports exist. The regex test on `undefined` fails safely but is confusing to readers.

**Action:** Replace the fragile iterator chain with an explicit variable and guard:

```typescript
{
  signal: "Framework imports AND component or route handler exports",
  confidence: 0.88,
  detection:
    "node.getSourceFile().getImportDeclarations().some((decl) => /react|next|remix|astro|hono|express|fastify/.test(decl.getModuleSpecifierValue())) && (() => { const sf = node.getSourceFile(); const hasJsx = sf.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 || sf.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0; const exportNames = Array.from(sf.getExportedDeclarations().keys()); const hasRouteExport = exportNames.some(name => /^(GET|POST|PUT|DELETE|PATCH|default|Page|Layout)$/.test(name)); return hasJsx || hasRouteExport; })()",
},
```

This is self-documenting and avoids the `undefined` ambiguity.

### 4. Add rationale comment to `CATEGORY_PRECEDENCE`

**Problem:** The ordering of `CATEGORY_PRECEDENCE` has no documented rationale. Someone maintaining this in six months won't know the principle behind the ordering.

**Action:** Add a block comment above the `CATEGORY_PRECEDENCE` declaration:

```typescript
/**
 * Deterministic precedence for external classifier conflict resolution.
 *
 * Ordering rationale — most-specific signals win:
 *   1. Library-specific imports (Validation, DataAccess, Integration) —
 *      schema/ORM/SDK imports are near-unambiguous signals.
 *   2. Structural patterns (Presentation, UseCase) —
 *      framework imports + structural shape are strong but broader.
 *   3. Naming and convention patterns (PortContract, Configuration, CrossCutting) —
 *      rely on naming heuristics which are project-dependent.
 *   4. Residual categories (DomainModel, DomainLogic, Utility) —
 *      identified by absence of other signals rather than presence.
 *   5. Uncategorized — last resort.
 *
 * This policy is intentionally separate from `getCandidateCategories`,
 * which preserves canonical sorting by confidence and `_tag`.
 *
 * @since 2026-03-01
 * @category Configuration
 */
```

### 5. Add signal independence disclaimer to `combineSignalConfidences`

**Problem:** The noisy-OR formula assumes signal independence. Correlated signals (e.g., two signals both triggered by the same `drizzle-orm` import) over-count evidence. This is a known limitation but undocumented in the code.

**Action:** Add a JSDoc note to the `combineSignalConfidences` function:

```typescript
/**
 * Combine multiple signal confidences using the noisy-OR formula:
 *   1 - Π(1 - c_i)
 *
 * Assumes signal independence. Correlated signals (e.g., two signals
 * both triggered by the same import declaration) will produce inflated
 * combined confidence. Callers should prefer structurally independent
 * detection criteria when designing AST signals.
 *
 * @since 2026-03-01
 * @category Utility
 */
```

### 6. Add `TransportContract` forward-declaration to DomainModel's adjacentCategories

**Problem:** Design decision #6 acknowledges that DTOs and wire types get classified as DomainModel, and suggests a future `TransportContract` category. But adjacentCategories doesn't reference this future intent, so the graph schema won't be ready for the addition.

**Action:** Add `"TransportContract"` to DomainModel's `adjacentCategories` array. This is a forward-declaration — the category doesn't exist yet, but the adjacency edge signals intent. Add a comment:

```typescript
adjacentCategories: [
  "DomainLogic",
  "Validation",
  "Utility",
  "TransportContract", // Forward-declaration: see design decision #6
],
```

Note: `TransportContract` will not resolve via `getCategory()` until the category is added. This is intentional — it documents schema evolution intent without breaking current behavior.

---

## Constraints

- Do NOT add or remove categories from `CATEGORY_TAXONOMY`
- Do NOT change any `_tag` values
- Do NOT modify `CATEGORY_PRECEDENCE` ordering (only add the rationale comment)
- Do NOT change utility function signatures or behavior
- Do NOT touch `DETERMINISTIC_CLASSIFICATION_THRESHOLD`, `UNCATEGORIZED_GUARDRAIL_THRESHOLD`, `TESTING_FILE_PATTERNS`, `TESTING_IMPORT_PATTERNS`, `CONTEXT_FALLBACK_POLICY`, or `APPLICABLE_TO_CATEGORY_ROUTING`
- Preserve all existing JSDoc `@since` and `@category` annotations
- Preserve the design decisions comment block at the bottom (no modifications needed — the changes above are consistent with its documented principles)

## Validation

After applying changes, verify:
1. `CATEGORY_TAXONOMY.length` is still 12
2. All `CategoryTag` values are unchanged
3. Every category still has at least one AST signal with confidence >= 0.7
4. `combineSignalConfidences` behavior is unchanged (only JSDoc added)
5. `getCandidateCategories` sort behavior is unchanged
6. TypeScript compiles without errors
