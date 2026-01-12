---
paths:
  - "packages/ui/ui/src/atoms/**/*"
  - "packages/ui/ui/src/molecules/**/*"
---

# Atomic Component Skill

Create new atomic UI components following beep-effect project conventions.

## When to Invoke

Invoke this skill when:
- Creating a new reusable UI component (Label, Badge, Avatar, etc.)
- Building a design system primitive
- Composing multiple MUI components into a reusable unit
- Adding new atoms, molecules, or organisms to `@beep/ui`

## MCP Server Prerequisites

**shadcn MCP is NOT available in this session.**

### Fallback Strategy (ACTIVE)

Since shadcn MCP cannot be enabled, use these approaches:
1. Copy structure from existing atoms in `packages/ui/ui/src/atoms/`
2. Reference `packages/ui/ui/src/atoms/label/` as the canonical example
3. Use WebSearch for shadcn documentation if needed

---

## Critical Constraints

1. **Directory Structure** — Create all required files: `component.tsx`, `types.ts`, `classes.ts`, `styles.tsx`, `index.ts`
2. **Props Interface** — Use `readonly` and `| undefined` for all optional props
3. **Effect Imports** — Use namespace imports, never native array/string methods
4. **Classes System** — Use `createClasses` utility from `@beep/ui-core`
5. **shouldForwardProp** — Filter `sx` and custom props in styled components
6. **Test IDs** — Add `data-testid` attributes to root and key interactive elements for Playwright testing

---

## Workflow

### Step 1: Parse Requirements

Extract from user request:
- Component name (PascalCase: `StatusBadge`)
- Base HTML element or MUI component to extend
- Required props (variants, colors, sizes)
- Child components/slots needed

### Step 2: Read Reference Implementation

```typescript
// Always start by reading the canonical label example
Read({ file_path: "packages/ui/ui/src/atoms/label/label.tsx" })
Read({ file_path: "packages/ui/ui/src/atoms/label/types.ts" })
Read({ file_path: "packages/ui/ui/src/atoms/label/styles.tsx" })
Read({ file_path: "packages/ui/ui/src/atoms/label/classes.ts" })
Read({ file_path: "packages/ui/ui/src/atoms/label/index.ts" })
```

### Step 3: Create Directory Structure

```
packages/ui/ui/src/atoms/[component-name]/
├── [component-name].tsx    # Main component
├── types.ts                # TypeScript interfaces
├── classes.ts              # CSS class definitions
├── styles.tsx              # Styled components
└── index.ts                # Barrel export
```

### Step 4: Generate Files

Follow the output templates below for each file.

### Step 5: Wire Up Exports

1. Add to `packages/ui/ui/src/atoms/index.ts`
2. Verify `package.json` exports if creating new directory

---

## Output Templates

### types.ts

```typescript
import type { SxProps, Theme } from "@mui/material/styles";
import type React from "react";

export type ComponentVariant = "filled" | "outlined" | "soft" | "inverted";
export type ComponentColor = "default" | "primary" | "secondary" | "info" | "success" | "warning" | "error";

export interface ComponentProps extends React.ComponentProps<"span"> {
  readonly variant?: ComponentVariant | undefined;
  readonly color?: ComponentColor | undefined;
  readonly disabled?: boolean | undefined;
  readonly startIcon?: React.ReactNode | undefined;
  readonly endIcon?: React.ReactNode | undefined;
  readonly sx?: SxProps<Theme> | undefined;
}
```

**RULES:**
- ALL optional props use `| undefined` suffix
- ALL props are `readonly`
- `sx` typed as `SxProps<Theme> | undefined`
- Extend native element props or MUI component props

### classes.ts

```typescript
import { createClasses } from "@beep/ui-core/theme/create-classes";

export const componentClasses = {
  root: createClasses("component__root"),
  icon: createClasses("component__icon"),
  content: createClasses("component__content"),
  state: {
    disabled: "--disabled",
    active: "--active",
  },
};
```

