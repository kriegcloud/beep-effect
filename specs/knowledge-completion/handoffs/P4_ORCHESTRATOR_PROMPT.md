# Phase 4 Orchestrator Prompt

> Copy-paste this prompt to start Phase 4 of the knowledge completion spec.

---

## Prompt

```markdown
# Knowledge Completion Spec - Phase 4: LLM Refactoring

You are orchestrating Phase 4 of the knowledge completion spec located at `specs/knowledge-completion/`.

## Your Objective

Execute the @effect/ai refactoring:
1. Add dependencies
2. Create new service files
3. Migrate extractors incrementally
4. Delete old AiService

## Prerequisites Check

Verify Phase 3 outputs exist and templates compile:
```bash
ls specs/knowledge-completion/outputs/design-*.md
ls specs/knowledge-completion/templates/*.ts
bun tsc --noEmit specs/knowledge-completion/templates/*.ts
```

## Required Reading

1. `specs/knowledge-completion/handoffs/HANDOFF_P4.md` - Phase context
2. `specs/knowledge-completion/outputs/design-migration.md` - Migration plan
3. `specs/knowledge-completion/templates/llm-service.template.ts` - Service template

## Implementation Order (STRICT)

Follow this exact order for incremental verification:

### Step 1: Add Dependencies
```bash
cd packages/knowledge/server && bun add @effect/ai @effect/ai-anthropic @effect/ai-openai
```

### Step 2: Create LlmLayers.ts
Use `effect-code-writer` agent:
- Location: `packages/knowledge/server/src/Runtime/LlmLayers.ts`
- Follow template pattern
- Run `bun run check --filter @beep/knowledge-server`

### Step 3: Create LlmWithRetry.ts
Use `effect-code-writer` agent:
- Location: `packages/knowledge/server/src/Service/LlmWithRetry.ts`
- Copy pattern from reference implementation
- Run `bun run check --filter @beep/knowledge-server`

### Step 4: Migrate Extractors (ONE AT A TIME)

**Order matters**:
1. MentionExtractor.ts (simplest)
2. RelationExtractor.ts (medium)
3. EntityExtractor.ts (has `generateObjectWithSystem`)

For EACH extractor:
```bash
# After modification
bun run check --filter @beep/knowledge-server
# If errors, use package-error-fixer before proceeding
```

### Step 5: Update ExtractionPipeline.ts
- Remove AiService.Default from Layer
- Add LanguageModel requirement
- Run check

### Step 6: Migrate PromptTemplates.ts
- Use Prompt.make() patterns
- Run check

### Step 7: Delete AiService.ts
```bash
rm packages/knowledge/server/src/Ai/AiService.ts
bun run check --filter @beep/knowledge-server
```

## Rollback Trigger

If stuck after 3 fix attempts on any step:
1. `git stash push -m "P4 partial progress"`
2. Document blockers in REFLECTION_LOG
3. Create issue for manual resolution
4. Proceed with documented scope limitation

## Exit Criteria

Phase 4 is complete when:
- [ ] All dependencies added
- [ ] `LlmLayers.ts` created
- [ ] `LlmWithRetry.ts` created
- [ ] All 3 extractors migrated
- [ ] `ExtractionPipeline.ts` updated
- [ ] `PromptTemplates.ts` migrated
- [ ] `AiService.ts` deleted
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P5.md` created

## Quality Gate

`bun run check --filter @beep/knowledge-server` must pass to proceed.

## Next Phase

After Phase 4 completion, proceed to Phase 5 (Test Coverage) using:
`specs/knowledge-completion/handoffs/HANDOFF_P5.md`
```
