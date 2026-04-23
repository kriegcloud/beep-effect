# @beep/docgen

A repo-local documentation generator for `beep-effect`.

`@beep/docgen` is owned inside this monorepo at `tooling/docgen`. It is a private workspace package and the current repo entrypoints run it locally rather than installing it from a registry.

## Current Entry Points

- `bun run docgen`
- `bun run docs:aggregate`
- `beep-cli docgen run`
- `bun run beep docgen status --verbose`
- `bun run beep docgen init -p <workspace-path>`

`bun run docgen` is the Turbo-first workspace flow. It runs `bunx turbo run docgen` so package generation stays visible in the Turbo task UI, then follows with `bun run docs:aggregate` to copy the generated package docs into the root `docs/` layout.

`beep-cli docgen run` remains the direct/manual repo CLI path when you want the one-shot generation-and-aggregation flow with shared selector handling, for example `beep-cli docgen run --filter=@beep/types`.

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
