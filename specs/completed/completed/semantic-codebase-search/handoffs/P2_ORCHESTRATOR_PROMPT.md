# P2 Orchestrator Prompt — Evaluation & Design

> Copy-paste ready prompt for starting P2

---

```
You are orchestrating Phase 2 (Evaluation & Design) of the Semantic Codebase Search spec.

## Context
P1 (Discovery) is complete. 10 research documents (296KB) are in `specs/pending/semantic-codebase-search/outputs/`. The core approach is annotation-driven semantic search: enforce strict JSDoc + Effect Schema annotations, extract them deterministically via ts-morph, embed locally with Nomic CodeRankEmbed, store in LanceDB, serve via MCP + Claude Code hooks.

## Your Task
Produce 7 concrete design documents. Each must contain TypeScript interfaces, configuration objects, or API schemas — NOT more prose. No TBD placeholders.

## Work Items

### 1. JSDoc Standard (`outputs/jsdoc-standard.md`)
Define REQUIRED tags per symbol kind. Reference `outputs/jsdoc-strategy-research.md` and `outputs/current-docs-patterns.md`.

Symbol kinds: schema, service, layer, error, function, type, constant, command, module (file-level).

For each: required tags, description quality bar, examples of good vs bad descriptions.

### 2. IndexedSymbol Schema (`outputs/indexed-symbol-schema.md`)
Define the TypeScript interface for `IndexedSymbol` — the contract between extractor and search.
Reference `outputs/01-documentation-strategy-synthesis.md` for the draft interface.
Include: identity fields, natural language fields, taxonomy, relationships, code context.
Also define the `buildEmbeddingText(sym: IndexedSymbol): string` function signature.

### 3. MCP API Design (`outputs/mcp-api-design.md`)
Design ≤4 MCP tools. For each: name, description, input schema (JSON Schema), output schema, token budget per result. Reference `outputs/custom-solution-architecture.md` section 4.

### 4. Hook Integration Design (`outputs/hook-integration-design.md`)
Design UserPromptSubmit and SessionStart hooks. Define: trigger conditions, search query construction from prompt, result formatting, injection format, timeout (5s max).
Reference `outputs/custom-solution-architecture.md` section 5.

### 5. ESLint Config Design (`outputs/eslint-config-design.md`)
Concrete eslint-plugin-jsdoc configuration. Reference `outputs/jsdoc-strategy-research.md` section 5 and `outputs/docgen-enforcement-research.md`.
Include: rule settings, custom rules needed, integration with existing monorepo eslint.

### 6. Docgen vs Custom Evaluation (`outputs/docgen-vs-custom-evaluation.md`)
DELEGATE to codebase-researcher: Explore docgen source at `.repos/docgen/src/Parser.ts` and evaluate whether its `parseFiles()` API can be consumed by our extractor, or if we need a standalone ts-morph parser. Reference `outputs/docgen-source-analysis.md`.

### 7. Embedding Pipeline Design (`outputs/embedding-pipeline-design.md`)
Define: embedding unit construction (how IndexedSymbol → text chunk), model selection rationale, LanceDB table schema, BM25 index schema, RRF fusion formula, incremental indexing strategy (file watcher vs git diff).

## Constraints
- Max 7 work items (done)
- Max 10 sub-agent delegations
- Delegate item 6 to codebase-researcher
- All outputs must have concrete specifications (TypeScript types, JSON schemas, config objects)
- Follow Effect v4 patterns for any code examples
- No TBD placeholders at phase end

## When Done
1. Verify all 7 outputs exist and pass verification table in HANDOFF_P2.md
2. Update REFLECTION_LOG.md with P2 learnings
3. Create `handoffs/HANDOFF_P3.md` and `handoffs/P3_ORCHESTRATOR_PROMPT.md`
```
