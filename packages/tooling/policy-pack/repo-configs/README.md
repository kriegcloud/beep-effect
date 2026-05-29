# @beep/repo-configs

Shared docs-lane tooling configuration and governance data for the beep-effect monorepo.

## Installation

```bash
bun add @beep/repo-configs
```

## Usage

```ts
import { DocsESLintConfig, VERSION } from "@beep/repo-configs"
```

For repository root docs linting:

```mjs
import { DocsESLintConfig } from "@beep/repo-configs/eslint/DocsESLintConfig";

export default DocsESLintConfig;
```

The Effect-governance lane no longer runs through this ESLint bundle. The remaining ESLint surface here is intentionally scoped to JSDoc and TSDoc validation, while shared governance data such as hotspot metadata and the allowlist snapshot stay available for repo-local commands.

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Lint
bun run lint:fix
```

## License

MIT
