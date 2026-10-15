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

The historical `DocsESLintConfig` export remains available during the TS7 transition.
ESLint's `deprecated-apis` profile and governance helpers remain here until that lane moves
and merges. Documentation lint no longer loads the ESLint profile.

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
