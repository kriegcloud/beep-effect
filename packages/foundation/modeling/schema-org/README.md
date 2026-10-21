# @beep/schema-org

schema.org vocabulary as Effect schemas with JSON-LD graph building and offline validation

## Installation

```bash
bun add @beep/schema-org
```

## Usage

```ts
import { VERSION } from "@beep/schema-org"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/schema-org` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
