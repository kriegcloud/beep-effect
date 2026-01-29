# @beep/ui-editor - Storybook Stories Pending

## Status: BLOCKED

Storybook stories for @beep/ui-editor are pending component extraction.

## Current State

- **Package Status**: Empty stub
- **Components**: 0
- **Source Location**: `apps/todox/src/app/lexical/` (not yet extracted)

## Prerequisite

Before editor stories can be created:
1. Extract Lexical editor components from `apps/todox/` to `@beep/ui-editor`
2. Define stable API surface for editor components
3. Create reusable nodes, plugins, and toolbar components

## Estimated Components (Post-Extraction)

| Component | Description |
|-----------|-------------|
| Editor | Main rich text editor |
| Toolbar | Formatting toolbar |
| FloatingMenu | Context-sensitive menu |
| Nodes | Lexical node plugins |

## Next Steps

- [ ] Complete Lexical editor extraction
- [ ] Define component API
- [ ] Create stories following @beep/ui patterns

## Reference

- Spec: `specs/storybook-implementation/`
- Pattern: `packages/ui/ui/src/components/*.stories.tsx`
