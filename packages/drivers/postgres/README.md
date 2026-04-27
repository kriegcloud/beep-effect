# @beep/postgres

Driver-level Postgres runtime, SQLSTATE diagnostics, SQL formatting, and Drizzle Effect composition.

## Installation

```bash
bun add @beep/postgres
```

## Usage

```ts
import { PostgresClient, PostgresError, formatSql, makeDrizzle } from "@beep/postgres"

void PostgresClient
void PostgresError
void formatSql
void makeDrizzle
```

## Development

```bash
bun run check
bun run test
bun run docgen
bun run lint
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/postgres` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
