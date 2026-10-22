# @beep/epistemics

Tenant-free epistemic vocabulary: evidence spans, claim gates, edge identity, contradictions, intervals and claim envelopes.

## Installation

```bash
bun add @beep/epistemics
```

## Usage

```ts
import * as Package from "@beep/epistemics"
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests import package source through `@beep/epistemics` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
