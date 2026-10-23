# @beep/package-json

package.json manifests as Effect schemas: typed fields, a lossless rest catch-all, canonical formatting, edits, validation and file IO

## Installation

```bash
bun add @beep/package-json
```

## Usage

```ts
import * as Package from "@beep/package-json"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/package-json` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
