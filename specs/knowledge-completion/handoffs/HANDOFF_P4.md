# Handoff: Phase 4 - LLM Refactoring

> Context document for Phase 4 of the knowledge completion spec.

---

## Prerequisites

Phase 3 (@effect/ai Design) must be complete with:
- [ ] `outputs/design-llm-layers.md` populated
- [ ] `outputs/design-migration.md` populated
- [ ] `templates/llm-service.template.ts` compiles
- [ ] `templates/test-layer.template.ts` compiles
- [ ] System prompt migration strategy documented
- [ ] Quality gate: ≥4.0 average score

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

Order:
1. **MentionExtractor.ts** (simplest, uses `generateObject`)
2. **RelationExtractor.ts** (uses `generateObject`)
3. **EntityExtractor.ts** (uses `generateObjectWithSystem` - most complex)

For each extractor:
1. Read current implementation
2. Apply template pattern
3. Update imports
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

### Step 6: Migrate PromptTemplates.ts

- Update to use `Prompt.make()` patterns
- Ensure all prompts are typed

Verify:
```bash
bun run check --filter @beep/knowledge-server
```

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
| CREATE | `src/Service/LlmWithRetry.ts` |
| MODIFY | `src/Extraction/MentionExtractor.ts` |
| MODIFY | `src/Extraction/RelationExtractor.ts` |
| MODIFY | `src/Extraction/EntityExtractor.ts` |
| MODIFY | `src/Extraction/ExtractionPipeline.ts` |
| MODIFY | `src/Ai/PromptTemplates.ts` |
| DELETE | `src/Ai/AiService.ts` |

---

## Exit Criteria

Phase 4 is complete when:

- [ ] Dependencies added
- [ ] `Runtime/LlmLayers.ts` created
- [ ] `Service/LlmWithRetry.ts` created
- [ ] All 3 extractors migrated
- [ ] `ExtractionPipeline.ts` updated
- [ ] `PromptTemplates.ts` migrated
- [ ] `AiService.ts` deleted
- [ ] `bun run check --filter @beep/knowledge-server` passes
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
