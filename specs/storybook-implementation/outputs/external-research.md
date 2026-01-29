# External Research: Storybook 8.x Integration Patterns

**Research Date**: 2026-01-29
**Focus**: MUI v7, Tailwind CSS v4, shadcn/ui, Next.js 16, Monorepo, Theme Switching

---

## 1. Storybook + Tailwind CSS v4 Configuration

### Vite Builder Setup
- Storybook's Vite builder requires explicit PostCSS/Tailwind configuration for v4
- Tailwind v4 uses CSS-first configuration with `@theme` directive
- Import CSS entry point in preview.ts instead of viteFinal

### Key Finding
Tailwind v4 eliminates `tailwind.config.js` for most use cases. Theme variables are defined directly in CSS via `@theme`, making them automatically available as CSS custom properties.

**Confidence**: HIGH — Official Tailwind documentation confirms this pattern.

---

## 2. MUI v7 ThemeProvider Integration

### CSS Theme Variables Mode
- MUI v7 supports CSS variables natively via `cssVariables: true`
- Use `withThemeFromJSXProvider` decorator from `@storybook/addon-themes`
- Decorator automatically adds theme selector to Storybook toolbar

**Confidence**: HIGH — Official Storybook recipe confirms this approach.

---

## 3. Theme Switching Implementation

### Using @storybook/addon-themes
| Decorator | Use Case |
|-----------|----------|
| `withThemeByClassName` | Tailwind dark mode via `class="dark"` |
| `withThemeByDataAttribute` | CSS variables via `data-theme="dark"` |
| `withThemeFromJSXProvider` | React context providers (MUI, Emotion) |

### Combined Pattern for MUI + Tailwind
- Combine `withThemeByClassName` (Tailwind) with `withThemeFromJSXProvider` (MUI)
- Use globalTypes with custom toolbar for synchronized switching

---

## 4. Next.js 16 App Router Configuration

### Framework Selection
- Use `@storybook/nextjs` framework with `useSWC: true` for faster builds
- Enable `experimentalRSC: true` for RSC support
- Server Components cannot render directly - create client wrapper stories

---

## 5. Monorepo Workspace Configuration

### Shared Stories Pattern
- Use glob patterns in `stories` array to include multiple packages
- Add aliases in `webpackFinal` for workspace resolution
- Start with unified stories; use composition only if build times exceed 60s

---

## 6. shadcn/ui Integration

- shadcn components are source-copied, not npm-installed
- No special provider needed - uses Tailwind classes
- Use `withThemeByClassName` for dark mode toggle

---

## 7. Essential Addons

| Addon | Purpose | Justification |
|-------|---------|---------------|
| `@storybook/addon-essentials` | Core functionality | Includes actions, controls, docs, viewport, backgrounds |
| `@storybook/addon-themes` | Theme switching | Required for dark mode toggle in toolbar |
| `@storybook/addon-a11y` | Accessibility testing | Automated a11y audits per story |
| `@storybook/addon-interactions` | Interaction testing | Play functions + testing-library |

---

## 8. Known Compatibility Issues

### Tailwind v4 + Storybook
- Storybook's built-in PostCSS may conflict with Tailwind v4's new engine
- Workaround: Ensure Storybook uses project's PostCSS config via `viteFinal`

### MUI v7 + Next.js 16
- Emotion SSR requires configuration for App Router
- Workaround: Use `@mui/material-nextjs` package for proper SSR setup

### RSC Components
- Server Components cannot render in Storybook directly
- Workaround: Create `.stories.tsx` that wraps RSC with client boundary

---

## 9. Sources

### High Credibility
- storybook.js.org/recipes/tailwindcss — Official integration guide
- storybook.js.org/recipes/@mui/material — ThemeProvider patterns
- storybook.js.org/docs/get-started/frameworks/nextjs — App Router config
- mui.com/material-ui/customization/css-theme-variables/overview/ — v7 CSS variables
- tailwindcss.com/docs/v4-beta — CSS-first configuration

---

## 10. Gaps Identified

1. **No official Tailwind v4 + Storybook guide** — v4 is recent; documentation pending
2. **MUI v7 specific patterns sparse** — v7 released recently; most docs reference v5/v6
3. **Unified MUI + Tailwind theming** — No canonical pattern; requires custom synchronization
