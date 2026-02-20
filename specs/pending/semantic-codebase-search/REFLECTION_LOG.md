# Reflection Log — Semantic Codebase Search

> Cumulative learnings updated after each phase

---

## P0: Scaffolding (2026-02-19)

**What went well:**
- User identified the core problem clearly: AI agents don't discover existing code before creating new
- Clean separation of concerns in the initial prompt

**What to improve:**
- N/A (spec creation)

---

## P1: Discovery (2026-02-19)

**What went well:**
- Parallel research agents (4 simultaneous) covered landscape efficiently
- Second research wave (4 more agents) for documentation-specific research was valuable
- Total research: 8 agents, ~296KB of output, comprehensive coverage

**Key discoveries:**
1. **Greptile's code→English translation insight** — Embedding raw code is a trap. Translating to natural language first improves retrieval by ~12%.
2. **User's annotation-driven counter-insight** — Even better than LLM translation: extract enforced JSDoc + Schema annotations deterministically. Zero cost, higher quality, self-reinforcing.
3. **Sourcegraph moved AWAY from embeddings** — Significant data point against embedding-only approaches. Hybrid BM25 + vector is the consensus.
4. **@effect/docgen already uses ts-morph + doctrine** — We can build on its Parser APIs rather than starting from scratch.
5. **The hook pattern is the multiplier** — UserPromptSubmit auto-injection means every prompt gets relevant context without explicit "research first" instructions.

**Decisions locked:**
- Annotation-driven over LLM translation
- Nomic CodeRankEmbed (137M, local) for embeddings
- LanceDB for vector storage
- Hybrid BM25 + vector + RRF
- Build on docgen Parser APIs + custom Effect extractors
- UserPromptSubmit hook for transparent auto-injection

**Patterns to promote (quality score pending):**
- "Annotation-driven indexing" — enforce documentation, extract deterministically, embed natural language metadata
- "UserPromptSubmit auto-injection" — hook-based transparent context injection for AI coding agents
- "Hybrid search with RRF" — BM25 keyword + vector semantic + Reciprocal Rank Fusion

**What to improve for P2:**
- Research was thorough but produced volume. P2 synthesis needs to be more focused and produce concrete specifications, not more prose.
- Need clear TypeScript interfaces, not just descriptions.
- Need concrete eslint rule configurations, not just recommendations.

---

## P2: Evaluation & Design (2026-02-19)

**What went well:**
- Parallelized 6 document writes + 1 delegated background agent — all 7 outputs produced in a single pass
- Research-to-design pipeline worked well: P1's 296KB of research distilled into concrete interfaces and configs
- Zero TBD placeholders — every design decision was resolvable from P1 research
- Docgen evaluation (delegated to codebase-researcher) provided the critical hybrid recommendation backed by source analysis

**Key design decisions made:**
1. **Hybrid extractor (not pure docgen reuse)** — Docgen is Effect v3, can't import directly. Reimplement its JSDoc extraction patterns (~150 LoC) + add 5 new Effect-specific extractors (~200 LoC). Total ~400 LoC, ~7 hours.
2. **BM25-only hooks (not full hybrid)** — UserPromptSubmit hooks can't afford 2-3s embedding model cold start. BM25 keyword search is fast enough for auto-injection. Full hybrid search available via MCP tool.
3. **4 MCP tools (search_codebase, find_related, browse_symbols, reindex)** — Covers all use cases. Token budgets: 800-1300 for default search, 430-630 for related, 200-1000 for browse.
4. **IndexedSymbol as canonical schema** — 40+ fields covering identity, classification, NL text, relationships, code context, and derived fields. One symbol = one LanceDB row = one search result.
5. **RRF with k=60** — Standard smoothing constant from literature. Normalizes to 0-1 for display.
6. **Gradual ESLint adoption** — Phase 1 (error on presence, warn on quality) → Phase 2 (error on quality) → Phase 3 (full enforcement including custom rules).

**Patterns discovered:**
- "Schema annotation bridge" — JSDoc describes the *why*, Schema .annotate() describes the *what*. Both are extracted and both contribute to embeddings, covering different search intents.
- "Kind classification decision tree" — 9-rule priority chain maps AST patterns to SymbolKind. Prevents ambiguous classification.
- "Hook caching via BM25 fallback" — When you can't afford cold model load, BM25 keyword search provides adequate auto-injection quality. Full semantic search is opt-in via MCP tool.

**What to improve for P3:**
- P2 outputs are self-consistent but not cross-validated — P3 should verify that IndexedSymbol fields align with what the extractor can actually produce
- The extractor design is implicit in docgen-vs-custom-evaluation.md — needs to be made explicit as a build plan
- Need to define the exact ts-morph Project configuration (compilerOptions, source roots) for the extractor

---

## P3: Synthesis & Planning (2026-02-19)

**What went well:**
- Cross-validation caught 6 gaps between P2 documents — none blocking, all with clear resolutions
- Task decomposition landed at 18 tasks (under the 20-task limit), 25 hours total
- Package scaffolding follows established tooling/cli template exactly — no novel patterns
- Three parallelism opportunities identified that can save ~3 hours on the critical path

