# @beep/github-reporting

GitHub check-run reporting: check states, managed documents, check documents and the GitHub-flavored Markdown writer as Effect schemas

## Installation

```bash
bun add @beep/github-reporting
```

## Usage

```ts
import * as Package from "@beep/github-reporting"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/github-reporting` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
