# Storybook Implementation Plan

**Created**: 2026-01-29
**Phase**: P3 (Planning)

---

## Executive Summary

This plan details 22 tasks across 4 sub-phases to implement Storybook for `@beep/ui`.

**Key Constraints**:
- Use `withThemeByDataAttribute` with `attributeName: "data-color-scheme"`
- Location: `tooling/storybook/`
- Stories co-located with components (`.stories.tsx` suffix)
- Phase P4c (Editor Stories) is **BLOCKED** - `@beep/ui-editor` is an empty stub

---

## Sub-Phase P4a: Foundation Setup (7 tasks)

### Task 4a.1: Create Storybook Workspace Package

**Description**: Initialize `@beep/storybook` workspace in `tooling/storybook/` with package.json.

**Files to Create**:
- `tooling/storybook/package.json`

**Complexity**: S (Small)

**Dependencies**: None

**Verification**:
```bash
bun install && cat tooling/storybook/package.json | head -20
```

**Rollback**:
```bash
rm -rf tooling/storybook && bun install
```

---

### Task 4a.2: Create TypeScript Configuration

**Description**: Create tsconfig.json extending base config with Storybook-specific paths.

**Files to Create**:
- `tooling/storybook/tsconfig.json`

**Complexity**: S (Small)

**Dependencies**: 4a.1

**Verification**:
```bash
cd tooling/storybook && bun tsc --noEmit --showConfig | head -30
```

**Rollback**:
```bash
rm tooling/storybook/tsconfig.json
```

---

### Task 4a.3: Create Storybook main.ts Configuration

**Description**: Configure Storybook framework, addons, stories glob, and Vite PostCSS passthrough for Tailwind v4.

**Files to Create**:
- `tooling/storybook/.storybook/main.ts`

**Complexity**: M (Medium)

**Dependencies**: 4a.1, 4a.2

**Verification**:
```bash
cat tooling/storybook/.storybook/main.ts
```

**Rollback**:
```bash
rm tooling/storybook/.storybook/main.ts
```

---

### Task 4a.4: Create Theme Decorator

**Description**: Create ThemeDecorator using `withThemeByDataAttribute` (NOT `withThemeByClassName`) with `attributeName: "data-color-scheme"`.

**Files to Create**:
- `tooling/storybook/.storybook/decorators/ThemeDecorator.tsx`

**Complexity**: M (Medium)

**Dependencies**: 4a.1

**Verification**:
```bash
# MUST find withThemeByDataAttribute
grep -n "withThemeByDataAttribute" tooling/storybook/.storybook/decorators/ThemeDecorator.tsx
# MUST find data-color-scheme
grep -n "data-color-scheme" tooling/storybook/.storybook/decorators/ThemeDecorator.tsx
# MUST NOT find withThemeByClassName
grep -c "withThemeByClassName" tooling/storybook/.storybook/decorators/ThemeDecorator.tsx || echo "PASS: No withThemeByClassName"
```

**Rollback**:
```bash
rm tooling/storybook/.storybook/decorators/ThemeDecorator.tsx
```

---

### Task 4a.5: Create preview.tsx with Decorators

**Description**: Create preview.tsx importing globals.css, applying theme decorators in correct order.

**Files to Create**:
- `tooling/storybook/.storybook/preview.tsx`

**Complexity**: M (Medium)

**Dependencies**: 4a.4

**Verification**:
```bash
cd tooling/storybook && bun run dev &
sleep 10 && curl -s http://localhost:6006 | grep -o "Storybook" && kill %1
```

**Rollback**:
```bash
rm tooling/storybook/.storybook/preview.tsx
```

---

### Task 4a.6: Update turbo.json with Storybook Tasks

**Description**: Add `storybook:dev` and `storybook:build` tasks to turbo.json.

**Files to Modify**:
- `turbo.json`

**Complexity**: S (Small)

**Dependencies**: 4a.1

**Verification**:
```bash
grep -A5 "storybook:dev" turbo.json
```

**Rollback**:
```bash
git checkout turbo.json
```

---

### Task 4a.7: Create AGENTS.md for Storybook Package

**Description**: Document the Storybook package purpose and constraints for AI assistants.

**Files to Create**:
- `tooling/storybook/AGENTS.md`

**Complexity**: S (Small)

**Dependencies**: 4a.1

**Verification**:
```bash
cat tooling/storybook/AGENTS.md | head -30
```

**Rollback**:
```bash
rm tooling/storybook/AGENTS.md
```

---

## Sub-Phase P4b: Package Stories (7 tasks)

### Task 4b.1: Create Button Story (Reference Pattern)

**Description**: Create the first story file for Button component as the reference pattern.

**Files to Create**:
- `packages/ui/ui/src/components/button.stories.tsx`

**Complexity**: S (Small)

**Dependencies**: 4a.5

**Verification**:
```bash
cd tooling/storybook && bun run dev &
sleep 15 && curl -s "http://localhost:6006/iframe.html?id=components-button--default" | grep -o "button" && kill %1
```

