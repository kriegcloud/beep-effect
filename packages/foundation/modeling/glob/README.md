# @beep/glob

Full minimatch-dialect glob matching compiled to pure predicates as Effect schemas

## Installation

```bash
bun add @beep/glob
```

## Usage

```ts
import { VERSION } from "@beep/glob"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/glob` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
