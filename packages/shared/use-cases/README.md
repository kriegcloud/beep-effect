# @beep/use-cases

Contract-only shared-kernel application surface for cross-slice commands,
queries, DTOs, ports, facades, protocols, and actionable application errors.

This package is currently scaffolded. Its public surface exports `VERSION` from
`src/index.ts`; future exports should remain driver-neutral contracts.

## Belongs Here

- Cross-slice command and query language.
- Driver-neutral DTOs and boundary/protocol declarations.
- Client-safe application errors and facade interfaces.
- Product ports that multiple slices deliberately share.

## Does Not Belong Here

- Workflows, process managers, schedulers, or handlers.
- Concrete adapters, transports, clients, persistence, or driver imports.
- Live Layer values or runtime composition.
- Slice-private application behavior.

## Exports

- `@beep/use-cases`
- `@beep/use-cases/*`
- `VERSION`

When boundary surfaces are added, prefer canonical subpaths such as `/public`,
`/server`, and `/test`.

## Development

```bash
bun run check
bun run test
bun run lint
```

## License

MIT
