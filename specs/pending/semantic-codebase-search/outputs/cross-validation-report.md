# Cross-Validation Report — P2 Design Consistency

> P3 Output — Verifies all 7 P2 design documents are internally consistent. Flags gaps and proposes resolutions.

---

## Validation Matrix

| Check | Status | Details |
|-------|--------|---------|
| IndexedSymbol fields ↔ Extractor capabilities | PASS (1 gap) | See §1 |
| LanceDB SymbolRow ↔ IndexedSymbol fields | PASS (2 gaps) | See §2 |
| MCP tool outputs ↔ LanceDB query capabilities | PASS | See §3 |
| Hook formatting ↔ MCP tool formatting | PASS (1 inconsistency) | See §4 |
| ESLint rules ↔ JSDoc standard requirements | PASS (2 gaps) | See §5 |
| tsdoc.json tags ↔ JSDoc standard tags ↔ ESLint check-tag-names | PASS | See §6 |

**Overall: 6 checks performed, 4 gaps found, all resolvable.**

---

## §1: IndexedSymbol Fields ↔ Extractor Capabilities

### Method
Compared every field in the `IndexedSymbol` interface (indexed-symbol-schema.md) against the extraction logic defined in embedding-pipeline-design.md and docgen-vs-custom-evaluation.md.

### Results

| IndexedSymbol Field | Extraction Source | Extractable? |
|--------------------|-------------------|-------------|
| `id` | Computed: `generateId(package, module, qualifiedName)` | Yes |
| `name` | ts-morph: `declaration.getName()` | Yes |
| `qualifiedName` | ts-morph: parent class + "." + name | Yes |
| `filePath` | ts-morph: `sourceFile.getFilePath()` | Yes |
| `startLine` | ts-morph: `declaration.getStartLineNumber()` | Yes |
| `endLine` | ts-morph: `declaration.getEndLineNumber()` | Yes |
| `kind` | Computed: `classifySymbol()` decision tree | Yes |
| `effectPattern` | AST: `detectEffectPattern()` — 17 patterns | Yes |
| `package` | fs: nearest package.json `name` field | Yes |
| `module` | Computed: relative path without extension | Yes |
| `category` | JSDoc: `@category` tag | Yes |
| `domain` | JSDoc: `@domain` tag | Yes |
| `description` | JSDoc: first paragraph (doctrine) | Yes |
| `title` | Schema: `.annotate({ title })` | Yes |
| `schemaIdentifier` | Schema: `.annotate({ identifier })` | Yes |
| `schemaDescription` | Schema: `.annotate({ description })` | Yes |
| `remarks` | JSDoc: `@remarks` tag | Yes |
| `moduleDescription` | JSDoc: `@packageDocumentation` description | Yes |
| `examples` | JSDoc: `@example` blocks | Yes |
| `params` | JSDoc: `@param` tags (name + description) | Yes |
| `returns` | JSDoc: `@returns` tag | Yes |
| `errors` | JSDoc: `@throws` / `@errors` tags | Yes |
| `fieldDescriptions` | Schema: `.annotateKey({ description })` per field | Yes |
| `seeRefs` | JSDoc: `@see` / `{@link}` references | Yes |
| `provides` | JSDoc: `@provides` tag | Yes |
| `dependsOn` | JSDoc: `@depends` tag | Yes |
| `imports` | ts-morph: `sourceFile.getImportDeclarations()` | **Partially** |
| `signature` | ts-morph: `declaration.getType().getText()` | Yes |
| `since` | JSDoc: `@since` tag | Yes |
| `deprecated` | JSDoc: `@deprecated` tag presence | Yes |
| `exported` | ts-morph: `declaration.isExported()` | Yes |
| `embeddingText` | Computed: `buildEmbeddingText()` | Yes |
| `contentHash` | Computed: SHA-256 of source text span | Yes |
| `indexedAt` | Computed: `new Date().toISOString()` | Yes |

### Gap Found

**GAP-1: `imports` field resolution is partial.**