**Naming Convention:**
- Prefix: Determined by `themeConfig`
- Structure: `[prefix]__component__element`
- State modifiers: `--stateName`

### styles.tsx

```typescript
"use client";

import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { CSSObject } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

import type { ComponentProps } from "./types";

export const ComponentRoot = styled("span", {
  shouldForwardProp: (prop: string) => !["color", "variant", "disabled", "sx"].includes(prop),
})<ComponentProps>(({ color, variant, disabled, theme }) => {
  const defaultStyles: CSSObject = {
    ...(color === "default" && {
      ...(variant === "filled" && {
        color: theme.vars.palette.common.white,
        backgroundColor: theme.vars.palette.text.primary,
      }),
      ...(variant === "soft" && {
        color: theme.vars.palette.text.secondary,
        backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.16),
      }),
    }),
  };

  const colorStyles: CSSObject = {
    ...(color && color !== "default" && {
      ...(variant === "filled" && {
        color: theme.vars.palette[color].contrastText,
        backgroundColor: theme.vars.palette[color].main,
      }),
      ...(variant === "soft" && {
        color: theme.vars.palette[color].dark,
        backgroundColor: rgbaFromChannel(theme.vars.palette[color].mainChannel, 0.16),
        ...theme.applyStyles("dark", {
          color: theme.vars.palette[color].light,
        }),
      }),
    }),
  };

  return {
    // Base styles
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.shape.borderRadius,
    gap: theme.spacing(0.75),
    padding: theme.spacing(0, 1),
    transition: theme.transitions.create(["all"], {
      duration: theme.transitions.duration.shorter,
    }),
    // Variant styles
    ...defaultStyles,
    ...colorStyles,
    // State styles
    ...(disabled && {
      opacity: 0.48,
      pointerEvents: "none",
    }),
  };
});

export const ComponentIcon = styled("span")({
  width: 16,
  height: 16,
  flexShrink: 0,
  "& svg, img": { width: "100%", height: "100%", objectFit: "cover" },
});
```

**shouldForwardProp MUST filter:**
- `sx` (always)
- Custom variant props (`color`, `variant`, `size`)
- State props (`disabled`, `loading`)

### component.tsx

```typescript
import { mergeClasses } from "@beep/ui-core/utils";
import * as Str from "effect/String";

import { componentClasses } from "./classes";
import { ComponentIcon, ComponentRoot } from "./styles";

import type { ComponentProps } from "./types";

export function Component({
  sx,
  endIcon,
  children,
  startIcon,
  className,
  disabled,
  variant = "soft",
  color = "default",
  ...other
}: ComponentProps) {
  return (
    <ComponentRoot
      data-testid="component-root"
      color={color}
      variant={variant}
      disabled={Boolean(disabled)}
      className={mergeClasses([componentClasses.root, className])}
      {...(sx ? { sx } : {})}
      {...other}
    >
      {startIcon && (
        <ComponentIcon data-testid="component-start-icon" className={componentClasses.icon}>
          {startIcon}
        </ComponentIcon>
      )}

      {typeof children === "string" ? Str.capitalize(children) : children}

      {endIcon && (
        <ComponentIcon data-testid="component-end-icon" className={componentClasses.icon}>
          {endIcon}
        </ComponentIcon>
      )}
    </ComponentRoot>
  );
}
```

**RULES:**
- Use `mergeClasses` utility for className composition
- Use Effect utilities (`Str.capitalize`, not `string.charAt(0).toUpperCase()`)
- Conditional sx prop: `{...(sx ? { sx } : {})}`
- Boolean coercion for optional booleans: `Boolean(disabled)`
- Add `data-testid` to root element and key sub-elements for Playwright testing

### index.ts

```typescript
export * from "./component";
export * from "./types";
export * from "./classes";
```

---

## SlotProps Pattern

