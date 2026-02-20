# Handoff → P2: Evaluation & Design

> Context transfer from P1 (Discovery) to P2 (Evaluation & Design)
> Token budget: ≤4,000 tokens

---

## Working Memory (≤2,000 tokens)

### Current Task
Design the four core subsystems: (1) documentation standards, (2) extraction schema, (3) MCP server API, (4) hook integration. Produce concrete TypeScript interfaces, eslint configs, and API specifications — not more prose.

### Phase Objectives
1. **JSDoc Standard** — Which tags are REQUIRED per symbol kind (schema, service, layer, error, function, type, constant, command). Minimum quality bar for descriptions.
2. **IndexedSymbol Schema** — TypeScript interface defining what gets extracted from each code symbol. This is the contract between extractor and search.
3. **MCP API Design** — ≤4 tools with defined parameters, response format, and per-result token budget (≤300 tokens).
4. **Hook Integration** — UserPromptSubmit payload format, timeout budget (5s), injection format.
5. **eslint Configuration** — Concrete rule settings for eslint-plugin-jsdoc.
6. **Docgen vs Custom** — Final decision on extending docgen or building standalone extractor.
7. **Embedding Pipeline** — Chunking strategy, model selection, storage schema, indexing triggers.

### Blocking Issues
None. All research is complete.

### Success Criteria
- [ ] 7 output documents, each with concrete specifications (interfaces, configs, schemas)
- [ ] No TBD placeholders
- [ ] IndexedSymbol TypeScript interface is production-ready
- [ ] MCP tools have request/response types defined

---

## Episodic Memory (≤1,000 tokens)

### P1 Summary
8 research agents produced 10 documents (296KB) covering:
- MCP tools landscape (15+ servers, top picks: Augment, Zilliz, claude-context-local, AiDex)
- GraphRAG for code (5 code-specific tools, SemanticForge 73% precision)
- Custom architecture (tree-sitter + CodeRankEmbed + LanceDB + RRF)
- Real-world implementations (Greptile, Sourcegraph, Cursor, Aider, Augment)
- JSDoc strategy (70+ tags rated for search value, enforcement approaches)
- Docgen internals (ts-morph + doctrine, Domain model, 6 enforcement flags)
- Current patterns (4/8 files have @module, sparse @example, zero @see)

### Key Decisions Already Made
| Decision | Locked |
|----------|--------|
| Annotation-driven (not LLM translation) | Yes |
| Nomic CodeRankEmbed 137M for embeddings | Yes |
| LanceDB for vector storage | Yes |
| Hybrid BM25 + vector + RRF | Yes |
| Build on docgen Parser APIs + custom Effect extractors | Yes |
| UserPromptSubmit hook auto-injection | Yes |

---

## Semantic Memory (≤500 tokens)

### Tech Stack Constants
- **Runtime:** Effect v4 (TypeScript)
- **Testing:** vitest + @effect/vitest (NEVER bun test)
- **Package template:** Follow tooling/cli structure
- **Coding style:** Effect.fn, no native Map/Set/Array methods, Schema annotations required
- **Errors:** S.TaggedErrorClass (never Data.TaggedError)
- **CLI:** effect/unstable/cli

### Codebase Facts
- Monorepo: tooling/repo-utils, tooling/cli (existing), tooling/codebase-search (new)
- @effect/docgen: pre-release v4 build at commit e7fe055
- docgen.json: enforceVersion=true, enforceDescriptions=false (needs changing)
- Categories in use: schemas, models, layers, services, errors, algorithms, commands, etc.

---

## Procedural Memory (Links Only)

- Spec guide: `.repos/beep-effect/specs/_guide/README.md`
- Handoff standards: `.repos/beep-effect/specs/_guide/HANDOFF_STANDARDS.md`
- Effect testing: `.repos/beep-effect/specs/_guide/patterns/effect-testing-standards.md`
- P1 outputs: `specs/pending/semantic-codebase-search/outputs/`
- Docgen source: `.repos/docgen/`
- Effect v4 reference: `.repos/effect-smol/`

---

## Verification Table

| Output | Verification Check |
|--------|-------------------|
| `outputs/jsdoc-standard.md` | Has required tags per symbol kind, no TBD |
| `outputs/indexed-symbol-schema.md` | Has TypeScript interface, all fields documented |
| `outputs/mcp-api-design.md` | ≤4 tools, request/response types defined |
| `outputs/hook-integration-design.md` | Payload format, timeout, injection format |
| `outputs/eslint-config-design.md` | Concrete rule settings, installable |
| `outputs/docgen-vs-custom-evaluation.md` | Clear recommendation with rationale |
| `outputs/embedding-pipeline-design.md` | Chunking strategy, model, storage schema |
