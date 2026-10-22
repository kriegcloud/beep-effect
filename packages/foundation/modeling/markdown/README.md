# @beep/markdown

CommonMark 0.31.2 and GFM Markdown parsing, editing, formatting and typed frontmatter as Effect schemas and pure functions

## Installation

```bash
bun add @beep/markdown
```

## Usage

```ts
import * as Package from "@beep/markdown"
```

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Integration test
bun run test:integration

# Lint
bun run lint:fix
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/markdown` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
