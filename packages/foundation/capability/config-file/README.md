# @beep/config-file

Composable Effect config file loading: resolver chains, JSON/JSONC/YAML/TOML codecs, merge strategies, migrations and a ConfigProvider bridge

## Installation

```bash
bun add @beep/config-file
```

## Usage

```ts
import * as Package from "@beep/config-file"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/config-file` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
