# @beep/memfs

In-memory implementation of the Effect FileSystem service

## Installation

```bash
bun add @beep/memfs
```

## Usage

```ts
import { VERSION } from "@beep/memfs"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/memfs` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
