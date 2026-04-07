# @beep/docgen

A repo-local documentation generator for `beep-effect`.

`@beep/docgen` is owned inside this monorepo at `tooling/docgen`. It is a private workspace package and the current repo entrypoints run it locally rather than installing it from a registry.

## Current Entry Points

- `bun run docgen`
- `bun run beep docgen status --verbose`
- `bun run beep docgen init -p <workspace-path>`
- `bun run beep docs aggregate --clean`

The root `docgen` script fans out to workspace `docgen` tasks through Turbo, then aggregates package-local docs into the root `docs/` tree with the shared repo CLI helper.

## Development

```bash
cd tooling/docgen
bun run build
bun run check
bun run test
bun run lint:fix
```

## License

MIT
