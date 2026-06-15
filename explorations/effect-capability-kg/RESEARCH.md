# Research

## 2026-06-15 External Landscape

### Effect JSDoc and Capability Documentation

- Effect's public contribution guidance treats JSDoc as part of feature work:
  new features should document purpose, usage examples via `@example`,
  introduction version via `@since`, and optional organization via `@category`;
  `pnpm docgen` is listed in the validation command set. Source:
  <https://github.com/effect-ts/effect>.
- The local Effect v4 checkout goes beyond tag presence: the seed modules use
  structured prose sections (`**When to use**`, `**Details**`, titled examples)
  plus relationship tags such as `@see`. This is better treated as an upstream
  capability documentation dialect than as raw prose.

### Hooks and Agent Backpressure

- Codex has a current hook surface. Official docs say Codex can load lifecycle
  hooks from `hooks.json` files or inline `[hooks]` tables in active config
  layers, including project-local `.codex` layers once trusted. Source:
  <https://developers.openai.com/codex/config-advanced>.
- Codex hook docs describe review/trust flow for configured hooks and a `/hooks`
  UI for inspecting hook sources. Source:
  <https://developers.openai.com/codex/hooks>.
- Claude Code hooks are user-defined commands at lifecycle points; Anthropic's
  guide frames them as deterministic control for enforcing project rules.
  Source: <https://code.claude.com/docs/en/hooks-guide>.
- Claude Code's `PreToolUse` hook can inspect proposed tool inputs before
  execution and return allow/deny/ask/defer decisions, with optional input
  modification and additional context. Source:
  <https://code.claude.com/docs/en/hooks>.
- Fit: hooks are plausible as an enforcement/backpressure surface, but runtime
  hook APIs are product-specific and moving. This exploration should model a
  repo-owned advisory contract first, then map to Codex/Claude surfaces later.

### AST Parsing, Graphs, and Ontology-Grounded Retrieval

- `ts-morph` wraps the TypeScript compiler API to make setup, navigation, and
  manipulation of the TypeScript AST easier. Source: <https://ts-morph.com/>.
- Microsoft GraphRAG positions graph-based retrieval as structured and
  hierarchical compared with plain semantic-search snippets; its process
  extracts entities, relationships, and claims, builds communities, summarizes
  them, and supports local/global graph query modes. Source:
  <https://microsoft.github.io/graphrag/>.
- Microsoft's GraphRAG project describes GraphRAG as combining text extraction,
  network analysis, LLM prompting, and summarization into an end-to-end system.
  Source: <https://www.microsoft.com/en-us/research/project/graphrag/>.
- The GraphRAG paper frames a graph RAG approach as useful for query-focused
  summarization over private/unseen corpora where naive RAG struggles with
  global questions. Source: <https://arxiv.org/abs/2404.16130>.
- UFO is a coherent foundational ontology used as the foundation for OntoUML;
  UFO-A/B/C cover structural, event, social, and intentional aspects, and UFO-S
  extends service-related concepts. Source:
  <https://ontouml.readthedocs.io/en/latest/intro/ufo.html>.
- OG-RAG argues that domain-specific ontologies can ground retrieval by defining
  entities and relationships, producing a conceptually grounded context for LLMs
  rather than relying only on domain-agnostic embeddings. Source:
  <https://arxiv.org/html/2412.15235v1>.
- Fit: external GraphRAG/OntologyRAG work validates the shape of graph +
  ontology + retrieval, but this repo's doctrine requires semantic extraction to
  stay a candidate/cache layer over deterministic source evidence.

## 2026-06-15 In-Repo Capability Inventory

### Architecture Ownership and Authority Constraints

- The binding architecture standard routes repo operations, generators, policy
  packs, and automation to `tooling`; it reserves `foundation` for
  domain-agnostic substrate, `drivers` for external wrappers, and `shared` for
  deliberate cross-slice product language. Sources:
  `standards/ARCHITECTURE.md`, `standards/architecture/07-non-slice-families.md`.
