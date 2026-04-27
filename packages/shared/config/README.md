# @beep/config

Shared-kernel typed config contracts and vocabulary deliberately agreed on
across slices.

This package is currently scaffolded. Its public surface exports `VERSION` from
`src/index.ts`; future exports should model shared application/runtime
configuration contracts, not environment-variable access or global settings.

## Belongs Here

- Effect `Config` declarations and key namespaces shared across slices.
- Browser-safe public config contracts.
- Server-only config contracts, redacted-secret contracts, and test fixtures.
- Defaults and literal domains tied directly to shared config declarations.

## Does Not Belong Here

- A global registry of every slice's private config.
- Broad constants unrelated to config declarations.
- Driver-specific technical knobs or driver imports.
- Domain behavior reading configuration directly.

## Exports

- `@beep/config`
- `@beep/config/*`
- `VERSION`

When boundary surfaces are added, prefer canonical subpaths such as `/public`,
`/server`, `/secrets`, `/layer`, and `/test`.

## Development

```bash
bun run check
bun run test
bun run lint
```

## License

MIT