**Rollback**:
```bash
rm packages/ui/ui/src/components/button.stories.tsx
```

---

### Task 4b.2: Create Input Stories (Form Primitives)

**Description**: Create stories for Input, Textarea, Label components.

**Files to Create**:
- `packages/ui/ui/src/components/input.stories.tsx`
- `packages/ui/ui/src/components/textarea.stories.tsx`
- `packages/ui/ui/src/components/label.stories.tsx`

**Complexity**: M (Medium)

**Dependencies**: 4b.1

**Verification**:
```bash
ls -la packages/ui/ui/src/components/*.stories.tsx | wc -l
```

**Rollback**:
```bash
rm packages/ui/ui/src/components/{input,textarea,label}.stories.tsx
```

---

### Task 4b.3: Create Selection Stories

**Description**: Create stories for checkbox, radio-group, switch, select.

**Files to Create**:
- `packages/ui/ui/src/components/checkbox.stories.tsx`
- `packages/ui/ui/src/components/radio-group.stories.tsx`
- `packages/ui/ui/src/components/switch.stories.tsx`
- `packages/ui/ui/src/components/select.stories.tsx`

**Complexity**: M (Medium)

**Dependencies**: 4b.1

**Verification**:
```bash
ls packages/ui/ui/src/components/{checkbox,radio-group,switch,select}.stories.tsx
```

**Rollback**:
```bash
rm packages/ui/ui/src/components/{checkbox,radio-group,switch,select}.stories.tsx
```

---

### Task 4b.4: Create Overlay Stories

**Description**: Create stories for dialog, sheet, popover, tooltip.

**Files to Create**:
- `packages/ui/ui/src/components/dialog.stories.tsx`
- `packages/ui/ui/src/components/sheet.stories.tsx`
- `packages/ui/ui/src/components/popover.stories.tsx`
- `packages/ui/ui/src/components/tooltip.stories.tsx`

**Complexity**: M (Medium)

**Dependencies**: 4b.1

**Verification**:
```bash
ls packages/ui/ui/src/components/{dialog,sheet,popover,tooltip}.stories.tsx
```

**Rollback**:
```bash
rm packages/ui/ui/src/components/{dialog,sheet,popover,tooltip}.stories.tsx
```

---

### Task 4b.5: Create Data Display Stories

**Description**: Create stories for card, badge, table, avatar.

**Files to Create**:
- `packages/ui/ui/src/components/card.stories.tsx`
- `packages/ui/ui/src/components/badge.stories.tsx`
- `packages/ui/ui/src/components/table.stories.tsx`
- `packages/ui/ui/src/components/avatar.stories.tsx`

**Complexity**: M (Medium)

**Dependencies**: 4b.1

**Verification**:
```bash
ls packages/ui/ui/src/components/{card,badge,table,avatar}.stories.tsx
```

**Rollback**:
```bash
rm packages/ui/ui/src/components/{card,badge,table,avatar}.stories.tsx
```

---

### Task 4b.6: Create Navigation Stories

**Description**: Create stories for tabs, accordion, sidebar.

**Files to Create**:
- `packages/ui/ui/src/components/tabs.stories.tsx`
- `packages/ui/ui/src/components/accordion.stories.tsx`
- `packages/ui/ui/src/components/sidebar.stories.tsx`

**Complexity**: L (Large) - Sidebar is 625 lines

**Dependencies**: 4b.1

**Verification**:
```bash
ls packages/ui/ui/src/components/{tabs,accordion,sidebar}.stories.tsx
```

**Rollback**:
```bash
rm packages/ui/ui/src/components/{tabs,accordion,sidebar}.stories.tsx
```

---

### Task 4b.7: Create Menu Stories

**Description**: Create stories for dropdown-menu, context-menu, command.

**Files to Create**:
- `packages/ui/ui/src/components/dropdown-menu.stories.tsx`
- `packages/ui/ui/src/components/context-menu.stories.tsx`
- `packages/ui/ui/src/components/command.stories.tsx`

**Complexity**: M (Medium)

**Dependencies**: 4b.1

**Verification**:
```bash
ls packages/ui/ui/src/components/{dropdown-menu,context-menu,command}.stories.tsx
```

**Rollback**:
```bash
rm packages/ui/ui/src/components/{dropdown-menu,context-menu,command}.stories.tsx
```

---

## Sub-Phase P4c: Editor Stories (BLOCKED)

### Task 4c.1: Document Blocked Status

**Description**: Create placeholder documentation explaining that @beep/ui-editor stories are BLOCKED.

**Status**: `@beep/ui-editor` is an empty stub with 0 components.

**Files to Create**:
- `packages/ui/editor/STORYBOOK_PENDING.md`

**Complexity**: S (Small)

**Dependencies**: None

**Verification**:
```bash
cat packages/ui/editor/STORYBOOK_PENDING.md
```

