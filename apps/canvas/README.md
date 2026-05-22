# @beep/canvas

Private repo-local Tauri 2 + React shell for the canvas bootstrap goal.

## Running The App

```bash
cd apps/canvas
bun run dev
```

For the native desktop shell:

```bash
cd apps/canvas
bun run dev:tauri
```

## Usage

```ts
import { makeCanvasCommandBridge, makeCanvasCommandRuntime } from "@beep/canvas"

const runtime = makeCanvasCommandRuntime()
const bridge = await runtime.runPromise(makeCanvasCommandBridge())
const health = await runtime.runPromise(bridge.canvasHealth())

console.log(health.app)
await runtime.dispose()
```

## Development

```bash
bun run build
bun run check
bun run test
bun run test:integration
bun run lint
```

Unit tests stay outside `test/integration`; package integration tests live under
`test/integration` and use `bun run test:integration`. Tests and dtslint files
import package source through `@beep/canvas` or other `@beep/*` aliases. Use
relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
