# @beep/ui

Shared UI component library with shadcn, Tailwind v4 theme, and Storybook

## Installation

```bash
bun add @beep/ui
```

## Usage

```ts
import { VERSION } from "@beep/ui"
```

## Development

```bash
# Add a shared shadcn component to the UI package
bun run ui-add button

# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Lint
bun run lint:fix
```

`ui-add` is intentionally scoped to `packages/common/ui`. It is meant for shared primitives, hooks, libs, and styles that should live in `@beep/ui`.

App-local shadcn blocks for `@beep/editor-app` now use `apps/editor-app/components.json`, while shared primitives should continue to be added through `bun run ui-add`.

## License

MIT
