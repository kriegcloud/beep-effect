# @beep/managed-section

Managed BEGIN/END sections inside user-owned files

## Installation

```bash
bun add @beep/managed-section
```

## Usage

```ts
import { VERSION } from "@beep/managed-section"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/managed-section` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
