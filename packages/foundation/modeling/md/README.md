# @beep/md

An Effect native markdown library

## Installation

```bash
bun add @beep/md
```

## Usage

```ts
import { Md } from "@beep/md"
import { Result } from "effect"

const document = Md.make([Md.h1`Hello`, Md.p`World`])
const markdown = Md.render(document)

console.log(Result.getOrThrow(markdown)) // "# Hello\n\nWorld"
```

## Rendering contract

`Md.render`, `Md.renderHtml`, and `Md.renderWith` are synchronous pure render APIs that return
`Result.Result<Output, RenderError>`. `Result` is intentional here: it captures adapter failures without
requiring an `Effect` runtime for pure rendering. The `renderUnsafe`, `renderHtmlUnsafe`, and `renderWithUnsafe`
mirrors are available for boundaries that deliberately call the adapter directly and allow its original exception to
throw.

The `Result` render APIs are adapter-failure-safe, and the default HTML renderer escapes text-like inline content
including `Md.rawHtml(...)`. Treat trusted HTML boundaries as explicit adapter decisions: if a custom adapter or
external branded `HtmlFragment` introduces unsafe HTML, that boundary must be audited or sanitized upstream.

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Type tests
bun run type-test

# Type tests through Turbo
bunx turbo run type-test --filter=@beep/md

# Lint
bun run lint

# Documentation
bun run docgen

# Repair formatting/lint issues
bun run lint:fix
```

## License

MIT
