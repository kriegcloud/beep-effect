# HANDOFF_P11-F: Testing & Documentation Phase

**Created**: 2026-01-27
**Phase**: P11-F (Final phase of P11 shadcn-native migration)
**Status**: READY FOR EXECUTION

## Context

P11 shadcn-native Lexical migration is nearly complete. All code changes have been implemented:

| Phase | Description | Status |
|-------|-------------|--------|
| P11-A | Foundation (theme files, hooks, context) | COMPLETE |
| P11-B | Core plugins (8 nodes, 17 plugin files, UI components) | COMPLETE |
| P11-C | Toolbar modularization (5 extracted components) | COMPLETE |
| P11-D | Custom features evaluation (decision matrix created) | COMPLETE |
| P11-E | Theme & CSS cleanup (8 files deleted, SpecialTextNode removed) | COMPLETE |
| P11-F | Testing & Documentation | THIS PHASE |

## Objectives

1. **Visual Verification** - Ensure all editor features work correctly
2. **Write/Update Tests** - Optional but recommended for new components
3. **Update Documentation** - README, inline comments, theme documentation
4. **Final Metrics Report** - Document migration achievements
5. **Archive Handoffs** - Clean up handoff documents

---

## Task F1: Visual Verification

**Priority**: BLOCKING (must pass before other tasks)

### Steps

1. Start the development server:
   ```bash
   bun run dev --filter=@beep/todox
   ```

2. Navigate to `http://localhost:3000/lexical`

3. Test each feature category:

#### Text Editing
- [ ] Type text in editor
- [ ] Select text
- [ ] Copy/paste text

#### Formatting Toolbar
- [ ] Bold (Cmd/Ctrl+B)
- [ ] Italic (Cmd/Ctrl+I)
- [ ] Underline (Cmd/Ctrl+U)
- [ ] Strikethrough
- [ ] Code formatting
- [ ] Subscript/Superscript

#### Undo/Redo
- [ ] Undo button works
- [ ] Redo button works
- [ ] Keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)

#### Dropdown Menus
- [ ] Block type selector opens
- [ ] Font family selector opens
- [ ] Font size selector opens
- [ ] Text alignment selector opens

#### Color Pickers
- [ ] Text color picker opens and applies colors
- [ ] Background color picker opens and applies colors

#### Advanced Features
- [ ] Insert table (via toolbar)
- [ ] Table cell operations (if table exists)
- [ ] Code block insertion
- [ ] Code language selection
- [ ] Horizontal rule insertion

#### Image Handling
- [ ] Insert image (URL or upload)
- [ ] Image resize handles appear
- [ ] Image caption works (if enabled)

#### Links
- [ ] Insert link
- [ ] Edit existing link
- [ ] Link preview on hover

### Regression Checklist

Document any issues found:

| Feature | Status | Issue Description |
|---------|--------|-------------------|
| Text input | | |
| Bold/Italic | | |
| Undo/Redo | | |
| Dropdowns | | |
| Color pickers | | |
| Tables | | |
| Code blocks | | |
| Images | | |
| Links | | |

---

## Task F2: Component Tests (Optional)

**Priority**: RECOMMENDED but not blocking

### New Components to Test

Located in `apps/todox/src/app/lexical/plugins/ToolbarPlugin/components/`:

1. **UndoRedoControls.tsx**
   - Test: buttons disabled when no history
   - Test: buttons enabled after edits
   - Test: click triggers correct command

2. **TextFormatButtonGroup.tsx**
   - Test: bold button toggles `isBold` state
   - Test: italic button toggles `isItalic` state
   - Test: correct aria-pressed attributes

3. **ColorPickerGroup.tsx**
   - Test: dropdown opens on click
   - Test: color selection triggers callback
   - Test: current color is displayed

4. **FontControls.tsx**
   - Test: font family dropdown shows options
   - Test: font size dropdown shows options
   - Test: selection updates editor state

5. **AdvancedTextFormattingMenu.tsx**
   - Test: menu opens on click
   - Test: all format options are accessible
   - Test: format application works

### Test File Location

```
apps/todox/test/lexical/plugins/ToolbarPlugin/
  components/
    UndoRedoControls.test.tsx
    TextFormatButtonGroup.test.tsx
    ColorPickerGroup.test.tsx
    FontControls.test.tsx
    AdvancedTextFormattingMenu.test.tsx
```

### Test Pattern

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { render, screen, fireEvent } from "@testing-library/react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { UndoRedoControls } from "../src/app/lexical/plugins/ToolbarPlugin/components/UndoRedoControls";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LexicalComposer initialConfig={/* test config */}>
    {children}
  </LexicalComposer>
);

