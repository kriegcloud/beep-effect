# MCP API Design

> P2 Design Document — Defines the MCP server tool interface for semantic codebase search (max 4 tools).

## Server Configuration

```json
{
  "mcpServers": {
    "codebase-search": {
      "type": "stdio",
      "command": "node",
      "args": ["./tooling/codebase-search/dist/server.js"],
      "env": {
        "CODEBASE_ROOT": ".",
        "INDEX_PATH": ".code-index",
        "EMBEDDING_MODEL": "nomic-ai/CodeRankEmbed"
      }
    }
  }
}
```

---

## Tool 1: `search_codebase`

**Purpose:** Primary semantic + keyword search across all indexed symbols.

### Input Schema

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Natural language search query describing what you're looking for. Examples: 'schema for validating package names', 'service that resolves workspace dependencies', 'error when circular dependency detected'."
    },
    "kind": {
      "type": "string",
      "enum": ["schema", "service", "layer", "error", "function", "type", "constant", "command", "module"],
      "description": "Filter results to a specific symbol kind. Omit to search all kinds."
    },
    "package": {
      "type": "string",
      "description": "Filter results to a specific package (e.g., '@beep/repo-utils'). Omit to search all packages."
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 20,
      "default": 5,
      "description": "Maximum number of results to return. Default 5."
    }
  },
  "required": ["query"]
}
```

### Output Schema

```json
{
  "type": "object",
  "properties": {
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "kind": { "type": "string" },
          "package": { "type": "string" },
          "module": { "type": "string" },
          "filePath": { "type": "string" },
          "startLine": { "type": "integer" },
          "description": { "type": "string" },
          "signature": { "type": "string" },
          "score": { "type": "number" }
        }
      }
    },
    "totalMatches": { "type": "integer" },
    "searchMode": {
      "type": "string",
      "enum": ["hybrid", "vector", "keyword"]
    }
  }
}
```

### Token Budget

| Component | Tokens |
|-----------|--------|
| Per result (compact) | ~100-150 |
| Per result (with signature) | ~150-250 |
| Results header + footer | ~30 |
| **5 results (default)** | **~800-1,300** |
| **10 results** | **~1,500-2,500** |
| **20 results (max)** | **~3,000-5,000** |

### Output Formatting

```typescript
/**
 * Compact result format optimized for Claude's context window.
 *
 * Each result: ~150 tokens. Default 5 results = ~800 tokens.
 */
const formatSearchResults = (results: ReadonlyArray<SearchResult>): string => {
  if (results.length === 0) {
    return "No matching symbols found. Try broadening your query or removing filters."
  }

  const header = `Found ${results.length} matching symbols:\n`

  const body = results.map((r, i) =>
    [
      `### ${i + 1}. ${r.name} (${r.kind})`,
      `📦 ${r.package}/${r.module}`,
      `📄 ${r.filePath}:${r.startLine}`,
      `${r.description}`,
      r.signature.length <= 200 ? `\`${r.signature}\`` : `\`${r.signature.slice(0, 200)}...\``,
      `Score: ${(r.score * 100).toFixed(0)}%`,
    ].join("\n")
  ).join("\n\n---\n\n")

  return header + body
}
```

### Search Algorithm

```
1. Embed query using CodeRankEmbed → queryVector
2. Execute in parallel:
   a. LanceDB vector search: top 20 by cosine similarity (with optional kind/package filter)
   b. BM25 keyword search: top 20 by term frequency
