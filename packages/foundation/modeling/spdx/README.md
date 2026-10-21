# @beep/spdx

SPDX license identifiers, exceptions and expressions as Effect schemas

## Installation

```bash
bun add @beep/spdx
```

## Usage

```ts
import { VERSION } from "@beep/spdx"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/spdx` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
