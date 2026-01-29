# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 (Design).

---

## Prompt

You are orchestrating Phase 2 (Design) of the storybook-implementation spec.

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

### Context from Phase 1

**Critical Discovery**: `@beep/ui-editor` is an empty stub. The Lexical editor lives in `apps/todox/src/app/lexical/`. Phase 4c (Editor Stories) is minimal scope.

**Component Count**: 271 components in `@beep/ui` across 15+ directories.

**Theme Pattern**: Dual decorator stack required:
1. `withThemeByClassName` for Tailwind
2. `withThemeFromJSXProvider` for MUI

### Your Mission

1. Launch `codebase-researcher` for architecture analysis (read Phase 1 outputs)
2. Launch agents for design decisions:
   - Architecture design
   - Addon selection
   - Theme integration plan
3. Synthesize into implementation-ready specifications
4. Create Phase 3 handoff documents

### Sub-Agent Launch Order

**Parallel Set 1:**
- `codebase-researcher` (architecture) → `outputs/architecture-design.md`
- `web-researcher` (addon deep-dive if needed)

**Sequential:**
- After architecture: `codebase-researcher` (theme-integration-plan) → `outputs/theme-integration-plan.md`

**Final:**
- Addon selection synthesis → `outputs/addon-selection.md`

### Prompts Location

All sub-agent prompts are in:
`specs/storybook-implementation/AGENT_PROMPTS.md`

Use prompts from **Phase 2: Design** section:
- `architecture-p2`
- `addon-selection`
- `theme-integration-plan`

### Output Requirements

After sub-agents complete:

1. Read and summarize each output (≤100 words each)
2. Validate architecture decisions against Phase 1 discoveries
3. Update `specs/storybook-implementation/REFLECTION_LOG.md`
4. Create `handoffs/HANDOFF_P3.md` with:
   - Architecture decisions
   - Theme integration approach
   - Addon configuration
5. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] `outputs/architecture-design.md` exists
- [ ] `outputs/addon-selection.md` exists
- [ ] `outputs/theme-integration-plan.md` exists
- [ ] Architecture addresses empty @beep/ui-editor discovery
- [ ] Theme decorator pattern documented
- [ ] REFLECTION_LOG.md updated with Phase 2 entry
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

### Phase 1 Outputs to Read

- `outputs/codebase-context.md` - Package structure
- `outputs/external-research.md` - Storybook patterns
- `outputs/component-inventory.md` - Component catalog

### Constraints

- Maximum 5 direct tool calls (not counting sub-agent launches)
- Read outputs only; never read source files
- Context budget: ≤4,000 tokens for handoffs

---

## Quick Reference

**Recommended Architecture (from research):**
- Location: `packages/ui/storybook/` (new package)
- Framework: `@storybook/nextjs`
- Builder: Vite (default with nextjs framework)
- Stories: Co-located with components (`*.stories.tsx`)

**Theme Decorator Stack:**
```typescript
decorators: [
  withThemeByClassName({ themes: { light: "", dark: "dark" } }),
  withThemeFromJSXProvider({ themes: { light, dark }, Provider: ThemeProvider }),
]
```

**Essential Addons:**
- @storybook/addon-essentials
- @storybook/addon-themes
- @storybook/addon-a11y
