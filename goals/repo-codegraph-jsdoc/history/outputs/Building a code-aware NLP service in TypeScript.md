# Building a code-aware NLP service in TypeScript

A purpose-built NLP service for a TypeScript code knowledge graph pipeline requires six interlocking modules — each solving a distinct problem no off-the-shelf library handles alone. **No single npm package covers code-aware sentence splitting, multi-provider token estimation, claim decomposition, embedding preparation, context budgeting, and identifier normalization.** The recommended architecture combines lightweight, focused libraries (`sbd`, `gpt-tokenizer`, `change-case`, `code-chunk`) with LLM-powered decomposition and the TypeScript compiler API, all wired through Effect-TS service patterns. This report presents concrete library choices, algorithms, regex patterns, and architectural decisions for each module, drawn from current npm packages, academic NLP research, and production codebases.

## Code-aware sentence splitting with protection zones

Standard NLP sentence boundary detectors fail catastrophically on code documentation. A period in `Effect.gen`, a dot in `v2.0.1`, or a period inside `` `Array<string>` `` triggers false splits that destroy verification units. The solution is a **mask-replace-split-restore** architecture — the same pattern `natural`'s `SentenceTokenizer` uses internally.

The recommended base library is **`sbd`** (sentence-boundary-detection): it's **~4KB**, handles abbreviations and URLs out of the box, supports custom abbreviation lists, and achieves ~95% accuracy on prose. It does not, however, understand backtick code spans or TypeScript identifiers — which is precisely where the protection zone layer comes in.