effect("UndoRedoControls renders undo button", () =>
  Effect.gen(function* () {
    render(
      <TestWrapper>
        <UndoRedoControls canUndo={false} canRedo={false} />
      </TestWrapper>
    );
    const undoButton = screen.getByRole("button", { name: /undo/i });
    strictEqual(undoButton.hasAttribute("disabled"), true);
  })
);
```

---

## Task F3: Update Documentation

**Priority**: REQUIRED

### Files to Update/Create

#### 1. Lexical README

**File**: `apps/todox/src/app/lexical/README.md`

Content outline:
- Overview of the Lexical editor integration
- shadcn/ui component usage
- Theme customization via `editor-theme.ts`
- Plugin architecture
- How to add new toolbar features

#### 2. Theme Documentation

**File**: `apps/todox/src/app/lexical/themes/editor-theme.ts`

Add JSDoc comments explaining:
- Theme class structure
- How classes map to Lexical node types
- Customization points

#### 3. Component JSDoc

Add inline documentation to new toolbar components:

```typescript
/**
 * UndoRedoControls - Provides undo/redo buttons for the Lexical editor toolbar.
 *
 * Uses shadcn/ui Button component with icon-only styling.
 * Integrates with Lexical's history plugin via UNDO_COMMAND and REDO_COMMAND.
 *
 * @param canUndo - Whether undo is available
 * @param canRedo - Whether redo is available
 */
export function UndoRedoControls({ canUndo, canRedo }: Props) {
  // ...
}
```

---

## Task F4: Final Metrics Report

**Priority**: REQUIRED

### Update CURRENT_STATUS.md

Add a "P11 Final Metrics" section with these achievements:

#### CSS Reduction
| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| CSS files | 5 | 1 | 80% |
| Lines of CSS | ~3000 | ~600 | 80% |

#### Component Architecture
| Metric | Count |
|--------|-------|
| Toolbar components extracted | 5 |
| Custom nodes removed | 1 (SpecialTextNode) |
| Insert actions removed | 1 (Insert GIF) |
| shadcn/ui components integrated | ~15 |

#### Files Changed Summary
- **Deleted**: 8 CSS/theme files
- **Created**: 5 toolbar components
- **Modified**: ~25 plugin/node files

#### Benefits Achieved
1. Consistent UI via shadcn/ui design system
2. Dark mode support via CSS variables
3. Reduced CSS bundle size by ~80%
4. Modular toolbar architecture
5. Type-safe theme configuration

---

## Task F5: Archive Handoff Documents

**Priority**: FINAL CLEANUP

### Files to Archive

Move to `specs/lexical-playground-port/handoffs/archive/`:

1. `HANDOFF_P11.md` (initial P11 handoff)
2. `HANDOFF_P11-A.md` through `HANDOFF_P11-E.md`
3. `P11_ORCHESTRATOR_PROMPT.md`

### Archive Command

```bash
mkdir -p specs/lexical-playground-port/handoffs/archive/p11
mv specs/lexical-playground-port/handoffs/HANDOFF_P11*.md specs/lexical-playground-port/handoffs/archive/p11/
mv specs/lexical-playground-port/handoffs/P11_ORCHESTRATOR_PROMPT.md specs/lexical-playground-port/handoffs/archive/p11/
```

Keep `HANDOFF_P11-F.md` until phase is complete, then archive it as well.

---

## Exit Criteria

- [ ] F1: Visual verification passed (all features work)
- [ ] F2: Tests written (optional but documented if skipped)
- [ ] F3: Documentation updated
- [ ] F4: Final metrics documented in CURRENT_STATUS.md
- [ ] F5: Handoff documents archived
- [ ] `/reflect` run for P11-F learnings
- [ ] P11 marked as COMPLETE in CURRENT_STATUS.md

---

## Verification Commands

```bash
# Type check the entire todox app
bun run check --filter=@beep/todox

# Start development server
bun run dev --filter=@beep/todox

# Run tests (if written)
bun run test --filter=@beep/todox

# Manual verification
# Navigate to: http://localhost:3000/lexical
```

---

## Orchestrator Notes

### Execution Order

1. **F1 FIRST** - Visual verification is blocking. Any regressions must be fixed before proceeding.
2. **F2 OPTIONAL** - Tests are valuable but not required for MVP completion.
3. **F3 + F4 PARALLEL** - Documentation and metrics can be done simultaneously after F1 passes.
4. **F5 LAST** - Archive only after all other tasks are complete.

### If Regressions Found in F1

1. Document the regression in this handoff
2. Create a focused fix task
3. Re-run visual verification
4. Do NOT proceed to F2-F5 until all regressions are resolved

### Context Window Management

If reaching 10% context remaining:

1. **STOP IMMEDIATELY**
2. Create `HANDOFF_P11-F-CONTINUATION.md` with:
   - Which tasks are complete (F1-F5)
   - Visual verification results (pass/fail for each feature)
   - Any regressions found and their status
   - What documentation has been written
   - What remains to be done
3. Output continuation prompt for next agent

---

## Success Definition

P11 is COMPLETE when:

1. The Lexical editor at `/lexical` works with all core features
2. All UI uses shadcn/ui components consistently
3. CSS is consolidated into a single theme file
4. Documentation exists for future maintainers
5. Metrics are recorded for the migration

After P11 completion, the Lexical playground port specification moves to MAINTENANCE phase.
