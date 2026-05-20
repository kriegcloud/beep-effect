# @beep/canvas-use-cases

Architecture-lab use-case package for CanvasProject commands, queries, ports, and public action contracts.

## Installation

```bash
bun add @beep/canvas-use-cases
```

## Usage

```ts
import { VERSION } from "@beep/canvas-use-cases"
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
bun run lint
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/canvas-use-cases` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
