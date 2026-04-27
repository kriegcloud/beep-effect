# @beep/ui

Shared-kernel UI boundary for deliberate cross-slice product concepts, separate
from foundation UI primitives.

This package is currently scaffolded. Its public surface exports `VERSION` from
`src/index.ts`; future exports should be UI for shared product language, not a
generic component library.

## Belongs Here

- Cross-slice product UI concepts tied to shared domain language.
- Form/display contracts, view helpers, and small components that encode shared
  product semantics.
- UI validation or display models backed by shared driver-neutral schemas.

## Does Not Belong Here

- Product-agnostic primitives, themes, tokens, or shadcn base components.
- Slice-private screens and workflows.
- Direct use-case orchestration, server-only config, secrets, or drivers.

## Exports

- `@beep/ui`
- `@beep/ui/*`
- `VERSION`

## Development

```bash
bun run check
bun run test
bun run lint
```

## License

MIT
