# @beep/bun-cli

Driver-level Bun CLI capability wrapper for product-neutral Bun version probes and upgrade execution.

## Installation

```bash
bun add @beep/bun-cli
```

## Usage

```ts
import { VERSION } from "@beep/bun-cli"
```

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Lint
bun run lint:fix
```

Tests and dtslint files import package source through `@beep/bun-cli` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
