# Cross-Validation Report — P2 Consistency

> P3 synthesis output: consistency checks across all P2 design documents, with explicit gaps and resolutions.

## Overall Result

| Check | Status | Blocking? |
|---|---|---|
| IndexedSymbol fields vs extractor capabilities | PASS with 1 gap | No |
| LanceDB `SymbolRow` vs IndexedSymbol mapping | PASS with 1 gap | No |
| MCP output schemas vs LanceDB/query capabilities | PASS with 1 gap | No |
| Hook formatting vs MCP formatting | PASS | No |
| ESLint rules vs required JSDoc tags | PASS with 2 gaps | No |
| Custom tags (`tsdoc.json` vs standard vs ESLint) | PASS with 1 minor gap | No |

Total gaps: 6. All are resolvable in P4 implementation tasks.

## 1) IndexedSymbol Fields vs Extractor Capabilities

Source docs:
- `specs/pending/semantic-codebase-search/outputs/indexed-symbol-schema.md`
- `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`
- `specs/pending/semantic-codebase-search/outputs/docgen-vs-custom-evaluation.md`
- `specs/pending/semantic-codebase-search/outputs/jsdoc-standard.md`

### Coverage Matrix

| IndexedSymbol field group | Extractor source | Status |
|---|---|---|
| Identity (`id`, `name`, `qualifiedName`, `filePath`, lines) | ts-morph declarations + computed ID | Covered |
| Classification (`kind`, `effectPattern`, `category`, `domain`) | AST pattern detector + JSDoc tags + classifier | Covered |
| Natural language (`description`, `remarks`, `examples`, `params`, `returns`, `errors`) | doctrine JSDoc parsing | Covered |
| Schema metadata (`title`, `schemaIdentifier`, `schemaDescription`, `fieldDescriptions`) | `.annotate()` / `.annotateKey()` AST extraction | Covered |
| Relationships (`seeRefs`, `provides`, `dependsOn`) | `@see`/`@link` + custom tags | Covered |
| Code context (`signature`, `since`, `deprecated`, `exported`) | type checker + tags + declaration flags | Covered |
| Derived (`embeddingText`, `contentHash`, `indexedAt`) | builder + hash + runtime timestamp | Covered |
| `imports` (symbol IDs) | import declarations + symbol resolution | Gap CV-01 |

### Gap CV-01

- Issue: `imports` is defined as internal symbol IDs, but raw import declarations only provide module specifiers and names.
- Resolution: two-pass assembly.
  - Pass 1: extract all symbols and build `symbolIdByFileAndName` registry.
  - Pass 2: resolve each import to internal symbol IDs; drop external dependencies (e.g., `effect/*`).
- Implementation task: T10.

## 2) LanceDB `SymbolRow` vs IndexedSymbol Mapping

Source docs:
- `specs/pending/semantic-codebase-search/outputs/indexed-symbol-schema.md`
- `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`

### Mapping Validation

`SymbolRow` columns required by storage/query:
- Vector: `vector`
- Identity/location: `id`, `name`, `qualified_name`, `file_path`, `start_line`, `end_line`
- Classification: `kind`, `effect_pattern`, `package`, `module`, `category`, `domain`
- Display/search: `description`, `title`, `signature`, `since`, `deprecated`, `keyword_text`
- Incremental: `content_hash`, `indexed_at`
- Full payload: `metadata_json`

### Gap CV-02

- Issue: `indexed-symbol-schema.md` LanceDB mapping table omits `end_line`, `effect_pattern`, and `title`.
- Resolution: treat `embedding-pipeline-design.md` `SymbolRow` as authoritative and update mapping table accordingly.
- Implementation task: T12.

## 3) MCP Output Schemas vs Query Capabilities

Source docs:
- `specs/pending/semantic-codebase-search/outputs/mcp-api-design.md`
- `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`
- `specs/pending/semantic-codebase-search/outputs/indexed-symbol-schema.md`

### Validation by Tool

| Tool | Required data | Backing capability | Status |
|---|---|---|---|
| `search_codebase` | vector + BM25 results, metadata filters, score | LanceDB vector search + BM25 + RRF | Covered |
| `find_related` | imports/imported-by/same-module/similar/provides/depends-on | `metadata_json` relationships + vector similarity | Covered |
| `browse_symbols` | package/module/symbol listing + counts | metadata scan + in-memory grouping | Covered |
| `reindex` | indexing stats and errors | pipeline stats object | Covered |

