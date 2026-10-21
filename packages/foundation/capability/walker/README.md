# @beep/walker

Effect directory walking: upward ascent, find-upward marker search, and glob-driven descent with prune and symlink control

## Installation

```bash
bun add @beep/walker
```

## Usage

```ts
import { VERSION } from "@beep/walker"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/walker` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