The `imports` field is defined as "Import dependencies (other symbol IDs from the same codebase)". ts-morph can extract import declarations (`import { X } from "..."`) but resolving these to symbol IDs (`@beep/repo-utils/schemas/PackageJson/PackageName`) requires:
1. Resolving the import module specifier to a file path
2. Looking up the exported symbol in that file
3. Computing the symbol ID via `generateId()`

This is feasible but requires a two-pass extraction: first extract all symbols to build an ID registry, then resolve imports against that registry.

**Resolution:** Implement import resolution as a post-processing step in the SymbolAssembler. First pass: extract all symbols and register their IDs. Second pass: resolve each symbol's import declarations against the registry. Unresolvable imports (external packages like `effect`) are excluded.

---

## §2: LanceDB SymbolRow ↔ IndexedSymbol Fields

### Method
Compared the LanceDB `SymbolRow` interface (embedding-pipeline-design.md, §5) against the `IndexedSymbol` interface and the LanceDB row mapping table (indexed-symbol-schema.md, bottom).

### Results

The explicit mapping table in indexed-symbol-schema.md lists 18 columns. The `SymbolRow` interface in embedding-pipeline-design.md lists 21 columns. Reconciliation:

| LanceDB Column | IndexedSymbol Source | Present in Both? |
|----------------|---------------------|-----------------|
| `vector` | `embeddingText` → embedded | Yes |
| `id` | `id` | Yes |
| `name` | `name` | Yes |
| `qualified_name` | `qualifiedName` | Yes |
| `file_path` | `filePath` | Yes |
| `start_line` | `startLine` | Yes |
| `end_line` | `endLine` | **In SymbolRow only** |
| `kind` | `kind` | Yes |
| `effect_pattern` | `effectPattern` | **In SymbolRow only** |
| `package` | `package` | Yes |
| `module` | `module` | Yes |
| `category` | `category` | Yes |
| `domain` | `domain` | Yes |
| `description` | `description` | Yes |
| `title` | `title` | **In SymbolRow only** |
| `signature` | `signature` | Yes |
| `since` | `since` | Yes |
| `deprecated` | `deprecated` | Yes |
| `keyword_text` | `buildKeywordText()` | Yes |
| `content_hash` | `contentHash` | Yes |
| `indexed_at` | `indexedAt` | Yes |
| `metadata_json` | Full JSON blob | Yes |

### Gaps Found

**GAP-2: Mapping table in indexed-symbol-schema.md is missing 3 columns.**

The mapping table at the bottom of indexed-symbol-schema.md lists only 18 columns, but the `SymbolRow` interface in embedding-pipeline-design.md defines 21 columns. The missing columns are:
- `end_line` (present in SymbolRow, absent from mapping table)
- `effect_pattern` (present in SymbolRow, absent from mapping table)
- `title` (present in SymbolRow, absent from mapping table)

**Resolution:** Update the mapping table in indexed-symbol-schema.md during implementation to include all 21 columns. The SymbolRow interface is authoritative — it includes all fields needed for both search and display.

**GAP-3: Column name convention mismatch.**

IndexedSymbol uses camelCase (`qualifiedName`, `filePath`, `startLine`). SymbolRow uses snake_case (`qualified_name`, `file_path`, `start_line`). This is intentional (LanceDB convention) but the upsert code in embedding-pipeline-design.md correctly maps between them. No action needed — just document the convention.

---

## §3: MCP Tool Outputs ↔ LanceDB Query Capabilities

### Method
Verified that every MCP tool output field can be sourced from LanceDB queries.

### search_codebase

| Output Field | Source |
|-------------|--------|
| `id` | LanceDB: `id` column |
| `name` | LanceDB: `name` column |
| `kind` | LanceDB: `kind` column (filterable) |
| `package` | LanceDB: `package` column (filterable) |
| `module` | LanceDB: `module` column |
| `filePath` | LanceDB: `file_path` column |
| `startLine` | LanceDB: `start_line` column |
| `description` | LanceDB: `description` column |
| `signature` | LanceDB: `signature` column |
| `score` | Computed: RRF normalized score |
| `totalMatches` | Computed: pre-truncation count |
| `searchMode` | Computed: "hybrid" / "vector" / "keyword" |

