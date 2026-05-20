# Claude Guide

## Mission
Ship reliable code with effect first and schema first patterns.

## Rules
- Keep changes focused and testable.
- Prefer service composition over global state.
- Prefer match helpers over conditional chains.
- Prefer dedicated helper modules such as the `String` and `Equal` modules from `effect`; keep root `effect` imports for core combinators.
- Prefer tersest equivalent helper forms when behavior is unchanged: direct helper refs over trivial lambdas, `flow(...)` for passthrough `pipe(...)` callbacks, and shared thunk helpers when already in scope.
- In `packages/**/{test,dtslint}/**/*.{ts,tsx}`, import package source through `@beep/*` package aliases instead of relative paths into any workspace `src/`; keep relatives only for local helpers, fixtures, snapshots, and other non-`src` test files.
- Apply schema defaults when safe.
- Keep quality gates passing.
- For local docgen edit loops, prefer `bun run docgen:local`; reserve
  `bun run docgen` for the explicit full repo docgen proof.
- Before recreating shared helpers, schemas, utilities, models, or known symbols,
  search `standards/repo-exports.catalog.md` or
  `standards/repo-exports.catalog.jsonc`; refresh with
  `bun run repo-exports:catalog` and verify with
  `bun run repo-exports:catalog:check`.
