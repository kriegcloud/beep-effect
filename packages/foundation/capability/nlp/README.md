# @beep/nlp

Schema-first Effect v4 NLP primitives, wink-backed runtime services, and AI tool adapters.

## Installation

```bash
bun add @beep/nlp
```

## Modules

- `@beep/nlp/Core` exposes document, sentence, token, tokenization, and pattern models.
- `@beep/nlp/Wink` exposes the wink-backed runtime services and layers.
- `@beep/nlp/Tools` exposes AI tool schemas, toolkit wiring, and the positional export adapter.
- `@beep/nlp/Layers` exposes compatibility layer bundles matching the legacy tokenization-focused surface.

## Usage

### Tokenization

```ts
import { Effect } from "effect"
import { tokenizeToDocument } from "@beep/nlp/Core"
import { WinkLayerLive } from "@beep/nlp/Wink"

const document = await Effect.runPromise(
  tokenizeToDocument("Ada wrote code. Grace debugged it.", "history").pipe(
    Effect.provide(WinkLayerLive)
  )
)

console.log(document.sentenceCount) // 2
```

### Toolkit Export

```ts
import { Effect } from "effect"
import { exportTools, NlpToolkitLive } from "@beep/nlp/Tools"
import { WinkLayerAllLive } from "@beep/nlp/Wink"

const tools = await Effect.runPromise(
  exportTools.pipe(
    Effect.provide(NlpToolkitLive),
    Effect.provide(WinkLayerAllLive)
  )
)

console.log(tools.map((tool) => tool.name))
```

### Compatibility Layers

```ts
import { Effect } from "effect"
import { tokenCount } from "@beep/nlp/Core"
import { NLPAppLive } from "@beep/nlp/Layers"

const count = await Effect.runPromise(
  tokenCount("Ada wrote code.").pipe(Effect.provide(NLPAppLive))
)

console.log(count) // 4
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

Apache-2.0
