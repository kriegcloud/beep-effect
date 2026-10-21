# @beep/toml

TOML 1.1.0 parsing, editing and formatting as Effect schemas and pure functions

## Installation

```bash
bun add @beep/toml
```

## Usage

```ts
import { VERSION } from "@beep/toml"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/toml` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
