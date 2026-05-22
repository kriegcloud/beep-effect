# @beep/canvas-use-cases

Use-case package for the canvas slice. It owns the public CanvasProject command,
query, action-error, service, and server-side repository contracts that app and
server adapters compose around.

## Surface

- `@beep/canvas-use-cases/public` exposes the CanvasProject command/query
  models, public action failures, and use-case service tag.
- `@beep/canvas-use-cases/server` adds repository ports and the
  `makeCanvasProjectUseCases` factory for server-side composition.
- `@beep/canvas-use-cases/aggregates/CanvasProject` exposes the aggregate
  use-case namespace for repo packages.

## Usage

```ts
import { CanvasProject } from "@beep/canvas-use-cases/public"
import { CanvasProject as CanvasProjectServer } from "@beep/canvas-use-cases/server"

declare const repository: CanvasProjectServer.CanvasProjectRepositoryShape

const useCases = CanvasProjectServer.makeCanvasProjectUseCases(repository)
const command = new CanvasProject.ListCanvasProjectsQuery({})

console.log(useCases.list(command))
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
bun run lint
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/canvas-use-cases` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

Use cases are the mutation boundary for the canvas app. Import/load flows should
use `RestoreCanvasProjectCommand` instead of mutating repository state from app
code, so persistence adapters stay outside domain behavior.

## License

MIT
