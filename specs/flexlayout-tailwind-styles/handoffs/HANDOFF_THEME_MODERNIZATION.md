# Handoff: FlexLayout Theme Modernization

> **Date**: 2026-01-11
> **Status**: APPROVED FOR IMPLEMENTATION - User said "yeah please do"
> **Priority**: High - User explicitly wants this done

---

## Context

The user explored the main app route (`/`) and the FlexLayout demo route (`/demo`) to understand the design system differences. After documenting these in `outputs/theme-alignment-plan.md` and running the reflector agent, the user identified the core issue:

**The FlexLayout demo looks "Windows-like"** - dated, boxy, cramped, with hard borders and no accent colors.

The user wants it to feel modern and match the main app's design language.

---

## What Makes It "Windows-Like" (Problems to Fix)

1. **Hard 1px borders everywhere** - Creates a harsh, segmented look
2. **Boxy tabs with no rounded corners** - Like Windows 95 tabs
3. **Minimal padding (3px)** - Everything feels cramped
4. **Gray-on-gray with no accent colors** - No visual hierarchy or brand identity
5. **Heavy visible splitters** - Draws attention to dividers instead of content

---

## Approved CSS Changes

The user approved implementing these changes to `apps/todox/src/app/demo/flexlayout.css`:

### 1. Tabs - From Boxy to Pill-like

```css
.flexlayout__tab_button {
  border-radius: 6px;
  padding: 6px 12px;  /* Was: 3px 0.5em */
  gap: 8px;
}

.dark .flexlayout__tab_button--selected {
  background-color: oklch(0.70 0.15 195 / 0.15);  /* Teal accent from main app */
}
```

### 2. Borders - From Hard Lines to Subtle

```css
.flexlayout__tabset_tabbar_outer_top {
  border-bottom: none;
  box-shadow: inset 0 -1px 0 oklch(0.30 0 0 / 0.3);
}
```

### 3. Splitters - Invisible Until Hover

```css
.dark .flexlayout__splitter {
  background-color: transparent;
}

.dark .flexlayout__splitter:hover {
  background-color: oklch(0.70 0.15 195 / 0.3);  /* Teal accent on hover */
}
```

### 4. More Breathing Room

```css
.flexlayout__tabset_tabbar_outer {
  padding: 4px 8px;
}
```

### 5. Add Accent Color CSS Variables

```css
.dark .flexlayout__layout {
  --color-accent: oklch(0.70 0.15 195);
  --color-accent-muted: oklch(0.70 0.15 195 / 0.15);
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/todox/src/app/demo/flexlayout.css` | **PRIMARY TARGET** - Core FlexLayout styling (927 lines) |
| `apps/todox/src/app/demo/_lib/styles.css` | Demo toolbar/table styles (may need updates too) |
| `apps/todox/src/app/demo/_lib/App.tsx` | Demo React component |
| `specs/flexlayout-tailwind-styles/outputs/theme-alignment-plan.md` | Full design analysis |
| `specs/flexlayout-tailwind-styles/REFLECTION_LOG.md` | Reflector findings |

---

## Color Reference (from globals.css)

| Purpose | Dark Mode Value |
|---------|-----------------|
| Background | `oklch(0.13 0.004 285.885)` |
| Card/Surface | `oklch(0.21 0.006 285.885)` |
| **Primary Accent (teal)** | `oklch(0.70 0.15 162)` |
| Text | `oklch(0.985 0 0)` |
| Border | `oklch(1 0 0 / 10%)` |

**Note**: The theme plan used hue 195 for teal, but globals.css uses 162. Consider using 162 for consistency, or stick with 195 if the visual is preferred.

---

## Screenshots Reference

| File | Description |
|------|-------------|
| `.playwright-mcp/main-route-initial.png` | Main app design reference |
| `.playwright-mcp/demo-dark-theme.png` | Current demo dark theme |
| `.playwright-mcp/demo-light-theme.png` | Current demo light theme |

---

## Implementation Approach

1. **Read** `apps/todox/src/app/demo/flexlayout.css` to find exact line numbers
2. **Update tabs** - Find `.flexlayout__tab_button` and add border-radius, increase padding
3. **Update selected state** - Find `.flexlayout__tab_button--selected` and add accent background
4. **Update splitters** - Find `.flexlayout__splitter` and make transparent with hover effect
5. **Update borders** - Replace hard borders with subtle box-shadows
6. **Add accent variables** - Add `--color-accent` and `--color-accent-muted` to `.dark .flexlayout__layout`
7. **Test** - Navigate to `http://localhost:3000/demo` and verify changes
8. **Screenshot** - Capture after state for comparison

---

## User Preferences

- Focus on **spacing, borders, primary colors**
- Make it look **less "Windows-like"**
- User is happy with incremental progress and before/after comparisons

---

## Verification

After implementing:
1. Navigate to `http://localhost:3000/demo`
2. Toggle between Light and Dark themes
3. Verify tabs have rounded corners and more padding
4. Verify selected tabs have teal accent background
5. Verify splitters are subtle/invisible until hover
6. Compare with main app (`/`) design language

---

## Previous Session Achievements

- Explored main app and documented design system
- Created comprehensive theme alignment plan
- Ran reflector agent which validated approach and found correct color values
- Identified "Windows-like" issues with specific CSS properties
- Got user approval to implement changes

**The work is ready to execute - just implement the CSS changes above.**
