# @beep/tika

Apache Tika driver for product-neutral file detection, text extraction, and metadata extraction

## Installation

```bash
bun add @beep/tika
```

## Usage

```ts
import { VERSION } from "@beep/tika"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/tika` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
