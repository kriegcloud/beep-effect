# Phase 3 Orchestrator Prompt

> Copy-paste this prompt to start Phase 3 of the knowledge completion spec.

---

## Prompt

```markdown
# Knowledge Completion Spec - Phase 3: @effect/ai Design

You are orchestrating Phase 3 of the knowledge completion spec located at `specs/knowledge-completion/`.

## Your Objective

Design the @effect/ai migration including:
1. Provider Layer architecture
2. Prompt migration strategy
3. System prompt solution
4. Service templates

## Prerequisites Check

Verify Phase 2 outputs exist:
```bash
ls specs/knowledge-completion/outputs/
# Should include: architecture-review.md, slice-structure-review.md
```

## Required Reading

1. `specs/knowledge-completion/handoffs/HANDOFF_P3.md` - Phase context
2. `specs/knowledge-completion/outputs/effect-ai-research.md` - @effect/ai API
3. `specs/knowledge-completion/outputs/reference-patterns.md` - Reference impl
4. `specs/knowledge-completion/RUBRICS.md` - Phase 3 scoring

## Critical Question

**System prompt support**: How will `generateObjectWithSystem` be migrated?

Review the P1 research output and determine the approach before proceeding.

## Tasks

### Task 1: Design Provider Layers

Use `doc-writer` agent to create:
- Provider Layer architecture
- Configuration approach
- Selection logic
- Error handling

Output: `specs/knowledge-completion/outputs/design-llm-layers.md`

### Task 2: Design Migration Plan

Use `doc-writer` agent to create:
- Step-by-step migration order
- File modification checklist
- Verification steps
- Rollback strategy

Output: `specs/knowledge-completion/outputs/design-migration.md`

### Task 3: Create Service Template

Use `effect-code-writer` agent to create:
- Copy-paste ready template
- LanguageModel injection pattern
- Prompt.make() usage
- System prompt handling

Output: `specs/knowledge-completion/templates/llm-service.template.ts`

### Task 4: Create Test Layer Template

Use `effect-code-writer` agent to create:
- Mock LanguageModel Layer
- Test composition patterns

Output: `specs/knowledge-completion/templates/test-layer.template.ts`

### Task 5: Verify Templates Compile

```bash
# After creating templates
bun tsc --noEmit specs/knowledge-completion/templates/*.ts
```

## Exit Criteria

Phase 3 is complete when:
- [ ] `outputs/design-llm-layers.md` created
- [ ] `outputs/design-migration.md` created
- [ ] `templates/llm-service.template.ts` created and compiles
- [ ] `templates/test-layer.template.ts` created and compiles
- [ ] System prompt migration strategy documented
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P4.md` created

## Quality Gate

Must score ≥4.0 average per RUBRICS.md to proceed to Phase 4.

## Next Phase

After Phase 3 completion, proceed to Phase 4 (LLM Refactoring) using:
`specs/knowledge-completion/handoffs/HANDOFF_P4.md`
```
