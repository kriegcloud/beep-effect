# @beep/server

Shared-kernel server boundary for cross-slice product semantics that must remain
server-only and driver-neutral.

This package is currently scaffolded. Its public surface exports `VERSION` from
`src/index.ts`; future exports should not turn the shared kernel into a runtime
or adapter bucket.

## Belongs Here

- Server-only shared product boundary helpers that multiple slices deliberately
  share.
- Server-only shared contracts that cannot be exposed through client-safe
  use-case surfaces.
- Package-local composition helpers only when they do not aggregate slices,
  drivers, or concrete adapters.

## Does Not Belong Here

- Driver-backed repository implementations or external SDK wrappers.
- HTTP/RPC handlers, transports, process managers, schedulers, or workflows.
- Global runtime Layers that wire unrelated slices together.
- Slice-private server behavior.

## Exports

- `@beep/server`
- `@beep/server/*`
- `VERSION`

## Development

```bash
bun run check
bun run test
bun run lint
```

## License

MIT
