# @beep/github-references

GitHub issue-reference and closing-keyword grammar as pure functions

## Installation

```bash
bun add @beep/github-references
```

## Usage

```ts
import { VERSION } from "@beep/github-references"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/github-references` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
