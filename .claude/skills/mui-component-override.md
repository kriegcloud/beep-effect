---
paths:
  - "packages/ui/core/src/theme/core/components/**/*"
---

# MUI Component Override Skill

Generate MUI theme component overrides following beep-effect codebase patterns.

## When to Invoke

Invoke this skill when:
- Creating or modifying MUI component theme overrides
- Adding new variants (e.g., `soft`) to existing MUI components
- Extending color options for MUI components
- Standardizing component styling across the application

## MCP Server Prerequisites

**MUI MCP is NOT available in this session.**

### Fallback Strategy (ACTIVE)

Since MUI MCP cannot be enabled, use these local sources:
1. Read existing implementations in `packages/ui/core/src/theme/core/components/`
2. Use WebSearch for `site:mui.com` documentation
3. Read TypeScript definitions from `node_modules/@mui/material/`

---

## Critical Constraints

1. **Theme Token Access** — ALWAYS use `theme.vars.palette.*` (NEVER `theme.palette.*`)
2. **Variant Typing** — Use `satisfies ComponentVariants` for type safety
3. **Effect Imports** — Use namespace imports for Effect utilities
4. **File Structure** — Follow canonical file structure exactly

---

## Workflow

### Step 1: Parse Requirements

Extract from user request:
- Component name (e.g., `Tooltip`, `Badge`, `Slider`)
- Required variants (standard MUI + custom like `soft`)
- Color extensions needed (e.g., `black`, `white`)
- Size extensions needed (e.g., `xLarge`)

### Step 2: Query Documentation

```typescript
// Option 1: Read existing implementation for similar component
Read({ file_path: "packages/ui/core/src/theme/core/components/button.tsx" })

// Option 2: Web search MUI documentation
WebSearch({ query: "MUI Tooltip theme customization site:mui.com" })

// Option 3: Read MUI types
Read({ file_path: "node_modules/@mui/material/Tooltip/Tooltip.d.ts" })
```

### Step 3: Check Existing Patterns

Search codebase for similar implementations:

```
Glob: packages/ui/core/src/theme/core/components/*.tsx
Grep: "MuiTooltip" in packages/ui/core/
```

### Step 4: Generate Component

Follow the output template below.

### Step 5: Integrate

1. Add export to `packages/ui/core/src/theme/core/components/index.ts`
2. Update TypeScript augmentation if extending variants/colors

---

## Output Template

```typescript
// 1. External imports
import type {
  Components,
  ComponentsVariants,
  CSSObject,
  Theme,
} from "@mui/material/styles";
import { componentClasses } from "@mui/material/Component";

// 2. Effect imports (REQUIRED namespace pattern)
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

// 3. Internal imports
import { colorKeys } from "../palette";
import { rgbaFromChannel } from "@beep/ui-core/utils";

// 4. Type extensions (for custom variants/colors)
export type ComponentExtendVariant = { soft: true };
export type ComponentExtendColor = { black: true; white: true };

// 5. Variant type alias
type ComponentVariants = ComponentsVariants<Theme>["MuiComponent"];

// 6. Color/variant collections
const allColors = ["inherit", ...colorKeys.palette, ...colorKeys.common] as const;

// 7. Variant definitions (MUST use satisfies)
const softVariants = [
  {
    props: (props) => props.variant === "soft" && props.color === "primary",
    style: ({ theme }) => ({
      color: theme.vars.palette.primary.dark,
      backgroundColor: rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.16),
      ...theme.applyStyles("dark", {
        color: theme.vars.palette.primary.light,
      }),
    }),
  },
  // Map over colors for consistency
  ...(colorKeys.palette.map((colorKey) => ({
    props: (props) => props.variant === "soft" && props.color === colorKey,
    style: ({ theme }) => ({
      color: theme.vars.palette[colorKey].dark,
      backgroundColor: rgbaFromChannel(theme.vars.palette[colorKey].mainChannel, 0.16),
    }),
  })) satisfies ComponentVariants),
] satisfies ComponentVariants;

// 8. Component definition
const MuiComponent: Components<Theme>["MuiComponent"] = {
  defaultProps: {
    color: "inherit",
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius,
      variants: [...softVariants],
    }),
  },
};

// 9. Barrel export
export const component: Components<Theme> = { MuiComponent };
```

