# Handoff: Phase 1 (Research) → Phase 2 (Design)

## Research Synthesis

### Key Discovery: @beep/ui-editor is Empty

The `@beep/ui-editor` package is a **stub** with no components. The Lexical rich-text editor implementation (90+ plugins, 15+ nodes) resides in `apps/todox/src/app/lexical/` and has not been extracted.

**Implication**: Phase 4c (Editor Stories) scope is minimal. Focus on @beep/ui for primary implementation.

---

## Package Statistics

| Package | Components | Status |
|---------|------------|--------|
| @beep/ui | 271 .tsx files | Active, 15+ directories |
| @beep/ui-editor | 0 | Stub package |
| @beep/ui-core | Theme system | Required for integration |

### @beep/ui Breakdown

| Directory | Count | Priority |
|-----------|-------|----------|
| components/ (shadcn) | 53 | Tier 1 |
| inputs/ | 30+ | Tier 2 |
| layouts/ | 35+ | Tier 2 |
| atoms/ | 6 | Tier 1 |
| molecules/ | 6 | Tier 2 |
| organisms/ | 10 | Tier 2 |
| flexlayout-react/ | 18 | Tier 4 (specialized) |
| routing/ | 25+ | Tier 3 |

---

## Theme System Architecture

### Provider Stack (Required Order)

1. **SettingsProvider** - Manages `mode`, `direction`, `primaryColor`
2. **ThemeProvider** - MUI theme with `CssBaseline`
3. **Rtl** - RTL support wrapper
4. **Story Content**

### CSS Variable Systems

| System | Selector | Variables |
|--------|----------|-----------|
| MUI | `data-color-scheme` | `--mui-*` (via themeConfig) |
| Tailwind | `.dark` class | `@theme` directive variables |
| shadcn | `:root` / `.dark` | `--background`, `--foreground`, etc. |

### Theme Switching Pattern

```typescript
// Storybook decorator pattern
decorators: [
  withThemeByClassName({ themes: { light: "", dark: "dark" } }),
  withThemeFromJSXProvider({ themes: { light, dark }, Provider: ThemeProvider }),
]
```

---

## External Research Summary

### Storybook 8.x Patterns (HIGH confidence)

1. **Framework**: Use `@storybook/nextjs` for Next.js 16 App Router
2. **Theme Addon**: `@storybook/addon-themes` provides toolbar toggle
3. **Tailwind v4**: Import CSS in preview.ts; no config file needed
4. **MUI v7**: `cssVariables: true` enables CSS variable mode

### Essential Addons

| Addon | Required | Purpose |
|-------|----------|---------|
| addon-essentials | Yes | Controls, docs, viewport |
| addon-themes | Yes | Theme switching |
| addon-a11y | Yes | Accessibility audits |
| addon-interactions | Optional | Play function tests |

### Known Issues

1. **Tailwind v4 + Storybook**: May need explicit PostCSS config
2. **RSC Components**: Cannot render directly; need client wrappers
3. **Emotion SSR**: Requires `@mui/material-nextjs` for App Router

---

## Decisions for Phase 2

### Architecture Decisions Needed

1. **Storybook Location**: `packages/ui/storybook/` (new) vs root-level
2. **Story Co-location**: `*.stories.tsx` next to components vs separate `stories/` dir
3. **Build Tool**: Vite builder vs webpack (Vite recommended)
4. **TypeScript**: Extend from `tsconfig.base.jsonc`

### Theme Integration Decisions

1. **Default Theme**: Light or dark (codebase default is `dark`)
2. **Settings Persistence**: Use Storybook's built-in vs custom
3. **RTL Support**: Include in toolbar or skip for MVP

### Scope Decisions

1. **Component Coverage Target**: 50 highest-reuse components (Tier 1+2)
2. **@beep/ui-editor**: Skip until Lexical extraction
3. **FlexLayout**: Separate documentation approach or defer

---

## Risks and Blockers

### High Risk

1. **CSS Variable Collision**: MUI and Tailwind may conflict
   - Mitigation: Test early with theme decorator prototype

2. **Provider Dependencies**: SettingsProvider needs storage mock
   - Mitigation: Create minimal settings decorator

### Medium Risk

1. **Monorepo Resolution**: @beep/* aliases need Vite config
   - Mitigation: Add aliases to viteFinal

2. **Build Time**: 271 components may slow Storybook
   - Mitigation: Lazy loading, story splitting

### Blockers (None Active)

- No blocking dependencies identified

---

## Phase 2 Objectives

1. Design Storybook architecture (location, structure)
2. Select and document addon configuration
3. Plan theme integration (decorator, CSS)
4. Produce implementation-ready specifications

---

## Files to Read

- `outputs/codebase-context.md` - Package structure details
- `outputs/external-research.md` - Storybook patterns
- `outputs/component-inventory.md` - Component catalog

---

## Context Budget Verification

| Memory Type | Content | Est. Tokens | Budget |
|-------------|---------|-------------|--------|
| Working | Decisions, objectives | ~500 | ≤2,000 |
| Episodic | Discovery summary | ~400 | ≤1,000 |
| Semantic | Statistics, patterns | ~300 | ≤500 |
| Procedural | File references | ~100 | Links only |
| **Total** | | **~1,300** | **≤4,000** |

**Verification**: Word count × 4 tokens/word = compliant