3. Fuse results with Reciprocal Rank Fusion (k=60)
4. Apply metadata filters (kind, package) if not already applied
5. Truncate to `limit`
6. Format and return
```

---

## Tool 2: `find_related`

**Purpose:** Navigate the symbol graph — find symbols connected to a known symbol via imports, cross-references, or structural proximity.

### Input Schema

```json
{
  "type": "object",
  "properties": {
    "symbolId": {
      "type": "string",
      "description": "The ID of the symbol to find relations for (e.g., '@beep/repo-utils/schemas/PackageJson/PackageName'). Use a result ID from search_codebase."
    },
    "relation": {
      "type": "string",
      "enum": ["imports", "imported-by", "same-module", "similar", "provides", "depends-on"],
      "default": "similar",
      "description": "Type of relationship to follow. 'similar' uses vector similarity, others use explicit graph edges."
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "default": 5,
      "description": "Maximum number of related symbols to return."
    }
  },
  "required": ["symbolId"]
}
```

### Output Schema

```json
{
  "type": "object",
  "properties": {
    "source": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "kind": { "type": "string" }
      }
    },
    "relation": { "type": "string" },
    "related": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "kind": { "type": "string" },
          "package": { "type": "string" },
          "module": { "type": "string" },
          "filePath": { "type": "string" },
          "startLine": { "type": "integer" },
          "description": { "type": "string" },
          "relationDetail": { "type": "string" }
        }
      }
    }
  }
}
```

### Token Budget

| Component | Tokens |
|-----------|--------|
| Source symbol header | ~30 |
| Per related symbol | ~80-120 |
| **5 results (default)** | **~430-630** |

### Relation Resolution

```typescript
const resolveRelation = (
  symbolId: string,
  relation: RelationType,
  index: SymbolIndex
): ReadonlyArray<RelatedSymbol> => {
  const source = index.getById(symbolId)
  if (source === null) return []

  switch (relation) {
    case "imports":
      // Symbols that this symbol imports (from source.imports field)
      return index.getByIds(source.imports)

    case "imported-by":
      // Symbols whose imports include this symbol
      return index.findWhere((s) => s.imports.includes(symbolId))

    case "same-module":
      // Other symbols in the same module file
      return index.findWhere((s) => s.module === source.module && s.id !== symbolId)

    case "similar":
      // Vector similarity search anchored on source's embedding
      return index.vectorSearch(source.embeddingVector, { exclude: [symbolId] })

    case "provides":
      // Symbols that this symbol provides (from @provides tags)
      return index.findWhere((s) => source.provides.includes(s.name))

    case "depends-on":
      // Symbols that this symbol depends on (from @depends tags)
      return index.findWhere((s) => source.dependsOn.includes(s.name))
  }
}
```

---

## Tool 3: `browse_symbols`

**Purpose:** Structured navigation of the symbol index — list packages, modules, or symbols within a scope. No search query needed.

### Input Schema

```json
{
  "type": "object",
  "properties": {
    "package": {
      "type": "string",
      "description": "Package to browse (e.g., '@beep/repo-utils'). Omit to list all packages."
    },
    "module": {
      "type": "string",
      "description": "Module within package to browse (e.g., 'schemas/PackageJson'). Requires 'package'."
    },
    "kind": {
      "type": "string",
      "enum": ["schema", "service", "layer", "error", "function", "type", "constant", "command", "module"],
      "description": "Filter to specific symbol kind."
    }
  },
  "required": []
}
```

### Output Schema

```json
{
  "type": "object",
  "properties": {
    "level": {
      "type": "string",
      "enum": ["packages", "modules", "symbols"]
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "count": { "type": "integer" },
          "kinds": {
            "type": "object",
            "additionalProperties": { "type": "integer" }
          },
          "description": { "type": "string" }
        }
      }
    }
  }
}
```

### Token Budget

| Scenario | Tokens |
|----------|--------|
| Package list (5 packages) | ~200-300 |
| Module list (10 modules) | ~400-600 |
| Symbol list (20 symbols) | ~600-1,000 |

### Browsing Logic

```typescript
/**
 * Three-level browsing hierarchy:
 *
 * Level 1: No args → list all packages with symbol counts
 * Level 2: package → list modules in package with per-kind counts
 * Level 3: package + module → list symbols with name, kind, description
 */
