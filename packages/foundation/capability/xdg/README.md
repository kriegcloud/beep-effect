# @beep/xdg

XDG Base Directory resolution for Effect: the resolved environment, base-directory defaults, app-namespaced directories, OS-native mapping and config-file discovery

## Installation

```bash
bun add @beep/xdg
```

## Usage

```ts
import * as Package from "@beep/xdg"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/xdg` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
