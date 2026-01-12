# Codebase UI Patterns - beep-effect Monorepo

> Comprehensive pattern catalog for UI implementation extracted from codebase research.
> Generated: 2026-01-11 | Phase: P1 Discovery

---

## Executive Summary

This document captures UI implementation patterns across the beep-effect monorepo for use in creating coding agent constraints. Patterns are organized into five categories:

1. **Theme Component Overrides** - MUI component customization at theme level
2. **Atomic Components** - Reusable UI primitives
3. **Form Input Fields** - TanStack Form integrated inputs
4. **Theme Configuration** - Colors, typography, spacing, shadows
5. **Cross-Cutting Patterns** - Effect integration, sx prop, accessibility

---

## 1. Theme Component Override Patterns

**Location**: `packages/ui/core/src/theme/core/components/*.tsx`

### 1.1 Canonical File Structure

```typescript
// 1. External imports
import type { Components, ComponentsVariants, CSSObject, Theme } from "@mui/material/styles";
import { componentClasses } from "@mui/material/Component";

// 2. Effect imports (REQUIRED namespace pattern)
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

// 3. Internal imports
import { colorKeys } from "../palette";

// 4. Type extensions (for custom variants/colors)
export type ComponentExtendVariant = { soft: true };
export type ComponentExtendColor = { black: true; white: true };

// 5. Variant type alias
type ComponentVariants = ComponentsVariants<Theme>["MuiComponent"];

// 6. Color/variant collections
const allColors = ["inherit", ...colorKeys.palette] as const;

// 7. Variant definitions (MUST use satisfies)
const softVariants = [
  {
    props: (props) => props.variant === "soft" && props.color === "primary",
    style: ({ theme }) => ({
      color: theme.vars.palette.primary.dark,
      backgroundColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.16)`,
    }),
  },
] satisfies ComponentVariants;

// 8. Component definition
const MuiComponent: Components<Theme>["MuiComponent"] = {
  defaultProps: { color: "inherit" },
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

### 1.2 Theme Token Access Rules

**CRITICAL - ALWAYS use CSS variable path:**

```typescript
// CORRECT
theme.vars.palette.primary.main
theme.vars.palette.primary.mainChannel  // For rgba()
theme.vars.customShadows.z8

// WRONG - Never use direct access
theme.palette.primary.main  // ❌
```

**Channel-aware colors for transparency:**

```typescript
// Pattern: rgba via channel
backgroundColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.16)`

// Or using utility
import { rgbaFromChannel } from "@beep/ui-core/utils";
backgroundColor: rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.16)
```

### 1.3 Key Reference Files

| File | Pattern | Lines |
|------|---------|-------|
| `button.tsx` | Complex variants, sizes, soft/outlined | 394 |
| `text-field.tsx` | Input styling, underlines | 340 |
| `chip.tsx` | Size variants, delete icons | 256 |
| `mui-x-data-grid.tsx` | Complex grid with custom icons | 374 |

---

## 2. Atomic Component Patterns

**Location**: `packages/ui/ui/src/atoms/`

### 2.1 Directory Structure

```
atoms/
├── label/
│   ├── label.tsx          # Main component
│   ├── styles.tsx         # Styled components
│   ├── types.ts           # TypeScript interfaces
│   ├── classes.ts         # CSS class definitions
│   └── index.ts           # Barrel export
├── image/
├── iconify/
├── svg-color/
├── file-thumbnail/
└── index.ts               # Root barrel
```

### 2.2 Props Interface Pattern

```typescript
// types.ts
export type LabelVariant = "filled" | "outlined" | "soft" | "inverted";
export type LabelColor = "default" | "primary" | "secondary" | "info" | "success" | "warning" | "error";

