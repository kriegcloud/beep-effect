# @beep/runtime-env

Effect runtime environment detection: CI provider, TTY, colour level with FORCE_COLOR/NO_COLOR precedence, and terminal capabilities from env

## Installation

```bash
bun add @beep/runtime-env
```

## Usage

```ts
import * as Package from "@beep/runtime-env"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/runtime-env` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
