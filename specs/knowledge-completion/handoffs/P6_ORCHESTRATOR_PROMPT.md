# Phase 6 Orchestrator Prompt

> Copy-paste this prompt to start Phase 6 of the knowledge completion spec.

---

## Prompt

```markdown
# Knowledge Completion Spec - Phase 6: GraphRAG Implementation

You are orchestrating Phase 6 of the knowledge completion spec located at `specs/knowledge-completion/`.

## Your Objective

Implement GraphRAG service for subgraph retrieval:
1. k-NN entity search via pgvector
2. N-hop subgraph traversal
3. RRF scoring
4. Agent context formatting

## Prerequisites Check

Verify Phase 5 tests pass:
```bash
bun run test --filter @beep/knowledge-server
# Should pass with ≥6 test files
```

## Required Reading

1. `specs/knowledge-completion/handoffs/HANDOFF_P6.md` - Phase context
2. `packages/knowledge/server/src/Embedding/EmbeddingService.ts` - Existing embedding service
3. `packages/knowledge/server/src/db/repos/` - Existing repos

## Tasks

### Task 1: Create GraphRAG Service Structure

Use `effect-code-writer` agent to create:
- `src/GraphRAG/GraphRAGService.ts` - Main service skeleton
- Define interface with `GraphRAGQuery` and `GraphRAGResult` types

Verify:
```bash
bun run check --filter @beep/knowledge-server
```

### Task 2: Implement k-NN Search

Use `effect-code-writer` agent to:
- Use EmbeddingService to embed query
- Query pgvector for nearest neighbors
- Return ranked seed entities

### Task 3: Implement N-Hop Traversal

Use `effect-code-writer` agent to:
- Start from seed entities
- Recursively follow relations
- Collect entities up to N hops

### Task 4: Implement RRF Scoring

Use `effect-code-writer` agent to:
- Combine embedding similarity rank
- Combine graph distance rank
- Calculate final scores

### Task 5: Implement Context Formatting

Use `effect-code-writer` agent to:
- Format entities for LLM
- Format relations for LLM
- Create readable context string

### Task 6: Create Tests

Use `test-writer` agent to create:
- `test/GraphRAG/GraphRAGService.test.ts`
- Tests for k-NN, traversal, scoring, formatting

## Verification

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

## Exit Criteria

Phase 6 is complete when:
- [ ] `GraphRAGService` implemented with all features
- [ ] Query latency <500ms for typical queries
- [ ] Tests passing
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P7.md` created

## Next Phase

After Phase 6 completion, proceed to Phase 7 (Todox Integration) using:
`specs/knowledge-completion/handoffs/HANDOFF_P7.md`
```
