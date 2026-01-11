# Migration Notes - FlexLayout Tailwind Styles

## Summary

Successfully replaced SCSS-based FlexLayout styles with Tailwind CSS-compatible styles in `apps/todox`.

## Changes Made

### 1. Created New CSS File

**File**: `apps/todox/src/app/demo/flexlayout.css`

- ~600 lines of pure CSS (no SCSS)
- CSS variables mapped to oklch color values for Tailwind compatibility
- Light theme (default) and dark theme via `.dark` class
- All ~100 FlexLayout class names preserved for component compatibility

### 2. Updated Demo Styles

**File**: `apps/todox/src/app/demo/_lib/styles.css`

- Converted theme-specific styling to use `.dark` class prefix
- Updated all colors to oklch format
- Removed legacy `.flexlayout__theme_*` nested styles

### 3. Updated App.tsx

**File**: `apps/todox/src/app/demo/_lib/App.tsx`

- Changed import from `@beep/todox/style/combined.scss` to `../flexlayout.css`
- Updated `onThemeChange` handler to toggle `.dark` class instead of flexlayout theme classes

### 4. Re-enabled globals.css

**File**: `apps/todox/src/app/layout.tsx`

- Uncommented `import "./globals.css"` line

## CSS Variables Mapping

FlexLayout uses its own variable system. We mapped these to Tailwind-compatible oklch values:

| FlexLayout Variable | Light Theme | Dark Theme |
|---------------------|-------------|------------|
| `--color-text` | `oklch(0.141 0.005 285.823)` | `oklch(0.93 0 0)` |
| `--color-background` | `oklch(1 0 0)` | `oklch(0.13 0.004 285.885)` |
| `--color-1` | `oklch(0.97 0.001 286)` | `oklch(0.20 0.004 286)` |
| `--color-2` through `--color-6` | Graduated lighter | Graduated lighter |

## Testing Results

- Light theme: Working correctly
- Dark theme: Working correctly
- Theme switching: Working correctly via dropdown
- Layout components (tabsets, tabs, borders, splitters): All rendering properly
- Content panels (charts, grids, tables): All styled correctly

## Files That Can Be Removed

Once satisfied with the migration, these files can be deleted:

- `apps/todox/src/style/` (entire directory)
  - `_base.scss`
  - `_themes.scss`
  - `combined.scss`
  - `combined.css`
  - `dark.scss` / `dark.css`
  - `light.scss` / `light.css`
  - `gray.scss` / `gray.css`
  - `underline.scss` / `underline.css`
  - `rounded.scss` / `rounded.css`

## Notes

1. The new styles use Tailwind's `.dark` class which is compatible with `next-themes`
2. CSS variables are scoped to `.flexlayout__layout` element, preventing global conflicts
3. The demo page toolbar and table styles were updated separately in `styles.css`
