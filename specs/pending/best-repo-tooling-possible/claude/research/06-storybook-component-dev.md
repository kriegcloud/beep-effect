# Storybook & Component Development

## Current State in This Repo

**From the audit** (`00-current-state-audit.md`):
- **Storybook**: Not present. Listed explicitly under "Missing from Repo."
- **Visual regression testing**: Not present.
- **Component testing**: Not present. Only unit tests via Vitest + @effect/vitest + tstyche.
- **E2E testing**: Not present.

**Relevant stack**:
- **React**: 19.2.4 (catalog)
- **Next.js**: 16.2.0-canary.58 (App Router, Turbopack)
- **Tailwind CSS**: v4 (CSS-first config, `@tailwindcss/postcss`)
- **shadcn**: 3.8.5 (Radix UI primitives + Tailwind styling, `@base-ui/react` in deps)
- **MUI**: Not currently in `apps/web` deps (only `@base-ui/react`), but present in `.repos/beep-effect` legacy
- **Build orchestration**: Turborepo 2.8.10 (missing `dev` and `test` turbo tasks)
- **Package manager**: Bun 1.3.x
- **TypeScript**: 5.9.3 (strict, `erasableSyntaxOnly`, composite builds)
- **Module system**: ESM (`verbatimModuleSyntax: true`)
- **Monorepo structure**: `apps/web`, `packages/common`, `packages/shared`, `tooling/*`

**Key gaps this research addresses**:
1. No component development environment (no isolated component viewer)
2. No visual regression testing (UI regressions caught only by manual review)
3. No interaction/a11y testing for components
4. No component documentation beyond JSDoc (which is code-level, not visual)
5. No design token pipeline (Tailwind v4 CSS variables exist but not formalized)

---

## Recommendations

---

### Storybook 10 (Current Stable)

- **What**: Component workshop for developing, testing, and documenting UI in isolation
- **Why**: This repo has zero component-level development tooling. Storybook provides visual component development, interaction testing, a11y testing, and autodocs -- all gaps identified in the audit. Storybook 10 (released October 2025) is ESM-only, which aligns perfectly with this repo's `verbatimModuleSyntax: true` and ESM-first approach.
- **Type**: New tool
- **Maturity**: Stable (10.2.x is latest as of Feb 2026, with 10.x receiving regular minor releases)
- **Effort**: High (4hr+) -- initial setup including monorepo wiring, Tailwind v4, shadcn theming, and addon configuration
- **Priority**: P0 (must-have) -- the single biggest gap in this repo's component development workflow
- **Bun compatible**: Partial -- Bun can install deps and run scripts, but Storybook's dev server uses Node internally. Known issues with Bun monorepo path resolution (stories resolving outside package boundaries). Workaround: use `node` for `storybook dev` / `storybook build` commands, Bun for everything else.
- **Pros**:
  - De facto industry standard with massive ecosystem (addons, integrations, CI tools)
  - ESM-only in v10 matches this repo's module strategy
  - CSF Factories (React-only preview) provide typesafe story authoring -- good fit with strict TS config
  - Built-in Vitest addon (`@storybook/addon-vitest`) runs interaction tests in real browser via Playwright
  - Native Next.js framework support (`@storybook/nextjs`) handles App Router, next/image, next/font, etc.
  - Autodocs generates documentation pages from stories + TypeScript types
  - 29% smaller install size vs Storybook 9 due to ESM-only distribution
  - Module automocking simplifies testing of components with complex dependencies (Effect services)
- **Cons**:
  - Heavy dependency tree (~200+ packages)
  - Bun monorepo path resolution requires workarounds (baseUrl in tsconfig, explicit story globs)
  - `react-docgen` (default) cannot resolve imported types across monorepo packages -- may need `react-docgen-typescript` fallback (slower)
  - Storybook 10 requires Node 20.16+, 22.19+, or 24+ (this repo uses Node 22 via .nvmrc, so OK)
  - Some community addons may lag behind Storybook 10 compatibility
- **Conflicts with**: None (greenfield)
- **Config snippet**:

