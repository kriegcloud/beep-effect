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
- `@beep/nlp/Ontology` exposes the stratified text ontology (the typed-text "kinds").
- `@beep/nlp/Graph` exposes the annotated text-graph carriers (`Schema`), the monoidal
  typeclass hierarchy (`TypeClass`), and graph-level operations (`Operation`, `GraphOps`,
  `GraphOperations/`).
- `@beep/nlp/Operations` exposes the Kleisli category of composable operations
  (`Definition`, `Composable`).
- `@beep/nlp/Backend` exposes the pluggable `NLPBackend` contract and the `WinkBackend`
  implementation.
- `@beep/nlp/Handoff` exposes the product-neutral generic IR handoff contract
  (`TextChunk`/`Mention`/`Entity`/`Relation`/`AnnotatedDocument`, version `nlp-ir/1.0`).

## Categorical architecture

`@beep/nlp` is a faithful Effect v4 port of the [`adjunct`](https://github.com/mepuka/adjunct)
text-graph engine: text strata are objects, NLP operations are morphisms in the Kleisli
category of the Effect monad, structure-building/forgetting passes form **adjunctions**
(free ⊣ forgetful, query ⊣ index), results combine through **monoids**, the graph is
consumed/built with **F-algebras** (cata/ana), and every law is a machine-checked FastCheck
**proof**. The full theory write-up — mathematics mapped to modules — lives in
[`THEORY.md`](./THEORY.md). This package stays product-neutral; it is the upstream
half of the `ip-law-knowledge-graph` initiative.

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

## Consumers (record + gate)

Per [`standards/07-non-slice-families.md`](../../../../standards/07-non-slice-families.md),
this capability records who depends on it.

| Consumer (package) | Since | Surface used | Notes |
| --- | --- | --- | --- |
| `@beep/nlp-mcp` | 2026-05 | `@beep/nlp/Backend` (`NLPBackend`, `WinkBackend`), `@beep/nlp/Wink` (`WinkEngine`) | MCP driver re-exposing the backend catalog as stdio MCP tools. |

**Gate:** a new public subpath may be added only when (a) it has a documented owner,
(b) at least one test exercises the subpath, and (c) this table is updated in the same
change. Promotion to a shared-kernel requires ≥2 real consumers (currently 1).

## License

Apache-2.0
