# @beep/github-actions

The GitHub Actions runtime for Effect: env, inputs, outputs, state, logging, cache, artifacts, blob storage, OIDC and the token bridge.

## Installation

```bash
bun add @beep/github-actions
```

## Usage

```ts
import * as Package from "@beep/github-actions"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/github-actions` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