const browse = (params: BrowseParams, index: SymbolIndex): BrowseResult => {
  // Level 1: Package overview
  if (params.package === undefined) {
    const packages = index.groupBy("package")
    return {
      level: "packages",
      items: packages.map((pkg) => ({
        name: pkg.key,
        count: pkg.symbols.length,
        kinds: countByKind(pkg.symbols),
        description: pkg.moduleDescription ?? ""
      }))
    }
  }

  // Level 2: Module listing
  if (params.module === undefined) {
    const modules = index.groupBy("module", { package: params.package })
    return {
      level: "modules",
      items: modules.map((mod) => ({
        name: mod.key,
        count: mod.symbols.length,
        kinds: countByKind(mod.symbols),
        description: mod.moduleDescription ?? ""
      }))
    }
  }

  // Level 3: Symbol listing
  const symbols = index.findWhere((s) =>
    s.package === params.package &&
    s.module === params.module &&
    (params.kind === undefined || s.kind === params.kind)
  )
  return {
    level: "symbols",
    items: symbols.map((sym) => ({
      name: sym.name,
      count: 1,
      kinds: { [sym.kind]: 1 },
      description: sym.description
    }))
  }
}
```

### Output Formatting

```typescript
// Level 1: Package overview
const formatPackages = (items: ReadonlyArray<BrowseItem>): string =>
  [
    "## Indexed Packages\n",
    ...items.map((pkg) =>
      `- **${pkg.name}** (${pkg.count} symbols) — ${Object.entries(pkg.kinds).map(([k, v]) => `${v} ${k}s`).join(", ")}`
    )
  ].join("\n")

// Level 2: Module listing
const formatModules = (pkg: string, items: ReadonlyArray<BrowseItem>): string =>
  [
    `## Modules in ${pkg}\n`,
    ...items.map((mod) =>
      `- **${mod.name}** (${mod.count} symbols) — ${mod.description}`
    )
  ].join("\n")

// Level 3: Symbol listing
const formatSymbols = (pkg: string, mod: string, items: ReadonlyArray<BrowseItem>): string =>
  [
    `## Symbols in ${pkg}/${mod}\n`,
    ...items.map((sym) =>
      `- \`${sym.name}\` (${Object.keys(sym.kinds)[0]}) — ${sym.description}`
    )
  ].join("\n")
```

---

## Tool 4: `reindex`

**Purpose:** Trigger incremental or full re-indexing of the codebase.

### Input Schema

```json
{
  "type": "object",
  "properties": {
    "mode": {
      "type": "string",
      "enum": ["incremental", "full"],
      "default": "incremental",
      "description": "Incremental re-indexes only changed files (via content hash comparison). Full rebuilds the entire index."
    },
    "package": {
      "type": "string",
      "description": "Restrict re-indexing to a specific package directory. Omit to index all packages."
    }
  },
  "required": []
}
```

### Output Schema

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["completed", "error"]
    },
    "stats": {
      "type": "object",
      "properties": {
        "filesScanned": { "type": "integer" },
        "filesChanged": { "type": "integer" },
        "symbolsIndexed": { "type": "integer" },
        "symbolsRemoved": { "type": "integer" },
        "durationMs": { "type": "integer" }
      }
    },
    "errors": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

### Token Budget

| Component | Tokens |
|-----------|--------|
| Status + stats | ~60-80 |
| Per error line | ~20 |
| **Typical response** | **~80-150** |

---

## Error Handling

All tools return errors in a consistent format:

```json
{
  "error": {
    "code": "INDEX_NOT_FOUND",
    "message": "No index found at .code-index/. Run reindex first.",
    "suggestion": "Use the reindex tool with mode='full' to build the initial index."
  }
}
```

Error codes:

| Code | Meaning | Suggestion |
|------|---------|-----------|
| `INDEX_NOT_FOUND` | No LanceDB index exists | Run `reindex` with `mode=full` |
| `SYMBOL_NOT_FOUND` | Symbol ID not in index | Check ID spelling or run `search_codebase` |
| `INDEX_STALE` | Index older than 1 hour | Run `reindex` with `mode=incremental` |
| `EMBEDDING_MODEL_ERROR` | Model failed to load | Check ONNX runtime installation |
| `SEARCH_TIMEOUT` | Search exceeded 5s | Narrow query with filters |

---

## Rate Limits and Performance

| Metric | Target |
|--------|--------|
| search_codebase latency | < 500ms (warm), < 3s (cold, first query) |
| find_related latency | < 300ms |
| browse_symbols latency | < 100ms |
| reindex (incremental) | < 5s for 10 changed files |
| reindex (full) | < 30s for 500 symbols |
| Max concurrent requests | 1 (single-process MCP server) |
| Index staleness threshold | 1 hour (advisory warning) |
