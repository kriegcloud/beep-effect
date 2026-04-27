# @beep/client

Shared-kernel client boundary for browser-safe adapters, state, and service
contracts shared across slices.

This package is currently scaffolded. Its public surface exports `VERSION` from
`src/index.ts`; future exports should exist only for browser-safe shared product
semantics.

## Belongs Here

- Cross-slice browser/client services tied to shared product language.
- Shared client state machines, atoms, form models, and command/query client
  contracts when they remain browser-safe.
- Client adapters over shared use-case public contracts.

## Does Not Belong Here

- Server-only config, secrets, live server Layers, or server facades.
- Product-agnostic UI primitives.
- Slice-private client behavior.
- Direct driver imports or runtime infrastructure.

## Exports

- `@beep/client`
- `@beep/client/*`
- `VERSION`

## Development

```bash
bun run check
bun run test
bun run lint
```

## License

MIT
