# Theme Alignment Plan: `/demo` to `/` Route

> Aligning the FlexLayout demo styling with the main application's design system.

---

## Current State Analysis

### Main Route (`/`) Design Elements

**Captured via browser automation on 2026-01-11:**

| Element | Value |
|---------|-------|
| **Background** | Dark charcoal (`~oklch(0.13-0.15 0.004 286)`) |
| **Surface elevation** | Slightly lighter containers for depth |
| **Primary accent** | Teal/cyan for interactive elements |
| **Action color** | Green for primary actions (Compose button) |
| **Typography** | Clean sans-serif, good weight hierarchy |
| **Tab style** | Pill-shaped tabs in navigation bar |
| **Avatars** | Circular with initials, teal/cyan background |
| **Corners** | Rounded throughout (4-8px radius) |
| **Borders** | Subtle, low-contrast dividers |

### Demo Route (`/demo`) Current State

**CSS Files:**
- `apps/todox/src/app/demo/flexlayout.css` - FlexLayout styles (927 lines)
- `apps/todox/src/app/demo/_lib/styles.css` - Demo toolbar/table styles (242 lines)

**Issues Identified:**

1. **Toolbar mismatch**: Light gray toolbar (`oklch(0.97)`) in light mode, darker (`oklch(0.18)`) in dark mode but still doesn't match main app's header styling
2. **No accent colors**: Missing teal/cyan accents for selected states, active tabs
3. **Generic color palette**: Gray-only palette without brand identity
4. **Control styling**: Basic HTML selects/buttons vs shadcn components
5. **No automatic dark mode**: Demo doesn't inherit `.dark` class from app layout

---

## Proposed Changes

### Phase 1: Color Palette Alignment

Update `flexlayout.css` CSS variables to match main app:

```css
/* Target palette for dark mode */
.dark .flexlayout__layout {
  --color-background: oklch(0.141 0.005 285.823);  /* Match main app bg */
  --color-surface: oklch(0.18 0.004 286);           /* Elevated surfaces */
  --color-surface-hover: oklch(0.22 0.004 286);     /* Hover states */

  /* Accent colors */
  --color-accent: oklch(0.70 0.15 195);             /* Teal/cyan */
  --color-accent-muted: oklch(0.70 0.15 195 / 0.1); /* Subtle accent bg */

  /* Active/selected states */
  --color-tab-selected-background: var(--color-accent-muted);
  --color-tab-selected: oklch(0.90 0 0);
}
```

### Phase 2: Toolbar Redesign

Update `styles.css` toolbar to match main app header:

```css
.dark .toolbar {
  background-color: oklch(0.141 0.005 285.823);  /* Same as main app */
  border-bottom: 1px solid oklch(0.22 0.004 286);
}

.dark .toolbar_control {
  /* Use shadcn-like button styling */
  background-color: oklch(0.18 0.004 286);
  border: 1px solid oklch(0.25 0.004 286);
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.dark .toolbar_control:hover {
  background-color: oklch(0.22 0.004 286);
}
```

### Phase 3: Tab Styling Enhancement

Add accent colors to tab selection:

```css
.dark .flexlayout__tab_button--selected {
  background-color: oklch(0.70 0.15 195 / 0.15);  /* Teal accent bg */
  color: oklch(0.90 0 0);
  border-radius: 4px;
}

.dark .flexlayout__border_button--selected {
  background-color: oklch(0.70 0.15 195 / 0.15);
  color: oklch(0.90 0 0);
}
```

### Phase 4: Automatic Dark Mode

Ensure demo inherits app's dark mode:

```tsx
// In App.tsx, check initial dark mode state
React.useEffect(() => {
  // Inherit dark mode from parent app if present
  const isDarkMode = document.documentElement.classList.contains('dark');
  if (isDarkMode) {
    // Already in dark mode from parent app
  } else {
    // Default to dark for this demo
    document.documentElement.classList.add('dark');
  }
}, []);
```

---

## Color Reference

| Purpose | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `oklch(1 0 0)` | `oklch(0.141 0.005 286)` |
| Surface | `oklch(0.97 0.001 286)` | `oklch(0.18 0.004 286)` |
| Surface Hover | `oklch(0.94 0.001 286)` | `oklch(0.22 0.004 286)` |
| Border | `oklch(0.88 0.001 286)` | `oklch(0.28 0.004 286)` |
| Text Primary | `oklch(0.141 0.005 286)` | `oklch(0.93 0 0)` |
| Text Secondary | `oklch(0.55 0 0)` | `oklch(0.65 0 0)` |
| **Accent (teal)** | `oklch(0.60 0.15 195)` | `oklch(0.70 0.15 195)` |
| **Accent bg** | `oklch(0.60 0.15 195 / 0.1)` | `oklch(0.70 0.15 195 / 0.15)` |
| **Action (green)** | `oklch(0.65 0.20 145)` | `oklch(0.70 0.18 145)` |

---

## Files to Modify

1. **`apps/todox/src/app/demo/flexlayout.css`** - Core FlexLayout styling
2. **`apps/todox/src/app/demo/_lib/styles.css`** - Toolbar and demo page styling
3. **`apps/todox/src/app/demo/_lib/App.tsx`** - Default dark mode initialization

---

## Success Criteria

- [ ] Demo page background matches main app in dark mode
- [ ] Selected tabs have teal accent background
- [ ] Toolbar matches main app header styling
- [ ] Smooth transition on theme toggle
- [ ] Controls (buttons, selects) have consistent styling
- [ ] Splitters and borders have matching colors

---

## Screenshots Reference

| Screenshot | Description |
|------------|-------------|
| `.playwright-mcp/main-route-initial.png` | Main app dark theme reference |
| `.playwright-mcp/demo-route-initial.png` | Demo current state (collapsed) |
| `.playwright-mcp/demo-route-dark-theme.png` | Demo with "Dark" selected |
| `.playwright-mcp/demo-route-rounded-theme.png` | Demo with "Rounded" (light) |