```ts
// apps/storybook/.storybook/main.ts
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: [
    "../../../packages/*/src/**/*.stories.@(ts|tsx)",
    "../../../apps/web/src/**/*.stories.@(ts|tsx)",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {
      builder: { useSWC: true },
    },
  },
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "@storybook/addon-vitest",
  ],
  typescript: {
    // Use react-docgen-typescript for cross-package type resolution
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false,
      },
    },
  },
};
export default config;
```

```ts
// apps/storybook/.storybook/preview.ts
import type { Preview } from "@storybook/react";
import "@/app/globals.css"; // Tailwind v4 entry point

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};
export default preview;
```

```json
// turbo.json addition
{
  "tasks": {
    "storybook:build": {
      "dependsOn": ["^build"],
      "outputs": ["storybook-static/**"],
      "inputs": [
        "src/**/*.tsx",
        "src/**/*.stories.tsx",
        ".storybook/**"
      ]
    }
  }
}
```

---

### Storybook Monorepo Architecture (Centralized in `apps/storybook`)

- **What**: Single Storybook app that aggregates stories from all UI packages via glob patterns
- **Why**: This repo has a clear separation: `apps/web` (Next.js app), `packages/common` and `packages/shared` (shared libs). A centralized Storybook in `apps/storybook` keeps a clean boundary between library packages and the component workshop. Turborepo's official guide recommends this pattern.
- **Type**: New tool (architectural pattern)
- **Maturity**: Stable (recommended by both Turborepo and Storybook docs)
- **Effort**: Medium (1-4hr) -- part of initial Storybook setup
- **Priority**: P0 (must-have) -- architectural decision required before setting up Storybook
- **Bun compatible**: Yes
- **Pros**:
  - Single entry point for all component documentation
  - Clean turbo task caching: `storybook:build` task with proper `inputs` avoids cache misses from unrelated changes
  - Easy deployment as a static site (Vercel, Chromatic, or GitHub Pages)
  - Stories co-located with components in each package but rendered from one Storybook instance
- **Cons**:
  - As monorepo grows, single Storybook build time increases (mitigated by turbo caching)
  - Story changes in packages can cause cache misses for the Storybook build (separate `storybook:build` task prevents cascading to production builds)
  - Need to configure story globs carefully to exclude `node_modules` in Bun workspaces
- **Conflicts with**: None
- **Config snippet**:

```json
// apps/storybook/package.json
{
  "name": "@beep/storybook",
  "private": true,
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "storybook build"
  },
  "dependencies": {
    "@beep/schema": "workspace:^"
  },
  "devDependencies": {
    "storybook": "catalog:",
    "@storybook/nextjs": "catalog:",
    "@storybook/react": "catalog:",
    "@storybook/addon-a11y": "catalog:",
    "@storybook/addon-themes": "catalog:",
    "@storybook/addon-vitest": "catalog:"
  }
}
```

---

### @storybook/addon-a11y (Accessibility Testing)

- **What**: Storybook addon powered by Deque's axe-core that automatically catches WCAG violations in every story
- **Why**: No a11y testing exists in this repo. This addon catches up to 57% of WCAG issues automatically. When combined with `@storybook/addon-vitest`, a11y tests run in CI alongside component tests -- zero extra configuration.
- **Type**: New tool
- **Maturity**: Stable (maintained by Storybook core team, part of official addon suite)
- **Effort**: Low (< 1hr) -- install and add to addons array
- **Priority**: P0 (must-have) -- a11y testing is table-stakes for any UI project
- **Bun compatible**: Yes
- **Pros**:
  - Zero-config: automatically tests every story against axe-core rules
  - Results visible in Storybook UI panel and in CI via vitest addon
  - Configurable rule overrides per-story or globally
  - Catches color contrast, missing alt text, ARIA issues, keyboard navigation problems
- **Cons**:
  - Only catches ~57% of WCAG issues (manual testing still needed for keyboard nav, screen reader behavior)
  - Can produce false positives with complex component compositions
- **Conflicts with**: None
- **Config snippet**:

```ts
// In .storybook/main.ts addons array:
addons: ["@storybook/addon-a11y"]

// Per-story override example:
export const DarkMode: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: false }], // override for dark theme
      },
    },
  },
};
```

