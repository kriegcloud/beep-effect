# @beep/pandoc-ast

Schema-first Pandoc JSON AST mirror and compatibility adapters.

## Scope

`@beep/pandoc-ast` is a pure modeling package. It does not shell out to
`pandoc`, manage DOCX files, or make document-AST product decisions. The first
slice mirrors enough Pandoc JSON to evaluate md-core round-trip compatibility
and to report common DOCX-origin gaps, including custom style wrappers, notes,
math, tables, raw Markdown/HTML, and task-list state.

## Usage

```ts
import * as Effect from "effect/Effect"
import { decodePandocJsonString, pandocToDocument } from "@beep/pandoc-ast"

const result = Effect.runSync(
  decodePandocJsonString(`{"pandoc-api-version":[1,23,1],"meta":{},"blocks":[]}`).pipe(
    Effect.flatMap(pandocToDocument)
  )
)

console.log(result.report.profile)
```

## Fixtures

Committed fixtures live in `test/fixtures/`.

- `green-core.pandoc.json` covers the Markdown-origin md-core profile and should
  map with `report.profile === "supported"`.
- `gap-docx-styles.pandoc.json` captures the first DOCX-origin gap constructs
  without requiring a local `pandoc` executable in normal tests.

Later driver and fixture-pipeline goals should replace or augment these with
generated fixtures that record exact command provenance.

## Development

```bash
bun run build
bun run check
bun run test
bun run type-test
bun run test:integration
bun run lint:fix
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/pandoc-ast` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
