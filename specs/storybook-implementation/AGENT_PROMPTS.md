# Agent Prompts

> Copy-paste ready prompts for sub-agent delegation. Each prompt is designed to produce focused, compressed output.

---

## Phase 1: Research

### codebase-researcher-p1

```
Analyze the @beep/ui and @beep/ui-editor packages for Storybook implementation.

RESEARCH FOCUS:
1. Package structure and export paths
2. Theme integration with @beep/ui-core
3. Existing build configuration (Vite, TypeScript, Babel)
4. CSS/styling approach (Tailwind, MUI, shadcn)
5. Peer dependencies that affect Storybook

OUTPUT REQUIREMENTS:
- Write findings to specs/storybook-implementation/outputs/codebase-context.md
- Maximum 500 lines
- Use bullet points, not prose
- Include file paths for key configurations
- List all component directories with component counts

KEY FILES TO EXAMINE:
- packages/ui/ui/package.json
- packages/ui/ui/components.json
- packages/ui/ui/src/styles/globals.css
- packages/ui/editor/package.json
- packages/ui/core/src/theme/create-theme.ts
- packages/ui/core/src/settings/

DO NOT include code samples. Reference file paths instead.
```

### web-researcher-p1

```
Research Storybook 8.x integration patterns for:
1. MUI (Material UI) v7 with CSS theme variables
2. Tailwind CSS v4
3. shadcn/ui components
4. Next.js 16 App Router
5. Monorepo workspace configuration
6. Light/dark theme switching

OUTPUT REQUIREMENTS:
- Write findings to specs/storybook-implementation/outputs/external-research.md
- Maximum 300 lines
- Focus on configuration patterns, not tutorials
- Include addon recommendations with justification
- Note compatibility issues or gotchas

SPECIFIC QUESTIONS:
- How to configure Storybook Vite builder with Tailwind CSS v4?
- How to wrap stories with MUI ThemeProvider?
- How to implement theme switching via Storybook toolbar?
- What addons are essential for component documentation?
- How to handle CSS variables from a shared theme package?

Sources to prioritize:
- storybook.js.org documentation
- GitHub issues for Storybook + MUI integration
- Tailwind CSS v4 migration guides
```

### component-inventory

```
Create a comprehensive inventory of components in @beep/ui and @beep/ui-editor.

OUTPUT REQUIREMENTS:
- Write to specs/storybook-implementation/outputs/component-inventory.md
- Organize by package and directory
- Include component name, file path, and export status
- Flag components that are complex (>200 lines) or have many variants
- Note components with external dependencies (Lexical, MUI X, etc.)

FORMAT:
## @beep/ui

### atoms/
| Component | Path | Lines | Variants | Dependencies |
|-----------|------|-------|----------|--------------|
| Button | atoms/button.tsx | 85 | 4 | shadcn |

### molecules/
...

## @beep/ui-editor

### nodes/
...

PRIORITY: Components that are most likely to be reused and need documentation.
```

---

## Phase 2: Design

### architecture-p2

```
Design the Storybook architecture for @beep/ui and @beep/ui-editor.

INPUTS (read from outputs/):
- codebase-context.md
- external-research.md
- component-inventory.md

DESIGN DECISIONS NEEDED:
1. Single Storybook instance vs per-package
2. Storybook location (root, package, or dedicated workspace)
3. Story file co-location vs separate directory
4. Build tool configuration (Vite settings)
5. TypeScript configuration approach
6. CSS processing pipeline

OUTPUT REQUIREMENTS:
- Write to specs/storybook-implementation/outputs/architecture-design.md
- Maximum 400 lines
- Include decision rationale for each choice
- Provide directory structure diagram
- List configuration files needed

CONSTRAINTS:
- Must work with bun as package manager
- Must support monorepo workspace resolution
- Must integrate with existing turbo.json pipeline
- Must not break existing build processes
```

### addon-selection

```
Select and document Storybook addons for the implementation.

REQUIRED ADDONS (justify each):
- Core documentation (@storybook/addon-docs)
- Controls and args (@storybook/addon-controls)
- Theme switching (@storybook/addon-themes)
- Accessibility (@storybook/addon-a11y)
- Viewport/responsive (@storybook/addon-viewport)

OPTIONAL ADDONS (evaluate):
- @storybook/addon-interactions
- @storybook/addon-links
- @storybook/addon-measure
- @storybook/addon-outline
- storybook-addon-pseudo-states

OUTPUT REQUIREMENTS:
- Write to specs/storybook-implementation/outputs/addon-selection.md
- Include version compatibility notes
- Document configuration for each addon
- Estimate bundle size impact
- Note any peer dependency conflicts
```

### theme-integration-plan

