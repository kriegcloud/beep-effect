# Evaluation Rubrics

> Scoring criteria for Storybook implementation quality. Maximum score: 100 points.

---

## Summary

| Category | Max Points | Weight |
|----------|------------|--------|
| Configuration Quality | 20 | Critical |
| Story Coverage | 25 | Critical |
| Theme Integration | 20 | High |
| Documentation Quality | 15 | Medium |
| Accessibility Compliance | 10 | Medium |
| Performance | 10 | Low |

**Pass Threshold**: 75 points minimum

---

## Category 1: Configuration Quality (20 points)

Evaluates Storybook configuration correctness and maintainability.

| Score | Criteria |
|-------|----------|
| 0-4 | Configuration missing or broken; Storybook won't start |
| 5-9 | Basic config works but missing essential features |
| 10-14 | Complete config with minor issues or non-standard patterns |
| 15-17 | Clean, documented configuration following best practices |
| 18-20 | Exemplary config with optimization, caching, and comprehensive setup |

### Checklist

- [ ] `.storybook/main.ts` uses Vite builder correctly
- [ ] Story glob patterns match both `@beep/ui` and `@beep/ui-editor`
- [ ] All required addons registered and configured
- [ ] TypeScript configuration extends monorepo base
- [ ] Path aliases (`@beep/*`) resolve correctly
- [ ] Static assets served properly
- [ ] `bun run storybook` starts in <30 seconds
- [ ] No console warnings during startup

---

## Category 2: Story Coverage (25 points)

Evaluates breadth and depth of component documentation via stories.

| Score | Criteria |
|-------|----------|
| 0-5 | <20% of exportable components have stories |
| 6-10 | 20-40% coverage with basic default stories only |
| 11-15 | 40-60% coverage with variants and states |
| 16-20 | 60-80% coverage with comprehensive documentation |
| 21-25 | >80% coverage with interactive examples and edge cases |

### Checklist

#### @beep/ui Package
- [ ] atoms/* - All components have stories
- [ ] molecules/* - All components have stories
- [ ] organisms/* - Key components have stories
- [ ] inputs/* - All form inputs have stories
- [ ] form/* - Form patterns documented
- [ ] components/* - UI primitives covered

#### @beep/ui-editor Package
- [ ] Main Editor component has story
- [ ] Toolbar has story with controls
- [ ] Exportable nodes/plugins documented

#### Story Quality
- [ ] Each story has meaningful title hierarchy
- [ ] Variants displayed using separate stories or controls
- [ ] States (disabled, loading, error) demonstrated
- [ ] Props documented via argTypes
- [ ] `autodocs` tag enabled for auto-documentation

---

## Category 3: Theme Integration (20 points)

Evaluates correct integration with `@beep/ui-core` theme system.

| Score | Criteria |
|-------|----------|
| 0-4 | No theme integration; components unstyled |
| 5-9 | Basic theme applied but mode switching broken |
| 10-14 | Light/dark mode works with minor visual issues |
| 15-17 | Complete theme integration with CSS variables |
| 18-20 | Perfect theme parity with production apps (todox, web) |

### Checklist

- [ ] Theme decorator wraps all stories
- [ ] Light/dark toggle in Storybook toolbar
- [ ] Toggle affects all components immediately
- [ ] MUI ThemeProvider configured correctly
- [ ] Emotion cache set up (especially for SSR components)
- [ ] CSS variables from `@beep/ui-core` applied
- [ ] Tailwind classes render with correct colors
- [ ] Typography matches design system
- [ ] Primary color preset visible in themed components
- [ ] No style conflicts between MUI and Tailwind

---

## Category 4: Documentation Quality (15 points)

Evaluates usefulness of generated documentation.

| Score | Criteria |
|-------|----------|
| 0-3 | No documentation; stories are code-only |
| 4-6 | Basic autodocs with minimal descriptions |
| 7-10 | Good component descriptions with prop tables |
| 11-13 | Comprehensive docs with usage examples |
| 14-15 | Production-ready docs with guidelines and patterns |

### Checklist

- [ ] Each component has description in meta
- [ ] argTypes provide meaningful control labels
- [ ] Complex props have JSDoc comments
- [ ] Usage patterns explained in Docs tab
- [ ] Related components linked
- [ ] Known limitations documented
- [ ] Integration examples for common use cases

---

## Category 5: Accessibility Compliance (10 points)

Evaluates accessibility of components in Storybook.

| Score | Criteria |
|-------|----------|
| 0-2 | @storybook/addon-a11y not configured |
| 3-5 | Addon configured but many violations |
| 6-7 | Most components pass basic a11y checks |
| 8-9 | All components pass with minor warnings |
| 10 | Full WCAG 2.1 AA compliance verified |

### Checklist

- [ ] @storybook/addon-a11y installed and configured
- [ ] Accessibility tab visible in addon panel
- [ ] No critical violations in core components
- [ ] Color contrast passes in both themes
- [ ] Interactive elements keyboard accessible
- [ ] ARIA labels present where needed
- [ ] Focus states visible

---

## Category 6: Performance (10 points)

Evaluates Storybook build and runtime performance.

| Score | Criteria |
|-------|----------|
| 0-2 | Build fails or takes >5 minutes |
| 3-5 | Build succeeds but slow (2-5 minutes) |
| 6-7 | Reasonable build time (<2 minutes) |
| 8-9 | Fast build with lazy loading |
| 10 | Optimized build with caching and code splitting |

### Checklist

- [ ] `bun run build-storybook` completes successfully
- [ ] Build time <2 minutes for full rebuild
- [ ] Lazy loading enabled for large stories
- [ ] Bundle size reasonable (<50MB static output)
- [ ] Hot reload works during development
- [ ] No memory leaks during extended sessions
- [ ] Turbo caching configured for incremental builds

---

## Scoring Guide

### How to Score

1. Complete all checklists for each category
2. Count checked items as percentage
3. Map percentage to score range
4. Sum all category scores

### Score Interpretation

| Total Score | Status | Action |
|-------------|--------|--------|
| 90-100 | Excellent | Ready for production |
| 75-89 | Good | Minor improvements needed |
| 60-74 | Acceptable | Address high-priority gaps |
| 40-59 | Needs Work | Major remediation required |
| 0-39 | Failed | Restart implementation |

---

## Verification Commands

```bash
# Start Storybook
bun run storybook --filter=@beep/ui

# Build static Storybook
bun run build-storybook --filter=@beep/ui

# Run a11y checks (if test-storybook configured)
bun run test-storybook --filter=@beep/ui

# Check theme integration manually
# 1. Open Storybook
# 2. Click theme toggle
# 3. Verify all components update
```

---

## Phase-Specific Thresholds

| Phase | Minimum Score | Focus Areas |
|-------|---------------|-------------|
| P4a Complete | 20 | Configuration (20 pts) |
| P4b Complete | 45 | + Story Coverage (25 pts) |
| P4c Complete | 55 | + Editor Stories (10 pts) |
| P4d Complete | 75 | + Theme (20 pts) |
| P5 Complete | 85+ | + Docs, A11y, Perf |
