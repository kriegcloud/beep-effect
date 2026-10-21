# @beep/github

Effect GitHub driver: REST and GraphQL client, GitHub App authentication, and typed repository, pull request, check run and release operations

## Installation

```bash
bun add @beep/github
```

## Usage

```ts
import * as Package from "@beep/github"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/github` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