```
Plan the integration of @beep/ui-core theme system with Storybook.

THEME SYSTEM FEATURES:
- createTheme from @beep/ui-core/theme
- Light/dark mode via SettingsState
- Primary color presets
- CSS variables (cssVariables: true)
- RTL support via Rtl component
- Typography scale
- MUI component overrides

INTEGRATION REQUIREMENTS:
1. Theme decorator that wraps all stories
2. Toolbar toggle for light/dark mode
3. Color preset selector (if feasible)
4. Proper Emotion cache setup
5. Tailwind CSS variable synchronization

OUTPUT REQUIREMENTS:
- Write to specs/storybook-implementation/outputs/theme-integration-plan.md
- Include pseudo-code for theme decorator
- Document CSS variable mapping
- Explain how MUI and Tailwind coexist
- List potential styling conflicts

REFERENCE FILES:
- packages/ui/core/src/theme/create-theme.ts
- packages/ui/core/src/settings/settings-config.ts
- packages/ui/ui/src/theme/theme-provider.tsx
```

---

## Phase 3: Planning

### implementation-plan

```
Create a detailed implementation plan with ordered tasks.

INPUTS (read from outputs/):
- architecture-design.md
- addon-selection.md
- theme-integration-plan.md

PLAN REQUIREMENTS:
- Maximum 7 tasks per sub-phase
- Each task must have:
  - Clear description
  - Files to create/modify
  - Estimated complexity (S/M/L)
  - Verification command
  - Dependencies on other tasks

SUB-PHASES:
- P4a: Foundation Setup (Storybook config, theme decorator)
- P4b: Package Stories (@beep/ui stories)
- P4c: Editor Stories (@beep/ui-editor stories)
- P4d: Theme Integration (light/dark mode, CSS)

OUTPUT REQUIREMENTS:
- Write to specs/storybook-implementation/outputs/implementation-plan.md
- Use task numbering (4a.1, 4a.2, etc.)
- Include rollback strategy for each task
- Document verification commands
```

### directory-structure

```
Document the target directory structure for Storybook implementation.

OUTPUT REQUIREMENTS:
- Write to specs/storybook-implementation/outputs/directory-structure.md
- Show tree diagram of new files
- Indicate which files are created vs modified
- Group by sub-phase

EXAMPLE FORMAT:
```
## Sub-Phase 4a: Foundation

packages/ui/storybook/           # NEW directory
├── .storybook/
│   ├── main.ts                  # NEW - Storybook config
│   ├── preview.tsx              # NEW - Global decorators
│   └── decorators/
│       └── theme-decorator.tsx  # NEW - Theme wrapper
├── package.json                 # NEW - Storybook deps
└── tsconfig.json                # NEW - TS config

## Sub-Phase 4b: @beep/ui Stories

packages/ui/ui/src/
├── atoms/
│   ├── button.tsx               # EXISTING
│   └── button.stories.tsx       # NEW
...
```

Include rationale for co-location vs separate directory decisions.
```

### rubric-generation

```
Generate evaluation rubrics for Storybook implementation quality.

OUTPUT REQUIREMENTS:
- Update specs/storybook-implementation/RUBRICS.md
- Create rubrics for:
  1. Configuration Quality (0-20 points)
  2. Story Coverage (0-25 points)
  3. Theme Integration (0-20 points)
  4. Documentation Quality (0-15 points)
  5. Accessibility Compliance (0-10 points)
  6. Performance (0-10 points)

RUBRIC FORMAT:
## Category: [Name] (X points)

| Score | Criteria |
|-------|----------|
| 0 | [Failure state] |
| 5 | [Minimum viable] |
| 10 | [Good] |
| X | [Excellent] |

### Checklist
- [ ] Specific item 1
- [ ] Specific item 2
```

---

## Phase 4: Implementation

### storybook-config

```
Create Storybook configuration files for the monorepo.

LOCATION: packages/ui/storybook/ (or as specified in architecture-design.md)

FILES TO CREATE:
1. .storybook/main.ts
   - Vite builder configuration
   - Story glob patterns for @beep/ui and @beep/ui-editor
   - Addon registration
   - TypeScript support
   - Static file serving

2. .storybook/preview.tsx
   - Global decorators
   - Parameters for viewport, backgrounds
   - Theme configuration

3. package.json
   - Storybook dependencies
   - Scripts: storybook, build-storybook

4. tsconfig.json
   - Extends from root tsconfig.base.jsonc
   - Path alias support

CRITICAL PATTERNS:
- Use workspace:^ for internal dependencies
- Configure @beep/* path aliases
- Import globals.css from @beep/ui
- Handle React 19 compatibility

Verify: `bun run storybook` starts without errors
```

### theme-decorator