export interface LabelProps extends React.ComponentProps<"span"> {
  readonly variant?: LabelVariant | undefined;
  readonly color?: LabelColor | undefined;
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

### 2.3 SlotProps Pattern

```typescript
export type ImageProps = React.ComponentProps<typeof ImageRoot> & {
  readonly slotProps?: {
    readonly img?: Omit<React.ComponentProps<typeof ImageImg>, "src" | "alt"> | undefined;
    readonly overlay?: React.ComponentProps<typeof ImageOverlay> | undefined;
    readonly placeholder?: React.ComponentProps<typeof ImagePlaceholder> | undefined;
  } | undefined;
};
```

### 2.4 Classes System

```typescript
// classes.ts
import { createClasses } from "@beep/ui-core/theme/create-classes";

export const labelClasses = {
  root: createClasses("label__root"),
  icon: createClasses("label__icon"),
  state: {
    disabled: "--disabled",  // BEM modifier
  },
};
```

**Usage:**

```typescript
import { mergeClasses } from "@beep/ui-core/utils";
import { labelClasses } from "./classes";

<Label
  className={mergeClasses([labelClasses.root, className], {
    [labelClasses.state.disabled]: disabled,
  })}
/>
```

**Naming Convention:**
- Prefix: `minimal__` (from themeConfig)
- Structure: `minimal__component__element`
- Modifiers: `--stateName`

### 2.5 Styled Component Pattern

```typescript
// styles.tsx
import { styled } from "@mui/material/styles";

export const LabelRoot = styled("span", {
  shouldForwardProp: (prop) => !["color", "variant", "disabled", "sx"].includes(prop),
})<LabelProps>(({ color, variant, disabled, theme }) => ({
  display: "inline-flex",
  alignItems: "center",

  ...(variant === "soft" && {
    color: theme.vars.palette[color].dark,
    backgroundColor: `rgba(${theme.vars.palette[color].mainChannel} / 0.16)`,
  }),

  ...(disabled && {
    opacity: 0.48,
    pointerEvents: "none",
  }),
}));
```

**shouldForwardProp MUST filter:**
- `sx` (always)
- Custom variant props (`color`, `variant`, `size`)
- State props (`disabled`, `loading`)

---

## 3. Form Input Field Patterns

**Location**: `packages/ui/ui/src/inputs/`

### 3.1 DefaultOmit Pattern

```typescript
// Field.tsx
export type OmitProps = "error" | "value" | "onChange" | "onBlur" | "defaultValue" | "id" | "name";
export type DefaultOmit<T> = Omit<T, OmitProps>;
```

**CRITICAL**: Form fields MUST use `DefaultOmit<T>` because TanStack Form controls these props.

### 3.2 TanStack Form Integration

```typescript
import { useFieldContext } from "@beep/ui/form";
import { useStore } from "@tanstack/react-form";

function TextField({ helperText, ...props }: DefaultOmit<TextFieldProps>) {
  // 1. Get field context
  const field = useFieldContext<string>();

  // 2. Subscribe to form store for errors (MUST use selector pattern)
  const { isError, error } = useStore(
    field.form.store,
    (state) => ({
      isError: !!state.errorMap.onSubmit?.[field.name],
      error: state.errorMap.onSubmit?.[field.name],
    }) as const  // REQUIRED for type stability
  );

  return (
    <MuiTextField
      id={field.name}
      name={field.name}
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      error={isError}
      helperText={error ?? helperText}
      {...props}
    />
  );
}
```

### 3.3 Error Display Pattern

```typescript
// Combine submit and inline validation errors
const hasInlineErrors = A.length(field.state.meta.errors) > 0;

<TextField
  error={isError || hasInlineErrors}
  helperText={
    error || hasInlineErrors
      ? `${error || ""} ${A.join(", ")(field.state.meta.errors)}`
      : helperText
  }
/>
```

### 3.4 HelperText Component

```typescript
// components/HelperText.tsx
export type HelperTextProps = FormHelperTextProps & {
  readonly errorMessage?: string | undefined;
  readonly helperText?: React.ReactNode | undefined;
  readonly disableGutters?: boolean | undefined;
};

export function HelperText({ errorMessage, helperText, disableGutters, sx, ...rest }: HelperTextProps) {
  if (!errorMessage && !helperText) return null;

  return (
    <FormHelperText
      error={!!errorMessage}
      sx={[{ mx: disableGutters ? 0 : 1.75 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...rest}
    >
      {errorMessage || helperText}
    </FormHelperText>
  );
}
```

### 3.5 Key Reference Files

| File | Pattern |
|------|---------|
| `TextField.tsx` | Basic string field |
| `CheckboxField.tsx` | Boolean field |
| `RadioGroupField.tsx` | Select from options |
| `DatePickerField.tsx` | Effect DateTime integration |
| `upload/default/upload-default.tsx` | File upload with react-dropzone |

---

## 4. Theme Configuration

### 4.1 Color Palette

**Semantic Colors** (6 shades each: lighter, light, main, dark, darker, contrastText):

| Color | Main Value | Usage |
|-------|------------|-------|
| Primary | `#00A76F` | Brand, primary actions |
| Secondary | `#8E33FF` | Accent, secondary actions |
| Info | `#00B8D9` | Informational states |
| Success | `#22C55E` | Success states |
| Warning | `#FFAB00` | Warning states |
| Error | `#FF5630` | Error states |

**Grey Scale** (50-950):
- 500: `#919EAB` (primary grey)
- 800: `#1C252E` (dark mode paper)
- 900: `#141A21` (dark mode default)

**Color Presets** (switchable):
- `default`, `preset1-5` with different primary/secondary combinations

### 4.2 Typography Scale

| Variant | Size | Weight | Font |
|---------|------|--------|------|
| h1 | 40-64px responsive | 800 | Barlow |
| h2 | 32-48px responsive | 800 | Barlow |
| h3 | 24-32px responsive | 700 | Barlow |
| h4 | 20-24px responsive | 700 | Public Sans |
| h5 | 18-19px responsive | 700 | Public Sans |
| h6 | 17-18px responsive | 600 | Public Sans |
| subtitle1 | 16px | 600 | Public Sans |
| subtitle2 | 14px | 600 | Public Sans |
| body1 | 16px | 400 | Public Sans |
| body2 | 14px | 400 | Public Sans |
| caption | 12px | 400 | Public Sans |
| button | 14px | 700 | Public Sans |

**Font Families:**
- Primary: `Public Sans Variable`
- Secondary: `Barlow` (headings h1-h3)

### 4.3 Spacing

MUI 8px base:
- `theme.spacing(1)` = 8px
- `theme.spacing(2)` = 16px
- Common: 0.25 (2px), 0.5 (4px), 1 (8px), 1.5 (12px), 2 (16px), 3 (24px)

### 4.4 Breakpoints

| Key | Value |
|-----|-------|
| xs | 0px |
| sm | 600px |
| md | 900px |
| lg | 1200px |
| xl | 1536px |

### 4.5 Shadows

**Custom Shadows:**
- z1-z24: Elevation shadows
- card: `0 0 2px rgba(..., 0.2), 0 12px 24px -4px rgba(..., 0.12)`
- dialog: `-40px 40px 80px -8px rgba(0,0,0, 0.24)`
- dropdown: `0 0 2px rgba(..., 0.24), -20px 20px 40px -4px rgba(..., 0.24)`

**Color shadows:** primary, secondary, info, success, warning, error

### 4.6 Shape

- borderRadius: 8px (base)
- Common: 8px, 12px (1.5x), 16px (2x)

---

## 5. Cross-Cutting Patterns

### 5.1 Effect Integration (MANDATORY)

**Namespace Imports:**

```typescript
// Core modules - full name
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";

// Single-letter aliases
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Num from "effect/Number";
import * as R from "effect/Record";
```

**NEVER use native methods:**

```typescript
// FORBIDDEN
array.map(x => x + 1)
array.filter(x => x > 0)
string.split(",")

// REQUIRED
A.map(array, x => x + 1)
A.filter(array, x => x > 0)
Str.split(string, ",")
```

**PascalCase Schema Constructors:**

```typescript
// CORRECT
S.Struct({ name: S.String })
S.Array(S.Number)

// WRONG
S.struct({ name: S.string })  // ❌
```

### 5.2 sx Prop Array Pattern

**CRITICAL - Always handle as array:**

```typescript
// CORRECT
sx={[
  { width: 1, height: 1 },
  ...(Array.isArray(sx) ? sx : [sx]),
]}

// WRONG - Loses theme callbacks
sx={{ ...baseStyles, ...sx }}  // ❌
```

### 5.3 Client Component Directive

```typescript
"use client";  // MUST be first line, before imports

import React from "react";
```

**Required when:**
- Using hooks (`useState`, `useEffect`)
- Using browser APIs
- Event handlers
- Framer Motion
- Third-party client libraries

### 5.4 Accessibility

```typescript
const labelId = `${field.name}-label`;
const inputId = `${field.name}-input`;

<FormLabel id={labelId} htmlFor={inputId}>Label</FormLabel>
<Input
  id={inputId}
  aria-labelledby={labelId}
  {...(!label && { "aria-label": `${name} input` })}
/>
```

---

## 6. Coding Agent Constraints

### 6.1 MUST DO

1. Use Effect namespace imports (never native array/string methods)
2. Use `theme.vars.*` for all theme token access
3. Handle sx prop as array with spread pattern
4. Use `readonly` and `| undefined` for optional props
5. Use `DefaultOmit<T>` for form field props
6. Use `createClasses` utility and `mergeClasses` for CSS classes
7. Use `satisfies ComponentVariants` for variant type safety
8. Wire new components into barrel exports
9. Filter `sx` and custom props in `shouldForwardProp`
10. Place `"use client"` as first line when using hooks

### 6.2 MUST NOT

1. Use native `.map()`, `.filter()`, `.split()` methods
2. Access `theme.palette.*` directly (use `theme.vars.palette.*`)
3. Use class components (React 19 function only)
4. Access form state directly (use `useStore` selector)
5. Use plain strings for CSS classes (use `createClasses`)
6. Mutate props or state objects
7. Use `any`, `@ts-ignore`, or unsafe casts
8. Use relative `../../../` paths (use `@beep/*` aliases)
9. Mix PascalCase/lowercase Schema constructors
10. Create form fields without TanStack Form context

### 6.3 File Creation Checklist

**New Atomic Component:**
- [ ] `component.tsx` with `"use client"` if needed
- [ ] `types.ts` with readonly props interface
- [ ] `classes.ts` using `createClasses`
- [ ] `styles.tsx` with `shouldForwardProp`
- [ ] `index.ts` barrel export
- [ ] Add to parent `index.ts`

**New Theme Override:**
- [ ] `component.tsx` in `theme/core/components/`
- [ ] Barrel export: `export const component: Components<Theme> = { ... }`
- [ ] Wire into `components/index.ts`
- [ ] TypeScript augmentation if extending variants/colors
- [ ] Use `satisfies ComponentVariants`

**New Form Field:**
- [ ] Extend `DefaultOmit<T>` for props
- [ ] Use `useFieldContext<T>()` hook
- [ ] Subscribe to `field.form.store` with selector
- [ ] Handle submit and inline validation errors
- [ ] Include `HelperText` component
- [ ] Wire field ID to `field.name`

---

## 7. Component Coverage

### Theme Overrides (47 components)

**High Complexity (200+ lines):**
- MUI X Data Grid (374 lines)
- Button (394 lines)
- TextField/Input (340 lines)
- MUI X Date Picker (314 lines)
- Chip (256 lines)
- Fab (223 lines)
- Accordion (221 lines)
- Tabs (200 lines)

### Custom Variants

| Component | Custom Variants |
|-----------|----------------|
| Button | `soft` |
| Chip | `soft` |
| Fab | `soft` |
| Badge | `busy`, `online`, `offline`, `alway` |
| ButtonGroup | `soft` |
| Pagination | `soft` |

### Extended Colors

| Component | Extended Colors |
|-----------|-----------------|
| Button | `black`, `white`, `neutral` |
| Chip | `black`, `white` |
| IconButton | `black`, `white` |
| Fab | `black`, `white` |
| Avatar | All palette colors |

---

## 8. Pattern Decision Tree

### Theme Override vs Atomic Component?

**Theme Override:**
- Modifying existing MUI component styling
- Adding new variants to MUI components
- Changing default props globally
- Affecting component behavior globally

**Atomic Component:**
- Creating new custom components
- Composing multiple MUI components
- Implementing design system patterns
- Component-specific state management

### slotProps vs sx?

**slotProps:**
- Customizing sub-components
- Passing props to nested MUI components
- Type-safe prop forwarding
- Component has documented slot system

**sx:**
- One-off styling overrides
- Responsive styles
- Theme-aware styling
- Quick prototyping

---

## Appendix: Key File Locations

### Theme System
- `packages/ui/core/src/theme/theme-config.ts` - Theme configuration
- `packages/ui/core/src/theme/create-theme.ts` - Theme factory
- `packages/ui/core/src/theme/core/palette.ts` - Color palette
- `packages/ui/core/src/theme/core/typography.ts` - Typography scale
- `packages/ui/core/src/theme/core/shadows.ts` - Shadow definitions
- `packages/ui/core/src/theme/core/components/` - Component overrides

### UI Components
- `packages/ui/ui/src/atoms/` - Atomic components
- `packages/ui/ui/src/inputs/` - Form fields
- `packages/ui/ui/src/form/` - Form utilities

### Utilities
- `packages/ui/core/src/theme/create-classes.ts` - Class generation
- `packages/ui/core/src/utils/` - General utilities

---

## 9. Application-Level Patterns (apps/todox)

### 9.1 Dual Theme System

The todox app runs **two theme systems in parallel**:

1. **MUI Theme** (GlobalProviders): CSS variables, component overrides
2. **Tailwind/next-themes**: CSS classes, design tokens, dark mode

**Configuration** (`apps/todox/src/theme/theme.tsx`):
```typescript
import { createTheme, ThemeOptions } from "@mui/material/styles";

const options: ThemeOptions = {
  cssVariables: { colorSchemeSelector: "class" }, // Tailwind compat
  colorSchemes: { light: { palette: lightPalette }, dark: { palette: darkPalette } },
};

export const theme = createTheme(options);
```

**Pattern**: Use `class` color scheme selector for Tailwind compatibility.

### 9.2 Effect-Based Data Fetching with SWR

**Pattern** (`apps/todox/src/actions/mail.ts`):
```typescript
import { FetchHttpClient, HttpClient, HttpClientRequest } from "@effect/platform";
import { ManagedRuntime } from "effect";

// Module-scoped runtime
const runtime = ManagedRuntime.make(FetchHttpClient.layer);

// Generic GET request effect
const makeGetRequest = <T>(url: string, params?: Record<string, string>): Effect<T, Error, HttpClient> =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;
    let request = HttpClientRequest.get(`${BASE_URL}${url}`);
    if (params) request = HttpClientRequest.setUrlParams(request, params);
    const response = yield* client.execute(request);
    return yield* response.json as T;
  });

// SWR-compatible fetcher
const createFetcher = <T>(effect: Effect<T, Error, HttpClient>) =>
  () => runtime.runPromise(effect);

// Custom hook
export function useGetMails(labelId: string) {
  const { data, isLoading, error } = useSWR(
    ["mails", labelId],
    createFetcher(makeGetRequest<MailsResponse>("/mails", { labelId }))
  );
  return { mails: data?.mails ?? [], isLoading, isEmpty: !data?.mails?.length };
}
```

### 9.3 Provider Composition Pattern

**Multi-layer provider nesting** (`apps/todox/src/app/page.tsx`):
```typescript
export default function Page() {
  return (
    <MiniSidebarProvider>
      <SidePanelProvider>
        <div className="flex h-svh w-full">
          <TopNavbar />
          <SidePanel>
            <AIChatPanel />
          </SidePanel>
          <SidebarProvider>
            <MailProvider>
              <MailContent />
            </MailProvider>
          </SidebarProvider>
        </div>
      </SidePanelProvider>
    </MiniSidebarProvider>
  );
}
```

**Feature Provider Pattern** (`apps/todox/src/features/mail/provider/mail-provider.tsx`):
```typescript
interface MailContextValue {
  readonly labels: MailLabel[];
  readonly mails: Mail[];
  readonly selectedMail: Mail | undefined;
  readonly isLoading: boolean;
  readonly onSelectMail: (mailId: string) => void;
  readonly compose: ReturnType<typeof useBoolean>;
}

const MailContext = createContext<MailContextValue | null>(null);

export function MailProvider({ children }: { readonly children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL-driven selection
  const selectedMailId = searchParams.get("id");

  // Feature state
  const compose = useBoolean();
  const { labels, isLoading: labelsLoading } = useGetLabels();
  const { mails, isLoading: mailsLoading } = useGetMails(labelId);

  // Auto-select first mail
  const firstMailId = F.pipe(mails, A.head, O.map(m => m.id), O.getOrNull);

  useEffect(() => {
    if (!selectedMailId && firstMailId) {
      startTransition(() => {
        router.replace(`${pathname}?id=${firstMailId}`);
      });
    }
  }, [selectedMailId, firstMailId]);

  const value = useMemo(() => ({ labels, mails, selectedMail, compose, onSelectMail }), [deps]);

  return <MailContext.Provider value={value}>{children}</MailContext.Provider>;
}

export function useMail() {
  const context = useContext(MailContext);
  if (!context) throw new Error("useMail must be used within MailProvider");
  return context;
}
```

### 9.4 URL-Driven State Pattern

**For shareable/bookmarkable state**:
```typescript
const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();

// Read from URL
const selectedId = searchParams.get("id");

// Update URL (non-urgent)
const onSelect = (id: string) => {
  startTransition(() => {
    router.replace(`${pathname}?id=${id}`);
  });
};
```

### 9.5 Mini Sidebar with Auto-Close

**Animation state machine** (`apps/todox/src/components/mini-sidebar/mini-sidebar.tsx`):
```typescript
type AnimationState = "opening" | "closing" | "closed";

function MiniSidebar({ autoCloseDelay = 1500 }: Props) {
  const [animationState, setAnimationState] = useState<AnimationState>("closed");
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    clearTimeout(closeTimeoutRef.current);
    setAnimationState("opening");
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setAnimationState("closing");
      // After animation completes
      setTimeout(() => setAnimationState("closed"), 300);
    }, autoCloseDelay);
  };

  return (
    <div
      className={cn(
        "absolute top-0 h-full transition-all duration-300",
        animationState === "opening" && "w-64 opacity-100",
        animationState === "closing" && "w-48 opacity-0",
        animationState === "closed" && "w-12 opacity-0 pointer-events-none"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* content */}
    </div>
  );
}
```

### 9.6 FlexLayout Tab Management

**Dynamic tab factory** (`apps/todox/src/app/demo/_lib/App.tsx`):
```typescript
import { Layout, Model, TabNode, ITabSetRenderValues } from "flexlayout-react";

const componentFactory = (node: TabNode) => {
  const component = node.getComponent();

  return F.pipe(
    component,
    O.fromNullable,
    O.match({
      onNone: () => null,
      onSome: (c) => {
        switch (c) {
          case "grid": return <MUIDataGrid />;
          case "editor": return <Editor />;
          case "form": return <SimpleForm />;
          default: return <div>Unknown: {c}</div>;
        }
      },
    })
  );
};

function App() {
  const [model, setModel] = useState(() =>
    Model.fromJson(savedLayout ?? defaultLayout)
  );

  // Persist layout changes
  const handleModelChange = (newModel: Model) => {
    localStorage.setItem("layout", JSON.stringify(newModel.toJson()));
  };

  return (
    <Layout
      model={model}
      factory={componentFactory}
      onModelChange={handleModelChange}
      onRenderTab={renderTab}
      onRenderTabSet={renderTabSet}
    />
  );
}
```

### 9.7 Rich Text Editor Integration

**TipTap with Effect** (`apps/todox/src/features/editor/editor.tsx`):
```typescript
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function Editor({ content, onChange, placeholder }: EditorProps) {
  const debouncedOnChange = useMemo(
    () => debounce((html: string) => onChange?.(html), 300),
    [onChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    onUpdate: ({ editor }) => debouncedOnChange(editor.getHTML()),
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return <EditorContent editor={editor} />;
}
```

### 9.8 shadcn/ui + MUI Coexistence

**Pattern**: Use shadcn for layout/navigation, MUI for data components

**shadcn components** (`apps/todox/src/components/ui/`):
- Button, Dropdown, Dialog, Sidebar, Tooltip
- Styled with Tailwind, Radix primitives

**MUI components**:
- DataGrid, TextField, Autocomplete
- Styled with theme overrides, sx prop

**cn utility** (`apps/todox/src/lib/utils.ts`):
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 9.9 Boolean State Hook Pattern

**From `@beep/ui/hooks`**:
```typescript
const compose = useBoolean();

// Usage
compose.onTrue();   // Set to true
compose.onFalse();  // Set to false
compose.onToggle(); // Toggle
compose.value;      // Current value
```

**Common usage**:
```typescript
const sidebar = useBoolean();
const loading = useBoolean();
const modal = useBoolean();

<Button onClick={modal.onTrue}>Open</Button>
<Modal open={modal.value} onClose={modal.onFalse} />
```

### 9.10 Key Application Files

| File | Purpose |
|------|---------|
| `apps/todox/src/app/layout.tsx` | Root layout with font loading |
| `apps/todox/src/app/page.tsx` | Main page with provider composition |
| `apps/todox/src/global-providers.tsx` | Theme + query providers |
| `apps/todox/src/theme/theme.tsx` | MUI theme configuration |
| `apps/todox/src/actions/mail.ts` | Effect-based data fetching |
| `apps/todox/src/features/mail/provider/mail-provider.tsx` | Feature provider |
| `apps/todox/src/app/demo/_lib/App.tsx` | FlexLayout demo |
| `apps/todox/src/components/mini-sidebar/mini-sidebar.tsx` | Auto-hide sidebar |
| `apps/todox/src/features/editor/editor.tsx` | TipTap editor |

---

## 10. Additional Coding Agent Constraints

### From Application Patterns

**MUST DO (Additional)**:
11. Use `cn()` utility for Tailwind class merging
12. Use `useBoolean()` hook for toggle state
13. Use URL state (`searchParams`) for shareable selections
14. Use `startTransition` for non-urgent route updates
15. Use `useMemo` for context values to prevent re-renders
16. Use Effect `O.fromNullable` + `O.match` instead of ternaries for null checks

**MUST NOT (Additional)**:
11. Mix shadcn and MUI for the same component type (pick one per category)
12. Use native `setTimeout` without cleanup in effects
13. Access context without null check (always throw if missing)
14. Use bare `||` or `??` for Option values (use Effect Option utilities)
