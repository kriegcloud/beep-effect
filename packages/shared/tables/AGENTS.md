# @beep/tables Agent Guide

## Purpose & Fit

- Shared-kernel persistence boundary for cross-slice table and read-model shapes
  tied to shared product language.
- This package is currently scaffolded around `VERSION`; new exports must be
  product-semantic, not generic database helpers.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `VERSION` | Current package entry point. |
| future table modules | shared table/read-model shapes | Only when tied to shared product language. |

## Add Here

- Shared persistence shapes, read-model shapes, and mappings that multiple
  slices deliberately share as product language.

## Keep Out

- Generic Drizzle/SQL/database helpers, driver wrappers, migration tooling,
  slice-private tables, domain behavior, and application orchestration.

## Laws

- Keep table meaning tied to shared domain language.
- Do not turn this package into a generic driver or database utility package.
- Do not import product slices.

## Verifications

- `bunx turbo run check --filter=@beep/tables`
- `bunx turbo run test --filter=@beep/tables`
- `bunx turbo run lint --filter=@beep/tables`
