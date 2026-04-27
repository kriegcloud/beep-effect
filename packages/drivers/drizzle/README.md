# @beep/drizzle



## Installation

```bash
bun add @beep/drizzle
```

## Usage

```ts
import { Drizzle, DrizzleError } from "@beep/drizzle"
import { installDrizzleEffectYieldables } from "@beep/drizzle/interop"

void Drizzle
void DrizzleError
void installDrizzleEffectYieldables
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/drizzle` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
