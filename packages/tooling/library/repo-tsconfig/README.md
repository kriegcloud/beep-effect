# @beep/repo-tsconfig

Effect tsconfig.json extends-chain loading and config discovery for repo tooling

## Installation

```bash
bun add @beep/repo-tsconfig
```

## Usage

```ts
import * as Package from "@beep/repo-tsconfig"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/repo-tsconfig` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