**Key synthesis decisions:**
1. **Two-pass import resolution** — IndexedSymbol `imports` field needs a symbol ID registry built in pass 1 before resolving imports in pass 2. Adds complexity to SymbolAssembler (T9) but makes graph traversal (find_related imports/imported-by) work correctly.
2. **21 LanceDB columns (not 18)** — The mapping table in indexed-symbol-schema.md was incomplete; the SymbolRow interface in embedding-pipeline-design.md is authoritative with end_line, effect_pattern, and title columns added.
3. **Deferred `@category` enforcement** — No ESLint rule for requiring @category exists in eslint-plugin-jsdoc. Accepted as Phase 2 custom rule rather than blocking P4a.
4. **Hook vs MCP formatting intentionally different** — Hooks optimize for minimal context (bullet list, 120-char sigs); MCP tools optimize for completeness (headers, 200-char sigs, scores). Same data, different presentation.
5. **P4a and P4b-T5 can start in parallel** — Package scaffold has no dependency on ESLint/docgen setup, enabling cross-phase parallelism.

**Gaps found and addressed:**
| Gap | Resolution |
|-----|-----------|
| `imports` needs two-pass extraction | Post-processing in SymbolAssembler |
| LanceDB mapping table incomplete | SymbolRow interface is authoritative |
| No ESLint rule for @category | Custom rule in Phase 2 |
| No ESLint rule for @provides/@depends on layers | Extractor validation warning |
| Hook vs MCP format inconsistency | Intentional, documented |
| @ignore in ESLint but not tsdoc.json | Cosmetic, add to tsdoc.json |

**What to improve for P4:**
- The 2-hour estimate for T3 (backfill existing JSDoc) may be aggressive — depends on how many exports lack descriptions. Consider splitting into per-package sub-tasks if needed.
- T10 (EmbeddingService) depends on ONNX model download (~521MB) — first run will be slow. Document this in the setup instructions.
- The critical path (16.5 hours) has no slack — any task overrun cascades. Build in a buffer session between P4b and P4c.

### P3 Addendum (2026-02-20)

**What was refined:**
- Re-scaffolded `outputs/package-scaffolding.md` with explicit `docgen.json`, full root updates, and test-mirroring rules tied directly to `src/`.
- Reworked `outputs/task-graph.md` so all 18 tasks include explicit dependency edges, concrete P2 input docs, output file lists, and <=2h estimates.
- Tightened `outputs/cross-validation-report.md` into 6 named gaps (CV-01..CV-06) with direct mapping to P4 task owners.

**Additional implementation learnings:**
1. **MCP relation normalization needs early design** — `@provides`/`@depends` text values should be normalized to symbol IDs during assembly to avoid ambiguous `find_related` matches.
2. **LanceDB mapping drift is a doc risk** — keep the `SymbolRow` schema as the single authority and derive markdown mapping from code, not vice versa.
3. **Lint-only enforcement is insufficient for kind-specific requirements** — layer-specific tags are better enforced in extractor validation where `kind` is known.

**Execution improvement for P4:**
- Run T01/T05 in parallel immediately, but gate T18 on T16 so hook formatting and search output stay aligned with one formatter contract.

---

## P4a-c: Implementation

**What went well:**
- Core implementation landed across extractor, indexer, MCP tools, and hook entrypoints with full local test coverage.
- `tooling/codebase-search` command surface is coherent: one package owns `search_codebase`, `find_related`, `browse_symbols`, `reindex`, plus both hook scripts.
- Verification command baseline is healthy (`tsc`, `vitest`, `docgen`, eslint with no errors).

**Key implementation learnings:**
1. **Hook entrypoint naming matters operationally** -- built hook scripts are `session-start-entry.js` and `prompt-submit-entry.js`; docs that reference `session-start.js` / `prompt-submit.js` drift from runtime.
2. **Runtime coupling is explicit** -- MCP entrypoint composes `@effect/platform-bun`, so running `dist/bin.js` with `node` fails. Bun is the intended runtime.
3. **Cross-validation gaps were mostly resolved in code** -- relation traversal, schema formatting, and hook skip heuristics are implemented and test-covered.

**What to improve:**
- Keep operational docs synchronized with compiled artifact names and runtime expectations immediately after implementation merges.

---

## P5: Verification

**What went well:**
- Standards gate is green: required eslint/docgen/tsc/vitest commands all pass.
- Hook behavior is confirmed in executable form (overview formatting, coding prompt injection, skip heuristics) using built hook entrypoints.
- Verification harnessing was made reproducible with per-check timing/error capture.

**Blocking outcome:**
1. **Primary blocker: embedding model artifact drift** -- `EmbeddingServiceLive` targets `nomic-ai/CodeRankEmbed` expecting `onnx/model.onnx`, but that artifact no longer exists on the model repo. This blocks `reindex` and all MCP retrieval paths.
2. **Secondary operational mismatch:** docs historically suggested Node launch for MCP server, but current implementation requires Bun runtime.

**P5 gate status:**
- E2E retrieval: fail (blocked by model load error)
- MCP latency/index timings: fail (blocked by model load error before tool execution)
- 10-query precision: fail/non-evaluable (0 successful retrievals)
- Hook checks: pass (validated with seeded fixture index)
- Standards checks: pass

**Next-phase remediation focus:**
- Update embedding model configuration to an ONNX-available compatible model, then rerun full P5 verification and only move spec after all gates pass.
