# adjunct Architecture — Module Map & FP/Proofs Analysis

> Reference analysis of `~/YeeBois/dev/adjunct` (Effect v3.17.7) — the design we are porting
> to Effect v4 and landing in `@beep/nlp`. Source of the "what" and "why"; the concrete v3→v4
> rename mechanics live in [v3-to-v4-port-map.md](./v3-to-v4-port-map.md) (P0 audit output).

## What adjunct is

A categorical/algebraic NLP engine that models text processing as **typed graph
transformations**. Its elegance comes from four things, in order of load-bearing-ness:

1. **Category theory as executable code, not comments.** Free/forgetful functor pairs are
   implemented as adjoint operation pairs (e.g. `sentencize ⊣ join`, `tokenize ⊣ rejoin`,
   paragraph/char/line/ngram/chunk/word). Text operations are Kleisli morphisms
   `A => Effect<B, E, R>`; aggregation is via monoids; the typeclass hierarchy
   (Functor → Applicative → Monad → Traversable → Foldable) is instantiated on operations.
2. **Schema-first, branded, typed strata.** `Ontology/Kind.ts` defines `TypedText<K>` over an
   11-stratum ontology — **Document, Paragraph, Sentence, Token, Character, Entity, Relation,
   Embedding, Dependency, Chunk, POS** — so kind constraints hold at compile time.
3. **Composable operations + a graph IR.** A registry/pipeline of composable operations runs
   over an `EffectGraph` / `AnnotatedTextGraph`, with a cost-estimating, caching executor.
4. **"Proofs."** fast-check property tests assert the categorical laws (adjunction triangle
   identities, monoid laws, functor/monad/traversable laws, graph round-trips). These double
   as machine-readable correctness specs — the reason the code is legible to agents.

It also ships an `@effect/ai` **MCP server** (stdio) exposing the engine as agent tools, and
a `web/` visualization (out of scope for the capability port).

## Module map (`src/`)

### Algebra & TypeClass — the categorical core
| Module | Role |
|---|---|
| `Algebra/Monoid.ts` | Generic monoid (`empty`, `combine`, `fold`). |
| `Algebra/NLPMonoids.ts` | String/collection/vector monoid instances. |
| `Algebra/NLPMonoid.ts` | Domain-specific aggregation monoids. |
| `TypeClass.ts` | `TextOperation<A,B,R,E>` as Kleisli morphism; Composable + adjoint-pair typeclasses. |

### Operations — composable pipeline + registry
| Module | Role |
|---|---|
| `Operations/Composable.ts` | `OperationBuilder` implementing the Functor→…→Foldable hierarchy. |
| `Operations/Definition.ts` | Operation definition shape. |
| `Operations/Extended.ts` | The 6 extra adjoint pairs (Paragraph, Char, Line, NGram, Chunk, Word). |
| `Operations/ImplementationProvider.ts` | Binds operation defs to implementations. |
| `Operations/OperationCompiler.ts` | Compiles operation graphs. |
| `Operations/Pipeline.ts` | Sequential/parallel composition with a strategy. |
| `Operations/Registry.ts` | Operation registry/catalog. |
| `Operations/SchemaASTMatchers.ts` | Matches on Schema AST — **highest v3→v4 risk** (AST API churn). |
| `Operations/Serialization.ts` | (De)serializes operations/results. |

### Graph — the IR the handoff contract is built on
| Module | Role |
|---|---|
| `EffectGraph.ts` | `DirectedGraph<GraphNode<A>, GraphEdge>` (check v4 built-in `effect/Graph`). |
| `TextGraph.ts` | Text-specialized graph. |
| `AnnotatedTextGraph.ts` | Annotation nodes linked as graph edges (tagged-as, lemma-of, entity-mention). |
| `GraphOps.ts` | Graph operations/helpers. |
| `GraphOperations/{Operation,Executor,Catalog,ResultStore,Schemas,Types,Errors}.ts` | Graph-operation morphisms + an executor with sequential/parallel strategy, cost estimation, validation, and result caching. |

