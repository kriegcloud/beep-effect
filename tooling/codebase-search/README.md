# @beep/codebase-search

Semantic codebase search for the beep monorepo, built with:

- TypeScript AST extraction (`ts-morph` + `doctrine`)
- Hybrid retrieval (LanceDB vector + BM25 keyword)
- MCP tools (`search_codebase`, `find_related`, `browse_symbols`, `reindex`)
- Claude Code hooks (`SessionStart`, `UserPromptSubmit`)

## Runtime Requirements

- Bun `>=1.3`
- Node is supported for library/test workflows, but MCP and hook entrypoint runtimes are Bun (`@effect/platform-bun`).

## Build

```bash
bun run build
```

Build outputs:

- `tooling/codebase-search/dist/bin.js`
- `tooling/codebase-search/dist/hooks/session-start-entry.js`
- `tooling/codebase-search/dist/hooks/prompt-submit-entry.js`

## MCP Server Setup

Use Bun for stdio MCP launch:

```json
{
  "mcpServers": {
    "codebase-search": {
      "type": "stdio",
      "command": "bun",
      "args": ["./tooling/codebase-search/dist/bin.js"],
      "env": {
        "CODEBASE_ROOT": ".",
        "INDEX_PATH": ".code-index"
      }
    }
  }
}
```

## Claude Hook Setup

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "bun ./tooling/codebase-search/dist/hooks/session-start-entry.js",
        "timeout": 5000
      }
    ],
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "bun ./tooling/codebase-search/dist/hooks/prompt-submit-entry.js",
        "timeout": 5000
      }
    ]
  }
}
```

## MCP Tools

### `search_codebase`

Primary hybrid search.

Inputs:

- `query: string` (required)
- `kind?: string`
- `package?: string`
- `limit?: number` (`1-20`, default `5`)

### `find_related`

Relation traversal from a known symbol.

Inputs:

- `symbolId: string` (required)
- `relation?: "imports" | "imported-by" | "same-module" | "similar" | "provides" | "depends-on"`
- `limit?: number` (`1-10`, default `5`)

### `browse_symbols`

Hierarchical browsing.

Inputs:

- `package?: string`
- `module?: string`
- `kind?: string`

### `reindex`

Index refresh.

Inputs:

- `mode?: "incremental" | "full"`
- `package?: string` (supported with `mode="incremental"` only)

`INDEX_PATH` note:

- If you customize `INDEX_PATH` for MCP, use the same `INDEX_PATH` for hook commands so hooks and MCP read/write the same index directory.

## Index Layout

Default index root: `.code-index/`

Expected files:

- `index-meta.json`
- `file-hashes.json`
- `bm25-index.json`
- LanceDB table files

## Recommended First Run

1. Build package: `bun run build`
2. Start MCP server via Bun (config above)
3. Run `reindex` with `mode="full"`
4. Verify hooks by starting a new Claude session and sending a coding prompt

## Development Commands

```bash
# Type check
bun run check

# Tests
npx vitest run tooling/codebase-search/test

# Lint + docgen (repo-level checks used in P5)
npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'
bunx turbo run docgen --filter=@beep/repo-cli --filter=@beep/codebase-search
```

## Embedding Model

Live embeddings are generated with `nomic-ai/nomic-embed-text-v1.5` via `@huggingface/transformers` feature-extraction (ONNX backend).