**Status: PASS.** All fields are available from LanceDB columns or computed at query time. Filters (kind, package) use LanceDB metadata filtering which is supported natively.

### find_related

| Output Field | Source |
|-------------|--------|
| `source.id/name/kind` | LanceDB: lookup by `id` |
| `relation` | Input parameter (pass-through) |
| `related[].id/name/kind/package/module/filePath/startLine/description` | LanceDB: filtered queries or vector search |
| `related[].relationDetail` | Computed per relation type |

**Status: PASS.** The `imports` relation requires deserializing `metadata_json` to get the `imports` array. The `imported-by` relation requires a scan with filter — LanceDB supports `where` clauses but not full-text search on JSON blobs. Implementation must deserialize `metadata_json` for import lookups.

### browse_symbols

| Output Field | Source |
|-------------|--------|
| `level` | Computed from input parameters |
| `items[].name/count/kinds/description` | LanceDB: GROUP BY `package` or `module`, COUNT by `kind` |

**Status: PASS.** LanceDB supports `select` and in-memory grouping. For the package/module levels, load all rows with `select(["package", "module", "kind"])` and group in memory.

### reindex

| Output Field | Source |
|-------------|--------|
| `status` | Pipeline completion status |
| `stats.*` | Pipeline return value |
| `errors` | Pipeline error accumulator |

**Status: PASS.** All outputs come from the Pipeline orchestrator, not LanceDB queries.

---

## §4: Hook Formatting ↔ MCP Tool Formatting

### Method
Compared the output format of search results in hooks (hook-integration-design.md `formatContextInjection`) vs MCP tools (mcp-api-design.md `formatSearchResults`).

### MCP Tool Format (search_codebase)

```
### 1. PackageName (schema)
📦 @beep/repo-utils/schemas/PackageJson
📄 tooling/repo-utils/src/schemas/PackageJson.ts:42
Validates and brands npm package names...
`S.String.pipe(S.pattern(...), S.brand("PackageName"))`
Score: 95%
```

### Hook Format (UserPromptSubmit)