**Rollback**:
```bash
rm packages/ui/editor/STORYBOOK_PENDING.md
```

**Note**: Additional tasks (4c.2-4c.7) intentionally omitted - package is empty.

---

## Sub-Phase P4d: Theme Integration (7 tasks)

### Task 4d.1: Verify CSS Variable Bridge

**Description**: Create a test story validating MUI-to-Tailwind CSS variable bridge.

**Files to Create**:
- `packages/ui/ui/src/components/__tests__/theme-bridge.stories.tsx`

**Complexity**: M (Medium)

**Dependencies**: 4a.5

**Verification**:
```bash
cd tooling/storybook && bun run dev &
sleep 15
curl -s "http://localhost:6006/iframe.html?id=tests-theme-bridge--light-mode&globals=theme:light" | grep -o "mui-palette"
kill %1
```

**Rollback**:
```bash
rm packages/ui/ui/src/components/__tests__/theme-bridge.stories.tsx
```

---

### Task 4d.2: Create Color Palette Documentation Story

**Description**: Create documentation story showing all color tokens.

**Files to Create**:
- `packages/ui/ui/src/components/__tests__/color-palette.stories.tsx`

**Complexity**: M (Medium)

**Dependencies**: 4d.1

**Rollback**:
```bash
rm packages/ui/ui/src/components/__tests__/color-palette.stories.tsx
```

---

### Task 4d.3: Create Typography Scale Story

**Description**: Document typography variants from MUI theme.

**Files to Create**:
- `packages/ui/ui/src/components/__tests__/typography.stories.tsx`

**Complexity**: S (Small)

**Dependencies**: 4d.1

**Rollback**:
```bash
rm packages/ui/ui/src/components/__tests__/typography.stories.tsx
```

---

### Task 4d.4: Create Spacing/Layout Tokens Story

**Description**: Document spacing, border-radius, shadow tokens.

**Files to Create**:
- `packages/ui/ui/src/components/__tests__/spacing-tokens.stories.tsx`

**Complexity**: S (Small)

**Dependencies**: 4d.1

**Rollback**:
```bash
rm packages/ui/ui/src/components/__tests__/spacing-tokens.stories.tsx
```

---

### Task 4d.5: Add Color Preset Switcher (Optional)

**Description**: Extend theme decorator to support 6 primary color presets.

**Files to Modify**:
- `tooling/storybook/.storybook/decorators/ThemeDecorator.tsx`
- `tooling/storybook/.storybook/preview.tsx`

**Complexity**: M (Medium)

**Dependencies**: 4a.4, 4a.5

**Rollback**:
```bash
git checkout tooling/storybook/.storybook/
```

---

### Task 4d.6: Add Viewport Preset Configuration

**Description**: Configure standard viewport presets (mobile, tablet, desktop).

**Files to Modify**:
- `tooling/storybook/.storybook/preview.tsx`

**Complexity**: S (Small)

**Dependencies**: 4a.5

**Rollback**:
```bash
git checkout tooling/storybook/.storybook/preview.tsx
```

---

### Task 4d.7: Final Integration Test

**Description**: Verify complete theme integration end-to-end.

**Files to Create**: None (verification only)

**Complexity**: S (Small)

**Dependencies**: All P4d tasks

**Verification**:
```bash
cd tooling/storybook
bun run build
ls -la dist/index.html
```

---

## Task Summary

| Sub-Phase | Tasks | Complexity |
|-----------|-------|------------|
| P4a: Foundation | 7 | 4S, 3M |
| P4b: Package Stories | 7 | 1S, 5M, 1L |
| P4c: Editor Stories | 1 | 1S (BLOCKED) |
| P4d: Theme Integration | 7 | 4S, 3M |
| **Total** | **22** | 10S, 11M, 1L |

---

## Dependency Graph

```
P4a.1 ──> P4a.2 ──> P4a.3 ──┐
    │                       │
    └────────> P4a.4 ───────┼──> P4a.5 ──> P4b.* (all)
                            │         │
                            │         └──> P4d.1 ──> P4d.2-4d.4
                            │
                            └──> P4a.6, P4a.7 (parallel)

P4c.1 (standalone - BLOCKED)
P4d.5, P4d.6 depend on P4a.5
P4d.7 depends on all P4d tasks
```

---

## Critical Success Criteria

1. **Theme attribute**: All theme switching uses `data-color-scheme` attribute
2. **No className dark mode**: Zero instances of `withThemeByClassName`
3. **CSS bridge working**: Both MUI and Tailwind respond to theme toggle
4. **Stories discoverable**: All stories appear in Storybook sidebar
5. **Type checking passes**: `bun run check` succeeds in `tooling/storybook`

---

## Patterns to Avoid

1. **NEVER use `withThemeByClassName`** - Use `withThemeByDataAttribute`
2. **NEVER wrap with `SettingsProvider`** - Uses localStorage, complicates Storybook
3. **NEVER use Webpack builder** - Use Vite with PostCSS for Tailwind v4