```
Create the theme decorator for Storybook.

REQUIREMENTS:
1. Wrap stories with MUI ThemeProvider
2. Support light/dark mode switching
3. Use createTheme from @beep/ui-core
4. Include Emotion cache setup
5. Apply Tailwind CSS classes

FILE: .storybook/decorators/theme-decorator.tsx

IMPLEMENTATION APPROACH:
- Use @storybook/addon-themes for mode switching
- Create decorator that reads theme from Storybook globals
- Apply CSS variables from @beep/ui-core
- Handle Rtl component if direction switching needed

REFERENCE:
- packages/ui/ui/src/theme/theme-provider.tsx
- packages/ui/core/src/theme/create-theme.ts

Verify: Toggle between light/dark mode in Storybook toolbar
```

### ui-stories

```
Create stories for @beep/ui components.

PRIORITY COMPONENTS (create first):
1. atoms/button
2. atoms/avatar
3. inputs/text-field
4. inputs/select
5. form/form-field
6. components/dialog
7. components/dropdown-menu
8. data-display/table
9. layouts/card
10. messages/alert

STORY REQUIREMENTS:
- Default story showing basic usage
- Variants story showing all visual variants
- Sizes story if component has size props
- States story (disabled, loading, error)
- Args/controls for interactive props

STORY FORMAT:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@beep/ui/atoms/button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};
```

Verify: Stories render without console errors
```

### editor-stories

```
Create stories for @beep/ui-editor components.

PRIORITY COMPONENTS:
1. Editor (main editor component)
2. Toolbar
3. FloatingMenu
4. Key editor plugins (if exportable)

CHALLENGES:
- Lexical requires initialization context
- Some components may be internal-only
- Editor state management in stories

STORY REQUIREMENTS:
- Mock Lexical editor context if needed
- Show editor in isolation
- Demonstrate key features
- Document integration patterns

NOTE: Focus on exportable, reusable components. Skip internal implementation details.

Verify: Editor stories render with basic typing functionality
```

### theme-toggle

```
Implement light/dark mode toggle in Storybook.

REQUIREMENTS:
1. Add theme toggle to Storybook toolbar
2. Sync theme with @beep/ui-core settings
3. Persist theme selection
4. Update all CSS variables on toggle

IMPLEMENTATION:
- Configure @storybook/addon-themes
- Create withTheme decorator
- Map Storybook theme to SettingsState.mode
- Apply theme class to document root

FILES:
- .storybook/preview.tsx (add theme configuration)
- .storybook/decorators/theme-decorator.tsx (update)

Verify: Clicking toolbar toggle switches all component themes
```

### css-integration

```
Configure CSS processing for Storybook.

REQUIREMENTS:
1. Process Tailwind CSS
2. Load @beep/ui/globals.css
3. Handle MUI Emotion styles
4. Support CSS variables from @beep/ui-core

VITE CONFIGURATION:
- Add postcss-loader for Tailwind
- Configure CSS module handling
- Set up static asset serving

FILES TO MODIFY:
- .storybook/main.ts (Vite config)
- .storybook/preview.tsx (CSS imports)

POTENTIAL ISSUES:
- Tailwind purge may miss dynamic classes
- MUI styles may conflict with Tailwind reset
- CSS variable naming collisions

Verify: Components styled correctly in both themes
```

---

## Phase 5: Verification

### code-review-p5

```
Review the Storybook implementation for quality and best practices.

REVIEW CHECKLIST:
1. Configuration files follow Storybook 8.x patterns
2. Stories follow CSF 3.0 format
3. Theme integration is complete
4. No console errors or warnings
5. Accessibility attributes present
6. Performance acceptable (lighthouse check)

SPECIFIC CHECKS:
- All exports from packages have stories
- Args/controls documented
- Default stories render correctly
- Theme switching works
- No hardcoded styles that break theming

OUTPUT REQUIREMENTS:
- Write to specs/storybook-implementation/outputs/code-review.md
- Categorize issues by severity (high/medium/low)
- Include file paths for each issue
- Suggest fixes for high-severity issues
```

### story-tests

```
Create interaction tests for critical stories.

PRIORITY TESTS:
1. Button click triggers action
2. Form inputs accept values
3. Dialog opens and closes
4. Theme toggle changes styles
5. Editor accepts text input

TEST FORMAT:
Use @storybook/addon-interactions with play functions.

```tsx
export const ClickTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    await expect(button).toHaveTextContent("Clicked");
  },
};
```

Verify: `bun run test-storybook` passes
```

### ci-documentation

```
Document CI/CD integration for Storybook.

OUTPUT REQUIREMENTS:
- Write to specs/storybook-implementation/outputs/ci-integration.md

SECTIONS:
1. Build Commands
   - Development: bun run storybook
   - Production: bun run build-storybook

2. GitHub Actions Workflow
   - Build static Storybook
   - Run Chromatic or similar
   - Publish to GitHub Pages (optional)

3. Turborepo Integration
   - Add to turbo.json pipeline
   - Cache configuration
   - Dependencies

4. Visual Regression Testing
   - Options: Chromatic, Percy, Loki
   - Baseline establishment
   - PR workflow

Include example YAML for GitHub Actions.
```