The algorithm works in four steps. First, extract protected regions using regex patterns applied in strict priority order: backtick code spans (`/`{1,3}[^`]+`{1,3}/g`) → URLs → JSDoc inline tags (`{@link ...}`) → TypeScript generics (`/\b[A-Z][a-zA-Z0-9]*<[^>]+>/g`) → dotted identifiers (`/\b[A-Z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)+\b/g`) → version numbers (`/\bv?\d+\.\d+(?:\.\d+)?(?:-[\w.]+)?\b/g`) → abbreviations. Replace each match with a unique placeholder (e.g., `\u0000PROT_0`). Second, run `sbd.sentences()` on the sanitized text. Third, restore placeholders in each resulting sentence. Fourth, return the array of verification units.

Priority order matters because **backtick spans may contain any other pattern** — masking them first prevents inner content from matching subsequent patterns. Edge cases to handle include sentences ending with code spans ("Returns `undefined`."), dotted identifiers without backticks at sentence boundaries, and nested backtick levels in markdown. The `sbd-ts` TypeScript rewrite or a direct fork offers the cleanest integration path. Avoid `compromise` (~200KB, English-only, no code awareness) and `wink-nlp` (requires a language model download) for this single task.

## Token estimation across Anthropic and OpenAI

Token counting for a dual-provider service requires a nuanced strategy because **Anthropic has not released a public tokenizer for Claude 3+**. The `@anthropic-ai/tokenizer` package (v0.0.4, last updated 3+ years ago) explicitly warns it is "no longer accurate" for Claude 3 models.

For OpenAI models, **`gpt-tokenizer`** (v3.4+) is the clear winner. Written in pure TypeScript, it claims to be the fastest tokenizer on npm — faster than WASM implementations — with the smallest memory footprint. It supports all current encodings including **`o200k_base`** (GPT-4o, GPT-4.1, o1, o3, o4-mini) and `cl100k_base` (GPT-4, GPT-3.5-turbo). Its `isWithinTokenLimit()` function enables early-termination checks without encoding the entire text, and per-encoding imports (`from 'gpt-tokenizer/encoding/o200k_base'`) minimize bundle size. It is **100% accurate** for OpenAI models, validated against Python tiktoken.

For Claude models, the architecture must be two-tiered. Use `gpt-tokenizer` with `cl100k_base` as a **fast local proxy** (add a **15–20% safety margin** to compensate for cross-tokenizer drift — typical differences run 10–20% on English text). For billing-grade accuracy, call Anthropic's **`client.messages.countTokens()` API**, which is free, supports text/images/PDFs/tools, and matches actual billing. The network latency (100–500ms) makes it unsuitable for real-time UI estimates but appropriate for pre-send budget validation.

In Effect-TS terms, model local tokenization as `Effect<TokenCount, never, never>` (infallible, no dependencies) and the Anthropic API call as `Effect<TokenCount, TokenCountError, AnthropicClient>` (fallible, requires service). Cache tokenizer instances since `gpt-tokenizer` loads synchronously. The practical error margins are: **gpt-tokenizer exact model = 100% / <1ms**; gpt-tokenizer as Claude proxy = ~80–90% / <1ms; Anthropic API = ~100% / 100–500ms; chars÷4 heuristic = ~85–90% / instant.

## Claim decomposition draws from four academic pipelines

Decomposing JSDoc descriptions into individually verifiable claims is the core of the De-Hallucinator. Four academic systems define the state of the art, each offering a transferable technique.

**FActScore** (EMNLP 2023) established the paradigm: split text into sentences, then use an LLM to decompose each sentence into "atomic facts" — short statements containing one piece of information. It averages **~4.4 atomic facts per sentence** and uses few-shot prompting with 2–3 examples. **SAFE** (NeurIPS 2024, Google DeepMind) improved on this by adding a reference-resolution step — replacing pronouns and vague references ("the function," "it") with actual identifiers — before decomposition. **Claimify** (Microsoft Research, ACL 2025) introduced a robust four-stage pipeline: sentence splitting → selection (filter unverifiable content) → disambiguation (resolve structural/referential ambiguity) → decomposition. **VeriScore** adds the critical distinction between verifiable and unverifiable claims, filtering out opinions and hypotheticals.

For code documentation, claims fall into three verification tiers. **AST-verifiable claims** (return types, parameter types/names, class hierarchy, import statements, modifiers like `async`/`static`) can be checked deterministically against the TypeScript AST using `ts-morph`. **Semantically verifiable claims** (behavioral assertions like "sorts in place," side effects like "writes to database," conditional behavior) require deeper analysis of function bodies and call graphs. **Unverifiable claims** (performance assertions like "O(n) time," subjective quality claims) should be flagged for human review.

The recommended pipeline adapts Claimify's four stages with code-specific structured outputs:

```typescript
interface DecomposedClaim {
  claim: string;                    // "The function returns a Promise<UserProfile>"
  claimType: 'return_type' | 'parameter_type' | 'behavioral' | 'side_effect' | ...;
  verifiability: 'ast_verifiable' | 'semantic' | 'unverifiable';
  sourceSpan: string;               // Original text fragment
}
```

A critical insight from the "Decomposition Dilemmas" paper (NAACL 2025): decomposition only improves verification when **evidence granularity matches claim granularity**. Coarse evidence (whole function body) paired with fine-grained claims actually degrades performance. The AST evidence extractor must produce facts at the same atomic level as the decomposed claims. No JS/TS claim decomposition libraries exist on npm — this module must be built with LLM structured outputs (Zod schemas with Claude or OpenAI).

## AST-aware chunking drives embedding quality for Voyage Code 3

Voyage Code 3 (`voyage-code-3`) offers a **32K token context window**, **2048-dimension** Matryoshka embeddings, and outperforms OpenAI's text-embedding-3-large by **13.8%** across 32 code retrieval benchmarks. It was specifically trained on natural language–programming language pairs, making it ideal for mixed JSDoc + code input.

The single most impactful decision for embedding quality is **AST-aware chunking over fixed-size chunking**. The CMU cAST paper (2025) shows +5.5 points on RepoEval with AST chunking, and the `code-chunk` library (npm, by Supermemory) demonstrates +65% recall improvement over fixed-size baselines. The `code-chunk` library is TypeScript-native, uses tree-sitter for parsing, and generates **contextualized text** — metadata-enriched representations optimized for embedding models.

The recommended input format prepends structural metadata before code:

```
# src/services/user.ts
# Module: @myapp/services
# Scope: UserService
# Defines: async getUser(id: string): Promise<User>
# Uses: Database, Logger
# Implements: IUserRepository

/** Retrieves a user by their unique identifier. */
async getUser(id: string): Promise<User> {
  return this.db.query('SELECT * FROM users WHERE id = ?', [id]);
}
```

Critical rules: **always set `input_type="document"` for indexing and `input_type="query"` for search** — Voyage handles instruction prefixes automatically; never add manual prefixes on top. Concatenate JSDoc directly with its code (never embed them separately). Target **1,000–4,000 non-whitespace characters** per chunk — smaller focused chunks produce better embeddings than filling the full 32K window. Create **multi-level embeddings**: function-level (full code + JSDoc), class-level (all member signatures), and module-level (exports summary + dependency graph).

## Context budget management with tiered graph serialization

Fitting 2-hop knowledge graph neighborhoods into LLM context windows requires a principled budget allocation strategy. Microsoft's **GraphRAG Local Search** provides the most production-tested pattern: allocate token budgets proportionally across content categories, then greedily fill each category by priority score.

The recommended allocation for a code knowledge graph:

- **Focal node**: 20% (the queried function/class in full detail)
- **1-hop neighbors**: 45% (direct dependencies with signatures + JSDoc + key implementation)
- **2-hop neighbors**: 25% (transitive dependencies, compressed to signatures only)
- **Graph structure**: 10% (relationship descriptions, module hierarchy)
- **Reserve 15–20% for response** and 5–10% for system prompt

Each graph node supports **five serialization tiers**: Level 0 (full source + JSDoc + metadata, ~500–5000 tokens) → Level 1 (signature + JSDoc summary + key notes, ~100–500 tokens) → Level 2 (signature + one-line purpose, ~20–50 tokens) → Level 3 (name + parameter types + return type, ~5–15 tokens) → Level 4 (batched: "Module X exports: fn1, fn2, fn3 — validation utilities," ~10–30 tokens). The greedy filling algorithm iterates through nodes sorted by a **composite priority score**:

```
priority = 0.30 × pagerank + 0.25 × hopPenalty + 0.25 × typeWeight + 0.20 × queryRelevance
```

Where `hopPenalty = 1/(1 + hopDistance)` (so 1-hop = 0.5, 2-hop = 0.33), `typeWeight` ranks type definitions (1.0) above function signatures (0.9) above function bodies (0.6) above tests (0.1), and `queryRelevance` uses cosine similarity between node and query embeddings. **Pre-compute PageRank and degree centrality at index time** using `graphology-metrics` (npm). Trigger compression (downgrade serialization tier) when context usage hits **80% of allocated budget** for any category. For 2-hop nodes that don't fit even at Level 3, batch them into Level 4 group summaries rather than dropping them entirely — a signal that a relevant module exists is more valuable than silence.

## Identifier normalization anchors the entire pipeline

Every other module depends on consistent text normalization. The **`change-case`** package (5.4M weekly downloads) provides the most battle-tested identifier splitting via its `split()` utility, correctly handling camelCase, PascalCase, acronyms (`parseXMLDocument` → `["parse", "XML", "Document"]`), numbers (`base64Encode` → `["base64", "Encode"]`), and mixed delimiters. For TypeScript type signature normalization, the **TypeScript compiler API** itself is authoritative: `ts.createSourceFile()` parses type strings into AST nodes without a full program, while `ts.TypeChecker.typeToString()` produces canonical string representations that expand aliases and normalize syntax (e.g., consistently choosing `string[]` vs `Array<string>`).

Research consistently shows **splitting identifiers before embedding improves NLP/IR quality** on code text. CodeBERT, CodeT5, and GraphCodeBERT all use subword tokenization that implicitly splits identifiers. Pre-splitting aligns code vocabulary with natural language vocabulary, improving cross-modal retrieval. The recommended preprocessing pipeline: Unicode normalize (NFC via `String.prototype.normalize('NFC')`) → extract code references (`{@link}`, backtick-quoted) → split identifiers (`change-case.split()`) → lowercase → optional stemming of natural language words (but not code keywords). **Preserve both forms** in the knowledge graph: original identifiers for display and linking, split lowercase form for search and embedding.

For `{@link}` tag resolution, extract namepaths via regex (`/\{@link(?:code|plain)?\s+([^|}\s]+)(?:\s*\|\s*([^}]+))?\}/g`), then resolve qualified names against the knowledge graph. TypeDoc's link resolution approach — using TypeScript's own symbol resolution with meaning qualifiers (`{@link Merged:namespace}` vs `{@link Merged:enum}`) — provides the most robust pattern to follow.

## Conclusion

The six modules form a coherent pipeline where each module's output feeds the next. Text normalization (`change-case` + TS compiler API) cleans input for sentence splitting (`sbd` + mask-restore). Split sentences feed claim decomposition (LLM structured outputs following Claimify's four-stage pattern). Claims route to AST-based verification. In parallel, normalized code + JSDoc feeds AST-aware chunking (`code-chunk`) into Voyage Code 3 embeddings. The context budget manager (`gpt-tokenizer` for counting, `graphology` for PageRank, greedy priority filling) assembles 2-hop neighborhoods for LLM calls.

Three insights emerged that weren't obvious at the outset. First, **no Claude 3+ tokenizer exists publicly** — the dual-mode proxy-plus-API architecture is not a convenience but a necessity. Second, **claim decomposition quality is bottlenecked by evidence granularity**, not decomposition sophistication — the AST evidence extractor must match the atomic level of claims. Third, **AST-aware chunking with contextualized metadata** delivers +65% recall improvement over naive fixed-size chunking — making `code-chunk` + tree-sitter the highest-leverage single dependency in the entire pipeline.