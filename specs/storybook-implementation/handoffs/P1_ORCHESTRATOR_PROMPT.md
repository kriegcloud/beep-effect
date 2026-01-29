# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 (Research).

---

## Prompt

You are orchestrating Phase 1 (Research) of the storybook-implementation spec.

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

### Your Mission

1. Launch `codebase-researcher` to analyze `@beep/ui` and `@beep/ui-editor` packages
2. Launch `web-researcher` to research Storybook + MUI + Tailwind patterns
3. Launch `codebase-researcher` to inventory all components
4. Synthesize outputs into key findings
5. Create Phase 2 handoff documents

### Sub-Agent Launch Order

**Parallel (launch together):**
- `codebase-researcher` → `outputs/codebase-context.md`
- `web-researcher` → `outputs/external-research.md`

**Sequential (after parallel complete):**
- `codebase-researcher` → `outputs/component-inventory.md`

### Prompts Location

All sub-agent prompts are in:
`specs/storybook-implementation/AGENT_PROMPTS.md`

### Output Requirements

After sub-agents complete:

1. Read and summarize each output (≤100 words each)
2. Update `specs/storybook-implementation/REFLECTION_LOG.md`
3. Create `handoffs/HANDOFF_P2.md` with:
   - Research synthesis
   - Key decisions for design phase
   - Risks and blockers
4. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] `outputs/codebase-context.md` exists
- [ ] `outputs/external-research.md` exists
- [ ] `outputs/component-inventory.md` exists
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

### Full Context

Read: `specs/storybook-implementation/handoffs/HANDOFF_P1.md`
