# @beep/repo-configs

Shared docs-lane tooling configuration and governance data for the beep-effect monorepo.

## Installation

```bash
bun add @beep/repo-configs
```

## Usage

The repository documentation lint lane uses repo-owned oxlint rules in `@beep/lint-rules`:

```sh
bun run beep lint jsdoc --package packages/tooling/library/repo-utils
bunx oxlint --config .oxlintrc.docs.json packages/tooling/library/repo-utils/src
```

Governance helpers live under `@beep/repo-configs/laws/*`; schema and snapshot
implementation modules live under `@beep/repo-configs/internal/laws/*`.
Both documentation and deprecated-API lint run on oxlint.

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