```
- **PackageName** (schema) in `tooling/repo-utils/src/schemas/PackageJson.ts:42`
  Validates and brands npm package names...
  `S.String.pipe(S.pattern(...)...`
```

### Inconsistency Found

**GAP-4: Different result format between MCP tools and hooks.**

MCP tools use `###` headers with emoji prefixes (📦, 📄) and include module path, score, and full signature (200 char truncation). Hooks use bullet list format with bold name and include only filePath:line, description, and short signature (120 char truncation).

This is **intentional and acceptable** — hooks inject into `<system-reminder>` blocks where compact formatting is critical (300–800 tokens). MCP tools provide richer output because the user explicitly requested search results.

**Resolution:** No change needed. Document the intentional difference: hooks optimize for minimal context window impact; MCP tools optimize for complete information. The underlying data (symbol fields) is identical — only the formatting differs.

---

## §5: ESLint Rules ↔ JSDoc Standard Requirements

### Method
For every Required (R) tag in the jsdoc-standard.md matrix, verified there is a corresponding ESLint rule in eslint-config-design.md that enforces it.

### Coverage Matrix

| Required Tag | ESLint Rule | Enforced? |
|-------------|-------------|-----------|
| Description (R for all) | `require-jsdoc` + `require-description` | Yes (error) |
| `@since` (R for all) | `require-since-semver` (custom) | Yes (custom rule) |
| `@category` (R for all except module) | None | **No** |
| `@param` (R for function) | `require-param` + `require-param-description` | Yes (error) |
| `@returns` (R for function) | `require-returns` + `require-returns-description` | Yes (error) |
| `@packageDocumentation` (R for module) | `require-file-overview` | Yes (error for index.ts) |
| `@provides` (R for layer) | None | **No** |
| `@depends` (R for layer) | None | **No** |

### Gaps Found

**GAP-5: No ESLint rule enforces `@category` presence.**

`eslint-plugin-jsdoc` does not have a built-in rule requiring specific tag presence (only `require-jsdoc` for the JSDoc block itself). The `check-tag-names` rule validates allowed tags but doesn't require them.

**Resolution:** Accept this gap for P4a Phase 1 (warnings only). In Phase 2, add a third custom ESLint rule `require-category-tag` that checks for `@category` on all exported symbols. Alternatively, the extractor can default to inferring category from file path (e.g., `src/schemas/` → "schemas") when the tag is missing, making this a soft requirement.

**GAP-6: No ESLint rule enforces `@provides`/`@depends` on layers.**

These custom tags are Required for layers in the JSDoc standard but no ESLint rule enforces their presence specifically on layer-kind symbols.

**Resolution:** Accept this gap. Enforcing kind-specific tag requirements would require a custom rule that classifies symbols (detecting Layer definitions) — essentially reimplementing `classifySymbol()` in an ESLint context. This is better handled by the extractor's validation step: `validateIndexedSymbol()` can warn when a layer-kind symbol lacks `provides`/`dependsOn` fields. Add a "lint via extractor" pass as an optional T12 extension.

---

## §6: tsdoc.json ↔ JSDoc Standard ↔ ESLint check-tag-names

### Method
Cross-referenced the three sources of custom tag definitions to ensure they agree.

### Tag Comparison

| Tag | tsdoc.json | JSDoc Standard | ESLint `definedTags` |
|-----|-----------|---------------|---------------------|
| `@domain` | Yes (block, single) | Yes (S/R per kind) | Yes |
| `@provides` | Yes (block, multiple) | Yes (S/R per kind) | Yes |
| `@depends` | Yes (block, multiple) | Yes (S/R per kind) | Yes |
| `@errors` | Yes (block, multiple) | Yes (S per kind) | Yes |
| `@since` | supported:true | R for all | Yes (in definedTags) |
| `@category` | supported:true | R for all (except module) | Yes |
| `@example` | supported:true | S per kind | Yes |
| `@remarks` | supported:true | S/R per kind | Yes |
| `@see` | supported:true | S per kind | Yes |
| `@deprecated` | supported:true | O for all | Yes |
| `@internal` | supported:true | O for all | Yes |
| `@packageDocumentation` | supported:true | R for module | Yes |
| `@throws` | supported:true | S per kind | Yes |
| `@param` | supported:true | R for function | Yes |
| `@returns` | supported:true | R for function | Yes |
| `@typeParam` | supported:true | Standard | Yes |
| `@summary` | supported:true | Standard | Yes |
| `@ignore` | Not in tsdoc.json | Not in standard | Yes (in ESLint) |

### Minor Discrepancy

`@ignore` is in ESLint's `definedTags` but not in tsdoc.json's `supportForTags`. This is harmless — `@ignore` is a docgen-specific tag used to suppress documentation generation. It doesn't need IDE support via tsdoc.json.

**Resolution:** Add `"@ignore": { "supported": true }` to tsdoc.json for completeness, or leave as-is since it's a documentation tooling concern, not a search concern.

**Status: PASS.** All 4 custom tags and 13 standard tags are consistently defined across all three sources.

---

## Summary of Gaps and Resolutions

| Gap | Severity | Resolution | When |
|-----|----------|-----------|------|
| GAP-1: `imports` field needs two-pass extraction | Medium | Post-processing step in SymbolAssembler | T9 (implementation) |
| GAP-2: Mapping table missing 3 columns | Low | Update table during implementation | T6 (implementation) |
| GAP-3: camelCase vs snake_case convention | Info | Document convention (intentional) | T11 (implementation) |
| GAP-4: Hook vs MCP format difference | Info | Intentional — document rationale | T15 (implementation) |
| GAP-5: No ESLint rule for `@category` | Medium | Custom rule in Phase 2, extractor fallback | T1 (defer to Phase 2) |
| GAP-6: No ESLint rule for `@provides`/`@depends` on layers | Low | Extractor validation + warning | T12 (implementation) |

**No blocking gaps found.** All 6 gaps have clear resolutions and none require redesign of P2 specifications.
