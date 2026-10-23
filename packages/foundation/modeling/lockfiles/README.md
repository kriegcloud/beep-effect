# @beep/lockfiles

bun, npm, pnpm and yarn Berry lockfile parsing into one Effect schema model, with pure workspace integrity checks

## Installation

```bash
bun add @beep/lockfiles
```

## Usage

```ts
import * as Package from "@beep/lockfiles"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/lockfiles` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
