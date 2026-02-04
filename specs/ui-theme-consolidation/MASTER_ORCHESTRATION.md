# Master Orchestration - UI Theme Consolidation

> Complete workflow for merging todox theme into @beep/ui packages.

---

## Overview

This spec consolidates theme configurations from `apps/todox` into `@beep/ui` and `@beep/ui-core` with zero breaking changes. The work is divided into 4 phases, each independently verifiable.

**Conflict Resolution Rule:** When todox and ui-core have conflicting styles, **ui-core wins**. Only add net-new features from todox.

**CSS Variable Rule:** Add both - preserve existing MUI variables, append todox variables.

---

## Phase Dependency Graph

```
P1 (CSS Variables)
    ↓
P2 (MUI Component Styles) ← requires P1 for CSS var references
    ↓
P3 (Theme Configuration) ← requires P2 for component integration
    ↓
P4 (Todox Cleanup) ← requires P1-P3 complete
```

---

## Phase 1: CSS Variables Merge

### Objective
Add todox CSS variables to `packages/ui/ui/src/styles/globals.css` without breaking existing consumers.

### Files
| Role | Path |
|------|------|
| Source | `apps/todox/src/app/globals.css` |
| Target | `packages/ui/ui/src/styles/globals.css` |

### Work Items

#### 1.1 Add Shadcn/ui Color Variables
Add under new section `/* Shadcn/ui Color System */`:

```css
/* Light mode */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: /* from todox */;
  --primary-foreground: /* from todox */;
  --secondary: /* from todox */;
  --secondary-foreground: /* from todox */;
  --muted: /* from todox */;
  --muted-foreground: /* from todox */;
  --accent: /* from todox */;
  --accent-foreground: /* from todox */;
  --destructive: /* from todox */;
  --destructive-foreground: /* from todox */;
  --border: /* from todox */;
  --input: /* from todox */;
  --ring: /* from todox */;
  --chart-1: /* from todox */;
  --chart-2: /* from todox */;
  --chart-3: /* from todox */;
  --chart-4: /* from todox */;
  --chart-5: /* from todox */;
}

/* Dark mode */
.dark {
  /* Dark variants from todox */
}
```

#### 1.2 Add Border Radius System
```css
--radius: 0.875rem;
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
--radius-2xl: calc(var(--radius) + 8px);
--radius-3xl: calc(var(--radius) + 16px);
--radius-4xl: calc(var(--radius) + 24px);
```

#### 1.3 Add Resizable Panel Styles
Copy lines 148-185 from todox globals.css (react-resizable-panels v4 styling).

#### 1.4 Add Scrollbar Utility
```css
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
```

### Verification
```bash
bun run check --filter @beep/ui
bun run build --filter @beep/ui
bun run check --filter @beep/todox
```

### Success Criteria
- [ ] All todox CSS variables added
- [ ] Existing MUI variables unchanged
- [ ] `bun run check` passes for @beep/ui
- [ ] `bun run check` passes for @beep/todox

---

## Phase 2: MUI Component Styles Merge

### Objective
Merge todox-unique component styles into `@beep/ui-core` and review overlapping components for net-new features.

### Files
| Role | Path |
|------|------|
| Source | `apps/todox/src/theme/components/*.ts` |
| Target | `packages/ui/core/src/theme/core/components/*.tsx` |

### Work Items

#### 2.1 Add Todox-Unique Components

**controls.tsx** - Custom radio/checkbox/switch controls
- Add to `packages/ui/core/src/theme/core/components/controls.tsx`
- Convert from .ts to .tsx if using JSX
- Update barrel export in `packages/ui/core/src/theme/core/components/index.ts`

**layout.ts** - Custom layout configuration
- Add to `packages/ui/core/src/theme/core/components/layout.tsx`
- Update barrel export

#### 2.2 Review Overlapping Components

For each of the 18 overlapping components, compare implementations and add ONLY net-new features from todox:

