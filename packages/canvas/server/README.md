# @beep/canvas-server

Architecture-lab server adapter package for CanvasProject repositories, handlers, and Layers.

## Installation

```bash
bun add @beep/canvas-server
```

## Usage

```ts
import { VERSION } from "@beep/canvas-server"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/canvas-server` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
