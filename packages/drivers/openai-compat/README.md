# @beep/openai-compat

OpenAI-compatible Effect AI protocol driver.

## Installation

```bash
bun add @beep/openai-compat
```

## Usage

```ts
import { VERSION } from "@beep/openai-compat"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/openai-compat` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