| Component | Review Focus |
|-----------|--------------|
| button | todox has `color-mix` ripple, scale transform on active |
| text-field | Compare input styling |
| dialog | todox has centering fix |
| card | Compare elevation handling |
| ... | See `outputs/INVENTORY.md` section 2 for full list |

**Decision Framework:**
1. Read both implementations
2. Identify features in todox NOT in ui-core
3. If feature is additive (doesn't change existing behavior), add it
4. If feature conflicts with ui-core, skip (ui-core wins)

#### 2.3 Update Component Index

Ensure `packages/ui/core/src/theme/core/components/index.ts` exports all components including new ones.

### Verification
```bash
bun run check --filter @beep/ui-core
bun run build --filter @beep/ui-core
```

### Success Criteria
- [ ] `controls.tsx` added to ui-core
- [ ] `layout.tsx` added to ui-core
- [ ] Overlapping components reviewed
- [ ] Net-new features merged
- [ ] Component index updated
- [ ] `bun run check` passes

---

## Phase 3: Theme Configuration Merge

### Objective
Merge todox palette additions, type augmentations, and configuration into `@beep/ui-core`.

### Files
| Role | Path |
|------|------|
| Augmentation Target | `packages/ui/core/src/theme/extend-theme-types.ts` |
| Palette Target | `packages/ui/core/src/theme/core/palette.ts` |
| Colors Source | `apps/todox/src/theme/colors.ts` |

### Work Items

#### 3.1 Add Type Augmentations

Add to `extend-theme-types.ts`:

```typescript
declare module "@mui/material/styles" {
  interface TypeText {
    icon?: string;      // NEW from todox
    tertiary?: string;  // NEW from todox
  }

  interface PaletteColor {
    text?: string;      // Optional text color override
  }

  interface SimplePaletteColorOptions {
    text?: string;      // Optional text color override
  }
}
```

#### 3.2 Add iOS-Inspired Colors (Optional)

If todox uses iOS system colors, add as optional palette extension:

```typescript
// In palette.ts or colors.ts
export const iosColors = {
  systemGray: "#E5E5EA",
  systemGreen: "#34C759",
  systemRed: "#FF3C3C",
  // ... etc
};
```

#### 3.3 Review Typography Differences

Compare `apps/todox/src/theme/typography.ts` with `packages/ui/core/src/theme/core/typography.ts`.
Add any net-new typography scales or variants.

#### 3.4 Review Shadow Differences

Compare `apps/todox/src/theme/shadows.ts` with `packages/ui/core/src/theme/core/shadows.ts`.
Merge if todox has additional shadow definitions.

### Verification
```bash
bun run check --filter @beep/ui-core
bun run check --filter @beep/ui
bun run check --filter @beep/todox
```

### Success Criteria
- [ ] Type augmentations added (icon, tertiary)
- [ ] No type errors in downstream packages
- [ ] Typography reviewed and merged
- [ ] Shadows reviewed and merged
- [ ] `bun run check` passes for all three packages

---

## Phase 4: Todox Cleanup

### Objective
Remove duplicate configurations from todox, update imports to use shared packages.

### Files to Modify/Remove

| Action | Path |
|--------|------|
| REMOVE | `apps/todox/src/theme/components/` (all files) |
| MODIFY | `apps/todox/src/theme/theme.tsx` (simplify) |
| MODIFY | `apps/todox/src/theme/index.ts` (update exports) |
| MODIFY | `apps/todox/src/app/globals.css` (import from @beep/ui) |
| MODIFY | `apps/todox/src/global-providers.tsx` (remove themeOverrides) |

### Work Items

#### 4.1 Remove Todox Component Overrides

Delete `apps/todox/src/theme/components/` directory entirely.
All component styles now come from `@beep/ui-core`.

#### 4.2 Simplify theme.tsx

The todox theme file should become minimal:

```typescript
// apps/todox/src/theme/theme.tsx
export { createTheme } from "@beep/ui-core/theme";

// If any app-specific overrides remain, export them
export const themeOverrides = {}; // Empty or minimal
```

#### 4.3 Update globals.css

Option A - Import from @beep/ui:
```css
@import "@beep/ui/styles/globals.css";

/* App-specific additions only */
```

Option B - Keep minimal local file:
```css
@import "@beep/ui/styles/globals.css";

/* Todox-specific overrides that don't belong in shared package */
```

#### 4.4 Update ThemeProvider Usage

In `apps/todox/src/global-providers.tsx`:
```typescript
<ThemeProvider
  // Remove themeOverrides if empty
  modeStorageKey={themeConfig.modeStorageKey}
  defaultMode={themeConfig.defaultMode}
>
```

#### 4.5 Update Component Imports

Search for any remaining imports from `@beep/todox/theme/components` and update to use `@beep/ui-core` or `@beep/ui`.

### Verification
```bash
# Full monorepo check
bun run check

# Build verification
bun run build --filter @beep/todox
bun run dev --filter @beep/todox  # Visual verification
```

### Success Criteria
- [ ] `apps/todox/src/theme/components/` removed
- [ ] `theme.tsx` simplified
- [ ] `globals.css` imports from @beep/ui
- [ ] `themeOverrides` empty or removed
- [ ] No broken imports
- [ ] `bun run check` passes
- [ ] App renders correctly (visual check)

---

## Agent Delegation Guide

### Agent Capability Reference

See `.claude/agents-manifest.yaml` for complete agent definitions and capabilities.

Key capability types:

| Capability | Agents | Output |
|------------|--------|--------|
| **read-only** | `codebase-researcher`, `mcp-researcher` | Informs orchestrator only |
| **write-reports** | `code-reviewer`, `architecture-pattern-enforcer` | Markdown in `outputs/` |
| **write-files** | `effect-code-writer`, `test-writer`, `doc-writer` | Source file modifications |

### Recommended Agent Types by Task

| Task Type | Agent | Capability | Reason |
|-----------|-------|------------|--------|
| CSS variable merging | `effect-code-writer` | write-files | File modification with validation |
| Component style review | `codebase-researcher` | read-only | Read-only comparison |
| Type augmentation | `effect-code-writer` | write-files | TypeScript modification |
| Import updates | `package-error-fixer` | write-files | Systematic error fixing |
| Full verification | `Bash` | N/A | Run check/build commands |

### Delegation Triggers (MANDATORY)

Delegate to specialized agents when ANY of these conditions are met:

| Trigger | Threshold | Delegate To |
|---------|-----------|-------------|
| Files to read | >3 files | `codebase-researcher` |
| Sequential tool calls | >5 calls | `effect-code-writer` |
| Component comparison | >5 components | `codebase-researcher` |
| Error fixing | Any type errors | `package-error-fixer` |
| Source code modification | Any .ts/.tsx edits | `effect-code-writer` |

**Phase-Specific Triggers:**

- **P1**: If CSS file >500 lines, delegate variable insertion to `effect-code-writer`
- **P2**: If comparing >5 overlapping components, delegate to `codebase-researcher` first for analysis
- **P3**: Delegate all type augmentation edits to `effect-code-writer` (TypeScript complexity)
- **P4**: If >10 imports need updating, delegate to `package-error-fixer`

### Orchestrator Allowed Actions

Orchestrators MAY directly:

1. **Read files directly** for small comparisons (3 files or fewer)
2. **Run verification commands** via Bash
3. **Synthesize agent outputs** into handoff documents
4. **Create handoff documents** at phase completion

Orchestrators MUST NOT:

1. Edit source files directly (delegate to agents)
2. Perform sequential file exploration >5 calls
3. Fix type errors manually (delegate to `package-error-fixer`)

---

## Rollback Strategy

If issues arise:
1. Type errors in downstream packages → Revert type augmentation changes
2. Visual regressions → CSS variable additions are additive, so safe
3. Build failures → Check component barrel exports

All changes are additive (except P4 cleanup), so rollback is straightforward.

---

## References

- Inventory: `outputs/INVENTORY.md`
- Quick Start: `QUICK_START.md`
- Phase Handoffs: `handoffs/HANDOFF_P[N].md`
- Orchestrator Prompts: `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`