---

### @storybook/addon-themes (Dark Mode / Theme Switching)

- **What**: Official Storybook addon for switching between themes (dark/light, MUI themes, Tailwind themes) in the toolbar
- **Why**: This repo uses shadcn (which supports dark mode via Tailwind's `dark:` variant) and may use MUI themes. This addon lets developers preview every component in every theme without code changes. Replaces the discontinued `storybook-dark-mode` addon.
- **Type**: New tool
- **Maturity**: Stable (official Storybook addon, replaces older community addons)
- **Effort**: Low (< 1hr) -- configure decorators in preview.ts
- **Priority**: P1 (high value) -- essential for any design system with dark mode
- **Bun compatible**: Yes
- **Pros**:
  - Supports `withThemeByClassName` (perfect for Tailwind dark mode via class strategy)
  - Supports `withThemeFromJSXProvider` (perfect for MUI ThemeProvider)
  - Toolbar dropdown for quick theme switching
  - Works with Chromatic for visual testing across themes
- **Cons**:
  - Requires separate decorator configuration for Tailwind (class-based) vs MUI (provider-based)
  - Theme state doesn't persist across page reloads by default
- **Conflicts with**: None
- **Config snippet**:

```ts
// .storybook/preview.ts
import { withThemeByClassName } from "@storybook/addon-themes";

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
  ],
};
```

---

### @storybook/addon-vitest (Interaction + Component Testing)

- **What**: Transforms stories into Vitest tests that run in a real browser (Playwright Chromium), testing component rendering, user interactions, and assertions
- **Why**: This repo already uses Vitest for unit tests but has no component-level interaction testing. This addon reuses existing stories as tests, meaning every story is automatically a test. Play functions define user interactions (click, type, wait) and assertions.
- **Type**: New tool
- **Maturity**: Stable (core Storybook addon, successor to `@storybook/addon-interactions` in v10)
- **Effort**: Medium (1-4hr) -- configure vitest workspace, write play functions for key components
- **Priority**: P0 (must-have) -- the audit identified "No component testing" as a gap
- **Bun compatible**: Yes (uses Vitest, which this repo already has configured)
- **Pros**:
  - Stories double as tests: no duplicate test code
  - Runs in real browser (Playwright Chromium) -- catches real rendering issues
  - Works with existing Vitest config and coverage reporting
  - Visual test widget in Storybook UI shows pass/fail for each story
  - `expect` combines Vitest matchers + `@testing-library/jest-dom`
  - Integrates with Vitest workspace pattern (this repo already uses `projects` array)
- **Cons**:
  - Browser-based tests are slower than JSDOM tests (seconds vs milliseconds)
  - Known issue: `userEvent` can be slow in Storybook 9/10 interaction tests
  - Requires Playwright browser installed in CI
- **Conflicts with**: None (complements existing Vitest setup)
- **Config snippet**:

```ts
// Example play function for a button story
import { expect, fn, userEvent, within } from "storybook/test";

export const ClickTest: Story = {
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
```

```ts
// vitest.workspace.ts addition
export default [
  // existing projects...
  {
    extends: "apps/storybook/vitest.config.ts",
    test: { name: "storybook" },
  },
];
```

---

### Lost Pixel (Visual Regression Testing)

- **What**: Open-source visual regression testing tool; can run self-hosted or via cloud platform. Compares screenshots of Storybook stories, pages, or arbitrary URLs.
- **Why**: No visual regression testing exists in this repo. Lost Pixel offers the most generous free tier (7,000 screenshots/month vs Chromatic's 5,000), full monorepo support, and can be self-hosted for unlimited screenshots. As an open-source alternative to Chromatic and Percy, it fits a repo that values control and cost-efficiency.
- **Type**: New tool
- **Maturity**: Growing (active development, used in production by multiple companies)
- **Effort**: Medium (1-4hr) -- configure GitHub Action, baseline screenshots, review workflow
- **Priority**: P1 (high value) -- visual regressions are currently invisible until production
- **Bun compatible**: Yes
- **Pros**:
  - **Free tier**: 7,000 screenshots/month (most generous among competitors)
  - **Open source**: Can self-host for unlimited screenshots with zero cost
  - Supports Storybook, Ladle, Next.js pages, and arbitrary URLs
  - First-class GitHub integration (PR comments with visual diffs)
  - Monorepo support built-in
  - Anti-flakiness measures (retries, threshold configuration)
  - Lightweight GitHub Action (~2 min setup)
- **Cons**:
  - Smaller community than Chromatic (less ecosystem integration)
  - Self-hosted mode requires managing baseline storage (S3, GCS, or local)
  - Cloud UI is less polished than Chromatic's review interface
  - No built-in Storybook composition support (treats Storybook as a black box)
- **Conflicts with**: Chromatic (choose one for visual testing)
- **Config snippet**:

```ts
// lostpixel.config.ts
import { CustomProjectConfig } from "lost-pixel";

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: "./apps/storybook/storybook-static",
  },
  generateOnly: true,
  failOnDifference: true,
};
```

```yaml
# .github/workflows/visual-test.yml
name: Visual Regression
on: [pull_request]
jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun turbo storybook:build
      - uses: lost-pixel/lost-pixel@v3
```

---

### Chromatic (Visual Testing & Review Platform)

- **What**: Cloud-based visual testing and UI review platform, built by the Storybook team. Captures screenshots of every story and diffs them against baselines.
- **Why**: Chromatic is the most deeply integrated visual testing tool for Storybook, built by the same team. It handles screenshot capture, diff comparison, and team review workflows. The free tier (5,000 snapshots/month) may suffice for early-stage development.
- **Type**: New tool
- **Maturity**: Stable (maintained by Storybook maintainers, used by thousands of teams)
- **Effort**: Low (< 1hr) -- install `chromatic`, add GitHub Action, done
- **Priority**: P2 (nice to have) -- Lost Pixel is recommended as primary due to better free tier and open-source nature; Chromatic is the upgrade path if team grows
- **Bun compatible**: Yes
- **Pros**:
  - Deepest Storybook integration (built by same team)
  - Excellent review UI with side-by-side diffs, focus mode, and accept/deny workflow
  - Automatic TurboSnap: only captures stories affected by code changes (reduces snapshot usage)
  - Monorepo support with per-project configuration
  - Handles cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Free for qualifying open-source projects (unlimited snapshots)
- **Cons**:
  - **Free tier**: Only 5,000 snapshots/month (can burn through quickly with many stories x themes)
  - Paid plans start at $149/month (expensive for small teams)
  - Vendor lock-in: screenshots stored on Chromatic's infrastructure
  - Requires `CHROMATIC_PROJECT_TOKEN` secret in CI
- **Conflicts with**: Lost Pixel (choose one for primary visual testing)
- **Config snippet**:

```yaml
# .github/workflows/chromatic.yml
name: Chromatic
on: push
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          workingDir: apps/storybook
          buildScriptName: build
          onlyChanged: true  # TurboSnap
```

---

### Percy (Visual Testing by BrowserStack)

- **What**: Enterprise visual regression testing platform by BrowserStack with AI-powered review agent
- **Why**: Percy is the most established visual testing platform and offers the same 5,000 free snapshots/month as Chromatic. Its AI Visual Review Agent (shipped late 2025) provides intelligent grouping of visual changes. However, it is the most expensive option at scale.
- **Type**: New tool
- **Maturity**: Stable (enterprise-grade, backed by BrowserStack)
- **Effort**: Medium (1-4hr) -- SDK integration, GitHub Action setup
- **Priority**: P2 (nice to have) -- only relevant if team needs enterprise features or BrowserStack integration
- **Bun compatible**: Yes
- **Pros**:
  - AI Visual Review Agent highlights meaningful changes, ignores noise
  - Cross-browser support (Chrome, Firefox, Safari, Edge)
  - Responsive testing across configurable viewport widths
  - 30-day build history on free tier
  - Unlimited team members on free tier
  - Broad SDK support (not just Storybook -- Playwright, Cypress, Selenium)
- **Cons**:
  - **Most expensive** at scale among the three options
  - Less Storybook-specific than Chromatic (generic visual testing tool)
  - Heavier SDK integration compared to Lost Pixel
  - BrowserStack account required
- **Conflicts with**: Chromatic, Lost Pixel (choose one)
- **Config snippet**: N/A (would only use if choosing Percy over Lost Pixel/Chromatic)

---

### Visual Testing Comparison Summary

| Feature | Lost Pixel | Chromatic | Percy |
|---------|-----------|-----------|-------|
| **Free snapshots/month** | 7,000 | 5,000 | 5,000 |
| **Open source / self-host** | Yes | No | No |
| **Storybook integration** | Good | Best (same team) | Good |
| **AI review** | No | Basic | Yes (Review Agent) |
| **Cross-browser** | Playwright only | Chrome/FF/Safari/Edge | Chrome/FF/Safari/Edge |
| **Monorepo support** | Yes | Yes (TurboSnap) | Yes |
| **Paid starting price** | $100/mo | $149/mo | Varies (enterprise) |
| **GitHub Actions** | First-class | First-class | First-class |
| **Recommendation** | **Primary choice** | Upgrade path | Enterprise only |

---

### @storybook/addon-designs (Figma Integration)

- **What**: Embeds Figma files, prototypes, or design specs directly in the Storybook addon panel alongside each story
- **Why**: Bridges the gap between design and development. Developers see the Figma design right next to the rendered component, making visual QA trivial.
- **Type**: New tool
- **Maturity**: Stable (official Storybook addon)
- **Effort**: Low (< 1hr) -- install, add Figma URLs to story parameters
- **Priority**: P2 (nice to have) -- valuable when design team is active; can add later
- **Bun compatible**: Yes
- **Pros**:
  - Figma embed shows live designs (updates when Figma file changes)
  - Supports Figma files, prototypes, and specific frames
  - Helps catch design-to-code drift during development
- **Cons**:
  - Requires Figma URLs in every story (maintenance burden)
  - Figma embed can be slow to load
  - Read-only: cannot edit Figma from Storybook
- **Conflicts with**: None
- **Config snippet**:

```ts
// In a story file
export const Primary: Story = {
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/xxx/Component?node-id=123",
    },
  },
};
```

---

### storybook-design-token (Design Token Documentation)

- **What**: Storybook addon that extracts and displays design tokens from CSS/SCSS/Less files, showing color swatches, spacing scales, typography, etc.
- **Why**: This repo uses Tailwind v4's CSS-first `@theme` directive for design tokens. This addon can parse those CSS custom properties and display them as a visual reference in Storybook, creating a living style guide. v4 of the addon supports Storybook 9, v5 supports Storybook 10+.
- **Type**: New tool
- **Maturity**: Growing (community addon, v5 released for Storybook 10)
- **Effort**: Medium (1-4hr) -- configure token categories, annotate CSS files with token group comments
- **Priority**: P2 (nice to have) -- useful for design system documentation, not critical for development
- **Bun compatible**: Yes
- **Pros**:
  - Automatically parses CSS custom properties (works with Tailwind v4 `@theme` output)
  - Visual display of colors, spacing, typography, shadows
  - Preview token changes in real-time during development
  - Can be added to Storybook Docs pages via Doc Blocks
- **Cons**:
  - Requires specific CSS comment annotations to categorize tokens
  - Community-maintained (slower update cycle than official addons)
  - May not parse Tailwind v4's `@theme` directive out of the box (may need PostCSS build step first)
- **Conflicts with**: None
- **Config snippet**:

```css
/* In your global CSS */
/**
 * @tokens Colors
 * @presenter Color
 */
:root {
  --color-primary: oklch(0.65 0.24 265);
  --color-secondary: oklch(0.75 0.15 180);
}
```

---

### Style Dictionary v4 (Design Token Pipeline)

- **What**: Build system for defining design tokens once (JSON/YAML) and transforming them into platform-specific outputs (CSS custom properties, Tailwind theme, TypeScript constants, iOS/Android)
- **Why**: This repo uses Tailwind v4 with CSS-first theming but has no formalized token pipeline. Style Dictionary would allow defining tokens in a single source (JSON) and generating both Tailwind v4 CSS (`@theme` block) and TypeScript type-safe constants. The tokens-studio/sd-tailwindv4 example demonstrates this exact workflow.
- **Type**: New tool
- **Maturity**: Stable (v4 released, widely adopted, maintained by Amazon)
- **Effort**: High (4hr+) -- define token taxonomy, configure transforms, integrate into build pipeline
- **Priority**: P2 (nice to have) -- valuable for multi-platform or multi-brand design systems; overkill if only shipping a single web app with Tailwind
- **Bun compatible**: Yes
- **Pros**:
  - Single source of truth for design tokens across platforms
  - Generates Tailwind v4 CSS `@theme` blocks directly
  - TypeScript transform generates type-safe token constants
  - Extensible transform/format system for custom outputs
  - Large ecosystem of community transforms and integrations
  - Three-tier token architecture (base/semantic/component) enforces design consistency
- **Cons**:
  - Significant upfront investment to define token taxonomy
  - Adds build step complexity (token build must run before Tailwind/Storybook)
  - Overkill for a single web app -- most valuable for multi-platform or white-label scenarios
  - Token JSON format is another file format to maintain alongside CSS
- **Conflicts with**: Direct Tailwind v4 `@theme` CSS authoring (complementary, not conflicting)
- **Config snippet**:

```js
// tokens/config.mjs
import StyleDictionary from "style-dictionary";

export default {
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "apps/web/src/styles/",
      files: [{ destination: "tokens.css", format: "css/variables" }],
    },
    tailwind: {
      transformGroup: "css",
      buildPath: "apps/web/",
      files: [{ destination: "tailwind-tokens.css", format: "css/variables" }],
    },
  },
};
```

---

### Ladle (Storybook Alternative)

- **What**: Lightweight, zero-config React component development tool built on Vite and SWC. Drop-in replacement for Storybook using CSF format.
- **Why**: If Storybook's dependency weight (~200+ packages) or Bun compatibility issues prove problematic, Ladle is a viable lightweight alternative. Used at scale by Uber (335 projects, 15,896 stories). Supports CSF 3 format, so stories could be migrated to/from Storybook.
- **Type**: Replacement (for Storybook)
- **Maturity**: Growing (v3 released, active maintenance, used by Uber at scale)
- **Effort**: Medium (1-4hr) -- simpler setup than Storybook due to zero-config nature
- **Priority**: P2 (nice to have) -- only consider if Storybook proves too heavy or Bun-incompatible
- **Bun compatible**: Yes (Vite-based, works well with Bun)
- **Pros**:
  - Dramatically smaller footprint than Storybook (fewer deps, faster install)
  - Zero configuration required for basic setup
  - SWC-based (faster compilation than Babel)
  - CSF-compatible stories (easy migration to/from Storybook)
  - Lost Pixel has first-class Ladle integration
  - Faster dev server startup than Storybook
- **Cons**:
  - **Much smaller addon ecosystem** -- no equivalent of Storybook's addon-a11y, addon-vitest, addon-themes
  - No interaction testing built in
  - No autodocs / documentation generation
  - React-only (fine for this repo, but less flexible)
  - Smaller community = fewer Stack Overflow answers, tutorials
  - No Next.js framework-specific support (next/image, next/font won't work in Ladle)
  - No Chromatic integration
- **Conflicts with**: Storybook (mutually exclusive choices)
- **Config snippet**:

```ts
// .ladle/config.mjs
export default {
  stories: "packages/*/src/**/*.stories.tsx",
  addons: { a11y: { enabled: true } },
};
```

---

### Storybook Autodocs (Component Documentation)

- **What**: Built-in Storybook feature that auto-generates documentation pages from TypeScript types, JSDoc comments, and stories
- **Why**: This repo already has strong JSDoc enforcement (ESLint JSDoc plugin with 20-char minimum descriptions). Autodocs leverages those existing JSDoc comments to generate rich component documentation pages without any extra work. Combined with `react-docgen-typescript`, it resolves props across monorepo package boundaries.
- **Type**: New tool (built into Storybook, no separate install)
- **Maturity**: Stable (core Storybook feature since v7)
- **Effort**: Low (< 1hr) -- enabled by default in Storybook 10; just needs `tags: ["autodocs"]` on stories
- **Priority**: P1 (high value) -- leverages existing JSDoc investment for free component docs
- **Bun compatible**: Yes
- **Pros**:
  - Automatically generates props table from TypeScript types
  - Pulls descriptions from JSDoc comments (this repo already enforces JSDoc on all exports)
  - Stories become interactive examples in the docs page
  - Can be extended with MDX for custom documentation
  - No separate documentation site to maintain
- **Cons**:
  - `react-docgen` (default) struggles with cross-package type imports in monorepos
  - `react-docgen-typescript` (fallback) is slower but resolves types correctly
  - Limited to component documentation (not suitable for architecture docs, API docs)
  - Not a replacement for Docusaurus if you need a full documentation site
- **Conflicts with**: None
- **Config snippet**:

```ts
// In any story file, enable autodocs:
const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;
```

---

### Docusaurus (Full Documentation Site)

- **What**: React-based static site generator for documentation, maintained by Meta. Supports MDX, versioning, i18n, search.
- **Why**: If this repo needs a full documentation site beyond component docs (architecture guides, API references, onboarding docs), Docusaurus is the standard. It can embed Storybook components via iframe or the `storybook-addon-docusaurus` addon. However, for component-only documentation, Storybook Autodocs is simpler and sufficient.
- **Type**: New tool
- **Maturity**: Stable (v3.x, maintained by Meta, massive adoption)
- **Effort**: High (4hr+) -- full site setup, content migration, deployment
- **Priority**: P2 (nice to have) -- only needed if the repo outgrows Storybook Autodocs for documentation needs
- **Bun compatible**: Yes
- **Pros**:
  - Full-featured documentation site (versioning, search, i18n, blog)
  - MDX support for rich interactive docs
  - Can embed Storybook stories as live examples
  - Massive ecosystem and community
  - Deploy anywhere (Vercel, Netlify, GitHub Pages)
- **Cons**:
  - Separate site to maintain (content duplication risk)
  - Overkill if only documenting components (Storybook Autodocs is simpler)
  - Another build step in CI
  - React 19 compatibility may lag (Docusaurus manages its own React version)
- **Conflicts with**: None (complementary to Storybook)
- **Config snippet**: N/A (would configure only if choosing Docusaurus)

---

### Tailwind v4 + MUI Layer Configuration

- **What**: CSS `@layer` ordering configuration to ensure MUI styles and Tailwind utilities coexist predictably
- **Why**: This repo has `@base-ui/react` (Radix-based, unstyled) in `apps/web` and MUI in the legacy `.repos/beep-effect`. If MUI is brought forward, the `@layer mui` pattern ensures Tailwind utilities always override MUI defaults. Tailwind v4 handles this natively with its CSS-first approach.
- **Type**: Config upgrade
- **Maturity**: Stable (documented by MUI team for Tailwind v4)
- **Effort**: Low (< 1hr) -- add `@layer` ordering to global CSS
- **Priority**: P1 (high value) -- prevents CSS specificity wars between MUI and Tailwind
- **Bun compatible**: Yes
- **Pros**:
  - Predictable style precedence: Tailwind utilities always win over MUI base styles
  - No `!important` hacks needed
  - Works with Storybook's CSS loading (same global CSS file)
- **Cons**:
  - Only relevant if MUI is used alongside Tailwind (currently only `@base-ui/react` is in deps)
  - Requires MUI v6+ for `@layer` support
- **Conflicts with**: None
- **Config snippet**:

```css
/* apps/web/src/app/globals.css */
@layer base, mui, components, utilities;
@import "tailwindcss";
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. **Create `apps/storybook`** package with centralized Storybook 10 configuration
2. **Configure `@storybook/nextjs`** framework with Tailwind v4 CSS entry point
3. **Add `storybook:build` and `storybook:dev`** turbo tasks
4. **Install `@storybook/addon-a11y`** for immediate a11y coverage
5. **Install `@storybook/addon-themes`** with dark/light class-based switching
6. **Write first stories** for existing shared components

### Phase 2: Testing (Week 2)
7. **Configure `@storybook/addon-vitest`** and integrate with existing Vitest workspace
8. **Add play functions** to critical component stories
9. **Set up Lost Pixel** GitHub Action for visual regression on PRs
10. **Add Storybook build to CI** (`check.yml` workflow -- which also needs creating per audit)

### Phase 3: Documentation & Polish (Week 3)
11. **Enable autodocs** on all component stories
12. **Configure `react-docgen-typescript`** for cross-package type resolution
13. **Add `@storybook/addon-designs`** for Figma integration (if design team is active)
14. **Evaluate `storybook-design-token`** for Tailwind v4 token documentation

### Phase 4: Scale (Month 2+)
15. **Evaluate Style Dictionary** if multi-brand/multi-platform tokens are needed
16. **Consider Chromatic upgrade** if Lost Pixel's review UI becomes limiting
17. **Add CSF Factories** as they stabilize in Storybook 10.x/11

---

## Sources

- [Storybook 10.0 Release Notes](https://storybook.js.org/releases/10.0)
- [Storybook 9.0 Release Notes](https://storybook.js.org/releases/9.0)
- [Storybook Releases (GitHub)](https://github.com/storybookjs/storybook/releases)
- [Storybook for Next.js (Webpack)](https://storybook.js.org/docs/get-started/frameworks/nextjs)
- [Storybook TypeScript Configuration](https://storybook.js.org/docs/configure/integration/typescript)
- [Storybook Accessibility Testing](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- [Storybook Interaction Testing](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [Storybook Vitest Addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/index)
- [Storybook Autodocs](https://storybook.js.org/docs/writing-docs/autodocs)
- [Storybook Tailwind CSS Recipe](https://storybook.js.org/recipes/tailwindcss)
- [Storybook Material UI Recipe](https://storybook.js.org/recipes/@mui/material)
- [Storybook in Turborepo (Official Guide)](https://turborepo.dev/repo/docs/guides/tools/storybook)
- [Storybook Roadmap](https://storybook.js.org/docs/releases/roadmap)
- [Storybook Bun Monorepo Discussion (Bun)](https://github.com/oven-sh/bun/discussions/12148)
- [Storybook Bun Monorepo Discussion (Storybook)](https://github.com/storybookjs/storybook/discussions/28335)
- [Chromatic Pricing](https://www.chromatic.com/pricing)
- [Chromatic Monorepo Docs](https://www.chromatic.com/docs/monorepos/)
- [Percy Visual Testing](https://percy.io/)
- [Lost Pixel (Official Site)](https://www.lost-pixel.com/)
- [Lost Pixel Pricing](https://www.lost-pixel.com/pricing)
- [Lost Pixel vs Chromatic](https://www.lost-pixel.com/chromatic-vs-lost-pixel)
- [Lost Pixel GitHub](https://github.com/lost-pixel/lost-pixel)
- [Ladle (Official Site)](https://ladle.dev/blog/ladle-v3/)
- [storybook-design-token (GitHub)](https://github.com/UX-and-I/storybook-design-token)
- [@storybook/addon-designs (GitHub)](https://github.com/storybookjs/addon-designs)
- [Style Dictionary Examples](https://styledictionary.com/getting-started/examples/)
- [tokens-studio/sd-tailwindv4](https://github.com/tokens-studio/sd-tailwindv4/)
- [MUI Tailwind CSS v4 Integration](https://mui.com/material-ui/integrations/tailwindcss/tailwindcss-v4/)
- [Next.js Boilerplate (Storybook + Next.js 16 + Tailwind v4)](https://github.com/ixartz/Next-js-Boilerplate)
- [Storybook 9.1 Upgrade Guide](https://medium.com/@roman_fedyskyi/storybook-9-1-upgrade-guide-fb748edc1466)
- [Storybook v9 InfoQ Coverage](https://www.infoq.com/news/2025/07/storybook-v9-released/)
- [Storybook 10 Released (Medium)](https://medium.com/@onix_react/storybook-10-released-c65797d0902a)
- [react-docgen-typescript Turborepo Bug](https://github.com/storybookjs/storybook/issues/31983)
- [Visual Regression Testing Tool Comparison (Bug0)](https://bug0.com/knowledge-base/visual-regression-testing-tools)
