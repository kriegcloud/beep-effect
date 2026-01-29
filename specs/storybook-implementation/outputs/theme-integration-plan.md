# Theme Integration Plan: @beep/ui-core with Storybook

**Created**: 2026-01-29

---

## Summary

The @beep/ui-core theme system uses MUI v7's CSS variables mode with `data-color-scheme` attribute selector. Integration requires a dual decorator stack: `withThemeByDataAttribute` (NOT `withThemeByClassName`) for CSS variable activation and `withThemeFromJSXProvider` for MUI ThemeProvider context.

---

## 1. Critical Discovery: Attribute Selector

**IMPORTANT**: The codebase uses `data-color-scheme`, NOT `class="dark"`:

```typescript
// packages/ui/core/src/theme/theme-config.ts:31-34
cssVariables: {
  cssVarPrefix: "",
  colorSchemeSelector: "data-color-scheme",  // NOT "class" or "data-theme"
}
```

Use `withThemeByDataAttribute`, not `withThemeByClassName`.

---

## 2. CSS Variable Bridge (Already Exists)

The globals.css (`packages/ui/ui/src/styles/globals.css:353-469`) maps MUI CSS variables to Tailwind:

```css
@theme inline {
  --color-primary: rgb(var(--mui-palette-primary-mainChannel));
  --color-background-default: rgb(var(--mui-palette-background-defaultChannel));
  --color-text-primary: rgb(var(--mui-palette-text-primaryChannel));
  /* ... more mappings ... */
}
```

**Implication**: Theme switching automatically updates both MUI and Tailwind when `data-color-scheme` changes.

---

## 3. Decorator Stack Order

```
┌─────────────────────────────────────────────────────────┐
│ withThemeByDataAttribute (OUTER)                        │
│   ↳ Sets data-color-scheme="light|dark" on document     │
│   ┌─────────────────────────────────────────────────┐   │
│   │ withThemeFromJSXProvider (INNER)                │   │
│   │   ↳ Provides MUI ThemeProvider context          │   │
│   │   ┌───────────────────────────────────────────┐ │   │
│   │   │ Story Component                           │ │   │
│   │   └───────────────────────────────────────────┘ │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Why This Order**: Outer decorator sets DOM attribute that MUI's CSS variables system reads. Inner decorator provides React context.

---

## 4. Implementation

### preview.tsx

```typescript
import {
  withThemeByDataAttribute,
  withThemeFromJSXProvider,
} from "@storybook/addon-themes";
import { createTheme } from "@beep/ui-core/theme/create-theme";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import type { SettingsState } from "@beep/ui-core/settings/types";
import { defaultSettings } from "@beep/ui-core/settings/settings-config";
import "@beep/ui/styles/globals.css";

// Emotion cache for style insertion order
const emotionCache = createCache({ key: "mui", prepend: true });

// Pre-create themes
const createThemeForMode = (mode: "light" | "dark") => {
  const settingsState: SettingsState = { ...defaultSettings, mode };
  return createTheme({ settingsState });
};

const lightTheme = createThemeForMode("light");
const darkTheme = createThemeForMode("dark");

// Custom provider
const StorybookThemeProvider = ({ children, theme }) => (
  <CacheProvider value={emotionCache}>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  </CacheProvider>
);

export const decorators = [
  // OUTER: Sets data-color-scheme attribute
  withThemeByDataAttribute({
    themes: { light: "light", dark: "dark" },
    defaultTheme: "dark",
    attributeName: "data-color-scheme",
  }),
  // INNER: Provides MUI context
  withThemeFromJSXProvider({
    themes: { light: lightTheme, dark: darkTheme },
    defaultTheme: "dark",
    Provider: StorybookThemeProvider,
  }),
];

