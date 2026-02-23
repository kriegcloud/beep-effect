# Phase 2 Handoff: Tailwind + shadcn Conversion

> Full context for implementing Phase 2 of the Lexical Playground Port.

---

## Context Budget Verification

| Memory Type | Content | Est. Tokens | Budget | Status |
|-------------|---------|-------------|--------|--------|
| Working | P2 tasks, component mapping | ~1,200 | ≤2,000 | OK |
| Episodic | Phase 1 summary, key learnings | ~500 | ≤1,000 | OK |
| Semantic | File paths, shadcn patterns | ~300 | ≤500 | OK |
| **Total** | | **~2,000** | **≤4,000** | **OK** |

---

## Phase 1 Summary

Phase 1 completed successfully. The Lexical Playground codebase in `apps/todox/src/app/lexical/` now passes all quality commands:

- **Lint errors**: 106 → 0
- **Type errors**: Fixed (including corrupted file repair)
- **Build status**: Passing

Key fixes applied:
- Restored malformed license header in `InsertLayoutDialog.tsx`
- Added `type="button"` to ~10 button elements
- Removed unused imports (especially `import * as React`)
- Fixed `isNaN()` → `Number.isNaN()`
- Added iframe titles and anchor content for accessibility

---

## Phase 2 Objective

Convert CSS files to Tailwind utility classes and replace Lexical UI components with existing shadcn equivalents.

**Success Criteria**:
- CSS files reduced from 32 to ≤5 (theme files may remain)
- 7 UI components replaced with shadcn equivalents
- Zero visual regressions

---

## CSS File Inventory (32 files)

### Themes (3 files) - KEEP/INTEGRATE
| File | Lines | Priority | Notes |
|------|-------|----------|-------|
| `themes/PlaygroundEditorTheme.css` | ~300 | Keep | Core editor styles |
| `themes/CommentEditorTheme.css` | ~50 | Keep | Comment thread styling |
| `themes/StickyEditorTheme.css` | ~30 | Keep | Sticky note styling |

### UI Components (10 files) - CONVERT TO TAILWIND
| File | Lines | shadcn Replacement | Priority |
|------|-------|-------------------|----------|
| `ui/Modal.css` | ~80 | `dialog.tsx` | High |
| `ui/Button.css` | ~60 | `button.tsx` | High |
| `ui/Select.css` | ~40 | `select.tsx` | High |
| `ui/Dialog.css` | ~50 | `dialog.tsx` | High |
| `ui/ColorPicker.css` | ~100 | `popover.tsx` + custom | Medium |
| `ui/Input.css` | ~30 | `input.tsx` | Medium |
| `ui/ContentEditable.css` | ~20 | Tailwind inline | Low |
| `ui/EquationEditor.css` | ~40 | Tailwind inline | Low |
| `ui/ExcalidrawModal.css` | ~60 | `dialog.tsx` | Low |
| `ui/FlashMessage.css` | ~30 | `sonner.tsx` | Low |
| `ui/KatexEquationAlterer.css` | ~40 | Tailwind inline | Low |

### Nodes (5 files) - CONVERT TO TAILWIND
| File | Priority | Notes |
|------|----------|-------|
| `nodes/ImageNode.css` | Medium | Image positioning/resizing |
| `nodes/PollNode.css` | Low | Poll UI styling |
| `nodes/StickyNode.css` | Low | Sticky note appearance |
| `nodes/DateTimeNode/DateTimeNode.css` | Low | Date picker styling |
| `nodes/PageBreakNode/index.css` | Low | Simple divider |

### Plugins (13 files) - CONVERT INCREMENTALLY
| File | Priority | Notes |
|------|----------|-------|
| `plugins/ToolbarPlugin/fontSize.css` | High | Toolbar dropdown |
| `plugins/FloatingTextFormatToolbarPlugin/index.css` | High | Selection toolbar |
| `plugins/FloatingLinkEditorPlugin/index.css` | High | Link editing |
| `plugins/DraggableBlockPlugin/index.css` | Medium | Drag handle |
| `plugins/TableHoverActionsV2Plugin/index.css` | Medium | Table controls |
| `plugins/CodeActionMenuPlugin/index.css` | Medium | Code block menu |
| `plugins/CodeActionMenuPlugin/components/PrettierButton/index.css` | Low | Prettier icon |
| `plugins/CommentPlugin/index.css` | Medium | Comment threads |
| `plugins/CollapsiblePlugin/Collapsible.css` | Low | Collapsible sections |
| `plugins/TableCellResizer/index.css` | Low | Table resizing |
| `plugins/TableOfContentsPlugin/index.css` | Low | TOC sidebar |
| `plugins/VersionsPlugin/index.css` | Low | Version history |

### Root (1 file)
| File | Priority | Notes |
|------|----------|-------|
| `index.css` | High | Root layout, global styles |

---

## Component Replacement Mapping

### shadcn Components Available

| Lexical Component | shadcn Replacement | Import Path |
|-------------------|-------------------|-------------|
| `ui/Modal.tsx` | `dialog.tsx` | `@/components/ui/dialog` |
| `ui/Button.tsx` | `button.tsx` | `@/components/ui/button` |
| `ui/DropDown.tsx` | `dropdown-menu.tsx` | `@/components/ui/dropdown-menu` |
| `ui/Select.tsx` | `select.tsx` | `@/components/ui/select` |
| `ui/Switch.tsx` | `switch.tsx` | `@/components/ui/switch` |
| `ui/ColorPicker.tsx` | `popover.tsx` + custom | `@/components/ui/popover` |
| `ui/Dialog.tsx` | `dialog.tsx` | `@/components/ui/dialog` |

### Critical Constraint

**This repo uses `@base-ui/react`, NOT `@radix-ui`**:

