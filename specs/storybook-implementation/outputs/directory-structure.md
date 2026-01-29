# Directory Structure - Storybook Implementation

**Created**: 2026-01-29

---

## Overview

This document details every file to be created or modified during Storybook implementation. Files are grouped by sub-phase.

---

## Sub-Phase 4a: Foundation Infrastructure

### New Directory: tooling/storybook/

```
tooling/storybook/                        # NEW workspace
├── package.json                          # NEW - Storybook dependencies
├── tsconfig.json                         # NEW - TypeScript config
├── AGENTS.md                             # NEW - AI assistant docs
└── .storybook/
    ├── main.ts                           # NEW - Storybook framework config
    ├── preview.tsx                       # NEW - Global decorators & CSS
    └── decorators/
        └── ThemeDecorator.tsx            # NEW - MUI + Tailwind theme wrapper
```

### Files to Create (4a)

| File | Purpose | Priority |
|------|---------|----------|
| `tooling/storybook/package.json` | Workspace with @storybook/* deps | P0 |
| `tooling/storybook/tsconfig.json` | Extends tsconfig.base.jsonc | P0 |
| `tooling/storybook/.storybook/main.ts` | Stories glob, addons, viteFinal | P0 |
| `tooling/storybook/.storybook/preview.tsx` | Decorators, globals.css import | P0 |
| `tooling/storybook/.storybook/decorators/ThemeDecorator.tsx` | withThemeByDataAttribute wrapper | P0 |
| `tooling/storybook/AGENTS.md` | Package documentation | P1 |

### Files to Modify (4a)

| File | Change | Priority |
|------|--------|----------|
| `turbo.json` | Add storybook:dev and storybook:build tasks | P0 |

---

## Sub-Phase 4b: @beep/ui Component Stories

Stories are placed directly alongside component source files using `.stories.tsx` suffix.

### Priority Stories (Tier 1)

```
packages/ui/ui/src/components/
├── button.tsx                            # EXISTING
├── button.stories.tsx                    # NEW
├── input.tsx                             # EXISTING
├── input.stories.tsx                     # NEW
├── select.tsx                            # EXISTING
├── select.stories.tsx                    # NEW
├── dialog.tsx                            # EXISTING
├── dialog.stories.tsx                    # NEW
├── card.tsx                              # EXISTING
├── card.stories.tsx                      # NEW
├── badge.tsx                             # EXISTING
├── badge.stories.tsx                     # NEW
├── tabs.tsx                              # EXISTING
├── tabs.stories.tsx                      # NEW
├── dropdown-menu.tsx                     # EXISTING
└── dropdown-menu.stories.tsx             # NEW
```

### Additional Primitives (Tier 2)

```
packages/ui/ui/src/components/
├── accordion.stories.tsx                 # NEW
├── alert.stories.tsx                     # NEW
├── alert-dialog.stories.tsx              # NEW
├── avatar.stories.tsx                    # NEW
├── checkbox.stories.tsx                  # NEW
├── command.stories.tsx                   # NEW
├── context-menu.stories.tsx              # NEW
├── label.stories.tsx                     # NEW
├── popover.stories.tsx                   # NEW
├── progress.stories.tsx                  # NEW
├── radio-group.stories.tsx               # NEW
├── separator.stories.tsx                 # NEW
├── sheet.stories.tsx                     # NEW
├── sidebar.stories.tsx                   # NEW
├── skeleton.stories.tsx                  # NEW
├── slider.stories.tsx                    # NEW
├── switch.stories.tsx                    # NEW
├── table.stories.tsx                     # NEW
├── textarea.stories.tsx                  # NEW
├── toast.stories.tsx                     # NEW
├── toggle.stories.tsx                    # NEW
├── toolbar.stories.tsx                   # NEW
└── tooltip.stories.tsx                   # NEW
```

---

## Sub-Phase 4c: @beep/ui-editor Stories (MINIMAL)

### Status: BLOCKED

**Reason**: `@beep/ui-editor` is an empty stub package with 0 components.

```
packages/ui/editor/                       # EXISTING stub
├── AGENTS.md                             # EXISTING
├── README.md                             # EXISTING
├── STORYBOOK_PENDING.md                  # NEW - Documents blocker
├── reset.d.ts                            # EXISTING
└── src/                                  # EMPTY - No components
```

The Lexical editor code resides in `apps/todox/src/app/lexical/` (90+ files) and must be extracted before editor stories can be created.

---

## Sub-Phase 4d: Theme Integration

### Theme Verification Stories

```
packages/ui/ui/src/components/__tests__/
├── theme-bridge.stories.tsx              # NEW - CSS variable verification
├── color-palette.stories.tsx             # NEW - Color token docs
├── typography.stories.tsx                # NEW - Typography scale
└── spacing-tokens.stories.tsx            # NEW - Spacing/shadows
```

---

## File Count Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| **4a: Foundation** | 6 | 1 |
| **4b: Priority Stories** | 8 | 0 |
| **4b: Additional Stories** | 23+ | 0 |
| **4c: Editor** | 1 | 0 |
| **4d: Theme Docs** | 4 | 0 |
| **TOTAL** | ~42+ | 1 |

---

## Co-location Rationale

### Why Stories Live With Components

1. **Discoverability**: `button.stories.tsx` next to `button.tsx`
2. **Maintenance Proximity**: Component changes prompt story updates
3. **Glob Simplicity**: Single pattern `**/*.stories.tsx`
4. **Industry Standard**: shadcn/ui, Radix, MUI patterns

### Why Storybook Config Lives in tooling/

1. **Separation of Concerns**: Build tooling separate from library source
2. **Workspace Convention**: Follows `tooling/{testkit,cli}` pattern
3. **Dependency Isolation**: Storybook deps don't pollute `@beep/ui`

### Rejected Alternatives

| Alternative | Rejection Reason |
|-------------|------------------|
| `packages/ui/ui/.storybook/` | Couples tooling with library |
| Root `.storybook/` | Violates monorepo separation |
| `packages/ui/ui/stories/` | Separates stories from components |

---

## Verification Checklist

- [ ] `tooling/storybook/` workspace created
- [ ] `bun run storybook:dev` starts on port 6006
- [ ] Theme toggle switches light/dark correctly
- [ ] Tailwind classes render in stories
- [ ] MUI components render in stories
- [ ] `bun run storybook:build` succeeds
