# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the `lexical-playground-port` spec: **Tailwind + shadcn Conversion**.

### Context

Phase 1 is complete - all quality commands pass. The Lexical Playground in `apps/todox/src/app/lexical/` has:
- 32 CSS files needing Tailwind conversion
- 7 UI components to replace with shadcn equivalents
- Zero lint/type/build errors

### Your Mission

Convert CSS to Tailwind utility classes and replace Lexical UI components with existing shadcn components. Target: ≤5 CSS files remaining.

### Critical Constraint

**This repo uses `@base-ui/react`, NOT `@radix-ui`**. Check existing components in `apps/todox/src/components/ui/` for correct patterns before replacing.

### Implementation Steps

1. **Replace Modal with Dialog** (highest impact):
   ```bash
   # Find all Modal imports
   grep -r "from.*ui/Modal" apps/todox/src/app/lexical/
   ```
   - Study existing `apps/todox/src/components/ui/dialog.tsx`
   - Replace `ui/Modal.tsx` usage with shadcn Dialog
   - Delete `ui/Modal.css`

2. **Replace Button**:
   - Map lexical Button variants to shadcn variants
   - Update imports throughout codebase
   - Delete `ui/Button.css`

3. **Replace DropDown with DropdownMenu**:
   - Replace `ui/DropDown.tsx` with shadcn DropdownMenu
   - Ensure keyboard navigation works
   - Update toolbar and menu imports

4. **Replace Select and Switch**:
   - Straightforward 1:1 replacements
   - Update imports, delete CSS files

5. **Convert remaining CSS to Tailwind**:
   - Focus on high-priority plugin CSS (toolbar, floating menus)
   - Keep theme CSS files (`PlaygroundEditorTheme.css`, etc.)
   - Convert inline: `className="button"` → `className="flex items-center gap-2"`

6. **Verify**:
   ```bash
   bun run lint --filter=@beep/todox
   bun run check --filter=@beep/todox
   bun run build --filter=@beep/todox
   find apps/todox/src/app/lexical -name "*.css" | wc -l  # Target: ≤5
   ```

### Component Mapping Quick Reference

| Lexical | shadcn | Notes |
|---------|--------|-------|
| `ui/Modal.tsx` | `@/components/ui/dialog` | Biggest impact |
| `ui/Button.tsx` | `@/components/ui/button` | Map variants |
| `ui/DropDown.tsx` | `@/components/ui/dropdown-menu` | Preserve keyboard nav |
| `ui/Select.tsx` | `@/components/ui/select` | Direct replacement |
| `ui/Switch.tsx` | `@/components/ui/switch` | Direct replacement |
| `ui/ColorPicker.tsx` | `@/components/ui/popover` + custom | Complex, do last |

### CSS Files to Keep (Theme files)

These should remain (Lexical needs them for editor theming):
- `themes/PlaygroundEditorTheme.css`
- `themes/CommentEditorTheme.css`
- `themes/StickyEditorTheme.css`

### Tailwind Conversion Pattern

```tsx
// Before (CSS file)
// .toolbar-button { display: flex; align-items: center; padding: 4px 8px; border-radius: 4px; }
<button className="toolbar-button">

// After (Tailwind)
<button className="flex items-center px-2 py-1 rounded">
```

### Reference Files

- Handoff details: `specs/lexical-playground-port/handoffs/HANDOFF_P2.md`
- Existing shadcn: `apps/todox/src/components/ui/`
- Effect patterns: `.claude/rules/effect-patterns.md`

### Success Criteria

- [ ] CSS files reduced to ≤5 (from 32)
- [ ] Modal, Button, DropDown, Select, Switch replaced with shadcn
- [ ] `bun run lint --filter=@beep/todox` passes
- [ ] `bun run check --filter=@beep/todox` passes
- [ ] `bun run build --filter=@beep/todox` passes
- [ ] No visual regressions (verify at `/lexical` route)

### After Completion

1. Update `specs/lexical-playground-port/REFLECTION_LOG.md` with Phase 2 learnings
2. Create `handoffs/HANDOFF_P3.md` with context for Next.js integration
3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md` for next phase