```typescript
// CORRECT - This repo's pattern
import { Dialog } from "@base-ui/react";

// WRONG - Standard shadcn pattern (NOT used here)
import * as DialogPrimitive from "@radix-ui/react-dialog";
```

Check existing shadcn components in `apps/todox/src/components/ui/` for correct patterns.

---

## Implementation Order

### Phase 2.1: Analyze CSS Patterns (Small)
1. Review each CSS file to understand required styles
2. Identify Tailwind equivalents for common patterns
3. Document any styles that need custom CSS

### Phase 2.2: Replace High-Priority UI Components (Large)
1. **Modal → Dialog**
   - Replace `ui/Modal.tsx` with shadcn Dialog
   - Update all Modal imports (grep for `from './ui/Modal'`)
   - Delete `ui/Modal.css`

2. **Button → Button**
   - Replace `ui/Button.tsx` with shadcn Button
   - Map variants: `outline`, `primary`, `danger`
   - Update all Button imports
   - Delete `ui/Button.css`

3. **DropDown → DropdownMenu**
   - Replace `ui/DropDown.tsx` with shadcn DropdownMenu
   - Preserve keyboard navigation
   - Update all DropDown imports

4. **Select → Select**
   - Replace `ui/Select.tsx` with shadcn Select
   - Update all Select imports
   - Delete `ui/Select.css`

5. **Switch → Switch**
   - Replace `ui/Switch.tsx` with shadcn Switch
   - Update all Switch imports

### Phase 2.3: Convert Toolbar Styles (Medium)
1. Convert `plugins/ToolbarPlugin/fontSize.css` to Tailwind
2. Convert `plugins/FloatingTextFormatToolbarPlugin/index.css` to Tailwind
3. Convert `plugins/FloatingLinkEditorPlugin/index.css` to Tailwind

### Phase 2.4: Convert Remaining UI CSS (Medium)
1. Convert `ui/Input.css` to Tailwind
2. Convert `ui/ContentEditable.css` to Tailwind
3. Convert `ui/ColorPicker.css` (with custom popover)

### Phase 2.5: Convert Node CSS (Small)
1. Convert node-specific CSS files to Tailwind inline styles
2. Keep minimal custom CSS if needed for complex positioning

### Phase 2.6: Integrate Theme CSS (Small)
1. Review theme CSS files
2. Keep essential Lexical editor theme styles
3. Remove any redundant styles covered by Tailwind

---

## Tailwind Patterns Reference

### Common CSS → Tailwind Mappings

```css
/* CSS */
.button { display: flex; align-items: center; gap: 8px; }
```
```tsx
// Tailwind
<button className="flex items-center gap-2">
```

```css
/* CSS */
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); }
```
```tsx
// Tailwind
<div className="fixed inset-0 bg-black/50">
```

```css
/* CSS */
.toolbar { border: 1px solid #e5e7eb; border-radius: 8px; padding: 4px 8px; }
```
```tsx
// Tailwind
<div className="border border-gray-200 rounded-lg px-2 py-1">
```

### Editor-Specific Patterns

Keep CSS custom properties for Lexical theme integration:
```css
/* Keep in theme CSS */
.PlaygroundEditorTheme__textBold { font-weight: bold; }
.PlaygroundEditorTheme__textItalic { font-style: italic; }
```

---

## Files Requiring Updates After Component Replacement

### Modal Users (search: `import.*Modal`)
- `plugins/ImagesPlugin/index.tsx`
- `plugins/EquationsPlugin/index.tsx`
- `plugins/TableActionMenuPlugin/index.tsx`
- `plugins/ExcalidrawPlugin/index.tsx`
- `nodes/ExcalidrawNode/ExcalidrawComponent.tsx`

### Button Users (search: `import.*Button.*from.*ui/Button`)
- `ui/Dialog.tsx`
- `plugins/ToolbarPlugin/index.tsx`
- `plugins/TableActionMenuPlugin/index.tsx`
- Multiple other plugins

### DropDown Users (search: `import.*DropDown`)
- `plugins/ToolbarPlugin/index.tsx`
- `plugins/TableActionMenuPlugin/index.tsx`

---

## Verification Commands

```bash
# After each component replacement
bun run lint --filter=@beep/todox
bun run check --filter=@beep/todox

# After all conversions
bun run build --filter=@beep/todox

# Count remaining CSS files
find apps/todox/src/app/lexical -name "*.css" | wc -l  # Target: ≤5

# Visual verification
bun run dev --filter=@beep/todox
# Navigate to /lexical and verify UI appearance
```

---

## Known Gotchas

1. **@base-ui vs @radix-ui**: Check existing shadcn components for correct import patterns
2. **CSS specificity**: Lexical uses specific class names - may need `!important` or careful ordering
3. **Theme classes**: Don't remove `.PlaygroundEditorTheme__*` classes - they're used by Lexical
4. **Dropdown positioning**: shadcn DropdownMenu uses Radix positioning - verify dropdown alignment
5. **Modal z-index**: Ensure dialogs appear above editor content (z-50 minimum)
6. **ColorPicker complexity**: May need custom implementation with shadcn Popover base

---

## Success Criteria Checklist

- [ ] CSS files reduced to ≤5 (currently 32)
- [ ] Modal replaced with Dialog
- [ ] Button replaced with shadcn Button
- [ ] DropDown replaced with DropdownMenu
- [ ] Select replaced with shadcn Select
- [ ] Switch replaced with shadcn Switch
- [ ] No visual regressions (manual verification)
- [ ] All quality commands pass

---

## Next Phase Preview

After P2 completes, P3 will:
- Create `/app/lexical/page.tsx` with metadata
- Migrate `server/validation.ts` to Next.js API routes
- Handle authentication for the lexical page
