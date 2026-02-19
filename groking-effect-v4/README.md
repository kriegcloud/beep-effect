# @beep/groking-effect-v4

Generated learning workspace for Effect v4.

## Goals

- Create a stable per-package/per-module/per-export surface map.
- Keep one `.ts` file per export using `<export-name>.<export-kind>.ts`.
- Preserve and reuse Effect JSDoc examples for fast, practical learning.

## Usage

Generate one module:

```bash
bun run generate:array
```

Generate all modules in a package:

```bash
bun run generate:effect
```

Bootstrap the full `effect-smol` surface:

```bash
bun run bootstrap
```

This writes `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/MANIFEST.json` with package/module/export counts and parser parity diagnostics.

## Template Groups

Export file content is generated from Handlebars templates in:

`src/generator/templates`

- `value-like.hbs`: `const`, `let`, `var`, `enum`, `namespace`, `reexport`
- `function-like.hbs`: `function`
- `class-like.hbs`: `class`
- `type-like.hbs`: `type`, `interface`

## Shared Runtime Utilities

Generated export files keep runtime/logging behavior in a shared module:

`src/runtime/Playground.ts`

This avoids duplicating error reporting and formatting logic in every export file while keeping each generated file executable and readable.