export const parameters = {
  backgrounds: { disable: true },  // MUI handles backgrounds
};

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme",
    defaultValue: "dark",
    toolbar: {
      icon: "paintbrush",
      items: [
        { value: "light", title: "Light", icon: "sun" },
        { value: "dark", title: "Dark", icon: "moon" },
      ],
      dynamicTitle: true,
    },
  },
};
```

---

## 5. Color Presets (Optional Enhancement)

6 primary color presets available at `packages/ui/core/src/theme/with-settings/color-presets.ts`:

| Preset | Color | Hex |
|--------|-------|-----|
| default | Green | #22C55E |
| preset1 | Blue | #078DEE |
| preset2 | Purple | #7635dc |
| preset3 | Royal Blue | #0C68E9 |
| preset4 | Orange | #fda92d |
| preset5 | Red | #FF3030 |

To expose in Storybook, use custom decorator reading `context.globals`:

```typescript
export const globalTypes = {
  theme: { /* ... */ },
  primaryColor: {
    name: "Primary Color",
    defaultValue: "default",
    toolbar: {
      icon: "paintbrush",
      items: [
        { value: "default", title: "Green" },
        { value: "preset1", title: "Blue" },
        // ... more presets
      ],
    },
  },
};

// Custom decorator for color presets
const withColorPreset = (Story, context) => {
  const { theme, primaryColor } = context.globals;
  const muiTheme = createTheme({
    settingsState: { ...defaultSettings, mode: theme, primaryColor },
  });
  return (
    <CacheProvider value={emotionCache}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Story />
      </MuiThemeProvider>
    </CacheProvider>
  );
};
```

---

## 6. MUI + Tailwind Coexistence

### How They Work Together

1. **MUI**: Component styling (buttons, inputs, dialogs)
2. **Tailwind**: Layout utilities (flex, grid, spacing) + shadcn components
3. **Bridge**: `@theme inline` in globals.css maps MUI vars to Tailwind tokens

### Layer Ordering (globals.css)

```css
@layer theme, base, mui, components, utilities;
```

Tailwind `utilities` layer can override MUI `mui` layer when needed.

### Dark Mode Variant

```css
/* globals.css - custom variant for Tailwind dark: utilities */
@custom-variant dark (&:is(.dark *))
```

This allows `dark:` utilities alongside `data-color-scheme` attribute.

---

## 7. Potential Conflicts & Resolutions

| Conflict | Resolution |
|----------|------------|
| Reset styles clash | Import globals.css first, then MUI styles |
| Color variable collision | globals.css bridges MUI→Tailwind (no collision) |
| Dark mode selector mismatch | Custom variant in globals.css handles both |
| Emotion style order | Use `prepend: true` in cache |

---

## 8. Key Files Reference

| File | Purpose |
|------|---------|
| `packages/ui/core/src/theme/create-theme.ts` | Theme factory |
| `packages/ui/core/src/theme/theme-config.ts` | `colorSchemeSelector: "data-color-scheme"` |
| `packages/ui/core/src/settings/types.ts` | SettingsState type |
| `packages/ui/core/src/theme/with-settings/color-presets.ts` | 6 color presets |
| `packages/ui/ui/src/styles/globals.css` | CSS variable bridge |
| `packages/ui/ui/src/theme/theme-provider.tsx` | App ThemeProvider reference |

---

## 9. Implementation Checklist

- [ ] Use `withThemeByDataAttribute` (NOT `withThemeByClassName`)
- [ ] Set `attributeName: "data-color-scheme"`
- [ ] Import `@beep/ui/styles/globals.css` first
- [ ] Create Emotion cache with `prepend: true`
- [ ] Pre-create light/dark themes with `createTheme`
- [ ] Disable backgrounds parameter (MUI handles)
- [ ] Test toggle affects both MUI and Tailwind components

---

## 10. Patterns to Avoid

1. **Do NOT use `withThemeByClassName`** - codebase uses `data-color-scheme` attribute
2. **Do NOT wrap with `SettingsProvider`** - uses localStorage, complicates Storybook
3. **Do NOT use `Rtl` component** - sets `document.dir` persistently across stories
