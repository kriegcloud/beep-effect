# Master Orchestration — Semantic Codebase Search

> Full workflow with phase definitions, agent assignments, and verification gates

---

## Phase State Machine

```
P0 (Scaffolding) ──→ P1 (Discovery) ──→ P2 (Evaluation) ──→ P3 (Synthesis)
    ✅ Complete         ✅ Complete         ✅ Complete          ✅ Complete
                                                                  │
                                                                  ▼
P4a (Doc Standards) ──→ P4b (Extractor) ──→ P4c (MCP+Hooks) ──→ P5 (Verification)
    🔜 Next                Blocked on P4a      Blocked on P4b       Blocked on P4c
```

---

## P0: Scaffolding (COMPLETE)

**Deliverable:** Spec structure following _guide/ standards
**Status:** Complete

---

## P1: Discovery / Research (COMPLETE)

**Deliverable:** 10 research documents covering landscape, approaches, tools
**Status:** Complete (296KB across 10 documents)

**Outputs:**
- `outputs/00-synthesis-and-recommendations.md` — Strategy overview
- `outputs/01-documentation-strategy-synthesis.md` — Annotation-driven architecture
- `outputs/mcp-tools-landscape.md` — 15+ MCP servers
- `outputs/graphrag-knowledge-graphs.md` — GraphRAG approaches
- `outputs/custom-solution-architecture.md` — Full custom build spec
- `outputs/real-world-implementations.md` — Production experience reports
- `outputs/jsdoc-strategy-research.md` — 70+ JSDoc tags with search value ratings
- `outputs/docgen-enforcement-research.md` — Lint rules and git hooks
- `outputs/docgen-source-analysis.md` — @effect/docgen internals
- `outputs/current-docs-patterns.md` — Current codebase gaps

---

## P2: Evaluation & Design (NEXT)

**Goal:** Finalize design decisions for documentation standards, extraction schema, MCP API, and hook integration.

**Work Items (≤7):**

| # | Work Item | Agent | Output |
|---|-----------|-------|--------|
| 1 | Define repository-wide JSDoc standard (required tags per symbol kind) | orchestrator + doc-writer | `outputs/jsdoc-standard.md` |
| 2 | Define the `IndexedSymbol` extraction schema (TypeScript interface) | orchestrator | `outputs/indexed-symbol-schema.md` |
| 3 | Design MCP server API (tools, params, response format, token budgets) | orchestrator | `outputs/mcp-api-design.md` |
| 4 | Design Claude Code hook integration (triggers, payloads, timeouts) | orchestrator | `outputs/hook-integration-design.md` |
| 5 | Design eslint-plugin-jsdoc configuration + custom rules | orchestrator | `outputs/eslint-config-design.md` |
| 6 | Evaluate: extend @effect/docgen vs standalone extractor | codebase-researcher | `outputs/docgen-vs-custom-evaluation.md` |
| 7 | Design embedding pipeline (chunking, model, storage, indexing triggers) | orchestrator | `outputs/embedding-pipeline-design.md` |

**Verification Gate:**
- [ ] All 7 output documents produced
- [ ] IndexedSymbol schema reviewed and finalized
- [ ] MCP API has ≤4 tools, each with defined token budget
- [ ] JSDoc standard has clear requirements per symbol kind
- [ ] No TBD placeholders in any output

**Handoff:** `handoffs/HANDOFF_P3.md` + `handoffs/P3_ORCHESTRATOR_PROMPT.md`

---

## P3: Synthesis & Planning (COMPLETE)

**Goal:** Create detailed implementation plans with file-level work item breakdowns.
**Status:** Complete (3 documents, 18 tasks decomposed)

**Outputs:**
- `outputs/package-scaffolding.md` — Exact directory layout, package.json, tsconfig, configs
- `outputs/task-graph.md` — 18 tasks across P4a/P4b/P4c with dependency edges and acceptance criteria
- `outputs/cross-validation-report.md` — 6 cross-checks, 6 gaps found (none blocking)

**Verification Gate:**
- [x] 18 tasks decomposed (≤20 limit), each ≤2 hours
- [x] Dependencies cataloged in package-scaffolding.md with catalog versions
- [x] Package structure follows tooling/cli template
- [x] Cross-validation confirms all P2 designs are consistent

**Handoff:** `handoffs/HANDOFF_P4.md` + `handoffs/P4_ORCHESTRATOR_PROMPT.md`

---

## P4a: Documentation Standards Implementation

**Goal:** Apply documentation standards to all existing source files and configure enforcement tooling.

**Work Items (≤7):**

| # | Work Item | Agent | Deliverable |
|---|-----------|-------|-------------|
| 1 | Install + configure eslint-plugin-jsdoc across workspace | write-files | Root eslint config |
| 2 | Configure @effect/docgen: `enforceDescriptions: true` in both packages | write-files | docgen.json updates |
| 3 | Add @module JSDoc headers to all source files missing them | write-files | Updated source files |
| 4 | Add @see cross-references to related symbols | write-files | Updated source files |
| 5 | Add .annotateKey() descriptions to schema fields | write-files | Updated source files |
| 6 | Add @example tags to algorithms + schema constructors | write-files | Updated source files |
| 7 | Configure lefthook pre-commit + pre-push hooks | write-files | lefthook.yml |

