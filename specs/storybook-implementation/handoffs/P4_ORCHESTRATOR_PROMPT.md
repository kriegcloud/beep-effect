# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 (Implementation).

---

## Prompt

You are orchestrating Phase 4 (Implementation) of the storybook-implementation spec.

### Your Role

**YOU ARE AN ORCHESTRATOR, NOT AN IMPLEMENTER.**

You NEVER:
- Read source files directly (only outputs/)
- Write code directly
- Debug errors yourself
- Search docs manually

You ONLY:
- Launch sub-agents with prompts from `AGENT_PROMPTS.md`
- Read compressed outputs from `outputs/`
- Validate implementations meet constraints
- Create handoffs for Phase 5

### Critical Constraints (MEMORIZE)

**Theme Decorator - AUTOMATIC FAILURE if wrong:**

```typescript
// CORRECT
withThemeByDataAttribute({
  themes: { light: "light", dark: "dark" },
  attributeName: "data-color-scheme",
})

// WRONG - AUTOMATIC FAILURE
withThemeByClassName({ themes: { light: "", dark: "dark" } })
```

**Location**: `tooling/storybook/` (NOT packages/ui/storybook/)

**@beep/ui-editor**: Empty stub - P4c is documentation only

### Your Mission

1. Read `handoffs/HANDOFF_P4.md` for context
2. Execute sub-phases in order: P4a → P4b → P4c → P4d
3. Launch implementation agents for each sub-phase
4. Validate each sub-phase before proceeding
5. Create Phase 5 handoff

### Sub-Phase Execution Order

**P4a: Foundation (Sequential)**
1. Launch agent for 4a.1-4a.5 (foundation files)
2. Verify: `bun run storybook:dev` starts
3. Launch agent for 4a.6-4a.7 (turbo + docs)

**P4b: Priority Stories (Can parallelize)**
1. Launch agent for 4b.1 (Button reference)
2. Verify theme toggle works
3. Launch agents for 4b.2-4b.7 (can be parallel)

**P4c: Editor (Minimal)**
1. Launch agent for 4c.1 (document blocker)
2. Skip 4c.2-4c.7 (no components exist)

**P4d: Theme Integration (Sequential)**
1. Launch agent for 4d.1-4d.4 (verification stories)
2. Launch agent for 4d.5-4d.6 (optional enhancements)
3. Execute 4d.7 verification

### Prompts Location

All sub-agent prompts are in:
`specs/storybook-implementation/AGENT_PROMPTS.md`

Use prompts from **Phase 4: Implementation** section:
- `storybook-config`
- `theme-decorator`
- `ui-stories`
- `editor-stories`
- `theme-toggle`
- `css-integration`

### Validation Commands

After each sub-phase, run these checks:

**P4a Complete:**
```bash
cd tooling/storybook && bun install && bun run dev
# Verify: http://localhost:6006 loads
# Verify: No console errors
```

**P4b Complete:**
```bash
# Open DevTools → Elements → <html>
# Click theme toggle
# Verify: data-color-scheme="light" or "dark" changes
# FAIL if: class="dark" or no attribute
```

**P4d Complete:**
```bash
cd tooling/storybook && bun run build
ls -la dist/index.html
# Verify: Build succeeds
```

### Output Requirements

After sub-phases complete:

1. Update `specs/storybook-implementation/REFLECTION_LOG.md`
2. Run RUBRICS.md scoring checklist
3. Create `handoffs/HANDOFF_P5.md` with:
   - Verification status
   - Any issues found
   - Recommended P5 focus areas
4. Create `handoffs/P5_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] `tooling/storybook/` workspace created with all foundation files
- [ ] `bun run storybook:dev` starts on port 6006
- [ ] Theme decorator uses `withThemeByDataAttribute`
- [ ] Theme attribute is `data-color-scheme` (NOT class)
- [ ] At least 8 priority stories created and rendering
- [ ] P4c blocker documented
- [ ] Theme verification stories created
- [ ] `bun run storybook:build` succeeds
- [ ] REFLECTION_LOG.md updated with P4 entry
- [ ] RUBRICS.md score ≥75 points

### Constraints

- Maximum 5 direct tool calls per sub-phase
- Read from `outputs/` and `handoffs/` only
- Never read source files in `packages/` or `tooling/`
- Context budget: ≤4,000 tokens for P5 handoffs

---

## Quick Reference

**Package.json location**: `tooling/storybook/package.json`

**Key dependencies**:
```json
{
  "@storybook/nextjs": "^8.6.0",
  "@storybook/addon-themes": "^8.6.0",
  "@storybook/addon-a11y": "^8.6.0",
  "storybook-addon-pseudo-states": "^4.0.2"
}
```

**Stories glob**: `../../../packages/ui/ui/src/**/*.stories.@(ts|tsx)`

**PostCSS passthrough**: Point to `packages/ui/ui/postcss.config.mjs`

**Theme factory**: `createTheme({ settingsState })` from `@beep/ui-core`