For components with customizable sub-elements:

```typescript
// types.ts
export type ComponentProps = React.ComponentProps<typeof ComponentRoot> & {
  readonly slotProps?: {
    readonly icon?: Omit<React.ComponentProps<typeof ComponentIcon>, "children"> | undefined;
    readonly content?: React.ComponentProps<typeof ComponentContent> | undefined;
  } | undefined;
};

// component.tsx
export function Component({ slotProps, ...props }: ComponentProps) {
  return (
    <ComponentRoot {...props}>
      <ComponentIcon {...slotProps?.icon}>{icon}</ComponentIcon>
      <ComponentContent {...slotProps?.content}>{children}</ComponentContent>
    </ComponentRoot>
  );
}
```

---

## Example Invocations

### Example 1: Create StatusBadge Atom

**User request**: "Create a StatusBadge component with online/offline/busy variants"

**Actions**:
1. Create directory `packages/ui/ui/src/atoms/status-badge/`
2. Create `types.ts` with `StatusBadgeVariant = "online" | "offline" | "busy" | "away"`
3. Create `classes.ts` with `statusBadgeClasses`
4. Create `styles.tsx` with colored dot styling
5. Create `status-badge.tsx` component
6. Create `index.ts` barrel
7. Add export to `packages/ui/ui/src/atoms/index.ts`

### Example 2: Create LoadingOverlay Molecule

**User request**: "Create a LoadingOverlay component that covers its parent"

**Actions**:
1. Create directory `packages/ui/ui/src/molecules/loading-overlay/`
2. Define props: `open`, `backdrop`, `spinner`
3. Use MUI `CircularProgress` for spinner
4. Style with absolute positioning
5. Wire up to molecules index

---

## Test ID Conventions

Add `data-testid` attributes to enable Playwright testing:

```typescript
// Root element - use component name
data-testid="status-badge-root"

// Sub-elements - use component-element pattern
data-testid="status-badge-icon"
data-testid="status-badge-label"

// Interactive elements - describe the action
data-testid="status-badge-dismiss-button"

// State-based elements
data-testid="status-badge-loading-spinner"
```

**Naming Rules:**
- Use kebab-case: `status-badge-root` not `statusBadgeRoot`
- Prefix with component name: `status-badge-*` not just `icon`
- Describe purpose: `dismiss-button` not `button-1`
- Keep names stable (don't include dynamic values)

**Required Test IDs:**
- Root element: Always add `data-testid="[component]-root"`
- Interactive elements: Buttons, links, inputs
- Key content areas: Icons, labels, status indicators
- Conditional elements: Loading states, error states

---

## Related Skills

| Skill | Relationship |
|-------|--------------|
| `effect-check.md` | Run AFTER generation to validate Effect patterns |
| `visual-testing.md` | Use test IDs added here for Playwright selectors |
| `form-field.md` | Use this skill instead when creating form inputs |
| `mui-component-override.md` | Use for MUI theme customization, not new components |

**Workflow Integration:**
1. Generate component with this skill
2. Run `effect-check.md` to validate patterns
3. Generate tests with `visual-testing.md` targeting the `data-testid` attributes

---

## Verification Checklist

- [ ] All 5 files created (`component.tsx`, `types.ts`, `classes.ts`, `styles.tsx`, `index.ts`)
- [ ] Props interface uses `readonly` and `| undefined`
- [ ] `shouldForwardProp` filters `sx` and custom props
- [ ] Uses `theme.vars.*` for palette access
- [ ] Uses Effect utilities, no native array/string methods
- [ ] Uses `mergeClasses` for className composition
- [ ] Uses `createClasses` for CSS class generation
- [ ] `"use client"` added to `styles.tsx` (uses styled)
- [ ] Export added to parent `index.ts`
- [ ] Dark mode handled with `theme.applyStyles("dark", {...})`
- [ ] `data-testid` added to root and key interactive elements
