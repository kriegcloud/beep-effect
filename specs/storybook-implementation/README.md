# Storybook Implementation Spec

**Status**: NOT STARTED | **Complexity**: CRITICAL (69 points)

> Implement Storybook for `@beep/ui` and `@beep/ui-editor` packages with MUI + Tailwind/shadcn support, theme integration from `@beep/ui-core`, and light/dark mode.

---

## Critical: Orchestrator Role

**YOU ARE AN ORCHESTRATOR, NOT AN IMPLEMENTER.**

- NEVER read source files directly (delegate to `codebase-researcher`)
- NEVER write code (delegate to `effect-code-writer`)
- NEVER run tests (delegate to `test-writer`)
- NEVER debug errors (delegate to `package-error-fixer`)
- NEVER search documentation (delegate to `web-researcher` or `mcp-researcher`)

**You ONLY:**
1. Launch sub-agents with clear prompts
2. Read compressed summaries from `outputs/`
3. Synthesize findings into decisions
4. Create handoff documents
5. Track progress in REFLECTION_LOG.md

---

## Quick Summary

| Metric | Target |
|--------|--------|
| **Packages** | `@beep/ui`, `@beep/ui-editor` |
| **Theme Source** | `@beep/ui-core` |
| **UI Libraries** | MUI + Tailwind/shadcn |
| **Theme Modes** | Light + Dark |
| **Reference Apps** | `apps/todox`, `apps/web` |

---

## Success Criteria

### Quantitative Targets

| Metric | Target | Verification Command |
|--------|--------|---------------------|
| Story files created | ≥20 total | `find packages/ui -name "*.stories.tsx" \| wc -l` |
| @beep/ui stories | ≥15 files | `find packages/ui/ui -name "*.stories.tsx" \| wc -l` |
| @beep/ui-editor stories | ≥5 files | `find packages/ui/editor -name "*.stories.tsx" \| wc -l` |
| Console errors on load | 0 | Browser DevTools console |
| TypeScript errors | 0 | `bun run check --filter=storybook` |
| Storybook build time | <120 seconds | `time bun run build-storybook` |
| A11y violations (critical) | 0 | Storybook a11y addon panel |

### Phase 1: Research (Measurable)
- [ ] `outputs/codebase-context.md` exists (≤500 lines)
- [ ] `outputs/external-research.md` exists (≤300 lines)
- [ ] `outputs/component-inventory.md` lists ≥50 components with export status
- [ ] All 3 files pass `wc -l < threshold` check

### Phase 2: Design (Measurable)
- [ ] `outputs/architecture-design.md` contains ≥5 design decisions with rationale
- [ ] `outputs/addon-selection.md` lists ≥5 addons with version compatibility
- [ ] `outputs/theme-integration-plan.md` addresses CSS variable namespace strategy
- [ ] All design docs reference specific file paths (not generic descriptions)

### Phase 3: Planning (Measurable)
- [ ] `outputs/implementation-plan.md` contains ≤7 tasks per sub-phase
- [ ] `outputs/directory-structure.md` shows ≥10 new files to create
- [ ] Each task has: description, files, complexity (S/M/L), verification command
- [ ] `RUBRICS.md` score thresholds defined (pass: ≥75 points)

### Phase 4: Implementation (Measurable)
- [ ] `bun run storybook` starts in <30 seconds (dev mode)
- [ ] Light/dark mode toggle changes all component backgrounds
- [ ] ≥3 MUI components render with correct theme colors
- [ ] ≥3 shadcn components render with correct theme colors
- [ ] ≥15 stories in @beep/ui, ≥5 stories in @beep/ui-editor

### Phase 5: Verification & Testing (Measurable)
- [ ] `bun run build-storybook` exits with code 0
- [ ] `outputs/verification-report.md` scores ≥75/100 on RUBRICS.md
- [ ] `outputs/ci-integration.md` contains GitHub Actions YAML
- [ ] Zero high-severity issues in `outputs/code-review.md`

---

## Phase Overview

| Phase | Focus | Agents | Sessions |
|-------|-------|--------|----------|
| P1 | Research | `codebase-researcher`, `web-researcher` | 1 |
| P2 | Design | `architecture-pattern-enforcer`, `doc-writer` | 1 |
| P3 | Planning | `doc-writer`, `reflector` | 1 |
| P4 | Implementation | `effect-code-writer`, `package-error-fixer` | 2-3 |
| P5 | Verification | `test-writer`, `code-reviewer` | 1 |

---

## Orchestrator Delegation Protocol

### Mandatory Delegation Matrix

