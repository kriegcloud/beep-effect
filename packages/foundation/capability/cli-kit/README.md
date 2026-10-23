# @beep/cli-kit

Presentation boundary for effect/cli programs: audience-aware log lines, themes, documents, failure reports, exit codes and prompts

## Installation

```bash
bun add @beep/cli-kit
```

## Usage

```ts
import * as Package from "@beep/cli-kit"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/cli-kit` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
