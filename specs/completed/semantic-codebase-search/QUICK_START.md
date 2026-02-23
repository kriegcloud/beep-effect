# Quick Start — Semantic Codebase Search

> 5-minute triage for picking up this spec

## What Is This?

A system that automatically surfaces relevant existing code (schemas, utils, helpers, patterns) when an AI agent receives a coding task — eliminating the duplicate code problem.

## Where Are We?

**P1 (Discovery) is complete.** 10 research documents totaling 296KB cover the landscape of MCP tools, GraphRAG, custom architectures, real-world implementations, JSDoc strategies, docgen analysis, and current codebase patterns.

**P2 (Evaluation & Design) is complete.** 7 design documents (124KB) with concrete TypeScript interfaces, ESLint configs, MCP API schemas, hook designs, and embedding pipeline specs.

**P3 (Synthesis & Planning) is next.** We need to:
1. Define `tooling/codebase-search/` package scaffolding
2. Build a task dependency graph (≤20 tasks)
3. Cross-validate all P2 designs for consistency

## Key Insight

Instead of expensive LLM code→English translation for embedding, we enforce strict JSDoc + Effect Schema annotations and extract them deterministically via ts-morph. Zero indexing cost. Higher quality. Self-reinforcing.

## How to Continue

1. Read [README.md](./README.md) for full context
2. Read the P3 handoff: [handoffs/HANDOFF_P3.md](./handoffs/HANDOFF_P3.md)
3. Use the orchestrator prompt: [handoffs/P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md)

## Critical Files

| File | Why |
|------|-----|
| `outputs/indexed-symbol-schema.md` | The IndexedSymbol interface — contract between extractor and search |
| `outputs/mcp-api-design.md` | 4 MCP tools with JSON schemas and token budgets |
| `outputs/embedding-pipeline-design.md` | Full pipeline: scanner → extractor → embedder → LanceDB + BM25 |
| `outputs/docgen-vs-custom-evaluation.md` | Hybrid extractor decision with source code analysis |
| `outputs/jsdoc-standard.md` | Tag requirements per symbol kind |
| `outputs/eslint-config-design.md` | Concrete ESLint flat config + custom rules |
| `outputs/hook-integration-design.md` | SessionStart + UserPromptSubmit hooks |

## Don't

- Don't re-research what's in the P1 outputs — it's comprehensive
- Don't redesign what P2 already specified — interfaces and schemas are locked
- Don't skip the documentation standards phase — it's the prerequisite for everything
- Don't try to build the MCP server before the extractor — dependencies flow P4a → P4b → P4c
