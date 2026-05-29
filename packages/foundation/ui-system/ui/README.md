# @beep/ui

Shared UI component library: shadcn primitives (Base UI, not Radix), a Tailwind v4 theme, and Storybook.

## Installation

```bash
bun add @beep/ui
```

## Usage

```ts
import { Button } from "@beep/ui/components/button";
import { cn } from "@beep/ui/lib/utils";
```

Components live at `src/components/` and are exported via the `./components/*` subpath
(`@beep/ui/components/<name>`). A few pristine primitives also live under
`src/components/ui/` (`@beep/ui/components/ui/<name>`) and are consumed by apps directly.

## Adding a shadcn component

The package is configured for the `base-nova` (Base UI) style with the Phosphor icon
library (`components.json`). The `ui` alias resolves to `@beep/ui/components`, so new
primitives land at `src/components/` next to the rest.

```bash
bunx --bun shadcn@latest add <name> --yes --cwd packages/foundation/ui-system/ui
```

Notes:
- `shadcn` may pin or de-catalog dependencies in `package.json` — restore them to
  `catalog:` and add any new dep to the workspace catalog in the root `package.json`.
- Decline overwriting existing files (answer `n`) when a component pulls in primitives
  you already have.
- Generated code must be normalized to repo conventions: Phosphor icons, `cn` from
  `@beep/ui/lib/utils`, `@beep/utils` helpers (`A`/`P`/`Str`/`Struct`) over native
  `Array`/`String`/`Object` methods, strict boolean expressions, and house
  `@category`/`@since` JSDoc on exports.

## Storybook stories

Stories live in `stories/` (NOT under `src/`), mirroring `src/components/`
(`stories/components/<name>.stories.tsx`). They import components via the
`@beep/ui/components/<name>` alias.

- Discovered by `.storybook/main.ts` (`../stories/**/*.stories.@(ts|tsx)`).
- Type-checked by `tsconfig.stories.json`, which is wired into `bun run check`.
- Linted by Biome (the `stories/` glob is part of `bun run lint`).
- Story files are subject to the same `@effect/language-service` rules as `src`
  (no `async`, no wall-clock `Date`/random/timers, strict boolean expressions);
  `play` functions are synchronous and return a promise chain.

## Development

```bash
# Build
bun run build

# Type check (src + stories)
bun run check

# Unit tests
bun run test

# Lint / autofix
bun run lint:fix

# Storybook dev server (port 6006)
bun run storybook

# Run stories as browser tests (Playwright Chromium)
bun run test:storybook
```

## License

Apache-2.0
