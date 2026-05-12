# @beep/db-admin

Internal migration aggregation for repo-owned database proof targets.

## Usage

```ts
import { ArchitectureLabMigrationTarget } from "@beep/db-admin"

console.log(ArchitectureLabMigrationTarget.name)
```

`db-admin` owns migration aggregation and generated migration artifacts. Slice
table packages export concrete table metadata; production apps must not depend
on `_internal/db-admin`.

The current proof target is `architecture-lab/WorkItem`:

- `src/schema.ts` is the Drizzle schema barrel consumed by migration tooling.
- `src/targets.ts` registers migration targets.
- `drizzle/**/migration.sql` stores generated SQL artifacts.
- Integration tests run only when `BEEP_TEST_DATABASE_URL` or
  `BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers` is set.

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Optional live integration proof
BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers bun run test:integration

# Lint
bun run lint:fix
```

## License

MIT
