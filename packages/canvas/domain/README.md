# @beep/canvas-domain

Architecture-lab domain package for the synthetic CanvasProject aggregate.

## Installation

```bash
bun add @beep/canvas-domain
```

## Usage

```ts
import { VERSION } from "@beep/canvas-domain"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/canvas-domain` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
