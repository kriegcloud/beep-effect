# @beep/shared-ui Agent Guide

## Purpose & Fit

- Shared-kernel UI boundary for deliberate cross-slice product concepts,
  separate from foundation UI primitives.
- This package currently proves browser-safe Organization `Display` and `Form`
  contracts plus the `primaryLabel` helper. New exports must encode shared
  product semantics, not generic component-library behavior.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `VERSION`, `Entities` | Current package entry point. |
| `src/entities/Organization/` | `Display`, `Form`, `primaryLabel` | Browser-safe Organization contracts and helpers. |

## Add Here

- Cross-slice product UI concepts, form/display contracts, and small components
  backed by shared driver-neutral schemas.

## Keep Out

- Product-agnostic primitives, themes, tokens, base shadcn components,
  slice-private screens, direct use-case orchestration, server-only config,
  secrets, and drivers.

## Laws

- UI may consume shared domain language for display and form validation.
- UI behavior should go through client services/state instead of directly
  orchestrating use-cases.
- Keep generic UI substrate in foundation UI-system packages.

## Verifications

- `bunx turbo run check --filter=@beep/shared-ui`
- `bunx turbo run test --filter=@beep/shared-ui`
- `bunx turbo run docgen --filter=@beep/shared-ui`
- `bunx turbo run lint --filter=@beep/shared-ui`
