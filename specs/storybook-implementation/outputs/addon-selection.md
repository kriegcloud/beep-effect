# Storybook Addon Selection

## Executive Summary

Addon selection for `@beep/ui` Storybook implementation with Storybook 8.6.x and React 19.

---

## Required Addons

### 1. @storybook/addon-essentials (`^8.6.1`)

**Bundle**: Meta-package (~1 kB), actual impact from included addons (~50 kB gzipped total)

Includes: `addon-controls`, `addon-docs`, `addon-viewport`, `addon-backgrounds`, `addon-measure`, `addon-outline`, `addon-themes`

```typescript
// .storybook/main.ts
addons: [{ name: "@storybook/addon-essentials", options: { backgrounds: false } }]
```

### 2. @storybook/addon-themes (`^8.6.1`)

**Bundle**: 5.1 kB minified (2.1 kB gzipped)

**Justification**: Required for MUI + Tailwind dual-theming. Supports both `withThemeByDataAttribute` and `withThemeFromJSXProvider`.

**Dual Decorator Support**: Stable in Storybook 8.0+. Order matters: attribute decorator before JSX provider.

```typescript
// .storybook/preview.tsx
import { withThemeByDataAttribute, withThemeFromJSXProvider } from "@storybook/addon-themes";

export const decorators = [
  withThemeByDataAttribute({
    themes: { light: "light", dark: "dark" },
    defaultTheme: "dark",
    attributeName: "data-color-scheme",
  }),
  withThemeFromJSXProvider({
    themes: { light: lightTheme, dark: darkTheme },
    defaultTheme: "dark",
    Provider: MuiThemeProvider,
  }),
];
```

### 3. @storybook/addon-a11y (`^8.6.1`)

**Bundle**: 471.2 kB minified (133.5 kB gzipped) — includes axe-core

**Justification**: Automated WCAG testing for 271 components. MUI + shadcn compatibility confirmed.

```typescript
// .storybook/preview.ts
parameters: {
  a11y: {
    options: {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    },
  },
}

// Per-story override for intentional violations
export const CustomFocus: Story = {
  parameters: { a11y: { config: { rules: [{ id: "focus-visible", enabled: false }] } } },
};
```

### 4. @storybook/addon-controls (included in essentials)

**Justification**: Auto-generates controls from TypeScript props for 271 components.

```typescript
parameters: {
  controls: {
    matchers: { color: /(background|color)$/i, date: /Date$/i },
    sort: "requiredFirst",
    expanded: true,
    exclude: ["className", "style", "ref"],
  },
}
```

### 5. @storybook/addon-viewport (included in essentials)

**Justification**: Responsive testing for desktop/tablet/mobile viewports.

```typescript
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";

parameters: {
  viewport: {
    viewports: { ...INITIAL_VIEWPORTS, desktop: { name: "Desktop", styles: { width: "1440px", height: "900px" } } },
    defaultViewport: "desktop",
  },
}
```

---

## Recommended Addons

### 6. storybook-addon-pseudo-states (`^4.0.2`)

**Bundle**: 8.4 kB minified (3.1 kB gzipped)
**Compatibility**: Storybook 8.x peer dep, React 19 compatible (framework-agnostic)

**Justification**: Visualize `:hover`, `:focus`, `:active` states without interaction.

```typescript
// .storybook/main.ts
addons: ["@storybook/addon-essentials", "storybook-addon-pseudo-states"]

// Usage in stories
export const Hover: Story = { parameters: { pseudo: { hover: true } } };
export const AllStates: Story = { parameters: { pseudo: { hover: true, focus: true, active: true } } };
```

### 7. @storybook/addon-interactions (`^8.6.1`)

**Bundle**: 80.7 kB minified (24.9 kB gzipped)

**Justification**: Step-through debugging for complex component interactions (DataTable, Form).

```typescript
// Usage with play functions
import { within, userEvent, expect } from "@storybook/test";

export const SubmitForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Email"), "test@example.com");
    await userEvent.click(canvas.getByRole("button", { name: /submit/i }));
    await expect(canvas.getByText("Success")).toBeVisible();
  },
};
```

---

## Evaluation Summary

| Addon | Status | Bundle (gzip) | Purpose |
|-------|--------|---------------|---------|
| `addon-essentials` | **Required** | ~50 kB | Foundation |
| `addon-themes` | **Required** | 2.1 kB | MUI + Tailwind theming |
| `addon-a11y` | **Required** | 133.5 kB | Accessibility |
| `addon-pseudo-states` | **Recommended** | 3.1 kB | State visualization |
| `addon-interactions` | **Recommended** | 24.9 kB | Interaction debugging |
| `addon-links` | **Deferred** | - | Not needed for v1 |

---

## React 19 & Peer Dependencies

**Status**: Fully supported in Storybook 8.4+

- `@storybook/react-vite`: Recommended for Vite + React 19
- All official addons: Updated for React 19
- `storybook-addon-pseudo-states`: No React dependency (CSS manipulation)

**No peer dependency conflicts** with selected addon set.

---

## Bundle Size Analysis

| Component | Size (gzipped) |
|-----------|----------------|
| Storybook Core | ~300 kB |
| Essentials | ~50 kB |
| addon-a11y | ~133 kB |
| addon-interactions | ~25 kB |
| addon-pseudo-states | ~3 kB |
| **Total** | **~511 kB** |

*Dev-only impact. Does not affect production builds.*

---

## Sources

- [Storybook Essentials](https://storybook.js.org/docs/essentials)
- [addon-themes API](https://storybook.js.org/docs/sharing/theming/api)
- [MUI + addon-a11y](https://mui.com/blog/storybook-a11y-test/)
- [React 19 Support #29106](https://github.com/storybookjs/storybook/issues/29106)
- [Bundlephobia](https://bundlephobia.com)
