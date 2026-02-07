# Iteration 1 - Visual Comparison Report

## Date: 2025-01-27

## Screenshots

- Official Playground: `screenshots/official-playground.png` (ss_87307khr0)
- Ported Version: `screenshots/ported-version.png` (ss_5410tbmnb)

---

## Critical Issues (P0 - Must Fix)

### 1. Logo Size - MASSIVE
**Official**: Small logo (~40px height) in header, centered
**Ported**: Logo takes up ~60% of viewport height (~400px)
**Impact**: Completely breaks layout, pushes all content off-screen
**Fix**: Add CSS constraint to logo image

### 2. Toolbar Layout - Vertical Instead of Horizontal
**Official**: Single horizontal toolbar row with all controls
**Ported**: Toolbar items stacked vertically on left side
**Impact**: Unusable toolbar, wrong layout paradigm
**Fix**: CSS flexbox/grid needs to be horizontal `flex-direction: row`

### 3. Background Color - Dark Instead of Light
**Official**: White editor area with light gray toolbar
**Ported**: Entire page is dark/black background
**Impact**: Cannot see editor content, wrong visual appearance
**Fix**: Check `.editor-shell` and `.editor-container` background colors

### 4. Missing Editor Content Area
**Official**: Clear white content area with welcome text
**Ported**: No visible editor content area - just dark background
**Impact**: Editor area not rendering or styled incorrectly
**Fix**: Check `.editor-scroller` and `.editor` CSS classes

### 5. Header Layout Broken
**Official**: Dark header bar with centered logo and speech bubble icon
**Ported**: No distinct header - logo bleeds into content area
**Fix**: Add header wrapper with proper dimensions

---

## Major Issues (P1)

### 6. Missing Toolbar Icons
**Official**: Full icon set - undo/redo, B/I/U, color pickers, etc.
**Ported**: Only text labels visible (Normal, Arial, 15, Insert, Left Align)
**Fix**: Check icon imports and CSS background-image URLs

### 7. Font Size Controls Missing
**Official**: `-15+` numeric stepper in toolbar
**Ported**: Just "15" text visible without +/- buttons
**Fix**: Check FontSizeToolbar component rendering

### 8. Missing Bottom Action Bar
**Official**: Row of icons at bottom (mic, upload, download, send, delete, lock, versions)
**Ported**: Not visible
**Fix**: Check ActionsPlugin rendering

### 9. TreeView Panel Position
**Official**: Black panel at very bottom, fixed position
**Ported**: "root", "Time Travel", "Export DOM" text visible at bottom left
**Fix**: Check TreeViewPlugin CSS positioning

---

## Minor Issues (P2)

### 10. Settings Gear Position
**Official**: Bottom-left corner with gear icon
**Ported**: May be present but layout issues obscure it

### 11. Speech Bubble Icon
**Official**: Top-right corner
**Ported**: Visible but may be mispositioned

### 12. Placeholder Text
**Official**: Not visible when content present
**Ported**: "Enter some rich text..." visible at top

---

## Root Cause Analysis

The fundamental issue appears to be **CSS not loading or applying correctly**. Specifically:

1. **Flexbox layout broken** - Container should use horizontal flexbox for toolbar
2. **Logo sizing** - Missing `max-height` or `width` constraints on `.App__logo`
3. **Background colors** - Dark theme CSS may be overriding light theme defaults
4. **Grid/layout structure** - The overall page structure CSS is not being applied

### Files to Investigate

| File | Issue |
|------|-------|
| `apps/todox/src/app/lexical/index.css` | Main layout styles |
| `apps/todox/src/app/lexical/themes/PlaygroundEditorTheme.css` | Editor theme |
| `apps/todox/src/app/lexical/App.tsx` | App wrapper structure |
| `apps/todox/src/app/lexical/plugins/ToolbarPlugin/index.tsx` | Toolbar layout |

---

## Comparison Summary

| Element | Official | Ported | Status |
|---------|----------|--------|--------|
| Logo size | 40px | ~400px | ❌ BROKEN |
| Toolbar direction | Horizontal | Vertical | ❌ BROKEN |
| Editor background | White | Black | ❌ BROKEN |
| Header visible | Yes | No | ❌ BROKEN |
| Toolbar icons | Yes | No | ❌ BROKEN |
| Content area | Visible | Hidden | ❌ BROKEN |
| Bottom actions | Yes | Partial | ❌ BROKEN |
| TreeView panel | Yes | Yes | ⚠️ Mispositioned |
| Settings gear | Yes | Unknown | ⚠️ Unknown |

---

## Recommended Fix Order

1. **Fix logo sizing** - Add max-height to logo image
2. **Fix toolbar layout** - Change to horizontal flexbox
3. **Fix background colors** - Ensure white editor area
4. **Fix header wrapper** - Add proper header container
5. **Fix icon paths** - Ensure all icons load from public folder
6. **Fix bottom actions** - Check ActionsPlugin visibility
7. **Fine-tune positioning** - Adjust TreeView and settings panel
