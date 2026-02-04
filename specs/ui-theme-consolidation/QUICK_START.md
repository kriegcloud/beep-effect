# Quick Start - UI Theme Consolidation

> Start Phase 1 in 5 minutes.

---

## Prerequisites

```bash
# Ensure clean state
git status  # Should be on ui-component-depuplication-theme-alignment branch

# Verify type checking works
bun run check --filter @beep/ui-core
bun run check --filter @beep/ui
```

---

## Phase 1: CSS Variables

### Goal
Merge todox CSS variables into `packages/ui/ui/src/styles/globals.css` without breaking existing consumers.

### Key Files
```
Source:  apps/todox/src/app/globals.css
Target:  packages/ui/ui/src/styles/globals.css
```

### Strategy
1. **Add** todox variables - do NOT replace existing
2. **Preserve** all `--mui-*` and `--palette-*` variables
3. **Append** shadcn/OKLch variables as secondary system

### What to Add from Todox

**Shadcn/ui color variables:**
```css
--background, --foreground, --card, --card-foreground
--popover, --popover-foreground, --primary, --primary-foreground
--secondary, --secondary-foreground, --muted, --muted-foreground
--accent, --accent-foreground, --destructive, --destructive-foreground
--border, --input, --ring
--chart-1 through --chart-5
```

**Border radius system:**
```css
--radius, --radius-sm, --radius-md, --radius-lg
--radius-xl, --radius-2xl, --radius-3xl, --radius-4xl
```

**Utility styles:**
```css
/* Resizable panel styles (lines 148-185 in todox globals.css) */
/* .scrollbar-none utility */
```

### Verification

```bash
# After changes
bun run check --filter @beep/ui
bun run build --filter @beep/ui

# Ensure todox still builds
bun run check --filter @beep/todox
```

---

## Start Phase 1

Copy-paste this prompt to begin:

```
You are implementing Phase 1 of the ui-theme-consolidation spec.

## Context
Read: specs/ui-theme-consolidation/outputs/INVENTORY.md

## Mission
Merge CSS variables from apps/todox/src/app/globals.css into
packages/ui/ui/src/styles/globals.css.

## Rules
1. PRESERVE all existing variables (add, don't replace)
2. Add todox shadcn variables under a clear comment section
3. Add border radius system
4. Add resizable panel styles
5. Add .scrollbar-none utility

## Verification
bun run check --filter @beep/ui
bun run build --filter @beep/ui

## Success Criteria
- [ ] All todox CSS variables added to ui-ui globals.css
- [ ] No existing variables removed or renamed
- [ ] bun run check passes
- [ ] bun run build passes
```

---

## Phase Navigation

| Phase | Focus | Handoff |
|-------|-------|---------|
| P1 | CSS Variables | `handoffs/HANDOFF_P2.md` |
| P2 | MUI Components | `handoffs/HANDOFF_P3.md` |
| P3 | Theme Config | `handoffs/HANDOFF_P4.md` |
| P4 | Cleanup | Complete |

---

## References

- Full inventory: `outputs/INVENTORY.md`
- Detailed workflow: `MASTER_ORCHESTRATION.md`
- Phase handoffs: `handoffs/`
