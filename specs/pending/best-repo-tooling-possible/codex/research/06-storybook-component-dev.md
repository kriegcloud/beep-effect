# Storybook & Component Dev

## Current State
- No `.storybook/` configuration exists.
- No component playground, visual review pipeline, or story-based accessibility checks are configured.
- UI stack complexity is high (React 19 + Next 16 + MUI + Tailwind + shadcn), so missing component-dev infrastructure is a notable gap.
- Current quality: `needs tuning`.

## Recommendations

### Storybook 10 Monorepo Setup (React + Next + Vite builder)
- What: Add Storybook 10 configured for monorepo packages and app-level components.
- Why: Gives a shared component contract layer across MUI, shadcn, and utility styles with fast local feedback.
- Type: New tool
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Strong component isolation and documentation workflow.
- Cons: Node-based CLI/runtime path.
- Conflicts with: None.
- Config snippet:
```ts
// .storybook/main.ts
export default {
  framework: "@storybook/react-vite",
  stories: ["../apps/web/src/**/*.stories.@(ts|tsx|mdx)", "../packages/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-themes"]
};
```

### Chromatic for Visual Review + Story UI Tests
- What: Add Chromatic CI integration for PR-level visual diffs and story test execution.
- Why: Visual regressions are likely with mixed design systems; managed baseline review shortens feedback loop.
- Type: New tool
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: Excellent PR review UX and baseline management.
- Cons: SaaS dependency and usage cost.
- Conflicts with: None.
- Config snippet:
```yaml
- name: Publish Storybook to Chromatic
  run: bunx chromatic --project-token=${{ secrets.CHROMATIC_PROJECT_TOKEN }} --exit-once-uploaded
```

### Addon Baseline (a11y, docs, themes)
- What: Standardize on `@storybook/addon-a11y`, `@storybook/addon-docs`, and `@storybook/addon-themes`.
- Why: These addons cover accessibility, doc pages, and theme/state review without fragile custom plugins.
- Type: New tool
- Maturity: Stable
- Effort: Low (< 1hr)
- Priority: P1 (high value)
- Bun compatible: Partial
- Pros: High signal with low config overhead.
- Cons: Adds Storybook maintenance surface.
- Conflicts with: None.
- Config snippet:
```ts
addons: [
  "@storybook/addon-docs",
  "@storybook/addon-a11y",
  "@storybook/addon-themes"
]
```

### MUI + shadcn + Tailwind Integration Contract
- What: Create a shared Storybook preview wrapper that mounts MUI providers, Tailwind globals, and shadcn token styles in one place.
- Why: Prevents component drift caused by inconsistent provider/theme setup across stories.
- Type: Config upgrade
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P1 (high value)
- Bun compatible: Yes
- Pros: More faithful rendering vs app runtime.
- Cons: Initial setup takes careful provider ordering.
- Conflicts with: None.
- Config snippet:
```ts
// .storybook/preview.ts
import "../apps/web/src/app/globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export const decorators = [
  (Story) => <ThemeProvider theme={createTheme()}><Story /></ThemeProvider>
];
```

### Storybook Build + Test in Turbo Pipeline
- What: Add Storybook `build-storybook` and optional `storybook test` tasks as Turbo tasks for cacheable CI execution.
- Why: Keeps component quality aligned with monorepo orchestration and avoids ad hoc UI checks.
- Type: Config upgrade
- Maturity: Stable
- Effort: Medium (1-4hr)
- Priority: P2 (nice to have)
- Bun compatible: Partial
- Pros: Reproducible UI pipeline with caching benefits.
- Cons: Additional CI duration.
- Conflicts with: None.
- Config snippet:
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build",
    "storybook:test": "storybook test"
  }
}
```

## Head-to-Head Notes
- Chromatic vs self-hosted screenshot diffs:
  - Chromatic wins on review UX and baseline workflow.
  - Self-hosted snapshots are cheaper but operationally noisier.
- Storybook version target:
  - Go directly to Storybook 10.x (current active line) instead of stopping at 8.x.
