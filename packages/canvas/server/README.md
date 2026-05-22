# @beep/canvas-server

Server adapter package for the canvas slice. It wires the CanvasProject use-case
facade into protocol-shaped handlers and exposes the live server layer used by
`apps/canvas`.

## Surface

- `@beep/canvas-server` exposes the package `VERSION` and the `CanvasProject`
  namespace for HTTP, RPC, tool, repository, and layer helpers.
- `@beep/canvas-server/layer` exposes `CanvasServerLive` and
  `CanvasProjectServer` for Effect runtime composition.
- `@beep/canvas-server/aggregates/CanvasProject` exposes the CanvasProject
  server adapter internals that are still public to repo packages.

## Usage

```ts
import { CanvasProject } from "@beep/canvas-server"
import { CanvasServerLive } from "@beep/canvas-server/layer"
import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"

declare const useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape

const httpHandlers = CanvasProject.makeCanvasProjectHttpHandlers(useCases)
const restoreTool = CanvasProject.CanvasProjectToolNames.restore

console.log(CanvasServerLive, httpHandlers.restore, restoreTool)
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

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/canvas-server` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

The server layer should depend on public canvas use-case contracts, not app
implementation details. Keep adapters thin: decode and translate protocol
shapes, delegate scene mutations to use cases, and return typed public failures.

## License

MIT
