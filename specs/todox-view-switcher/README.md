# Todox View Switcher Spec

> Connect the ToggleGroup component in `apps/todox/src/app/page.tsx` to conditionally render different views based on user selection.

---

## Problem Statement

The `page.tsx` component currently has a `ToggleGroup` (lines 129-178) that allows users to select from 10 different view modes:
- workspace
- calendar (duplicated at lines 142-144 AND 170-173)
- email
- knowledge-base
- todos
- people
- tasks
- files
- heat-map

However, the `viewMode` state is never used to conditionally render content. The `<MailContent />` component is always rendered regardless of selection.

### Current Issues

1. **Dead State**: `viewMode` state exists but doesn't control rendering
2. **Duplicate Entry**: "Calendar" appears twice in the toggle group
3. **Missing Views**: Only `mail` and `editor` features exist in `apps/todox/src/features/`
4. **Multi-Select Confusion**: `viewMode` is `string[]` but UI suggests single selection

---

## Success Criteria

- [ ] ToggleGroup selection changes the rendered content
- [ ] Remove duplicate "calendar" entry
- [ ] Change from multi-select to single-select semantics
- [ ] Placeholder components exist for views without implementations
- [ ] Smooth transitions between views (optional enhancement)
- [ ] View state can be preserved when switching (e.g., email scroll position)

---

## Scope

### In Scope

- Wire `viewMode` state to conditional rendering
- Create placeholder view components for missing views
- Fix duplicate calendar toggle item
- Refactor to single-select toggle behavior

### Out of Scope

- Full implementation of each view (workspace, calendar, etc.)
- Backend integration for new views
- Complex state persistence across view switches

---

## Technical Analysis

### Current State

```
apps/todox/src/
├── app/page.tsx          # ToggleGroup + MailContent (disconnected)
├── features/
│   ├── mail/             # Email feature (complete)
│   └── editor/           # Editor feature (exists)
```

### Target State

```
apps/todox/src/
├── app/page.tsx              # ToggleGroup + inline conditional rendering
├── components/
│   └── placeholder-view.tsx  # Shared placeholder for unimplemented views
├── features/
│   ├── mail/                 # Email feature (complete)
│   └── editor/               # Editor feature (exists)
```

### View Mode Type

```typescript
// Current (problematic)
const [viewMode, setViewMode] = React.useState<string[]>(["email"]);

// Target (clear semantics)
type ViewMode =
  | "workspace"
  | "calendar"
  | "email"
  | "knowledge-base"
  | "todos"
  | "people"
  | "tasks"
  | "files"
  | "heat-map";

const [viewMode, setViewMode] = React.useState<ViewMode>("email");
```

---

## Implementation Plan

### Phase 1: Foundation (This Session)

1. **Fix Duplicate Calendar**: Remove lines 170-173 (duplicate calendar toggle)
2. **Refactor to Single Select**: Change `viewMode` from `string[]` to union type
3. **Add Inline Conditional Rendering**: Simple ternary in `page.tsx`
4. **Create PlaceholderView Component**: Shared component for unimplemented views
5. **Wire Up Email View**: Ensure current mail functionality works through new pattern

### Phase 2: Placeholder Views

1. Create placeholder components for each view type
2. Each placeholder shows view name + "Coming Soon" message
3. Consistent styling with existing mail view

### Phase 3: Polish

1. Add loading states during view transitions
2. Consider view state preservation (React.memo, keep-alive pattern)
3. Update any navigation that should set viewMode

---

## Design Decisions

### Decision 1: Single vs Multi-Select

**Chosen**: Single-select

**Rationale**: UI shows distinct views (not combinable panels). The original multi-select design was likely a mistake since only one main content area exists.

### Decision 2: View Component Architecture

**Options**:
1. Inline conditional rendering in `page.tsx`
2. Separate `ViewSwitcher` component
3. Dynamic imports per view

**Chosen**: Option 1 - Inline conditional rendering

**Rationale**: Simplest approach for current scope. With only email implemented, a separate ViewSwitcher component adds unnecessary abstraction. Can refactor to Option 2 or 3 when more views are implemented.

### Decision 3: Placeholder Implementation

**Options**:
1. Shared `PlaceholderView` component with props
2. Individual placeholder files per feature
3. Inline placeholders in ViewSwitcher

**Chosen**: Option 1 - Shared component

**Rationale**: Reduces boilerplate, easy to replace with real implementations later.

---

## Files to Modify

| File | Change |
|------|--------|
| `apps/todox/src/app/page.tsx` | Remove duplicate, refactor state, add conditional rendering |
| `apps/todox/src/components/placeholder-view.tsx` | New component for unimplemented views |

---

## Verification

```bash
# Type check
bun run check

# Dev server test
bun --filter=@beep/todox dev
# Then manually test toggle switching
```

---

## Related Documentation

- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md)
- [META_SPEC_TEMPLATE](../ai-friendliness-audit/META_SPEC_TEMPLATE.md)
