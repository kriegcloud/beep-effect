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

## Template Groups

Export file content is generated from Handlebars templates in:

`src/generator/templates`

- `value-like.hbs`: `const`, `let`, `var`, `enum`, `namespace`, `reexport`
- `function-like.hbs`: `function`
- `class-like.hbs`: `class`
- `type-like.hbs`: `type`, `interface`
