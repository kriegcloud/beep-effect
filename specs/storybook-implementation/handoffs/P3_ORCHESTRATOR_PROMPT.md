# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 (Planning).

---

## Prompt

You are orchestrating Phase 3 (Planning) of the storybook-implementation spec.

### Your Role

**YOU ARE AN ORCHESTRATOR, NOT AN IMPLEMENTER.**

You NEVER:
- Read source files directly
- Write code
- Debug errors
- Search docs manually

You ONLY:
- Launch sub-agents with prompts from `AGENT_PROMPTS.md`
- Read compressed outputs from `outputs/`
- Synthesize findings
- Create handoffs

### Context from Phase 2

**Critical Design Decisions**:

1. **Location**: `tooling/storybook/` workspace
2. **Stories**: Co-located `.stories.tsx` files
3. **Theme Decorator**: `withThemeByDataAttribute` (NOT `withThemeByClassName`)
4. **Attribute**: `data-color-scheme` (NOT `class="dark"`)
5. **Addons**: essentials, a11y, interactions, pseudo-states

**@beep/ui-editor**: Empty stub - Phase 4c is minimal scope

### Your Mission

1. Read Phase 2 design outputs
2. Launch agents for planning tasks:
   - Implementation plan creation
   - Directory structure documentation
   - Rubric generation
3. Synthesize into implementation-ready task list
4. Create Phase 4 handoff documents

### Sub-Agent Launch Order

**Parallel Set 1:**
- `codebase-researcher` (implementation-plan) → `outputs/implementation-plan.md`
- `codebase-researcher` (directory-structure) → `outputs/directory-structure.md`

**Sequential:**
- After plan: `doc-writer` (rubric-generation) → Update `RUBRICS.md`

### Prompts Location

All sub-agent prompts are in:
`specs/storybook-implementation/AGENT_PROMPTS.md`

Use prompts from **Phase 3: Planning** section:
- `implementation-plan`
- `directory-structure`
- `rubric-generation`

### Output Requirements

After sub-agents complete:

1. Read and summarize each output (≤100 words each)
2. Validate plan against Phase 2 design decisions
3. Ensure tasks reference correct theme decorator (`withThemeByDataAttribute`)
4. Update `specs/storybook-implementation/REFLECTION_LOG.md`
5. Create `handoffs/HANDOFF_P4.md` with:
   - Task list for 4a (Foundation)
   - Task list for 4b (UI Stories)
   - Task list for 4c (Editor Stories - minimal)
   - Task list for 4d (Theme Integration)
6. Create `handoffs/P4_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] `outputs/implementation-plan.md` exists
- [ ] `outputs/directory-structure.md` exists
- [ ] `RUBRICS.md` updated with implementation rubrics
- [ ] Tasks use `withThemeByDataAttribute` (not `withThemeByClassName`)
- [ ] Tasks reference `data-color-scheme` attribute
- [ ] Phase 4c (Editor) marked as minimal scope
- [ ] REFLECTION_LOG.md updated with Phase 3 entry
- [ ] `handoffs/HANDOFF_P4.md` created
- [ ] `handoffs/P4_ORCHESTRATOR_PROMPT.md` created

### Phase 2 Outputs to Read

- `outputs/architecture-design.md` - Location, structure decisions
- `outputs/addon-selection.md` - Addon configuration
- `outputs/theme-integration-plan.md` - Theme decorator stack

### Constraints

- Maximum 5 direct tool calls (not counting sub-agent launches)
- Read outputs only; never read source files
- Context budget: ≤4,000 tokens for handoffs

---

## Quick Reference

**Correct Theme Pattern**:
```typescript
// CORRECT
withThemeByDataAttribute({
  themes: { light: "light", dark: "dark" },
  attributeName: "data-color-scheme",
})

// WRONG - Do NOT use
withThemeByClassName({
  themes: { light: "", dark: "dark" },
})
```

**Files to Create (Phase 4a)**:
```
tooling/storybook/
├── package.json
├── tsconfig.json
└── .storybook/
    ├── main.ts
    └── preview.tsx
```

**Priority Stories (Phase 4b)**:
1. button.stories.tsx
2. input.stories.tsx
3. select.stories.tsx
4. dialog.stories.tsx
5. card.stories.tsx
6. badge.stories.tsx
7. tabs.stories.tsx
8. dropdown-menu.stories.tsx

**Phase 4c Scope**:
Minimal - @beep/ui-editor is empty stub. Document as "blocked pending Lexical extraction".