**Verification Gate:**
- [ ] `bun run lint` passes with new JSDoc rules
- [ ] `bun run docgen` succeeds with enforceDescriptions: true
- [ ] All source files have @module header
- [ ] All exports have description + @since + @category
- [ ] Pre-commit hook catches missing JSDoc on new exports

**Handoff:** `handoffs/HANDOFF_P4b.md` + `handoffs/P4b_ORCHESTRATOR_PROMPT.md`

---

## P4b: Extractor & Indexer Implementation

**Goal:** Build the ts-morph extraction pipeline and embedding/storage layer.

**Work Items (≤7):**

| # | Work Item | Agent | Deliverable |
|---|-----------|-------|-------------|
| 1 | Scaffold `tooling/codebase-search` package | write-files | Package boilerplate |
| 2 | Implement ts-morph JSDoc extractor (uses docgen Parser APIs) | write-files | `src/extractor/jsdoc.ts` |
| 3 | Implement Effect-specific extractors (.annotate, TaggedErrorClass, .annotateKey) | write-files | `src/extractor/effect.ts` |
| 4 | Implement IndexedSymbol assembly (merge JSDoc + Effect metadata) | write-files | `src/extractor/assembler.ts` |
| 5 | Implement embedding pipeline (CodeRankEmbed + LanceDB) | write-files | `src/indexer/` |
| 6 | Implement BM25 keyword index alongside vector store | write-files | `src/search/` |
| 7 | Implement CLI command: `index` (full + incremental) | write-files | `src/commands/index.ts` |

**Verification Gate:**
- [ ] Extractor produces valid IndexedSymbol JSON for all existing source files
- [ ] Embedding pipeline indexes all symbols locally
- [ ] Search returns relevant results for test queries
- [ ] `npx vitest run` passes all extractor/indexer tests
- [ ] Incremental re-index works on file changes

**Handoff:** `handoffs/HANDOFF_P4c.md` + `handoffs/P4c_ORCHESTRATOR_PROMPT.md`

---

## P4c: MCP Server & Hooks Implementation

**Goal:** Expose search via MCP protocol and wire into Claude Code hooks.

**Work Items (≤7):**

| # | Work Item | Agent | Deliverable |
|---|-----------|-------|-------------|
| 1 | Implement MCP server with search_codebase tool | write-files | `src/mcp/server.ts` |
| 2 | Implement find_related tool (cross-reference traversal) | write-files | `src/mcp/tools/find-related.ts` |
| 3 | Implement browse_symbols tool (structured tree) | write-files | `src/mcp/tools/browse-symbols.ts` |
| 4 | Implement reindex tool (trigger from MCP) | write-files | `src/mcp/tools/reindex.ts` |
| 5 | Implement UserPromptSubmit hook script | write-files | `hooks/auto-context.js` |
| 6 | Implement SessionStart hook script | write-files | `hooks/session-start.js` |
| 7 | Configure .mcp.json + .claude/settings.json integration | write-files | Config files |

**Verification Gate:**
- [ ] MCP server starts and responds to all 4 tools
- [ ] search_codebase returns ≤5 results within 3s
- [ ] Each result is ≤300 tokens
- [ ] UserPromptSubmit hook completes within 5s timeout
- [ ] SessionStart hook injects project overview
- [ ] `npx vitest run` passes all MCP/hook tests

**Handoff:** `handoffs/HANDOFF_P5.md` + `handoffs/P5_ORCHESTRATOR_PROMPT.md`

---

## P5: Verification

**Goal:** End-to-end validation that the system works as intended.

**Work Items (≤7):**

| # | Work Item | Agent | Deliverable |
|---|-----------|-------|-------------|
| 1 | E2E test: "create Account schema" surfaces Schema patterns | test-writer | Integration test |
| 2 | E2E test: "add error handling" surfaces existing TaggedErrorClass patterns | test-writer | Integration test |
| 3 | E2E test: Hook auto-injection injects relevant context | test-writer | Hook test |
| 4 | Benchmark: Search latency under 3s for all tools | test-writer | Benchmark results |
| 5 | Benchmark: Index build time for full monorepo | test-writer | Benchmark results |
| 6 | Quality: Precision/recall on 10 test queries | test-writer | Quality report |
| 7 | Documentation: README for tooling/codebase-search | doc-writer | Package README |

**Verification Gate (Spec Complete):**
- [ ] All E2E tests pass
- [ ] Search latency < 3s for all tools
- [ ] Precision > 70% on test query set
- [ ] Full index build < 30s
- [ ] Package README complete
- [ ] All code follows Effect v4 patterns + JSDoc standards

---

## Agent Delegation Matrix

| Agent Role | Phases | Capability |
|-----------|--------|-----------|
| orchestrator | P2, P3 | Synthesize, design, plan — NO direct code |
| codebase-researcher | P2 (items 6), P3 (items 5-6) | Read-only exploration |
| write-files | P4a-P4c (all items) | Implementation |
| test-writer | P5 (items 1-6) | Test generation |
| doc-writer | P2 (item 1), P5 (item 7) | Documentation |

## Orchestrator Rules

- **DELEGATE** when: >3 files to read, >5 tool calls, any code generation
- **DIRECT** when: Design synthesis, decision making, handoff writing
- **MAX** 7 work items per phase, 10 sub-agent delegations, 20 direct tool calls
- **SPLIT** into sub-phases (P4a, P4b, P4c) when exceeding limits
