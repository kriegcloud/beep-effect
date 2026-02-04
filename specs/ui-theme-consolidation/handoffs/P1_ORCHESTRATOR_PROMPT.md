# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the `ui-theme-consolidation` spec.

### Context

We are merging theme configurations from `apps/todox` into the shared `@beep/ui` packages. Phase 1 focuses on CSS variables only.

**Critical Rule:** ADD variables, do NOT replace existing ones. All `--mui-*` and `--palette-*` variables must remain unchanged.

### Your Mission

Merge CSS variables from `apps/todox/src/app/globals.css` into `packages/ui/ui/src/styles/globals.css`.

### Steps

1. **Read** both CSS files to understand current state
2. **Identify** todox variables not in ui-ui:
   - Shadcn color system (`--background`, `--foreground`, etc.)
   - Border radius system (`--radius`, `--radius-sm`, etc.)
   - Chart colors (`--chart-1` through `--chart-5`)
   - Sidebar variables
3. **Add** todox variables under a new comment section: `/* Shadcn/ui Color System */`
4. **Add** resizable panel styles from todox (lines 148-185)
5. **Add** `.scrollbar-none` utility class
6. **Verify** with type checking and build

### Placement Guidelines

- Add shadcn variables to `:root` selector (light mode)
- Add dark mode variants to `.dark` selector
- Add utility classes to `@layer utilities` section
- Add component styles to `@layer components` section

### Verification Commands

```bash
bun run check --filter @beep/ui
bun run build --filter @beep/ui
bun run check --filter @beep/todox
```

### Success Criteria

- [ ] All todox CSS variables added
- [ ] Existing MUI variables unchanged
- [ ] Border radius system added
- [ ] Resizable panel styles added
- [ ] `.scrollbar-none` utility added
- [ ] All verification commands pass

### On Completion

1. Update `specs/ui-theme-consolidation/REFLECTION_LOG.md` with learnings
2. Create `specs/ui-theme-consolidation/handoffs/HANDOFF_P2.md`
3. Create `specs/ui-theme-consolidation/handoffs/P2_ORCHESTRATOR_PROMPT.md`

### Reference Files

- Inventory: `specs/ui-theme-consolidation/outputs/INVENTORY.md`
- Full handoff: `specs/ui-theme-consolidation/handoffs/HANDOFF_P1.md`
- Master workflow: `specs/ui-theme-consolidation/MASTER_ORCHESTRATION.md`
