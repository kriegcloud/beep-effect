# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 of the Knowledge Server @effect/ai migration.

---

## Prompt

You are executing Phase 0 (Discovery) of the `knowledge-effect-ai-migration` spec.

### Context

The `@beep/knowledge-server` package has a custom OpenAI embedding implementation in `packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts`. This implementation:

- Uses direct `openai` npm package with dynamic imports
- Reimplements batching and caching that `@effect/ai` provides natively
- Has custom interfaces that don't align with the Effect ecosystem

The goal is to migrate to `@effect/ai` and `@effect/ai-openai` packages.

### Your Mission

Research and document the APIs needed for migration.

**CRITICAL**: The local source files in `tmp/effect/packages/ai/` are the AUTHORITATIVE reference. You MUST read these files directly using the Read tool. MCP documentation is supplementary only.

1. **Read @effect/ai EmbeddingModel Source (REQUIRED FIRST)**
   - **Read directly**: `tmp/effect/packages/ai/ai/src/EmbeddingModel.ts`
   - Extract: `EmbeddingModel` (Context.Tag), `Service` interface, `Result` type, `make()` constructor, `makeDataLoader()`
   - Note line numbers for key definitions

2. **Read @effect/ai-openai Source (REQUIRED SECOND)**
   - **Read directly**: `tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts`
   - **Read directly**: `tmp/effect/packages/ai/openai/src/OpenAiClient.ts`
   - Extract: `layerBatched()`, `Config.Batched`, layer composition patterns

3. **THEN Research via MCP** (supplementary)
   - Use `mcp-researcher` agent to search Effect docs MCP
   - Topics: Any gaps not covered by source files, usage examples

4. **Map Current Embedding Usage**
   - Delegate to `codebase-researcher` agent
   - Questions: Who uses EmbeddingProvider? Is TaskType meaningful? What fields are actually used?
   - Scope: `packages/knowledge/server/src/`

5. **Synthesize Findings**
   - Create gap analysis: what current features need to be preserved?
   - Document in REFLECTION_LOG.md
   - Identify migration risks

6. **Create Phase 1 Handoffs**
   - Write `handoffs/HANDOFF_P1.md` with research synthesis
   - Write `handoffs/P1_ORCHESTRATOR_PROMPT.md` for next phase

### Critical Patterns

**Effect AI EmbeddingModel Interface** (expected shape):
```typescript
interface Service {
  embed: (input: string) => Effect.Effect<Array<number>, AiError>
  embedMany: (input: ReadonlyArray<string>) => Effect.Effect<Array<Array<number>>, AiError>
}
```

**Current Custom Interface** (to be replaced):
```typescript
interface EmbeddingProvider {
  config: EmbeddingConfig
  embed: (text: string, taskType: TaskType) => Effect.Effect<EmbeddingResult, EmbeddingError>
  embedBatch: (texts: ReadonlyArray<string>, taskType: TaskType) => Effect.Effect<ReadonlyArray<EmbeddingResult>, EmbeddingError>
}
```

### Reference Files

- Spec README: `specs/knowledge-effect-ai-migration/README.md`
- Master Orchestration: `specs/knowledge-effect-ai-migration/MASTER_ORCHESTRATION.md`
- Agent Prompts: `specs/knowledge-effect-ai-migration/AGENT_PROMPTS.md`
- Effect AI Source: `tmp/effect/packages/ai/`
- Current Implementation: `packages/knowledge/server/src/Embedding/`

### Verification

After each agent delegation:
- Synthesize findings
- Update REFLECTION_LOG.md with learnings

After all research:
- Create HANDOFF_P1.md
- Create P1_ORCHESTRATOR_PROMPT.md

### Success Criteria

- [ ] @effect/ai EmbeddingModel API documented
- [ ] @effect/ai-openai OpenAI embedding patterns documented
- [ ] Current embedding usage mapped
- [ ] Gap analysis complete
- [ ] REFLECTION_LOG.md updated
- [ ] handoffs/HANDOFF_P1.md created
- [ ] handoffs/P1_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context in: `specs/knowledge-effect-ai-migration/handoffs/HANDOFF_P0.md`