### Gap CV-03

- Issue: `provides` / `depends-on` relation values are tag text, not guaranteed canonical symbol IDs.
- Risk: ambiguous matches when multiple symbols share names.
- Resolution: during T10/T17, normalize relation values to symbol IDs when resolvable; keep original text fallback in `relationDetail`.
- Implementation tasks: T10, T17.

## 4) Hook Formatting vs MCP Formatting

Source docs:
- `specs/pending/semantic-codebase-search/outputs/hook-integration-design.md`
- `specs/pending/semantic-codebase-search/outputs/mcp-api-design.md`

### Comparison

| Dimension | MCP tools | Hooks | Consistency verdict |
|---|---|---|---|
| Record fields used | name/kind/path/description/signature (+score) | name/kind/path/description/signature | Consistent source data |
| Signature truncation | ~200 chars | ~120 chars | Intentional difference |
| Envelope | tool response objects/sections | `<system-reminder>` block | Intentional difference |
| Goal | explicit search UX | compact ambient context | Intentional difference |

No gap. Formatting differences are deliberate and aligned with token budgets.

## 5) ESLint Rules vs Required JSDoc Tags

Source docs:
- `specs/pending/semantic-codebase-search/outputs/jsdoc-standard.md`
- `specs/pending/semantic-codebase-search/outputs/eslint-config-design.md`

### Required-Tag Enforcement Matrix

| Required item from standard | Enforced now? | Rule/mechanism |
|---|---|---|
| Non-empty description | Yes | `jsdoc/require-jsdoc`, `jsdoc/require-description` |
| `@since` | Yes | custom `require-since-semver` |
| `@param` + description | Yes | `jsdoc/require-param`, `jsdoc/require-param-description` |
| `@returns` + description | Yes | `jsdoc/require-returns`, `jsdoc/require-returns-description` |
| `@packageDocumentation` for module/barrel docs | Yes | `jsdoc/require-file-overview` |
| `@category` | Partial | allowed/tag-validated only |
| `@provides` on layers | Partial | allowed/tag-validated only |
| `@depends` on layers | Partial | allowed/tag-validated only |

### Gap CV-04

- Issue: no strict rule currently requires `@category` on every required symbol kind.
- Resolution: add custom rule `require-category-tag` or enforce in extractor validation (error in CI).
- Implementation tasks: T01 (rule hook-up), T10 (extractor fallback validation).

### Gap CV-05

- Issue: no kind-aware lint rule requiring `@provides`/`@depends` for layers.
- Resolution: enforce via extractor validation once `kind === "layer"`; emit lint-like errors in indexing preflight.
- Implementation tasks: T10, T14.

## 6) Custom Tags in `tsdoc.json` vs Standard vs ESLint

Source docs:
- `specs/pending/semantic-codebase-search/outputs/jsdoc-standard.md`
- `specs/pending/semantic-codebase-search/outputs/eslint-config-design.md`

### Cross-Check

| Tag | JSDoc standard | `tsdoc.json` | ESLint `check-tag-names` |
|---|---|---|---|
| `@domain` | Present | Present | Present |
| `@provides` | Present | Present | Present |
| `@depends` | Present | Present | Present |
| `@errors` | Present | Present | Present |

### Gap CV-06 (Minor)

- Issue: ESLint allows `@ignore`, while current `tsdoc.json` may omit it.
- Resolution: add `@ignore` support entry for full editor/tooling parity.
- Implementation task: T02.

## Resolution Plan Summary

| Gap | Resolution owner task(s) | Expected outcome |
|---|---|---|
| CV-01 | T10 | Internal imports resolved to stable symbol IDs |
| CV-02 | T12 | LanceDB schema and mapping docs fully aligned |
| CV-03 | T10, T17 | Relation tools return unambiguous matches |
| CV-04 | T01, T10 | Required `@category` enforced consistently |
| CV-05 | T10, T14 | Layer docs validated for `@provides`/`@depends` |
| CV-06 | T02 | Custom-tag parity across lint + tsdoc tooling |

Conclusion: P2 is internally consistent and buildable. No blocking redesigns are required before P4.
