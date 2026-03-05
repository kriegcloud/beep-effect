# @beep/repo-configs

An library for shared build & tooling configurations

## Installation

```bash
bun add @beep/repo-configs
```

## Usage

```ts
import { ESLintConfig, VERSION } from "@beep/repo-configs"
```

For repository root ESLint:

```mjs
import { ESLintConfig } from "@beep/repo-configs";

export default ESLintConfig;
```

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