- `tooling` has a small kind catalog: `library`, `tool`, `policy-pack`, and
  `test-kit`. A capability KG for coding-agent guidance starts as developer
  operational tooling, not product behavior or shared-kernel language. Source:
  `standards/architecture/07-non-slice-families.md`.
- The memory architecture standard says deterministic code intelligence is the
  authority layer: AST-derived code facts, type resolution, dependency graphs,
  and JSDoc are procedural memory outside semantic-memory degradation. Semantic
  graphs, vectors, and LLM-inferred facts are managed caches or candidate
  projections with provenance. Sources: `standards/memory-architecture/README.md`,
  `standards/memory-architecture/01-memory-layer-taxonomy.md`,
  `standards/memory-architecture/05-context-graph-capability-assessment.md`.

### Existing Repo Bricks to Compose

- `@beep/repo-utils` already owns repo-analysis utilities, including
  `TSMorphService` for scoped ts-morph graph extraction, deterministic JSDoc
  derivation, symbol query/search, and JSDoc validate/plan/apply/drift flows.
  Source: `packages/tooling/library/repo-utils/README.md`.
- `@beep/repo-codegraph` already owns deterministic repo export lookup over
  `standards/repo-exports.catalog.jsonc`, applies package import policy, ranks
  public exports, and returns boundary advice. Source:
  `packages/tooling/library/repo-codegraph/README.md`.
- `@beep/repo-docgen` is the repo-local documentation generator, and the root
  `bun run docgen` path is Turbo-first. Source:
  `packages/tooling/tool/docgen/README.md`.
- The JSDoc inventory generator currently requires export-level `@example`,
  `@category`, and `@since`, module-level `@since`, forbids `@module` and
  `@template`, and tracks custom tags such as `@effects`, `@precondition`,
  `@postcondition`, and `@invariant`. Source:
  `packages/tooling/tool/cli/src/commands/Quality/internal/JSDocDocumentationInventory.ts`.
- The repo export catalog generator extracts declaration JSDoc text,
  categories, `@since`, tags, summary, source path, and source line into catalog
  entries. Source:
  `packages/tooling/tool/cli/src/commands/Quality/internal/RepoExportsCatalog.ts`.
- The live canonical category taxonomy is in
  `packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts`; it
  exposes a closed canonical set, accepted migration aliases, rejected category
  values, and normalization helpers. Note: `.patterns/jsdoc-documentation.md`
  still points at the older CLI path, so the packet should record this as
  documentation drift to reconcile later.
- Semantic-web/RDF primitives exist: `@beep/rdf` owns pure RDF/linked-data
  value models, while `@beep/semantic-web` has RDF, JSON-LD, PROV, evidence,
  services, and adapter subpaths. Sources:
  `packages/foundation/modeling/rdf/README.md`,
  `packages/foundation/capability/semantic-web/README.md`.
- `@beep/ai-sync` models AI agent config schemas across Claude Code, Codex, and
  other tools, including skills, rules, commands, hooks, plugins, and MCP.
  Source: `packages/tooling/library/ai-sync/README.md`.

### Effect v4 Seed Wedge: JSDoc Grammar as Graph Evidence

- `Combiner.ts` top-level docs define reusable rules for merging two values;
  the `Combiner` symbol docs include `**When to use**`, an example,
  `@see`, `@category models`, and `@since 4.0.0`. The prose also points to
  `Struct.makeCombiner`, `Option.makeCombinerFailFast`, and `Reducer` as
  adjacent capabilities. Source:
  `.repos/effect-v4/packages/effect/src/Combiner.ts`.
- `Reducer.ts` top-level docs define reusable reduction strategies; `Reducer`
  extends `Combiner`, adds `initialValue` and `combineAll`, and names prebuilt
  reducers such as `Number.ReducerSum`, `String.ReducerConcat`, and
  `Boolean.ReducerAnd` / `ReducerOr`. Source:
  `.repos/effect-v4/packages/effect/src/Reducer.ts`.
