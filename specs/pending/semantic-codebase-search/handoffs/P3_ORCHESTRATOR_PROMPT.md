# P3 Orchestrator Prompt — Synthesis & Planning

> Copy-paste this prompt to start P3. Read HANDOFF_P3.md first for full context.

---

You are orchestrating Phase 3 (Synthesis & Planning) of the Semantic Codebase Search spec.

## Context
P1 (Discovery) produced 10 research documents (296KB). P2 (Evaluation & Design) produced 7 design documents (124KB) with concrete TypeScript interfaces, ESLint configs, and API schemas. The core approach is: hybrid ts-morph extractor → CodeRankEmbed embeddings → LanceDB + BM25 → MCP server + Claude Code hooks.

## Your Task
Synthesize P2 designs into a buildable implementation plan. Produce 3 documents.

## Work Items

### 1. Package Scaffolding (`outputs/package-scaffolding.md`)
Define the exact `tooling/codebase-search/` package structure:
- Directory layout (every file and directory)
- `package.json` (dependencies from P2 outputs, scripts, Effect v4 catalog pattern)
- `tsconfig.json` (extends ../../tsconfig.base.json)
- `docgen.json` (follow tooling/cli pattern)
- Module entry points (src/index.ts barrel exports)
- Test structure (test/ directory mirroring src/)

Reference: `tooling/cli/` as template, `embedding-pipeline-design.md` for deps.

### 2. Task Graph (`outputs/task-graph.md`)
Decompose into implementable tasks:
- Each task ≤2 hours estimated effort
- ≤20 tasks total
- Explicit dependency edges (task X blocks task Y)
- Assigned to phase: P4a (doc standards), P4b (extractor + pipeline), P4c (MCP + hooks)
- For each task: description, input files (from P2 designs), output files, acceptance criteria

Suggested task decomposition:
- P4a: ESLint config setup, tsdoc.json, docgen config updates, existing code backfill
- P4b: ts-morph parser, JSDoc extractor, Effect pattern detectors, Schema annotation extractor, IndexedSymbol builder, embedding service, LanceDB writer, BM25 indexer, incremental scanner, full pipeline orchestration
- P4c: MCP server skeleton, search_codebase tool, find_related tool, browse_symbols tool, reindex tool, SessionStart hook, UserPromptSubmit hook

### 3. Cross-Validation Report (`outputs/cross-validation-report.md`)
Verify all P2 design documents are consistent:
- IndexedSymbol fields ↔ what the extractor can actually produce from AST + JSDoc
- LanceDB SymbolRow columns ↔ IndexedSymbol fields (mapping in indexed-symbol-schema.md)
- MCP tool output schemas ↔ LanceDB query capabilities
- Hook formatting ↔ MCP tool formatting (should be consistent)
- ESLint rules ↔ JSDoc standard requirements (every Required tag has a lint rule)
- Custom tags in tsdoc.json ↔ tags in JSDoc standard ↔ tags in ESLint check-tag-names

Flag any gaps and propose resolutions.

## Constraints
- Max 3 work items
- Max 5 sub-agent delegations
- All outputs must have concrete, actionable content — task lists with acceptance criteria, not prose
- Follow Effect v4 patterns per project MEMORY.md
- No TBD placeholders

## Reference Documents
- All P2 outputs: `specs/pending/semantic-codebase-search/outputs/`
  - `jsdoc-standard.md` — tag requirements per symbol kind
  - `indexed-symbol-schema.md` — IndexedSymbol interface + buildEmbeddingText
  - `mcp-api-design.md` — 4 MCP tools with schemas
  - `hook-integration-design.md` — SessionStart + UserPromptSubmit hooks
  - `eslint-config-design.md` — ESLint flat config + custom rules
  - `docgen-vs-custom-evaluation.md` — hybrid extractor recommendation
  - `embedding-pipeline-design.md` — full pipeline architecture
- Package template: `tooling/cli/` (package.json, tsconfig, docgen.json, directory layout)
- Effect v4 patterns: `tooling/cli/src/commands/create-package.ts`

## When Done
1. Verify all 3 outputs exist and pass verification table
2. Update REFLECTION_LOG.md with P3 learnings
3. Create `handoffs/HANDOFF_P4.md` and `handoffs/P4_ORCHESTRATOR_PROMPT.md`
