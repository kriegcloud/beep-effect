# @beep/codebase-search

Semantic codebase search with vector embeddings, BM25 keyword search, and MCP server integration for Effect v4 monorepos.

## Features

- **Hybrid Search**: Combines vector similarity (LanceDB) with keyword matching (BM25) via Reciprocal Rank Fusion
- **Symbol Extraction**: Parses TypeScript AST to extract functions, classes, interfaces, types, and constants with full JSDoc and Effect pattern metadata
- **MCP Server**: Exposes `search_codebase`, `find_related`, `browse_symbols`, and `reindex` tools via Model Context Protocol
- **Claude Code Hooks**: Automatic context injection via `SessionStart` and `UserPromptSubmit` hooks

## Installation

```bash
bun add @beep/codebase-search
```

## Usage

### MCP Server (stdio transport)

```bash
bunx @beep/codebase-search
```

### Programmatic

```ts
import { Pipeline } from "@beep/codebase-search/indexer"
import { HybridSearch } from "@beep/codebase-search/search"
```

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
npx vitest run

# Lint
bun run lint:fix

# Generate API docs
bun run docgen
```

## License

MIT
