# Handoff: Phase 4 - LLM Refactoring

> Context document for Phase 4 of the knowledge completion spec.

---

## Prerequisites

Phase 3 (@effect/ai Design) ✅ COMPLETE with:
- [x] `outputs/design-llm-layers.md` populated
- [x] `outputs/design-migration.md` populated
- [x] `templates/llm-service.template.ts` compiles (verified with `--target ES2024`)
- [x] `templates/test-layer.template.ts` compiles (verified with `--target ES2024`)
- [x] System prompt migration strategy documented

### P3 Key Findings

**CRITICAL API Patterns** (verified against actual @effect/ai types):

1. **Service injection**: `yield* LanguageModel.LanguageModel` (double reference)
2. **generateObject signature**: Options object, not positional args:
   ```typescript
   model.generateObject({ prompt, schema: MySchema, objectName: "OutputName" })
   ```
3. **System prompt pattern**:
   ```typescript
   Prompt.make([
     { role: "system" as const, content: systemText },
     { role: "user" as const, content: userText }
   ])
   ```
4. **Mock Layer pattern**:
   ```typescript
   Layer.succeed(LanguageModel.LanguageModel, {
     generateObject: () => Effect.succeed({ value: response, text: "", ... } as unknown),
     generateText: () => Effect.succeed({ text: "", ... } as unknown),
     streamText: () => Effect.succeed({ stream: Effect.succeed([]) } as unknown)
   } as unknown as LanguageModel.Service)
   ```

---

## Phase 4 Objective

**Execute the @effect/ai refactoring**:
1. Add dependencies
2. Create new service files
3. Migrate extractors (one at a time)
4. Update pipeline composition
5. Delete old AiService

---

## Context Budget Estimate

| Item | Tokens |
|------|--------|
| HANDOFF_P4.md | ~1,500 |
| Design documents | ~2,000 |
| Templates | ~1,000 |
| Files being modified | ~8,000 |
| **Total** | ~12,500 |

---

## Implementation Order

**CRITICAL**: Follow this exact order to enable incremental verification.

### Step 1: Add Dependencies

```bash
cd packages/knowledge/server
bun add @effect/ai @effect/ai-anthropic @effect/ai-openai
```

Verify:
```bash
cat package.json | grep "@effect/ai"
```

### Step 2: Create LlmLayers.ts

Location: `packages/knowledge/server/src/Runtime/LlmLayers.ts`

Use template: `templates/llm-service.template.ts`

Verify:
```bash
bun run check --filter @beep/knowledge-server
```

### Step 3: Create LlmWithRetry.ts

Location: `packages/knowledge/server/src/Service/LlmWithRetry.ts`

Copy pattern from reference: `tmp/effect-ontology/packages/@core-v2/src/Service/LlmWithRetry.ts`

Verify:
```bash
bun run check --filter @beep/knowledge-server
```

### Step 4: Migrate Extractors (ONE AT A TIME)

**P3 FINDING**: ALL 5 LLM calls use `generateObjectWithSystem` (not `generateObject`). All need system prompt migration.

Order:
1. **MentionExtractor.ts** (simplest prompt structure)
2. **RelationExtractor.ts** (similar complexity)
3. **EntityExtractor.ts** (has batching loop - most complex)

For each extractor:
1. Read current implementation
2. Apply template pattern from `templates/llm-service.template.ts`:
   - Change `yield* AiService` → `yield* LanguageModel.LanguageModel`
   - Change `ai.generateObjectWithSystem(schema, system, user, config)` →
     ```typescript
     const prompt = Prompt.make([
       { role: "system" as const, content: systemPrompt },
       { role: "user" as const, content: userPrompt }
     ])
     model.generateObject({ prompt, schema, objectName: "SchemaName" })
     ```
   - Change `result.data` → `result.value`
3. Update imports:
   ```typescript
   import { LanguageModel, Prompt } from "@effect/ai"
   // Remove: import { AiService } from "../Ai/AiService"
   ```
4. Run verification:
   ```bash
   bun run check --filter @beep/knowledge-server
   ```
5. If errors, fix before proceeding

### Step 5: Update ExtractionPipeline.ts

- Remove `AiService.Default` from Layer composition
- Add `LanguageModel` Layer requirement
- Update service dependencies

Verify:
```bash
bun run check --filter @beep/knowledge-server
```

### Step 6: Keep PromptTemplates.ts (No Changes Needed)

**P3 FINDING**: `PromptTemplates.ts` only returns plain strings (`buildMentionPrompt`, `buildEntityPrompt`, `buildRelationPrompt`, `buildSystemPrompt`). These strings are passed into `Prompt.make()` at the call site in extractors.

No migration needed for this file.

### Step 7: Delete AiService.ts

**Only after all migrations verified**:
```bash
rm packages/knowledge/server/src/Ai/AiService.ts
```

Final verification:
```bash
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
```

---

## Rollback Strategy

If stuck after 3 fix attempts on any step:

1. **Stash changes**:
   ```bash
   git stash push -m "P4 partial progress"
   ```

2. **Document blockers** in REFLECTION_LOG.md

3. **Create issue** for manual resolution

4. **Proceed with documented scope** (note what was/wasn't migrated)

---

## Verification Checkpoints

| After Step | Check | Pass Criteria |
|------------|-------|---------------|
| 1 | `cat package.json` | Dependencies listed |
| 2 | `bun run check` | No new type errors |
| 3 | `bun run check` | No new type errors |
| 4a | `bun run check` | MentionExtractor works |
| 4b | `bun run check` | RelationExtractor works |
| 4c | `bun run check` | EntityExtractor works |
| 5 | `bun run check` | Pipeline composes |
| 6 | `bun run check` | Prompts typed |
| 7 | `bun run check` | No AiService references |

---

## Files Modified Summary

| Action | File |
|--------|------|
| CREATE | `src/Runtime/LlmLayers.ts` |
| CREATE | `src/Runtime/index.ts` |
| CREATE | `src/Service/LlmWithRetry.ts` (optional - P4 scope) |
| MODIFY | `src/Extraction/MentionExtractor.ts` |
| MODIFY | `src/Extraction/RelationExtractor.ts` |
| MODIFY | `src/Extraction/EntityExtractor.ts` |
| MODIFY | `src/Extraction/ExtractionPipeline.ts` |
| NO CHANGE | `src/Ai/PromptTemplates.ts` (only returns strings) |
| DELETE | `src/Ai/AiService.ts` |
| MODIFY | `src/Ai/index.ts` (remove AiService export) |

---

## Exit Criteria

Phase 4 is complete when:

- [ ] Dependencies verified (`@effect/ai`, `@effect/ai-anthropic` already installed)
- [ ] `Runtime/LlmLayers.ts` created with config-driven provider selection
- [ ] `Runtime/index.ts` created with exports
- [ ] All 3 extractors migrated (MentionExtractor, RelationExtractor, EntityExtractor)
- [ ] `ExtractionPipeline.ts` updated with LlmLive Layer
- [ ] `AiService.ts` deleted
- [ ] `Ai/index.ts` updated (AiService export removed)
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `grep -r "AiService" packages/knowledge/server/src/` returns no results
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P5.md` created

---

## Agent Assignment

| Agent | Task |
|-------|------|
| `effect-code-writer` | All implementation |
| `package-error-fixer` | Type error resolution (if needed) |

---

## Notes

- **Incremental is key**: Verify after each file, not at the end
- **EntityExtractor is hardest**: It uses `generateObjectWithSystem` - save for last
- If type errors cascade, check upstream dependencies first
- The `AiService.ts` deletion is the final validation that migration is complete
