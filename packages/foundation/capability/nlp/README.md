# @beep/nlp

Schema-first Effect v4 NLP primitives, backend contracts, text-graph models, and AI tool contracts.

## Installation

```bash
bun add @beep/nlp
```

## Modules

- `@beep/nlp/Core` exposes document, sentence, token, tokenization, pattern, vectorization, and similarity models.
- `@beep/nlp/Tools` exposes AI tool schemas, the `NlpToolkit` contract, and the positional export adapter.
- `@beep/nlp/Ontology` exposes the stratified text ontology (the typed-text "kinds").
- `@beep/nlp/Graph` exposes annotated text-graph carriers, typeclass hierarchy, and graph-level operations.
- `@beep/nlp/Operations` exposes the Kleisli category of composable operations.
- `@beep/nlp/Backend` exposes the pluggable `NLPBackend` contract.
- `@beep/nlp/Handoff` exposes the product-neutral generic IR handoff contract.

Concrete runtime implementations live in driver packages. The wink-nlp runtime is provided by `@beep/wink`.

## Usage

### Toolkit Contract

```ts
import { NlpToolkit, NlpTools } from "@beep/nlp/Tools"

console.log(Object.keys(NlpToolkit.tools))
console.log(NlpTools.length)
```

### Tool Export

```ts
import { Effect } from "effect"
import { exportTools } from "@beep/nlp/Tools"
import { WinkNlpToolkitLive } from "@beep/wink"

const tools = await Effect.runPromise(
  exportTools.pipe(Effect.provide(WinkNlpToolkitLive))
)

console.log(tools.map((tool) => tool.name))
```

AI tool `success` schemas use `S.toEncoded(...)` so exported tool contracts
describe transport-safe JSON-compatible output. The corresponding domain
schemas remain available in `@beep/nlp/Tools/_schemas` for in-process decoding,
encoding, and test generation.

### Tokenization With A Driver

```ts
import { Effect } from "effect"
import { tokenizeToDocument } from "@beep/nlp/Core"
import { WinkLayerLive } from "@beep/wink"

const document = await Effect.runPromise(
  tokenizeToDocument("Ada wrote code. Grace debugged it.", "history").pipe(
    Effect.provide(WinkLayerLive)
  )
)

console.log(document.sentenceCount) // 2
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

## Consumers (record + gate)

Per [`standards/07-non-slice-families.md`](../../../../standards/07-non-slice-families.md),
this capability records who depends on it.

| Consumer (package) | Since | Surface used | Notes |
| --- | --- | --- | --- |
| `@beep/wink` | 2026-05 | `@beep/nlp/Core`, `@beep/nlp/Backend`, `@beep/nlp/Tools` | wink-nlp driver implementing tokenization, backend, corpus, similarity, and tool handlers. |
| `@beep/nlp-mcp` | 2026-05 | `@beep/nlp/Backend` (`NLPBackend`) | MCP driver re-exposing the backend catalog as stdio MCP tools. |

**Gate:** a new public subpath may be added only when (a) it has a documented owner,
(b) at least one test exercises the subpath, and (c) this table is updated in the same
change. Promotion to a shared-kernel requires >=2 real consumers.

## License

Apache-2.0