---

## Example Invocations

### Example 1: Add Soft Variant to Badge

**User request**: "Add a soft variant to the Badge component"

**Actions**:
1. Read `packages/ui/core/src/theme/core/components/chip.tsx` for soft variant pattern
2. Create `badge.tsx` following template with soft variants
3. Wire export into `components/index.ts`
4. Add TypeScript augmentation: `export type BadgeExtendVariant = { soft: true };`

### Example 2: Customize Tooltip Styling

**User request**: "Create theme overrides for Tooltip with custom arrow and padding"

**Actions**:
1. WebSearch `MUI Tooltip theme customization site:mui.com`
2. Read existing tooltip implementation if any
3. Create `tooltip.tsx` with `MuiTooltip` overrides
4. Style `tooltip`, `arrow`, `tooltipPlacementTop/Bottom/Left/Right` classes

---

## Key Reference Files

| File | Pattern | Notes |
|------|---------|-------|
| `button.tsx` | Complex variants, sizes, soft/outlined | 394 lines, canonical for variants |
| `chip.tsx` | Size variants, soft variant | Good soft variant reference |
| `fab.tsx` | Soft variant, extended colors | Black/white color example |
| `text-field.tsx` | Input styling | Density rules |
| `mui-x-data-grid.tsx` | Complex MUI X override | Custom icons, grid styling |

---

## Theme Token Reference

### Palette Access
```typescript
// CORRECT
theme.vars.palette.primary.main
theme.vars.palette.primary.mainChannel  // For rgba()
theme.vars.palette.grey["500Channel"]

// WRONG - Direct access
theme.palette.primary.main  // NEVER use this
```

### Channel-Aware Colors
```typescript
import { rgbaFromChannel } from "@beep/ui-core/utils";

// Pattern: rgba via channel
backgroundColor: rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.16)
```

### Custom Shadows
```typescript
theme.vars.customShadows.z8
theme.vars.customShadows.primary  // Color shadow
theme.vars.customShadows.card
```

### Apply Dark Mode Styles
```typescript
style: ({ theme }) => ({
  color: theme.vars.palette.primary.dark,
  ...theme.applyStyles("dark", {
    color: theme.vars.palette.primary.light,
  }),
}),
```

---

## Testing Theme Overrides

Theme overrides apply globally to MUI components. To test them:

1. **Visual Testing**: Use `visual-testing.md` skill to verify styled components in demo pages
2. **Demo Pages**: Create a demo page at `apps/web/src/app/demo/[component]/page.tsx`
3. **Variant Coverage**: Test each variant/color/size combination

**Note**: Theme overrides don't require `data-testid` attributes—those belong on component instances created with `atomic-component.md`.

---

## Related Skills

| Skill | Relationship |
|-------|--------------|
| `atomic-component.md` | Use for creating new components, not theme styling |
| `effect-check.md` | Run AFTER generation to validate Effect patterns |
| `visual-testing.md` | Generate tests to verify theme override appearance |

**When to Use Which:**
- **This skill**: Modifying how existing MUI components look globally
- **atomic-component.md**: Creating entirely new components
- **Both**: When a new component also needs MUI component overrides

**Workflow Integration:**
1. Create theme override with this skill
2. Run `effect-check.md` to validate patterns
3. Create demo page showing all variants
4. Generate visual tests with `visual-testing.md`

---

## Verification Checklist

- [ ] Component compiles without errors
- [ ] Uses `theme.vars.*` for all palette access
- [ ] Variant arrays use `satisfies ComponentVariants`
- [ ] Effect imports use namespace pattern (`import * as A from "effect/Array"`)
- [ ] No native array/string methods (use Effect utilities)
- [ ] Export wired into `components/index.ts`
- [ ] TypeScript augmentation added for extended variants/colors
- [ ] Dark mode styles applied with `theme.applyStyles("dark", {...})`
