# @beep/shared-ui

Shared-kernel UI boundary for deliberate cross-slice product concepts, separate
from foundation UI primitives.

This package currently proves browser-safe Organization `Display` and `Form`
contracts plus the `primaryLabel` helper. Future exports should be UI for
shared product language, not a generic component library.

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

- `@beep/shared-ui`
- `@beep/shared-ui/*`
- `VERSION`
- `Entities.Organization`
- `Entities.Organization.Display`
- `Entities.Organization.Form`
- `Entities.Organization.primaryLabel`

## Development

```bash
bun run check
bun run test
bun run docgen
bun run lint
```

## License

MIT
