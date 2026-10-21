# @beep/semver

Strict SemVer 2.0.0 versions, ranges and comparators as Effect schemas

## Installation

```bash
bun add @beep/semver
```

## Usage

```ts
import { VERSION } from "@beep/semver"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/semver` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