### Services, Schema, Backends
| Module | Role |
|---|---|
| `Ontology/Kind.ts` | 11-stratum `TypedText<K>` kind system. |
| `Schema.ts` | `TextNode`/`TextEdge`/`NLPAnalysis` as Schema classes. |
| `NLPService.ts` | `Effect.Service`: sentencize, tokenize, paragraphize, posTag, … |
| `NLPBackend.ts` + `Backends/{WinkBackend,Composition}.ts` | Swappable backend interface; wink-nlp impl; composition. |
| `CorpusOps.ts` | Batch/corpus processing. |
| `TextOperations.ts` | Concrete text operations. |
| `Formatter.ts` | Pretty output (uses `@effect/printer` — verify v4 home). |

### MCP & streaming → becomes `drivers/nlp-mcp`
| Module | Role |
|---|---|
| `Mcp/Server.ts` | `McpServer.layerStdio` wiring; merges NLP + streaming toolkits. |
| `Mcp/Tools.ts` | 15 NLP tools (`nlp_sentencize/tokenize/paragraphize/pos_tag/lemmatize/entities/learn_custom_entities/ngrams/bag_of_words/stem/remove_stop_words/word_count/similarity/normalize/analyze`). |
| `Mcp/Schemas.ts` | Tool I/O schemas (currently zod → port to `McpSchema`/effect `Schema`). |
| `Mcp/Streaming/{TextStream,Jsonl,DatasetLoader,Cache,Pipeline,StreamingHandlers,StreamingTools}.ts` | 17 streaming/file-IO tools (`stream_*`): line/JSONL/sample/filter/stats/pipeline over large files, LRU+TTL cache. |
| `bin/mcp-nlp-server.ts` | stdio entrypoint (`NodeRuntime.runMain(runServer())`). |

### Examples (reference only)
`Program.ts`, `AdvancedDemo.ts` — example programs (no `Examples.ts` suffix convention).

## The proofs (full categorical fidelity — must survive the port)

adjunct's `test/` tree is the spec. Notable law suites:
- `test/Adjunction.test.ts` — triangle identities (GF→id, FG→id) for the adjoint pairs.
- `test/Algebra/Monoid.test.ts`, `Algebra/NLPMonoid(s).test.ts` — associativity + left/right identity.
- `test/AnnotatedTextGraph.laws.test.ts` — graph/annotation laws + round-trips.
- `test/NLPOperations.laws.test.ts` — operation-composition laws.
- `test/{TextGraph,NLPService,NLPService.linguistic,Backends/*,GraphOperations/Executor}.test.ts` — behavior.
- `test/arbitraries.ts` — shared fast-check generators (port to `effect/testing/FastCheck`).

These cite Mac Lane / Awodey / Riehl / Milewski. Per locked decision #4, **all** of this
apparatus (adjunctions, proofs, typeclass hierarchy, monoid laws, theory README) lands
permanently in `@beep/nlp`.

## Effect v3-isms to watch (detail in the port map)

- `@effect/ai/*` → `effect/unstable/ai/*` (McpServer in core; no new dep).
- `fast-check` → `effect/testing/FastCheck`; `Either` → `Result`.
- `@effect/platform/{FileSystem,Path}` → `effect/{FileSystem,Path}`;
  `@effect/platform/Ndjson` → `effect/unstable/encoding/Ndjson`.
- `@effect/typeclass` — confirm in-core v4 surface vs. vendor (P0 deps lane).
- `zod` (MCP schemas) → effect `Schema` / `McpSchema`.
- Schema **AST** APIs (`SchemaASTMatchers`, `Serialization`) shift the most — validate early.
- v3 `Tag`/`Layer` services → v4 `Context.Service` class syntax; `Effect.fnUntraced`;
  `Clock` over wall-clock globals.

## How this maps to the handoff contract

The generic graph IR we export (`TextChunk` → `Mention`/`Entity`/`Relation` →
`AnnotatedTextGraph` + PROV-O provenance + confidence) is adjunct's `AnnotatedTextGraph` +
`Schema` (`TextNode`/`TextEdge`) generalized and made product-neutral. `Entity`/`Relation`
carry a `type` discriminant + spans + provenance the downstream
`ip-law-knowledge-graph` mapping keys on to produce its 15 node / 11 edge OWL-grounded types.