- `Filter.ts` top-level docs define composable checks that can transform values
  using `Result`, with regular and effectful filter interfaces plus constructors
  such as `make` and `makeEffect`. Source:
  `.repos/effect-v4/packages/effect/src/Filter.ts`.
- Adjacent modules repeat the same pattern: `Option` contains `makeReducer`,
  `makeCombinerFailFast`, and `makeReducerFailFast`; `Struct` exposes
  `makeCombiner` and `makeReducer`; `Array` exposes filter/reducer helpers; and
  `Number`, `String`, and `Boolean` expose prebuilt reducer values. Sources:
  `.repos/effect-v4/packages/effect/src/{Option,Struct,Array,Record,Number,String,Boolean}.ts`.

### Usage Gap and Repo Export Visibility

- Direct in-repo use of `Filter` from `effect` was found in
  `packages/agents/server/src/AssistantTurn/AnthropicTurnKernel.ts`, where
  `Filter.makeEffect` validates streamed assistant-turn slices and routes
  successes/failures through `Result`.
- Direct in-repo use of `Combiner` and `Reducer` as top-level imports was NOT
  FOUND in `packages` / `apps` / `standards` searches for this packet.
- The repo export catalog already exposes adjacent Effect v4 capabilities
  through `@beep/utils`, including `Array.dropWhileFilter`,
  `Array.takeWhileFilter`, `Array.partition`, `Option.makeCombinerFailFast`,
  `Option.makeReducer`, `Option.makeReducerFailFast`,
  `Struct.makeCombiner`, `Struct.makeReducer`, `Number.ReducerSum`,
  `Number.ReducerMultiply`, `Number.ReducerMin`, `Number.ReducerMax`,
  `String.ReducerConcat`, `Bool.ReducerAnd`, and `Bool.ReducerOr`. Source:
  `standards/repo-exports.catalog.md`.
- Interpretation: the problem is not absence from the dependency graph; it is
  low human/agent discoverability and low call-site pressure despite rich source
  documentation.

### Relationship to Existing Packet

- `goals/repo-codegraph-jsdoc` is broad prior art for deterministic codegraph,
  JSDoc fibration, NLP, reasoning, graph projection, embeddings, MCP/query, and
  closed-loop agent validation. This packet should be a focused child: Effect
  capability guidance and hookable agent steering, seeded by Effect v4 modules.

## 2026-06-15 Constraints Discovered

- Authority boundary: deterministic AST/type/JSDoc/source-span facts are the
  source of truth. Ontology classification, embeddings, and LLM summaries are
  derived/candidate layers unless tied back to deterministic evidence.
- Package boundary: first implementation home should be `tooling`, likely a
  `library` plus optional `tool`/quality path later. Do not introduce an
  `agents` architecture family or push runtime-specific assistant config into
  architecture doctrine.
- Dual dialect: Effect v4 JSDoc and this repo's JSDoc law overlap but differ.
  Effect v4's structured prose sections are upstream capability evidence; this
  repo's tag/category/custom-tag rules are local normalization and agent-context
  policy.
- Enforcement ratchet: pre-write hooks can advise/block later, but hard
  enforcement must wait until false positives are measured. Start with advisory
  findings that cite KG evidence.
- Ontology bootstrap: start with a tiny upper-aligned ontology kernel. Ingest
  deterministic facts first, classify them, and use unclassified/misclassified
  facts to drive ontology revisions. Avoid designing a full UFO-derived ontology
  before the seed wedge proves useful.
- Runtime drift: Codex and Claude hook/sub-agent surfaces are current but
  changeable. Store repo-owned contracts first, then map to runtime-specific
  config through `@beep/ai-sync` or later package work.
- NOT FOUND: a current packet-local manifest or goal packet specifically for
  Effect capability KG already existed before this session.