| Task | Delegate To | Output Location |
|------|-------------|-----------------|
| Explore package exports | `codebase-researcher` | `outputs/codebase-context.md` |
| Research Storybook patterns | `web-researcher` | `outputs/external-research.md` |
| Validate architecture | `architecture-pattern-enforcer` | `outputs/architecture-review.md` |
| Write configuration files | `effect-code-writer` | Source files |
| Write stories | `effect-code-writer` | `*.stories.tsx` files |
| Fix errors | `package-error-fixer` | Source files |
| Create documentation | `doc-writer` | `outputs/*.md`, `README.md` |
| Write tests | `test-writer` | `*.test.ts` files |
| Review code quality | `code-reviewer` | `outputs/code-review.md` |

### Context Budget Per Handoff

| Memory Type | Token Budget | Content |
|-------------|--------------|---------|
| Working | ≤2,000 | Current tasks, blockers |
| Episodic | ≤1,000 | Previous phase summaries |
| Semantic | ≤500 | Tech stack constants |
| Total | ≤4,000 | Well under degradation |

---

## Target Packages

### `@beep/ui` (`packages/ui/ui`)
- **Description**: Shared React component library combining MUI, shadcn, and Tailwind
- **Key Exports**: `atoms/*`, `molecules/*`, `organisms/*`, `components/*`, `inputs/*`, `form/*`
- **Theme Integration**: Uses `@beep/ui-core/theme/*` and `@beep/ui-core/settings/*`

### `@beep/ui-editor` (`packages/ui/editor`)
- **Description**: Lexical-based rich text editor components
- **Key Exports**: Editor components, hooks, utilities
- **Dependencies**: `@beep/ui`, `@beep/ui-core`, Lexical packages

### `@beep/ui-core` (`packages/ui/core`) - Theme Source
- **Description**: Design tokens, palette, typography, MUI component overrides
- **Theme System**: `createTheme`, `applySettingsToTheme`, color presets
- **Settings**: Light/dark mode, primary colors, typography, RTL support

---

## Technical Requirements

### Storybook Configuration
- Storybook 8.x with Vite builder
- Next.js 16 compatibility
- Monorepo workspace support
- TypeScript support

### Theme Integration
- `@beep/ui-core` theme provider wrapping
- Light/dark mode toggle via Storybook toolbar
- CSS variables from `@beep/ui-core`
- MUI ThemeProvider integration
- Tailwind CSS processing

### Addon Requirements
- `@storybook/addon-essentials` (docs, controls, actions, viewport)
- `@storybook/addon-themes` (light/dark mode)
- `@storybook/addon-a11y` (accessibility)
- `@storybook/addon-interactions` (testing)

---

## Verification Commands

### Spec Health Check

```bash
# Verify spec structure (should return 10+ files)
find specs/storybook-implementation -type f | wc -l

# Check context budget (must be <4000 tokens)
wc -w specs/storybook-implementation/handoffs/HANDOFF_P1.md | awk '{print $1 * 4 " tokens"}'

# Count reflection entries (should be ≥2)
grep -c "^###" specs/storybook-implementation/REFLECTION_LOG.md
```

### Implementation Verification

```bash
# Start Storybook dev server
bun run storybook --filter=@beep/ui

# Build static Storybook (must exit 0)
bun run build-storybook --filter=@beep/ui

# Count story files created
find packages/ui -name "*.stories.tsx" | wc -l

# Verify TypeScript (must be 0 errors)
bun run check --filter=@beep/ui --filter=@beep/ui-editor

# Verify lint (must be 0 errors)
bun run lint --filter=@beep/ui --filter=@beep/ui-editor
```

### Pass/Fail Thresholds

| Check | Pass | Fail |
|-------|------|------|
| Story file count | ≥20 | <10 |
| TypeScript errors | 0 | >0 |
| Build exit code | 0 | ≠0 |
| Storybook startup | <30s | >60s |
| Console errors | 0 | >0 |
| RUBRICS.md score | ≥75 | <60 |

---

## Reference Files

- **Theme System**: `packages/ui/core/src/theme/create-theme.ts`
- **Settings**: `packages/ui/core/src/settings/`
- **shadcn Config**: `packages/ui/ui/components.json`
- **Tailwind Styles**: `packages/ui/ui/src/styles/globals.css`
- **Reference App Themes**: `apps/todox/src/app/`, `apps/web/src/app/`

---

## Handoff Protocol

Each phase MUST produce TWO files before completion:
1. `handoffs/HANDOFF_P[N+1].md` - Full context document
2. `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` - Copy-paste launch prompt

See [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) for detailed phase workflows.

---

## Related Documentation

- [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) - Full orchestration workflow
- [AGENT_PROMPTS.md](AGENT_PROMPTS.md) - Sub-agent prompt templates
- [RUBRICS.md](RUBRICS.md) - Evaluation criteria
- [specs/_guide/README.md](../_guide/README.md) - Spec creation guide
