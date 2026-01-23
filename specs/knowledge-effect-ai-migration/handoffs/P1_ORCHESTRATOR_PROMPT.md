# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 of the Knowledge Server @effect/ai migration.

---

## Prompt

You are executing Phase 1 (Planning) of the `knowledge-effect-ai-migration` spec.

### Context

Phase 0 Discovery is complete. Key findings:

1. **EmbeddingModel.Service interface** returns raw `Array<number>` (not wrapped result)
2. **Only EmbeddingService** depends on EmbeddingProvider (3 other services use EmbeddingService)
3. **TaskType is dead code** in OpenAI provider (identical processing for all types)
4. **EmbeddingResult.usage** is never consumed
5. **pgvector caching** is handled by EmbeddingService, separate from @effect/ai caching

### Your Mission

Finalize migration strategy decisions and create implementation plan.

### Decision 1: Adapter vs Direct Replacement

**READ** the Phase 0 analysis in `specs/knowledge-effect-ai-migration/handoffs/HANDOFF_P1.md`

**DECIDE** between:
- **Option A**: Adapter pattern (keep EmbeddingProvider, wrap EmbeddingModel)
- **Option B**: Partial replacement (update EmbeddingService, remove EmbeddingProvider)
- **Option C**: Full replacement (remove EmbeddingService caching layer)

**RECOMMENDATION from P0**: Option B

**Task**: Validate this recommendation by:
1. Checking if EmbeddingProvider interface is exported/used outside knowledge-server
2. Confirming EmbeddingService interface can remain unchanged
3. Identifying any edge cases

### Decision 2: TaskType Strategy

**DECIDE** between:
- **Option A**: Remove TaskType entirely
- **Option B**: Keep in interface, ignore in implementation
- **Option C**: Keep for future multi-provider support

**Task**: Check if TaskType is used in public API or only internal.

### Decision 3: Caching Strategy

**Current**: pgvector via EmbeddingRepo (persistent, cross-session)
**@effect/ai**: In-memory Request.Cache (per-session)

**DECIDE**: Keep pgvector only, use @effect/ai only, or both?

**Task**: Verify pgvector caching performance is sufficient.

### Decision 4: Error Mapping

**DECIDE** error handling:
- Map `AiError` → `EmbeddingError` (preserve interface)
- Expose `AiError` directly (breaking change)
- Union type

**Task**: Check if any consumer catches `EmbeddingError` specifically.

### Decision 5: Dimensions Configuration

**Verify**: `OpenAiEmbeddingModel.Config.Batched` supports dimensions.

**READ**: `tmp/effect/packages/ai/openai/src/Generated.ts` to find `CreateEmbeddingRequest` schema fields.

### Implementation Order

After decisions, create implementation order:

1. **Dependencies first**: Add @effect/ai, @effect/ai-openai
2. **Core interface**: Update EmbeddingService
3. **Mock provider**: Implement EmbeddingModel.Service
4. **Cleanup**: Delete old files
5. **Layer composition**: Update live layers

### Outputs

1. **Update REFLECTION_LOG.md** with Phase 1 design decisions
2. **Create handoffs/HANDOFF_P2.md** with implementation details
3. **Create handoffs/P2_ORCHESTRATOR_PROMPT.md** for Phase 2

### Verification

For each decision:
1. Document rationale
2. Identify risks
3. Define success criteria

### Reference Files

- Phase 0 Summary: `specs/knowledge-effect-ai-migration/handoffs/HANDOFF_P1.md`
- Reflection Log: `specs/knowledge-effect-ai-migration/REFLECTION_LOG.md`
- Effect AI Source: `tmp/effect/packages/ai/`
- Current Implementation: `packages/knowledge/server/src/Embedding/`

### Success Criteria

- [ ] All 5 decisions finalized with rationale
- [ ] Implementation order defined
- [ ] Risk assessment complete
- [ ] REFLECTION_LOG.md Phase 1 section updated
- [ ] handoffs/HANDOFF_P2.md created
- [ ] handoffs/P2_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context in: `specs/knowledge-effect-ai-migration/handoffs/HANDOFF_P1.md`
