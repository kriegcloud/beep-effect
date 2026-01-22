# Phase 7 Orchestrator Prompt

> Copy-paste this prompt to start Phase 7 of the knowledge completion spec.

---

## Prompt

```markdown
# Knowledge Completion Spec - Phase 7: Todox Integration

You are orchestrating Phase 7 of the knowledge completion spec located at `specs/knowledge-completion/`.

## Your Objective

Integrate knowledge extraction with Todox email pipeline:
1. Email extraction trigger
2. Client knowledge graph assembly
3. Real-time extraction events

## Prerequisites Check

Verify Phase 6 GraphRAG working:
```bash
bun run test --filter @beep/knowledge-server -- test/GraphRAG/
# Should pass
```

## Required Reading

1. `specs/knowledge-completion/handoffs/HANDOFF_P7.md` - Phase context
2. `packages/comms/server/src/` - Email handling
3. `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts` - Extraction API

## Tasks

### Task 1: Create Client Graph Service

Use `effect-code-writer` agent to create:
- `src/Client/ClientGraphService.ts`
- Per-client graph assembly
- Email-to-entity linking

Verify:
```bash
bun run check --filter @beep/knowledge-server
```

### Task 2: Create Event System

Use `effect-code-writer` agent to create:
- `src/Events/ExtractionEvents.ts`
- Event types
- Emission utilities

### Task 3: Implement Email Trigger

Use `effect-code-writer` agent to:
- Identify integration point in comms package
- Add extraction trigger to email receive handler
- Wire up graph persistence

### Task 4: Create Integration Tests

Use `test-writer` agent to create:
- `test/Client/ClientGraphService.test.ts`
- `test/Integration/EmailExtraction.test.ts`

## Verification

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

## Exit Criteria

Phase 7 is complete when:
- [ ] Email extraction trigger working
- [ ] Client graph assembly working
- [ ] Events emitting
- [ ] Integration tests passing
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P8.md` created

## Next Phase

After Phase 7 completion, proceed to Phase 8 (Finalization) using:
`specs/knowledge-completion/handoffs/HANDOFF_P8.md`
```
